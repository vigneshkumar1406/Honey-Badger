"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry", "Other"
];

export default function CheckoutPage() {
  const { items, clearCart, hydrated } = useCart();
  const router = useRouter();

  const [priced, setPriced] = useState(null);
  const [priceError, setPriceError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [pincodeLookup, setPincodeLookup] = useState({ loading: false, error: "", found: false, postOffice: "" });
  const paymentFinalizing = useRef(false);

  const [customer, setCustomer] = useState({ name: "", email: "" });
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "Tamil Nadu",
    pincode: ""
  });

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) return;
    const payload = { items: items.map((i) => ({ productId: i.productId, color: i.color, size: i.size, quantity: i.quantity })) };
    fetch("/api/pricing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setPriced(data.priced);
          setPriceError(null);
        } else {
          setPriceError(data.error);
        }
      })
      .catch(() => setPriceError("Could not calculate pricing. Please refresh."));
  }, [items, hydrated]);

  if (hydrated && items.length === 0) {
    return (
      <main className="max-w-[700px] mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl tracking-wider mb-3">NOTHING TO CHECK OUT</h1>
        <Link href="/shop" className="inline-block bg-black text-white font-bold px-8 py-4 text-sm tracking-widest mt-4">
          SHOP NOW
        </Link>
      </main>
    );
  }

  const codFee = priced?.codFee ?? 30;
  const total = priced
    ? priced.afterDiscount + priced.shippingFee + (paymentMethod === "COD" ? codFee : 0)
    : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, color: i.color, size: i.size, quantity: i.quantity })),
          customer,
          address,
          paymentMethod
        })
      });
      const data = await res.json();
      if (!data.ok) {
        setFormError(data.error);
        setSubmitting(false);
        return;
      }
      if (data.paymentRequired) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          const finalizePayment = async (response) => {
            if (paymentFinalizing.current) return;
            paymentFinalizing.current = true;
            try {
              const verify = await fetch("/api/razorpay/verify", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                  ...response,
                  items:items.map((i)=>({productId:i.productId,color:i.color,size:i.size,quantity:i.quantity})),
                  customer,
                  address
                })
              });
              const result = await verify.json();
              if (!result.ok) throw new Error(result.error || "Payment verification failed.");
              rzp.close();
              clearCart();
              router.push(`/order-success/${result.orderNumber}`);
            } catch (err) {
              paymentFinalizing.current = false;
              setFormError(err.message || "Payment verification failed. Please contact support before retrying.");
              setSubmitting(false);
            }
          };

          const options = {
            key: data.razorpay.keyId,
            amount: data.razorpay.amount,
            currency: data.razorpay.currency,
            name: "Honey Badger Outfits",
            description: `Order payment • ₹${Math.round(data.razorpay.amount / 100)}`,
            notes: { store: "Honey Badger Outfits" },
            order_id: data.razorpay.orderId,
            prefill: { name: customer.name, email: customer.email, contact: address.phone },
            theme: { color: "#f97316", backdrop_color: "#111111" },
            handler: async (response) => {
              await finalizePayment(response);
            },
            modal: {
              confirm_close: true,
              animation: true,
              ondismiss: () => {
                if (!paymentFinalizing.current) setSubmitting(false);
              }
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", () => { setFormError("Payment failed. You can retry or choose Cash on Delivery."); setSubmitting(false); });

          let pollCount = 0;
          const poll = async () => {
            if (paymentFinalizing.current || pollCount++ >= 200) return;
            try {
              const statusRes = await fetch("/api/razorpay/status", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                cache: "no-store",
                body: JSON.stringify({
                  orderId: data.razorpay.orderId,
                  items:items.map((i)=>({productId:i.productId,color:i.color,size:i.size,quantity:i.quantity})),
                  customer,
                  address
                })
              });
              const status = await statusRes.json();
              if (status.ok && status.status === "paid" && status.orderNumber) {
                paymentFinalizing.current = true;
                rzp.close();
                clearCart();
                router.push(`/order-success/${status.orderNumber}`);
                return;
              }
            } catch {}
            window.setTimeout(poll, 3000);
          };

          rzp.open();
          window.setTimeout(poll, 3000);
        };
        script.onerror = () => { setFormError("Could not load Razorpay checkout."); setSubmitting(false); };
        document.body.appendChild(script);
        return;
      }
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch {
      setFormError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-display text-3xl md:text-4xl tracking-wider mb-8">CHECKOUT</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="font-semibold text-sm uppercase tracking-widest mb-3">Contact</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                required
                placeholder="Full name"
                className="border px-4 py-3 text-sm"
                value={customer.name}
                onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="border px-4 py-3 text-sm"
                value={customer.email}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
              />
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-sm uppercase tracking-widest mb-3">Delivery address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                required
                placeholder="Recipient name"
                className="border px-4 py-3 text-sm sm:col-span-2"
                value={address.fullName}
                onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))}
              />
              <input
                required
                placeholder="Mobile number"
                className="border px-4 py-3 text-sm"
                value={address.phone}
                onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
              />
              <div className="relative">
                <input
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Pincode"
                  className="border px-4 py-3 text-sm w-full"
                  value={address.pincode}
                  onChange={async (e) => {
                    const pincode = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setAddress((a) => ({ ...a, pincode }));
                    setPincodeLookup({ loading: false, error: "", found: false, postOffice: "" });
                    if (pincode.length !== 6) return;

                    setPincodeLookup({ loading: true, error: "", found: false, postOffice: "" });
                    try {
                      const res = await fetch(`/api/pincode?pincode=${pincode}`, { cache: "no-store" });
                      const data = await res.json();
                      if (!data.ok) throw new Error(data.error || "Pincode not found.");
                      setAddress((a) => ({ ...a, pincode, city: data.city || a.city, state: data.state || a.state }));
                      setPincodeLookup({ loading: false, error: "", found: true, postOffice: data.postOffice || "" });
                    } catch (err) {
                      setPincodeLookup({ loading: false, error: err.message || "Pincode not found.", found: false, postOffice: "" });
                    }
                  }}
                />
                {pincodeLookup.loading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">Checking…</span>
                )}
                {!pincodeLookup.loading && pincodeLookup.found && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600">✓ Found</span>
                )}
                {pincodeLookup.error && (
                  <div className="mt-1 text-xs text-red-600">{pincodeLookup.error}</div>
                )}
              </div>
              <input
                required
                placeholder="Address line 1"
                className="border px-4 py-3 text-sm sm:col-span-2"
                value={address.line1}
                onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
              />
              <input
                placeholder="Address line 2 (optional)"
                className="border px-4 py-3 text-sm sm:col-span-2"
                value={address.line2}
                onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
              />
              <input
                required
                placeholder="City / District"
                className="border px-4 py-3 text-sm"
                value={address.city}
                readOnly={pincodeLookup.found}
                onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
              />
              <select
                className="border px-4 py-3 text-sm"
                value={address.state}
                disabled={pincodeLookup.found}
                onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {pincodeLookup.found && (
              <div className="mt-2 text-xs text-neutral-500">
                Location auto-filled from pincode{pincodeLookup.postOffice ? ` • ${pincodeLookup.postOffice}` : ""}.
              </div>
            )}
          </section>

          <section>
            <h2 className="font-semibold text-sm uppercase tracking-widest mb-3">Payment method</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 border px-4 py-3 cursor-pointer">
                <input type="radio" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                <div className="text-sm">
                  <div className="font-semibold">Cash on Delivery</div>
                  <div className="text-neutral-500 text-xs">+₹{codFee} COD fee</div>
                </div>
              </label>
              <label className="flex items-center gap-3 border px-4 py-3 cursor-pointer">
                <input
                  type="radio"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                />
                <div className="text-sm">
                  <div className="font-semibold">Pay online — Cards / UPI / Netbanking</div>
                  <div className="text-neutral-500 text-xs">Secure payment powered by Razorpay</div>
                </div>
              </label>
            </div>
          </section>

          {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{formError}</div>}
        </div>

        <div className="border p-6 h-fit space-y-2 text-sm">
          <h2 className="font-semibold text-sm uppercase tracking-widest mb-3">Order summary</h2>
          {priceError && <div className="text-red-600 text-sm">{priceError}</div>}
          {priced && (
            <>
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>₹{priced.subtotal}</span>
              </div>
              {priced.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Offer ({priced.appliedOffer})</span>
                  <span>−₹{priced.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span>{priced.shippingFee === 0 ? "FREE" : `₹${priced.shippingFee}`}</span>
              </div>
              {paymentMethod === "COD" && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">COD fee</span>
                  <span>₹{codFee}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={!priced || submitting}
            className="w-full mt-4 bg-black text-white font-bold py-4 text-sm tracking-widest disabled:opacity-40 hover:bg-neutral-800 transition"
          >
            {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
          </button>
          <p className="text-[11px] text-neutral-400 pt-2">
            By placing this order, you agree to our return policy. If your order arrives damaged, please contact us within 48 hours of delivery.
          </p>
        </div>
      </form>
    </main>
  );
}
