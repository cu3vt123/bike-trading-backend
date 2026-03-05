import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createListing,
  updateListing,
  submitForInspection,
  fetchListingById,
} from "@/services/sellerService";

type Condition = "MINT_USED" | "GOOD_USED" | "FAIR_USED";
type Step = "DRAFT" | "PENDING_INSPECTION";

const BRAND_OPTIONS = [
  "Giant",
  "Trek",
  "Specialized",
  "Cannondale",
  "Scott",
  "Bianchi",
  "Canyon",
  "Santa Cruz",
  "Merida",
  "Other",
] as const;

const CITY_OPTIONS = [
  "Ho Chi Minh City",
  "Ha Noi",
  "Da Nang",
  "Hai Phong",
  "Can Tho",
  "Nha Trang",
  "Hue",
  "Da Lat",
] as const;

export default function SellerListingEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState<string>("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState<Condition>("MINT_USED");
  const [step, setStep] = useState<Step>("DRAFT");
  const [savedId, setSavedId] = useState<string | null>(id ?? null);
  const [photoItems, setPhotoItems] = useState<
    Array<{ file: File; url: string }>
  >([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needUpdateReason, setNeedUpdateReason] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEdit = useMemo(() => !!id || !!savedId, [id, savedId]);
  const listingId = id ?? savedId ?? "";

  useEffect(() => {
    if (!listingId) return;
    fetchListingById(listingId).then((listing) => {
      if (listing) {
        setTitle(listing.title ?? "");
        setBrand(listing.brand ?? "");
        setPrice(String(listing.price ?? ""));
        setLocation(listing.location ?? "");
        setCondition((listing.condition as Condition) ?? "MINT_USED");
        if (listing.state === "PENDING_INSPECTION") setStep("PENDING_INSPECTION");
        else setStep("DRAFT");
        const reason = (listing as any).inspectionNeedUpdateReason;
        if (typeof reason === "string" && reason.trim()) {
          setNeedUpdateReason(reason.trim());
        }
      }
    });
  }, [listingId]);

  function buildPayload() {
    const priceNum = parseFloat(price) || 0;
    return {
      title: title || "Untitled",
      brand: brand || "Unknown",
      price: priceNum,
      location,
      condition,
      // Demo: gửi object URLs để BE nhận được ảnh list (chưa upload thật)
      imageUrls: photoItems.map((p) => p.url).filter(Boolean),
    };
  }

  async function onSaveDraft() {
    setError(null);
    setSubmitting(true);
    try {
      if (isEdit && listingId) {
        await updateListing(listingId, buildPayload());
        setStep("DRAFT");
      } else {
        const created = await createListing(buildPayload());
        setSavedId(created.id);
        setStep("DRAFT");
        navigate(`/seller/listings/${created.id}/edit`, { replace: true });
      }
    } catch {
      setError("Could not save draft. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitForInspection() {
    if (photoItems.length === 0) {
      setPhotoError("Please upload at least 1 photo before submitting.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      let targetId = listingId;
      if (!targetId) {
        const created = await createListing(buildPayload());
        targetId = created.id;
        setSavedId(created.id);
      } else {
        await updateListing(targetId, buildPayload());
      }
      await submitForInspection(targetId);
      setStep("PENDING_INSPECTION");
      navigate("/seller", { replace: true });
    } catch {
      setError("Could not submit for inspection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const locked = step === "PENDING_INSPECTION";

  useEffect(() => {
    return () => {
      // cleanup object URLs
      for (const p of photoItems) URL.revokeObjectURL(p.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPickFiles(files: FileList | null) {
    if (!files || locked) return;
    setPhotoError(null);

    const next: Array<{ file: File; url: string }> = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      next.push({ file: f, url: URL.createObjectURL(f) });
    }

    // limit to 8 photos
    const merged = [...photoItems, ...next].slice(0, 8);
    // revoke unused urls if clipped
    const clipped = [...photoItems, ...next].slice(8);
    for (const c of clipped) URL.revokeObjectURL(c.url);

    setPhotoItems(merged);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(idx: number) {
    setPhotoError(null);
    setPhotoItems((prev) => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1)[0];
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">
            {isEdit ? "Edit listing" : "Create listing"}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Draft → Submit for Inspection → (Approve) Publish.
          </div>
        </div>

        <Link
          to="/seller"
          className="inline-flex rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to dashboard
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {locked && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This listing is <b>pending inspection</b>. Editing is disabled until a result is available.
        </div>
      )}
      {!locked && needUpdateReason && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="font-semibold">Inspector requested an update</div>
          <p className="mt-1">
            {needUpdateReason}
          </p>
          <p className="mt-1 text-xs text-rose-700">
            Please fix the issues above, then save draft and submit for inspection again.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Bike details
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
                placeholder="Listing title"
              />
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={locked}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
              >
                <option value="">Select brand</option>
                {BRAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={locked}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
                placeholder="Price (USD)"
              />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
              >
                <option value="">Select city</option>
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
              >
                <option value="MINT_USED">Mint (Used)</option>
                <option value="GOOD_USED">Good (Used)</option>
                <option value="FAIR_USED">Fair (Used)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Photos
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Upload 1–8 photos. Required before submit for inspection.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onPickFiles(e.target.files)}
                  className="hidden"
                  disabled={locked}
                />
                <button
                  type="button"
                  disabled={locked || photoItems.length >= 8}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  + Add photos
                </button>
              </div>
            </div>

            {photoError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {photoError}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photoItems.map((p, idx) => (
                <div
                  key={p.url}
                  className="group relative overflow-hidden rounded-xl border border-black/10 bg-slate-100"
                >
                  <div className="aspect-square">
                    <img
                      src={p.url}
                      alt={`photo-${idx + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove photo"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {photoItems.length === 0 && (
                <div className="col-span-2 rounded-xl border border-dashed border-black/15 bg-white p-4 text-sm text-slate-600 sm:col-span-4">
                  No photos yet. Click <b>Add photos</b> to upload.
                  <div className="mt-2 text-xs text-slate-500">
                    Checklist: full bike (both sides), frame serial, drivetrain,
                    brakes/wheels.
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-slate-500">
              {photoItems.length}/8 uploaded
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Actions</div>

            <button
              onClick={onSaveDraft}
              disabled={locked || submitting}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              {submitting ? "Saving..." : "Save draft"}
            </button>

            <button
              onClick={onSubmitForInspection}
              disabled={locked || submitting}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
            >
              {submitting ? "Submitting..." : "Submit for inspection →"}
            </button>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              Rule: Only <b>APPROVE</b> → you can publish to marketplace (later
              sprint).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
