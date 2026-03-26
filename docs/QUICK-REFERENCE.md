# Tham chiếu nhanh — ShopBike

> Tài liệu tra cứu nhanh: thuật ngữ, API, routes, biến môi trường, vị trí file. Dùng khi onboard, port BE, hoặc tra cứu thông tin.

**Nguồn chi tiết:** [README.md](README.md) | [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | [ERD-SPEC.md](ERD-SPEC.md)

**Monorepo BE2:** `src/` = FE (Vite) + `src/main/java` (Spring). Chạy BE Java: [README.md](../README.md) phần A. **Chuyển giao Node→Spring:** [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) §0.

---

## 1. Thuật ngữ chính

| Thuật ngữ | Ý nghĩa |
|-----------|---------|
| **CERTIFIED** | Listing đã kiểm định (inspector APPROVE) — dùng luồng kho |
| **UNVERIFIED** | Listing chưa kiểm định — dùng luồng giao trực tiếp |
| **fulfillmentType** | `WAREHOUSE` (xe qua kho) hoặc `DIRECT` (seller giao thẳng) |
| **plan** | `DEPOSIT` (cọc 8% + số dư) hoặc `FULL` (thanh toán toàn bộ) |
| **balancePaid** | Phần còn lại đã thanh toán VNPay (plan DEPOSIT) |
| **order_snapshot** | Snapshot tin đăng lúc mua — dùng Finalize/Success khi tin SOLD |
| **DEPOSIT 8%** | Cọc = 8% giá trị đơn, đồng bộ FE–BE |

---

## 2. Roles & Routes FE

| Role | Routes được phép | Routes bị chặn (→ 403) |
|------|------------------|------------------------|
| Guest | /, /bikes/:id, /support, /wishlist, /login, /register, /forgot-password, /reset-password | /profile, /checkout, /seller, /inspector, /admin |
| BUYER | + /checkout/:id, /transaction/:id, /finalize/:id, /success/:id, /profile, /notifications | /seller, /admin, /inspector |
| SELLER | + /seller, /seller/stats, /seller/packages, /seller/listings/new, /seller/listings/:id/edit | /checkout, /admin, /inspector |
| INSPECTOR | + /inspector | /checkout, /seller, /admin |
| ADMIN | + /admin, /inspector | /checkout, /seller |

---

## 3. API Endpoints (base: `/api`)

### Auth (public)

| Method | Path | Mô tả |
|--------|------|-------|
| POST | /auth/login | `{ emailOrUsername, password }` → `{ accessToken, refreshToken?, user: { id, role, ... } }` |
| POST | /auth/signup | `{ username, email, password, role: BUYER|SELLER }` |
| GET | /auth/me | Header `Authorization: Bearer` → thông tin user |

### Bikes (public)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | /bikes | Danh sách listing PUBLISHED |
| GET | /bikes/:id | Chi tiết listing (404 khi RESERVED/SOLD) |

### Buyer (role BUYER)

| Method | Path | Mô tả |
|--------|------|-------|
| POST | /buyer/orders/vnpay-checkout | Tạo đơn + `paymentUrl` VNPay. Body: `listingId`, `plan`, `shippingAddress`, `acceptedUnverifiedDisclaimer` (bắt buộc `true` nếu tin chưa CERTIFIED). **`fulfillmentType` do BE gán** — FE không gửi |
| GET | /buyer/orders | Đơn của buyer |
| GET | /buyer/orders/:id | Chi tiết đơn (trả `sellerId`, `listing.seller` cho Success) |
| PUT | /buyer/orders/:id/complete | Hoàn tất (chỉ khi status SHIPPING) |
| PUT | /buyer/orders/:id/cancel | Hủy đơn |
| POST | /buyer/orders/:id/vnpay-pay-balance | Thanh toán số dư → `paymentUrl` |
| POST | /buyer/orders/:id/vnpay-resume | Tiếp tục thanh toán cọc (khi PENDING_PAYMENT) |
| POST | /buyer/orders/:id/review | Tạo đánh giá |

### Seller (role SELLER)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | /seller/dashboard | Stats + listings |
| GET | /seller/orders | Đơn của seller (filter kho/direct) |
| PUT | /seller/orders/:id/ship-to-buyer | Chỉ DIRECT + PENDING_SELLER_SHIP |
| GET | /seller/ratings | Aggregate reviews |
| POST | /seller/listings/upload-images | Multipart field `images` (≤10, 5MB/file) → `{ data: { urls } }` — URL `/uploads/listings/...` |
| CRUD | /seller/listings | Tạo/sửa tin (`imageUrls` sau khi upload) |
| PUT | /seller/listings/:id/mark-shipped-to-warehouse | Xe gửi kho |
| POST | /seller/subscription/checkout | Mua gói `{ plan, provider }` |

### Inspector (role INSPECTOR hoặc ADMIN)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | /inspector/pending-listings | Tin chờ kiểm định |
| GET | /inspector/listings/:id | Chi tiết tin theo id (mọi trạng thái) — FE trang `/bikes/:id` khi duyệt tin chưa lên sàn; **Spring BE2** cần endpoint này (không chỉ Node). |
| PUT | /inspector/listings/:id/approve | Duyệt + điểm |
| PUT | /inspector/listings/:id/reject | Từ chối |
| PUT | /inspector/listings/:id/need-update | Yêu cầu cập nhật + reason |

**Spring Security:** toàn bộ `/api/inspector/**` → `hasAnyRole(INSPECTOR, ADMIN)`.

### Admin (role ADMIN)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | /admin/orders/warehouse-pending | Chỉ fulfillmentType WAREHOUSE |
| PUT | /admin/orders/:id/confirm-warehouse | Xác nhận xe tới kho |
| GET | /admin/orders/re-inspection | Đơn cần kiểm định lại |
| PUT | /admin/orders/:id/re-inspection-done | → SHIPPING |
| CRUD | /admin/users, /admin/listings, /admin/brands, /admin/reviews | Quản trị |

---

## 4. Định dạng response chuẩn

**Thành công (nhiều endpoint):**
```json
{ "data": { ... } }
```

**Lỗi:**
```json
{ "message": "Mô tả lỗi" }
```
Status: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404, 500.

**Header auth:** `Authorization: Bearer <accessToken>`

---

## 5. Biến môi trường

### Backend (`backend/.env`)

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| PORT | Cổng HTTP | 8081 |
| MONGODB_URI | Chuỗi Mongo (rỗng = in-memory) | mongodb://localhost:27017/shopbike |
| JWT_SECRET | Ký JWT | chuỗi bí mật |
| JWT_EXPIRES_IN | Hạn token | 7d |
| CLIENT_ORIGIN | CORS | http://localhost:5173 |
| VNP_TMNCODE | VNPay merchant | từ sandbox |
| VNP_HASHSECRET | Hash secret | từ sandbox |
| VNP_RETURNURL | Return URL (HTTPS) | https://your-ngrok/payment/vnpay-return |
| VNP_IPNURL | IPN URL (HTTPS) | https://your-ngrok/payment/vnpay-ipn |
| PUBLIC_ORIGIN | Base URL công khai BE (link ảnh upload trả về) | http://localhost:8081 |
| CORS_EXTRA_ORIGINS | Thêm origin CORS (cách nhau dấu phẩy) | (tùy chọn) |

### Frontend (`frontend/.env`)

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| VITE_API_BASE_URL | Base URL API | http://localhost:8081/api |
| VITE_USE_MOCK_API | Dùng mock (true/false) | false |
| VITE_API_TIMEOUT | Timeout ms | 15000 |

---

## 6. Vị trí file chính

### Backend (Node)

| Mục đích | Đường dẫn |
|----------|-----------|
| Entry | backend/src/server.js |
| Routes | backend/src/routes/*.js |
| Controllers | backend/src/controllers/*.js |
| Models | backend/src/models/*.js |
| Auth middleware | backend/src/middleware/auth.js |

### Frontend

| Mục đích | Đường dẫn |
|----------|-----------|
| Router | src/app/router.tsx |
| API config & paths | src/lib/apiConfig.ts |
| HTTP client | src/lib/apiClient.ts |
| API wrappers | src/apis/*.ts |
| Luồng FE → API (tài liệu) | docs/FRONTEND-API-FLOWS.md |
| Services | src/services/buyerService.ts, sellerService.ts, reviewService.ts |
| Stores | src/stores/useAuthStore.ts, useWishlistStore.ts |
| Types | src/types/order.ts, shopbike.ts, auth.ts |

### Docs

| Mục đích | Đường dẫn |
|----------|-----------|
| Schema SQL | docs/sql/shopbike_mysql_schema.sql |
| ERD Mermaid | docs/sql/shopbike_erd.mmd |
| Đặc tả schema | docs/ERD-SPEC.md |
| Port Spring Boot | docs/BACKEND-NODE-TO-SPRING-BOOT.md |

---

## 7. Luồng chính → API gọi

| Luồng | Màn hình | API chính |
|-------|----------|-----------|
| Mua xe | Checkout | POST /buyer/orders/vnpay-checkout (+ disclaimer nếu UNVERIFIED) |
| Ảnh tin seller | Seller listing editor | POST /seller/listings/upload-images → rồi POST/PUT /seller/listings |
| Theo dõi đơn | Transaction | GET /buyer/orders/:id |
| Hoàn tất | Finalize | PUT /buyer/orders/:id/complete |
| Thanh toán số dư | Finalize | POST /buyer/orders/:id/vnpay-pay-balance |
| Đánh giá | Success | POST /buyer/orders/:id/review |
| Seller giao direct | Seller Dashboard | PUT /seller/orders/:id/ship-to-buyer |
| Admin xác nhận kho | Admin Warehouse | PUT /admin/orders/:id/confirm-warehouse |
| Kiểm định | Inspector | PUT /inspector/listings/:id/approve (reject, need-update) |

---

## 8. Order status (tóm tắt)

| Status | Ý nghĩa |
|--------|---------|
| RESERVED | Đã đặt cọc, chờ xử lý |
| PENDING_SELLER_SHIP | Chờ seller giao (direct) hoặc gửi kho |
| SELLER_SHIPPED | Seller đã gửi xe tới kho |
| AT_WAREHOUSE_PENDING_ADMIN | Xe tại kho, chờ admin xác nhận |
| RE_INSPECTION | Kiểm định lại tại kho |
| RE_INSPECTION_DONE | Đã kiểm định lại, chờ giao |
| SHIPPING | Đang giao, countdown 24h |
| COMPLETED | Hoàn tất |
| CANCELLED, REFUNDED | Hủy / Hoàn tiền |

---

## 9. Chọn tài liệu theo nhiệm vụ

| Nhiệm vụ | Tài liệu |
|----------|----------|
| Kiểm tra khớp API BE–FE (theo khu vực) | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) |
| Kiểm tra khớp API BE–FE (theo trang/actor) | [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) |
| Chạy backend Node | [BACKEND-GUIDE.md](BACKEND-GUIDE.md) |
| Port sang Spring Boot | [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) |
| Tạo/sửa schema MySQL | [ERD-SPEC.md](ERD-SPEC.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) |
| Hiểu business rules | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) |
| Luồng màn hình | [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md) |
| VNPay | [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) |
| Cấu trúc FE | [STRUCTURE.md](STRUCTURE.md) |
| Luồng gọi API trên FE | [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) |

---

*Đồng bộ với codebase và docs. Cập nhật: 2026-03-26 — GET `/inspector/listings/:id` (Spring), ProductDetail inspector fallback; trước: 2026-03-25 — FRONTEND-API-FLOWS, vnpay-checkout, upload ảnh.*
