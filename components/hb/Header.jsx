"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, User, Heart, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { categories } from "@/lib/data/categories";

const NAV = categories.slice(0, 6).map((c) => ({ href: `/category/${c.slug}`, label: c.name }));

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, hydrated } = useCart();

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-black text-white text-[11px] md:text-xs overflow-hidden">
        <div className="relative flex whitespace-nowrap py-2">
          <div className="flex hb-marquee gap-12 pr-12">
            {[
              "3 TRACK PANTS FOR ₹999",
              "5 TRACK PANTS FOR ₹1499",
              "FREE PAN-INDIA DELIVERY OVER ₹799",
              "COD AVAILABLE ACROSS INDIA",
              "EASY RETURNS • DAMAGE? DON’T WORRY — WE’RE HERE TO HELP"
            ]
              .concat([
                "3 TRACK PANTS FOR ₹999",
                "5 TRACK PANTS FOR ₹1499",
                "FREE PAN-INDIA DELIVERY OVER ₹799",
                "COD AVAILABLE ACROSS INDIA",
                "EASY RETURNS • DAMAGE? DON’T WORRY — WE’RE HERE TO HELP"
              ])
              .map((t, i) => (
                <span key={i} className="tracking-[0.2em] font-semibold">
                  • {t}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur border-b">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
          <button className="md:hidden -ml-2 p-2" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/images/logo.jpeg" alt="Honey Badger" width={42} height={42} className="w-10 h-10 rounded-full object-cover" priority />
            <div className="leading-tight">
              <div className="font-display text-lg md:text-xl tracking-widest">HONEY BADGER</div>
              <div className="text-[9px] md:text-[10px] tracking-[0.3em] text-neutral-500 -mt-0.5">
                MOVE DIFFERENT
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 mx-auto text-sm font-semibold uppercase tracking-wide">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-orange-600 transition-colors">
                {n.label}
              </Link>
            ))}
            <Link href="/category/sale" className="text-orange-600 hover:text-orange-700">
              Sale
            </Link>
          </nav>

          <div className="ml-auto md:ml-0 flex items-center gap-1 md:gap-3">
            <Link href="/shop" className="p-2 hover:bg-neutral-100 rounded-full" aria-label="Search">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/account" className="p-2 hover:bg-neutral-100 rounded-full hidden md:block" aria-label="Account">
              <User className="w-5 h-5" />
            </Link>
            <Link
              href="/account/wishlist"
              className="p-2 hover:bg-neutral-100 rounded-full hidden md:block"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-neutral-100 rounded-full" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {hydrated && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3 text-sm font-semibold uppercase tracking-wide">
            {NAV.concat([{ href: "/category/sale", label: "Sale" }]).map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
                {n.label}
              </Link>
            ))}
            <Link href="/account" onClick={() => setMenuOpen(false)}>
              Account
            </Link>
            <Link href="/account/wishlist" onClick={() => setMenuOpen(false)}>
              Wishlist
            </Link>
            <Link href="/track" onClick={() => setMenuOpen(false)}>
              Track Order
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
