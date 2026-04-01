# 06 — Gọi API và xử lý lỗi

Phần này mô tả **lớp HTTP** của frontend: từ biến môi trường tới Axios và chỗ định nghĩa path.

---

## 1. Biến môi trường Vite (`VITE_*`)

Vite chỉ đưa vào bundle các biến bắt đầu bằng `VITE_`. Trong code, đọc qua `import.meta.env.VITE_...` (thường đã bọc trong `src/lib/env.ts`).

Hai biến quan trọng:

| Biến | Ý nghĩa |
|------|---------|
| `VITE_API_BASE_URL` | URL gốc API (ví dụ `http://localhost:8081/api`) |
| `VITE_USE_MOCK_API` | `true` → một số luồng dùng mock / service thay vì gọi mạng |

Sửa `.env` ở **root** repo, rồi **restart** `npm run dev`.

---

## 2. `apiConfig.ts` — base URL và path

`src/lib/apiConfig.ts` gom:

- `API_BASE_URL` — nối từ env.
- `API_PATHS` — object các path REST (`AUTH.LOGIN`, `BUYER.ORDERS`, …).

**Lợi ích:** đổi path backend một chỗ, tránh string rải rác.

---

## 3. `apiClient.ts` — Axios instance

`src/lib/apiClient.ts` tạo `axios.create({ baseURL, timeout, ... })` và **interceptors**:

1. **Request:** gắn header `Authorization: Bearer <accessToken>` lấy từ **Zustand** (`useAuthStore`).
2. **Request:** nếu body là `FormData`, bỏ `Content-Type` để trình duyệt tự set boundary.
3. **Response lỗi 401:** thử **refresh token** (POST refresh), retry một lần; không được thì `clearTokens()` (đăng xuất phía client).

Khi debug 401 vòng: xem thứ tự request trong **Network**, và response body lỗi từ server.

---

## 4. `apis/` — hàm gọi endpoint

Thư mục `src/apis/` chứa module theo domain (`authApi.ts`, `buyerApi.ts`, …). Mỗi hàm thường:

- Gọi `apiClient.get/post/put/delete` với path từ `API_PATHS`.
- Khai báo kiểu TypeScript cho input/output (hoặc dùng type từ `types/`).

**Quy tắc thực tế:** UI và hook **không** tự tạo `axios` mới; ưu tiên dùng `apiClient` hoặc bọc qua `services/`.

---

## 5. `apiErrors.ts` — message hiển thị cho user

Backend có thể trả `{ message: "..." }` hoặc cấu trúc lồng nhau. `getApiErrorMessage` (hoặc tương đương) chuẩn hóa để toast / form nhận **một chuỗi** ổn định.

---

## 6. Mock vs API thật

Khi `VITE_USE_MOCK_API=true`, một số `services/` có thể **trả dữ liệu cứng** hoặc đi nhánh khác — chi tiết luồng: [FRONTEND-API-FLOWS.md](../FRONTEND-API-FLOWS.md).

---

## 7. Checklist khi “API không chạy”

1. Backend có đang listen đúng cổng không?
2. `VITE_API_BASE_URL` có **đuôi `/api`** đúng như BE không?
3. Tab Network: status **4xx/5xx** hay **CORS failed**?
4. Token có hợp lệ không (Sau login, header Authorization có không)?

---

**Tiếp theo:** [07-react-query-va-zustand.md](./07-react-query-va-zustand.md).
