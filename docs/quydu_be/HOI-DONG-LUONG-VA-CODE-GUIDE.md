# Hướng dẫn hội đồng: luồng nghiệp vụ ↔ code backend (`quydu_be`)

Tài liệu giúp bạn khi **giảng viên chỉ trên web** bạn **thao tác**, hỏi **luồng chạy trong backend thế nào**, rồi bắt **mở IntelliJ chỉ đúng file/hàm**.

**Base URL API:** `http://localhost:8081/api` (trừ thanh toán VNPAY: `/payment/...` **không** có prefix `/api`).  
**Swagger:** `http://localhost:8081/swagger-ui/index.html` — có thể demo nhanh endpoint.

**Cách đọc nhanh một luồng trong code (IntelliJ):**

1. Mở `controller/<Tên>Controller.java` → tìm method có `@GetMapping` / `@PostMapping`… trùng path.
2. Trong method, xem gọi `xxxService.method(...)` → **Ctrl+B** (Go to Declaration) vào **interface** → **Ctrl+Alt+B** (Implementations) chọn `*ServiceImpl`.
3. Trong `*ServiceImpl`, đọc từng bước: validate → `repository.save` / `findById` → entity đổi `state`/`status`.

---

## 0. Sơ đồ chung (nói 1 câu trước hội đồng)

```
HTTP Request → @RestController → *Service (interface) → *ServiceImpl (nghiệp vụ) → *Repository (JPA) → Entity → MySQL
```

**Bảo mật:** Hầu hết API cần header `Authorization: Bearer <JWT>`. JWT được xử lý ở `security/JwtAuthenticationFilter.java`, rule role ở `@PreAuthorize` trên controller và `config/SecurityConfig.java`.

---

## 1. Auth — đăng ký, đăng nhập, “tài khoản tôi”

| Trên web (gợi ý) | API backend | Luồng xử lý (trả lời miệng) | Mở IntelliJ — chỉ đâu |
|------------------|-------------|-----------------------------|------------------------|
| Form đăng ký | `POST /api/auth/signup` | Nhận email/password, hash mật khẩu, lưu `users`, có thể trả token tùy cấu hình | `controller/AuthController.java` → `signup` → `service/impl/AuthServiceImpl.java` |
| Đăng nhập | `POST /api/auth/login` | Kiểm tra credential, sinh JWT access + refresh | `AuthController` → `AuthServiceImpl#login` |
| Làm mới token | `POST /api/auth/refresh` | Đổi refresh → access mới | `AuthController` → `AuthServiceImpl` |
| Trang “hồ sơ / me” | `GET /api/auth/me` | Đọc `userId` từ JWT, load user, seller có thêm tóm tắt gói | `AuthController` → `AuthServiceImpl#me` |

**Entity liên quan:** `entity/User.java`, `repository/UserRepository.java`.

---

## 2. Marketplace — khách xem danh sách / chi tiết xe (không cần đăng nhập)

| Trên web | API | Luồng | Code |
|----------|-----|-------|------|
| Trang chủ / danh sách xe | `GET /api/bikes` | Lọc tin `PUBLISHED`, không ẩn, chưa hết hạn | `controller/BikeController.java` → `service/impl/BikeServiceImpl.java` |
| Chi tiết xe | `GET /api/bikes/{id}` | Load một `Listing` | Cùng `BikeController` → `BikeServiceImpl` |
| Thương hiệu (nếu có) | `GET /api/brands` | Catalog brands | `controller/BrandController.java` |
| Bảng gói (catalog) | `GET /api/packages` | JSON mô tả gói (số slot mặc định) | `controller/PackageController.java` |

---

## 3. Seller — gói đăng tin (mua VIP/Basic)

| Trên web | API | Luồng | Code |
|----------|-----|-------|------|
| Màn “Gói đăng tin”, bấm thanh toán | `POST /api/seller/subscription/checkout` | Kiểm tra seller, tạo `package_orders`, build URL VNPAY; sandbox có thể gán gói luôn để test | `controller/SellerController.java` → `SellerServiceImpl#checkoutSubscription` |
| Sau khi quay lại từ VNPAY | `GET /payment/vnpay-return` | Parse `vnp_TxnRef` dạng `PACKAGE_*`, đánh dấu đã thanh toán, cập nhật `users.subscription_*` | `controller/PaymentController.java` (tìm xử lý `PACKAGE_`) → method private trong cùng class hoặc service được gọi |

**Entity:** `PackageOrder`, `User` (subscription).

---

## 4. Seller — tạo tin, sửa tin, đăng bài / gửi kiểm định

