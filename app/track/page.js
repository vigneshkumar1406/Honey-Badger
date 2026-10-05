import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessToken, getAuthUser } from "@/lib/supabase/rest";
import { getUserOrders } from "@/lib/server/orders";

export const dynamic = "force-dynamic";

export default async function TrackLookupPage() {
  const token = await getAccessToken();
  const user = await getAuthUser(token);
  if (!user) redirect("/login?next=/track");
  const orders = await getUserOrders(user.id, token);

  return (
    <main className="max-w-[900px] mx-auto px-6 py-14">
      <div className="mb-10">
        <p className="text-xs font-bold tracking-[0.25em] text-orange-600 uppercase">Order Centre</p>
        <h1 className="font-display text-4xl tracking-wider mt-2">TRACK YOUR ORDERS</h1>
        <p className="text-neutral-500 mt-2">Choose an order below. No order number or phone number typing needed.</p>
      </div>

      {orders.length === 0 ? (
        <div className="border p-10 text-center">
          <h2 className="font-semibold text-lg">No orders yet</h2>
          <p className="text-sm text-neutral-500 mt-2">Your completed purchases will appear here automatically.</p>
          <Link href="/shop" className="inline-block mt-6 bg-black text-white px-6 py-3 text-sm font-bold tracking-widest">SHOP NOW</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/track/${order.orderNumber}`} className="border p-5 hover:border-black transition-colors">
              <div className="flex flex-wrap justify-between gap-3 items-start">
                <div>
                  <div className="font-semibold">#{order.orderNumber}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    {" · "}{order.items?.length || 0} {(order.items?.length || 0) === 1 ? "item" : "items"}
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest border px-3 py-2">{String(order.status).replaceAll("_"," ")}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(order.items || []).slice(0,4).map((item) => (
                  <span key={item.id} className="text-xs bg-neutral-100 px-3 py-2">{item.product_name || item.name} × {item.quantity}</span>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-neutral-500">Order total</span>
                <strong>₹{order.total}</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
