# Bike Trading — ShopBike (BE2 + Frontend)

Repo **nhánh mặc định BE2** gồm backend **Spring Boot** (Java) và frontend **React + Vite** (đồng bộ từ nhánh `demo`).

**Cấu trúc monorepo:** cùng thư mục `src/` — phía **Vite/React** (`src/app/`, `src/features/`, …) và phía **Spring** (`src/main/java/`, `src/main/resources/`). Maven/IDE dùng `src/main/java`; Vite bundle phần TS/TSX ở `src/` (không đụng Java).

---

## Phần A — Backend Spring Boot (BE2)

Mã nguồn backend cho Sàn Giao Dịch Xe Đạp Thể Thao.

### 1. Cài đặt môi trường
- **Java:** JDK 24
- **Database:** MySQL Workbench
- **IDE:** IntelliJ IDEA

### 2. Cách chạy
1. Bật MySQL Server (Start MySQL trên XAMPP).
2. Tạo database trắng tên `bike_trading_db`.
3. Mở IntelliJ, tìm `src/main/java/com/biketrading/backend/BikeTradingBackendApplication.java` (class chứa `main`).
4. Bấm **Run**.
5. Thấy `Started Application in ... seconds` là thành công.

### 3. Swagger UI
**[http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)**

### 4. Tài khoản test (mẫu)

| Vai trò | Username | Password | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Seller** | `shop_danang_vip` | `123` | Shop Đà Nẵng |
| **Buyer** | `buyer_tuan` | `123` | Test mua hàng |
| **Admin** | `admin` | `123` | Quản trị |

---

## Phần B — ShopBike Frontend (React + Vite)

Marketplace, checkout, seller/inspector/admin, i18n, theme.

### Cài đặt nhanh

```bash
cp .env.example .env   # chỉnh VITE_API_BASE_URL nếu cần
npm install
npm run dev
```

- **API thật:** `VITE_USE_MOCK_API=false` — có thể dùng Node backend trong `backend/` ([backend/README.md](backend/README.md)) hoặc Spring như trên.
- **Chỉ FE + mock:** `VITE_USE_MOCK_API=true`.

### Kết nối FE → API

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

```bash
npm install && npm run dev
```

Mở `http://localhost:5173`.

### Lệnh chất lượng

```bash
npm run lint
npm run build
```

### Tài liệu (docs/)

**Mục lục:** [docs/README.md](docs/README.md)

| Nhóm | File |
|------|------|
| Tra cứu | [QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md), [BE-FE-API-AUDIT.md](docs/BE-FE-API-AUDIT.md) |
| **Chuyển giao công nghệ (Node → Spring)** | [BACKEND-NODE-TO-SPRING-BOOT.md](docs/BACKEND-NODE-TO-SPRING-BOOT.md) — endpoint map, JWT, business rules, checklist |
| Backend Node (demo / đối chiếu) | [BACKEND-GUIDE.md](docs/BACKEND-GUIDE.md) |
| ERD / SQL | [ERD-MYSQL.md](docs/ERD-MYSQL.md), [sql/shopbike_mysql_schema.sql](docs/sql/shopbike_mysql_schema.sql) |

**Tài liệu local (không Git):** `docs/testing/` — xem [.gitignore](.gitignore) và [docs/README.md § Local-only](docs/README.md#local-only-documentation).

Checklist ship: [docs/PRODUCTION-HARDENING.md](docs/PRODUCTION-HARDENING.md).

---

## Thay đổi gần đây

| Ngày | Nội dung |
|------|----------|
| **2026-03-15** | Docs: monorepo `src/` (FE + Spring), sửa tên entry Spring; `.gitignore` thêm `.cursor/` (file local Cursor không commit). |
| **2026-03** | Chuẩn hóa lịch sử Git: bỏ trailer `Co-authored-by: Cursor <cursoragent@cursor.com>` khỏi message commit (GitHub Contributors). **Clone cũ:** `git fetch` + `git reset --hard origin/<nhánh>`. |
| **2026-03** | Merge nhánh `demo` vào `BE2`: đồng bộ frontend + docs + `backend/` Node demo; gộp `.gitignore` / README. |
