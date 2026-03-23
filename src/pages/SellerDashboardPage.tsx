import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bike, Package, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authApi } from "@/apis/authApi";
import {
  useSellerSubscriptionStore,
  normalizeSubscriptionPayload,
} from "@/stores/useSellerSubscriptionStore";
import { USE_MOCK_API } from "@/lib/apiConfig";
import type { Listing, ListingState } from "@/types/shopbike";
import type { Order } from "@/types/order";
import {
  fetchSellerDashboard,
  fetchSellerDashboardOrders,
  fetchSellerRatings,
  shipOrderToBuyer,
  markListingShippedToWarehouse,
  syncSellerOrderNotifications,
} from "@/services/sellerService";
import type { SellerRatingsSummary } from "@/apis/sellerApi";

function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

const LISTING_STATE_KEYS: Partial<Record<ListingState, string>> = {
  DRAFT: "seller.stateDraft",
  PENDING_INSPECTION: "seller.statePendingReview",
  AWAITING_WAREHOUSE: "seller.stateAwaitingWarehouse",
  AT_WAREHOUSE_PENDING_VERIFY: "seller.stateAtWarehousePendingVerify",
  AT_WAREHOUSE_PENDING_RE_INSPECTION: "seller.stateAtWarehousePendingReInspection",
  NEED_UPDATE: "seller.stateNeedUpdate",
  PUBLISHED: "seller.statePublished",
  REJECTED: "seller.stateRejected",
  RESERVED: "order.statusRESERVED",
  IN_TRANSACTION: "order.statusIN_TRANSACTION",
};

function stateLabel(state: ListingState, t: (k: string) => string) {
  const key = LISTING_STATE_KEYS[state];
  const text = key ? t(key) : state;
  switch (state) {
    case "DRAFT":
      return { text, cls: "bg-muted text-foreground border-border" };
    case "PENDING_INSPECTION":
      return { text, cls: "bg-warning/15 text-warning border-warning/30" };
    case "AWAITING_WAREHOUSE":
      return { text, cls: "bg-primary/10 text-primary border-primary/30" };
    case "AT_WAREHOUSE_PENDING_VERIFY":
    case "AT_WAREHOUSE_PENDING_RE_INSPECTION":
      return { text, cls: "bg-warning/15 text-warning border-warning/30" };
    case "NEED_UPDATE":
      return { text, cls: "bg-destructive/10 text-destructive border-destructive/30" };
    case "PUBLISHED":
      return { text, cls: "bg-primary/10 text-primary border-primary/30" };
    case "REJECTED":
      return { text, cls: "bg-muted/80 text-muted-foreground border-border" };
    case "RESERVED":
    case "IN_TRANSACTION":
      return { text, cls: "bg-warning/15 text-warning border-warning/30" };
    default:
      return { text, cls: "bg-muted/80 text-muted-foreground border-border" };
  }
}

function getBikeLabel(o: Order): string {
  const l = o.listing as { brand?: string; model?: string; title?: string } | undefined;
  if (l?.brand && l?.model) return `${l.brand} ${l.model}`;
  if (l?.title) return l.title;
  return o.listingId;
}

function getOrderForListing(orders: Order[], listingId: string): Order | undefined {
  return orders.find(
    (o) =>
      o.listingId === listingId ||
      (o.listing as { id?: string } | undefined)?.id === listingId,
  );
}

