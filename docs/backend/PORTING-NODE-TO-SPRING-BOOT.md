# Hướng dẫn chuyển từ NodeJS (Express) sang Java Spring Boot – ShopBike Backend

> Mục tiêu: giúp BE/AI có thể đọc nhanh backend NodeJS hiện tại và **implement lại 1 backend Java Spring Boot** tương thích với Frontend (FE2) **mà không cần sửa code FE**.

---

## 1. Tổng quan hệ thống hiện tại

- **Base URL:** `http://localhost:8081/api`
- **Stack hiện tại:** NodeJS, Express, MongoDB (Mongoose), JWT
- **Thư mục gốc backend:** `backend/`
- **Luồng chính:** 
  - Auth (login/signup/me, reset password)
  - Bikes (marketplace public: danh sách + chi tiết)
  - Buyer (orders + payments)
  - Seller (CRUD listing, submit kiểm định)
  - Inspector (review listing, approve / reject / need-update)

Chi tiết cấu trúc: `docs/backend/STRUCTURE.md`  
Contract FE–BE (request/response, enum, giá trị chuẩn): `docs/HUONG-DAN-BACKEND.md`

---

## 2. Data model – map sang Entity Spring

### 2.1 User

File: `backend/src/models/User.js`

Trường chính:

- `email: string` – unique, required
- `passwordHash: string` – bcrypt hash
- `role: "BUYER" | "SELLER" | "INSPECTOR" | "ADMIN"`
- `displayName: string`
- `resetPasswordToken: string | null`
- `resetPasswordExpiresAt: Date | null`

Gợi ý Entity Spring:

- Bảng: `users`
- Cột nên có:
  - `id` (UUID hoặc Long)
  - `email` (unique)
  - `password_hash`
  - `role` (`ENUM` hoặc `VARCHAR`, map sang `UserRole` enum)
  - `display_name`
  - `reset_password_token`
  - `reset_password_expires_at`

### 2.2 Listing (tin đăng xe)

File: `backend/src/models/Listing.js`

Trường chính (FE đang dùng):

- `title: string`
- `brand: string`
- `model: string`
- `year: number | null`
- `frameSize: string`
- `condition: "NEW" | "LIKE_NEW" | "MINT_USED" | "GOOD_USED" | "FAIR_USED" | null`
- `price: number`
- `msrp: number | null`
- `currency: "USD" | "VND"`
- `location: string`
- `thumbnailUrl: string`
- `imageUrls: string[]`
- `state: "DRAFT" | "PENDING_INSPECTION" | "NEED_UPDATE" | "PUBLISHED" | "RESERVED" | "IN_TRANSACTION" | "SOLD" | "REJECTED"`
- `inspectionResult: "APPROVE" | "REJECT" | "NEED_UPDATE" | null`
- `inspectionScore: number | null` (0..5)
- `inspectionSummary: string`
- `inspectionNeedUpdateReason: string`
- `specs: array` (FE dùng dạng `{ label, value }`)
- `description: string`
- `seller: { id: ObjectId(User), name: string, email: string }`

Gợi ý Entity Spring:

- Bảng: `listings`
- Gợi ý cột:
  - `id`
  - `title`, `brand`, `model`, `year`, `frame_size`
  - `condition` (`ENUM` hoặc `VARCHAR`)
  - `price`, `msrp`, `currency`
  - `location`
  - `thumbnail_url`
  - `image_urls` – có thể dùng bảng phụ `listing_images` hoặc `TEXT JSON`
  - `state` (`ENUM` ListingState)
  - `inspection_result` (`ENUM`)
  - `inspection_score`, `inspection_summary`, `inspection_need_update_reason`
  - `description`
  - `seller_id` (FK -> users)

### 2.3 Order (đơn đặt xe)

File: `backend/src/models/Order.js`

Trường chính:

- `buyerId: ObjectId(User)`
- `listingId: ObjectId(Listing)`
- `status: "PENDING" | "RESERVED" | "IN_TRANSACTION" | "COMPLETED" | "CANCELLED" | "REFUNDED"`
- `plan: "DEPOSIT" | "FULL"`
- `totalPrice: number`
- `depositAmount: number`
- `depositPaid: boolean`
- `shippingAddress: { street, city, postalCode }`
- `expiresAt: Date | null`
- `listing: any` (snapshot để hiển thị, FE không yêu cầu bắt buộc)

Gợi ý Entity Spring:

- Bảng: `orders`
- Cột: `id`, `buyer_id`, `listing_id`, `status`, `plan`, `total_price`, `deposit_amount`, `deposit_paid`, `shipping_street`, `shipping_city`, `shipping_postal_code`, `expires_at`.
- Có thể bỏ trường `listing` snapshot hoặc lưu JSON nếu cần.

---

## 3. API & Controller – map từ Express sang Spring MVC

### 3.1 Auth

Express (`backend/src/routes/authRoutes.js` + `authController.js`):

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Spring Boot tương ứng:

- `@RestController`
- `@RequestMapping("/api/auth")`
- Methods:
  - `POST /signup` – nhận body đúng với `docs/HUONG-DAN-BACKEND.md`, trả JWT trong `accessToken`.
  - `POST /login`
  - `GET /me` – đọc user từ JWT.
  - `POST /forgot-password`, `POST /reset-password` – có thể mock ban đầu.

### 3.2 Bikes (public marketplace)

Routes:

- `GET /api/bikes` – danh sách tin đã PUBLISHED + APPROVE
- `GET /api/bikes/:id` – chi tiết 1 xe

