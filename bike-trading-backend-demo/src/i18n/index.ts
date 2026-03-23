import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useLanguageStore } from "@/stores/useLanguageStore";

import vi from "@/locales/vi.json";
import en from "@/locales/en.json";

const resources = {
  vi: { translation: vi },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: useLanguageStore.getState().lang,
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false,
  },
});

useLanguageStore.subscribe((state) => {
  i18n.changeLanguage(state.lang);
});

export default i18n;
