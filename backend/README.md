# ShopBike Backend (MERN demo)

Backend demo using **Express + MongoDB (Mongoose)**. Cấu trúc theo `03-shoppingCartBE`.

Tài liệu liên quan: `docs/ERD.md`, `docs/SCREEN_FLOW_BY_ACTOR.md`, **`docs/BACKEND-NODE-TO-SPRING-BOOT.md`** (port sang Spring Boot).

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
- `POST /api/buyer/orders` – tạo đơn; body: `listingId`, `plan`, `shippingAddress`, optional `acceptedUnverifiedDisclaimer` (bắt buộc nếu listing UNVERIFIED). Set `fulfillmentType` **WAREHOUSE** (xe đã kiểm định) hoặc **DIRECT** (chưa kiểm định) + `status` tương ứng.
- `GET /api/buyer/orders` – danh sách đơn của buyer
- `GET /api/buyer/orders/:id` – chi tiết đơn (có `fulfillmentType`)
- `PUT /api/buyer/orders/:id/complete` – hoàn tất khi `status === SHIPPING` → `COMPLETED`, listing → SOLD
- `PUT /api/buyer/orders/:id/cancel` – hủy: RESERVED / IN_TRANSACTION / (PENDING_SELLER_SHIP + DIRECT)
- `POST /api/buyer/orders/:id/review` – tạo review sau giao dịch
- `GET /api/buyer/reviews` – reviews của buyer

### Buyer (payments – requires BUYER login)
- `POST /api/buyer/payments/initiate` – validate card/bank details (demo sandbox), returns paymentMethod metadata

### Packages & subscription (seller)
- `GET /api/packages` — catalog gói Basic/VIP, gợi ý Postpay/VNPay
- `POST /api/seller/subscription/checkout` — tạo đơn thanh toán gói (demo URL)
- `POST /api/seller/subscription/orders/:orderId/mock-complete` — **dev only**: kích hoạt gói 30 ngày

### Seller
- `GET /api/seller/dashboard`
- `GET /api/seller/ratings` — tổng hợp đánh giá
- `GET /api/seller/orders` — đơn cần xử lý (kho: SELLER_SHIPPED / AT_WAREHOUSE…; direct: PENDING_SELLER_SHIP + DIRECT)
- `PUT /api/seller/orders/:orderId/ship-to-buyer` — chỉ **DIRECT** + **PENDING_SELLER_SHIP** → SHIPPING
- `GET /api/seller/listings`
- `GET /api/seller/listings/:id`
- `POST /api/seller/listings`
- `PUT /api/seller/listings/:id`
- `PUT /api/seller/listings/:id/submit`
- `PUT /api/seller/listings/:id/publish` — body `{ "requestInspection": false }` lên sàn UNVERIFIED, `true` gửi inspector

### Inspector
- `GET /api/inspector/pending-listings`
- `GET /api/inspector/listings/:id`
- `PUT /api/inspector/listings/:id/approve`
- `PUT /api/inspector/listings/:id/reject`
- `PUT /api/inspector/listings/:id/need-update`

### Brands (public)
- `GET /api/brands`

### Admin
- `GET /api/admin/orders/warehouse-pending` — chỉ đơn luồng **kho** (không DIRECT)
- `PUT /api/admin/orders/:id/confirm-warehouse` — từ chối nếu DIRECT
- `GET /api/admin/orders/re-inspection`
- `PUT /api/admin/orders/:id/re-inspection-done`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/users` — danh sách user
- `PUT /api/admin/users/:id/hide` | `unhide`
- `GET /api/admin/listings`
- `PUT /api/admin/listings/:id/hide` | `unhide`
- `GET /api/admin/reviews` | `PUT /api/admin/reviews/:id`
- `GET/POST/PUT/DELETE /api/admin/brands` — CRUD brand

