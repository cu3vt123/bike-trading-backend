## ERD cho MySQL – Dự án ShopBike

Tài liệu này mô tả **Entity–Relationship Diagram (ERD) dạng quan hệ (MySQL/Postgres)** cho domain ShopBike, dựa trên schema MongoDB hiện tại (`docs/ERD-SPEC.md`) và phần ERD tham chiếu SQL đã có trước đó.

Mục tiêu:

- Giúp BE hoặc AI khác thiết kế database quan hệ tương thích với FE.
- Làm cầu nối giữa Mongo schema (User, Listing, Order, Review, Brand) và các bảng SQL.

---

## 1. Khuyến nghị triển khai

### 1.1 Nên chọn phương án nào?

Tài liệu này có **2 mức thiết kế**:

- **Starter schema (khuyến nghị cho v1):** ít bảng, dễ code nhanh, bám sát implementation Mongo hiện tại.
- **Normalized schema (đầy đủ):** tách nhiều bảng hơn (`BIKE`, `POST`, `MEDIA`, `PAYMENT`, `SHIPMENT`, `INSPECTION_REPORT`) để dễ mở rộng về sau.

**Khuyến nghị thực tế cho team MySQL:**

- Nếu mục tiêu là **làm backend chạy sớm cho FE**: dùng **Starter schema** trước.
- Nếu mục tiêu là **thiết kế production-ready hoặc mở rộng nghiệp vụ sâu**: dùng **Normalized schema**.

### 1.2 Starter schema đề xuất cho v1

Đây là bộ bảng tối giản nhưng đủ chạy hầu hết flow hiện tại:

1. `USER`
2. `BRAND`
3. `LISTING`
4. `ORDER`
5. `REVIEW`
6. `LISTING_MEDIA` (khuyên dùng, nhưng có thể trì hoãn nếu chỉ cần 1 ảnh chính)

### 1.3 Vì sao nên bắt đầu bằng Starter schema?

- Gần với Mongo hiện tại nhất: `Listing`, `Order`, `Review`, `Brand`.
- Ít join hơn, nhanh triển khai API cho FE.
- Dễ thêm dần `PAYMENT`, `SHIPMENT`, `INSPECTION_REPORT` sau mà không phá flow chính.

### 1.4 Starter schema gợi ý

#### USER

- Dùng như phần chi tiết ở dưới.

#### BRAND

- Dùng như phần chi tiết ở dưới.

#### LISTING

Gộp `BIKE + POST` thành một bảng duy nhất cho giai đoạn đầu.

| Cột                     | Kiểu           | Ghi chú |
|-------------------------|----------------|--------|
| listing_id              | BIGINT PK      | AUTO_INCREMENT |
| seller_id               | BIGINT FK      | FK → USER.user_id |
| brand_id                | BIGINT FK      | FK → BRAND.brand_id |
| title                   | VARCHAR(255)   | NOT NULL |
| model                   | VARCHAR(255)   | NULL |
| year                    | INT NULL       | |
| frame_size              | VARCHAR(64)    | |
| `condition`             | ENUM           | `NEW`, `LIKE_NEW`, `MINT_USED`, `GOOD_USED`, `FAIR_USED` |
| price                   | DECIMAL(15,2)  | NOT NULL |
| currency                | VARCHAR(3)     | default `VND` |
| location                | VARCHAR(255)   | |
| description             | TEXT           | |
| state                   | ENUM           | `DRAFT`, `PENDING_INSPECTION`, `NEED_UPDATE`, `PUBLISHED`, `RESERVED`, `IN_TRANSACTION`, `SOLD`, `REJECTED` |
| inspection_result       | ENUM           | `APPROVE`, `REJECT`, `NEED_UPDATE`, NULL |
| inspection_score        | DECIMAL(2,1)   | NULL |
| inspection_summary      | TEXT           | |
| need_update_reason      | TEXT           | |
| thumbnail_url           | VARCHAR(1024)  | |
| is_hidden               | TINYINT(1)     | default 0 |
| hidden_at               | DATETIME NULL  | |
| created_at              | DATETIME       | |
| updated_at              | DATETIME       | |

