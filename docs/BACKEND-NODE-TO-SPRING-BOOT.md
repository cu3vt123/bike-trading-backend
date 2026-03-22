# Hướng dẫn Backend: chuyển đổi flow từ Node.js (Express) sang Java Spring Boot

> Tài liệu cho team Backend khi port API hiện tại (`backend/` – Express + Mongoose) sang **Spring Boot 3** (REST, JWT, persistence).  
> FE giữ nguyên contract URL dưới prefix `/api` nếu có thể → chỉ đổi `VITE_API_BASE_URL`.

**Tham chiếu mã nguồn Node:** `backend/src/controllers/*.js`, `backend/src/routes/*.js`, `backend/src/models/*.js`.

---

## 1. Nguyên tắc giữ tương thích với Frontend

| Hạng mục | Node hiện tại | Spring Boot |
|----------|----------------|-------------|
| Base path | `/api` | `server.servlet.context-path=/api` hoặc `@RequestMapping("/api")` trên class config |
| JSON | `res.json({ data })` cho nhiều endpoint | Trả cùng shape `{ "data": ... }` hoặc chỉnh `apiClient` một lần |
| Auth | Header `Authorization: Bearer <JWT>` | `OncePerRequestFilter` + `JwtAuthenticationToken` |
| Role | `BUYER`, `SELLER`, `INSPECTOR`, `ADMIN` | `enum Role` + `@PreAuthorize("hasRole('ADMIN')")` (prefix `ROLE_` trong Spring Security) |
| Lỗi | `{ "message": "..." }` | `@ControllerAdvice` + cùng format message cho FE |

---

## 2. Ánh xạ tầng Node → Spring

| Node (Express) | Spring Boot |
|----------------|-------------|
| Route + `wrapAsync(handler)` | `@RestController` + method `throws` → exception handler |
| `requireAuth`, `requireRole([...])` | `SecurityFilterChain` + method security / `@PreAuthorize` |
| Mongoose `Schema` | Entity JPA (`@Entity`) hoặc document MongoDB (`@Document` nếu dùng Spring Data MongoDB) |
| `Order.create({...})` | `OrderRepository.save(order)` |
| `zod.safeParse` | Bean Validation (`@Valid`, `@NotBlank`, custom validator) |

**Persistence:**  
- Nếu giữ **MongoDB**: Spring Data MongoDB + `MongoRepository` (tương đương Mongoose gần nhất).  
- Nếu chuyển **SQL** (MySQL/PostgreSQL): xem `docs/ERD.md` (phần SQL Starter & Normalized); map entity quan hệ `User`, `Listing`, `Order`, `Review`, `Brand`.

---

## 3. Bảng ánh xạ endpoint chính (Express → Controller Spring)

### Auth — `/api/auth`

| Method | Path | Handler Node | Gợi ý Spring |
|--------|------|--------------|--------------|
| POST | `/signup` | `signup` | `AuthController.signup` |
| POST | `/login` | `login` | `AuthController.login` → trả JWT + user (role) |
| GET | `/me` | `me` | `UserController.me` (authenticated) |
| POST | `/forgot-password` | `forgotPassword` | stub hoặc mail service |
| POST | `/reset-password` | `resetPassword` | stub |

### Bikes (public) — `/api/bikes`

| GET | `/`, `/:id` | `listBikes`, `getBike` | Chỉ listing **PUBLISHED** + điều kiện marketplace. **RESERVED** trả 404 — Finalize lấy từ `order.listing`. |

### Buyer — `/api/buyer`

| POST | `/orders/vnpay-checkout` | `createOrderVnpayCheckout` | Tạo đơn + `paymentUrl` VNPAY. Set `fulfillmentType` + `status` theo listing (xem mục 5). Bỏ `POST /orders` COD. |
| GET | `/orders` | `getMyOrders` | Filter `buyerId` |
| GET | `/orders/:id` | `getOrderById` | 403 nếu không phải chủ đơn |
| PUT | `/orders/:id/complete` | `completeOrder` | Chỉ khi `status == SHIPPING` |
| PUT | `/orders/:id/cancel` | `cancelOrder` | **Chỉ DIRECT.** Không cho phép hủy khi `fulfillmentType == WAREHOUSE`. |
| POST | `/payments/initiate` | `initiatePayment` | Legacy (chỉ CASH). Thanh toán buyer dùng `orders/vnpay-checkout`. |
| POST | `/orders/:id/review` | `createReviewForOrder` | Sau COMPLETED |
| GET | `/reviews` | `listMyReviews` | |

### Seller — `/api/seller`

| GET | `/dashboard` | `dashboard` | Stats + listings |
| GET | `/ratings` | `getMyRatings` | Aggregate reviews |
| GET | `/orders` | `listMyOrders` | Query có điều kiện **kho vs direct** (mục 5) |
| PUT | `/orders/:orderId/ship-to-buyer` | `shipDirectToBuyer` | Chỉ `DIRECT` + `PENDING_SELLER_SHIP` |
| CRUD | `/listings` | các hàm listing | publish body `requestInspection` |
| POST | `/subscription/checkout` | package | Tạo đơn gói (demo) |
| POST | `/subscription/orders/:orderId/mock-complete` | | Dev only |

### Inspector — `/api/inspector`

| GET/PUT | `pending-listings`, `listings/:id`, approve/reject/need-update | Giữ đúng state listing + `certificationStatus` / `inspectionResult`. |

### Admin — `/api/admin`

