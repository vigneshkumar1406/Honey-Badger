"use client";
import { useMemo, useState } from "react";
import Image from "next/image";

export default function ProductGallery({product, colorImages={}}){
 const firstColor=product.colors?.[0]?.name;
 const [color,setColor]=useState(firstColor||"");
 const [selected,setSelected]=useState(0);
 const base=product.images||[];
 const images=useMemo(()=>{const c=colorImages?.[color];return Array.isArray(c)&&c.length?c:base},[color,colorImages,base]);
 const chooseColor=(c)=>{setColor(c);setSelected(0)};
 return <div className="space-y-3">
  <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
   {images[selected]&&<Image src={images[selected]} alt={product.name+" "+color} fill sizes="50vw" className="object-cover" priority/>}
  </div>
  <div className="flex flex-wrap gap-2">{product.colors.map(c=><button key={c.name} type="button" onClick={()=>chooseColor(c.name)} className={"px-3 py-2 rounded-full border text-xs font-bold "+(color===c.name?"border-black bg-black text-white":"border-neutral-300")}>{c.name}</button>)}</div>
  {images.length>1&&<div className="grid grid-cols-4 gap-3">{images.map((img,i)=><button key={img+"-"+i} type="button" onClick={()=>setSelected(i)} className={"relative aspect-square bg-neutral-100 overflow-hidden border-2 "+(selected===i?"border-black":"border-transparent")}><Image src={img} alt="" fill sizes="15vw" className="object-cover"/></button>)}</div>}
 </div>
}