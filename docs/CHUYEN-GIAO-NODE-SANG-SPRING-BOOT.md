# Hướng dẫn chuyển giao công nghệ: Node.js → Java Spring Boot – ShopBike

> **Mục đích:** Tài liệu chi tiết để team Backend Java (hoặc AI) hiểu toàn bộ backend Node.js hiện tại và **implement lại bằng Spring Boot** tương thích với Frontend **mà không cần sửa code FE**.

---

## Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-an)
2. [Cấu trúc backend Node hiện tại](#2-cấu-trúc-backend-node-hiện-tại)
3. [Data models (MongoDB → SQL)](#3-data-models-mongodb--sql)
4. [API endpoints đầy đủ](#4-api-endpoints-đầy-đủ)
5. [Auth & JWT – quy tắc quan trọng](#5-auth--jwt--quy-tắc-quan-trọng)
6. [Luồng Order & Shipping](#6-luồng-order--shipping)
7. [Admin – Ẩn user/listing](#7-admin--ẩn-userlisting)
8. [Checklist chuyển giao Spring Boot](#8-checklist-chuyển-giao-spring-boot)
9. [Tài liệu tham khảo](#9-tài-liệu-tham-khảo)

---

## 1. Tổng quan dự án

| Thông tin | Giá trị |
|-----------|---------|
| **Tên dự án** | ShopBike – Sàn mua bán xe đạp thể thao đã kiểm định |
| **Base URL API** | `http://localhost:8081/api` |
| **Frontend** | React + Vite, chạy tại `http://localhost:5173` |
| **Backend hiện tại** | Node.js, Express, MongoDB (Mongoose), JWT |
| **Thư mục backend** | `backend/` (từ root dự án) |

### Luồng chính

- **Auth:** Login (không chọn role – role lấy từ tài khoản), Signup, Me, Forgot/Reset password
- **Bikes:** Marketplace công khai – danh sách + chi tiết xe (chỉ PUBLISHED + APPROVE, không ẩn)
- **Buyer:** Orders, Payments, Complete order (chỉ khi SHIPPING)
- **Seller:** CRUD listing, Submit kiểm định, Dashboard, Orders
- **Inspector:** Duyệt/Từ chối/Cần cập nhật listing
- **Admin:** Quản lý user/listing (ẩn/hiện), xác nhận kho, re-inspection, thống kê

---

## 2. Cấu trúc backend Node hiện tại

```
backend/
├── src/
│   ├── config/          # db.js – kết nối MongoDB
│   ├── constants/       # messages.js, httpStatus.js
│   ├── controllers/     # auth, bikes, buyer, seller, inspector, admin, payment, review
│   ├── middleware/      # auth.js – JWT, kiểm tra isHidden
│   ├── middlewares/     # auth.middlewares.js, error.middlewares.js
│   ├── models/          # User, Listing, Order, Review, Errors
│   ├── routes/          # auth, bikes, buyer, seller, inspector, admin
│   ├── utils/           # handler.js (wrapAsync), http.js
│   ├── seed.js          # Demo data (buyer@demo.com / Password!1)
│   └── server.js        # Express app, mount routes dưới /api
└── package.json
```

### Routes mount (server.js)

- `/api/auth` → authRoutes
- `/api/bikes` → bikesRoutes
- `/api/buyer` → buyerRoutes
- `/api/seller` → sellerRoutes
- `/api/inspector` → inspectorRoutes
- `/api/admin` → adminRoutes

---

## 3. Data models (MongoDB → SQL)

### 3.1 User

**File Node:** `backend/src/models/User.js`

| Field | Type | Ghi chú |
|-------|------|---------|
| email | string | required, unique |
| passwordHash | string | bcrypt hash |
| role | enum | BUYER, SELLER, INSPECTOR, ADMIN |
| displayName | string | default "" |
| **isHidden** | boolean | default false – **user ẩn không đăng nhập được** |
| hiddenAt | Date | null khi chưa ẩn |
| resetPasswordToken | string | null |
| resetPasswordExpiresAt | Date | null |
| createdAt, updatedAt | Date | timestamps |

**Quy tắc:** Khi `isHidden = true`:
- Login trả 401 `"Account is hidden"`
- Middleware auth từ chối mọi request dùng token cũ

### 3.2 Listing (tin đăng xe)

**File Node:** `backend/src/models/Listing.js`

| Field | Type | Ghi chú |
|-------|------|---------|
| title, brand, model | string | |
| year | number | null |
| frameSize | string | |
| condition | enum | NEW, LIKE_NEW, MINT_USED, GOOD_USED, FAIR_USED, null |
| price, msrp | number | msrp có thể null |
| currency | string | default "VND", enum USD, VND |
| location | string | |
| thumbnailUrl, imageUrls | string, string[] | |
| state | enum | DRAFT, PENDING_INSPECTION, NEED_UPDATE, PUBLISHED, RESERVED, IN_TRANSACTION, SOLD, REJECTED |
| inspectionResult | enum | APPROVE, REJECT, NEED_UPDATE, null |
| inspectionScore | number | 0..5, null |
| **inspectionReport** | object | `{ frameIntegrity: { score, label }, drivetrainHealth: {...}, brakingSystem: {...} }` |
| inspectionSummary | string | |
| inspectionNeedUpdateReason | string | |
| specs | array | `[{ label, value }]` |
| description | string | |
| seller | object | `{ id, name, email }` – embedded |
| **isHidden** | boolean | default false – listing ẩn không hiện marketplace |
| hiddenAt | Date | null |
| createdAt, updatedAt | Date | |

### 3.3 Order (đơn đặt xe)

**File Node:** `backend/src/models/Order.js`

| Field | Type | Ghi chú |
|-------|------|---------|
| buyerId | ObjectId | ref User |
| listingId | ObjectId | ref Listing |
| status | enum | Xem bảng dưới |
| plan | enum | DEPOSIT, FULL |
| totalPrice, depositAmount | number | |
| depositPaid | boolean | |
| shippingAddress | object | `{ street, city, postalCode }` |
| shippedAt | Date | null |
| warehouseConfirmedAt | Date | null |
| reInspectionDoneAt | Date | null |
| expiresAt | Date | null – countdown 24h khi SHIPPING |
| listing | mixed | snapshot (optional) |
| createdAt, updatedAt | Date | |

**Order status (đầy đủ):**

| Status | Mô tả |
|--------|-------|
| PENDING | Chờ xử lý |
| RESERVED | Đã đặt cọc, chờ seller gửi xe |
| PENDING_SELLER_SHIP | Chờ seller gửi |
| SELLER_SHIPPED | Seller đã gửi |
| AT_WAREHOUSE_PENDING_ADMIN | Xe tới kho, chờ admin xác nhận |
| RE_INSPECTION | Đang kiểm định lại |
| RE_INSPECTION_DONE | Đã kiểm định xong |
| SHIPPING | Đang giao – **chỉ lúc này buyer mới complete được** |
| IN_TRANSACTION | Đang giao dịch |
| COMPLETED | Hoàn thành |
| CANCELLED | Đã hủy |
| REFUNDED | Đã hoàn tiền |

### 3.4 Review (đánh giá)

**File Node:** `backend/src/models/Review.js`

| Field | Type |
|-------|------|
| orderId | ObjectId |
| listingId | ObjectId |
| sellerId, buyerId | ObjectId |
| rating | number |
| comment | string |
| status | string |

---

## 4. API endpoints đầy đủ

### 4.1 Auth

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| POST | /api/auth/login | ❌ | **Không gửi role** – role lấy từ tài khoản |
| POST | /api/auth/signup | ❌ | role: BUYER hoặc SELLER |
| GET | /api/auth/me | ✅ | Trả { id, email, displayName, role } |
| POST | /api/auth/forgot-password | ❌ | body: { email } |
| POST | /api/auth/reset-password | ❌ | body: { token, newPassword } |

**Login request (quan trọng – đã đổi):**

```json
{
  "emailOrUsername": "buyer@demo.com",
  "password": "Password!1"
}
```

**Không còn field `role`** – FE không gửi role; backend trả role từ user trong DB.

**Login response 200:**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": null,
  "role": "BUYER"
}
```

**Login 401:** `{ "message": "Invalid credentials" }` hoặc `{ "message": "Account is hidden" }`

### 4.2 Bikes (public)

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| GET | /api/bikes | ❌ | Chỉ PUBLISHED + APPROVE + isHidden ≠ true |
| GET | /api/bikes/:id | ❌ | 404 nếu not found hoặc isHidden |

### 4.3 Buyer

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| POST | /api/buyer/orders | BUYER | Tạo order |
| GET | /api/buyer/orders | BUYER | Danh sách đơn |
| GET | /api/buyer/orders/:id | BUYER | Chi tiết đơn |
| PUT | /api/buyer/orders/:id/complete | BUYER | **Chỉ khi status = SHIPPING** |
| PUT | /api/buyer/orders/:id/cancel | BUYER | Hủy đơn |
| POST | /api/buyer/payments/initiate | BUYER | Initiate payment |

### 4.4 Seller

| Method | Path | Auth |
|--------|------|------|
| GET | /api/seller/dashboard | SELLER |
| GET | /api/seller/listings | SELLER |
| GET | /api/seller/listings/:id | SELLER |
| POST | /api/seller/listings | SELLER |
| PUT | /api/seller/listings/:id | SELLER |
| PUT | /api/seller/listings/:id/submit | SELLER |
| GET | /api/seller/orders | SELLER |

### 4.5 Inspector

| Method | Path | Auth |
|--------|------|------|
| GET | /api/inspector/pending-listings | INSPECTOR, ADMIN |
| GET | /api/inspector/listings/:id | INSPECTOR, ADMIN |
| PUT | /api/inspector/listings/:id/approve | INSPECTOR, ADMIN |
| PUT | /api/inspector/listings/:id/reject | INSPECTOR, ADMIN |
| PUT | /api/inspector/listings/:id/need-update | INSPECTOR, ADMIN |

**Approve:** Lưu `inspectionReport` (frameIntegrity, drivetrainHealth, brakingSystem) nếu FE gửi.

### 4.6 Admin

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| GET | /api/admin/orders/warehouse-pending | ADMIN | Đơn chờ xác nhận kho |
| PUT | /api/admin/orders/:id/confirm-warehouse | ADMIN | Xác nhận xe tới kho → RE_INSPECTION |
| GET | /api/admin/orders/re-inspection | ADMIN, INSPECTOR | Đơn đang kiểm định lại |
| PUT | /api/admin/orders/:id/re-inspection-done | ADMIN, INSPECTOR | Xong kiểm định → SHIPPING, set expiresAt +24h |
| GET | /api/admin/dashboard/stats | ADMIN | Thống kê |
| GET | /api/admin/users | ADMIN | Danh sách user (BUYER, SELLER) |
| PUT | /api/admin/users/:id/hide | ADMIN | Ẩn user – user không đăng nhập được |
| PUT | /api/admin/users/:id/unhide | ADMIN | Hiện lại user |
| GET | /api/admin/listings | ADMIN | Danh sách listing |
| PUT | /api/admin/listings/:id/hide | ADMIN | Ẩn listing |
| PUT | /api/admin/listings/:id/unhide | ADMIN | Hiện lại listing |
| GET | /api/admin/reviews | ADMIN | Danh sách review |
| PUT | /api/admin/reviews/:id | ADMIN | Cập nhật review |

---

## 5. Auth & JWT – quy tắc quan trọng

### 5.1 Header

```
Authorization: Bearer <accessToken>
```

### 5.2 Middleware auth (Node)

1. Đọc token từ header
2. Verify JWT
3. Load user từ DB
4. **Nếu user.isHidden → 401 "Invalid token"**
5. Gắn `req.user = { id, role, email, ... }`

### 5.3 Role-based access

| Path prefix | Role cần |
|-------------|---------|
| /api/auth/me | Bất kỳ đã login |
| /api/buyer/* | BUYER |
| /api/seller/* | SELLER |
| /api/inspector/* | INSPECTOR hoặc ADMIN |
| /api/admin/* | ADMIN (một số endpoint cho cả INSPECTOR) |

### 5.4 Spring Security gợi ý

- `OncePerRequestFilter` parse JWT, set `SecurityContextHolder`
- Khi load user → kiểm tra `isHidden` → nếu true thì reject
- Cấu hình: `/api/auth/**`, `/api/bikes` GET cho phép anonymous

---

## 6. Luồng Order & Shipping

```
RESERVED (đã đặt cọc)
  → SELLER_SHIPPED (seller gửi xe)
  → AT_WAREHOUSE_PENDING_ADMIN (xe tới kho)
  → Admin confirm → RE_INSPECTION
  → Inspector xong → SHIPPING (set expiresAt +24h)
  → Buyer complete → COMPLETED
```

**Quy tắc Complete order:** Chỉ cho phép khi `status === "SHIPPING"`.

---

## 7. Admin – Ẩn user/listing

### User bị ẩn (isHidden = true)

- **Login:** Trả 401 `"Account is hidden"`
- **Token cũ:** Mọi request dùng token đó → 401 "Invalid token"
- **Unhide:** Admin gọi `PUT /api/admin/users/:id/unhide` → user đăng nhập lại được

### Listing bị ẩn

- Không hiện trong `GET /api/bikes`
- `GET /api/bikes/:id` trả 404 nếu listing ẩn
- Buyer không thể checkout listing ẩn

---

## 8. Checklist chuyển giao Spring Boot

### Bước 1: Đọc tài liệu

- [ ] `docs/HUONG-DAN-BACKEND.md` – contract FE–BE
- [ ] `docs/backend/PORTING-NODE-TO-SPRING-BOOT.md` – mapping model
- [ ] `docs/backend/SPRING-BOOT-SKELETON.md` – skeleton project
- [ ] File này – tổng hợp đầy đủ

### Bước 2: Thiết kế DB (PostgreSQL/MySQL/H2)

- [ ] Bảng `users` với `is_hidden`, `hidden_at`
- [ ] Bảng `listings` với `is_hidden`, `inspection_report` (JSON hoặc bảng con)
- [ ] Bảng `orders` với đầy đủ status
- [ ] Bảng `reviews`

### Bước 3: Implement API

- [ ] Auth: Login **không nhận role**, trả role từ DB
- [ ] Auth: Reject user isHidden khi login
- [ ] Auth: Reject token của user isHidden trong middleware
- [ ] Bikes: Lọc isHidden
- [ ] Buyer complete: Chỉ khi status = SHIPPING
- [ ] Admin: hide/unhide user, hide/unhide listing
- [ ] Inspector approve: Lưu inspectionReport

### Bước 4: Cấu hình

- [ ] `server.port=8081`, `context-path=/api` (hoặc prefix)
- [ ] CORS cho `http://localhost:5173`
- [ ] JWT secret, expiry giống hoặc tương thích

### Bước 5: Test với Frontend

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

```bash
npm run dev
```

- [ ] Login (buyer@demo.com / Password!1)
- [ ] Danh sách xe, chi tiết xe
- [ ] Flow Seller, Inspector, Admin
- [ ] Complete order khi SHIPPING

---

## 9. Tài liệu tham khảo

| File | Nội dung |
|------|----------|
| `docs/HUONG-DAN-BACKEND.md` | Contract API chi tiết (request/response) |
| `docs/backend/PORTING-NODE-TO-SPRING-BOOT.md` | Map model + API |
| `docs/backend/SPRING-BOOT-SKELETON.md` | Skeleton Spring Boot |
| `docs/backend/DEMO-BACKEND-GUIDE.md` | Chạy backend Node demo |
| `docs/ERD-SPEC.md` | Đặc tả ERD |
| `docs/KIEM-KE-HE-THONG.md` | Kiểm kê hệ thống |
| `backend/README.md` | Cách chạy backend Node |

---

*Tài liệu cập nhật: 2025-02 – Nhánh ui-ux+shipping. Dành cho team BE Java và AI chuyển giao công nghệ.*
