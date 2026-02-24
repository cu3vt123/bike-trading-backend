import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bike } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchListings } from "@/services/buyerService";
import ListingCard from "@/components/listing/ListingCard";
import type { Listing } from "@/types/shopbike";
import { BIKE_CONDITION_LABEL } from "@/types/shopbike";
import { useAuthStore } from "@/stores/useAuthStore";

const SECTION_LISTINGS_ID = "listings";

function scrollToListings() {
  document.getElementById(SECTION_LISTINGS_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const { accessToken, role } = useAuthStore();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string>("ALL");
  const [condition, setCondition] = useState<string>("ALL");
  const [frameSize, setFrameSize] = useState<string>("ALL");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListings()
      .then((data) => {
        if (!cancelled) setListings(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.message ?? "Failed to load listings. Using fallback.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    const min = priceMin.trim() ? parseFloat(priceMin) : null;
    const max = priceMax.trim() ? parseFloat(priceMax) : null;
    return listings.filter((x) => {
      const okBrand = brand === "ALL" ? true : x.brand === brand;
      const okCondition = condition === "ALL" ? true : x.condition === condition;
      const okFrame = frameSize === "ALL" ? true : (x.frameSize ?? "").toLowerCase().includes(frameSize.toLowerCase());
      const okPrice = (min == null || x.price >= min) && (max == null || x.price <= max);
      const okQ =
        keyword.length === 0
          ? true
          : `${x.brand ?? ""} ${x.title ?? ""} ${x.location ?? ""}`
              .toLowerCase()
              .includes(keyword);
      return okBrand && okCondition && okFrame && okPrice && okQ;
    });
  }, [listings, q, brand, condition, frameSize, priceMin, priceMax]);

  useEffect(() => {
    if (window.location.hash === `#${SECTION_LISTINGS_ID}`) {
      setTimeout(scrollToListings, 0);
    }
  }, []);

  const brands = useMemo(() => {
    const set = new Set(listings.map((x) => x.brand).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [listings]);

  const frameSizes = useMemo(() => {
    const set = new Set(
      listings
        .map((x) => x.frameSize)
        .filter((s): s is string => !!s && s.trim() !== "")
    );
    return ["ALL", ...Array.from(set).sort()];
  }, [listings]);

  function handleSellYourBike() {
    if (accessToken && role === "SELLER") {
      navigate("/seller");
      return;
    }
    navigate("/login", {
      state: { from: { pathname: "/seller" }, presetRole: "SELLER" },
      replace: true,
    });
  }

  const showSellButton = role === "SELLER";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card>
        <CardContent className="p-0">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
              <div className="aspect-[16/10] w-full bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=60"
                  alt="ShopBike hero"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center px-4 py-4 md:px-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                VERIFIED MARKETPLACE
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Inspected listings only
              </div>

              <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Find your next ride —{" "}
                <span className="text-primary">verified</span> &{" "}
                <span className="text-primary">inspected</span>
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Marketplace for used sport bikes. Listings visible only after{" "}
                <span className="font-semibold">inspection APPROVE</span>.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={scrollToListings}>
                  Browse bikes
                </Button>
                {showSellButton && (
                  <Button variant="outline" onClick={handleSellYourBike}>
                    Sell your bike
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 px-4 pb-4 md:grid-cols-3">
            <div className="rounded-lg border bg-primary/5 px-4 py-3">
              <div className="text-sm font-semibold">Inspection Report</div>
              <div className="text-xs text-muted-foreground">
                Clear checks, transparent info.
              </div>
            </div>
            <div className="rounded-lg border bg-primary/5 px-4 py-3">
              <div className="text-sm font-semibold">Anti-fraud</div>
              <div className="text-xs text-muted-foreground">
                Verified & moderated listings.
              </div>
            </div>
            <Link to="/support" className="rounded-lg border bg-primary/5 px-4 py-3 hover:bg-primary/10 transition-colors">
              <div className="text-sm font-semibold">Support</div>
              <div className="text-xs text-muted-foreground">
                Help through the transaction.
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap gap-2 sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search bikes, brand, or location..."
                  className="pl-9"
                />
              </div>

              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All brands" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b === "ALL" ? "All brands" : b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All conditions</SelectItem>
                  {Object.entries(BIKE_CONDITION_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={frameSize} onValueChange={setFrameSize}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Frame size" />
                </SelectTrigger>
                <SelectContent>
                  {frameSizes.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f === "ALL" ? "All sizes" : f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2 sm:flex-nowrap">
                <Input
                  type="number"
                  placeholder="Min $"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-24"
                />
                <Input
                  type="number"
                  placeholder="Max $"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 md:justify-end">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> results
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQ("");
                  setBrand("ALL");
                  setCondition("ALL");
                  setFrameSize("ALL");
                  setPriceMin("");
                  setPriceMax("");
                }}
              >
                Clear all
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Listings */}
      <section id={SECTION_LISTINGS_ID} className="scroll-mt-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Featured Listings</h2>
            <p className="text-sm text-muted-foreground">
              Only inspected & approved listings are shown.
            </p>
          </div>
          <Link
            to="/#listings"
            onClick={(e) => {
              e.preventDefault();
              scrollToListings();
            }}
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all bikes →
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border bg-card py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading listings...</p>
          </div>
        ) : error ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <p className="text-sm text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground">
                Showing fallback data if available.
              </p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bike className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">No bikes found matching your criteria</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or clearing filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setQ("");
                  setBrand("ALL");
                  setCondition("ALL");
                  setFrameSize("ALL");
                  setPriceMin("");
                  setPriceMax("");
                }}
              >
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((x) => (
              <ListingCard key={x.id} listing={x} />
            ))}
          </div>
        )}
      </section>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-muted-foreground">
          <span>
            Data from <b>buyerService</b> (API + mock fallback) • Only{" "}
            <b>PUBLISHED + APPROVE</b> on marketplace.
          </span>
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Go to Login →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
