import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { User } from "../models/User.js";
import { ok, created, badRequest, unauthorized } from "../utils/http.js";
import { buildSubscriptionSummaryForUser } from "../services/subscriptionService.js";

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
  const subscription = await buildSubscriptionSummaryForUser(user);
  return created(res, {
    accessToken,
    refreshToken: null,
    role: user.role,
    subscription: user.role === "SELLER" ? subscription : undefined,
  });
}

export async function login(req, res) {
  const body = req.body ?? {};
  const emailOrUsernameRaw =
    typeof body.emailOrUsername === "string"
      ? body.emailOrUsername
      : typeof body.email === "string"
        ? body.email
        : typeof body.username === "string"
          ? body.username
          : "";
  const passwordRaw = typeof body.password === "string" ? body.password : "";

  const emailOrUsername = emailOrUsernameRaw.trim();
  const password = passwordRaw;

  if (!emailOrUsername) {
    return badRequest(
      res,
      "Vui lòng nhập email hoặc tên đăng nhập.",
      "LOGIN_MISSING_IDENTIFIER",
    );
  }
  if (!password) {
    return badRequest(
      res,
      "Vui lòng nhập mật khẩu.",
      "LOGIN_MISSING_PASSWORD",
    );
  }

  const email = emailOrUsername.toLowerCase();
  const user = await User.findOne({ email });
  if (!user) {
    return unauthorized(
      res,
      "Không tìm thấy tài khoản với email này.",
      "LOGIN_UNKNOWN_USER",
    );
  }
  if (user.isHidden) {
    return unauthorized(
      res,
      "Tài khoản đã bị vô hiệu hóa.",
      "LOGIN_ACCOUNT_HIDDEN",
    );
  }

  const okPwd = await bcrypt.compare(password, user.passwordHash);
  if (!okPwd) {
    return unauthorized(res, "Mật khẩu không đúng.", "LOGIN_WRONG_PASSWORD");
  }

  const accessToken = signToken(String(user._id));
  const subscription = await buildSubscriptionSummaryForUser(user);
  return ok(res, {
    accessToken,
    refreshToken: null,
    role: user.role,
    subscription: user.role === "SELLER" ? subscription : undefined,
  });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  const subscription = user ? await buildSubscriptionSummaryForUser(user) : null;
  return ok(res, {
    id: req.user.id,
    email: req.user.email,
    displayName: req.user.displayName,
    role: req.user.role,
    subscription: req.user.role === "SELLER" ? subscription : undefined,
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
