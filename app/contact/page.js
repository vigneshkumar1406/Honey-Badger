export const metadata = { title: "Contact | Honey Badger" };
export default function ContactPage() {
  return (
    <main className="max-w-[600px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl tracking-wider mb-6">CONTACT US</h1>
      <div className="text-sm text-neutral-600 space-y-3">
        <p>Email: support@honeybadger.in</p>
        <p>WhatsApp: +91 00000 00000 (configurable from Admin → Settings)</p>
        <p>Hours: Mon–Sat, 10am–7pm IST</p>
      </div>
    </main>
  );
}
