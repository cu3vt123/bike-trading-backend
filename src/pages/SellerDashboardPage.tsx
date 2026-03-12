import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Star } from "lucide-react";
import type { Listing, ListingState } from "@/types/shopbike";
import { fetchSellerDashboard, syncSellerOrderNotifications } from "@/services/sellerService";

// Mock: orders / deposits
const MOCK_ORDERS = [
  { id: "ORD-101", bike: "Trek Domane SL", buyer: "buyer_01", amount: 3100, deposit: 248, status: "RESERVED" },
  { id: "ORD-102", bike: "Cervelo S5", buyer: "rider_99", amount: 6900, deposit: 552, status: "PAID" },
];

function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function stateLabel(state: ListingState) {
  switch (state) {
    case "DRAFT":
      return {
        text: "Nháp",
        cls: "bg-muted text-foreground border-border",
      };
    case "PENDING_INSPECTION":
      return {
        text: "Đang duyệt",
        cls: "bg-warning/15 text-warning border-warning/30",
      };
    case "NEED_UPDATE":
      return {
        text: "Cần cập nhật",
        cls: "bg-destructive/10 text-destructive border-destructive/30",
      };
    case "PUBLISHED":
      return {
        text: "Đã xuất bản",
        cls: "bg-primary/10 text-primary border-primary/30",
      };
    case "REJECTED":
      return {
        text: "Từ chối",
        cls: "bg-muted/80 text-muted-foreground border-border",
      };
    default:
      return {
        text: state,
        cls: "bg-muted/80 text-muted-foreground border-border",
      };
  }
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
  const [stats, setStats] = useState({ total: 0, published: 0, inReview: 0, needUpdate: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    syncSellerOrderNotifications();
    fetchSellerDashboard()
      .then(({ stats: s, listings: ls }) => {
        setStats(s);
        setListings(ls);
      })
      .finally(() => setLoading(false));
  }, []);

  const { total, published, inReview, needUpdate } = stats;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-foreground">
            Kênh người bán
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Quản lý tin đăng, kiểm định và xuất bản.
          </div>
        </div>

        <Link
          to="/seller/listings/new"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          + Tạo tin mới
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng tin" value={total} />
        <StatCard
          label="Tin đang bán"
          value={published}
          hint="Chỉ PUBLISHED + APPROVE"
        />
        <StatCard label="Đang duyệt" value={inReview} />
        <StatCard label="Cần cập nhật" value={needUpdate} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Inventory table */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">
              Kho tin của bạn
            </div>
            <Link to="/seller" className="text-sm font-semibold text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-12 bg-muted px-4 py-3 text-xs font-semibold text-muted-foreground">
              <div className="col-span-6">Tin đăng</div>
              <div className="col-span-2 text-right">Giá</div>
              <div className="col-span-2 text-center">Trạng thái</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>

            <div className="divide-y divide-border">
              {listings.map((x) => {
                const badge = stateLabel(x.state);
                const canEdit =
                  x.state === "DRAFT" || x.state === "NEED_UPDATE";
                const needUpdateReason =
                  x.state === "NEED_UPDATE"
                    ? (x as any).inspectionNeedUpdateReason || ""
                    : "";

                return (
                  <div
                    key={x.id}
                    className="grid grid-cols-12 items-center px-4 py-3"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="h-10 w-14 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={x.thumbnailUrl ?? x.imageUrls?.[0] ?? ""}
                          alt={x.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {x.title || `${x.brand} ${x.model ?? ""}`}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {x.brand}
                          {x.model ? ` · ${x.model}` : ""}
                        </div>
                        {needUpdateReason && (
                          <div className="mt-1 text-xs text-destructive">
                            Phản hồi kiểm định: {needUpdateReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 text-right text-sm font-semibold text-foreground">
                      {formatMoney(x.price, "VND")}
                    </div>

                    <div className="col-span-2 text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    </div>

                    <div className="col-span-2 text-right">
                      {canEdit ? (
                        <Link
                          to={`/seller/listings/${x.id}/edit`}
                          className="inline-flex rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          Sửa
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="inline-flex cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                        >
                          Khóa
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            Nháp/Cần cập nhật có thể sửa. Đang duyệt khóa sửa. Đã xuất bản giới hạn thay đổi nội dung.
          </div>
        </div>

        {/* New Listing Draft panel */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold text-foreground">
            Tin nháp mới
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Tạo nháp trước, sau đó gửi kiểm định.
          </div>

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Tiêu đề tin"
            />
            <input
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Giá (VNĐ)"
            />

            <div className="rounded-xl border border-border bg-muted p-3">
              <div className="text-xs font-semibold text-foreground">
                Checklist ảnh
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• Toàn xe (hai bên)</li>
                <li>• Serial khung</li>
                <li>• Hệ truyền động</li>
                <li>• Phanh / bánh</li>
              </ul>
            </div>

            <Link
              to="/seller/listings/new"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Tiếp tục soạn tin →
            </Link>
          </div>
        </div>
      </div>

      {/* Orders & Ratings row */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Đơn hàng / Đặt cọc</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Quản lý đơn và đặt cọc.</p>
          <div className="mt-4 space-y-3">
            {MOCK_ORDERS.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">{o.bike}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.id} • {o.buyer} • Đặt cọc {formatMoney(o.deposit)}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    o.status === "PAID" ? "bg-primary/10 text-primary" : "bg-warning/15 text-warning"
                  }`}
                >
                  {o.status === "PAID" ? "Đã thanh toán" : "Chờ xử lý"}
                </span>
              </div>
            ))}
            {MOCK_ORDERS.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">Chưa có đơn nào.</p>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sẽ tích hợp API khi Backend có endpoint quản lý đơn.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Đánh giá & uy tín</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Mức độ tin cậy từ người mua.</p>
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-border bg-muted/50 py-6">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">4.8</span>
              <span className="text-primary">★★★★★</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">12 đánh giá</p>
            <p className="mt-1 text-xs text-muted-foreground">97% phản hồi tích cực</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">5 sao</span>
              <span className="font-semibold">10</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">4 sao</span>
              <span className="font-semibold">2</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Đánh giá từ giao dịch thành công. Sẽ đồng bộ API khi có.
          </p>
        </div>
      </div>
    </div>
  );
}
