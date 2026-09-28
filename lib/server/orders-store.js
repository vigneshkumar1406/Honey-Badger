// Server-only. A minimal JSON-file-backed order store standing in for the
// Order / OrderItem / OrderStatusHistory tables in prisma/schema.prisma.
// Swap this module for real Prisma calls once DATABASE_URL is live —
// every function here has an obvious 1:1 Prisma equivalent.
import fs from "fs";
import path from "path";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHIJKLMNPQRSTUVWXYZ123456789", 8);

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]", "utf-8");
}

function readAll() {
  ensureStore();
  const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(orders) {
  ensureStore();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

const STATUS_FLOW = [
  "PLACED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

export function createOrder({ priced, customer, address, paymentMethod, total }) {
  const orders = readAll();
  const orderNumber = "HB" + nanoid();
  const now = new Date().toISOString();

  const initialStatus = paymentMethod === "COD" ? "PLACED" : "PAYMENT_CONFIRMED";

  const order = {
    id: orderNumber,
    orderNumber,
    customer,
    address,
    paymentMethod,
    items: priced.lineItems,
    subtotal: priced.subtotal,
    discount: priced.discount,
    appliedOffer: priced.appliedOffer,
    shippingFee: priced.shippingFee,
    codFee: paymentMethod === "COD" ? total - priced.afterDiscount - priced.shippingFee : 0,
    total,
    status: initialStatus,
    statusHistory: [{ status: initialStatus, at: now, note: "Order created" }],
    shipment: null,
    createdAt: now
  };

  orders.unshift(order);
  writeAll(orders);
  return order;
}

export function getOrder(orderNumber) {
  const orders = readAll();
  return orders.find((o) => o.orderNumber === orderNumber) || null;
}

export function getAllOrders() {
  return readAll();
}

export function advanceOrderStatus(orderNumber, note) {
  const orders = readAll();
  const order = orders.find((o) => o.orderNumber === orderNumber);
  if (!order) return null;
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const next = STATUS_FLOW[Math.min(currentIndex + 1, STATUS_FLOW.length - 1)];
  order.status = next;
  order.statusHistory.push({ status: next, at: new Date().toISOString(), note: note || "" });
  writeAll(orders);
  return order;
}

export function setShipment(orderNumber, shipment) {
  const orders = readAll();
  const order = orders.find((o) => o.orderNumber === orderNumber);
  if (!order) return null;
  order.shipment = shipment;
  writeAll(orders);
  return order;
}

export const STATUS_STEPS = STATUS_FLOW;
