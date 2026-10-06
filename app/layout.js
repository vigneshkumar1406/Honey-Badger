import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/hb/Header";
import Footer from "@/components/hb/Footer";
import WhatsAppButton from "@/components/hb/WhatsAppButton";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Honey Badger — Move Different | Men's Sportswear",
  description:
    "Performance-driven men's sportswear built for training, movement and everyday life. Track pants, joggers, tees, hoodies. Pan-India delivery.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Honey Badger — Move Different",
    description: "Men's sportswear built for movement."
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-neutral-900">
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
