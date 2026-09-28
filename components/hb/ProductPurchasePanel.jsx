"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShieldCheck, Truck, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const LOW_STOCK_THRESHOLD = 10;

export default function ProductPurchasePanel({ product }) {
  const SIZES = Array.from(new Set((product?.variants || []).map((v) => v.size).filter(Boolean)));
  const [color, setColor] = useState(product.colors[0].name);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, toggleWishlist, wishlist } = useCart();
  const router = useRouter();

  const discountPct = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const stockForSize = size ? Number(product?.inventory?.[color]?.[size] || 0) : null;
  const isWishlisted = wishlist.includes(product.id);

  function handleAdd(goToCart) {
    if (!size) return;
    addItem({
      productId: product.id,
      color,
      size,
      quantity: qty,
      unitPrice: product.price,
      unitMrp: product.mrp,
      name: product.name,
      slug: product.slug,
      image: product.images[0]
    });
    if (goToCart) {
      router.push("/cart");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Honey Badger</div>
      <h1 className="font-display text-3xl md:text-4xl tracking-wide mt-1">{product.name}</h1>

      <div className="flex items-center gap-2 mt-2 text-sm">
        <div className="flex items-center gap-1 text-orange-500">
          <Star className="w-4 h-4 fill-orange-500" />
          <span className="font-semibold text-neutral-800">{product.rating}</span>
        </div>
        <span className="text-neutral-400">({product.reviewCount} reviews)</span>
        <span className="text-neutral-300">|</span>
        <span className="text-neutral-400">SKU: {product.sku}</span>
      </div>

      <div className="flex items-baseline gap-3 mt-4">
        <span className="text-3xl font-bold">₹{product.price}</span>
        <span className="text-lg text-neutral-400 line-through">₹{product.mrp}</span>
        {discountPct > 0 && <span className="text-sm font-semibold text-green-600">{discountPct}% OFF</span>}
      </div>
      {product.tags?.includes("combo-eligible") && (
        <div className="mt-2 text-sm font-semibold text-orange-600">
          Combo eligible — 3 for ₹999 or 5 for ₹1499 (auto-applied in cart)
        </div>
      )}

      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-widest mb-2">
          Colour: <span className="font-normal normal-case text-neutral-500">{color}</span>
        </div>
        <div className="flex gap-2">
          {product.colors.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setColor(c.name);
                setSize(null);
              }}
              title={c.name}
              className={`w-9 h-9 rounded-full ring-2 transition ${
                color === c.name ? "ring-black" : "ring-transparent hover:ring-neutral-300"
              }`}
              style={{ background: c.hex, border: "1px solid rgba(0,0,0,0.1)" }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-widest mb-2">Size</div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const stock = Number(product?.inventory?.[color]?.[s] || 0);
            const disabled = stock <= 0;
            return (
              <button
                key={s}
                disabled={disabled}
                onClick={() => setSize(s)}
                className={`w-12 h-11 border text-sm font-semibold transition ${
                  disabled
                    ? "border-neutral-200 text-neutral-300 line-through cursor-not-allowed"
                    : size === s
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 hover:border-black"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        {size && stockForSize > 0 && stockForSize <= LOW_STOCK_THRESHOLD && (
          <div className="text-xs font-semibold text-orange-600 mt-2">
            🔥 Hurry! Only {stockForSize} left in {size}
          </div>
        )}
        {!size && <div className="text-xs text-neutral-400 mt-2">Select a size to see availability</div>}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="text-xs font-semibold uppercase tracking-widest">Qty</div>
        <div className="flex items-center border">
          <button className="w-9 h-9 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            className="w-9 h-9 text-lg"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-8 hidden md:flex gap-3">
        <button
          disabled={!size || stockForSize <= 0}
          onClick={() => handleAdd(false)}
          className="flex-1 bg-black text-white font-bold py-4 text-sm tracking-widest disabled:opacity-40 hover:bg-neutral-800 transition"
        >
          {added ? "ADDED ✓" : "ADD TO CART"}
        </button>
        <button
          disabled={!size || stockForSize <= 0}
          onClick={() => handleAdd(true)}
          className="flex-1 bg-orange-500 text-black font-bold py-4 text-sm tracking-widest disabled:opacity-40 hover:bg-orange-400 transition"
        >
          BUY NOW
        </button>
        <button
          onClick={() => toggleWishlist(product.id)}
          className="w-14 border flex items-center justify-center"
          aria-label="Wishlist"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-orange-600 text-orange-600" : ""}`} />
        </button>
      </div>

      <div className="mt-8 space-y-2 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-orange-500" /> Free delivery over ₹799 · COD available (+₹30)
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-500" /> Secure payment powered by Razorpay
        </div>
        <div className="text-xs text-neutral-400 mt-2">
          Easy returns — if your order arrives damaged, we’re here to help. Please contact us within 48 hours of delivery.{" "}
          <a href="/returns" className="underline">
            Read policy
          </a>
        </div>
      </div>

      {/* Mobile sticky purchase bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 px-4 py-3 flex items-center gap-3">
        <div className="font-bold">₹{product.price}</div>
        <button
          disabled={!size || stockForSize <= 0}
          onClick={() => handleAdd(false)}
          className="flex-1 bg-black text-white font-bold py-3 text-xs tracking-widest disabled:opacity-40"
        >
          ADD TO CART
        </button>
        <button
          disabled={!size || stockForSize <= 0}
          onClick={() => handleAdd(true)}
          className="flex-1 bg-orange-500 text-black font-bold py-3 text-xs tracking-widest disabled:opacity-40"
        >
          BUY NOW
        </button>
      </div>
    </div>
  );
}
