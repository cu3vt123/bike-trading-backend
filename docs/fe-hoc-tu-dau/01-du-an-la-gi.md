# 01 — Dự án là gì (góc nhìn Frontend)

## ShopBike là gì

Ứng dụng **web** marketplace xe đạp: **buyer** xem xe và mua, **seller** đăng tin, **inspector** xử lý kiểm định tin, **admin** xử lý kho / một phần kiểm soát. Phần **thanh toán** (VNPay) gắn với vài màn hình — bạn học dần qua code và mock.

**Trọng tâm khi học nhánh này:** đọc **React**, **route**, **component**, **hook gọi dữ liệu**, **trạng thái đơn** trên UI — không cần cài hay hiểu chi tiết backend để bắt đầu.

---

## Repo `front-only` chứa gì

- **Chỉ** mã **React + Vite + TypeScript** trong `src/` + tài liệu `docs/`.
- Dữ liệu khi dev: thường bật **mock** (`VITE_USE_MOCK_API=true` trong `.env`) để chạy app **không cần** chạy máy chủ API — xem phần 02.

Nếu sau này bạn nối API thật, chỉ cần chỉnh `.env` và hiểu là FE nhận **JSON** qua HTTP; phần **“mở server backend ở đâu”** là việc riêng, không nằm trong repo này.

---

## Các vai (role) và màn hình

| Role | Bạn sẽ mở page nào (gợi ý) |
|------|-----------------------------|
| Khách / Buyer | Trang chủ, chi tiết xe, giỏ, checkout, transaction |
| Seller | Seller dashboard, sửa tin |
| Inspector | Inspector dashboard |
| Admin | Admin dashboard |

Route cụ thể nằm trong **`src/app/router.tsx`** (phần 05).

---

## Tài liệu nghiệp vụ (khi cần hiểu sâu)

- [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md)
- [business-rules/BUSINESS-RULES.md](../business-rules/BUSINESS-RULES.md)

**Thực hành theo luồng mua + kiểm định trong code:** [10-thuc-hanh-luong-mua-xe-kiem-dinh.md](./10-thuc-hanh-luong-mua-xe-kiem-dinh.md).

---

**Tiếp theo:** [02-cai-dat-va-chay-local.md](./02-cai-dat-va-chay-local.md).
