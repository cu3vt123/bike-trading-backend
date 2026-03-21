import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchListingById,
  fetchOrderById,
  cancelOrder,
} from "@/services/buyerService";
import type { BikeDetail } from "@/types/shopbike";
import type { OrderFulfillmentType, OrderStatus } from "@/types/order";

function Stars({ value }: { value: number }) {
  const full = Math.round(Math.max(0, Math.min(5, value)));
  const stars = "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
  return <span className="text-primary">{stars}</span>;
}

type PaymentMethod =
  | { type: "CARD"; brand: "Visa" | "Mastercard"; last4: string }
  | { type: "BANK_TRANSFER" };

type TxState = {
  orderId?: string;
  depositPaid?: number;
  totalPrice?: number;
  expiresAt?: number;
  paymentMethod?: PaymentMethod;
  totals?: { deposit?: number; totalNow?: number };
  fulfillmentType?: OrderFulfillmentType;
};

function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

const INSPECTION_ROW_KEYS = {
  frameIntegrity: "listing.inspectionFrameIntegrity",
  drivetrainHealth: "listing.inspectionDrivetrain",
  brakingSystem: "listing.inspectionBraking",
} as const;

const SHIPPING_FLOW_STEPS: OrderStatus[] = [
  "RESERVED",
  "PENDING_SELLER_SHIP",
  "SELLER_SHIPPED",
  "AT_WAREHOUSE_PENDING_ADMIN",
  "RE_INSPECTION",
  "RE_INSPECTION_DONE",
  "SHIPPING",
  "COMPLETED",
];

/** Xe chưa kiểm định: không qua kho / re-inspection */
const DIRECT_FLOW_STEPS: OrderStatus[] = [
  "RESERVED",
  "PENDING_SELLER_SHIP",
  "SHIPPING",
  "COMPLETED",
];

function flowSteps(isDirect: boolean): OrderStatus[] {
  return isDirect ? DIRECT_FLOW_STEPS : SHIPPING_FLOW_STEPS;
}

function isStepDoneInFlow(
  status: OrderStatus | null,
  step: OrderStatus,
  flow: OrderStatus[],
): boolean {
  if (!status) return step === "RESERVED";
  const idx = flow.indexOf(step);
  if (idx < 0) return false;
  const reservedIdx = flow.indexOf("RESERVED");
  let currentIdx =
    status === "IN_TRANSACTION"
      ? reservedIdx >= 0
        ? reservedIdx
        : 0
      : flow.indexOf(status);
  if (status === "COMPLETED") {
    const cIdx = flow.indexOf("COMPLETED");
    return cIdx >= 0 && idx <= cIdx;
  }
  if (currentIdx < 0) return false;
  return idx <= currentIdx;
}

function stepTitleFor(
  step: OrderStatus,
  isDirect: boolean,
  t: (key: string) => string,
): string {
  if (step === "PENDING_SELLER_SHIP" && isDirect) {
    return t("transaction.directStepSellerShipTitle");
  }
  return t(`order.status${step}` as "order.statusRESERVED");
}

function stepDescFor(
  step: OrderStatus,
  isDirect: boolean,
  t: (key: string) => string,
): string {
  if (step === "RESERVED") return t("transaction.depositSuccess");
  if (step === "PENDING_SELLER_SHIP") {
    return isDirect ? t("transaction.sellerNotifyDirect") : t("transaction.sellerNotify");
  }
  if (isDirect) {
    if (step === "SHIPPING") return t("transaction.shippingToYou");
    if (step === "COMPLETED") return t("transaction.ownershipTransferred");
    return "";
  }
  if (step === "SELLER_SHIPPED") return t("transaction.sellerShipped");
  if (step === "AT_WAREHOUSE_PENDING_ADMIN") return t("transaction.adminConfirm");
  if (step === "RE_INSPECTION") return t("transaction.inspectorReInspect");
  if (step === "RE_INSPECTION_DONE") return t("transaction.confirmedTransfer");
  if (step === "SHIPPING") return t("transaction.shippingToYou");
  if (step === "COMPLETED") return t("transaction.ownershipTransferred");
  if (step === "IN_TRANSACTION") return t("transaction.payBalance");
  return "";
}

