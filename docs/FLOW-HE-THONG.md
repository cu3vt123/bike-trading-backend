# Flow làm việc của toàn bộ hệ thống ShopBike

Tài liệu giải thích luồng chạy (flow) của ứng dụng frontend ShopBike từ khi mở trang đến từng vai trò người dùng và tính năng chính.

---

## 1. Khởi động ứng dụng

```
index.html
  → main.tsx
    → App.tsx
      → ThemeProvider (dark/light, lưu localStorage)
        → RouterProvider (createBrowserRouter từ app/router.tsx)
          → MainLayout (Header + Outlet)
```

- **ThemeProvider**: Quản lý theme (light/dark), gắn class `dark` lên `<html>`, lưu lựa chọn vào `localStorage` key `shopbike-theme`.
- **Router**: Định nghĩa toàn bộ route; route cha `MainLayout` bọc hầu hết trang (trừ login/register/forgot-password/reset-password, 403).

---

## 2. Luồng xác thực (Auth)

| Bước | Mô tả |
|------|--------|
| **Vào app** | Chưa đăng nhập: token/role lấy từ `useAuthStore` (persist `auth-storage`). Nếu có token thì coi là đã login. |
| **Login** | User vào `/login` → nhập email/password → gọi API (hoặc mock) → nhận `accessToken`, `refreshToken?`, `role` → `setTokens()` → redirect về trang trước hoặc `/`. **Role do backend trả về, FE không gửi role.** |
| **Register** | `/register` → chọn Buyer hoặc Seller → gửi đăng ký → sau khi thành công có thể auto login. |
| **Guards** | `GuestRoute`: đã login thì redirect khỏi `/login`, `/register`. `RequireAuth`: chưa login → redirect `/login`. `RequireBuyer` / `RequireSeller` / `RequireInspector` / `RequireAdmin`: sai role → redirect `/403`. |
| **Logout** | `clearTokens()` → chuyển về `/`. |
| **Đổi role / sai phiên** | Khi đổi role hoặc gặp sai role, token cũ được xóa để tránh giữ phiên cũ gây 403 lặp lại. |

---

## 3. Phân quyền theo role và route

| Role | Route chính | Ghi chú |
|------|-------------|---------|
| **Guest** | `/`, `/bikes/:id`, `/support`, `/wishlist`, `/login`, `/register`, `/forgot-password`, `/reset-password` | Xem trang chủ, chi tiết xe, hỗ trợ, wishlist (danh sách); đăng nhập/đăng ký. |
| **Đã login (bất kỳ)** | `/profile`, `/notifications` | Profile và thông báo dùng chung. |
| **BUYER** | `/checkout/:id`, `/transaction/:id`, `/finalize/:id`, `/success/:id` | Luồng mua hàng. **Không có route `/cart`** (đã bỏ). |
| **SELLER** | `/seller`, `/seller/stats`, `/seller/listings/new`, `/seller/listings/:id/edit` | Dashboard, thống kê, tạo/sửa tin. |
| **INSPECTOR / ADMIN** | `/inspector`, `/admin` | Kiểm định tin (Inspector); Admin có thêm quản lý user, listing, review, brands, transactions. |
| **Sai role** | `/403` | Ví dụ Buyer vào `/seller` → 403. |

---

## 4. Header và điều hướng toàn cục

Header nằm trong `MainLayout`, hiển thị trên mọi trang (trừ khi layout khác).

| Thành phần | Vị trí | Chức năng |
|------------|--------|-----------|
| **Search** | Trái | Mở ô tìm kiếm; submit → chuyển về Home với state `searchQuery`. |
| **Globe (ngôn ngữ)** | Giữa, bên trái chữ "Hỗ trợ" | Dropdown chọn **Tiếng Việt** / **English**. Dùng `useLanguageStore` + **react-i18next** (`src/locales/vi.json`, `en.json`). Toàn bộ UI và thông báo lỗi đa ngôn ngữ. |
| **Hỗ trợ** | Giữa | Link `/support`. |
| **Logo ShopBike** | Giữa | Link `/`. |
| **Danh sách xe** | Giữa | Scroll tới section listings trên Home hoặc navigate Home. |
| **Theme (Sun/Moon)** | Phải | Toggle dark/light; `useTheme()` từ ThemeProvider. |
| **Giỏ hàng (icon)** | Phải (chỉ Buyer) | **Icon giỏ hàng** link tới `/wishlist` (danh sách yêu thích). Đã thay icon tim bằng giỏ hàng; không còn nút giỏ hàng riêng hay route `/cart`. |
| **Đăng ký / Đăng nhập** | Phải (chưa login) | Link register, nút login. |
| **Kênh người bán, Kiểm định viên, Admin, Thông báo, Hồ sơ, Đăng xuất** | Phải (đã login) | Hiện theo role; thông báo có badge số chưa đọc. |

---

## 5. Luồng theo từng vai trò

### 5.1 Buyer (người mua)

1. **Trang chủ** `/` → xem danh sách xe (listings), có thể tìm kiếm.
2. **Chi tiết xe** `/bikes/:id` → xem thông tin, báo cáo kiểm định, nút "Mua ngay" (và wishlist nếu đã login Buyer).
3. **Checkout** `/checkout/:id` → chọn plan (FULL/DEPOSIT), thanh toán, shipping, đồng ý chính sách. Deposit hiện tại là **8%** giá trị đơn.
4. **Transaction** `/transaction/:id` → countdown 24h, logistics, Hủy / Hoàn tất.
5. **Finalize** `/finalize/:id` → thanh toán số dư, xác nhận giao hàng.
6. **Success** `/success/:id` → xác nhận hoàn tất.
7. **Review** → sau khi đơn hoàn tất, buyer có thể review seller; review được Admin nhìn thấy và Seller Dashboard tổng hợp điểm uy tín.
7. **Wishlist** `/wishlist` → danh sách yêu thích (truy cập qua icon giỏ hàng trên header).

