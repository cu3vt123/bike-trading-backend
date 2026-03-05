import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Bike } from "lucide-react";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { fetchListingById } from "@/services/buyerService";
import ListingCard from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BikeDetail } from "@/types/shopbike";

export default function WishlistPage() {
  const idsStr = useWishlistStore((s) => Array.from(s.ids).sort().join(","));
  const ids = idsStr ? idsStr.split(",").filter(Boolean) : [];
  const [listings, setListings] = useState<BikeDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => fetchListingById(id)))
      .then((results) => results.filter((x): x is BikeDetail => x != null))
      .then(setListings)
      .finally(() => setLoading(false));
  }, [idsStr]);

  if (ids.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Your wishlist is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Click the heart icon on a bike to add it to your wishlist.
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Explore bikes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {listings.length} {listings.length === 1 ? "item" : "items"} in your wishlist
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Bike className="h-12 w-12 text-muted-foreground" />
            <p className="mt-3 text-sm">Some listings may no longer be available.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
