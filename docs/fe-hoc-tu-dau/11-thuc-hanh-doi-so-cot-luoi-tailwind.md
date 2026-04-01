# 11 — Thực hành: đổi lưới từ 3 cột sang 4 cột (Tailwind)

Trong project, bố cục dạng “3 ô một hàng” trên màn to thường viết bằng **CSS Grid của Tailwind**: `grid` + `grid-cols-*` + breakpoint `sm:` / `lg:`.

---

## 1. Quy ước cực ngắn

| Class | Ý nghĩa |
|-------|---------|
| `grid` | Bật lưới |
| `gap-4` | Khoảng cách giữa các ô |
| `sm:grid-cols-2` | Từ màn ≥ `sm`: **2 cột** |
| `lg:grid-cols-3` | Từ màn ≥ `lg`: **3 cột** |

Muốn **4 cột** trên màn lớn: đổi thành `lg:grid-cols-4` (hoặc `xl:grid-cols-4` nếu chỉ muốn rất rộng mới 4 cột — tùy bạn).

---

## 2. Ví dụ: trang chủ — danh sách xe (3 → 4)

File:** `src/pages/HomePage.tsx**

Tìm khối bọc `ListingCard` (khoảng cuối file, trong `section`):

```tsx
<div className="mt-6 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
```

**Sửa thành:**

```tsx
<div className="mt-6 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
```

Lưu ý: **mobile** vẫn 1 cột (mặc định), **sm** vẫn 2 cột; chỉ từ **lg** trở lên mới thành 4 cột. Nếu bạn muốn “4 cột từ màn sm”:

```tsx
<div className="mt-6 grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

(Điều chỉnh `md` / `lg` cho hợp mắt.)

---

## 3. Các chỗ khác trong repo cũng dùng `lg:grid-cols-3`

Nếu bạn muốn **đồng bộ toàn app** thành 4 cột, có thể sửa tương tự (luôn đọc ngữ cảnh trước khi đổi):

| File | Ghi chú |
|------|---------|
| `src/pages/WishlistPage.tsx` | Lưới wishlist |
| `src/pages/SellerStatsPage.tsx` | Thẻ thống kê |
| `src/pages/SellerListingEditorPage.tsx` | Lưới phụ trong form |
| `src/pages/ProductDetailPage.tsx` | Lưới ảnh / khối phụ |
| `src/pages/AboutUsPage.tsx` | Nội dung giới thiệu |
| `src/pages/TransactionPage.tsx` | Có `grid-cols-3` cố định cho một khối nhỏ — **không** nhất thiết đổi thành 4 (có thể là 3 bước cố định). |

**Nguyên tắc:** chỉ đổi chỗ nào là **danh sách thẻ** lặp lại; chỗ nào là **3 cột có ý nghĩa cố định** (ví dụ 3 ô thông tin) thì giữ 3.

---

## 4. Sau khi sửa

1. Lưu file → Vite **hot reload**.
2. Thu/phóng cửa sổ trình duyệt để thấy breakpoint `sm` / `lg` đổilayout.
3. Nếu ô quá nhỏ, tăng `gap-*` hoặc giảm số cột ở `md`.

---

**Quay lại mục lục:** [README.md](./README.md)