### 5.2 Seller (người bán)

1. **Dashboard** `/seller` → tổng quan tin, thống kê, Orders/Deposits, Ratings & reputation.
2. **Tạo/sửa tin** `/seller/listings/new`, `/seller/listings/:id/edit` → form tin, upload ảnh, Save draft / Submit for inspection. Danh sách brand lấy từ API backend.
3. **Thống kê** `/seller/stats` → doanh số, tin đang bán, đơn hoàn thành.
4. **Profile** `/profile` → khi role Seller hiện Seller Profile (edit profile, payment methods).
5. **Thông báo** `/notifications` → thông báo đơn hàng; sync từ `sellerService` (polling 10s).

### 5.3 Inspector / Admin

1. **Inspector Dashboard** `/inspector` → danh sách tin chờ kiểm định; Duyệt / Từ chối / Cần cập nhật.
2. **Admin Dashboard** `/admin` → quản lý user/listing, reviews, categories, brands, transactions & fees.
3. **Brands** → Admin thêm brand mới, seller sẽ thấy ngay trong form đăng tin.
4. **Reviews** → Admin xem review hậu giao dịch; Seller Dashboard lấy dữ liệu điểm uy tín từ `GET /seller/ratings`.

### 5.4 Thông báo (Notifications)

- **Store**: `useNotificationStore` (persist `app-notifications`). Hàm: `addNotification`, `markRead(id)`, `clearReadForRole(role)`, `removeItem(id)`.
- **Logic**: Chỉ **tin đã đọc** mới được xóa (nút "Xóa tin đã đọc" và nút xóa từng tin chỉ hiện với tin đã đọc). Nút **"Hiển thị thông báo chưa đọc"** bật filter chỉ hiện tin chưa đọc; khi bật có thể chuyển lại "Hiển thị tất cả".
- **Trang** `/notifications`: danh sách theo role, nút "Kiểm tra đơn mới" (Seller), filter và xóa theo quy tắc trên.

---

## 6. State toàn cục (Stores)

| Store | Persist key | Nội dung chính |
|-------|-------------|----------------|
| **useAuthStore** | `auth-storage` | `accessToken`, `refreshToken`, `role`; `setTokens`, `clearTokens`. |
| **useWishlistStore** | `wishlist-storage` | Danh sách id xe yêu thích; `toggle`, `has`. |
| **useNotificationStore** | `app-notifications` | Danh sách thông báo (theo role); `markRead`, `clearReadForRole`, `removeItem`. |
| **useLanguageStore** | `language-storage` | `lang`: `"vi"` \| `"en"`; `setLang`, `toggle`. Cập nhật `document.documentElement.lang`. |
| **Theme** | ThemeProvider (React state + `document.documentElement.classList`) | `theme`: `"light"` \| `"dark"`; lưu trong `shopbike-theme`. |

---

## 7. API và môi trường

- **Base URL**: `VITE_API_BASE_URL` (mặc định có thể `http://localhost:8081/api`).
- **Mock**: `VITE_USE_MOCK_API=true` thì một số API dùng dữ liệu mock (ví dụ login trả role theo email chứa seller/inspector/admin).
- **apiClient**: Axios instance, gắn Bearer token từ `useAuthStore`; 401 có thể logout.
- **Các module API**: `authApi`, `bikeApi`, `buyerApi`, `sellerApi`, `inspectorApi`, `brandsApi`, `adminApi`, …; services (`buyerService`, `sellerService`) gọi API và fallback mock khi lỗi.
- **Ratings seller**: frontend gọi `GET /seller/ratings`; backend tổng hợp từ reviews theo `sellerId`.
- **Brands**:
  - Public: `GET /brands`
  - Admin: `GET /admin/brands`, `POST /admin/brands`, `PUT /admin/brands/:id`, `DELETE /admin/brands/:id`

---

## 8. Tóm tắt flow một dòng

- **Guest**: Vào app → xem Home/Detail/Support/Wishlist → Login/Register.
- **Buyer**: Login → Home → Detail → Checkout (deposit 8%) → Transaction → Finalize → Success → Review seller; dùng Wishlist (icon giỏ), Profile, Notifications.
- **Seller**: Login → Dashboard → Tạo/sửa tin → Submit kiểm định → Profile (payment methods) → Stats; nhận thông báo đơn hàng và xem Ratings & reputation từ review thật.
- **Inspector/Admin**: Login → Inspector/Admin Dashboard → Duyệt/Từ chối/Cần cập nhật tin; Admin thêm unhide user/listing, quản lý reviews và brands.
- **Toàn hệ thống**: Theme (dark/light) và Ngôn ngữ (Vi/En) thay đổi từ Header; thông báo chỉ xóa được tin đã đọc và có filter "chỉ chưa đọc"; **i18n** dùng react-i18next – toàn bộ UI và lỗi validate/API đã dịch.

---

*Tài liệu cập nhật theo cấu trúc router, Header (Globe, theme, giỏ hàng → wishlist), store thông báo, i18n toàn app, deposit 8%, seller ratings API thật và CRUD brands qua backend.*
