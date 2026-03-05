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
    <div className="space-y-8">
      {/* Hero */}
      <Card className="overflow-hidden border-slate-200 shadow-lg">
        <CardContent className="p-0">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
              <div className="aspect-[16/10] w-full bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=60"
                  alt="ShopBike hero"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent md:from-transparent" />
            </div>

            <div className="flex flex-col justify-center px-6 py-6 md:px-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                VERIFIED MARKETPLACE
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Inspected listings only
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl lg:text-4xl">
                Find your next ride —{" "}
                <span className="text-primary">verified</span> &{" "}
                <span className="text-primary">inspected</span>
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Marketplace for used sport bikes. Listings visible only after{" "}
                <span className="font-semibold text-foreground">inspection APPROVE</span>.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={scrollToListings}
                  className="shadow-sm"
                >
                  Browse bikes
                </Button>
                {showSellButton && (
                  <Button variant="outline" size="lg" onClick={handleSellYourBike}>
                    Sell your bike
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 px-4 pb-6 md:grid-cols-3 md:px-6">
            <div className="rounded-xl border border-slate-200 bg-primary/5 px-4 py-3.5 transition-colors hover:bg-primary/10">
              <div className="text-sm font-semibold text-foreground">Inspection Report</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Clear checks, transparent info.
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-primary/5 px-4 py-3.5 transition-colors hover:bg-primary/10">
              <div className="text-sm font-semibold text-foreground">Anti-fraud</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Verified & moderated listings.
              </div>
            </div>
            <Link
              to="/support"
              className="rounded-xl border border-slate-200 bg-primary/5 px-4 py-3.5 transition-colors hover:bg-primary/10"
            >
              <div className="text-sm font-semibold text-foreground">Support</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Help through the transaction.
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap gap-3 sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search bikes, brand, or location..."
                  className="h-10 pl-9"
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
          <Card className="mt-6 border-slate-200">
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Bike className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-foreground">No bikes found matching your criteria</p>
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
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((x) => (
              <ListingCard key={x.id} listing={x} />
            ))}
          </div>
        )}
      </section>

      <Card className="border-slate-200 bg-slate-50/50">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-muted-foreground">
          <span>
            Data from <b>buyerService</b> (API + mock fallback) • Only{" "}
            <b>PUBLISHED + APPROVE</b> on marketplace.
          </span>
          <Link to="/login" className="font-semibold text-primary transition-colors hover:underline">
            Go to Login →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
