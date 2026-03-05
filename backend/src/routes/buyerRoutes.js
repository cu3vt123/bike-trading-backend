import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middlewares.js";
import { createOrder, getMyOrders, getOrderById, completeOrder } from "../controllers/buyerController.js";
import { wrapAsync } from "../utils/handler.js";

const buyerRoutes = Router();

buyerRoutes.use(requireAuth);
buyerRoutes.use(requireRole(["BUYER", "ADMIN"]));

buyerRoutes.post("/orders", wrapAsync(createOrder));
buyerRoutes.get("/orders", wrapAsync(getMyOrders));
buyerRoutes.get("/orders/:id", wrapAsync(getOrderById));
buyerRoutes.put("/orders/:id/complete", wrapAsync(completeOrder));

export { buyerRoutes };
