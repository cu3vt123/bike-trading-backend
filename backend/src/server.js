import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDb } from "./config/db.js";
import { runSeed } from "./seed.js";
import { authRoutes } from "./routes/authRoutes.js";
import { bikesRoutes } from "./routes/bikesRoutes.js";
import { buyerRoutes } from "./routes/buyerRoutes.js";
import { sellerRoutes } from "./routes/sellerRoutes.js";
import { inspectorRoutes } from "./routes/inspectorRoutes.js";
import { adminRoutes } from "./routes/adminRoutes.js";
import { brandsRoutes } from "./routes/brandsRoutes.js";
import { packageRoutes } from "./routes/packageRoutes.js";
import { vnpayDemoPaymentRoutes } from "./routes/vnpayDemoPaymentRoutes.js";
import { notFound } from "./utils/http.js";
import { defaultErrorHandler } from "./middlewares/error.middlewares.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

/** CORS: frontend + thêm domain phụ qua CORS_EXTRA_ORIGINS (ngăn cách dấu phẩy) */
const defaultOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const corsOrigins = [
  defaultOrigin,
  ...(process.env.CORS_EXTRA_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/**
 * VNPAY Sandbox demo (học tập): không đặt dưới /api để Return URL / IPN URL ngắn.
 * POST /payment/create | GET /payment/vnpay-return | GET /payment/vnpay-ipn
 */
app.use("/payment", vnpayDemoPaymentRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikesRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/inspector", inspectorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/packages", packageRoutes);

app.use((_req, res) => notFound(res, "Route not found"));

// Error handler – theo shoppingCartBE (phải đặt cuối)
app.use(defaultErrorHandler);

const port = Number(process.env.PORT || 8081);

async function main() {
  if (!String(process.env.JWT_SECRET || "").trim()) {
    // eslint-disable-next-line no-console
    console.error(
      "[fatal] JWT_SECRET is not set. Copy backend/.env.example to backend/.env and set JWT_SECRET (any non-empty string for local dev).",
    );
    process.exit(1);
  }

  const { uri, inMemory } = await connectDb({ mongoUri: process.env.MONGODB_URI });
  // eslint-disable-next-line no-console
  console.log(`[db] connected: ${inMemory ? "in-memory" : uri}`);

  if (inMemory) {
    await runSeed();
    // eslint-disable-next-line no-console
    console.log("[seed] demo data loaded (buyer@demo.com / Password!1)");
  }

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] http://localhost:${port}/api`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

