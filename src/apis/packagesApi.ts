import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";

export type PackagePlanDto = {
  id: "BASIC" | "VIP";
  name: string;
  maxConcurrentListings: number;
  priceVnd: number;
  description: string;
};

export type PackagesCatalogResponse = {
  listingDurationDays: number;
  paymentProviders: Array<{ id: string; name: string; docsUrl: string; note: string }>;
  plans: PackagePlanDto[];
  demoCallbackHint?: string;
};

export type SubscriptionCheckoutResponse = {
  orderId: string;
  plan: string;
  provider: string;
  amountVnd: number;
  paymentUrl: string;
  /** Nội dung encode mã QR (demo: cùng luồng redirect) */
  qrContent?: string;
  demoReturnUrl: string;
  /** MOCK = link demo cùng origin; VNPAY_SANDBOX = URL cổng sandbox (không rewrite origin) */
  paymentKind?: "MOCK" | "VNPAY_SANDBOX";
  message?: string;
};

export const packagesApi = {
  getCatalog: (): Promise<PackagesCatalogResponse> =>
    apiClient.get(API_PATHS.PACKAGES.LIST).then((r) => r.data?.data ?? r.data),

  checkout: (body: { plan: "BASIC" | "VIP"; provider: "VNPAY" }): Promise<SubscriptionCheckoutResponse> =>
    apiClient
      .post(API_PATHS.SELLER.SUBSCRIPTION_CHECKOUT, body)
      .then((r) => r.data?.data ?? r.data),

  mockCompleteOrder: (
    orderId: string,
  ): Promise<{ subscription: import("@/stores/useSellerSubscriptionStore").SellerSubscriptionSummary }> =>
    apiClient
      .post(API_PATHS.SELLER.SUBSCRIPTION_MOCK_COMPLETE(orderId))
      .then((r) => r.data?.data ?? r.data),

  revokeSelf: (): Promise<{
    subscription: import("@/stores/useSellerSubscriptionStore").SellerSubscriptionSummary;
    revoked: boolean;
  }> =>
    apiClient
      .put(API_PATHS.SELLER.SUBSCRIPTION_REVOKE_SELF)
      .then((r) => r.data?.data ?? r.data),
};
