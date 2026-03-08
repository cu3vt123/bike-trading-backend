import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Shield, Heart, MessageCircle } from "lucide-react";
import type { BikeDetail } from "@/types/shopbike";
import { fetchListingById } from "@/services/buyerService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWishlistStore } from "@/stores/useWishlistStore";

type NavState = { listing?: BikeDetail };

function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function Stars({ value }: { value: number }) {
  const full = Math.round(Math.max(0, Math.min(5, value)));
  const stars = "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
  return <span className="text-primary">{stars}</span>;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fromState = (location.state as NavState | null)?.listing;

  const [listing, setListing] = useState<BikeDetail | null>(
    fromState && String(fromState.id) === String(id) ? fromState : null,
  );
  const [loading, setLoading] = useState(!fromState || String(fromState.id) !== String(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stateMatch = fromState && String(fromState.id) === String(id);
    if (stateMatch) {
      setListing(fromState!);
      setLoading(false);
      return;
    }
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListingById(id)
      .then((data) => {
        if (!cancelled) setListing(data);
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

  const images = useMemo(() => {
    const arr =
      listing?.imageUrls?.filter(Boolean) ??
      (listing?.thumbnailUrl ? [listing.thumbnailUrl] : []);
    if (arr.length > 0) return arr;
    return [
      "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1600&q=60",
    ];
  }, [listing]);

  const [active, setActive] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const inWishlist = useWishlistStore((s) => s.ids.has(listing?.id ?? ""));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const specs = useMemo(() => {
    const s = listing?.specs;
    if (Array.isArray(s)) return s;
    if (s && typeof s === "object") {
      return Object.entries(s).map(([label, value]) => ({
        label,
        value: String(value),
      }));
    }
    return [];
  }, [listing]);

  const CONDITION_VI: Record<string, string> = {
    NEW: "Mới",
    LIKE_NEW: "Như mới",
    MINT_USED: "Rất tốt (đã dùng)",
    GOOD_USED: "Tốt (đã dùng)",
    FAIR_USED: "Khá (đã dùng)",
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-28">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Đang tải tin đăng...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Card className="mx-auto max-w-6xl border-border">
        <CardContent className="py-16 text-center">
          <h1 className="text-xl font-bold">Không tìm thấy tin đăng</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "Tin đăng xe bạn tìm không tồn tại."}
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">Về trang chủ</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currency = (listing.currency ?? "VND") as "VND" | "USD";
  const price = listing.price;
  const msrp = listing.msrp;
  const score = listing.inspectionScore ?? 0;
  const inspectionReport = listing.inspectionReport;
  const hasInspectionReport =
    inspectionReport?.frameIntegrity &&
    inspectionReport?.drivetrainHealth &&
    inspectionReport?.brakingSystem;
  const isVerified =
    listing.state === "PUBLISHED" && listing.inspectionResult === "APPROVE";
  const canBuy = isVerified;
  const isPendingInspection = listing.state === "PENDING_INSPECTION";

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          Trang chủ
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">
          {listing.brand} {listing.model}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Gallery + content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gallery */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-8">
                  <div className="overflow-hidden rounded-xl border border-border bg-muted">
                    <div className="aspect-[4/3] w-full">
                      <img
                        src={images[Math.min(active, images.length - 1)]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4">
                  <div className="grid grid-cols-4 gap-3 md:grid-cols-2">
                    {images.slice(0, 4).map((src, idx) => (
                      <button
                        key={`${src}-${idx}`}
                        type="button"
                        onClick={() => setActive(idx)}
                        className={`overflow-hidden rounded-xl border-2 transition-all ${
                          idx === active
                            ? "border-primary ring-2 ring-primary/20 shadow-sm"
                            : "border-border hover:border-primary/30"
                        } bg-muted`}
                      >
                        <div className="aspect-square">
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </div>
                      </button>
                    ))}
                  </div>
                  {images.length > 4 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      +{images.length - 4} ảnh khác
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Title block + báo cáo nhà kiểm định (luôn có ở đây) */}
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {isVerified && (
                <Badge variant="default">
                  <Shield className="mr-1 h-3 w-3" />
                  Sàn đã xác minh • Đã kiểm định
                </Badge>
              )}
              <div className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm ${isVerified ? "bg-primary/10" : "bg-muted/80"}`}>
                <Stars value={score} />
                <span className="font-semibold text-foreground">
                  {score > 0 ? score.toFixed(1) : "0.0"}/5
                </span>
                <span className="text-muted-foreground">báo cáo nhà kiểm định</span>
                {!hasInspectionReport && !isVerified && (
                  <span className="text-muted-foreground"> (Chưa có báo cáo)</span>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {listing.brand} {listing.model}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{listing.title}</p>
          </div>

          {/* Báo cáo kiểm định – luôn hiển thị trong thông tin xe cho buyer */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <span className="text-sm font-semibold">Báo cáo kiểm định</span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Nội dung do kiểm định viên điền khi duyệt tin, hiển thị cho người mua.
                </p>
              </div>
              {hasInspectionReport && (
                <Button variant="link" size="sm" className="text-primary shrink-0" onClick={() => setReportOpen(true)}>
                  Xem báo cáo đầy đủ
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {hasInspectionReport ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { rowLabel: "Độ nguyên khung", ...inspectionReport.frameIntegrity },
                    { rowLabel: "Tình trạng hệ truyền động", ...inspectionReport.drivetrainHealth },
                    { rowLabel: "Hệ thống phanh", ...inspectionReport.brakingSystem },
                  ].map(({ rowLabel, label: value, score: s }) => (
                    <div key={rowLabel} className="rounded-xl border border-border bg-muted/50 p-4">
                      <div className="text-xs text-muted-foreground">{rowLabel}</div>
                      <div className="mt-2 text-sm font-semibold">{value}</div>
                      <div className="mt-1 text-xs">
                        <Stars value={s ?? 0} />{" "}
                        <span className="text-muted-foreground">({(s ?? 0).toFixed(1)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isVerified && score > 0 ? (
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <div className="text-xs text-muted-foreground">Điểm tổng thể</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Stars value={score} />
                    <span className="text-sm font-semibold">{score.toFixed(1)}/5</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tin đã được kiểm định. Báo cáo chi tiết từng hạng mục sẽ hiển thị khi kiểm định viên cập nhật.
                  </p>
                </div>
              ) : isPendingInspection ? (
                <p className="py-2 text-sm text-muted-foreground">
                  Đang chờ kiểm định. Kiểm định viên sẽ xem xét tin này và thêm báo cáo.
                </p>
              ) : !isVerified ? (
                <p className="py-2 text-sm text-muted-foreground">
                  Chưa có báo cáo kiểm định.
                </p>
              ) : (
                <p className="py-2 text-sm text-muted-foreground">
                  Chưa có điểm kiểm định. Tin sẽ được cập nhật sau khi kiểm định viên duyệt.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Specs */}
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">Thông số kỹ thuật</span>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <SpecRow label="Hãng" value={listing.brand} />
                <SpecRow label="Dòng xe" value={listing.model ?? "—"} />
                <SpecRow label="Năm" value={listing.year ? String(listing.year) : "—"} />
                <SpecRow label="Kích thước khung" value={listing.frameSize ?? "—"} />
                <SpecRow label="Tình trạng" value={listing.condition ? (CONDITION_VI[listing.condition] ?? listing.condition) : "—"} />
                <SpecRow label="Khu vực" value={listing.location ?? "—"} />
                {specs.map((s, idx) => (
                  <SpecRow key={`${s.label}-${idx}`} label={s.label} value={String(s.value)} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Report Dialog */}
          {hasInspectionReport && (
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Báo cáo kiểm định</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {[
                    { rowLabel: "Độ nguyên khung", ...inspectionReport!.frameIntegrity },
                    { rowLabel: "Tình trạng hệ truyền động", ...inspectionReport!.drivetrainHealth },
                    { rowLabel: "Hệ thống phanh", ...inspectionReport!.brakingSystem },
                  ].map(({ rowLabel, label: value, score: s }) => (
                    <div key={rowLabel} className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <span className="text-sm text-muted-foreground">{rowLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{value}</span>
                        <Stars value={s ?? 0} />
                        <span className="text-xs text-muted-foreground">({(s ?? 0).toFixed(1)})</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
                    <span className="text-sm text-muted-foreground">Điểm tổng thể</span>
                    <div className="flex items-center gap-2">
                      <Stars value={score} />
                      <span className="text-sm font-semibold">({score.toFixed(1)})</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* RIGHT: Price / actions */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <Card className="border-border shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Tổng giá</div>
                    <div className="mt-1 text-2xl font-bold">{formatMoney(price, currency)}</div>
                    {msrp && msrp > price && (
                      <div className="mt-1 text-xs text-muted-foreground line-through">
                        {formatMoney(msrp, currency)}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-primary">Đã bao gồm phí dịch vụ</p>
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-center ${isVerified ? "bg-primary/10" : isPendingInspection ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"}`}>
                    <div className="text-[10px] font-semibold">
                      {isVerified ? "ĐÃ KIỂM ĐỊNH" : isPendingInspection ? "ĐANG CHỜ" : "KHÔNG BÁN"}
                    </div>
                    {isVerified && (
                      <div className="mt-1 text-xs">
                        <Stars value={score} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {canBuy && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => toggleWishlist(listing.id)}
                      aria-label={inWishlist ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
                    >
                      <Heart
                        className={`h-4 w-4 ${inWishlist ? "fill-primary text-primary" : ""}`}
                      />
                    </Button>
                  )}
                  {canBuy && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setChatOpen(true)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Nhắn tin người bán
                    </Button>
                  )}
                </div>
                {canBuy ? (
                  <>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => navigate(`/checkout/${listing.id}`)}
                    >
                      Mua ngay →
                    </Button>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Đặt chỗ có hiệu lực sau khi <span className="font-semibold">thanh toán đặt cọc</span>{" "}
                      tại bước thanh toán và được giữ <span className="font-semibold">24 giờ</span>.
                    </p>
                  </>
                ) : isPendingInspection ? (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <span className="font-semibold">Đang chờ kiểm định.</span> Tin này đang được xem xét và chưa mở bán.
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-muted bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    Tin này không khả dụng để mua.
                  </div>
                )}

                <div className="mt-4 space-y-2 text-xs">
                  <InfoLine title="Thanh toán an toàn" desc="Giao dịch được bảo vệ qua sàn" />
                  <InfoLine title="Giao hàng bảo hiểm" desc="Hỗ trợ vận chuyển & bàn giao" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-semibold">Người bán</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {listing.seller?.name ?? "ProCyclist SF"} • 97% phản hồi • Đã xác minh
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageCircle className="mr-2 h-3.5 w-3.5" />
                  Nhắn tin
                </Button>
              </CardContent>
            </Card>

            {/* Chat placeholder dialog */}
            <Dialog open={chatOpen} onOpenChange={setChatOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nhắn tin với người bán</DialogTitle>
                </DialogHeader>
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Chat trực tuyến sẽ có khi tích hợp Backend. Hiện bạn có thể liên hệ qua email{" "}
                  <a href="mailto:support@shopbike.example.com" className="ml-1 text-primary hover:underline">
                    support@shopbike.example.com
                  </a>.
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function InfoLine({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-lg border bg-muted/30 px-3 py-2">
      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
