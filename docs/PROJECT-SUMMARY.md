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

### Roles

| Role     | Mô tả                                      |
|----------|---------------------------------------------|
| Guest    | Xem Home, Detail, Login, Register           |
| Buyer    | Mua hàng, Checkout, Transaction, Profile    |
| Seller   | Đăng tin, quản lý tin, Profile, Payouts     |
| Inspector| Thuộc hệ thống (Sprint 2)                   |
| Admin    | Thuộc hệ thống (Sprint 2)                   |

---

## 2. Business rules (cốt lõi)

### 2.1 Listing & Kiểm định

- **Publish** chỉ sau khi inspection **APPROVE**
- Vòng kiểm định: `APPROVE → Publish` | `REJECT → End` | `NEED_UPDATE → Seller cập nhật → Resubmit → Inspect`
- **Chỉnh sửa tin:**
  - **Draft**: Sửa được
  - **Pending Inspection**: Khóa sửa
  - **Need Update**: Sửa được
  - **Published**: Hạn chế sửa nội dung cốt lõi
- Chỉ listing **PUBLISHED + APPROVE** hiển thị trên marketplace

### 2.2 Giao dịch (Transaction)

- **FIFO**: Available → Reserved (lock sau deposit thành công) → Sold
- Cancel / Fail → Available ngay
- **Reserve** chỉ tạo khi deposit payment thành công (24h countdown)

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
- **Login** hỗ trợ 4 role (Buyer, Seller, Inspector, Admin)
- Sai role → chuyển về `/403`
- Buyer không vào `/checkout`, `/transaction`, …; Seller không vào `/checkout/:id`

---

## 3. Luồng màn hình chính

### 3.1 Luồng Buyer (mua hàng)

```
Home → Product Detail → Checkout → Transaction → Finalize → Success
```

1. **Home** (`/`): Danh sách listing (API / mock)
2. **Product Detail** (`/bikes/:id`): Chi tiết xe, báo cáo kiểm định, nút Buy now
3. **Checkout** (`/checkout/:id`): Chọn plan (FULL/DEPOSIT), phương thức thanh toán, shipping, đồng ý chính sách
4. **Transaction** (`/transaction/:id`): Countdown 24h, logistics, Cancel / Finalize
5. **Finalize** (`/finalize/:id`): Thanh toán số dư, xác nhận giao hàng
6. **Success** (`/success/:id`): Xác nhận hoàn tất

### 3.2 Luồng Seller

```
Seller Dashboard → Create/Edit Listing → Profile → Stats
```

- **Dashboard** (`/seller`): Tổng quan tin, thống kê, hành động
- **Listing Editor** (`/seller/listings/new`, `/seller/listings/:id/edit`): Tạo/sửa tin, upload ảnh
- **Profile** (`/profile`): Khi role = Seller → Seller Profile
- **Stats** (`/seller/stats`): Thống kê chi tiết

### 3.3 Luồng Auth

- **Login** (`/login`): Chọn role, đăng nhập (mock)
- **Register** (`/register`): Chọn Buyer/Seller, đăng ký (mock) → auto login
- **Logout**: `clearTokens()` → về Home

---

## 4. Các chức năng đã hoàn thành

### 4.1 UI Foundation (SHOP-19)

- Setup shadcn/ui, theme tokens
- Components: `Button`, `Card`, `Input`, `Badge`, `Label`, `Select`, `Checkbox`, `Dialog`

### 4.2 Auth & Guards

