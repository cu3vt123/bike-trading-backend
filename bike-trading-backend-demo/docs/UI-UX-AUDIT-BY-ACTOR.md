# Rà soát UI/UX theo Actor — ShopBike

> Tài liệu kiểm tra chi tiết UI/UX cho từng vai trò (Guest, Buyer, Seller, Inspector, Admin), so với [SCREEN_FLOW_BY_ACTOR.md](SCREEN_FLOW_BY_ACTOR.md).

**Ngày rà soát:** 2026-03  
**Phạm vi:** Routes, Header, flows chính, feedback, i18n, accessibility

---

## Tổng quan

| Actor | Routes chính | Trạng thái | Vấn đề ưu tiên |
|-------|--------------|------------|----------------|
| Guest | Home, Product Detail, Support, Wishlist, Login, Register | ✅ OK | Wishlist ẩn với Guest (chỉ Buyer thấy icon) |
| Buyer | + Checkout, Transaction, Finalize, Success, Profile | ⚠️ Cần chỉnh | Icon wishlist, luồng Cancel |
| Seller | + Seller Dashboard, Listings, Packages, Profile | ⚠️ Cần chỉnh | Thiếu Stats trong header |
| Inspector | Inspector Dashboard | ✅ OK | — |
| Admin | Admin Dashboard (9 tabs) | ✅ OK | — |

---

## 1. Guest

### 1.1. Routes & truy cập

| Màn hình | Route | Ghi chú |
|----------|-------|---------|
| Home | `/` | ✅ Hero, filters, listings grid |
| Product Detail | `/bikes/:id` | ✅ Ảnh, specs, Buy now, Add wishlist (ẩn với Guest) |
| Support | `/support` | ✅ FAQ, contact |
| Wishlist | `/wishlist` | ⚠️ Không RequireAuth — Guest vào được nhưng **Header không hiện icon Wishlist** (chỉ BUYER mới có). SCREEN_FLOW: "Home --Click Wishlist--> [Wishlist]" — Guest không thấy nút. |
| Login | `/login` | ✅ GuestRoute, redirect nếu đã login |
| Register | `/register` | ✅ |
| Forgot/Reset password | `/forgot-password`, `/reset-password` | ✅ |

### 1.2. Product Detail — Buy now (Guest)

- Click "Buy now" → redirect `/login` với `state.from` = `/checkout/:id` ✅
- Sau login (role BUYER) → redirect về Checkout ✅

### 1.3. Đề xuất

- **Guest + Wishlist:** Có thể hiện icon Wishlist cho Guest (dẫn đến /wishlist) — khi Guest thêm yêu thích thì nhắc đăng nhập. Hoặc giữ hiện tại (chỉ Buyer thấy) và cập nhật SCREEN_FLOW: "Wishlist header chỉ hiện với Buyer".

---

## 2. Buyer

### 2.1. Header (BUYER)

| Element | Hiện tại | SCREEN_FLOW | Ghi chú |
|---------|----------|-------------|---------|
| Wishlist icon | `ShoppingCart` (giỏ hàng) | Wishlist | ⚠️ **Sai icon** — nên dùng `Heart` (WishlistPage dùng Heart). ShoppingCart dễ nhầm với giỏ mua. |
| Profile | ✅ | ✅ | |
| Notifications | ✅ | ✅ | |
| Logout | ✅ | ✅ | |

### 2.2. Luồng mua xe

| Bước | Màn hình | Ghi chú |
|------|----------|---------|
| 1 | Product Detail → Buy now | ✅ |
| 2 | Checkout (shipping, plan, VNPay) | ✅ |
| 3 | Transaction (sau redirect VNPay) | ✅ Countdown, progress, Cancel |
| 4 | Finalize (SHIPPING) | ✅ |
| 5 | Success + Review | ✅ |

### 2.3. Transaction — Cancel Reservation

- **Hiện tại:** Sau cancel → `navigate(\`/bikes/${id}\`)`
- **SCREEN_FLOW:** "Cancel Confirm --Confirm--> [Buyer Profile]"
- **Vấn đề:** Khi đơn RESERVED/SOLD, listing có thể đã ẩn khỏi GET /bikes → 404. Nên redirect về **Profile** thay vì Product Detail.
- **Đề xuất:** `navigate("/profile", { replace: true, state: { cancelledOrderId: state.orderId } })`

### 2.4. Buyer Profile

- ✅ Personal info, Recent orders, Continue payment / View progress
- ⚠️ "View all" (Xem tất cả) link `#orders-section` — cùng section, scroll về chính nó. Nếu không có pagination thì nút này gây khó hiểu. Có thể đổi thành "Cuộn lên" hoặc bỏ.
- ⚠️ Số điện thoại hardcode: `+84 9xx xxx xxx` — cần lấy từ profile/API hoặc ẩn nếu chưa có.

### 2.5. i18n — chuỗi hardcode

| File | Chuỗi | Đề xuất |
|------|-------|---------|
| HomePage.tsx | `Đang tải danh sách...` | `t("home.loadingListings")` hoặc `t("common.loading")` |
| WishlistPage.tsx | `Đang tải...` | `t("common.loading")` |
| RouteFallback | `Đang tải trang`, `Đang tải…` | i18n |
| ResetPasswordPage | `Đăng nhập` | `t("auth.login")` nếu có |

---

## 3. Seller

### 3.1. Header (SELLER)

| Element | Hiện tại | SCREEN_FLOW | Ghi chú |
|---------|----------|-------------|---------|
| Seller Channel | ✅ → /seller | ✅ | |
| Packages | ✅ → /seller/packages | ✅ | |
| Stats | ❌ Không có | "Home --Click Stats--> [Stats Dashboard]" | ⚠️ **Thiếu link Stats** — Seller Stats Dashboard tại `/seller/stats` nhưng không có cách vào từ header. |
| Profile | ✅ | ✅ | |
| Notifications | ✅ | ✅ | |

