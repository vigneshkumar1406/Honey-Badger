import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/server/catalog";
import ProductPurchasePanel from "@/components/hb/ProductPurchasePanel";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Honey Badger" },
    image: product.images,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock"
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 pb-24 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
            <Image src={product.images[0]} alt={product.name} fill sizes="50vw" className="object-cover" priority />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative aspect-square bg-neutral-100 overflow-hidden">
                  <Image src={img} alt="" fill sizes="16vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

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
    </main>
  );
}
