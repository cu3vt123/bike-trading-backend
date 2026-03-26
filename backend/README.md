# ShopBike Backend (MERN demo)

Backend demo using **Express + MongoDB (Mongoose)**. Cấu trúc theo `03-shoppingCartBE`.

### Tài liệu hướng dẫn (đọc trước khi sửa code)

| Tài liệu | Nội dung |
|----------|----------|
| **[README.md](../README.md)** (root repo) | **Monorepo:** chạy Spring + **Frontend** Vite, biến `VITE_*`, mock/API, lint/build — đọc trước khi chỉ làm FE. |
| **[docs/README.md](../docs/README.md)** | Mục lục toàn bộ tài liệu `docs/` (FE, BE, ERD, UR, …). |
| **[docs/BACKEND-GUIDE.md](../docs/BACKEND-GUIDE.md)** | **Hướng dẫn backend đầy đủ:** cấu trúc thư mục, Mongo, env, auth, thêm API, VNPAY Sandbox, kiểm tra nhanh |
| [docs/USER-REQUIREMENTS.md](../docs/USER-REQUIREMENTS.md) | Yêu cầu người dùng (UR) — đối chiếu chức năng |
| [docs/BACKEND-NODE-TO-SPRING-BOOT.md](../docs/BACKEND-NODE-TO-SPRING-BOOT.md) | Port flow Express → Spring Boot |
| **[docs/BACKEND-LOCAL-SETUP.md](../docs/BACKEND-LOCAL-SETUP.md)** | **Sau clone/pull:** chạy FE + Node hoặc FE + Spring, cổng, `git pull` |
| `docs/ERD-MYSQL.md`, `docs/SCREEN_FLOW_BY_ACTOR.md` | Thiết kế DB MySQL, luồng màn hình |

---

## Sau khi `git clone` hoặc `git pull`

1. **Root repo:** `npm install` (cho Frontend — luôn chạy ở thư mục có `package.json` cha).
2. **Thư mục `backend/`:** `npm install` (cho API Node).
3. Tạo `backend/.env` từ `backend/.env.example` (Windows: `copy .env.example .env`).
4. **Frontend** (root): tạo `.env` từ `.env.example`, đặt:
   - `VITE_API_BASE_URL=http://localhost:8081/api`
   - `VITE_USE_MOCK_API=false`
5. Chạy API: `npm run dev` trong `backend/`. Chạy UI: `npm run dev` ở root.
6. **Không** chạy đồng thời **Node** (folder này) và **Spring Boot** trên **cùng cổng 8081** — tắt một bên hoặc đổi cổng.

Chi tiết: [docs/BACKEND-LOCAL-SETUP.md](../docs/BACKEND-LOCAL-SETUP.md), [README.md](../README.md) (mục **Sau khi clone hoặc pull**).

---

## Quick start (no Mongo install required)

Server uses **MongoDB in-memory** when `MONGODB_URI` is empty.
Demo data is **auto-seeded** on startup (no need for `npm run seed`).
First run may download MongoDB binary ~600MB (`mongodb-memory-server`).

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API runs at `http://localhost:8081/api`.

## VNPAY Sandbox (không dùng VietQR)

- Biến môi trường: `VNP_TMNCODE`, `VNP_HASHSECRET`, `VNP_PAYURL`, `VNP_RETURNURL`, `VNP_IPNURL` (xem `backend/.env.example`, chi tiết `docs/PAYMENTS-VNPAY.md`).
- **Public routes (không prefix `/api`):** `POST /payment/create`, `GET /payment/vnpay-return`, `GET /payment/vnpay-ipn`.
- Checkout buyer: `POST /api/buyer/orders/vnpay-checkout` (JWT) → `paymentUrl` redirect cổng sandbox.

## Run with real MongoDB (optional)

1) Set `MONGODB_URI` in `.env` (e.g. `mongodb://127.0.0.1:27017/shopbike`)
2) `npm run seed` (create demo accounts) then `npm run dev`

## Demo accounts (created by seed)

- Buyer: `buyer@demo.com` / `Password!1`
- Seller: `seller@demo.com` / `Password!1`
- Inspector: `inspector@demo.com` / `Password!1`
- Admin: `admin@demo.com` / `Password!1`

