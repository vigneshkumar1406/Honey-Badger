import { supabaseRequest } from "@/lib/supabase/rest";

function mapProduct(row) {
  const variants = row.product_variants || [];
  const images = (row.product_images || []).sort((a,b) => (a.sort_order||0)-(b.sort_order||0)).map((i) => i.image_url).filter(Boolean);
  const colors = [];
  const inventory = {};
  for (const v of variants) {
    const color = v.color || "Default";
    if (!colors.some((c) => c.name === color)) colors.push({ name: color, hex: v.color_hex || "#111111" });
    inventory[color] ||= {};
    inventory[color][v.size || "OS"] = Number(v.stock || 0);
  }
  return {
    id: row.id, slug: row.slug, name: row.name, category: row.categories?.slug || "uncategorized",
    categoryId: row.category_id, tags: row.tags || [], price: Number(row.price), mrp: Number(row.compare_at_price || row.price),
    rating: Number(row.rating || 0), reviewCount: Number(row.review_count || 0), badge: row.badge || null,
    sku: row.sku || "", description: row.description || row.short_description || "", shortDescription: row.short_description || "",
    material: row.material || "", fit: row.fit || "", features: row.features || [], specs: row.specs || {},
    images: images.length ? images : ["/images/track-pants-black-front.jpeg"], colorImages: row.color_images || {}, colors, inventory,
    variants: variants.map((v) => ({ id: v.id, color: v.color, colorHex: v.color_hex, size: v.size, stock: Number(v.stock || 0), sku: v.sku, priceOverride: v.price_override })),
    status: row.status
  };
}

const PRODUCT_SELECT = "*,categories(id,name,slug),product_images(id,image_url,alt_text,sort_order,is_primary),product_variants(id,color,size,color_hex,sku,stock,price_override,is_active)";

export async function getAllProducts({ includeHidden = false, accessToken = null } = {}) {
  const filter = includeHidden ? "" : "&status=eq.published";
  const rows = await supabaseRequest(`/rest/v1/products?select=${encodeURIComponent(PRODUCT_SELECT)}${filter}&order=created_at.desc`, { accessToken });
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug, { includeHidden = false } = {}) {
  const filter = includeHidden ? "" : "&status=eq.published";
  const rows = await supabaseRequest(`/rest/v1/products?slug=eq.${encodeURIComponent(slug)}${filter}&select=${encodeURIComponent(PRODUCT_SELECT)}&limit=1`);
  return rows?.[0] ? mapProduct(rows[0]) : null;
}

export async function getProductsByCategory(slug) {
  const categoryRows = await supabaseRequest(`/rest/v1/categories?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`);
  const id = categoryRows?.[0]?.id;
  if (!id) return [];
  const rows = await supabaseRequest(`/rest/v1/products?category_id=eq.${id}&status=eq.published&select=${encodeURIComponent(PRODUCT_SELECT)}&order=created_at.desc`);
  return rows.map(mapProduct);
}

const CATEGORY_VISUALS = {
  "track-pants": { image: "/images/track-pants-black-front.jpeg", tagline: "BUILT TO MOVE" },
  "t-shirts": { image: "/images/track-pants-lifestyle.jpeg", tagline: "EVERYDAY PERFORMANCE" },
  "shorts": { image: "/images/track-pants-green-front.jpeg", tagline: "LIGHT. FAST. FREE." },
  "hoodies": { image: "/images/track-pants-black-front.jpeg", tagline: "BUILT FOR THE GRIND" },
  "polos": { image: "/images/track-pants-lifestyle.jpeg", tagline: "CLEAN PERFORMANCE" },
  "joggers": { image: "/images/track-pants-green-front.jpeg", tagline: "MOVE DIFFERENT" },
  "gym-vests": { image: "/images/track-pants-black-front.jpeg", tagline: "TRAIN HARD" },
  "activewear": { image: "/images/track-pants-lifestyle.jpeg", tagline: "PERFORMANCE FIRST" },
};

export async function getCategories() {
  const rows = await supabaseRequest(`/rest/v1/categories?is_active=eq.true&select=*&order=sort_order.asc,name.asc`);
  return rows.map((c) => ({
    ...c,
    image: c.image || CATEGORY_VISUALS[c.slug]?.image || "/images/track-pants-lifestyle.jpeg",
    tagline: c.tagline || CATEGORY_VISUALS[c.slug]?.tagline || "MOVE DIFFERENT",
  }));
}

export function totalStock(product) { return Object.values(product.inventory || {}).reduce((s, sizes) => s + Object.values(sizes).reduce((a,n) => a + Number(n || 0), 0), 0); }
export function getStock(product, color, size) { return Number(product?.inventory?.[color]?.[size] || 0); }

export async function getStoreSettings() {
  const rows = await supabaseRequest(`/rest/v1/admin_settings?id=eq.singleton&select=*&limit=1`);
  return rows?.[0] || {};
}
