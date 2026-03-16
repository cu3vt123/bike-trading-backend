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

Có **5 entity** chính: **User**, **Listing**, **Order**, **Review**, **Brand**.

Entity **Brand** lưu danh sách thương hiệu xe (name/slug/active). Listing vẫn chỉ lưu tên brand dạng string để schema gọn, nhưng FE/BE dùng collection Brand để sinh dropdown brand cho seller và cho Admin CRUD brands.

---

### 2.1. User

| Thuộc tính       | Kiểu    | Ràng buộc / Ghi chú                          |
|------------------|---------|----------------------------------------------|
| _id              | ObjectId| PK, tự sinh                                  |
| email            | String  | required, unique, index                      |
| passwordHash     | String  | required                                     |
| role             | String  | required, enum: BUYER, SELLER, INSPECTOR, ADMIN |
| displayName      | String  | default ""                                   |
| isHidden          | Boolean| default false, index – user bị ẩn không đăng nhập được |
| hiddenAt          | Date   | default null                              |
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
| currency                | String  | enum: USD, VND, **default VND** |
| location                | String  | default ""           |
| thumbnailUrl            | String  | default ""           |
| imageUrls               | [String]| default []           |
| state                   | String  | required, enum: DRAFT, PENDING_INSPECTION, NEED_UPDATE, PUBLISHED, RESERVED, IN_TRANSACTION, SOLD, REJECTED. Default DRAFT |
| inspectionResult        | String  | enum: APPROVE, REJECT, NEED_UPDATE, null |
| inspectionScore         | Number  | default null (0..5)  |
| inspectionReport        | Object  | báo cáo chi tiết: frameIntegrity, drivetrainHealth, brakingSystem (mỗi mục có score + label) |
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
- Các Review của một seller được backend tổng hợp (average, breakdown, positivePercent) khi trả về endpoint `GET /seller/ratings`.

---

### 2.5. Brand

Lưu danh sách thương hiệu xe đạp, dùng cho seller form và Admin Dashboard.

| Thuộc tính  | Kiểu    | Ràng buộc / Ghi chú |
|-------------|---------|---------------------|
| _id         | ObjectId| PK                  |
| name        | String  | required, unique, trim |
| slug        | String  | default \"\", trim    |
| active      | Boolean | default true, index |
| createdAt   | Date    | timestamps          |
| updatedAt   | Date    | timestamps          |

**Quan hệ & sử dụng:**

- Không FK trực tiếp từ Listing (Listing.brand là string), nhưng:
  - FE gọi `GET /api/brands` để render dropdown brand (seller form, filters).
  - Admin gọi `/api/admin/brands` để CRUD.
- Khi port sang SQL có thể map Brand → bảng `BRAND_CATEGORY` hoặc bảng `BRAND` riêng.

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

### 4.1 Enum chính trong MongoDB

- **User.role:** BUYER, SELLER, INSPECTOR, ADMIN  
- **Listing.state:** DRAFT, PENDING_INSPECTION, NEED_UPDATE, PUBLISHED, RESERVED, IN_TRANSACTION, SOLD, REJECTED  
- **Listing.condition:** NEW, LIKE_NEW, MINT_USED, GOOD_USED, FAIR_USED  
- **Listing.inspectionResult:** APPROVE, REJECT, NEED_UPDATE  
- **Order.status:** PENDING, RESERVED, PENDING_SELLER_SHIP, SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN, RE_INSPECTION, RE_INSPECTION_DONE, SHIPPING, IN_TRANSACTION, COMPLETED, CANCELLED, REFUNDED  
-- **Review.status:** PENDING, APPROVED, EDITED, HIDDEN  

### 4.2 Gợi ý mapping Brand/Listing khi chuyển sang SQL

- **Brand** (Mongo) có thể map sang bảng `BRAND` hoặc `BRAND_CATEGORY` trong ERD SQL.
- **Listing.brand** (string) có thể map thành FK tới bảng BRAND trong thiết kế SQL nếu muốn chuẩn hoá mạnh hơn.

---

## 5. Yêu cầu khi vẽ ERD

1. Vẽ đủ **4 entity:** User, Listing, Order, Review.
2. Ghi rõ **PK** ( _id / id ) và **FK** (buyerId, listingId, orderId, sellerId, buyerId, Listing.seller.id).
3. Ghi **cardinality** (1–N, N–1) trên mỗi cạnh quan hệ.
4. Có thể ghi **enum** chính (role, state, status) bên cạnh entity hoặc trong ghi chú.
5. Phân biệt **embedded** (Listing.seller, Order.listing snapshot) với **quan hệ ref/FK**.
6. Ngôn ngữ: có thể dùng tiếng Anh (tên bảng/trường) hoặc kèm chú thích tiếng Việt (ví dụ: User = Người dùng, Listing = Tin đăng, Order = Đơn hàng, Review = Đánh giá).

