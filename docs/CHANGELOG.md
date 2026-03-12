# Changelog – Tóm tắt thay đổi ShopBike Frontend

Tài liệu ghi nhận các thay đổi chính so với phiên bản trước (sau Sprint 1 + Sprint 2).

---

## [2025-02] Cập nhật UI, Admin, Notifications, VND, Wishlist

### Frontend

| Thay đổi | Chi tiết |
|----------|----------|
| **Hero (HomePage)** | Slogan mới: "Những chiếc xe đã được kiểm định, sẵn sàng lên đường" / "Cùng ShopBike bắt đầu hành trình tiếp theo của bạn"; "ShopBike" và "bạn" màu primary; nút "Khám phá ngay" |
| **LoginPage** | Bỏ chọn role; layout 2 cột (hero trái, form phải); nền hero slider; text branding "Để ShopBike đồng hành cùng Bạn bắt đầu chuyến đi mới"; "Bạn" viết hoa, màu primary |
| **Wishlist** | ProductDetailPage: nút wishlist chỉ hiện khi role BUYER (đã đăng nhập) |
| **TransactionPage** | Countdown chỉ chạy khi status SHIPPING; text "Bước tiếp theo" rõ hơn |
| **ProductDetailPage** | Format tiền VND; dùng `inspectionReport` từ API |
| **AdminDashboardPage** | Nút "Hiện" (unhide) cho user/listing đã ẩn |
| **SellerDashboardPage, NotificationsPage** | Gọi sync thông báo khi mount; nút "Kiểm tra đơn mới" |
| **Header** | Polling thông báo 10s; gọi sync ngay khi mount |
| **sellerService** | `syncSellerOrderNotifications` |
| **adminService, adminApi** | Unhide user/listing |
| **constants/hero.ts** | HERO_SLIDES, HERO_AUTO_SLIDE_MS |
| **useNotificationStore** | Store thông báo seller |

### Backend

| Thay đổi | Chi tiết |
|----------|----------|
| **Listing** | Thêm `inspectionReport`; mặc định `currency: "VND"` |
| **inspectorController** | Lưu `inspectionReport` khi approve |
| **adminController** | `unhideUser`, `unhideListing`; `markReInspectionDone` set `expiresAt` |
| **buyerController** | `completeOrder` chỉ chấp nhận status SHIPPING; bỏ role khỏi login |
| **authController** | Bỏ role khỏi login payload (role từ tài khoản) |
| **seed.js** | Đổi `currency` và giá sang VND |

### Docs

| File | Nội dung |
|------|----------|
| **docs/ERD-SPEC.md** | Đặc tả ERD – entities, quan hệ (User, Listing, Order, Review) |
| **docs/KIEM-KE-HE-THONG.md** | Báo cáo kiểm kê hệ thống – cấu trúc, models, routes, logic |

---

## [2025-02] Wishlist yêu cầu đăng nhập BUYER

### Thay đổi

- **ProductDetailPage**: Nút wishlist (trái tim) chỉ hiển thị khi user đã đăng nhập với role BUYER. Khi chưa đăng nhập hoặc role khác, nút không hiện – tránh thêm wishlist khi chưa đăng nhập.
- **ListingCard**: Đã có sẵn `canWishlist = showWishlist && role === "BUYER"` – nhất quán với ProductDetailPage.

---

## [Gần đây] Gộp toàn bộ docs vào một folder `docs/`

### Thay đổi

- **Một folder docs duy nhất**: Toàn bộ tài liệu nằm trong `docs/`.
- **Backend docs chuyển vào `docs/backend/`**: Các file trước đây trong `backend/docs/` (STRUCTURE, DEMO-BACKEND-GUIDE, PORTING-NODE-TO-SPRING-BOOT, SPRING-BOOT-SKELETON) đã được chuyển vào `docs/backend/`. Các tham chiếu trong nội dung đã được cập nhật (`backend/docs/...` → `docs/backend/...`).
- **Mục lục**: Thêm `docs/README.md` làm mục lục toàn bộ tài liệu (docs chung + docs/backend).
- **Cập nhật tham chiếu**: README.md (root), PROJECT-SUMMARY.md, RUN-FULL-PROJECT.md, backend/README.md đã được cập nhật để trỏ đúng tới `docs/` và `docs/backend/`.

Sau khi gộp, có thể xóa thư mục `backend/docs/` cũ (nội dung đã nằm trong `docs/backend/`).

---

## [2025-03] Tái cấu trúc + dọn dẹp docs

