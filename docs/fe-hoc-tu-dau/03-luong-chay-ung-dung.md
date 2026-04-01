# 03 — Luồng chạy ứng dụng (từ file đầu tiên tới Router)

Phần này trả lời: **Khi chạy `npm run dev`, code bắt đầu từ đâu và đi theo thứ tự nào?**

---

## 1. Điểm vào: `index.html` và `main.tsx`

Vite phục vụ `index.html`. Trong đó có một thẻ kiểu:

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

**`src/main.tsx`** là file **entry** của React:

1. Import cấu hình i18n (`@/i18n`).
2. Import `App` từ `@/app/App`.
3. Import CSS toàn cục `./index.css`.
4. Gọi `ReactDOM.createRoot(...).render(<App />)` — gắn cây React vào `#root`.

Bạn có thể mở trực tiếp file: `src/main.tsx`.

---

## 2. Component gốc: `src/app/App.tsx`

`App` bọc toàn bộ app bằng các **provider** (ngữ cảnh dùng chung):

Thứ tự điển hình (từ ngoài vào trong):

1. **ErrorBoundary** — bắt lỗi render, tránh cả trang “crash” im lặng.
2. **QueryClientProvider** — cung cấp TanStack Query cho mọi component con.
3. **ThemeProvider** — chế độ sáng/tối (class trên `document`).
4. **RouterProvider** — React Router, định nghĩa URL → trang.

File: `src/app/App.tsx`.

---

## 3. Router nằm ở đâu

Router được tạo trong **`src/app/router.tsx`** bằng `createBrowserRouter` (React Router v6+).

- Các route **public** và **auth** import trực tiếp hoặc `lazy()` để **chia nhỏ bundle**.
- Một số nhánh route bọc bởi layout `MainLayout` — header/chung cho nhiều trang.
- Route cần đăng nhập bọc trong `RequireAuth` hoặc guard theo role (`RequireBuyer`, `RequireSeller`, …).

Khi URL đổi, React Router **không** tải lại toàn bộ trang HTML; chỉ đổi component được render bên trong layout.

---

## 4. i18n khởi tạo sớm

`main.tsx` import `@/i18n` **trước** `App` để mọi component dùng `useTranslation` đều sẵn sàng.

---

## 5. Sơ đồ tóm tắt

```text
index.html
  └── main.tsx  →  createRoot(#root)
         └── <App />
               ├── ErrorBoundary
               ├── QueryClientProvider  (TanStack Query)
               ├── ThemeProvider
               └── RouterProvider       ← router.tsx (routes + guards)
```

---

## 6. Liên quan tới “API khi nào gọi”

Router chỉ **quyết định trang nào hiển thị**. Dữ liệu thường được tải **trong từng trang** hoặc **hook** (ví dụ `useQuery` trong `src/hooks/queries/`). Phần 06–07 nói kỹ hơn.

---

**Tiếp theo:** [04-cau-truc-thu-muc-src.md](./04-cau-truc-thu-muc-src.md) — giải thích từng nhóm thư mục trong `src/`.