#### LISTING_MEDIA

| Cột        | Kiểu           | Ghi chú |
|------------|----------------|--------|
| media_id   | BIGINT PK      | AUTO_INCREMENT |
| listing_id | BIGINT FK      | FK → LISTING.listing_id |
| url        | VARCHAR(1024)  | |
| sort_order | INT            | default 0 |
| created_at | DATETIME       | |

#### ORDER

| Cột                    | Kiểu           | Ghi chú |
|------------------------|----------------|--------|
| order_id               | BIGINT PK      | AUTO_INCREMENT |
| buyer_id               | BIGINT FK      | FK → USER.user_id |
| listing_id             | BIGINT FK      | FK → LISTING.listing_id |
| status                 | ENUM           | theo flow hiện tại |
| plan                   | ENUM           | `DEPOSIT`, `FULL` |
| total_price            | DECIMAL(15,2)  | NOT NULL |
| deposit_amount         | DECIMAL(15,2)  | mặc định tính theo 8% |
| deposit_paid           | TINYINT(1)     | default 0 |
| shipping_address       | TEXT           | có thể tách cột sau |
| shipped_at             | DATETIME NULL  | |
| warehouse_confirmed_at | DATETIME NULL  | |
| reinspection_done_at   | DATETIME NULL  | |
| expires_at             | DATETIME NULL  | |
| created_at             | DATETIME       | |
| updated_at             | DATETIME       | |

#### REVIEW

| Cột        | Kiểu           | Ghi chú |
|------------|----------------|--------|
| review_id  | BIGINT PK      | AUTO_INCREMENT |
| order_id   | BIGINT FK      | FK → ORDER.order_id |
| listing_id | BIGINT FK      | FK → LISTING.listing_id |
| seller_id  | BIGINT FK      | FK → USER.user_id |
| buyer_id   | BIGINT FK      | FK → USER.user_id |
| rating     | INT            | 1..5 |
| comment    | TEXT           | |
| status     | ENUM           | `PENDING`, `APPROVED`, `EDITED`, `HIDDEN` |
| created_at | DATETIME       | |
| updated_at | DATETIME       | |

### 1.5 Khi nào tách thêm bảng?

Chỉ nên tách thêm khi thật sự cần:

- Tách `PAYMENT` nếu cần lưu nhiều giao dịch / callback / hoàn tiền chi tiết.
- Tách `SHIPMENT` nếu cần tracking logistics riêng.
- Tách `INSPECTION_REPORT` nếu cần lịch sử nhiều lần kiểm định.
- Tách `BIKE` khỏi `LISTING` nếu một xe có thể được đăng lại nhiều lần hoặc quản lý như tài sản độc lập.

---

## 2. Danh sách bảng chính (Normalized schema)

### 1.1 USER

- Lưu toàn bộ người dùng; phân biệt role bằng cột `role`.

| Cột              | Kiểu           | Ghi chú                                         |
|------------------|----------------|------------------------------------------------|
| user_id          | BIGINT PK      | AUTO_INCREMENT                                 |
| email            | VARCHAR(255)   | UNIQUE, NOT NULL                               |
| password_hash    | VARCHAR(255)   | NOT NULL                                       |
| role             | ENUM           | `BUYER`, `SELLER`, `INSPECTOR`, `ADMIN`       |
| display_name     | VARCHAR(255)   | NOT NULL                                       |
| is_hidden        | TINYINT(1)     | 0/1 – user bị ẩn không đăng nhập được         |
| hidden_at        | DATETIME NULL  |                                                |
| reset_token      | VARCHAR(255)   | NULL                                           |
| reset_expires_at | DATETIME NULL  |                                               |
| created_at       | DATETIME       |                                               |
| updated_at       | DATETIME       |                                               |

