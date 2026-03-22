# Thanh toán gói đăng tin — VNPay

(Postpay đã gỡ khỏi codebase; chỉ còn VNPay.)

## Luồng chung (production)

1. **FE** gọi `POST /api/seller/subscription/checkout` với `{ plan: "BASIC" | "VIP", provider: "VNPAY" }`.
2. **BE** tạo bản ghi `PackageOrder` (trạng thái `PENDING`), gọi API VNPay để lấy **URL thanh toán** (redirect) hoặc QR.
3. Người dùng thanh toán trên cổng **VNPay**.
4. VNPay gọi **IPN** về BE → BE xác nhận → `PackageOrder` → `COMPLETED` → cập nhật `User.subscriptionPlan` + `subscriptionExpiresAt` (30 ngày).
5. **FE** sau redirect `returnUrl` gọi `GET /api/auth/me` (hoặc endpoint subscription) để cập nhật store.

## Demo hiện tại (repo)

- `checkout` trả về URL giả lập trên chính FE (`/seller/packages?orderId=...`).
- `POST /api/seller/subscription/orders/:orderId/mock-complete` kích hoạt gói **chỉ để dev** — thay bằng IPN thật khi lên production.

## Tham khảo

| Nhà cung cấp | Ghi chú |
|--------------|---------|
| **VNPay** | [VNPay Sandbox](https://sandbox.vnpayment.vn/apis/) — luồng `vnp_TmnCode`, `vnp_HashSecret`, redirect `vnp_ReturnUrl`, IPN `vnp_IpnUrl`. |

## Buyer checkout (mua xe)

- `POST /api/buyer/orders/vnpay-checkout` — tạo đơn + `paymentUrl` redirect VNPAY. Plan DEPOSIT (8%) hoặc FULL. **Chỉ VNPAY**, bỏ CASH/COD.
- IPN hoặc Return URL cập nhật `depositPaid`, `vnpayPaymentStatus = PAID`. Return URL cũng cập nhật khi IPN không gọi được (localhost).
- `POST /api/buyer/payments/initiate` — legacy, chỉ CASH (deprecated).

Sau khi có merchant thật, thay nội dung `paymentUrl` trong `packageController.checkoutSubscription` bằng URL từ VNPay và **xóa hoặc bảo vệ** route `mock-complete`.
