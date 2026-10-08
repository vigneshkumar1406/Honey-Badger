import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdmin, supabaseRequest } from "@/lib/supabase/rest";

function newId() {
  // Matches the compact 26-character hex IDs used by the existing commerce rows.
  return randomBytes(13).toString("hex");
}

function productPayload(b, slug = b.slug) {
  return {
    id: newId(),
    name: b.name,
    slug,
    category_id: b.categoryId || null,
    short_description: b.shortDescription || null,
    description: b.description || null,
    material: b.material || null,
    fit: b.fit || null,
    price: Number(b.price),
    compare_at_price: b.mrp ? Number(b.mrp) : null,
    sku: b.sku || null,
    brand: "Honey Badger Outfits",
    status: b.status || "draft",
    color_images: b.colorImages || {},
    seo_title: b.seoTitle || null,
    seo_description: b.seoDescription || null,
    tags: Array.isArray(b.tags) ? b.tags : [],
    features: Array.isArray(b.features) ? b.features : [],
    specs: b.specs || {},
  };
}

export async function POST(req) {
  try {
    const { accessToken } = await requireAdmin();
    const b = await req.json();

    // Slugs are globally unique. If an admin reuses an existing slug,
    // automatically make a stable unique variant instead of returning a
    // confusing PostgreSQL 23505 error.
    const baseSlug = String(b.slug || "").trim().toLowerCase();
    let slug = baseSlug;
    if (slug) {
      const existing = await supabaseRequest(
        `/rest/v1/products?slug=eq.${encodeURIComponent(baseSlug)}&select=slug&limit=1`,
        { accessToken }
      );
      if (existing?.length) {
        let n = 2;
        while (true) {
          const candidate = `${baseSlug}-${n}`;
          const rows = await supabaseRequest(
            `/rest/v1/products?slug=eq.${encodeURIComponent(candidate)}&select=slug&limit=1`,
            { accessToken }
          );
          if (!rows?.length) {
            slug = candidate;
            break;
          }
          n += 1;
        }
      }
    }

    const [p] = await supabaseRequest("/rest/v1/products", {
      method: "POST",
      accessToken,
      headers: { Prefer: "return=representation" },
      body: productPayload(b, slug),
    });

    for (const v of b.variants || []) {
      await supabaseRequest("/rest/v1/product_variants", {
        method: "POST",
        accessToken,
        headers: { Prefer: "return=minimal" },
        body: {
          id: newId(),
          product_id: p.id,
          color: v.color,
          size: v.size,
          color_hex: v.colorHex || null,
          sku:
            v.sku ||
            `${b.sku}-${String(v.color).slice(0, 3).toUpperCase()}-${v.size}`,
          stock: Number(v.stock || 0),
          price_override: v.priceOverride ? Number(v.priceOverride) : null,
          is_active: true,
        },
      });
    }

    for (let i = 0; i < (b.images || []).length; i++) {
      await supabaseRequest("/rest/v1/product_images", {
        method: "POST",
        accessToken,
        headers: { Prefer: "return=minimal" },
        body: {
          id: newId(),
          product_id: p.id,
          image_url: b.images[i],
          alt_text: b.name,
          sort_order: i,
          is_primary: i === 0,
        },
      });
    }

    return NextResponse.json({ ok: true, id: p.id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: e.code === "FORBIDDEN" ? 403 : 400 }
    );
  }
}