Quan hệ:

- 1 USER (role=SELLER) ─< nhiều LISTING/POST.
- 1 USER (role=BUYER) ─< nhiều ORDER.
- 1 USER ─< nhiều REVIEW (với vai trò buyer hoặc seller).

---

### 1.2 BRAND

| Cột       | Kiểu           | Ghi chú                      |
|-----------|----------------|------------------------------|
| brand_id  | BIGINT PK      | AUTO_INCREMENT               |
| name      | VARCHAR(255)   | UNIQUE, NOT NULL             |
| slug      | VARCHAR(255)   | INDEX                        |
| active    | TINYINT(1)     | default 1                    |
| created_at| DATETIME       |                              |
| updated_at| DATETIME       |                              |

Quan hệ:

- 1 BRAND ─< nhiều BIKE/LISTING (một brand có thể gắn với nhiều xe).

---

### 1.3 BIKE (tương ứng Listing “vật lý”)

Bạn có thể tách **BIKE** (tài sản vật lý) khỏi **POST/LISTING** (tin đăng), hoặc gộp chúng lại. Dưới đây là bản tách rời, linh hoạt hơn.

| Cột          | Kiểu           | Ghi chú                                            |
|--------------|----------------|----------------------------------------------------|
| bike_id      | BIGINT PK      | AUTO_INCREMENT                                     |
| brand_id     | BIGINT FK      | FK → BRAND.brand_id                                |
| model        | VARCHAR(255)   |                                                    |
| year         | INT NULL       |                                                    |
| frame_size   | VARCHAR(64)    |                                                    |
| condition    | ENUM           | `NEW`, `LIKE_NEW`, `MINT_USED`, `GOOD_USED`, `FAIR_USED` |
| description  | TEXT           |                                                    |
| status       | ENUM           | Ví dụ: `ACTIVE`, `INACTIVE`                        |
| created_at   | DATETIME       |                                                    |
| updated_at   | DATETIME       |                                                    |

Quan hệ:

- 1 BRAND ─< nhiều BIKE.
- 1 BIKE ─< nhiều POST.
- 1 BIKE ─< nhiều INSPECTION_REPORT.
- 1 BIKE ─< nhiều ORDER.

---

### 1.4 POST (Listing / Tin đăng)

| Cột           | Kiểu           | Ghi chú                                                      |
|---------------|----------------|--------------------------------------------------------------|
| post_id       | BIGINT PK      | AUTO_INCREMENT                                               |
| bike_id       | BIGINT FK      | FK → BIKE.bike_id                                            |
| seller_id     | BIGINT FK      | FK → USER.user_id (role=SELLER)                             |
| title         | VARCHAR(255)   | NOT NULL                                                     |
| price         | DECIMAL(15,2)  | NOT NULL                                                     |
| currency      | VARCHAR(3)     | `VND`/`USD` – default `VND`                                  |
| state         | ENUM           | `DRAFT`, `PENDING_INSPECTION`, `NEED_UPDATE`, `PUBLISHED`, `RESERVED`, `IN_TRANSACTION`, `SOLD`, `REJECTED` |
| inspection_result | ENUM       | `APPROVE`, `REJECT`, `NEED_UPDATE`, NULL                     |
| inspection_score  | DECIMAL(2,1)| NULL                                                        |
| inspection_summary| TEXT       |                                                              |
| need_update_reason| TEXT       |                                                              |
| location      | VARCHAR(255)   |                                                              |
| is_hidden     | TINYINT(1)     | default 0                                                   |
| hidden_at     | DATETIME NULL  |                                                              |
| created_at    | DATETIME       |                                                              |
| updated_at    | DATETIME       |                                                              |

Quan hệ:

- 1 USER (SELLER) ─< nhiều POST.
- 1 BIKE ─< nhiều POST.
- 1 POST ─< nhiều MEDIA.
- 1 POST ─< nhiều ORDER.
- 1 POST ─< nhiều REVIEW.