---

## 6. ERD tham khảo dạng quan hệ (SQL)

> Phần này tham khảo từ bản vẽ ERD dạng **bảng quan hệ** (SQL) với nhiều bảng nhỏ (SELLER, BUYER, BIKE, POST, ORDER, PAYMENT, SHIPMENT, REVIEW...).  
> Dùng để đội BE (hoặc AI) thiết kế database quan hệ (MySQL/Postgres) tương thích với domain ShopBike.

### 6.1 Danh sách bảng (relational)

**SELLER**

| Cột         | Kiểu   | Ghi chú          |
|-------------|--------|------------------|
| seller_id   | string | PK               |
| name        | string |                  |
| status      | string | trạng thái       |
| contact_info| int    | thông tin liên hệ|

**INSPECTOR**

| Cột          | Kiểu   | Ghi chú    |
|--------------|--------|------------|
| inspector_id | string | PK         |
| name         | string |            |
| contact_info | int    |            |
| status       | string |            |

**BUYER**

| Cột       | Kiểu   | Ghi chú    |
|-----------|--------|------------|
| buyer_id  | string | PK         |
| name      | string |            |
| contact_info | int |            |
| status    | string |            |

**BIKE**

| Cột        | Kiểu   | Ghi chú                         |
|------------|--------|---------------------------------|
| bike_id    | string | PK                              |
| brand_cate_id | string | FK → BRAND_CATEGORY.brand_cate_id |
| description| string | mô tả xe                        |
| year       | int    | năm sản xuất                    |
| condition  | string | tình trạng (NEW/USED/...)       |
| status     | string | trạng thái                      |

**BRAND_CATEGORY**

| Cột          | Kiểu   | Ghi chú        |
|--------------|--------|----------------|
| brand_cate_id| string | PK             |
| brand_name   | string | tên hãng       |
| category_name| string | loại xe (road/mtb/...) |
| status       | string |                |

**MEDIA**

| Cột      | Kiểu   | Ghi chú                        |
|----------|--------|--------------------------------|
| media_id | string | PK                             |
| bike_id  | string | FK → BIKE.bike_id             |
| media_type | string | loại (IMAGE/VIDEO/...)      |
| status   | string |                                |

**POST** (tin đăng, gắn với BIKE + SELLER)

| Cột        | Kiểu   | Ghi chú                          |
|------------|--------|----------------------------------|
| post_id    | string | PK                               |
| bike_id    | string | FK → BIKE.bike_id               |
| seller_id  | string | FK → SELLER.seller_id           |
| title      | string | tiêu đề tin                      |
| price      | float  | giá                              |
| create_date| date   | ngày tạo                         |
| description| string | mô tả                            |
| status     | string | trạng thái (DRAFT/PUBLISHED/...)|

**INSPECTION_REPORT**

| Cột           | Kiểu   | Ghi chú                                  |
|---------------|--------|------------------------------------------|
| report_id     | string | PK                                       |
| inspector_id  | string | FK → INSPECTOR.inspector_id             |
| bike_id       | string | FK → BIKE.bike_id                       |
| inspection_date | date | ngày kiểm định                          |
| result        | string | kết quả (APPROVE/REJECT/NEED_UPDATE/...)|
| note          | string | ghi chú                                 |
| status        | string | trạng thái báo cáo                      |

**ORDER**

| Cột       | Kiểu   | Ghi chú                          |
|-----------|--------|----------------------------------|
| order_id  | string | PK                               |
| buyer_id  | string | FK → BUYER.buyer_id             |
| bike_id   | string | FK → BIKE.bike_id               |
| order_date| date   | ngày đặt hàng                   |
| status    | string | trạng thái đơn (PENDING/SHIPPING/...) |

**PAYMENT**

| Cột          | Kiểu   | Ghi chú                               |
|--------------|--------|---------------------------------------|
| payment_id   | string | PK                                    |
| order_id     | string | FK → ORDER.order_id                   |
| amount       | float  | số tiền                               |
| payment_date | date   | ngày thanh toán                       |
| payment_method | string | phương thức (CARD/BANK/...)        |
| payment_status | string | trạng thái (PAID/FAILED/REFUNDED...)|
| status       | string | cờ trạng thái chung                   |

**SHIPMENT**

