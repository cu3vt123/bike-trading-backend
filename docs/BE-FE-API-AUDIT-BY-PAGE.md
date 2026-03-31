# BE–FE API Audit theo Từng Actor và Page

**Ngày kiểm tra:** 2025-03-15  
**Mục đích:** Đối chiếu bộ API FE ↔ BE theo từng trang và actor để đảm bảo khớp.

**Luồng xử lý tầng FE (apiClient, services, mock):** [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md).

---

## Cách đọc tài liệu này

| | |
|--|--|
| **Mục đích** | Rà soát **từng Page** (Home, Checkout, Transaction, …) và **actor** (Guest, Buyer, Seller, Inspector, Admin) — biết trang đó gọi API nào. |
| **Khi nào mở file này** | Cần tra “**màn X** dùng endpoint gì?” hoặc **debug** thiếu gọi API trên một route. |
| **Đọc cùng** | [BE-FE-API-AUDIT.md](./BE-FE-API-AUDIT.md) — cùng nội dung nhưng xếp theo **nhóm API**, không theo page. [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) — bảng path tóm tắt. **Phụ lục §6** — UI/UX theo actor. |
| **Ký hiệu trong bảng** | ✅ Khớp; phần **Dead code** ở §1 — path FE có nhưng BE không dùng / không gọi. |

---

## Mục lục

