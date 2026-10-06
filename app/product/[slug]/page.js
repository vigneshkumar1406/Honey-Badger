import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/server/catalog";
import ProductPurchasePanel from "@/components/hb/ProductPurchasePanel";
import ProductGallery from "@/components/hb/ProductGallery";
import ProductReviews from "@/components/hb/ProductReviews";

export async function generateStaticParams() {
  return (await getAllProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} | Honey Badger`,
    description: product.description,
    openGraph: { images: product.images[0] ? [product.images[0]] : [] }
  };
}

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const stock = Object.values(product.inventory || {}).reduce((sum, sizes) => sum + Object.values(sizes || {}).reduce((a, n) => a + Number(n || 0), 0), 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Honey Badger" },
    image: product.images,
    ...(product.reviewCount > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount
      }
    } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 pb-24 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery product={product} colorImages={product.colorImages} />

        <ProductPurchasePanel product={product} />
      </div>

      <div className="grid md:grid-cols-2 gap-10 mt-16">
        <div>
          <h2 className="font-display text-2xl tracking-wide mb-3">DESCRIPTION</h2>
          <p className="text-neutral-600 text-sm leading-relaxed">{product.description}</p>
          {product.features?.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-neutral-600 list-disc list-inside">
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-display text-2xl tracking-wide mb-3">SPECIFICATIONS</h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(product.specs || {}).map(([k, v]) => (
                <tr key={k} className="border-b">
                  <td className="py-2 text-neutral-500">{k}</td>
                  <td className="py-2 font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ProductReviews productId={product.id} initialRating={product.rating} initialCount={product.reviewCount} />
    </main>
  );
}
