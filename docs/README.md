# Tài liệu dự án ShopBike

Đây là **trung tâm mục lục** cho thư mục `docs/`. Root **[README.md](../README.md)** có hướng dẫn **cài đặt, chạy BE + FE, biến môi trường, xử lý sự cố** chi tiết — đọc file đó trước khi đào sâu từng tài liệu bên dưới.

**Monorepo BE2:** React/Vite và Spring Boot cùng repo — [README.md](../README.md), [STRUCTURE.md](STRUCTURE.md).

---

## Mục lục tài liệu này

1. [Đọc nhanh (ưu tiên)](#đọc-nhanh-ưu-tiên)
2. [Backend: Java Spring Boot (hướng dẫn & tài liệu)](#backend-java-spring-boot-hướng-dẫn--tài-liệu)
3. [AI: gợi ý tài liệu cho cả team (BE / FE / QA)](#ai-context-team)
4. [Lộ trình học 3 cấp](#lộ-trình-học-3-cấp)
5. [Kiến trúc & tích hợp BE](#kiến-trúc--tích-hợp-be)
6. [Nghiệp vụ, DB, thanh toán](#nghiệp-vụ-db-thanh-toán)
7. [Lịch sử & testing](#lịch-sử--testing)
8. [Tài liệu local (không commit)](#tài-liệu-local-không-commit)
9. [Mục lục đầy đủ (theo tên file)](#mục-lục-đầy-đủ-theo-tên-file)

---

## Đọc nhanh (ưu tiên)

| Nhu cầu | Tài liệu | Mô tả ngắn |
|---------|----------|------------|
| **Chạy dự án, env, lint/build, sự cố** | [README.md](../README.md) | Hướng dẫn gốc — bắt buộc khi onboard. |
| **API, routes, thuật ngữ, env, order status** | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Tra cứu nhanh khi code hoặc port API. |
| **Luồng gọi API trên FE** (axios, `apis/`, `services/`, VNPay) | [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | Đi từ request đến đúng file TypeScript. |
| **So sánh kiến trúc FE cũ / mới** (Query, RHF, refresh, invalidate) | **[FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md)** | Hiểu V2 và cách chỉnh code không lệch cache. |
| **Cấu trúc thư mục FE, quy ước import** | [STRUCTURE.md](STRUCTURE.md) | Cây `src/`, `queryKeys`, hooks `queries/`. |
| **Checklist ship / hardening** | [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) | Trước khi deploy production. |
| **Kiểm tra luồng + API (V2, thủ công)** | **[FE-V2-VERIFICATION-GUIDE.md](FE-V2-VERIFICATION-GUIDE.md)** | Lint/build, checklist theo vai, Query invalidate, Network. |

---

## Backend: Java Spring Boot (hướng dẫn & tài liệu)

Dành cho **dev backend** làm việc với API Spring Boot trong repo này (IntelliJ, Maven, MySQL). Frontend nằm cùng monorepo — bạn vẫn cần `npm install` + `.env` nếu muốn chạy UI để kiểm thử end-to-end; **bước chi tiết và xử lý sự cố** nằm ở [README.md](../README.md) mục **Dành cho Backend (Java Spring Boot, IntelliJ)**.

| Nhu cầu | Tài liệu | Ghi chú |
|---------|----------|---------|
| **Clone, MySQL, IntelliJ, chạy Spring + `npm run dev`** | [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) | Một lộ trình đủ để chạy local; cổng, sau `git pull`. |
| **Chuyển đổi / đối chiếu Node (Express) → Spring Boot** — endpoint, JWT, enum, multipart, VNPay | [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | “Port” công nghệ và hợp đồng JSON; đọc kèm `backend/` nếu cần so hành vi. |
| **API mà FE đang gọi** | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md), [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Khớp `src/apis/` với controller Spring. |
| **Quy tắc nghiệp vụ** | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) | BR-ID; không chỉ suy từ entity. |
| **Schema DB, ERD, SQL** | [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | JPA entity ↔ bảng/cột/ENUM. |
| **VNPay** | [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) | Return, IPN, khớp bảng thanh toán. |
| **Làm việc với PM/QA/FE** | [BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md) | Thuật ngữ, mẫu ticket. |
| **Backend Node (demo)** | [BACKEND-GUIDE.md](BACKEND-GUIDE.md), [../backend/README.md](../backend/README.md) | Không chạy cùng cổng với Spring. |
| **Tra cứu nhanh env, auth, order status** | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Hỗ trợ cả FE và khi đối chiếu API. |

---

<a id="ai-context-team"></a>

## AI: gợi ý tài liệu cho cả team (BE / FE / QA)

*(Áp dụng khi đính kèm tài liệu cho Gemini, ChatGPT, Claude, … — dev backend, dev frontend, hoặc tester/QA.)*

**Một file đủ dài, phân vai rõ:** **[AI-CONTEXT-for-TEAM.md](AI-CONTEXT-for-TEAM.md)** — bối cảnh chung (copy-paste); **Phần A** Backend; **Phần B** Frontend; **Phần C** QA / SWT301; bảng tổng hợp; mẫu prompt; doc thường không cần gửi.

| Nhu cầu | Tài liệu | Ghi chú |
|---------|----------|---------|
| **Chỉ cần nhắc backend (link cũ)** | [AI-CONTEXT-for-BACKEND.md](AI-CONTEXT-for-BACKEND.md) | File ngắn — **chuyển hướng** sang `AI-CONTEXT-for-TEAM.md` (mục Phần A). |

Root [README.md](../README.md) có mục **[Gợi ý tài liệu cho AI (Backend, Frontend, QA)](../README.md#readme-ai-context-team)** — tóm tắt + link.

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

## Kiến trúc & tích hợp BE

| Nhu cầu | Tài liệu | Ghi chú |
|---------|----------|---------|
| **Cài đặt sau clone/pull — Node + Spring + FE** | **[BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md)** | Một bài đọc: đủ bước để chạy local. |
| **PM / QA / FE làm việc với BE** | **[BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md)** | Thuật ngữ, mẫu báo bug, ai đọc file nào — không cần dạy lại BE. |
| Chuyển giao Node → Spring, map endpoint | [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | JWT, business rules, checklist. |
| Backend Node (demo / đối chiếu) | [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | Cấu trúc code, env, auth, VNPay. |
| Rà soát API BE–FE (theo khu vực / endpoint) | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) | Bảng method/path. |
| Rà soát API BE–FE (theo trang / actor) | [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Chi tiết UI + API từng page. |

---

## Nghiệp vụ, DB, thanh toán

| Nhu cầu | Tài liệu | Ghi chú |
|---------|----------|---------|
| Business rules đầy đủ | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md), [business-rules/README.md](business-rules/README.md) | Source of truth + script Excel. |
| Tổng quan dự án | [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Chức năng, stack, luồng tóm tắt, BR. |
| UI/UX audit theo actor | [UI-UX-AUDIT-BY-ACTOR.md](UI-UX-AUDIT-BY-ACTOR.md) | Đánh giá UX; bổ sung cho audit API theo page. |
| ERD / MySQL / đặc tả cột | [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | DB & vẽ ERD; mục lục + **Cách đọc** trong từng file; đối chiếu màn hình/API — [FE-V2-VERIFICATION-GUIDE.md](FE-V2-VERIFICATION-GUIDE.md). |
| VNPay | [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) | Luồng thanh toán. |

---

## Lịch sử & testing

| Nội dung | File |
|----------|------|
| Changelog tóm tắt | [CHANGELOG.md](CHANGELOG.md) |
| Hướng dẫn testing (SWT301, v.v.) | [testing/README.md](testing/README.md), [testing/SWT301_TESTING_GUIDE.md](testing/SWT301_TESTING_GUIDE.md) |

---

## Tài liệu local (không commit)

Các file **CSV/XLSX/screenshot** nộp bài cá nhân hoặc export script có thể nằm trong `docs/testing/generated/`, `evidence/`, … và bị **`.gitignore`** ở root repo.

- Xem **[testing/README.md](testing/README.md)** — mô tả rõ artifact local và lệnh `export-defectlist`.  
- Không commit file chứa dữ liệu nhạy cảm hoặc chỉ dùng một lần.

---

## Mục lục đầy đủ (theo tên file)

| File | Ghi chú ngắn |
|------|----------------|
| [STRUCTURE.md](STRUCTURE.md) | Cây thư mục FE, providers, apis/services |
| [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | Luồng API chi tiết, Mermaid |
| [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) | So sánh V1/V2 + hướng dẫn thực hành |
| [FE-V2-VERIFICATION-GUIDE.md](FE-V2-VERIFICATION-GUIDE.md) | Kiểm tra luồng & API (checklist) |
| [CHANGELOG.md](CHANGELOG.md) | Lịch sử thay đổi docs/code |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Tổng kết |
| [UI-UX-AUDIT-BY-ACTOR.md](UI-UX-AUDIT-BY-ACTOR.md) | Audit UI |
| [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) | Audit theo endpoint |
| [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Audit theo page |
| [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) | Clone/pull, chạy Node hoặc Spring + FE |
| [BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md) | PM/QA/FE hỗ trợ BE, thuật ngữ, mẫu ticket |
| [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | Node backend |
| [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | Port Spring |
| [AI-CONTEXT-for-TEAM.md](AI-CONTEXT-for-TEAM.md) | Gói `.md` đính kèm cho AI (BE / FE / QA) |
| [AI-CONTEXT-for-BACKEND.md](AI-CONTEXT-for-BACKEND.md) | Alias → `AI-CONTEXT-for-TEAM` (Phần A) |
| [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) | Ship-ready checklist |
| [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) | VNPay |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Tham chiếu nhanh |
| [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | ERD / MySQL / hướng dẫn vẽ |
| [sql/](sql/) | Script SQL |

---

*Cập nhật: đồng bộ với kiến trúc FE V2 (TanStack Query, RHF, Zod), README gốc chi tiết, và mục lục có lộ trình học.*
