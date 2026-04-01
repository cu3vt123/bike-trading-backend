# Production hardening & FE patterns (ShopBike)

Tài liệu này áp dụng tinh thần **[BÀI 09: Production Hardening & FE Theory](https://github.com/kat-minh/react/blob/main/09-hardening-theory-guide.md)** (kat-minh/react) vào dự án ShopBike.

**Cách đọc:** Đây là **checklist và bảng trạng thái** — không thay cho [README.md](../README.md) (chạy dự án) hay [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) (kiến trúc). Đọc từ **§ Đã tích hợp** để biết code đã có gì; **§ Việc nên làm thêm** là backlog polish trước ship. Dev mới: sau file này nên xem `src/lib/apiClient.ts`, `src/hooks/useLogout.ts`, `src/app/ErrorBoundary.tsx`.

---

## Đã tích hợp trong repo

| Hạng mục (Bài 09) | Trạng thái trong ShopBike |
|-------------------|---------------------------|
| **Route lazy loading** | `src/app/router.tsx` — `React.lazy` + `Suspense` cho các trang ít dùng. |
| **Suspense fallback** | `RouteFallback` — spinner + aria, thay chữ "Loading..." chung chung. |
| **Error Boundary** | `src/app/ErrorBoundary.tsx` — bọc `App`, tránh trắng trang khi render lỗi. |
| **Auth interceptor** | `src/lib/apiClient.ts` — gắn Bearer; **401** → thử **`POST /auth/refresh`** (nếu có `refreshToken`) và retry 1 lần; không được thì **clearTokens**. |
| **Logout sạch state** | `useAuthStore.clearTokens` + xóa subscription seller (Zustand) + **`queryClient.removeQueries()`** (TanStack Query). |
| **Lỗi API có nghĩa** | `src/lib/apiErrors.ts` — `getApiErrorMessage()` map Axios / timeout / 5xx. |
| **`.env.example`** | Biến `VITE_*` có chú thích. |
| **Lint / build** | `npm run lint`, `npm run build` — ESLint bỏ qua `backend/**` (Node) để tập trung FE. |

---

## Dev: trang tự load lại / mất flow

- **React Strict Mode** (dev): `main.tsx` dùng `<React.StrictMode>` → component mount 2 lần → effect chạy 2 lần. Có thể gây cảm giác "nhảy" hoặc mất state. Build production (`npm run build`) tắt StrictMode tự động.
- **Scroll/navigate loop**: Đã xử lý trong `MainLayout` + `HomePage` — dùng `processedScrollRef` tránh xử lý scrollTo 2 lần, delay 150ms trước khi clear state.
- **401 từ API**: Khi token hết hạn, interceptor `clearTokens` → mất session. Cần refresh token khi BE hỗ trợ.

---

## Việc nên làm thêm trước khi ship

- [x] **Silent refresh token (FE)**: Interceptor đã gọi `/auth/refresh` khi có refresh token — **cần BE triển khai đúng**; nếu không, vẫn clear session khi 401.
- [x] **Query cache khi logout**: `useLogout` gọi `queryClient.removeQueries()` (toàn bộ cache query).
- [ ] **Error Boundary theo route**: Bọc từng layout lớn nếu muốn isolate lỗi theo khu vực.
- [ ] **Skeleton theo trang**: Thay `RouteFallback` bằng skeleton giống layout Home/Detail khi cần polish.
- [ ] **ESLint TypeScript**: Cân nhắc `@typescript-eslint` cho `src/**/*.{ts,tsx}` (hiện config chỉ target `.js/.jsx` trong phạm vi đã ignore).
- [ ] **Core Web Vitals**: Đo LCP/INP/CLS (Chrome DevTools / PageSpeed) sau khi deploy.
- [ ] **Deploy SPA**: Cấu hình server (nginx / static host) **fallback `index.html`** cho mọi route sâu (reload không 404).

---

## Tham chiếu nhanh (cheatsheet API — Bài 09)

Luồng debug: **FE Request → Network → Server → Response → FE state**.

| Triệu chứng | Hướng xử lý |
|-------------|-------------|
| Không thấy request | Kiểm tra có gọi hàm / điều kiện `useEffect`. |
| 404 | Sai `baseURL` hoặc route BE. |
| 401 | Token hết hạn / sai header `Authorization`. |
| 200 nhưng UI sai | Map sai shape (`data` vs `content`). |

**Luồng gọi API & mock trên dự án:** [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md).

Chi tiết đầy đủ xem file gốc trên GitHub kat-minh/react.
