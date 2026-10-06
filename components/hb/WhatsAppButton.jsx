"use client";
import { MessageCircle } from "lucide-react";
export default function WhatsAppButton(){
 const phone="917200477413";
 const text=encodeURIComponent("Hi Honey Badger Outfits, I need help with a product/order.");
 return <a href={`https://wa.me/${phone}?text=${text}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"><MessageCircle size={25}/><span className="absolute -top-2 right-0 bg-black text-white text-[9px] px-2 py-1 rounded-full font-bold">CHAT</span></a>
}