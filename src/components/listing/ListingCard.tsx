import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Listing } from "@/types/shopbike";
import { useAuthStore } from "@/stores/useAuthStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { Button } from "@/components/ui/button";

function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

type Props = {
  listing: Listing;
  /** Show wishlist heart (default: true when BUYER) */
  showWishlist?: boolean;
};

export default function ListingCard({ listing, showWishlist = true }: Props) {
  const role = useAuthStore((s) => s.role);
  const inWishlist = useWishlistStore((s) => s.ids.has(listing.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const canWishlist = showWishlist && role === "BUYER";

  const isVerified =
    listing.state === "PUBLISHED" && listing.inspectionResult === "APPROVE";

  const img =
    listing.thumbnailUrl ||
    listing.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1400&q=60";

  return (
    <Link
      to={`/bikes/${listing.id}`}
      state={{ listing }}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="aspect-[4/3] w-full bg-slate-100">
          <img
            src={img}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {isVerified && (
          <div className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            Verified
          </div>
        )}
        {canWishlist && (
          <div className="absolute right-3 top-3 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md transition-transform hover:scale-110"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(listing.id);
              }}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${inWishlist ? "fill-primary text-primary" : ""}`}
              />
            </Button>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">
              {listing.brand} {listing.model ?? ""}
            </div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {listing.title}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-primary">
              {formatMoney(listing.price, listing.currency ?? "VND")}
            </div>
            {!!listing.msrp && listing.msrp > listing.price && (
              <div className="text-xs text-slate-400 line-through">
                {formatMoney(listing.msrp, listing.currency ?? "VND")}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
