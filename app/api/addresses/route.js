import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAccessToken, getAuthUser, supabaseRequest } from "@/lib/supabase/rest";

async function signedIn() {
  const token = await getAccessToken();
  const user = token ? await getAuthUser(token) : null;
  if (!user?.id) return null;
  return { token, user };
}

export async function GET() {
  try {
    const session = await signedIn();
    if (!session) return NextResponse.json({ ok: true, signedIn: false, addresses: [], customer: null });
    const [addresses, profiles] = await Promise.all([
      supabaseRequest("/rest/v1/addresses?select=*&order=is_default.desc,created_at.desc", { accessToken: session.token }),
      supabaseRequest(`/rest/v1/profiles?id=eq.${encodeURIComponent(session.user.id)}&select=full_name,phone`, { accessToken: session.token })
    ]);
    return NextResponse.json({ ok: true, signedIn: true, addresses: addresses || [], customer: { name: profiles?.[0]?.full_name || session.user.user_metadata?.full_name || "", email: session.user.email || "" } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message || "Could not load saved details." }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    const session = await signedIn();
    if (!session) return NextResponse.json({ ok: false, error: "Log in to save addresses to your account." }, { status: 401 });
    const b = await req.json();
    for (const field of ["fullName", "phone", "line1", "city", "state", "pincode"]) {
      if (!String(b?.[field] || "").trim()) throw new Error(`Please enter ${field}.`);
    }
    if (!/^\d{6}$/.test(String(b.pincode))) throw new Error("Enter a valid 6-digit pincode.");
    if (!/^\d{10}$/.test(String(b.phone).replace(/\D/g, "").slice(-10))) throw new Error("Enter a valid 10-digit mobile number.");
    const existing = await supabaseRequest("/rest/v1/addresses?select=id&limit=1", { accessToken: session.token });
    const isDefault = Boolean(b.isDefault) || !existing?.length;
    if (isDefault) {
      await supabaseRequest("/rest/v1/addresses?is_default=eq.true", { method: "PATCH", accessToken: session.token, headers: { Prefer: "return=minimal" }, body: { is_default: false } });
    }
    const [saved] = await supabaseRequest("/rest/v1/addresses", {
      method: "POST", accessToken: session.token, headers: { Prefer: "return=representation" },
      body: { id: randomBytes(13).toString("hex"), user_id: session.user.id, full_name: String(b.fullName).trim(), phone: String(b.phone).trim(), line1: String(b.line1).trim(), line2: String(b.line2 || "").trim() || null, city: String(b.city).trim(), state: String(b.state).trim(), pincode: String(b.pincode).trim(), is_default: isDefault }
    });
    return NextResponse.json({ ok: true, address: saved });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message || "Could not save address." }, { status: e.status || 400 });
  }
}
