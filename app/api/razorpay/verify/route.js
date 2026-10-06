import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdminRequest } from "@/lib/supabase/rest";

async function razorpayGet(path) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store"
  });
  const data = await response.json();
  if (!response.ok) if (response.status === 401) throw new Error("Razorpay server credentials are invalid or mismatched. Please contact the store administrator.");
  throw new Error(data?.error?.description || "Unable to verify payment with Razorpay.");
  return data;
}

export async function POST(req) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error("Razorpay is not configured.");
    const body = await req.json();
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body || {};
    if (!orderId || !paymentId || !signature) throw new Error("Incomplete Razorpay payment response.");

    const payload = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(payload).digest("hex");
    if (!/^[a-f0-9]{64}$/i.test(signature) || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      throw new Error("Payment signature verification failed.");
    }

    const [order, payment] = await Promise.all([
      razorpayGet(`orders/${encodeURIComponent(orderId)}`),
      razorpayGet(`payments/${encodeURIComponent(paymentId)}`)
    ]);

    if (payment.order_id !== orderId) throw new Error("Payment does not belong to this order.");
    if (payment.status !== "captured") throw new Error(`Payment is ${payment.status || "not captured"} yet.`);
    if (Number(payment.amount) !== Number(order.amount)) throw new Error("Payment amount does not match the order.");
    if (Number(order.amount_paid) < Number(order.amount)) throw new Error("Razorpay has not marked the full order amount as paid.");

    const result = await supabaseAdminRequest("/rest/v1/rpc/create_paid_order_from_cart", {
      method:"POST",
      body:{
        p_items:body.items,
        p_customer:{ ...body.customer, phone: body.address?.phone },
        p_address:body.address,
        p_payment_id:paymentId
      }
    });

    return NextResponse.json({ ok:true, orderNumber:result.orderNumber, total:Number(result.total) });
  } catch (err) {
    console.error("[razorpay/verify]", err);
    return NextResponse.json({ ok:false, error:err.message || "Payment verification failed." }, { status:400 });
  }
}
