import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { syncSellerOrderNotifications } from "@/services/sellerService";
import { syncAdminOrderNotifications } from "@/services/adminService";
import { Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const { t } = useTranslation();
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
    if (role === "SELLER") {
      setSyncing(true);
      try {
        await syncSellerOrderNotifications(t);
      } finally {
        setSyncing(false);
      }
      return;
    }
    if (role === "ADMIN") {
      setSyncing(true);
      try {
        await syncAdminOrderNotifications(t);
      } finally {
        setSyncing(false);
      }
    }
  }

  useEffect(() => {
    if (role === "SELLER") syncSellerOrderNotifications(t);
    if (role === "ADMIN") syncAdminOrderNotifications(t);
  }, [role, t]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("notifications.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("notifications.archive")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(role === "SELLER" || role === "ADMIN") && (
            <Button
              variant="default"
              size="sm"
              onClick={handleCheckNewOrders}
              disabled={syncing}
            >
              {syncing ? t("notifications.checking") : t("notifications.checkNewOrders")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUnreadOnly((v) => !v)}
          >
            {showUnreadOnly ? t("common.showAll") : t("common.showUnreadOnly")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearReadForRole(role)}
            disabled={readCount === 0}
          >
            {t("notifications.deleteRead")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("notifications.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {displayedItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {showUnreadOnly ? t("notifications.noUnread") : t("notifications.noNotifications")}
            </p>
          ) : (
            <div className="space-y-3">
              {displayedItems.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-4 ${n.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-foreground">
                      {n.titleKey ? t(n.titleKey, n.titleParams) : n.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      {n.read && (
                        <button
                          type="button"
                          onClick={() => removeItem(n.id)}
                          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title={t("notifications.delete")}
                          aria-label={t("notifications.deleteAria")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {n.messageKey ? t(n.messageKey, n.messageParams) : n.message}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {!n.read && (
                      <Button variant="outline" size="sm" onClick={() => markRead(n.id)}>
                        {t("notifications.markRead")}
                      </Button>
                    )}
                    {n.link && (
                      <Button asChild variant="outline" size="sm" onClick={() => markRead(n.id)}>
                        <Link to={n.link}>{t("notifications.open")}</Link>
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
