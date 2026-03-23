import { z } from "zod";
import { ok, badRequest } from "../utils/http.js";

const initiatePaymentSchema = z.object({
  method: z.enum(["CASH"]),
});

/**
 * POST /api/buyer/payments/initiate — chỉ xác nhận thanh toán COD.
 * VNPAY Sandbox: dùng POST /payment/create hoặc POST /api/buyer/orders/vnpay-checkout (redirect).
 */
export async function initiatePayment(req, res) {
  const parsed = initiatePaymentSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid payment payload (chỉ hỗ trợ CASH)");

  return ok(res, {
    ok: true,
    paymentMethod: { type: "CASH" },
  });
}