| Chức năng      | Mô tả                                                 |
|----------------|--------------------------------------------------------|
| Login          | Mock login, chọn 4 role                               |
| Register       | Mock signup, chỉ Buyer/Seller                         |
| GuestGuard     | Redirect user đã login khỏi /login, /register          |
| RequireAuth    | Bảo vệ /profile                                       |
| RequireBuyer   | Bảo vệ /checkout, /transaction, /finalize, /success  |
| RequireSeller  | Bảo vệ /seller, /seller/stats, /seller/listings/*    |
| 403 Forbidden  | Trang sai role                                        |

### 4.3 Buyer Pages

| Trang           | Chức năng chính                                      |
|-----------------|------------------------------------------------------|
| HomePage        | Load listings qua `buyerService` (API + mock)         |
| ProductDetailPage | Chi tiết xe, inspection report, View full report (Dialog) |
| CheckoutPage    | Plan, payment method, shipping, validation policy (inline error) |
| TransactionPage | Countdown, Cancel (confirm), View report (Dialog), Support chat (Dialog) |
| FinalizePurchasePage | Thanh toán số dư, confirm shipping                   |
| PurchaseSuccessPage | Tóm tắt đơn, links                                    |
| BuyerProfilePage| Personal info, Recent orders, nav scroll              |

### 4.4 Seller Pages

| Trang                 | Chức năng chính                                      |
|-----------------------|------------------------------------------------------|
| SellerDashboardPage   | Thống kê tin, inventory, View all                   |
| SellerListingEditorPage | Tạo/sửa tin, upload 1–8 ảnh, Draft/Pending logic    |
| SellerProfilePage    | Edit Profile, Payment methods (Add/Remove/Set default) |
| SellerStatsPage      | Total Sales, Active Listings, Completed Deals       |

### 4.5 Seller Profile – Chi tiết

#### Edit Profile

- Dialog: Full Name*, Email*, Avatar URL
- Validation: tên và email bắt buộc, email hợp lệ

#### Payment Methods

- **Remove**: Xóa item, confirm dialog; bắt buộc giữ ≥1 phương thức
- **Set as default**: Chỉ với item không phải DEFAULT, khi có ≥2 phương thức
- **Add New**: Dialog thêm Visa/MoMo; với Visa yêu cầu 4 số cuối
- Khi xóa DEFAULT, item còn lại đầu tiên trở thành DEFAULT

### 4.6 API & Services

| File             | Mô tả                                                |
|------------------|------------------------------------------------------|
| `apiClient.ts`   | Axios instance, Bearer token, 401 → logout           |
| `authApi.ts`     | login, signup, getProfile (scaffold)                  |
| `buyerApi.ts`    | bikes, orders, payments (scaffold)                    |
| `buyerService.ts`| Facade + fallback mock khi API lỗi                  |
| `useAuthStore`   | Tokens, role, persist `auth-storage`                 |

### 4.5 Các sửa đổi theo business rules (gần đây)

| Khu vực         | Thay đổi                                                       |
|-----------------|----------------------------------------------------------------|
| Seller Profile  | Set as Default, validation Edit Profile & Add Payment         |
| Seller Profile  | Remove confirm, quy tắc DEFAULT khi xóa                         |
| Transaction     | Cancel dialog ghi rõ: refund 7 ngày, giới hạn 3 lần/kỳ        |
| Buyer Profile   | Nav scroll (Personal Info, My Orders), View All Orders link     |
| Seller Dashboard| View all → Link thay vì button                                 |
| Checkout        | Validation policy → inline error thay alert                    |

---

## 5. Cấu trúc thư mục chính

```
src/
├── apis/           # authApi, buyerApi, bikeApi
├── components/
│   ├── common/     # Header
│   ├── listing/    # ListingCard
│   └── ui/         # shadcn components
├── layouts/        # MainLayout
├── lib/            # apiClient, utils, cn
├── mocks/          # bikeApi.mock, listings.mock
├── pages/          # Các trang (Home, Detail, Checkout, ...)
├── routes/         # AppRouter, Guards (RequireAuth, RequireBuyer, RequireSeller)
├── services/       # buyerService
├── stores/         # useAuthStore
└── types/          # auth, shopbike, order, listing
```

---

## 6. Các tài liệu liên quan

| File                  | Nội dung                                |
|-----------------------|-----------------------------------------|
| `docs/FLOWS-AND-PROGRESS.md` | Luồng nghiệp vụ, tiến độ theo ticket   |
| `docs/API-INTEGRATION.md`    | Hướng dẫn gắn API thật khi BE sẵn sàng |
| `.kiro/steering/project-standards.md` | Chuẩn dự án, business rules      |
| `.kiro/steering/product.md`  | Mô tả sản phẩm                         |

---

## 7. Điều kiện test với Backend (Sprint 2+)

- CORS cho `http://localhost:5173`
- Swagger/OAS
- Endpoints: `POST /auth/login`, `POST /auth/signup`, `GET /bikes`, `GET /bikes/:id`
- Set `VITE_API_BASE_URL` trong `.env`

---

## 8. Checklist demo nhanh

1. Register Buyer → Home
2. Home → Product Detail → Buy now → Checkout → Pay deposit → Transaction → Finalize → Success
3. Logout → Login Seller → Vào Profile → Edit Profile, Add/Remove payment, Set default
4. Seller → /seller/stats
5. Buyer thử vào /seller → 403
6. Seller thử vào /checkout/:id → 403

---

*Tài liệu cập nhật: Sprint 1 hoàn thiện*
