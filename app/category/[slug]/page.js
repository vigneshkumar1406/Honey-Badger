import { notFound } from "next/navigation";
import { getCategories } from "@/lib/server/catalog";
import { getProductsByCategory, getAllProducts } from "@/lib/server/catalog";
import ProductCard from "@/components/hb/ProductCard";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug })).concat([{ slug: "sale" }]);
}

export async function generateMetadata({ params }) {
  const categories = await getCategories();
  const cat = categories.find(c=>c.slug===params.slug);
  return { title: cat ? `${cat.name} | Honey Badger` : "Honey Badger" };
}

export default async function CategoryPage({ params }) {
  const categories = await getCategories();
  const isSale = params.slug === "sale";
  const cat = isSale ? { name: "Sale", tagline: "Deepest discounts, while stock lasts" } : categories.find(c=>c.slug===params.slug);

  if (!cat) notFound();

  const products = isSale
    ? (await getAllProducts()).filter((p) => Math.round(((p.mrp - p.price) / p.mrp) * 100) >= 40)
    : await getProductsByCategory(params.slug);

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.3em] text-orange-600 font-bold mb-2">CATEGORY</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-wider">{cat.name.toUpperCase()}</h1>
        {cat.tagline && <p className="text-neutral-500 mt-2">{cat.tagline}</p>}
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center text-neutral-500">
          <p className="font-display text-2xl tracking-wide mb-2">COMING SOON</p>
          <p>New drops in this category are on the way.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}
