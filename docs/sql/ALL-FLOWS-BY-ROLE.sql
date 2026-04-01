-- =============================================================================
-- ShopBike / quydu_be — TRUY VẤN THEO LUỒNG & ROLE (ôn vấn đáp database)
--
-- Cách dùng:
--   1) Đổi USE quydu_db cho đúng tên DB của bạn.
--   2) Đổi :user_id, :listing_id... hoặc số mẫu 1,2,5 cho phù hợp.
-- Enum trong DB là chuỗi HOA (JPA EnumType.STRING).
--
-- Role trong hệ thống: BUYER | SELLER | INSPECTOR | ADMIN
-- =============================================================================

USE quydu_db;

-- ############################################################################
-- PHẦN 0 — KHÁM PHÁ & THUẬT NGỮ (thầy hay hỏi đầu tiên)
-- ############################################################################

-- NOTE: Liệt kê bảng chính: users, listings, orders, reviews, package_orders,
--       listing_images, brands (nếu có).

SHOW TABLES;

-- NOTE: Khóa ngoại — giải thích quan hệ users ↔ listings ↔ orders.

SELECT TABLE_NAME,
       COLUMN_NAME,
       CONSTRAINT_NAME,
       REFERENCED_TABLE_NAME,
       REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- Giá trị enum thực tế đang có trong DB (tránh nhớ sai chữ)

SELECT DISTINCT role FROM users ORDER BY role;
-- BUYER, SELLER, INSPECTOR, ADMIN

SELECT DISTINCT state FROM listings ORDER BY state;
-- DRAFT, PENDING_INSPECTION, AWAITING_WAREHOUSE, AT_WAREHOUSE_PENDING_VERIFY,
-- AT_WAREHOUSE_PENDING_RE_INSPECTION, NEED_UPDATE, PUBLISHED, RESERVED,
-- IN_TRANSACTION, SOLD, REJECTED

SELECT DISTINCT status FROM orders ORDER BY status;
-- PENDING, RESERVED, PENDING_SELLER_SHIP, SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN,
-- RE_INSPECTION, RE_INSPECTION_DONE, SHIPPING, IN_TRANSACTION, COMPLETED,
-- CANCELLED, REFUNDED

SELECT DISTINCT subscription_plan FROM users WHERE subscription_plan IS NOT NULL;
-- BASIC, VIP (theo SubscriptionPlan trong code)

SELECT DISTINCT status FROM package_orders;
-- PENDING, COMPLETED, FAILED

-- ############################################################################
-- PHẦN 1 — AUTH / NGƯỜI DÙNG (mọi role đăng nhập đều có bản ghi users)
-- ############################################################################

-- Luồng: đăng ký/đăng nhập → lưu email, password_hash, role.

SELECT id, email, role, display_name,
       is_hidden AS user_hidden,
       subscription_plan, subscription_expires_at,
       created_at
FROM users
ORDER BY id;

-- Người bị admin ẩn (không đăng nhập / bị khóa tùy FE)

SELECT id, email, role, hidden_at
FROM users
WHERE is_hidden = 1;

-- ############################################################################
-- PHẦN 2 — SELLER — GÓI ĐĂNG TIN (package_orders + users.subscription_*)
-- ############################################################################

-- NOTE: Thanh toán gói tạo/sửa package_orders; seller có subscription_plan + expires.

SELECT po.id,
       po.seller_id,
       u.email,
       po.plan,
       po.provider,
       po.amount_vnd,
       po.status,
       po.created_at
FROM package_orders po
JOIN users u ON u.id = po.seller_id
ORDER BY po.created_at DESC;

-- Seller đang có gói còn hạn (logic tương đương BE: expires_at > NOW())

SELECT id, email, subscription_plan, subscription_expires_at
FROM users
WHERE role = 'SELLER'
  AND subscription_plan IS NOT NULL
  AND subscription_expires_at IS NOT NULL
  AND subscription_expires_at > NOW();

-- “Slot” đang chiếm: tin không ẩn, không REJECTED (khớp quota backend)

SELECT seller_id, COUNT(*) AS slots_used
FROM listings
WHERE is_hidden = 0
  AND state <> 'REJECTED'
GROUP BY seller_id;

