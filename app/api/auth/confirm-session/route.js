import { NextResponse } from "next/server";
import { supabaseRequest, authCookieOptions } from "@/lib/supabase/rest";

export async function POST(req) {
  try {
    const { access_token, refresh_token, expires_in } = await req.json();
    if (!access_token || !refresh_token) {
      return NextResponse.json({ ok: false, error: "Confirmation session is missing. Please log in." }, { status: 400 });
    }

    // Validate the access token with Supabase before issuing our app cookies.
    await supabaseRequest("/auth/v1/user", { accessToken: access_token });
    const response = NextResponse.json({ ok: true });
    response.cookies.set("hb_access_token", access_token, authCookieOptions(Number(expires_in) || 3600));
    response.cookies.set("hb_refresh_token", refresh_token, authCookieOptions(60 * 60 * 24 * 30));
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "We could not confirm your session. Please log in with your email and password." }, { status: 401 });
  }
}
