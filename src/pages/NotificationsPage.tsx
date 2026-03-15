import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { syncSellerOrderNotifications } from "@/services/sellerService";
import { Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const role = useAuthStore((s) => s.role);
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const clearReadForRole = useNotificationStore((s) => s.clearReadForRole);
  const removeItem = useNotificationStore((s) => s.removeItem);
  const [syncing, setSyncing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  if (!role) return null;

  const myItems = items.filter((x) => x.role === role);
  const displayedItems = showUnreadOnly ? myItems.filter((x) => !x.read) : myItems;
  const readCount = myItems.filter((x) => x.read).length;

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUnreadOnly((v) => !v)}
          >
            {showUnreadOnly ? "Hiển thị tất cả" : "Hiển thị thông báo chưa đọc"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearReadForRole(role)}
            disabled={readCount === 0}
          >
            Xóa tin đã đọc
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          {displayedItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {showUnreadOnly ? "Không còn thông báo chưa đọc." : "Chưa có thông báo nào."}
            </p>
          ) : (
            <div className="space-y-3">
              {displayedItems.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-4 ${n.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-foreground">{n.title}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      {n.read && (
                        <button
                          type="button"
                          onClick={() => removeItem(n.id)}
                          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Xóa"
                          aria-label="Xóa thông báo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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