export default function TransactionPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state ?? {}) as TxState;

  const [listing, setListing] = useState<BikeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderState, setOrderState] = useState<TxState | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);

  const state = orderState ?? locationState;
  const isDirect =
    state.fulfillmentType === "DIRECT" ||
    (!state.fulfillmentType && orderStatus === "PENDING_SELLER_SHIP");
  const progressFlow = flowSteps(isDirect);

  // Fetch order when orderId from URL or state → sync status & expiresAt
  const orderIdToFetch = searchParams.get("orderId") ?? locationState.orderId;
  useEffect(() => {
    if (!orderIdToFetch || !id) return;
    let cancelled = false;
    fetchOrderById(orderIdToFetch)
      .then((o) => {
        if (!cancelled && o) {
          const listingId = o.listingId ?? (o.listing as { id?: string })?.id;
          if (listingId && id === listingId) {
            setOrderStatus(o.status);
            setOrderState((prev) => ({
              ...(prev ?? locationState),
              orderId: o.id,
              depositPaid: o.depositAmount ?? Math.round((o.totalPrice ?? 0) * 0.08),
              totalPrice: o.totalPrice ?? 0,
              expiresAt: o.expiresAt ? new Date(o.expiresAt).getTime() : undefined,
              fulfillmentType: o.fulfillmentType ?? prev?.fulfillmentType ?? locationState?.fulfillmentType ?? "WAREHOUSE",
              paymentMethod: prev?.paymentMethod ?? locationState?.paymentMethod ?? { type: "BANK_TRANSFER" },
              totals: prev?.totals ?? locationState?.totals ?? {},
            }));
          }
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [orderIdToFetch, id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchListingById(id)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? t("transaction.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const [now, setNow] = useState(() => Date.now());
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  async function handleCancelReservation() {
    if (!state.orderId) {
      setCancelOpen(false);
      navigate(`/bikes/${id}`, { replace: true });
      return;
    }
    setCancelling(true);
    try {
      await cancelOrder(state.orderId);
      setCancelOpen(false);
      navigate(`/bikes/${id}`, {
        replace: true,
        state: { cancelledOrderId: state.orderId },
      });
    } catch {
      setCancelOpen(false);
    } finally {
      setCancelling(false);
    }
  }

  const currency = (listing?.currency ?? "VND") as "VND" | "USD";
  const score = listing?.inspectionScore ?? 0;
  const inspectionReport = listing?.inspectionReport;
  const hasInspectionReport =
    inspectionReport?.frameIntegrity &&
    inspectionReport?.drivetrainHealth &&
    inspectionReport?.brakingSystem;
  const totalPrice =
    state.totalPrice ?? state.totals?.totalNow ?? listing?.price ?? 0;
  const depositPaid =
    state.depositPaid ?? state.totals?.deposit ?? Math.round(totalPrice * 0.08);
  const orderId = state.orderId ?? "SB-9921";
  const expiresAt = state.expiresAt ?? Date.now() + 24 * 60 * 60 * 1000;

  const diff = Math.max(0, expiresAt - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const img =
    listing?.imageUrls?.[0] ??
    listing?.thumbnailUrl ??
    "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=800&q=60";

  function formatPaymentMethod(pm?: PaymentMethod) {
    if (!pm) return "—";
    if (pm.type === "CARD") return `${pm.brand} ending in ${pm.last4}`;
    return t("transaction.bankTransfer");
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{t("transaction.loading")}</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Card className="mx-auto max-w-6xl">
        <CardContent className="py-12">
          <h1 className="text-lg font-semibold">{t("transaction.notFound")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? t("transaction.loadError")}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">{t("transaction.goHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("transaction.title")}</h1>
          <Badge className="mt-2" variant="default">
            {orderStatus
              ? t(`order.status${orderStatus}` as "order.statusRESERVED")
              : t("order.statusPENDING")}
          </Badge>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("transaction.updatedNow")} • {t("transaction.order")} #{orderId}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            {t("transaction.myOrders")}
          </Button>
          <Button variant="outline" onClick={() => navigate(`/bikes/${listing.id}`)}>
            {t("transaction.viewListing")}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          {/* Countdown: chỉ hiển thị khi admin đã xác nhận kho & inspector kiểm định xong (SHIPPING) */}
          <Card>
            <CardHeader>
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Clock className="h-4 w-4" />
                {orderStatus === "SHIPPING" || orderStatus === "RE_INSPECTION_DONE"
                  ? t("transaction.timeRemaining")
                  : t("transaction.nextStep")}
              </span>
            </CardHeader>
            <CardContent>
              {orderStatus === "SHIPPING" || orderStatus === "RE_INSPECTION_DONE" ? (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: hours, labelKey: "transaction.hours" },
                    { val: minutes, labelKey: "transaction.minutes" },
                    { val: seconds, labelKey: "transaction.seconds" },
                  ].map(({ val, labelKey }) => (
                    <div
                    key={labelKey}
                    className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-primary">{pad2(val)}</div>
                    <div className="mt-1 text-xs text-primary/80">{t(labelKey)}</div>
                  </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                  {isDirect ? t("transaction.nextStepDescDirect") : t("transaction.nextStepDesc")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">{t("transaction.progress")}</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {(orderStatus ? progressFlow : (["RESERVED", "IN_TRANSACTION", "COMPLETED"] as OrderStatus[])).map((step) => {
                const done = orderStatus
                  ? isStepDoneInFlow(orderStatus, step, progressFlow)
                  : step === "RESERVED" || step === "IN_TRANSACTION";
                const title =
                  orderStatus && progressFlow.includes(step)
                    ? stepTitleFor(step, isDirect, t)
                    : t(`order.status${step}` as "order.statusRESERVED");
                const desc =
                  orderStatus && progressFlow.includes(step)
                    ? stepDescFor(step, isDirect, t)
                    : step === "RESERVED" || step === "IN_TRANSACTION"
                      ? step === "RESERVED"
                        ? t("transaction.depositSuccess")
                        : t("transaction.payBalance")
                      : "";
                return (
                  <div key={step} className="flex gap-3">
                    <div
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        done ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    <div className={done ? "" : "opacity-50"}>
                      <div className="font-semibold">{title}</div>
                      {desc && <div className="text-sm text-muted-foreground">{desc}</div>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Logistics */}
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">{t("transaction.shippingPayment")}</span>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-xs text-muted-foreground">{t("transaction.orderCode")}</div>
                  <div className="mt-1 font-semibold">#{orderId}</div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-xs text-muted-foreground">{t("transaction.paymentMethod")}</div>
                  <div className="mt-1 font-semibold">
                    {formatPaymentMethod(state.paymentMethod)}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4 sm:col-span-2">
                  <div className="text-xs text-muted-foreground">{t("transaction.shippingAddress")}</div>
                  <div className="mt-1 font-semibold">
                    123 Cycling Way, District 1, HCMC
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              {orderStatus === "COMPLETED" ? (
                <Button asChild className="w-full" variant="secondary">
                  <Link
                    to={`/success/${listing.id}`}
                    state={{
                      orderId,
                      depositPaid,
                      totalPrice,
                      paymentMethod: state.paymentMethod,
                      completedAt: Date.now(),
                    }}
                  >
                    {t("transaction.completedViewDetail")}
                  </Link>
                </Button>
              ) : orderStatus === "SHIPPING" || orderStatus === "RE_INSPECTION_DONE" ? (
                <Button asChild className="w-full">
                  <Link
                    to={`/finalize/${listing.id}`}
                    state={{
                      orderId,
                      depositPaid,
                      totalPrice,
                      paymentMethod: state.paymentMethod,
                    }}
                  >
                    {orderStatus === "SHIPPING" || orderStatus === "RE_INSPECTION_DONE"
                      ? t("transaction.confirmReceived")
                      : t("transaction.completePurchase")}
                  </Link>
                </Button>
              ) : (
                <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
                  {orderStatus === "RESERVED" || orderStatus === "IN_TRANSACTION"
                    ? t("transaction.waitPaymentDone")
                    : orderStatus === "PENDING_SELLER_SHIP"
                      ? isDirect
                        ? t("transaction.waitSellerShipDirect")
                        : t("transaction.waitSellerShip")
                      : orderStatus === "SELLER_SHIPPED" || orderStatus === "AT_WAREHOUSE_PENDING_ADMIN"
                        ? t("transaction.bikeEnRoute")
                        : orderStatus === "RE_INSPECTION"
                          ? t("transaction.reInspectionAtWarehouse")
                          : isDirect
                            ? t("transaction.orderInProgressDirect")
                            : t("transaction.orderInProgress")}
                </p>
              )}
              {(orderStatus === "RESERVED" ||
                orderStatus === "IN_TRANSACTION" ||
                !orderStatus ||
                (orderStatus === "PENDING_SELLER_SHIP" && isDirect)) && (
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => setCancelOpen(true)}
                >
                  {t("transaction.cancelReservation")}
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t("transaction.refundPolicyNote")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {listing.brand} {listing.model ?? ""}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {listing.frameSize ?? "—"} • {listing.condition ?? "—"}
                    </div>
                    <div className="mt-2 text-sm font-bold">
                      {formatMoney(totalPrice, currency)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border">
                  <div className="flex items-center justify-between bg-muted/50 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{t("transaction.depositPaid")}</span>
                    <span className="font-semibold">
                      {formatMoney(depositPaid, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{t("transaction.remainingOnDelivery")}</span>
                    <span className="font-semibold">
                      {formatMoney(Math.max(0, totalPrice - depositPaid), currency)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>
                    {t("transaction.payment")}:{" "}
                    <span className="font-semibold">
                      {formatPaymentMethod(state.paymentMethod)}
                    </span>
                  </span>
                </div>

                {hasInspectionReport && (
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => setReportOpen(true)}
                  >
                    {t("transaction.viewInspectionReport")}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-semibold text-foreground">{t("transaction.contactSupport")}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("transaction.support24_7")}
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => setSupportOpen(true)}
                >
                  {t("transaction.chatWithSupport")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Reservation Confirm */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("transaction.cancelDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("transaction.cancelDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              {t("transaction.keepReservation")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelReservation}
              disabled={cancelling}
            >
              {cancelling ? t("transaction.cancelling") : t("transaction.cancelAndRefund")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspection Report Dialog */}
      {hasInspectionReport && (
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("listing.inspectionReportTitle")}</DialogTitle>
              <DialogDescription>{listing?.brand} {listing?.model ?? ""}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {(
                [
                  { key: "frameIntegrity" as const, ...inspectionReport!.frameIntegrity },
                  { key: "drivetrainHealth" as const, ...inspectionReport!.drivetrainHealth },
                  { key: "brakingSystem" as const, ...inspectionReport!.brakingSystem },
                ] as const
              ).map(({ key, label: value, score: s }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                  <span className="text-sm text-muted-foreground">{t(INSPECTION_ROW_KEYS[key])}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{value}</span>
                    <Stars value={s ?? 0} />
                    <span className="text-xs text-muted-foreground">({(s ?? 0).toFixed(1)})</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">{t("listing.inspectionOverall")}</span>
                <div className="flex items-center gap-2">
                  <Stars value={score} />
                  <span className="text-sm font-semibold text-foreground">({score.toFixed(1)})</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Support Chat Dialog */}
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("transaction.contactSupport")}</DialogTitle>
            <DialogDescription>
              {t("transaction.supportChatNote")}{" "}
              <a href="mailto:support@shopbike.example.com" className="text-primary hover:underline">
                support@shopbike.example.com
              </a>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSupportOpen(false)}>{t("transaction.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
