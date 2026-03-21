# ERD – ShopBike (MongoDB + SQL)

Gộp nội dung từ ERD-SPEC và ERD-MYSQL. Dùng để vẽ ERD hoặc thiết kế DB (Mongo / MySQL-Postgres).

---

## Phần 1. MongoDB – entities (Mongoose)

**5 entity:** User, Listing, Order, Review, Brand.

### 1.1 User

| Thuộc tính | Kiểu | Ghi chú |
|------------|------|---------|
| _id | ObjectId | PK |
| email | String | required, unique |
| passwordHash | String | required |
| role | String | BUYER, SELLER, INSPECTOR, ADMIN |
| displayName | String | default "" |
| isHidden | Boolean | default false |
| createdAt, updatedAt | Date | timestamps |

### 1.2 Listing

| Thuộc tính | Kiểu | Ghi chú |
|------------|------|---------|
| _id | ObjectId | PK |
| title, brand, model, year, frameSize | String/Number | |
| condition | String | MINT_USED, GOOD_USED, ... |
| price | Number | required |
| state | String | DRAFT, PENDING_INSPECTION, NEED_UPDATE, PUBLISHED, RESERVED, IN_TRANSACTION, SOLD, REJECTED |
| inspectionResult | String | APPROVE, REJECT, NEED_UPDATE |
| seller | Embedded | { id, name, email } – seller.id ref User |
| imageUrls | [String] | |
| createdAt, updatedAt | Date | timestamps |

### 1.3 Order

| Thuộc tính | Kiểu | Ghi chú |
|------------|------|---------|
| _id | ObjectId | PK |
| buyerId | ObjectId | FK User |
| listingId | ObjectId | FK Listing |
| status | String | PENDING, RESERVED, ..., COMPLETED, CANCELLED, REFUNDED |
| totalPrice, depositAmount | Number | |
| shippingAddress | Object | |
| listing | Mixed | Snapshot (embed), không phải FK |
| createdAt, updatedAt | Date | timestamps |

### 1.4 Review

| Thuộc tính | Kiểu | Ghi chú |
|------------|------|---------|
| _id | ObjectId | PK |
| orderId, listingId | ObjectId | FK |
| sellerId, buyerId | ObjectId | FK User |
| rating | Number | 1–5 |
| status | String | PENDING, APPROVED, EDITED, HIDDEN |
| createdAt, updatedAt | Date | timestamps |

### 1.5 Brand

| Thuộc tính | Kiểu | Ghi chú |
|------------|------|---------|
| _id | ObjectId | PK |
| name | String | required, unique |
| slug | String | |
| active | Boolean | default true |

### 1.6 Quan hệ

- User ─< Listing (seller)
- User ─< Order (buyer)
- Listing ─< Order
- Order ─< Review
- Listing ─< Review
- User ─< Review (seller, buyer)

---

## Phần 2. SQL – Starter schema (khuyến nghị v1)

Bám sát Mongo: USER, BRAND, LISTING, ORDER, REVIEW, LISTING_MEDIA.

### USER

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| user_id | BIGINT PK | AUTO_INCREMENT |
| email | VARCHAR(255) | UNIQUE |
| password_hash | VARCHAR(255) | |
| role | ENUM | BUYER, SELLER, INSPECTOR, ADMIN |
| display_name | VARCHAR(255) | |
| is_hidden | TINYINT(1) | default 0 |
| created_at, updated_at | DATETIME | |

### BRAND

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| brand_id | BIGINT PK | |
| name | VARCHAR(255) | UNIQUE |
| slug | VARCHAR(255) | |
| active | TINYINT(1) | default 1 |

### LISTING

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| listing_id | BIGINT PK | |
| seller_id | BIGINT FK | → USER |
| brand_id | BIGINT FK | → BRAND |
| title | VARCHAR(255) | |
| model | VARCHAR(255) | |
| year | INT | |
| frame_size | VARCHAR(64) | |
| condition | ENUM | MINT_USED, ... |
| price | DECIMAL(15,2) | |
| state | ENUM | DRAFT, PENDING_INSPECTION, ..., SOLD, REJECTED |
| inspection_result | ENUM | APPROVE, REJECT, NEED_UPDATE |
| inspection_score | DECIMAL(2,1) | |
| thumbnail_url | VARCHAR(1024) | |
| created_at, updated_at | DATETIME | |

