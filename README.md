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
| `docs/` | ERD, flow, **Production hardening** |

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

## Backend – Tài liệu cho team Backend

| File | Nội dung |
|------|----------|
| `docs/ERD.md` | ERD – MongoDB entities + SQL schema (User, Listing, Order, Review, Brand). |
| `docs/SCREEN_FLOW_BY_ACTOR.md` | Screen Flow từng Actor – luồng người dùng, endpoint tương ứng. |
| `docs/STATE_TRANSITION_DIAGRAM_GUIDE.md` | State diagram Order/Listing/Review. |
| `backend/README.md` | Chạy backend Node demo – endpoints, tài khoản demo. |
| [docs/BACKEND-NODE-TO-SPRING-BOOT.md](docs/BACKEND-NODE-TO-SPRING-BOOT.md) | Hướng dẫn chuyển BE từ Node sang **Java Spring Boot** (giữ contract cho FE). |

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

Mở `http://localhost:5173`.

---

## Tài liệu flow hệ thống

| File | Nội dung |
|------|----------|
| [docs/PROJECT-SUMMARY.md](docs/PROJECT-SUMMARY.md) | Tổng kết dự án, business rules, flow runtime, i18n, chức năng đã hoàn thành. |
| [docs/SCREEN_FLOW_BY_ACTOR.md](docs/SCREEN_FLOW_BY_ACTOR.md) | Screen Flow chi tiết theo từng Actor (Guest, Buyer, Seller, Inspector, Admin). |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Lịch sử thay đổi. |

**i18n:** Ứng dụng hỗ trợ Tiếng Việt / English (react-i18next). Chuyển đổi qua icon Globe trên Header.
