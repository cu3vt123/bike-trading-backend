import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  fetchPendingListings,
  approveListing,
  rejectListing,
  needUpdateListing,
} from "@/services/inspectorService";
import {
  fetchReInspectionOrders,
  submitReInspectionDone,
} from "@/services/adminService";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Listing } from "@/types/shopbike";
import type { InspectionReport } from "@/services/inspectorService";
import { Package } from "lucide-react";

const INSPECTION_OPTIONS = [
  { label: "Xuất sắc", score: 4.8 },
  { label: "Tốt", score: 4.2 },
  { label: "Khá tốt", score: 3.5 },
  { label: "Trung bình", score: 2.5 },
  { label: "Kém", score: 1 },
] as const;

function formatMoney(value: number, currency = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

export default function InspectorDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<{ id: string; action: "approve" | "reject" | "needUpdate" } | null>(null);
  const [needUpdateReason, setNeedUpdateReason] = useState("");
  const [inspectionReport, setInspectionReport] = useState<InspectionReport>({
    frameIntegrity: { score: 4.2, label: "Tốt" },
    drivetrainHealth: { score: 4.2, label: "Tốt" },
    brakingSystem: { score: 4.2, label: "Tốt" },
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reInspectionOrders, setReInspectionOrders] = useState<{ id: string; listingId: string; listing?: { brand?: string; model?: string }; status: string }[]>([]);
  const [reInspectionLoading, setReInspectionLoading] = useState(false);
  const [reInspectionSubmittingId, setReInspectionSubmittingId] = useState<string | null>(null);

  const loadReInspection = useCallback(() => {
    setReInspectionLoading(true);
    fetchReInspectionOrders()
      .then(setReInspectionOrders)
      .catch(() => setReInspectionOrders([]))
      .finally(() => setReInspectionLoading(false));
  }, []);

  const loadListings = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPendingListings()
      .then(setListings)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không tải được danh sách tin chờ kiểm định."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);
  useEffect(() => {
    loadReInspection();
  }, [loadReInspection]);

  async function handleAction() {
    if (!actionTarget) return;
    const { id, action } = actionTarget;
    setActionError(null);
    setActionLoading(true);
    try {
      if (action === "approve") await approveListing(id, inspectionReport);
      else if (action === "reject") await rejectListing(id);
      else {
        if (!needUpdateReason.trim() || needUpdateReason.trim().length < 5) {
          setActionError("Vui lòng nhập lý do rõ ràng (ít nhất 5 ký tự) cho người bán.");
          setActionLoading(false);
          return;
        }
        await needUpdateListing(id, needUpdateReason.trim());
      }
      setListings((prev) => prev.filter((l) => l.id !== id));
      setActionTarget(null);
      setNeedUpdateReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  }

  function setReportField(
    key: keyof InspectionReport,
    value: { score: number; label: string },
  ) {
    setInspectionReport((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bảng điều khiển kiểm định viên</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kiểm tra và duyệt tin đăng đang chờ xem xét.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <Button variant="link" size="sm" className="ml-2" onClick={loadListings}>
            Thử lại
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Đang tải tin chờ kiểm định...</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <span className="text-sm font-semibold">Tin đăng chờ kiểm định</span>
            <Badge variant="secondary">{listings.length} chờ</Badge>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                Chưa có tin nào chờ kiểm định.
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex gap-4">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.thumbnailUrl ?? ""}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {item.brand} {item.model ?? ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.title}
                        </div>
                        <div className="mt-1 text-sm">
                          {formatMoney(item.price, item.currency ?? "VND")} • {item.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => setActionTarget({ id: item.id, action: "approve" })}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setActionTarget({ id: item.id, action: "reject" })}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={() => setActionTarget({ id: item.id, action: "needUpdate" })}
                      >
                        <AlertCircle className="mr-1 h-4 w-4" />
                        Yêu cầu cập nhật
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/bikes/${item.id}`}>Xem chi tiết</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Duyệt → Xuất bản. Từ chối → Đóng. Yêu cầu cập nhật → Người bán phải gửi lại.
            </p>
          </CardContent>
        </Card>

        {/* Kiểm định lại tại kho (sau khi admin xác nhận xe tới kho) */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Package className="h-4 w-4" />
              Kiểm định lại tại kho
            </span>
            <Badge variant="outline">{reInspectionOrders.length} đơn</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-muted-foreground">
              Xe đã được admin xác nhận tới kho. Inspector kiểm tra lại đúng như seller mô tả thì bấm xác nhận → đơn chuyển &quot;Đang giao hàng&quot;.
            </p>
            {reInspectionLoading ? (
              <div className="flex justify-center py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : reInspectionOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                Không có đơn nào cần kiểm định lại.
              </div>
            ) : (
              <div className="space-y-3">
                {reInspectionOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {order.listing?.brand} {order.listing?.model ?? order.listingId}
                      </div>
                      <div className="text-xs text-muted-foreground">Đơn {order.id}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={async () => {
                        setReInspectionSubmittingId(order.id);
                        try {
                          await submitReInspectionDone(order.id);
                          loadReInspection();
                        } finally {
                          setReInspectionSubmittingId(null);
                        }
                      }}
                      disabled={reInspectionSubmittingId === order.id}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      {reInspectionSubmittingId === order.id ? "Đang xử lý..." : "Xác nhận đúng như mô tả"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex gap-4">
        <Button asChild variant="outline">
          <Link to="/">← Về trang chủ</Link>
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={!!actionTarget} onOpenChange={(o) => !o && setActionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionTarget?.action === "approve" && "Duyệt tin đăng"}
              {actionTarget?.action === "reject" && "Từ chối tin đăng"}
              {actionTarget?.action === "needUpdate" && "Yêu cầu người bán cập nhật"}
            </DialogTitle>
            <DialogDescription>
              {actionTarget?.action === "approve" && "Điền báo cáo kiểm định. Nội dung sẽ hiển thị cho người mua."}
              {actionTarget?.action === "reject" && "Tin sẽ bị từ chối, người bán không thể gửi lại."}
              {actionTarget?.action === "needUpdate" && "Người bán phải cập nhật theo phản hồi trước khi gửi lại."}
            </DialogDescription>
          </DialogHeader>
          {actionTarget?.action === "approve" && (
            <div className="space-y-4 py-4">
              <p className="text-sm font-medium">Báo cáo kiểm định (bắt buộc)</p>
              <p className="text-xs text-muted-foreground">
                Sau khi bấm Xác nhận, nội dung báo cáo (Độ nguyên khung, Truyền động, Phanh) sẽ hiển thị trên trang chi tiết xe cho người mua.
              </p>
              {(["frameIntegrity", "drivetrainHealth", "brakingSystem"] as const).map((key) => {
                const labels: Record<typeof key, string> = {
                  frameIntegrity: "Độ nguyên khung",
                  drivetrainHealth: "Tình trạng hệ truyền động",
                  brakingSystem: "Hệ thống phanh",
                };
                const val = inspectionReport[key];
                return (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-32 shrink-0">{labels[key]}</Label>
                    <Select
                      value={val.label}
                      onValueChange={(v) => {
                        const opt = INSPECTION_OPTIONS.find((o) => o.label === v);
                        if (opt) setReportField(key, { label: opt.label, score: opt.score });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INSPECTION_OPTIONS.map((o) => (
                          <SelectItem key={o.label} value={o.label}>
                            {o.label} ({(o.score).toFixed(1)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
          {actionTarget?.action === "needUpdate" && (
            <div className="space-y-2 py-2">
              <Label htmlFor="need-update-reason">Lý do yêu cầu cập nhật (bắt buộc)</Label>
              <Input
                id="need-update-reason"
                placeholder="Ví dụ: Thêm ảnh toàn xe, ảnh hệ truyền động rõ hơn, sửa size trong tiêu đề…"
                value={needUpdateReason}
                onChange={(e) => setNeedUpdateReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Nội dung này sẽ hiển thị cho người bán tại bảng điều khiển và trang chỉnh sửa.
              </p>
            </div>
          )}
          {actionError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {actionError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionTarget(null); setActionError(null); }} disabled={actionLoading}>
              Hủy
            </Button>
            <Button onClick={handleAction} disabled={actionLoading}>
              {actionLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
