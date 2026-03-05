# Hướng dẫn Backend Demo – ShopBike (NodeJS/Express)

> File này dành cho backend dev hoặc AI muốn **chạy thử nhanh backend NodeJS hiện tại**, hiểu luồng nghiệp vụ, rồi mới quyết định port sang Java Spring Boot nếu cần.

---

## 1. Mục tiêu backend demo

Backend demo trong thư mục `backend/` được thiết kế để:

- Phục vụ **đầy đủ luồng FE2**:
  - Đăng nhập / đăng ký, lấy profile.
  - Xem danh sách xe, chi tiết xe (marketplace).
  - Flow **Buyer**: tạo order, xem đơn, hoàn tất / hủy.
  - Flow **Seller**: tạo & chỉnh sửa listing, gửi đi kiểm định.
  - Flow **Inspector**: duyệt / từ chối / yêu cầu sửa lại listing.
- **Không cần cài MongoDB cục bộ** (dùng `mongodb-memory-server`).
- Data demo (Buyer/Seller/Inspector/Admin + vài listing) **seed tự động**.

---

## 2. Cách chạy nhanh

Trong thư mục gốc repo (nơi có thư mục `backend/`):

```bash
cd backend
npm install
cp .env.example .env   # nếu chưa có
npm run dev
```

- Server sẽ chạy tại: `http://localhost:8081/api`
- Lần chạy đầu tiên có thể tải MongoDB binary (≈ 600MB) cho in-memory Mongo.

### 2.1 Chạy với Mongo thật (tùy chọn)

Nếu muốn kết nối MongoDB thực:

1. Sửa `.env` và đặt:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/shopbike
   ```
2. Chạy seed để tạo tài khoản demo:
   ```bash
   npm run seed
   npm run dev
   ```

---

## 3. Tài khoản demo

Các tài khoản được seed sẵn (xem thêm trong `backend/README.md`):

- Buyer: `buyer@demo.com` / `Password!1`
- Seller: `seller@demo.com` / `Password!1`
- Inspector: `inspector@demo.com` / `Password!1`
- Admin: `admin@demo.com` / `Password!1`

FE đã cấu hình sẵn để login theo `role` tương ứng.

---

## 4. Kiến trúc tổng quan

Cấu trúc chi tiết: `backend/docs/STRUCTURE.md`. Tóm tắt:

```text
backend/
├── src/
│   ├── server.js                  # Entry point, mount routes /api
│   ├── seed.js                    # Seed demo data
│   ├── config/db.js               # Kết nối Mongo (hoặc in-memory)
│   ├── constants/                 # HTTP status, messages
│   ├── controllers/               # auth, bikes, buyer, seller, inspector, payment
│   ├── middlewares/               # error handler, auth middleware
│   ├── models/                    # User, Listing, Order, Errors
│   ├── routes/                    # authRoutes, bikesRoutes, buyerRoutes, sellerRoutes, inspectorRoutes
│   └── utils/                     # wrapAsync handler, helper http
└── docs/
    ├── STRUCTURE.md               # Cấu trúc chi tiết
    ├── PORTING-NODE-TO-SPRING-BOOT.md  # Hướng dẫn port sang Spring Boot
    └── DEMO-BACKEND-GUIDE.md      # (file hiện tại)
```

---

## 5. Các nhóm API chính

### 5.1 Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Response chi tiết và ví dụ JSON: xem `docs/HUONG-DAN-BACKEND.md`.

### 5.2 Bikes (public marketplace)

- `GET /api/bikes` – trả về danh sách listing đã `PUBLISHED` + `APPROVE`.
- `GET /api/bikes/:id` – chi tiết 1 listing.

### 5.3 Buyer

- `POST /api/buyer/orders` – tạo order (BE set `RESERVED`, tính `expiresAt`, v.v.).
- `GET /api/buyer/orders` – danh sách đơn của buyer hiện tại.
- `GET /api/buyer/orders/:id` – chi tiết order.
- `PUT /api/buyer/orders/:id/complete` – hoàn tất giao dịch (listing → `SOLD`).
- `PUT /api/buyer/orders/:id/cancel` – hủy, giải phóng listing.
- `POST /api/buyer/payments/initiate` – validate card/bank (demo sandbox).

### 5.4 Seller (FE2)

- `GET /api/seller/dashboard`
- `GET /api/seller/listings`
- `GET /api/seller/listings/:id`
- `POST /api/seller/listings`
- `PUT /api/seller/listings/:id`
- `PUT /api/seller/listings/:id/submit`

Luồng chính:

1. Seller tạo listing (state `DRAFT`).
2. Gửi `submit` → backend set `state = PENDING_INSPECTION`.
3. Inspector thấy listing trong danh sách pending.

### 5.5 Inspector (FE2)

- `GET /api/inspector/pending-listings`
- `GET /api/inspector/listings/:id`
- `PUT /api/inspector/listings/:id/approve`
- `PUT /api/inspector/listings/:id/reject`
- `PUT /api/inspector/listings/:id/need-update`

Inspector cập nhật:

- `inspectionResult` (APPROVE / REJECT / NEED_UPDATE)
- `state` (PUBLISHED / REJECTED / NEED_UPDATE)
- `inspectionScore`, `inspectionSummary`, `inspectionNeedUpdateReason` (nếu cần).

---

## 6. Cách FE gọi backend demo

Frontend cấu hình qua biến môi trường:

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

Khi đó:

- FE sẽ dùng `axios` client (`src/lib/apiClient.ts`) trỏ vào backend demo.
- Tất cả route FE2 (auth, bikes, buyer, seller, inspector) sẽ gọi đúng các endpoint liệt kê ở trên.

Nếu BE port sang Spring Boot, chỉ cần giữ nguyên:

- Base URL (`http://localhost:8081/api`)
- Path + JSON contract trong `docs/HUONG-DAN-BACKEND.md`

là FE không cần thay đổi code.

---

## 7. Khi muốn nâng cấp hoặc port sang Spring Boot

- Đọc `backend/docs/PORTING-NODE-TO-SPRING-BOOT.md` để xem:
  - mapping model `User`, `Listing`, `Order` → Entity.
  - mapping routes Express → `@RestController` trong Spring.
  - gợi ý Spring Security + JWT.
- Dựa vào hai file docs:
  - `docs/HUONG-DAN-BACKEND.md` (contract chi tiết FE–BE)
  - `backend/docs/PORTING-NODE-TO-SPRING-BOOT.md`

=> AI hoặc backend dev có thể tự sinh / viết backend Spring Boot tương thích hoàn toàn với FE mà không cần mở sâu code NodeJS.

