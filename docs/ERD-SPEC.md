# Đặc tả Schema MySQL — ShopBike

> Tài liệu đặc tả đầy đủ 17 bảng database MySQL. Dùng làm nguồn tham chiếu khi vẽ ERD, viết JPA entities, hoặc sinh mã.

**Tra cứu nhanh:** [QUICK-REFERENCE.md](QUICK-REFERENCE.md) — thuật ngữ, vị trí file SQL.  
**File liên quan:** [ERD-MYSQL.md](ERD-MYSQL.md) | [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql)

### Cách dùng

1. **Tạo JPA entities:** Bảng → `@Entity`, cột theo bảng dưới, ENUM → `@Enumerated(EnumType.STRING)`.
2. **Vẽ ERD:** Tham chiếu "Thứ tự tạo bảng" và "Ma trận quan hệ".
3. **Migration:** Chạy `sql/shopbike_mysql_schema.sql` hoặc dùng Flyway/Liquibase.

---

## Quy ước chung

| Quy ước | Mô tả |
|---------|-------|
| PK | Primary Key, BIGINT UNSIGNED AUTO_INCREMENT |
| UK | Unique Key |
| FK | Foreign Key, tham chiếu bảng khác |
| NOT NULL | Bắt buộc có giá trị |
| DEFAULT | Giá trị mặc định |
| Charset | utf8mb4, collation utf8mb4_unicode_ci |
| Engine | InnoDB |

---

## Thứ tự tạo bảng (theo phụ thuộc FK)

```
1. user           (không phụ thuộc)
2. brand          (không phụ thuộc)
3. category       (self-FK parent_id)
4. subscription_plan (không phụ thuộc)
5. listing        → user, brand, category
6. listing_media  → listing
7. inspection_report → listing, user
8. order          → user, listing
9. order_snapshot → order, listing, user
10. shipment      → order
11. order_payment → order
12. review        → order, listing, user, user
13. package_order → user
14. user_payment_method → user
15. wishlist      → user, listing
16. notification  → user
17. vnpay_transaction_log (không FK)
```

---

## 1. user

**Mô tả:** Người dùng (Buyer, Seller, Inspector, Admin). Một user có thể đăng ký Buyer và Seller (role chính trong hệ thống).

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| user_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| email | VARCHAR(255) | NOT NULL, UK | Đăng nhập |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt/argon2 |
| role | ENUM | NOT NULL, DEFAULT 'BUYER' | BUYER, SELLER, INSPECTOR, ADMIN |
| display_name | VARCHAR(255) | NOT NULL, DEFAULT '' | |
| avatar_url | VARCHAR(1024) | NULL | |
| is_hidden | TINYINT(1) | NOT NULL, DEFAULT 0 | Admin ẩn tài khoản |
| subscription_plan | VARCHAR(32) | NULL | BASIC, VIP — chỉ seller |
| subscription_expires_at | DATETIME | NULL | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

**Index:** idx_user_role, idx_user_hidden

---

## 2. brand

**Mô tả:** Thương hiệu xe đạp (Trek, Giant, …). Admin CRUD.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| brand_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL, UK | |
| slug | VARCHAR(255) | NULL | URL-friendly |
| active | TINYINT(1) | NOT NULL, DEFAULT 1 | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 3. category

**Mô tả:** Danh mục xe (Road, Mountain, Hybrid). Cấu trúc cây (parent_id tự tham chiếu).

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| category_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(255) | NULL | |
| parent_id | BIGINT UNSIGNED | NULL, FK → category | Danh mục cha |
| sort_order | INT | NOT NULL, DEFAULT 0 | |
| active | TINYINT(1) | NOT NULL, DEFAULT 1 | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 4. listing

