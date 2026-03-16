import "dotenv/config";
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
import { notFound } from "./utils/http.js";
import { defaultErrorHandler } from "./middlewares/error.middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin,
    credentials: true,
  }),
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikesRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/inspector", inspectorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/brands", brandsRoutes);

app.use((_req, res) => notFound(res, "Route not found"));

// Error handler – theo shoppingCartBE (phải đặt cuối)
app.use(defaultErrorHandler);

const port = Number(process.env.PORT || 8081);

async function main() {
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