| GET | `/orders/warehouse-pending` | **Chỉ** `fulfillmentType` kho (hoặc legacy thiếu field = WAREHOUSE) |
| PUT | `/orders/:id/confirm-warehouse` | Từ chối nếu `DIRECT` |
| GET | `/orders/re-inspection` | Filter cùng điều kiện kho |
| PUT | `/orders/:id/re-inspection-done` | → `SHIPPING` |
| GET | `/dashboard/stats` | Đếm query giống Node |
| CRUD | users, listings hide/unhide, reviews, brands | |

### Public — `/api/brands`, `/api/packages`

| GET | `/brands` | Public list |
| GET | `/packages` | Catalog gói |

---

## 4. JWT & Security (tương đương `auth.js` middleware)

1. **Login** trả `accessToken` (và optional refresh).  
2. Filter đọc `Authorization: Bearer`, parse JWT, set `SecurityContext` với `userId` + `roles`.  
3. Method-level:  
   - Buyer-only: `hasRole('BUYER')`  
   - Seller routes: `hasRole('SELLER')`  
   - Admin/Inspector: như route Node (`INSPECTOR` được phép một số API admin warehouse).

---

## 5. Business rules bắt buộc khi port (đơn hàng & kho)

### 5.1 `fulfillmentType` trên `Order`

- **`WAREHOUSE`**: Xe **đã kiểm định** (CERTIFIED).  
  - **Xe tại kho từ luồng tin:** Nếu listing có `warehouseIntakeVerifiedAt` → order tạo ra `AT_WAREHOUSE_PENDING_ADMIN`. Admin xác nhận → `SHIPPING` trực tiếp (không RE_INSPECTION), set `expiresAt = now + 24h`.  
  - **Legacy seller gửi kho:** `SELLER_SHIPPED` → `confirm-warehouse` → `RE_INSPECTION` → `re-inspection-done` → `SHIPPING` + `expiresAt`.  
  - Buyer **không** được hủy khi WAREHOUSE.
- **`DIRECT`**: Xe **chưa kiểm định** (UNVERIFIED).  
  - Sau thanh toán: `status = PENDING_SELLER_SHIP`.  
  - Seller: `PUT .../ship-to-buyer` → `SHIPPING` + `expiresAt`.  
  - Buyer có thể hủy khi RESERVED / PENDING_SELLER_SHIP.  
  - `confirm-warehouse` trả 400 nếu `DIRECT`.

Logic gốc Node: `buyerController.js` — `listingUsesWarehouseFlow()`.

### 5.2 Thanh toán — chỉ VNPAY

- **Bỏ CASH/COD.** Tạo đơn: `POST /api/buyer/orders/vnpay-checkout` (plan DEPOSIT hoặc FULL).  
- IPN hoặc Return URL cập nhật `depositPaid`, `vnpayPaymentStatus = PAID`.  
- `confirm-warehouse` cho AT_WAREHOUSE_PENDING_ADMIN: yêu cầu `depositPaid` hoặc `vnpayPaymentStatus === "PAID"`.

### 5.3 Query admin warehouse & re-inspection

Chỉ đơn có `fulfillmentType` là `WAREHOUSE` — xem `adminController.js` (`WAREHOUSE_ONLY_FILTER`).

### 5.4 Seller `GET /orders`

Hai nhánh trong `$or` (Node):  
- Kho: `SELLER_SHIPPED` / `AT_WAREHOUSE_PENDING_ADMIN` và **không** `DIRECT`.  
- Direct: `PENDING_SELLER_SHIP` và `DIRECT`.

### 5.5 `GET /bikes/:id` và Finalize

- `GET /bikes/:id` chỉ trả listing **PUBLISHED**. Khi order RESERVED, listing → RESERVED nên API 404.  
- Finalize page (`/finalize/:id?orderId=xxx`): FE **ưu tiên** lấy listing từ `order.listing` (snapshot) khi có `orderId`. Không phụ thuộc `GET /bikes/:id` cho tin đã reserved.  
- Bỏ form nhập địa chỉ/giao hàng ở Finalize — buyer đã nhập ở checkout.

---

## 6. Thứ tự triển khai Spring Boot (gợi ý)

1. Project skeleton: Spring Boot 3, Web, Validation, Security, Data (JPA hoặc Mongo).  
2. Auth + JWT + `/auth/login`, `/auth/me`.  
3. Entity Order/Listing/User + migration hoặc seed.  
4. Public `GET /bikes`, `/brands`, `/packages`.  
5. Buyer `POST /buyer/orders` (đủ `fulfillmentType`).  
6. Seller listings + `ship-to-buyer`.  
7. Admin warehouse + re-inspection (filter đúng).  
8. Inspector pipeline.  
9. Test contract với FE (`VITE_USE_MOCK_API=false`).

---

## 7. Tài liệu liên quan trong repo

| File | Nội dung |
|------|----------|
| [ERD.md](ERD.md) | Entity, field gợi ý |
| [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md) | Luồng màn hình ↔ API |
| [STATE_TRANSITION_DIAGRAM_GUIDE.md](STATE_TRANSITION_DIAGRAM_GUIDE.md) | Trạng thái Order/Listing |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Business rules tổng hợp |
| `backend/README.md` | Endpoint Node hiện tại (đồng bộ khi đổi BE) |

---

## 8. Ghi chú cho nhánh / quy trình (follow thầy Lâm)

- Giữ **một source of truth** cho contract: OpenAPI (Swagger) sinh từ Spring hoặc file `openapi.yaml` trong repo.  
- CI: `mvn test` / `./gradlew test` + build trước merge (tương tự lint/build FE).  
- Sau khi Spring lên production, có thể **tắt** folder `backend/` Node hoặc giữ làm reference — FE không phụ thuộc runtime Node nếu URL + JSON giữ nguyên.
