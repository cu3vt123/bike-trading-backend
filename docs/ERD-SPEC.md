# Đặc tả ERD – Dự án ShopBike (Sàn giao dịch xe đạp)

**Mục đích file:** Gửi file này cho chat/AI khác để vẽ **Entity-Relationship Diagram (ERD)** chính xác cho toàn bộ dự án. Backend dùng **MongoDB (Mongoose)**; mọi quan hệ đều qua ObjectId (ref).

---

## 1. Tổng quan dự án

- **Tên:** ShopBike – sàn mua bán xe đạp đã qua kiểm định.
- **Luồng chính:** Buyer đặt mua → Seller gửi xe tới kho → Admin xác nhận xe tới kho → Inspector kiểm định lại → Đơn chuyển "Đang giao hàng" → Buyer xác nhận hoàn thành.
- **Vai trò User:** BUYER, SELLER, INSPECTOR, ADMIN (một user một role).
- **Lưu ý:** Không có bảng/collection riêng cho Payment; Order lưu deposit/total. Errors.js là class lỗi, không phải entity DB.

---

## 2. Các entity (collection / bảng)

Có **4 entity** chính: **User**, **Listing**, **Order**, **Review**.

---

### 2.1. User

| Thuộc tính       | Kiểu    | Ràng buộc / Ghi chú                          |
|------------------|---------|----------------------------------------------|
| _id              | ObjectId| PK, tự sinh                                  |
| email            | String  | required, unique, index                      |
| passwordHash     | String  | required                                     |
| role             | String  | required, enum: BUYER, SELLER, INSPECTOR, ADMIN |
| displayName      | String  | default ""                                   |
| resetPasswordToken   | String | default null                              |
| resetPasswordExpiresAt | Date  | default null                              |
| createdAt        | Date    | timestamps                                   |
| updatedAt        | Date    | timestamps                                   |

**Quan hệ:**
- Một User có thể là chủ nhiều **Listing** (qua Listing.seller.id).
- Một User (buyer) có nhiều **Order** (Order.buyerId).
- Một User có thể có nhiều **Review** với tư cách sellerId hoặc buyerId.

---

### 2.2. Listing

Tin đăng xe (sản phẩm). Thuộc về một User (seller).

| Thuộc tính              | Kiểu    | Ràng buộc / Ghi chú |
|-------------------------|---------|---------------------|
| _id                     | ObjectId| PK                  |
| title                   | String  | required             |
| brand                   | String  | required             |
| model                   | String  | default ""           |
| year                    | Number  | default null         |
| frameSize               | String  | default ""           |
| condition               | String  | enum: NEW, LIKE_NEW, MINT_USED, GOOD_USED, FAIR_USED, null |
| price                   | Number  | required             |
| msrp                    | Number  | default null         |
| currency                | String  | enum: USD, VND, default USD |
| location                | String  | default ""           |
| thumbnailUrl            | String  | default ""           |
| imageUrls               | [String]| default []           |
| state                   | String  | required, enum: DRAFT, PENDING_INSPECTION, NEED_UPDATE, PUBLISHED, RESERVED, IN_TRANSACTION, SOLD, REJECTED. Default DRAFT |
| inspectionResult        | String  | enum: APPROVE, REJECT, NEED_UPDATE, null |
| inspectionScore         | Number  | default null (0..5)  |
| inspectionSummary       | String  | default ""           |
| inspectionNeedUpdateReason | String | default ""        |
| specs                   | Array   | default []           |
| description             | String  | default ""           |
| **seller**              | **Embedded** | **Object (không phải ref)** |
| seller.id               | ObjectId| ref "User", required – **FK tới User** |
| seller.name             | String  | default ""           |
| seller.email            | String  | default ""           |
| createdAt               | Date    | timestamps           |
| updatedAt               | Date    | timestamps           |

**Quan hệ:**
- **N:1 với User** qua `seller.id` (listing thuộc một seller).
- Một Listing có thể có nhiều **Order** (Order.listingId).
- Một Listing có thể có nhiều **Review** (Review.listingId).

---

### 2.3. Order

Đơn hàng. Buyer mua một Listing.

| Thuộc tính          | Kiểu    | Ràng buộc / Ghi chú |
|---------------------|---------|---------------------|
| _id                 | ObjectId| PK                  |
| buyerId             | ObjectId| ref "User", required – **FK User** |
| listingId           | ObjectId| ref "Listing", required – **FK Listing** |
| status              | String  | required, enum: PENDING, RESERVED, PENDING_SELLER_SHIP, SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN, RE_INSPECTION, RE_INSPECTION_DONE, SHIPPING, IN_TRANSACTION, COMPLETED, CANCELLED, REFUNDED. Default RESERVED |
| plan                | String  | enum: DEPOSIT, FULL, default DEPOSIT |
| totalPrice          | Number  | required             |
| depositAmount       | Number  | default 0            |
| depositPaid         | Boolean | default false        |
| shippingAddress     | Object  |                     |
| shippingAddress.street  | String | default ""       |
| shippingAddress.city   | String | default ""       |
| shippingAddress.postalCode | String | default ""   |
| shippedAt           | Date    | default null         |
| warehouseConfirmedAt | Date   | default null         |
| reInspectionDoneAt  | Date    | default null         |
| expiresAt           | Date    | default null         |
| listing             | Mixed   | **Snapshot (embed)** – bản copy thông tin listing tại thời điểm tạo đơn, không phải FK |
| createdAt           | Date    | timestamps           |
| updatedAt           | Date    | timestamps           |

