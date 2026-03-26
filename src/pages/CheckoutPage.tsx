import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isBuyerUnverifiedRisk } from "@/types/shopbike";
import { useTranslation } from "react-i18next";
import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { createVnpayCheckoutOrder } from "@/services/buyerService";
import { useBuyerListingQuery } from "@/hooks/queries/useBuyerListingQuery";
import { queryKeys } from "@/lib/queryKeys";
import { BicycleLoadingBlock } from "@/components/common/BicycleLoader";
import type { BikeDetail } from "@/types/shopbike";
import { cn } from "@/lib/utils";
type Plan = "DEPOSIT" | "FULL";
function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const listingQuery = useBuyerListingQuery(id);
  const listing = listingQuery.data ?? null;
  const loading = listingQuery.isPending;
  const fetchError = useMemo(() => {
    if (!listingQuery.isError) return null;
    const e = listingQuery.error;
    return e instanceof Error ? e.message : t("listing.loadError");
  }, [listingQuery.isError, listingQuery.error, t]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [plan, setPlan] = useState<Plan>("DEPOSIT");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutPolicyOpen, setCheckoutPolicyOpen] = useState(false);
  const [checkoutPolicyAccepted, setCheckoutPolicyAccepted] = useState(false);
  const checkoutPolicyAcceptedRef = useRef(false);
  const CITY_OPTIONS = [
    "Ho Chi Minh City",
    "Ha Noi",
    "Da Nang",
    "Hai Phong",
    "Can Tho",
    "Nha Trang",
    "Hue",
    "Da Lat",
  ] as const;

  const [ship, setShip] = useState({ street: "", city: "" });

  /** Chỉ xe chưa kiểm định: bắt buộc popup cảnh báo. Xe đã kiểm định: không popup, sàn đảm nhận theo nghiệp vụ. */
  useEffect(() => {
    if (!listing) return;
    if (isBuyerUnverifiedRisk(listing)) {
      setCheckoutPolicyOpen(true);
      setCheckoutPolicyAccepted(false);
      checkoutPolicyAcceptedRef.current = false;
    } else {
      setCheckoutPolicyOpen(false);
      setCheckoutPolicyAccepted(true);
      checkoutPolicyAcceptedRef.current = true;
    }
  }, [listing?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-24">
        <BicycleLoadingBlock message={t("checkout.loading")} size="md" />
      </div>
    );
  }

  if (!listing) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="py-12">
          <h1 className="text-lg font-semibold">{t("checkout.notFound")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fetchError ?? t("checkout.loadError")}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">{t("checkout.goHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currency = (listing.currency ?? "VND") as "VND" | "USD";
  const itemPrice = listing.price;
  const shipping = 0;
  const deposit = Math.round(itemPrice * 0.08);
  const totalNowDeposit = deposit;
  const totalNowFull = itemPrice + shipping;
  const dueOnDeliveryDeposit = Math.max(0, itemPrice + shipping - deposit);

  function validatePaymentFields(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!ship.street.trim()) errs.shipStreet = t("checkout.errStreet");
    if (!ship.city.trim()) errs.shipCity = t("checkout.errCity");
    return errs;
  }

  const needsUnverifiedDisclaimer = listing ? isBuyerUnverifiedRisk(listing) : false;

  async function onSubmit() {
    if (!checkoutPolicyAccepted) {
      setCheckoutPolicyOpen(true);
      return;
    }
    if (!agree) {
      setAgreeError(true);
      return;
    }
    setAgreeError(false);
    setApiError(null);
    const errs = validatePaymentFields();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const res = await createVnpayCheckoutOrder({
        listingId: listing.id,
        plan,
        shippingAddress: {
          street: ship.street,
          city: ship.city,
        },
        acceptedUnverifiedDisclaimer: needsUnverifiedDisclaimer
          ? true
          : undefined,
      });
      const url = res.paymentUrl?.trim();
      if (!url) {
        setApiError(t("checkout.vnpayNoUrl"));
        setSubmitting(false);
        return;
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.buyer.orders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      window.location.assign(url);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : t("checkout.createOrderError"),
      );
      setSubmitting(false);
    }
  }

  const img =
    listing.imageUrls?.[0] ??
    listing.thumbnailUrl ??
    "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=800&q=60";

  return (
    <div className="mx-auto max-w-6xl">
      <Dialog
        open={checkoutPolicyOpen}
        onOpenChange={(open) => {
          if (!open && !checkoutPolicyAcceptedRef.current) {
            navigate(-1);
          }
          setCheckoutPolicyOpen(open);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{t("checkout.unverifiedTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("checkout.unverifiedBody")}</p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              {t("checkout.unverifiedDecline")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                checkoutPolicyAcceptedRef.current = true;
                setCheckoutPolicyAccepted(true);
                setCheckoutPolicyOpen(false);
              }}
            >
              {t("checkout.unverifiedAccept")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t("checkout.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("checkout.subtitle")}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to={`/bikes/${listing.id}`}>{t("checkout.backToListing")}</Link>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("checkout.abandonHint")}</p>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,380px)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">
                {t("checkout.selectPaymentPlan")}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  p: "DEPOSIT" as Plan,
                  titleKey: "checkout.depositOnline",
                  descKey: "checkout.depositOnlineDesc",
                  badgeKey: "checkout.mostPopular",
                  price: totalNowDeposit,
                },
                {
                  p: "FULL" as Plan,
                  titleKey: "checkout.fullPayment",
                  descKey: "checkout.fullPaymentDescVnpay",
                  badgeKey: null as string | null,
                  price: totalNowFull,
                },
              ].map(({ p, titleKey, descKey, badgeKey, price }) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition",
                    plan === p
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-input hover:border-primary/50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{t(titleKey)}</span>
                        {badgeKey && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {t(badgeKey)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t(descKey)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatMoney(price, currency)}
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">
                {t("checkout.paymentMethod")}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {plan === "FULL"
                      ? t("checkout.vnpayFullOnlyTitle")
                      : t("checkout.vnpayDepositTitle")}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    {plan === "FULL"
                      ? t("checkout.vnpayFullOnlyDesc")
                      : t("checkout.vnpayDepositDesc")}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                    {t("checkout.vnpayRedirectHint")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">{t("checkout.shippingAddress")}</span>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>{t("checkout.streetAddress")}</Label>
                <Input
                  className={cn(
                    "mt-1",
                    fieldErrors.shipStreet && "border-destructive",
                  )}
                  placeholder={t("checkout.streetPlaceholder")}
                  value={ship.street}
                  onChange={(e) => {
                    setShip((s) => ({ ...s, street: e.target.value }));
                    if (fieldErrors.shipStreet)
                      setFieldErrors((prev) => ({ ...prev, shipStreet: "" }));
                  }}
                />
                {fieldErrors.shipStreet && (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.shipStreet}
                  </p>
                )}
              </div>
              <div>
                <Label>{t("checkout.city")}</Label>
                <select
                  className={cn(
                    "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    fieldErrors.shipCity && "border-destructive",
                  )}
                  value={ship.city}
                  onChange={(e) => {
                    setShip((s) => ({ ...s, city: e.target.value }));
                    if (fieldErrors.shipCity)
                      setFieldErrors((prev) => ({ ...prev, shipCity: "" }));
                  }}
                >
                  <option value="">{t("checkout.selectCity")}</option>
                  {CITY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {fieldErrors.shipCity && (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.shipCity}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="agree"
                checked={agree}
                onCheckedChange={(v) => {
                  setAgree(!!v);
                  if (agreeError) setAgreeError(false);
                }}
                className="mt-0.5"
              />
              <Label
                htmlFor="agree"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                {t("checkout.agreePolicy")}{" "}
                <span className="text-primary underline">
                  {t("checkout.cancelRefundPolicy")}
                </span>
                .
              </Label>
            </div>
            {agreeError && (
              <p className="text-sm text-destructive">
                {t("checkout.agreeError")}
              </p>
            )}
          </div>

          <Button
            onClick={onSubmit}
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            {submitting
              ? t("checkout.redirectingVnpay")
              : plan === "DEPOSIT"
                ? t("checkout.payDepositVnpay")
                : t("checkout.payFullVnpay")}
          </Button>
        </div>

        <div className="lg:min-w-0">
          <Card className="sticky top-20 sm:top-24">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted">
                  <img
                    src={img}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {listing.brand} {listing.model}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {listing.frameSize ?? ""}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("checkout.bikePrice")}</span>
                  <span>{formatMoney(itemPrice, currency)}</span>
                </div>
                {shipping > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("checkout.shippingFee")}</span>
                    <span>{formatMoney(shipping, currency)}</span>
                  </div>
                )}
                {plan === "DEPOSIT" && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("checkout.depositNow")}</span>
                    <span>{formatMoney(deposit, currency)}</span>
                  </div>
                )}
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex justify-between font-semibold text-primary">
                    <span>{t("checkout.totalPayNow")}</span>
                    <span>
                      {formatMoney(
                        plan === "DEPOSIT" ? totalNowDeposit : totalNowFull,
                        currency,
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-primary/80">
                    <span>{t("checkout.payOnDelivery")}</span>
                    <span>
                      {formatMoney(
                        plan === "DEPOSIT" ? dueOnDeliveryDeposit : 0,
                        currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
