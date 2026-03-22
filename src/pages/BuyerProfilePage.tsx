import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchMyOrders } from "@/services/buyerService";
import { authApi } from "@/apis/authApi";
import type { Order, OrderStatus } from "@/types/order";

/** Trạng thái đơn trong giai đoạn chuẩn bị giao (dùng cho đơn cũ từ backend). */
const IN_PROGRESS_PHASE: OrderStatus[] = [
  "PENDING_SELLER_SHIP",
  "SELLER_SHIPPED",
  "AT_WAREHOUSE_PENDING_ADMIN",
  "RE_INSPECTION",
  "RE_INSPECTION_DONE",
  "SHIPPING",
];

function getOrderDisplayStatus(o: Order): OrderStatus {
  return o.status;
}

function getBuyerStatusLabel(displayStatus: OrderStatus, t: (k: string) => string): string {
  if (IN_PROGRESS_PHASE.includes(displayStatus)) {
    return t("transaction.waitingForShippingLabel");
  }
  return t(`order.status${displayStatus}` as "order.statusRESERVED") ?? displayStatus;
}

export default function BuyerProfilePage() {
  const { t } = useTranslation();
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<{
    email?: string;
    displayName?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMyOrders(), authApi.getProfile().catch(() => null)])
      .then(([orderList, profileData]) => {
        if (!cancelled) {
          setOrders(Array.isArray(orderList) ? orderList : []);
          setProfile(
            profileData && typeof profileData === "object" ? profileData : null,
          );
        }
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {(profile?.displayName ||
                    profile?.email ||
                    "B")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {profile?.displayName ?? t("profile.buyerDefault")}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {profile?.email ?? "—"}
                  </div>
                </div>
              </div>

              <Badge className="mt-4">{t("profile.verified")}</Badge>

              <nav className="mt-5 space-y-2">
                <Button
                  className="w-full justify-start"
                  size="sm"
                  onClick={() =>
                    document
                      .getElementById("personal-info")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {t("profile.personalInfo")}
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <Link to="/wishlist">{t("common.wishlist")}</Link>
                </Button>
              </nav>

              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => clearTokens()}
              >
                {t("common.logout")}
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4 lg:col-span-9">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("profile.personalInfo")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("profile.manageAccount")}
            </p>
          </div>

          <Card id="personal-info">
            <CardContent className="pt-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="text-sm font-semibold text-primary">
                  {t("profile.privacyTitle")}
                </div>
                <p className="mt-1 text-xs text-primary/80">
                  {t("profile.privacyDesc")}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    {t("profile.fullName")}
                  </div>
                  <div className="mt-1 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                    {profile?.displayName ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    {t("profile.email")}
                  </div>
                  <div className="mt-1 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                    {profile?.email ?? "—"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-muted-foreground">
                    {t("profile.phone")}
                  </div>
                  <div className="mt-1 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                    +84 9xx xxx xxx
                  </div>
                </div>
              </div>

              <div
                id="orders-section"
                className="mt-6 flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-foreground">{t("profile.recentOrders")}</span>
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary"
                  asChild
                >
                  <a href="#orders-section">{t("profile.viewAll")}</a>
                </Button>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border">
                <div className="grid grid-cols-12 bg-muted/50 px-4 py-3 text-xs font-semibold text-muted-foreground">
                  <div className="col-span-4">{t("profile.bike")}</div>
                  <div className="col-span-2">{t("profile.date")}</div>
                  <div className="col-span-2">{t("profile.amount")}</div>
                  <div className="col-span-2 text-right">{t("profile.status")}</div>
                  <div className="col-span-2 text-right">{t("profile.action")}</div>
                </div>

                {loading ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    {t("profile.loadingOrders")}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    {t("profile.noOrdersHint")}
                  </div>
                ) : (
                  orders.map((o) => {
                    const bikeName = o.listing
                      ? `${(o.listing as { brand?: string; model?: string }).brand ?? ""} ${(o.listing as { brand?: string; model?: string }).model ?? o.listing.title ?? ""}`.trim() ||
                        "Bike"
                      : `Order #${o.id?.slice(-6) ?? ""}`;
                    const dateStr = o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—";
                    const listingId =
                      o.listingId ?? (o.listing as { id?: string })?.id;
                    const displayStatus = getOrderDisplayStatus(o);
                    const isPending =
                      o.status === "RESERVED" || o.status === "IN_TRANSACTION";
                    const isCompleted = o.status === "COMPLETED";
                    const inProgressStatuses = [
                      "PENDING_SELLER_SHIP",
                      "SELLER_SHIPPED",
                      "AT_WAREHOUSE_PENDING_ADMIN",
                      "RE_INSPECTION",
                      "RE_INSPECTION_DONE",
                      "SHIPPING",
                    ] as const;
                    const canTrackProgress =
                      inProgressStatuses.includes(o.status as (typeof inProgressStatuses)[number]) &&
                      !!listingId;
                    const txState =
                      (isPending || canTrackProgress) && listingId
                        ? {
                            orderId: o.id,
                            depositPaid:
                              o.depositAmount ??
                              Math.round((o.totalPrice ?? 0) * 0.08),
                            totalPrice: o.totalPrice ?? 0,
                            expiresAt: o.expiresAt
                              ? new Date(o.expiresAt).getTime()
                              : Date.now() + 24 * 60 * 60 * 1000,
                            paymentMethod: { type: "CASH" as const },
                            totals: {
                              deposit:
                                o.depositAmount ??
                                Math.round((o.totalPrice ?? 0) * 0.08),
                              totalNow: o.depositAmount ?? o.totalPrice ?? 0,
                            },
                          }
                        : null;

                    return (
                      <div
                        key={o.id}
                        className="grid grid-cols-12 items-center border-t px-4 py-3 text-sm"
                      >
                        <div className="col-span-4">
                          <div className="font-semibold text-foreground">{bikeName}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {o.id}
                          </div>
                        </div>
                        <div className="col-span-2 text-muted-foreground">
                          {dateStr}
                        </div>
                        <div className="col-span-2 font-semibold text-foreground">
                          {typeof o.totalPrice === "number"
                            ? new Intl.NumberFormat(undefined, {
                                style: "currency",
                                currency:
                                  (o.listing as { currency?: string })
                                    ?.currency ?? "VND",
                                maximumFractionDigits: 2,
                              }).format(o.totalPrice)
                            : "—"}
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Badge variant={isPending ? "secondary" : "default"}>
                            {getBuyerStatusLabel(displayStatus, t)}
                          </Badge>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          {isPending && listingId && txState ? (
                            <Button asChild variant="outline" size="sm">
                              <Link
                                to={`/transaction/${listingId}?orderId=${o.id}`}
                                state={txState}
                              >
                                {t("profile.continuePayment")}
                              </Link>
                            </Button>
                          ) : canTrackProgress && listingId && txState ? (
                            <Button asChild variant="outline" size="sm">
                              <Link
                                to={`/transaction/${listingId}?orderId=${o.id}`}
                                state={txState}
                              >
                                {t("profile.viewProgress")}
                              </Link>
                            </Button>
                          ) : isCompleted ? (
                            <span className="text-xs text-muted-foreground">
                              {t("profile.completed")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {!loading && orders.length > 0 && (
                <p className="mt-4 text-xs text-muted-foreground">
                  {t("profile.recentOrdersDesc")}
                </p>
              )}

              <Button asChild variant="link" className="mt-4">
                <Link to="/">{t("profile.goHome")}</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
