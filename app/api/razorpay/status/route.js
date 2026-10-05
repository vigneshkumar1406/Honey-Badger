import { NextResponse } from "next/server";

async function razorpayGet(path) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.description || "Unable to check Razorpay payment.");
  return data;
}

export async function GET(req) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ ok:false, error:"Razorpay is not configured." }, { status:500 });
    }
    const orderId = new URL(req.url).searchParams.get("orderId") || "";
    if (!/^order_[A-Za-z0-9]+$/.test(orderId)) return NextResponse.json({ ok:false, error:"Invalid Razorpay order." }, { status:400 });

    const [order, payments] = await Promise.all([
      razorpayGet(`orders/${encodeURIComponent(orderId)}`),
      razorpayGet(`orders/${encodeURIComponent(orderId)}/payments`)
    ]);
    const payment = Array.isArray(payments.items)
      ? payments.items.find((item) => item.status === "captured" && Number(item.amount) === Number(order.amount))
      : null;

    if (!payment) return NextResponse.json({ ok:true, status:"pending" });
    return NextResponse.json({ ok:true, status:"paid", paymentId:payment.id });
  } catch (err) {
    console.error("[razorpay/status]", err);
    return NextResponse.json({ ok:false, error:err.message || "Unable to check payment." }, { status:502 });
  }
}
