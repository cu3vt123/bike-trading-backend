import type { Order } from "@/types/order";

const STORAGE_KEY = "shopbike_order_overrides_v1";

type OrderPatch = Partial<
  Pick<Order, "status" | "warehouseConfirmedAt" | "reInspectionDoneAt">
>;

function readOverrides(): Record<string, OrderPatch> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, OrderPatch>;
    }
  } catch {
    // ignore parse/storage errors
  }
  return {};
}

function writeOverrides(map: Record<string, OrderPatch>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota/storage errors
  }
}

export function setOrderOverride(orderId: string, patch: OrderPatch) {
  if (!orderId) return;
  const overrides = readOverrides();
  overrides[orderId] = { ...(overrides[orderId] ?? {}), ...patch };
  writeOverrides(overrides);
}

export function applyOrderOverrides<T extends Order>(orders: T[]): T[] {
  if (!Array.isArray(orders) || orders.length === 0) return orders;
  const overrides = readOverrides();
  const ids = Object.keys(overrides);
  if (ids.length === 0) return orders;
  return orders.map((o) => {
    const patch = overrides[o.id];
    return patch ? ({ ...o, ...patch } as T) : o;
  });
}

