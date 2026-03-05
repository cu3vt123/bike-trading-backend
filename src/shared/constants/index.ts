/**
 * API endpoints & constants – khớp BE2
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  BIKES: {
    LIST: "/bikes",
    BY_ID: (id: string) => `/bikes/${id}`,
  },
  BUYER: {
    ORDERS: "/buyer/orders",
    ORDER_BY_ID: (id: string) => `/buyer/orders/${id}`,
    PROFILE: "/buyer/profile",
  },
  SELLER: {
    DASHBOARD: "/seller/dashboard",
    LISTINGS: "/seller/listings",
    LISTING_BY_ID: (id: string) => `/seller/listings/${id}`,
  },
  INSPECTOR: {
    PENDING_LISTINGS: "/inspector/pending-listings",
    LISTING_BY_ID: (id: string) => `/inspector/listings/${id}`,
  },
} as const;
