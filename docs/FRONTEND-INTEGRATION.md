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

## Thanh toán VNPay (nếu FE demo redirect)

Upstream có thể dùng `VITE_PAYMENT_API_ORIGIN` (origin BE **không** có `/api`). Với repo này, origin thường là:

```env
VITE_PAYMENT_API_ORIGIN=http://localhost:8081
```

Chỉ thêm nếu code FE của bạn thực sự đọc biến này.

## Kiểm tra

1. Chạy Spring: [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md).
2. `GET http://localhost:8081/api/health` trả JSON thành công.
3. Chạy FE → thao tác đăng nhập / gọi API → DevTools Network không báo CORS error.
