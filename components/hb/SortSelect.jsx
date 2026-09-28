"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SortSelect({ current }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select defaultValue={current} onChange={onChange} className="border px-3 py-2 text-sm">
      <option value="featured">Featured</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rating">Highest Rated</option>
    </select>
  );
}
