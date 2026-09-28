import { supabaseRequest } from "@/lib/supabase/rest";

export async function quoteCart(items) {
  return supabaseRequest("/rest/v1/rpc/quote_cart", { method: "POST", body: { p_items: items } });
}

export async function createCodOrder({ items, customer, address, accessToken }) {
  return supabaseRequest("/rest/v1/rpc/create_order_from_cart", { method: "POST", body: { p_items: items, p_customer: customer, p_address: address, p_payment_method: "COD" }, accessToken });
}

export function totalForPayment(priced, paymentMethod) {
  return Number(paymentMethod === "COD" ? priced.totalCod : priced.totalOnline);
}
