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
  inspectionAddOn: {
    id: string;
    name: string;
    priceVnd: number;
    description: string;
  };
  demoCallbackHint?: string;
};

export type SubscriptionCheckoutResponse = {
  orderId: string;
  plan: string;
  provider: string;
  amountVnd: number;
  paymentUrl: string;
  demoReturnUrl: string;
  message?: string;
};

export const packagesApi = {
  getCatalog: (): Promise<PackagesCatalogResponse> =>
    apiClient.get(API_PATHS.PACKAGES.LIST).then((r) => r.data?.data ?? r.data),

  checkout: (body: {
    plan: "BASIC" | "VIP";
    provider: "POSTPAY" | "VNPAY";
  }): Promise<SubscriptionCheckoutResponse> =>
    apiClient
      .post(API_PATHS.SELLER.SUBSCRIPTION_CHECKOUT, body)
      .then((r) => r.data?.data ?? r.data),

  mockCompleteOrder: (
    orderId: string,
  ): Promise<{ subscription: import("@/stores/useSellerSubscriptionStore").SellerSubscriptionSummary }> =>
    apiClient
      .post(API_PATHS.SELLER.SUBSCRIPTION_MOCK_COMPLETE(orderId))
      .then((r) => r.data?.data ?? r.data),
};
