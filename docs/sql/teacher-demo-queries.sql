-- =============================================================================
-- ShopBike / quydu_be — Bộ truy vấn mẫu theo kịch bản vấn đáp database
-- Database: đổi USE … cho đúng (ví dụ quydu_db). MySQL 8+.
-- Enum lưu dạng chuỗi: role, state, status — viết HOA như trong DB.
-- =============================================================================

USE quydu_db;

-- -------------------------------------------------------------------------
-- A — Khám phá schema (GV: mô tả bảng, khóa, quan hệ)
-- -------------------------------------------------------------------------

SHOW TABLES;

DESCRIBE users;
DESCRIBE listings;
DESCRIBE orders;
DESCRIBE reviews;
DESCRIBE package_orders;
DESCRIBE listing_images;

SHOW CREATE TABLE orders;

SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- -------------------------------------------------------------------------
-- B — Ràng buộc & dữ liệu mẫu: liệt kê giá trị enum đang có trong DB
-- -------------------------------------------------------------------------

SELECT DISTINCT role FROM users ORDER BY role;
SELECT DISTINCT state FROM listings ORDER BY state;
SELECT DISTINCT status FROM orders ORDER BY status;
SELECT DISTINCT subscription_plan FROM users WHERE subscription_plan IS NOT NULL;

-- -------------------------------------------------------------------------
-- C1 — Đếm số tin đã xuất bản của mỗi seller
-- -------------------------------------------------------------------------

SELECT seller_id,
       COUNT(*) AS so_tin_published
FROM listings
WHERE state = 'PUBLISHED'
GROUP BY seller_id
ORDER BY so_tin_published DESC;

-- -------------------------------------------------------------------------
-- C2 — Đơn chưa kết thúc: tên xe + email buyer
-- -------------------------------------------------------------------------

SELECT o.id AS order_id,
       o.status,
       o.total_price,
       lst.title AS listing_title,
       buyer.email AS buyer_email,
       lst.seller_id
FROM orders o
JOIN listings lst ON lst.id = o.listing_id
JOIN users buyer ON buyer.id = o.buyer_id
WHERE o.status NOT IN ('COMPLETED', 'CANCELLED')
ORDER BY o.created_at DESC;

-- -------------------------------------------------------------------------
-- C3 — Seller có tổng giá trị đơn COMPLETED cao nhất
-- -------------------------------------------------------------------------

SELECT lst.seller_id,
       u.email AS seller_email,
       SUM(o.total_price) AS tong_doanh_thu_completed
FROM orders o
JOIN listings lst ON lst.id = o.listing_id
JOIN users u ON u.id = lst.seller_id
WHERE o.status = 'COMPLETED'
GROUP BY lst.seller_id, u.email
ORDER BY tong_doanh_thu_completed DESC
LIMIT 1;

-- (Tuỳ chọn) Top 5 seller theo tổng COMPLETED
-- SELECT lst.seller_id, u.display_name, SUM(o.total_price) AS revenue
-- FROM orders o JOIN listings lst ON lst.id = o.listing_id JOIN users u ON u.id = lst.seller_id
-- WHERE o.status = 'COMPLETED' GROUP BY lst.seller_id, u.display_name ORDER BY revenue DESC LIMIT 5;

-- -------------------------------------------------------------------------
-- C4 — “Slot” đăng tin đang chiếm (không ẩn, không REJECTED) — khớp backend
-- -------------------------------------------------------------------------

SELECT seller_id,
       COUNT(*) AS occupying_slots
FROM listings
WHERE is_hidden = 0
  AND state <> 'REJECTED'
GROUP BY seller_id
ORDER BY occupying_slots DESC;

-- So sánh với mọi tin không REJECTED (kể cả ẩn) — GV có thể hỏi vì sao khác “Tổng tin” cũ
SELECT seller_id,
       COUNT(*) AS non_rejected_all_visibility
FROM listings
WHERE state <> 'REJECTED'
GROUP BY seller_id;

-- -------------------------------------------------------------------------
-- C5 — Buyer hủy chủ động trong 7 ngày (buyer_cancelled_at)
-- -------------------------------------------------------------------------

SELECT buyer_id,
       COUNT(*) AS so_lan_huy_chu_dong_7_ngay
FROM orders
WHERE buyer_cancelled_at IS NOT NULL
  AND buyer_cancelled_at >= NOW() - INTERVAL 7 DAY
GROUP BY buyer_id
HAVING so_lan_huy_chu_dong_7_ngay > 0
ORDER BY so_lan_huy_chu_dong_7_ngay DESC;

-- Chi tiết từng lần hủy gần đây
SELECT o.id,
       o.buyer_id,
       u.email AS buyer_email,
       o.status,
       o.buyer_cancelled_at,
       lst.title AS listing_title
