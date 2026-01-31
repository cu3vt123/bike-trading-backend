// src/pages/HomePage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListingCard from "@/components/listing/ListingCard";
import type { Listing } from "@/types/shopbike";
import { useAuthStore } from "@/stores/useAuthStore";

const SECTION_LISTINGS_ID = "listings";

// Sprint 1: mock data (chỉ show marketplace nếu PUBLISHED + APPROVE)
const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Specialized S-Works Tarmac SL7",
    brand: "Specialized",
    price: 7200000,
    location: "Ho Chi Minh City",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1200&q=60",
    state: "PUBLISHED",
    inspectionResult: "APPROVE",
  },
  {
    id: "2",
    title: "Cannondale SuperSix EVO",
    brand: "Cannondale",
    price: 8850000,
    location: "Da Nang",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1528701800489-20be9c07a00c?auto=format&fit=crop&w=1200&q=60",
    state: "PUBLISHED",
    inspectionResult: "APPROVE",
  },
  {
    id: "3",
    title: "Trek Émonda SL 7 (Pending Inspection)",
    brand: "Trek",
    price: 5100000,
    location: "Ha Noi",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=1200&q=60",
    state: "PENDING_INSPECTION",
    inspectionResult: null,
  },
];

function isMarketVisible(item: Listing) {
  return item.state === "PUBLISHED" && item.inspectionResult === "APPROVE";
}

function scrollToListings() {
  const el = document.getElementById(SECTION_LISTINGS_ID);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomePage() {
  const navigate = useNavigate();
  const { accessToken, role } = useAuthStore();

  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string>("ALL");

  const allVisible = useMemo(() => MOCK_LISTINGS.filter(isMarketVisible), []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return allVisible.filter((x) => {
      const okBrand = brand === "ALL" ? true : x.brand === brand;
      const okQ =
        keyword.length === 0
          ? true
          : `${x.brand ?? ""} ${x.title ?? ""} ${x.location ?? ""}`
              .toLowerCase()
              .includes(keyword);

      return okBrand && okQ;
    });
  }, [allVisible, q, brand]);

  // Support /#listings (Explore)
  useEffect(() => {
    if (window.location.hash === `#${SECTION_LISTINGS_ID}`) {
      setTimeout(scrollToListings, 0);
    }
  }, []);

  const brands = useMemo(() => {
    const set = new Set(allVisible.map((x) => x.brand));
    return ["ALL", ...Array.from(set)];
  }, [allVisible]);

  function handleSellYourBike() {
    // Seller đã login -> vào seller dashboard
    if (accessToken && role === "SELLER") {
      navigate("/seller");
      return;
    }

    // Chưa login -> qua login, preset SELLER, login xong quay về /seller
    navigate("/login", {
      state: {
        from: { pathname: "/seller" },
        presetRole: "SELLER",
      },
      replace: true,
    });
  }

  const showSellButton = role !== "BUYER"; // Buyer không thấy

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            <div className="aspect-[16/10] w-full">
              <img
                src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=60"
                alt="ShopBike hero"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center px-2 py-2 md:px-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              VERIFIED MARKETPLACE
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Inspected listings only
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Find your next ride —{" "}
              <span className="text-emerald-700">verified</span> &amp;{" "}
              <span className="text-emerald-700">inspected</span>
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Marketplace for used sport bikes. Listings are visible only after{" "}
              <span className="font-semibold">inspection APPROVE</span>.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={scrollToListings}
                className="h-10 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Browse bikes
              </button>

              {showSellButton && (
                <button
                  onClick={handleSellYourBike}
                  className="h-10 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Sell your bike
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust row */}
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-emerald-50 px-4 py-3">
            <div className="text-sm font-semibold">Inspection Report</div>
            <div className="text-xs text-slate-600">
              Clear checks, transparent info.
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-emerald-50 px-4 py-3">
            <div className="text-sm font-semibold">Anti-fraud</div>
            <div className="text-xs text-slate-600">
              Verified &amp; moderated listings.
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-emerald-50 px-4 py-3">
            <div className="text-sm font-semibold">Support</div>
            <div className="text-xs text-slate-600">
              Help through the transaction.
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="w-full">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search bikes, brand, or location..."
                className="h-10 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-emerald-200 focus:ring-4"
              />
            </div>

            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-sm outline-none ring-emerald-200 focus:ring-4"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b === "ALL" ? "All brands" : b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold">{filtered.length}</span>{" "}
              results
            </div>

            <button
              onClick={() => {
                setQ("");
                setBrand("ALL");
              }}
              className="h-10 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Clear all
            </button>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id={SECTION_LISTINGS_ID} className="scroll-mt-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Featured Listings</h2>
            <p className="text-sm text-slate-500">
              Only inspected &amp; approved listings are shown.
            </p>
          </div>

          <Link
            to="/#listings"
            onClick={(e) => {
              e.preventDefault();
              scrollToListings();
            }}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View all bikes →
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-black/10 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              ⌕
            </div>
            <div className="mt-3 text-sm font-semibold">
              No bikes found matching your criteria
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Try adjusting your search or clearing filters.
            </div>
            <button
              onClick={() => {
                setQ("");
                setBrand("ALL");
              }}
              className="mt-4 h-10 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((x) => (
              <ListingCard key={x.id} listing={x} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>
            Sprint 1: UI only • Business rule: only <b>PUBLISHED + APPROVE</b>{" "}
            appears on marketplace.
          </span>
          <Link
            to="/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Go to Login →
          </Link>
        </div>
      </section>
    </div>
  );
}
