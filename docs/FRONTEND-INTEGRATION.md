# Nối frontend Vite/React với Quydu BE

Cấu hình tham chiếu [README quydu12 — Phần B + biến môi trường](https://github.com/cu3vt123/bike-trading-backend/blob/quydu12/README.md). REST dùng tiền tố **`/api`** trên cổng backend (mặc định **8081**).

## Base URL API

Spring Boot repo này phục vụ REST dưới tiền tố **`/api`** (ví dụ `/api/health`, `/api/auth/...`).

Trong project **Vite** (thư mục có `vite.config.*` và `package.json` của FE), tạo hoặc sửa `.env`:

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

Lưu ý: **không** có dấu `/` ở cuối `VITE_API_BASE_URL` nếu code FE nối path kiểu `` `${base}/auth/login` `` (giữ đúng convention team đang dùng).

Sau khi sửa `.env`, **khởi động lại** `npm run dev`.

## CORS

Backend đọc `app.cors.allowed-origins` trong `application.properties`. Mặc định gồm:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Nếu FE chạy origin khác (cổng `3000`, LAN, preview): thêm vào `app.cors.extra-origins` hoặc mở rộng `app.cors.allowed-origins` trong `application-local.properties`.

## Thanh toán VNPay

Các route **`/payment/*`** (`/payment/create`, `/payment/vnpay-return`, …) nằm **ngoài** prefix `/api`. Cấu hình origin backend **không** có suffix `/api`:

```env
VITE_PAYMENT_API_ORIGIN=http://localhost:8081
```

- **`POST /payment/create`** — JSON `{"orderId": <number>}`; phản hồi có URL sang VNPAY.
- **GET `/payment/create`** — **không hỗ trợ** (405); không mở trực tiếp trên trình duyệt như một link thanh toán.
- Checkout qua API buyer: `POST /api/buyer/orders/vnpay-checkout` trả sẵn **`paymentUrl`** (redirect VNPAY đã ký).

Chi tiết: [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md).

## Checkout / buyer API

`POST /api/buyer/orders/vnpay-checkout` (và các route `/api/buyer/**`) yêu cầu JWT của user có role **BUYER** hoặc **ADMIN**. Đăng nhập bằng tài khoản **SELLER** rồi vào checkout sẽ gặp **403 Forbidden** — dùng tài khoản buyer hoặc tạo user BUYER để test.

## Kiểm tra

1. Chạy Spring: [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md).
2. `GET http://localhost:8081/api/health` trả JSON thành công.
3. Chạy FE → thao tác đăng nhập / gọi API → DevTools Network không báo CORS error.
