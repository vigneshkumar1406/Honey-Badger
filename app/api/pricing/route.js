import { NextResponse } from "next/server";
import { quoteCart } from "@/lib/server/pricing";
export async function POST(req) {
  try {
    const body = await req.json();
    const priced = await quoteCart(body.items);
    return NextResponse.json({ ok: true, priced });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Could not calculate pricing." }, { status: 400 });
  }
}