Spring:

- `@RestController`
- `@RequestMapping("/api/bikes")`
- `GET "/"` và `GET "/{id}"` trả JSON đúng contract.

### 3.3 Buyer (orders + payments)

Routes chính (xem `backend/README.md`):

- `POST /api/buyer/orders`
- `GET /api/buyer/orders`
- `GET /api/buyer/orders/:id`
- `PUT /api/buyer/orders/:id/complete`
- `PUT /api/buyer/orders/:id/cancel`
- `POST /api/buyer/payments/initiate`

Spring:

- `@RestController`
- `@RequestMapping("/api/buyer")`
- Dùng `@PreAuthorize("hasRole('BUYER')")` hoặc custom filter để giới hạn role.

### 3.4 Seller (FE2)

Routes:

- `GET /api/seller/dashboard`
- `GET /api/seller/listings`
- `GET /api/seller/listings/:id`
- `POST /api/seller/listings`
- `PUT /api/seller/listings/:id`
- `PUT /api/seller/listings/:id/submit` – seller gửi tin để inspector kiểm định.

Flow chính:

- Seller tạo/ sửa listing (state `DRAFT`).
- Khi `submit`, backend:
  - xác nhận đủ dữ liệu (ảnh, giá, ...),
  - chuyển `state` → `PENDING_INSPECTION`,
  - để inspector thấy trong danh sách pending.

### 3.5 Inspector (FE2)

Routes:

- `GET /api/inspector/pending-listings`
- `GET /api/inspector/listings/:id`
- `PUT /api/inspector/listings/:id/approve`
- `PUT /api/inspector/listings/:id/reject`
- `PUT /api/inspector/listings/:id/need-update`

Flow:

- Inspector xem danh sách listing có `state = PENDING_INSPECTION`.
- Khi approve:
  - `inspectionResult = "APPROVE"`
  - `state = "PUBLISHED"`
  - cập nhật `inspectionScore`, `inspectionSummary` (nếu có).
- Khi reject: `inspectionResult = "REJECT"`, `state = "REJECTED"`.
- Khi cần update:
  - `inspectionResult = "NEED_UPDATE"`
  - `state = "NEED_UPDATE"`
  - ghi lý do vào `inspectionNeedUpdateReason`.

---

## 4. Auth & JWT – map middleware sang Spring Security

### 4.1 Cách làm hiện tại (Node)

- Middleware đọc header `Authorization: Bearer <token>`.
- Verify JWT, gắn `req.user = { id, role, ... }`.
- `requireAuth` kiểm tra có user hay không.
- `requireRole("SELLER")` hoặc `requireRole("INSPECTOR")` kiểm tra role.

### 4.2 Gợi ý Spring Security

- Dùng `UsernamePasswordAuthenticationToken` + `OncePerRequestFilter`:
  - parse header Authorization,
  - validate JWT (HS256/RS256 tùy config),
  - load user từ DB (hoặc từ token),
  - set `SecurityContextHolder.getContext().setAuthentication(...)`.
- Cấu hình:
  - `/api/auth/**` cho phép anonymous.
  - `/api/bikes/**` cho phép anonymous (GET).
  - `/api/buyer/**` → cần role BUYER.
  - `/api/seller/**` → cần role SELLER.
  - `/api/inspector/**` → cần role INSPECTOR hoặc ADMIN.

---

## 5. Error handling & HTTP response

Trong Node:

- Dùng `ErrorWithStatus` và `defaultErrorHandler` để chuẩn hóa response.
- Helper `utils/http.js` để trả về `ok`, `created`, `badRequest`, ... với JSON.

Khi port sang Spring Boot:

- Dùng `@ControllerAdvice` + `@ExceptionHandler` để map exception → HTTP status + JSON:
  - Ví dụ body `{ "message": "Invalid credentials" }` cho 401.
- Tôn trọng contract trong `docs/HUONG-DAN-BACKEND.md`:
  - Login sai → 401 + `{ "message": "Invalid credentials" }`.
  - Not found → 404 (body có thể `"message": "Not found"`).
  - Validation lỗi → 400/422 với message rõ ràng.

---

## 6. Checklist chuyển giao cho Java Spring Boot

1. **Đọc kỹ** `docs/HUONG-DAN-BACKEND.md` để nắm full contract FE–BE.
2. Thiết kế lại **schema database** (PostgreSQL/MySQL) dựa trên các model:
   - `User`, `Listing`, `Order` (xem mục 2).
3. Implement:
   - Entity + Repository (`User`, `Listing`, `Order`).
   - `AuthController`, `BikesController`, `BuyerController`, `SellerController`, `InspectorController` với các path tương ứng.
   - Spring Security + JWT filter cho role-based access như trên.
4. Đảm bảo:
   - Base URL: `http://localhost:8081/api` (config `server.port=8081`, `server.servlet.context-path=/api` hoặc prefix trong `@RequestMapping`).
   - JSON field, enum, status code **giống** mô tả (không đổi tên field FE đang dùng).
5. Test nhanh với Frontend:
   - Cấu hình `.env` FE:
     ```
     VITE_API_BASE_URL=http://localhost:8081/api
     VITE_USE_MOCK_API=false
     ```
   - Chạy FE (`npm run dev`) và test login, danh sách xe, chi tiết xe, flow Seller + Inspector.

Chỉ cần Spring Boot tuân theo API contract hiện có, FE2 sẽ dùng được backend Java **mà không phải sửa logic ở phía frontend**.