---

### 1.5 MEDIA (ảnh/video của tin)

| Cột        | Kiểu           | Ghi chú                            |
|------------|----------------|------------------------------------|
| media_id   | BIGINT PK      | AUTO_INCREMENT                     |
| post_id    | BIGINT FK      | FK → POST.post_id                 |
| url        | VARCHAR(1024)  |                                    |
| media_type | ENUM           | `IMAGE`, `VIDEO`                   |
| created_at | DATETIME       |                                    |

---

### 1.6 INSPECTION_REPORT

| Cột             | Kiểu           | Ghi chú                                      |
|-----------------|----------------|----------------------------------------------|
| report_id       | BIGINT PK      | AUTO_INCREMENT                               |
| bike_id         | BIGINT FK      | FK → BIKE.bike_id                            |
| inspector_id    | BIGINT FK      | FK → USER.user_id (role=INSPECTOR)          |
| result          | ENUM           | `APPROVE`, `REJECT`, `NEED_UPDATE`           |
| score           | DECIMAL(2,1)   | 0..5                                         |
| summary         | TEXT           |                                              |
| created_at      | DATETIME       | ngày kiểm định                              |
| updated_at      | DATETIME       |                                              |

Listing/Post có thể lưu **bản snapshot** từ báo cáo gần nhất; ERD SQL giữ lịch sử trong bảng này.

---

### 1.7 ORDER

| Cột           | Kiểu           | Ghi chú                                                         |
|---------------|----------------|-----------------------------------------------------------------|
| order_id      | BIGINT PK      | AUTO_INCREMENT                                                 |
| buyer_id      | BIGINT FK      | FK → USER.user_id (role=BUYER)                                 |
| post_id       | BIGINT FK      | FK → POST.post_id                                              |
| status        | ENUM           | `PENDING`, `RESERVED`, `PENDING_SELLER_SHIP`, `SELLER_SHIPPED`, `AT_WAREHOUSE_PENDING_ADMIN`, `RE_INSPECTION`, `RE_INSPECTION_DONE`, `SHIPPING`, `IN_TRANSACTION`, `COMPLETED`, `CANCELLED`, `REFUNDED` |
| plan          | ENUM           | `DEPOSIT`, `FULL` (default `DEPOSIT`)                          |
| total_price   | DECIMAL(15,2)  | NOT NULL                                                       |
| deposit_amount| DECIMAL(15,2)  | **8%** total hoặc giá trị cấu hình                             |
| deposit_paid  | TINYINT(1)     | default 0                                                      |
| shipping_address | TEXT        | hoặc tách các cột street/city/postal_code                      |
| shipped_at    | DATETIME NULL  |                                                                 |
| warehouse_confirmed_at | DATETIME NULL |                                                          |
| reinspection_done_at   | DATETIME NULL |                                                          |
| expires_at    | DATETIME NULL  | deadline giữ chỗ                                               |
| created_at    | DATETIME       |                                                                 |
| updated_at    | DATETIME       |                                                                 |

Quan hệ:

- 1 BUYER ─< nhiều ORDER.
- 1 POST ─< nhiều ORDER.
- 1 ORDER ─ 0..1 PAYMENT.
- 1 ORDER ─ 0..1 SHIPMENT.
- 1 ORDER ─ 0..1 REVIEW (tuỳ nghiệp vụ, có thể cho 1–N).

---

### 1.8 PAYMENT

| Cột           | Kiểu           | Ghi chú                                 |
|---------------|----------------|-----------------------------------------|
| payment_id    | BIGINT PK      | AUTO_INCREMENT                          |
| order_id      | BIGINT FK      | FK → ORDER.order_id                     |
| amount        | DECIMAL(15,2)  |                                         |
| payment_method| VARCHAR(32)    | `CARD`, `BANK_TRANSFER`, ...            |
| status        | ENUM           | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| created_at    | DATETIME       |                                         |

---

