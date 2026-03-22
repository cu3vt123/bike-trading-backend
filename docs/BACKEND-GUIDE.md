# Hướng dẫn Backend — ShopBike (Node.js + Express)

Tài liệu dành cho dev/backend port (Spring Boot xem thêm [BACKEND-NODE-TO-SPRING-BOOT.md](./BACKEND-NODE-TO-SPRING-BOOT.md)).

---

## 1. Vị trí mã nguồn & chạy nhanh

| Mục | Đường dẫn |
|-----|-----------|
| Thư mục backend | `backend/` (cùng repo với frontend) |
| Entry | `backend/src/server.js` |
| Cấu hình môi trường | `backend/.env` (tạo từ `backend/.env.example`) |

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

- API: **`http://localhost:8081/api`** (đổi `PORT` trong `.env`).
- Frontend trỏ tới API: biến **`VITE_API_BASE_URL`** (vd. `http://localhost:8081/api`) — xem `frontend/.env.example` nếu có.

---

## 2. Hai nguồn dữ liệu (quan trọng)

| Nguồn | Công nghệ | Phạm vi |
|-------|-----------|---------|
| **MongoDB** | Mongoose | User, Listing, Order (mua xe), Review, Brand, PackageOrder (gói đăng tin) |
| **SQLite** | `better-sqlite3` | Chỉ **module VietQR**: `orders`, `payments`, `payment_logs` (đồ án) |

- Mongo: `MONGODB_URI` rỗng → dùng **in-memory** + seed tự động (lần đầu có thể tải binary ~600MB).
- VietQR: luôn khởi tạo file **`data/vietqr.sqlite`** (hoặc `VIETQR_SQLITE_PATH`). **Không** trộn bảng VietQR vào Mongo trong code hiện tại.

---

## 3. Cấu trúc thư mục `backend/src/` (theo lớp)

```
src/
├── server.js              # Khởi tạo app, middleware, mount routes, listen
├── config/db.js           # Kết nối MongoDB
├── seed.js                # Dữ liệu demo (user, listing, …)
├── routes/*.js            # Khai báo path + HTTP method → controller
├── controllers/*.js       # HTTP: parse body/query, gọi service/model, trả JSON
├── models/*.js            # Mongoose schemas
├── services/*.js          # Logic nghiệp vụ tái sử dụng (vd. subscription)
├── middleware/ auth.js    # JWT verify
├── middlewares/           # requireAuth, requireRole, error handler
├── utils/http.js          # ok(), created(), badRequest(), …
├── utils/handler.js       # wrapAsync (bắt lỗi async)
├── constants/             # HTTP status, subscription plans, …
└── vietqr/                # Module tách lớp: config, db, repositories, services, controllers, routes
```

**Quy ước thêm API mới (Mongo):**

1. Thêm/ sửa **Model** nếu cần field mới.  
2. Viết logic trong **Controller** (hoặc tách **Service** nếu phức tạp).  
3. Đăng ký route trong **`routes/*`**, mount trong **`server.js`** nếu là file route mới.  
4. Bảo vệ route: `requireAuth` + `requireRole([...])` như các file mẫu.  
5. Validate input: khuyến nghị **Zod** (`safeParse`) như `buyerController`, `paymentController`.

**Chuẩn response JSON (nhiều endpoint):**

- Thành công: `{ data: ... }` (dùng `ok()`, `created()` trong `utils/http.js`).
- Lỗi: `{ message: "..." }` với status 4xx/5xx.

---

## 4. Biến môi trường chính (`backend/.env`)

| Biến | Mô tả |
|------|--------|
| `PORT` | Cổng HTTP (mặc định 8081) |
| `MONGODB_URI` | Chuỗi Mongo; để trống = in-memory demo |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Ký JWT |
| `CLIENT_ORIGIN` | CORS (vd. `http://localhost:5173`) |
| `VIETQR_*` | Xem `backend/.env.example` và [VIETQR-MODULE.md](./VIETQR-MODULE.md) |

**Không** commit file `.env` lên git.

