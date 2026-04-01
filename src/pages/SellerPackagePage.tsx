import { useCallback, useEffect, useMemo, useState } from "react";
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
import { BicycleLoadingBlock } from "@/components/common/BicycleLoader";
import {
  mergePlanPrices,
  loadPackagePriceOverrides,
  PACKAGE_PRICES_UPDATED_EVENT,
  PACKAGE_PRICE_STORAGE_KEY,
} from "@/lib/packagePriceOverrides";

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
  const [revokeBusy, setRevokeBusy] = useState(false);
  const [priceTick, setPriceTick] = useState(0);

  useEffect(() => {
    const bump = () => setPriceTick((x) => x + 1);
    window.addEventListener(PACKAGE_PRICES_UPDATED_EVENT, bump);
    const onStorage = (e: StorageEvent) => {
      if (e.key === PACKAGE_PRICE_STORAGE_KEY) bump();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(PACKAGE_PRICES_UPDATED_EVENT, bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const plansWithPrices = useMemo(() => {
    if (!catalog) return [];
    return mergePlanPrices(catalog.plans, loadPackagePriceOverrides());
  }, [catalog, priceTick]);

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

  /** Khi có gói active → chọn VIP: Basic hiển thị giá nâng cấp 100k; VIP hiển thị gói đang dùng */
  useEffect(() => {
    if (subscription?.active) setPlan("VIP");
  }, [subscription?.active, subscription?.plan]);

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
  }, [vnpayReturnGate, vnpayReturnOk, setSearchParams, refreshSubscription, t]);

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
      const openUrl = resolveCheckoutOpenUrl(res);
      /** Cùng tab — tránh popup bị chặn (window.open thường fail). Giống Checkout / VnpayDemo. */
      window.location.assign(openUrl);
    } catch (e: unknown) {
      setMessage(getApiErrorMessage(e, "Không tạo được đơn thanh toán."));
    } finally {
      setCheckoutBusy(false);
    }
  }

  async function onRevokeForDemo() {
    setMessage(null);
    setRevokeBusy(true);
    try {
      const res = await packagesApi.revokeSelf();
      setSubscription(res.subscription);
      await refreshSubscription();
      setPlan("BASIC");
      setMessage(res.revoked ? t("seller.packageRevokedForDemo") : t("seller.packageNoPackageToRevoke"));
    } catch (e: unknown) {
      setMessage(getApiErrorMessage(e, t("seller.packageRevokeError")));
    } finally {
      setRevokeBusy(false);
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
      <div className="mx-auto max-w-3xl py-24">
        <BicycleLoadingBlock message={t("common.loading")} size="md" />
      </div>
    );
  }

  const expLabel =
    subscription?.expiresAt &&
    new Date(subscription.expiresAt).toLocaleString(undefined, {
      dateStyle: "medium",
    });

  /** VIP không cho chọn Basic (downgrade). Basic active + chọn Basic = không mua (stack). VIP active = không mua gì. */
  const hasActiveSub = Boolean(subscription?.active);
  const currentPlan = subscription?.plan ?? null;
  const canSelectBasic = !(hasActiveSub && currentPlan === "VIP");
  const canBuy =
    !hasActiveSub ||
    (currentPlan === "BASIC" && plan === "VIP"); // upgrade only
  const isUpgradePrice =
    hasActiveSub && currentPlan === "BASIC" && plan === "VIP";
  const basicMerged = plansWithPrices.find((p) => p.id === "BASIC");
  const vipMerged = plansWithPrices.find((p) => p.id === "VIP");
  const upgradeAmountVnd =
    basicMerged && vipMerged
      ? Math.max(0, vipMerged.priceVnd - basicMerged.priceVnd)
      : 100_000;

  function getDisplayPrice(p: { id: string; priceVnd: number }): number {
    if (p.id === "VIP" && hasActiveSub && currentPlan === "BASIC")
      return upgradeAmountVnd;
    return p.priceVnd;
  }

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
          {currentPlan === "VIP" && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("seller.packageNoBuyUntilExpired")}
            </p>
          )}
          <div className="mt-3">
            <button
              type="button"
              disabled={revokeBusy}
              onClick={() => void onRevokeForDemo()}
              className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/20"
            >
              {revokeBusy ? "..." : t("seller.packageDemoRevoke")}
            </button>
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
          <p className="mt-1 text-muted-foreground">
            {t("seller.packageDemoPayBody")}
          </p>
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
              {demoPayBusy
                ? t("seller.packageDemoCompleting")
                : t("seller.packageDemoComplete")}
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

      <div className="grid min-w-0 gap-4 sm:grid-cols-1 md:grid-cols-2">
        {plansWithPrices.map((p) => {
          const disabled =
            p.id === "BASIC" && !canSelectBasic;
          const displayPrice = getDisplayPrice(p);
          const showUpgradeLabel =
            p.id === "VIP" && isUpgradePrice;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => !disabled && setPlan(p.id)}
              disabled={disabled}
              className={`rounded-2xl border p-5 text-left transition ${
                disabled
                  ? "cursor-not-allowed border-border bg-muted/30 opacity-70"
                  : plan === p.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
              }`}
            >
              <div className="text-lg font-bold text-foreground">{p.name}</div>
              {showUpgradeLabel && (
                <p className="mt-1 text-xs text-primary">
                  {t("seller.packageUpgradePrice")}
                </p>
              )}
              <div className="mt-2 text-2xl font-semibold text-primary">
                {formatVnd(displayPrice)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {p.description}
              </p>
              <p className="mt-2 text-xs font-medium text-foreground">
                {t("seller.packageSlots", {
                  count: p.maxConcurrentListings,
                  days: catalog.listingDurationDays,
                })}
              </p>
            </button>
          );
        })}
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
          disabled={
            checkoutBusy ||
            VNPAY_UI_MAINTENANCE ||
            !canBuy
          }
          onClick={onCheckout}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {t("seller.packagePayVnpay")}
        </button>
        <button
          type="button"
          disabled={checkoutBusy || !canBuy}
          onClick={onSimulatePaid}
          className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {t("seller.packageSimulatePaid")}
        </button>
      </div>
      {hasActiveSub && !canBuy && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t("seller.packageNoBuyUntilExpired")}
        </p>
      )}
    </div>
  );
}
