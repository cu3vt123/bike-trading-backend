/** Giá gói seller (BASIC/VIP) ghi đè phía client — demo; BE checkout vẫn dùng giá server. */
export const PACKAGE_PRICE_STORAGE_KEY = "shopbike_package_price_overrides_v1";

export const PACKAGE_PRICES_UPDATED_EVENT = "shopbike-package-prices-updated";

export type PackagePriceOverrides = { BASIC: number; VIP: number };

export const DEFAULT_PACKAGE_PRICES: PackagePriceOverrides = {
  BASIC: 99_000,
  VIP: 199_000,
};

export function loadPackagePriceOverrides(): Partial<Record<"BASIC" | "VIP", number>> | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PACKAGE_PRICE_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const out: Partial<Record<"BASIC" | "VIP", number>> = {};
    const b = (o as { BASIC?: unknown }).BASIC;
    const v = (o as { VIP?: unknown }).VIP;
    if (typeof b === "number" && Number.isFinite(b) && b >= 0) out.BASIC = Math.round(b);
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) out.VIP = Math.round(v);
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

export function savePackagePriceOverrides(prices: PackagePriceOverrides): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PACKAGE_PRICE_STORAGE_KEY, JSON.stringify(prices));
  window.dispatchEvent(new Event(PACKAGE_PRICES_UPDATED_EVENT));
}

export function mergePlanPrices<T extends { id: string; priceVnd: number }>(
  plans: T[],
  overrides: Partial<Record<"BASIC" | "VIP", number>> | null,
): T[] {
  if (!overrides) return plans;
  return plans.map((p) => {
    if (p.id !== "BASIC" && p.id !== "VIP") return p;
    const v = overrides[p.id as "BASIC" | "VIP"];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return p;
    return { ...p, priceVnd: v };
  });
}
