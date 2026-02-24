# ShopBike – Luồng & Tiến độ FE (tóm tắt)

Tài liệu này dùng để:
- Giải thích **luồng nghiệp vụ** (Buyer/Seller/Auth/RBAC)
- Tổng hợp **những phần FE đã hoàn thành** theo ticket/sprint
- Làm “notes” để **demo/thuyết trình** và **test** nhanh

---

## 1) Tổng quan dự án

Nền tảng kết nối **mua/bán xe đạp thể thao cũ** với cơ chế tăng độ tin cậy:
- Listing chỉ hiển thị marketplace khi **đã kiểm định** (PUBLISHED + APPROVE)
- Giao dịch theo flow: **Checkout → Transaction → Finalize → Success**

Tech FE: React + Vite + TypeScript + Tailwind + shadcn/ui + React Router + Zustand + Axios.

---

## 2) Roles & quyền cơ bản

- **Guest**: xem Home, xem Detail, truy cập Login/Register
- **Buyer**: checkout/payment/transaction/finalize/success, profile buyer
- **Seller**: seller dashboard, tạo/sửa listing (gọi sellerService), profile seller
- **Inspector/Admin**: dashboard kiểm định (Sprint 3) – Duyệt/Từ chối/Cần cập nhật tin đăng

### Rule quan trọng
- **Register chỉ cho Buyer/Seller**
- **Login cho 4 role** (Buyer/Seller/Inspector/Admin) để test RBAC
- **Sai role → `/403`**

---

## 3) Luồng demo chính (Buyer end-to-end)

### Flow A – Buyer mua hàng

1. **Home** (`/`)
   - Load listings qua `buyerService.fetchListings()` (API thật nếu có, fallback mock nếu lỗi)
2. **Product Detail** (`/bikes/:id`)
   - Load detail qua `buyerService.fetchListingById(id)` (có dùng `location.state` nếu đi từ Home)
3. **Checkout / Payment** (`/checkout/:id`)
   - Chọn plan (FULL / DEPOSIT)
   - Chọn method (CARD / MOMO / BANK)
   - Nhập shipping + card (nếu CARD)
   - Submit → chuyển qua Transaction
4. **Transaction** (`/transaction/:id`)
   - Hiển thị countdown + progress + logistics + summary
   - Nút “Finalize Purchase” → sang Finalize
5. **Finalize** (`/finalize/:id`)
   - Pay balance + confirm shipping (UI)
   - Complete → sang Success
6. **Success** (`/success/:id`)
   - Tóm tắt đơn + payment + link về Home/Detail

---

## 4) Luồng Auth + RBAC (demo nhanh)

### Flow B – Register → auto-login
- **Register** (`/register`)
  - Chọn role: Buyer/Seller
  - Signup (mock) → **auto-login** → về Home

### Flow C – Login + Guard
- **Login** (`/login`)
  - Chọn role (4 role)
  - Login (mock) → redirect về trang trước đó (nếu hợp role), nếu không hợp → về Home

### RBAC checks
- Buyer vào `/seller` → **/403**
- Seller vào `/checkout/:id` → **/403**
- Inspector/Admin có route riêng `/inspector` (RequireInspector)

### Flow D – Inspector kiểm định (Sprint 3)
- **Login Inspector** → Header hiện nút "Inspector" → **Inspector Dashboard** (`/inspector`)
- Danh sách tin chờ kiểm định (PENDING_INSPECTION)
- Nút: **Duyệt** (approve), **Từ chối** (reject), **Cần cập nhật** (need-update)
- Mock data khi `VITE_USE_MOCK_API=true`; gọi `inspectorApi` khi có Backend

---

## 5) Những gì FE đã làm được (theo ticket)

### UI Foundation
- **SHOP-19**: Setup shadcn/ui + base components + theme tokens  
  - Các component đã thêm: `button`, `card`, `input`, `badge`, `label`, `select`, `checkbox`

### Auth / Guards
- **SHOP-20**: Login (shadcn) + 4-role selector + guards + `/403`
- **SHOP-39**: Register (shadcn) + role-aware (Buyer/Seller only)

### Buyer API scaffold
- **SHOP-21**: Buyer API mapping scaffold + service fallback
  - `src/apis/buyerApi.ts`, `src/services/buyerService.ts`, `src/types/order.ts`

