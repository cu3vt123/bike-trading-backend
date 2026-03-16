import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchPendingListings,
  approveListing,
  rejectListing,
  needUpdateListing,
} from "@/services/inspectorService";
import {
  fetchReInspectionOrders,
  submitReInspectionDone,
} from "@/services/adminService";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Listing } from "@/types/shopbike";
import type { InspectionReport } from "@/services/inspectorService";
import { Package } from "lucide-react";

const INSPECTION_OPTIONS = [
  { key: "listing.scoreExcellent" as const, score: 4.8 },
  { key: "listing.scoreGood" as const, score: 4.2 },
  { key: "listing.scoreFair" as const, score: 3.5 },
  { key: "listing.scoreAverage" as const, score: 2.5 },
  { key: "listing.scorePoor" as const, score: 1 },
] as const;
const INSPECTION_ROW_KEYS = {
  frameIntegrity: "listing.inspectionFrameIntegrity",
  drivetrainHealth: "listing.inspectionDrivetrain",
  brakingSystem: "listing.inspectionBraking",
} as const;

function formatMoney(value: number, currency = "VND") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

export default function InspectorDashboardPage() {
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<{ id: string; action: "approve" | "reject" | "needUpdate" } | null>(null);
  const [needUpdateReason, setNeedUpdateReason] = useState("");
  const [inspectionReport, setInspectionReport] = useState<InspectionReport>({
    frameIntegrity: { score: 4.2, label: "" },
    drivetrainHealth: { score: 4.2, label: "" },
    brakingSystem: { score: 4.2, label: "" },
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reInspectionOrders, setReInspectionOrders] = useState<{ id: string; listingId: string; listing?: { brand?: string; model?: string }; status: string }[]>([]);
  const [reInspectionLoading, setReInspectionLoading] = useState(false);
  const [reInspectionSubmittingId, setReInspectionSubmittingId] = useState<string | null>(null);

  const loadReInspection = useCallback(() => {
    setReInspectionLoading(true);
    fetchReInspectionOrders()
      .then(setReInspectionOrders)
      .catch(() => setReInspectionOrders([]))
      .finally(() => setReInspectionLoading(false));
  }, []);

  const loadListings = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPendingListings()
      .then(setListings)
      .catch((err) =>
        setError(err instanceof Error ? err.message : t("inspector.loadError")),
      )
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);
  useEffect(() => {
    loadReInspection();
  }, [loadReInspection]);
  useEffect(() => {
    if (actionTarget?.action === "approve") {
      const defaultKey = "listing.scoreGood";
      setInspectionReport({
        frameIntegrity: { score: 4.2, label: t(defaultKey) },
        drivetrainHealth: { score: 4.2, label: t(defaultKey) },
        brakingSystem: { score: 4.2, label: t(defaultKey) },
      });
    }
  }, [actionTarget?.action, t]);

  async function handleAction() {
    if (!actionTarget) return;
    const { id, action } = actionTarget;
    setActionError(null);
    setActionLoading(true);
    try {
      if (action === "approve") {
        const reportToSend = { ...inspectionReport };
        (["frameIntegrity", "drivetrainHealth", "brakingSystem"] as const).forEach((key) => {
          const val = reportToSend[key];
          if (!val.label?.trim()) {
            const opt = INSPECTION_OPTIONS.find((o) => o.score === val.score) ?? INSPECTION_OPTIONS[1];
            reportToSend[key] = { ...val, label: t(opt.key) };
          }
        });
        await approveListing(id, reportToSend);
      }
      else if (action === "reject") await rejectListing(id);
      else {
        if (!needUpdateReason.trim() || needUpdateReason.trim().length < 5) {
          setActionError(t("inspector.needUpdateError"));
          setActionLoading(false);
          return;
        }
        await needUpdateListing(id, needUpdateReason.trim());
      }
      setListings((prev) => prev.filter((l) => l.id !== id));
      setActionTarget(null);
      setNeedUpdateReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("inspector.actionError"));
    } finally {
      setActionLoading(false);
    }
  }

  function setReportField(
    key: keyof InspectionReport,
    value: { score: number; label: string },
  ) {
    setInspectionReport((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("inspector.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("inspector.subtitle")}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <Button variant="link" size="sm" className="ml-2" onClick={loadListings}>
            {t("inspector.retry")}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">{t("inspector.loading")}</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="text-sm font-semibold">{t("inspector.pendingListings")}</span>
              <Badge variant="secondary">{t("inspector.pendingCount", { count: listings.length })}</Badge>
            </CardHeader>
            <CardContent>
              {listings.length === 0 ? (
                <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                  {t("inspector.noPending")}
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={item.thumbnailUrl ?? ""}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {item.title || `${item.brand} ${item.model ?? ""}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.brand}
                            {item.model ? ` · ${item.model}` : ""}
                          </div>
                          <div className="mt-1 text-sm">
                            {formatMoney(item.price, item.currency ?? "VND")} • {item.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => setActionTarget({ id: item.id, action: "approve" })}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          {t("inspector.approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setActionTarget({ id: item.id, action: "reject" })}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          {t("inspector.reject")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-warning/40 text-warning hover:bg-warning/10"
                          onClick={() => setActionTarget({ id: item.id, action: "needUpdate" })}
                        >
                          <AlertCircle className="mr-1 h-4 w-4" />
                          {t("inspector.needUpdate")}
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/bikes/${item.id}`}>{t("inspector.viewDetail")}</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                {t("inspector.approveHint")}
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Package className="h-4 w-4" />
                {t("inspector.reInspectionTitle")}
              </span>
              <Badge variant="outline">{t("inspector.reInspectionCount", { count: reInspectionOrders.length })}</Badge>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-muted-foreground">
                {t("inspector.reInspectionDesc")}
              </p>
              {reInspectionLoading ? (
                <div className="flex justify-center py-6">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : reInspectionOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  {t("inspector.noReInspection")}
                </div>
              ) : (
                <div className="space-y-3">
                  {reInspectionOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div>
                        <div className="font-medium">
                          {order.listing?.brand} {order.listing?.model ?? order.listingId}
                        </div>
                        <div className="text-xs text-muted-foreground">{t("inspector.order")} {order.id}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={async () => {
                          setReInspectionSubmittingId(order.id);
                          try {
                            const updated = await submitReInspectionDone(order.id);
                            setReInspectionOrders((prev) => prev.filter((o) => o.id !== updated.id));
                          } finally {
                            setReInspectionSubmittingId(null);
                          }
                        }}
                        disabled={reInspectionSubmittingId === order.id}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        {reInspectionSubmittingId === order.id ? t("inspector.processing") : t("inspector.confirmMatch")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <div className="mt-6 flex gap-4">
        <Button asChild variant="outline">
          <Link to="/">{t("inspector.goHome")}</Link>
        </Button>
      </div>

      <Dialog open={!!actionTarget} onOpenChange={(o) => !o && setActionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionTarget?.action === "approve" && t("inspector.dialogApprove")}
              {actionTarget?.action === "reject" && t("inspector.dialogReject")}
              {actionTarget?.action === "needUpdate" && t("inspector.dialogNeedUpdate")}
            </DialogTitle>
            <DialogDescription>
              {actionTarget?.action === "approve" && t("inspector.dialogApproveDesc")}
              {actionTarget?.action === "reject" && t("inspector.dialogRejectDesc")}
              {actionTarget?.action === "needUpdate" && t("inspector.dialogNeedUpdateDesc")}
            </DialogDescription>
          </DialogHeader>
          {actionTarget?.action === "approve" && (
            <div className="space-y-4 py-4">
              <p className="text-sm font-medium">{t("inspector.reportRequired")}</p>
              <p className="text-xs text-muted-foreground">
                {t("inspector.reportHint")}
              </p>
              {(["frameIntegrity", "drivetrainHealth", "brakingSystem"] as const).map((key) => {
                const val = inspectionReport[key];
                const matchedOpt = INSPECTION_OPTIONS.find((o) => o.score === val.score);
                const selectValue = matchedOpt?.key ?? INSPECTION_OPTIONS[0].key;
                const isCustomLabel = val.label.trim() !== "" && !INSPECTION_OPTIONS.some((o) => t(o.key) === val.label);
                return (
                  <div key={key} className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-4">
                      <Label className="w-40 shrink-0 text-foreground">{t(INSPECTION_ROW_KEYS[key])}</Label>
                      <Select
                        value={selectValue}
                        onValueChange={(v) => {
                          const opt = INSPECTION_OPTIONS.find((o) => o.key === v);
                          if (opt) setReportField(key, { score: opt.score, label: isCustomLabel ? val.label : t(opt.key) });
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INSPECTION_OPTIONS.map((o) => (
                            <SelectItem key={o.key} value={o.key}>
                              {t(o.key)} ({(o.score).toFixed(1)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pl-[calc(10rem+1rem)]">
                      <Input
                        placeholder={t("inspector.detailCommentPlaceholder")}
                        value={val.label}
                        onChange={(e) => setReportField(key, { ...val, label: e.target.value })}
                        className="text-sm"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("inspector.detailCommentHint")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {actionTarget?.action === "needUpdate" && (
            <div className="space-y-2 py-2">
              <Label htmlFor="need-update-reason">{t("inspector.needUpdateReason")}</Label>
              <Input
                id="need-update-reason"
                placeholder={t("inspector.needUpdatePlaceholder")}
                value={needUpdateReason}
                onChange={(e) => setNeedUpdateReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("inspector.needUpdateHint")}
              </p>
            </div>
          )}
          {actionError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {actionError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionTarget(null); setActionError(null); }} disabled={actionLoading}>
              {t("inspector.cancel")}
            </Button>
            <Button onClick={handleAction} disabled={actionLoading}>
              {actionLoading ? t("inspector.processing") : t("inspector.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
