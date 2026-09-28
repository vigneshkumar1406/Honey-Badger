import { supabaseRequest } from "@/lib/supabase/rest";

export const STATUS_STEPS = ["confirmed","processing","packed","shipped","out_for_delivery","delivered"];

function normalizeOrder(o) {
  return {
    id: o.id, orderNumber: o.order_number, customer: { name: o.customer_name, email: o.customer_email, phone: o.customer_phone },
    address: o.shipping_address || {}, paymentMethod: String(o.payment_method || "").toUpperCase(), total: Number(o.total), subtotal: Number(o.subtotal), discount: Number(o.discount), shippingFee: Number(o.shipping_fee), codFee: Number(o.cod_fee),
    status: o.order_status, paymentStatus: o.payment_status, paymentId: o.payment_id, trackingNumber: o.tracking_number, courierName: o.courier_name, createdAt: o.created_at,
    notes: o.notes, items: o.order_items || [], statusHistory: o.order_status_history || []
  };
}

export async function getOrderByNumber(orderNumber, accessToken) {
  const rows = await supabaseRequest(`/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=*,order_items(*),order_status_history(*)&limit=1`, { accessToken });
  return rows?.[0] ? normalizeOrder(rows[0]) : null;
}

export async function getUserOrders(userId, accessToken) {
  const rows = await supabaseRequest(`/rest/v1/orders?user_id=eq.${encodeURIComponent(userId)}&select=*,order_items(*),order_status_history(*)&order=created_at.desc`, { accessToken });
  return rows.map(normalizeOrder);
}

export async function getAllOrders(accessToken) {
  const rows = await supabaseRequest(`/rest/v1/orders?select=*,order_items(*),order_status_history(*)&order=created_at.desc`, { accessToken });
  return rows.map(normalizeOrder);
}
