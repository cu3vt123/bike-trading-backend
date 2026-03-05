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
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserSchema);

