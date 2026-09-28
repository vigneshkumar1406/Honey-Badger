"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ p }) {
  const { toggleWishlist, wishlist } = useCart();
  const discountPct = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const stock = Object.values(p.inventory || {}).reduce((sum, sizes) => sum + Object.values(sizes).reduce((a, n) => a + Number(n || 0), 0), 0);
  const soldOut = stock <= 0;
  const isWishlisted = wishlist.includes(p.id);

  return (
    <div className="group block relative">
      <Link href={`/product/${p.slug}`}>
        <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover hb-card-img"
          />
          {p.images[1] && (
            <Image
              src={p.images[1]}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}
          {p.badge && !soldOut && (
            <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 tracking-widest">
              {p.badge}
            </span>
          )}
          {soldOut && (
            <span className="absolute top-3 left-3 bg-neutral-700 text-white text-[10px] font-bold px-2 py-1 tracking-widest">
              SOLD OUT
            </span>
          )}
          {discountPct > 0 && !soldOut && (
            <span className="absolute top-3 right-3 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 tracking-wider">
              -{discountPct}%
            </span>
          )}
        </div>
      </Link>
      <button
        onClick={() => toggleWishlist(p.id)}
        aria-label="Toggle wishlist"
        className="absolute top-3 right-3 md:hidden bg-white/90 rounded-full p-1.5"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-orange-600 text-orange-600" : ""}`} />
      </button>

      <Link href={`/product/${p.slug}`} className="block pt-3 space-y-1">
        <div className="text-[11px] uppercase tracking-widest text-neutral-500">{p.category.replace("-", " ")}</div>
        <div className="font-semibold text-sm leading-tight line-clamp-2">{p.name}</div>
        <div className="flex items-center gap-1 text-xs text-neutral-600">
          <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
          <span>{p.rating}</span>
          <span className="text-neutral-400">({p.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-bold">₹{p.price}</span>
          <span className="text-xs text-neutral-400 line-through">₹{p.mrp}</span>
          {discountPct > 0 && <span className="text-xs font-semibold text-green-600">{discountPct}% OFF</span>}
        </div>
        <div className="flex gap-1 pt-1">
          {p.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
              style={{ background: c.hex }}
            />
          ))}
        </div>
        {!soldOut && stock <= 10 && <div className="text-[11px] font-semibold text-orange-600 pt-1">Only {stock} left</div>}
      </Link>
    </div>
  );
}
