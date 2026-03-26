# Changelog – Tóm tắt thay đổi ShopBike Frontend

Tài liệu ghi nhận các thay đổi chính so với phiên bản trước (sau Sprint 1 + Sprint 2).

**Quy ước:** Mỗi mục chỉ dùng tiêu đề **`[ngày-tháng-năm]`** (`DD-MM-YYYY`) hoặc **`[tháng-năm]`** (`MM-YYYY`) khi không ghi rõ ngày. **Mới nhất ở trên cùng.**

---

## [26-03-2026]

- ERD/SQL: `ERD-SPEC`, `ERD-HUONG-DAN`, `ERD-MYSQL` — mục lục, cách đọc, liên kết BR / VietQR / quick ref.
- `FE-V2-VERIFICATION-GUIDE.md` — kiểm tra luồng & API (checklist theo vai, Query invalidate).
- `BACKEND-COLLABORATION.md` — PM/QA/FE làm việc với BE; cập nhật link từ README / guides.
- Xóa 4 file spec cũ (UR, screen flow, state diagram); cập nhật tham chiếu sang `PROJECT-SUMMARY`, `BUSINESS-RULES`, audit.
- `BACKEND-LOCAL-SETUP.md` + README sau clone/pull; `BACKEND-GUIDE`, `backend/README`, `HELP`, `BACKEND-NODE-TO-SPRING-BOOT`.
- README root + `docs/README` + `HELP` + `QUICK-REFERENCE` §10 + `FE-ARCHITECTURE-V1-VS-V2` §7 + `STRUCTURE` + `testing/README`.
- `docs/README` — lộ trình 3 cấp; `FE-ARCHITECTURE-V1-VS-V2`; `PRODUCTION-HARDENING`; bảng auth refresh.
- `.gitignore` `docs/testing/`; mục tài liệu local trong `docs/README`; `HELP` trợ giúp ShopBike.
- Spring: `GET /api/inspector/listings/{id}`; `SecurityConfig` INSPECTOR+ADMIN; `ProductDetailPage` fallback inspector; cập nhật `QUICK-REFERENCE`, `BE-FE-API-AUDIT-BY-PAGE`, `FRONTEND-API-FLOWS`.

---

## [25-03-2026]

- `testing/`: SWT301 test case, Lab 4 Defect Management, template CSV, `testing/README`, link trong `docs/README`.
- `FRONTEND-API-FLOWS.md` — mở rộng mục lục, §5–§7, sequence VNPay, bảng trang→file.
- Đồng bộ `QUICK-REFERENCE`, `STRUCTURE`, `README`, `BACKEND-GUIDE`, audit, `PROJECT-SUMMARY`, `PRODUCTION-HARDENING`.
- `BACKEND-NODE-TO-SPRING-BOOT` — upload ảnh, `PUBLIC_ORIGIN` / CORS, contract checkout khớp Node.

---

## [15-03-2026]

- `BACKEND-NODE-TO-SPRING-BOOT.md` — bản chi tiết: endpoint map, JPA, rules, VNPay, checklist, curl.
- Monorepo BE2 trong `README` / `docs`; `.gitignore` `.cursor/`; ghi chú rewrite Git (contributors).

---

## [03-2026]

- Rà soát API BE–FE (`BE-FE-API-AUDIT`, `BE-FE-API-AUDIT-BY-PAGE`); dọn dead code (`apiConfig`, `buyerApi`, constants); cập nhật `README`, `QUICK-REFERENCE`, `CHANGELOG`.
- Dọn file backup `.xlsx`; `.gitignore` `*.backup.*`.
- Dọn copy UI (VNPAY, chat, gói seller, lỗi API).
- Fix địa chỉ, hủy WAREHOUSE, pay balance VNPay, Success/Review; cập nhật docs thanh toán.
- Xóa `ERD.md` trùng; gộp nội dung sandbox vào `PAYMENTS-VNPAY`; sửa ref VietQR.
- MySQL 17 bảng: `ERD-MYSQL`, `sql/shopbike_mysql_schema.sql`, ERD Mermaid.
- `business-rules/BUSINESS-RULES.md`, script append Excel; tham chiếu trong summary/docs.
- Luồng kho/DIRECT, VNPAY-only, Finalize, countdown; cập nhật backend/docs.
- Nhánh follow thầy Lâm: `BACKEND-NODE-TO-SPRING-BOOT`, `PROJECT-SUMMARY`, `backend/README`, `STRUCTURE`, codebase gói tin & fulfillment.
- Production hardening: ErrorBoundary, RouteFallback, `apiErrors`, ESLint ignore backend.
- Gọn docs: xóa `RUN-FULL-PROJECT`, gộp ERD (lịch sử); cập nhật link.
- Gọn docs: xóa `HUONG-DAN-DEMO`, …; gộp `RUN-FULL-PROJECT`; `STATE_TRANSITION`; `docs/README`.
- Đồng bộ docs; fix auth/403; ratings seller thật; CRUD brands (FE+BE); `AI-INSTRUCTIONS` (lịch sử).

---

## [03-2025]

- i18n toàn app (vi/en); thông báo lỗi đa ngôn ngữ; Seller Orders/Ratings; Admin Categories/Transactions; `useNotificationStore` i18n.
- `FLOW-HE-THONG.md`; thông báo chỉ xóa khi đã đọc; Header globe + wishlist; bỏ `/cart`.
- Tái cấu trúc feature-based; router `createBrowserRouter`; guards; xóa docs lỗi thời; `STRUCTURE.md` mới.

---

## [02-2025]

- Gộp toàn bộ tài liệu vào `docs/` (trước đây tách rải); chuyển `backend/docs` → `docs/backend`; `docs/README` mục lục.
- Sprint 3 hội đồng: Inspector Dashboard, `inspectorApi`/`sellerApi`/`sellerService`, `RequireInspector`, cập nhật docs sprint.
- Forgot Password / Reset Password / Support / Wishlist; Home filters; Seller mock orders; UI polish; `API-INTEGRATION`.
- Chuyển giao Node → Spring (`CHUYEN-GIAO-NODE-SANG-SPRING-BOOT`); `HUONG-DAN-BACKEND` login; UI Hero/Login/Wishlist/Transaction/Admin/Seller/Header; BE inspectionReport, VND, unhide, login bỏ role.
- Wishlist chỉ BUYER đăng nhập.
- `HUONG-DAN-FE2-JOIN-GIT.md`; cập nhật `PROJECT-SUMMARY`.

---

*Cập nhật lần cuối: 26-03-2026 — định dạng changelog: chỉ tiêu đề [ngày-tháng], sắp xếp mới → cũ.*
