import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "vi" | "en";

type LanguageState = {
  lang: Language;
  setLang: (lang: Language) => void;
  toggle: () => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      lang: "vi",
      setLang: (lang) => set({ lang }),
      toggle: () => {
        const next = get().lang === "vi" ? "en" : "vi";
        set({ lang: next });
        if (typeof document !== "undefined") {
          document.documentElement.lang = next === "vi" ? "vi" : "en";
        }
      },
    }),
    {
      name: "language-storage",
      partialize: (state) => ({ lang: state.lang }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          document.documentElement.lang = state.lang === "vi" ? "vi" : "en";
        }
      },
    },
  ),
);

