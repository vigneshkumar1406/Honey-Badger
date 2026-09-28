import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-neutral-300 mt-24">
      <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <div className="font-display text-4xl md:text-5xl text-white tracking-wider">HONEY BADGER</div>
          <div className="text-xs tracking-[0.4em] text-orange-500 mt-2">MOVE DIFFERENT.</div>
          <p className="mt-6 text-sm text-neutral-400 max-w-sm">
            Performance-driven men&apos;s sportswear built for training, movement and everyday life. Pan-India
            delivery. Made in India.
          </p>
        </div>
        <div>
          <div className="text-white font-semibold uppercase text-xs tracking-widest mb-4">Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/category/track-pants">Track Pants</Link></li>
            <li><Link href="/category/t-shirts">T-Shirts</Link></li>
            <li><Link href="/category/hoodies">Hoodies</Link></li>
            <li><Link href="/category/shorts">Shorts</Link></li>
            <li><Link href="/category/polos">Polos</Link></li>
            <li><Link href="/shop">All Products</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold uppercase text-xs tracking-widest mb-4">Help</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/track">Track Order</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/size-guide">Size Guide</Link></li>
            <li><Link href="/shipping">Shipping</Link></li>
            <li>
              <Link href="/returns" className="text-orange-400">
                Easy Returns
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>© {new Date().getFullYear()} Honey Badger. All rights reserved.</div>
          <div className="text-center md:text-right">
            Easy returns — if your order arrives damaged, please contact us within 48 hours of delivery.
          </div>
        </div>
      </div>
    </footer>
  );
}
