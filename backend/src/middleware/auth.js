import jwt from "jsonwebtoken";
import { unauthorized, forbidden } from "../utils/http.js";
import { User } from "../models/User.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return unauthorized(res, "Missing token");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || user.isHidden) return unauthorized(res, "Invalid token");
    req.user = {
      id: String(user._id),
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      subscriptionPlan: user.subscriptionPlan ?? null,
      subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
    };
    return next();
  } catch {
    return unauthorized(res, "Invalid token");
  }
}

export function requireRole(roles) {
  const set = new Set(roles);
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return unauthorized(res, "Missing user");
    if (!set.has(role)) return forbidden(res, "Wrong role");
    return next();
  };
}

