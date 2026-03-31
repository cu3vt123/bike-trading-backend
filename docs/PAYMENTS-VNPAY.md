# Thanh toán VNPAY — Spring Boot `quydu_be`

Chú thích cho dev chạy **sandbox TEST** local (nhánh Bespring). Chi tiết nghiệp vụ rộng: [PAYMENTS-VNPAY (monorepo quydu12)](https://github.com/cu3vt123/bike-trading-backend/blob/quydu12/docs/PAYMENTS-VNPAY.md).

## Cấu hình Spring (`application-local.properties` + profile `local`)

| VNPAY (tài liệu merchant) | Property Spring |
|---------------------------|-----------------|
| Terminal ID / Mã website | `vnpay.tmnCode` |
| Secret key (checksum HMAC) | `vnpay.hashSecret` |
| URL cổng thanh toán TEST | `vnpay.url` |
| URL app nhận redirect sau thanh toán | `vnpay.returnUrl` |
| (Tuỳ chọn) URL IPN server-to-server | `vnpay.ipnUrl` |

**Return URL** không phải domain sandbox VNPAY. Giá trị chuẩn trong repo (khớp `PaymentController`):

`http://localhost:8081/payment/vnpay-return`

→ `GET /payment/vnpay-return` xử lý query `vnp_ResponseCode`, `vnp_TxnRef`, rồi redirect về FE.

IPN: `GET /payment/vnpay-ipn`. Trên localhost VNPAY thường **không gọi được** IPN; cần URL **HTTPS public** (ngrok) nếu test IPN thật. Có thể để trống `vnpay.ipnUrl` và dựa vào **return URL** khi demo trên trình duyệt.

Bản mẫu có sẵn sandbox TEST (credential công khai): `src/main/resources/application-local.properties.example`.

## Endpoint thanh toán đơn hàng

| Method | Path | Ghi chú |
|--------|------|---------|
| **POST** | `http://localhost:8081/payment/create` | Body JSON: `{"orderId": <long>}`. Trả `{ "data": { "paymentUrl": "<signed VNPAY URL>" } }`. |
| **GET** | `http://localhost:8081/payment/create` | **405** — không mở bằng trình duyệt; dùng POST. |
| GET | `/payment/vnpay-return` | Redirect từ VNPAY sau thanh toán. |
| GET | `/payment/vnpay-ipn` | Callback IPN (sandbox/production phụ thuộc URL công khai). |

**Lưu ý:** Hầu hết REST trong project dùng prefix **`/api`**. Các route **`/payment/*`** nằm **ngoài** `/api` — FE thường cấu hình `VITE_PAYMENT_API_ORIGIN=http://localhost:8081` (xem [FRONTEND-INTEGRATION.md](FRONTEND-INTEGRATION.md)).

Luồng buyer: `POST /api/buyer/orders/vnpay-checkout` (JWT **BUYER**) trả `paymentUrl` đã ký (redirect thẳng sang VNPAY), không cần GET `/payment/create`. Body JSON: `listingId` có thể là **số hoặc chuỗi** (vd `"5"`) — Spring parse về `Long`.

## Thẻ test sandbox (NCB)

| Trường | Giá trị |
|--------|---------|
| Ngân hàng | NCB |
| Số thẻ | `9704198526191432198` |
| Tên chủ thẻ | NGUYEN VAN A |
| OTP | `123456` |

## Liên kết

- [VNPay Sandbox APIs](https://sandbox.vnpayment.vn/apis/)
- [Pay HTML](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html)
