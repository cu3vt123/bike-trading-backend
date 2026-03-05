import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchMyOrders } from "@/services/buyerService";
import { authApi } from "@/apis/authApi";
import type { Order } from "@/types/order";

export default function BuyerProfilePage() {
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
                  <div className="truncate text-sm font-semibold">
                    {profile?.displayName ?? "Buyer"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {profile?.email ?? "—"}
                  </div>
                </div>
              </div>

              <Badge className="mt-4">Verified Buyer</Badge>

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
                  Personal Info
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() =>
                    document
                      .getElementById("orders-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  My Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  Saved Bikes
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  Settings
                </Button>
              </nav>

              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => clearTokens()}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4 lg:col-span-9">
          <div>
            <h1 className="text-2xl font-bold">Personal Information</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your personal details and account settings.
            </p>
          </div>

          <Card id="personal-info">
            <CardContent className="pt-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="text-sm font-semibold text-primary">
                  Privacy Protection Active
                </div>
                <p className="mt-1 text-xs text-primary/80">
                  Your contact details are protected until the transaction is
                  confirmed.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    Full Name
                  </div>
                  <div className="mt-1 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                    {profile?.displayName ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    Email Address
                  </div>
                  <div className="mt-1 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                    {profile?.email ?? "—"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Phone Number
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
                <span className="text-sm font-semibold">Recent Orders</span>
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary"
                  asChild
                >
                  <a href="#orders-section">View All Orders</a>
                </Button>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border">
                <div className="grid grid-cols-12 bg-muted/50 px-4 py-3 text-xs font-semibold text-muted-foreground">
                  <div className="col-span-4">Bike Details</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2 text-right">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {loading ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No orders yet. Browse the marketplace to place an order.
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
                    const isPending =
                      o.status === "RESERVED" || o.status === "IN_TRANSACTION";
                    const txState =
                      isPending && listingId
                        ? {
                            orderId: o.id,
                            depositPaid:
                              o.depositAmount ??
                              Math.round((o.totalPrice ?? 0) * 0.08),
                            totalPrice: o.totalPrice ?? 0,
                            expiresAt: o.expiresAt
                              ? new Date(o.expiresAt).getTime()
                              : Date.now() + 24 * 60 * 60 * 1000,
                            paymentMethod: { type: "BANK_TRANSFER" as const },
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
                          <div className="font-semibold">{bikeName}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {o.id}
                          </div>
                        </div>
                        <div className="col-span-2 text-muted-foreground">
                          {dateStr}
                        </div>
                        <div className="col-span-2 font-semibold">
                          {typeof o.totalPrice === "number"
                            ? new Intl.NumberFormat(undefined, {
                                style: "currency",
                                currency:
                                  (o.listing as { currency?: string })
                                    ?.currency ?? "USD",
                                maximumFractionDigits: 2,
                              }).format(o.totalPrice)
                            : "—"}
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Badge variant={isPending ? "secondary" : "default"}>
                            {o.status === "IN_TRANSACTION"
                              ? "In Transaction"
                              : o.status === "RESERVED"
                                ? "Reserved"
                                : o.status}
                          </Badge>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          {isPending && listingId && txState ? (
                            <Button asChild variant="outline" size="sm">
                              <Link
                                to={`/transaction/${listingId}?orderId=${o.id}`}
                                state={txState}
                              >
                                Continue to pay
                              </Link>
                            </Button>
                          ) : o.status === "COMPLETED" ? (
                            <span className="text-xs text-muted-foreground">
                              Completed
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
                  Your order list (synced from Backend).
                </p>
              )}

              <Button asChild variant="link" className="mt-4">
                <Link to="/">← Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