FROM orders o
JOIN users u ON u.id = o.buyer_id
JOIN listings lst ON lst.id = o.listing_id
WHERE o.buyer_cancelled_at IS NOT NULL
  AND o.buyer_cancelled_at >= NOW() - INTERVAL 7 DAY
ORDER BY o.buyer_cancelled_at DESC;

-- -------------------------------------------------------------------------
-- JOIN bổ sung theo kịch bản — Listing + Seller
-- -------------------------------------------------------------------------

SELECT l.id,
       l.title,
       l.state,
       l.price,
       u.id AS seller_id,
       u.email AS seller_email,
       u.display_name AS seller_name
FROM listings l
JOIN users u ON u.id = l.seller_id
WHERE l.is_hidden = 0
ORDER BY l.updated_at DESC
LIMIT 50;

-- Order đầy đủ: buyer + seller + listing
SELECT o.id,
       o.status,
       o.plan,
       o.fulfillment_type,
       o.deposit_paid,
       o.balance_paid,
       buyer.email AS buyer_email,
       seller.email AS seller_email,
       lst.title AS listing_title
FROM orders o
JOIN users buyer ON buyer.id = o.buyer_id
JOIN listings lst ON lst.id = o.listing_id
JOIN users seller ON seller.id = lst.seller_id
ORDER BY o.created_at DESC
LIMIT 30;

-- -------------------------------------------------------------------------
-- Reviews — kèm buyer / seller
-- -------------------------------------------------------------------------

SELECT r.id,
       r.rating,
       LEFT(r.comment, 80) AS comment_preview,
       r.status,
       buyer.email AS buyer_email,
       seller.email AS seller_email,
       lst.title AS listing_title,
       r.created_at
FROM reviews r
JOIN users buyer ON buyer.id = r.buyer_id
JOIN users seller ON seller.id = r.seller_id
JOIN listings lst ON lst.id = r.listing_id
ORDER BY r.created_at DESC
LIMIT 25;

-- -------------------------------------------------------------------------
-- Package orders
-- -------------------------------------------------------------------------

SELECT id,
       user_id,
       status,
       plan_code,
       amount_vnd,
       created_at,
       updated_at
FROM package_orders
ORDER BY created_at DESC
LIMIT 20;

-- -------------------------------------------------------------------------
-- Listing images (collection table)
-- -------------------------------------------------------------------------

SELECT l.id AS listing_id,
       l.title,
       li.image_url
FROM listings l
JOIN listing_images li ON li.listing_id = l.id
WHERE l.id = 1;  -- đổi id

-- -------------------------------------------------------------------------
-- EXISTS — Seller có ít nhất một đơn COMPLETED
-- -------------------------------------------------------------------------

SELECT u.id,
       u.email,
       u.display_name
FROM users u
WHERE u.role = 'SELLER'
  AND EXISTS (
    SELECT 1
    FROM listings l
    INNER JOIN orders o ON o.listing_id = l.id
    WHERE l.seller_id = u.id
      AND o.status = 'COMPLETED'
  );

-- -------------------------------------------------------------------------
-- E — EXPLAIN (hiệu năng / index)
-- -------------------------------------------------------------------------

EXPLAIN
SELECT *
FROM listings
WHERE seller_id = 1
  AND state = 'PUBLISHED';

EXPLAIN
SELECT o.*
FROM orders o
WHERE o.buyer_id = 1
  AND o.status IN ('RESERVED', 'SHIPPING');

-- -------------------------------------------------------------------------
-- H — Kiểm tra lệch đếm: tin ẩn nhưng không REJECTED (tùy dữ liệu)
-- -------------------------------------------------------------------------

SELECT id,
       seller_id,
       title,
       state,
       is_hidden
FROM listings
WHERE is_hidden = 1
  AND state <> 'REJECTED';

-- -------------------------------------------------------------------------
-- Gợi ý thống kê nhanh cho báo cáo (GV hay hỏi tổng quan)
-- -------------------------------------------------------------------------

SELECT COUNT(*) AS tong_nguoi_dung FROM users;
SELECT role, COUNT(*) AS sl FROM users GROUP BY role;

SELECT COUNT(*) AS tong_tin FROM listings;
SELECT state, COUNT(*) AS sl FROM listings GROUP BY state ORDER BY sl DESC;

SELECT COUNT(*) AS tong_don FROM orders;
SELECT status, COUNT(*) AS sl FROM orders GROUP BY status ORDER BY sl DESC;

SELECT COUNT(*) AS tong_danh_gia FROM reviews;
SELECT AVG(rating) AS diem_trung_binh FROM reviews WHERE status <> 'HIDDEN';

-- Kết thúc file
