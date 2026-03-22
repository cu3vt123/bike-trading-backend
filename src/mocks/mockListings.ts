import type { Listing } from "@/types/shopbike";

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Light, fast, aero road bike — inspected & verified",
    brand: "Specialized",
    model: "S-Works Tarmac SL7",
    year: 2022,
    frameSize: "56cm (L)",
    condition: "MINT_USED",
    location: "Ho Chi Minh City",
    price: 7200,
    msrp: 8950,
    currency: "VND",
    state: "PUBLISHED",
    certificationStatus: "CERTIFIED",
    inspectionResult: "APPROVE",
    inspectionScore: 4.6,
    inspectionReport: {
      frameIntegrity: { score: 4.8, label: "Xuất sắc" },
      drivetrainHealth: { score: 4.5, label: "Tốt" },
      brakingSystem: { score: 4.4, label: "Tốt" },
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1600&q=60",
      "https://images.unsplash.com/photo-1525104885112-7c9f2a2c63a1?auto=format&fit=crop&w=1600&q=60",
      "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1600&q=60",
      "https://images.unsplash.com/photo-1525104885112-7c9f2a2c63a1?auto=format&fit=crop&w=1600&q=60",
    ],
    specs: [
      { label: "Groupset", value: "Dura-Ace Di2 R9200" },
      { label: "Frame Material", value: "Carbon Fiber" },
      { label: "Wheelset", value: "Roval Rapide CLX" },
      { label: "Brakes", value: "Hydraulic Disc" },
      { label: "Weight", value: "6.8 kg" },
    ],
  },
  {
    id: "2",
    title: "Endurance geometry, comfortable ride",
    brand: "Trek",
    model: "Domane SL",
    year: 2021,
    frameSize: "54cm (M)",
    condition: "GOOD_USED",
    location: "Da Nang",
    price: 3100,
    currency: "VND",
    state: "PUBLISHED",
    certificationStatus: "CERTIFIED",
    inspectionResult: "APPROVE",
    inspectionScore: 4.2,
    inspectionReport: {
      frameIntegrity: { score: 4.2, label: "Tốt" },
      drivetrainHealth: { score: 4.0, label: "Khá tốt" },
      brakingSystem: { score: 4.5, label: "Tốt" },
    },
    imageUrls: [
      "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1600&q=60",
    ],
  },
];

export function getListingById(id: string) {
  return MOCK_LISTINGS.find((x) => x.id === id);
}