1. [Tổng quan](#1-tổng-quan) — gồm dead code  
2. [Chi tiết theo Actor và Page](#2-chi-tiết-theo-actor-và-page) — §2.1 Guest → §2.6 Auth  
3. [Reviews (Buyer + Admin)](#muc-3-reviews)  
4. [Khuyến nghị](#4-khuyến-nghị)  
5. [File tham chiếu](#5-file-tham-chiếu)  
6. [Phụ lục — UI/UX theo actor](#phu-luc-ui-ux-theo-actor)  

---

## 1. Tổng quan

| Actor | Trạng thái | Ghi chú |
|-------|------------|---------|
| **Guest** | ✅ Khớp | Bikes, packages, brands (public) |
| **BUYER** | ✅ Khớp | Orders, VNPAY, reviews; Profile dùng `/auth/me` |
| **SELLER** | ✅ Khớp | Dashboard, listings, orders, subscription, ship-to-buyer, mark-shipped |
| **INSPECTOR** | ✅ Khớp | Pending listings, approve/reject/need-update; warehouse re-inspection qua admin |
| **ADMIN** | ✅ Khớp | Stats, users, listings, reviews, brands, warehouse, revoke-subscription |

### Dead code cần xử lý
- `BUYER.PROFILE` (`/buyer/profile`) – FE có trong apiConfig nhưng **BE không có route**
- `buyerProfileApi.get()` – **không được gọi** ở bất kỳ trang nào (BuyerProfilePage dùng `authApi.getProfile()` = `/auth/me`)

---

## 2. Chi tiết theo Actor và Page

### 2.1 GUEST (chưa đăng nhập)

| Page | API gọi | FE Path | BE Route | Method | Trạng thái |
|------|---------|---------|----------|--------|------------|
| HomePage | `bikeApi.getAll()` | `/bikes` | `GET /bikes` | GET | ✅ |
| ProductDetailPage | `bikeApi.getById(id)` | `/bikes/:id` | `GET /bikes/:id` | GET | ✅ |
| SellerPackagePage (xem gói) | `packagesApi.getCatalog()` | `/packages` | `GET /packages` | GET | ✅ |
| SellerListingEditorPage (form) | `brandsApi.getList()` | `/brands` | `GET /brands` | GET | ✅ |

---

### 2.2 BUYER

| Page | API gọi | FE Path | BE Route | Method | Trạng thái |
|------|---------|---------|----------|--------|------------|
| **CheckoutPage** | `createVnpayCheckoutOrder()` | `/buyer/orders/vnpay-checkout` | Có | POST | ✅ |
| **TransactionPage** | `fetchOrderById(id)` | `/buyer/orders/:id` | Có | GET | ✅ |
| | `resumeVnpayCheckoutOrder(id)` | `/buyer/orders/:id/vnpay-resume` | Có | POST | ✅ |
| | `payBalanceVnpayOrder(id)` | `/buyer/orders/:id/vnpay-pay-balance` | Có | POST | ✅ |
| | `completeOrder(id)` | `/buyer/orders/:id/complete` | Có | PUT | ✅ |
| | `cancelOrder(id)` | `/buyer/orders/:id/cancel` | Có | PUT | ✅ |
| **FinalizePurchasePage** | `fetchOrderById`, `completeOrder`, `payBalanceVnpayOrder` | Như trên | Có | GET, PUT, POST | ✅ |
| **PurchaseSuccessPage** | `fetchOrderById`, `createReviewForOrder(id, payload)` | `/buyer/orders/:id`, `/buyer/orders/:id/review` | Có | GET, POST | ✅ |
| **BuyerProfilePage** | `fetchMyOrders()` | `/buyer/orders` | Có | GET | ✅ |
| | `authApi.getProfile()` | `/auth/me` | Có | GET | ✅ |

**Lưu ý:** `buyerProfileApi.get()` (GET `/buyer/profile`) **không được dùng** – BuyerProfilePage dùng `authApi.getProfile()` (GET `/auth/me`). BE không có route `/buyer/profile`.

---

### 2.3 SELLER

| Page | API gọi | FE Path | BE Route | Method | Trạng thái |
|------|---------|---------|----------|--------|------------|
| **SellerDashboardPage** | `fetchSellerDashboard()` | `/seller/dashboard` | Có | GET | ✅ |
| | `fetchSellerDashboardOrders()` | `/seller/orders` | Có | GET | ✅ |
| | `fetchSellerRatings()` | `/seller/ratings` | Có | GET | ✅ |
| | `authApi.getProfile()` | `/auth/me` | Có | GET | ✅ |
| **SellerListingEditorPage** | `brandsApi.getList()` | `/brands` | Có | GET | ✅ |
| | `uploadListingImages()` (trước khi lưu/publish) | `/seller/listings/upload-images` | Có | POST multipart | ✅ |
| | `createListing()`, `updateListing()` | `/seller/listings`, `/seller/listings/:id` | Có | POST, PUT | ✅ |
| | `submitForInspection()`, `publishListing()` | `/seller/listings/:id/submit`, `/seller/listings/:id/publish` | Có | PUT | ✅ |
| | `getListingById()` | `/seller/listings/:id` | Có | GET | ✅ |
| | `markListingShippedToWarehouse()` | `/seller/listings/:id/mark-shipped-to-warehouse` | Có | PUT | ✅ |
| | `shipOrderToBuyer(orderId)` | `/seller/orders/:orderId/ship-to-buyer` | Có | PUT | ✅ |
| **SellerPackagePage** | `packagesApi.getCatalog()` | `/packages` | Có | GET | ✅ |
| | `packagesApi.checkout()` | `/seller/subscription/checkout` | Có | POST | ✅ |
| | `packagesApi.mockCompleteOrder(id)` | `/seller/subscription/orders/:orderId/mock-complete` | Có | POST | ✅ |
| | `packagesApi.revokeSelf()` | `/seller/subscription/revoke-self` | Có | PUT | ✅ |
| | `authApi.getProfile()` | `/auth/me` | Có | GET | ✅ |

---

### 2.4 INSPECTOR

| Page | API gọi | FE Path | BE Route | Method | Trạng thái |
|------|---------|---------|----------|--------|------------|
| **ProductDetailPage** (`/bikes/:id`) | `fetchListingById` → nếu null thì `fetchListingByIdForInspector` (khi INSPECTOR/ADMIN hoặc có token) | `/bikes/:id` rồi `/inspector/listings/:id` | `GET /bikes/:id` (chỉ published) + **`GET /inspector/listings/:id`** (mọi trạng thái) | GET | ✅ Spring BE2: bắt buộc có GET inspector theo id |
| **InspectorDashboardPage** | `fetchPendingListings()` | `/inspector/pending-listings` | Có | GET | ✅ |
| | `inspectorApi.getListingById(id)` | `/inspector/listings/:id` | Có | GET | ✅ |
| | `approveListing(id, report)` | `/inspector/listings/:id/approve` | Có | PUT | ✅ |
| | `rejectListing(id)` | `/inspector/listings/:id/reject` | Có | PUT | ✅ |
| | `needUpdateListing(id, reason)` | `/inspector/listings/:id/need-update` | Có | PUT | ✅ |
| | `fetchWarehouseReInspectionListings()` | `/admin/listings/pending-warehouse-intake` | Có | GET | ✅ |
| | `confirmWarehouseReInspection(id, body)` | `/admin/listings/:id/confirm-warehouse-re-inspection` | Có | PUT | ✅ |

**Lưu ý:** Inspector dùng admin routes cho re-inspection tại kho (vì cả ADMIN và INSPECTOR đều được quyền).

---

### 2.5 ADMIN

| Page | API gọi | FE Path | BE Route | Method | Trạng thái |
|------|---------|---------|----------|--------|------------|
| **AdminDashboardPage** | `getStats()` | `/admin/dashboard/stats` | Có | GET | ✅ |
| | `getUsers()` | `/admin/users` | Có | GET | ✅ |
| | `getListings()` | `/admin/listings` | Có | GET | ✅ |
| | `adminListReviews()` | `/admin/reviews` | Có | GET | ✅ |
| | `getSellerSubscriptions()` | `/admin/seller-subscriptions` | Có | GET | ✅ |
| | `revokeSellerSubscription(id)` | `/admin/users/:id/revoke-subscription` | Có | PUT | ✅ |
| | `getWarehouseOrders()` | `/admin/orders/warehouse-pending` | Có | GET | ✅ |
| | `confirmWarehouseArrival(id)` | `/admin/orders/:id/confirm-warehouse` | Có | PUT | ✅ |
| | `getReInspectionOrders()` | `/admin/orders/re-inspection` | Có | GET | ✅ |
| | `submitReInspectionDone(id)` | `/admin/orders/:id/re-inspection-done` | Có | PUT | ✅ |
| | `getPendingWarehouseIntakeListings()` | `/admin/listings/pending-warehouse-intake` | Có | GET | ✅ |
| | `confirmWarehouseIntake(id)` | `/admin/listings/:id/confirm-warehouse-intake` | Có | PUT | ✅ |
| | `confirmWarehouseReInspection(id, body)` | `/admin/listings/:id/confirm-warehouse-re-inspection` | Có | PUT | ✅ |
| | `hideUser(id)`, `unhideUser(id)` | `/admin/users/:id/hide`, `unhide` | Có | PUT | ✅ |
| | `hideListing(id)`, `unhideListing(id)` | `/admin/listings/:id/hide`, `unhide` | Có | PUT | ✅ |
| | `getBrands()`, `createBrand()`, `updateBrand()`, `deleteBrand()` | `/admin/brands`, `/admin/brands/:id` | Có | GET, POST, PUT, DELETE | ✅ |
| | `adminUpdateReview(id, payload)` | `/admin/reviews/:id` | Có | PUT | ✅ |

---

### 2.6 AUTH (Login, Signup, Forgot/Reset)

| Page | API gọi | FE Path | BE Route | Method | Trạng thái |
|------|---------|---------|----------|--------|------------|
| LoginPage | `authApi.login()` | `/auth/login` | Có | POST | ✅ |
| RegisterPage | `authApi.signup()` | `/auth/signup` | Có | POST | ✅ |
| ForgotPasswordPage | `authApi.forgotPassword()` | `/auth/forgot-password` | Có | POST | ✅ |
| ResetPasswordPage | `authApi.resetPassword()` | `/auth/reset-password` | Có | POST | ✅ |

---

<a id="muc-3-reviews"></a>

## 3. Reviews (dùng bởi Buyer + Admin)

| API gọi | FE Path | BE Route | Method | Trạng thái |
|---------|---------|----------|--------|------------|
| `createForOrder(orderId)` | `/buyer/orders/:id/review` | Có (buyerRoutes) | POST | ✅ |
| `getMyReviews()` | `/buyer/reviews` | Có (buyerRoutes) | GET | ✅ |
| `adminList()` | `/admin/reviews` | Có (adminRoutes) | GET | ✅ |
| `adminUpdate(id)` | `/admin/reviews/:id` | Có (adminRoutes) | PUT | ✅ |

---

## 4. Khuyến nghị

1. **Xóa dead code:** `BUYER.PROFILE`, `buyerProfileApi` trong FE – BE không có `/buyer/profile`, và BuyerProfilePage đã dùng `authApi.getProfile()`.
2. **Giữ đồng bộ:** Khi thêm endpoint mới trên BE, cập nhật `apiConfig.ts` và tài liệu tương ứng.
3. **Kiểm tra method:** Inspector dùng **PUT** cho approve/reject/need-update (không phải POST) – đã khớp với BE.

---

## 5. File tham chiếu

| Hạng mục | Đường dẫn |
|----------|-----------|
| FE API config | `src/lib/apiConfig.ts` |
| FE APIs | `src/apis/*.ts` |
| FE Services | `src/services/*.ts` |
| BE Routes | `backend/src/routes/*.js` |
| BE Server mount | `backend/src/server.js` |

---

<a id="phu-luc-ui-ux-theo-actor"></a>

## 6. Phụ lục — UI/UX theo actor

**Ngày rà soát:** 2026-03 · **Phạm vi:** Routes, Header, flows chính, feedback, i18n, accessibility.

Bổ sung **đánh giá UI/UX theo actor** cho audit API ở trên; tổng quan luồng: [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md).

### Cách đọc phụ lục

| | |
|--|--|
| **Mục đích** | Đánh giá **UI/UX theo từng actor** (Guest → Admin), không đối chiếu API như §1–§5. |
| **Khi nào mở** | Cần biết **màn nào** / **vai nào** còn vấn đề UX, i18n, header, luồng hủy đơn, v.v. |
| **Đọc cùng** | [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md). |
| **Ký hiệu** | ✅ Ổn; ⚠️ Cần chỉnh — chi tiết trong từng mục con. |


### Tổng quan (UI/UX)

| Actor | Routes chính | Trạng thái | Vấn đề ưu tiên |
|-------|--------------|------------|----------------|
| Guest | Home, Product Detail, Support, Wishlist, Login, Register | ✅ OK | Wishlist ẩn với Guest (chỉ Buyer thấy icon) |
| Buyer | + Checkout, Transaction, Finalize, Success, Profile | ⚠️ Cần chỉnh | Icon wishlist, luồng Cancel |
| Seller | + Seller Dashboard, Listings, Packages, Profile | ⚠️ Cần chỉnh | Thiếu Stats trong header |
| Inspector | Inspector Dashboard | ✅ OK | — |
| Admin | Admin Dashboard (9 tabs) | ✅ OK | — |

---

### 1. Guest

#### 1.1. Routes & truy cập

| Màn hình | Route | Ghi chú |
|----------|-------|---------|
| Home | `/` | ✅ Hero, filters, listings grid |
| Product Detail | `/bikes/:id` | ✅ Ảnh, specs, Buy now, Add wishlist (ẩn với Guest) |
| Support | `/support` | ✅ FAQ, contact |
| Wishlist | `/wishlist` | ⚠️ Không RequireAuth — Guest vào được nhưng **Header không hiện icon Wishlist** (chỉ BUYER mới có). Kỳ vọng luồng: từ Home → Wishlist — Guest không thấy nút. |
| Login | `/login` | ✅ GuestRoute, redirect nếu đã login |
| Register | `/register` | ✅ |
| Forgot/Reset password | `/forgot-password`, `/reset-password` | ✅ |

#### 1.2. Product Detail — Buy now (Guest)

- Click "Buy now" → redirect `/login` với `state.from` = `/checkout/:id` ✅
- Sau login (role BUYER) → redirect về Checkout ✅

#### 1.3. Đề xuất

- **Guest + Wishlist:** Có thể hiện icon Wishlist cho Guest (dẫn đến /wishlist) — khi Guest thêm yêu thích thì nhắc đăng nhập. Hoặc giữ hiện tại (chỉ Buyer thấy) và ghi nhận rõ: header Wishlist chỉ với Buyer.

---

### 2. Buyer

#### 2.1. Header (BUYER)

| Element | Hiện tại | Kỳ vọng / mô tả luồng | Ghi chú |
|---------|----------|-------------|---------|
| Wishlist icon | `ShoppingCart` (giỏ hàng) | Wishlist | ⚠️ **Sai icon** — nên dùng `Heart` (WishlistPage dùng Heart). ShoppingCart dễ nhầm với giỏ mua. |
| Profile | ✅ | ✅ | |
| Notifications | ✅ | ✅ | |
| Logout | ✅ | ✅ | |

#### 2.2. Luồng mua xe

| Bước | Màn hình | Ghi chú |
|------|----------|---------|
| 1 | Product Detail → Buy now | ✅ |
| 2 | Checkout (shipping, plan, VNPay) | ✅ |
| 3 | Transaction (sau redirect VNPay) | ✅ Countdown, progress, Cancel |
| 4 | Finalize (SHIPPING) | ✅ |
| 5 | Success + Review | ✅ |

#### 2.3. Transaction — Cancel Reservation

- **Hiện tại:** Sau cancel → `navigate(\`/bikes/${id}\`)`
- **Kỳ vọng luồng:** sau xác nhận hủy → về Buyer Profile (hoặc trang chủ — tùy product).
- **Vấn đề:** Khi đơn RESERVED/SOLD, listing có thể đã ẩn khỏi GET /bikes → 404. Nên redirect về **Profile** thay vì Product Detail.
- **Đề xuất:** `navigate("/profile", { replace: true, state: { cancelledOrderId: state.orderId } })`

#### 2.4. Buyer Profile

- ✅ Personal info, Recent orders, Continue payment / View progress
- ⚠️ "View all" (Xem tất cả) link `#orders-section` — cùng section, scroll về chính nó. Nếu không có pagination thì nút này gây khó hiểu. Có thể đổi thành "Cuộn lên" hoặc bỏ.
- ⚠️ Số điện thoại hardcode: `+84 9xx xxx xxx` — cần lấy từ profile/API hoặc ẩn nếu chưa có.

#### 2.5. i18n — chuỗi hardcode

| File | Chuỗi | Đề xuất |
|------|-------|---------|
| HomePage.tsx | `Đang tải danh sách...` | `t("home.loadingListings")` hoặc `t("common.loading")` |
| WishlistPage.tsx | `Đang tải...` | `t("common.loading")` |
| RouteFallback | `Đang tải trang`, `Đang tải…` | i18n |
| ResetPasswordPage | `Đăng nhập` | `t("auth.login")` nếu có |

---

### 3. Seller

#### 3.1. Header (SELLER)

| Element | Hiện tại | Kỳ vọng / mô tả luồng | Ghi chú |
|---------|----------|-------------|---------|
| Seller Channel | ✅ → /seller | ✅ | |
| Packages | ✅ → /seller/packages | ✅ | |
| Stats | ❌ Không có | "Home --Click Stats--> [Stats Dashboard]" | ⚠️ **Thiếu link Stats** — Seller Stats Dashboard tại `/seller/stats` nhưng không có cách vào từ header. |
| Profile | ✅ | ✅ | |
| Notifications | ✅ | ✅ | |

#### 3.2. Seller Dashboard

- ✅ Stat cards, Inventory table, Orders & Deposits, Ratings
- ✅ Create new, Continue Drafting (link → /seller/listings/new)
- ⚠️ Panel "New Listing Draft" — 2 input (title, price) **không bind state** — chỉ là placeholder. Link "Continue Drafting" đưa đến form đầy đủ. Có thể giữ như quick-form demo hoặc wire đúng.

#### 3.3. Đề xuất

- **Thêm Stats vào header** cho Seller: `<Link to="/seller/stats">Stats</Link>` hoặc nút "Stats" tương tự Seller Channel.

---

### 4. Inspector

#### 4.1. Truy cập

- RequireInspector: `role === "INSPECTOR" || role === "ADMIN"` ✅
- Header: Nút "Inspector" → /inspector ✅
- Profile: Inspector/Admin click Profile → render `InspectorDashboardPage` ✅

#### 4.2. Inspector Dashboard

- ✅ Pending listings: Approve / Reject / Need update
- ✅ Re-inspection orders: Submit re-inspection done
- ✅ Warehouse re-inspection listings (nếu có)
- Approve popup: chấm điểm Frame / Drivetrain / Braking ✅
- Need Update popup: nhập reason ≥ 5 ký tự ✅

#### 4.3. UX

- Loading, error states có ✅
- Cần kiểm tra i18n cho inspector.* keys

---

### 5. Admin

#### 5.1. Truy cập

- RequireAdmin: chỉ `role === "ADMIN"` ✅
- Header: "Admin" → /admin ✅
- Cũng có quyền Inspector → Click "Inspector" vào Inspector Dashboard ✅

#### 5.2. Admin Dashboard — Tabs

| Tab | Tài liệu cũ (tham chiếu) | Hiện tại |
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

Tài liệu trước đây mô tả 7 tab; thực tế có 9 tab (thêm Inspection, Seller Packages) — hợp lý cho admin.

#### 5.3. UX

- Hide/Unhide user, listing ✅
- Confirm warehouse arrival ✅
- CRUD brands ✅
- Stats cards ✅

---

### Role guards & 403

| Actor | Truy cập sai | Kết quả |
|-------|--------------|---------|
| Buyer | /seller, /admin, /inspector | 403 ✅ |
| Seller | /checkout, /admin, /inspector | 403 ✅ |
| Inspector | /checkout, /seller, /admin | 403 ✅ (admin có thể vào /admin) |
| Admin | /checkout, /seller | 403 ✅ |

ForbiddenPage: "Go home" + "Login with other account" ✅

---

### 7. i18n — Chuỗi cần chuyển sang key

| File | Dòng | Chuỗi |
|------|------|-------|
| HomePage.tsx | ~354 | `Đang tải danh sách...` |
| WishlistPage.tsx | 65 | `Đang tải...` |
| RouteFallback.tsx | 9, 12 | `Đang tải trang`, `Đang tải…` |
| ResetPasswordPage | 161 | `Đăng nhập` (nếu hardcode) |

Đảm bảo `common.loading` hoặc `home.loadingListings` đã có trong locales.

---

### 8. Accessibility (a11y)

- Header: `aria-label` cho search, theme toggle, notifications ✅
- Hero dots: `aria-label={`Slide ${i + 1}`}` ✅
- Form inputs: có Label ✅
- Dialog: DialogTitle, DialogDescription ✅

Có thể bổ sung:
- Skip to main content link
- Focus trap trong modal
- Role/aria cho loading spinner

---

### 9. Tóm tắt hành động

| # | Mức độ | Hành động | Actor | Trạng thái |
|---|--------|-----------|-------|------------|
| 1 | Cao | Đổi icon Wishlist: ShoppingCart → Heart | Buyer | ✅ Đã sửa |
| 2 | Cao | Cancel Reservation → redirect Profile thay vì /bikes/:id | Buyer | ✅ Đã sửa |
| 3 | Trung bình | Thêm link Stats vào Header cho Seller | Seller | ✅ Đã sửa |
| 4 | Trung bình | Chuỗi hardcode → i18n (Đang tải..., Đăng nhập) | Toàn bộ | ✅ Đã sửa |
| 5 | Thấp | "View all" Buyer Profile — xem lại mục đích | Buyer | Chưa |
| 6 | Thấp | Số điện thoại Buyer Profile — ẩn hoặc lấy từ API | Buyer | Chưa |

#### Đã thực hiện (2026-03)

- Header: `Heart` thay `ShoppingCart` cho wishlist (Buyer)
- TransactionPage: Cancel order → `navigate("/profile")`
- Header: Thêm link "Stats" → `/seller/stats` cho Seller
- i18n: HomePage, WishlistPage, RouteFallback, ResetPasswordPage — dùng t()
- Locales: `header.stats`, `common.loading`, `common.loadingPage`

---

*Tham chiếu: `router.tsx`, `Header.tsx`, các trang theo actor, [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md).*
