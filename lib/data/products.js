// Legacy compatibility exports. Live catalogue data is now read from Supabase by lib/server/catalog.js.
export const products = [];
export const getAllProducts = () => products;
export const getProductBySlug = () => null;
export const getProductsByCategory = () => [];
export const getProductById = () => null;
export const getStock = (product, color, size) => Number(product?.inventory?.[color]?.[size] || 0);
export const totalStock = (product) => Object.values(product?.inventory || {}).reduce((s, sizes) => s + Object.values(sizes).reduce((a,n) => a + Number(n || 0), 0), 0);
