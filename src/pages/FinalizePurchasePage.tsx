import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchListingById, completeOrder } from "@/services/buyerService";
import type { BikeDetail } from "@/types/shopbike";

type PaymentMethod =
  | { type: "CARD"; brand: "Visa" | "Mastercard"; last4: string }
  | { type: "BANK_TRANSFER" };

type LocationState = {
  orderId?: string;
  depositPaid?: number;
  totalPrice?: number;
  paymentMethod?: PaymentMethod;
  expiresAt?: number;
  totals?: { deposit?: number; totalNow?: number };
};

function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function paymentLabel(method: PaymentMethod | undefined, t: (k: string) => string) {
  if (!method) return "—";
  if (method.type === "BANK_TRANSFER") return t("checkout.finalizeBankTransfer");
  return `${method.brand} •••• ${method.last4}`;
}

export default function FinalizePurchasePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [listing, setListing] = useState<BikeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchListingById(id)
      .then((data) => {
        if (!cancelled) setListing(data ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? t("checkout.finalizeLoadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  const total =
    state.totalPrice ?? state.totals?.totalNow ?? listing?.price ?? 0;
  const deposit =
    state.depositPaid ?? state.totals?.deposit ?? Math.round(total * 0.08);
  const due = Math.max(0, total - deposit);
  const currency = (listing?.currency ?? "VND") as "VND" | "USD";

  async function onComplete() {
    if (!state.orderId) {
      setError(t("checkout.finalizeMissingOrder"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await completeOrder(state.orderId);
      navigate(`/success/${listing!.id}`, {
        state: {
          ...state,
          totalPrice: total,
          depositPaid: deposit,
          completedAt: Date.now(),
        },
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("checkout.finalizeCompleteError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{t("checkout.finalizeLoading")}</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="py-12">
          <h1 className="text-lg font-semibold">{t("checkout.finalizeNotFoundTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? t("checkout.finalizeNotFoundDesc")}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">{t("checkout.goHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="text-2xl font-bold">{t("checkout.finalizeTitle")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("checkout.finalizeSubtitle")}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">{t("checkout.finalizeShippingContact")}</span>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>{t("checkout.finalizeFullName")}</Label>
                  <Input className="mt-1" placeholder={t("checkout.finalizeFullNamePlaceholder")} />
                </div>
                <div>
                  <Label>{t("checkout.finalizePhone")}</Label>
                  <Input className="mt-1" placeholder={t("checkout.finalizePhonePlaceholder")} />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("checkout.finalizeDeliveryAddress")}</Label>
                  <Input className="mt-1" placeholder={t("checkout.finalizeDeliveryAddressPlaceholder")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="text-sm font-semibold">{t("checkout.finalizeBalancePayment")}</span>
              <span className="text-xs text-muted-foreground">
                {t("checkout.finalizePaymentMethod")}:{" "}
                <span className="font-semibold">
                  {paymentLabel(state.paymentMethod, t)}
                </span>
              </span>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                {t("checkout.finalizeDueNow")}:{" "}
                <span className="font-semibold">{formatMoney(due, currency)}</span>
              </div>
              {error && (
                <div className="mb-3 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button onClick={onComplete} className="mt-4 w-full" disabled={submitting}>
                {submitting ? t("checkout.finalizeProcessing") : t("checkout.finalizePayAndComplete")}
              </Button>
              <Button asChild variant="ghost" className="mt-3 w-full" size="sm">
                <Link to={`/transaction/${listing.id}`} state={state}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("checkout.finalizeBackToTransaction")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="text-sm font-semibold">{t("checkout.finalizeOrderSummary")}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {listing.brand} {listing.model ?? ""}
              </p>

              <div className="mt-4 overflow-hidden rounded-lg border text-sm">
                <div className="flex justify-between bg-muted/50 px-4 py-3">
                  <span className="text-muted-foreground">{t("checkout.finalizeTotal")}</span>
                  <span className="font-semibold">{formatMoney(total, currency)}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-muted-foreground">{t("checkout.finalizeDepositPaid")}</span>
                  <span className="font-semibold">{formatMoney(deposit, currency)}</span>
                </div>
                <div className="flex justify-between border-t px-4 py-3">
                  <span className="text-muted-foreground">{t("checkout.finalizeBalanceDue")}</span>
                  <span className="font-semibold">{formatMoney(due, currency)}</span>
                </div>
              </div>

              {state.orderId && (
                <p className="mt-4 text-xs text-muted-foreground">
                  {t("checkout.finalizeOrderId")}: <span className="font-semibold">{state.orderId}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