| Cột            | Kiểu   | Ghi chú                               |
|----------------|--------|---------------------------------------|
| shipment_id    | string | PK                                    |
| order_id       | string | FK → ORDER.order_id                   |
| receiver_name  | string | tên người nhận                        |
| receiver_phone | int    | điện thoại người nhận                 |
| shipping_address | string | địa chỉ giao hàng                   |
| shipping_method | string | phương thức ship                      |
| shipping_fee   | int    | phí ship                              |
| shipping_date  | date   | ngày gửi                              |
| shipping_status| string | trạng thái giao hàng                  |
| tracking_number| string | mã vận đơn                            |
| carrier_name   | string | đơn vị vận chuyển                     |
| delivered_date | string | ngày giao thành công                  |
| note           | string | ghi chú                               |

**REVIEW**

| Cột        | Kiểu   | Ghi chú                    |
|------------|--------|----------------------------|
| review_id  | string | PK                         |
| order_id   | string | FK → ORDER.order_id        |
| rating     | int    | điểm đánh giá              |
| comment    | string | nhận xét                    |
| review_date| date   | ngày review                |
| status     | string | trạng thái                 |

### 6.2 Quan hệ chính (relational)

- **SELLER** 1─N **POST** (một seller có nhiều tin đăng).  
- **BIKE** 1─N **POST** (một xe có thể được đăng nhiều tin – tuỳ nghiệp vụ).  
- **BIKE** 1─N **MEDIA** (một xe có nhiều media).  
- **BIKE** 1─N **INSPECTION_REPORT** (nhiều lần kiểm định).  
- **INSPECTOR** 1─N **INSPECTION_REPORT**.  
- **BUYER** 1─N **ORDER**.  
- **BIKE** 1─N **ORDER**.  
- **ORDER** 1─1 **PAYMENT** (hoặc 1–N nếu cho phép nhiều giao dịch).  
- **ORDER** 1─1 **SHIPMENT** (hoặc 1–N nếu nhiều lần giao).  
- **ORDER** 1─N **REVIEW** (thực tế thường 1 đơn 1 review).  
- **BRAND_CATEGORY** 1─N **BIKE**.

> Ghi chú: Đây là ERD **tham khảo** dạng SQL để mapping sang thiết kế quan hệ.  
> Implementation thực tế trong dự án hiện tại đang dùng MongoDB với 4 collection chính (User, Listing, Order, Review) như mô tả ở các mục trên.

---

## 7. Bảng đối chiếu MongoDB ↔ SQL (để vẽ ERD)

Bảng này giúp map giữa **schema MongoDB hiện tại** và **ERD SQL tham khảo** ở mục 6, để bạn (hoặc AI khác) vẽ một sơ đồ tổng hợp, hoặc thiết kế DB quan hệ dựa trên domain Mongo.

### 7.1 User / Seller / Buyer / Inspector

| MongoDB collection.field | SQL table.column | Ghi chú |
|--------------------------|------------------|--------|
| `User._id`               | `SELLER.seller_id` / `BUYER.buyer_id` / `INSPECTOR.inspector_id` | Trong Mongo tất cả user nằm chung 1 collection với `role`; trong SQL có thể tách 3 bảng hoặc 1 bảng `USER` + cột role. |
| `User.displayName`       | `SELLER.name` / `BUYER.name` / `INSPECTOR.name` | Tên hiển thị. |
| `User.role`              | (BUYER/SELLER/INSPECTOR/ADMIN) | Dùng để quyết định map sang bảng nào. |
| `User.isHidden`          | `status` (ví dụ ACTIVE/HIDDEN) | SQL có thể dùng `status` để ẩn user. |
| `User.email`, `passwordHash` | (trong bảng USER chung) | Không xuất hiện trong sơ đồ SQL nhưng cần cho auth. |

Khi vẽ ERD quan hệ, bạn có thể:
- Vẽ **một bảng USER** (gần giống Mongo) với cột `role`, rồi vẽ bảng logic SELLER/BUYER/INSPECTOR như **view** hoặc chỉ ghi chú.  
- Hoặc theo hình tham khảo: vẽ riêng SELLER/BUYER/INSPECTOR và ghi chú “tương ứng user.role = ...”.

### 7.2 Listing / Bike / Post / Media / Brand / InspectionReport

