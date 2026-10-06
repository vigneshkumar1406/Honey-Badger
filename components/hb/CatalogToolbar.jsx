"use client";
import { useRouter, useSearchParams } from "next/navigation";
export default function CatalogToolbar({count,currentSort="featured"}){
 const router=useRouter(), params=useSearchParams();
 const q=params.get("q")||"";
 function go(e){e.preventDefault();const value=new FormData(e.currentTarget).get("q")?.toString().trim()||"";const next=new URLSearchParams(params.toString());value?next.set("q",value):next.delete("q");router.push("?"+next.toString())}
 return <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
  <form onSubmit={go} className="flex max-w-md w-full"><input name="q" defaultValue={q} placeholder="Search products…" className="flex-1 border px-4 py-2.5 text-sm focus:outline-none focus:border-black"/><button className="bg-black text-white px-4 text-xs font-bold tracking-widest">SEARCH</button></form>
  <div className="flex items-center gap-3"><span className="text-sm text-neutral-500">{count} products</span><select defaultValue={currentSort} onChange={e=>{const n=new URLSearchParams(params.toString());n.set("sort",e.target.value);router.push("?"+n.toString())}} className="border px-3 py-2 text-sm"><option value="featured">Featured</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="rating">Top Rated</option></select></div>
 </div>
}