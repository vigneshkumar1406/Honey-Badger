import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, Award, RotateCcw, ArrowUpRight } from "lucide-react";
import { getCategories, getAllProducts, getProductsByCategory } from "@/lib/server/catalog";
import ProductCard from "@/components/hb/ProductCard";

export default async function HomePage() {
  const [all, categories] = await Promise.all([getAllProducts(), getCategories()]);

  const productCountByCategory = all.reduce((counts, product) => {
    if (product.category) counts[product.category] = (counts[product.category] || 0) + 1;
    return counts;
  }, {});

  // Merchandising order: categories with the deepest live assortment lead.
  // Database sort order remains the stable tie-breaker.
  const sortedCategories = categories
    .map((category, index) => ({
      ...category,
      productCount: productCountByCategory[category.slug] || 0,
      originalIndex: index,
      productImage: all.find((product) => product.category === category.slug)?.images?.[0] || null,
    }))
    .sort((a, b) => b.productCount - a.productCount || a.originalIndex - b.originalIndex);

  const bestSellers = all.filter((p) => p.tags.includes("best-seller")).slice(0, 4);
  const trackPants = await getProductsByCategory("track-pants");

  const featured = sortedCategories[0];
  const secondary = sortedCategories.slice(1, 3);
  const compact = sortedCategories.slice(3);

  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="relative min-h-[560px] md:min-h-[650px] bg-black text-white overflow-hidden">
        <Image
          src="/images/track-pants-lifestyle.jpeg"
          alt="Honey Badger track pants"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-65"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        <div className="relative max-w-[1400px] mx-auto px-6 py-24 md:py-32 min-h-[560px] md:min-h-[650px] flex items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 text-[10px] md:text-xs tracking-[0.32em] font-bold text-orange-400 mb-5">
              <span className="w-8 h-px bg-orange-500" /> MEN&apos;S PERFORMANCE WEAR
            </div>
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.84] tracking-wide">
              MOVE
              <br />
              <span className="hb-text-gradient">DIFFERENT.</span>
            </h1>
            <p className="mt-7 max-w-xl text-neutral-200 text-base md:text-lg leading-relaxed">
              Performance-driven essentials built for training, movement and everyday life.
              Engineered fabrics. Athletic silhouettes. Zero compromise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/category/track-pants" className="bg-white text-black font-black px-7 py-4 text-sm tracking-widest hover:bg-orange-500 hover:text-white transition-colors">
                SHOP TRACK PANTS <ArrowUpRight className="inline w-4 h-4 ml-1" />
              </Link>
              <Link href="/shop" className="border border-white/50 text-white font-bold px-7 py-4 text-sm tracking-widest hover:bg-white hover:text-black transition-colors">
                SHOP ALL
              </Link>
            </div>
          </div>

          <div className="hidden lg:block absolute right-10 bottom-12 text-right">
            <div className="font-display text-4xl xl:text-5xl leading-none tracking-wider">3 FOR ₹999</div>
            <div className="font-display text-4xl xl:text-5xl leading-none tracking-wider text-orange-400">5 FOR ₹1499</div>
            <div className="mt-3 text-xs tracking-[0.2em] text-neutral-300">MIX &amp; MATCH • AUTOMATICALLY APPLIED</div>
          </div>
        </div>
      </section>

      {/* OFFER STRIP */}
      <section className="bg-orange-500 text-black">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm md:text-base font-black tracking-wide">
          <span>3 TRACK PANTS — ₹999</span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span>5 TRACK PANTS — ₹1499</span>
          <span className="hidden md:inline opacity-40">|</span>
          <Link href="/category/track-pants" className="underline underline-offset-4">SHOP THE OFFER →</Link>
        </div>
      </section>

      {/* CATEGORY MERCHANDISING */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <div className="text-[10px] tracking-[0.32em] text-orange-600 font-black mb-2">SHOP BY CATEGORY</div>
            <h2 className="font-display text-4xl md:text-6xl tracking-wider leading-none">THE FULL KIT.</h2>
            <p className="mt-3 text-sm text-neutral-500">Explore our categories, starting with the deepest live assortment.</p>
          </div>
          <Link href="/shop" className="text-sm font-bold uppercase tracking-widest underline underline-offset-4 hover:text-orange-600">
            View all products →
          </Link>
        </div>

        {featured && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
            {/* Largest card = category with most live products */}
            <Link
              href={`/category/${featured.slug}`}
              className="group relative min-h-[420px] lg:min-h-[590px] lg:col-span-5 overflow-hidden bg-neutral-100 rounded-sm"
            >
              <Image
                src={featured.productImage || featured.image || "/images/track-pants-lifestyle.jpeg"}
                alt={featured.name}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="bg-orange-500 text-black font-black text-[11px] px-3 py-1.5">#1 ASSORTMENT</span>
                <span className="bg-black/70 backdrop-blur text-white font-bold text-[11px] px-3 py-1.5">
                  {featured.productCount} {featured.productCount === 1 ? "PRODUCT" : "PRODUCTS"}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="font-display text-4xl md:text-5xl tracking-wider">{featured.name.toUpperCase()}</div>
                <div className="mt-1 text-xs md:text-sm text-orange-300 tracking-[0.18em] font-bold">{featured.tagline}</div>
                <div className="mt-5 inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/60 group-hover:bg-white group-hover:text-black transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {secondary.map((c, index) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="group relative min-h-[285px] sm:min-h-[290px] overflow-hidden bg-neutral-100 rounded-sm"
                >
                  <Image
                    src={c.productImage || c.image || "/images/track-pants-lifestyle.jpeg"}
                    alt={c.name}
                    fill
                    sizes="(min-width: 640px) 35vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 text-black font-black text-[10px] px-2.5 py-1">#{index + 2}</span>
                    <span className="bg-black/65 text-white font-bold text-[10px] px-2.5 py-1">
                      {c.productCount} {c.productCount === 1 ? "PRODUCT" : "PRODUCTS"}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <div className="font-display text-3xl tracking-wider">{c.name.toUpperCase()}</div>
                    <div className="text-[10px] text-orange-300 tracking-[0.16em] font-bold">{c.tagline}</div>
                    <div className="absolute right-5 bottom-5 w-9 h-9 rounded-full border border-white/60 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {compact.map((c, index) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="group relative min-h-[220px] sm:min-h-[250px] overflow-hidden bg-neutral-100 rounded-sm"
                >
                  <Image
                    src={c.productImage || c.image || "/images/track-pants-lifestyle.jpeg"}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
                    <span className="bg-white/90 text-black font-black text-[10px] px-2 py-1">#{index + 4}</span>
                    <span className="bg-black/65 text-white font-bold text-[9px] px-2 py-1">
                      {c.productCount > 0 ? `${c.productCount} PRODUCTS` : "COMING SOON"}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="font-display text-2xl tracking-wider">{c.name.toUpperCase()}</div>
                    <div className="text-[9px] text-orange-300 tracking-[0.14em] font-bold">{c.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* BEST SELLERS */}
      <section className="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-orange-600 font-bold mb-2">BEST SELLERS</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-wider">MOST WANTED.</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* FABRIC STORY */}
      <section className="relative bg-black text-white mt-10">
        <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative w-full h-[360px] md:h-[440px]">
            <Image src="/images/track-pants-black-front.jpeg" alt="Honey Badger 4-way Lycra track pants" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] text-orange-500 font-bold mb-3">ENGINEERED FABRIC</div>
            <h3 className="font-display text-5xl md:text-6xl tracking-wider leading-none">4-WAY<br />ULTRA-STRETCH<br />LYCRA.</h3>
            <p className="mt-6 text-neutral-300 max-w-md">Move in every direction. Our signature 4-way Lycra is engineered for high elasticity, breathability and quick-dry performance.</p>
            <Link href="/product/4-way-lycra-track-pants" className="inline-block mt-8 bg-orange-500 text-black font-bold px-8 py-4 text-sm tracking-widest hover:bg-white transition">SHOP THE 4-WAY LYCRA</Link>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-neutral-100">
        <div className="max-w-[1400px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[
            [Truck, "FREE OVER ₹799", "Pan-India delivery"],
            [ShieldCheck, "SECURE CHECKOUT", "Razorpay + COD"],
            [Award, "PREMIUM FABRICS", "Engineered for movement"],
            [RotateCcw, "DAMAGE POLICY", "Returns for damaged products"],
          ].map(([Icon, title, copy]) => (
            <div key={title} className="bg-white p-5 md:p-6">
              <Icon className="w-6 h-6 text-orange-600" />
              <div className="font-bold text-sm tracking-widest mt-3">{title}</div>
              <div className="text-xs text-neutral-500 mt-1">{copy}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20 text-center">
          <div className="text-[10px] tracking-[0.3em] text-orange-500 font-bold mb-3">JOIN THE PACK</div>
          <h2 className="font-display text-4xl md:text-6xl tracking-wider">FIRST DROPS. FIRST DIBS.</h2>
          <p className="mt-4 text-neutral-400">Get early access to new releases and combo drops.</p>
          <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" required placeholder="your@email.com" className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500" />
            <button className="bg-orange-500 text-black font-bold px-6 py-3 text-sm tracking-widest hover:bg-white transition">SUBSCRIBE</button>
          </form>
        </div>
      </section>
    </main>
  );
}
