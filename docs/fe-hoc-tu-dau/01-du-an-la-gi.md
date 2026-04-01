# 01 — Dự án là gì, repo này chứa gì

## ShopBike (Bike Trading) là gì

Ở góc độ frontend: đây là ứng dụng **web marketplace** cho xe đạp — có **người mua**, **người bán**, **kiểm định viên**, **admin**, luồng **đặt hàng / kho / thanh toán** (VNPay trong tài liệu riêng).

Bạn không cần nhớ hết nghiệp vụ ngay; quan trọng là biết **FE hiển thị dữ liệu và hành động** theo API backend.

---

## Repo `front-only` (thư mục frontend bạn đang mở)

- Chỉ có **mã React + Vite + TypeScript** (và tài liệu).
- **Không** có source Spring Boot hay MySQL **trong** repo này.
- Backend chính được team đặt trên nhánh **[Bespring](https://github.com/cu3vt123/bike-trading-backend/tree/Bespring)** cùng remote GitHub — dev FE thường **clone worktree** hoặc clone thư mục riêng để chạy API.

Điều đó có nghĩa:

- File `.env` ở **root** frontend quyết định FE gọi **mock** hay **API thật** (`VITE_USE_MOCK_API`, `VITE_API_BASE_URL`).
- Khi báo lỗi “API không chạy”, cần kiểm tra **terminal backend** và **URL trong `.env`**, không chỉ code React.

---

## Các “vai” (role) trong app

FE kiểm tra quyền qua token + route guard (chi tiết ở phần 05). Tóm tắt:

| Role (khác nhau tùy backend) | Giao diện điển hình |
|------------------------------|---------------------|
| Khách | Xem sản phẩm, đăng ký / đăng nhập |
| Buyer | Giỏ hàng, checkout, theo dõi đơn |
| Seller | Dashboard, đăng tin, gói dịch vụ |
| Inspector | Duyệt tin / kiểm định |
| Admin | Quản trị người dùng, đơn kho, duyệt |

Danh sách route và path API tra cứu nhanh: [QUICK-REFERENCE.md](../QUICK-REFERENCE.md).

---

## Tài liệu tổng quan sản phẩm (không chỉ code)

Nếu bạn muốn hiểu **luồng nghiệp vụ** trước khi đọc code:

- [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md)
- [business-rules/BUSINESS-RULES.md](../business-rules/BUSINESS-RULES.md)

---

**Tiếp theo:** [02-cai-dat-va-chay-local.md](./02-cai-dat-va-chay-local.md) — cài Node, tạo `.env`, chạy `npm run dev`.