### 1.9 SHIPMENT

| Cột              | Kiểu           | Ghi chú                          |
|------------------|----------------|----------------------------------|
| shipment_id      | BIGINT PK      | AUTO_INCREMENT                   |
| order_id         | BIGINT FK      | FK → ORDER.order_id             |
| receiver_name    | VARCHAR(255)   |                                  |
| receiver_phone   | VARCHAR(32)    |                                  |
| shipping_address | TEXT           |                                  |
| shipping_method  | VARCHAR(64)    |                                  |
| shipping_fee     | DECIMAL(15,2)  |                                  |
| shipping_status  | VARCHAR(32)    | ví dụ: `PENDING`, `SHIPPING`, `DELIVERED` |
| tracking_number  | VARCHAR(64)    |                                  |
| carrier_name     | VARCHAR(64)    |                                  |
| created_at       | DATETIME       |                                  |
| updated_at       | DATETIME       |                                  |

---

### 1.10 REVIEW

| Cột        | Kiểu           | Ghi chú                                      |
|------------|----------------|----------------------------------------------|
| review_id  | BIGINT PK      | AUTO_INCREMENT                               |
| order_id   | BIGINT FK      | FK → ORDER.order_id                          |
| post_id    | BIGINT FK      | FK → POST.post_id                            |
| seller_id  | BIGINT FK      | FK → USER.user_id (role=SELLER)             |
| buyer_id   | BIGINT FK      | FK → USER.user_id (role=BUYER)              |
| rating     | INT            | 1..5                                        |
| comment    | TEXT           |                                             |
| status     | ENUM           | `PENDING`, `APPROVED`, `EDITED`, `HIDDEN`    |
| created_at | DATETIME       |                                             |
| updated_at | DATETIME       |                                             |

Backend có thể tổng hợp rating seller bằng truy vấn:

```sql
SELECT
  seller_id,
  AVG(rating)      AS average_rating,
  COUNT(*)         AS total_reviews,
  SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS positive_count
FROM REVIEW
WHERE status <> 'HIDDEN'
GROUP BY seller_id;
```

Tương đương với logic đang dùng cho endpoint `GET /seller/ratings`.

---

## 3. Quan hệ chính (tóm tắt)

- **USER (SELLER)** 1─N **POST**  
- **USER (BUYER)** 1─N **ORDER**  
- **BRAND** 1─N **BIKE**  
- **BIKE** 1─N **POST**  
- **POST** 1─N **MEDIA**  
- **BIKE** 1─N **INSPECTION_REPORT**  
- **POST** 1─N **ORDER**  
- **ORDER** 1─1 (hoặc 1─N) **PAYMENT**  
- **ORDER** 1─1 (hoặc 1─N) **SHIPMENT**  
- **ORDER** 1─1 (hoặc 1─N) **REVIEW**  
- **USER (SELLER)** 1─N **REVIEW** (qua seller_id)  
- **USER (BUYER)** 1─N **REVIEW** (qua buyer_id)

---

## 4. Mapping MongoDB ↔ MySQL (nhanh)

- `User` (Mongo) ↔ `USER` (SQL).
- `Listing` (Mongo) ↔ **BIKE + POST + MEDIA + INSPECTION_REPORT** (SQL), tuỳ mức độ chuẩn hoá.
- `Order` (Mongo) ↔ `ORDER` (+ `PAYMENT`, `SHIPMENT`) (SQL).
- `Review` (Mongo) ↔ `REVIEW` (SQL).
- `Brand` (Mongo) ↔ `BRAND` (hoặc `BRAND_CATEGORY`) (SQL).

Khi cần vẽ ERD cho MySQL, chỉ cần:

1. Dùng danh sách bảng và cột ở mục 1.
2. Kẻ các cạnh quan hệ theo mục 2 (1–N, N–1).
3. Tham chiếu thêm `docs/ERD-SPEC.md` nếu muốn so sánh với implementation MongoDB hiện tại.

