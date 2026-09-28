"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import ProductCard from "@/components/hb/ProductCard";
export default function WishlistPage(){const {wishlist,hydrated}=useCart();const [products,setProducts]=useState([]);useEffect(()=>{fetch('/api/catalog/products').then(r=>r.json()).then(d=>setProducts(d.products||[])).catch(()=>{});},[]);const saved=products.filter(p=>wishlist.includes(p.id));if(!hydrated||products.length===0)return <main className="max-w-[1100px] mx-auto px-6 py-16"/>;if(saved.length===0)return <main className="max-w-[700px] mx-auto px-6 py-24 text-center"><h1 className="font-display text-3xl tracking-wider mb-3">SAVE YOUR FAVOURITES</h1><p className="text-neutral-500 mb-8">Nothing saved yet.</p><Link href="/shop" className="inline-block bg-black text-white font-bold px-8 py-4 text-sm tracking-widest">SHOP NOW</Link></main>;return <main className="max-w-[1100px] mx-auto px-6 py-10"><h1 className="font-display text-3xl tracking-wider mb-6">WISHLIST</h1><div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{saved.map(p=><ProductCard key={p.id} p={p}/>)}</div></main>}
