# 04 — Cấu trúc thư mục `src/` (đọc code theo hướng nào)

Repo tổ chức theo hướng **feature-based** + **shared** + **lib**. Bảng dưới là “bản đồ” khi bạn mở `src/`.

Chi tiết đầy đủ và bảng tra cứu: [STRUCTURE.md](../STRUCTURE.md).

---

## 1. `src/app/`

- **`App.tsx`** — cây provider gốc.
- **`router.tsx`** — định nghĩa route, lazy load, guard.
- **`providers/`** — export `RouterProvider`, `QueryClientProvider`, v.v.
- **`ErrorBoundary.tsx`** — xử lý lỗi UI.

**Khi nào vào đây:** thêm provider toàn cục, thêm route mới cấp cao.

---

## 2. `src/features/`

Code gắn với **tính năng / vai trò** người dùng:

| Thư mục | Gợi ý nội dung |
|---------|----------------|
| `auth/` | Login, register, quên mật khẩu |
| `landing/` | Trang chủ |
| `bikes/` | Chi tiết xe / listing |
| `buyer/` | Checkout, giao dịch, thành công mua hàng |
| `seller/` | Dashboard seller, sửa tin |
| `inspector/` | Bảng điều khiển kiểm định |
| `support/` | Hỗ trợ, wishlist |

Mỗi feature thường có `pages/` hoặc export page qua `index.ts`.

**Khi nào vào đây:** sửa **một màn hình** hoặc **luồng** của buyer/seller/…

---

## 3. `src/shared/`

Thứ **dùng lại** nhiều nơi:

- **`components/common/`** — `GuestRoute`, `RequireAuth`, `RequireBuyer`, …
- **`layouts/MainLayout.tsx`** — khung layout chung (header, outlet).
- **`pages/`** — một số trang dùng chung (ví dụ `ForbiddenPage`).

**Khi nào vào đây:** guard route, layout, component “không thuộc một feature riêng”.

---

## 4. `src/lib/`

“**Công cụ và cấu hình**” — ít chứa JSX:

| File / nhóm | Vai trò |
|-------------|---------|
| `env.ts` | Đọc biến `import.meta.env` (Vite) |
| `apiConfig.ts` | `API_BASE_URL`, đường dẫn path, timeout |
| `apiClient.ts` | Axios instance + Bearer + xử lý 401/refresh |
| `apiErrors.ts` | Chuẩn hóa message lỗi từ server |
| `queryClient.ts`, `queryKeys.ts` | Cấu hình TanStack Query, khóa cache |
| `workflow.ts`, `orderOverrides.ts`, … | Nghiệp vụ / tiện ích domain |

**Khi nào vào đây:** đổi **base URL**, sửa **interceptor**, thêm **query key**, helper dùng chọn.

---

## 5. `src/apis/`

Các hàm **gọi HTTP** gần với REST: thường `apiClient.get/post/...` + path từ `API_PATHS`.

**Khi nào vào đây:** thêm/sửa endpoint (path, method, kiểu request/response).

---

## 6. `src/services/`

Lớp “**dịch vụ**” có thể gọi `apis/`, gom logic, **mock** hoặc fallback — xem [FRONTEND-API-FLOWS.md](../FRONTEND-API-FLOWS.md).

**Khi nào vào đây:** luồng phức tạp (nhiều bước API), hoặc chỗ cần mock.

---

## 7. `src/hooks/` và `src/hooks/queries/`

- **Custom hook** dùng lại logic giữa các page.
- **`queries/`** — hook bọc `useQuery` / `useMutation` (TanStack Query).

**Khi nào vào đây:** thêm nguồn dữ liệu mới, chuẩn hóa cache/invalidate.

---

## 8. `src/stores/`

**Zustand** — state toàn cục nhẹ (auth token, wishlist, theme có thể ở đây hoặc provider).

**Khi nào vào đây:** dữ liệu cần **đồng bộ toàn app** không thuộc một query đơn lẻ.

---

## 9. `src/types/`

Định nghĩa TypeScript: user, order, listing, …

**Khi nào vào đây:** backend đổi contract — cập nhật type để TypeScript bắt lỗi chỗ FE.

---

## 10. `src/locales/`

`vi.json`, `en.json` — chuỗi hiển thị đa ngôn ngữ.

---

## 11. `src/pages/`, `src/components/`, `src/layouts/` (legacy / tạm)

Một phần code cũ hoặc page chưa chuyển hết vào `features/`. Khi sửa bug, **tìm đúng page đang được router import** — có thể nằm ở `features/` hoặc `pages/`.

---

## Thứ tự đề xuất khi đọc một tính năng mới

1. **Router** — URL nào?
2. **Page / feature** — component chính.
3. **Hook query** — dữ liệu từ đâu?
4. **`apis/`** hoặc **`services/`** — HTTP thật.
5. **`types/`** — hình dạng dữ liệu.

---

**Tiếp theo:** [05-routing-va-guard.md](./05-routing-va-guard.md).
