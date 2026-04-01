# 05 — Routing và bảo vệ route (Guard)

Mục tiêu: hiểu **URL nào** mở **trang nào**, và **ai được phép** xem trang đó.

Nguồn chính: `src/app/router.tsx`.

---

## 1. `createBrowserRouter`

React Router (v7 trong repo) dùng cấu trúc **cây route**:

- Route cha có `element: <MainLayout />` — các route con render **bên trong** layout (thường qua `<Outlet />` trong layout).
- `index: true` — trang mặc định khi path khớp cha (ví dụ `/`).
- `path: "bikes/:id"` — tham số động `:id`, đọc trong page bằng `useParams()`.

---

## 2. Lazy load (code splitting)

Nhiều trang import bằng:

```ts
const CheckoutPage = lazy(() =>
  import("@/features/buyer").then((m) => ({ default: m.CheckoutPage })),
);
```

Ý nghĩa: file JS của `CheckoutPage` **chỉ tải khi** user vào route đó — giảm bundle ban đầu.

`Suspense` bọc component lazy với **fallback** (ví dụ `RouteFallback` — loader).

---

## 3. Guard (route protection)

Guard là **component bọc** children; nếu điều kiện không thỏa, **redirect** hoặc hiển thị **403**.

Trong repo, các guard nằm ở `src/shared/components/common/` (và export qua `index.ts`):

| Component | Ý nghĩa typical |
|-----------|-----------------|
| `GuestRoute` | Chỉ khách (chưa login), thường cho login/register |
| `RequireAuth` | Đã đăng nhập |
| `RequireBuyer` | Role buyer |
| `RequireSeller` | Role seller |
| `RequireInspector` | Role inspector |
| `RequireAdmin` | Role admin |

Logic cụ thể (đọc token từ Zustand, kiểm tra role) nằm trong từng file guard — **đọc code** khi bạn debug “vào URL bị đẩy về login”.

---

## 4. Thêm một route mới (checklist ngắn)

1. Tạo hoặc export page từ `features/...` hoặc `pages/`.
2. Trong `router.tsx`: thêm object `{ path: "...", element: ... }` đúng chỗ trong cây (public vs trong `RequireAuth`).
3. Nếu page nặng: dùng `lazy` + `Suspense` giống các route có sẵn.
4. Thêm link điều hướng (`<Link>` hoặc `useNavigate`) và cập nhật i18n nếu có menu.
5. Cập nhật `QUICK-REFERENCE.md` nếu team dùng bảng đó làm chuẩn.

---

## 5. Lỗi thường gặp

| Hiện tượng | Gợi ý |
|------------|--------|
| Vào `/profile` bị đẩy về `/login` | Chưa login hoặc token hết hạn; xem Network tab auth |
| Seller vào được URL buyer | Guard chưa bọc đúng nhánh — kiểm tra `router.tsx` |
| Trang trắng khi chuyển route | Lỗi trong lazy import — xem Console |

---

**Tiếp theo:** [06-goi-api-va-loi.md](./06-goi-api-va-loi.md).
