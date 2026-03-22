# Hướng dẫn Backend: chuyển đổi flow từ Node.js (Express) sang Java Spring Boot

> Tài liệu cho team Backend khi port API hiện tại (`backend/` – Express + Mongoose) sang **Spring Boot 3** (REST, JWT, persistence).  
> FE giữ nguyên contract URL dưới prefix `/api` nếu có thể → chỉ đổi `VITE_API_BASE_URL`.

**Tra cứu nhanh:** [QUICK-REFERENCE.md](QUICK-REFERENCE.md) — API, thuật ngữ, vị trí file.  
**Mã nguồn Node:** `backend/src/controllers/*.js`, `backend/src/routes/*.js`, `backend/src/models/*.js`.

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
- Nếu chuyển **SQL** (MySQL): xem **`docs/ERD-SPEC.md`** (đặc tả đầy đủ cột, ENUM, FK) và **`docs/ERD-MYSQL.md`** (sơ đồ ERD, mapping MongoDB→MySQL). Chạy schema: `docs/sql/shopbike_mysql_schema.sql`.

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
| GET | `/orders/:id` | `getOrderById` | 403 nếu không phải chủ đơn. Trả `sellerId` (từ Listing) và bổ sung `listing.seller` nếu thiếu — dùng cho Success page đánh giá. |
| PUT | `/orders/:id/complete` | `completeOrder` | Chỉ khi `status == SHIPPING` |
| PUT | `/orders/:id/cancel` | `cancelOrder` | **Cả DIRECT và WAREHOUSE.** Hủy được khi RESERVED, IN_TRANSACTION, PENDING_SELLER_SHIP, SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN, RE_INSPECTION, RE_INSPECTION_DONE, SHIPPING. |
| POST | `/orders/:id/vnpay-pay-balance` | `payBalanceVnpay` | Thanh toán số dư (plan DEPOSIT) qua VNPay → redirect; Return về Finalize `?vnpay_balance=1`. |
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

## 3a. Request/Response shape (key endpoints)

Giữ đúng format để FE không đổi code.

**POST /auth/login**
```
Request:  { "emailOrUsername": string, "password": string }
Response: { "data": { "accessToken": string, "user": { "id", "email", "role", "displayName"? } } }
```

**POST /buyer/orders/vnpay-checkout**
```
Request:  { "listingId": string, "plan": "DEPOSIT"|"FULL", "fulfillmentType": "WAREHOUSE"|"DIRECT", "shippingAddress": { "street", "city", "postalCode"? } }
Response: { "data": { "orderId": string, "paymentUrl": string } }
```

**GET /buyer/orders/:id**
```
Response: { "data": { "id", "status", "listingId", "listing": { ...snapshot, seller?: { id, name?, email? } }, "sellerId"?, "shippingAddress", "depositPaid", "balancePaid", "plan", "fulfillmentType", ... } }
```
Cần trả `sellerId` và `listing.seller` để Success page hiển thị form đánh giá.

**PUT /seller/orders/:id/ship-to-buyer**
```
Request:  (body rỗng hoặc optional)
Response: { "data": { ...order } } hoặc 200 OK
```
Chỉ khi `fulfillmentType === "DIRECT"` và `status === "PENDING_SELLER_SHIP"`.

---

## 3b. Checklist port (theo thứ tự)

| Bước | Việc | Xong |
|------|------|------|
| 1 | Tạo project Spring Boot 3, Web, Validation, Security, Data (JPA/Mongo) | |
| 2 | Cấu hình base path `/api` | |
| 3 | Auth: login, signup, JWT filter, /me | |
| 4 | Entity User, Brand, Category (xem ERD-SPEC) | |
| 5 | Entity Listing, ListingMedia, InspectionReport | |
| 6 | Entity Order, OrderSnapshot, Shipment, OrderPayment | |
| 7 | GET /bikes, GET /bikes/:id (chỉ PUBLISHED) | |
| 8 | POST /buyer/orders/vnpay-checkout + fulfillmentType | |
| 9 | GET/PUT /buyer/orders/:id, cancel, complete | |
| 10 | POST /buyer/orders/:id/vnpay-pay-balance | |
| 11 | Seller: dashboard, listings CRUD, orders, ship-to-buyer | |
| 12 | Inspector: pending-listings, approve/reject/need-update | |
| 13 | Admin: warehouse, confirm-warehouse, re-inspection | |
| 14 | GET /brands, GET /packages | |
| 15 | Test với FE: VITE_USE_MOCK_API=false | |

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
  - Buyer **có thể hủy** khi RESERVED, SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN, RE_INSPECTION, RE_INSPECTION_DONE, SHIPPING (trước khi xác nhận nhận hàng).
- **`DIRECT`**: Xe **chưa kiểm định** (UNVERIFIED).  
  - Sau thanh toán: `status = PENDING_SELLER_SHIP`.  
  - Seller: `PUT .../ship-to-buyer` → `SHIPPING` + `expiresAt`.  
  - Buyer có thể hủy khi RESERVED, PENDING_SELLER_SHIP, SHIPPING.  
  - `confirm-warehouse` trả 400 nếu `DIRECT`.

