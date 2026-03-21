# ShopBike Frontend – Tổng kết dự án

> Tài liệu tổng hợp toàn bộ chức năng đã hoàn thành, business rules, và hướng dẫn cho dự án ShopBike.

---

## 1. Tổng quan dự án

**ShopBike** là nền tảng mua bán xe đạp thể thao cũ, kết nối người mua và người bán với cơ chế kiểm định tăng độ tin cậy.

### Tech stack

- **React 19** + **TypeScript**
- **Vite 7** (build tool)
- **Tailwind CSS** + **shadcn/ui**
- **React Router v7**
- **Zustand** (state management)
- **Axios** (HTTP client)
- **react-i18next** (i18n – Tiếng Việt / English)

### Roles

| Role     | Mô tả                                      |
|----------|---------------------------------------------|
| Guest    | Xem Home, Detail, Login, Register           |
| Buyer    | Mua hàng, Checkout, Transaction, Profile    |
| Seller   | Đăng tin, quản lý tin, Profile, ratings, payouts |
| Inspector| Dashboard kiểm định (Sprint 3) – Duyệt/Từ chối tin |
| Admin    | Dashboard quản trị: user, listing, reviews, brands, transactions |

---

## 2. Business rules (cốt lõi)

### 2.1 Listing & Kiểm định

- Có thể **publish không qua kiểm định** (`requestInspection: false` → UNVERIFIED, slot gói đăng tin); hoặc gửi inspector (`true` → PENDING_INSPECTION).
- Listing **đã kiểm định** (CERTIFIED / APPROVE) dùng luồng kho khi bán; **chưa kiểm định** dùng luồng giao trực tiếp (xem 2.2a).
- **Publish chỉ sau APPROVE** áp dụng cho luồng “bắt buộc kiểm định trước khi lên sàn” — song song có lộ trình UNVERIFIED đã mô tả ở editor & checkout disclaimer.
- Vòng kiểm định: `APPROVE → Publish` | `REJECT → End` | `NEED_UPDATE → Seller cập nhật → Resubmit → Inspect`
- **Chỉnh sửa tin:**
  - **Draft**: Sửa được
  - **Pending Inspection**: Khóa sửa
  - **Need Update**: Sửa được
  - **Published**: Hạn chế sửa nội dung cốt lõi
- Marketplace: listing **PUBLISHED** (CERTIFIED / đã APPROVE hoặc **UNVERIFIED** có badge & disclaimer khi checkout)

### 2.2 Giao dịch (Transaction)

- **FIFO**: Available → Reserved (lock sau deposit thành công) → Sold
- Cancel / Fail → Available ngay
- **Reserve** chỉ tạo khi deposit payment thành công (24h countdown)
- **Deposit hiện tại**: 8% giá trị đơn hàng (đồng bộ với backend)
- Shipping option trong checkout đang bám theo dữ liệu backend thay vì giá trị demo cũ

### 2.2a Đơn hàng: luồng kho (WAREHOUSE) vs giao trực tiếp (DIRECT)

- **`fulfillmentType` trên Order** (backend + FE types):
  - **WAREHOUSE** — xe **đã kiểm định** (CERTIFIED / `inspectionResult === APPROVE`): sau mua → `SELLER_SHIPPED` → admin/inspector kho → `SHIPPING` → buyer hoàn tất.
  - **DIRECT** — xe **chưa kiểm định** (UNVERIFIED): sau mua → `PENDING_SELLER_SHIP` → seller xác nhận giao trực tiếp (`PUT /seller/orders/:id/ship-to-buyer`) → `SHIPPING` → **không** qua queue kho / re-inspection.
- **Hủy đơn (buyer):** cho phép hủy thêm khi `PENDING_SELLER_SHIP` + `DIRECT`.
- **Thông báo in-app (seller):** chỉ một số trạng thái được đồng bộ — logic tách trong `src/services/sellerOrderNotificationFlow.ts` (nhóm *có thông báo* vs *im lặng*).
- Chi tiết port sang Spring Boot: [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md).

### 2.3 Refund & Hủy

- Hoàn tiền đơn giản, không có dispute trong app
- Thời hạn: tối đa 7 ngày
- Giới hạn hủy: **tối đa 3 lần / kỳ**

