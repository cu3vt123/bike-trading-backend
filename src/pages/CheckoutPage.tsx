import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreditCard, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  fetchListingById,
  createOrder,
  validatePayment,
} from "@/services/buyerService";
import type { BikeDetail } from "@/types/shopbike";
import { cn } from "@/lib/utils";
import { validateExpiry } from "@/lib/validateExpiry";

type Plan = "DEPOSIT" | "FULL";
type Method = "CARD" | "BANK";
function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

const METHOD_KEYS: Record<Method, string> = {
  CARD: "checkout.card",
  BANK: "checkout.bankTransfer",
};

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [listing, setListing] = useState<BikeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [plan, setPlan] = useState<Plan>("DEPOSIT");
  const [method, setMethod] = useState<Method>("CARD");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const BANK_OPTIONS = [
    "Vietcombank",
    "VietinBank",
    "BIDV",
    "Agribank",
    "Techcombank",
    "MB Bank",
    "ACB",
    "Sacombank",
    "TPBank",
    "VPBank",
  ] as const;

  const [ship, setShip] = useState({ street: "", city: "", postalCode: "" });
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [bank, setBank] = useState({
    accountNumber: "",
    bankName: "",
    accountHolderName: "",
  });

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
        if (!cancelled)
          setFetchError(err?.message ?? t("listing.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{t("checkout.loading")}</p>
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
  // Khớp backend: deposit 8% giá xe; shipping = 0 (BE chưa có phí giao hàng trong order)
  const shipping = 0;
  const deposit = Math.round(itemPrice * 0.08);
  const totalNowDeposit = deposit;
  const totalNowFull = itemPrice + shipping;
  const dueOnDeliveryDeposit = Math.max(0, itemPrice + shipping - deposit);

  function validatePaymentFields(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!ship.street.trim()) errs.shipStreet = t("checkout.errStreet");
    if (!ship.city.trim()) errs.shipCity = t("checkout.errCity");
    if (method === "CARD") {
      const n = card.number.replace(/\D/g, "");
      if (n.length < 12 || n.length > 19)
        errs.cardNumber = t("checkout.errCardNumber");
      if (!card.name.trim()) errs.cardName = t("checkout.errCardName");
      const expValidation = validateExpiry(card.exp);
      if (!expValidation.valid) errs.cardExp = expValidation.errorKey ? t(expValidation.errorKey) : t("checkout.errCardExp");
      const cvcDigits = card.cvc.replace(/\D/g, "");
      if (cvcDigits.length !== 3) errs.cardCvc = t("checkout.errCardCvc");
    } else {
      if (bank.accountNumber.replace(/\D/g, "").length < 8)
        errs.bankAccount = t("checkout.errBankAccount");
      if (!bank.bankName.trim()) errs.bankName = t("checkout.errBankName");
    }
    return errs;
  }

  async function onSubmit() {
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
      const validation = await validatePayment({
        method: method === "CARD" ? "CARD" : "BANK_TRANSFER",
        cardDetails: method === "CARD" ? card : undefined,
        bankDetails: method === "BANK" ? bank : undefined,
      });
      if (!validation.ok) {
        setApiError(
          validation.error ??
            "Xác thực thanh toán thất bại. Dùng thẻ thử 4242 4242 4242 4242.",
        );
        setSubmitting(false);
        return;
      }

      const order = await createOrder({
        listingId: listing.id,
        plan,
        shippingAddress: {
          street: ship.street,
          city: ship.city,
          postalCode: ship.postalCode,
        },
      });
      const paymentMethod =
        validation.paymentMethod?.type === "CARD"
          ? {
              type: "CARD" as const,
              brand: (validation.paymentMethod.brand ?? "Visa") as
                | "Visa"
                | "Mastercard",
              last4: String(
                validation.paymentMethod.last4 ?? card.number.slice(-4),
              ).slice(-4),
            }
          : { type: "BANK_TRANSFER" as const };

      navigate(`/transaction/${listing.id}`, {
        state: {
          orderId: order.id,
          listingId: listing.id,
          plan,
          method,
          expiresAt: order.expiresAt
            ? new Date(order.expiresAt).getTime()
            : Date.now() + 24 * 60 * 60 * 1000,
          ship,
          depositPaid: deposit,
          totalPrice: itemPrice + shipping,
          paymentMethod,
          totals: {
            itemPrice,
            shipping,
            deposit,
            totalNow: plan === "DEPOSIT" ? totalNowDeposit : totalNowFull,
            dueOnDelivery: plan === "DEPOSIT" ? dueOnDeliveryDeposit : 0,
          },
        },
      });
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : t("checkout.createOrderError"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const img =
    listing.imageUrls?.[0] ??
    listing.thumbnailUrl ??
    "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=800&q=60";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("checkout.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("checkout.subtitle")}
        </p>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
                  p: "FULL" as Plan,
                  titleKey: "checkout.fullPayment",
                  descKey: "checkout.fullPaymentDesc",
                  badgeKey: null as string | null,
                  price: totalNowFull,
                },
                {
                  p: "DEPOSIT" as Plan,
                  titleKey: "checkout.depositCOD",
                  descKey: "checkout.depositCODDesc",
                  badgeKey: "checkout.mostPopular",
                  price: totalNowDeposit,
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
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {(["CARD", "BANK"] as Method[]).map((m) => {
                  const Icon = m === "CARD" ? CreditCard : Building2;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMethod(m);
                        setFieldErrors({});
                        setApiError(null);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition",
                        method === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:border-primary/50",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {t(METHOD_KEYS[m])}
                    </button>
                  );
                })}
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
              <div>
                <Label>{t("checkout.postalCode")}</Label>
                <Input
                  className="mt-1"
                  placeholder={t("checkout.postalCode")}
                  value={ship.postalCode}
                  onChange={(e) =>
                    setShip((s) => ({ ...s, postalCode: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {method === "CARD" && (
            <Card>
              <CardHeader>
                <span className="text-sm font-semibold">
                  {t("checkout.cardInfo")}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("checkout.cardInfoHint")}
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>{t("checkout.cardNumber")}</Label>
                  <Input
                    className={cn(
                      "mt-1 font-mono",
                      fieldErrors.cardNumber && "border-destructive",
                    )}
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) => {
                      let digits = e.target.value.replace(/\D/g, "");
                      // allow 12–19 digits, hard cap at 19 digits
                      digits = digits.slice(0, 19);
                      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                      setCard((c) => ({ ...c, number: formatted }));
                      if (fieldErrors.cardNumber)
                        setFieldErrors((prev) => ({ ...prev, cardNumber: "" }));
                    }}
                  />
                  {fieldErrors.cardNumber && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldErrors.cardNumber}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("checkout.cardholderName")}</Label>
                  <Input
                    className={cn(
                      "mt-1",
                      fieldErrors.cardName && "border-destructive",
                    )}
                    placeholder={t("checkout.cardholderPlaceholder")}
                    value={card.name}
                    onChange={(e) => {
                      const cleaned = e.target.value
                        .replace(/[^\p{L}\s']/gu, "")
                        .replace(/\s{2,}/g, " ");
                      setCard((c) => ({ ...c, name: cleaned }));
                      if (fieldErrors.cardName)
                        setFieldErrors((prev) => ({ ...prev, cardName: "" }));
                    }}
                  />
                  {fieldErrors.cardName && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldErrors.cardName}
                    </p>
                  )}
                </div>
                <div>
                  <Label>{t("checkout.expiry")}</Label>
                  <Input
                    className={cn(
                      "mt-1",
                      fieldErrors.cardExp && "border-destructive",
                    )}
                    placeholder="12/28"
                    value={card.exp}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "");
                      if (v.length >= 2) {
                        let mm = parseInt(v.slice(0, 2), 10);
                        if (mm > 12) mm = 12;
                        if (mm < 1) mm = 1;
                        v = String(mm).padStart(2, "0") + "/" + v.slice(2, 4);
                      }
                      setCard((c) => ({ ...c, exp: v }));
                      if (fieldErrors.cardExp)
                        setFieldErrors((prev) => ({ ...prev, cardExp: "" }));
                    }}
                    maxLength={5}
                  />
                  {fieldErrors.cardExp && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldErrors.cardExp}
                    </p>
                  )}
                </div>
                <div>
                  <Label>{t("checkout.cvc")}</Label>
                  <Input
                    className={cn(
                      "mt-1",
                      fieldErrors.cardCvc && "border-destructive",
                    )}
                    placeholder="123"
                    value={card.cvc}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                      setCard((c) => ({
                        ...c,
                        cvc: v,
                      }));
                      if (fieldErrors.cardCvc)
                        setFieldErrors((prev) => ({ ...prev, cardCvc: "" }));
                    }}
                    maxLength={3}
                  />
                  {fieldErrors.cardCvc && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldErrors.cardCvc}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {method === "BANK" && (
            <Card>
              <CardHeader>
                <span className="text-sm font-semibold">
                  {t("checkout.bankInfo")}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("checkout.bankInfoHint")}
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Account number</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. 123456789012"
                    value={bank.accountNumber}
                    onChange={(e) =>
                      setBank((b) => ({
                        ...b,
                        accountNumber: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    maxLength={24}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("checkout.bankName")}</Label>
                  <select
                    className={cn(
                      "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      fieldErrors.bankName && "border-destructive",
                    )}
                    value={bank.bankName}
                    onChange={(e) => {
                      setBank((b) => ({ ...b, bankName: e.target.value }));
                      if (fieldErrors.bankName)
                        setFieldErrors((prev) => ({ ...prev, bankName: "" }));
                    }}
                  >
                    <option value="">{t("checkout.selectBank")}</option>
                    {BANK_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.bankName && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldErrors.bankName}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("checkout.accountHolder")}</Label>
                  <Input
                    className="mt-1"
                    placeholder="VD: Nguyễn Văn A"
                    value={bank.accountHolderName}
                    onChange={(e) =>
                      setBank((b) => ({
                        ...b,
                        accountHolderName: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

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
              ? t("checkout.creating")
              : plan === "DEPOSIT"
                ? t("checkout.depositReserve")
                : t("checkout.payFull")}
          </Button>
        </div>

        <div>
          <Card className="sticky top-24">
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
