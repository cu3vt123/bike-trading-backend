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

/** Đúng 5 ảnh bắt buộc theo checklist */
const PHOTO_SLOT_LABELS = [
  "Toàn xe (góc tổng thể)",
  "Toàn xe (góc khác / hai bên)",
  "Serial khung",
  "Hệ truyền động",
  "Phanh & bánh xe",
] as const;

const REQUIRED_PHOTO_COUNT = 5;

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
  const [photoSlots, setPhotoSlots] = useState<
    Array<{ file: File; url: string } | null>
  >(() => Array.from({ length: REQUIRED_PHOTO_COUNT }, () => null));
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needUpdateReason, setNeedUpdateReason] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeSlotRef = useRef<number | null>(null);

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
      imageUrls: photoSlots
        .filter((p): p is { file: File; url: string } => p != null)
        .map((p) => p.url),
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
      setError("Không lưu được nháp. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitForInspection() {
    const filled = photoSlots.filter(Boolean).length;
    if (filled < REQUIRED_PHOTO_COUNT) {
      setPhotoError(`Vui lòng tải đủ ${REQUIRED_PHOTO_COUNT} ảnh theo checklist (hiện có ${filled}/5).`);
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
      setError("Không gửi được kiểm định. Vui lòng thử lại.");
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
            {isEdit ? "Chỉnh sửa tin" : "Tạo tin đăng"}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Nháp → Gửi kiểm định → (Duyệt) Xuất bản.
          </div>
        </div>

        <Link
          to="/seller"
          className="inline-flex rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          ← Về bảng điều khiển
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {locked && (
        <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          Tin này <b>đang chờ kiểm định</b>. Không thể sửa cho đến khi có kết quả.
        </div>
      )}
      {!locked && needUpdateReason && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="font-semibold">Kiểm định viên yêu cầu cập nhật</div>
          <p className="mt-1">
            {needUpdateReason}
          </p>
          <p className="mt-1 text-xs text-destructive/90">
            Vui lòng sửa theo nội dung trên, lưu nháp rồi gửi kiểm định lại.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="text-sm font-semibold text-foreground">
              Thông tin xe
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                placeholder="Tiêu đề tin đăng"
              />
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={locked}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">Chọn hãng</option>
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
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                placeholder="Giá (VNĐ)"
              />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">Chọn thành phố</option>
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
                <option value="MINT_USED">Rất tốt (đã dùng)</option>
                <option value="GOOD_USED">Tốt (đã dùng)</option>
                <option value="FAIR_USED">Khá (đã dùng)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-foreground">
                Ảnh (bắt buộc đủ 5 theo checklist)
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Mỗi ô tương ứng một nội dung trong checklist. Bắt buộc trước khi gửi kiểm định.
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
              {PHOTO_SLOT_LABELS.map((label, idx) => {
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
                              aria-label="Xóa ảnh"
                            >
                              Xóa
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
                          <span className="text-sm font-medium">Chọn ảnh</span>
                          <span className="text-[10px]">(bấm để tải lên)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              {photoSlots.filter(Boolean).length}/{REQUIRED_PHOTO_COUNT} ảnh đã tải
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="text-sm font-semibold text-foreground">Thao tác</div>

            <button
              onClick={onSaveDraft}
              disabled={locked || submitting}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu nháp"}
            </button>

            <button
              onClick={onSubmitForInspection}
              disabled={locked || submitting}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi kiểm định →"}
            </button>

            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
              Tin sẽ được xuất bản lên sàn sau khi kiểm định viên duyệt.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
