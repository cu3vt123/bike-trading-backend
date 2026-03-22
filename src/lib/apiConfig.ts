/**
 * API configuration – backend connection & endpoints.
 * Update baseURL when backend URL changes.
 * When Swagger is available: align paths with backend spec.
 */

/** Base URL for API (no trailing slash). From env or fallback. */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8081/api";

/** Request timeout (ms) */
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 15000;

/** Use mock data instead of real API (for dev when backend is unavailable) */
export const USE_MOCK_API =
  (import.meta.env.VITE_USE_MOCK_API as string) === "true";

/**
 * API path constants – aligns with current backend.
 * When Swagger spec arrives, update these to match backend routes.
 */
export const API_PATHS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // Bikes (public marketplace)
  BIKES: {
    LIST: "/bikes",
    BY_ID: (id: string) => `/bikes/${id}`,
  },

  // Gói đăng tin (catalog public)
  PACKAGES: {
    LIST: "/packages",
  },

  // Brands (public list for seller form, homepage)
  BRANDS: {
    LIST: "/brands",
  },

  // Buyer (requires BUYER role)
  BUYER: {
    ORDERS: "/buyer/orders",
    ORDER_BY_ID: (id: string) => `/buyer/orders/${id}`,
    ORDER_COMPLETE: (id: string) => `/buyer/orders/${id}/complete`,
    ORDER_CANCEL: (id: string) => `/buyer/orders/${id}/cancel`,
    PAYMENTS_INITIATE: "/buyer/payments/initiate",
    ORDERS_VNPAY_CHECKOUT: "/buyer/orders/vnpay-checkout",
    ORDER_VNPAY_RESUME: (id: string) => `/buyer/orders/${id}/vnpay-resume`,
    ORDER_VNPAY_PAY_BALANCE: (id: string) => `/buyer/orders/${id}/vnpay-pay-balance`,
    PAYMENTS_CONFIRM: (orderId: string) => `/buyer/payments/confirm/${orderId}`,
    TRANSACTIONS: (orderId: string) => `/buyer/transactions/${orderId}`,
    PROFILE: "/buyer/profile",
  },

  // Seller (requires SELLER role)
  SELLER: {
    DASHBOARD: "/seller/dashboard",
    ORDERS: "/seller/orders",
    ORDER_SHIP_TO_BUYER: (orderId: string) => `/seller/orders/${orderId}/ship-to-buyer`,
    RATINGS: "/seller/ratings",
    LISTINGS: "/seller/listings",
    LISTING_BY_ID: (id: string) => `/seller/listings/${id}`,
    LISTING_PUBLISH: (id: string) => `/seller/listings/${id}/publish`,
    LISTING_SUBMIT: (id: string) => `/seller/listings/${id}/submit`,
    LISTING_MARK_SHIPPED_TO_WAREHOUSE: (id: string) =>
      `/seller/listings/${id}/mark-shipped-to-warehouse`,
    SUBSCRIPTION_CHECKOUT: "/seller/subscription/checkout",
    SUBSCRIPTION_MOCK_COMPLETE: (orderId: string) =>
      `/seller/subscription/orders/${orderId}/mock-complete`,
  },

  // Inspector (requires INSPECTOR/ADMIN role)
  INSPECTOR: {
    PENDING_LISTINGS: "/inspector/pending-listings",
    LISTING_BY_ID: (id: string) => `/inspector/listings/${id}`,
    LISTING_APPROVE: (id: string) => `/inspector/listings/${id}/approve`,
    LISTING_REJECT: (id: string) => `/inspector/listings/${id}/reject`,
    LISTING_NEED_UPDATE: (id: string) => `/inspector/listings/${id}/need-update`,
  },

  // Admin (requires ADMIN role)
  ADMIN: {
    WAREHOUSE_ORDERS: "/admin/orders/warehouse-pending",
    CONFIRM_WAREHOUSE: (id: string) => `/admin/orders/${id}/confirm-warehouse`,
    RE_INSPECTION_ORDERS: "/admin/orders/re-inspection",
    RE_INSPECTION_DONE: (id: string) => `/admin/orders/${id}/re-inspection-done`,
    STATS: "/admin/dashboard/stats",
    USERS: "/admin/users",
    SELLER_SUBSCRIPTIONS: "/admin/seller-subscriptions",
    REVOKE_SELLER_SUBSCRIPTION: (id: string) => `/admin/users/${id}/revoke-subscription`,
    HIDE_USER: (id: string) => `/admin/users/${id}/hide`,
    UNHIDE_USER: (id: string) => `/admin/users/${id}/unhide`,
    LISTINGS_PENDING_WAREHOUSE_INTAKE: "/admin/listings/pending-warehouse-intake",
    CONFIRM_WAREHOUSE_INTAKE: (id: string) => `/admin/listings/${id}/confirm-warehouse-intake`,
    CONFIRM_WAREHOUSE_RE_INSPECTION: (id: string) => `/admin/listings/${id}/confirm-warehouse-re-inspection`,
    LISTINGS: "/admin/listings",
    HIDE_LISTING: (id: string) => `/admin/listings/${id}/hide`,
    UNHIDE_LISTING: (id: string) => `/admin/listings/${id}/unhide`,
    BRANDS: "/admin/brands",
    BRAND_BY_ID: (id: string) => `/admin/brands/${id}`,
  },

  // Reviews (buyer + admin moderation)
  REVIEWS: {
    CREATE_FOR_ORDER: (orderId: string) => `/buyer/orders/${orderId}/review`,
    MY_REVIEWS: "/buyer/reviews",
    ADMIN_LIST: "/admin/reviews",
    ADMIN_UPDATE: (id: string) => `/admin/reviews/${id}`,
  },

  // Health check
  HEALTH: "/health",

} as const;
