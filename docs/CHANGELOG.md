# Changelog – Tóm tắt thay đổi ShopBike Frontend

Tài liệu ghi nhận các thay đổi chính so với phiên bản trước (sau Sprint 1 + Sprint 2).

**Quy ước:** Mỗi mục chỉ dùng tiêu đề **`[ngày-tháng-năm]`** (`DD-MM-YYYY`) hoặc **`[tháng-năm]`** (`MM-YYYY`) khi không ghi rõ ngày. **Mới nhất ở trên cùng.** Chi tiết theo bảng **Thay đổi / Chi tiết**.

---

## [26-03-2026]

| Thay đổi | Chi tiết |
|----------|----------|
| **ERD/SQL** | `ERD-SPEC`, `ERD-HUONG-DAN`, `ERD-MYSQL` — mục lục, cách đọc, liên kết BR / VietQR / quick ref. |
| **`FE-V2-VERIFICATION-GUIDE.md`** | Kiểm tra luồng & API: checklist theo vai, TanStack Query invalidate. |
| **`BACKEND-COLLABORATION.md`** | PM/QA/FE làm việc với BE; cập nhật link từ README / guides. |
| **Xóa 4 file spec** | UR, screen flow, state diagram; tham chiếu → `PROJECT-SUMMARY`, `BUSINESS-RULES`, audit. |
| **`BACKEND-LOCAL-SETUP` + README** | Sau clone/pull; `BACKEND-GUIDE`, `backend/README`, `HELP`, `BACKEND-NODE-TO-SPRING-BOOT`. |
| **README + docs lớn** | Root `README`, `docs/README`, `HELP`, `QUICK-REFERENCE` §10, `FE-ARCHITECTURE-V1-VS-V2` §7, `STRUCTURE`, `testing/README`. |
| **`docs/README` + kiến trúc FE** | Lộ trình 3 cấp; `FE-ARCHITECTURE-V1-VS-V2`; `PRODUCTION-HARDENING`; bảng auth refresh. |
| **`.gitignore` + testing** | `docs/testing/`; mục tài liệu local trong `docs/README`; `HELP` trợ giúp ShopBike. |
| **Spring + Inspector + FE** | `GET /api/inspector/listings/{id}`; `SecurityConfig` INSPECTOR+ADMIN; `ProductDetailPage` fallback inspector; `QUICK-REFERENCE`, `BE-FE-API-AUDIT-BY-PAGE`, `FRONTEND-API-FLOWS`. |
| **`AI-CONTEXT-for-BACKEND.md`** | Gợi ý gói tài liệu đính kèm cho AI (Gemini, …); mục lục `README` + `docs/README`. |
| **`AI-CONTEXT-for-TEAM.md`** | Mở rộng cho Backend + Frontend + QA/Tester: bối cảnh chung, gói file & prompt từng vai; `AI-CONTEXT-for-BACKEND` trỏ về đây. |

---

## [25-03-2026]

| Thay đổi | Chi tiết |
|----------|----------|
| **`docs/testing/`** | SWT301 test case, Lab 4 Defect Management, template CSV, `testing/README`, link trong `docs/README`. |
| **`FRONTEND-API-FLOWS.md`** | Mở rộng mục lục, §5–§7, sequence VNPay, bảng trang → file. |
| **Đồng bộ docs** | `QUICK-REFERENCE`, `STRUCTURE`, `README`, `BACKEND-GUIDE`, audit, `PROJECT-SUMMARY`, `PRODUCTION-HARDENING`. |
| **`BACKEND-NODE-TO-SPRING-BOOT.md`** | Upload ảnh, `PUBLIC_ORIGIN` / CORS, contract checkout khớp Node. |

---

## [15-03-2026]

| Thay đổi | Chi tiết |
|----------|----------|
| **`BACKEND-NODE-TO-SPRING-BOOT.md`** | Bản chi tiết: endpoint map, JPA, rules, VNPay, checklist, curl. |
| **Monorepo BE2 + Git** | `README` / `docs`; `.gitignore` `.cursor/`; ghi chú rewrite commit (contributors). |

