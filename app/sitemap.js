import { getAllProducts } from "@/lib/server/catalog";
import { getCategories } from "@/lib/server/catalog";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const categories = await getCategories();
  const products = await getAllProducts();
  const staticRoutes = ["", "/shop", "/about", "/contact", "/faq", "/shipping", "/returns", "/size-guide", "/track"].map(
    (p) => ({ url: `${base}${p}`, lastModified: new Date() })
  );
  const categoryRoutes = categories.map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: new Date() }));
  const productRoutes = products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date() }));
  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
