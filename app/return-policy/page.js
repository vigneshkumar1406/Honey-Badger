import Link from "next/link";

export const metadata = {
  title: "Return Policy | Honey Badger Outfits",
  description: "Return and damage support policy for Honey Badger Outfits orders.",
};

export default function ReturnPolicyPage() {
  return (
    <main className="max-w-[900px] mx-auto px-6 py-14">
      <div className="mb-10">
        <p className="text-xs font-bold tracking-[0.25em] text-orange-600 uppercase">Customer Support</p>
        <h1 className="font-display text-4xl tracking-wider mt-2">RETURN POLICY</h1>
        <p className="text-neutral-500 mt-3 max-w-2xl">
          We want you to shop with confidence. This policy explains how we handle orders that arrive damaged.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-7 text-neutral-700">
        <section className="border p-6">
          <h2 className="font-semibold text-lg text-neutral-900">Easy Returns for Damaged-on-Delivery Items</h2>
          <p className="mt-3">
            If a product arrives damaged, please contact us within 48 hours of delivery.
            We will review the request and the supporting information and, where the request
            is accepted, help you with the appropriate next step.
          </p>
        </section>

        <section className="border p-6">
          <h2 className="font-semibold text-lg text-neutral-900">How to Request Support</h2>
          <ol className="list-decimal pl-5 mt-3 space-y-2">
            <li>Sign in to the account used for the order.</li>
            <li>Open <strong>Track Orders</strong> and select the delivered order.</li>
            <li>Select the affected product and choose the return/issue option.</li>
            <li>Describe the damage clearly and provide clear photos showing the issue.</li>
            <li>Submit the request within 48 hours of delivery.</li>
          </ol>
        </section>

        <section className="border p-6">
          <h2 className="font-semibold text-lg text-neutral-900">Request Review</h2>
          <p className="mt-3">
            Requests are reviewed individually. We may use the order details, description
            and photographs you provide to verify the reported issue. Submission of a
            request does not by itself mean that the request is approved.
          </p>
          <p className="mt-3">
            After review, our support team will communicate the next steps available for
            the approved request. The available resolution may depend on the product,
            order details and the nature of the reported damage.
          </p>
        </section>

        <section className="border p-6">
          <h2 className="font-semibold text-lg text-neutral-900">Important Conditions</h2>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>The order must show as delivered before a damage request can be submitted.</li>
            <li>Damage requests must be submitted within 48 hours of delivery.</li>
            <li>Requests should relate to the specific product received in the order.</li>
            <li>Clear photographs and an accurate description help us assess the request.</li>
            <li>This policy covers damage reported in accordance with the process above. Requests for other reasons may be subject to separate terms or may not be covered by this policy.</li>
          </ul>
        </section>

        <section className="border p-6">
          <h2 className="font-semibold text-lg text-neutral-900">Your Rights</h2>
          <p className="mt-3">
            Nothing in this policy is intended to limit or exclude any rights or remedies
            that cannot legally be excluded or limited under applicable law. Where a
            mandatory consumer protection requirement applies, we will comply with it.
          </p>
        </section>

        <section className="border p-6">
          <h2 className="font-semibold text-lg text-neutral-900">Need Help?</h2>
          <p className="mt-3">
            If you are unsure whether your issue is covered, please contact our support
            team and share your order details. We can explain the available process before
            you submit a request.
          </p>
          <p className="mt-3">
            <strong>WhatsApp:</strong> +91 72004 77413
            <br />
            <strong>Email:</strong> honeybadgeroutfits@gmail.com
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/track" className="bg-black text-white px-6 py-3 text-sm font-bold tracking-widest">TRACK ORDERS</Link>
        <Link href="/returns" className="border px-6 py-3 text-sm font-bold tracking-widest">SUBMIT DAMAGE REQUEST</Link>
        <Link href="/shop" className="border px-6 py-3 text-sm font-bold tracking-widest">CONTINUE SHOPPING</Link>
      </div>

      <p className="text-xs text-neutral-400 mt-8">
        Policy information is provided for customer guidance and may be updated from time to time.
      </p>
    </main>
  );
}
