# Thanh toán VNPay — Gói đăng tin & Mua xe

(Postpay đã gỡ; chỉ còn VNPay.)

**Tra cứu nhanh:** [QUICK-REFERENCE.md](QUICK-REFERENCE.md) — biến env VNP_*, endpoint checkout.  
**Chi tiết rule:** [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) BR-PAY-VNP-*.

---

## 1. Luồng chung (production)

1. **FE** gọi `POST /api/seller/subscription/checkout` với `{ plan: "BASIC" | "VIP", provider: "VNPAY" }`.
2. **BE** tạo bản ghi `PackageOrder` (trạng thái `PENDING`), gọi API VNPay để lấy **URL thanh toán** (redirect) hoặc QR.
3. Người dùng thanh toán trên cổng **VNPay**.
4. VNPay gọi **IPN** về BE → BE xác nhận → `PackageOrder` → `COMPLETED` → cập nhật `User.subscriptionPlan` + `subscriptionExpiresAt` (30 ngày).
5. **FE** sau redirect `returnUrl` gọi `GET /api/auth/me` (hoặc endpoint subscription) để cập nhật store.

---

## 2. Buyer checkout (mua xe)

- `POST /api/buyer/orders/vnpay-checkout` — tạo đơn + `paymentUrl` redirect VNPAY. Plan DEPOSIT (8%) hoặc FULL. **Chỉ VNPAY**, bỏ CASH/COD.
- IPN hoặc Return URL cập nhật `depositPaid`, `vnpayPaymentStatus = PAID`. Return URL cũng cập nhật khi IPN không gọi được (localhost).
- **Thanh toán số dư (plan DEPOSIT):** `POST /api/buyer/orders/:id/vnpay-pay-balance` — tạo URL VNPay cho phần còn lại. TxnRef dạng `BB` + orderId. Return về `/finalize/:listingId?orderId=...&vnpay_balance=1`. IPN/Return set `balancePaid = true`.
- `POST /api/buyer/payments/initiate` — legacy, chỉ CASH (deprecated).

---

## 3. Demo hiện tại (repo)

- `checkout` trả về URL giả lập trên chính FE (`/seller/packages?orderId=...`).
- `POST /api/seller/subscription/orders/:orderId/mock-complete` kích hoạt gói **chỉ để dev** — thay bằng IPN thật khi lên production.

---

## 4. VNPay Sandbox (học tập)

### Return URL vs IPN

| Return URL | IPN URL |
|------------|---------|
| Mở trong **trình duyệt** của user. | VNPAY **server gọi server** tới backend. |
| Hiển thị "thanh toán xong / thất bại". | **Chốt đơn**, cập nhật DB — tin cậy cho nghiệp vụ. |
| User có thể sửa query. | VNPay gửi trực tiếp; verify chữ ký bằng secret. |

**Hash secret không đưa lên React** — IPN phải ở backend.

### Biến môi trường (`backend/.env`)

```env
VNP_TMNCODE=...       # TMN từ merchant sandbox
VNP_HASHSECRET=...    # HashSecret
VNP_PAYURL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURNURL=https://YOUR_NGROK/payment/vnpay-return
VNP_IPNURL=https://YOUR_NGROK/payment/vnpay-ipn
```

VNPAY cần **URL public HTTPS** cho Return/IPN — dùng **ngrok** khi chạy local.

### Thẻ test (Sandbox NCB)

| Trường | Giá trị |
|--------|---------|
| Ngân hàng | NCB |
| Số thẻ | `9704198526191432198` |
| Tên chủ thẻ | NGUYEN VAN A |
| Mật khẩu OTP | `123456` |

### Liên kết

- [VNPay Sandbox](https://sandbox.vnpayment.vn/apis/) — tài liệu API
- [Thanh toán Pay](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html)
- [Merchant Admin TEST](https://sandbox.vnpayment.vn/merchantv2/)

---

## 5. Tài liệu liên quan

| File | Nội dung |
|------|----------|
| `backend/.env.example` | Biến VNP_* |
| `backend/src/config/vnpayDemoConfig.js` | Đọc cấu hình VNPay |
| `docs/business-rules/BUSINESS-RULES.md` | BR-PAY-VNP-* |
