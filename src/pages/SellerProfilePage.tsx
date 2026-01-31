// src/pages/SellerProfilePage.tsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type PaymentItem =
  | { type: "VISA" | "MASTERCARD"; label: string; sub: string; tag?: string }
  | { type: "MOMO"; label: string; sub: string; tag?: string };

export default function SellerProfilePage() {
  const navigate = useNavigate();
  const clearTokens = useAuthStore((s) => s.clearTokens);

  // Sprint 1 UI-only mock
  const seller = {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=60",
    memberSince: "September 2021",
  };

  const stats = {
    totalSales: 4250,
    totalSalesChangePct: 12,
    activeListings: 3,
  };

  const paymentMethods: PaymentItem[] = [
    {
      type: "VISA",
      label: "Visa ending in 4422",
      sub: "Expires 12/26",
      tag: "DEFAULT",
    },
    { type: "MOMO", label: "MoMo Wallet", sub: "Connected" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: profile card */}
        <aside className="lg:col-span-4">
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <img
                src={seller.avatarUrl}
                alt={seller.fullName}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-slate-900">
                  {seller.fullName}
                </div>
                <div className="truncate text-sm text-slate-500">
                  {seller.email}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Seller
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400">
              Member since {seller.memberSince}
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => alert("Sprint 1 UI only")}
                className="h-10 w-full rounded-2xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Edit Profile
              </button>

              <button
                onClick={() => {
                  clearTokens();
                  navigate("/", { replace: true });
                }}
                className="h-10 w-full rounded-2xl border border-black/10 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <section className="lg:col-span-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                Seller Hub
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Manage your inventory, listings and payouts.
              </div>
            </div>

            <button
              onClick={() => alert("Sprint 1 UI only")}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View All Stats →
            </button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Total Sales
                </div>
                <div className="h-9 w-9 rounded-2xl bg-emerald-50" />
              </div>

              <div className="mt-3 text-2xl font-bold text-slate-900">
                ${stats.totalSales.toLocaleString()}
              </div>
              <div className="mt-1 text-sm text-emerald-700">
                +{stats.totalSalesChangePct}% this month
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Active Listings
                </div>
                <div className="h-9 w-9 rounded-2xl bg-emerald-50" />
              </div>

              <div className="mt-3 text-2xl font-bold text-slate-900">
                {stats.activeListings}
              </div>
              <div className="mt-1 text-sm text-slate-500">Bikes for sale</div>
            </div>
          </div>

          {/* ✅ Payment Methods (giữ) */}
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Payment Methods
              </div>

              <button
                onClick={() => alert("Sprint 1 UI only")}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                + Add New
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {paymentMethods.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cx(
                        "grid h-10 w-10 place-items-center rounded-2xl text-xs font-bold",
                        p.type === "MOMO"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-700",
                      )}
                    >
                      {p.type === "MOMO" ? "MoMo" : p.type}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {p.label}
                        {p.tag && (
                          <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {p.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{p.sub}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert("Sprint 1 UI only")}
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ ĐÃ BỎ: Security / Login Sessions */}
        </section>
      </div>
    </div>
  );
}
