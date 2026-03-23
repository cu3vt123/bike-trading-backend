# Production hardening & FE patterns (ShopBike)

Tài liệu này áp dụng tinh thần **[BÀI 09: Production Hardening & FE Theory](https://github.com/kat-minh/react/blob/main/09-hardening-theory-guide.md)** (kat-minh/react) vào dự án ShopBike.

---

## Đã tích hợp trong repo

| Hạng mục (Bài 09) | Trạng thái trong ShopBike |
|-------------------|---------------------------|
| **Route lazy loading** | `src/app/router.tsx` — `React.lazy` + `Suspense` cho các trang ít dùng. |
| **Suspense fallback** | `RouteFallback` — spinner + aria, thay chữ "Loading..." chung chung. |
| **Error Boundary** | `src/app/ErrorBoundary.tsx` — bọc `App`, tránh trắng trang khi render lỗi. |
| **Auth interceptor** | `src/lib/apiClient.ts` — gắn Bearer, **401 → clearTokens** (logout an toàn). |
| **Logout sạch state** | `useAuthStore.clearTokens` + xóa subscription seller (Zustand). |
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

- [ ] **Silent refresh token**: Backend cần refresh endpoint; Axios interceptor gọi refresh rồi retry request (Bài 09 — Auth hardening). Hiện demo chỉ JWT access, hết hạn → 401 → login lại.
- [ ] **Query cache**: Nếu sau này dùng TanStack Query, `logout` nên `queryClient.clear()`.
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

Chi tiết đầy đủ xem file gốc trên GitHub kat-minh/react.
