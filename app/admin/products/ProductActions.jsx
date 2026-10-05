"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductActions({ productId, productName }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function hideProduct() {
    if (!window.confirm('Hide "' + productName + '" from the storefront?')) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/products/" + encodeURIComponent(productId), { method: "DELETE" });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "Could not hide product");
      router.refresh();
    } catch (e) {
      window.alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-end gap-3 items-center">
      <Link href={"/admin/products?id=" + productId} className="bg-black text-white px-3 py-2 rounded-md text-xs font-bold">
        EDIT
      </Link>
      <button type="button" disabled={busy} onClick={hideProduct} className="border border-red-200 text-red-600 px-3 py-2 rounded-md text-xs font-bold disabled:opacity-50">
        {busy ? "HIDING..." : "DELETE"}
      </button>
    </div>
  );
}
