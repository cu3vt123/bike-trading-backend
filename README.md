# ShopBike Frontend

React + Vite frontend cho **Bike Trading** – mua bán xe đạp thể thao cũ.

## Tính năng (tóm tắt)

- Marketplace, chi tiết xe, wishlist (buyer)
- Checkout / transaction / đánh giá
- Seller: dashboard, tạo tin, gói đăng tin + kiểm định tùy chọn
- Inspector / Admin dashboard
- i18n (vi/en), dark/light theme
- Auth + role guard (Buyer / Seller / Inspector / Admin)

## Cấu trúc thư mục (rút gọn)

| Thư mục | Vai trò |
|---------|---------|
| `src/app/` | App shell, router, ErrorBoundary, providers |
| `src/features/` | Theo domain (auth, buyer, seller, …) |
| `src/shared/` | Layout, guards, UI dùng chung |
| `src/lib/` | apiClient, apiConfig, `apiErrors`, utils |
| `src/stores/` | Zustand (auth, wishlist, …) |
| `docs/` | Tài liệu MD — xem [docs/README.md](docs/README.md) |

## Cài đặt nhanh

```bash
cp .env.example .env   # chỉnh VITE_API_BASE_URL nếu cần
npm install
npm run dev
```

- **API thật:** `VITE_USE_MOCK_API=false`, chạy backend trong `backend/` (xem `backend/README.md`).
- **Chỉ FE + mock:** `VITE_USE_MOCK_API=true`.

## Lệnh chất lượng (ship-ready)

```bash
npm run lint    # ESLint (frontend; thư mục backend bị ignore trong eslint.config)
npm run build   # Production bundle
```

Checklist mở rộng: [docs/PRODUCTION-HARDENING.md](docs/PRODUCTION-HARDENING.md) (dựa trên [Bài 09 Hardening – kat-minh/react](https://github.com/kat-minh/react/blob/main/09-hardening-theory-guide.md)).

---

## Tài liệu (docs/)

**Mục lục đầy đủ:** [docs/README.md](docs/README.md)

| Nhóm | File | Nội dung |
|------|------|----------|
| **Tổng quan** | [PROJECT-SUMMARY.md](docs/PROJECT-SUMMARY.md) | Business rules, luồng màn hình, flow runtime |
| | [USER-REQUIREMENTS.md](docs/USER-REQUIREMENTS.md) | Yêu cầu người dùng (UR), trace chức năng |
| **Backend** | [BACKEND-GUIDE.md](docs/BACKEND-GUIDE.md) | Hướng dẫn Node/Express, Mongo, API, VietQR/VNPay |
| | [BACKEND-NODE-TO-SPRING-BOOT.md](docs/BACKEND-NODE-TO-SPRING-BOOT.md) | Port Node → Spring Boot |
| **Database** | [ERD-MYSQL.md](docs/ERD-MYSQL.md) | Thiết kế MySQL 17 bảng, ERD Mermaid |
| | [docs/sql/shopbike_mysql_schema.sql](docs/sql/shopbike_mysql_schema.sql) | CREATE TABLE |
| **Luồng** | [SCREEN_FLOW_BY_ACTOR.md](docs/SCREEN_FLOW_BY_ACTOR.md) | Screen flow theo Actor |
| | [STATE_TRANSITION_DIAGRAM_GUIDE.md](docs/STATE_TRANSITION_DIAGRAM_GUIDE.md) | State diagram Order/Listing/Review |
| **Thanh toán** | [PAYMENTS-VNPAY.md](docs/PAYMENTS-VNPAY.md) | VNPay gói seller, buyer checkout, sandbox |
| **Quy tắc** | [business-rules/BUSINESS-RULES.md](docs/business-rules/BUSINESS-RULES.md) | Business rules đầy đủ |
| **Khác** | [STRUCTURE.md](docs/STRUCTURE.md) | Cấu trúc FE feature-based |
| | [PRODUCTION-HARDENING.md](docs/PRODUCTION-HARDENING.md) | Ship-ready checklist |
| | [CHANGELOG.md](docs/CHANGELOG.md) | Lịch sử thay đổi |

### Thông tin quan trọng

- **Login:** FE không gửi `role` – role lấy từ tài khoản trong DB.
- **User ẩn:** `isHidden = true` → không đăng nhập được.
- **Complete order:** Chỉ khi `status = SHIPPING`.
- **Base URL:** `http://localhost:8081/api`

### Kết nối FE với Backend Spring Boot

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

```bash
npm install && npm run dev
```

Mở `http://localhost:5173`. Chạy backend: [backend/README.md](backend/README.md). **i18n:** Tiếng Việt / English (icon Globe trên Header).
