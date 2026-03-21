import mongoose from "mongoose";

const PackageOrderSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, required: true, enum: ["BASIC", "VIP"] },
    provider: { type: String, required: true, enum: ["POSTPAY", "VNPAY"] },
    amountVnd: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    /** URL sandbox (Postpay / VNPay) — demo: frontend callback */
    paymentUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

PackageOrderSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const PackageOrder = mongoose.model("PackageOrder", PackageOrderSchema);
