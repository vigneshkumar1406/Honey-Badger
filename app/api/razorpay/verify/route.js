import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdminRequest } from "@/lib/supabase/rest";

export async function POST(req) {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) throw new Error("Razorpay is not configured.");
    const body = await req.json();
    const payload = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(payload).digest("hex");
    if (expected !== body.razorpay_signature) throw new Error("Payment signature verification failed.");
    const result = await supabaseAdminRequest("/rest/v1/rpc/create_paid_order_from_cart", { method:"POST", body:{ p_items:body.items, p_customer:body.customer, p_address:body.address, p_payment_id:body.razorpay_payment_id } });
    return NextResponse.json({ ok:true, orderNumber:result.orderNumber, total:Number(result.total) });
  } catch (err) { return NextResponse.json({ ok:false, error:err.message || "Payment verification failed." }, { status:400 }); }
}
