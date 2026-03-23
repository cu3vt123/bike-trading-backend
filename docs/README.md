# Tài liệu dự án ShopBike

Toàn bộ tài liệu nằm trong `docs/`. Root [README.md](../README.md) có bảng tóm tắt.

## Bắt đầu nhanh

| Bạn cần… | Mở file |
|----------|---------|
| Tra cứu nhanh: API, thuật ngữ, routes, env | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) |
| Kiểm tra khớp API BE–FE | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md), [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) |
| Chạy backend Node | [BACKEND-GUIDE.md](BACKEND-GUIDE.md) |
| Port Node → Spring Boot | [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) |
| Thiết kế DB, tạo bảng, vẽ ERD | [ERD-SPEC.md](ERD-SPEC.md), [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) |
| Quy tắc nghiệp vụ | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) |
| Luồng màn hình theo vai trò | [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md) |
| Vẽ State Chart từng bước | [STATE-CHART-HUONG-DAN.md](STATE-CHART-HUONG-DAN.md) |

## Mục lục MD

| File | Nội dung |
|------|----------|
| [STRUCTURE.md](STRUCTURE.md) | Cấu trúc Frontend (feature-based), quy ước import |
| [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | **Hướng dẫn Backend** (Node/Express): cấu trúc, env, Mongo, API, VNPAY Sandbox |
| [USER-REQUIREMENTS.md](USER-REQUIREMENTS.md) | **User requirements (UR)** — yêu cầu người dùng / stakeholder, ưu tiên Must/Should |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Tổng kết dự án, business rules, luồng màn hình, flow runtime |
| [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md) | **Screen Flow** – Guest, Buyer, Seller, Inspector, Admin |
| [UI-UX-AUDIT-BY-ACTOR.md](UI-UX-AUDIT-BY-ACTOR.md) | **Rà soát UI/UX** – Kiểm tra chi tiết từng actor, so với Screen Flow |
| [STATE_TRANSITION_DIAGRAM_GUIDE.md](STATE_TRANSITION_DIAGRAM_GUIDE.md) | **State Diagram** – Order, Listing, Review + Mermaid + bảng transitions |
| [STATE-CHART-HUONG-DAN.md](STATE-CHART-HUONG-DAN.md) | **Hướng dẫn vẽ State Chart** – Từng bước chi tiết cho dự án ShopBike |
| [ERD-MYSQL.md](ERD-MYSQL.md) | **Thiết kế MySQL 17 bảng** — ERD Mermaid, SQL schema, quan hệ |
| [ERD-SPEC.md](ERD-SPEC.md) | **Đặc tả schema** — cột, ENUM, FK, luồng nghiệp vụ (tham chiếu BE / vẽ ERD) |
| [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | **Hướng dẫn vẽ ERD** — Mermaid, Draw.io, tạo bảng MySQL (bước chi tiết) |
| [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) | **Rà soát API BE–FE** — So sánh endpoint theo khu vực, logic, dead code đã xóa |
| [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | **Rà soát API theo Page** — Mapping từng trang/actor → API gọi → BE route |
| [CHANGELOG.md](CHANGELOG.md) | Lịch sử thay đổi |
| [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) | Thanh toán VNPay — gói seller, buyer checkout, sandbox (Return vs IPN, .env, thẻ test) |
| [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) | **Business Rules** đầy đủ — Listing, Order, Payment, Finalize, VietQR, … |
| [business-rules/README.md](business-rules/README.md) | Hướng dẫn Business Rules, Excel, script append |
| [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) | Ship-ready: Error Boundary, lazy route, API errors, checklist (theo Bài 09 kat-minh) |
| [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | **Backend:** chuyển Node→Spring Boot — JWT, endpoint map, JPA entities (ERD-SPEC), `fulfillmentType` kho vs direct |
| [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | CREATE TABLE MySQL 17 bảng |
| [sql/vietqr_mysql.sql](sql/vietqr_mysql.sql) | VietQR module (đồ án) |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | **Tham chiếu nhanh** — API, thuật ngữ, routes, env, vị trí file |
