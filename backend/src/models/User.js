import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["BUYER", "SELLER", "INSPECTOR", "ADMIN"],
    },
    displayName: { type: String, default: "" },
    isHidden: { type: Boolean, default: false, index: true },
    hiddenAt: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
    /** Gói đăng tin (seller): BASIC | VIP, hết hạn thì không đăng/publish được */
    subscriptionPlan: { type: String, enum: ["BASIC", "VIP"], default: undefined },
    subscriptionExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserSchema);

