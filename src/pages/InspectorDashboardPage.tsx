import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { inspectorApi } from "@/apis/inspectorApi";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
import type { Listing } from "@/types/shopbike";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

// Mock: tin chờ kiểm định (Sprint 3 – sẽ đổi sang inspectorApi khi BE sẵn sàng)
const MOCK_PENDING: Listing[] = [
  {
    id: "S-102",
    title: "Trek Domane SL — submitted for review",
    brand: "Trek",
    price: 3100,
    location: "Da Nang",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1400&q=60",
    state: "PENDING_INSPECTION",
    inspectionResult: null,
  },
  {
    id: "S-105",
    title: "Giant TCR Advanced — awaiting inspection",
    brand: "Giant",
    price: 2800,
    location: "Ho Chi Minh City",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1525104885112-7c9f2a2c63a1?auto=format&fit=crop&w=1400&q=60",
    state: "PENDING_INSPECTION",
    inspectionResult: null,
  },
];

function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

export default function InspectorDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{ id: string; action: "approve" | "reject" | "needUpdate" } | null>(null);
  const [needUpdateReason, setNeedUpdateReason] = useState("");

  const loadListings = useCallback(() => {
    if (USE_MOCK) {
      setListings(MOCK_PENDING);
      setLoading(false);
      return;
    }
    inspectorApi
      .getPendingListings()
      .then(setListings)
      .catch(() => setListings(MOCK_PENDING))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    loadListings();
  }, [loadListings]);

  async function handleAction() {
    if (!actionTarget) return;
    const { id, action } = actionTarget;
    try {
      if (action === "approve") {
        if (!USE_MOCK) await inspectorApi.approve(id);
      } else if (action === "reject") {
        if (!USE_MOCK) await inspectorApi.reject(id);
      } else {
        if (!USE_MOCK) await inspectorApi.needUpdate(id, needUpdateReason);
      }
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      // Giữ nguyên danh sách, có thể toast lỗi
    }
    setActionTarget(null);
    setNeedUpdateReason("");
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inspector Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kiểm định và duyệt các tin đăng chờ xử lý.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <span className="text-sm font-semibold">Tin chờ kiểm định</span>
            <Badge variant="secondary">{listings.length} pending</Badge>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                Không có tin nào chờ kiểm định.
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
                          {formatMoney(item.price, item.currency ?? "USD")} • {item.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
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
                        Cần cập nhật
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
              Sprint 3 • Inspector Dashboard (mock data). Khi BE có API sẽ gọi thật.
            </p>
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
              {actionTarget?.action === "needUpdate" && "Yêu cầu cập nhật"}
            </DialogTitle>
            <DialogDescription>
              {actionTarget?.action === "approve" && "Tin sẽ được xuất bản lên marketplace."}
              {actionTarget?.action === "reject" && "Tin sẽ bị từ chối, seller không thể gửi lại."}
              {actionTarget?.action === "needUpdate" && "Seller cần cập nhật theo góp ý trước khi gửi lại."}
            </DialogDescription>
          </DialogHeader>
          {actionTarget?.action === "needUpdate" && (
            <div className="py-2">
              <label className="text-sm font-medium">Lý do (tùy chọn)</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Ví dụ: Cần thêm ảnh góc toàn xe"
                value={needUpdateReason}
                onChange={(e) => setNeedUpdateReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionTarget(null)}>
              Hủy
            </Button>
            <Button onClick={handleAction}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
