import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  ids: Set<string>;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: new Set<string>(),

      toggle: (id: string) => {
        set((state) => {
          const next = new Set(state.ids);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { ids: next };
        });
      },

      has: (id: string) => get().ids.has(id),
    }),
    {
      name: "wishlist-storage",
      partialize: (s) => ({ ids: Array.from(s.ids) }),
      merge: (persisted: { ids?: string[] }, current) => ({
        ...current,
        ids: new Set((persisted?.ids ?? [])),
      }),
    },
  ),
);