/** Ảnh tin: fallback khi URL lỗi / trống (tránh icon vỡ + alt chồng lên nhau). */
function ListingThumb({ listing }: { listing: Listing }) {
  const [failed, setFailed] = useState(false);
  const src = (listing.thumbnailUrl ?? listing.imageUrls?.[0] ?? "").trim();

  if (!src || failed) {
    return (
      <div
        className="flex h-11 w-[4.5rem] shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted"
        aria-hidden
      >
        <Bike className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="h-11 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default function SellerDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, published: 0, inReview: 0, needUpdate: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<SellerRatingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [markShippedListingId, setMarkShippedListingId] = useState<string | null>(null);
  const subscription = useSellerSubscriptionStore((s) => s.subscription);
  const setSubscription = useSellerSubscriptionStore((s) => s.setSubscription);

  useEffect(() => {
    if (USE_MOCK_API) return;
    authApi
      .getProfile()
      .then((me) => {
        const sub = normalizeSubscriptionPayload(me.subscription);
        if (sub) setSubscription(sub);
      })
      .catch(() => {});
  }, [setSubscription]);

  useEffect(() => {
    syncSellerOrderNotifications(t);
    Promise.all([
      fetchSellerDashboard(),
      fetchSellerDashboardOrders(),
      fetchSellerRatings(),
    ])
      .then(([dashboard, ordersData, ratingsData]) => {
        setStats(dashboard.stats);
        setListings(dashboard.listings);
        setOrders(ordersData);
        setRatings(ratingsData);
      })
      .finally(() => setLoading(false));
  }, [t]);

  const { total, published, inReview, needUpdate } = stats;

  const canCreateListing = USE_MOCK_API || subscription?.active === true;

  function onCreateListingClick() {
    if (canCreateListing) {
      navigate("/seller/listings/new");
      return;
    }
    setPackageDialogOpen(true);
  }

  async function onShipToBuyer(orderId: string) {
    setShippingOrderId(orderId);
    try {
      await shipOrderToBuyer(orderId);
      const next = await fetchSellerDashboardOrders();
      setOrders(next);
    } catch {
      /* toast optional */
    } finally {
      setShippingOrderId(null);
    }
  }

  async function onMarkListingShippedToWarehouse(listingId: string) {
    setMarkShippedListingId(listingId);
    try {
      await markListingShippedToWarehouse(listingId);
      const dash = await fetchSellerDashboard();
      setStats(dash.stats);
      setListings(dash.listings);
    } catch {
      /* toast optional */
    } finally {
      setMarkShippedListingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">{t("seller.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-foreground">
            {t("seller.title")}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {t("seller.subtitle")}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/seller/packages"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            {t("seller.packageBuy")}
          </Link>
          <button
            type="button"
            onClick={onCreateListingClick}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {t("seller.createNew")}
          </button>
        </div>
      </div>

      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("seller.packageNeedTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("seller.packageNeedBody")}</p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setPackageDialogOpen(false)}>
              {t("seller.packageNeedNo")}
            </Button>
            <Button type="button" onClick={() => navigate("/seller/packages")}>
              {t("seller.packageNeedYes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("seller.totalListings")} value={total} />
        <StatCard
          label={t("seller.onSale")}
          value={published}
        />
        <StatCard label={t("seller.pendingReview")} value={inReview} />
        <StatCard label={t("seller.needUpdate")} value={needUpdate} />
      </div>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-12">
        {/* Inventory table */}
        <div className="min-w-0 overflow-x-auto rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">
              {t("seller.yourInventory")}
            </div>
            <Link to="/seller" className="text-sm font-semibold text-primary hover:underline">
              {t("seller.viewAll")}
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <div className="grid min-w-[720px] grid-cols-12 gap-x-3 bg-muted px-3 py-3 text-xs font-semibold text-muted-foreground sm:px-4">
              <div className="col-span-5">{t("seller.listing")}</div>
              <div className="col-span-2 text-right">{t("seller.price")}</div>
              <div className="col-span-3 text-left">{t("seller.status")}</div>
              <div className="col-span-2 text-right">{t("seller.action")}</div>
            </div>

            <div className="min-w-[720px] divide-y divide-border">
              {listings.map((x) => {
                const orderForListing = getOrderForListing(orders, x.id);
                const needUpdateReason =
                  x.state === "NEED_UPDATE"
                    ? (x as any).inspectionNeedUpdateReason || ""
                    : "";
                const canEdit =
                  x.state === "DRAFT" || x.state === "NEED_UPDATE";

                let badge = stateLabel(x.state, t);
                let actionNode: ReactNode = null;

                if (orderForListing) {
                  const o = orderForListing;
                  const isPaid = o.depositPaid === true || o.status === "COMPLETED";
                  const isWarehouse = o.fulfillmentType === "WAREHOUSE";
                  const needsShip =
                    o.fulfillmentType === "DIRECT" && o.status === "PENDING_SELLER_SHIP";

                  if (needsShip) {
                    badge = { text: t("seller.stateDepositPaidAwaitShip"), cls: "bg-warning/15 text-warning border-warning/30" };
                    actionNode = (
                      <Button
                        type="button"
                        size="sm"
                        className="w-full max-w-[11rem]"
                        disabled={shippingOrderId === o.id}
                        onClick={() => onShipToBuyer(o.id)}
                      >
                        {shippingOrderId === o.id ? t("seller.shippingToBuyer") : t("seller.confirmShipToBuyer")}
                      </Button>
                    );
                  } else if (isWarehouse && (o.status === "RESERVED" || o.status === "AT_WAREHOUSE_PENDING_ADMIN")) {
                    badge = { text: t("seller.stateAwaitWarehouseShip"), cls: "bg-warning/15 text-warning border-warning/30" };
                    actionNode = (
                      <span
                        className="inline-flex max-w-[10rem] cursor-default justify-end rounded-md border border-border bg-muted px-2 py-1.5 text-right text-[11px] font-medium leading-snug text-muted-foreground sm:text-xs"
                        title={t("seller.actionAwaitWarehouseShip")}
                      >
                        {t("seller.actionAwaitWarehouseShip")}
                      </span>
                    );
                  } else if (o.status === "RESERVED" || o.status === "IN_TRANSACTION") {
                    if (!isPaid) {
                      badge = { text: t("seller.stateAwaitDeposit"), cls: "bg-muted text-muted-foreground border-border" };
                      actionNode = (
                        <span className="inline-flex cursor-default rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                          {t("seller.actionAwaitDeposit")}
                        </span>
                      );
                    } else {
                      badge = { text: t("seller.stateDepositPaidAwaitShip"), cls: "bg-warning/15 text-warning border-warning/30" };
                      actionNode = (
                        <Button
                          type="button"
                          size="sm"
                          className="w-full max-w-[11rem]"
                          disabled={shippingOrderId === o.id}
                          onClick={() => onShipToBuyer(o.id)}
                        >
                          {shippingOrderId === o.id ? t("seller.shippingToBuyer") : t("seller.confirmShipToBuyer")}
                        </Button>
                      );
                    }
                  } else if (o.status === "SHIPPING") {
                    badge = { text: t("seller.stateShippedToBuyer"), cls: "bg-primary/10 text-primary border-primary/30" };
                    actionNode = (
                      <span className="inline-flex cursor-default rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        {t("seller.actionShipped")}
                      </span>
                    );
                  } else if (o.status === "COMPLETED") {
                    badge = { text: t("seller.stateOrderCompleted"), cls: "bg-primary/10 text-primary border-primary/30" };
                    actionNode = (
                      <span className="inline-flex cursor-default rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        {t("seller.actionCompleted")}
                      </span>
                    );
                  } else {
                    actionNode = (
                      <button type="button" disabled className="inline-flex cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        {t("seller.lock")}
                      </button>
                    );
                  }
                } else {
                  if (x.state === "AWAITING_WAREHOUSE") {
                    actionNode = (
                      <Button
                        type="button"
                        size="sm"
                        className="w-full max-w-[11rem]"
                        disabled={markShippedListingId === x.id}
                        onClick={() => onMarkListingShippedToWarehouse(x.id)}
                      >
                        {markShippedListingId === x.id
                          ? t("seller.markShippedToWarehouseSending")
                          : t("seller.markShippedToWarehouse")}
                      </Button>
                    );
                  } else if (x.state === "AT_WAREHOUSE_PENDING_VERIFY" || x.state === "AT_WAREHOUSE_PENDING_RE_INSPECTION") {
                    actionNode = (
                      <span className="max-w-[11rem] text-right text-xs text-muted-foreground">
                        {t("seller.waitingWarehouseVerify")}
                      </span>
                    );
                  } else if (canEdit) {
                    actionNode = (
                      <Link
                        to={`/seller/listings/${x.id}/edit`}
                        className="inline-flex rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        {t("seller.edit")}
                      </Link>
                    );
                  } else {
                    actionNode = (
                      <button
                        type="button"
                        disabled
                        className="inline-flex cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                      >
                        {t("seller.lock")}
                      </button>
                    );
                  }
                }

                return (
                  <div
                    key={x.id}
                    className="grid grid-cols-12 items-center gap-x-3 px-3 py-3 sm:px-4"
                  >
                    <div className="col-span-5 flex min-w-0 items-center gap-3">
                      <ListingThumb listing={x} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {x.title || `${x.brand} ${x.model ?? ""}`}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {x.brand}
                          {x.model ? ` · ${x.model}` : ""}
                        </div>
                        {needUpdateReason && (
                          <div className="mt-1 text-xs text-destructive">
                            {t("seller.inspectionFeedback")}: {needUpdateReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                      {formatMoney(x.price, "VND")}
                    </div>

                    <div className="col-span-3 min-w-0">
                      <span
                        className={`inline-flex max-w-full rounded-md border px-2 py-1.5 text-left text-[11px] font-semibold leading-snug text-foreground sm:text-xs ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    </div>

                    <div className="col-span-2 flex min-w-0 flex-col items-end justify-center gap-2 text-right">
                      {actionNode}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            {t("seller.inventoryNote")}
          </div>
        </div>

        {/* New Listing Draft panel */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold text-foreground">
            {t("seller.newDraft")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {t("seller.newDraftHint")}
          </div>

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t("seller.postTitle")}
            />
            <input
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t("seller.priceVND")}
            />

            <div className="rounded-xl border border-border bg-muted p-3">
              <div className="text-xs font-semibold text-foreground">
                {t("seller.photoChecklist")}
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• {t("seller.photoFullBike")}</li>
                <li>• {t("seller.photoSerial")}</li>
                <li>• {t("seller.photoDrivetrain")}</li>
                <li>• {t("seller.photoBrakes")}</li>
              </ul>
            </div>

            <Link
              to="/seller/listings/new"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t("seller.continueDraft")}
            </Link>
          </div>
        </div>
      </div>

      {/* Orders & Ratings row */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("seller.ordersDeposits")}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("seller.ordersDepositsDesc")}</p>
          <div className="mt-4 space-y-3">
            {orders.map((o) => {
              const isPaid = o.depositPaid === true || o.status === "COMPLETED";
              const showShipDirect =
                o.fulfillmentType === "DIRECT" && o.status === "PENDING_SELLER_SHIP";
              return (
                <div
                  key={o.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{getBikeLabel(o)}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.id} • {o.buyerId ?? "—"} • {t("seller.deposit")}{" "}
                      {formatMoney(o.depositAmount ?? 0)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                    <span
                      className={`inline-flex justify-center rounded-full px-2.5 py-1 text-xs font-semibold sm:justify-end ${
                        isPaid ? "bg-primary/10 text-primary" : "bg-warning/15 text-warning"
                      }`}
                    >
                      {isPaid ? t("seller.paid") : t("seller.pendingProcess")}
                    </span>
                    {showShipDirect && (
                      <Button
                        type="button"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={shippingOrderId === o.id}
                        onClick={() => onShipToBuyer(o.id)}
                      >
                        {shippingOrderId === o.id
                          ? t("seller.shippingToBuyer")
                          : t("seller.confirmShipToBuyer")}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">{t("seller.noOrders")}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("seller.ratingsReputation")}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("seller.ratingsDesc")}</p>
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-border bg-muted/50 py-6">
            {ratings ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{ratings.averageRating.toFixed(1)}</span>
                  <span className="text-primary">★★★★★</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t("seller.reviews", { count: ratings.totalReviews })}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("seller.positiveFeedbackPercent", { percent: ratings.positivePercent })}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("seller.noRatingsYet")}</p>
            )}
          </div>
          {ratings && Object.keys(ratings.breakdown).length > 0 && (
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratings.breakdown[stars] ?? 0;
              if (count === 0) return null;
              return (
                <div key={stars} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("seller.starsLabel", { count: stars })}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
