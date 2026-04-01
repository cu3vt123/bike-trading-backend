# ShopBike — Chức năng trên web → API → file backend (`quydu_be`)

Tài liệu map **từng nhóm màn hình / thao tác** (gợi ý route FE phổ biến) sang **endpoint REST** và **class + method** trong backend.  
**Base API:** `http://localhost:8081/api` (trừ `/payment/**` và `/uploads/**`).

**Cách tra trong IntelliJ:** `Ctrl+Shift+F` tìm chuỗi path, ví dụ `"/orders/vnpay-checkout"` hoặc `GetMapping("/dashboard")`.

---

## Legend

| Cột | Ý nghĩa |
|-----|---------|
| **Màn / thao tác** | Mô tả theo người dùng (FE có thể đặt route khác một chút). |
| **HTTP + path** | Đúng như backend. |
| **Controller** | `src/main/java/com/minhyun/quydu_be/controller/...` |
| **Xử lý chính** | `*ServiceImpl` hoặc logic trong `PaymentController`. |

---

## 1. Khách vãng lai — xem sàn, thương hiệu, gói (không cần đăng nhập)

| Màn / thao tác (gợi ý FE) | API | Controller → method | Service / logic |
|---------------------------|-----|----------------------|-----------------|
| Trang chủ / danh sách xe đang bán | `GET /api/bikes` | `BikeController#listBikes` | `BikeServiceImpl#listBikes` |
| Chi tiết một xe (click vào tin) | `GET /api/bikes/{id}` | `BikeController#getBike` | `BikeServiceImpl#getBikeById` |
| Dropdown / lọc thương hiệu | `GET /api/brands` | `BrandController#listBrands` | `BrandServiceImpl#listActiveBrands` |
| Trang “bảng giá gói” (catalog tĩnh) | `GET /api/packages` | `PackageController#listPackages` | `PackageServiceImpl#getPackagesCatalog` |
| Kiểm tra server sống (ít dùng trên UI) | `GET /api/health` | `HealthController#health` | — |

**Ảnh xe:** URL thường trỏ `GET /uploads/...` — file tĩnh, không qua controller nghiệp vụ.

---

## 2. Tài khoản — đăng ký, đăng nhập, hồ sơ, quên mật khẩu

| Màn / thao tác | API | Controller → method | Service |
|----------------|-----|----------------------|---------|
| Form đăng ký | `POST /api/auth/signup` | `AuthController#signup` | `AuthServiceImpl#signup` |
| Form đăng nhập | `POST /api/auth/login` | `AuthController#login` | `AuthServiceImpl#login` |
| Làm mới token | `POST /api/auth/refresh` | `AuthController#refresh` | `AuthServiceImpl#refresh` |
| Sau khi vào app — “Tôi / hồ sơ” (load user + gói seller nếu có) | `GET /api/auth/me` | `AuthController#me` | `AuthServiceImpl#me` |
| Quên mật khẩu | `POST /api/auth/forgot-password` | `AuthController#forgotPassword` | `AuthServiceImpl#forgotPassword` |
| Đặt lại mật khẩu (link token) | `POST /api/auth/reset-password` | `AuthController#resetPassword` | `AuthServiceImpl#resetPassword` |

**Bảo mật:** Các API trên **không** cần JWT (trừ `/me` cần Bearer token).

---

## 3. Buyer — mua hàng, giao dịch, đánh giá

