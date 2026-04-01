import { create } from "zustand";

export type SellerSubscriptionSummary = {
  active: boolean;
  plan: "BASIC" | "VIP" | null;
  expiresAt: string | null;
  publishedSlotsUsed: number;
  publishedSlotsLimit: number;
  listingDurationDays: number;
};

type State = {
  subscription: SellerSubscriptionSummary | null;
  setSubscription: (s: SellerSubscriptionSummary | null) => void;
  clear: () => void;
};

const emptySummary = (): SellerSubscriptionSummary => ({
  active: false,
  plan: null,
  expiresAt: null,
  publishedSlotsUsed: 0,
  publishedSlotsLimit: 0,
  listingDurationDays: 30,
});

export const useSellerSubscriptionStore = create<State>((set) => ({
  subscription: null,

  setSubscription: (s) =>
    set({
      subscription: s ?? emptySummary(),
    }),

  clear: () => set({ subscription: null }),
}));

export function normalizeSubscriptionPayload(
  raw: unknown,
): SellerSubscriptionSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    active: Boolean(o.active),
    plan: o.plan === "BASIC" || o.plan === "VIP" ? o.plan : null,
    expiresAt: typeof o.expiresAt === "string" ? o.expiresAt : null,
    publishedSlotsUsed: Number(o.publishedSlotsUsed) || 0,
    publishedSlotsLimit: Number(o.publishedSlotsLimit) || 0,
    listingDurationDays: Number(o.listingDurationDays) || 30,
  };
}
