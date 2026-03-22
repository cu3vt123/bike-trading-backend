import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "PENDING",
        "RESERVED",
        "PENDING_SELLER_SHIP",
        "SELLER_SHIPPED",
        "AT_WAREHOUSE_PENDING_ADMIN",
        "RE_INSPECTION",
        "RE_INSPECTION_DONE",
        "SHIPPING",
        "IN_TRANSACTION",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "RESERVED",
    },
    plan: { type: String, enum: ["DEPOSIT", "FULL"], default: "DEPOSIT" },
    totalPrice: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    depositPaid: { type: Boolean, default: false },
    /** Phần còn lại (số dư) đã thanh toán qua VNPay — khi plan DEPOSIT */
    balancePaid: { type: Boolean, default: false },
    shippingAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    shippedAt: { type: Date, default: null },
    warehouseConfirmedAt: { type: Date, default: null },
    reInspectionDoneAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    /** WAREHOUSE = gửi kho + kiểm định lại (chỉ khi tin CERTIFIED lúc đặt hàng). DIRECT = giao thẳng (xe chưa mác). */
    fulfillmentType: {
      type: String,
      enum: ["WAREHOUSE", "DIRECT"],
      default: "WAREHOUSE",
    },
    listing: { type: mongoose.Schema.Types.Mixed }, // snapshot for display
    /** Thanh toán VNPAY Sandbox: IPN cập nhật PENDING_PAYMENT → PAID | FAILED */
    vnpayPaymentStatus: {
      type: String,
      enum: ["PENDING_PAYMENT", "PAID", "FAILED"],
      default: undefined,
    },
    /** Số tiền gửi lên VNPAY (VND) — khớp vnp_Amount/100 khi IPN */
    vnpayAmountVnd: { type: Number, default: null },
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
