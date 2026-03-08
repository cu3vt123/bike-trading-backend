import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileCheck,
  AlertTriangle,
  Tags,
  CreditCard,
  BarChart3,
  Package,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchOrdersForWarehouseConfirm,
  confirmWarehouseArrival,
  fetchAdminStats,
  type AdminStats,
} from "@/services/adminService";
import { ORDER_STATUS_LABEL } from "@/types/order";
import type { Order } from "@/types/order";

const TABS = [
  { id: "warehouse", label: "Xác nhận xe tới kho", icon: Package },
  { id: "users", label: "Quản lý người dùng", icon: Users },
  { id: "listings", label: "Kiểm duyệt tin đăng", icon: FileCheck },
  { id: "reports", label: "Báo cáo vi phạm / Tranh chấp", icon: AlertTriangle },
  { id: "categories", label: "Danh mục xe & Thương hiệu", icon: Tags },
  { id: "transactions", label: "Giao dịch & Phí dịch vụ", icon: CreditCard },
  { id: "stats", label: "Thống kê & Báo cáo", icon: BarChart3 },
] as const;

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("warehouse");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [warehouseOrders, setWarehouseOrders] = useState<(Order & { listing?: { brand?: string; model?: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const loadStats = useCallback(() => {
    fetchAdminStats().then(setStats).catch(() => setStats(null));
  }, []);
  const loadWarehouse = useCallback(() => {
    setLoading(true);
    fetchOrdersForWarehouseConfirm()
      .then(setWarehouseOrders)
      .catch(() => setWarehouseOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);
  useEffect(() => {
    if (activeTab === "warehouse") loadWarehouse();
  }, [activeTab, loadWarehouse]);

  async function handleConfirmWarehouse(orderId: string) {
    setConfirmingId(orderId);
    try {
      await confirmWarehouseArrival(orderId);
      loadWarehouse();
      loadStats();
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kênh Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý người dùng, kiểm duyệt tin, xử lý báo cáo, danh mục, giao dịch và xác nhận xe tới kho.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/">← Trang chủ</Link>
        </Button>
      </div>

      {stats && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Tổng người dùng</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{stats.totalListings}</div>
              <div className="text-xs text-muted-foreground">Tin đăng</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{stats.ordersPendingWarehouse}</div>
              <div className="text-xs text-muted-foreground">Chờ xác nhận tới kho</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{stats.ordersReInspection}</div>
              <div className="text-xs text-muted-foreground">Đang kiểm định lại</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 flex-wrap gap-1 lg:w-56 lg:flex-col">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {activeTab === "warehouse" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Xác nhận xe đã tới kho
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Khi seller đã gửi xe tới kho, admin xác nhận tại đây. Sau đó inspector sẽ kiểm định lại xe; xác nhận đúng
                  như mô tả thì đơn chuyển sang &quot;Đang giao hàng&quot;.
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : warehouseOrders.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Không có đơn nào đang chờ xác nhận tới kho.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {warehouseOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                      >
                        <div>
                          <div className="font-semibold text-foreground">
                            {order.listing?.brand} {order.listing?.model ?? order.listingId}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Đơn {order.id} · {ORDER_STATUS_LABEL[order.status]} · {formatMoney(order.totalPrice)}
                          </div>
                        </div>
                        {(order.status === "SELLER_SHIPPED" || order.status === "AT_WAREHOUSE_PENDING_ADMIN") && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmWarehouse(order.id)}
                            disabled={confirmingId === order.id}
                          >
                            {confirmingId === order.id ? "Đang xác nhận..." : "Xác nhận xe đã tới kho"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quản lý người dùng (Buyer, Seller)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Xem danh sách, khoá/mở khoá tài khoản. (Tích hợp API sau.)
                </p>
              </CardHeader>
              <CardContent>
                <p className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  Chức năng sẽ có khi backend cung cấp API quản lý người dùng.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "listings" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Kiểm duyệt tin đăng
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Duyệt/từ chối tin từ seller. Có thể dùng trang Kiểm định viên.
                </p>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link to="/inspector">Mở trang Kiểm định viên →</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "reports" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Xử lý báo cáo vi phạm / Tranh chấp
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Xem và xử lý báo cáo vi phạm, tranh chấp giữa buyer và seller. (Tích hợp API sau.)
                </p>
              </CardHeader>
              <CardContent>
                <p className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  Chức năng sẽ có khi backend cung cấp API báo cáo và tranh chấp.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "categories" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Quản lý danh mục xe & Thương hiệu
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Thêm/sửa/xoá danh mục xe, thương hiệu. (Tích hợp API sau.)
                </p>
              </CardHeader>
              <CardContent>
                <p className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  Chức năng sẽ có khi backend cung cấp API danh mục và thương hiệu.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "transactions" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Quản lý giao dịch & Phí dịch vụ
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Xem lịch sử giao dịch, cấu hình phí dịch vụ. (Tích hợp API sau.)
                </p>
              </CardHeader>
              <CardContent>
                <p className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  Chức năng sẽ có khi backend cung cấp API giao dịch và phí.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "stats" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Thống kê & Báo cáo hệ thống
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tổng quan doanh thu, đơn hàng, người dùng. (Tích hợp API sau.)
                </p>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-lg font-semibold text-foreground">{stats.totalBuyers}</div>
                      <div className="text-xs text-muted-foreground">Buyer</div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-lg font-semibold text-foreground">{stats.totalSellers}</div>
                      <div className="text-xs text-muted-foreground">Seller</div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-lg font-semibold text-foreground">{stats.totalOrders}</div>
                      <div className="text-xs text-muted-foreground">Tổng đơn hàng</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
