"use client";
import { useEffect, useState } from "react";
import { Star, Send } from "lucide-react";

function Stars({value,size="w-4 h-4"}){return <div className="flex gap-0.5">{[1,2,3,4,5].map(n=><Star key={n} className={size+" "+(n<=value?"fill-orange-500 text-orange-500":"text-neutral-300")} />)}</div>}

export default function ProductReviews({productId, initialRating=0, initialCount=0}){
 const [reviews,setReviews]=useState([]),[rating,setRating]=useState(0),[hover,setHover]=useState(0),[title,setTitle]=useState(""),[body,setBody]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function load(){const r=await fetch("/api/reviews?product_id="+encodeURIComponent(productId));const d=await r.json();if(d.ok)setReviews(d.reviews||[]);}
 useEffect(()=>{load()},[productId]);
 async function submit(e){e.preventDefault();setMessage("");if(!rating||!body.trim()){setMessage("Please select a rating and write your review.");return;}setBusy(true);try{const r=await fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId,rating,title,body})});const d=await r.json();if(r.status===401){setMessage("Please sign in before writing a review.");return;}if(r.status===403){setMessage("Only customers who purchased this product can leave a review.");return;}if(!d.ok){setMessage(d.error||"Could not submit review.");return;}setTitle("");setBody("");setRating(0);setMessage("Thanks! Your review has been published.");await load();}finally{setBusy(false)}}
 const avg=reviews.length?reviews.reduce((s,r)=>s+r.rating,0)/reviews.length:Number(initialRating||0); const counts=[5,4,3,2,1].map(n=>({n,count:reviews.filter(r=>r.rating===n).length})); const totalReviews=reviews.length||initialCount;
 return <section className="mt-16 border-t pt-12">
  <div className="grid md:grid-cols-[260px_1fr] gap-10">
   <div><h2 className="font-display text-2xl tracking-wide">REVIEWS & RATINGS</h2><div className="mt-5 flex items-center gap-3"><span className="text-4xl font-black">{avg?avg.toFixed(1):"0.0"}</span><div><Stars value={Math.round(avg)}/><div className="text-xs text-neutral-500 mt-1">{totalReviews} review{totalReviews===1?"":"s"}</div></div></div><div className="mt-5 space-y-2">{counts.map(x=><div key={x.n} className="flex items-center gap-2 text-xs"><span className="w-8">{x.n}★</span><div className="h-2 flex-1 bg-neutral-200 rounded-full overflow-hidden"><div className="h-full bg-orange-500" style={{width: totalReviews ? `${(x.count/totalReviews)*100}%` : "0%"}} /></div><span className="w-6 text-right text-neutral-400">{x.count}</span></div>)}</div></div>
   <div className="space-y-8">
    {reviews.length===0?<div className="border border-dashed p-6 text-sm text-neutral-500">No reviews yet. Be the first customer to rate this product.</div>:reviews.map(r=><article key={r.id} className="border-b pb-6"><div className="flex items-center justify-between gap-4"><div><Stars value={r.rating}/><div className="font-bold text-sm mt-2">{r.title||"Customer review"}</div></div><div className="text-xs text-neutral-400">{new Date(r.created_at).toLocaleDateString("en-IN")}</div></div><p className="text-sm text-neutral-600 mt-3 leading-relaxed">{r.body}</p><div className="text-xs font-semibold text-neutral-400 mt-3">— {r.reviewer_name||"Verified customer"}</div></article>)}
    <form onSubmit={submit} className="bg-neutral-50 border p-5 md:p-7">
      <h3 className="font-bold text-lg">Write a review</h3><p className="text-xs text-neutral-500 mt-1">Share your experience with other customers.</p>
      <div className="mt-5"><div className="text-[10px] font-black uppercase tracking-widest mb-2">Your rating</div><div className="flex gap-1" onMouseLeave={()=>setHover(0)}>{[1,2,3,4,5].map(n=><button type="button" key={n} onMouseEnter={()=>setHover(n)} onClick={()=>setRating(n)}><Star className={"w-7 h-7 "+(n<=(hover||rating)?"fill-orange-500 text-orange-500":"text-neutral-300")}/></button>)}</div></div>
      <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} placeholder="Review title (optional)" className="mt-5 w-full border bg-white rounded-lg px-3 py-3 text-sm"/>
      <textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={2000} required rows={5} placeholder="What did you like about this product?" className="mt-3 w-full border bg-white rounded-lg px-3 py-3 text-sm"/>
      <div className="flex items-center justify-between mt-3 gap-4"><div className="text-xs text-neutral-500">{message}</div><button disabled={busy} className="bg-black text-white px-5 py-3 rounded-lg font-bold text-xs tracking-wider flex items-center gap-2 disabled:opacity-40"><Send size={14}/>{busy?"SUBMITTING...":"SUBMIT REVIEW"}</button></div>
    </form>
   </div>
  </div>
 </section>
}