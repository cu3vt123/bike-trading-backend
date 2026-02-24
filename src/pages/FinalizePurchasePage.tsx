import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchListingById } from "@/services/buyerService";
import type { BikeDetail } from "@/types/shopbike";

type PaymentMethod =
  | { type: "CARD"; brand: "Visa" | "Mastercard"; last4: string }
  | { type: "MOMO" }
  | { type: "BANK_TRANSFER" };

type LocationState = {
  orderId?: string;
  depositPaid?: number;
  totalPrice?: number;
  paymentMethod?: PaymentMethod;
  expiresAt?: number;
  totals?: { deposit?: number; totalNow?: number };
};

function formatMoney(value: number, currency: "VND" | "USD" = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function paymentLabel(method?: PaymentMethod) {
  if (!method) return "—";
  if (method.type === "MOMO") return "MoMo";
  if (method.type === "BANK_TRANSFER") return "Bank transfer";
  return `${method.brand} •••• ${method.last4}`;
}

export default function FinalizePurchasePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [listing, setListing] = useState<BikeDetail | null>(null);
  const [loading, setLoading] = useState(true);
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
        if (!cancelled) setError(err?.message ?? "Failed to load listing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const total =
    state.totalPrice ?? state.totals?.totalNow ?? listing?.price ?? 0;
  const deposit =
    state.depositPaid ?? state.totals?.deposit ?? Math.round(total * 0.08);
  const due = Math.max(0, total - deposit);
  const currency = (listing?.currency ?? "USD") as "VND" | "USD";

  const onComplete = () => {
    navigate(`/success/${listing!.id}`, {
      state: {
        ...state,
        totalPrice: total,
        depositPaid: deposit,
        completedAt: Date.now(),
      },
      replace: true,
    });
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="py-12">
          <h1 className="text-lg font-semibold">Finalize page not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? "This page can't load because listing id is invalid."}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="text-2xl font-bold">Finalize Purchase</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Thanh toán số dư và xác nhận giao hàng.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">Shipping & Contact</span>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Full name</Label>
                  <Input className="mt-1" placeholder="Full name" />
                </div>
                <div>
                  <Label>Phone number</Label>
                  <Input className="mt-1" placeholder="Phone number" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Delivery address</Label>
                  <Input className="mt-1" placeholder="Delivery address" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="text-sm font-semibold">Balance Payment</span>
              <span className="text-xs text-muted-foreground">
                Method:{" "}
                <span className="font-semibold">
                  {paymentLabel(state.paymentMethod)}
                </span>
              </span>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                Due now:{" "}
                <span className="font-semibold">{formatMoney(due, currency)}</span>
              </div>
              <Button onClick={onComplete} className="mt-4 w-full">
                Pay Balance & Complete →
              </Button>
              <Button asChild variant="ghost" className="mt-3 w-full" size="sm">
                <Link to={`/transaction/${listing.id}`} state={state}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to transaction
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="text-sm font-semibold">Order Summary</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {listing.brand} {listing.model ?? ""}
              </p>

              <div className="mt-4 overflow-hidden rounded-lg border text-sm">
                <div className="flex justify-between bg-muted/50 px-4 py-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{formatMoney(total, currency)}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-muted-foreground">Deposit paid</span>
                  <span className="font-semibold">{formatMoney(deposit, currency)}</span>
                </div>
                <div className="flex justify-between border-t px-4 py-3">
                  <span className="text-muted-foreground">Balance due</span>
                  <span className="font-semibold">{formatMoney(due, currency)}</span>
                </div>
              </div>

              {state.orderId && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Order ID: <span className="font-semibold">{state.orderId}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
