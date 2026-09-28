import { NextResponse } from "next/server";
import { createCodOrder, quoteCart, totalForPayment } from "@/lib/server/pricing";
import { getAccessToken, getAuthUser } from "@/lib/supabase/rest";

function validateAddress(address) {
  for (const field of ["fullName","phone","line1","city","state","pincode"]) {
    if (!address?.[field] || !String(address[field]).trim()) throw new Error(`Missing required address field: ${field}`);
  }
  if (!/^\d{10}$/.test(String(address.phone).replace(/\D/g, '').slice(-10))) throw new Error("Enter a valid 10-digit phone number.");
  if (!/^\d{6}$/.test(String(address.pincode).trim())) throw new Error("Enter a valid 6-digit pincode.");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, customer, address, paymentMethod } = body || {};
    if (!Array.isArray(items) || items.length === 0) throw new Error("Your cart is empty. Please add a product before checkout.");
    for (const item of items) {
      if (!item?.productId || !item?.color || !item?.size || !Number.isInteger(Number(item?.quantity)) || Number(item.quantity) < 1) {
        throw new Error("One or more cart items are invalid. Please refresh your cart and try again.");
      }
    }
    if (!customer?.name || !customer?.email) throw new Error("Name and email are required.");
    validateAddress(address);
    if (!["COD","RAZORPAY"].includes(paymentMethod)) throw new Error("Invalid payment method.");
    const priced = await quoteCart(items);
    if (paymentMethod === "RAZORPAY") {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json({ ok:false, code:"RAZORPAY_NOT_CONFIGURED", error:"Online payment is not configured yet. Please choose Cash on Delivery." }, { status:400 });
      }
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
      const rp = await fetch("https://api.razorpay.com/v1/orders", { method:"POST", headers:{ Authorization:`Basic ${auth}`, "Content-Type":"application/json" }, body:JSON.stringify({ amount:Math.round(totalForPayment(priced,"RAZORPAY")*100), currency:"INR", receipt:`HB-${Date.now()}`, notes:{ customer_email:customer.email } }) });
      const data = await rp.json();
      if (!rp.ok) throw new Error(data?.error?.description || "Unable to create online payment.");
      return NextResponse.json({ ok:true, paymentRequired:true, razorpay:{ keyId:process.env.RAZORPAY_KEY_ID, orderId:data.id, amount:data.amount, currency:data.currency }, priced });
    }
    // Only forward a session token when it is still valid. A stale auth cookie
    // must not turn an otherwise valid guest/COD checkout into a 400/401.
    const accessToken = await getAccessToken();
    const authUser = accessToken ? await getAuthUser(accessToken) : null;
    const result = await createCodOrder({ items, customer, address, accessToken: authUser?.id ? accessToken : null });
    return NextResponse.json({ ok:true, orderNumber:result.orderNumber, total:Number(result.total), paymentMethod:"COD" });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({
      ok: false,
      error: err.message || "Checkout failed.",
      code: err.code || (err.data?.code ?? null)
    }, { status: err.code === "AUTH_REQUIRED" ? 401 : 400 });
  }
}
