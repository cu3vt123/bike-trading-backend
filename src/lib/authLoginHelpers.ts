import type { Role } from "@/types/auth";
import type { SellerSubscriptionSummary } from "@/stores/useSellerSubscriptionStore";

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_API === "true";

export { USE_MOCK_AUTH };

export function pathOnly(fullPath: string) {
  const q = fullPath.indexOf("?");
  return q >= 0 ? fullPath.slice(0, q) : fullPath;
}

export function resolvePostLoginPath(fromPath: string, role: Role) {
  const base = pathOnly(fromPath);
  if (base.startsWith("/seller") && role !== "SELLER") return "/";
  const buyerOnlyPrefixes = ["/checkout", "/transaction", "/finalize", "/success"];
  if (buyerOnlyPrefixes.some((p) => base.startsWith(p)) && role !== "BUYER") {
    return "/";
  }
  if (base.startsWith("/inspector") && role !== "INSPECTOR" && role !== "ADMIN")
    return "/";
  if (base.startsWith("/admin") && role !== "ADMIN") return "/";
  return fromPath;
}

export async function mockLogin(payload: {
  emailOrUsername: string;
  password: string;
}): Promise<{
  accessToken: string;
  refreshToken?: string;
  role: Role;
  subscription?: SellerSubscriptionSummary;
}> {
  if (!payload.emailOrUsername.trim() || payload.password.trim().length < 3) {
    throw new Error("Invalid credentials");
  }
  const email = payload.emailOrUsername.toLowerCase();
  if (email.includes("seller"))
    return {
      accessToken: `mock_${Date.now()}`,
      role: "SELLER",
      subscription: {
        active: true,
        plan: "BASIC",
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        publishedSlotsUsed: 0,
        publishedSlotsLimit: 7,
        listingDurationDays: 30,
      },
    };
  if (email.includes("inspector"))
    return { accessToken: `mock_${Date.now()}`, role: "INSPECTOR" };
  if (email.includes("admin")) return { accessToken: `mock_${Date.now()}`, role: "ADMIN" };
  return { accessToken: `mock_${Date.now()}`, role: "BUYER" };
}

export async function mockSignup(payload: {
  role: Role;
  username: string;
  email: string;
  password: string;
}): Promise<{
  accessToken: string;
  refreshToken?: string;
  role?: Role;
  subscription?: SellerSubscriptionSummary;
}> {
  const inactiveSellerSub: SellerSubscriptionSummary = {
    active: false,
    plan: null,
    expiresAt: null,
    publishedSlotsUsed: 0,
    publishedSlotsLimit: 0,
    listingDurationDays: 30,
  };
  return {
    accessToken: `mock_access_${payload.role}_${Date.now()}`,
    refreshToken: `mock_refresh_${Date.now()}`,
    role: payload.role,
    subscription: payload.role === "SELLER" ? inactiveSellerSub : undefined,
  };
}
