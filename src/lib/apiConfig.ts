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

  // Buyer (requires BUYER role)
  BUYER: {
    ORDERS: "/buyer/orders",
    ORDER_BY_ID: (id: string) => `/buyer/orders/${id}`,
    ORDER_COMPLETE: (id: string) => `/buyer/orders/${id}/complete`,
    ORDER_CANCEL: (id: string) => `/buyer/orders/${id}/cancel`,
    PAYMENTS_INITIATE: "/buyer/payments/initiate",
    PAYMENTS_CONFIRM: (orderId: string) => `/buyer/payments/confirm/${orderId}`,
    TRANSACTIONS: (orderId: string) => `/buyer/transactions/${orderId}`,
    PROFILE: "/buyer/profile",
  },

  // Seller (requires SELLER role)
  SELLER: {
    DASHBOARD: "/seller/dashboard",
    LISTINGS: "/seller/listings",
    LISTING_BY_ID: (id: string) => `/seller/listings/${id}`,
    LISTING_SUBMIT: (id: string) => `/seller/listings/${id}/submit`,
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
