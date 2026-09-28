import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/rest";
import { getAllOrders } from "@/lib/server/orders";
import { getAllProducts, totalStock } from "@/lib/server/catalog";
import AdminShell from "@/components/hb/AdminShell";
export const dynamic='force-dynamic';
export default async function AdminDashboard(){
  const admin=await requireAdmin().catch(e=>{if(e.code==='AUTH_REQUIRED')redirect('/login');redirect('/account')});
  const [orders,products]=await Promise.all([getAllOrders(admin.accessToken),getAllProducts({includeHidden:true})]);
  const today=new Date().toDateString();
  const todays=orders.filter(o=>new Date(o.createdAt).toDateString()===today);
  const revenue=orders.filter(o=>o.paymentStatus==='paid'||o.paymentMethod==='COD').reduce((s,o)=>s+Number(o.total||0),0);
  const pending=orders.filter(o=>!['delivered','cancelled','returned'].includes(o.status));
  const low=products.filter(p=>{const s=totalStock(p);return s<=20});
  return <AdminShell title="Overview">
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {[['TODAY',todays.length,'orders today'],['TOTAL ORDERS',orders.length,'all orders'],['REVENUE',`₹${revenue.toLocaleString('en-IN')}`,'captured + COD'],['PENDING',pending.length,'needs attention']].map(([label,value,sub])=><div key={label} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm"><div className="text-[10px] font-black tracking-[.18em] text-neutral-400">{label}</div><div className="text-3xl font-black mt-2">{value}</div><div className="text-xs text-neutral-400 mt-1">{sub}</div></div>)}
    </section>
    <div className="grid xl:grid-cols-[1.5fr_1fr] gap-6">
      <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between"><div><h2 className="font-bold text-lg">Recent orders</h2><p className="text-xs text-neutral-400 mt-1">Latest customer activity</p></div><Link href="/admin/orders" className="text-xs font-bold underline">VIEW ALL</Link></div>
        <div>{orders.slice(0,8).map(o=><Link key={o.id} href={`/admin/orders/${o.orderNumber}`} className="flex items-center gap-4 px-5 py-4 border-b last:border-0 hover:bg-neutral-50"><div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-black">HB</div><div className="min-w-0 flex-1"><div className="font-semibold text-sm truncate">#{o.orderNumber}</div><div className="text-xs text-neutral-400 truncate">{o.customer.name || o.customer.email}</div></div><div className="text-right"><div className="font-bold text-sm">₹{Number(o.total).toLocaleString('en-IN')}</div><div className="text-[10px] uppercase tracking-wider text-neutral-400">{o.status}</div></div></Link>)}{!orders.length&&<div className="p-8 text-sm text-neutral-400">No orders yet.</div>}</div>
      </section>
      <div className="space-y-6">
        <section className="bg-black text-white rounded-xl p-6"><div className="text-[10px] font-black tracking-[.2em] text-orange-400">QUICK ACTION</div><h2 className="font-display text-2xl tracking-wider mt-2">ADD A NEW PRODUCT</h2><p className="text-sm text-white/55 mt-2">Upload images, set pricing, create colour/size stock and publish it in one flow.</p><Link href="/admin/products?new=1" className="mt-5 inline-flex bg-orange-500 text-black font-black px-5 py-3 text-sm">+ ADD NEW PRODUCT</Link></section>
        <section className="bg-white border border-neutral-200 rounded-xl p-5"><div className="flex justify-between items-center"><div><h2 className="font-bold">Inventory watch</h2><p className="text-xs text-neutral-400 mt-1">20 units or less</p></div><Link href="/admin/products" className="text-xs font-bold underline">MANAGE</Link></div><div className="mt-4 space-y-3">{low.slice(0,5).map(p=><div key={p.id} className="flex justify-between text-sm"><span className="truncate pr-4">{p.name}</span><span className={`font-bold ${totalStock(p)===0?'text-red-600':'text-orange-600'}`}>{totalStock(p)}</span></div>)}{!low.length&&<div className="text-sm text-green-600">All products have healthy stock.</div>}</div></section>
      </div>
    </div>
  </AdminShell>
}