---

## 5. Xác thực & phân quyền

- **Login** → nhận `accessToken` (JWT).  
- Header: `Authorization: Bearer <token>`.  
- Middleware: `requireAuth` → `req.user` có `id`, `role`.  
- `requireRole(["BUYER", "ADMIN"])` — chỉ role được liệt kê mới vào được route.

VietQR: buyer dùng đơn có `buyer_ref` trùng `req.user.id`; admin xem toàn bộ (xem `vietqr/controllers`).

---

## 6. Module thanh toán & tích hợp

### 6.1 Thanh toán buyer (VNPAY only)

- `POST /api/buyer/orders/vnpay-checkout` — tạo đơn + redirect VNPAY (DEPOSIT 8% hoặc FULL).  
- IPN / Return URL cập nhật `depositPaid`, `vnpayPaymentStatus`.  
- `POST /api/buyer/payments/initiate` — legacy CASH (deprecated). Không dùng cho mua xe.

### 6.2 Gói đăng tin seller (`packageController.js`)

- `GET /api/packages` — catalog + provider VNPay.  
- `POST /api/seller/subscription/checkout` — body `{ plan, provider: "VNPAY" }`.  
- `mock-complete` chỉ dùng **dev/demo**.

Chi tiết: [PAYMENTS-VNPAY.md](./PAYMENTS-VNPAY.md).

### 6.3 VietQR (SQLite)

- Prefix: **`/api/vietqr`**  
- Luồng: tạo đơn → tạo payment + gọi API VietQR → log → admin simulate (demo).  
- Chi tiết kiến trúc: [VIETQR-MODULE.md](./VIETQR-MODULE.md).

---

## 7. Đơn hàng mua xe & `fulfillmentType`

- **`WAREHOUSE`**: xe đã kiểm định (CERTIFIED). Xe tại kho (`warehouseIntakeVerifiedAt`) → `AT_WAREHOUSE_PENDING_ADMIN` → admin confirm → `SHIPPING`. Buyer không hủy được.  
- **`DIRECT`**: xe chưa kiểm định — seller giao thẳng, không qua kho. Buyer có thể hủy.

Được set khi `POST /api/buyer/orders/vnpay-checkout`. Thanh toán **chỉ VNPAY** (bỏ CASH/COD). Port Spring Boot: xem [BACKEND-NODE-TO-SPRING-BOOT.md](./BACKEND-NODE-TO-SPRING-BOOT.md).

---

## 8. Xử lý lỗi

- `middlewares/error.middlewares.js` — `defaultErrorHandler` cuối chuỗi middleware.  
- Controller nên `return badRequest(res, msg)` thay vì `throw` nếu là lỗi nghiệp vụ đã biết.  
- Route async: bọc **`wrapAsync(handler)`** trong `routes/*.js` để lỗi không làm treo request.

---

## 9. SQL tham khảo (MySQL)

- VietQR: `docs/sql/vietqr_mysql.sql`  
- ERD tổng quan: `docs/ERD.md`

---

## 10. Kiểm tra nhanh sau khi sửa code

```bash
cd backend && npm run dev
curl -s http://localhost:8081/api/health
```

Gọi API có auth:

```bash
curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@demo.com","password":"Password!1"}'
```

Dùng `accessToken` trả về cho các request `/api/buyer/*`, `/api/vietqr/*`, …

---

## 11. Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [USER-REQUIREMENTS.md](./USER-REQUIREMENTS.md) | Yêu cầu người dùng / stakeholder |
| [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) | Business rules + luồng FE |
| [VIETQR-MODULE.md](./VIETQR-MODULE.md) | VietQR chi tiết |
| [PAYMENTS-VNPAY.md](./PAYMENTS-VNPAY.md) | VNPay gói & initiate |
| [business-rules/README.md](./business-rules/README.md) | Sheet Excel Business Rules |

---

*Tài liệu này mô tả trạng thái codebase tại thời điểm cập nhật; khi refactor, nên chỉnh lại mục 3 và 6 cho khớp.*
