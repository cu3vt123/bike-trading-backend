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
| **Đọc cùng** | [BE-FE-API-AUDIT.md](./BE-FE-API-AUDIT.md) — cùng nội dung nhưng xếp theo **nhóm API**, không theo page. [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) — bảng path tóm tắt. |
| **Ký hiệu trong bảng** | ✅ Khớp; phần **Dead code** ở §1 — path FE có nhưng BE không dùng / không gọi. |

---

## Mục lục

1. [Tổng quan](#1-tổng-quan) — gồm dead code  
2. [Chi tiết theo Actor và Page](#2-chi-tiết-theo-actor-và-page) — §2.1 Guest → §2.6 Auth  
3. [Reviews (Buyer + Admin)](#muc-3-reviews)  
4. [Khuyến nghị](#4-khuyến-nghị)  
5. [File tham chiếu](#5-file-tham-chiếu)  

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
