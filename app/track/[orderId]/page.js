import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessToken, getAuthUser } from "@/lib/supabase/rest";
import { getUserOrderByNumber } from "@/lib/server/orders";

const STEPS=["confirmed","processing","packed","shipped","out_for_delivery","delivered"];
const LABELS={confirmed:"Order Confirmed",payment_confirmed:"Payment Confirmed",processing:"Processing",packed:"Packed",shipped:"Shipped",out_for_delivery:"Out for Delivery",delivered:"Delivered",cancelled:"Cancelled",payment_failed:"Payment Failed"};

export default async function TrackOrderPage({params}) {
  const token=await getAccessToken();
  const user=await getAuthUser(token);
  if(!user) redirect(`/login?next=/track/${encodeURIComponent(params.orderId)}`);

  const order=await getUserOrderByNumber(user.id, params.orderId, token);
  if(!order) return <main className="max-w-[600px] mx-auto px-6 py-24 text-center"><h1 className="font-display text-3xl tracking-wider mb-3">ORDER NOT FOUND</h1><p className="text-neutral-500 mb-6">This order is not available in your account.</p><Link href="/track" className="underline text-sm">BACK TO MY ORDERS</Link></main>;

  const current=STEPS.indexOf(order.status);
  const delivered=order.status==="delivered";

  return <main className="max-w-[1000px] mx-auto px-6 py-10">
    <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
      <div><p className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">Order tracking</p><h1 className="font-display text-3xl tracking-wider mt-1">ORDER #{order.orderNumber}</h1></div>
      <span className="text-xs font-semibold uppercase tracking-widest bg-black text-white px-3 py-2">{LABELS[order.status]||String(order.status).replaceAll("_"," ")}</span>
    </div>
    <p className="text-neutral-500 text-sm mb-8">Placed on {new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p>

    {!["cancelled","payment_failed"].includes(order.status) && <div className="mb-10 overflow-x-auto"><div className="flex items-center min-w-[640px]">{STEPS.map((step,i)=><div key={step} className="flex items-center flex-1 last:flex-none"><div className="flex flex-col items-center"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i<=current?"bg-green-600 text-white":"bg-neutral-200 text-neutral-400"}`}>{i<=current?"✓":""}</div><div className="text-[10px] mt-2 text-center w-20 leading-tight">{LABELS[step]}</div></div>{i<STEPS.length-1&&<div className={`flex-1 h-0.5 ${i<current?"bg-green-600":"bg-neutral-200"}`}/>}</div>)}</div></div>}

    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
      <section>
        <div className="flex items-center justify-between mb-3"><h2 className="font-semibold text-sm uppercase tracking-widest">Ordered products</h2>{delivered&&<span className="text-xs text-neutral-500">Select an item for help</span>}</div>
        <div className="divide-y border-t border-b">
          {(order.items||[]).map((item)=>(
            <div key={item.id} className="flex gap-4 py-4">
              <div className="relative w-20 h-24 bg-neutral-100 shrink-0">
                {item.image ? <Image src={item.image} alt={item.product_name||item.name||"Product"} fill sizes="80px" className="object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">HB</div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm">{item.product_name||item.name}</div>
                <div className="text-neutral-500 text-xs mt-1">{item.variant_label||item.variantLabel||"Standard"} · Qty {item.quantity}</div>
                <div className="font-semibold text-sm mt-2">₹{item.line_total ?? item.totalPrice ?? 0}</div>
                {delivered&&<Link href={`/returns?order=${encodeURIComponent(order.orderNumber)}&item=${encodeURIComponent(item.id)}`} className="inline-flex mt-3 border border-black px-4 py-2 text-[11px] font-bold tracking-widest hover:bg-black hover:text-white">RETURN / REPORT ISSUE</Link>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
          {order.discount>0&&<div className="flex justify-between text-green-600"><span>Offer</span><span>−₹{order.discount}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{order.shippingFee===0?"FREE":`₹${order.shippingFee}`}</span></div>
          {order.codFee>0&&<div className="flex justify-between"><span>COD fee</span><span>₹{order.codFee}</span></div>}
          <div className="flex justify-between font-bold pt-2 border-t mt-2"><span>Total</span><span>₹{order.total}</span></div>
        </div>
      </section>

      <aside>
        <h2 className="font-semibold text-sm uppercase tracking-widest mb-3">Delivery</h2>
        <div className="text-sm text-neutral-600 leading-relaxed border p-4"><div className="font-semibold text-black">{order.address.fullName}</div><div>{order.address.line1}</div>{order.address.line2&&<div>{order.address.line2}</div>}<div>{order.address.city}, {order.address.state} {order.address.pincode}</div><div className="mt-1">{order.address.phone}</div></div>
        <h2 className="font-semibold text-sm uppercase tracking-widest mb-3 mt-6">Payment</h2>
        <div className="text-sm text-neutral-600 border p-4">{order.paymentMethod==="COD"?"Cash on Delivery":"Paid online (Razorpay)"}</div>
        {order.trackingNumber&&<><h2 className="font-semibold text-sm uppercase tracking-widest mb-3 mt-6">Shipment</h2><div className="text-sm text-neutral-600 border p-4">Courier: {order.courierName||"—"}<br/>AWB: {order.trackingNumber}</div></>}
      </aside>
    </div>

    <div className="mt-10 border-t pt-5 flex flex-wrap justify-between gap-3 text-sm"><span className="text-neutral-500">Need help with another item?</span><Link href="/track" className="font-semibold underline">Choose another order</Link></div>
    <div className="mt-4 text-xs text-neutral-400">Returns/replacements are currently available for products received damaged. Requests must be submitted within 48 hours of delivery. <Link href="/returns" className="underline">Read policy</Link></div>
  </main>;
}
