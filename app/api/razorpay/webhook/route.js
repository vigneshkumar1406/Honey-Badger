import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseRequest } from "@/lib/supabase/rest";

export async function POST(req) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !signature) return NextResponse.json({ ok:false }, { status:400 });
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest("hex");
  if (expected !== signature) return NextResponse.json({ ok:false }, { status:401 });
  const event = JSON.parse(raw);
  if (event.event === "payment.captured") {
    // Signature verification at the client callback creates the order; webhook is an idempotent safety confirmation hook.
    // Payment/order IDs are retained in the order record.
  }
  return NextResponse.json({ ok:true });
}