### 2.4 Payment Methods (Seller)

- Bắt buộc **ít nhất 1** phương thức thanh toán
- Khi xóa phương thức **DEFAULT**, phương thức đầu tiên còn lại sẽ là DEFAULT
- Seller có thể đặt phương thức khác làm DEFAULT (Set as default)

### 2.5 Auth & RBAC

- **Register** chỉ cho Buyer / Seller
- **Login** không chọn role – role lấy từ tài khoản (Buyer, Seller, Inspector, Admin)
- Sai role → chuyển về `/403`
- Buyer không vào `/checkout`, `/transaction`, …; Seller không vào `/checkout/:id`
- Khi đổi role / logout, token cũ được xóa để tránh lỗi 403 do giữ phiên sai

### 2.6 Reviews, Ratings & Brands

- Buyer chỉ review khi order ở trạng thái **COMPLETED**
- Seller Dashboard lấy điểm uy tín từ endpoint thật `GET /seller/ratings`
- Admin xem / chỉnh review qua `GET /admin/reviews`, `PUT /admin/reviews/:id`
- Danh sách **brand** cho seller lấy từ backend, không còn hardcode cố định
- Admin có thể thêm / sửa / xóa brand; brand mới sẽ xuất hiện trong form đăng tin của seller

---

## 3. Luồng màn hình chính

### 3.1 Luồng Buyer (mua hàng)

```
Home → Product Detail → Checkout → Transaction → Finalize → Success
```

1. **Home** (`/`): Hero slogan "Những chiếc xe đã được kiểm định...", danh sách listing (API / mock)
2. **Product Detail** (`/bikes/:id`): Chi tiết xe, báo cáo kiểm định, nút Buy now
3. **Checkout** (`/checkout/:id`): Chọn plan (FULL/DEPOSIT), phương thức thanh toán, shipping, đồng ý chính sách
4. **Transaction** (`/transaction/:id`): Countdown 24h, logistics, Cancel / Finalize
5. **Finalize** (`/finalize/:id`): Thanh toán số dư, xác nhận giao hàng
6. **Success** (`/success/:id`): Xác nhận hoàn tất
7. **Review**: Buyer có thể để lại đánh giá cho seller sau khi hoàn tất giao dịch

### 3.2 Luồng Seller

```
Seller Dashboard → Create/Edit Listing → Profile → Stats
```

- **Dashboard** (`/seller`): Tổng quan tin, thống kê, Orders/Deposits, Ratings & reputation
- **Listing Editor** (`/seller/listings/new`, `/seller/listings/:id/edit`): Tạo/sửa tin, upload ảnh, chọn brand từ API
- **Profile** (`/profile`): Khi role = Seller → Seller Profile
- **Stats** (`/seller/stats`): Thống kê chi tiết

### 3.3 Luồng Inspector / Admin

```
Profile (/profile) hoặc /inspector → Inspector Dashboard → Duyệt/Từ chối/Cần cập nhật
```

- **Inspector Dashboard** (`/inspector`, `/profile` khi role = Inspector/Admin): Danh sách tin chờ kiểm định, nút Duyệt / Từ chối / Cần cập nhật
- Header: Nút **Inspector** khi role INSPECTOR hoặc ADMIN

### 3.4 Luồng Auth

- **Login** (`/login`): Chỉ nhập email/password; role lấy từ tài khoản (API / mock)
- **Register** (`/register`): Chọn Buyer/Seller, đăng ký (API / mock) → auto login
- **Logout**: `clearTokens()` → về Home

### 3.5 Luồng Admin

- **Admin Dashboard** (`/admin`): Quản lý user/listing, review, categories, brands, transactions & fees
- **Brands**: thêm / sửa / xóa thương hiệu để seller dùng trong form đăng tin

---

## 4. Các chức năng đã hoàn thành

### 4.1 UI Foundation (SHOP-19)

- Setup shadcn/ui, theme tokens
- Components: `Button`, `Card`, `Input`, `Badge`, `Label`, `Select`, `Checkbox`, `Dialog`

### 4.2 Auth & Guards