**Quan hệ:**
- **N:1 với User** qua `buyerId` (mỗi order thuộc một buyer).
- **N:1 với Listing** qua `listingId` (mỗi order là mua một listing). Seller của đơn suy ra từ Listing.seller.
- Một Order có tối đa một **Review** (Review.orderId).

---

### 2.4. Review

Đánh giá sau khi mua (buyer đánh giá đơn/listing).

| Thuộc tính  | Kiểu    | Ràng buộc / Ghi chú |
|-------------|---------|---------------------|
| _id         | ObjectId| PK                  |
| orderId     | ObjectId| ref "Order", required – **FK Order** |
| listingId   | ObjectId| ref "Listing", required – **FK Listing** |
| sellerId    | ObjectId| ref "User", required – **FK User** |
| buyerId     | ObjectId| ref "User", required – **FK User** |
| rating      | Number  | required, min 1, max 5 |
| comment     | String  | default ""           |
| status      | String  | enum: PENDING, APPROVED, EDITED, HIDDEN, default PENDING |
| createdAt   | Date    | timestamps           |
| updatedAt   | Date    | timestamps           |

**Quan hệ:**
- **N:1 với Order** qua `orderId` (một review cho một đơn).
- **N:1 với Listing** qua `listingId`.
- **N:1 với User** qua `sellerId` (user là seller của listing được đánh giá).
- **N:1 với User** qua `buyerId` (user là buyer viết đánh giá).

---

## 3. Sơ đồ quan hệ (mô tả cho vẽ ERD)

- **User** ──< **Listing** (1–N: một user có nhiều listing; Listing.seller.id → User._id).
- **User** ──< **Order** (1–N: một user (buyer) có nhiều order; Order.buyerId → User._id).
- **Listing** ──< **Order** (1–N: một listing có thể có nhiều order; Order.listingId → Listing._id).
- **Order** ──< **Review** (1–1 hoặc 1–N tùy nghiệp vụ: một đơn có thể có một review; Review.orderId → Order._id).
- **Listing** ──< **Review** (1–N: một listing có nhiều review; Review.listingId → Listing._id).
- **User** ──< **Review** (1–N) với tư cách **seller** (Review.sellerId → User._id).
- **User** ──< **Review** (1–N) với tư cách **buyer** (Review.buyerId → User._id).

**Lưu ý khi vẽ:**
- Listing có **embedded object** `seller` (seller.id là FK tới User), không phải bảng trung gian.
- Order có **embedded object** `listing` (snapshot), nhưng **FK thật** là `listingId` → Listing.
- Mọi FK đều là ObjectId, ref trong Mongoose tương ứng bảng/collection đích.

---

## 4. Enum / giá trị cố định

- **User.role:** BUYER, SELLER, INSPECTOR, ADMIN  
- **Listing.state:** DRAFT, PENDING_INSPECTION, NEED_UPDATE, PUBLISHED, RESERVED, IN_TRANSACTION, SOLD, REJECTED  
- **Listing.condition:** NEW, LIKE_NEW, MINT_USED, GOOD_USED, FAIR_USED  
- **Listing.inspectionResult:** APPROVE, REJECT, NEED_UPDATE  
- **Order.status:** PENDING, RESERVED, PENDING_SELLER_SHIP, SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN, RE_INSPECTION, RE_INSPECTION_DONE, SHIPPING, IN_TRANSACTION, COMPLETED, CANCELLED, REFUNDED  
- **Review.status:** PENDING, APPROVED, EDITED, HIDDEN  

---

## 5. Yêu cầu khi vẽ ERD

1. Vẽ đủ **4 entity:** User, Listing, Order, Review.
2. Ghi rõ **PK** ( _id / id ) và **FK** (buyerId, listingId, orderId, sellerId, buyerId, Listing.seller.id).
3. Ghi **cardinality** (1–N, N–1) trên mỗi cạnh quan hệ.
4. Có thể ghi **enum** chính (role, state, status) bên cạnh entity hoặc trong ghi chú.
5. Phân biệt **embedded** (Listing.seller, Order.listing snapshot) với **quan hệ ref/FK**.
6. Ngôn ngữ: có thể dùng tiếng Anh (tên bảng/trường) hoặc kèm chú thích tiếng Việt (ví dụ: User = Người dùng, Listing = Tin đăng, Order = Đơn hàng, Review = Đánh giá).

---

## 6. Cấu trúc thư mục backend (tham khảo)

```
backend/src/
  models/
    User.js
    Listing.js
    Order.js
    Review.js
    Errors.js   ← không phải entity DB
```

File này mô tả đầy đủ để một chat/AI khác đọc và vẽ ERD chính xác cho toàn dự án ShopBike.