---

## [03-2026]

| Thay đổi | Chi tiết |
|----------|----------|
| **Rà soát API BE–FE** | `BE-FE-API-AUDIT`, `BE-FE-API-AUDIT-BY-PAGE`; dọn dead code (`apiConfig`, `buyerApi`, constants); `README`, `QUICK-REFERENCE`, `CHANGELOG`. |
| **Dọn file backup** | `.xlsx` backup; `.gitignore` `*.backup.*`. |
| **Dọn copy UI** | VNPAY, chat, gói seller, thông báo lỗi API. |
| **Đơn hàng & VNPay** | Địa chỉ, hủy WAREHOUSE, pay balance VNPay, Success/Review; cập nhật docs thanh toán. |
| **Dọn docs ERD / VNPAY** | Xóa `ERD.md` trùng; gộp sandbox vào `PAYMENTS-VNPAY`; sửa ref VietQR. |
| **MySQL 17 bảng** | `ERD-MYSQL`, `sql/shopbike_mysql_schema.sql`, ERD Mermaid. |
| **Business rules** | `business-rules/BUSINESS-RULES.md`, script append Excel; tham chiếu trong summary/docs. |
| **Luồng kho / thanh toán** | WAREHOUSE/DIRECT, chỉ VNPAY, Finalize, countdown; backend/docs. |
| **Nhánh follow thầy Lâm** | `BACKEND-NODE-TO-SPRING-BOOT`, `PROJECT-SUMMARY`, `backend/README`, `STRUCTURE`; gói tin & fulfillment. |
| **Production hardening** | ErrorBoundary, RouteFallback, `apiErrors`, ESLint ignore `backend/**`. |
| **Gọn docs (đợt 1)** | Xóa `RUN-FULL-PROJECT`, gộp ERD (lịch sử); cập nhật link. |
| **Gọn docs (đợt 2)** | Xóa `HUONG-DAN-DEMO`, …; gộp `RUN-FULL-PROJECT`; `STATE_TRANSITION`; `docs/README`. |
| **Đồng bộ + tính năng** | Auth/403, ratings seller, CRUD brands (FE+BE); `AI-INSTRUCTIONS` (lịch sử). |

---

## [03-2025]

| Thay đổi | Chi tiết |
|----------|----------|
| **i18n** | Toàn app vi/en; lỗi validate/API qua `t()`; Seller Orders/Ratings; Admin Categories/Transactions; `useNotificationStore` i18n. |
| **Flow + thông báo + Header** | `FLOW-HE-THONG.md`; chỉ xóa thông báo đã đọc; globe + wishlist; bỏ route `/cart`. |
| **Tái cấu trúc + docs** | Feature-based, `createBrowserRouter`, guards; xóa docs lỗi thời; `STRUCTURE.md` mới. |

---

## [02-2025]

| Thay đổi | Chi tiết |
|----------|----------|
| **Gộp `docs/`** | Một folder `docs/`; `backend/docs` → `docs/backend`; `docs/README` mục lục. |
| **Sprint 3 hội đồng** | Inspector Dashboard, `inspectorApi` / `sellerApi` / `sellerService`, `RequireInspector`, docs sprint. |
| **Auth + Support + Wishlist + UI** | Forgot/Reset password, Support, Wishlist, filters Home, mock Seller orders, polish, `API-INTEGRATION`. |
| **Node → Spring + UI/BE** | `CHUYEN-GIAO-NODE-SANG-SPRING-BOOT.md`; `HUONG-DAN-BACKEND` login; Hero/Login/Transaction/Admin/Seller/Header; BE: `inspectionReport`, VND, unhide, login bỏ role. |
| **Wishlist** | Chỉ hiện khi BUYER đã đăng nhập. |
| **`HUONG-DAN-FE2-JOIN-GIT.md`** | Hướng dẫn clone/branch/commit; cập nhật `PROJECT-SUMMARY`. |

---

*Cập nhật lần cuối: 26-03-2026 — tiêu đề [ngày-tháng], sắp mới → cũ; bảng Thay đổi / Chi tiết.*
