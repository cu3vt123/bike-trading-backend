import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { User } from "../models/User.js";
import { ok, created, badRequest, unauthorized } from "../utils/http.js";

const emailSchema = z.string().email();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export async function signup(req, res) {
  const schema = z.object({
    role: z.enum(["BUYER", "SELLER"]),
    username: z.string().min(2).max(30).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).max(64),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid signup payload");

  const { role, email, password, username } = parsed.data;
  const resolvedEmail = (email ?? "").trim().toLowerCase();
  if (!resolvedEmail) return badRequest(res, "Email is required for demo");

  const exists = await User.findOne({ email: resolvedEmail });
  if (exists) return badRequest(res, "Email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: resolvedEmail,
    passwordHash,
    role,
    displayName: username ?? resolvedEmail.split("@")[0],
  });

  const accessToken = signToken(String(user._id));
  return created(res, { accessToken, refreshToken: null, role: user.role });
}

export async function login(req, res) {
  const schema = z.object({
    role: z.enum(["BUYER", "SELLER", "INSPECTOR", "ADMIN"]),
    emailOrUsername: z.string().min(1),
    password: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid login payload");

  const { role, emailOrUsername, password } = parsed.data;
  const email = emailOrUsername.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) return unauthorized(res, "Invalid credentials");

  const okPwd = await bcrypt.compare(password, user.passwordHash);
  if (!okPwd) return unauthorized(res, "Invalid credentials");

  // Demo: allow switching role in UI but enforce stored role
  if (user.role !== role)
    return unauthorized(res, "Invalid role for this account");

  const accessToken = signToken(String(user._id));
  return ok(res, { accessToken, refreshToken: null, role: user.role });
}

export async function me(req, res) {
  return ok(res, {
    id: req.user.id,
    email: req.user.email,
    displayName: req.user.displayName,
    role: req.user.role,
  });
}

export async function forgotPassword(req, res) {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid email");

  const email = parsed.data.email.trim().toLowerCase();
  const user = await User.findOne({ email });

  // Do not leak existence. For demo, we still return token if exists.
  if (!user)
    return ok(res, { message: "If account exists, reset email will be sent." });

  const token = crypto.randomBytes(24).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min (demo)
  await user.save();

  return ok(res, {
    message: "Reset token generated (demo).",
    token,
    resetUrl: `http://localhost:5173/reset-password?token=${token}`,
  });
}

export async function resetPassword(req, res) {
  const schema = z.object({
    token: z.string().min(10),
    newPassword: z.string().min(8).max(64),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid reset payload");

  const { token, newPassword } = parsed.data;
  const user = await User.findOne({ resetPasswordToken: token });
  if (!user) return badRequest(res, "Invalid or expired token");
  if (
    !user.resetPasswordExpiresAt ||
    user.resetPasswordExpiresAt.getTime() < Date.now()
  ) {
    return badRequest(res, "Invalid or expired token");
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  await user.save();
  return ok(res, { message: "Password updated" });
}
