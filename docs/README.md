# Tài liệu dự án ShopBike

Toàn bộ tài liệu nằm trong `docs/`.

## Tài liệu chung

| File | Nội dung |
|------|----------|
| [STRUCTURE.md](STRUCTURE.md) | Cấu trúc Frontend (feature-based), quy ước import |
| [BACKEND-GUIDE.md](BACKEND-GUIDE.md) | **Hướng dẫn Backend** (Node/Express): cấu trúc, env, Mongo, API, VNPAY Sandbox |
| [USER-REQUIREMENTS.md](USER-REQUIREMENTS.md) | **User requirements (UR)** — yêu cầu người dùng / stakeholder, ưu tiên Must/Should |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | Tổng kết dự án, business rules, luồng màn hình, flow runtime |
| [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md) | **Screen Flow** – Guest, Buyer, Seller, Inspector, Admin |
| [STATE_TRANSITION_DIAGRAM_GUIDE.md](STATE_TRANSITION_DIAGRAM_GUIDE.md) | **State Diagram** – Order, Listing, Review + Mermaid + hướng dẫn vẽ |
| [ERD.md](ERD.md) | ERD – MongoDB entities + SQL schema (Starter & Normalized) – User, Listing, Order, Review, Brand |
| [CHANGELOG.md](CHANGELOG.md) | Lịch sử thay đổi |
| [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) | Thanh toán gói đăng tin — VNPay (tham khảo + luồng production) |
| [business-rules/README.md](business-rules/README.md) | Sheet **Business Rules** (Excel) — cập nhật rule thanh toán / VNPay |
| [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) | Ship-ready: Error Boundary, lazy route, API errors, checklist (theo Bài 09 kat-minh) |
| [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | **Backend:** port flow Express → Spring Boot (JWT, endpoint map, `fulfillmentType` kho vs direct) |
