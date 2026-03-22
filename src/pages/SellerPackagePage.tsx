import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { packagesApi, type PackagesCatalogResponse } from "@/apis/packagesApi";
import { authApi } from "@/apis/authApi";
import {
  useSellerSubscriptionStore,
  normalizeSubscriptionPayload,
} from "@/stores/useSellerSubscriptionStore";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { VNPAY_UI_MAINTENANCE } from "@/lib/featureFlags";
import { VnpayMaintenanceNotice } from "@/components/payment/VnpayMaintenanceNotice";
import type { SubscriptionCheckoutResponse } from "@/apis/packagesApi";

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Tránh BE trả localhost:5173 trong khi user đang dùng 127.0.0.1 (tab mới mất token → login → về nhầm). */
function paymentUrlOnCurrentOrigin(url: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    return `${window.location.origin}${u.pathname}${u.search}${u.hash}`;
  } catch {
    if (url.startsWith("/")) return `${window.location.origin}${url}`;
    return url;
  }
}

function resolveCheckoutOpenUrl(res: SubscriptionCheckoutResponse): string {
  if (res.paymentKind === "VNPAY_SANDBOX") return res.paymentUrl;
  return paymentUrlOnCurrentOrigin(res.paymentUrl);
}

export default function SellerPackagePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const subscription = useSellerSubscriptionStore((s) => s.subscription);
  const setSubscription = useSellerSubscriptionStore((s) => s.setSubscription);

  const [catalog, setCatalog] = useState<PackagesCatalogResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [plan, setPlan] = useState<"BASIC" | "VIP">("BASIC");
  /** Chỉ khóa nút Pay / Simulate — tách khỏi luồng return URL để tránh kẹt disabled */
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const returnOrderId = searchParams.get("orderId") ?? "";
  const returnStatus = searchParams.get("status") ?? "";
  const vnpayReturnGate = searchParams.get("vnpay") ?? "";
  const vnpayReturnOk = searchParams.get("ok") ?? "";
  const payStep = searchParams.get("step") ?? "";
  const payOrderIdFromUrl =
    payStep === "pay" ? (searchParams.get("orderId") ?? "") : "";
  const [demoPayBusy, setDemoPayBusy] = useState(false);

  const refreshSubscription = useCallback(async () => {
    try {
      const me = await authApi.getProfile();
      const sub = normalizeSubscriptionPayload(me.subscription);
      if (sub) setSubscription(sub);
    } catch {
      /* ignore */
    }
  }, [setSubscription]);

  useEffect(() => {
    packagesApi
      .getCatalog()
      .then(setCatalog)
      .catch((e) =>
        setLoadError(getApiErrorMessage(e, "Không tải được danh sách gói.")),
      );
  }, []);

  /** Return từ URL demo sau “gateway” — deps dùng string để tránh effect chạy lại vô hạn (URLSearchParams đổi tham chiếu) */
  useEffect(() => {
    if (!returnOrderId || returnStatus !== "success") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await packagesApi.mockCompleteOrder(returnOrderId);
        if (!cancelled && res.subscription) {
          setSubscription(res.subscription);
          await refreshSubscription();
          setMessage(t("seller.packageActive"));
        }
      } catch (e) {
        if (!cancelled)
          setMessage(
            getApiErrorMessage(e, "Hoàn tất thanh toán demo thất bại."),
          );
      } finally {
        if (!cancelled) {
          setSearchParams({}, { replace: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    returnOrderId,
    returnStatus,
    setSearchParams,
    setSubscription,
    refreshSubscription,
    t,
  ]);

  /** Return từ VNPAY sandbox (redirect /payment/vnpay-return → /seller/packages?vnpay=1&…) */
  useEffect(() => {
    if (vnpayReturnGate !== "1") return;

    let cancelled = false;
    (async () => {
      try {
        await refreshSubscription();
        if (!cancelled) {
          setMessage(
            vnpayReturnOk === "1"
              ? t("seller.packageVnpayReturnSuccess")
              : t("seller.packageVnpayReturnFail"),
          );
        }
      } finally {
        if (!cancelled) {
          setSearchParams({}, { replace: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    vnpayReturnGate,
    vnpayReturnOk,
    setSearchParams,
    refreshSubscription,
    t,
  ]);

  async function onDemoPayComplete() {
    if (!payOrderIdFromUrl) return;
    setDemoPayBusy(true);
    setMessage(null);
    try {
      const done = await packagesApi.mockCompleteOrder(payOrderIdFromUrl);
      if (done.subscription) setSubscription(done.subscription);
      await refreshSubscription();
      setMessage(t("seller.packageActive"));
      setSearchParams({}, { replace: true });
    } catch (e: unknown) {
      setMessage(getApiErrorMessage(e, t("seller.packageDemoCompleteError")));
    } finally {
      setDemoPayBusy(false);
    }
  }

  async function onCheckout() {
    if (VNPAY_UI_MAINTENANCE) {
      setMessage(t("payment.vnpayMaintenanceTitle"));
      return;
    }
    setMessage(null);
    setCheckoutBusy(true);
    try {
      const res = await packagesApi.checkout({ plan, provider: "VNPAY" });
      const apiMsg = res.message?.trim();
      const openUrl = resolveCheckoutOpenUrl(res);
      const w = window.open(openUrl, "_blank", "noopener,noreferrer");
      if (!w) {
        setMessage(`${t("seller.packagePopupBlocked")} ${openUrl}`);
      } else {
        setMessage(
          [apiMsg, t("seller.packageCheckoutCreated"), t("seller.packageOpenedSameOriginHint")]
            .filter(Boolean)
            .join(" — "),
        );
      }
    } catch (e: unknown) {
      setMessage(getApiErrorMessage(e, "Không tạo được đơn thanh toán."));
    } finally {
      setCheckoutBusy(false);
    }
  }

  async function onSimulatePaid() {
    setMessage(null);
    setCheckoutBusy(true);
    try {
      const res = await packagesApi.checkout({ plan, provider: "VNPAY" });
      const done = await packagesApi.mockCompleteOrder(res.orderId);
      if (done.subscription) setSubscription(done.subscription);
      await refreshSubscription();
      setMessage(t("seller.packageActive"));
    } catch (e: unknown) {
      setMessage(getApiErrorMessage(e, t("seller.packageSimulateError")));
    } finally {
      setCheckoutBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center text-destructive">
        {loadError}
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="mx-auto max-w-3xl py-24 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  const expLabel =
    subscription?.expiresAt &&
    new Date(subscription.expiresAt).toLocaleString(undefined, {
      dateStyle: "medium",
    });

  return (
    <div className="mx-auto w-full max-w-4xl py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("seller.packagePageTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("seller.packagePageSubtitle")}
          </p>
        </div>
        <Link
          to="/seller"
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          {t("seller.backToDashboard")}
        </Link>
      </div>

      {subscription?.active && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
          <div className="font-semibold text-foreground">
            {t("seller.packageActive")}: {subscription.plan}
          </div>
          {expLabel && (
            <div className="mt-1 text-muted-foreground">
              {t("seller.packageExpires", { date: expLabel })}
            </div>
          )}
          <div className="mt-1 text-muted-foreground">
            {t("seller.packageSlotsUsed", {
              used: subscription.publishedSlotsUsed,
              limit: subscription.publishedSlotsLimit,
            })}
          </div>
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      {payOrderIdFromUrl && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
          <div className="font-semibold text-foreground">
            {t("seller.packageDemoPayTitle")}
          </div>
          <p className="mt-1 text-muted-foreground">{t("seller.packageDemoPayBody")}</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            orderId: {payOrderIdFromUrl}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={demoPayBusy}
              onClick={onDemoPayComplete}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {demoPayBusy ? t("seller.packageDemoCompleting") : t("seller.packageDemoComplete")}
            </button>
            <button
              type="button"
              disabled={demoPayBusy}
              onClick={() => {
                setSearchParams({}, { replace: true });
              }}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {t("seller.packageDemoCancel")}
            </button>
            <button
              type="button"
              disabled={demoPayBusy}
              onClick={() => {
                const u = new URL(window.location.href);
                u.search = `?orderId=${encodeURIComponent(payOrderIdFromUrl)}&status=success`;
                navigate(`${u.pathname}${u.search}`, { replace: true });
              }}
              className="rounded-xl border border-dashed border-border px-4 py-2 text-sm text-muted-foreground disabled:opacity-50"
            >
              {t("seller.packageDemoSimulateReturn")}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {catalog.plans.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlan(p.id)}
            className={`rounded-2xl border p-5 text-left transition ${
              plan === p.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="text-lg font-bold text-foreground">{p.name}</div>
            <div className="mt-2 text-2xl font-semibold text-primary">
              {formatVnd(p.priceVnd)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>
            <p className="mt-2 text-xs font-medium text-foreground">
              {t("seller.packageSlots", {
                count: p.maxConcurrentListings,
                days: catalog.listingDurationDays,
              })}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
        <p className="text-sm font-semibold text-foreground">VNPay</p>
        {VNPAY_UI_MAINTENANCE ? (
          <VnpayMaintenanceNotice />
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("seller.packageVnpayNote")}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={checkoutBusy || VNPAY_UI_MAINTENANCE}
          onClick={onCheckout}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {t("seller.packagePayVnpay")}
        </button>
        <button
          type="button"
          disabled={checkoutBusy}
          onClick={onSimulatePaid}
          className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {t("seller.packageSimulatePaid")}
        </button>
      </div>

    </div>
  );
}
