/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "customer-assets-jai6qajn.emergentagent.net" },
      { protocol: "https", hostname: "wamggzkanpcuqnmyyvud.supabase.co" }
    ]
  }
};
module.exports = nextConfig;
