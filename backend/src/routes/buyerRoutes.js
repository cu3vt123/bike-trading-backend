import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../middlewares/auth.middlewares.js";
import {
  createOrder,
  createOrderVnpayCheckout,
  resumeBuyerOrderVnpay,
  payBalanceVnpay,
  getMyOrders,
  getOrderById,
  completeOrder,
  cancelOrder,
} from "../controllers/buyerController.js";
import { initiatePayment } from "../controllers/paymentController.js";
import { createReviewForOrder, listMyReviews } from "../controllers/reviewController.js";
import { wrapAsync } from "../utils/handler.js";

const buyerRoutes = Router();

buyerRoutes.use(requireAuth);
buyerRoutes.use(requireRole(["BUYER", "ADMIN"]));

buyerRoutes.post("/orders/vnpay-checkout", wrapAsync(createOrderVnpayCheckout));
buyerRoutes.post("/orders/:id/vnpay-resume", wrapAsync(resumeBuyerOrderVnpay));
buyerRoutes.post("/orders/:id/vnpay-pay-balance", wrapAsync(payBalanceVnpay));
buyerRoutes.post("/orders", wrapAsync(createOrder));
buyerRoutes.get("/orders", wrapAsync(getMyOrders));
buyerRoutes.get("/orders/:id", wrapAsync(getOrderById));
buyerRoutes.put("/orders/:id/complete", wrapAsync(completeOrder));
buyerRoutes.post("/orders/:id/review", wrapAsync(createReviewForOrder));

buyerRoutes.post("/payments/initiate", wrapAsync(initiatePayment));
buyerRoutes.put("/orders/:id/cancel", wrapAsync(cancelOrder));
buyerRoutes.get("/reviews", wrapAsync(listMyReviews));

export { buyerRoutes };
