import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Star } from "lucide-react";
import type { Listing, ListingState } from "@/types/shopbike";
import { fetchSellerDashboard } from "@/services/sellerService";

// Mock: orders / deposits
const MOCK_ORDERS = [
  { id: "ORD-101", bike: "Trek Domane SL", buyer: "buyer_01", amount: 3100, deposit: 248, status: "RESERVED" },
  { id: "ORD-102", bike: "Cervelo S5", buyer: "rider_99", amount: 6900, deposit: 552, status: "PAID" },
];

function formatMoney(value: number, currency: "VND" | "USD" = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function stateLabel(state: ListingState) {
  switch (state) {
    case "DRAFT":
      return {
        text: "Draft",
        cls: "bg-slate-100 text-slate-700 border-slate-200",
      };
    case "PENDING_INSPECTION":
      return {
        text: "In Review",
        cls: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "NEED_UPDATE":
      return {
        text: "Needs Update",
        cls: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "PUBLISHED":
      return {
        text: "Published",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "REJECTED":
      return {
        text: "Rejected",
        cls: "bg-slate-50 text-slate-500 border-slate-200",
      };
    default:
      return {
        text: state,
        cls: "bg-slate-50 text-slate-600 border-slate-200",
      };
  }
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState({ total: 0, published: 0, inReview: 0, needUpdate: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerDashboard()
      .then(({ stats: s, listings: ls }) => {
        setStats(s);
        setListings(ls);
      })
      .finally(() => setLoading(false));
  }, []);

  const { total, published, inReview, needUpdate } = stats;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">
            Seller Dashboard
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Manage your inventory, inspection, and publishing.
          </div>
        </div>

        <Link
          to="/seller/listings/new"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Create new listing
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Listings" value={total} />
        <StatCard
          label="Active Listings"
          value={published}
          hint="PUBLISHED + APPROVE only"
        />
        <StatCard label="In Review" value={inReview} />
        <StatCard label="Need Update" value={needUpdate} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Inventory table */}
        <div className="lg:col-span-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">
              Your inventory
            </div>
            <Link to="/seller" className="text-sm font-semibold text-emerald-700 hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-black/10">
            <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
              <div className="col-span-6">Listing</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="divide-y divide-black/5">
              {listings.map((x) => {
                const badge = stateLabel(x.state);
                const canEdit =
                  x.state === "DRAFT" || x.state === "NEED_UPDATE";
                const needUpdateReason =
                  x.state === "NEED_UPDATE"
                    ? (x as any).inspectionNeedUpdateReason || ""
                    : "";

                return (
                  <div
                    key={x.id}
                    className="grid grid-cols-12 items-center px-4 py-3"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={x.thumbnailUrl ?? x.imageUrls?.[0] ?? ""}
                          alt={x.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {x.brand}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {x.title}
                        </div>
                        {needUpdateReason && (
                          <div className="mt-1 text-xs text-rose-600">
                            Inspector feedback: {needUpdateReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 text-right text-sm font-semibold text-slate-900">
                      {formatMoney(x.price, "USD")}
                    </div>

                    <div className="col-span-2 text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    </div>

                    <div className="col-span-2 text-right">
                      {canEdit ? (
                        <Link
                          to={`/seller/listings/${x.id}/edit`}
                          className="inline-flex rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="inline-flex cursor-not-allowed rounded-lg border border-black/10 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400"
                        >
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Draft/Need Update can be edited. Pending Inspection locks editing. Published limits core content changes.
          </div>
        </div>

        {/* New Listing Draft panel */}
        <div className="lg:col-span-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">
            New listing draft
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Create a draft first, then submit for inspection.
          </div>

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Listing title"
            />
            <input
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Price (USD)"
            />

            <div className="rounded-xl border border-black/10 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-700">
                Photos checklist
              </div>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                <li>• Full bike (both sides)</li>
                <li>• Frame serial</li>
                <li>• Drivetrain close-up</li>
                <li>• Brakes / wheels</li>
              </ul>
            </div>

            <Link
              to="/seller/listings/new"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Continue to editor →
            </Link>
          </div>
        </div>
      </div>

      {/* Orders & Ratings row */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-900">Orders / Deposits</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Manage orders and deposits.</p>
          <div className="mt-4 space-y-3">
            {MOCK_ORDERS.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-black/10 bg-slate-50/50 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-semibold">{o.bike}</div>
                  <div className="text-xs text-slate-500">
                    {o.id} • {o.buyer} • {formatMoney(o.deposit)} deposit
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    o.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {o.status === "PAID" ? "Paid" : "Pending"}
                </span>
              </div>
            ))}
            {MOCK_ORDERS.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No orders yet.</p>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Will integrate API when Backend provides order management endpoint.
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-semibold text-slate-900">Ratings & reputation</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Trust level from buyers.</p>
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-black/10 bg-slate-50/50 py-6">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900">4.8</span>
              <span className="text-amber-500">★★★★★</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">12 reviews</p>
            <p className="mt-1 text-xs text-slate-500">97% positive feedback</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">5 sao</span>
              <span className="font-semibold">10</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">4 sao</span>
              <span className="font-semibold">2</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Ratings from successful transactions. Will sync API when available.
          </p>
        </div>
      </div>
    </div>
  );
}
