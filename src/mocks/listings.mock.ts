// src/mocks/listings.mock.ts
export type MockListing = {
  id: string;
  title: string;
  price: number;
  currency?: string;
  location: string;
  brand: string;
  model: string;
  year: number;
  frameSize: string;
  condition: "Excellent" | "Good" | "Fair";
  images: string[];
  verified: boolean; // đã kiểm duyệt (APPROVE) -> hiển thị "Verified"
};

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: "1",
    title: "Specialized S-Works Tarmac SL7",
    price: 4200,
    currency: "VND",
    location: "HCMC",
    brand: "Specialized",
    model: "Tarmac SL7",
    year: 2022,
    frameSize: "56cm",
    condition: "Excellent",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1520975869018-5f6e3cbd2c10?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520975958224-2b6a7d2c3fbd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508779018996-3b3b4a9bca6b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "2",
    title: "Cannondale SuperSix EVO",
    price: 3850,
    currency: "VND",
    location: "Hanoi",
    brand: "Cannondale",
    model: "SuperSix EVO",
    year: 2021,
    frameSize: "54cm",
    condition: "Good",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1520975937602-69e2c2a7d56c?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];
