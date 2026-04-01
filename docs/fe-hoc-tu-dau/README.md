# Học Frontend ShopBike từ đầu (tập trung code FE)

Bộ tài liệu trong thư mục này giúp bạn đọc **`src/`** từ dễ đến khó: từ nền tảng web/React → router → API layer → **hai bài thực hành** (luồng mua có kiểm định + đổi lưới 3→4 cột).

**Ưu tiên khi học:** bật **`VITE_USE_MOCK_API=true`** (phần 02) — không cần đọc hướng dẫn backend để chạy được app.

Tài liệu tra cứu dài hơn (khi đi làm thật): [FRONTEND-DEVELOPER-GUIDE.md](../FRONTEND-DEVELOPER-GUIDE.md), [STRUCTURE.md](../STRUCTURE.md), [QUICK-REFERENCE.md](../QUICK-REFERENCE.md).

---

## Lộ trình đọc

| Thứ tự | File | Nội dung chính |
|--------|------|----------------|
| 00 | [00-nen-tang-web-va-react.md](./00-nen-tang-web-va-react.md) | Trình duyệt, HTTP, JS, React (khái niệm) |
| 01 | [01-du-an-la-gi.md](./01-du-an-la-gi.md) | ShopBike, `front-only`, **góc nhìn chỉ FE** |
| 02 | [02-cai-dat-va-chay-local.md](./02-cai-dat-va-chay-local.md) | Node, npm, `.env`, **mock trước** |
| 03 | [03-luong-chay-ung-dung.md](./03-luong-chay-ung-dung.md) | `main.tsx` → `App` → router |
| 04 | [04-cau-truc-thu-muc-src.md](./04-cau-truc-thu-muc-src.md) | `features/`, `lib/`, `apis/`… |
| 05 | [05-routing-va-guard.md](./05-routing-va-guard.md) | Route, guard theo role |
| 06 | [06-goi-api-va-loi.md](./06-goi-api-va-loi.md) | `apiClient`, path, lỗi |
| 07 | [07-react-query-va-zustand.md](./07-react-query-va-zustand.md) | Query, cache, Zustand |
| 08 | [08-form-i18n-giao-dien.md](./08-form-i18n-giao-dien.md) | Form, i18n, Tailwind |
| 09 | [09-ket-noi-nghiep-vu-va-doc-tiep.md](./09-ket-noi-nghiep-vu-va-doc-tiep.md) | Liên kết tài liệu khác |
| **10** | **[10-thuc-hanh-luong-mua-xe-kiem-dinh.md](./10-thuc-hanh-luong-mua-xe-kiem-dinh.md)** | **Luồng mua + kho + kiểm định — mở file nào** |
| **11** | **[11-thuc-hanh-doi-so-cot-luoi-tailwind.md](./11-thuc-hanh-doi-so-cot-luoi-tailwind.md)** | **Đổi 3 cột → 4 cột (Tailwind)** |

---

## Ai nên đọc

- Muốn **học lại từ đầu** và bám vào repo thật.
- Cần ví dụ **cụ thể**: Transaction / Home grid.

---

*Cập nhật: 2026-04-01 — thêm 10–11; 01–02 và README tập trung FE + mock.*
