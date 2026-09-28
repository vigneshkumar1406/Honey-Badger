"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, PackagePlus, RotateCcw, Settings, Store, X, Menu, ExternalLink } from "lucide-react";
import { useState } from "react";
import LogoutButton from "@/components/hb/LogoutButton";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Store },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/settings", label: "Store settings", icon: Settings },
];

export default function AdminShell({ children, title = "Admin" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f5f5f3] text-neutral-950">
      <div className="lg:hidden sticky top-0 z-50 bg-black text-white h-16 px-4 flex items-center justify-between">
        <button onClick={() => setOpen(true)} className="p-2" aria-label="Open admin menu"><Menu /></button>
        <Link href="/admin" className="flex items-center gap-2"><img src="/images/logo.jpeg" alt="Honey Badger" className="w-9 h-9 rounded-full object-cover" /><span className="font-display tracking-wider">HONEY BADGER</span></Link>
        <Link href="/" className="p-2" aria-label="Storefront"><ExternalLink /></Link>
      </div>
      {open && <div className="fixed inset-0 z-[60] bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed z-[70] inset-y-0 left-0 w-[280px] bg-[#0b0b0b] text-white transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <img src="/images/logo.jpeg" alt="Honey Badger" className="w-12 h-12 rounded-full object-cover" />
              <div><div className="font-display text-xl tracking-wider">HONEY BADGER</div><div className="text-[10px] text-white/45 tracking-[.25em]">ADMIN CONSOLE</div></div>
            </Link>
            <button className="lg:hidden" onClick={() => setOpen(false)}><X /></button>
          </div>
          <div className="p-4">
            <Link href="/admin/products?new=1" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-3.5 text-sm tracking-wide transition-colors"><PackagePlus size={18}/> ADD NEW PRODUCT</Link>
          </div>
          <nav className="px-3 space-y-1">
            {nav.map(({href,label,icon:Icon}) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${active ? "bg-white text-black" : "text-white/65 hover:bg-white/8 hover:text-white"}`}><Icon size={18}/>{label}</Link>
            })}
          </nav>
          <div className="mt-auto p-4 space-y-3">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white"><Store size={18}/> View storefront <ExternalLink size={14} className="ml-auto"/></Link>
            <div className="border-t border-white/10 pt-4"><LogoutButton /></div>
          </div>
        </div>
      </aside>
      <main className="lg:pl-[280px] min-h-screen">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-9">
          <div className="hidden lg:flex items-center justify-between mb-7"><div><div className="text-[11px] font-bold tracking-[.2em] text-orange-600 uppercase">Honey Badger Commerce</div><h1 className="font-display text-3xl tracking-wider mt-1">{title}</h1></div><div className="text-xs text-neutral-400">LIVE STORE ADMIN</div></div>
          {children}
        </div>
      </main>
    </div>
  );
}
