# ShopBike Frontend

React + Vite frontend cho **Bike Trading** – mua bán xe đạp thể thao cũ.

---

## Backend – Thứ tự đọc tài liệu (chuyển giao Node → Spring Boot)

> **Dành cho team Backend Java.** Đọc theo thứ tự dưới đây để hiểu và implement API tương thích với Frontend.

| Bước | File | Nội dung |
|------|------|----------|
| **1** | `docs/CHUYEN-GIAO-NODE-SANG-SPRING-BOOT.md` | **Đọc đầu tiên.** Tổng hợp: models (User, Listing, Order, Review), API endpoints, Auth/JWT, luồng Order & Shipping, Admin hide/unhide, checklist Spring Boot. |
| **2** | `docs/HUONG-DAN-BACKEND.md` | Contract API chi tiết – request/response từng endpoint. |
| **3** | `docs/backend/PORTING-NODE-TO-SPRING-BOOT.md` | Mapping model + API từ Node sang Spring. |
| **4** | `docs/backend/SPRING-BOOT-SKELETON.md` | Skeleton project Spring Boot (pom, packages, controller mẫu, security). |
| **5** | `docs/RUN-FULL-PROJECT.md` | Cách chạy toàn bộ FE + BE (nếu muốn demo). |
| **6** | `backend/README.md` | Chạy backend Node demo (tham khảo logic). |

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
| [docs/FLOW-HE-THONG.md](docs/FLOW-HE-THONG.md) | **Giải thích flow làm việc toàn bộ hệ thống** – khởi động app, auth, phân quyền route, Header (ngôn ngữ, theme, thông báo), luồng Buyer/Seller/Inspector/Admin, stores, API. |
| [docs/PROJECT-SUMMARY.md](docs/PROJECT-SUMMARY.md) | Tổng kết dự án, business rules, i18n, chức năng đã hoàn thành. |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Lịch sử thay đổi. |
| [docs/AI-INSTRUCTIONS.md](docs/AI-INSTRUCTIONS.md) | Hướng dẫn cho người mới hoặc AI khác khi làm việc với codebase này trong Cursor. |

**i18n:** Ứng dụng hỗ trợ Tiếng Việt / English (react-i18next). Chuyển đổi qua icon Globe trên Header.

