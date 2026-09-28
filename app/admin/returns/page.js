"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import AdminShell from '@/components/hb/AdminShell';
const statuses=['REQUESTED','UNDER_REVIEW','APPROVED','REJECTED','PICKUP_PENDING','RECEIVED','REPLACEMENT_PROCESSING','REPLACEMENT_SHIPPED','COMPLETED'];
export default function ReturnsAdmin(){
 const [rows,setRows]=useState([]),[error,setError]=useState('');
 async function load(){const r=await fetch('/api/admin/returns');const d=await r.json();if(d.ok)setRows(d.returns||[]);else setError(d.error||'Unable to load returns');}
 useEffect(()=>{load()},[]);
 async function update(id,status){const r=await fetch(`/api/admin/returns/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});const d=await r.json();if(!d.ok)setError(d.error);else load();}
 return <AdminShell title="Returns"><section className="bg-white border border-neutral-200 rounded-xl overflow-hidden"><div className="p-5 border-b flex items-center justify-between"><div><h2 className="font-bold text-lg">Return requests</h2><p className="text-xs text-neutral-400 mt-1">Damage and replacement requests</p></div><Link href="/admin" className="text-xs font-bold underline">DASHBOARD</Link></div>{error&&<div className="m-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}<div className="p-5 space-y-4">{rows.map(r=><div key={r.id} className="border border-neutral-200 rounded-xl p-5"><div className="flex flex-wrap justify-between gap-4"><div><div className="font-semibold">#{r.orders?.order_number||'—'} · {r.orders?.customer_name||'Customer'}</div><div className="text-xs text-neutral-400 mt-1">{r.reason} · {new Date(r.created_at).toLocaleString('en-IN')}</div></div><select value={r.status} onChange={e=>update(r.id,e.target.value)} className="border rounded-lg px-3 py-2 text-xs font-bold">{statuses.map(s=><option key={s}>{s}</option>)}</select></div><p className="text-sm text-neutral-600 mt-4">{r.description}</p>{r.return_images?.length>0&&<div className="text-xs text-neutral-500 mt-3">Evidence files: {r.return_images.length}</div>}</div>)}{rows.length===0&&<div className="border border-dashed rounded-xl p-10 text-sm text-neutral-400 text-center">No return requests.</div>}</div></section></AdminShell>
}