| Chức năng      | Mô tả                                                 |
|----------------|--------------------------------------------------------|
| Login          | Đăng nhập bằng email/password; role do backend hoặc mock trả về |
| Register       | Mock signup, chỉ Buyer/Seller                         |
| GuestGuard     | Redirect user đã login khỏi /login, /register          |
| RequireAuth     | Bảo vệ /profile                                       |
| RequireBuyer    | Bảo vệ /checkout, /transaction, /finalize, /success  |
| RequireSeller   | Bảo vệ /seller, /seller/stats, /seller/listings/*    |
| RequireInspector| Bảo vệ /inspector (role Inspector/Admin)              |
| 403 Forbidden   | Trang sai role                                        |

### 4.3 Buyer Pages

| Trang           | Chức năng chính                                      |
|-----------------|------------------------------------------------------|
| HomePage        | Load listings qua `buyerService` (API + mock)         |
| ProductDetailPage | Chi tiết xe, inspection report, View full report (Dialog) |
| CheckoutPage    | Plan, payment method, shipping, deposit 8%, validation policy (inline error) |
| TransactionPage | Countdown, Cancel (confirm), View report (Dialog), Support chat (Dialog) |
| FinalizePurchasePage | Thanh toán số dư, confirm shipping                   |
| PurchaseSuccessPage | Tóm tắt đơn, links                                    |
| BuyerProfilePage| Personal info, Recent orders, nav scroll              |

### 4.4 Seller Pages

| Trang                 | Chức năng chính                                      |
|-----------------------|------------------------------------------------------|
| SellerDashboardPage   | Thống kê tin, inventory, Orders/Deposits, Ratings & reputation (gọi `sellerService` – API + mock) |
| SellerListingEditorPage | Tạo/sửa tin, upload 1–8 ảnh, Save draft / Submit for inspection; danh sách brand lấy từ API |
| SellerProfilePage    | Edit Profile, Payment methods (Add/Remove/Set default) |
| SellerStatsPage      | Total Sales, Active Listings, Completed Deals       |

### 4.5 Inspector Pages (Sprint 3)

| Trang                  | Chức năng chính                                      |
|------------------------|------------------------------------------------------|
| InspectorDashboardPage | Danh sách tin chờ kiểm định, Duyệt / Từ chối / Cần cập nhật (mock + API) |

### 4.5a Admin Dashboard – Mở rộng

| Tab            | Chức năng chính                                      |
|----------------|------------------------------------------------------|
| Categories     | CRUD danh mục (mock)                                  |
| Brands         | CRUD brand lưu backend, dùng lại ở Seller Listing Editor |
| Reviews        | Xem và chỉnh review hậu giao dịch                     |
| Transactions   | Cấu hình phí, bảng lịch sử giao dịch (demo FE)        |

### 4.6 Seller Profile – Chi tiết

#### Edit Profile

- Dialog: Full Name*, Email*, Avatar URL
- Validation: tên và email bắt buộc, email hợp lệ

#### Payment Methods

- **Remove**: Xóa item, confirm dialog; bắt buộc giữ ≥1 phương thức
- **Set as default**: Chỉ với item không phải DEFAULT, khi có ≥2 phương thức
- **Add New**: Dialog thêm Visa/Mastercard; yêu cầu 4 số cuối (PCI safe)
- Khi xóa DEFAULT, item còn lại đầu tiên trở thành DEFAULT

### 4.7 API & Services

| File             | Mô tả                                                |
|------------------|------------------------------------------------------|
| `apiClient.ts`   | Axios instance, Bearer token, 401 → logout           |
| `authApi.ts`     | login, signup, getProfile (scaffold)                  |
| `buyerApi.ts`    | bikes, orders, payments (scaffold)                   |
| `buyerService.ts`| Facade + fallback mock khi API lỗi                  |
| `sellerApi.ts`   | dashboard, orders, ratings, listings, create, update, submit |
| `sellerService.ts`| Facade + fallback mock cho Seller; `syncSellerOrderNotifications`; ratings |
| `sellerOrderNotificationFlow.ts` | Quy tắc **có / không** đẩy thông báo đơn cho seller (kho vs direct) |
| `brandsApi.ts`   | Public API lấy danh sách brands active               |
| `adminApi.ts`    | User, listing, review, brand, warehouse, transaction |
| `inspectorApi.ts`| pending-listings, approve, reject, need-update (scaffold) |
| `useAuthStore`   | Tokens, role, persist `auth-storage`                 |
| `useNotificationStore` | Thông báo (chỉ xóa tin đã đọc; filter "Hiển thị thông báo chưa đọc") |
| `useLanguageStore` | Ngôn ngữ vi/en (persist, document.documentElement.lang) |
| `src/locales/`     | `vi.json`, `en.json` – namespace i18n (common, auth, home, profile, checkout, seller, …) |

### 4.8 Các sửa đổi theo business rules (gần đây)

| Khu vực         | Thay đổi                                                       |
|-----------------|----------------------------------------------------------------|
| Seller Profile  | Set as Default, validation Edit Profile & Add Payment         |
| Seller Profile  | Remove confirm, quy tắc DEFAULT khi xóa                         |
| Transaction     | Cancel dialog ghi rõ: refund 7 ngày, giới hạn 3 lần/kỳ        |
| Buyer Profile   | Nav: Personal Info, Wishlist (link), Settings; Recent Orders trong nội dung |
| Wishlist        | Chỉ BUYER đã đăng nhập mới thấy nút wishlist (ProductDetailPage, ListingCard) |
| Complete order  | Chỉ cho phép complete khi status SHIPPING (sau khi inspector kiểm định) |
| Tiền tệ         | Mặc định VND (format vi-VN) |
| Seller notifications | Polling 10s, sync khi mount; nút "Kiểm tra đơn mới" |
| Seller Dashboard| View all → Link thay vì button                                 |
| Checkout        | Validation policy → inline error thay alert                    |
| Auth / 403      | Xóa token cũ khi đổi role; chỉnh `ForbiddenPage` và điều hướng sau login/logout |
| Checkout        | Đồng bộ deposit 8% với backend; bỏ ghi chú dev; localize thêm cho Finalize/Success/Admin warehouse |
| Seller Ratings  | Backend thêm `GET /seller/ratings`; seller thấy rating thật sau review |
| Brands          | Admin CRUD brands qua API; seller form lấy brand từ backend thay vì hardcode |

---

## 5. Cấu trúc thư mục chính

```
src/
├── app/                    # App root, router, providers (createBrowserRouter)
├── features/               # auth, landing, bikes, buyer, seller, inspector, support
├── shared/                 # components/common, ui, layouts, constants
├── lib/                    # env, apiClient, apiConfig, utils, validateExpiry
├── locales/                # vi.json, en.json – i18n (react-i18next)
├── apis/                   # authApi, buyerApi, bikeApi, sellerApi, inspectorApi
├── services/               # buyerService, sellerService
├── pages/                  # Các trang – features re-export
├── components/             # Header, ListingCard, ui
├── layouts/                # MainLayout
├── stores/                 # useAuthStore, useWishlistStore, useNotificationStore, useLanguageStore
├── types/                  # auth, shopbike, order
└── mocks/                  # Mock data
```

Chi tiết: `docs/STRUCTURE.md`

---

## 6. Flow làm việc (runtime)

- **Khởi động:** index.html → main.tsx → App (ThemeProvider, RouterProvider) → MainLayout (Header + Outlet)
- **Auth:** token/role từ `useAuthStore` (persist `auth-storage`); role do backend trả về, FE không gửi role
- **Guards:** GuestRoute, RequireAuth, RequireBuyer/Seller/Inspector/Admin → redirect `/login` hoặc `/403`
- **Header:** Search, Globe (i18n), Hỗ trợ, Logo, Theme toggle, Notifications, Profile (theo role)
- **Stores:** useAuthStore, useWishlistStore, useNotificationStore, useLanguageStore; ThemeProvider
- **API:** `VITE_API_BASE_URL`, `VITE_USE_MOCK_API`; apiClient gắn Bearer; services fallback mock khi lỗi

---

## 7. Các tài liệu liên quan

| File | Nội dung |
|------|----------|
| `docs/README.md` | Mục lục toàn bộ tài liệu |
| `docs/STRUCTURE.md` | Cấu trúc feature-based, quy ước import |
| `docs/ERD.md` | ERD – MongoDB + SQL (entities, schema Starter & Normalized) |
| `docs/SCREEN_FLOW_BY_ACTOR.md` | Screen flow theo Guest/Buyer/Seller/Inspector/Admin |
| `docs/STATE_TRANSITION_DIAGRAM_GUIDE.md` | State diagram Order/Listing/Review |
| `docs/CHANGELOG.md` | Tóm tắt thay đổi |
| `backend/README.md` | Chạy backend Node demo |

---

## 8. Điều kiện test với Backend (Sprint 2+)

- CORS cho `http://localhost:5173`
- Swagger/OAS
- Endpoints: `POST /auth/login`, `POST /auth/signup`, `GET /bikes`, `GET /bikes/:id`
- Set `VITE_API_BASE_URL` trong `.env`

---

## 9. Checklist demo nhanh

1. Register Buyer → Home
2. Home → Product Detail → Buy now → Checkout → Pay deposit → Transaction → Finalize → Success
3. Logout → Login Seller → Vào Profile → Edit Profile, Add/Remove payment, Set default
4. Seller → Dashboard → Create/Edit listing → Submit for inspection
5. Seller → /seller/stats
6. Logout → Login Inspector → Inspector Dashboard → Duyệt / Từ chối / Cần cập nhật
7. Logout → Login Admin → thêm brand mới trong `/admin`, kiểm tra seller form thấy brand đó
8. Buyer hoàn tất mua hàng → review seller → seller thấy Ratings & reputation cập nhật
9. Buyer thử vào /seller → 403
10. Seller thử vào /checkout/:id → 403

---

### 4.9 Giao diện toàn cục (gần đây)

| Thay đổi | Chi tiết |
|----------|----------|
| **Dark/Light mode** | ThemeProvider bọc App; toggle trên Header; lưu `shopbike-theme`; Login form đổi nền/chữ theo theme, chữ ShopBike cố định trắng. |
| **Ngôn ngữ (i18n)** | Icon Globe bên trái "Hỗ trợ" → dropdown Tiếng Việt / English; react-i18next + `src/locales/vi.json`, `en.json`; toàn bộ UI và thông báo lỗi đa ngôn ngữ. |
| **Header Buyer** | Thay icon tim bằng icon giỏ hàng; một nút duy nhất link `/wishlist`. Bỏ route `/cart` và nút giỏ hàng riêng. |
| **Thông báo** | Chỉ tin đã đọc mới xóa (nút "Xóa tin đã đọc", xóa từng tin); nút "Hiển thị thông báo chưa đọc" / "Hiển thị tất cả" thay cho "Đánh dấu đã đọc". |

### 4.10 i18n – Trang và lỗi đã dịch

| Khu vực | Chi tiết |
|---------|----------|
| **Trang** | Logo, ListingCard, ProductDetailPage, HomePage, BuyerProfilePage, AdminDashboardPage, InspectorDashboardPage, CheckoutPage, TransactionPage, NotificationsPage, SellerDashboardPage, SellerListingEditorPage, SupportPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, FinalizePurchasePage, PurchaseSuccessPage, SellerProfilePage, ForbiddenPage. |
| **Lỗi validate** | Register, ForgotPassword, ResetPassword, Checkout, SellerProfile, validateExpiry (auth.errExpRequired, auth.errExpFormat, …). |
| **Lỗi API / trang** | FinalizePurchase, PurchaseSuccess, Checkout (createOrderError, finalizeLoadError, …), HomePage (noResults). |

---

*Tài liệu cập nhật: 2025-02 – Login không chọn role, Admin unhide, VND, Wishlist BUYER, Seller notifications, Hero slogan; 2025-03 – Dark/light, i18n toàn app, thông báo lỗi đa ngôn ngữ, Seller Orders/Ratings, Admin Categories/Transactions, flow doc, logic thông báo, giỏ hàng → wishlist; 2026-03 – fix role switch/403, deposit 8%, seller ratings API thật, CRUD brands, gói đăng tin, `fulfillmentType` kho/direct, `sellerOrderNotificationFlow`, doc Spring Boot (`BACKEND-NODE-TO-SPRING-BOOT.md`), nhánh **follow thầy Lâm**.*