-- ############################################################################
-- PHẦN 3 — SELLER — VÒNG ĐỜI TIN ĐĂNG (listings + listing_images)
-- ############################################################################

-- 3a) Tạo tin nháp (API create) → INSERT listings: state = DRAFT

SELECT *
FROM listings
WHERE seller_id = 1   -- đổi id
  AND state = 'DRAFT'
ORDER BY created_at DESC;

-- 3b) Cập nhật tin (PUT) → cùng bảng listings; ảnh có thể ở listing_images

SELECT l.id, l.title, l.state, li.image_url
FROM listings l
LEFT JOIN listing_images li ON li.listing_id = l.id
WHERE l.seller_id = 1
ORDER BY l.id DESC;

-- 3c) Xuất bản KHÔNG kiểm định → state = PUBLISHED, certification thường UNVERIFIED,
--     published_at & listing_expires_at có giá trị (đăng bài thường, hết hạn ~30 ngày).

SELECT id, title, state, certification_status, published_at, listing_expires_at
FROM listings
WHERE state = 'PUBLISHED'
  AND (certification_status IS NULL OR certification_status = 'UNVERIFIED')
ORDER BY published_at DESC;

-- 3d) LUỒNG XUẤT BẢN CÓ KIỂM ĐỊNH (VIP — publish + requestInspection)
-- NOTE khớp BE (SellerServiceImpl.publishListing, InspectorServiceImpl, Seller mark ship, Admin kho):
--   B1 Seller: state = PENDING_INSPECTION, certification_status = PENDING_CERTIFICATION,
--      published_at & listing_expires_at = NULL (chưa hiển thị như tin đã đăng hết hạn).
--   B2a Inspector approve: state = AWAITING_WAREHOUSE, certification_status = PENDING_WAREHOUSE,
--       inspection_result = 'APPROVE', có inspection_score / inspection_report_json.
--   B2b Inspector reject: state = REJECTED, inspection_result = 'REJECT'.
--   B2c Inspector need-update: state = NEED_UPDATE, inspection_result = 'NEED_UPDATE'.
--   B3 Seller mark shipped to warehouse: state = AT_WAREHOUSE_PENDING_VERIFY + seller_shipped_to_warehouse_at.
--   B4 Admin confirm intake: state = AT_WAREHOUSE_PENDING_RE_INSPECTION.
--   B5 Admin confirm re-inspection OK: state = PUBLISHED, certification_status = 'CERTIFIED',
--      published_at + listing_expires_at + warehouse_intake_verified_at.

-- B1 — Chờ kiểm định (hàng chờ inspector)
SELECT id, seller_id, title, state, certification_status, inspection_result,
       published_at, listing_expires_at
FROM listings
WHERE state = 'PENDING_INSPECTION'
ORDER BY updated_at ASC;

-- B2a — Đã duyệt kiểm định, chờ seller gửi xe vào kho
SELECT id, title, state, certification_status, inspection_result,
       inspection_score, LEFT(inspection_report_json, 120) AS report_preview
FROM listings
WHERE state = 'AWAITING_WAREHOUSE'
  AND inspection_result = 'APPROVE'
ORDER BY updated_at DESC;

-- B2b — Bị từ chối kiểm định (không chiếm slot quota theo rule BE)
SELECT id, seller_id, title, state, inspection_result, inspection_need_update_reason
FROM listings
WHERE state = 'REJECTED';

-- B2c — Inspector yêu cầu seller sửa tin / bổ sung
SELECT id, seller_id, title, state, inspection_result, inspection_need_update_reason
FROM listings
WHERE state = 'NEED_UPDATE';

-- B3 — Seller đã đánh dấu gửi kho, chờ admin xác nhận nhận xe
SELECT id, seller_id, title, state, seller_shipped_to_warehouse_at
FROM listings
WHERE state = 'AT_WAREHOUSE_PENDING_VERIFY'
ORDER BY seller_shipped_to_warehouse_at DESC;

-- B4 — Đã nhập kho, chờ kiểm tra lại tại kho
SELECT id, title, state, seller_shipped_to_warehouse_at
FROM listings
WHERE state = 'AT_WAREHOUSE_PENDING_RE_INSPECTION';

