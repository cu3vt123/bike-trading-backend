# Bike Trading — ShopBike (BE2 + Frontend)

Repo **nhánh mặc định BE2** gồm backend **Spring Boot** (Java) và frontend **React + Vite** (đồng bộ từ nhánh `demo`).

**Monorepo:** cùng thư mục `src/` — **Vite/React** (`src/app/`, `src/features/`, `src/pages/`, …) và **Spring** (`src/main/java/`, `src/main/resources/`). Maven/IDE dùng `src/main/java`; Vite bundle phần TypeScript/TSX ở `src/` (không đụng Java).

---

## Sau khi clone hoặc pull (setup)

Mục tiêu: **vừa clone/pull về là chạy được** — không bỏ sót `npm install` hoặc file `.env`.

### Bước dùng chung (mọi cách chạy)

1. Làm việc ở **thư mục gốc repo** (có `package.json` và `pom.xml` nếu dùng Spring).
2. Cài **Node.js LTS** (khuyến nghị v20+). Kiểm tra: `node -v`, `npm -v`.
3. **`npm install`** ở root — **chạy lại sau mỗi lần `git pull`** nếu đồng đội thêm dependency.
4. Tạo **`.env`** từ mẫu:
   - Git Bash / macOS / Linux: `cp .env.example .env`
   - Windows CMD: `copy .env.example .env`
   - PowerShell: `Copy-Item .env.example .env`

### Chọn một trong ba kịch bản

| Kịch bản | Backend | Trong `.env` (root) | Lệnh chính |
|----------|---------|---------------------|------------|
| **A — FE + mock** | Không cần | `VITE_USE_MOCK_API=true` | `npm run dev` |
| **B — FE + API Node** | [backend/README.md](backend/README.md): `cd backend` → `npm install` → `npm run dev` (cổng thường **8081**) | `VITE_API_BASE_URL=http://localhost:8081/api`, `VITE_USE_MOCK_API=false` | Hai terminal: backend + `npm run dev` |
| **C — FE + Spring** | MySQL bật; DB/user khớp `src/main/resources/application.properties`; Run `BikeTradingBackendApplication` hoặc `mvn spring-boot:run` | Giống cột B | Hai terminal: Spring + `npm run dev` |

**Hướng dẫn backend từng bước (Node vs Spring, xử lý cổng trùng, sau `git pull`):** [docs/BACKEND-LOCAL-SETUP.md](docs/BACKEND-LOCAL-SETUP.md).  
**Code & env Node chi tiết:** [docs/BACKEND-GUIDE.md](docs/BACKEND-GUIDE.md).  
**Spring, contract API, CORS:** [docs/BACKEND-NODE-TO-SPRING-BOOT.md](docs/BACKEND-NODE-TO-SPRING-BOOT.md).

> **Cảnh báo:** Không chạy đồng thời **Node** và **Spring** trên **cùng cổng 8081**. Tắt một bên hoặc đổi cổng + cập nhật `VITE_API_BASE_URL`.

---

## Mục lục

