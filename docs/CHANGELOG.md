# Changelog – Tóm tắt thay đổi ShopBike Frontend

Tài liệu ghi nhận các thay đổi chính so với phiên bản trước (sau Sprint 1 + Sprint 2).

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

*Cập nhật lần cuối: 2025-02 – Forgot Password, Support, Wishlist, Filters, UI Polish*
