import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  FileCheck,
  Tags,
  CreditCard,
  BarChart3,
  Package,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchOrdersForWarehouseConfirm,
  confirmWarehouseArrival,
  fetchAdminStats,
  fetchAdminUsers,
  hideAdminUser,
  unhideAdminUser,
  fetchAdminListings,
  hideAdminListing,
  unhideAdminListing,
  type AdminStats,
} from "@/services/adminService";
import { fetchAdminReviews, adminUpdateReview } from "@/services/reviewService";
import type { Order } from "@/types/order";
import type { Listing } from "@/types/shopbike";
import type { Review } from "@/types/review";
import type { AdminUser } from "@/apis/adminApi";

const TABS = [
  { id: "warehouse" as const, key: "admin.tabWarehouse", icon: Package },
  { id: "users" as const, key: "admin.tabUsers", icon: Users },
  { id: "listings" as const, key: "admin.tabListings", icon: FileCheck },
  { id: "reviews" as const, key: "admin.tabReviews", icon: Star },
  { id: "categories" as const, key: "admin.tabCategories", icon: Tags },
  { id: "transactions" as const, key: "admin.tabTransactions", icon: CreditCard },
  { id: "stats" as const, key: "admin.tabStats", icon: BarChart3 },
] as const;

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("warehouse");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [warehouseOrders, setWarehouseOrders] = useState<(Order & { listing?: { brand?: string; model?: string } })[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string; type: "ROAD" | "MTB" | "GRAVEL" | "CITY"; brandCount: number; active: boolean }[]
  >([
    { id: "cat-road", name: "Road / Đua", slug: "road", type: "ROAD", brandCount: 8, active: true },
    { id: "cat-mtb", name: "MTB / Địa hình", slug: "mtb", type: "MTB", brandCount: 6, active: true },
    { id: "cat-gravel", name: "Gravel", slug: "gravel", type: "GRAVEL", brandCount: 3, active: true },
  ]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | "new" | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<{ name: string; slug: string; type: "ROAD" | "MTB" | "GRAVEL" | "CITY"; brandCount: number; active: boolean } | null>(null);
  const [platformFee, setPlatformFee] = useState<number>(5);
  const [inspectionFee, setInspectionFee] = useState<number>(150_000);
  const [transactions] = useState<
    { id: string; orderId: string; buyer: string; seller: string; amount: number; fee: number; status: string; createdAt: string }[]
  >([
    {
      id: "TX-101",
      orderId: "ORD-101",
      buyer: "buyer_01",
      seller: "seller_01",
      amount: 95_000_000,
      fee: 4_750_000,
      status: "COMPLETED",
      createdAt: "2026-03-10T09:15:00Z",
    },
    {
      id: "TX-102",
      orderId: "ORD-102",
      buyer: "buyer_02",
      seller: "seller_02",
      amount: 62_000_000,
      fee: 3_100_000,
      status: "COMPLETED",
      createdAt: "2026-03-12T14:30:00Z",
    },
  ]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminListings, setAdminListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [hidingUserId, setHidingUserId] = useState<string | null>(null);
  const [unhidingUserId, setUnhidingUserId] = useState<string | null>(null);
  const [hidingListingId, setHidingListingId] = useState<string | null>(null);
  const [unhidingListingId, setUnhidingListingId] = useState<string | null>(null);

  const loadStats = useCallback(() => {
    fetchAdminStats().then(setStats).catch(() => setStats(null));
  }, []);
  const loadWarehouse = useCallback(() => {
    setLoading(true);
    fetchOrdersForWarehouseConfirm()
      .then(setWarehouseOrders)
      .catch(() => setWarehouseOrders([]))
      .finally(() => setLoading(false));
  }, []);
  const loadAdminUsers = useCallback(() => {
    setUsersLoading(true);
    fetchAdminUsers()
      .then(setAdminUsers)
      .catch(() => setAdminUsers([]))
      .finally(() => setUsersLoading(false));
  }, []);
  const loadAdminListings = useCallback(() => {
    setListingsLoading(true);
    fetchAdminListings()
      .then(setAdminListings)
      .catch(() => setAdminListings([]))
      .finally(() => setListingsLoading(false));
  }, []);
  const loadReviews = useCallback(() => {
    fetchAdminReviews()
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);
  useEffect(() => {
    if (activeTab === "warehouse") loadWarehouse();
  }, [activeTab, loadWarehouse]);
  useEffect(() => {
    if (activeTab === "users") loadAdminUsers();
  }, [activeTab, loadAdminUsers]);
  useEffect(() => {
    if (activeTab === "listings") loadAdminListings();
  }, [activeTab, loadAdminListings]);
  useEffect(() => {
    if (activeTab === "reviews") loadReviews();
  }, [activeTab, loadReviews]);

  async function handleConfirmWarehouse(orderId: string) {
    setConfirmingId(orderId);
    try {
      const updated = await confirmWarehouseArrival(orderId);
      setWarehouseOrders((prev) => prev.filter((o) => o.id !== updated.id));
      loadStats();
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleHideUser(id: string) {
    setHidingUserId(id);
    try {
      const updated = await hideAdminUser(id);
      setAdminUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      loadStats();
    } finally {
      setHidingUserId(null);
    }
  }

  async function handleUnhideUser(id: string) {
    setUnhidingUserId(id);
    try {
      const updated = await unhideAdminUser(id);
      setAdminUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      loadStats();
    } finally {
      setUnhidingUserId(null);
    }
  }

  async function handleHideListing(id: string) {
    setHidingListingId(id);
    try {
      const updated = await hideAdminListing(id);
      setAdminListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      loadStats();
    } finally {
      setHidingListingId(null);
    }
  }

  async function handleUnhideListing(id: string) {
    setUnhidingListingId(id);
    try {
      const updated = await unhideAdminListing(id);
      setAdminListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      loadStats();
    } finally {
      setUnhidingListingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("admin.subtitle")}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/">{t("admin.goHome")}</Link>
        </Button>
      </div>

      {stats && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">{t("admin.totalUsers")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{stats.totalListings}</div>
              <div className="text-xs text-muted-foreground">{t("admin.totalListings")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{stats.ordersPendingWarehouse}</div>
              <div className="text-xs text-muted-foreground">{t("admin.pendingWarehouse")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{stats.ordersReInspection}</div>
              <div className="text-xs text-muted-foreground">{t("admin.reInspection")}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 flex-wrap gap-1 lg:w-56 lg:flex-col">
          {TABS.map(({ id, key, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(key)}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {activeTab === "warehouse" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("admin.warehouseTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("admin.warehouseDesc")}
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : warehouseOrders.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t("admin.noWarehouseOrders")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {warehouseOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                      >
                        <div>
                          <div className="font-semibold text-foreground">
                            {order.listing?.brand} {order.listing?.model ?? order.listingId}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Đơn {order.id} · {t(`order.status${order.status}` as "order.statusRESERVED") ?? order.status} · {formatMoney(order.totalPrice)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmWarehouse(order.id)}
                          disabled={confirmingId === order.id}
                        >
                          {confirmingId === order.id ? "Đang xác nhận..." : "Xác nhận xe đã tới kho"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("admin.usersTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("admin.usersDesc")}
                </p>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : adminUsers.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">{t("admin.noUsers")}</p>
                ) : (
                  <div className="space-y-3">
                    {adminUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground">{u.displayName || u.email}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {u.email} · {u.role} · {u.isHidden ? t("admin.hidden") : t("admin.active")}
                          </div>
                        </div>
                        {u.isHidden ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnhideUser(u.id)}
                            disabled={unhidingUserId === u.id}
                          >
                            {unhidingUserId === u.id ? t("admin.unhiding") : t("admin.unhideUser")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleHideUser(u.id)}
                            disabled={hidingUserId === u.id}
                          >
                            {hidingUserId === u.id ? t("admin.hiding") : t("admin.hideUser")}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "listings" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  {t("admin.listingsTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("admin.listingsDesc")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {listingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : adminListings.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t("admin.noListings")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {adminListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground">
                            {listing.title || `${listing.brand} ${listing.model ?? ""}`}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {listing.brand}
                            {listing.model ? ` · ${listing.model}` : ""} · ID: {listing.id} ·{" "}
                            {listing.state ?? "N/A"} · {formatMoney(listing.price ?? 0)} · {listing.isHidden ? t("admin.hidden") : t("admin.visible")}
                          </div>
                        </div>
                        {listing.isHidden ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnhideListing(listing.id)}
                            disabled={unhidingListingId === listing.id}
                          >
                            {unhidingListingId === listing.id ? t("admin.unhiding") : t("admin.unhideListing")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleHideListing(listing.id)}
                            disabled={hidingListingId === listing.id}
                          >
                            {hidingListingId === listing.id ? t("admin.hiding") : t("admin.hideListing")}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "reviews" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {t("admin.reviewsTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("admin.reviewsDesc")}
                </p>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t("admin.noReviews")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-foreground">
                              {t("admin.order")} {r.orderId} · {t("admin.seller")} {r.sellerId}
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              Listing {r.listingId} · {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground mr-1">{t("admin.rating")}:</span>
                            {[1, 2, 3, 4, 5].map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={async () => {
                                  try {
                                    const updated = await adminUpdateReview(r.id, { rating: v, status: "EDITED" });
                                    setReviews((prev) =>
                                      prev.map((x) => (x.id === updated.id ? updated : x)),
                                    );
                                  } catch {
                                    // ignore
                                  }
                                }}
                                className={`text-lg ${
                                  v <= r.rating ? "text-primary" : "text-muted-foreground"
                                }`}
                                aria-label={t("admin.setRating", { n: v })}
                              >
                                ★
                              </button>
                            ))}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {r.rating}/5
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {r.comment || t("admin.noComment")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "categories" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  {t("admin.categoriesTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("admin.categoriesDesc")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex justify-between gap-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingCategoryId("new");
                      setCategoryDraft({
                        name: "",
                        slug: "",
                        type: "ROAD",
                        brandCount: 0,
                        active: true,
                      });
                    }}
                  >
                    {t("admin.categoriesAdd")}
                  </Button>
                </div>
                {categories.length === 0 ? (
                  <p className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                    {t("admin.categoriesPlaceholder")}
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">{t("admin.categoriesName")}</th>
                          <th className="px-3 py-2 text-left font-semibold">{t("admin.categoriesSlug")}</th>
                          <th className="px-3 py-2 text-left font-semibold">{t("admin.categoriesType")}</th>
                          <th className="px-3 py-2 text-right font-semibold">{t("admin.categoriesBrandCount")}</th>
                          <th className="px-3 py-2 text-center font-semibold">{t("admin.categoriesStatus")}</th>
                          <th className="px-3 py-2 text-right font-semibold"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(editingCategoryId === "new" && categoryDraft ? [{ id: "new", ...categoryDraft }, ...categories] : categories).map(
                          (c) => {
                            const isDraft = c.id === "new";
                            const isEditing = editingCategoryId === c.id;
                            const draft = isEditing || isDraft ? categoryDraft ?? { ...c } : c;
                            return (
                              <tr key={c.id} className="border-t border-border">
                                <td className="px-3 py-2 align-middle">
                                  {isEditing || isDraft ? (
                                    <input
                                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                      value={draft?.name ?? ""}
                                      onChange={(e) =>
                                        setCategoryDraft((prev) => ({
                                          ...(prev ?? { ...c }),
                                          name: e.target.value,
                                          slug:
                                            prev?.slug && prev.slug.length > 0
                                              ? prev.slug
                                              : e.target.value
                                                  .toLowerCase()
                                                  .normalize("NFD")
                                                  .replace(/[\u0300-\u036f]/g, "")
                                                  .replace(/[^a-z0-9]+/g, "-")
                                                  .replace(/^-+|-+$/g, ""),
                                        }))
                                      }
                                    />
                                  ) : (
                                    <span>{c.name}</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 align-middle">
                                  {isEditing || isDraft ? (
                                    <input
                                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                      value={draft?.slug ?? ""}
                                      onChange={(e) =>
                                        setCategoryDraft((prev) => ({
                                          ...(prev ?? { ...c }),
                                          slug: e.target.value,
                                        }))
                                      }
                                    />
                                  ) : (
                                    <span className="text-xs text-muted-foreground">{c.slug}</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 align-middle">
                                  {isEditing || isDraft ? (
                                    <select
                                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                      value={draft?.type ?? "ROAD"}
                                      onChange={(e) =>
                                        setCategoryDraft((prev) => ({
                                          ...(prev ?? { ...c }),
                                          type: e.target.value as "ROAD" | "MTB" | "GRAVEL" | "CITY",
                                        }))
                                      }
                                    >
                                      <option value="ROAD">{t("admin.categoriesTypeRoad")}</option>
                                      <option value="MTB">{t("admin.categoriesTypeMtb")}</option>
                                      <option value="GRAVEL">{t("admin.categoriesTypeGravel")}</option>
                                      <option value="CITY">{t("admin.categoriesTypeCity")}</option>
                                    </select>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      {c.type === "ROAD"
                                        ? t("admin.categoriesTypeRoad")
                                        : c.type === "MTB"
                                          ? t("admin.categoriesTypeMtb")
                                          : c.type === "GRAVEL"
                                            ? t("admin.categoriesTypeGravel")
                                            : t("admin.categoriesTypeCity")}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right align-middle">
                                  {isEditing || isDraft ? (
                                    <input
                                      type="number"
                                      min={0}
                                      className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs text-right"
                                      value={draft?.brandCount ?? 0}
                                      onChange={(e) =>
                                        setCategoryDraft((prev) => ({
                                          ...(prev ?? { ...c }),
                                          brandCount: Number(e.target.value) || 0,
                                        }))
                                      }
                                    />
                                  ) : (
                                    <span>{c.brandCount}</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center align-middle">
                                  {isEditing || isDraft ? (
                                    <button
                                      type="button"
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                        draft?.active
                                          ? "bg-emerald-500/10 text-emerald-500"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                      onClick={() =>
                                        setCategoryDraft((prev) => ({
                                          ...(prev ?? { ...c }),
                                          active: !prev?.active,
                                        }))
                                      }
                                    >
                                      {draft?.active ? t("admin.categoriesActive") : t("admin.categoriesInactive")}
                                    </button>
                                  ) : (
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                        c.active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {c.active ? t("admin.categoriesActive") : t("admin.categoriesInactive")}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right align-middle">
                                  {isEditing || isDraft ? (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => {
                                          if (!categoryDraft) {
                                            setEditingCategoryId(null);
                                            return;
                                          }
                                          if (isDraft) {
                                            setCategories((prev) => [
                                              {
                                                id: `cat-${Date.now()}`,
                                                ...categoryDraft,
                                              },
                                              ...prev,
                                            ]);
                                          } else {
                                            setCategories((prev) =>
                                              prev.map((item) => (item.id === c.id ? { ...item, ...categoryDraft } : item)),
                                            );
                                          }
                                          setEditingCategoryId(null);
                                          setCategoryDraft(null);
                                        }}
                                      >
                                        {t("admin.categoriesSave")}
                                      </Button>
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingCategoryId(null);
                                          setCategoryDraft(null);
                                        }}
                                      >
                                        {t("admin.categoriesCancel")}
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingCategoryId(c.id);
                                          setCategoryDraft({ ...c });
                                        }}
                                      >
                                        {t("admin.categoriesSave")}
                                      </Button>
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => {
                                          if (window.confirm(t("admin.categoriesDeleteConfirm"))) {
                                            setCategories((prev) => prev.filter((item) => item.id !== c.id));
                                          }
                                        }}
                                      >
                                        {t("admin.categoriesDelete")}
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "transactions" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t("admin.transactionsTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("admin.transactionsDesc")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      {t("admin.transactionsFeesTitle")}
                    </h3>
                    <div className="mt-3 space-y-3 text-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <label className="text-muted-foreground sm:w-1/2">
                          {t("admin.transactionsPlatformFee")}
                        </label>
                        <div className="flex items-center gap-2 sm:w-1/2">
                          <input
                            type="number"
                            min={0}
                            max={30}
                            value={platformFee}
                            onChange={(e) => setPlatformFee(Number(e.target.value) || 0)}
                            className="w-24 rounded-md border border-input bg-background px-2 py-1 text-right text-sm"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <label className="text-muted-foreground sm:w-1/2">
                          {t("admin.transactionsInspectionFee")}
                        </label>
                        <div className="flex items-center gap-2 sm:w-1/2">
                          <input
                            type="number"
                            min={0}
                            step={50000}
                            value={inspectionFee}
                            onChange={(e) => setInspectionFee(Number(e.target.value) || 0)}
                            className="w-32 rounded-md border border-input bg-background px-2 py-1 text-right text-sm"
                          />
                          <span className="text-xs text-muted-foreground">VND</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        {t("admin.transactionsHistoryTitle")}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {transactions.length} {t("admin.transactionsOrder")}
                      </span>
                    </div>
                    {transactions.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        {t("admin.transactionsPlaceholder")}
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs sm:text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold">{t("admin.transactionsOrder")}</th>
                              <th className="px-3 py-2 text-left font-semibold">{t("admin.transactionsBuyer")}</th>
                              <th className="px-3 py-2 text-left font-semibold">{t("admin.transactionsSeller")}</th>
                              <th className="px-3 py-2 text-right font-semibold">{t("admin.transactionsAmount")}</th>
                              <th className="px-3 py-2 text-right font-semibold">{t("admin.transactionsFee")}</th>
                              <th className="px-3 py-2 text-center font-semibold">{t("admin.transactionsStatus")}</th>
                              <th className="px-3 py-2 text-right font-semibold">{t("admin.transactionsDate")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="border-t border-border">
                                <td className="px-3 py-2 align-middle">
                                  <div className="font-medium text-foreground">{tx.orderId}</div>
                                  <div className="text-[11px] text-muted-foreground">{tx.id}</div>
                                </td>
                                <td className="px-3 py-2 align-middle text-xs text-muted-foreground">
                                  {tx.buyer}
                                </td>
                                <td className="px-3 py-2 align-middle text-xs text-muted-foreground">
                                  {tx.seller}
                                </td>
                                <td className="px-3 py-2 align-middle text-right">
                                  {formatMoney(tx.amount)}
                                </td>
                                <td className="px-3 py-2 align-middle text-right">
                                  {formatMoney(tx.fee)}
                                </td>
                                <td className="px-3 py-2 align-middle text-center">
                                  <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 align-middle text-right text-xs text-muted-foreground">
                                  {new Date(tx.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "stats" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t("admin.statsTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("admin.statsDesc")}
                </p>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-lg font-semibold text-foreground">{stats.totalBuyers}</div>
                      <div className="text-xs text-muted-foreground">{t("admin.buyer")}</div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-lg font-semibold text-foreground">{stats.totalSellers}</div>
                      <div className="text-xs text-muted-foreground">{t("admin.seller")}</div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-lg font-semibold text-foreground">{stats.totalOrders}</div>
                      <div className="text-xs text-muted-foreground">{t("admin.totalOrders")}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
