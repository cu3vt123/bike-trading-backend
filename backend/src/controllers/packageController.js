import { z } from "zod";
import { ok, created, badRequest, notFound, forbidden } from "../utils/http.js";
import { PLANS, INSPECTION_ADDON, LISTING_DURATION_DAYS } from "../constants/subscription.js";
import { PackageOrder } from "../models/PackageOrder.js";
import { User } from "../models/User.js";
import {
  activateSubscription,
  buildSubscriptionSummaryForUser,
} from "../services/subscriptionService.js";

/** GET /api/packages — public catalog + gợi ý tích hợp Postpay / VNPay */
export async function listPackages(_req, res) {
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  return ok(res, {
    listingDurationDays: LISTING_DURATION_DAYS,
    paymentProviders: [
      {
        id: "POSTPAY",
        name: "Postpay",
        docsUrl: "https://postpay.vn",
        note: "Sandbox: tạo đơn và redirect theo URL trả về; webhook xác nhận thanh toán (production).",
      },
      {
        id: "VNPAY",
        name: "VNPay",
        docsUrl: "https://sandbox.vnpayment.vn/apis/",
        note: "Tham khảo VNPay Sandbox để so sánh luồng redirect + IPN.",
      },
    ],
    plans: [
      {
        id: PLANS.BASIC.id,
        name: PLANS.BASIC.nameKey,
        maxConcurrentListings: PLANS.BASIC.maxConcurrentListings,
        priceVnd: PLANS.BASIC.priceVnd,
        description: PLANS.BASIC.description,
      },
      {
        id: PLANS.VIP.id,
        name: PLANS.VIP.nameKey,
        maxConcurrentListings: PLANS.VIP.maxConcurrentListings,
        priceVnd: PLANS.VIP.priceVnd,
        description: PLANS.VIP.description,
      },
    ],
    inspectionAddOn: {
      id: INSPECTION_ADDON.id,
      name: INSPECTION_ADDON.nameKey,
      priceVnd: INSPECTION_ADDON.priceVnd,
      description: INSPECTION_ADDON.description,
    },
    demoCallbackHint: `${clientOrigin}/seller/packages?mockPay=`,
  });
}

const checkoutSchema = z.object({
  plan: z.enum(["BASIC", "VIP"]),
  provider: z.enum(["POSTPAY", "VNPAY"]),
});

/** POST /api/seller/subscription/checkout */
export async function checkoutSubscription(req, res) {
  const parsed = checkoutSchema.safeParse(req.body ?? {});
  if (!parsed.success) return badRequest(res, "Invalid checkout payload");

  const sellerId = req.user.id;
  const { plan, provider } = parsed.data;
  const def = plan === "VIP" ? PLANS.VIP : PLANS.BASIC;
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

  const order = await PackageOrder.create({
    sellerId,
    plan,
    provider,
    amountVnd: def.priceVnd,
    status: "PENDING",
    paymentUrl: "",
  });

  /** Demo: URL giả lập gateway — FE mở tab hoặc navigate + gọi mock-complete */
  const demoReturnUrl = `${clientOrigin}/seller/packages?orderId=${order._id}&status=success`;
  const mockGatewayUrl = `${clientOrigin}/seller/packages?orderId=${order._id}&provider=${provider}&step=pay`;

  order.paymentUrl = mockGatewayUrl;
  await order.save();

  return created(res, {
    orderId: String(order._id),
    plan,
    provider,
    amountVnd: def.priceVnd,
    /** Production: URL từ Postpay/VNPay */
    paymentUrl: mockGatewayUrl,
    demoReturnUrl,
    message:
      provider === "POSTPAY"
        ? "Demo: sau này thay bằng URL redirect thật từ Postpay."
        : "Demo: sau này thay bằng URL pay.vnpay.vn (sandbox).",
  });
}

/** POST /api/seller/subscription/orders/:orderId/mock-complete — chỉ dev/demo */
export async function mockCompletePackageOrder(req, res) {
  const { orderId } = req.params;
  const sellerId = req.user.id;

  const order = await PackageOrder.findById(orderId);
  if (!order) return notFound(res, "Order not found");
  if (String(order.sellerId) !== String(sellerId)) return forbidden(res, "Not your order");
  if (order.status === "COMPLETED") {
    return ok(res, { alreadyCompleted: true, orderId: String(order._id) });
  }

  order.status = "COMPLETED";
  await order.save();

  await activateSubscription(sellerId, order.plan);

  const user = await User.findById(sellerId);
  const subscription = await buildSubscriptionSummaryForUser(user);

  return ok(res, {
    orderId: String(order._id),
    subscription,
  });
}
