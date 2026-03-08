# ShopBike Backend (MERN demo)

Backend demo using **Express + MongoDB (Mongoose)**. Cấu trúc theo `03-shoppingCartBE`.

**Tài liệu backend** (cấu trúc, hướng dẫn demo, port sang Spring Boot) nằm trong **một folder docs** ở root dự án: xem `docs/backend/` (từ thư mục gốc frontend). Chi tiết: `docs/backend/STRUCTURE.md`.

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
- `POST /api/buyer/orders` – create order (body: listingId, plan, shippingAddress), listing → RESERVED
- `GET /api/buyer/orders` – my orders list
- `GET /api/buyer/orders/:id` – order details
- `PUT /api/buyer/orders/:id/complete` – complete order (RESERVED → COMPLETED), listing → SOLD
- `PUT /api/buyer/orders/:id/cancel` – cancel reservation (RESERVED/IN_TRANSACTION → CANCELLED), listing → PUBLISHED

### Buyer (payments – requires BUYER login)
- `POST /api/buyer/payments/initiate` – validate card/bank details (demo sandbox), returns paymentMethod metadata

### Seller
- `GET /api/seller/dashboard`
- `GET /api/seller/listings`
- `GET /api/seller/listings/:id`
- `POST /api/seller/listings`
- `PUT /api/seller/listings/:id`
- `PUT /api/seller/listings/:id/submit`

### Inspector
- `GET /api/inspector/pending-listings`
- `GET /api/inspector/listings/:id`
- `PUT /api/inspector/listings/:id/approve`
- `PUT /api/inspector/listings/:id/reject`
- `PUT /api/inspector/listings/:id/need-update`

