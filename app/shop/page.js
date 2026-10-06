import Link from "next/link";
import { getAllProducts } from "@/lib/server/catalog";
import { getCategories } from "@/lib/server/catalog";
import ProductCard from "@/components/hb/ProductCard";
import CatalogToolbar from "@/components/hb/CatalogToolbar";

export const metadata = { title: "Shop All | Honey Badger" };

export default async function ShopPage({ searchParams }) {
  const sort = searchParams?.sort || "featured";
  const q = String(searchParams?.q || "").trim().toLowerCase();
  let products = await getAllProducts();
  const categories = await getCategories();

  if (sort === "price-asc") products = [...products].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") products = [...products].sort((a, b) => b.price - a.price);
  if (sort === "rating") products = [...products].sort((a, b) => b.rating - a.rating);
  if (q) products = products.filter(p => [p.name,p.description,p.category,...(p.tags||[])].join(" ").toLowerCase().includes(q));

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.3em] text-orange-600 font-bold mb-2">EVERYTHING</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-wider">SHOP ALL</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="text-xs font-semibold uppercase tracking-wide border px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <CatalogToolbar count={products.length} currentSort={sort} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </main>
  );
}
