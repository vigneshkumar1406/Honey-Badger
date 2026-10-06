import Link from "next/link";
import { CheckCircle2, MessageCircle, PackageCheck } from "lucide-react";

export default function OrderSuccessPage({params}){
 const order=params.id;
 const whatsapp="https://wa.me/917200477413?text="+encodeURIComponent("Hi Honey Badger Outfits, I placed order #"+order+" and need help.");
 return <main className="max-w-[760px] mx-auto px-6 py-14 md:py-20">
  <div className="text-center">
   <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto"/>
   <div className="text-[10px] font-black tracking-[0.3em] text-orange-600 mt-5">HONEY BADGER OUTFITS</div>
   <h1 className="font-display text-4xl md:text-5xl tracking-wider mt-2">ORDER CONFIRMED</h1>
   <p className="text-neutral-500 mt-3">Your order <span className="font-bold text-black">#{order}</span> has been placed successfully.</p>
  </div>
  <div className="mt-10 grid sm:grid-cols-3 gap-3">
   {[["ORDER PLACED","Your order is confirmed"],["PACKING","We’ll prepare your items"],["DELIVERY","Track it anytime"]].map(([a,b])=><div key={a} className="border p-4 text-center"><div className="text-[10px] font-black tracking-widest">{a}</div><div className="text-xs text-neutral-500 mt-2">{b}</div></div>)}
  </div>
  <div className="mt-8 border bg-neutral-50 p-6 text-center">
   <PackageCheck className="w-7 h-7 mx-auto"/>
   <h2 className="font-bold mt-2">Track your delivery</h2>
   <p className="text-sm text-neutral-500 mt-1">Sign in with the account used at checkout to see live order status.</p>
   <Link href="/track" className="inline-block mt-5 bg-black text-white font-bold px-7 py-3 text-sm tracking-widest">TRACK ORDER</Link>
  </div>
  <div className="mt-6 flex flex-wrap justify-center gap-3">
   <a href={whatsapp} target="_blank" rel="noreferrer" className="border border-[#25D366] text-[#168c46] px-5 py-3 text-sm font-bold flex items-center gap-2"><MessageCircle size={17}/> ORDER HELP ON WHATSAPP</a>
   <Link href="/shop" className="border px-5 py-3 text-sm font-bold tracking-widest">CONTINUE SHOPPING</Link>
  </div>
 </main>
}