import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  createListing,
  updateListing,
  publishListing,
  uploadListingImages,
} from "@/services/sellerService";
import { useSellerListingEditorQuery } from "@/hooks/queries/useSellerListingEditorQuery";
import { isAxiosError } from "axios";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { brandsApi } from "@/apis/brandsApi";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { authApi } from "@/apis/authApi";
import {
  useSellerSubscriptionStore,
  normalizeSubscriptionPayload,
} from "@/stores/useSellerSubscriptionStore";

type Condition = "MINT_USED" | "GOOD_USED" | "FAIR_USED";
type Step = "DRAFT" | "PENDING_INSPECTION";

const FALLBACK_BRANDS = [
  "Giant", "Trek", "Specialized", "Cannondale", "Scott", "Bianchi",
  "Canyon", "Santa Cruz", "Merida", "Other",
];

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

const PHOTO_SLOT_KEYS = ["seller.photo1", "seller.photo2", "seller.photo3", "seller.photo4", "seller.photo5"] as const;

const REQUIRED_PHOTO_COUNT = 5;

/** Năm sản xuất hợp lệ (tránh năm > năm hiện tại hoặc quá xa trong quá khứ). */
const MIN_BIKE_YEAR = 1900;

type YearValidateMode = "input" | "blur" | "submit";

/** `input`: chỉ báo khi đủ 4 số (không làm phiền lúc gõ từng chữ). `blur`/`submit`: bắt buộc 4 số + không vượt quá năm hiện tại. */
function validateYearField(
  yearStr: string,
  t: (key: string, opts?: Record<string, unknown>) => string,
  mode: YearValidateMode = "submit",
): string | null {
  const trimmed = yearStr.trim();
  if (!trimmed) return null;
  const y = parseInt(trimmed, 10);
  if (!Number.isFinite(y)) return t("seller.yearInvalid");
  const now = new Date().getFullYear();
  if (mode === "input") {
    if (trimmed.length !== 4) return null;
  } else {
    if (trimmed.length !== 4) return t("seller.yearFourDigits");
  }
  if (y > now) return t("seller.yearFuture", { max: now });
  if (y < MIN_BIKE_YEAR) return t("seller.yearTooOld", { min: MIN_BIKE_YEAR });
  return null;
}

/** Chỉ gửi năm lên API khi đủ 4 số và trong [MIN_BIKE_YEAR, năm hiện tại]. */
function yearStringToApi(yearStr: string): number | undefined {
  const trimmed = yearStr.trim();
  if (trimmed.length !== 4) return undefined;
  const y = parseInt(trimmed, 10);
  if (!Number.isFinite(y)) return undefined;
  const now = new Date().getFullYear();
  if (y > now || y < MIN_BIKE_YEAR) return undefined;
  return y;
}

type PhotoSlot = { file?: File; url: string } | null;

