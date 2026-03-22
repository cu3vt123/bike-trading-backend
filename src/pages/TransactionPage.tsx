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
  resumeVnpayCheckoutOrder,
} from "@/services/buyerService";
import type { BikeDetail } from "@/types/shopbike";
import type { Order, OrderFulfillmentType, OrderStatus } from "@/types/order";
import { listingSnapshotToDetail } from "@/lib/listingSnapshotFromOrder";

function Stars({ value }: { value: number }) {
  const full = Math.round(Math.max(0, Math.min(5, value)));
  const stars = "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
  return <span className="text-primary">{stars}</span>;
}

type PaymentMethod =
  | { type: "CASH" }
  | { type: "VNPAY_QR"; ref?: string }
  | { type: "VNPAY_SANDBOX"; ref?: string }
  | { type: "CARD"; brand: "Visa" | "Mastercard"; last4: string }
  | { type: "BANK_TRANSFER" };

type TxState = {
  orderId?: string;
  /** Số tiền đã thanh toán online (cọc hoặc full), hiển thị ở cột tóm tắt */
  depositPaid?: number;
  totalPrice?: number;
  expiresAt?: number;
  paymentMethod?: PaymentMethod;
  totals?: { deposit?: number; totalNow?: number };
  fulfillmentType?: OrderFulfillmentType;
  plan?: "DEPOSIT" | "FULL";
  vnpayPaymentStatus?: "PENDING_PAYMENT" | "PAID" | "FAILED";
  vnpayAmountVnd?: number | null;
  /** Tiền cọc 8% (chuẩn hoá từ đơn) */
  depositAmount?: number;
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

/** Luồng xe qua kho — chi tiết dùng cho Seller/Admin/Inspector. Buyer dùng BUYER_WAREHOUSE_STEPS. */
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

type BuyerStep = OrderStatus;

/** Luồng warehouse cho buyer — 4 bước, bỏ qua chi tiết kho (seller gửi → kho → inspector) */
const BUYER_WAREHOUSE_STEPS: BuyerStep[] = [
  "RESERVED",
  "PENDING_SELLER_SHIP",
  "SHIPPING",
  "COMPLETED",
];

function flowSteps(isDirect: boolean): BuyerStep[] {
  return isDirect ? [...DIRECT_FLOW_STEPS] : BUYER_WAREHOUSE_STEPS;
}

const WAREHOUSE_PHASE_STATUSES: OrderStatus[] = [
  "SELLER_SHIPPED",
  "AT_WAREHOUSE_PENDING_ADMIN",
  "RE_INSPECTION",
  "RE_INSPECTION_DONE",
];

function isStepDoneInFlow(
  status: OrderStatus | null,
  step: BuyerStep,
  flow: BuyerStep[],
): boolean {
  if (!status) return step === "RESERVED";
  const idx = flow.indexOf(step);
  if (idx < 0) return false;
  const reservedIdx = flow.indexOf("RESERVED");
  let currentIdx: number;
  if (status === "IN_TRANSACTION") {
    currentIdx = reservedIdx >= 0 ? reservedIdx : 0;
  } else if (WAREHOUSE_PHASE_STATUSES.includes(status)) {
    currentIdx = flow.indexOf("SHIPPING");
  } else {
    currentIdx = flow.indexOf(status);
  }
  if (status === "COMPLETED") {
    const cIdx = flow.indexOf("COMPLETED");
    return cIdx >= 0 && idx <= cIdx;
  }
  if (currentIdx < 0) return false;
  return idx <= currentIdx;
}

function stepTitleFor(
  step: BuyerStep,
  isDirect: boolean,
  t: (key: string) => string,
): string {
  if (step === "PENDING_SELLER_SHIP" && isDirect) {
    return t("transaction.directStepSellerShipTitle");
  }
  return t(`order.status${step}` as "order.statusRESERVED");
}

function stepDescFor(
  step: BuyerStep,
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
  const orderIdFromQuery = searchParams.get("orderId") ?? "";
  const orderIdFromNavState = locationState.orderId ?? "";
  const orderIdToFetch = orderIdFromQuery || orderIdFromNavState;
  /** Đổi khi navigate có state mới — tránh effect phụ thuộc cả object state (reference không ổn định). */
  const locationKey = location.key;

  const [listing, setListing] = useState<BikeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderState, setOrderState] = useState<TxState | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);

  const state = orderState ?? locationState;
  /** Xe CERTIFIED → warehouse giao (isDirect=false), xe chưa kiểm định → seller giao (isDirect=true). */
  const isDirect = (state.fulfillmentType ?? orderState?.fulfillmentType ?? "DIRECT") === "DIRECT";
  const progressFlow = flowSteps(isDirect);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    const navState = (location.state ?? {}) as TxState;

    (async () => {
      let order: Order | null = null;

      if (orderIdToFetch) {
        try {
          order = await fetchOrderById(orderIdToFetch);
        } catch {
          order = null;
        }
        if (cancelled) return;

        if (order) {
          const listingIdFromOrder =
            order.listingId ?? (order.listing as { id?: string } | undefined)?.id;
          if (listingIdFromOrder !== id) {
            order = null;
          } else {
            setOrderStatus(order.status);
            setOrderState((prev) => {
              const plan = order!.plan ?? "DEPOSIT";
              const vnpaySt = order!.vnpayPaymentStatus;
              const depAmt =
                order!.depositAmount ??
                Math.round((order!.totalPrice ?? 0) * 0.08);
              const total = order!.totalPrice ?? 0;

              let paidOnlineDisplay = 0;
              if (vnpaySt === "PAID" && order!.depositPaid) {
                paidOnlineDisplay = plan === "FULL" ? total : depAmt;
              }

              let pm: PaymentMethod;
              if (vnpaySt === "PENDING_PAYMENT") {
                pm = { type: "VNPAY_SANDBOX" };
              } else if (vnpaySt === "PAID" && plan === "FULL") {
                pm = { type: "VNPAY_SANDBOX" };
              } else if (vnpaySt === "PAID" && plan === "DEPOSIT") {
                pm = { type: "CASH" };
              } else {
                pm =
                  prev?.paymentMethod ??
                  navState?.paymentMethod ?? { type: "CASH" };
              }

              return {
                ...(prev ?? navState),
                orderId: order!.id,
                plan,
                vnpayPaymentStatus: vnpaySt,
                vnpayAmountVnd: order!.vnpayAmountVnd ?? undefined,
                depositAmount: depAmt,
                depositPaid: paidOnlineDisplay,
                totalPrice: total,
                expiresAt: order!.expiresAt
                  ? new Date(order!.expiresAt).getTime()
                  : undefined,
                fulfillmentType:
                  order!.fulfillmentType ??
                  prev?.fulfillmentType ??
                  navState?.fulfillmentType ??
                  "WAREHOUSE",
                paymentMethod: pm,
                totals: prev?.totals ?? navState?.totals ?? {},
              };
            });
          }
        }
      }

      let listingData: BikeDetail | null = null;
      try {
        listingData = await fetchListingById(id);
      } catch {
        listingData = null;
      }

      if (cancelled) return;

      if (listingData) {
        setListing(listingData);
        setError(null);
      } else if (order?.listing) {
        const fromOrder = listingSnapshotToDetail(id, order.listing);
        if (fromOrder) {
          setListing(fromOrder);
          setError(null);
        } else {
          setListing(null);
          setError(t("transaction.loadError"));
        }
      } else {
        setListing(null);
        setError(t("transaction.loadError"));
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, orderIdToFetch, t, locationKey]);

  const [now, setNow] = useState(() => Date.now());
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [vnpayResuming, setVnpayResuming] = useState(false);
  const [vnpayResumeError, setVnpayResumeError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /** Refetch order định kỳ khi đang chờ seller/kho xác nhận giao → cập nhật countdown ngay khi chuyển SHIPPING */
  const waitingForShip: OrderStatus[] = [
    "PENDING_SELLER_SHIP",
    "SELLER_SHIPPED",
    "AT_WAREHOUSE_PENDING_ADMIN",
    "RE_INSPECTION",
    "RE_INSPECTION_DONE",
  ];
  useEffect(() => {
    if (!orderIdToFetch || !orderStatus || !waitingForShip.includes(orderStatus)) return;
    const interval = setInterval(async () => {
      try {
        const order = await fetchOrderById(orderIdToFetch);
        const lid = order?.listingId ?? (order?.listing as { id?: string })?.id;
        if (!order || lid !== id) return;
        if (order.status !== orderStatus) {
          setOrderStatus(order.status);
          setOrderState((prev) => {
            const base = prev ?? {};
            return {
              ...base,
              orderId: order.id,
              plan: order.plan ?? base.plan ?? "DEPOSIT",
              vnpayPaymentStatus: order.vnpayPaymentStatus ?? base.vnpayPaymentStatus,
              depositAmount: order.depositAmount ?? base.depositAmount,
              totalPrice: order.totalPrice ?? base.totalPrice,
              fulfillmentType: (order.fulfillmentType ?? base.fulfillmentType) as OrderFulfillmentType,
              expiresAt: order.expiresAt
                ? new Date(order.expiresAt).getTime()
                : base.expiresAt,
              depositPaid: base.depositPaid,
              paymentMethod: base.paymentMethod,
              totals: base.totals,
            };
          });
        }
      } catch {
        /* ignore */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, orderIdToFetch, orderStatus]);

  async function handleResumeVnpay() {
    if (!state.orderId) return;
    setVnpayResumeError(null);
    setVnpayResuming(true);
    try {
      const { paymentUrl } = await resumeVnpayCheckoutOrder(state.orderId);
      const url = paymentUrl?.trim();
      if (!url) {
        setVnpayResumeError(t("checkout.vnpayNoUrl"));
        return;
      }
      window.location.assign(url);
    } catch (e) {
      setVnpayResumeError(
        e instanceof Error ? e.message : t("transaction.resumeVnpayError"),
      );
    } finally {
      setVnpayResuming(false);
    }
  }

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
  const plan = state.plan ?? "DEPOSIT";
  const vnpayPending = state.vnpayPaymentStatus === "PENDING_PAYMENT";
  const vnpayPaid = state.vnpayPaymentStatus === "PAID";
  const depositAmountValue =
    state.depositAmount ?? Math.round(totalPrice * 0.08);
  const vnpayDueNow =
    state.vnpayAmountVnd != null
      ? Math.round(Number(state.vnpayAmountVnd))
      : plan === "DEPOSIT"
        ? depositAmountValue
        : totalPrice;
  const codAfterDeposit =
    plan === "DEPOSIT"
      ? Math.max(0, totalPrice - depositAmountValue)
      : 0;

  let depositPaid: number;
  if (vnpayPending) {
    depositPaid = 0;
  } else if (vnpayPaid) {
    depositPaid = plan === "FULL" ? totalPrice : depositAmountValue;
  } else {
    depositPaid =
      typeof state.depositPaid === "number"
        ? state.depositPaid
        : state.totals?.deposit ?? depositAmountValue;
  }

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

  function formatPaymentMethod(
    pm?: PaymentMethod,
    ctx?: { plan?: "DEPOSIT" | "FULL"; vnpay?: TxState["vnpayPaymentStatus"] },
  ) {
    if (ctx?.vnpay === "PENDING_PAYMENT") {
      return t("transaction.paymentPendingVnpay");
    }
    if (ctx?.vnpay === "PAID" && ctx.plan === "DEPOSIT") {
      return t("transaction.payDepositOnlineRestCod");
    }
    if (ctx?.vnpay === "PAID" && ctx.plan === "FULL") {
      return t("transaction.payFullVnpayOnly");
    }
    if (!pm) return "—";
    if (pm.type === "CASH") return t("transaction.payCash");
    if (pm.type === "VNPAY_QR") return t("transaction.payVnpayQr");
    if (pm.type === "VNPAY_SANDBOX") return t("transaction.payOnlineVnpay");
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
          {vnpayPending && state.orderId ? (
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardContent className="space-y-3 pt-6">
                <p className="text-sm font-semibold">
                  {t("transaction.pendingVnpayBannerTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("transaction.pendingVnpayBannerDesc")}
                </p>
                {vnpayResumeError ? (
                  <p className="text-sm text-destructive">{vnpayResumeError}</p>
                ) : null}
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleResumeVnpay}
                  disabled={vnpayResuming}
                >
                  {vnpayResuming
                    ? t("transaction.resumingVnpay")
                    : t("transaction.resumeVnpay")}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* Countdown: hiển thị khi đơn đã vào giai đoạn giao hàng (SHIPPING) */}
          <Card>
            <CardHeader>
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Clock className="h-4 w-4" />
                {orderStatus === "SHIPPING" || orderStatus === "RE_INSPECTION_DONE"
                  ? t("transaction.timeRemainingCompleteOrder")
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
                    ? step === "RESERVED" && vnpayPending
                      ? t("transaction.depositPendingVnpayProgress")
                      : step === "SHIPPING" &&
                          WAREHOUSE_PHASE_STATUSES.includes(orderStatus)
                        ? t("transaction.waitingForShippingStart")
                        : stepDescFor(step, isDirect, t)
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
                    {formatPaymentMethod(state.paymentMethod, {
                      plan,
                      vnpay: state.vnpayPaymentStatus,
                    })}
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
                    to={
                      orderId
                        ? `/finalize/${listing.id}?orderId=${encodeURIComponent(orderId)}`
                        : `/finalize/${listing.id}`
                    }
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
                    ? vnpayPending
                      ? t("transaction.waitCompleteVnpayDeposit")
                      : t("transaction.waitPaymentDone")
                    : orderStatus === "PENDING_SELLER_SHIP"
                      ? isDirect
                        ? t("transaction.waitSellerShipDirect")
                        : t("transaction.waitSellerShip")
                      : (orderStatus && WAREHOUSE_PHASE_STATUSES.includes(orderStatus))
                        ? t("transaction.waitingForShippingStart")
                        : isDirect
                          ? t("transaction.orderInProgressDirect")
                          : t("transaction.orderInProgress")}
                </p>
              )}
              {(orderStatus === "RESERVED" ||
                orderStatus === "IN_TRANSACTION" ||
                !orderStatus ||
                orderStatus === "PENDING_SELLER_SHIP") &&
                isDirect && (
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => setCancelOpen(true)}
                >
                  {t("transaction.cancelReservation")}
                </Button>
              )}
              {isDirect && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {t("transaction.refundPolicyNote")}
                </p>
              )}
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
                  {vnpayPending ? (
                    <>
                      <div className="flex items-center justify-between bg-muted/50 px-4 py-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("transaction.paidOnlineSoFar")}
                        </span>
                        <span className="font-semibold">
                          {formatMoney(0, currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("transaction.dueViaVnpayNow")}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatMoney(vnpayDueNow, currency)}
                        </span>
                      </div>
                      {plan === "DEPOSIT" ? (
                        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                          <span className="text-muted-foreground">
                            {t("transaction.remainingOnDeliveryAfterDeposit")}
                          </span>
                          <span className="font-semibold">
                            {formatMoney(codAfterDeposit, currency)}
                          </span>
                        </div>
                      ) : null}
                    </>
                  ) : vnpayPaid && plan === "FULL" ? (
                    <>
                      <div className="flex items-center justify-between bg-muted/50 px-4 py-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("transaction.fullyPaidOnline")}
                        </span>
                        <span className="font-semibold">
                          {formatMoney(totalPrice, currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("transaction.remainingOnDelivery")}
                        </span>
                        <span className="font-semibold">
                          {formatMoney(0, currency)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between bg-muted/50 px-4 py-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("transaction.depositPaid")}
                        </span>
                        <span className="font-semibold">
                          {formatMoney(depositPaid, currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("transaction.remainingOnDelivery")}
                        </span>
                        <span className="font-semibold">
                          {formatMoney(Math.max(0, totalPrice - depositPaid), currency)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>
                    {t("transaction.payment")}:{" "}
                    <span className="font-semibold">
                      {formatPaymentMethod(state.paymentMethod, {
                        plan,
                        vnpay: state.vnpayPaymentStatus,
                      })}
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