### Thay đổi code

- Tái cấu trúc theo `main-course-project-clone`: `app/`, `features/`, `shared/`
- Router: `createBrowserRouter` thay `BrowserRouter`
- Guards: `GuestRoute`, `ProtectedRoute`, `RequireAuth`, `RequireBuyer`, `RequireSeller`, `RequireInspector` trong `shared/components/common`

### Thay đổi docs

#### Xóa

| File / thư mục | Lý do |
|----------------|-------|
| `API-CONTRACT.md` | Trùng HUONG-DAN-BACKEND |
| `API-INTEGRATION.md` | Lỗi thời |
| `BACKEND-API-CON-THIEU.md` | Task list cũ |
| `docs/sheets/` | Requirements CSV – không dùng trong dev |

#### Cập nhật

| File | Nội dung |
|------|----------|
| `PROJECT-SUMMARY.md` | Cấu trúc mới, danh sách docs |
| `CHANGELOG.md` | Entry này |

#### Mới

| File | Nội dung |
|------|----------|
| `docs/STRUCTURE.md` | Cấu trúc feature-based |

---

## [Sprint 3 – 2025-02] Chuẩn bị hội đồng

### Thay đổi code (FE)

#### 1. Inspector Dashboard (SHOP-41)

| Thay đổi | Chi tiết |
|----------|----------|
| **InspectorDashboardPage** | Trang mới: danh sách tin chờ kiểm định, nút Duyệt / Từ chối / Cần cập nhật |
| **inspectorApi.ts** | Scaffold: `getPendingListings`, `approve`, `reject`, `needUpdate` |
| **RequireInspector.tsx** | Guard bảo vệ route `/inspector` (role INSPECTOR, ADMIN) |
| **Route /inspector** | Thêm route với `RequireInspector` |
| **ProfilePage** | Khi role = Inspector/Admin → hiển thị `InspectorDashboardPage` thay placeholder |
| **Header** | Nút "Inspector" khi role INSPECTOR hoặc ADMIN |

#### 2. Seller API & Service

| Thay đổi | Chi tiết |
|----------|----------|
| **sellerApi.ts** | Scaffold: `getDashboard`, `getListings`, `getListingById`, `create`, `update`, `submitForInspection` |
| **sellerService.ts** | Facade: `fetchSellerDashboard`, `createListing`, `updateListing`, `submitForInspection`, `fetchListingById` – fallback mock khi API lỗi |
| **SellerDashboardPage** | Dùng `fetchSellerDashboard()` thay `SELLER_MOCK` cố định |
| **SellerListingEditorPage** | Save draft / Submit for inspection gọi `sellerService`; load listing khi edit mode |

#### 3. Auth & RBAC

| Thay đổi | Chi tiết |
|----------|----------|
| **LoginPage** | `resolvePostLoginPath`: cho phép ADMIN vào `/inspector` |
| **AppRouter** | Thêm route `/inspector` với `RequireInspector` |

---

### Thay đổi tài liệu (docs/)

#### 4. Xóa file trùng / không cần thiết

| File đã xóa | Lý do |
|-------------|-------|
| `PROJECT-SUMMARY-VI.md` | Trùng nội dung với `PROJECT-SUMMARY.md` (bản tiếng Việt đầy đủ) |
| `BACKEND-CHECKLIST-SPRINT2.md` | Trùng với `BACKEND-API-CON-THIEU.md` |
| `CON-THIEU-SAU-2-SPRINT.md` | Nội dung đã có trong `SPRINT3-HOI-DONG.md`, `BACKEND-API-CON-THIEU.md` |

#### 5. Cập nhật file hiện có

| File | Nội dung cập nhật |
|------|-------------------|
| **PROJECT-SUMMARY.md** | Luồng Inspector, roles, Inspector pages, API/Services (sellerApi, inspectorApi, sellerService), RequireInspector, cấu trúc thư mục, checklist demo, tham chiếu CHANGELOG |
| **SPRINT3-HOI-DONG.md** | Trạng thái luồng demo (FE đã có Inspector Dashboard, Seller scaffold), tóm tắt Frontend Sprint 3 |
| **FLOWS-AND-PROGRESS.md** | Flow Inspector (Flow D), roles Inspector/Admin, SHOP-41, Sprint 3 FE, cấu trúc api (sellerApi, inspectorApi), checklist demo |
| **API-INTEGRATION.md** | Thêm Seller API, Inspector API; cập nhật bảng cấu trúc |
| **BACKEND-API-CON-THIEU.md** | Xóa tham chiếu `BACKEND-CHECKLIST-SPRINT2.md` |

