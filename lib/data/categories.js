export const categories = [
  { slug: "track-pants", name: "Track Pants", tagline: "Built for movement", image: "/images/track-pants-black-front.jpeg" },
  { slug: "t-shirts", name: "T-Shirts", tagline: "Everyday performance", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop" },
  { slug: "shorts", name: "Shorts", tagline: "Train unrestricted", image: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=1200&auto=format&fit=crop" },
  { slug: "hoodies", name: "Hoodies", tagline: "Layered strength", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop" },
  { slug: "polos", name: "Polos", tagline: "Refined athleisure", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop" },
  { slug: "joggers", name: "Joggers", tagline: "Street ready", image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=1200&auto=format&fit=crop" },
  { slug: "gym-vests", name: "Gym Vests", tagline: "Zero-distraction training", image: "https://images.unsplash.com/photo-1583500178690-f7fe38f8e83a?q=80&w=1200&auto=format&fit=crop" },
  { slug: "activewear", name: "Activewear", tagline: "Complete kit", image: "https://images.unsplash.com/photo-1526403225027-3bfa04b13c68?q=80&w=1200&auto=format&fit=crop" }
];

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug) || null;
}
