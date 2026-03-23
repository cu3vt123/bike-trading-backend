import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "EDITED", "HIDDEN"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

ReviewSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.orderId = String(ret.orderId);
    ret.listingId = String(ret.listingId);
    ret.sellerId = String(ret.sellerId);
    ret.buyerId = String(ret.buyerId);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Review = mongoose.model("Review", ReviewSchema);

