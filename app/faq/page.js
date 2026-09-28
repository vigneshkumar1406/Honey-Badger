export const metadata = { title: "FAQ | Honey Badger" };

const FAQS = [
  { q: "What payment methods do you accept?", a: "We accept Razorpay (cards, UPI, netbanking, wallets) and Cash on Delivery (COD fee of ₹30 applies)." },
  { q: "How long does delivery take?", a: "Most orders are delivered within 4–7 business days, pan-India." },
  { q: "Can I return a product I don't like?", a: "Returns and replacements are available only for products received damaged. General returns for size, colour or change of mind are not currently offered." },
  { q: "How do I track my order?", a: "Use the Track Order page with your order number, or check the link in your order confirmation email." },
  { q: "Is COD available everywhere?", a: "COD is available pan-India, subject to a ₹30 COD fee added at checkout." }
];

export default function FaqPage() {
  return (
    <main className="max-w-[800px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl tracking-wider mb-8">FAQ</h1>
      <div className="divide-y">
        {FAQS.map((f) => (
          <div key={f.q} className="py-5">
            <div className="font-semibold text-sm mb-1">{f.q}</div>
            <div className="text-sm text-neutral-600">{f.a}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
