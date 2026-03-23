import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, default: "" },
    year: { type: Number, default: null },
    frameSize: { type: String, default: "" },
    condition: {
      type: String,
      default: null,
      enum: ["NEW", "LIKE_NEW", "MINT_USED", "GOOD_USED", "FAIR_USED", null],
    },
    price: { type: Number, required: true },
    msrp: { type: Number, default: null },
    currency: { type: String, default: "VND", enum: ["USD", "VND"] },
    location: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    imageUrls: { type: [String], default: [] },
    state: {
      type: String,
      required: true,
      enum: [
        "DRAFT",
        "PENDING_INSPECTION",
        /** Đã duyệt online; seller phải gửi xe thật tới kho */
        "AWAITING_WAREHOUSE",
        /** Seller đã báo gửi; admin xác nhận xe tới kho */
        "AT_WAREHOUSE_PENDING_VERIFY",
        /** Admin đã xác nhận xe tới; inspector xác nhận lần 2 tại kho */
        "AT_WAREHOUSE_PENDING_RE_INSPECTION",
        "NEED_UPDATE",
        "PUBLISHED",
        "RESERVED",
        "IN_TRANSACTION",
        "SOLD",
        "REJECTED",
      ],
      default: "DRAFT",
    },
    inspectionResult: {
      type: String,
      default: null,
      enum: ["APPROVE", "REJECT", "NEED_UPDATE", null],
    },
    inspectionScore: { type: Number, default: null }, // 0..5 (demo)
    inspectionReport: {
      frameIntegrity: { score: { type: Number }, label: { type: String } },
      drivetrainHealth: { score: { type: Number }, label: { type: String } },
      brakingSystem: { score: { type: Number }, label: { type: String } },
    },
    inspectionSummary: { type: String, default: "" },
    inspectionNeedUpdateReason: { type: String, default: "" },
    specs: { type: Array, default: [] },
    description: { type: String, default: "" },
    seller: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    isHidden: { type: Boolean, default: false, index: true },
    hiddenAt: { type: Date, default: null },
    /**
     * UNVERIFIED = lên sàn không kiểm định;
     * PENDING_CERTIFICATION = chờ duyệt online;
     * PENDING_WAREHOUSE = đã duyệt online, chờ gửi xe / xác nhận tại kho;
     * CERTIFIED = đủ 2 vòng (online + kho khớp ảnh), được bán luồng kho.
     */
    certificationStatus: {
      type: String,
      enum: ["UNVERIFIED", "PENDING_CERTIFICATION", "PENDING_WAREHOUSE", "CERTIFIED"],
      default: "UNVERIFIED",
    },
    /** Seller báo đã gửi xe tới kho (sau duyệt online) */
    sellerShippedToWarehouseAt: { type: Date, default: null },
    /** Admin xác nhận xe thật tại kho khớp ảnh — mới được PUBLISHED + CERTIFIED */
    warehouseIntakeVerifiedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    /** Hết hạn thì không hiển thị trên marketplace (30 ngày từ publishedAt) */
    listingExpiresAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

ListingSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Listing = mongoose.model("Listing", ListingSchema);

