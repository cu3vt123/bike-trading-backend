import { useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import type { Listing } from "@/types/shopbike";
import { MOCK_LISTINGS } from "@/mocks/mockListings";

type NavState = { listing?: Listing };

function formatMoney(value: number, currency: "VND" | "USD" = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

function Stars({ value }: { value: number }) {
  const full = Math.round(Math.max(0, Math.min(5, value)));
  const stars = "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
  return <span className="text-emerald-600">{stars}</span>;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fromState = (location.state as NavState | null)?.listing;

  const listing =
    (fromState && String(fromState.id) === String(id)
      ? fromState
      : undefined) ?? MOCK_LISTINGS.find((x) => String(x.id) === String(id));

  const images = useMemo(() => {
    const arr =
      listing?.imageUrls?.filter(Boolean) ??
      (listing?.thumbnailUrl ? [listing.thumbnailUrl] : []);
    if (arr.length > 0) return arr;
    return [
      "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1600&q=60",
    ];
  }, [listing]);

  const [active, setActive] = useState(0);

  if (!listing) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8">
        <h1 className="text-lg font-semibold">Listing not found</h1>
        <p className="mt-1 text-sm text-black/60">
          The bike listing you're looking for doesn't exist (Sprint 1 mock).
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

  const currency = (listing.currency ?? "USD") as "VND" | "USD";
  const price = listing.price;
  const msrp = listing.msrp;
  const score = listing.inspectionScore ?? 4.6;

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* breadcrumb */}
      <div className="mb-4 text-xs text-slate-500">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        <span className="mx-1">›</span>
        <span className="text-slate-700">
          {listing.brand} {listing.model}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Gallery + content */}
        <div className="lg:col-span-8">
          {/* Gallery */}
          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="grid gap-4 md:grid-cols-12">
              <div className="md:col-span-8">
                <div className="overflow-hidden rounded-2xl border border-black/10 bg-slate-100">
                  <div className="aspect-[4/3] w-full">
                    <img
                      src={images[Math.min(active, images.length - 1)]}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-4">
                <div className="grid grid-cols-4 gap-3 md:grid-cols-2">
                  {images.slice(0, 4).map((src, idx) => (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => setActive(idx)}
                      className={`overflow-hidden rounded-2xl border ${
                        idx === active
                          ? "border-emerald-400 ring-2 ring-emerald-100"
                          : "border-black/10 hover:border-black/20"
                      } bg-slate-100`}
                    >
                      <div className="aspect-square">
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>

                {images.length > 4 && (
                  <div className="mt-3 text-xs text-slate-500">
                    +{images.length - 4} more photos
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title block */}
          <div className="mt-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Verified marketplace
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Inspected
            </div>

            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {listing.brand} {listing.model}
            </h1>

            <div className="mt-2 text-sm text-slate-600">{listing.title}</div>
          </div>

          {/* Inspection report summary */}
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Inspection Report
              </div>

              <button
                type="button"
                onClick={() => alert("Sprint 1 UI only")}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View full report
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Frame integrity</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Excellent
                </div>
                <div className="mt-1 text-xs">
                  <Stars value={score} />{" "}
                  <span className="text-slate-500">({score.toFixed(1)})</span>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Drivetrain health</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Great
                </div>
                <div className="mt-1 text-xs">
                  <Stars value={Math.max(4.2, score - 0.2)} />
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Braking system</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  Great
                </div>
                <div className="mt-1 text-xs">
                  <Stars value={Math.max(4.0, score - 0.3)} />
                </div>
              </div>
            </div>
          </div>

          {/* Technical specs */}
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-sm font-semibold text-slate-900">
              Technical Specifications
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <SpecRow label="Brand" value={listing.brand} />
              <SpecRow label="Model" value={listing.model ?? "—"} />
              <SpecRow
                label="Year"
                value={listing.year ? String(listing.year) : "—"}
              />
              <SpecRow label="Frame size" value={listing.frameSize ?? "—"} />
              <SpecRow label="Condition" value={listing.condition ?? "—"} />
              <SpecRow label="Location" value={listing.location ?? "—"} />
            </div>

            {listing.specs?.length ? (
              <div className="mt-5 border-t border-black/5 pt-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {listing.specs.map((s, idx) => (
                    <SpecRow
                      key={`${s.label}-${idx}`}
                      label={s.label}
                      value={s.value}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT: Price / actions card */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">Total Price</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {formatMoney(price, currency)}
                  </div>
                  {msrp && msrp > price ? (
                    <div className="mt-1 text-xs text-slate-400 line-through">
                      {formatMoney(msrp, currency)}
                    </div>
                  ) : null}

                  <div className="mt-2 text-xs text-emerald-700">
                    Service fee included
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
                  <div className="text-[10px] font-semibold text-emerald-800">
                    INSPECTED
                  </div>
                  <div className="mt-1 text-xs text-emerald-700">
                    <Stars value={score} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/checkout/${listing.id}`)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Buy now →
              </button>

              <button
                onClick={() => alert("Sprint 1 UI only")}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Reserve for 24h
              </button>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <InfoLine
                  title="Secure Payment"
                  desc="Protected marketplace escrow flow"
                />
                <InfoLine
                  title="Insured Shipping"
                  desc="Delivery & handling supported"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">
                Seller (Sprint 1 UI)
              </div>
              <div className="mt-2 text-xs text-slate-600">
                ProCyclist SF • 97% response • Verified seller
              </div>

              <button
                onClick={() => alert("Sprint 1 UI only")}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Ask seller a question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- small components --- */
function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900 text-right">
        {value}
      </div>
    </div>
  );
}

function InfoLine({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-black/10 bg-slate-50 px-3 py-2">
      <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-slate-500">{desc}</div>
      </div>
    </div>
  );
}
