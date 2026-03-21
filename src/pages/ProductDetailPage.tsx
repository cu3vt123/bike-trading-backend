import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Shield, Heart, MessageCircle } from "lucide-react";
import type { BikeDetail, BikeCondition } from "@/types/shopbike";
import { isListingCertified, isBuyerUnverifiedRisk } from "@/types/shopbike";
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
import { useAuthStore } from "@/stores/useAuthStore";
import { useWishlistStore } from "@/stores/useWishlistStore";

const INSPECTION_ROW_KEYS = {
  frameIntegrity: "listing.inspectionFrameIntegrity",
  drivetrainHealth: "listing.inspectionDrivetrain",
  brakingSystem: "listing.inspectionBraking",
} as const;

type NavState = { listing?: BikeDetail };

function formatMoney(value: number, currency: "VND" | "USD" = "VND") {
  return new Intl.NumberFormat(currency === "VND" ? "vi-VN" : undefined, {
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

function getScoreLabelKey(score: number): string | null {
  if (!score || Number.isNaN(score)) return null;
  if (score >= 4.7) return "listing.scoreExcellent";
  if (score >= 4.0) return "listing.scoreGood";
  if (score >= 3.3) return "listing.scoreFair";
  if (score >= 2.3) return "listing.scoreAverage";
  if (score > 0) return "listing.scorePoor";
  return null;
}

const CONDITION_KEYS: Partial<Record<BikeCondition, string>> = {
  NEW: "listing.conditionNew",
  LIKE_NEW: "listing.conditionLikeNew",
  MINT_USED: "listing.conditionMintUsed",
  GOOD_USED: "listing.conditionGoodUsed",
  FAIR_USED: "listing.conditionFairUsed",
};

export default function ProductDetailPage() {
  const { t } = useTranslation();
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
        if (!cancelled) setError(err?.message ?? t("listing.loadError"));
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
  const role = useAuthStore((s) => s.role);
  const inWishlist = useWishlistStore((s) => s.ids.has(listing?.id ?? ""));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const canWishlist = role === "BUYER";

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
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-28">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">{t("listing.loading")}</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Card className="mx-auto max-w-6xl border-border">
        <CardContent className="py-16 text-center">
          <h1 className="text-xl font-bold">{t("listing.notFound")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? t("listing.notFoundDesc")}
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">{t("listing.goHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currency = (listing.currency ?? "VND") as "VND" | "USD";
  const price = listing.price;
  const msrp = listing.msrp;
  const score = listing.inspectionScore ?? 0;
  const inspectionReport = listing.inspectionReport;
  const hasInspectionReport =
    inspectionReport?.frameIntegrity &&
    inspectionReport?.drivetrainHealth &&
    inspectionReport?.brakingSystem;
  const isCertified = isListingCertified(listing);
  const isUnverifiedPublished = isBuyerUnverifiedRisk(listing);
  /** Luôn hiển thị đủ 3 hạng mục khi đã certified */
  const scoreKey = getScoreLabelKey(score);
  const displayReport =
    hasInspectionReport
      ? inspectionReport!
      : isCertified && score > 0 && scoreKey
        ? {
            frameIntegrity: { score, label: t(scoreKey) },
            drivetrainHealth: { score, label: t(scoreKey) },
            brakingSystem: { score, label: t(scoreKey) },
          }
        : undefined;
  const showVerifiedBadge = isCertified && (hasInspectionReport || score > 0);
  const canBuy = listing.state === "PUBLISHED";
  const isPendingInspection = listing.state === "PENDING_INSPECTION";

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          {t("listing.home")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">
          {listing.brand} {listing.model}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Gallery + content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gallery */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-8">
                  <div className="overflow-hidden rounded-xl border border-border bg-muted">
                    <div className="aspect-[4/3] w-full">
                      <img
                        src={images[Math.min(active, images.length - 1)]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-300"
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
                        className={`overflow-hidden rounded-xl border-2 transition-all ${
                          idx === active
                            ? "border-primary ring-2 ring-primary/20 shadow-sm"
                            : "border-border hover:border-primary/30"
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
                      {t("listing.morePhotos", { count: images.length - 4 })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Title block + báo cáo nhà kiểm định (luôn có ở đây) */}
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {showVerifiedBadge && (
                <Badge variant="default" className="border-0 bg-blue-600 text-white hover:bg-blue-600/90">
                  <Shield className="mr-1 h-3 w-3" />
                  {t("seller.listingCertified")}
                </Badge>
              )}
              {isUnverifiedPublished && (
                <Badge variant="secondary" className="border-0 bg-orange-500 text-white hover:bg-orange-500/90">
                  {t("seller.listingUnverified")}
                </Badge>
              )}
              <div
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm ${
                  showVerifiedBadge ? "bg-blue-600/10" : isUnverifiedPublished ? "bg-orange-500/10" : "bg-muted/80"
                }`}
              >
                <Stars value={score} />
                <span className="font-semibold text-foreground">
                  {score > 0 ? score.toFixed(1) : "0.0"}/5
                </span>
                <span className="text-muted-foreground">{t("listing.inspectionReport")}</span>
                {!hasInspectionReport && !isCertified && (
                  <span className="text-muted-foreground"> {t("listing.noReportYet")}</span>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {listing.brand} {listing.model}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{listing.title}</p>
            {isUnverifiedPublished && (
              <p className="mt-2 text-xs text-orange-800 dark:text-orange-200/90">{t("seller.listingUnverifiedHint")}</p>
            )}
            {showVerifiedBadge && (
              <p className="mt-1 text-xs text-blue-800 dark:text-blue-200/90">{t("seller.listingCertifiedHint")}</p>
            )}
          </div>

          {/* Báo cáo kiểm định – luôn hiển thị trong thông tin xe cho buyer */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <span className="text-sm font-semibold">{t("listing.inspectionReportTitle")}</span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("listing.inspectionReportDesc")}
                </p>
              </div>
              {hasInspectionReport && (
                <Button variant="link" size="sm" className="text-primary shrink-0" onClick={() => setReportOpen(true)}>
                  {t("listing.viewFullReport")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {displayReport ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {(
                      [
                        { key: "frameIntegrity" as const, ...displayReport.frameIntegrity },
                        { key: "drivetrainHealth" as const, ...displayReport.drivetrainHealth },
                        { key: "brakingSystem" as const, ...displayReport.brakingSystem },
                      ] as const
                    ).map(({ key, label: value, score: s }) => (
                      <div key={key} className="rounded-xl border border-border bg-muted/50 p-4">
                        <div className="text-xs text-muted-foreground">{t(INSPECTION_ROW_KEYS[key])}</div>
                        <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
                        <div className="mt-1 text-xs">
                          <Stars value={s ?? 0} />{" "}
                          <span className="text-muted-foreground">({(s ?? 0).toFixed(1)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <span className="text-sm text-muted-foreground">{t("listing.inspectionOverall")}</span>
                    <div className="flex items-center gap-2">
                      <Stars value={score} />
                      <span className="text-sm font-semibold text-foreground">{score.toFixed(1)}/5</span>
                    </div>
                  </div>
                  {!hasInspectionReport && isCertified && score > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("listing.scoreFromOverall")}
                    </p>
                  )}
                </div>
              ) : isPendingInspection ? (
                <p className="py-2 text-sm text-muted-foreground">
                  {t("listing.pendingInspection")}
                </p>
              ) : !isCertified ? (
                <p className="py-2 text-sm text-muted-foreground">
                  {t("listing.noInspectionReport")}
                </p>
              ) : (
                <p className="py-2 text-sm text-muted-foreground">
                  {t("listing.noInspectionScore")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Specs */}
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">{t("listing.specsTitle")}</span>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <SpecRow label={t("listing.brand")} value={listing.brand} />
                <SpecRow label={t("listing.model")} value={listing.model ?? "—"} />
                <SpecRow label={t("listing.year")} value={listing.year ? String(listing.year) : "—"} />
                <SpecRow label={t("listing.frameSize")} value={listing.frameSize ?? "—"} />
                <SpecRow label={t("listing.condition")} value={listing.condition ? (CONDITION_KEYS[listing.condition] ? t(CONDITION_KEYS[listing.condition]) : listing.condition) : "—"} />
                <SpecRow label={t("listing.area")} value={listing.location ?? "—"} />
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
                  <DialogTitle>{t("listing.inspectionReportTitle")}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {(
                    [
                      { key: "frameIntegrity" as const, ...inspectionReport!.frameIntegrity },
                      { key: "drivetrainHealth" as const, ...inspectionReport!.drivetrainHealth },
                      { key: "brakingSystem" as const, ...inspectionReport!.brakingSystem },
                    ] as const
                  ).map(({ key, label: value, score: s }) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                      <span className="text-sm text-muted-foreground">{t(INSPECTION_ROW_KEYS[key])}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{value}</span>
                        <Stars value={s ?? 0} />
                        <span className="text-xs text-muted-foreground">({(s ?? 0).toFixed(1)})</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <span className="text-sm text-muted-foreground">{t("listing.inspectionOverall")}</span>
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
            <Card className="border-border shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">{t("listing.totalPrice")}</div>
                    <div className="mt-1 text-2xl font-bold">{formatMoney(price, currency)}</div>
                    {msrp && msrp > price && (
                      <div className="mt-1 text-xs text-muted-foreground line-through">
                        {formatMoney(msrp, currency)}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-primary">{t("listing.serviceFeeIncluded")}</p>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-center ${
                      isCertified
                        ? "bg-blue-600/15 text-blue-800 dark:text-blue-200"
                        : isPendingInspection
                          ? "bg-warning/15 text-warning"
                          : isUnverifiedPublished
                            ? "bg-orange-500/15 text-orange-800 dark:text-orange-200"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="text-[10px] font-semibold">
                      {isCertified
                        ? t("listing.statusInspected")
                        : isUnverifiedPublished
                          ? t("seller.listingUnverified")
                          : isPendingInspection
                            ? t("listing.statusPending")
                            : t("listing.statusNotAvailable")}
                    </div>
                    {isCertified && (
                      <div className="mt-1 text-xs">
                        <Stars value={score} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {canBuy && canWishlist && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => toggleWishlist(listing.id)}
                      aria-label={inWishlist ? t("listing.removeFromWishlist") : t("listing.addToWishlist")}
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
                      {t("listing.messageSeller")}
                    </Button>
                  )}
                </div>
                {canBuy ? (
                  <>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => navigate(`/checkout/${listing.id}`)}
                    >
                      {t("listing.buyNow")}
                    </Button>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t("listing.reservationNote")}
                    </p>
                  </>
                ) : isPendingInspection ? (
                  <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
                    {t("listing.pendingBlock")}
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-muted bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    {t("listing.notAvailable")}
                  </div>
                )}

                <div className="mt-4 space-y-2 text-xs">
                  <InfoLine title={t("listing.securePayment")} desc={t("listing.securePaymentDesc")} />
                  <InfoLine title={t("listing.insuredShipping")} desc={t("listing.insuredShippingDesc")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-semibold">{t("listing.seller")}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("listing.sellerInfo", { name: listing.seller?.name ?? "ProCyclist SF" })}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageCircle className="mr-2 h-3.5 w-3.5" />
                  {t("listing.message")}
                </Button>
              </CardContent>
            </Card>

            {/* Chat placeholder dialog */}
            <Dialog open={chatOpen} onOpenChange={setChatOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("listing.messageSellerTitle")}</DialogTitle>
                </DialogHeader>
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t("listing.chatPlaceholder")}{" "}
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
