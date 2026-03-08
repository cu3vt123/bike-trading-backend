import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchListingById } from "@/services/buyerService";
import type { BikeDetail } from "@/types/shopbike";

type PaymentMethod =
  | { type: "CARD"; brand: "Visa" | "Mastercard"; last4: string }
  | { type: "BANK_TRANSFER" };

type State = {
  orderId?: string;
  depositPaid?: number;
  totalPrice?: number;
  paymentMethod?: PaymentMethod;
  completedAt?: number;
};

function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function formatPaymentMethod(pm?: PaymentMethod) {
  if (!pm) return "—";
  if (pm.type === "CARD") return `${pm.brand} •••• ${pm.last4}`;
  return "Chuyển khoản ngân hàng";
}

export default function PurchaseSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as State;

  const [listing, setListing] = useState<BikeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchListingById(id)
      .then((data) => {
        if (!cancelled) setListing(data ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Không tải được tin đăng.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const currency = (listing?.currency ?? "VND") as "VND" | "USD";
  const total = state.totalPrice ?? listing?.price ?? 0;
  const deposit = state.depositPaid ?? 0;
  const due = Math.max(0, total - deposit);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="py-12">
          <h1 className="text-lg font-semibold">Không thể mở trang thành công</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? "Thiếu thông tin tin đăng."}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Về trang chủ</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="overflow-hidden border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">
                <CheckCircle className="h-4 w-4" />
                Thanh toán thành công
              </div>
              <h1 className="mt-3 text-2xl font-semibold">
                Đơn hàng đã hoàn tất
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Giao dịch của bạn đã được xác nhận.
              </p>
              {state.orderId && (
                <p className="mt-3 text-sm">
                  Order ID: <span className="font-semibold">{state.orderId}</span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate("/profile", { replace: true })} variant="outline">
                Xem đơn hàng của tôi
              </Button>
              <Button onClick={() => navigate("/", { replace: true })}>
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-semibold">Xe</div>
                <p className="mt-2 text-sm">{listing.brand} {listing.model ?? ""}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {listing.year ?? "—"} • {listing.frameSize ?? "—"} •{" "}
                  {listing.location ?? "—"}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to={`/bikes/${listing.id}`}>Xem tin đăng</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-semibold">Thanh toán</div>
                <div className="mt-3 space-y-2 rounded-lg border p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng</span>
                    <span className="font-semibold">{formatMoney(total, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Đã đặt cọc</span>
                    <span className="font-semibold">{formatMoney(deposit, currency)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Số dư</span>
                    <span className="font-semibold">{formatMoney(due, currency)}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Phương thức:{" "}
                  <span className="font-semibold">
                    {formatPaymentMethod(state.paymentMethod)}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Cảm ơn bạn đã mua sắm tại ShopBike. Đơn hàng được lưu tại{" "}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="font-medium text-primary hover:underline"
        >
          Hồ sơ → Đơn hàng của tôi
        </button>
        .
      </p>
    </div>
  );
}
