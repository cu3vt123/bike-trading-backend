import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getListingById } from "@/mocks/mockListings";

type PaymentMethod =
  | { type: "CARD"; brand: "Visa" | "Mastercard"; last4: string }
  | { type: "MOMO" }
  | { type: "BANK_TRANSFER" };

type State = {
  orderId?: string;
  depositPaid?: number;
  totalPrice?: number;
  paymentMethod?: PaymentMethod;
  completedAt?: number;
};

function formatMoney(value: number, currency: "VND" | "USD" = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function formatPaymentMethod(pm?: PaymentMethod) {
  if (!pm) return "—";
  if (pm.type === "CARD") return `${pm.brand} •••• ${pm.last4}`;
  if (pm.type === "MOMO") return "MoMo";
  return "Bank transfer";
}

export default function PurchaseSuccessPage() {
  const { id } = useParams();
  const listing = id ? getListingById(id) : undefined;

  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as State;

  const currency = listing?.currency ?? "USD";
  const total = state.totalPrice ?? listing?.price ?? 0;
  const deposit = state.depositPaid ?? 0;
  const due = Math.max(0, total - deposit);

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-8">
        <h1 className="text-lg font-semibold">Success page unavailable</h1>
        <p className="mt-1 text-sm text-black/60">
          Missing listing information (Sprint 1 mock).
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-emerald-700 underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white">
                ✓
              </span>
              Payment Successful
            </div>

            <h1 className="mt-3 text-2xl font-semibold text-slate-900">
              Order completed successfully
            </h1>

            <p className="mt-1 text-sm text-slate-700">
              Your purchase is confirmed. (Sprint 1 UI-only)
            </p>

            {state.orderId && (
              <div className="mt-3 text-sm text-slate-700">
                Order ID: <span className="font-semibold">{state.orderId}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/", { replace: true })}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Back to Home
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-sm font-semibold text-slate-900">Bike</div>
            <div className="mt-2 text-sm text-slate-700">
              {listing.brand} {listing.model ?? ""}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {listing.year ?? "—"} • {listing.frameSize ?? "—"} •{" "}
              {listing.location ?? "—"}
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/bikes/${listing.id}`}
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                View listing
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-sm font-semibold text-slate-900">Payment</div>

            <div className="mt-3 rounded-xl border border-black/10 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total</span>
                <span className="font-semibold">
                  {formatMoney(total, currency)}
                </span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-slate-600">Deposit paid</span>
                <span className="font-semibold">
                  {formatMoney(deposit, currency)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-black/5 pt-2">
                <span className="text-slate-600">Balance</span>
                <span className="font-semibold">
                  {formatMoney(due, currency)}
                </span>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-600">
              Method:{" "}
              <span className="font-semibold text-slate-800">
                {formatPaymentMethod(state.paymentMethod)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Sprint 1 mock — chưa map backend. Mục tiêu: hoàn thiện UI + flow.
      </div>
    </div>
  );
}
