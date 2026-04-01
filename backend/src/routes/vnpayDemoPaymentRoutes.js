/**
 * Routes công khai cho demo VNPAY (không nằm dưới /api để Return/IPN URL ngắn gọn).
 */
import { Router } from "express";
import {
  vnpayCreatePayment,
  vnpayReturn,
  vnpayIpn,
} from "../controllers/vnpayDemoPaymentController.js";
import { wrapAsync } from "../utils/handler.js";

const router = Router();

router.post("/create", wrapAsync(vnpayCreatePayment));
router.get("/vnpay-return", wrapAsync(vnpayReturn));
router.get("/vnpay-ipn", wrapAsync(vnpayIpn));

export { router as vnpayDemoPaymentRoutes };
