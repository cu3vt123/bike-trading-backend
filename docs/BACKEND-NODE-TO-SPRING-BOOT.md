# Chuyển giao API ShopBike sang Spring Boot (IntelliJ) — MySQL & JPA

> **Tài liệu chính cho Backend Java:** triển khai và hoàn thiện API trên **Spring Boot**, làm việc trong **IntelliJ IDEA**, persistence chuẩn **`MySQL` + JPA (Hibernate)** theo **ERD / SQL** trong repo.  
> **Frontend React (Vite)** giữ nguyên nếu URL và JSON khớp `apiClient` / `docs` audit.  
> Thư mục **`backend/`** (Express) chỉ còn vai trò **tham chiếu hợp đồng HTTP** (path, method, body) khi cần đối chiếu — **không** dùng MongoDB làm nền cho bản Spring; mô hình dữ liệu chuẩn là **quan hệ SQL**.

**Nhánh:** **`BE2`** — monorepo: Spring + FE; folder `backend/` tùy chọn khi dev so contract.

---

## Mục lục

1. [Mục đích & đối tượng](#1-mục-đích--đối-tượng)  
2. [IntelliJ + Spring — đọc gì trước, sửa code ở đâu](#2-intellij--spring--đọc-gì-trước-sửa-code-ở-đâu)  
3. [Thiết kế cơ sở dữ liệu SQL (ưu tiên)](#3-thiết-kế-cơ-sở-dữ-liệu-sql-ưu-tiên)  
4. [Bối cảnh monorepo BE2](#4-bối-cảnh-monorepo-be2)  
5. [Môi trường Spring & Frontend](#5-môi-trường-spring--frontend)  
6. [Cấu trúc package Spring](#6-cấu-trúc-package-spring)  
7. [Tham chiếu tùy chọn: Express trong `backend/`](#7-tham-chiếu-tùy-chọn-express-trong-backend)  
8. [Nguyên tắc tương thích Frontend](#8-nguyên-tắc-tương-thích-frontend)  
9. [Ánh xạ tầng kỹ thuật → Spring](#9-ánh-xạ-tầng-kỹ-thuật--spring)  
10. [Bảo mật: JWT, role](#10-bảo-mật-jwt-role)  
11. [Danh mục endpoint REST — chuẩn contract](#11-danh-mục-endpoint-rest--chuẩn-contract)  
12. [Class Spring trong repo](#12-class-spring-trong-repo)  
13. [Hợp đồng JSON then chốt](#13-hợp-đồng-json-then-chốt)  
14. [Enum & trạng thái](#14-enum--trạng-thái)  
15. [Business rules (tóm tắt)](#15-business-rules-tóm-tắt)  
16. [Luồng VNPay](#16-luồng-vnpay)  
17. [CORS, health](#17-cors-health)  
18. [Checklist hoàn thiện Spring](#18-checklist-hoàn-thiện-spring)  
19. [Kiểm thử thủ công](#19-kiểm-thử-thủ-công)  
20. [Ví dụ `curl`](#20-ví-dụ-curl)  
21. [Tài liệu liên quan](#21-tài-liệu-liên-quan)  
22. [Quy trình chất lượng](#22-quy-trình-chất-lượng)  
23. [Bảng theo dõi lệch Spring ↔ FE](#23-bảng-theo-dõi-lệch-spring--fe)

---

## 1. Mục đích & đối tượng

| Câu hỏi | Trả lời |
|---------|---------|
| **Mục tiêu** | Một backend **Spring Boot + MySQL** thỏa: prefix `/api`, JWT, role, JSON tương thích FE; schema rõ ràng trong **ERD-SPEC / SQL**. |
| **Ai đọc chính?** | Dev Backend Java — mở project trong **IntelliJ**, chạy `BikeTradingBackendApplication`, chỉnh `application.properties`, entity/repository/controller. |
| **Ai đọc phụ?** | QA — kịch bản mục 19 + [QUICK-REFERENCE.md](QUICK-REFERENCE.md); FE — mục 8; PM — BR [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md). Làm việc chung: [BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md). |
| **Không dùng gì làm chuẩn persistence?** | **MongoDB / Mongoose** — không phải mục tiêu triển khai Spring trong đề án này; chỉ có thể xuất hiện ở folder demo `backend/` (lệch với SQL). |

**Tra cứu API:** [QUICK-REFERENCE.md](QUICK-REFERENCE.md).  
**Contract chi tiết từng nhóm:** [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md), [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md).

---

## 2. IntelliJ + Spring — đọc gì trước, sửa code ở đâu

**Ngày đầu (ưu tiên Spring + SQL):**

1. [README.md](../README.md) — mục **Dành cho Backend (Java Spring Boot, IntelliJ)** + biến `VITE_*`.  
2. [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) — MySQL bật, DB trống khớp `spring.datasource.*`, **không** chạy đồng thời Node trên cùng cổng 8081 nếu đang test Spring.  
3. **Mục 3 dưới đây** — ERD / SQL trước khi viết nhiều controller.  
4. [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) — bảng, FK, ENUM.  
5. Mở **Swagger**: `http://localhost:8081/swagger-ui/index.html` (port theo `server.port`).  
6. Chỉ khi cần đối chiếu hành vi cũ: xem mục 7 (Express) hoặc file tương ứng trong `backend/src/`.

**Trong IntelliJ — vị trí code Spring:**

| Loại | Package / file |
|------|----------------|
| Entry | `BikeTradingBackendApplication.java` |
| REST | `com.biketrading.backend.controller/*Controller.java` |
| Entity | `.../entity/*.java` |
| Enum | `.../enums/*.java` |
| Repository | `.../repository/*Repository.java` |
| DTO | `.../dto/*Request.java`, response tùy convention |
| Security | `.../security/SecurityConfig.java`, `JwtAuthenticationFilter.java`, `JwtTokenProvider.java` |
| Exception | `.../exception/GlobalExceptionHandler.java` |
| Seed | `.../config/DatabaseSeeder.java` |
| VNPay | `.../config/VNPayConfig.java`, controller thanh toán (nếu có) |
| Cấu hình | `src/main/resources/application.properties` |

---

## 3. Thiết kế cơ sở dữ liệu SQL (ưu tiên)

| Nguồn | Dùng để |
|-------|---------|
| [ERD-SPEC.md](ERD-SPEC.md) | Cột, kiểu, ENUM string, FK — map sang `@Entity`, `@ManyToOne`, … |
| [ERD-MYSQL.md](ERD-MYSQL.md) | 17 bảng, quan hệ, đọc nhanh schema |
| [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | Import / đối chiếu `ddl-auto`, review migration |
| [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | Thứ tự áp dụng script / migration |

**Nguyên tắc:**

- **Khóa chính:** thường `BIGINT` / `Long` — JSON trả về cho FE có thể là string (`id`, `listingId`) — **giữ nhất quán** với FE types.  
- **Snapshot đơn hàng:** theo ERD (cột JSON hoặc bảng snapshot) — không phụ thuộc MongoDB.  
- **Listing / Order / User / Payment:** tất cả qua bảng quan hệ; VietQR (nếu dùng module demo) là **SQLite riêng** trong bản Node — Spring production lấy **VNPay + bảng thanh toán MySQL** theo [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) và BR.

**JPA:** `spring.jpa.hibernate.ddl-auto` theo môi trường team (dev thường `update`; production nên migration có kiểm soát).

---

## 4. Bối cảnh monorepo BE2

| Thành phần | Đường dẫn | Ghi chú |
|------------|-----------|---------|
| **Spring Boot** | `pom.xml`, `src/main/java/`, `src/main/resources/` | Backend chính — **MySQL**. |
| **Frontend** | `src/app/`, `src/features/`, `src/apis/`, … | Cùng cây `src/` với `src/main/java` — cẩn thận khi refactor. |
| **`backend/` (Express)** | Tùy chọn | Chỉ để so **HTTP contract**; **không** copy mô hình DB Mongo sang Spring. |

---

## 5. Môi trường Spring & Frontend

### 5.1 Spring (`src/main/resources/application.properties`)

- **Datasource MySQL:** URL, user, password — không commit mật khẩu; có thể `application-local.properties` (gitignored).  
- **`server.port`:** thường `8081`.  
- **JWT:** `app.jwtSecret`, `app.jwtExpirationInMs`.  
- **VNPay sandbox:** `vnpay.*` — [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md).

### 5.2 Frontend (root repo)

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8081/api
# VITE_USE_MOCK_API=false
```

### 5.3 Upload ảnh listing (Spring)

- Multipart giống mục 13.6; lưu file (local `uploads/listings/` hoặc storage).  
- URL công khai: biến kiểu **public base URL** khi build link lưu DB.  
- Static: `WebMvcConfigurer.addResourceHandlers` cho `/uploads/**` hoặc CDN — khớp path mà FE hiển thị trong `<img>`.

---

## 6. Cấu trúc package Spring

```
src/main/java/com/biketrading/backend/
├── BikeTradingBackendApplication.java
├── controller/
├── entity/
├── repository/
├── dto/
├── enums/
├── security/
├── exception/
└── config/
```

---

## 7. Tham chiếu tùy chọn: Express trong `backend/`

Chỉ dùng khi cần xem **cách cũ** map request → response (không lấy schema DB):

```
backend/src/
├── server.js
├── routes/*.js
├── controllers/*.js
├── middlewares/
└── ...
```

**Persistence Express:** không áp dụng cho Spring — Spring dùng **JPA + MySQL** theo mục 3.

---

## 8. Nguyên tắc tương thích Frontend

| Hạng mục | Kỳ vọng FE | Spring |
|----------|------------|--------|
| Base URL | `VITE_API_BASE_URL` + `/api/...` | `@RequestMapping("/api/...")` thống nhất |
| JSON | Nhiều chỗ `{ "data": ... }` | `ResponseEntity` hoặc wrapper — FE đã unwrap `data` ở một số API |
| Lỗi | `{ "message": "..." }` | `GlobalExceptionHandler` |
| Auth | `Authorization: Bearer` | JWT filter + `SecurityContext` |
| Role | `BUYER`, `SELLER`, `INSPECTOR`, `ADMIN` | `hasRole` / `hasAnyRole` — lưu ý prefix `ROLE_` trong Spring Security |

---

## 9. Ánh xạ tầng kỹ thuật → Spring

| Khái niệm | Spring Boot |
|-----------|-------------|
| Router + handler | `@RestController` + `@ControllerAdvice` |
| Auth middleware | `SecurityFilterChain`, `@PreAuthorize` |
| **Schema / DB** | **`@Entity` + JPA + MySQL** — không dùng document DB cho core |
| Validate body | `@Valid`, Bean Validation, validator custom |
| Multipart | `MultipartFile`, `spring.servlet.multipart.*` |
| File tĩnh | `ResourceHandlerRegistry` hoặc CDN |
| Response JSON | `ResponseEntity`, `Map.of("data", x)` nếu team chọn bọc `data` |

---

## 10. Bảo mật: JWT, role

### 10.1 FE gửi token

`apiClient` gắn `Authorization: Bearer` — giữ nguyên khi đổi implementation controller.

### 10.2 `hasAnyRole` khớp UX (đối chiếu bản Express cũ)

| Nhóm route | Khuyến nghị |
|------------|-------------|
| `/api/buyer/**` | `BUYER` và **ADMIN** (admin test luồng buyer) |
| `/api/inspector/**` | `INSPECTOR` và **ADMIN** |
| `/api/admin/orders/re-inspection*` | `ADMIN` và **INSPECTOR** |

Cập nhật `SecurityConfig` và ghi chú PR.

### 10.3 JWT claims

Token phải đủ để map **user** → `UserRepository` (id/username) giống logic filter hiện tại.

---

## 11. Danh mục endpoint REST — chuẩn contract

Spring cần phủ **cùng path + method** với bảng dưới (đã thống nhất với FE). Có thể đối chiếu thêm file route trong `backend/` nếu cần.

### 11.1 Auth — `/api/auth`

| Method | Path | Ghi chú |
|--------|------|---------|
| POST | `/signup` | |
| POST | `/login` | `emailOrUsername`, `password` |
| GET | `/me` | Bearer |
| POST | `/forgot-password` | có thể stub |
| POST | `/reset-password` | có thể stub |

### 11.2 Bikes — `/api/bikes`

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/` | PUBLISHED |
| GET | `/:id` | RESERVED/SOLD → thường 404 |

### 11.3 Buyer — `/api/buyer`

| Method | Path | Ghi chú |
|--------|------|---------|
| POST | `/orders/vnpay-checkout` | `fulfillmentType` do BE; disclaimer nếu chưa CERTIFIED |
| POST | `/orders/:id/vnpay-resume` | |
| POST | `/orders/:id/vnpay-pay-balance` | |
| POST | `/orders` | legacy — FE ưu tiên VNPAY |
| GET | `/orders` | |
| GET | `/orders/:id` | đủ `sellerId`, `listing` cho Success/review |
| PUT | `/orders/:id/complete` | |
| PUT | `/orders/:id/cancel` | |
| POST | `/orders/:id/review` | |
| POST | `/payments/initiate` | legacy |
| GET | `/reviews` | |

### 11.4 Seller — `/api/seller`

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/dashboard`, `/ratings`, `/orders` | |
| PUT | `/orders/:orderId/ship-to-buyer`, `ship-to-warehouse` | |
| PUT | `/listings/:id/mark-shipped-to-warehouse` | |
| GET | `/listings`, `/listings/:id` | |
| POST | `/listings/upload-images` | multipart `images` — xem mục 13.6 |
| POST, PUT | `/listings`, `/listings/:id` | |
| PUT | `/listings/:id/publish`, `/submit` | |
| POST | `/subscription/checkout` | |
| POST | `/subscription/orders/:orderId/mock-complete` | dev |
| PUT | `/subscription/revoke-self` | |

### 11.5 Inspector — `/api/inspector`

| Method | Path |
|--------|------|
| GET | `/pending-listings` |
| GET | `/listings/:id` |
| PUT | `/listings/:id/approve`, `/reject`, `/need-update` |

### 11.6 Admin — `/api/admin`

| Method | Path | Role |
|--------|------|------|
| GET | `/orders/warehouse-pending` | ADMIN |
| PUT | `/orders/:id/confirm-warehouse` | ADMIN |
| GET | `/orders/re-inspection` | ADMIN, INSPECTOR |
| PUT | `/orders/:id/re-inspection-done` | ADMIN, INSPECTOR |
| GET | `/dashboard/stats` | ADMIN |
| GET/PUT | `/users`, hide/unhide | ADMIN |
| GET/PUT | `/seller-subscriptions`, revoke | ADMIN |
| GET/PUT | `/listings/...`, `/reviews/...`, `/brands` CRUD | ADMIN (+ inspector một số route warehouse) |

### 11.7 Public

| GET | `/api/brands`, `/api/packages`, `/api/health` |

### 11.8 VNPay

Return URL / IPN khớp `application.properties` — chi tiết [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md).

### 11.9 Static ảnh

`GET /uploads/listings/*` — URL lưu DB phải mở được từ browser.

---

## 12. Class Spring trong repo

| Controller | `@RequestMapping` (kiểm tra file) |
|------------|-----------------------------------|
| `AuthController` | `/api/auth` |
| `BikeController` | `/api/bikes` |
| `BuyerController` | `/api/buyer` |
| `SellerController` | `/api/seller` |
| `InspectorController` | `/api/inspector` |
| `AdminController` | `/api/admin` |
| `PackageController` | packages / subscription |
| `PaymentController` | VNPay |

Bổ sung endpoint: giữ path mục 11; cập nhật springdoc nếu bật.

---

## 13. Hợp đồng JSON then chốt

### 13.1 Login — `POST /api/auth/login`

```json
{ "emailOrUsername": "string", "password": "string" }
```

Response: `accessToken`, `role`, `subscription` (seller) — xem `authApi.ts`.

### 13.2 `GET /api/auth/me`

Khớp `MeResponse`: `id`, `email`, `displayName`, `role`, `subscription?`.

### 13.3 `POST /api/buyer/orders/vnpay-checkout`

`listingId` là **string** (ID bản ghi trong MySQL — thường numeric string); **`fulfillmentType` không gửi từ FE**.

```json
{
  "listingId": "123",
  "plan": "DEPOSIT",
  "shippingAddress": { "street": "", "city": "", "postalCode": "" },
  "acceptedUnverifiedDisclaimer": true
}
```

### 13.4 `GET /api/buyer/orders/:id`

Đủ field: `status`, `plan`, `fulfillmentType`, `depositPaid`, `balancePaid`, `shippingAddress`, `listing` snapshot, `sellerId`, …

### 13.5 `PUT /api/seller/orders/:orderId/ship-to-buyer`

Chỉ DIRECT + đúng trạng thái nghiệp vụ.

### 13.6 Upload ảnh — `POST /api/seller/listings/upload-images`

| Hạng mục | Giá trị |
|----------|---------|
| Content-Type | `multipart/form-data` |
| Field | `images` (lặp, tối đa 10 file) |
| MIME | jpeg, png, webp, gif |
| Size | ≤ 5 MB/file |

```json
{
  "data": {
    "urls": ["http://localhost:8081/uploads/listings/....jpg"]
  }
}
```

Spring: `@RequestParam("images") MultipartFile[]`, cấu hình `max-file-size`, static handler hoặc CDN.

---

## 14. Enum & trạng thái

- **Order:** xem `OrderStatus.java` — JSON **UPPER_SNAKE** khớp FE.  
- **Listing:** xem `ListingState.java` + BR.  
- **fulfillmentType:** `WAREHOUSE` | `DIRECT`.

---

## 15. Business rules (tóm tắt)

- **WAREHOUSE:** luồng kho / admin / re-inspection — theo [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md).  
- **DIRECT:** seller giao thẳng; không dùng `confirm-warehouse` cho direct.  
- **Thanh toán:** VNPay; DEPOSIT 8% — đối chiếu code với BR (tránh hard-code sai).  
- **Seller `GET /orders`:** filter warehouse **hoặc** direct pending ship — logic tương đương query SQL.

Chi tiết: BR + `buyerController` / `adminController` **chỉ khi đọc tham chiếu Express**; implementation Spring theo entity + service Java.

---

## 16. Luồng VNPay

1. `POST /buyer/orders/vnpay-checkout` → `paymentUrl`.  
2. Redirect VNPay.  
3. Return URL → cập nhật đơn / `depositPaid`.  
4. IPN idempotent.

---

## 17. CORS, health

- **Spring:** `CorsConfig` — `http://localhost:5173`.  
- **`GET /api/health`:** thêm nếu CI cần.

---

## 18. Checklist hoàn thiện Spring

| # | Việc |
|---|------|
| 1 | `SecurityConfig` — `hasAnyRole` mục 10 |
| 2 | Auth JSON |
| 3 | `/bikes`, `/bikes/:id` |
| 4 | Buyer: checkout, resume, pay-balance, order, cancel, complete, review |
| 5 | Seller: dashboard, orders, listings, **upload**, publish, submit, subscription |
| 6 | Static `/uploads/listings/**` |
| 7 | Inspector + `GET /listings/:id` |
| 8 | Admin: warehouse, re-inspection, users, listings, reviews, brands, stats |
| 9 | VNPay return/IPN |
| 10 | Seed / SQL demo |
| 11 | E2E với `VITE_USE_MOCK_API=false` |

---

## 19. Kiểm thử thủ công

| # | Actor | Bước |
|---|-------|------|
| 1 | Guest | Home → `/bikes/:id` |
| 2 | Buyer | Checkout → VNPay sandbox → transaction → finalize → success → review |
| 3 | Buyer | WAREHOUSE — các bước kho/admin |
| 4 | Seller | Tạo tin → upload ảnh → publish → orders |
| 5 | Inspector | Pending → approve/reject |
| 6 | Admin | Warehouse, re-inspection, users, brands |
| 7 | Admin | Thử flow buyer (nếu đã mở quyền) |

Ghi **HTTP status**, **JSON**, log SQL (`show-sql=true`) khi báo bug.

---

## 20. Ví dụ `curl`

```bash
curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"buyer_tuan","password":"123"}'

curl -s http://localhost:8081/api/auth/me -H "Authorization: Bearer TOKEN"

curl -s http://localhost:8081/api/bikes

curl -s -X POST http://localhost:8081/api/buyer/orders/vnpay-checkout \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"listingId":"YOUR_LISTING_ID","plan":"DEPOSIT","shippingAddress":{"street":"A","city":"HN"},"acceptedUnverifiedDisclaimer":true}'

curl -s -X POST http://localhost:8081/api/seller/listings/upload-images \
  -H "Authorization: Bearer TOKEN" \
  -F "images=@/path/to/photo1.jpg"
```

---

## 21. Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | API, env |
| [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md), [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Mapping FE |
| [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | **SQL / JPA** |
| [STRUCTURE.md](STRUCTURE.md) | FE + ghi chú `src/main/java` |
| [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) | Chạy local |
| [README.md](../README.md) | Monorepo BE2 |
| [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | Chỉ khi cần chạy folder `backend/` (Express) — không phải chuẩn SQL |

---

## 22. Quy trình chất lượng

- Swagger / OpenAPI khi API ổn định.  
- PR: mô tả endpoint + test (`mvn test` hoặc manual mục 19).  
- Không commit secret DB / VNPay.

---

## 23. Bảng theo dõi lệch Spring ↔ FE

| Hạng mục | Ghi chú |
|----------|---------|
| Role ADMIN trên buyer/inspector | `SecurityConfig` |
| DEPOSIT 8% vs hard-code | Đồng bộ BR |
| `{ data }` vs phẳng | FE đã unwrap một phần |
| `/api/health` | Thêm nếu cần |
| ID `listingId` / `userId` | Chuỗi số từ Long — nhất quán `/me` |
| Upload + static `/uploads` | Multipart + URL công khai |

---

*Tài liệu này mô tả **chuyển giao sang Spring Boot (IntelliJ) với MySQL / JPA**; folder Express trong `backend/` chỉ là tham chiếu contract HTTP. Cập nhật khi API hoặc ERD thay đổi — ghi [CHANGELOG.md](CHANGELOG.md).*