| Màn / thao tác | API | Controller → method | Service |
|----------------|-----|----------------------|---------|
| Checkout (tạo đơn + link VNPAY) | `POST /api/buyer/orders/vnpay-checkout` | `BuyerController#createOrderVnpayCheckout` | `BuyerServiceImpl#createOrderVnpayCheckout` |
| Tạo đơn kiểu cũ (thường FE dùng VNPAY) | `POST /api/buyer/orders` | `BuyerController#createOrder` | `BuyerServiceImpl#createOrder` |
| Danh sách đơn của tôi | `GET /api/buyer/orders` | `BuyerController#getMyOrders` | `BuyerServiceImpl#getMyOrders` |
| Chi tiết một đơn | `GET /api/buyer/orders/{id}` | `BuyerController#getOrderById` | `BuyerServiceImpl#getOrderById` |
| Trang giao dịch `/transaction/{listingId}?orderId=` | `GET /api/buyer/orders/by-listing/{listingId}` hoặc `GET /api/buyer/transactions/{listingId}` | `BuyerController#getOrderForListingTransaction` | `BuyerServiceImpl#getOrderForListingTransaction` |
| Tiếp thanh toán sau khi quay lại (resume) | `POST /api/buyer/orders/{id}/vnpay-resume` | `BuyerController#resumeOrderVnpay` | `BuyerServiceImpl#resumeOrderVnpay` |
| Trả nốt tiền (số dư) qua VNPAY | `POST /api/buyer/orders/{id}/vnpay-pay-balance` | `BuyerController#payBalanceVnpay` | `BuyerServiceImpl#payBalanceVnpay` |
| Bấm “Đã nhận xe” / hoàn tất | `PUT /api/buyer/orders/{id}/complete` | `BuyerController#completeOrder` | `BuyerServiceImpl#completeOrder` |
| Hủy đặt chỗ | `PUT /api/buyer/orders/{id}/cancel` | `BuyerController#cancelOrder` | `BuyerServiceImpl#cancelOrder` |
| Gửi đánh giá sau khi mua | `POST /api/buyer/orders/{id}/review` | `BuyerController#createReviewForOrder` | `BuyerServiceImpl#createReviewForOrder` |
| Danh sách đánh giá tôi đã viết | `GET /api/buyer/reviews` | `BuyerController#listMyReviews` | `BuyerServiceImpl#listMyReviews` |
| Demo thanh toán tiền mặt (ít dùng) | `POST /api/buyer/payments/initiate` | `BuyerController#initiatePayment` | `BuyerServiceImpl#initiateCashPayment` |

**Role:** JWT phải là **BUYER** (hoặc ADMIN).

---

## 4. Seller — kênh bán, tin đăng, gói, đơn

| Màn / thao tác | API | Controller → method | Service |
|----------------|-----|----------------------|---------|
| Dashboard `/seller` (thống kê + list tin) | `GET /api/seller/dashboard` | `SellerController#dashboard` | `SellerServiceImpl#dashboard` |
| Đánh giá shop / rating | `GET /api/seller/ratings` | `SellerController#ratings` | `SellerServiceImpl#getRatings` |
| Đơn hàng liên quan seller | `GET /api/seller/orders` | `SellerController#orders` | `SellerServiceImpl#listOrders` |
| Giao thẳng cho buyer (DIRECT) | `PUT /api/seller/orders/{orderId}/ship-to-buyer` | `SellerController#shipToBuyer` | `SellerServiceImpl#shipToBuyer` |
| Xác nhận gửi kho (đơn WAREHOUSE) | `PUT /api/seller/orders/{orderId}/ship-to-warehouse` | `SellerController#shipToWarehouse` | `SellerServiceImpl#shipToWarehouse` |
| Danh sách tin của tôi | `GET /api/seller/listings` | `SellerController#listings` | `SellerServiceImpl#listMyListings` |
| Tạo tin nháp | `POST /api/seller/listings` | `SellerController#createListing` | `SellerServiceImpl#createListing` |
| Sửa tin | `PUT /api/seller/listings/{id}` | `SellerController#updateListing` | `SellerServiceImpl#updateListing` |
| Chi tiết một tin (soạn) | `GET /api/seller/listings/{id}` | `SellerController#getListing` | `SellerServiceImpl#getMyListing` |
| Upload ảnh | `POST /api/seller/listings/upload-images` | `SellerController#upload` | `SellerServiceImpl#uploadImages` |
| Xuất bản / đăng bài | `PUT /api/seller/listings/{id}/publish` | `SellerController#publish` | `SellerServiceImpl#publishListing` |
| Gửi kiểm định (VIP) | `PUT /api/seller/listings/{id}/submit` | `SellerController#submit` | `SellerServiceImpl#submitForInspection` |
| Đánh dấu đã gửi xe vào kho (listing) | `PUT /api/seller/listings/{id}/mark-shipped-to-warehouse` | `SellerController#markShipped` | `SellerServiceImpl#markListingShippedToWarehouse` |
| Mua gói đăng tin (VNPAY) | `POST /api/seller/subscription/checkout` | `SellerController#checkout` | `SellerServiceImpl#checkoutSubscription` |
| Demo hoàn tất đơn gói (sandbox) | `POST /api/seller/subscription/orders/{orderId}/mock-complete` | `SellerController#completeSub` | `SellerServiceImpl#mockCompleteSubscriptionOrder` |
| Gỡ gói (test) | `PUT /api/seller/subscription/revoke-self` | `SellerController#revokeSub` | `SellerServiceImpl#revokeSelfSubscription` |

