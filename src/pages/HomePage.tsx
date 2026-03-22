import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import type { BikeCondition } from "@/types/shopbike";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation, Trans } from "react-i18next";
import { Logo } from "@/components/common/Logo";

import { HERO_SLIDES, HERO_AUTO_SLIDE_MS } from "@/constants/hero";

const SECTION_LISTINGS_ID = "listings";

const CONDITION_I18N_KEYS: Record<BikeCondition, string> = {
  NEW: "listing.conditionNew",
  LIKE_NEW: "listing.conditionLikeNew",
  MINT_USED: "listing.conditionMintUsed",
  GOOD_USED: "listing.conditionGoodUsed",
  FAIR_USED: "listing.conditionFairUsed",
};

function scrollToListings() {
  document.getElementById(SECTION_LISTINGS_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { accessToken, role } = useAuthStore();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

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
          setError(err?.message ?? t("home.loadError"));
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

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo === "listings") {
      setTimeout(scrollToListings, 100);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const state = location.state as { searchQuery?: string; scrollTo?: string } | null;
    if (state?.searchQuery != null && state.searchQuery.trim() !== "") {
      setQ(state.searchQuery.trim());
      setTimeout(scrollToListings, 100);
      navigate(location.pathname, { replace: true, state: state.scrollTo ? { scrollTo: state.scrollTo } : {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Hero slider: auto-advance
  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, HERO_AUTO_SLIDE_MS);
    return () => clearInterval(t);
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
      state: { from: { pathname: "/seller" } },
      replace: true,
    });
  }

  const showSellButton = role === "SELLER";

  return (
    <div className="space-y-8">
      {/* Hero slider – full màn hình, tự chuyển ảnh */}
      <section
        className="relative left-1/2 w-screen -translate-x-1/2 -mt-6 sm:-mt-8 group/hero"
        aria-label="Hero slider"
      >
        <div className="relative flex h-screen min-h-[100dvh] w-full items-end justify-center overflow-hidden bg-slate-900 md:items-center md:justify-center">
          {HERO_SLIDES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-out ${
                i === heroIndex ? "opacity-100 z-0" : "opacity-0 pointer-events-none z-0"
              }`}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
            />
          ))}
          <div className="absolute inset-0 z-[1] bg-black/25 md:bg-gradient-to-t md:from-black/60 md:via-black/20 md:to-transparent" />
          <div
            className="relative z-10 flex w-full max-w-6xl flex-col items-center px-6 pb-12 pt-8 text-center md:pb-16 md:pt-0"
          >
            <h1 className="flex justify-center [&_img]:drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <Logo variant="hero" />
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-white/95 md:text-lg">
              {t("home.heroSlogan1")}
              <br />
              <span className="whitespace-nowrap">
                {t("home.heroSlogan2").split("ShopBike")[0]}
                <span className="text-primary">ShopBike</span>
                {t("home.heroSlogan2").split("ShopBike")[1]}
              </span>
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={scrollToListings}
                className="min-w-[160px] bg-white font-bold text-slate-900 shadow-lg hover:bg-white/95 tracking-tight"
              >
                {t("home.exploreNow")}
              </Button>
              {showSellButton && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSellYourBike}
                  className="min-w-[140px] border-white/70 bg-white/10 font-semibold text-white hover:bg-white/20 tracking-tight"
                >
                  {t("home.sellYourBike")}
                </Button>
              )}
            </div>
          </div>
          {/* Dots điều hướng */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-8" aria-hidden>
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHeroIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === heroIndex
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bộ lọc (trên) + Tìm kiếm (dưới) – không dùng thanh full màn hình */}
      <section className="space-y-4">
        {/* Hàng 1: Bộ lọc */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap gap-3 sm:items-center">
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t("home.allBrands")} />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b === "ALL" ? t("home.allBrands") : b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t("home.allConditions")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("home.allConditions")}</SelectItem>
                {(Object.keys(CONDITION_I18N_KEYS) as BikeCondition[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {t(CONDITION_I18N_KEYS[k])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={frameSize} onValueChange={setFrameSize}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder={t("home.allSizes")} />
              </SelectTrigger>
              <SelectContent>
                {frameSizes.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f === "ALL" ? t("home.allSizes") : f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 sm:flex-nowrap">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={t("home.priceMin")}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-28 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Input
                type="number"
                inputMode="numeric"
                placeholder={t("home.priceMax")}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-28 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div className="text-sm text-muted-foreground">
              <Trans i18nKey="home.resultsCount" values={{ count: filtered.length }} components={{ 1: <span className="font-semibold text-foreground" /> }} />
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
              {t("home.clearFilters")}
            </Button>
          </div>
        </div>

        {/* Hàng 2: Thanh tìm kiếm */}
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("common.searchPlaceholderLong")}
            className="h-11 w-full pl-9 text-base"
          />
        </div>
      </section>

      {/* Listings */}
      <section id={SECTION_LISTINGS_ID} className="scroll-mt-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t("home.listings")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("home.listingsDesc")}
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
            {t("home.viewAllBikes")}
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border bg-card py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">{t("home.loadingListings")}</p>
          </div>
        ) : error ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <p className="text-sm text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground">
                Đang hiển thị dữ liệu dự phòng nếu có.
              </p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Bike className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t("home.noResults")}</p>
              <p className="text-xs text-muted-foreground">
                {t("home.noResultsHint")}
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
                {t("home.clearFilters")}
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

    </div>
  );
}
