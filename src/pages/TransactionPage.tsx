import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getListingById } from "@/mocks/mockListings";

type PaymentMethod =
  | { type: "CARD"; brand: "Visa" | "Mastercard"; last4: string }
  | { type: "MOMO" }
  | { type: "BANK_TRANSFER" };

type TxState = {
  orderId?: string;
  depositPaid?: number;
  totalPrice?: number;
  expiresAt?: number; // timestamp ms
  paymentMethod?: PaymentMethod;
};

function formatMoney(value: number, currency: "VND" | "USD" = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatPaymentMethod(pm?: PaymentMethod) {
  if (!pm) return "—";
  if (pm.type === "CARD") return `${pm.brand} ending in ${pm.last4}`;
  if (pm.type === "MOMO") return "MoMo Wallet";
  return "Bank Transfer";
}

export default function TransactionPage() {
  const { id } = useParams();
  const listing = useMemo(() => (id ? getListingById(id) : undefined), [id]);

  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as TxState;

  const currency = listing?.currency ?? "USD";
  const totalPrice = state.totalPrice ?? listing?.price ?? 0;
  const depositPaid = state.depositPaid ?? Math.round(totalPrice * 0.08); // UI-only default
  const orderId = state.orderId ?? "SB-9921";

  const expiresAt = state.expiresAt ?? Date.now() + 24 * 60 * 60 * 1000;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, expiresAt - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (!listing) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <div className="text-lg font-semibold">Transaction not found</div>
        <Link to="/" className="mt-4 inline-block text-emerald-700 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-bold text-slate-900">Transaction</div>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            RESERVED / IN TRANSACTION
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Updated just now • Order #{orderId}
          </div>
        </div>

        <button
          onClick={() => navigate(`/bikes/${listing.id}`)}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          View listing
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-7 space-y-4">
          {/* Countdown (mint) */}
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-xs font-semibold text-slate-600">
              TIME LEFT TO COMPLETE PURCHASE
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-900">
                  {pad2(hours)}
                </div>
                <div className="mt-1 text-xs text-emerald-800">Hours</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-900">
                  {pad2(minutes)}
                </div>
                <div className="mt-1 text-xs text-emerald-800">Minutes</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-900">
                  {pad2(seconds)}
                </div>
                <div className="mt-1 text-xs text-emerald-800">Seconds</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-sm font-semibold text-slate-900">
              Transaction Progress
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <div>
                  <div className="font-semibold">Reservation Confirmed</div>
                  <div className="text-slate-500">
                    Deposit paid successfully
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <div>
                  <div className="font-semibold">Finalize Purchase</div>
                  <div className="text-slate-500">
                    Action required: pay balance & shipping
                  </div>
                </div>
              </div>

              <div className="flex gap-3 opacity-50">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-400" />
                <div>
                  <div className="font-semibold">Completed</div>
                  <div className="text-slate-500">Ownership transferred</div>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics & Payment (show payment method) */}
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-sm font-semibold text-slate-900">
              Logistics & Payment
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border border-black/10 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Order ID</div>
                <div className="mt-1 font-semibold">#{orderId}</div>
              </div>

              <div className="rounded-xl border border-black/10 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Payment Method</div>
                <div className="mt-1 font-semibold">
                  {formatPaymentMethod(state.paymentMethod)}
                </div>
              </div>

              <div className="rounded-xl border border-black/10 bg-slate-50 p-4 sm:col-span-2">
                <div className="text-xs text-slate-500">Delivery Address</div>
                <div className="mt-1 font-semibold">
                  (Sprint 1 UI-only) 123 Cycling Way, District 1, HCMC
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <Link
              to={`/finalize/${listing.id}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              state={{
                orderId,
                depositPaid,
                totalPrice,
                paymentMethod: state.paymentMethod,
              }}
            >
              Finalize Purchase
            </Link>

            <button
              onClick={() => alert("Cancel reservation (Sprint 1 UI-only)")}
              className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel Reservation
            </button>

            <div className="mt-3 text-center text-xs text-slate-500">
              Refund policy applies • Anti-spam cancellation limit (Sprint 1
              note)
            </div>
          </div>
        </div>

        {/* Right: Summary card */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="h-20 w-24 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={
                      listing.imageUrls?.[0] ??
                      "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=800&q=60"
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {listing.brand} {listing.model ?? ""}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {listing.frameSize ?? "—"} • {listing.condition ?? "—"}
                  </div>

                  <div className="mt-2 text-sm font-bold text-slate-900">
                    {formatMoney(totalPrice, currency)}
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-black/10">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-600">Deposit Paid</span>
                  <span className="font-semibold">
                    {formatMoney(depositPaid, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-slate-600">Due on delivery</span>
                  <span className="font-semibold">
                    {formatMoney(
                      Math.max(0, totalPrice - depositPaid),
                      currency,
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Payment method:{" "}
                <span className="font-semibold">
                  {formatPaymentMethod(state.paymentMethod)}
                </span>
              </div>

              <button
                onClick={() =>
                  alert("View inspection report (Sprint 1 UI-only)")
                }
                className="mt-4 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                View inspection report
              </button>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">
                Contact Support
              </div>
              <div className="mt-1 text-sm text-slate-600">
                24/7 assistance (Sprint 1 UI-only)
              </div>
              <button
                onClick={() => alert("Support chat (Sprint 1 UI-only)")}
                className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Chat with support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
