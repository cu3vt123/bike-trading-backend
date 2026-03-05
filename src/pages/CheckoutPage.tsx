import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

type Plan = "DEPOSIT" | "FULL";
type Method = "CARD" | "BANK";

function formatMoney(value: number, currency: "VND" | "USD" = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

const METHOD_CONFIG: Record<
  Method,
  { label: string; icon: React.ElementType }
> = {
  CARD: { label: "Card (Visa/Mastercard)", icon: CreditCard },
  BANK: { label: "Bank Transfer", icon: Building2 },
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [listing, setListing] = useState<BikeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

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
          setFetchError(err?.message ?? "Failed to load listing.");
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
        <p className="text-sm text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="py-12">
          <h1 className="text-lg font-semibold">Listing not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fetchError ?? "Checkout can't load because listing id is invalid."}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currency = (listing.currency ?? "USD") as "VND" | "USD";
  const itemPrice = listing.price;
  const shipping = 45;
  const deposit = 545;
  const totalNowDeposit = deposit;
  const totalNowFull = itemPrice + shipping;
  const dueOnDeliveryDeposit = Math.max(0, itemPrice + shipping - deposit);

  function validatePaymentFields(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!ship.street.trim()) errs.shipStreet = "Street address is required";
    if (!ship.city.trim()) errs.shipCity = "City is required";
    if (method === "CARD") {
      const n = card.number.replace(/\D/g, "");
      if (n.length < 12 || n.length > 19)
        errs.cardNumber = "Enter a valid card number (12–19 digits)";
      if (!card.name.trim()) errs.cardName = "Cardholder name is required";
      if (!card.exp.trim()) errs.cardExp = "Expiry date (MM/YY) is required";
      else if (!/^\d{1,2}\s*\/\s*\d{2,4}$/.test(card.exp.trim()))
        errs.cardExp = "Expiry format: MM/YY";
      const cvcDigits = card.cvc.replace(/\D/g, "");
      if (cvcDigits.length !== 3)
        errs.cardCvc = "CVC must be exactly 3 digits";
    } else {
      if (bank.accountNumber.replace(/\D/g, "").length < 8)
        errs.bankAccount = "Account number must be at least 8 digits";
      if (!bank.bankName.trim()) errs.bankName = "Bank name is required";
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
            "Payment validation failed. Use test card 4242 4242 4242 4242.",
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
          totalPrice: plan === "DEPOSIT" ? totalNowDeposit : totalNowFull,
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
        err instanceof Error
          ? err.message
          : "Failed to create order. Please try again.",
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
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete your deposit to secure your ride.
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
              <span className="text-sm font-semibold">Select Payment Plan</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  p: "FULL" as Plan,
                  title: "Full Payment",
                  desc: "Pay the full amount now. Priority shipping included.",
                  price: totalNowFull,
                },
                {
                  p: "DEPOSIT" as Plan,
                  title: "Deposit + COD",
                  badge: "Most Popular",
                  desc: "Pay deposit now to reserve. Pay the rest upon delivery.",
                  price: totalNowDeposit,
                },
              ].map(({ p, title, desc, badge, price }) => (
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
                        <span className="text-sm font-semibold">{title}</span>
                        {badge && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {desc}
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
              <span className="text-sm font-semibold">Payment Method</span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {(["CARD", "BANK"] as Method[]).map((m) => {
                  const config = METHOD_CONFIG[m];
                  const Icon = config.icon;
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
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">Shipping Address</span>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Street address *</Label>
                <Input
                  className={cn("mt-1", fieldErrors.shipStreet && "border-destructive")}
                  placeholder="Street address"
                  value={ship.street}
                  onChange={(e) => {
                    setShip((s) => ({ ...s, street: e.target.value }));
                    if (fieldErrors.shipStreet) setFieldErrors((prev) => ({ ...prev, shipStreet: "" }));
                  }}
                />
                {fieldErrors.shipStreet && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.shipStreet}</p>
                )}
              </div>
              <div>
                <Label>City *</Label>
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
                  <option value="">Select city</option>
                  {CITY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {fieldErrors.shipCity && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.shipCity}</p>
                )}
              </div>
              <div>
                <Label>Postal code</Label>
                <Input
                  className="mt-1"
                  placeholder="Postal code"
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
                  Card Details (Visa / Mastercard)
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  As required by card issuers. Test cards: 4242 4242 4242 4242,
                  5555 5555 5555 4444
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Card number *</Label>
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
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.cardNumber}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label>Cardholder name *</Label>
                  <Input
                    className={cn("mt-1", fieldErrors.cardName && "border-destructive")}
                    placeholder="John Doe (as on card)"
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
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.cardName}</p>
                  )}
                </div>
                <div>
                  <Label>Expiry (MM/YY) *</Label>
                  <Input
                    className={cn("mt-1", fieldErrors.cardExp && "border-destructive")}
                    placeholder="12/28"
                    value={card.exp}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "");
                      if (v.length >= 2)
                        v = v.slice(0, 2) + "/" + v.slice(2, 4);
                      setCard((c) => ({ ...c, exp: v }));
                      if (fieldErrors.cardExp) setFieldErrors((prev) => ({ ...prev, cardExp: "" }));
                    }}
                    maxLength={5}
                  />
                  {fieldErrors.cardExp && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.cardExp}</p>
                  )}
                </div>
                <div>
                  <Label>CVC (3 digits) *</Label>
                  <Input
                    className={cn("mt-1", fieldErrors.cardCvc && "border-destructive")}
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
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.cardCvc}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {method === "BANK" && (
            <Card>
              <CardHeader>
                <span className="text-sm font-semibold">
                  Bank Transfer Details
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Required by bank regulations. Min 8 digits for account number.
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
                  <Label>Bank name *</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Vietcombank"
                    value={bank.bankName}
                    onChange={(e) =>
                      setBank((b) => ({ ...b, bankName: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Account holder name (optional)</Label>
                  <Input
                    className="mt-1"
                    placeholder="John Doe"
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
                I agree to the{" "}
                <span className="text-primary underline">
                  cancellation & refund policy
                </span>
                .
              </Label>
            </div>
            {agreeError && (
              <p className="text-sm text-destructive">
                Please agree to the cancellation & refund policy to continue.
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
              ? "Creating order..."
              : plan === "DEPOSIT"
                ? "Pay Deposit & Reserve →"
                : "Pay Full Amount →"}
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
                  <span>Item Price</span>
                  <span>{formatMoney(itemPrice, currency)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{formatMoney(shipping, currency)}</span>
                </div>
                {plan === "DEPOSIT" && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Deposit Due (Now)</span>
                    <span>{formatMoney(deposit, currency)}</span>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex justify-between font-semibold text-primary">
                    <span>Total due now</span>
                    <span>
                      {formatMoney(
                        plan === "DEPOSIT" ? totalNowDeposit : totalNowFull,
                        currency,
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-primary/80">
                    <span>Due on delivery</span>
                    <span>
                      {formatMoney(
                        plan === "DEPOSIT" ? dueOnDeliveryDeposit : 0,
                        currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                UI complete. API integration when Backend is ready.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