| Trên web | API | Luồng | Code |
|----------|-----|-------|------|
| Tạo tin nháp | `POST /api/seller/listings` | Kiểm tra **gói còn hạn** + **quota slot** (`countOccupyingPostingSlots`), tạo `Listing` `DRAFT` | `SellerController` → `SellerServiceImpl#createListing` |
| Sửa tin | `PUT /api/seller/listings/{id}` | Chỉ seller sở hữu tin | `SellerServiceImpl#updateListing` |
| Upload ảnh | `POST /api/seller/listings/upload-images` | Lưu file dưới `uploads/`, trả URL | `SellerServiceImpl#uploadImages` |
| Xuất bản (không / có kiểm định) | `PUT /api/seller/listings/{id}/publish` | Đổi `state`: `PUBLISHED` hoặc `PENDING_INSPECTION` (VIP + request) | `SellerServiceImpl#publishListing` |
| Gửi kiểm định (VIP) | `PUT /api/seller/listings/{id}/submit` | Đưa về `PENDING_INSPECTION` | `SellerServiceImpl#submitForInspection` |
| Dashboard seller | `GET /api/seller/dashboard` | Thống kê + danh sách tin | `SellerServiceImpl#dashboard` |

**Quota / slot:** `subscription/SubscriptionPostingQuota.java`, `repository/ListingRepository.java` (`countOccupyingPostingSlots`).

---

## 5. Inspector — duyệt / từ chối / yêu cầu cập nhật

| Trên web | API | Luồng | Code |
|----------|-----|-------|------|
| Hàng chờ kiểm định | `GET /api/inspector/pending-listings` | `listings` có `state = PENDING_INSPECTION` | `controller/InspectorController.java` → `InspectorServiceImpl#pendingListings` |
| Duyệt | `PUT /api/inspector/listings/{id}/approve` | Ghi điểm/báo cáo (nếu có), `state = AWAITING_WAREHOUSE` | `InspectorServiceImpl#approve` |
| Từ chối | `PUT /api/inspector/listings/{id}/reject` | Body JSON có `reason` → `REJECTED` | `InspectorServiceImpl#reject` |
| Cần cập nhật | `PUT /api/inspector/listings/{id}/need-update` | `NEED_UPDATE` + lý do | `InspectorServiceImpl#needUpdate` |

---

## 6. Seller — gửi xe vào kho (listing)

| Trên web | API | Luồng | Code |
|----------|-----|-------|------|
| Đánh dấu đã gửi kho | `PUT /api/seller/listings/{id}/mark-shipped-to-warehouse` | Từ `AWAITING_WAREHOUSE` → `AT_WAREHOUSE_PENDING_VERIFY` | `SellerServiceImpl#markListingShippedToWarehouse` |

---

## 7. Buyer — đặt chỗ / thanh toán VNPAY

| Trên web | API | Luồng | Code |
|----------|-----|-------|------|
| Checkout (tạo đơn + URL thanh toán) | `POST /api/buyer/orders/vnpay-checkout` | Kiểm tra listing bán được, tạo `Order` `RESERVED`, listing `RESERVED`, tính cọc/full, trả `paymentUrl` | `controller/BuyerController.java` → `BuyerServiceImpl#createOrderVnpayCheckout` (hoặc tên tương ứng trong file) |
| Tạo đơn chỉ JSON (legacy) | `POST /api/buyer/orders` | Thường báo dùng VNPAY checkout | `BuyerServiceImpl` |
| Trang giao dịch / transaction | `GET /api/buyer/orders/by-listing/{listingId}` hoặc `/transactions/{listingId}` | Lấy đơn theo listing | `BuyerServiceImpl#getOrderForListingTransaction` |

**Sau khi user trả tiền trên cổng VNPAY:**

| Sự kiện | API / entry | Luồng | Code |
|---------|-------------|-------|------|
| Trình duyệt redirect về BE | `GET /payment/vnpay-return` | `vnp_ResponseCode=00` → `processTxnRef` → cập nhật order/package | `PaymentController#vnpayReturn` → các method `markDepositPaid`, … |
| Tạo lại link thanh toán (nếu cần) | `POST /payment/create` | Body `orderId` → URL VNPAY | `PaymentController#create` |

**Cọc đã thanh toán:** trong `PaymentController` (private) `markDepositPaid` — với `WAREHOUSE` có thể chuyển `AT_WAREHOUSE_PENDING_ADMIN`, với `DIRECT` → `PENDING_SELLER_SHIP` (xem đúng phiên bản code).

**Dịch vụ ký URL:** `service/VnpayUrlService.java`.

---

## 8. Buyer — hủy đơn, nhận xe xong, đánh giá

| Trên web | API | Luồng | Code |
|----------|-----|-------|------|
| Hủy đặt chỗ | `PUT /api/buyer/orders/{id}/cancel` | Kiểm tra trạng thái được phép; giới hạn hủy 3 lần / 7 ngày (nếu đã triển khai); `listing` về `PUBLISHED` | `BuyerServiceImpl#cancelOrder` |
| Hoàn tất nhận xe | `PUT /api/buyer/orders/{id}/complete` | `SHIPPING` → `COMPLETED`, listing `SOLD` | `BuyerServiceImpl#completeOrder` |
| Đánh giá | `POST /api/buyer/orders/{id}/review` | Tạo `Review` | `BuyerServiceImpl#createReviewForOrder` |

