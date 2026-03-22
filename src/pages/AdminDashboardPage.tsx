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
  ClipboardCheck,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAdminStats,
  fetchAdminUsers,
  hideAdminUser,
  unhideAdminUser,
  fetchAdminListings,
  fetchPendingWarehouseIntakeListings,
  confirmWarehouseIntakeListing,
  fetchOrdersForWarehouseConfirm,
  confirmWarehouseArrival,
  fetchReInspectionOrders,
  submitReInspectionDone,
  hideAdminListing,
  unhideAdminListing,
  fetchAdminBrands,
  createAdminBrand,
  updateAdminBrand,
  deleteAdminBrand,
  fetchSellerSubscriptions,
  revokeSellerSubscriptionApi,
  type AdminStats,
  type AdminBrand,
  type AdminSellerSubscriptionRow,
} from "@/services/adminService";
import { fetchPendingListings } from "@/services/inspectorService";
import { fetchAdminReviews, adminUpdateReview } from "@/services/reviewService";
import type { Listing } from "@/types/shopbike";
import type { Review } from "@/types/review";
import type { AdminUser } from "@/apis/adminApi";

const TABS = [
  { id: "warehouse" as const, key: "admin.tabWarehouse", icon: Package },
  { id: "inspection" as const, key: "admin.tabInspection", icon: ClipboardCheck },
  { id: "users" as const, key: "admin.tabUsers", icon: Users },
  { id: "sellerPackages" as const, key: "admin.tabSellerPackages", icon: Crown },
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
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string; type: "ROAD" | "MTB" | "GRAVEL" | "CITY"; brandCount: number; active: boolean }[]
  >([
    { id: "cat-road", name: "Road / Đua", slug: "road", type: "ROAD", brandCount: 8, active: true },
    { id: "cat-mtb", name: "MTB / Địa hình", slug: "mtb", type: "MTB", brandCount: 6, active: true },
    { id: "cat-gravel", name: "Gravel", slug: "gravel", type: "GRAVEL", brandCount: 3, active: true },
  ]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | "new" | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<{ name: string; slug: string; type: "ROAD" | "MTB" | "GRAVEL" | "CITY"; brandCount: number; active: boolean } | null>(null);
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
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [addingBrand, setAddingBrand] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingBrandName, setEditingBrandName] = useState("");
  const [inspectionListings, setInspectionListings] = useState<Listing[]>([]);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [intakeListings, setIntakeListings] = useState<Listing[]>([]);
  const [confirmingIntakeId, setConfirmingIntakeId] = useState<string | null>(null);
  const [warehousePendingOrders, setWarehousePendingOrders] = useState<
    {
      id: string;
      listingId: string;
      listing?: { brand?: string; model?: string };
      status: string;
      depositPaid?: boolean;
      vnpayPaymentStatus?: string;
    }[]
  >([]);
  const [warehouseCertifiedOrders, setWarehouseCertifiedOrders] = useState<
    { id: string; listingId: string; listing?: { brand?: string; model?: string }; status: string }[]
  >([]);
  const [confirmingShipOrderId, setConfirmingShipOrderId] = useState<string | null>(null);
  const [confirmingWarehouseOrderId, setConfirmingWarehouseOrderId] = useState<string | null>(null);
  const [sellerSubs, setSellerSubs] = useState<AdminSellerSubscriptionRow[]>([]);
  const [sellerSubsLoading, setSellerSubsLoading] = useState(false);
  const [sellerSubsSearch, setSellerSubsSearch] = useState("");
  const [revokingSellerId, setRevokingSellerId] = useState<string | null>(null);

  const loadStats = useCallback(() => {
    fetchAdminStats().then(setStats).catch(() => setStats(null));
  }, []);
  const loadWarehouse = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchPendingWarehouseIntakeListings(),
      fetchOrdersForWarehouseConfirm(),
      fetchReInspectionOrders(),
    ])
      .then(([listings, pendingOrders, reInspectionOrders]) => {
        setIntakeListings(listings);
        setWarehousePendingOrders(pendingOrders);
        setWarehouseCertifiedOrders(reInspectionOrders);
      })
      .catch(() => {
        setIntakeListings([]);
        setWarehousePendingOrders([]);
        setWarehouseCertifiedOrders([]);
      })
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
  const loadBrands = useCallback(() => {
    setBrandsLoading(true);
    fetchAdminBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setBrandsLoading(false));
  }, []);
  const loadInspectionQueue = useCallback(() => {
    setInspectionLoading(true);
    setInspectionError(null);
    fetchPendingListings()
      .then(setInspectionListings)
      .catch((err) => {
        setInspectionListings([]);
        setInspectionError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setInspectionLoading(false));
  }, []);
  const loadSellerSubs = useCallback(async (q: string) => {
    setSellerSubsLoading(true);
    try {
      const rows = await fetchSellerSubscriptions({
        q: q.trim() || undefined,
        limit: 80,
      });
      setSellerSubs(rows);
    } catch {
      setSellerSubs([]);
    } finally {
      setSellerSubsLoading(false);
    }
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
  useEffect(() => {
    if (activeTab === "categories") loadBrands();
  }, [activeTab, loadBrands]);
  useEffect(() => {
    if (activeTab === "inspection") loadInspectionQueue();
  }, [activeTab, loadInspectionQueue]);
  useEffect(() => {
    if (activeTab !== "sellerPackages") return;
    const timer = window.setTimeout(() => {
      void loadSellerSubs(sellerSubsSearch);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [activeTab, sellerSubsSearch, loadSellerSubs]);

  async function handleRevokeSellerPackage(userId: string) {
    if (!window.confirm(t("admin.sellerPackagesRevokeConfirm"))) {
      return;
    }
    setRevokingSellerId(userId);
    try {
      const out = await revokeSellerSubscriptionApi(userId);
      setSellerSubs((prev) =>
        prev.map((row) =>
          row.user.id === userId
            ? { ...row, user: out.user, subscription: out.subscription }
            : row,
        ),
      );
    } finally {
      setRevokingSellerId(null);
    }
  }

  async function handleConfirmWarehouseIntake(listingId: string) {
    setConfirmingIntakeId(listingId);
    try {
      await confirmWarehouseIntakeListing(listingId);
      loadStats();
      loadWarehouse();
    } finally {
      setConfirmingIntakeId(null);
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

  async function handleAddBrand() {
    const name = newBrandName.trim();
    if (!name) return;
    setAddingBrand(true);
    try {
      const created = await createAdminBrand({ name });
      setBrands((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewBrandName("");
    } finally {
      setAddingBrand(false);
    }
  }

  async function handleSaveBrand(id: string) {
    const name = editingBrandName.trim();
    if (!name) return;
    try {
      const updated = await updateAdminBrand(id, { name });
      setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingBrandId(null);
      setEditingBrandName("");
    } catch {
      // ignore
    }
  }

  async function handleDeleteBrand(id: string) {
    if (!window.confirm(t("admin.brandsDeleteConfirm"))) return;
    try {
      await deleteAdminBrand(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch {
      // ignore
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
              <div className="text-2xl font-bold text-primary">
                {(stats.ordersPendingWarehouse ?? 0) + (stats.listingsPendingWarehouseIntake ?? 0)}
              </div>
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
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2 w-fit"
                  onClick={() => loadWarehouse()}
                  disabled={loading}
                >
                  {loading ? t("admin.inspectionRefreshing") : t("admin.inspectionRefresh")}
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : intakeListings.length === 0 && warehousePendingOrders.length === 0 && warehouseCertifiedOrders.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t("admin.noWarehouseItems")}
                  </p>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const pendingVerify = intakeListings.filter((l) => l.state === "AT_WAREHOUSE_PENDING_VERIFY");
                      const pendingInspector = intakeListings.filter((l) => l.state === "AT_WAREHOUSE_PENDING_RE_INSPECTION");
                      return (
                        <>
                          {pendingVerify.length > 0 && (
                            <div>
                              <h4 className="mb-2 text-sm font-semibold text-foreground">
                                {t("admin.warehouseSectionAdminConfirm")}
                              </h4>
                              <div className="space-y-3">
                                {pendingVerify.map((listing) => (
                                  <div
                                    key={`listing-${listing.id}`}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-semibold text-foreground">
                                        {listing.title || `${listing.brand ?? ""} ${listing.model ?? ""}`.trim() || listing.id}
                                      </div>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {listing.brand}
                                        {listing.model ? ` · ${listing.model}` : ""} · ID: {listing.id} · {formatMoney(listing.price ?? 0)}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleConfirmWarehouseIntake(listing.id)}
                                      disabled={confirmingIntakeId === listing.id}
                                    >
                                      {confirmingIntakeId === listing.id
                                        ? t("admin.confirmingWarehouseIntake")
                                        : t("admin.confirmWarehouseIntake")}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {pendingVerify.length === 0 && pendingInspector.length > 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                              {t("admin.warehouseMovedToInspector", { count: pendingInspector.length })}
                            </p>
                          )}
                          {warehousePendingOrders.length > 0 && (
                            <div className="mt-6">
                              <h4 className="mb-2 text-sm font-semibold text-foreground">
                                {t("admin.warehouseSectionOrdersPendingConfirm")}
                              </h4>
                              <p className="mb-3 text-xs text-muted-foreground">
                                {t("admin.warehouseSectionOrdersPendingConfirmDesc")}
                              </p>
                              <div className="space-y-3">
                                {warehousePendingOrders.map((order) => (
                                  <div
                                    key={`pending-${order.id}`}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-semibold text-foreground">
                                        {order.listing?.brand} {order.listing?.model ?? order.listingId}
                                      </div>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {t("admin.order")} {order.id}
                                        {(order.depositPaid || order.vnpayPaymentStatus === "PAID")
                                          ? ` · ${t("admin.depositPaid")}`
                                          : ""}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={async () => {
                                        setConfirmingWarehouseOrderId(order.id);
                                        try {
                                          await confirmWarehouseArrival(order.id);
                                          setWarehousePendingOrders((prev) => prev.filter((o) => o.id !== order.id));
                                          loadStats();
                                          loadWarehouse();
                                        } finally {
                                          setConfirmingWarehouseOrderId(null);
                                        }
                                      }}
                                      disabled={
                                        confirmingWarehouseOrderId === order.id ||
                                        (!(order.depositPaid || order.vnpayPaymentStatus === "PAID"))
                                      }
                                    >
                                      {confirmingWarehouseOrderId === order.id
                                        ? t("admin.confirming")
                                        : t("admin.warehouseConfirmStartShip")}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {warehouseCertifiedOrders.length > 0 && (
                            <div className="mt-6">
                              <h4 className="mb-2 text-sm font-semibold text-foreground">
                                {t("admin.warehouseSectionStartShipToBuyer")}
                              </h4>
                              <p className="mb-3 text-xs text-muted-foreground">
                                {t("admin.warehouseSectionStartShipDesc")}
                              </p>
                              <div className="space-y-3">
                                {warehouseCertifiedOrders.map((order) => (
                                  <div
                                    key={`order-${order.id}`}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-semibold text-foreground">
                                        {order.listing?.brand} {order.listing?.model ?? order.listingId}
                                      </div>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {t("admin.order")} {order.id}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={async () => {
                                        setConfirmingShipOrderId(order.id);
                                        try {
                                          await submitReInspectionDone(order.id);
                                          setWarehouseCertifiedOrders((prev) => prev.filter((o) => o.id !== order.id));
                                          loadStats();
                                        } finally {
                                          setConfirmingShipOrderId(null);
                                        }
                                      }}
                                      disabled={confirmingShipOrderId === order.id}
                                    >
                                      {confirmingShipOrderId === order.id
                                        ? t("admin.confirming")
                                        : t("admin.warehouseConfirmStartShip")}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "inspection" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  {t("admin.inspectionTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("admin.inspectionDesc")}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild size="sm">
                    <Link to="/inspector">{t("admin.goToInspectorPage")}</Link>
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => loadInspectionQueue()} disabled={inspectionLoading}>
                    {inspectionLoading ? t("admin.inspectionRefreshing") : t("admin.inspectionRefresh")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {inspectionError ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {inspectionError}
                  </p>
                ) : null}
                {inspectionLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : inspectionListings.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">{t("admin.inspectionEmpty")}</p>
                ) : (
                  <ul className="space-y-3">
                    {inspectionListings.map((listing) => (
                      <li
                        key={listing.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground">
                            {listing.title || `${listing.brand ?? ""} ${listing.model ?? ""}`.trim() || listing.id}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {listing.brand}
                            {listing.model ? ` · ${listing.model}` : ""} · {listing.state ?? "—"} · {formatMoney(listing.price ?? 0)} · ID:{" "}
                            {listing.id}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="secondary">
                          <Link to="/inspector">{t("admin.inspectionOpenReview")}</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
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

          {activeTab === "sellerPackages" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  {t("admin.sellerPackagesTitle")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("admin.sellerPackagesDesc")}</p>
                <div className="mt-4 flex max-w-md flex-wrap gap-2">
                  <Input
                    type="search"
                    placeholder={t("admin.sellerPackagesSearchPlaceholder")}
                    value={sellerSubsSearch}
                    onChange={(e) => setSellerSubsSearch(e.target.value)}
                    className="min-w-[200px] flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void loadSellerSubs(sellerSubsSearch)}
                    disabled={sellerSubsLoading}
                  >
                    {t("admin.sellerPackagesRefresh")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sellerSubsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : sellerSubs.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t("admin.sellerPackagesEmpty")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sellerSubs.map((row) => {
                      const sub = row.subscription;
                      const hasActivePlan = Boolean(sub.active && sub.plan);
                      return (
                        <div
                          key={row.user.id}
                          className="rounded-xl border border-border bg-card p-4 text-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground">
                                {row.user.displayName || row.user.email}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">{row.user.email}</div>
                              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium text-foreground">
                                    {t("admin.sellerPackagesPlan")}:{" "}
                                  </span>
                                  {sub.plan ?? "—"}{" "}
                                  {hasActivePlan ? (
                                    <span className="text-primary">({t("admin.sellerPackagesActive")})</span>
                                  ) : (
                                    <span>({t("admin.sellerPackagesInactive")})</span>
                                  )}
                                </div>
                                {sub.expiresAt && (
                                  <div>
                                    <span className="font-medium text-foreground">
                                      {t("admin.sellerPackagesExpires")}:{" "}
                                    </span>
                                    {new Date(sub.expiresAt).toLocaleString()}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium text-foreground">
                                    {t("admin.sellerPackagesSlots")}:{" "}
                                  </span>
                                  {sub.publishedSlotsUsed}/{sub.publishedSlotsLimit}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={revokingSellerId === row.user.id}
                              onClick={() => void handleRevokeSellerPackage(row.user.id)}
                            >
                              {revokingSellerId === row.user.id
                                ? t("admin.sellerPackagesRevoking")
                                : t("admin.sellerPackagesRevoke")}
                            </Button>
                          </div>
                          {row.recentPackageOrders.length > 0 && (
                            <div className="mt-3 border-t border-border pt-3">
                              <div className="mb-2 text-xs font-semibold text-foreground">
                                {t("admin.sellerPackagesRecentOrders")}
                              </div>
                              <ul className="space-y-1 font-mono text-[11px] text-muted-foreground">
                                {row.recentPackageOrders.map((o) => (
                                  <li key={o.id}>
                                    {o.id.slice(-8)} · {o.plan} · {formatMoney(o.amountVnd)} · {o.status}
                                    {o.createdAt ? ` · ${new Date(o.createdAt).toLocaleDateString()}` : ""}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
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

                <div className="mt-6 rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">{t("admin.brandsTitle")}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t("admin.brandsDesc")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder={t("admin.brandsAddPlaceholder")}
                      className="flex-1 min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleAddBrand()}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddBrand}
                      disabled={!newBrandName.trim() || addingBrand}
                    >
                      {addingBrand ? t("admin.brandsAdding") : t("admin.brandsAdd")}
                    </Button>
                  </div>
                  {brandsLoading ? (
                    <div className="mt-3 flex justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : brands.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">{t("admin.brandsEmpty")}</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {brands.filter((b) => b.active !== false).map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"
                        >
                          {editingBrandId === b.id ? (
                            <>
                              <input
                                type="text"
                                value={editingBrandName}
                                onChange={(e) => setEditingBrandName(e.target.value)}
                                className="w-32 rounded border border-input bg-background px-2 py-1 text-xs"
                                autoFocus
                              />
                              <Button size="xs" variant="outline" onClick={() => handleSaveBrand(b.id)}>
                                {t("admin.categoriesSave")}
                              </Button>
                              <Button size="xs" variant="ghost" onClick={() => { setEditingBrandId(null); setEditingBrandName(""); }}>
                                {t("admin.categoriesCancel")}
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="font-medium">{b.name}</span>
                              <Button size="xs" variant="ghost" onClick={() => { setEditingBrandId(b.id); setEditingBrandName(b.name); }}>
                                {t("admin.brandsEdit")}
                              </Button>
                              <Button size="xs" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteBrand(b.id)}>
                                {t("admin.categoriesDelete")}
                              </Button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
