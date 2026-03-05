import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  fetchPendingListings,
  approveListing,
  rejectListing,
  needUpdateListing,
} from "@/services/inspectorService";
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

const INSPECTION_OPTIONS = [
  { label: "Excellent", score: 4.8 },
  { label: "Great", score: 4.2 },
  { label: "Good", score: 3.5 },
  { label: "Fair", score: 2.5 },
  { label: "Poor", score: 1 },
] as const;

function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
}

export default function InspectorDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<{ id: string; action: "approve" | "reject" | "needUpdate" } | null>(null);
  const [needUpdateReason, setNeedUpdateReason] = useState("");
  const [inspectionReport, setInspectionReport] = useState<InspectionReport>({
    frameIntegrity: { score: 4.2, label: "Great" },
    drivetrainHealth: { score: 4.2, label: "Great" },
    brakingSystem: { score: 4.2, label: "Great" },
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadListings = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPendingListings()
      .then(setListings)
      .catch(() => setError("Failed to load pending listings."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  async function handleAction() {
    if (!actionTarget) return;
    const { id, action } = actionTarget;
    setActionError(null);
    setActionLoading(true);
    try {
      if (action === "approve") await approveListing(id, inspectionReport);
      else if (action === "reject") await rejectListing(id);
      else await needUpdateListing(id, needUpdateReason);
      setListings((prev) => prev.filter((l) => l.id !== id));
      setActionTarget(null);
      setNeedUpdateReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed. Please try again.");
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
        <h1 className="text-2xl font-bold">Inspector Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect and approve listings pending review.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <Button variant="link" size="sm" className="ml-2" onClick={loadListings}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading pending listings...</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <span className="text-sm font-semibold">Listings pending inspection</span>
            <Badge variant="secondary">{listings.length} pending</Badge>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                No listings pending inspection.
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
                        <div className="font-semibold">
                          {item.brand} {item.model ?? ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.title}
                        </div>
                        <div className="mt-1 text-sm">
                          {formatMoney(item.price, item.currency ?? "USD")} • {item.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setActionTarget({ id: item.id, action: "approve" })}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setActionTarget({ id: item.id, action: "reject" })}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={() => setActionTarget({ id: item.id, action: "needUpdate" })}
                      >
                        <AlertCircle className="mr-1 h-4 w-4" />
                        Need update
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/bikes/${item.id}`}>View details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Approve → Published. Reject → Closed. Need update → Seller must resubmit.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex gap-4">
        <Button asChild variant="outline">
          <Link to="/">← Back to home</Link>
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={!!actionTarget} onOpenChange={(o) => !o && setActionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionTarget?.action === "approve" && "Approve listing"}
              {actionTarget?.action === "reject" && "Reject listing"}
              {actionTarget?.action === "needUpdate" && "Request update"}
            </DialogTitle>
            <DialogDescription>
              {actionTarget?.action === "approve" && "Fill in the inspection report. This will be shown to buyers."}
              {actionTarget?.action === "reject" && "Listing will be rejected, seller cannot resubmit."}
              {actionTarget?.action === "needUpdate" && "Seller must update per feedback before resubmitting."}
            </DialogDescription>
          </DialogHeader>
          {actionTarget?.action === "approve" && (
            <div className="space-y-4 py-4">
              <p className="text-sm font-medium">Inspection report (required)</p>
              {(["frameIntegrity", "drivetrainHealth", "brakingSystem"] as const).map((key) => {
                const labels: Record<typeof key, string> = {
                  frameIntegrity: "Frame integrity",
                  drivetrainHealth: "Drivetrain health",
                  brakingSystem: "Braking system",
                };
                const val = inspectionReport[key];
                return (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-32 shrink-0">{labels[key]}</Label>
                    <Select
                      value={val.label}
                      onValueChange={(v) => {
                        const opt = INSPECTION_OPTIONS.find((o) => o.label === v);
                        if (opt) setReportField(key, { label: opt.label, score: opt.score });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INSPECTION_OPTIONS.map((o) => (
                          <SelectItem key={o.label} value={o.label}>
                            {o.label} ({(o.score).toFixed(1)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
          {actionTarget?.action === "needUpdate" && (
            <div className="space-y-2 py-2">
              <Label htmlFor="need-update-reason">Reason (optional)</Label>
              <Input
                id="need-update-reason"
                placeholder="E.g.: Need full bike angle photo, clearer drivetrain shot"
                value={needUpdateReason}
                onChange={(e) => setNeedUpdateReason(e.target.value)}
              />
            </div>
          )}
          {actionError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {actionError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionTarget(null); setActionError(null); }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