**Mô tả:** Tin đăng xe đạp. Luồng: DRAFT → PENDING_INSPECTION → PUBLISHED hoặc REJECTED. Xe CERTIFIED có thể qua kho (warehouse flow).

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| listing_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| seller_id | BIGINT UNSIGNED | NOT NULL, FK → user | |
| brand_id | BIGINT UNSIGNED | NOT NULL, FK → brand | |
| category_id | BIGINT UNSIGNED | NULL, FK → category | |
| title | VARCHAR(255) | NOT NULL | |
| model | VARCHAR(255) | NOT NULL, DEFAULT '' | |
| year | INT | NULL | |
| frame_size | VARCHAR(64) | NOT NULL, DEFAULT '' | |
| condition | ENUM | NULL | NEW, LIKE_NEW, MINT_USED, GOOD_USED, FAIR_USED |
| price | DECIMAL(15,2) | NOT NULL | |
| msrp | DECIMAL(15,2) | NULL | |
| currency | VARCHAR(8) | NOT NULL, DEFAULT 'VND' | VND, USD |
| location | VARCHAR(512) | NOT NULL, DEFAULT '' | |
| description | TEXT | NULL | |
| thumbnail_url | VARCHAR(1024) | NOT NULL, DEFAULT '' | |
| state | ENUM | NOT NULL, DEFAULT 'DRAFT' | DRAFT, PENDING_INSPECTION, AWAITING_WAREHOUSE, AT_WAREHOUSE_PENDING_VERIFY, AT_WAREHOUSE_PENDING_RE_INSPECTION, NEED_UPDATE, PUBLISHED, RESERVED, IN_TRANSACTION, SOLD, REJECTED |
| inspection_result | ENUM | NULL | APPROVE, REJECT, NEED_UPDATE |
| inspection_score | DECIMAL(2,1) | NULL | 0–5 |
| certification_status | ENUM | NOT NULL, DEFAULT 'UNVERIFIED' | UNVERIFIED, PENDING_CERTIFICATION, PENDING_WAREHOUSE, CERTIFIED |
| seller_shipped_to_warehouse_at | DATETIME | NULL | |
| warehouse_intake_verified_at | DATETIME | NULL | Admin xác nhận xe tại kho |
| published_at | DATETIME | NULL | |
| listing_expires_at | DATETIME | NULL | Hết hạn ẩn khỏi sàn |
| is_hidden | TINYINT(1) | NOT NULL, DEFAULT 0 | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 5. listing_media

**Mô tả:** Ảnh/video của tin đăng. Một listing có nhiều media.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| media_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| listing_id | BIGINT UNSIGNED | NOT NULL, FK → listing, ON DELETE CASCADE | |
| url | VARCHAR(1024) | NOT NULL | |
| media_type | ENUM | NOT NULL, DEFAULT 'IMAGE' | IMAGE, VIDEO |
| sort_order | INT | NOT NULL, DEFAULT 0 | |
| created_at | DATETIME(3) | NOT NULL | |

---

## 6. inspection_report

**Mô tả:** Báo cáo kiểm định xe. Một listing có tối đa một report. Inspector duyệt → APPROVE/REJECT/NEED_UPDATE.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| report_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| listing_id | BIGINT UNSIGNED | NOT NULL, UK, FK → listing, ON DELETE CASCADE | |
| inspector_id | BIGINT UNSIGNED | NOT NULL, FK → user | |
| result | ENUM | NOT NULL | APPROVE, REJECT, NEED_UPDATE |
| score | DECIMAL(2,1) | NULL | |
| summary | VARCHAR(1024) | NULL | |
| need_update_reason | TEXT | NULL | Khi result = NEED_UPDATE |
| frame_integrity_score | DECIMAL(2,1) | NULL | |
| drivetrain_health_score | DECIMAL(2,1) | NULL | |
| braking_system_score | DECIMAL(2,1) | NULL | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 7. order

**Mô tả:** Đơn mua xe. fulfillment_type: WAREHOUSE (xe qua kho) hoặc DIRECT (seller giao thẳng). plan: DEPOSIT (cọc 8% + số dư) hoặc FULL.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| order_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| buyer_id | BIGINT UNSIGNED | NOT NULL, FK → user | |
| listing_id | BIGINT UNSIGNED | NOT NULL, FK → listing | |
| status | ENUM | NOT NULL, DEFAULT 'RESERVED' | PENDING, RESERVED, PENDING_SELLER_SHIP, SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN, RE_INSPECTION, RE_INSPECTION_DONE, SHIPPING, IN_TRANSACTION, COMPLETED, CANCELLED, REFUNDED |
| plan | ENUM | NOT NULL, DEFAULT 'DEPOSIT' | DEPOSIT, FULL |
| fulfillment_type | ENUM | NOT NULL, DEFAULT 'WAREHOUSE' | WAREHOUSE, DIRECT |
| total_price | DECIMAL(15,2) | NOT NULL | |
| deposit_amount | DECIMAL(15,2) | NOT NULL, DEFAULT 0 | Thường 8% total |
| deposit_paid | TINYINT(1) | NOT NULL, DEFAULT 0 | Đã thanh toán cọc |
| balance_paid | TINYINT(1) | NOT NULL, DEFAULT 0 | Phần còn lại đã thanh toán VNPay (plan DEPOSIT) |
| vnpay_payment_status | VARCHAR(32) | NULL | PENDING_PAYMENT, PAID, FAILED |
| vnpay_amount_vnd | BIGINT | NULL | |
| shipped_at | DATETIME | NULL | |
| warehouse_confirmed_at | DATETIME | NULL | |
| re_inspection_done_at | DATETIME | NULL | |
| expires_at | DATETIME | NULL | Countdown 24h khi SHIPPING |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 8. order_snapshot