Logic gốc Node: `buyerController.js` — `listingUsesWarehouseFlow()`.

### 5.2 Thanh toán — chỉ VNPAY

- **Bỏ CASH/COD.** Tạo đơn: `POST /api/buyer/orders/vnpay-checkout` (plan DEPOSIT hoặc FULL).  
- IPN hoặc Return URL cập nhật `depositPaid`, `vnpayPaymentStatus = PAID`.  
- **Thanh toán số dư (plan DEPOSIT):** `POST /api/buyer/orders/:id/vnpay-pay-balance` → paymentUrl → VNPay → Return về Finalize `?vnpay_balance=1` → buyer xác nhận hoàn tất. Order có field `balancePaid`.  
- `confirm-warehouse` cho AT_WAREHOUSE_PENDING_ADMIN: yêu cầu `depositPaid` hoặc `vnpayPaymentStatus === "PAID"`.

### 5.3 Query admin warehouse & re-inspection

Chỉ đơn có `fulfillmentType` là `WAREHOUSE` — xem `adminController.js` (`WAREHOUSE_ONLY_FILTER`).

### 5.4 Seller `GET /orders`

Hai nhánh trong `$or` (Node):  
- Kho: `SELLER_SHIPPED` / `AT_WAREHOUSE_PENDING_ADMIN` và **không** `DIRECT`.  
- Direct: `PENDING_SELLER_SHIP` và `DIRECT`.

### 5.5 `GET /bikes/:id`, Finalize & Success

- `GET /bikes/:id` chỉ trả listing **PUBLISHED**. Khi order RESERVED/SOLD, listing → RESERVED/SOLD nên API 404.  
- **Finalize** (`/finalize/:id?orderId=xxx`): FE ưu tiên lấy listing từ `order.listing` (snapshot) khi có `orderId`. Bỏ form địa chỉ — buyer đã nhập ở checkout. Nút "Thanh toán nốt X qua VNPay" khi `balancePaid === false`.  
- **Success** (`/success/:id`): Ưu tiên lấy từ order khi có `state.orderId` — tin SOLD không còn trong GET /bikes. Navigate từ Finalize phải truyền `orderId` trong state.  
- **Review form:** `getOrderById` trả `sellerId` (từ Listing) và bổ sung `listing.seller` để form đánh giá hoạt động. Snapshot tạo đơn lưu `seller` từ đầu.

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

## 7. Schema MySQL → JPA Entities (khi chuyển SQL)

Khi dùng MySQL + JPA, tham chiếu:

| Nguồn | Dùng cho |
|-------|----------|
| [ERD-SPEC.md](ERD-SPEC.md) | Toàn bộ cột, kiểu dữ liệu, ENUM, FK, thứ tự tạo bảng. Tạo entity `@Entity`, `@Column`, `@Enumerated`, `@ManyToOne`, `@OneToMany` theo đúng spec. |
| [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | CREATE TABLE chuẩn — chạy migration hoặc import vào MySQL. |
| [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | Thứ tự bảng (phụ thuộc FK) — tham chiếu khi đặt thứ tự `schema.sql` hoặc Flyway scripts. |

**Mapping nhanh Node (Mongoose) → Spring JPA:**

| Mongoose | JPA |
|----------|-----|
| `User` | `User` entity — `@Table(name = "user")` (user là keyword MySQL, dùng backtick) |
| `Order.balancePaid` | `order.balance_paid` (Boolean) |
| `Order.listing` (embedded) | `OrderSnapshot` entity — `@OneToOne` Order, tạo khi Finalize |
| `order.listing.seller` | `order_snapshot.seller_id` FK + `seller_json` JSON |
| Enum Mongoose | `@Enumerated(EnumType.STRING)` — giá trị từ ERD-SPEC |
| `ObjectId` | `Long` (BIGINT UNSIGNED) |

---

## 8. Tài liệu liên quan trong repo

| File | Nội dung |
|------|----------|
| [ERD-SPEC.md](ERD-SPEC.md) | Đặc tả schema — cột, ENUM, FK, luồng nghiệp vụ (tạo JPA entities) |
| [ERD-MYSQL.md](ERD-MYSQL.md) | Thiết kế 17 bảng, ERD Mermaid, mapping MongoDB→MySQL |
| [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | Hướng dẫn vẽ ERD, thứ tự bảng |
| [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md) | Luồng màn hình ↔ API |
| [STATE_TRANSITION_DIAGRAM_GUIDE.md](STATE_TRANSITION_DIAGRAM_GUIDE.md) | Trạng thái Order/Listing |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Business rules tổng hợp |
| `backend/README.md` | Endpoint Node hiện tại (đồng bộ khi đổi BE) |

---

## 9. Ghi chú cho nhánh / quy trình (follow thầy Lâm)

- Giữ **một source of truth** cho contract: OpenAPI (Swagger) sinh từ Spring hoặc file `openapi.yaml` trong repo.  
- CI: `mvn test` / `./gradlew test` + build trước merge (tương tự lint/build FE).  
- Sau khi Spring lên production, có thể **tắt** folder `backend/` Node hoặc giữ làm reference — FE không phụ thuộc runtime Node nếu URL + JSON giữ nguyên.