---

## 9. Seller — xử lý đơn (giao trực tiếp / qua kho)

| Trên web | API | Luồng | Code |
|----------|-----|-------|------|
| Danh sách đơn của seller | `GET /api/seller/orders` | Orders có listing thuộc seller | `SellerServiceImpl#listOrders` |
| Giao thẳng cho buyer | `PUT /api/seller/orders/{orderId}/ship-to-buyer` | `DIRECT`, đổi `SHIPPING` | `SellerServiceImpl#shipToBuyer` |
| Gửi kho (đơn) | `PUT /api/seller/orders/{orderId}/ship-to-warehouse` | `WAREHOUSE` | `SellerServiceImpl#shipToWarehouse` |

---

## 10. Admin — kho, user, thống kê, brand

| Trên web | API (ví dụ) | Luồng | Code |
|----------|-------------|-------|------|
| Thống kê | `GET /api/admin/dashboard/stats` | Đếm user, listing, order, … | `controller/AdminController.java` → `AdminServiceImpl#getStats` |
| Đơn chờ kho | `GET /api/admin/orders/warehouse-pending` | Hàng chờ xác nhận | `AdminServiceImpl` |
| Xác nhận kho (order) | `PUT /api/admin/orders/{id}/confirm-warehouse` | Chuyển trạng thái đơn | `AdminServiceImpl#confirmWarehouse` |
| Tin chờ nhập kho | `GET /api/admin/listings/pending-warehouse-intake` | Listing ở bước kho | `AdminServiceImpl#listWarehouseIntakePending` |
| Xác nhận nhập kho / tái kiểm | `PUT .../confirm-warehouse-intake`, `.../confirm-warehouse-re-inspection` | Đổi `ListingState`, có thể `PUBLISHED` + `CERTIFIED` | `AdminServiceImpl` |
| Ẩn user | `PUT /api/admin/users/{id}/hide` | `users.is_hidden` | `AdminServiceImpl#hideUser` |
| CRUD brand | `GET/POST/PUT/DELETE /api/admin/brands` | Bảng `brands` | `AdminController` + `BrandService` |

---

## 11. Bảng tra nhanh: Controller → ServiceImpl

| Controller | ServiceImpl chính |
|------------|---------------------|
| `AuthController` | `AuthServiceImpl` |
| `BikeController` | `BikeServiceImpl` |
| `SellerController` | `SellerServiceImpl` |
| `BuyerController` | `BuyerServiceImpl` |
| `InspectorController` | `InspectorServiceImpl` |
| `AdminController` | `AdminServiceImpl` |
| `PaymentController` | Logic trong controller + repository; URL VNPAY `VnpayUrlService` |
| `PackageController` | `PackageServiceImpl` (nếu có) |

**Cách tìy nhanh trong IntelliJ:** **Ctrl+Shift+N** → gõ `BuyerServiceImpl` → Enter. Hoặc từ `BuyerController` click vào `buyerService.create...` → **Ctrl+Alt+B**.

---

## 12. Câu hỏi phụ giảng viên hay hỏi — gợi ý trả lời + chỗ xem code

| Câu hỏi | Trả lời ngắn | File nên mở |
|---------|--------------|-------------|
| JWT kiểm tra ở đâu? | Filter trước khi vào controller, gắn `SecurityContext` | `security/JwtAuthenticationFilter.java`, `security/JwtTokenProvider.java` |
| 403 Forbidden là vì gì? | Sai role (seller gọi API buyer) hoặc rule trong `PreAuthorize` / `SecurityConfig` | Controller tương ứng, `config/SecurityConfig.java` |
| Lỗi validate / exception trả JSON thế nào? | `GlobalExceptionHandler` | `exception/GlobalExceptionHandler.java` |
| Enum trạng thái tin/đơn ở đâu? | Java enum, lưu DB dạng chuỗi | `entity/ListingState.java`, `entity/OrderStatus.java` |
| Cấu hình DB, cổng, CORS? | `application.properties`, secret ở `application-local.properties` | `src/main/resources/...` |

---

## 13. Checklist trước khi vào phòng

- [ ] Biết đường dẫn project: `src/main/java/com/minhyun/quydu_be/`.
- [ ] Mở sẵn 3 file: `BuyerController`, `BuyerServiceImpl`, `PaymentController` (hoặc bookmark trong IDE).
- [ ] Chạy được BE cổng **8081**, FE **5173**, đăng nhập đúng role để demo.
- [ ] Swagger mở được để chỉ endpoint nếu GV không muốn màn hình web.

---

*Tài liệu bổ sung: [BACKEND-ARCHITECTURE-AND-FLOWS.md](BACKEND-ARCHITECTURE-AND-FLOWS.md), [DATABASE-RELATIONSHIPS-HOI-DONG.md](DATABASE-RELATIONSHIPS-HOI-DONG.md), [sql/ALL-FLOWS-BY-ROLE.sql](sql/ALL-FLOWS-BY-ROLE.sql).*
