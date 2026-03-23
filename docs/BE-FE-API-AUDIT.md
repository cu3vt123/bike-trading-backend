# BE–FE API Audit Report

**Ngày kiểm tra:** 2025-03-15  
**Phạm vi:** API endpoints, logic nghiệp vụ, khớp giữa Backend Node.js và Frontend React.

---

## 1. Tóm tắt kết quả

| Khu vực | Trạng thái | Ghi chú |
|---------|------------|---------|
| Auth | ✅ Khớp | login/signup trả `{ data: { accessToken, role, subscription } }` |
| Bikes | ✅ Khớp | list: `{ content }`, get: `{ data }` |
| Brands, Packages | ✅ Khớp | Public list |
| Buyer Orders | ✅ Khớp | vnpay-checkout, vnpay-resume, pay-balance, getOrderById, cancel, complete |
| Seller | ✅ Khớp | dashboard, ship-to-buyer, mark-shipped-to-warehouse |
| Inspector | ✅ Khớp | approve (inspectionReport), need-update (reason min 5 chars), FE đã validate |
| Admin | ✅ Khớp | warehouse, re-inspection, confirm-warehouse-re-inspection |
| Dead code | ⚠️ Cần xử lý | `PAYMENTS_CONFIRM`, `TRANSACTIONS` – FE có config nhưng BE không có route |

---

## 2. Chi tiết theo khu vực

### 2.1 Auth

| FE Path | BE Route | Method | Trạng thái |
|---------|----------|--------|------------|
| `/auth/login` | `/auth/login` | POST | ✅ |
| `/auth/signup` | `/auth/signup` | POST | ✅ |
| `/auth/me` | `/auth/me` | GET | ✅ |

- **Response:** `{ data: { accessToken, role, subscription } }` – FE dùng `ok()` / `created()` nên wrap trong `data`.
- **FE:** `authApi.login()`, `authApi.signup()` đọc `r.data?.data` hoặc `r.data` – khớp.
- **Role:** FE `RequireBuyer` chỉ cho BUYER; BE `requireRole(["BUYER", "ADMIN"])` cho phép ADMIN gọi buyer API – có thể chủ ý để admin test.

### 2.2 Bikes (Marketplace)

| FE Path | BE Route | Method | Trạng thái |
|---------|----------|--------|------------|
| `/bikes` | `/bikes` | GET | ✅ |
| `/bikes/:id` | `/bikes/:id` | GET | ✅ |

- **List:** BE trả `{ content: [...] }` – FE `bikeApi.getAll()` đọc `r.data?.content ?? r.data?.data ?? r.data`.
- **Get:** BE dùng `ok(res, item)` → `{ data: item }` – FE đọc `r.data?.data ?? r.data`.

### 2.3 Buyer Orders

| FE Path | BE Route | Method | Trạng thái |
|---------|----------|--------|------------|
| `/buyer/orders/vnpay-checkout` | Có | POST | ✅ |
| `/buyer/orders/:id/vnpay-resume` | Có | POST | ✅ |
| `/buyer/orders/:id/vnpay-pay-balance` | Có | POST | ✅ |
| `/buyer/orders` | Có | GET, POST | ✅ |
| `/buyer/orders/:id` | Có | GET | ✅ |
| `/buyer/orders/:id/complete` | Có | PUT | ✅ |
| `/buyer/orders/:id/cancel` | Có | PUT | ✅ |
| `/buyer/payments/confirm/:orderId` | **Không** | POST | ❌ Dead code |
| `/buyer/transactions/:orderId` | **Không** | GET | ❌ Dead code |

**Khớp logic:**

- **createOrderVnpayCheckout:** FE gửi `{ listingId, plan, shippingAddress: { street, city }, acceptedUnverifiedDisclaimer? }` – BE schema khớp.
- **resumeVnpayCheckout:** FE gọi POST khi user bấm "Tiếp tục thanh toán" – BE tạo lại `paymentUrl`.
- **payBalanceVnpay:** BE yêu cầu status === "SHIPPING" – đúng luồng trả nốt còn lại khi đang giao.
- **getOrderById:** BE trả `{ data: order }` – FE đọc `r.data?.data ?? r.data`.
- **getMyOrders:** BE trả `{ data: items }` – FE đọc `r.data?.content ?? r.data?.data ?? r.data`.

