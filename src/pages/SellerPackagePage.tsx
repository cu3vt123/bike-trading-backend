import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { packagesApi, type PackagesCatalogResponse } from "@/apis/packagesApi";
import { authApi } from "@/apis/authApi";
import {
  useSellerSubscriptionStore,
  normalizeSubscriptionPayload,
} from "@/stores/useSellerSubscriptionStore";
import { getApiErrorMessage } from "@/lib/apiErrors";

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function SellerPackagePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const subscription = useSellerSubscriptionStore((s) => s.subscription);
  const setSubscription = useSellerSubscriptionStore((s) => s.setSubscription);

  const [catalog, setCatalog] = useState<PackagesCatalogResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [plan, setPlan] = useState<"BASIC" | "VIP">("BASIC");
  const [provider, setProvider] = useState<"POSTPAY" | "VNPAY">("POSTPAY");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  /** Return từ URL demo sau “gateway” */
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");
    if (!orderId || status !== "success") return;

    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const res = await packagesApi.mockCompleteOrder(orderId);
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
          setBusy(false);
          setSearchParams({}, { replace: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams, setSubscription, refreshSubscription, t]);

  async function onCheckout() {
    setMessage(null);
    setBusy(true);
    try {
      const res = await packagesApi.checkout({ plan, provider });
      setMessage(res.message ?? "");
      window.open(res.paymentUrl, "_blank", "noopener,noreferrer");
    } catch (e: unknown) {
      setMessage(getApiErrorMessage(e, "Không tạo được đơn thanh toán."));
    } finally {
      setBusy(false);
    }
  }

  async function onSimulatePaid() {
    setMessage(null);
    setBusy(true);
    try {
      const res = await packagesApi.checkout({ plan, provider });
      const done = await packagesApi.mockCompleteOrder(res.orderId);
      if (done.subscription) setSubscription(done.subscription);
      await refreshSubscription();
      setMessage(t("seller.packageActive"));
    } catch (e: unknown) {
      setMessage(getApiErrorMessage(e, "Giả lập thanh toán thất bại."));
    } finally {
      setBusy(false);
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

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="text-sm font-semibold text-foreground">
          {t("seller.inspectionAddonTitle")}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {catalog.inspectionAddOn.description}
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          {t("seller.inspectionAddonPrice", {
            price: formatVnd(catalog.inspectionAddOn.priceVnd),
          })}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="text-sm font-semibold text-foreground">Provider</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setProvider("POSTPAY")}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
              provider === "POSTPAY"
                ? "border-primary bg-primary/10"
                : "border-border"
            }`}
          >
            Postpay
          </button>
          <button
            type="button"
            onClick={() => setProvider("VNPAY")}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
              provider === "VNPAY"
                ? "border-primary bg-primary/10"
                : "border-border"
            }`}
          >
            VNPay
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {catalog.paymentProviders.find((x) => x.id === provider)?.note}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={onCheckout}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {provider === "POSTPAY"
            ? t("seller.packagePayPostpay")
            : t("seller.packagePayVnpay")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onSimulatePaid}
          className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {t("seller.packageSimulatePaid")}
        </button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Production: dùng webhook Postpay/VNPay để xác nhận thanh toán, sau đó gọi cùng logic
        kích hoạt gói như mock-complete.
      </p>
    </div>
  );
}
