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
    currency: { type: String, default: "USD", enum: ["USD", "VND"] },
    location: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    imageUrls: { type: [String], default: [] },
    state: {
      type: String,
      required: true,
      enum: [
        "DRAFT",
        "PENDING_INSPECTION",
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
    inspectionSummary: { type: String, default: "" },
    inspectionNeedUpdateReason: { type: String, default: "" },
    specs: { type: Array, default: [] },
    description: { type: String, default: "" },
    seller: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, default: "" },
      email: { type: String, default: "" },
    },
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

