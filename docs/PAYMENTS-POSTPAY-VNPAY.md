# Thanh toán gói đăng tin — Postpay & VNPay

## Luồng chung (production)

1. **FE** gọi `POST /api/seller/subscription/checkout` với `{ plan: "BASIC" | "VIP", provider: "POSTPAY" | "VNPAY" }`.
2. **BE** tạo bản ghi `PackageOrder` (trạng thái `PENDING`), gọi API nhà cung cấp để lấy **URL thanh toán** (redirect) hoặc QR.
3. Người dùng thanh toán trên cổng **Postpay** hoặc **VNPay**.
4. Cổng thanh toán gọi **webhook / IPN** về BE → BE xác nhận → `PackageOrder` → `COMPLETED` → cập nhật `User.subscriptionPlan` + `subscriptionExpiresAt` (30 ngày).
5. **FE** sau redirect `returnUrl` gọi `GET /api/auth/me` (hoặc endpoint subscription) để cập nhật Zustand.

## Demo hiện tại (repo)

- `checkout` trả về URL giả lập trên chính FE (`/seller/packages?orderId=...`).
- `POST /api/seller/subscription/orders/:orderId/mock-complete` kích hoạt gói **chỉ để dev** — thay bằng webhook thật khi lên production.

## Tham khảo

| Nhà cung cấp | Ghi chú |
|--------------|---------|
| **Postpay** | [postpay.vn](https://postpay.vn) — tài liệu sandbox / tích hợp theo hợp đồng merchant. |
| **VNPay** | [VNPay Sandbox](https://sandbox.vnpayment.vn/apis/) — luồng `vnp_TmnCode`, `vnp_HashSecret`, redirect `vnp_ReturnUrl`, IPN `vnp_IpnUrl`. |

## Khác biệt nhanh

- **Postpay**: thường REST + redirect; kiểm tra chữ ký theo tài liệu Postpay.
- **VNPay**: query string ký HMAC SHA512; IPN server-to-server, cần idempotent (tránh cộng gói hai lần).

Sau khi có merchant thật, thay nội dung `paymentUrl` trong `packageController.checkoutSubscription` bằng URL từ gateway và **xóa hoặc bảo vệ** route `mock-complete`.
