import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CreditCard, Wallet, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchListingById } from "@/services/buyerService";
import type { BikeDetail } from "@/types/shopbike";
import { cn } from "@/lib/utils";

type Plan = "DEPOSIT" | "FULL";
type Method = "CARD" | "MOMO" | "BANK";

function formatMoney(value: number, currency: "VND" | "USD" = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

const METHOD_CONFIG: Record<Method, { label: string; icon: React.ElementType }> = {
  CARD: { label: "Card", icon: CreditCard },
  MOMO: { label: "MoMo", icon: Wallet },
  BANK: { label: "Bank", icon: Building2 },
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [listing, setListing] = useState<BikeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState<Plan>("DEPOSIT");
  const [method, setMethod] = useState<Method>("CARD");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  const [ship, setShip] = useState({ street: "", city: "", postalCode: "" });
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });

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
        if (!cancelled) setError(err?.message ?? "Failed to load listing.");
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

  if (error || !listing) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="py-12">
          <h1 className="text-lg font-semibold">Listing not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? "Checkout can't load because listing id is invalid."}
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

  function onSubmit() {
    if (!agree) {
      setAgreeError(true);
      return;
    }
    setAgreeError(false);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const paymentMethod =
      method === "CARD"
        ? { type: "CARD" as const, brand: "Visa" as const, last4: card.number.slice(-4) || "0000" }
        : method === "MOMO"
          ? { type: "MOMO" as const }
          : { type: "BANK_TRANSFER" as const };

    navigate(`/transaction/${listing.id}`, {
      state: {
        orderId: "SB-9921",
        listingId: listing.id,
        plan,
        method,
        expiresAt,
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
  }

  const img =
    listing.imageUrls?.[0] ?? listing.thumbnailUrl ?? "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=800&q=60";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete your deposit to secure your ride.
        </p>
      </div>

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
                      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
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
                {(["CARD", "MOMO", "BANK"] as Method[]).map((m) => {
                  const config = METHOD_CONFIG[m];
                  const Icon = config.icon;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
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
                <Label>Street address</Label>
                <Input
                  className="mt-1"
                  placeholder="Street address"
                  value={ship.street}
                  onChange={(e) => setShip((s) => ({ ...s, street: e.target.value }))}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  className="mt-1"
                  placeholder="City"
                  value={ship.city}
                  onChange={(e) => setShip((s) => ({ ...s, city: e.target.value }))}
                />
              </div>
              <div>
                <Label>Postal code</Label>
                <Input
                  className="mt-1"
                  placeholder="Postal code"
                  value={ship.postalCode}
                  onChange={(e) => setShip((s) => ({ ...s, postalCode: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {method === "CARD" && (
            <Card>
              <CardHeader>
                <span className="text-sm font-semibold">Card Details</span>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Card number</Label>
                  <Input
                    className="mt-1"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Cardholder name</Label>
                  <Input
                    className="mt-1"
                    placeholder="John Doe"
                    value={card.name}
                    onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>MM/YY</Label>
                  <Input
                    className="mt-1"
                    placeholder="12/25"
                    value={card.exp}
                    onChange={(e) => setCard((c) => ({ ...c, exp: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>CVC</Label>
                  <Input
                    className="mt-1"
                    placeholder="123"
                    value={card.cvc}
                    onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {method !== "CARD" && (
            <div className="rounded-lg border bg-primary/5 p-3 text-xs text-primary">
              Bạn đang chọn{" "}
              <span className="font-semibold">
                {method === "MOMO" ? "MoMo" : "Bank Transfer"}
              </span>
              . (Chưa map API)
            </div>
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
              <Label htmlFor="agree" className="text-xs text-muted-foreground cursor-pointer">
                I agree to the{" "}
                <span className="text-primary underline">cancellation & refund policy</span>.
              </Label>
            </div>
            {agreeError && (
              <p className="text-sm text-destructive">
                Please agree to the cancellation & refund policy to continue.
              </p>
            )}
          </div>

          <Button onClick={onSubmit} className="w-full" size="lg">
            {plan === "DEPOSIT" ? "Pay Deposit & Reserve →" : "Pay Full Amount →"}
          </Button>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted">
                  <img src={img} alt={listing.title} className="h-full w-full object-cover" />
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
                      {formatMoney(plan === "DEPOSIT" ? dueOnDeliveryDeposit : 0, currency)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                UI hoàn thiện. Tích hợp API khi Backend sẵn sàng.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
