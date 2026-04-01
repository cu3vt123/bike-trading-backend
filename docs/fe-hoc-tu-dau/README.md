# Học Frontend ShopBike từ đầu

Bộ tài liệu này nằm trong repo **frontend** (`front-only`): giải thích **từ ý tưởng web** tới **cách code trong `src/`** của dự án thật. Đọc **theo thứ tự** phần 00 → 09.

Sau khi đọc xong, bạn dùng song song các file tra cứu sâu: [FRONTEND-DEVELOPER-GUIDE.md](../FRONTEND-DEVELOPER-GUIDE.md), [STRUCTURE.md](../STRUCTURE.md), [QUICK-REFERENCE.md](../QUICK-REFERENCE.md).

---

## Lộ trình đọc

| Thứ tự | File | Nội dung chính |
|--------|------|----------------|
| 00 | [00-nen-tang-web-va-react.md](./00-nen-tang-web-va-react.md) | Trình duyệt, HTTP, DOM, JavaScript, React (khái niệm) |
| 01 | [01-du-an-la-gi.md](./01-du-an-la-gi.md) | ShopBike là gì, nhánh `front-only`, backend ở đâu |
| 02 | [02-cai-dat-va-chay-local.md](./02-cai-dat-va-chay-local.md) | Node, npm, `.env`, mock vs API thật |
| 03 | [03-luong-chay-ung-dung.md](./03-luong-chay-ung-dung.md) | `main.tsx` → `App` → providers → router |
| 04 | [04-cau-truc-thu-muc-src.md](./04-cau-truc-thu-muc-src.md) | `features/`, `shared/`, `lib/`, `apis/`, `hooks/` |
| 05 | [05-routing-va-guard.md](./05-routing-va-guard.md) | `createBrowserRouter`, `RequireAuth`, role |
| 06 | [06-goi-api-va-loi.md](./06-goi-api-va-loi.md) | `apiClient`, `apiConfig`, `apis/`, lỗi mạng |
| 07 | [07-react-query-va-zustand.md](./07-react-query-va-zustand.md) | TanStack Query, `queryKeys`, auth store |
| 08 | [08-form-i18n-giao-dien.md](./08-form-i18n-giao-dien.md) | React Hook Form, Zod, i18n, Tailwind |
| 09 | [09-ket-noi-nghiep-vu-va-doc-tiep.md](./09-ket-noi-nghiep-vu-va-doc-tiep.md) | Đơn hàng, tra cứu, tài liệu tiếp theo |

---

## Ai nên đọc bộ này

- Mới học React hoặc mới vào team FE.
- Muốn hiểu **vì sao** repo tổ chức như vậy trước khi sửa code.
- Đã chạy được `npm run dev` nhưng chưa rõ luồng file nào gọi đâu.

---

## Ghi chú về nhánh `front-only`

Repo này **không** chứa mã Java/Spring. API thật thường chạy từ nhánh **Bespring** trên repo backend — xem [BACKEND-BESPRING-CHAY-API.md](../BACKEND-BESPRING-CHAY-API.md).

*Bộ này: 2026-04-01 — bổ sung lộ trình “học từ đầu” cho FE.*
