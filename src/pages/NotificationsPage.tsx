import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { syncSellerOrderNotifications } from "@/services/sellerService";

export default function NotificationsPage() {
  const role = useAuthStore((s) => s.role);
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllReadForRole = useNotificationStore((s) => s.markAllReadForRole);
  const clearForRole = useNotificationStore((s) => s.clearForRole);
  const [syncing, setSyncing] = useState(false);

  if (!role) return null;

  const myItems = items.filter((x) => x.role === role);

  async function handleCheckNewOrders() {
    if (role !== "SELLER") return;
    setSyncing(true);
    try {
      await syncSellerOrderNotifications();
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (role === "SELLER") syncSellerOrderNotifications();
  }, [role]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thông báo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kho lưu trữ toàn bộ thông báo hệ thống của bạn.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {role === "SELLER" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleCheckNewOrders}
              disabled={syncing}
            >
              {syncing ? "Đang kiểm tra..." : "Kiểm tra đơn mới"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => markAllReadForRole(role)}>
            Đánh dấu đã đọc
          </Button>
          <Button variant="outline" size="sm" onClick={() => clearForRole(role)}>
            Xoá kho thông báo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          {myItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Chưa có thông báo nào.</p>
          ) : (
            <div className="space-y-3">
              {myItems.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-4 ${n.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-foreground">{n.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{n.message}</div>
                  <div className="mt-3 flex gap-2">
                    {!n.read && (
                      <Button variant="outline" size="sm" onClick={() => markRead(n.id)}>
                        Đã đọc
                      </Button>
                    )}
                    {n.link && (
                      <Button asChild variant="outline" size="sm" onClick={() => markRead(n.id)}>
                        <Link to={n.link}>Mở</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