**Role:** **SELLER** hoặc ADMIN.

---

## 5. Inspector — kiểm định tin

| Màn / thao tác | API | Controller → method | Service |
|----------------|-----|----------------------|---------|
| Hàng chờ tin cần kiểm định | `GET /api/inspector/pending-listings` | `InspectorController#pendingListings` | `InspectorServiceImpl#pendingListings` |
| Xem chi tiết tin (inspector) | `GET /api/inspector/listings/{id}` | `InspectorController#getListing` | `InspectorServiceImpl#getListing` |
| Duyệt | `PUT /api/inspector/listings/{id}/approve` | `InspectorController#approve` | `InspectorServiceImpl#approve` |
| Từ chối (có lý do) | `PUT /api/inspector/listings/{id}/reject` | `InspectorController#reject` | `InspectorServiceImpl#reject` |
| Yêu cầu cập nhật | `PUT /api/inspector/listings/{id}/need-update` | `InspectorController#needUpdate` | `InspectorServiceImpl#needUpdate` |

**Role:** **INSPECTOR** hoặc ADMIN.

---

## 6. Admin — quản trị

| Màn / thao tác | API | Controller → method | Service |
|----------------|-----|----------------------|---------|
| Thống kê tổng quan | `GET /api/admin/dashboard/stats` | `AdminController#stats` | `AdminServiceImpl#getStats` |
| Danh sách user | `GET /api/admin/users` | `AdminController#users` | `AdminServiceImpl#listUsers` |
| Ẩn user | `PUT /api/admin/users/{id}/hide` | `AdminController#hideUser` | `AdminServiceImpl#hideUser` |
| Bỏ ẩn user | `PUT /api/admin/users/{id}/unhide` | `AdminController#unhideUser` | `AdminServiceImpl#unhideUser` |
| Đơn chờ xử lý kho | `GET /api/admin/orders/warehouse-pending` | `AdminController#listWarehousePending` | `AdminServiceImpl#listWarehousePending` |
| Xác nhận kho (order) | `PUT /api/admin/orders/{id}/confirm-warehouse` | `AdminController#confirmWarehouse` | `AdminServiceImpl#confirmWarehouse` |
| Đơn / hàng chờ tái kiểm định | `GET /api/admin/orders/re-inspection` | `AdminController#listReInspection` | `AdminServiceImpl#listReInspectionOrders` |
| Đánh dấu tái kiểm định xong | `PUT /api/admin/orders/{id}/re-inspection-done` | `AdminController#reInspectionDone` | `AdminServiceImpl#markReInspectionDone` |
| Tin chờ nhập kho | `GET /api/admin/listings/pending-warehouse-intake` | `AdminController#pendingWarehouseIntake` | `AdminServiceImpl#listWarehouseIntakePending` |
| Xác nhận nhập kho | `PUT /api/admin/listings/{id}/confirm-warehouse-intake` | `AdminController#confirmWarehouseIntake` | `AdminServiceImpl#confirmWarehouseIntake` |
| Xác nhận sau tái kiểm tại kho (body action/reason) | `PUT /api/admin/listings/{id}/confirm-warehouse-re-inspection` | `AdminController#confirmWarehouseReInspection` | `AdminServiceImpl#confirmWarehouseReInspection` |
| Danh sách toàn bộ tin (admin) | `GET /api/admin/listings` | `AdminController#listings` | `AdminServiceImpl#listListings` |
| Ẩn / hiện tin | `PUT /api/admin/listings/{id}/hide`, `.../unhide` | `AdminController#hideListing`, `unhideListing` | `AdminServiceImpl` |
| Danh sách review + duyệt/sửa | `GET /api/admin/reviews`, `PUT /api/admin/reviews/{id}` | `AdminController#reviews`, `updateReview` | `AdminServiceImpl` |
| Quản lý gói seller | `GET /api/admin/seller-subscriptions` | `AdminController#sellerSubscriptions` | `AdminServiceImpl#listSellerSubscriptions` |
| Thu hồi gói seller | `PUT /api/admin/users/{id}/revoke-subscription` | `AdminController#revokeSubscription` | `AdminServiceImpl#revokeSellerSubscription` |
| CRUD brand (admin) | `GET/POST/PUT/DELETE /api/admin/brands` | `AdminController` + `BrandService` | `BrandServiceImpl` (admin methods) |