### 3.2. Seller Dashboard

- ✅ Stat cards, Inventory table, Orders & Deposits, Ratings
- ✅ Create new, Continue Drafting (link → /seller/listings/new)
- ⚠️ Panel "New Listing Draft" — 2 input (title, price) **không bind state** — chỉ là placeholder. Link "Continue Drafting" đưa đến form đầy đủ. Có thể giữ như quick-form demo hoặc wire đúng.

### 3.3. Đề xuất

- **Thêm Stats vào header** cho Seller: `<Link to="/seller/stats">Stats</Link>` hoặc nút "Stats" tương tự Seller Channel.

---

## 4. Inspector

### 4.1. Truy cập

- RequireInspector: `role === "INSPECTOR" || role === "ADMIN"` ✅
- Header: Nút "Inspector" → /inspector ✅
- Profile: Inspector/Admin click Profile → render `InspectorDashboardPage` (theo SCREEN_FLOW) ✅

### 4.2. Inspector Dashboard

- ✅ Pending listings: Approve / Reject / Need update
- ✅ Re-inspection orders: Submit re-inspection done
- ✅ Warehouse re-inspection listings (nếu có)
- Approve popup: chấm điểm Frame / Drivetrain / Braking ✅
- Need Update popup: nhập reason ≥ 5 ký tự ✅

### 4.3. UX

- Loading, error states có ✅
- Cần kiểm tra i18n cho inspector.* keys

---

## 5. Admin

### 5.1. Truy cập

- RequireAdmin: chỉ `role === "ADMIN"` ✅
- Header: "Admin" → /admin ✅
- Cũng có quyền Inspector → Click "Inspector" vào Inspector Dashboard ✅

### 5.2. Admin Dashboard — Tabs

| Tab | SCREEN_FLOW | Hiện tại |
|-----|-------------|----------|
| Warehouse | Tab Warehouse | ✅ |
| Users | Tab Users | ✅ |
| Listings | Tab Listings | ✅ |
| Reviews | Tab Reviews | ✅ |
| Categories & Brands | Tab Categories | ✅ (gộp categories + brands) |
| Transactions & Fees | Tab Transactions | ✅ |
| Stats | Tab Stats | ✅ |
| — | Tab Inspection | Thêm — quick access kiểm định |
| — | Tab Seller Packages | Thêm — quản lý gói seller |

SCREEN_FLOW mô tả 7 tab; thực tế có 9 tab (thêm Inspection, Seller Packages) — hợp lý cho admin.

### 5.3. UX

- Hide/Unhide user, listing ✅
- Confirm warehouse arrival ✅
- CRUD brands ✅
- Stats cards ✅

---

## 6. Role guards & 403

| Actor | Truy cập sai | Kết quả |
|-------|--------------|---------|
| Buyer | /seller, /admin, /inspector | 403 ✅ |
| Seller | /checkout, /admin, /inspector | 403 ✅ |
| Inspector | /checkout, /seller, /admin | 403 ✅ (admin có thể vào /admin) |
| Admin | /checkout, /seller | 403 ✅ |

ForbiddenPage: "Go home" + "Login with other account" ✅

---

## 7. i18n — Chuỗi cần chuyển sang key

| File | Dòng | Chuỗi |
|------|------|-------|
| HomePage.tsx | ~354 | `Đang tải danh sách...` |
| WishlistPage.tsx | 65 | `Đang tải...` |
| RouteFallback.tsx | 9, 12 | `Đang tải trang`, `Đang tải…` |
| ResetPasswordPage | 161 | `Đăng nhập` (nếu hardcode) |

Đảm bảo `common.loading` hoặc `home.loadingListings` đã có trong locales.

---

## 8. Accessibility (a11y)

- Header: `aria-label` cho search, theme toggle, notifications ✅
- Hero dots: `aria-label={`Slide ${i + 1}`}` ✅
- Form inputs: có Label ✅
- Dialog: DialogTitle, DialogDescription ✅

Có thể bổ sung:
- Skip to main content link
- Focus trap trong modal
- Role/aria cho loading spinner

---

## 9. Tóm tắt hành động

| # | Mức độ | Hành động | Actor | Trạng thái |
|---|--------|-----------|-------|------------|
| 1 | Cao | Đổi icon Wishlist: ShoppingCart → Heart | Buyer | ✅ Đã sửa |
| 2 | Cao | Cancel Reservation → redirect Profile thay vì /bikes/:id | Buyer | ✅ Đã sửa |
| 3 | Trung bình | Thêm link Stats vào Header cho Seller | Seller | ✅ Đã sửa |
| 4 | Trung bình | Chuỗi hardcode → i18n (Đang tải..., Đăng nhập) | Toàn bộ | ✅ Đã sửa |
| 5 | Thấp | "View all" Buyer Profile — xem lại mục đích | Buyer | Chưa |
| 6 | Thấp | Số điện thoại Buyer Profile — ẩn hoặc lấy từ API | Buyer | Chưa |

### Đã thực hiện (2026-03)

- Header: `Heart` thay `ShoppingCart` cho wishlist (Buyer)
- TransactionPage: Cancel order → `navigate("/profile")`
- Header: Thêm link "Stats" → `/seller/stats` cho Seller
- i18n: HomePage, WishlistPage, RouteFallback, ResetPasswordPage — dùng t()
- Locales: `header.stats`, `common.loading`, `common.loadingPage`

---

*Tham chiếu: SCREEN_FLOW_BY_ACTOR.md, router.tsx, Header.tsx, các trang theo actor.*
