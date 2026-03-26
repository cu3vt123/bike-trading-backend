/** Query keys — invalidateQueries / useQuery (kat-minh 07–08). */
export const queryKeys = {
  listings: ["listings"] as const,

  listingBuyer: (id: string) => ["listing", "buyer", id] as const,
  listingDetail: (id: string, role: string | null) =>
    ["listing", "detail", id, role ?? "guest"] as const,

  buyer: {
    orders: ["buyer", "orders"] as const,
  },

  auth: {
    me: ["auth", "me"] as const,
  },

  seller: {
    all: ["seller"] as const,
    dashboard: ["seller", "dashboard"] as const,
    orders: ["seller", "orders"] as const,
    ratings: ["seller", "ratings"] as const,
    listing: (id: string) => ["seller", "listing", id] as const,
  },

  inspector: {
    pending: ["inspector", "pending"] as const,
    reInspection: ["inspector", "reInspectionOrders"] as const,
    warehouseRe: ["inspector", "warehouseReInspection"] as const,
  },

  admin: {
    stats: ["admin", "stats"] as const,
    warehouseBundle: ["admin", "warehouseBundle"] as const,
    users: ["admin", "users"] as const,
    listings: ["admin", "listings"] as const,
    reviews: ["admin", "reviews"] as const,
    brands: ["admin", "brands"] as const,
    inspectionQueue: ["admin", "inspectionQueue"] as const,
    sellerSubs: (q: string) => ["admin", "sellerSubs", q] as const,
  },

  order: {
    buyer: (id: string) => ["order", "buyer", id] as const,
  },
} as const;