| MongoDB collection.field | SQL table.column | Ghi chú |
|--------------------------|------------------|--------|
| `Listing._id`           | `BIKE.bike_id`   | Một listing tương ứng với một bike trong ERD SQL. |
| `Listing.brand`, `model`| `BRAND_CATEGORY.brand_name`, `category_name` | SQL tách brand/category ra bảng riêng. |
| `Listing.year`          | `BIKE.year`      | |
| `Listing.condition`     | `BIKE.condition` | Enum tình trạng. |
| `Listing.state`         | `POST.status`    | Trạng thái tin (DRAFT/PUBLISHED/...). |
| `Listing.price`         | `POST.price`     | Giá niêm yết trong tin đăng. |
| `Listing.description`   | `POST.description` | Mô tả tin. |
| `Listing.seller.id`     | `POST.seller_id` (FK → SELLER) | Trong Mongo seller embed; SQL dùng FK. |
| `Listing.imageUrls`     | `MEDIA` (nhiều dòng cho 1 bike_id) | Mỗi URL trong Mongo tương ứng 1 bản ghi MEDIA. |
| `Listing.inspectionReport` + `inspectionScore` | `INSPECTION_REPORT` (nhiều record theo `bike_id`) | SQL lưu từng lần kiểm định; Mongo hiện lưu báo cáo cuối trên Listing. |

Khi vẽ ERD:
- Ở Mongo: **User ─< Listing** qua `Listing.seller.id`.  
- Ở SQL: **SELLER ─< POST ─> BIKE**, MEDlA/INSPECTION_REPORT nối với BIKE.

### 7.3 Order / Payment / Shipment / Review

| MongoDB collection.field | SQL table.column | Ghi chú |
|--------------------------|------------------|--------|
| `Order._id`             | `ORDER.order_id` | PK đơn hàng. |
| `Order.buyerId`         | `ORDER.buyer_id` | FK đến BUYER. |
| `Order.listingId`       | `ORDER.bike_id`  | Trong SQL đơn thường trỏ trực tiếp đến `BIKE`. |
| `Order.totalPrice`      | `PAYMENT.amount` | Có thể map 1–1 cho thanh toán thành công đầu tiên. |
| `Order.status`          | `ORDER.status`   | Enum trạng thái nâng cao hơn (bao gồm shipping / re-inspection...). |
| `Order.shippingAddress.*` | `SHIPMENT.shipping_address`, `receiver_name`, `receiver_phone` | SQL tách thông tin ship riêng. |
| `Order.shippedAt`, `Order.expiresAt` | `SHIPMENT.shipping_date`, `delivered_date` (hoặc field bổ sung) | Tuỳ cách chuẩn hoá. |
| `Review._id`            | `REVIEW.review_id` | |
| `Review.orderId`        | `REVIEW.order_id`  | |
| `Review.rating`, `comment`, `createdAt` | `REVIEW.rating`, `comment`, `review_date` | |

- Ở Mongo: Payment & Shipment chỉ là **trạng thái trong Order** (status, deposit, v.v.).  
- Ở SQL: có thể chuẩn hoá mạnh hơn với bảng `PAYMENT` và `SHIPMENT` riêng, nhưng vẫn **FK về ORDER** giống ERD tham khảo.

### 7.4 Cách vẽ ERD tổng hợp

Khi vẽ một ERD “tổng hợp” cho dự án:

1. Vẽ **4 entity Mongo chính** (User, Listing, Order, Review) với PK/FK đúng như mục 2–3.  
2. Nếu muốn chi tiết quan hệ kiểu SQL:
   - Bên cạnh `Listing`, có thể annotate hoặc vẽ thêm các bảng con: BIKE, POST, MEDIA, BRAND_CATEGORY, INSPECTION_REPORT (chung một cluster “Listing/Bike domain”).  
   - Bên cạnh `Order`, vẽ PAYMENT, SHIPMENT, REVIEW (cluster “Order domain”).  
3. Ghi chú rõ:
   - “Trong implementation Mongo: các bảng con này được embed hoặc gom vào 4 collection chính.”  
   - “Trong thiết kế SQL: dùng bảng riêng theo ERD mục 6.”

Nhờ vậy, người xem chỉ cần đọc **duy nhất file MD này** là có thể:
- Vẽ ERD đúng với MongoDB hiện tại.  
- Hoặc chuyển sang ERD SQL giống hình bạn gửi mà vẫn giữ đúng domain.

---

## 8. Cấu trúc thư mục backend (tham khảo)

```
backend/src/
  models/
    User.js
    Listing.js
    Order.js
    Review.js
    Errors.js   ← không phải entity DB
```

File này mô tả đầy đủ để một chat/AI khác đọc và vẽ ERD chính xác cho toàn dự án ShopBike (MongoDB) **và** có thêm ERD tham khảo dạng SQL để team BE thiết kế database quan hệ.
