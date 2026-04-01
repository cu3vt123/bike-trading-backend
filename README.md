# Bike Trading — ShopBike (Frontend)

Nhánh **`front-only`** chỉ chứa **React + Vite** (ShopBike). **Không** có mã backend trong repo này.

**API / Spring Boot:** dùng nhánh [**`Bespring`**](https://github.com/cu3vt123/bike-trading-backend/tree/Bespring) trên cùng remote — clone hoặc `git worktree` riêng (ví dụ `git fetch origin && git worktree add ../bike-trading-bespring Bespring`). Trong thư mục FE, trỏ `VITE_API_BASE_URL` tới cổng API local (thường `http://localhost:8081/api`).

---

## Sau khi clone hoặc pull (setup)

Mục tiêu: **vừa clone/pull về là chạy được** — không bỏ sót `npm install` hoặc file `.env`.

### Bước dùng chung (mọi cách chạy)

1. Làm việc ở **thư mục gốc repo** (có `package.json`).
2. Cài **Node.js LTS** (khuyến nghị v20+). Kiểm tra: `node -v`, `npm -v`.
3. **`npm install`** ở root — **chạy lại sau mỗi lần `git pull`** nếu đồng đội thêm dependency.
4. Tạo **`.env`** từ mẫu:
   - Git Bash / macOS / Linux: `cp .env.example .env`
   - Windows CMD: `copy .env.example .env`
   - PowerShell: `Copy-Item .env.example .env`

### Chọn một trong hai kịch bản

| Kịch bản | Backend | Trong `.env` (root) | Lệnh chính |
|----------|---------|---------------------|------------|
| **A — FE + mock** | Không cần | `VITE_USE_MOCK_API=true` | `npm run dev` |
| **B — FE + API (Spring)** | Nhánh **`Bespring`** (worktree/clone riêng) — xem [docs/BACKEND-BESPRING-CHAY-API.md](docs/BACKEND-BESPRING-CHAY-API.md) | `VITE_API_BASE_URL=http://localhost:8081/api`, `VITE_USE_MOCK_API=false` | Hai terminal: API + `npm run dev` |

---

## Mục lục

1. [Sau khi clone hoặc pull (setup)](#sau-khi-clone-hoặc-pull-setup)
2. [Bắt đầu nhanh (Frontend)](#bắt-đầu-nhanh-frontend)
3. [Yêu cầu môi trường](#yêu-cầu-môi-trường)
4. [Chạy API backend (nhánh Bespring)](#chạy-api-backend-nhánh-bespring)
5. [Gợi ý tài liệu cho AI (Frontend, QA)](#readme-ai-context-team)
6. [Phần B — ShopBike Frontend (chi tiết)](#phần-b--shopbike-frontend-chi-tiết)
7. [Biến môi trường Frontend](#biến-môi-trường-frontend)
8. [Lệnh npm & chất lượng](#lệnh-npm--chất-lượng)
9. [Luồng làm việc hàng ngày (dev)](#luồng-làm-việc-hàng-ngày-dev)
10. [Xử lý sự cố thường gặp](#xử-lý-sự-cố-thường-gặp)
11. [Bản đồ tài liệu (`docs/`)](#bản-đồ-tài-liệu-docs)
12. [Lộ trình đọc cho người mới](#lộ-trình-đọc-cho-người-mới)
13. [Thay đổi gần đây](#thay-đổi-gần-đây)

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
| **Java / MySQL** | Chỉ khi bạn **tự chạy API** từ nhánh `Bespring` (xem mục dưới) — không bắt buộc cho `npm run dev` + mock |
| **Trình duyệt** | Chrome/Edge/Firefox để kiểm tra DevTools, React Query |

---

## Chạy API backend (nhánh Bespring)

**Hướng dẫn đầy đủ cho dev FE:** [docs/BACKEND-BESPRING-CHAY-API.md](docs/BACKEND-BESPRING-CHAY-API.md) (worktree/clone, Swagger, `VITE_API_BASE_URL`, CORS).

**Bảng path API / role / env khi code:** [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md).

**Mục lục tài liệu trong `docs/`:** [docs/README.md](docs/README.md).

---

<a id="readme-ai-context-team"></a>

## Gợi ý tài liệu cho AI (Frontend, QA)

Khi nhờ AI đọc repo, đính kèm gói tài liệu theo vai: **[docs/AI-CONTEXT-for-TEAM.md](docs/AI-CONTEXT-for-TEAM.md)** (Phần B Frontend, Phần C QA; dev backend dùng repo nhánh `Bespring`).

---

## Phần B — ShopBike Frontend (chi tiết)

Marketplace, checkout, seller/inspector/admin, i18n, theme.

**Hướng dẫn Frontend chi tiết nhất (stack, cấu trúc `src/`, routing, guard, API layers, TanStack Query, Zustand, form, i18n, checklist, xử lý sự cố):** [docs/FRONTEND-DEVELOPER-GUIDE.md](docs/FRONTEND-DEVELOPER-GUIDE.md).

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
| **API thật** | `false` | Tích hợp API nhánh `Bespring` — [docs/BACKEND-BESPRING-CHAY-API.md](docs/BACKEND-BESPRING-CHAY-API.md) |

Kết nối **API thật** (Spring ví dụ cổng 8081):

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

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
| `npm run typecheck` | TypeScript `strict` — **`tsc --noEmit`** (Vite build mặc định không chạy bước này) |

Trước khi merge/PR: nên chạy **`npm run lint`**, **`npm run typecheck`** và **`npm run build`** thành công.

---

## Luồng làm việc hàng ngày (dev)

1. **Pull** nhánh mới nhất (`git pull`).
2. Bật **backend** (Spring hoặc Node) nếu làm tích hợp API — hoặc mock.
3. Cập nhật `.env` cho đúng cổng API.
4. `npm run dev` — mở app, đăng nhập tài khoản test (nếu cần).
5. Khi sửa **server state** (danh sách, đơn, dashboard): nhớ pattern **TanStack Query** + `queryKeys` + `invalidateQueries` (xem [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md)).
6. Khi sửa **form auth**: xem `src/lib/authSchemas.ts` + React Hook Form.
7. Commit message rõ ràng; không commit `.env` hoặc `node_modules`.

---

## Xử lý sự cố thường gặp

| Hiện tượng | Hướng xử lý |
|------------|-----------|
| **CORS / Network Error** | Kiểm tra backend đang chạy, `VITE_API_BASE_URL` đúng, CORS trên BE cho origin `http://localhost:5173`. |
| **401 ngay sau khi đăng nhập** | Kiểm tra token; với Spring cần đúng `/auth` và JWT. Xem [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) § Auth. |
| **Trang danh sách lệch trang chi tiết** | Thường do cache Query — sau mutation cần `invalidateQueries` đúng `queryKeys`. |
| **Mock không đổi** | `VITE_USE_MOCK_API=true` và restart dev server. |
| **Build xanh nhưng TypeScript lỗi** | Chạy **`npm run typecheck`** — Vite có thể bundle dù `tsc` báo lỗi. |
| **Build lỗi ESLint** | Chạy `npm run lint` xem file/dòng. |

Chi tiết thêm: [HELP.md](HELP.md), [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) § 10.

---

## Bản đồ tài liệu (`docs/`)

**Mục lục đầy đủ và nhóm theo mục đích:** [docs/README.md](docs/README.md)

| Nhóm | File chính | Dùng khi nào |
|------|------------|----------------|
| **API backend (Bespring)** | [docs/BACKEND-BESPRING-CHAY-API.md](docs/BACKEND-BESPRING-CHAY-API.md) | FE nối API: worktree, `.env`, Swagger |
| **AI — gói tài liệu (FE, QA)** | [docs/AI-CONTEXT-for-TEAM.md](docs/AI-CONTEXT-for-TEAM.md), [README § Gợi ý tài liệu cho AI](#readme-ai-context-team) | Đính kèm file khi chat với AI |
| **Frontend — hướng dẫn tổng hợp** | [docs/FRONTEND-DEVELOPER-GUIDE.md](docs/FRONTEND-DEVELOPER-GUIDE.md) | Route, API, Query, i18n, checklist |
| **Onboard & tra cứu** | [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) | API, role, routes, env, order status |
| **Luồng code FE → API** | [docs/FRONTEND-API-FLOWS.md](docs/FRONTEND-API-FLOWS.md) | axios, services, VNPay, upload |
| **Kiến trúc FE V1 vs V2** | [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md) | Query, invalidate |
| **Kiểm tra luồng (checklist)** | [docs/FE-ARCHITECTURE-V1-VS-V2.md — Phụ lục](docs/FE-ARCHITECTURE-V1-VS-V2.md#phu-luc-kiem-tra-luong-api) | Lint/build, invalidate, Network |
| **Cấu trúc thư mục** | [docs/STRUCTURE.md](docs/STRUCTURE.md) | Cây `src/` |
| **Ship / hardening** | [docs/PRODUCTION-HARDENING.md](docs/PRODUCTION-HARDENING.md) | Trước production |
| **Business rules** | [docs/business-rules/BUSINESS-RULES.md](docs/business-rules/BUSINESS-RULES.md) | Quy tắc nghiệp vụ |
| **VNPay** | [docs/PAYMENTS-VNPAY.md](docs/PAYMENTS-VNPAY.md) | Luồng thanh toán |
| **Mục lục docs** | [docs/README.md](docs/README.md) | Danh sách file còn lại |
| **Học FE từ đầu (00–09)** | [docs/fe-hoc-tu-dau/README.md](docs/fe-hoc-tu-dau/README.md) | Web, React, `src/`, API, Query, form, i18n |
---

## Lộ trình đọc cho người mới

**Ngày 0 — Chưa quen React / muốn giải thích từ đầu (tùy chọn)**

1. Đọc [docs/fe-hoc-tu-dau/README.md](docs/fe-hoc-tu-dau/README.md) (00 → 09), sau đó **bài thực hành** [10 — luồng mua + kiểm định](docs/fe-hoc-tu-dau/10-thuc-hanh-luong-mua-xe-kiem-dinh.md) và [11 — đổi lưới 3→4 cột](docs/fe-hoc-tu-dau/11-thuc-hanh-doi-so-cot-luoi-tailwind.md).

**Ngày 1 — Chạy được & hiểu repo**

1. Đọc README này (phần B + biến môi trường) và [docs/FRONTEND-DEVELOPER-GUIDE.md](docs/FRONTEND-DEVELOPER-GUIDE.md).  
2. Chạy `npm run dev` với mock hoặc API thật.  
3. Đọc [docs/STRUCTURE.md](docs/STRUCTURE.md) và [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) § 1–3.

**Ngày 2 — API & luồng nghiệp vụ**

1. [docs/FRONTEND-API-FLOWS.md](docs/FRONTEND-API-FLOWS.md)  
2. [docs/PROJECT-SUMMARY.md](docs/PROJECT-SUMMARY.md) (tổng quan nghiệp vụ & luồng).

**Ngày 3 — Kiến trúc V2 & chỉnh sửa an toàn**

1. [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md) (cả phần hướng dẫn thực hành).  
2. Mở `src/lib/queryKeys.ts` và một hook trong `src/hooks/queries/` để thấy pattern.

## Thay đổi gần đây

| Ngày | Nội dung |
|------|----------|
| **2026-04-01** | **`docs/fe-hoc-tu-dau`:** thêm bài **10** (luồng mua + kiểm định trong code), **11** (đổi lưới 3→4 cột); **01–02** và mục lục tập trung **mock / học FE**, backend ghi *tùy chọn*. Chi tiết: [docs/CHANGELOG.md](docs/CHANGELOG.md). |
| **2026-03-31** | **Docs:** repo `front-only` — xóa các `.md` thuần backend trong `docs/`; thêm [docs/BACKEND-BESPRING-CHAY-API.md](docs/BACKEND-BESPRING-CHAY-API.md); rút gọn `docs/README.md`, `AI-CONTEXT-for-TEAM.md`, README gốc. Chi tiết: [docs/CHANGELOG.md](docs/CHANGELOG.md). |
| **2026-03-30** | **`npm run typecheck`** (`tsc --noEmit`) trong [package.json](package.json); README / HELP / guides nhắc dùng cùng lint + build. Chi tiết: [docs/CHANGELOG.md](docs/CHANGELOG.md). |
| **2026-03-26** | **README:** bổ sung kịch bản mock / Spring; tài liệu backend sau này gom vào nhánh Bespring và *(03-31)* [docs/BACKEND-BESPRING-CHAY-API.md](docs/BACKEND-BESPRING-CHAY-API.md). |
| **2026-03-26** | **README:** mục lục, hướng dẫn chi tiết FE, biến môi trường, luồng dev, xử lý sự cố, bản đồ docs, lộ trình đọc. **docs/README, HELP,** các guide hỗ trợ onboard (xem [CHANGELOG.md](docs/CHANGELOG.md)). |
| **2026-03-26** | Docs: mục lục `docs/README.md`; [FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md); cập nhật STRUCTURE, PRODUCTION-HARDENING, QUICK-REFERENCE, CHANGELOG. |
| **2026-03-15** | Docs: monorepo `src/` (FE + Spring), `.gitignore` `.cursor/`. |
| **2026-03** | Merge `demo` → `BE2`: đồng bộ frontend + docs + `backend/` Node demo. |

Lịch sử đầy đủ: [docs/CHANGELOG.md](docs/CHANGELOG.md).

---

*Tài liệu gốc: README.md — cập nhật định kỳ với `docs/` và `package.json`.*
