"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ReturnForm({orderNumber,itemId}){
 const [description,setDescription]=useState("");
 const [files,setFiles]=useState([]);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [item,setItem]=useState(null);

 useEffect(()=>{
   if(!orderNumber||!itemId)return;
   fetch(`/api/returns/options?order=${encodeURIComponent(orderNumber)}&item=${encodeURIComponent(itemId)}`).then(r=>r.json()).then(d=>{
     if(!d.ok) throw new Error(d.error);
     setItem(d.item);
   }).catch(e=>setError(e.message||"Could not load the selected product."));
 },[orderNumber,itemId]);

 async function submit(e){
  e.preventDefault(); setBusy(true); setError(""); setMessage("");
  const fd=new FormData();
  fd.append("orderNumber",orderNumber); fd.append("itemId",itemId); fd.append("reason","damaged"); fd.append("description",description);
  for(const f of files) fd.append("images",f);
  try{
   const r=await fetch("/api/returns",{method:"POST",body:fd}); const d=await r.json();
   if(!d.ok) throw new Error(d.error);
   setMessage(`Thank you. Your request has been submitted. Reference: ${d.id}`);
   setDescription(""); setFiles([]);
  }catch(e){setError(e.message||"Could not submit your request.");}finally{setBusy(false);}
 }

 return <div className="max-w-2xl">
  <div className="bg-neutral-50 border border-neutral-200 px-5 py-5 mb-5">
   <p className="font-semibold text-neutral-900">Damage on delivery?</p>
   <p className="text-sm text-neutral-600 leading-relaxed mt-2">You selected the product directly from your delivered order. Requests are reviewed for damaged items and must be submitted within <strong>48 hours of delivery</strong>.</p>
  </div>
  {item ? <div className="border p-5 mb-6 flex justify-between gap-4"><div><div className="font-semibold">{item.product_name}</div><div className="text-xs text-neutral-500 mt-1">{item.variant_label} · Qty {item.quantity}</div></div><div className="font-semibold">₹{item.line_total}</div></div> : <div className="border p-5 mb-6 text-sm text-neutral-500">{orderNumber&&itemId?"Loading selected product…":"Open Returns from an item in a delivered order."}</div>}
  <form onSubmit={submit} className="space-y-4 border p-6">
   <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">What happened?<textarea required minLength={10} value={description} onChange={e=>setDescription(e.target.value)} rows={5} placeholder="Describe the damage" className="mt-2 w-full border px-4 py-3 text-sm"/></label>
   <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">Photos of the damage<input required type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))} className="mt-2 w-full text-sm"/></label>
   {error&&<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}
   {message&&<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">{message}</div>}
   <div className="flex flex-wrap gap-3"><Link href={orderNumber?`/track/${encodeURIComponent(orderNumber)}`:"/track"} className="border px-5 py-3 text-sm font-bold tracking-widest">BACK</Link><button disabled={busy||!item} className="bg-black text-white px-6 py-3 text-sm font-bold tracking-widest disabled:opacity-40">{busy?"SUBMITTING…":"SUBMIT DAMAGE REQUEST"}</button></div>
  </form>
 </div>;
}
