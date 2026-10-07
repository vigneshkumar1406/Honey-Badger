/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "customer-assets-jai6qajn.emergentagent.net" },
      { protocol: "https", hostname: "wamggzkanpcuqnmyyvud.supabase.co" },
      {
        protocol: "https",
        hostname: "aesqjkzzebjbrcudfbtk.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**"
      }
    ]
  }
};

module.exports = nextConfig;
