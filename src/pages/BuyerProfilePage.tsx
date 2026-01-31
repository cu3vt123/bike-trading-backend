// src/pages/BuyerProfilePage.tsx
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const MOCK_ORDERS = [
  {
    id: "ORD-2048",
    bike: "Trek Marlin 5",
    date: "Oct 24, 2023",
    amount: 450,
    status: "IN_TRANSACTION" as const,
  },
  {
    id: "ORD-1092",
    bike: "Specialized Allez",
    date: "Sep 10, 2023",
    amount: 400,
    status: "COMPLETED" as const,
  },
  {
    id: "ORD-1102",
    bike: "Cannondale Helmet",
    date: "Aug 05, 2023",
    amount: 120,
    status: "COMPLETED" as const,
  },
];

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "mint" | "amber" | "slate";
}) {
  const cls =
    tone === "mint"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

export default function BuyerProfilePage() {
  const clearTokens = useAuthStore((s) => s.clearTokens);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 grid place-items-center text-emerald-800 font-bold">
                A
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  Alex Rider
                </div>
                <div className="truncate text-xs text-slate-500">
                  alex.rider@example.com
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Pill tone="mint">Verified Buyer</Pill>
            </div>

            <nav className="mt-5 space-y-2 text-sm">
              <button className="w-full rounded-2xl bg-emerald-600 px-4 py-2.5 text-left font-semibold text-white">
                Personal Info
              </button>
              <button className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-left font-semibold text-slate-800 hover:bg-slate-50">
                My Orders
              </button>
              <button className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-left font-semibold text-slate-800 hover:bg-slate-50">
                Saved Bikes
              </button>
              <button className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-left font-semibold text-slate-800 hover:bg-slate-50">
                Settings
              </button>
            </nav>

            <button
              onClick={() => clearTokens()}
              className="mt-6 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <section className="lg:col-span-9 space-y-4">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              Personal Information
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Manage your personal details and account settings.
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-semibold text-emerald-900">
                Privacy Protection Active
              </div>
              <div className="mt-1 text-xs text-emerald-900/80">
                Your contact details are protected until the transaction is
                confirmed.
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-700">
                  Full Name
                </div>
                <div className="mt-1 rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm">
                  Alex Rider
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">
                  Email Address
                </div>
                <div className="mt-1 rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm">
                  alex.rider@example.com
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold text-slate-700">
                  Phone Number
                </div>
                <div className="mt-1 rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm">
                  +84 9xx xxx xxx
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Recent Orders
              </div>
              <button className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                View All Orders
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-black/10">
              <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                <div className="col-span-5">Bike Details</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {MOCK_ORDERS.map((o) => (
                <div
                  key={o.id}
                  className="grid grid-cols-12 items-center px-4 py-3 text-sm border-t border-black/5"
                >
                  <div className="col-span-5">
                    <div className="font-semibold text-slate-900">{o.bike}</div>
                    <div className="text-xs text-slate-500">ID: {o.id}</div>
                  </div>
                  <div className="col-span-3 text-slate-600">{o.date}</div>
                  <div className="col-span-2 font-semibold text-slate-900">
                    ${o.amount.toFixed(2)}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {o.status === "IN_TRANSACTION" ? (
                      <Pill tone="amber">In Transaction</Pill>
                    ) : (
                      <Pill tone="mint">Completed</Pill>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Sprint 1 UI-only • Orders are mock data.
            </div>

            <div className="mt-4">
              <Link
                to="/"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