### ORDER

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| order_id | BIGINT PK | |
| buyer_id | BIGINT FK | → USER |
| listing_id | BIGINT FK | → LISTING |
| status | ENUM | PENDING, RESERVED, ..., COMPLETED, CANCELLED, REFUNDED |
| plan | ENUM | DEPOSIT, FULL |
| total_price | DECIMAL(15,2) | |
| deposit_amount | DECIMAL(15,2) | 8% mặc định |
| deposit_paid | TINYINT(1) | |
| shipping_address | TEXT | |
| shipped_at, warehouse_confirmed_at | DATETIME | |
| expires_at | DATETIME | |
| created_at, updated_at | DATETIME | |

### REVIEW

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| review_id | BIGINT PK | |
| order_id | BIGINT FK | → ORDER |
| listing_id | BIGINT FK | → LISTING |
| seller_id | BIGINT FK | → USER |
| buyer_id | BIGINT FK | → USER |
| rating | INT | 1–5 |
| comment | TEXT | |
| status | ENUM | PENDING, APPROVED, EDITED, HIDDEN |
| created_at, updated_at | DATETIME | |

### LISTING_MEDIA (tùy chọn)

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| media_id | BIGINT PK | |
| listing_id | BIGINT FK | → LISTING |
| url | VARCHAR(1024) | |
| sort_order | INT | |

---

## Phần 3. SQL – Normalized schema (tách BIKE, POST, MEDIA, PAYMENT, SHIPMENT)

Khi cần mở rộng: tách BIKE (tài sản vật lý), POST (tin đăng), MEDIA, INSPECTION_REPORT, PAYMENT, SHIPMENT.

### BIKE

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| bike_id | BIGINT PK | |
| brand_id | BIGINT FK | → BRAND |
| model, year, frame_size, condition | | |
| description | TEXT | |
| status | ENUM | ACTIVE, INACTIVE |

### POST

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| post_id | BIGINT PK | |
| bike_id | BIGINT FK | → BIKE |
| seller_id | BIGINT FK | → USER |
| title, price | | |
| state | ENUM | DRAFT, PENDING_INSPECTION, ..., SOLD, REJECTED |
| inspection_result, inspection_score | | |

### MEDIA

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| media_id | BIGINT PK | |
| post_id | BIGINT FK | → POST |
| url | VARCHAR(1024) | |
| media_type | ENUM | IMAGE, VIDEO |

### INSPECTION_REPORT

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| report_id | BIGINT PK | |
| bike_id | BIGINT FK | → BIKE |
| inspector_id | BIGINT FK | → USER |
| result | ENUM | APPROVE, REJECT, NEED_UPDATE |
| score | DECIMAL(2,1) | |

### PAYMENT

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| payment_id | BIGINT PK | |
| order_id | BIGINT FK | → ORDER |
| amount | DECIMAL(15,2) | |
| payment_method | VARCHAR(32) | |
| status | ENUM | PENDING, PAID, FAILED, REFUNDED |

### SHIPMENT

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| shipment_id | BIGINT PK | |
| order_id | BIGINT FK | → ORDER |
| receiver_name, receiver_phone | | |
| shipping_address, shipping_method | | |
| tracking_number | VARCHAR(64) | |
| shipping_status | VARCHAR(32) | |

---

## Phần 4. Mapping Mongo ↔ SQL

| Mongo | SQL (Starter) |
|-------|---------------|
| User | USER |
| Listing | LISTING (+ LISTING_MEDIA) |
| Order | ORDER |
| Review | REVIEW |
| Brand | BRAND |

---

## Phần 5. Cấu trúc backend (tham khảo)

```
backend/src/models/
  User.js
  Listing.js
  Order.js
  Review.js
  Brand.js
```
