import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/rest";
import { getAllProducts, totalStock } from "@/lib/server/catalog";
import AdminShell from "@/components/hb/AdminShell";
export const dynamic="force-dynamic";

export default async function InventoryPage(){
 await requireAdmin().catch(e=>{if(e.code==="AUTH_REQUIRED")redirect("/login");redirect("/account")});
 const products=await getAllProducts({includeHidden:true});
 const rows=[];
 for(const p of products){
  for(const [color,sizes] of Object.entries(p.inventory||{})){
   for(const [size,qty] of Object.entries(sizes||{})) rows.push({p,color,size,qty:Number(qty||0)});
  }
 }
 rows.sort((a,b)=>a.qty-b.qty);
 return <AdminShell title="Inventory">
  <div className="mb-6"><div className="text-xs font-bold text-orange-600 uppercase tracking-widest">Stock control</div><h2 className="text-2xl font-black mt-1">Inventory</h2><p className="text-sm text-neutral-500 mt-1">Live variant-level stock across every colour and size.</p></div>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
   {[["SKUs",rows.length],["UNITS",rows.reduce((s,r)=>s+r.qty,0)],["LOW STOCK",rows.filter(r=>r.qty>0&&r.qty<=20).length],["OUT OF STOCK",rows.filter(r=>r.qty<=0).length]].map(([k,v])=><div key={k} className="bg-white border rounded-xl p-5"><div className="text-[10px] font-black tracking-widest text-neutral-400">{k}</div><div className="text-2xl font-black mt-1">{v}</div></div>)}
  </div>
  <div className="bg-white border rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[850px]"><thead className="bg-neutral-50 text-[10px] uppercase tracking-widest text-neutral-400"><tr className="text-left"><th className="p-4">Product</th><th className="p-4">Colour</th><th className="p-4">Size</th><th className="p-4">Units</th><th className="p-4">Status</th><th className="p-4"/></tr></thead><tbody>{rows.map((r,i)=><tr key={r.p.id+r.color+r.size+i} className="border-t"><td className="p-4 font-semibold">{r.p.name}</td><td className="p-4">{r.color}</td><td className="p-4">{r.size}</td><td className={`p-4 font-black ${r.qty<=0?"text-red-600":r.qty<=20?"text-orange-600":""}`}>{r.qty}</td><td className="p-4 text-xs font-bold uppercase">{r.qty<=0?"Out of stock":r.qty<=20?"Low stock":"Healthy"}</td><td className="p-4 text-right"><Link href={`/admin/products?id=${encodeURIComponent(r.p.id)}`} className="text-xs font-bold underline">Edit product</Link></td></tr>)}</tbody></table></div></div>
 </AdminShell>
}