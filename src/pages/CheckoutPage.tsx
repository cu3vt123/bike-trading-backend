import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getListingById } from "@/mocks/mockListings";

type Plan = "DEPOSIT" | "FULL";
type Method = "CARD" | "MOMO" | "BANK";

function formatMoney(value: number, currency: "VND" | "USD" = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const listing = useMemo(() => {
    return id ? getListingById(String(id)) : undefined;
  }, [id]);

  // ✅ Guard sớm: không có listing -> return UI, không render form
  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-8">
        <h1 className="text-lg font-semibold">Listing not found</h1>
        <p className="mt-1 text-sm text-black/60">
          Checkout can’t load because listing id is invalid (Sprint 1 mock).
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

  // ✅ Từ đây listing chắc chắn có
  const listingId = listing.id;
  const currency = listing.currency ?? "USD";

  // giả lập tính tiền giống mock UI
  const itemPrice = listing.price;
  const shipping = 45;
  const deposit = 545;
  const totalNowDeposit = deposit;
  const totalNowFull = itemPrice + shipping;

  const dueOnDeliveryDeposit = Math.max(0, itemPrice + shipping - deposit);
  const dueOnDeliveryFull = 0;

  const [plan, setPlan] = useState<Plan>("DEPOSIT");
  const [method, setMethod] = useState<Method>("CARD");
  const [agree, setAgree] = useState(false);

  const [ship, setShip] = useState({
    street: "",
    city: "",
    postalCode: "",
  });

  const [card, setCard] = useState({
    number: "",
    name: "",
    exp: "",
    cvc: "",
  });

  function onSubmit() {
    if (!agree) {
      alert("Please agree to cancellation & refund policy (Sprint 1).");
      return;
    }

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    // Sprint 1: coi như payment OK -> chuyển sang Transaction
    navigate(`/transaction/${listingId}`, {
      state: {
        orderId: "SB-9921",
        listingId,
        plan,
        method,
        expiresAt,
        ship,
        totals: {
          itemPrice,
          shipping,
          deposit,
          totalNow: plan === "DEPOSIT" ? totalNowDeposit : totalNowFull,
          dueOnDelivery:
            plan === "DEPOSIT" ? dueOnDeliveryDeposit : dueOnDeliveryFull,
        },
      },
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4">
        <div className="text-2xl font-semibold text-slate-900">Checkout</div>
        <p className="mt-1 text-sm text-black/60">
          Complete your deposit to secure your ride.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT */}
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          {/* Plan */}
          <div className="text-sm font-semibold text-slate-900">
            Select Payment Plan
          </div>

          <div className="mt-3 grid gap-3">
            <button
              type="button"
              onClick={() => setPlan("FULL")}
              className={`rounded-2xl border p-4 text-left transition ${
                plan === "FULL"
                  ? "border-emerald-500 ring-2 ring-emerald-200"
                  : "border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Full Payment</div>
                  <div className="text-xs text-black/60">
                    Pay the full amount now. Priority shipping included.
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatMoney(totalNowFull, currency)}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPlan("DEPOSIT")}
              className={`rounded-2xl border p-4 text-left transition ${
                plan === "DEPOSIT"
                  ? "border-emerald-500 ring-2 ring-emerald-200"
                  : "border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">Deposit + COD</div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Most Popular
                    </span>
                  </div>
                  <div className="text-xs text-black/60">
                    Pay deposit now to reserve. Pay the rest upon delivery.
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatMoney(totalNowDeposit, currency)}
                </div>
              </div>
            </button>
          </div>

          {/* Method */}
          <div className="mt-6 text-sm font-semibold text-slate-900">
            Payment Method
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {(["CARD", "MOMO", "BANK"] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  method === m
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-black/10 hover:border-black/20"
                }`}
              >
                {m === "CARD" ? "Card" : m === "MOMO" ? "MoMo" : "Bank"}
              </button>
            ))}
          </div>

          {/* Address + Card */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Shipping Address
              </div>
              <div className="mt-3 grid gap-3">
                <input
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Street address"
                  value={ship.street}
                  onChange={(e) =>
                    setShip((s) => ({ ...s, street: e.target.value }))
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="City"
                    value={ship.city}
                    onChange={(e) =>
                      setShip((s) => ({ ...s, city: e.target.value }))
                    }
                  />
                  <input
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Postal code"
                    value={ship.postalCode}
                    onChange={(e) =>
                      setShip((s) => ({ ...s, postalCode: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-900">
                Card Details
              </div>
              <div className="mt-3 grid gap-3">
                <input
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Card number"
                  value={card.number}
                  onChange={(e) =>
                    setCard((c) => ({ ...c, number: e.target.value }))
                  }
                  disabled={method !== "CARD"}
                />
                <input
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Cardholder name"
                  value={card.name}
                  onChange={(e) =>
                    setCard((c) => ({ ...c, name: e.target.value }))
                  }
                  disabled={method !== "CARD"}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="MM/YY"
                    value={card.exp}
                    onChange={(e) =>
                      setCard((c) => ({ ...c, exp: e.target.value }))
                    }
                    disabled={method !== "CARD"}
                  />
                  <input
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="CVC"
                    value={card.cvc}
                    onChange={(e) =>
                      setCard((c) => ({ ...c, cvc: e.target.value }))
                    }
                    disabled={method !== "CARD"}
                  />
                </div>

                {method !== "CARD" && (
                  <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
                    Sprint 1 UI: bạn đang chọn{" "}
                    <span className="font-semibold">
                      {method === "MOMO" ? "MoMo" : "Bank Transfer"}
                    </span>
                    . (Chưa map API)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Agree + Pay */}
          <div className="mt-6 flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-emerald-600"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <div className="text-xs text-black/60">
              I agree to the{" "}
              <span className="text-emerald-700 underline">
                cancellation & refund policy
              </span>
              .
            </div>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:opacity-95 active:opacity-90"
          >
            {plan === "DEPOSIT"
              ? "Pay Deposit & Reserve →"
              : "Pay Full Amount →"}
          </button>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
              <img
                src={listing.thumbnailUrl || listing.imageUrls?.[0]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {listing.brand} {listing.model}
              </div>
              <div className="truncate text-xs text-black/60">
                {listing.frameSize ?? ""}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-black/70">
              <span>Item Price</span>
              <span>{formatMoney(itemPrice, currency)}</span>
            </div>
            <div className="flex justify-between text-black/70">
              <span>Shipping</span>
              <span>{formatMoney(shipping, currency)}</span>
            </div>
            {plan === "DEPOSIT" && (
              <div className="flex justify-between text-black/70">
                <span>Deposit Due (Now)</span>
                <span>{formatMoney(deposit, currency)}</span>
              </div>
            )}

            <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm">
              <div className="flex justify-between font-semibold text-emerald-900">
                <span>Total due now</span>
                <span>
                  {formatMoney(
                    plan === "DEPOSIT" ? totalNowDeposit : totalNowFull,
                    currency,
                  )}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-emerald-900/70">
                <span>Due on delivery</span>
                <span>
                  {formatMoney(
                    plan === "DEPOSIT"
                      ? dueOnDeliveryDeposit
                      : dueOnDeliveryFull,
                    currency,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-black/60">
            Sprint 1 mock — chưa map backend. Mục tiêu: lock UI + flow.
          </div>
        </div>
      </div>
    </div>
  );
}
