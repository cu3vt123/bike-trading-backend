import { z } from "zod";
import { ok, created, badRequest, notFound, forbidden } from "../utils/http.js";
import { PLANS, LISTING_DURATION_DAYS } from "../constants/subscription.js";
import { PackageOrder } from "../models/PackageOrder.js";
import { User } from "../models/User.js";
import {
  activateSubscription,
  buildSubscriptionSummaryForUser,
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
        note: "Sandbox: redirect + IPN; production pay.vnpay.vn.",
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
  const def = plan === "VIP" ? PLANS.VIP : PLANS.BASIC;
  const clientOrigin = getClientOrigin(req);

  const order = await PackageOrder.create({
    sellerId,
    plan,
    provider,
    amountVnd: def.priceVnd,
    status: "PENDING",
    paymentUrl: "",
  });

  const vnpCfg = getVnpayDemoConfig();
  const demoReturnUrl = `${clientOrigin}/seller/packages?orderId=${order._id}&status=success`;
  const mockGatewayUrl = `${clientOrigin}/seller/packages?orderId=${order._id}&provider=${provider}&step=pay`;

  /** vnp_TxnRef = Mongo _id — IPN/Return /payment nhận diện PackageOrder */
  const txnRef = String(order._id);
  let paymentUrl = mockGatewayUrl;
  let qrContent = `${mockGatewayUrl}&amount=${def.priceVnd}`;
  let paymentKind = "MOCK";
  let message =
    "Demo VNPay: quét QR hoặc mở link trên cùng origin, rồi dùng mock-complete / giả lập trả về.";

  if (vnpCfg.isReady) {
    try {
      paymentUrl = buildVnpaySandboxPaymentUrl({
        tmnCode: vnpCfg.tmnCode,
        hashSecret: vnpCfg.hashSecret,
        amountVnd: def.priceVnd,
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
      console.error("[package-checkout] build VNPAY URL failed:", e?.message ?? e);
      paymentUrl = mockGatewayUrl;
      qrContent = `${mockGatewayUrl}&amount=${def.priceVnd}`;
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
    amountVnd: def.priceVnd,
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
