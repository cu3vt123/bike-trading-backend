# Tài liệu dự án ShopBike

Đây là **trung tâm mục lục** cho thư mục `docs/`. Root **[README.md](../README.md)** có hướng dẫn **cài đặt, chạy BE + FE, biến môi trường, xử lý sự cố** chi tiết — đọc file đó trước khi đào sâu từng tài liệu bên dưới.

**Monorepo BE2:** React/Vite và Spring Boot cùng repo — [README.md](../README.md), [STRUCTURE.md](STRUCTURE.md).

**Mới học FE / muốn lộ trình từ đầu đến cuối (tiếng Việt, theo từng file):** [fe-hoc-tu-dau/README.md](./fe-hoc-tu-dau/README.md).

---

## Mục lục tài liệu này

1. [Phân loại tài liệu — tránh đọc trùng](#phân-loại-tài-liệu--tránh-đọc-trùng)
2. [Đọc nhanh (ưu tiên)](#đọc-nhanh-ưu-tiên)
3. [Backend: Java Spring Boot (hướng dẫn & tài liệu)](#backend-java-spring-boot-hướng-dẫn--tài-liệu)
4. [AI: gợi ý tài liệu cho cả team](#ai-context-team-md)
5. [Lộ trình học 3 cấp](#lộ-trình-học-3-cấp)
6. [Team phối hợp BE (BA, Tester, PM / QA / FE)](#team-phối-hợp-be)
7. [Nghiệp vụ, DB, thanh toán](#nghiệp-vụ-db-thanh-toán)
8. [Lịch sử](#lịch-sử)
9. [Mục lục theo nhóm (file trong `docs/`)](#mục-lục-theo-nhóm-file-trong-docs)

---

## Phân loại tài liệu — tránh đọc trùng

| Nhu cầu | Đọc file này | Không nhầm với |
|---------|----------------|-----------------|
| **Chạy repo, `.env`, mock/API** | [README.md](../README.md) (gốc repo) | `docs/README.md` = mục lục tài liệu, không thay README gốc |
| **Tra cứu API, role, route, env** | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) = luồng code + file TS cụ thể |
| **BR đầy đủ, BR-ID** | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) | [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) = tóm tắt dài + màn hình, không thay BR |
| **Audit API theo endpoint** | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) | [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) = theo màn/actor — **hai file bổ sung** |
| **Làm FE hằng ngày** | [FRONTEND-DEVELOPER-GUIDE.md](FRONTEND-DEVELOPER-GUIDE.md) + [STRUCTURE.md](STRUCTURE.md) | [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) = so sánh/migrate Query |
| **FAQ ngắn** | [HELP.md](../HELP.md) | Chi tiết đầy đủ vẫn ở README + bảng trên |

**Chất lượng code:** `npm run typecheck` (`tsc --noEmit`) bổ sung cho `npm run build` — xem [README.md](../README.md) mục **Lệnh npm & chất lượng**.

---

## Đọc nhanh (ưu tiên)

| Nhu cầu | Tài liệu | Mô tả ngắn |
|---------|----------|------------|
| **Chạy dự án, env, lint/typecheck/build, sự cố** | [README.md](../README.md) | Hướng dẫn gốc — bắt buộc khi onboard. |
| **Hướng dẫn Frontend tổng hợp (stack, route, API, Query, i18n, checklist)** | **[FRONTEND-DEVELOPER-GUIDE.md](FRONTEND-DEVELOPER-GUIDE.md)** | **Đọc đầu tiên khi làm FE** — chi tiết một file. |
| **API, routes, thuật ngữ, env, order status** | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Tra cứu nhanh khi code hoặc port API. |
| **Luồng gọi API trên FE** (axios, `apis/`, `services/`, VNPay) | [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | Đi từ request đến đúng file TypeScript. |
| **So sánh kiến trúc FE cũ / mới** (Query, RHF, refresh, invalidate) | **[FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md)** | Hiểu V2 và cách chỉnh code không lệch cache. |
| **Cấu trúc thư mục FE, quy ước import** | [STRUCTURE.md](STRUCTURE.md) | Cây `src/`, `queryKeys`, hooks `queries/`. |
| **Checklist ship / hardening** | [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) | Trước khi deploy production. |
| **Học FE từ đầu (00–09)** | [fe-hoc-tu-dau/README.md](fe-hoc-tu-dau/README.md) | Nền tảng web/React → `src/`, API, Query, form, i18n. |
| **Kiểm tra luồng + API (V2, thủ công)** | **[FE-ARCHITECTURE-V1-VS-V2 — Phụ lục §8](FE-ARCHITECTURE-V1-VS-V2.md#phu-luc-kiem-tra-luong-api)** | Lint/typecheck/build, checklist theo vai, Query invalidate, Network. |

---

## Backend: Java Spring Boot (hướng dẫn & tài liệu)

Dành cho **dev backend** làm việc với API Spring Boot trong repo này (IntelliJ, Maven, MySQL). Frontend nằm cùng monorepo — bạn vẫn cần `npm install` + **`.env` ở root repo** (cùng cấp `package.json`, không phải thư mục `frontend/`) nếu muốn chạy UI để kiểm thử end-to-end; **bước chi tiết và xử lý sự cố** nằm ở [README.md](../README.md) mục **Dành cho Backend (Java Spring Boot, IntelliJ)** — biến `VITE_*`: [QUICK-REFERENCE.md](QUICK-REFERENCE.md) (mục 5).

| Nhu cầu | Tài liệu | Ghi chú |
|---------|----------|---------|
| **Clone, MySQL, IntelliJ, chạy Spring + `npm run dev`** | [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) | Một lộ trình đủ để chạy local; cổng, sau `git pull`. |
| **Spring Boot (IntelliJ) + MySQL/JPA** — contract API, JWT, enum, multipart, VNPay; thiết kế SQL | [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | Chuẩn backend đồ án; folder `backend/` (Express) chỉ tham chiếu HTTP tùy chọn — **không** lấy Mongo làm mô hình Spring. |
| **API mà FE đang gọi** | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md), [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Khớp `src/apis/` với controller Spring. |
| **Quy tắc nghiệp vụ** | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) | BR-ID; không chỉ suy từ entity. |
| **Schema DB, ERD, SQL** | [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | JPA entity ↔ bảng/cột/ENUM. |
| **VNPay** | [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) | Return, IPN, khớp bảng thanh toán. |
| **Làm việc với PM/QA/FE** | [BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md) | Thuật ngữ, mẫu ticket. |
| **Backend Node (demo)** | [BACKEND-GUIDE.md](BACKEND-GUIDE.md), [../backend/README.md](../backend/README.md) | Không chạy cùng cổng với Spring. |
| **Tra cứu nhanh env, auth, order status** | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Hỗ trợ cả FE và khi đối chiếu API. |
| **Gợi ý tài liệu đính kèm cho AI (dev backend)** | [AI-CONTEXT-for-TEAM.md — Phần A](AI-CONTEXT-for-TEAM.md#phan-a-backend), [mục A.7 — tóm tắt](AI-CONTEXT-for-TEAM.md#phan-a7-backend-ai) | **TEAM** = bản đầy đủ; **A.7** = một trang Spring+MySQL, gói file, ràng buộc không dùng Mongo cho Spring. |

---

<a id="ai-context-team-md"></a>

## AI: gợi ý tài liệu cho cả team

**File chính:** **[AI-CONTEXT-for-TEAM.md](AI-CONTEXT-for-TEAM.md)** — một bài cho **Backend, Frontend và QA / Tester**: khối bối cảnh copy-paste, Phần A/B/C theo vai, bảng gói tài liệu, mẫu prompt, lỗi thường gặp khi nhờ AI.

Tóm tắt ở root: [README.md — Gợi ý tài liệu cho AI](../README.md#readme-ai-context-team).

---

## Lộ trình học 3 cấp

### Cấp 1 — Mới vào repo (ngày 1–2)

1. [README.md](../README.md) — toàn bộ phần Frontend + biến môi trường.  
2. [STRUCTURE.md](STRUCTURE.md) — biết file nằm đâu.  
3. [QUICK-REFERENCE.md](QUICK-REFERENCE.md) — §1–3 (thuật ngữ, role, routes).  
4. Chạy `npm run dev` với mock hoặc API thật.

### Cấp 2 — Làm feature / sửa bug (tuần 1)

1. [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) — đặc biệt phần **hướng dẫn thực hành**.  
2. [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) — luồng liên quan màn bạn sửa.  
3. Mở `src/lib/queryKeys.ts` và một hook trong `src/hooks/queries/` để thấy pattern thật.

### Cấp 3 — Rà soát BE–FE, DB, nghiệp vụ

1. [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) — theo **nhóm endpoint**.  
2. [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) — theo **màn hình / actor**.  
   - Hai file **bổ sung** nhau: không xóa; chọn file theo đang làm việc theo API hay theo UI.  
3. [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) — quy tắc nghiệp vụ.  
4. [ERD-SPEC.md](ERD-SPEC.md) / [ERD-MYSQL.md](ERD-MYSQL.md) — schema.

---

<a id="team-phối-hợp-be"></a>

## Team phối hợp BE (BA, Tester, PM / QA / FE)

Các tài liệu dưới đây phục vụ **người không chỉ code Spring** nhưng cần hiểu cách làm việc với BE, viết test case, audit API theo màn hình. *(Gợi ý đính kèm tài liệu cho AI cả team: xem mục [AI: gợi ý tài liệu cho cả team](#ai-context-team-md) và file [AI-CONTEXT-for-TEAM.md](AI-CONTEXT-for-TEAM.md).)*

| Nhu cầu | Tài liệu | Ghi chú |
|---------|----------|---------|
| **PM / QA / FE làm việc với BE** | **[BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md)** | Thuật ngữ, mẫu báo bug, ai đọc file nào — không cần dạy lại BE. |
| **Rà soát API BE–FE (theo khu vực / endpoint)** | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) | Bảng method/path — dùng khi đối chiếu theo nhóm API. |
| **Rà soát API BE–FE (theo trang / actor)** | [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Chi tiết UI + API từng page — **Tester / BA** thường dùng file này để map TC. |

---

## Nghiệp vụ, DB, thanh toán

| Nhu cầu | Tài liệu | Ghi chú |
|---------|----------|---------|
| Business rules đầy đủ | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md), [business-rules/README.md](business-rules/README.md) | Source of truth + script Excel. |
| Tổng quan dự án | [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Chức năng, stack, luồng tóm tắt, BR. |
| UI/UX audit theo actor | [BE-FE-API-AUDIT-BY-PAGE — Phụ lục §6](BE-FE-API-AUDIT-BY-PAGE.md#phu-luc-ui-ux-theo-actor) | Đánh giá UX; cùng file với audit API theo page. |
| ERD / MySQL / đặc tả cột | [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | DB & vẽ ERD; mục lục + **Cách đọc** trong từng file; đối chiếu màn hình/API — [FE-ARCHITECTURE — Phụ lục kiểm tra](FE-ARCHITECTURE-V1-VS-V2.md#phu-luc-kiem-tra-luong-api). |
| VNPay | [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) | Luồng thanh toán. |

---

## Lịch sử

| Nội dung | File |
|----------|------|
| Changelog tóm tắt | [CHANGELOG.md](CHANGELOG.md) |

---

## Mục lục theo nhóm (file trong `docs/`)

Các file không liệt kê ở đây (ví dụ `sql/*.sql`, `.mmd`) vẫn thuộc `docs/` — mở thư mục hoặc xem mục [Nghiệp vụ, DB, thanh toán](#nghiệp-vụ-db-thanh-toán).

### Frontend & kiểm thử FE

| File | Vai trò |
|------|---------|
| [STRUCTURE.md](STRUCTURE.md) | Cây `src/`, router, `queryKeys` |
| [FRONTEND-DEVELOPER-GUIDE.md](FRONTEND-DEVELOPER-GUIDE.md) | Hướng dẫn FE một file |
| [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | Luồng axios/service, Mermaid |
| [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) | Query, invalidate, migration |
| [FE-ARCHITECTURE-V1-VS-V2 — Phụ lục kiểm tra](FE-ARCHITECTURE-V1-VS-V2.md#phu-luc-kiem-tra-luong-api) | Checklist manual |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Tra cứu API, route, env |

### Backend & phối hợp

| File | Vai trò |
|------|---------|
| [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) | Clone/pull, cổng, sau `git pull` |
| [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | Spring + MySQL + contract |
| [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | Node (demo / đối chiếu) |
| [BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md) | PM / QA / FE ↔ BE |
| [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) | VNPay |

### Audit & tổng quan sản phẩm

| File | Vai trò |
|------|---------|
| [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) | Theo nhóm endpoint |
| [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Theo màn / actor + [phụ lục UI/UX](BE-FE-API-AUDIT-BY-PAGE.md#phu-luc-ui-ux-theo-actor) |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Tổng hợp chức năng + BR tóm tắt |

### Dữ liệu & nghiệp vụ chuẩn

| File | Vai trò |
|------|---------|
| [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) | Source of truth BR |
| [business-rules/README.md](business-rules/README.md) | Excel, script append |
| [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | ERD / MySQL |
| [sql/](sql/) | Script & sơ đồ |

### Vận hành, lịch sử, AI

| File | Vai trò |
|------|---------|
| [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) | Trước production |
| [CHANGELOG.md](CHANGELOG.md) | Lịch sử thay đổi ghi nhận trong docs |
| [AI-CONTEXT-for-TEAM.md](AI-CONTEXT-for-TEAM.md) | Gói tài liệu cho AI — cả team (gồm [A.7 backend](AI-CONTEXT-for-TEAM.md#phan-a7-backend-ai)) |

---

*Cập nhật: thêm **[Phân loại tài liệu](#phân-loại-tài-liệu--tránh-đọc-trùng)** và mục lục nhóm; `npm run typecheck` — xem README gốc.*