### Buyer pages (shadcn + API/fallback)
- **SHOP-22**: Home page shadcn + load listings via `buyerService`
- **SHOP-23**: Product detail shadcn + load detail via `buyerService`
- **SHOP-24**: Transaction page shadcn + load listing via `buyerService`
- **SHOP-25**: Checkout/Payment page shadcn + load listing via `buyerService`
- **SHOP-26**: Finalize + Success pages shadcn + load listing via `buyerService`
- **SHOP-27**: Profile pages shadcn (Buyer/Seller), Inspector/Admin → InspectorDashboardPage
- **SHOP-41**: Inspector Dashboard – danh sách tin chờ kiểm định, Duyệt/Từ chối/Cần cập nhật (Sprint 3)

### Sprint 3 FE (bổ sung)
- **sellerApi.ts** + **sellerService.ts**: Dashboard, create/update/submit listing – scaffold + mock fallback
- **inspectorApi.ts**: pending-listings, approve, reject, need-update – scaffold + mock fallback
- **RequireInspector** guard, route `/inspector`
- **SellerDashboardPage**: gọi `fetchSellerDashboard()` thay SELLER_MOCK
- **SellerListingEditorPage**: Save draft / Submit for inspection gọi `sellerService`

---

## 6) Cấu trúc code quan trọng (để map API thật)

- **Axios client**: `src/lib/apiClient.ts`
  - `VITE_API_BASE_URL` (mặc định `http://localhost:8081/api`)
  - tự attach Bearer token từ `useAuthStore`
  - 401 → logout

- **Auth API**: `src/apis/authApi.ts`
  - `login`, `signup`, `getProfile` (path tương đối theo baseURL)

- **Buyer API**: `src/apis/buyerApi.ts`
  - orders/payments/transactions/profile (scaffold)

- **Seller API**: `src/apis/sellerApi.ts`
  - dashboard, listings, create, update, submitForInspection (scaffold)

- **Inspector API**: `src/apis/inspectorApi.ts`
  - pending-listings, approve, reject, need-update (scaffold)

- **Service fallback**: `src/services/buyerService.ts`, `src/services/sellerService.ts`
  - `VITE_USE_MOCK_API=true` để ép dùng mock
  - nếu API lỗi → fallback mock để không “kẹt sprint”

---

## 6b) Ghi nhận Sprint 3

**FE đã hoàn thành (Sprint 3):**
- Inspector Dashboard (SHOP-41): UI + inspectorApi scaffold + mock
- Seller API scaffold: sellerApi, sellerService – Dashboard, Create/Edit listing gọi API (fallback mock)
- RequireInspector, route `/inspector`, Header nút Inspector cho role INSPECTOR/ADMIN

**Backend còn thiếu (chưa hoàn thành theo task giao):**
- GET /auth/me
- Các API Buyer: orders, payments (theo HUONG-DAN-BACKEND)
- Các API Seller: dashboard, listings, create/update/submit (xem SPRINT3-HOI-DONG)
- Các API Inspector: pending-listings, approve, reject, need-update

**Test bikes:**
- `VITE_USE_MOCK_API=true` → FE dùng mock bikes, **test được** không cần Backend bật.
- `VITE_USE_MOCK_API=false` + Backend **chưa bật** → API lỗi, FE fallback mock (vẫn có bikes).
- `VITE_USE_MOCK_API=false` + Backend **bật** → gọi API thật, có bikes từ Backend.

---

## 7) Điều kiện để test với Backend (Sprint 2)

Để FE test với BE “mượt”, BE nên có:
- **Swagger/OAS** rõ ràng (endpoint + request/response)
- **CORS** cho FE dev server (`http://localhost:5173`)
- **Seed data**: sample Buyer/Seller accounts + vài listing published + approve

Hướng dẫn đổi mock → API thật: xem `docs/API-INTEGRATION.md`.

---

## 8) Checklist demo nhanh (5 phút)

1. Register Buyer → về Home
2. Home → click 1 listing → Detail
3. Detail → Buy now → Checkout → Pay deposit → Transaction → Finalize → Success
4. Logout → Login Seller → Dashboard → Create/Edit listing → Submit for inspection
5. Logout → Login Inspector → Inspector Dashboard → Duyệt/Từ chối tin
6. Login Buyer → thử vào `/seller` → 403 (RBAC)
7. Login Seller → thử vào `/checkout/:id` → 403