**Role:** **ADMIN**; một số endpoint cho thêm **INSPECTOR** (xem annotation trên `AdminController`).

---

## 7. Thanh toán VNPAY — không qua `/api` (quan trọng khi GV hỏi)

Sau khi FE redirect user sang VNPAY, cổng thanh toán **gọi lại backend** vào các URL **public** (không Bearer):

| Sự kiện | API | File |
|---------|-----|------|
| VNPAY redirect trình duyệt về sau thanh toán | `GET /payment/vnpay-return` | `PaymentController#vnpayReturn` → `processTxnRef` → `markDepositPaid` / `markBalancePaid` / `markPackagePaid` |
| IPN (server-to-server, nếu cấu hình) | `GET /payment/vnpay-ipn` | `PaymentController#vnpayIpn` |
| Tạo lại URL thanh toán đơn hàng (POST body JSON) | `POST /payment/create` | `PaymentController#create` + `VnpayUrlService` |
| GET `/payment/create` | Trả 405 + hướng dẫn dùng POST | `PaymentController#createGetNotAllowed` |

**Sau thanh toán:** `302` redirect về `app.frontend-base-url` (ví dụ `/finalize/...`, `/seller/packages?...`). Logic cập nhật `orders` / `package_orders` nằm trong **`PaymentController`** (private methods), không phải `BuyerServiceImpl`.

---

## 8. Gợi ý trả lời giảng viên (một câu)

- **“Bấm nút X trên web thì backend xử lý ở đâu?”**  
  → Tìm **tên API** (DevTools Network hoặc Swagger) → mở **Controller** tương ứng → method đó gọi **ServiceImpl** (trừ `/payment` xử lý trong `PaymentController`).

- **“Tại sao có `PaymentController` riêng?”**  
  → VNPAY redirect không gửi JWT; route `/payment/**` được `SecurityConfig` mở `permitAll`; xử lý `markDepositPaid` sau khi đã có `ORDER_id` trong `txnRef`.

---

## 9. File `*ServiceImpl` tương ứng từng vai

| Vai | File chính |
|-----|------------|
| Auth | `service/impl/AuthServiceImpl.java` |
| Xe / marketplace | `BikeServiceImpl.java` |
| Brand | `BrandServiceImpl.java` |
| Gói (catalog) | `PackageServiceImpl.java` |
| Buyer | `BuyerServiceImpl.java` |
| Seller | `SellerServiceImpl.java` |
| Inspector | `InspectorServiceImpl.java` |
| Admin | `AdminServiceImpl.java` |

---

*Tài liệu liên quan: [HOI-DONG-LUONG-VA-CODE-GUIDE.md](HOI-DONG-LUONG-VA-CODE-GUIDE.md), [BACKEND-HOC-TU-DAU-DEN-CUOI.md](BACKEND-HOC-TU-DAU-DEN-CUOI.md).*
