"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "hb_cart_v1";
const WISHLIST_KEY = "hb_wishlist_v1";

function lineKey(item) {
  return [item.productId, item.color, item.size].join("::");
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const rawWish = localStorage.getItem(WISHLIST_KEY);
      if (rawWish) setWishlist(JSON.parse(rawWish));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  function addItem(newItem) {
    setItems((prev) => {
      const key = lineKey(newItem);
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, quantity: Math.min(10, i.quantity + newItem.quantity) } : i
        );
      }
      return [...prev, newItem];
    });
  }

  function updateQuantity(item, quantity) {
    setItems((prev) =>
      prev
        .map((i) => (lineKey(i) === lineKey(item) ? { ...i, quantity: Math.max(1, Math.min(10, quantity)) } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(item) {
    setItems((prev) => prev.filter((i) => lineKey(i) !== lineKey(item)));
  }

  function clearCart() {
    setItems([]);
  }

  function toggleWishlist(productId) {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  }

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  // Client-side subtotal is DISPLAY ONLY — the server recalculates everything
  // from product data at checkout time (see lib/server/pricing.js).
  const displaySubtotal = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items]);

  const value = {
    items,
    count,
    displaySubtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    wishlist,
    toggleWishlist,
    hydrated
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
