# Tài liệu dự án ShopBike

Đây là **trung tâm mục lục** cho thư mục `docs/`. Root **[README.md](../README.md)** có hướng dẫn **cài đặt, chạy BE + FE, biến môi trường, xử lý sự cố** chi tiết — đọc file đó trước khi đào sâu từng tài liệu bên dưới.

**Monorepo BE2:** React/Vite và Spring Boot cùng repo — [README.md](../README.md), [STRUCTURE.md](STRUCTURE.md).

---

## Mục lục tài liệu này

1. [Đọc nhanh (ưu tiên)](#đọc-nhanh-ưu-tiên)
2. [Lộ trình học 3 cấp](#lộ-trình-học-3-cấp)
3. [Kiến trúc & tích hợp BE](#kiến-trúc--tích-hợp-be)
4. [Nghiệp vụ, DB, thanh toán](#nghiệp-vụ-db-thanh-toán)
5. [Lịch sử & testing](#lịch-sử--testing)
6. [Tài liệu local (không commit)](#tài-liệu-local-không-commit)
7. [Mục lục đầy đủ (theo tên file)](#mục-lục-đầy-đủ-theo-tên-file)

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
| Chuyển giao Node → Spring, map endpoint | [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | JWT, business rules, checklist. |
| Backend Node (demo / đối chiếu) | [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | Cấu trúc code, env, auth, VNPay. |
| Rà soát API BE–FE (theo khu vực / endpoint) | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) | Bảng method/path. |
| Rà soát API BE–FE (theo trang / actor) | [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Chi tiết UI + API từng page. |

---

## Nghiệp vụ, DB, thanh toán

| Nhu cầu | Tài liệu | Ghi chú |
|---------|----------|---------|
| Business rules đầy đủ | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md), [business-rules/README.md](business-rules/README.md) | Source of truth + script Excel. |
| Yêu cầu người dùng (UR) | [USER-REQUIREMENTS.md](USER-REQUIREMENTS.md) | Spec người dùng. |
| Tổng quan dự án | [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Chức năng, stack, tóm tắt BR. |
| Luồng màn hình theo vai | [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md) | Ai làm gì ở màn nào. |
| UI/UX audit theo actor | [UI-UX-AUDIT-BY-ACTOR.md](UI-UX-AUDIT-BY-ACTOR.md) | Đánh giá UX. |
| State order/listing (Mermaid) | [STATE_TRANSITION_DIAGRAM_GUIDE.md](STATE_TRANSITION_DIAGRAM_GUIDE.md), [STATE-CHART-HUONG-DAN.md](STATE-CHART-HUONG-DAN.md) | Sơ đồ trạng thái. |
| ERD / MySQL / đặc tả cột | [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | DB & vẽ ERD. |
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
| [CHANGELOG.md](CHANGELOG.md) | Lịch sử thay đổi docs/code |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Tổng kết |
| [USER-REQUIREMENTS.md](USER-REQUIREMENTS.md) | UR |
| [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md) | Screen flow |
| [UI-UX-AUDIT-BY-ACTOR.md](UI-UX-AUDIT-BY-ACTOR.md) | Audit UI |
| [STATE_TRANSITION_DIAGRAM_GUIDE.md](STATE_TRANSITION_DIAGRAM_GUIDE.md) | State diagram |
| [STATE-CHART-HUONG-DAN.md](STATE-CHART-HUONG-DAN.md) | Hướng dẫn state chart |
| [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) | Audit theo endpoint |
| [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | Audit theo page |
| [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) | Clone/pull, chạy Node hoặc Spring + FE |
| [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | Node backend |
| [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | Port Spring |
| [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) | Ship-ready checklist |
| [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) | VNPay |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Tham chiếu nhanh |
| [ERD-SPEC.md](ERD-SPEC.md), [ERD-MYSQL.md](ERD-MYSQL.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | ERD / MySQL / hướng dẫn vẽ |
| [sql/](sql/) | Script SQL |

---

*Cập nhật: đồng bộ với kiến trúc FE V2 (TanStack Query, RHF, Zod), README gốc chi tiết, và mục lục có lộ trình học.*
