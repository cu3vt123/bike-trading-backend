import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "RESERVED", "IN_TRANSACTION", "COMPLETED", "CANCELLED", "REFUNDED"],
      default: "RESERVED",
    },
    plan: { type: String, enum: ["DEPOSIT", "FULL"], default: "DEPOSIT" },
    totalPrice: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    depositPaid: { type: Boolean, default: false },
    shippingAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    expiresAt: { type: Date, default: null },
    listing: { type: mongoose.Schema.Types.Mixed }, // snapshot for display
  },
  { timestamps: true },
);

OrderSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.listingId = String(ret.listingId);
    ret.buyerId = String(ret.buyerId);
    if (ret.expiresAt) ret.expiresAt = ret.expiresAt.toISOString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model("Order", OrderSchema);