---

### Tổng kết

| Hạng mục | Số lượng |
|----------|----------|
| File code mới | 5 (`inspectorApi.ts`, `sellerApi.ts`, `sellerService.ts`, `InspectorDashboardPage.tsx`, `RequireInspector.tsx`) |
| File code sửa | 6 (`ProfilePage`, `SellerDashboardPage`, `SellerListingEditorPage`, `AppRouter`, `Header`, `LoginPage`) |
| File docs xóa | 3 |
| File docs cập nhật | 5 |
| File docs mới | 1 (`CHANGELOG.md`) |

---

## [2025-02] Forgot Password, Support, Wishlist, Filters, UI Polish

### Thay đổi code

#### 1. Forgot Password

| Thay đổi | Chi tiết |
|----------|----------|
| **authApi.ts** | `forgotPassword(email)`, `resetPassword({ token, newPassword })` |
| **ForgotPasswordPage** | Form nhập email, gửi yêu cầu reset (mock + API) |
| **ResetPasswordPage** | Form đặt mật khẩu mới với token từ URL |
| **LoginPage** | Link "Quên mật khẩu?" → `/forgot-password` |
| **Routes** | `/forgot-password`, `/reset-password` (GuestGuard) |

#### 2. Support Page

| Thay đổi | Chi tiết |
|----------|----------|
| **SupportPage** | Trang FAQ + liên hệ (email support) |
| **Route** | `/support` – sửa 404 từ link Header/Login |
| **HomePage** | Card Support trong Hero → Link tới `/support` |

#### 3. Wishlist (Master Concept – Buyer)

| Thay đổi | Chi tiết |
|----------|----------|
| **useWishlistStore** | Lưu ID xe yêu thích (persist localStorage) |
| **WishlistPage** | Danh sách xe đã lưu, xóa khỏi wishlist |
| **ProductDetailPage** | Nút trái tim thêm/xóa wishlist |
| **Header** | Link "Wishlist" khi role = BUYER |
| **Route** | `/wishlist` |

#### 4. HomePage – Bộ lọc nâng cao

| Thay đổi | Chi tiết |
|----------|----------|
| **Filters** | Thêm: tình trạng (Condition), kích thước khung (Frame size), khoảng giá (Min/Max $) |
| **Filter logic** | Lọc theo keyword, brand, condition, frameSize, priceMin, priceMax |

#### 5. ProductDetailPage – Chat với seller

| Thay đổi | Chi tiết |
|----------|----------|
| **Chat** | Nút "Chat với người bán" / "Nhắn tin" → Dialog placeholder (email support) |

#### 6. Seller Dashboard – Orders & Ratings

| Thay đổi | Chi tiết |
|----------|----------|
| **Đơn đặt mua / đặt cọc** | Card mock: danh sách đơn, buyer, deposit, status |
| **Đánh giá & uy tín** | Card mock: 4.8★, 12 đánh giá, phân bố sao |

#### 7. UI Polish

| File | Thay đổi |
|------|----------|
| BuyerProfilePage, CheckoutPage, PurchaseSuccessPage, FinalizePurchasePage | Bỏ "Sprint 1" placeholder, cập nhật message |
| SellerListingEditorPage, InspectorDashboardPage | Bỏ text "Sprint 1/3" |
| TransactionPage | Cập nhật Support chat (link email) |
| SellerDashboardPage | Fallback ảnh `thumbnailUrl ?? imageUrls[0]` |
| API-INTEGRATION.md | Thêm forgot-password, reset-password |

### Tổng kết phiên bản này

| Hạng mục | Số lượng |
|----------|----------|
| File mới | 6 (`ForgotPasswordPage`, `ResetPasswordPage`, `SupportPage`, `WishlistPage`, `useWishlistStore`) |
| File sửa | 15+ |

---

---

## [2025-02] Hướng dẫn FE2 Join Git

### Thay đổi tài liệu

| File | Nội dung |
|------|----------|
| **HUONG-DAN-FE2-JOIN-GIT.md** | Hướng dẫn FE2: clone repo, cấu hình Git, branch, cài đặt & chạy, quy trình commit/push, cấu trúc code, tài liệu tham khảo |
| **PROJECT-SUMMARY.md** | Thêm tham chiếu `HUONG-DAN-FE2-JOIN-GIT.md` |

---

*Cập nhật lần cuối: 2025-02 – Hướng dẫn FE2 Join Git*
