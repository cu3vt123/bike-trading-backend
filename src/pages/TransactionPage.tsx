import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/types/order";
import { INSPECTION_ROW_LABELS, INSPECTION_OVERALL_LABEL } from "@/constants/inspection";

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

function formatPaymentMethod(pm?: PaymentMethod) {
  if (!pm) return "—";
  if (pm.type === "CARD") return `${pm.brand} ending in ${pm.last4}`;
  return "Chuyển khoản ngân hàng";
}

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

function isStepDone(status: OrderStatus | null, step: OrderStatus): boolean {
  if (!status) return step === "RESERVED";
  const idx = SHIPPING_FLOW_STEPS.indexOf(step);
  const currentIdx =
    status === "IN_TRANSACTION"
      ? 0
      : SHIPPING_FLOW_STEPS.indexOf(status);
  if (currentIdx < 0) return idx < SHIPPING_FLOW_STEPS.indexOf("COMPLETED");
  return idx <= currentIdx || status === "COMPLETED";
}

export default function TransactionPage() {
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

  // When no state (refresh, bookmark) but orderId in URL → fetch order
  useEffect(() => {
    const orderIdFromUrl = searchParams.get("orderId");
    if (orderIdFromUrl && !locationState.orderId) {
      let cancelled = false;
      fetchOrderById(orderIdFromUrl)
        .then((o) => {
          if (!cancelled && o) {
            const listingId = o.listingId ?? (o.listing as { id?: string })?.id;
            if (listingId && id === listingId) {
              setOrderStatus(o.status);
              setOrderState({
                orderId: o.id,
                depositPaid: o.depositAmount ?? Math.round((o.totalPrice ?? 0) * 0.08),
                totalPrice: o.totalPrice ?? 0,
                expiresAt: o.expiresAt ? new Date(o.expiresAt).getTime() : undefined,
                paymentMethod: { type: "BANK_TRANSFER" },
                totals: {
                  deposit: o.depositAmount ?? Math.round((o.totalPrice ?? 0) * 0.08),
                  totalNow: o.depositAmount ?? o.totalPrice ?? 0,
                },
              });
            }
          }
        })
        .catch(() => {});
      return () => { cancelled = true; };
    }
  }, [searchParams, locationState.orderId, id]);

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
        if (!cancelled) setError(err?.message ?? "Failed to load listing.");
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

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Đang tải giao dịch...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Card className="mx-auto max-w-6xl">
        <CardContent className="py-12">
          <h1 className="text-lg font-semibold">Không tìm thấy giao dịch</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? "Unable to load this transaction."}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Về trang chủ</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Giao dịch</h1>
          <Badge className="mt-2" variant="default">
            RESERVED / IN TRANSACTION
          </Badge>
          <p className="mt-2 text-sm text-muted-foreground">
            Updated just now • Order #{orderId}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            My orders
          </Button>
          <Button variant="outline" onClick={() => navigate(`/bikes/${listing.id}`)}>
            Xem tin đăng
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          {/* Countdown */}
          <Card>
            <CardHeader>
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Clock className="h-4 w-4" />
                TIME LEFT TO COMPLETE PURCHASE
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: hours, label: "Hours" },
                  { val: minutes, label: "Minutes" },
                  { val: seconds, label: "Seconds" },
                ].map(({ val, label }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-primary">{pad2(val)}</div>
                    <div className="mt-1 text-xs text-primary/80">{label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">Tiến trình giao dịch</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {(orderStatus ? SHIPPING_FLOW_STEPS : (["RESERVED", "IN_TRANSACTION", "COMPLETED"] as OrderStatus[])).map((step) => {
                const done = orderStatus ? isStepDone(orderStatus, step) : (step === "RESERVED" || step === "IN_TRANSACTION");
                const title = ORDER_STATUS_LABEL[step];
                const desc =
                  step === "RESERVED"
                    ? "Đã đặt cọc thành công"
                    : step === "PENDING_SELLER_SHIP"
                      ? "Seller sẽ nhận thông báo và gửi xe tới kho"
                      : step === "SELLER_SHIPPED"
                        ? "Seller đã gửi xe, đang trên đường tới kho"
                        : step === "AT_WAREHOUSE_PENDING_ADMIN"
                          ? "Admin xác nhận xe đã tới kho"
                          : step === "RE_INSPECTION"
                            ? "Inspector kiểm định lại tại kho"
                            : step === "RE_INSPECTION_DONE"
                              ? "Đã xác nhận đúng, chuyển giao hàng"
                              : step === "SHIPPING"
                                ? "Đang giao hàng tới bạn"
                                : step === "COMPLETED"
                                  ? "Đã chuyển quyền sở hữu"
                                  : step === "IN_TRANSACTION"
                                    ? "Thanh toán số dư & giao hàng"
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
              <span className="text-sm font-semibold">Vận chuyển & Thanh toán</span>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-xs text-muted-foreground">Mã đơn</div>
                  <div className="mt-1 font-semibold">#{orderId}</div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-xs text-muted-foreground">Phương thức thanh toán</div>
                  <div className="mt-1 font-semibold">
                    {formatPaymentMethod(state.paymentMethod)}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4 sm:col-span-2">
                  <div className="text-xs text-muted-foreground">Địa chỉ giao hàng</div>
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
                    Đã hoàn thành — Xem chi tiết
                  </Link>
                </Button>
              ) : !orderStatus ||
                  orderStatus === "SHIPPING" ||
                  orderStatus === "RE_INSPECTION_DONE" ? (
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
                      ? "Xác nhận đã nhận hàng & Hoàn tất"
                      : "Hoàn tất mua hàng"}
                  </Link>
                </Button>
              ) : (
                <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
                  {orderStatus === "RESERVED" || orderStatus === "IN_TRANSACTION"
                    ? "Thanh toán xong, chờ seller gửi xe tới kho."
                    : orderStatus === "PENDING_SELLER_SHIP"
                      ? "Chờ seller gửi xe tới kho."
                      : orderStatus === "SELLER_SHIPPED" || orderStatus === "AT_WAREHOUSE_PENDING_ADMIN"
                        ? "Xe đang tới kho / chờ admin xác nhận."
                        : orderStatus === "RE_INSPECTION"
                          ? "Đang kiểm định lại tại kho."
                          : "Chờ bước tiếp theo."}
                </p>
              )}
              {(orderStatus === "RESERVED" || orderStatus === "IN_TRANSACTION" || !orderStatus) && (
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => setCancelOpen(true)}
                >
                  Hủy đặt chỗ
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Áp dụng chính sách hoàn tiền • Giới hạn hủy chống spam
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
                    <span className="text-muted-foreground">Đã đặt cọc</span>
                    <span className="font-semibold">
                      {formatMoney(depositPaid, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Còn lại khi giao hàng</span>
                    <span className="font-semibold">
                      {formatMoney(Math.max(0, totalPrice - depositPaid), currency)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>
                    Thanh toán:{" "}
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
                    Xem báo cáo kiểm định
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-semibold text-foreground">Liên hệ hỗ trợ</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hỗ trợ 24/7
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => setSupportOpen(true)}
                >
                  Chat với hỗ trợ
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
            <DialogTitle>Hủy đặt chỗ</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn hủy đặt chỗ này? Hoàn tiền sẽ được xử lý theo chính sách (trong vòng 7 ngày). Giới hạn hủy: tối đa 3 lần mỗi kỳ.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Giữ đặt chỗ
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelReservation}
              disabled={cancelling}
            >
              {cancelling ? "Đang hủy..." : "Hủy & Hoàn tiền"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspection Report Dialog */}
      {hasInspectionReport && (
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Báo cáo kiểm định</DialogTitle>
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
                  <span className="text-sm text-muted-foreground">{INSPECTION_ROW_LABELS[key]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{value}</span>
                    <Stars value={s ?? 0} />
                    <span className="text-xs text-muted-foreground">({(s ?? 0).toFixed(1)})</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">{INSPECTION_OVERALL_LABEL}</span>
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
            <DialogTitle>Liên hệ hỗ trợ</DialogTitle>
            <DialogDescription>
              Live chat sẽ có khi tích hợp Backend. Hiện tại vui lòng liên hệ{" "}
              <a href="mailto:support@shopbike.example.com" className="text-primary hover:underline">
                support@shopbike.example.com
              </a>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSupportOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