-- B5 — Tin CERTIFIED đang bán trên sàn (sau kho + tái kiểm định OK)
SELECT id, title, state, certification_status, inspection_score,
       published_at, listing_expires_at, warehouse_intake_verified_at
FROM listings
WHERE state = 'PUBLISHED'
  AND certification_status = 'CERTIFIED'
ORDER BY published_at DESC;

-- 3e) Xem nhanh mọi state “sau inspector / trong kho” (một truy vấn gộp)

SELECT id, title, state, certification_status, inspection_result
FROM listings
WHERE state IN (
    'PENDING_INSPECTION',
    'AWAITING_WAREHOUSE',
    'AT_WAREHOUSE_PENDING_VERIFY',
    'AT_WAREHOUSE_PENDING_RE_INSPECTION',
    'NEED_UPDATE',
    'REJECTED'
)
ORDER BY state, updated_at DESC;

-- 3f) Seller đánh dấu đã gửi kho (đã rời AWAITING_WAREHOUSE) — mốc thời gian gửi

SELECT id, seller_id, title, state, seller_shipped_to_warehouse_at
FROM listings
WHERE seller_shipped_to_warehouse_at IS NOT NULL
ORDER BY seller_shipped_to_warehouse_at DESC;

-- 3g) Tin đã bán → listing SOLD (sau buyer complete order; áp dụng cả tin thường và CERTIFIED)

SELECT id, seller_id, title, state, price
FROM listings
WHERE state = 'SOLD';

-- ############################################################################
-- PHẦN 4 — INSPECTOR (+ ADMIN) — HÀNG CHỜ KIỂM ĐỊNH / KHO
-- ############################################################################

-- NOTE: API GET /api/inspector/pending-listings → state PENDING_INSPECTION

SELECT l.id,
       l.title,
       l.seller_id,
       u.email AS seller_email,
       l.state,
       l.certification_status,
       l.created_at
FROM listings l
JOIN users u ON u.id = l.seller_id
WHERE l.state = 'PENDING_INSPECTION'
  AND l.is_hidden = 0
ORDER BY l.updated_at ASC;

-- Hàng chờ nhập kho (admin): AT_WAREHOUSE_PENDING_VERIFY, AT_WAREHOUSE_PENDING_RE_INSPECTION

SELECT id, title, state, seller_id
FROM listings
WHERE state IN ('AT_WAREHOUSE_PENDING_VERIFY', 'AT_WAREHOUSE_PENDING_RE_INSPECTION')
  AND is_hidden = 0;

-- ############################################################################
-- PHẦN 5 — BUYER — ĐẶT HÀNG & THANH TOÁN (orders)
-- ############################################################################

-- NOTE: Tạo order → orders: buyer_id, listing_id, status RESERVED, listing → RESERVED
-- VNPAY: cột vnpay_payment_status, vnpay_amount_vnd, deposit_paid, balance_paid

SELECT o.id,
       o.buyer_id,
       o.listing_id,
       o.status,
       o.plan,
       o.fulfillment_type,
       o.total_price,
       o.deposit_paid,
       o.balance_paid,
       o.vnpay_payment_status,
       o.expires_at,
       o.shipping_street,
       o.shipping_city
FROM orders o
WHERE o.buyer_id = 1
ORDER BY o.created_at DESC;

-- Đơn đang giữ chỗ / chưa xong

SELECT o.id, o.status, lst.title, o.total_price
FROM orders o
JOIN listings lst ON lst.id = o.listing_id
WHERE o.buyer_id = 1
  AND o.status NOT IN ('COMPLETED', 'CANCELLED', 'REFUNDED');

-- Đơn theo luồng kho: chờ admin xác nhận kho

SELECT o.id, o.status, o.fulfillment_type, lst.title
FROM orders o
JOIN listings lst ON lst.id = o.listing_id
WHERE o.status = 'AT_WAREHOUSE_PENDING_ADMIN';

-- ############################################################################
-- PHẦN 6 — ADMIN — XÁC NHẬN KHO & THỐNG KÊ
-- ############################################################################

-- Đơn chờ warehouse-pending (tương đương queue admin — filter thêm DIRECT/WAREHOUSE ở BE)

SELECT o.id,
       o.status,
       o.fulfillment_type,
       buyer.email AS buyer_email,
       lst.title
