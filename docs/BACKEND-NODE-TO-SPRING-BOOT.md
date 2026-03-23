# Hướng dẫn chuyển giao công nghệ: Node.js (Express + MongoDB) → Java Spring Boot

> **Tài liệu chính cho team Backend Java** khi đối chiếu / hoàn thiện API ShopBike so với bản tham chiếu **Node** trong `backend/`, đảm bảo **frontend React (Vite)** không phải sửa nếu giữ nguyên URL và shape JSON.  
> Nhánh mặc định: **`BE2`** — monorepo: Spring + FE + folder Node demo.

---

## Mục lục

1. [Mục đích & đối tượng](#1-mục-đích--đối-tượng)  
2. [Lộ trình onboard — đọc gì trước, code ở đâu](#2-lộ-trình-onboard--đọc-gì-trước-code-ở-đâu)  
3. [Bối cảnh monorepo BE2](#3-bối-cảnh-monorepo-be2)  
4. [Môi trường, cổng, biến mật (không commit)](#4-môi-trường-cổng-biến-mật-không-commit)  
5. [Cấu trúc thư mục Node ↔ Spring](#5-cấu-trúc-thư-mục-node--spring)  
6. [Nguyên tắc tương thích Frontend](#6-nguyên-tắc-tương-thích-frontend)  
7. [Ánh xạ tầng kỹ thuật](#7-ánh-xạ-tầng-kỹ-thuật-node--spring)  
8. [Bảo mật: JWT, role, điểm lệch cần xử lý](#8-bảo-mật-jwt-role-điểm-lệch-cần-xử-lý)  
9. [Danh mục endpoint (Express) — chuẩn contract](#9-danh-mục-endpoint-express--chuẩn-contract)  
10. [Class Spring hiện có trong repo](#10-class-spring-hiện-có-trong-repo)  
11. [Hợp đồng JSON chi tiết (một số API then chốt)](#11-hợp-đồng-json-chi-tiết-một-số-api-then-chốt)  
12. [Enum & trạng thái](#12-enum--trạng-thái-order--listing)  
13. [Business rules: đơn hàng, kho, thanh toán](#13-business-rules-đơn-hàng-kho-thanh-toán)  
14. [Luồng VNPay (tóm tắt)](#14-luồng-vnpay-tóm-tắt)  
15. [CORS, health check](#15-cors-health-check)  
16. [Checklist port / hoàn thiện Spring](#16-checklist-port--hoàn-thiện-spring)  
17. [Kịch bản kiểm thử thủ công](#17-kịch-bản-kiểm-thử-thủ-công)  
18. [Ví dụ `curl`](#18-ví-dụ-curl)  
19. [MySQL, JPA, ERD](#19-mysql-jpa-erd)  
20. [Tài liệu liên quan trong repo](#20-tài-liệu-liên-quan-trong-repo)  
21. [Quy trình chất lượng](#21-quy-trình-chất-lượng)  
22. [Bảng theo dõi lệch Spring ↔ Node ↔ FE](#22-bảng-theo-dõi-lệch-spring--node--fe)

---

## 1. Mục đích & đối tượng

| Câu hỏi | Trả lời |
|---------|---------|
| **Tài liệu này để làm gì?** | Chuẩn hóa **chuyển giao công nghệ**: hiểu FE kỳ vọng gì, Node đang làm gì, Spring cần bổ sung / sửa gì cho khớp. |
| **Ai đọc?** | Dev Backend Java, tech lead, người review PR backend. |
| **Kết quả mong đợi?** | Một API Spring (hoặc Node) duy nhất thỏa: prefix `/api`, JWT, role, JSON giống hoặc tương thích với `apiClient` / `authApi` (xem §6). |

**Tra cứu nhanh API theo path:** [QUICK-REFERENCE.md](QUICK-REFERENCE.md).  
**Mã nguồn Node tham chiếu:** `backend/src/controllers/*.js`, `routes/*.js`, `models/*.js`.

---

## 2. Lộ trình onboard — đọc gì trước, code ở đâu

Thứ tự đề xuất **trong ngày đầu**:

1. **README root** [README.md](../README.md) — Phần A (chạy Spring), Phần B (chạy FE, `VITE_API_BASE_URL`).  
2. **§3 + §5 của tài liệu này** — monorepo + tương thích FE.  
3. **[BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md)** và **[BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md)** — mapping trang FE → API.  
4. **[ERD-SPEC.md](ERD-SPEC.md)** — nếu dùng MySQL + JPA (cột, ENUM, FK).  
5. **Mở Swagger** sau khi chạy Spring: `http://localhost:8081/swagger-ui/index.html` (port có thể khác — xem `application.properties`).  
6. **So sánh handler Node** với **controller Spring** tương ứng (bảng §5, §10).

**Nơi sửa code Spring (BE2):**

| Loại | Package / file |
|------|----------------|
| REST | `src/main/java/com/biketrading/backend/controller/*Controller.java` |
| Entity | `.../entity/*.java` |
| Enum | `.../enums/*.java` |
| Repository | `.../repository/*Repository.java` |
| DTO request | `.../dto/*Request.java` |
| Security | `.../security/SecurityConfig.java`, `JwtAuthenticationFilter.java`, `JwtTokenProvider.java` |
| Exception JSON | `.../exception/GlobalExceptionHandler.java` |
| Seed demo | `.../config/DatabaseSeeder.java` |
| VNPay | `.../config/VNPayConfig.java`, `PaymentController` (nếu có) |

---

## 3. Bối cảnh monorepo BE2

| Thành phần | Đường dẫn | Ghi chú |
|------------|-----------|---------|
| **Spring Boot** | `pom.xml` (root), `src/main/java/com/biketrading/backend/`, `src/main/resources/` | Entry: `BikeTradingBackendApplication.java`. |
| **Frontend** | `src/app/`, `src/features/`, `src/apis/`, … | Cùng folder `src/` với `src/main/java` — **không xóa nhầm** `main/java`. |
| **Node (demo)** | `backend/` | Express, MongoDB hoặc in-memory + seed. Port mặc định thường **8081** (trùng Spring — **chỉ chạy một BE tại một thời điểm** khi test local). |

**Việc “chuyển giao” thực tế trên BE2:** Spring đã có skeleton; công việc là **lấp đủ hành vi** giống Node (hoặc giống bảng §9) và **ERD-SPEC**, không phải tạo project từ zero.

---

## 4. Môi trường, cổng, biến mật (không commit)

### 4.1 Spring (`src/main/resources/application.properties`)

- **Datasource MySQL:** URL, user, password — **không** đưa password thật vào Git; dùng biến môi trường hoặc `application-local.properties` (gitignored) trong thực tế team.  
- **`server.port`:** thường `8081` (đồng bộ README / FE `.env`).  
- **JWT:** `app.jwtSecret`, `app.jwtExpirationInMs`.  
- **VNPay sandbox:** `vnpay.tmnCode`, `vnpay.hashSecret`, `vnpay.url`, `vnpay.returnUrl` — xem thêm [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md).

### 4.2 Frontend (root)

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8081/api   (hoặc /api nếu BE có context-path — hiện controller dùng @RequestMapping("/api/...") trực tiếp)
# VITE_USE_MOCK_API=false                         khi test với Spring/Node thật
```

### 4.3 Node (`backend/`)

- `PORT`, `MONGODB_URI`, `CLIENT_ORIGIN` (CORS), v.v. — xem [backend/README.md](../backend/README.md).

---

## 5. Cấu trúc thư mục Node ↔ Spring

**Node (chuẩn Express):**

```
backend/src/
├── server.js              # mount /api/*, CORS, port
├── routes/*.js            # khai báo path + middleware
├── controllers/*.js     # logic xử lý
├── models/*.js            # Mongoose
├── middlewares/           # auth, error
└── config/, utils/
```

**Spring (chuẩn layered):**

```
src/main/java/com/biketrading/backend/
├── BikeTradingBackendApplication.java
├── controller/            # ~ như routes + controller Node gộp
├── entity/                # ~ models
├── repository/            # ~ data access
├── dto/                   # body request (tương đương zod input)
├── enums/
├── security/              # ~ middleware auth
├── exception/             # ~ error handler
└── config/                # VNPay, CORS, seed
```

---

## 6. Nguyên tắc tương thích Frontend

| Hạng mục | Kỳ vọng FE / Node | Spring cần đạt |
|----------|-------------------|----------------|
| Base URL | `VITE_API_BASE_URL` trỏ tới host + **`/api`** prefix trên mỗi path trong `apiConfig` | `@RequestMapping("/api/...")` trên controller hoặc `server.servlet.context-path` — **nhất quán một cách** |
| JSON bọc `data` | Nhiều endpoint Node trả `{ data: ... }` | Có thể trả thẳng object **hoặc** `{ "data": ... }` — FE đã xử lý: `r.data?.data ?? r.data` trong `authApi` và nhiều chỗ khác |
| Lỗi | `{ "message": "..." }` | `GlobalExceptionHandler` (hoặc tương đương) trả cùng shape |
| Auth | Header `Authorization: Bearer <JWT>` | `JwtAuthenticationFilter` đọc Bearer, set `SecurityContext` |
| Role | `BUYER`, `SELLER`, `INSPECTOR`, `ADMIN` | `UserRole` enum + `hasRole(...)` — **lưu ý prefix `ROLE_` trong Spring Security** |

---

## 7. Ánh xạ tầng kỹ thuật (Node → Spring)

| Node (Express) | Spring Boot |
|----------------|-------------|
| `Router` + `wrapAsync(handler)` | `@RestController` + ném exception → `@ControllerAdvice` |
| `requireAuth`, `requireRole([...])` | `SecurityFilterChain` + `@PreAuthorize` / `requestMatchers(...).hasRole(...)` |
| Mongoose `Schema` | `@Entity` + JPA (MySQL) hoặc `@Document` MongoDB |
| `zod.safeParse` | `@Valid` + Bean Validation + validator tùy biến |
| `res.json({ data })` | `ResponseEntity.ok(Map.of("data", x))` hoặc `ok(x)` tùy chuẩn đã chọn |

**Persistence:** dự án Spring hiện tại dùng **MySQL + JPA** (`spring.jpa.hibernate.ddl-auto`, …). Tham chiếu schema: [ERD-SPEC.md](ERD-SPEC.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql).

---

## 8. Bảo mật: JWT, role, điểm lệch cần xử lý

### 8.1 Cách FE gửi token

`apiClient` gắn `Authorization: Bearer` từ Zustand — không đổi khi đổi BE nếu JWT hợp lệ.

### 8.2 Node cho phép role “phụ” — Spring hiện có thể chưa khớp

| Route group | Node (`requireRole`) | Spring `SecurityConfig` (cần đối chiếu khi sửa) |
|-------------|----------------------|-----------------------------------------------|
| `/api/buyer/**` | `BUYER` **hoặc** `ADMIN` | Chỉ `hasRole("BUYER")` → **ADMIN không gọi được buyer API** |
| `/api/inspector/**` | `INSPECTOR` **hoặc** `ADMIN` | Chỉ `INSPECTOR` → **ADMIN không vào inspector** |
| `/api/admin/orders/re-inspection*` | `ADMIN` **hoặc** `INSPECTOR` | Cần rule tương đương trên `/api/admin/**` |

**Khuyến nghị:** dùng `hasAnyRole("BUYER","ADMIN")` (và tương tự) cho đúng hành vi Node + UX admin trong FE. Cập nhật `SecurityConfig` và ghi chú trong PR.

### 8.3 JWT claims

Đảm bảo token chứa đủ thông tin để filter map được **username** → `UserRepository` (hoặc userId) giống logic `JwtAuthenticationFilter` hiện tại.

---

## 9. Danh mục endpoint (Express) — chuẩn contract

Dưới đây là **chuẩn tham chiếu từ Node** (`backend/src/routes/*.js` + `server.js`). Spring cần phủ **cùng path + method** (trừ khi team thống nhất breaking change và sửa FE).

### 9.1 Auth — `/api/auth`

| Method | Path | Ghi chú |
|--------|------|---------|
| POST | `/signup` | Role thường BUYER/SELLER; INSPECTOR tùy policy |
| POST | `/login` | Body: `emailOrUsername`, `password` |
| GET | `/me` | Cần Bearer |
| POST | `/forgot-password` | Có thể stub |
| POST | `/reset-password` | Có thể stub |

### 9.2 Bikes (public) — `/api/bikes`

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/` | Chỉ listing **PUBLISHED** (marketplace) |
| GET | `/:id` | **RESERVED/SOLD** → thường **404**; Finalize/Success lấy snapshot từ order |

### 9.3 Buyer — `/api/buyer` (auth: BUYER [+ ADMIN trên Node])

| Method | Path | Ghi chú |
|--------|------|---------|
| POST | `/orders/vnpay-checkout` | Tạo order + `paymentUrl` VNPay; `plan`, `fulfillmentType`, `shippingAddress` |
| POST | `/orders/:id/vnpay-resume` | Tiếp tục thanh toán cọc khi pending |
| POST | `/orders/:id/vnpay-pay-balance` | Plan DEPOSIT — thanh toán phần còn lại |
| POST | `/orders` | Legacy/mock COD — FE ưu tiên VNPAY |
| GET | `/orders` | Danh sách đơn buyer |
| GET | `/orders/:id` | **Bắt buộc** có `sellerId`, `listing.seller` khi cần cho Success/review |
| PUT | `/orders/:id/complete` | Chỉ khi đang giao (`SHIPPING` / tương đương nghiệp vụ) |
| PUT | `/orders/:id/cancel` | Điều kiện hủy theo §13 |
| POST | `/orders/:id/review` | Sau COMPLETED |
| POST | `/payments/initiate` | Legacy CASH — ít dùng |
| GET | `/reviews` | Review của buyer |

### 9.4 Seller — `/api/seller` (SELLER)

| Method | Path |
|--------|------|
| GET | `/dashboard` |
| GET | `/ratings` |
| GET | `/orders` |
| PUT | `/orders/:orderId/ship-to-buyer` |
| PUT | `/orders/:orderId/ship-to-warehouse` |
| PUT | `/listings/:id/mark-shipped-to-warehouse` |
| GET | `/listings`, GET `/listings/:id` |
| POST | `/listings`, PUT `/listings/:id` |
| PUT | `/listings/:id/publish`, PUT `/listings/:id/submit` |
| POST | `/subscription/checkout` |
| POST | `/subscription/orders/:orderId/mock-complete` |
| PUT | `/subscription/revoke-self` |

### 9.5 Inspector — `/api/inspector` (INSPECTOR [+ ADMIN trên Node])

| Method | Path |
|--------|------|
| GET | `/pending-listings` |
| GET | `/listings/:id` |
| PUT | `/listings/:id/approve` |
| PUT | `/listings/:id/reject` |
| PUT | `/listings/:id/need-update` |

### 9.6 Admin — `/api/admin` (chủ yếu ADMIN; một số route + INSPECTOR)

| Method | Path | Role (Node) |
|--------|------|---------------|
| GET | `/orders/warehouse-pending` | ADMIN |
| PUT | `/orders/:id/confirm-warehouse` | ADMIN |
| GET | `/orders/re-inspection` | ADMIN, INSPECTOR |
| PUT | `/orders/:id/re-inspection-done` | ADMIN, INSPECTOR |
| GET | `/dashboard/stats` | ADMIN |
| GET | `/users`, PUT `/users/:id/hide`, `/unhide` | ADMIN |
| GET | `/seller-subscriptions`, PUT `/users/:id/revoke-subscription` | ADMIN |
| GET | `/listings/pending-warehouse-intake` | ADMIN, INSPECTOR |
| PUT | `/listings/:id/confirm-warehouse-intake` | ADMIN |
| PUT | `/listings/:id/confirm-warehouse-re-inspection` | ADMIN, INSPECTOR |
| GET | `/listings`, PUT `/listings/:id/hide`, `/unhide` | ADMIN |
| GET | `/reviews`, PUT `/reviews/:id` | ADMIN |
| GET/POST/PUT/DELETE | `/brands` CRUD | ADMIN |

### 9.7 Public khác

| Method | Path |
|--------|------|
| GET | `/api/brands` |
| GET | `/api/packages` |
| GET | `/api/health` | (Node có; Spring có thể thêm `Actuator` hoặc controller ping) |

### 9.8 VNPay (Node demo riêng)

Trên Node, một số route demo nằm ngoài `/api`: `server.js` mount **`/payment`** (`vnpayDemoPaymentRoutes`). Spring thường gom **`/api/vnpay/**`** — **Return URL** trong `application.properties` phải khớp controller thực tế.

---

## 10. Class Spring hiện có trong repo

| Controller | `@RequestMapping` |
|------------|-------------------|
| `AuthController` | `/api/auth` |
| `BikeController` | `/api/bikes` |
| `BuyerController` | `/api/buyer` |
| `SellerController` | `/api/seller` |
| `InspectorController` | `/api/inspector` |
| `AdminController` | `/api/admin` |
| `PackageController` | (packages / subscription — kiểm tra annotation trong file) |
| `PaymentController` | VNPay return/IPN nếu được cấu hình |

Khi bổ sung endpoint: **ưu tiên cùng path với §9**; cập nhật Swagger annotation (`@Operation`, …) nếu project đã bật springdoc.

---

## 11. Hợp đồng JSON chi tiết (một số API then chốt)

### 11.1 Đăng nhập

**Request `POST /api/auth/login`**

```json
{ "emailOrUsername": "string", "password": "string" }
```

**Response** — FE chấp nhận **cả** dạng phẳng **và** `{ "data": { ... } }`:

- `accessToken` (bắt buộc)
- `role` (khuyến nghị)
- `subscription` (seller: `currentPlan`, `remainingListings`, `packageExpiryDate`, `inspectionCredits`, …) — xem `authApi` / `useSellerSubscriptionStore`

### 11.2 `GET /api/auth/me`

Trả các field tương thích `MeResponse` trong `authApi.ts`: `id`, `email`, `displayName`, `role`, `subscription?`.  
(Node/Spring có thể prefix `id` dạng `U` + số — **giữ nhất quán** để FE không vỡ.)

### 11.3 `POST /api/buyer/orders/vnpay-checkout`

```json
{
  "listingId": 1,
  "plan": "DEPOSIT",
  "fulfillmentType": "WAREHOUSE",
  "shippingAddress": { "street": "", "city": "", "postalCode": "" }
}
```

**Response:** `{ "orderId": "...", "paymentUrl": "https://..." }` (hoặc bọc `data`).  
**Nghiệp vụ:** set `status` ban đầu + `fulfillmentType` theo listing (CERTIFIED/UNVERIFIED, warehouse intake, …) — đối chiếu `buyerController.js` (`listingUsesWarehouseFlow`) và §13.

### 11.4 `GET /api/buyer/orders/:id`

Bắt buộc đủ field FE dùng trên Transaction / Finalize / Success:

- `status`, `plan`, `fulfillmentType`, `depositPaid`, `balancePaid`, `shippingAddress`
- `listing` (snapshot): thông tin tin đăng khi đã SOLD
- `sellerId` và `listing.seller` cho form đánh giá

### 11.5 Seller ship direct

`PUT /api/seller/orders/:orderId/ship-to-buyer` — chỉ khi **DIRECT** + trạng thái chờ seller giao (xem §13).

---

## 12. Enum & trạng thái (Order / Listing)

### 12.1 `OrderStatus` (Spring — ví dụ trong repo)

Các giá trị gồm (tên chính xác xem `OrderStatus.java`):  
`PENDING`, `RESERVED`, `PENDING_SELLER_SHIP`, `SELLER_SHIPPED`, `AT_WAREHOUSE_PENDING_ADMIN`, `RE_INSPECTION`, `RE_INSPECTION_DONE`, `SHIPPING`, `IN_TRANSACTION`, `COMPLETED`, `CANCELLED`, `REFUNDED`, …

**Quy tắc:** chuỗi trả về JSON nên **khớp** với FE types (`src/types` / constants) — thường là **UPPER_SNAKE** giống Node.

### 12.2 Listing

Trạng thái tin: `PUBLISHED`, `PENDING_INSPECTION`, `IN_TRANSACTION`, … — đối chiếu `ListingState.java` và [STATE_TRANSITION_DIAGRAM_GUIDE.md](STATE_TRANSITION_DIAGRAM_GUIDE.md).

### 12.3 `fulfillmentType`

`WAREHOUSE` | `DIRECT` — bắt buộc trên order cho luồng kho vs giao thẳng.

---

## 13. Business rules: đơn hàng, kho, thanh toán

Tóm tắt **bắt buộc** (chi tiết đầy đủ + ví dụ Node: `buyerController.js`, `adminController.js`):

### 13.1 `WAREHOUSE` (xe đã kiểm định / luồng kho)

- Có nhánh **xe đã ở kho từ tin** (`warehouseIntakeVerifiedAt` tương đương) → order có thể vào `AT_WAREHOUSE_PENDING_ADMIN` rồi admin confirm → `SHIPPING` + `expiresAt` 24h.  
- Nhánh **seller gửi kho**: `SELLER_SHIPPED` → admin `confirm-warehouse` → `RE_INSPECTION` → `re-inspection-done` → `SHIPPING`.  
- Buyer hủy: theo danh sách trạng thái đã thống nhất với FE (xem CHANGELOG / BUSINESS-RULES).

### 13.2 `DIRECT`

- Sau thanh toán cọc/full: chờ seller `ship-to-buyer` → `SHIPPING`.  
- `confirm-warehouse` **từ chối** order DIRECT.

### 13.3 Thanh toán — chỉ VNPAY (theo spec dự án)

- Không dùng CASH/COD cho luồng chính.  
- **Plan DEPOSIT:** thường **8%** giá đơn (theo tài liệu nghiệp vụ) — **đối chiếu code Spring** (ví dụ có chỗ fix cứng 5.000.000 VND) và **sửa cho khớp spec** nếu lệch.  
- `vnpay-pay-balance`, Return URL về Finalize `?vnpay_balance=1`, field `balancePaid`.

**Nguồn chi tiết:** [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md), [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md).

### 13.4 Seller `GET /orders`

Filter **OR**: đơn kho (các status warehouse) **hoặc** direct `PENDING_SELLER_SHIP` — giống `$or` trong Node.

### 13.5 Admin warehouse / re-inspection query

Chỉ lấy đơn **WAREHOUSE** (filter giống `WAREHOUSE_ONLY_FILTER` trong `adminController.js`).

---

## 14. Luồng VNPay (tóm tắt)

1. FE gọi `POST /buyer/orders/vnpay-checkout` → nhận `paymentUrl`.  
2. Browser redirect user sang VNPay.  
3. User thanh toán xong → **Return URL** về BE → BE cập nhật `depositPaid` / trạng thái (và redirect tiếp về FE nếu cần).  
4. **IPN** (server-to-server) — nên xử lý idempotent; nếu IPN lỗi, Return URL vẫn có thể cập nhật (theo policy đã chọn).  

Chi tiết biến, hash, thẻ test: [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md).

---

## 15. CORS, health check

- **Node:** `CLIENT_ORIGIN` + `CORS_EXTRA_ORIGINS` trong `server.js`.  
- **Spring:** `CorsConfig.java` — đảm bảo cho phép `http://localhost:5173` và credentials nếu FE dùng `withCredentials: true`.  
- **Health:** FE không bắt buộc; DevOps có thể cần `GET /api/health` — thêm `RestController` một dòng nếu chưa có.

---

## 16. Checklist port / hoàn thiện Spring

| # | Việc | Ghi chú |
|---|------|---------|
| 1 | Đồng bộ **SecurityConfig** với Node (`ADMIN` + `INSPECTOR` trên các nhánh cần thiết) | §8 |
| 2 | Auth: login, signup, me — shape JSON | §11 |
| 3 | GET `/bikes`, GET `/bikes/:id` — chỉ PUBLISHED; 404 khi không bán | §9.2 |
| 4 | Buyer: vnpay-checkout, resume, pay-balance, get order, cancel, complete, review | §9.3 |
| 5 | Seller: dashboard, orders, listings CRUD, publish, submit, ship, subscription | §9.4 |
| 6 | Inspector: pending, approve/reject/need-update | §9.5 |
| 7 | Admin: warehouse, re-inspection, users, listings, reviews, brands, stats | §9.6 |
| 8 | Packages & brands public | §9.7 |
| 9 | VNPay return/IPN khớp `vnpay.returnUrl` | §14 |
| 10 | Seed / migration DB cho demo | `DatabaseSeeder`, SQL |
| 11 | Test end-to-end với FE `VITE_USE_MOCK_API=false` | §17 |

---

## 17. Kịch bản kiểm thử thủ công

| # | Actor | Bước |
|---|-------|------|
| 1 | Guest | Home → xem listing → `/bikes/:id` |
| 2 | Buyer | Đăng ký/login → checkout DIRECT → VNPay (sandbox) → transaction → finalize → success → review |
| 3 | Buyer | Checkout WAREHOUSE (listing certified) → các bước kho/admin tùy scenario |
| 4 | Seller | Dashboard → tạo tin → submit inspection → publish → xem orders → ship |
| 5 | Inspector | Pending listings → approve/reject |
| 6 | Admin | Warehouse pending → confirm → re-inspection flow; quản lý users/listings/brands |
| 7 | Admin | Đăng nhập admin, thử các URL **buyer** (giỏ hàng/checkout) — phải hoạt động nếu đã sửa §8 |

Ghi lại lỗi **status HTTP**, **body JSON**, **log SQL** (`show-sql=true`) khi báo bug.

---

## 18. Ví dụ `curl`

Thay `TOKEN` bằng JWT từ `/auth/login`.

```bash
# Login
curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"buyer_tuan","password":"123"}'

# Me
curl -s http://localhost:8081/api/auth/me -H "Authorization: Bearer TOKEN"

# Danh sách xe public
curl -s http://localhost:8081/api/bikes

# Tạo checkout VNPay (buyer)
curl -s -X POST http://localhost:8081/api/buyer/orders/vnpay-checkout \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"listingId":1,"plan":"DEPOSIT","fulfillmentType":"DIRECT","shippingAddress":{"street":"A","city":"HN"}}'
```

---

## 19. MySQL, JPA, ERD

| Nguồn | Dùng để |
|-------|---------|
| [ERD-SPEC.md](ERD-SPEC.md) | Tạo/sửa `@Entity`, khóa ngoại, ENUM string |
| [ERD-MYSQL.md](ERD-MYSQL.md) | Hiểu 17 bảng, quan hệ |
| [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | Import DB hoặc đối chiếu `ddl-auto` |
| [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | Thứ tự migration |

**Mapping nhanh Mongoose → JPA:** ObjectId → `Long`; embedded listing snapshot → bảng `order_snapshot` hoặc JSON column theo ERD-SPEC.

---

## 20. Tài liệu liên quan trong repo

| File | Nội dung |
|------|----------|
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | API, routes, env |
| [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Page → API |
| [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md) | Luồng màn hình |
| [STATE_TRANSITION_DIAGRAM_GUIDE.md](STATE_TRANSITION_DIAGRAM_GUIDE.md) | State machine |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Tổng quan nghiệp vụ |
| [STRUCTURE.md](STRUCTURE.md) | Cấu trúc FE + ghi chú `src/main/java` |
| [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | Chạy & API Node |
| [backend/README.md](../backend/README.md) | Endpoint / env Node |
| [README.md](../README.md) | Chạy monorepo BE2 |

---

## 21. Quy trình chất lượng

- **OpenAPI / Swagger** làm chuẩn contract sau khi API ổn định.  
- **PR:** kèm mô tả endpoint thêm/sửa + test đã chạy (`mvn test`, hoặc manual §17).  
- **Không commit** mật khẩu DB / `hashSecret` thật — dùng secret manager hoặc file local ignore.

---

## 22. Bảng theo dõi lệch Spring ↔ Node ↔ FE

| Hạng mục | Ghi chú hành động |
|----------|-------------------|
| Role ADMIN trên buyer/inspector | Sửa `SecurityConfig` `hasAnyRole` như Node |
| Số tiền cọc DEPOSIT | Spec 8% vs code cố định VND — thống nhất và sửa |
| Bọc `{ data }` vs JSON phẳng | Giữ nhất quán hoặc để FE đọc cả hai (đã hỗ trợ một phần) |
| `/api/health` | Thêm nếu CI cần |
| Re-inspection trên `/api/admin` | Đảm bảo INSPECTOR được phép giống Node |
| ID user prefix `U` | Đồng bộ `/me` và các API trả `sellerId` / `userId` |

---

*Tài liệu này được mở rộng để phục vụ chuyển giao chi tiết (monorepo BE2). Cập nhật khi contract API hoặc `SecurityConfig` thay đổi — đồng thời ghi [CHANGELOG.md](CHANGELOG.md).*