**Mô tả:** Snapshot tin đăng tại thời điểm mua. Dùng cho Finalize, Success (tin SOLD không còn GET /bikes). Chứa seller để form đánh giá.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| snapshot_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| order_id | BIGINT UNSIGNED | NOT NULL, UK, FK → order, ON DELETE CASCADE | |
| listing_id | BIGINT UNSIGNED | NOT NULL, FK → listing | Denormalized |
| title | VARCHAR(255) | NOT NULL | |
| brand | VARCHAR(255) | NOT NULL | |
| model | VARCHAR(255) | NOT NULL, DEFAULT '' | |
| year | INT | NULL | |
| frame_size | VARCHAR(64) | NOT NULL, DEFAULT '' | |
| condition | VARCHAR(32) | NULL | |
| price | DECIMAL(15,2) | NOT NULL | |
| currency | VARCHAR(8) | NOT NULL, DEFAULT 'VND' | |
| location | VARCHAR(512) | NOT NULL, DEFAULT '' | |
| thumbnail_url | VARCHAR(1024) | NOT NULL, DEFAULT '' | |
| image_urls | JSON | NULL | Mảng URL |
| seller_id | BIGINT UNSIGNED | NULL, FK → user | Cho review form |
| seller_json | JSON | NULL | {"id","name","email"} lúc mua |
| inspection_report | JSON | NULL | |
| created_at | DATETIME(3) | NOT NULL | |

---

## 9. shipment

**Mô tả:** Thông tin giao hàng. 1 order = 1 shipment.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| shipment_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| order_id | BIGINT UNSIGNED | NOT NULL, UK, FK → order, ON DELETE CASCADE | |
| receiver_name | VARCHAR(255) | NOT NULL, DEFAULT '' | |
| receiver_phone | VARCHAR(32) | NOT NULL, DEFAULT '' | |
| street | VARCHAR(512) | NOT NULL, DEFAULT '' | Địa chỉ đường |
| city | VARCHAR(255) | NOT NULL, DEFAULT '' | |
| postal_code | VARCHAR(32) | NOT NULL, DEFAULT '' | |
| tracking_number | VARCHAR(64) | NULL | |
| shipping_method | VARCHAR(64) | NULL | |
| status | VARCHAR(32) | NOT NULL, DEFAULT 'PENDING' | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 10. order_payment

**Mô tả:** Lịch sử thanh toán đơn. Một đơn có thể nhiều bản ghi (cọc + số dư).

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| payment_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| order_id | BIGINT UNSIGNED | NOT NULL, FK → order | |
| amount | DECIMAL(15,2) | NOT NULL | |
| provider | VARCHAR(32) | NOT NULL, DEFAULT 'VNPAY' | |
| payment_type | ENUM | NOT NULL, DEFAULT 'DEPOSIT' | DEPOSIT, BALANCE, FULL |
| txn_ref | VARCHAR(128) | NULL | Mã VNPay |
| status | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, PAID, FAILED, REFUNDED, EXPIRED |
| paid_at | DATETIME | NULL | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 11. review

**Mô tả:** Đánh giá sau giao dịch. 1 order = 1 review. Buyer đánh giá seller.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| review_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| order_id | BIGINT UNSIGNED | NOT NULL, UK, FK → order | |
| listing_id | BIGINT UNSIGNED | NOT NULL, FK → listing | |
| seller_id | BIGINT UNSIGNED | NOT NULL, FK → user | |
| buyer_id | BIGINT UNSIGNED | NOT NULL, FK → user | |
| rating | TINYINT UNSIGNED | NOT NULL | 1–5 |
| comment | TEXT | NULL | |
| status | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, APPROVED, EDITED, HIDDEN |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 12. subscription_plan

**Mô tả:** Catalog gói đăng tin (BASIC, VIP). Seller mua để đăng tin.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| plan_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| code | VARCHAR(32) | NOT NULL, UK | BASIC, VIP |
| name | VARCHAR(255) | NOT NULL | |
| amount_vnd | BIGINT | NOT NULL | |
| duration_days | INT | NOT NULL, DEFAULT 30 | |
| listing_slots | INT | NOT NULL, DEFAULT 3 | Số tin tối đa |
| allow_inspection | TINYINT(1) | NOT NULL, DEFAULT 0 | |
| active | TINYINT(1) | NOT NULL, DEFAULT 1 | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 13. package_order

**Mô tả:** Đơn mua gói đăng tin. Seller thanh toán qua VNPay.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| package_order_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| seller_id | BIGINT UNSIGNED | NOT NULL, FK → user | |
| plan | ENUM | NOT NULL | BASIC, VIP |
| provider | VARCHAR(32) | NOT NULL, DEFAULT 'VNPAY' | |
| amount_vnd | BIGINT | NOT NULL | |
| status | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, COMPLETED, FAILED |
| payment_url | VARCHAR(2048) | NULL | |
| completed_at | DATETIME | NULL | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 14. user_payment_method

