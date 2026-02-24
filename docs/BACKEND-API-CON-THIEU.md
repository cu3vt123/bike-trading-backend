# API Backend còn thiếu – Tổng hợp Sprint 1 + Task list (để truy trách Quân, Bảo)

> **Nguồn:** Sprint 1 Backend plan (đầy đủ) + Task list SHOP-28→41 + Swagger hiện tại

---

## 0. Sprint 1 Backend Plan – Toàn bộ (từ kế hoạch SP1)

| # | API | Người | Có Swagger? | Ghi chú |
|---|-----|-------|-------------|---------|
| 1 | Login API | Quân | ✅ | POST /auth/login |
| 2 | Signup API | Quân | ✅ | POST /auth/signup |
| 3 | Product Listing API | Quân | ✅ | GET /bikes |
| 4 | Product Detail API | Bảo | ✅ | GET /bikes/{id} |
| 5 | Order & Payment Processing | Quân | ⚠️ Một phần | Có POST/orders, PUT pay – thiếu payments initiate/confirm |
| 6 | Transaction/Escrow Logic | Quân | ❌ | Chưa thấy |
| 7 | Profile API | Bảo | ⚠️ Khác | Có profile/{id} – thiếu /auth/me |
| 8 | Seller Dashboard API | Bảo | ❌ | Chưa thấy |
| 9 | Create Listing API | Bảo | ❌ | Chưa thấy |

**→ 9/9 mục Sprint 1 đã được kiểm tra. Các mục còn thiếu/chưa đủ: 5, 6, 7, 8, 9.**

---

## 1. Tổng quan theo người phụ trách

| Người | API đã có | API còn thiếu |
|-------|-----------|---------------|
| **Quân** | Login, Signup, Product Listing, Order (POST), Payment (PUT) | Transaction/Escrow, bổ sung Order/Payment đầy đủ |
| **Bảo** | Product Detail | Profile (/auth/me), Seller Dashboard, Create Listing |

---

## 2. Chi tiết theo Sprint 1 Backend Plan

### Quân – Đã có trên Swagger

| API | Method | Path | Trạng thái |
|-----|--------|------|------------|
| Login | POST | /api/auth/login | ✅ Có |
| Signup | POST | /api/auth/signup | ✅ Có |
| Product Listing | GET | /api/bikes | ✅ Có |
| Tạo Order | POST | /api/orders | ✅ Có |
| Thanh toán Order | PUT | /api/orders/{id}/pay | ✅ Có |

### Quân – Còn thiếu / Chưa rõ

| API | Mô tả | Ghi chú |
|-----|-------|---------|
| **Transaction / Escrow Logic** | API xử lý transaction, escrow (lock tiền, release, refund) | Chưa thấy trên Swagger |
| **Order – path chuẩn** | FE gọi `/api/buyer/orders` | Backend có `/api/orders` – cần thống nhất hoặc alias |
| **Payments initiate** | Khởi tạo thanh toán (MoMo, Card, Bank) | Chưa thấy `/api/buyer/payments/initiate` |
| **Payments confirm** | Xác nhận thanh toán sau khi user thanh toán | Chưa thấy `/api/buyer/payments/confirm/:orderId` |

---

### Bảo – Đã có trên Swagger

| API | Method | Path | Trạng thái |
|-----|--------|------|------------|
| Product Detail | GET | /api/bikes/{id} | ✅ Có |

### Bảo – Còn thiếu

| API | Mô tả | Ghi chú |
|-----|-------|---------|
| **Profile API (GET /auth/me)** | Lấy user hiện tại từ Bearer token | Có `/auth/profile/{id}` nhưng cần truyền id. FE cần `/auth/me` – decode JWT trả user |
| **Seller Dashboard API** | Thống kê seller (tổng tin, đang bán, đang review, cần update) | Chưa thấy trên Swagger |
| **Create Listing API** | Seller tạo tin đăng xe mới | Chưa thấy (POST /api/seller/listings hoặc tương tự) |

---

## 3. Theo Task list (SHOP-28 đến SHOP-41) – Bổ sung Sprint 1

| Task | Nội dung | Trạng thái | Người |
|------|----------|------------|-------|
| SHOP-28 | BA: Shipping MVP Spec (Sprint 3 prep) | TO DO | BA |
| SHOP-29 | BA: Draft Business Rules Shipping – Sprint 3 | Done | BA |
| SHOP-30 | BA: Draft ERD v2 Shipping – Sprint 3 | TO DO | BA |
| SHOP-31 | **Quân: Swagger/OAS polish** Buyer endpoints (listing, detail, order, payment, transaction, profile) | **TO DO** | Quân |
| SHOP-32 | Quân: Seed data Buyer demo | Done | Quân |
| SHOP-33 | Quân: CORS config | Done | Quân |
| SHOP-34 | Bảo: Git governance | Done | Bảo |
| SHOP-35 | Bảo: Backend runbook + sample accounts + swagger URLs | Done | Bảo |
| SHOP-36 | Bảo: Postman collection Buyer flow | Done | Bảo |
| SHOP-37 | Bảo: ErrorResponse + ControllerAdvice | Done | Bảo |
| SHOP-38 | **Bảo: API contract checklist + 1 review (Quân + FE1)** | **TO DO** | Bảo |
| SHOP-41 | FE2: Inspector Dashboard (Sprint 2) | TO DO | FE2 |

**Backend còn TO DO:** SHOP-31 (Quân), SHOP-38 (Bảo).

---

## 4. Bảng tổng hợp – API còn thiếu

| # | API | Người | Mức ưu tiên | Ghi chú |
|---|-----|-------|-------------|---------|
| 1 | **GET /api/auth/me** | Bảo | Cao | Lấy user từ token, không cần truyền id |
| 2 | **Transaction / Escrow** | Quân | Cao | Logic giao dịch, lock/release tiền |
| 3 | **POST /api/buyer/payments/initiate** | Quân | Cao | Khởi tạo thanh toán (Checkout) |
| 4 | **POST /api/buyer/payments/confirm/:orderId** | Quân | Cao | Xác nhận thanh toán |
| 5 | **GET /api/buyer/orders** | Quân | Trung bình | Danh sách order của buyer |
| 6 | **GET /api/buyer/orders/:id** | Quân | Trung bình | Chi tiết order |
| 7 | **GET /api/buyer/transactions/:orderId** | Quân | Trung bình | Trạng thái transaction |
| 8 | **GET /api/buyer/profile** | Bảo | Trung bình | Profile buyer |
| 9 | **Seller Dashboard API** | Bảo | Trung bình | Thống kê (tổng tin, published, in review, need update) |
| 10 | **Create Listing API** | Bảo | Trung bình | POST – Seller tạo tin đăng |
| 11 | **Thống nhất path orders** | Quân | Cao | FE gọi `/buyer/orders` – cần align |
| 12 | **Validation signup** | Quân | Cao | Password: chữ in hoa + ký tự đặc biệt |

---

## 5. Tóm tắt truy trách

### Quân cần bổ sung gấp
- Transaction/Escrow logic
- Payments: initiate + confirm
- Path /buyer/orders (hoặc document rõ mapping)
- Swagger polish (SHOP-31)
- Validation password signup

### Bảo cần bổ sung gấp
- GET /api/auth/me
- Seller Dashboard API
- Create Listing API
- GET /api/buyer/profile (nếu khác auth/me)

---

*Tài liệu tham chiếu: docs/HUONG-DAN-BACKEND.md*
