import { z } from "zod";
import { ok, created, badRequest, notFound, forbidden } from "../utils/http.js";
import { PLANS, LISTING_DURATION_DAYS } from "../constants/subscription.js";
import { PackageOrder } from "../models/PackageOrder.js";
import { User } from "../models/User.js";
import {
  isSubscriptionActive,
  activateSubscription,
  buildSubscriptionSummaryForUser,
  clearSellerSubscription,
} from "../services/subscriptionService.js";
import { buildVnpaySandboxPaymentUrl } from "../utils/vnpaySandbox.js";
import { getVnpayDemoConfig } from "../config/vnpayDemoConfig.js";

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length > 0) {
    return xf.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? req.ip ?? "127.0.0.1";
}

/** Trùng origin với tab đang gọi API (tránh localhost vs 127.0.0.1 làm mất token / về nhầm trang). */
function getClientOrigin(req) {
  const fromEnv = process.env.CLIENT_ORIGIN?.trim();
  const origin = req.headers.origin;
  if (typeof origin === "string" && /^https?:\/\//i.test(origin)) {
    return origin.replace(/\/$/, "");
  }
  const referer = req.headers.referer;
  if (typeof referer === "string") {
    try {
      return new URL(referer).origin;
    } catch {
      /* ignore */
    }
  }
  return fromEnv || "http://localhost:5173";
}

/** GET /api/packages — public catalog + gợi ý tích hợp VNPay */
export async function listPackages(req, res) {
  const clientOrigin = getClientOrigin(req);
  return ok(res, {
    listingDurationDays: LISTING_DURATION_DAYS,
    paymentProviders: [
      {
        id: "VNPAY",
        name: "VNPay",
        docsUrl: "https://sandbox.vnpayment.vn/apis/",
        note: "Thanh toán qua cổng VNPAY.",
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
    demoCallbackHint: `${clientOrigin}/seller/packages?mockPay=`,
  });
}

const checkoutSchema = z.object({
  plan: z.enum(["BASIC", "VIP"]),
  provider: z.enum(["VNPAY"]),
});

/** POST /api/seller/subscription/checkout */
export async function checkoutSubscription(req, res) {
  const parsed = checkoutSchema.safeParse(req.body ?? {});
  if (!parsed.success) return badRequest(res, "Invalid checkout payload");

  const sellerId = req.user.id;
  const { plan, provider } = parsed.data;

  const user = await User.findById(sellerId);
  if (!user) return notFound(res, "User not found");

  const hasActiveSub = isSubscriptionActive(user);
  const currentPlan = user.subscriptionPlan;

  /** Không cho downgrade VIP → Basic */
  if (hasActiveSub && currentPlan === "VIP" && plan === "BASIC") {
    return badRequest(res, "Không thể chuyển từ gói VIP xuống Basic.");
  }

  /** Không cho mua cộng dồn — phải hết hạn mới mua tiếp (trừ nâng cấp Basic→VIP) */
  if (hasActiveSub && currentPlan === plan) {
    return badRequest(res, "Gói đang còn hạn. Chỉ mua được khi hết hạn.");
  }

  if (hasActiveSub && currentPlan === "VIP" && plan === "VIP") {
    return badRequest(res, "Đã dùng gói VIP. Chỉ mua được khi hết hạn.");
  }

  /** Nâng cấp Basic → VIP: chỉ tính 100k (199k - 99k) */
  let amountVnd;
  let isUpgrade = false;
  if (hasActiveSub && currentPlan === "BASIC" && plan === "VIP") {
    amountVnd = PLANS.VIP.priceVnd - PLANS.BASIC.priceVnd; // 100_000
    isUpgrade = true;
  } else {
    const def = plan === "VIP" ? PLANS.VIP : PLANS.BASIC;
    amountVnd = def.priceVnd;
  }

  const clientOrigin = getClientOrigin(req);

  const order = await PackageOrder.create({
    sellerId,
    plan,
    provider,
    amountVnd,
    status: "PENDING",
    paymentUrl: "",
  });

  const vnpCfg = getVnpayDemoConfig();
  const demoReturnUrl = `${clientOrigin}/seller/packages?orderId=${order._id}&status=success`;
  const mockGatewayUrl = `${clientOrigin}/seller/packages?orderId=${order._id}&provider=${provider}&step=pay`;

  /** vnp_TxnRef = Mongo _id — IPN/Return /payment nhận diện PackageOrder */
  const txnRef = String(order._id);
  let paymentUrl = mockGatewayUrl;
  let qrContent = `${mockGatewayUrl}&amount=${amountVnd}`;
  let paymentKind = "MOCK";
  let message =
    "Demo VNPay: quét QR hoặc mở link trên cùng origin, rồi dùng mock-complete / giả lập trả về.";

  if (vnpCfg.isReady) {
    try {
      paymentUrl = buildVnpaySandboxPaymentUrl({
        tmnCode: vnpCfg.tmnCode,
        hashSecret: vnpCfg.hashSecret,
        amountVnd,
        txnRef,
        orderInfo: `Goi ${plan} SWP`,
        returnUrl: vnpCfg.returnUrl,
        ipAddr: clientIp(req),
        payUrl: vnpCfg.payUrl,
        ipnUrl: vnpCfg.ipnUrl || undefined,
        bankCode: vnpCfg.bankCode,
      });
      qrContent = paymentUrl;
      paymentKind = "VNPAY_SANDBOX";
      message =
        "Sandbox VNPAY: thanh toán trên cổng VNPAY. Sau khi thành công, IPN cập nhật đơn và kích hoạt gói; trình duyệt quay về trang gói.";
    } catch (e) {
      console.error(
        "[package-checkout] build VNPAY URL failed:",
        e?.message ?? e,
      );
      paymentUrl = mockGatewayUrl;
      qrContent = `${mockGatewayUrl}&amount=${amountVnd}`;
      paymentKind = "MOCK";
      message =
        "Không tạo được URL VNPAY (kiểm tra .env). Đang dùng luồng demo mock trên cùng site.";
    }
  }

  order.paymentUrl = paymentUrl;
  await order.save();

  return created(res, {
    orderId: String(order._id),
    plan,
    provider,
    amountVnd,
    isUpgrade,
    paymentUrl,
    qrContent,
    demoReturnUrl,
    paymentKind,
    message,
  });
}

/** POST /api/seller/subscription/orders/:orderId/mock-complete — chỉ dev/demo */
export async function mockCompletePackageOrder(req, res) {
  const { orderId } = req.params;
  const sellerId = req.user.id;

  const order = await PackageOrder.findById(orderId);
  if (!order) return notFound(res, "Order not found");
  if (String(order.sellerId) !== String(sellerId))
    return forbidden(res, "Not your order");
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

/** PUT /api/seller/subscription/revoke-self — seller tự gỡ gói (demo) */
export async function revokeSelfSubscription(req, res) {
  const sellerId = req.user.id;
  const user = await User.findById(sellerId);
  if (!user) return notFound(res, "User not found");
  const hadPlan = Boolean(user.subscriptionPlan || user.subscriptionExpiresAt);
  if (hadPlan) {
    await clearSellerSubscription(sellerId);
  }
  const updated = await User.findById(sellerId);
  const subscription = await buildSubscriptionSummaryForUser(updated);
  return ok(res, { subscription, revoked: hadPlan });
}