export default function SellerListingEditorPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<string>("");
  const [frameSize, setFrameSize] = useState("");
  const [price, setPrice] = useState<string>("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState<Condition>("MINT_USED");
  const [step, setStep] = useState<Step>("DRAFT");
  const [savedId, setSavedId] = useState<string | null>(id ?? null);
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(() =>
    Array.from({ length: REQUIRED_PHOTO_COUNT }, () => null),
  );
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needUpdateReason, setNeedUpdateReason] = useState<string>("");
  const [brandOptions, setBrandOptions] = useState<string[]>(FALLBACK_BRANDS);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeSlotRef = useRef<number | null>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const subscription = useSellerSubscriptionStore((s) => s.subscription);
  const setSubscription = useSellerSubscriptionStore((s) => s.setSubscription);
  const canRequestInspection = Boolean(
    subscription?.active && subscription?.plan === "VIP",
  );

  const isEdit = useMemo(() => !!id || !!savedId, [id, savedId]);

  useEffect(() => {
    authApi
      .getProfile()
      .then((me) => {
        const sub = normalizeSubscriptionPayload(
          (me as { subscription?: unknown }).subscription,
        );
        if (sub) setSubscription(sub);
      })
      .catch(() => {
        /* ignore */
      });
  }, [setSubscription]);

  useEffect(() => {
    brandsApi.getList()
      .then((list) => {
        const names = list.map((b) => b.name).filter(Boolean);
        if (names.length > 0) setBrandOptions(names);
      })
      .catch(() => { /* keep fallback */ });
  }, []);
  const listingId = id ?? savedId ?? "";
  const listingQuery = useSellerListingEditorQuery(listingId || undefined);

  useEffect(() => {
    if (!listingId) return;
    setError(null);
    if (listingQuery.isPending) return;
    if (listingQuery.isError) {
      setError(getApiErrorMessage(listingQuery.error, t("seller.loadError")));
      return;
    }
    const listing = listingQuery.data;
    if (listing) {
      setTitle(listing.title ?? "");
      setBrand(listing.brand ?? "");
      setModel(listing.model ?? "");
      const yStr = listing.year != null ? String(listing.year) : "";
      setYear(yStr);
      setYearError(yStr ? validateYearField(yStr, t, "submit") : null);
      setFrameSize(listing.frameSize ?? "");
      setPrice(String(listing.price ?? ""));
      setLocation(listing.location ?? "");
      setCondition((listing.condition as Condition) ?? "MINT_USED");
      if (listing.state === "PENDING_INSPECTION") setStep("PENDING_INSPECTION");
      else setStep("DRAFT");
      const reason = (listing as { inspectionNeedUpdateReason?: string }).inspectionNeedUpdateReason;
      if (typeof reason === "string" && reason.trim()) {
        setNeedUpdateReason(reason.trim());
      }
      const urls = Array.isArray(listing.imageUrls) ? listing.imageUrls : [];
      setPhotoSlots((prev) => {
        for (const p of prev) {
          if (p?.url.startsWith("blob:")) URL.revokeObjectURL(p.url);
        }
        const next: PhotoSlot[] = Array.from(
          { length: REQUIRED_PHOTO_COUNT },
          () => null,
        );
        for (let i = 0; i < Math.min(REQUIRED_PHOTO_COUNT, urls.length); i++) {
          const u = urls[i];
          if (typeof u === "string" && u.trim()) next[i] = { url: u.trim() };
        }
        return next;
      });
    } else if (id) {
      setError(t("seller.loadError"));
    }
  }, [
    listingId,
    id,
    t,
    listingQuery.isPending,
    listingQuery.isError,
    listingQuery.error,
    listingQuery.data,
  ]);

  function buildPayload(overrideImageUrls?: string[]) {
    const priceNum = parseFloat(price) || 0;
    const imageUrls =
      overrideImageUrls ??
      photoSlots
        .filter((p): p is NonNullable<PhotoSlot> => p != null)
        .map((p) => p.url);
    return {
      title: title || "Untitled",
      brand: brand || "Unknown",
      model: model || undefined,
      year: yearStringToApi(year),
      frameSize: frameSize || undefined,
      price: priceNum,
      location,
      condition,
      imageUrls,
    };
  }

  /** Ảnh chọn từ máy (blob:) được upload lên BE; trả về mảng URL theo thứ tự slot đã chọn. */
  async function resolveImageUrlsForSave(): Promise<string[] | null> {
    const files: File[] = [];
    const blobIndices: number[] = [];
    for (let i = 0; i < photoSlots.length; i++) {
      const p = photoSlots[i];
      if (!p) continue;
      if (p.file && p.url.startsWith("blob:")) {
        blobIndices.push(i);
        files.push(p.file);
      }
    }

    let uploaded: string[] = [];
    if (files.length > 0) {
      try {
        uploaded = await uploadListingImages(files);
      } catch {
        setError(t("seller.uploadImagesError"));
        return null;
      }
      if (uploaded.length !== files.length) {
        setError(t("seller.uploadImagesError"));
        return null;
      }
    }

    const imageUrls: string[] = [];
    let uploadPtr = 0;
    for (let i = 0; i < photoSlots.length; i++) {
      const p = photoSlots[i];
      if (!p) continue;
      if (p.file && p.url.startsWith("blob:")) {
        imageUrls.push(uploaded[uploadPtr++]);
      } else {
        imageUrls.push(p.url);
      }
    }

    if (blobIndices.length > 0) {
      setPhotoSlots((prev) => {
        const next = [...prev];
        let j = 0;
        for (const idx of blobIndices) {
          const old = next[idx];
          if (old?.url.startsWith("blob:")) URL.revokeObjectURL(old.url);
          next[idx] = { url: uploaded[j++] };
        }
        return next;
      });
    }

    return imageUrls;
  }

  async function onSaveDraft() {
    setError(null);
    const ye = validateYearField(year, t, "submit");
    if (ye) {
      setYearError(ye);
      return;
    }
    setYearError(null);
    setSubmitting(true);
    try {
      const resolvedUrls = await resolveImageUrlsForSave();
      if (resolvedUrls === null) return;
      if (isEdit && listingId) {
        await updateListing(listingId, buildPayload(resolvedUrls));
        void queryClient.invalidateQueries({ queryKey: queryKeys.seller.dashboard });
        void queryClient.invalidateQueries({ queryKey: queryKeys.seller.listing(listingId) });
        setStep("DRAFT");
      } else {
        const created = await createListing(buildPayload(resolvedUrls));
        setSavedId(created.id);
        void queryClient.invalidateQueries({ queryKey: queryKeys.seller.dashboard });
        void queryClient.invalidateQueries({ queryKey: queryKeys.listings });
        setStep("DRAFT");
        navigate(`/seller/listings/${created.id}/edit`, { replace: true });
      }
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message === "PACKAGE_REQUIRED") {
        navigate("/seller/packages");
        return;
      }
      setError(t("seller.saveDraftError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function ensureListingId(): Promise<string | null> {
    const ye = validateYearField(year, t, "submit");
    if (ye) {
      setYearError(ye);
      return null;
    }
    setYearError(null);
    const filled = photoSlots.filter(Boolean).length;
    if (filled < REQUIRED_PHOTO_COUNT) {
      setPhotoError(t("seller.photoCountError", { current: filled }));
      return null;
    }
    const resolvedUrls = await resolveImageUrlsForSave();
    if (resolvedUrls === null) return null;
    let targetId = listingId;
    if (!targetId) {
      const created = await createListing(buildPayload(resolvedUrls));
      targetId = created.id;
      setSavedId(created.id);
      navigate(`/seller/listings/${created.id}/edit`, { replace: true });
    } else {
      await updateListing(targetId, buildPayload(resolvedUrls));
    }
    return targetId;
  }

  async function onPublishUnverified() {
    setError(null);
    setSubmitting(true);
    try {
      const targetId = await ensureListingId();
      if (!targetId) {
        setSubmitting(false);
        return;
      }
      await publishListing(targetId, { requestInspection: false });
      void queryClient.invalidateQueries({ queryKey: queryKeys.seller.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      void queryClient.invalidateQueries({ queryKey: queryKeys.seller.listing(targetId) });
      addNotification({
        role: "SELLER",
        type: "success",
        title: t("seller.statePublished"),
        message: t("seller.publishNote"),
        titleKey: "seller.statePublished",
        messageKey: "seller.publishNote",
        link: "/seller",
        sourceKey: `listing-publish-${targetId}`,
      });
      navigate("/seller", { replace: true });
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message === "PACKAGE_REQUIRED") {
        navigate("/seller/packages");
        return;
      }
      if (isAxiosError(err) && err.response?.data?.message === "LISTING_SLOT_LIMIT") {
        setError(t("seller.slotLimitReached"));
        return;
      }
      setError(t("seller.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function onOptionalInspection() {
    setError(null);
    setSubmitting(true);
    try {
      const targetId = await ensureListingId();
      if (!targetId) {
        setSubmitting(false);
        return;
      }
      await publishListing(targetId, { requestInspection: true });
      void queryClient.invalidateQueries({ queryKey: queryKeys.seller.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inspector.pending });
      void queryClient.invalidateQueries({ queryKey: queryKeys.seller.listing(targetId) });
      setStep("PENDING_INSPECTION");
      addNotification({
        role: "SELLER",
        type: "success",
        title: t("seller.submitSuccessTitle"),
        message: t("seller.submitSuccessMessage"),
        titleKey: "seller.submitSuccessTitle",
        messageKey: "seller.submitSuccessMessage",
        link: "/seller",
        sourceKey: `listing-submit-${targetId}`,
      });
      navigate("/seller", { replace: true });
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message === "PACKAGE_REQUIRED") {
        navigate("/seller/packages");
        return;
      }
      if (
        isAxiosError(err) &&
        err.response?.data?.message === "VIP_REQUIRED_FOR_INSPECTION"
      ) {
        setError(t("seller.inspectionVipOnlyError"));
        return;
      }
      setError(t("seller.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  const locked = step === "PENDING_INSPECTION";

  useEffect(() => {
    return () => {
      for (const p of photoSlots) {
        if (p) URL.revokeObjectURL(p.url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPickSlot(slotIndex: number) {
    if (locked) return;
    activeSlotRef.current = slotIndex;
    fileInputRef.current?.click();
  }

  function onPickFiles(files: FileList | null) {
    if (!files || locked) return;
    const slotIndex = activeSlotRef.current;
    activeSlotRef.current = null;
    if (slotIndex == null || slotIndex < 0 || slotIndex >= REQUIRED_PHOTO_COUNT) return;

    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    setPhotoError(null);

    setPhotoSlots((prev) => {
      const next = [...prev];
      const old = next[slotIndex];
      if (old) URL.revokeObjectURL(old.url);
      next[slotIndex] = { file, url: URL.createObjectURL(file) };
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(slotIndex: number) {
    setPhotoError(null);
    setPhotoSlots((prev) => {
      const next = [...prev];
      const old = next[slotIndex];
      if (old) URL.revokeObjectURL(old.url);
      next[slotIndex] = null;
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-foreground">
            {isEdit ? t("seller.editListing") : t("seller.createListing")}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {t("seller.workflow")}
          </div>
        </div>

        <Link
          to="/seller"
          className="inline-flex rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          {t("seller.backToDashboard")}
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {locked && (
        <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          {t("seller.pendingInspectionWarning")}
        </div>
      )}
      {!locked && needUpdateReason && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="font-semibold">{t("seller.inspectorRequiresUpdate")}</div>
          <p className="mt-1">
            {needUpdateReason}
          </p>
          <p className="mt-1 text-xs text-destructive/90">
            {t("seller.pleaseUpdateAndResubmit")}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="text-sm font-semibold text-foreground">
              {t("seller.vehicleInfo")}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                placeholder={t("seller.listingTitlePlaceholder")}
              />
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={locked}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">{t("seller.selectBrand")}</option>
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={locked}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                placeholder={t("listing.model")}
              />
              <input
                value={price}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setPrice(raw);
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={locked}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                placeholder={t("seller.priceVND")}
              />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">{t("seller.selectCity")}</option>
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
                className="sm:col-span-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="MINT_USED">{t("listing.conditionMintUsed")}</option>
                <option value="GOOD_USED">{t("listing.conditionGoodUsed")}</option>
                <option value="FAIR_USED">{t("listing.conditionFairUsed")}</option>
              </select>
              <div className="flex flex-col gap-1">
                <input
                  value={year}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                    setYear(v);
                    const err = v.length === 4 ? validateYearField(v, t, "input") : null;
                    setYearError(err);
                  }}
                  onBlur={() => {
                    if (!year.trim()) {
                      setYearError(null);
                      return;
                    }
                    setYearError(validateYearField(year, t, "blur"));
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoComplete="off"
                  disabled={locked}
                  aria-invalid={yearError ? true : undefined}
                  className={`w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${
                    yearError ? "border-destructive ring-1 ring-destructive/30" : "border-input"
                  }`}
                  placeholder={t("listing.year")}
                />
                {yearError && (
                  <p className="text-xs text-destructive" role="alert">
                    {yearError}
                  </p>
                )}
              </div>
              <input
                value={frameSize}
                onChange={(e) => setFrameSize(e.target.value)}
                disabled={locked}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                placeholder={t("listing.frameSize")}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-foreground">
                {t("seller.imagesRequired")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t("seller.imagesHint")}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => onPickFiles(e.target.files)}
              className="hidden"
              disabled={locked}
            />

            {photoError && (
              <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {photoError}
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PHOTO_SLOT_KEYS.map((labelKey, idx) => {
                const label = t(labelKey);
                const item = photoSlots[idx];
                return (
                  <div
                    key={idx}
                    className="flex flex-col rounded-xl border border-border bg-muted/50 overflow-hidden"
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-foreground border-b border-border bg-card">
                      {idx + 1}. {label}
                    </div>
                    <div className="relative aspect-square bg-muted">
                      {item ? (
                        <>
                          <img
                            src={item.url}
                            alt={label}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          {!locked && (
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute right-2 top-2 rounded-lg bg-primary/90 px-2 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary"
                              aria-label={t("seller.removeImage")}
                            >
                              {t("seller.remove")}
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => onPickSlot(idx)}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span className="text-sm font-medium">{t("seller.selectImage")}</span>
                          <span className="text-[10px]">{t("seller.clickToUpload")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              {t("seller.photosUploaded", { count: photoSlots.filter(Boolean).length })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="text-sm font-semibold text-foreground">{t("seller.action")}</div>

            <button
              onClick={onSaveDraft}
              disabled={locked || submitting}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t("seller.saving") : t("seller.saveDraft")}
            </button>

            <button
              onClick={onPublishUnverified}
              disabled={locked || submitting}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t("seller.publishing") : t("seller.publishUnverified")}
            </button>

            {canRequestInspection ? (
              <button
                onClick={onOptionalInspection}
                disabled={locked || submitting}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-primary/40 bg-card px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t("seller.submitting") : t("seller.submitInspection")}
              </button>
            ) : (
              <div className="mt-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">{t("seller.inspectionVipOnlyHint")}</p>
                <Link
                  to="/seller/packages"
                  className="mt-2 inline-block text-sm font-semibold text-primary underline-offset-2 hover:underline"
                >
                  {t("seller.inspectionUpgradeVipLink")}
                </Link>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
              {t("seller.publishNote")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