1. [Sau khi clone hoặc pull (setup)](#sau-khi-clone-hoặc-pull-setup)
2. [Bắt đầu nhanh (Frontend)](#bắt-đầu-nhanh-frontend)
3. [Yêu cầu môi trường](#yêu-cầu-môi-trường)
4. [Phần A — Backend Spring Boot (BE2)](#phần-a--backend-spring-boot-be2)
5. [Phần B — ShopBike Frontend (chi tiết)](#phần-b--shopbike-frontend-chi-tiết)
6. [Biến môi trường Frontend](#biến-môi-trường-frontend)
7. [Lệnh npm & chất lượng](#lệnh-npm--chất-lượng)
8. [Luồng làm việc hàng ngày (dev)](#luồng-làm-việc-hàng-ngày-dev)
9. [Xử lý sự cố thường gặp](#xử-lý-sự-cố-thường-gặp)
10. [Bản đồ tài liệu (`docs/`)](#bản-đồ-tài-liệu-docs)
11. [Lộ trình đọc cho người mới](#lộ-trình-đọc-cho-người-mới)
12. [Thay đổi gần đây](#thay-đổi-gần-đây)

---

## Bắt đầu nhanh (Frontend)

Chạy **chỉ giao diện + mock API** (không cần Spring):

```bash
cd c:\SWP\frontend   # hoặc đường dẫn repo của bạn
cp .env.example .env
```

Mở `.env` và đặt:

```env
VITE_USE_MOCK_API=true
```

```bash
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:5173** (hoặc cổng Vite in ra trong terminal).

---

## Yêu cầu môi trường

| Thành phần | Ghi chú |
|------------|---------|
| **Node.js** | Bản LTS (v20+ khuyến nghị) — để chạy `npm`, Vite |
| **npm** | Đi kèm Node |
| **Java** | JDK 24 (khi chạy Spring trong repo) |
| **MySQL** | Khi chạy Spring với DB thật (xem phần A) |
| **Trình duyệt** | Chrome/Edge/Firefox để kiểm tra DevTools, React Query |

---

## Phần A — Backend Spring Boot (BE2)

Mã nguồn backend cho Sàn Giao Dịch Xe Đạp Thể Thao. Entry Java: `src/main/java/com/biketrading/backend/BikeTradingBackendApplication.java`. Cổng mặc định thường **8081** — xem `server.port` trong `src/main/resources/application.properties`.

### 1. Cài đặt môi trường

- **Java:** JDK (phiên bản theo `pom.xml` / team — thường 21–24)  
- **Database:** MySQL — bật service (XAMPP / Windows Service / Docker)  
- **IDE:** IntelliJ IDEA (khuyến nghị) hoặc VS Code + extension Java  
- **Maven:** đi kèm IntelliJ hoặc cài riêng để chạy `mvn` từ terminal

### 2. Cách chạy (tóm tắt)

1. Bật MySQL.
2. Tạo **database trống** — **tên DB** phải khớp `spring.datasource.url` trong `application.properties` (ví dụ `jdbc:mysql://localhost:3306/...` — đoạn sau host là tên DB). Chỉnh **user/password** local cho đúng máy bạn (**không** commit mật khẩu thật).
3. (Tuỳ chọn) JPA `ddl-auto` thường tạo/cập nhật bảng từ entity — vẫn cần DB đã tồn tại.
4. Chạy app:
   - IntelliJ: Run class `BikeTradingBackendApplication`, **hoặc**
   - Terminal tại root repo: `mvn spring-boot:run`
5. Thấy log kiểu `Started ... Application` là thành công.

### 3. Swagger UI

**[http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)**

### 4. Tài khoản test (mẫu)

| Vai trò | Username | Password | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Seller** | `shop_danang_vip` | `123` | Shop Đà Nẵng |
| **Buyer** | `buyer_tuan` | `123` | Test mua hàng |
| **Admin** | `admin` | `123` | Quản trị |

---

## Phần B — ShopBike Frontend (chi tiết)

Marketplace, checkout, seller/inspector/admin, i18n, theme.

### B1. Clone & cài dependency

```bash
git clone <url-repo>
cd <thư-mục-repo>   # thư mục gốc có package.json — có thể tên là frontend, SWP, shopbike, ...
npm install
```

### B2. Tạo file `.env`

```bash
cp .env.example .env
```

Không commit file `.env` (chứa URL API cục bộ); `.env.example` là mẫu an toàn.

### B3. Hai chế độ chạy

| Chế độ | `VITE_USE_MOCK_API` | Khi nào dùng |
|--------|---------------------|--------------|
| **Mock** | `true` | Phát triển UI nhanh, không cần backend |
| **API thật** | `false` | Tích hợp Spring Boot hoặc Node demo |

Kết nối **API thật** (Spring ví dụ cổng 8081):

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

Backend Node (nếu có trong monorepo) — xem [backend/README.md](backend/README.md) nếu file tồn tại ở repo của bạn.

### B4. Chạy dev server

```bash
npm run dev
```

Mặc định: **http://localhost:5173**. Đổi cổng: `npm run dev -- --port 3000` hoặc cấu hình Vite.

### B5. Build production

```bash
npm run build
```

Kết quả trong `dist/`. Xem trước bản build:

```bash
npm run preview
```

---

## Biến môi trường Frontend

| Biến | Bắt buộc | Mô tả | Ví dụ |
|------|----------|--------|--------|
| `VITE_API_BASE_URL` | Có (khi không mock) | Base URL API, **không** có dấu `/` cuối | `http://localhost:8081/api` |
| `VITE_USE_MOCK_API` | Khuyến nghị | `true` = dữ liệu mock trong FE | `false` |
| `VITE_PAYMENT_API_ORIGIN` | Tùy | Origin backend cho demo VNPay (không có `/api`) | `http://localhost:8081` |
| `VITE_API_TIMEOUT` | Tùy | Timeout request (ms), mặc định ~15000 | `15000` |
| `VITE_VNPAY_MAINTENANCE` | Tùy | `true` = hiện banner bảo trì VNPay (nếu có trong code) | (để trống) |

**Lưu ý:** Biến môi trường Vite phải bắt đầu bằng `VITE_` mới expose ra client. Sau khi sửa `.env`, **khởi động lại** `npm run dev`.

---

## Lệnh npm & chất lượng

| Lệnh | Mục đích |
|------|----------|
| `npm install` | Cài dependency theo `package-lock.json` |
| `npm run dev` | Dev server + HMR |
| `npm run build` | Build production (`dist/`) |
| `npm run preview` | Phục vụ `dist/` để kiểm tra build |
| `npm run lint` | ESLint toàn project |

Trước khi merge/PR: nên chạy **`npm run lint`** và **`npm run build`** thành công.

---

## Luồng làm việc hàng ngày (dev)

1. **Pull** nhánh mới nhất (`git pull`).
2. Bật **backend** (Spring hoặc Node) nếu làm tích hợp API — hoặc mock.
3. Cập nhật `.env` cho đúng cổng API.
4. `npm run dev` — mở app, đăng nhập tài khoản test (nếu cần).
5. Khi sửa **server state** (danh sách, đơn, dashboard): nhớ pattern **TanStack Query** + `queryKeys` + `invalidateQueries` (xem [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md)).
6. Khi sửa **form auth**: xem `src/lib/authSchemas.ts` + React Hook Form.
7. Commit message rõ ràng; không commit `.env`, `node_modules`, artifact local trong `docs/testing/` (nếu ignore).

---

## Xử lý sự cố thường gặp

| Hiện tượng | Hướng xử lý |
|------------|-----------|
| **CORS / Network Error** | Kiểm tra backend đang chạy, `VITE_API_BASE_URL` đúng, CORS trên BE cho origin `http://localhost:5173`. |
| **401 ngay sau khi đăng nhập** | Kiểm tra token; với Spring cần đúng `/auth` và JWT. Xem [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) § Auth. |
| **Trang danh sách lệch trang chi tiết** | Thường do cache Query — sau mutation cần `invalidateQueries` đúng `queryKeys`. |
| **Mock không đổi** | `VITE_USE_MOCK_API=true` và restart dev server. |
| **Build lỗi TypeScript/ESLint** | Chạy `npm run lint` xem file/dòng; sửa theo báo lỗi. |

Chi tiết thêm: [HELP.md](HELP.md), [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) § 10.

---

## Bản đồ tài liệu (`docs/`)

**Mục lục đầy đủ và nhóm theo mục đích:** [docs/README.md](docs/README.md)

| Nhóm | File chính | Dùng khi nào |
|------|------------|----------------|
| **Onboard & tra cứu** | [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) | API, role, routes, env, order status |
| **Luồng code FE → API** | [docs/FRONTEND-API-FLOWS.md](docs/FRONTEND-API-FLOWS.md) | axios, services, VNPay, upload |
| **Kiến trúc FE V1 vs V2** | [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md) | Query, RHF, Zod, refresh, invalidate |
| **Cấu trúc thư mục** | [docs/STRUCTURE.md](docs/STRUCTURE.md) | Cây `src/`, import, hooks |
| **Ship / hardening** | [docs/PRODUCTION-HARDENING.md](docs/PRODUCTION-HARDENING.md) | Checklist trước production |
| **Rà soát API BE–FE** | [docs/BE-FE-API-AUDIT.md](docs/BE-FE-API-AUDIT.md), [docs/BE-FE-API-AUDIT-BY-PAGE.md](docs/BE-FE-API-AUDIT-BY-PAGE.md) | Theo endpoint / theo màn hình |
| **Spring port** | [docs/BACKEND-NODE-TO-SPRING-BOOT.md](docs/BACKEND-NODE-TO-SPRING-BOOT.md) | Map endpoint Node → Spring |
| **Cài đặt backend sau clone/pull** | [docs/BACKEND-LOCAL-SETUP.md](docs/BACKEND-LOCAL-SETUP.md) | Node vs Spring, cổng, sau `git pull` |
| **PM / QA / FE + Backend** | [docs/BACKEND-COLLABORATION.md](docs/BACKEND-COLLABORATION.md) | Thuật ngữ chung, mẫu báo bug, ai đọc gì |
| **ERD / SQL** | [docs/ERD-MYSQL.md](docs/ERD-MYSQL.md), [docs/sql/shopbike_mysql_schema.sql](docs/sql/shopbike_mysql_schema.sql) | Schema DB |
| **Business rules** | [docs/business-rules/BUSINESS-RULES.md](docs/business-rules/BUSINESS-RULES.md) | Quy tắc nghiệp vụ |
| **Testing (SWT301)** | [docs/testing/README.md](docs/testing/README.md) | Báo cáo, test case |

**Tài liệu local (không Git):** `docs/testing/generated/`, CSV/XLSX cá nhân — xem [.gitignore](.gitignore) và [docs/testing/README.md](docs/testing/README.md) (mục artifact local).

---

## Lộ trình đọc cho người mới

**Ngày 1 — Chạy được & hiểu repo**

1. Đọc README này (phần B + biến môi trường).  
2. Chạy `npm run dev` với mock hoặc API thật.  
3. Đọc [docs/STRUCTURE.md](docs/STRUCTURE.md) và [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) § 1–3.

**Ngày 2 — API & luồng nghiệp vụ**

1. [docs/FRONTEND-API-FLOWS.md](docs/FRONTEND-API-FLOWS.md)  
2. [docs/PROJECT-SUMMARY.md](docs/PROJECT-SUMMARY.md) (tổng quan nghiệp vụ & luồng).

**Ngày 3 — Kiến trúc V2 & chỉnh sửa an toàn**

1. [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md) (cả phần hướng dẫn thực hành).  
2. Mở `src/lib/queryKeys.ts` và một hook trong `src/hooks/queries/` để thấy pattern.

**Khi làm báo cáo / test môn học**

- [docs/testing/SWT301_TESTING_GUIDE.md](docs/testing/SWT301_TESTING_GUIDE.md)

---

## Thay đổi gần đây

| Ngày | Nội dung |
|------|----------|
| **2026-03-26** | **README:** mục **[Sau khi clone hoặc pull (setup)]** — bảng 3 kịch bản (mock / Node / Spring); cập nhật **Phần A Spring** (DB khớp `application.properties`, `mvn spring-boot:run`). **Mới:** [docs/BACKEND-LOCAL-SETUP.md](docs/BACKEND-LOCAL-SETUP.md); mở rộng [docs/BACKEND-GUIDE.md](docs/BACKEND-GUIDE.md), [backend/README.md](backend/README.md). |
| **2026-03-26** | **README:** mục lục, hướng dẫn chi tiết FE, biến môi trường, luồng dev, xử lý sự cố, bản đồ docs, lộ trình đọc. **docs/README, HELP,** các guide hỗ trợ onboard (xem [CHANGELOG.md](docs/CHANGELOG.md)). |
| **2026-03-26** | Docs: mục lục `docs/README.md`; [FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md); cập nhật STRUCTURE, PRODUCTION-HARDENING, QUICK-REFERENCE, CHANGELOG. |
| **2026-03-15** | Docs: monorepo `src/` (FE + Spring), `.gitignore` `.cursor/`. |
| **2026-03** | Merge `demo` → `BE2`: đồng bộ frontend + docs + `backend/` Node demo. |

Lịch sử đầy đủ: [docs/CHANGELOG.md](docs/CHANGELOG.md).

---

*Tài liệu gốc: README.md — cập nhật định kỳ với `docs/` và `package.json`.*