**Mô tả:** Phương thức thanh toán của seller (chuyển khoản, thẻ).

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| method_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | NOT NULL, FK → user, ON DELETE CASCADE | |
| type | ENUM | NOT NULL | BANK_TRANSFER, VISA, MASTERCARD |
| bank_name | VARCHAR(255) | NULL | |
| account_number | VARCHAR(64) | NULL | |
| account_holder | VARCHAR(255) | NULL | |
| last_four | VARCHAR(4) | NULL | 4 số cuối thẻ |
| is_default | TINYINT(1) | NOT NULL, DEFAULT 0 | |
| created_at | DATETIME(3) | NOT NULL | |
| updated_at | DATETIME(3) | NOT NULL | |

---

## 15. wishlist

**Mô tả:** Danh sách yêu thích. User (buyer) + listing, UK (user_id, listing_id).

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| wishlist_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | NOT NULL, FK → user, ON DELETE CASCADE | |
| listing_id | BIGINT UNSIGNED | NOT NULL, FK → listing, ON DELETE CASCADE | |
| created_at | DATETIME(3) | NOT NULL | |

**UK:** (user_id, listing_id)

---

## 16. notification

**Mô tả:** Thông báo in-app. i18n: title_key, message_key.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| notification_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | NOT NULL, FK → user, ON DELETE CASCADE | |
| role | VARCHAR(32) | NOT NULL | BUYER, SELLER, ADMIN |
| title_key | VARCHAR(255) | NOT NULL | |
| message_key | VARCHAR(255) | NOT NULL | |
| message_params | JSON | NULL | |
| entity_type | VARCHAR(64) | NULL | order, listing |
| entity_id | VARCHAR(64) | NULL | |
| is_read | TINYINT(1) | NOT NULL, DEFAULT 0 | |
| created_at | DATETIME(3) | NOT NULL | |

---

## 17. vnpay_transaction_log

**Mô tả:** Log gọi VNPay (audit). Không FK.

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| log_id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| entity_type | VARCHAR(32) | NOT NULL | order, package_order |
| entity_id | VARCHAR(64) | NOT NULL | |
| action | VARCHAR(64) | NOT NULL | create_url, ipn, return |
| request_data | JSON | NULL | |
| response_data | JSON | NULL | |
| status | VARCHAR(32) | NULL | |
| created_at | DATETIME(3) | NOT NULL | |

---

## Ma trận quan hệ (FK)

| Bảng nguồn | Cột FK | Bảng đích |
|------------|--------|-----------|
| category | parent_id | category |
| listing | seller_id, brand_id, category_id | user, brand, category |
| listing_media | listing_id | listing |
| inspection_report | listing_id, inspector_id | listing, user |
| order | buyer_id, listing_id | user, listing |
| order_snapshot | order_id, listing_id, seller_id | order, listing, user |
| shipment | order_id | order |
| order_payment | order_id | order |
| review | order_id, listing_id, seller_id, buyer_id | order, listing, user |
| package_order | seller_id | user |
| user_payment_method | user_id | user |
| wishlist | user_id, listing_id | user, listing |
| notification | user_id | user |

---

## Luồng nghiệp vụ chính

| Luồng | Bảng liên quan |
|-------|----------------|
| Đăng ký / Đăng nhập | user |
| Seller đăng tin | user, brand, category, listing, listing_media |
| Inspector kiểm định | listing, inspection_report, user |
| Buyer mua xe | user, listing, order, order_snapshot, shipment, order_payment |
| Thanh toán VNPay | order, order_payment, vnpay_transaction_log |
| Giao hàng WAREHOUSE | order (status), listing (warehouse_intake_verified_at) |
| Đánh giá sau mua | order, review, order_snapshot (seller) |
| Seller mua gói | user, subscription_plan, package_order |
| Wishlist | user, listing, wishlist |
| Thông báo | user, notification |

---

## Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [ERD-MYSQL.md](ERD-MYSQL.md) | Thiết kế 17 bảng, ERD Mermaid, mapping MongoDB |
| [ERD-HUONG-DAN.md](ERD-HUONG-DAN.md) | Hướng dẫn vẽ ERD, tạo bảng MySQL |
| [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | Chuyển BE Node→Spring Boot — endpoint map, JPA entities, business rules |
| [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | CREATE TABLE đầy đủ |

---

*Đồng bộ với: docs/sql/shopbike_mysql_schema.sql, ERD-MYSQL.md. Cập nhật: 2026-03.*
