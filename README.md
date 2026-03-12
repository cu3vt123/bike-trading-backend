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
| `docs/README.md` | Mục lục toàn bộ tài liệu (docs + docs/backend) |
| `docs/CHANGELOG.md` | Lịch sử thay đổi |
| `docs/ERD-SPEC.md` | Đặc tả ERD |
| `docs/KIEM-KE-HE-THONG.md` | Kiểm kê hệ thống |

---

## Backend cho FE2 (Seller + Inspector)

Backend MERN demo được đặt trong thư mục `backend/`, dùng để phục vụ toàn bộ flow FE2 (auth, buyer, **seller**, **inspector**, orders/payments).

- **Công nghệ**: Node.js, Express, MongoDB (Mongoose), JWT, `mongodb-memory-server` (có thể chạy không cần cài Mongo cục bộ).
- **Cấu trúc chính**:
  - `backend/src/server.js`: khởi động Express, mount tất cả routes dưới `/api`.
  - `backend/src/models/`: `User.js`, `Listing.js`, `Order.js`, `Review.js`, `Errors.js`.
  - `backend/src/controllers/`: `authController`, `bikesController`, `buyerController`, `sellerController`, `inspectorController`, `adminController`, `paymentController`, `reviewController`.
  - `backend/src/routes/`: `authRoutes`, `bikesRoutes`, `buyerRoutes`, `sellerRoutes`, `inspectorRoutes`, `adminRoutes`.
  - `backend/src/middlewares/` + `backend/src/middleware/auth.js`: auth JWT, error handling.
  - `backend/src/seed.js`: seed demo data cho Buyer/Seller/Inspector/Admin.
- **Endpoints chính (phục vụ FE2)** – chi tiết hơn xem:
  - `backend/README.md` – tóm tắt cách chạy + danh sách endpoint.
  - `docs/HUONG-DAN-BACKEND.md` – mô tả request/response chi tiết để BE Java Spring Boot implement theo.

---

## Gợi ý cho backend (Java Spring Boot) khi vào nhánh `ui-ux`

Khi backend dev checkout nhánh `ui-ux`, thứ tự đọc khuyến nghị:

1. **Đọc contract API** (biết FE cần gì):  
   - `docs/HUONG-DAN-BACKEND.md`
2. **Đọc cách chạy full dự án FE + BE** (nếu muốn tự demo cả 2):  
   - `docs/RUN-FULL-PROJECT.md`
3. **Nếu muốn tham khảo backend NodeJS demo** (không bắt buộc chạy, chỉ để nhìn logic):  
   - `backend/README.md`  
   - `docs/backend/DEMO-BACKEND-GUIDE.md`
4. **Nếu muốn port hoàn toàn sang Java Spring Boot**:
   - `docs/backend/PORTING-NODE-TO-SPRING-BOOT.md` – phân tích model + API để map sang Spring Boot.
   - `docs/backend/SPRING-BOOT-SKELETON.md` – skeleton project Spring Boot (pom, packages, controller mẫu, security).

### Cách để backend Spring Boot tự demo với frontend này

1. Backend tạo project Spring Boot (theo skeleton hoặc tự thiết kế), expose API với:
   - Base URL: `http://localhost:8081/api` (hoặc URL khác, nhưng cần trỏ lại trong `.env` của FE).
   - Đường dẫn + JSON giống `docs/HUONG-DAN-BACKEND.md` (auth, bikes, buyer, seller, inspector).
2. Trong frontend, tạo/sửa file `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8081/api   # trỏ tới backend Spring Boot
   VITE_USE_MOCK_API=false
   ```
3. Chạy FE:
   ```bash
   npm install
   npm run dev
   ```
4. Mở `http://localhost:5173` để demo.  
   Lúc này FE sẽ gọi trực tiếp backend Spring Boot của đội bạn, **không cần chạy backend NodeJS** trong thư mục `backend/`.

