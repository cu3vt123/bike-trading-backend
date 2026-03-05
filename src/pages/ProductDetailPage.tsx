import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Shield, Heart, MessageCircle } from "lucide-react";
import type { BikeDetail } from "@/types/shopbike";
import { fetchListingById } from "@/services/buyerService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWishlistStore } from "@/stores/useWishlistStore";

type NavState = { listing?: BikeDetail };

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
  return <span className="text-primary">{stars}</span>;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fromState = (location.state as NavState | null)?.listing;

  const [listing, setListing] = useState<BikeDetail | null>(
    fromState && String(fromState.id) === String(id) ? fromState : null,
  );
  const [loading, setLoading] = useState(!fromState || String(fromState.id) !== String(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stateMatch = fromState && String(fromState.id) === String(id);
    if (stateMatch) {
      setListing(fromState!);
      setLoading(false);
      return;
    }
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListingById(id)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load listing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

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
  const [reportOpen, setReportOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const inWishlist = useWishlistStore((s) => s.ids.has(listing?.id ?? ""));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const specs = useMemo(() => {
    const s = listing?.specs;
    if (Array.isArray(s)) return s;
    if (s && typeof s === "object") {
      return Object.entries(s).map(([label, value]) => ({
        label,
        value: String(value),
      }));
    }
    return [];
  }, [listing]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Card className="mx-auto max-w-6xl">
        <CardContent className="py-12">
          <h1 className="text-lg font-semibold">Listing not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? "The bike listing you're looking for doesn't exist."}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currency = (listing.currency ?? "USD") as "VND" | "USD";
  const price = listing.price;
  const msrp = listing.msrp;
  const score = listing.inspectionScore ?? 0;
  const inspectionReport = listing.inspectionReport;
  const hasInspectionReport =
    inspectionReport?.frameIntegrity &&
    inspectionReport?.drivetrainHealth &&
    inspectionReport?.brakingSystem;
  const isVerified =
    listing.state === "PUBLISHED" && listing.inspectionResult === "APPROVE";
  const canBuy = isVerified;
  const isPendingInspection = listing.state === "PENDING_INSPECTION";

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* breadcrumb */}
      <div className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">
          {listing.brand} {listing.model}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Gallery + content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gallery */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-8">
                  <div className="overflow-hidden rounded-xl border bg-muted">
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
                        className={`overflow-hidden rounded-lg border-2 transition ${
                          idx === active
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-input hover:border-primary/50"
                        } bg-muted`}
                      >
                        <div className="aspect-square">
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </div>
                      </button>
                    ))}
                  </div>
                  {images.length > 4 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      +{images.length - 4} more photos
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Title block */}
          <div>
            {isVerified && (
              <Badge variant="default" className="mb-3">
                <Shield className="mr-1 h-3 w-3" />
                Verified marketplace • Inspected
              </Badge>
            )}
            <h1 className="text-2xl font-bold text-foreground">
              {listing.brand} {listing.model}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{listing.title}</p>
          </div>

          {/* Inspection report – only when inspector has filled it in */}
          {hasInspectionReport ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-semibold">Inspection Report</span>
                <Button variant="link" size="sm" className="text-primary" onClick={() => setReportOpen(true)}>
                  View full report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { rowLabel: "Frame integrity", ...inspectionReport.frameIntegrity },
                    { rowLabel: "Drivetrain health", ...inspectionReport.drivetrainHealth },
                    { rowLabel: "Braking system", ...inspectionReport.brakingSystem },
                  ].map(({ rowLabel, label: value, score: s }) => (
                    <div key={rowLabel} className="rounded-lg border bg-muted/50 p-4">
                      <div className="text-xs text-muted-foreground">{rowLabel}</div>
                      <div className="mt-2 text-sm font-semibold">{value}</div>
                      <div className="mt-1 text-xs">
                        <Stars value={s ?? 0} />{" "}
                        <span className="text-muted-foreground">({(s ?? 0).toFixed(1)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : isPendingInspection ? (
            <Card>
              <CardContent className="py-6">
                <div className="text-sm font-semibold">Inspection Report</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pending inspection. An inspector will review this listing and add the report.
                </p>
              </CardContent>
            </Card>
          ) : !isVerified ? (
            <Card>
              <CardContent className="py-6">
                <div className="text-sm font-semibold">Inspection Report</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  No inspection report available.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Specs */}
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">Technical Specifications</span>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <SpecRow label="Brand" value={listing.brand} />
                <SpecRow label="Model" value={listing.model ?? "—"} />
                <SpecRow label="Year" value={listing.year ? String(listing.year) : "—"} />
                <SpecRow label="Frame size" value={listing.frameSize ?? "—"} />
                <SpecRow label="Condition" value={listing.condition ?? "—"} />
                <SpecRow label="Location" value={listing.location ?? "—"} />
                {specs.map((s, idx) => (
                  <SpecRow key={`${s.label}-${idx}`} label={s.label} value={String(s.value)} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Report Dialog */}
          {hasInspectionReport && (
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Inspection Report</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {[
                    { rowLabel: "Frame integrity", ...inspectionReport!.frameIntegrity },
                    { rowLabel: "Drivetrain health", ...inspectionReport!.drivetrainHealth },
                    { rowLabel: "Braking system", ...inspectionReport!.brakingSystem },
                  ].map(({ rowLabel, label: value, score: s }) => (
                    <div key={rowLabel} className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <span className="text-sm text-muted-foreground">{rowLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{value}</span>
                        <Stars value={s ?? 0} />
                        <span className="text-xs text-muted-foreground">({(s ?? 0).toFixed(1)})</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
                    <span className="text-sm text-muted-foreground">Overall score</span>
                    <div className="flex items-center gap-2">
                      <Stars value={score} />
                      <span className="text-sm font-semibold">({score.toFixed(1)})</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* RIGHT: Price / actions */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Price</div>
                    <div className="mt-1 text-2xl font-bold">{formatMoney(price, currency)}</div>
                    {msrp && msrp > price && (
                      <div className="mt-1 text-xs text-muted-foreground line-through">
                        {formatMoney(msrp, currency)}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-primary">Service fee included</p>
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-center ${isVerified ? "bg-primary/10" : isPendingInspection ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"}`}>
                    <div className="text-[10px] font-semibold">
                      {isVerified ? "INSPECTED" : isPendingInspection ? "PENDING" : "UNAVAILABLE"}
                    </div>
                    {isVerified && (
                      <div className="mt-1 text-xs">
                        <Stars value={score} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {canBuy && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => toggleWishlist(listing.id)}
                      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={`h-4 w-4 ${inWishlist ? "fill-primary text-primary" : ""}`}
                      />
                    </Button>
                  )}
                  {canBuy && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setChatOpen(true)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat with seller
                    </Button>
                  )}
                </div>
                {canBuy ? (
                  <>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => navigate(`/checkout/${listing.id}`)}
                    >
                      Buy now →
                    </Button>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Reservation is created after <span className="font-semibold">deposit payment</span>{" "}
                      in checkout and is held for <span className="font-semibold">24 hours</span>.
                    </p>
                  </>
                ) : isPendingInspection ? (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <span className="font-semibold">Pending inspection.</span> This listing is under review and not yet available for purchase.
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-muted bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    This listing is not available for purchase.
                  </div>
                )}

                <div className="mt-4 space-y-2 text-xs">
                  <InfoLine title="Secure Payment" desc="Protected marketplace escrow flow" />
                  <InfoLine title="Insured Shipping" desc="Delivery & handling supported" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-semibold">Seller</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {listing.seller?.name ?? "ProCyclist SF"} • 97% response • Verified seller
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageCircle className="mr-2 h-3.5 w-3.5" />
                  Message
                </Button>
              </CardContent>
            </Card>

            {/* Chat placeholder dialog */}
            <Dialog open={chatOpen} onOpenChange={setChatOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chat with seller</DialogTitle>
                </DialogHeader>
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Live chat will be available when Backend is integrated. For now you can contact via email
                  <a href="mailto:support@shopbike.example.com" className="ml-1 text-primary hover:underline">
                    support@shopbike.example.com
                  </a>.
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function InfoLine({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-lg border bg-muted/30 px-3 py-2">
      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
