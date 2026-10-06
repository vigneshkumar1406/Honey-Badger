"use client";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/hb/AdminShell";
import { Star, Check, EyeOff, Clock } from "lucide-react";

const filters=["all","pending","published","hidden"];

export default function AdminReviewsPage(){
 const [filter,setFilter]=useState("all"),[reviews,setReviews]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function load(){
  setError("");
  const r=await fetch("/api/admin/reviews"+(filter==="all"?"":`?status=${filter}`));
  const d=await r.json();
  if(!d.ok){setError(d.error||"Could not load reviews.");return}
  setReviews(d.reviews||[]);
 }
 useEffect(()=>{load()},[filter]);
 async function setStatus(id,status){
  setBusy(true);setError("");
  try{const r=await fetch("/api/admin/reviews/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});const d=await r.json();if(!d.ok)throw new Error(d.error);await load()}catch(e){setError(e.message)}finally{setBusy(false)}
 }
 const counts=useMemo(()=>filters.reduce((a,f)=>{a[f]=f==="all"?reviews.length:reviews.filter(r=>r.status===f).length;return a},{}),[reviews]);
 return <AdminShell title="Reviews">
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
   <div><div className="text-xs font-bold text-orange-600 uppercase tracking-widest">Customer feedback</div><h2 className="text-2xl font-black mt-1">Reviews & ratings</h2><p className="text-sm text-neutral-500 mt-1">Moderate reviews before they shape your storefront.</p></div>
   <div className="flex gap-2 flex-wrap">{filters.map(f=><button key={f} onClick={()=>setFilter(f)} className={`px-3 py-2 text-xs font-bold uppercase tracking-wide border ${filter===f?"bg-black text-white":"bg-white"}`}>{f} {counts[f]??0}</button>)}</div>
  </div>
  {error&&<div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 text-sm">{error}</div>}
  <div className="space-y-4">
   {reviews.length===0?<div className="bg-white border p-10 text-center text-neutral-500">No reviews in this filter.</div>:reviews.map(r=><article key={r.id} className="bg-white border rounded-xl p-5">
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
     <div className="min-w-0"><div className="text-xs text-orange-600 font-bold uppercase tracking-widest">{r.product?.name||r.product_id}</div><div className="flex items-center gap-1 mt-2">{[1,2,3,4,5].map(n=><Star key={n} size={15} className={n<=r.rating?"fill-orange-500 text-orange-500":"text-neutral-300"}/>)}</div><h3 className="font-bold mt-2">{r.title||"Customer review"}</h3><p className="text-sm text-neutral-600 mt-2 leading-relaxed">{r.body}</p><div className="text-xs text-neutral-400 mt-3">— {r.reviewer_name||"Customer"} · {new Date(r.created_at).toLocaleDateString("en-IN")}</div></div>
     <div className="flex flex-wrap gap-2 shrink-0"><button disabled={busy} onClick={()=>setStatus(r.id,"published")} className="border px-3 py-2 text-xs font-bold flex items-center gap-1"><Check size={14}/> Publish</button><button disabled={busy} onClick={()=>setStatus(r.id,"pending")} className="border px-3 py-2 text-xs font-bold flex items-center gap-1"><Clock size={14}/> Pending</button><button disabled={busy} onClick={()=>setStatus(r.id,"hidden")} className="border px-3 py-2 text-xs font-bold flex items-center gap-1"><EyeOff size={14}/> Hide</button></div>
    </div>
   </article>)}
  </div>
 </AdminShell>
}