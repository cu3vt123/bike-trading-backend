import { z } from "zod";
import { ok, badRequest } from "../utils/http.js";

const initiatePaymentSchema = z.object({
  method: z.enum(["CARD", "BANK_TRANSFER"]),
  amount: z.number().optional(),
  cardDetails: z
    .object({
      number: z.string().min(13),
      name: z.string().min(1),
      exp: z.string().min(3),
      cvc: z.string().min(3),
    })
    .optional(),
  bankDetails: z
    .object({
      accountNumber: z.string().min(8),
      bankName: z.string().min(1),
      accountHolderName: z.string().optional(),
    })
    .optional(),
});

export async function initiatePayment(req, res) {
  const parsed = initiatePaymentSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, "Invalid payment payload");

  const { method, cardDetails, bankDetails } = parsed.data;

  if (method === "CARD" && !cardDetails) {
    return badRequest(res, "Card details required");
  }
  if (method === "BANK_TRANSFER" && !bankDetails) {
    return badRequest(res, "Bank details required");
  }

  let paymentMethod;

  if (method === "CARD") {
    const digits = cardDetails.number.replace(/\D/g, "");
    paymentMethod = {
      type: "CARD",
      brand: "Visa",
      last4: digits.slice(-4) || "0000",
    };
  } else {
    paymentMethod = {
      type: "BANK_TRANSFER",
      bankRef: "BANK-MOCK",
    };
  }

  return ok(res, { ok: true, paymentMethod });
}

