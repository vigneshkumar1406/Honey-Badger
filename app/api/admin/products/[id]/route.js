import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdmin, supabaseRequest } from "@/lib/supabase/rest";

function newId() { return randomBytes(13).toString("hex"); }

function payload(b) {
  return {
    name: b.name, slug: b.slug, category_id: b.categoryId || null,
    short_description: b.shortDescription || null, description: b.description || null,
    material: b.material || null, fit: b.fit || null, price: Number(b.price),
    compare_at_price: b.mrp ? Number(b.mrp) : null, sku: b.sku || null,
    status: b.status || "draft", seo_title: b.seoTitle || null,
    seo_description: b.seoDescription || null,
    tags: Array.isArray(b.tags) ? b.tags : [], features: Array.isArray(b.features) ? b.features : [],
    specs: b.specs || {},
  };
}

async function replaceChildren(accessToken, productId, b) {
  await supabaseRequest("/rest/v1/product_variants?product_id=eq." + encodeURIComponent(productId), { method: "DELETE", accessToken });
  await supabaseRequest("/rest/v1/product_images?product_id=eq." + encodeURIComponent(productId), { method: "DELETE", accessToken });
  for (const v of b.variants || []) {
    await supabaseRequest("/rest/v1/product_variants", { method: "POST", accessToken, headers: { Prefer: "return=minimal" }, body: {
      id: newId(), product_id: productId, color: v.color, size: v.size, color_hex: v.colorHex || null,
      sku: v.sku || b.sku + "-" + String(v.color).slice(0, 3).toUpperCase() + "-" + v.size,
      stock: Number(v.stock || 0), price_override: v.priceOverride ? Number(v.priceOverride) : null, is_active: true
    }});
  }
  for (let i = 0; i < (b.images || []).length; i++) {
    await supabaseRequest("/rest/v1/product_images", { method: "POST", accessToken, headers: { Prefer: "return=minimal" }, body: {
      id: newId(), product_id: productId, image_url: b.images[i], alt_text: b.name, sort_order: i, is_primary: i === 0
    }});
  }
}

export async function PUT(req, { params }) {
  try {
    const { accessToken } = await requireAdmin(); const b = await req.json(); const id = params.id;
    await supabaseRequest("/rest/v1/products?id=eq." + encodeURIComponent(id), { method: "PATCH", accessToken, headers: { Prefer: "return=minimal" }, body: payload(b) });
    await replaceChildren(accessToken, id, b);
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "FORBIDDEN" ? 403 : 400 }); }
}

export async function DELETE(req, { params }) {
  try {
    const { accessToken } = await requireAdmin(); const id = params.id;
    await supabaseRequest("/rest/v1/products?id=eq." + encodeURIComponent(id), { method: "PATCH", accessToken, headers: { Prefer: "return=minimal" }, body: { status: "hidden" } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: e.code === "FORBIDDEN" ? 403 : 400 }); }
}