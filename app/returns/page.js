"use client";
import { useState } from "react";

export default function ReturnsPage(){
 const [orderNumber,setOrderNumber]=useState("");
 const [description,setDescription]=useState("");
 const [files,setFiles]=useState([]);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(e){
  e.preventDefault(); setBusy(true); setError(""); setMessage("");
  const fd=new FormData(); fd.append("orderNumber",orderNumber); fd.append("reason","damaged"); fd.append("description",description);
  for(const f of files) fd.append("images",f);
  try{
   const r=await fetch("/api/returns",{method:"POST",body:fd}); const d=await r.json();
   if(!d.ok) throw new Error(d.error);
   setMessage(`Thank you. Your request has been submitted. Reference: ${d.id}`); setOrderNumber(""); setDescription(""); setFiles([]);
  }catch(e){setError(e.message||"Could not submit your request.");}finally{setBusy(false);}
 }
 return <main className="max-w-[800px] mx-auto px-6 py-16">
  <div className="max-w-2xl">
   <p className="text-xs font-bold tracking-[0.25em] text-orange-600 uppercase">Easy Returns</p>
   <h1 className="font-display text-4xl tracking-wider mt-2 mb-5">WE’RE HERE TO HELP</h1>
   <div className="bg-neutral-50 border border-neutral-200 px-5 py-5 mb-5">
    <p className="font-semibold text-neutral-900">Damage on delivery? Don’t worry.</p>
    <p className="text-sm text-neutral-600 leading-relaxed mt-2">If your order arrives damaged, please contact us within <strong>48 hours of delivery</strong>. We’ll review the details and help with the next steps.</p>
   </div>
   <p className="text-sm text-neutral-600 leading-relaxed mb-8">Please sign in to your account, enter your delivered order number, briefly describe the issue and upload clear photos of the damaged product and packaging.</p>
   <form onSubmit={submit} className="space-y-4 border p-6">
    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">Order number<input required value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} placeholder="e.g. HB2609281234ABCD" className="mt-2 w-full border px-4 py-3 text-sm uppercase"/></label>
    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">What happened?<textarea required minLength={10} value={description} onChange={e=>setDescription(e.target.value)} rows={5} placeholder="Please describe the damage" className="mt-2 w-full border px-4 py-3 text-sm"/></label>
    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">Photos of the damage<input type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))} className="mt-2 w-full text-sm"/></label>
    {error&&<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}
    {message&&<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">{message}</div>}
    <button disabled={busy} className="bg-black text-white px-6 py-3 text-sm font-bold tracking-widest disabled:opacity-40">{busy?"SUBMITTING...":"SUBMIT DAMAGE REQUEST"}</button>
    <p className="text-xs text-neutral-400 leading-relaxed">For fairness and quality control, damage-related return/replacement requests must be submitted within 48 hours of delivery.</p>
   </form>
  </div>
 </main>
}