### 2.4 Seller

| FE Path | BE Route | Method | Trạng thái |
|---------|----------|--------|------------|
| `/seller/dashboard` | Có | GET | ✅ |
| `/seller/orders/:id/ship-to-buyer` | Có | PUT | ✅ |
| `/seller/listings/:id/mark-shipped-to-warehouse` | Có | PUT | ✅ |

- **shipOrderToBuyer:** PUT không body – khớp.
- **markListingShippedToWarehouse:** PUT không body – khớp.
- **Dashboard:** BE trả `{ stats, listings }` – FE dùng khớp.

### 2.5 Inspector

| FE Path | BE Route | Method | Trạng thái |
|---------|----------|--------|------------|
| `/inspector/listings/:id/approve` | Có | PUT | ✅ |
| `/inspector/listings/:id/reject` | Có | PUT | ✅ |
| `/inspector/listings/:id/need-update` | Có | PUT | ✅ |

- **approve:** FE gửi `{ inspectionReport }` với các trường điểm – BE dùng `inspectionReport`.
- **need-update:** FE gửi `{ reason }` (min 5 ký tự), FE đã validate trước khi gọi – khớp.

### 2.6 Admin

| FE Path | BE Route | Method | Trạng thái |
|---------|----------|--------|------------|
| `/admin/orders/warehouse-pending` | Có | GET | ✅ |
| `/admin/orders/:id/confirm-warehouse` | Có | PUT | ✅ |
| `/admin/orders/re-inspection` | Có | GET | ✅ |
| `/admin/orders/:id/re-inspection-done` | Có | PUT | ✅ |
| `/admin/listings/:id/confirm-warehouse-intake` | Có | PUT | ✅ |
| `/admin/listings/:id/confirm-warehouse-re-inspection` | Có | PUT | ✅ |

- **confirmWarehouseReInspection:** FE gửi `{ action: "approve" | "need_update", reason? }` – BE xử lý đúng.

---

## 3. Các vấn đề cần xử lý

### 3.1 Dead code – ĐÃ XỬ LÝ

**Đã xóa (trước đây):**

- `PAYMENTS_CONFIRM`, `TRANSACTIONS` – BE không có route. Đã xóa khỏi `apiConfig` và `buyerApi.ts`.
- `BUYER.PROFILE` (`/buyer/profile`) – BE không có route. Đã xóa khỏi `apiConfig`, `buyerApi.ts`, `shared/constants`.
- `buyerProfileApi.get()` – không được gọi; BuyerProfilePage dùng `authApi.getProfile()` (GET `/auth/me`).

### 3.2 PAYMENTS_INITIATE

- FE config có `/buyer/payments/initiate`.
- BE có `paymentController.initiatePayment` – cần kiểm tra logic khi tích hợp gateway thật (hiện VNPAY checkout qua `vnpay-checkout`).

---

## 4. Khuyến nghị tiếp theo

1. **Dọn dead code:** Xóa hoặc ẩn `paymentApi.confirm`, `transactionApi.getStatus` và các path liên quan nếu không dùng.
2. **Test E2E các luồng chính:**
   - Login → Checkout VNPAY → Resume VNPAY (nếu chưa thanh toán)
   - Seller: mark shipped to warehouse, ship to buyer
   - Inspector: approve / reject / need-update (với reason ≥ 5 ký tự)
   - Admin: confirm warehouse, confirm re-inspection
   - Buyer: pay balance, complete order
3. **IPN VNPAY:** Đảm bảo return URL / IPN callback cập nhật đúng status đơn hàng – FE không gọi confirm riêng mà dựa vào BE đã cập nhật khi IPN/return.

---

## 5. File tham chiếu

| Hạng mục | Đường dẫn |
|----------|-----------|
| FE API config | `src/lib/apiConfig.ts` |
| FE Buyer API | `src/apis/buyerApi.ts` |
| BE buyer routes | `backend/src/routes/buyerRoutes.js` |
| BE buyer controller | `backend/src/controllers/buyerController.js` |
| BE admin controller | `backend/src/controllers/adminController.js` |
| BE inspector controller | `backend/src/controllers/inspectorController.js` |
| BE seller controller | `backend/src/controllers/sellerController.js` |
| BE auth controller | `backend/src/controllers/authController.js` |
