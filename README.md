# ShopBike Frontend

React + Vite frontend cho **Bike Trading** – mua bán xe đạp thể thao cũ.

---

## Chạy nhanh

```bash
copy .env.example .env
npm install
npm run dev
```

Mở `http://localhost:5173`.

---

## Cấu trúc (feature-based)

```
src/
├── app/          # Router, providers
├── features/     # auth, landing, bikes, buyer, seller, inspector, support
├── shared/       # components, layouts, constants
└── lib/          # env, apiClient, utils
```

Chi tiết: `docs/STRUCTURE.md`

---

## Chế độ chạy

| Chế độ | VITE_USE_MOCK_API | Cần Backend? |
|--------|-------------------|--------------|
| Mock | `true` | ❌ Không |
| API thật | `false` | ✅ Có |

---

## Tài liệu

| File | Nội dung |
|------|----------|
| `docs/STRUCTURE.md` | Cấu trúc, quy ước import |
| `docs/RUN-FULL-PROJECT.md` | Cách chạy toàn bộ dự án (FE + BE) |
| `docs/HUONG-DAN-BACKEND.md` | Contract API |
| `docs/API-SETUP.md` | Kết nối Backend |
| `docs/HUONG-DAN-DEMO.md` | Demo |
| `docs/FLOWS-AND-PROGRESS.md` | Luồng nghiệp vụ |
| `docs/CHANGELOG.md` | Lịch sử thay đổi |

---

## Backend cho FE2 (Seller + Inspector)

Backend MERN demo được đặt trong thư mục `backend/`, dùng để phục vụ toàn bộ flow FE2 (auth, buyer, **seller**, **inspector**, orders/payments).

- **Công nghệ**: Node.js, Express, MongoDB (Mongoose), JWT, `mongodb-memory-server` (có thể chạy không cần cài Mongo cục bộ).
- **Cấu trúc chính**:
  - `backend/src/server.js`: khởi động Express, mount tất cả routes dưới `/api`.
  - `backend/src/models/`: `User.js`, `Listing.js`, `Order.js`, `Errors.js`.
  - `backend/src/controllers/`: `authController`, `bikesController`, `buyerController`, `sellerController`, `inspectorController`, `paymentController`.
  - `backend/src/routes/`: `authRoutes`, `bikesRoutes`, `buyerRoutes`, `sellerRoutes`, `inspectorRoutes`.
  - `backend/src/middlewares/` + `backend/src/middleware/auth.js`: auth JWT, error handling.
  - `backend/src/seed.js`: seed demo data cho Buyer/Seller/Inspector/Admin.
- **Endpoints chính (phục vụ FE2)** – chi tiết hơn xem:
  - `backend/README.md` – tóm tắt cách chạy + danh sách endpoint.
  - `docs/HUONG-DAN-BACKEND.md` – mô tả request/response chi tiết để BE Java Spring Boot implement theo.

### Gợi ý cho AI / BE khi port sang Java Spring Boot

- Giữ nguyên **path API** và **payload JSON** như trong `docs/HUONG-DAN-BACKEND.md` (vd: `/api/auth/login`, `/api/bikes`, `/api/seller/listings`, `/api/inspector/pending-listings`, ...).
- Map:
  - `models/*.js` → `@Entity` + `JpaRepository` trong Spring (User, Listing, Order).
  - `controllers/*.js` → `@RestController` + `@RequestMapping("/api/...")`.
  - Middleware auth JWT → `OncePerRequestFilter` + `SecurityFilterChain` trong Spring Security.
- Sau khi Spring Boot implement xong, chỉ cần đảm bảo:
  - Base URL: `http://localhost:8081/api`
  - Format JSON và enum giá trị (role, condition, listing state, ...) khớp với `docs/HUONG-DAN-BACKEND.md`
  
Khi đó Frontend (FE2) có thể chuyển từ Node/Express sang Java Spring Boot mà **không cần sửa code FE**, chỉ cần cập nhật `.env` (`VITE_API_BASE_URL`) cho đúng backend mới.
