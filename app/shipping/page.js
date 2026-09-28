export const metadata = { title: "Shipping | Honey Badger" };
export default function ShippingPage() {
  return (
    <main className="max-w-[800px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl tracking-wider mb-6">SHIPPING</h1>
      <div className="text-sm text-neutral-600 space-y-4 leading-relaxed">
        <p>We deliver pan-India. Delivery is free on orders over ₹799; a flat shipping fee applies below that threshold.</p>
        <p>Standard delivery time is 4–7 business days depending on your location. You&apos;ll receive an order confirmation and can track live status any time on the Track Order page.</p>
        <p>Cash on Delivery is available across India for a ₹30 COD fee, shown clearly at checkout before you confirm your order.</p>
      </div>
    </main>
  );
}
