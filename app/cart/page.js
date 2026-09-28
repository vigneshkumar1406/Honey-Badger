"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, displaySubtotal, hydrated } = useCart();
  const [priced, setPriced] = useState(null);
  const [pricingError, setPricingError] = useState(null);

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    const payload = {
      items: items.map((i) => ({
        productId: i.productId,
        color: i.color,
        size: i.size,
        quantity: i.quantity
      }))
    };
    let cancelled = false;
    fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setPriced(data.priced);
          setPricingError(null);
        } else {
          setPricingError(data.error || "Could not calculate the cart price.");
        }
      })
      .catch(() => {
        if (!cancelled) setPricingError("Could not calculate the cart price.");
      });
    return () => { cancelled = true; };
  }, [items, hydrated]);

  const comboEligibleUnits = items
    .filter((i) => i.name.toLowerCase().includes("track pants") || i.slug?.includes("track-pants"))
    .reduce((sum, i) => sum + i.quantity, 0);
  let comboNudge = null;
  if (comboEligibleUnits > 0 && comboEligibleUnits < 3) {
    comboNudge = `Add ${3 - comboEligibleUnits} more track pant${3 - comboEligibleUnits > 1 ? "s" : ""} to unlock the ₹999 combo`;
  } else if (comboEligibleUnits >= 3 && comboEligibleUnits < 5) {
    comboNudge = `Add ${5 - comboEligibleUnits} more track pant${5 - comboEligibleUnits > 1 ? "s" : ""} to unlock the ₹1499 combo for 5`;
  }

  if (!hydrated) return <main className="max-w-[900px] mx-auto px-6 py-20" />;

  if (items.length === 0) {
    return (
      <main className="max-w-[900px] mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-4xl tracking-wider mb-3">YOUR CART IS WAITING.</h1>
        <p className="text-neutral-500 mb-8">Nothing here yet. Let&apos;s fix that.</p>
        <Link href="/shop" className="inline-block bg-black text-white font-bold px-8 py-4 text-sm tracking-widest">
          SHOP NOW
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-display text-3xl md:text-4xl tracking-wider mb-6">YOUR CART</h1>

      {comboNudge && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold px-4 py-3 mb-6">
          {comboNudge}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 divide-y">
          {items.map((item) => (
            <div key={`${item.productId}-${item.color}-${item.size}`} className="py-5 flex gap-4">
              <div className="relative w-20 h-24 bg-neutral-100 shrink-0">
                {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
              </div>
              <div className="flex-1">
                <Link href={`/product/${item.slug}`} className="font-semibold text-sm hover:underline">
                  {item.name}
                </Link>
                <div className="text-xs text-neutral-500 mt-1">
                  {item.color} / {item.size}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border">
                    <button
                      className="w-8 h-8 text-sm"
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      className="w-8 h-8 text-sm"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item)}
                    className="text-neutral-400 hover:text-red-600"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm font-bold">₹{item.unitPrice * item.quantity}</div>
            </div>
          ))}
        </div>

        <div className="border p-6 h-fit">
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="text-neutral-400 line-through">₹{priced ? Number(priced.subtotal).toLocaleString("en-IN") : Number(displaySubtotal).toLocaleString("en-IN")}</span>
            </div>
            {priced && Number(priced.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Combo discount</span>
                <span>−₹{Number(priced.discount).toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline border-t pt-3">
              <span className="font-bold">YOU PAY</span>
              <span className="font-bold text-2xl">
                {priced ? `₹${Number(priced.totalOnline).toLocaleString("en-IN")}` : "Calculating…"}
              </span>
            </div>
          </div>
          {pricingError && <p className="text-xs text-red-600 mb-4">{pricingError}</p>}
          <p className="text-xs text-neutral-400 mb-6">
            Combo offers are applied automatically. Shipping is calculated at checkout.
          </p>
          <Link
            href="/checkout"
            className="block text-center bg-black text-white font-bold py-4 text-sm tracking-widest hover:bg-neutral-800 transition"
          >
            PROCEED TO CHECKOUT
          </Link>
        </div>
      </div>
    </main>
  );
}