FROM orders o
JOIN users buyer ON buyer.id = o.buyer_id
JOIN listings lst ON lst.id = o.listing_id
WHERE o.status IN ('SELLER_SHIPPED', 'AT_WAREHOUSE_PENDING_ADMIN')
ORDER BY o.updated_at ASC;

-- Thống kê tổng quan (giống ý dashboard admin)

SELECT (SELECT COUNT(*) FROM users) AS total_users;
SELECT role, COUNT(*) AS cnt FROM users GROUP BY role;
SELECT COUNT(*) AS total_listings FROM listings;
SELECT COUNT(*) AS total_orders FROM orders;
SELECT status, COUNT(*) AS cnt FROM orders GROUP BY status;

-- ############################################################################
-- PHẦN 7 — BUYER / SELLER — HỦY ĐƠN & GIỚI HẠN HỦY
-- ############################################################################

-- Đơn đã hủy

SELECT o.id, o.buyer_id, o.status, o.buyer_cancelled_at, lst.title
FROM orders o
JOIN listings lst ON lst.id = o.listing_id
WHERE o.status IN ('CANCELLED', 'REFUNDED')
ORDER BY o.updated_at DESC;

-- Đếm lần hủy chủ động 7 ngày (buyer_cancelled_at — logic chống spam backend)

SELECT buyer_id,
       COUNT(*) AS buyer_cancels_7d
FROM orders
WHERE buyer_cancelled_at IS NOT NULL
  AND buyer_cancelled_at >= NOW() - INTERVAL 7 DAY
GROUP BY buyer_id;

-- ############################################################################
-- PHẦN 8 — MUA XONG — ĐÁNH GIÁ (reviews)
-- ############################################################################

-- NOTE: Review gắn order_id, listing_id, buyer_id, seller_id; status PENDING/HIDDEN/...

SELECT r.id,
       r.order_id,
       r.rating,
       r.status,
       buyer.email AS buyer_email,
       seller.email AS seller_email,
       lst.title
FROM reviews r
JOIN users buyer ON buyer.id = r.buyer_id
JOIN users seller ON seller.id = r.seller_id
JOIN listings lst ON lst.id = r.listing_id
ORDER BY r.created_at DESC;

-- ############################################################################
-- PHẦN 9 — MARKETPLACE / KHÁCH XEM TIN (BikeController — listing public)
-- ############################################################################

-- NOTE: Sàn thường lọc PUBLISHED, không ẩn, chưa hết hạn listing_expires_at.

SELECT id, title, brand, price, state, listing_expires_at
FROM listings
WHERE state = 'PUBLISHED'
  AND is_hidden = 0
  AND (listing_expires_at IS NULL OR listing_expires_at > NOW())
ORDER BY updated_at DESC;

-- ############################################################################
-- PHẦN 10 — BÁO CÁO / TỔNG HỢP (thầy hay hỏi “doanh thu”, “top seller”)
-- ############################################################################

-- Doanh thu đơn COMPLETED theo seller

SELECT lst.seller_id,
       u.email,
       COUNT(*) AS so_don,
       SUM(o.total_price) AS tong_tien
FROM orders o
JOIN listings lst ON lst.id = o.listing_id
JOIN users u ON u.id = lst.seller_id
WHERE o.status = 'COMPLETED'
GROUP BY lst.seller_id, u.email
ORDER BY tong_tien DESC;

-- Top listing theo giá (demo)

SELECT id, seller_id, title, price, state
FROM listings
WHERE is_hidden = 0
ORDER BY price DESC
LIMIT 10;

-- EXPLAIN (hiệu năng)

EXPLAIN
SELECT * FROM listings WHERE seller_id = 1 AND state = 'PUBLISHED';

-- =============================================================================
-- BẢNG TÓM TẮT NHANH — ROLE ↔ BẢNG CHÍNH (để trả lời miệng)
-- =============================================================================
-- BUYER:     users | orders (buyer_id) | reviews (buyer_id)
-- SELLER:    users | listings (seller_id) | package_orders | orders (qua listing)
-- INSPECTOR: users | listings (state PENDING*) | join admin queue re-inspection
-- ADMIN:     users (ẩn user) | stats | orders warehouse | listings warehouse
-- =============================================================================
