// src/pages/FinalizePurchasePage.tsx
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getListingById } from "@/mocks/mockListings";
import type { Listing } from "@/types/shopbike";

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

  // ✅ listingRaw: Listing | undefined
  const listingRaw = id ? getListingById(id) : undefined;

  // ✅ Guard sớm
  if (!listingRaw) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-white p-8">
        <h1 className="text-lg font-semibold text-slate-900">
          Finalize page not found
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          This page can’t load because listing id is invalid (Sprint 1 mock).
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // ✅ Từ đây listing chắc chắn là Listing (không còn undefined)
  const listing: Listing = listingRaw;
  const listingId = listing.id;

  const currency = (listing.currency ?? "USD") as "VND" | "USD";
  const total = state.totalPrice ?? listing.price;
  const deposit = state.depositPaid ?? Math.round(total * 0.08);
  const due = Math.max(0, total - deposit);

  const onComplete = () => {
    navigate(`/success/${listingId}`, {
      state: {
        ...state,
        totalPrice: total,
        depositPaid: deposit,
        completedAt: Date.now(),
      },
      replace: true,
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="text-2xl font-bold text-slate-900">Finalize Purchase</div>
      <div className="mt-1 text-sm text-slate-500">
        Pay balance & confirm shipping (Sprint 1 UI-only).
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-sm font-semibold text-slate-900">
              Shipping & Contact
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Full name"
              />
              <input
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Phone number"
              />
              <input
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 sm:col-span-2"
                placeholder="Delivery address"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Balance Payment
              </div>
              <div className="text-xs text-slate-500">
                Method:{" "}
                <span className="font-semibold text-slate-700">
                  {paymentLabel(state.paymentMethod)}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Due now:{" "}
              <span className="font-semibold">
                {formatMoney(due, currency)}
              </span>
            </div>

            <button
              onClick={onComplete}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Pay Balance & Complete →
            </button>

            <Link
              to={`/transaction/${listingId}`}
              state={state}
              className="mt-3 block text-center text-sm font-semibold text-emerald-700 hover:underline"
            >
              Back to transaction
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Order Summary
            </div>

            <div className="mt-3 text-sm text-slate-700">
              {listing.brand} {listing.model ?? ""}
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-black/10 text-sm">
              <div className="flex justify-between bg-slate-50 px-4 py-3">
                <span className="text-slate-600">Total</span>
                <span className="font-semibold">
                  {formatMoney(total, currency)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-slate-600">Deposit paid</span>
                <span className="font-semibold">
                  {formatMoney(deposit, currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/5 px-4 py-3">
                <span className="text-slate-600">Balance due</span>
                <span className="font-semibold">
                  {formatMoney(due, currency)}
                </span>
              </div>
            </div>

            {state.orderId && (
              <div className="mt-4 text-xs text-slate-500">
                Order ID: <span className="font-semibold">{state.orderId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