## Endpoints (aligned with Frontend)

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password` (demo returns reset token)
- `POST /api/auth/reset-password`

### Bikes (marketplace)
- `GET /api/bikes` (only `PUBLISHED + APPROVE`)
- `GET /api/bikes/:id`

### Buyer (orders – requires BUYER login)
- `POST /api/buyer/orders/vnpay-checkout` – tạo đơn chờ thanh toán VNPAY (`vnpayPaymentStatus: PENDING_PAYMENT`, `depositPaid: false`) + trả `paymentUrl` (TxnRef `B` + `orderId`). IPN hoặc Return URL cập nhật **PAID** / **FAILED**. Plan DEPOSIT (8%) hoặc FULL.
- `GET /api/buyer/orders` – danh sách đơn của buyer
- `GET /api/buyer/orders/:id` – chi tiết đơn (có `fulfillmentType`, `sellerId` và `listing.seller` cho Success/review)
- `PUT /api/buyer/orders/:id/complete` – hoàn tất khi `status === SHIPPING` → `COMPLETED`, listing → SOLD
- `PUT /api/buyer/orders/:id/cancel` – hủy được cả DIRECT và WAREHOUSE khi RESERVED, IN_TRANSACTION, PENDING_SELLER_SHIP, SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN, RE_INSPECTION, RE_INSPECTION_DONE, SHIPPING.
- `POST /api/buyer/orders/:id/vnpay-pay-balance` – thanh toán số dư (plan DEPOSIT) qua VNPay → redirect → Return về Finalize `?vnpay_balance=1`.
- `POST /api/buyer/orders/:id/review` – tạo review sau giao dịch
- `GET /api/buyer/reviews` – reviews của buyer

### Buyer (payments – requires BUYER login)
- `POST /api/buyer/payments/initiate` – legacy CASH. **Thanh toán chỉ qua VNPAY** (`orders/vnpay-checkout`).

### Packages & subscription (seller)
- `GET /api/packages` — catalog gói Basic/VIP, gợi ý VNPay
- `POST /api/seller/subscription/checkout` — tạo đơn thanh toán gói (demo URL)
- `POST /api/seller/subscription/orders/:orderId/mock-complete` — **dev only**: kích hoạt gói 30 ngày

### Seller
- `GET /api/seller/dashboard`
- `GET /api/seller/ratings` — tổng hợp đánh giá
- `GET /api/seller/orders` — đơn cần xử lý (kho: SELLER_SHIPPED / AT_WAREHOUSE…; direct: PENDING_SELLER_SHIP + DIRECT)
- `PUT /api/seller/orders/:orderId/ship-to-buyer` — chỉ **DIRECT** + **PENDING_SELLER_SHIP** → SHIPPING
- `PUT /api/seller/listings/:id/mark-shipped-to-warehouse` — sau duyệt online: **AWAITING_WAREHOUSE** → **AT_WAREHOUSE_PENDING_VERIFY**
- `GET /api/seller/listings`
- `GET /api/seller/listings/:id`
- `POST /api/seller/listings`
- `PUT /api/seller/listings/:id`
- `PUT /api/seller/listings/:id/submit`
- `PUT /api/seller/listings/:id/publish` — body `{ "requestInspection": false }` lên sàn UNVERIFIED, `true` gửi inspector

### Inspector
- `GET /api/inspector/pending-listings`
- `GET /api/inspector/listings/:id`
- `PUT /api/inspector/listings/:id/approve` — vòng 1 (online): tin → `AWAITING_WAREHOUSE` + `PENDING_WAREHOUSE` (chưa lên sàn)
- `PUT /api/inspector/listings/:id/reject`
- `PUT /api/inspector/listings/:id/need-update`

### Brands (public)
- `GET /api/brands`

### Admin
- `GET /api/admin/listings/pending-warehouse-intake` — tin kiểm định **AT_WAREHOUSE_PENDING_VERIFY** (seller đã báo gửi xe)
- `PUT /api/admin/listings/:id/confirm-warehouse-intake` — xác nhận xe khớp ảnh → **PUBLISHED** + **CERTIFIED** + `warehouseIntakeVerifiedAt`
- `GET /api/admin/orders/warehouse-pending` — SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN (chỉ WAREHOUSE)
- `PUT /api/admin/orders/:id/confirm-warehouse` — AT_WAREHOUSE_PENDING_ADMIN + depositPaid → **SHIPPING** trực tiếp + `expiresAt`. SELLER_SHIPPED → RE_INSPECTION. Từ chối nếu DIRECT.
- `GET /api/admin/orders/re-inspection`
- `PUT /api/admin/orders/:id/re-inspection-done`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/users` — danh sách user
- `PUT /api/admin/users/:id/hide` | `unhide`
- `GET /api/admin/listings`
- `PUT /api/admin/listings/:id/hide` | `unhide`
- `GET /api/admin/reviews` | `PUT /api/admin/reviews/:id`
- `GET/POST/PUT/DELETE /api/admin/brands` — CRUD brand

