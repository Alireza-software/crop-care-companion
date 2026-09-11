export type Supplier = {
  name: string;
  city: string;
  phone: string;
  role: string;
  supplies: string[];
};

// Sample listings — replace the names with your real partners any time.
export const SUPPLIERS: Supplier[] = [
  {
    name: "Quetta Kisan Agri Store",
    city: "Quetta",
    phone: "+93452659878",
    role: "Farmer supplier to shop",
    supplies: ["Fungicide sprays", "Neem oil", "Copper solution"],
  },
  {
    name: "Baloch Fruit & Vegetable Supply",
    city: "Quetta",
    phone: "+93452659878",
    role: "Farmer supplier to shop",
    supplies: ["Crate packing", "Cold storage", "Market transport"],
  },
  {
    name: "Green Valley Seeds & Fertilizer",
    city: "Quetta",
    phone: "+93452659878",
    role: "Farmer supplier to shop",
    supplies: ["Disease-free seed", "Compost", "Soil testing"],
  },
];
