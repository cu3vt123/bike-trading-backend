import { Router } from "express";
import {
  signup,
  login,
  me,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.middlewares.js";
import { wrapAsync } from "../utils/handler.js";

const authRoutes = Router();

authRoutes.post("/signup", wrapAsync(signup));
authRoutes.post("/login", wrapAsync(login));
authRoutes.get("/me", requireAuth, wrapAsync(me));
authRoutes.post("/forgot-password", wrapAsync(forgotPassword));
authRoutes.post("/reset-password", wrapAsync(resetPassword));

export { authRoutes };

