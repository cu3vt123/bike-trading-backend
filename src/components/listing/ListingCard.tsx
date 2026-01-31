import { Link } from "react-router-dom";
import type { Listing } from "@/types/shopbike";

function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

type Props = {
  listing: Listing;
};

export default function ListingCard({ listing }: Props) {
  const isVerified =
    listing.state === "PUBLISHED" && listing.inspectionResult === "APPROVE";

  const img =
    listing.thumbnailUrl ||
    listing.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1400&q=60";

  return (
    <Link to={`/bikes/${listing.id}`} state={{ listing }} className="...">
      <div className="relative overflow-hidden rounded-t-2xl">
        <div className="aspect-[4/3] w-full bg-slate-100">
          <img
            src={img}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>

        {isVerified && (
          <div className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
            Verified
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {listing.brand} {listing.model ?? ""}
            </div>
            <div className="truncate text-xs text-slate-500">
              {listing.title}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-emerald-700">
              {formatMoney(listing.price, listing.currency ?? "VND")}
            </div>
            {!!listing.msrp && listing.msrp > listing.price && (
              <div className="text-xs text-slate-400 line-through">
                {formatMoney(listing.msrp, listing.currency ?? "VND")}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          {listing.year && <span>{listing.year}</span>}
          {listing.frameSize && <span>Size {listing.frameSize}</span>}
          {listing.condition && <span>{listing.condition}</span>}
          {listing.location && (
            <span className="truncate">• {listing.location}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
