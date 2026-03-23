-- ShopBike — Thiết kế Database MySQL (17 bảng)
-- Charset: utf8mb4, Engine: InnoDB
-- Xem: docs/ERD-MYSQL.md (sơ đồ ERD Mermaid)
--
-- Chạy:
--   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS shopbike CHARACTER SET utf8mb4;"
--   mysql -u root -p shopbike < docs/sql/shopbike_mysql_schema.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. USER — Người dùng (Buyer, Seller, Inspector, Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('BUYER', 'SELLER', 'INSPECTOR', 'ADMIN') NOT NULL DEFAULT 'BUYER',
  `display_name` VARCHAR(255) NOT NULL DEFAULT '',
  `avatar_url` VARCHAR(1024) NULL DEFAULT NULL,
  `is_hidden` TINYINT(1) NOT NULL DEFAULT 0,
  `subscription_plan` VARCHAR(32) NULL DEFAULT NULL COMMENT 'BASIC, VIP — seller only',
  `subscription_expires_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_user_email` (`email`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_hidden` (`is_hidden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. BRAND — Thương hiệu xe đạp
-- ============================================================
CREATE TABLE IF NOT EXISTS `brand` (
  `brand_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NULL DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`brand_id`),
  UNIQUE KEY `uk_brand_name` (`name`),
  KEY `idx_brand_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. CATEGORY — Danh mục xe (Road, Mountain, Hybrid, ...)
-- ============================================================
CREATE TABLE IF NOT EXISTS `category` (
  `category_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NULL DEFAULT NULL,
  `parent_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`category_id`),
  KEY `idx_category_parent` (`parent_id`),
  CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. LISTING — Tin đăng xe đạp
-- ============================================================
CREATE TABLE IF NOT EXISTS `listing` (
  `listing_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `seller_id` BIGINT UNSIGNED NOT NULL,
  `brand_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `model` VARCHAR(255) NOT NULL DEFAULT '',
  `year` INT NULL DEFAULT NULL,
  `frame_size` VARCHAR(64) NOT NULL DEFAULT '',
  `condition` ENUM('NEW', 'LIKE_NEW', 'MINT_USED', 'GOOD_USED', 'FAIR_USED') NULL DEFAULT NULL,
  `price` DECIMAL(15,2) NOT NULL,
  `msrp` DECIMAL(15,2) NULL DEFAULT NULL,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'VND',
  `location` VARCHAR(512) NOT NULL DEFAULT '',
  `description` TEXT NULL,
  `thumbnail_url` VARCHAR(1024) NOT NULL DEFAULT '',
  `state` ENUM('DRAFT', 'PENDING_INSPECTION', 'AWAITING_WAREHOUSE', 'AT_WAREHOUSE_PENDING_VERIFY', 'AT_WAREHOUSE_PENDING_RE_INSPECTION', 'NEED_UPDATE', 'PUBLISHED', 'RESERVED', 'IN_TRANSACTION', 'SOLD', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
  `inspection_result` ENUM('APPROVE', 'REJECT', 'NEED_UPDATE') NULL DEFAULT NULL,
  `inspection_score` DECIMAL(2,1) NULL DEFAULT NULL,
  `certification_status` ENUM('UNVERIFIED', 'PENDING_CERTIFICATION', 'PENDING_WAREHOUSE', 'CERTIFIED') NOT NULL DEFAULT 'UNVERIFIED',
  `seller_shipped_to_warehouse_at` DATETIME NULL DEFAULT NULL,
  `warehouse_intake_verified_at` DATETIME NULL DEFAULT NULL,
  `published_at` DATETIME NULL DEFAULT NULL,
  `listing_expires_at` DATETIME NULL DEFAULT NULL,
  `is_hidden` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`listing_id`),
  KEY `idx_listing_seller` (`seller_id`),
  KEY `idx_listing_brand` (`brand_id`),
  KEY `idx_listing_state` (`state`),
  KEY `idx_listing_published` (`published_at`),
  KEY `idx_listing_expires` (`listing_expires_at`),
  CONSTRAINT `fk_listing_seller` FOREIGN KEY (`seller_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_listing_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`brand_id`),
  CONSTRAINT `fk_listing_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. LISTING_MEDIA — Ảnh tin đăng
-- ============================================================
CREATE TABLE IF NOT EXISTS `listing_media` (
  `media_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `url` VARCHAR(1024) NOT NULL,
  `media_type` ENUM('IMAGE', 'VIDEO') NOT NULL DEFAULT 'IMAGE',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`media_id`),
  KEY `idx_listing_media_listing` (`listing_id`),
  CONSTRAINT `fk_listing_media_listing` FOREIGN KEY (`listing_id`) REFERENCES `listing` (`listing_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. INSPECTION_REPORT — Báo cáo kiểm định
-- ============================================================
CREATE TABLE IF NOT EXISTS `inspection_report` (
  `report_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `inspector_id` BIGINT UNSIGNED NOT NULL,
  `result` ENUM('APPROVE', 'REJECT', 'NEED_UPDATE') NOT NULL,
  `score` DECIMAL(2,1) NULL DEFAULT NULL,
  `summary` VARCHAR(1024) NULL DEFAULT NULL,
  `need_update_reason` TEXT NULL DEFAULT NULL,
  `frame_integrity_score` DECIMAL(2,1) NULL DEFAULT NULL,
  `drivetrain_health_score` DECIMAL(2,1) NULL DEFAULT NULL,
  `braking_system_score` DECIMAL(2,1) NULL DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`report_id`),
  UNIQUE KEY `uk_inspection_listing` (`listing_id`),
  KEY `idx_inspection_inspector` (`inspector_id`),
  CONSTRAINT `fk_inspection_listing` FOREIGN KEY (`listing_id`) REFERENCES `listing` (`listing_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inspection_inspector` FOREIGN KEY (`inspector_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. `order` — Đơn mua xe (buyer)
-- ============================================================
CREATE TABLE IF NOT EXISTS `order` (
  `order_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `buyer_id` BIGINT UNSIGNED NOT NULL,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('PENDING', 'RESERVED', 'PENDING_SELLER_SHIP', 'SELLER_SHIPPED', 'AT_WAREHOUSE_PENDING_ADMIN', 'RE_INSPECTION', 'RE_INSPECTION_DONE', 'SHIPPING', 'IN_TRANSACTION', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'RESERVED',
  `plan` ENUM('DEPOSIT', 'FULL') NOT NULL DEFAULT 'DEPOSIT',
  `fulfillment_type` ENUM('WAREHOUSE', 'DIRECT') NOT NULL DEFAULT 'WAREHOUSE',
  `total_price` DECIMAL(15,2) NOT NULL,
  `deposit_amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `deposit_paid` TINYINT(1) NOT NULL DEFAULT 0,
  `balance_paid` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Phần còn lại đã thanh toán VNPay (plan DEPOSIT)',
  `vnpay_payment_status` VARCHAR(32) NULL DEFAULT NULL COMMENT 'PENDING_PAYMENT, PAID, FAILED',
  `vnpay_amount_vnd` BIGINT NULL DEFAULT NULL,
  `shipped_at` DATETIME NULL DEFAULT NULL,
  `warehouse_confirmed_at` DATETIME NULL DEFAULT NULL,
  `re_inspection_done_at` DATETIME NULL DEFAULT NULL,
  `expires_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`order_id`),
  KEY `idx_order_buyer` (`buyer_id`),
  KEY `idx_order_listing` (`listing_id`),
  KEY `idx_order_status` (`status`),
  KEY `idx_order_fulfillment` (`fulfillment_type`),
  CONSTRAINT `fk_order_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_order_listing` FOREIGN KEY (`listing_id`) REFERENCES `listing` (`listing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. ORDER_SNAPSHOT — Snapshot tin đăng lúc mua (Finalize dùng)
-- ============================================================
CREATE TABLE IF NOT EXISTS `order_snapshot` (
  `snapshot_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `listing_id` BIGINT UNSIGNED NOT NULL COMMENT 'Denormalized at purchase',
  `title` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(255) NOT NULL,
  `model` VARCHAR(255) NOT NULL DEFAULT '',
  `year` INT NULL DEFAULT NULL,
  `frame_size` VARCHAR(64) NOT NULL DEFAULT '',
  `condition` VARCHAR(32) NULL DEFAULT NULL,
  `price` DECIMAL(15,2) NOT NULL,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'VND',
  `location` VARCHAR(512) NOT NULL DEFAULT '',
  `thumbnail_url` VARCHAR(1024) NOT NULL DEFAULT '',
  `image_urls` JSON NULL COMMENT 'Array of URLs',
  `seller_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'For review form (Success page)',
  `seller_json` JSON NULL COMMENT '{\"id\",\"name\",\"email\"} at purchase',
  `inspection_report` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`snapshot_id`),
  UNIQUE KEY `uk_snapshot_order` (`order_id`),
  KEY `idx_snapshot_seller` (`seller_id`),
  CONSTRAINT `fk_snapshot_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_snapshot_listing` FOREIGN KEY (`listing_id`) REFERENCES `listing` (`listing_id`),
  CONSTRAINT `fk_snapshot_seller` FOREIGN KEY (`seller_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. SHIPMENT — Thông tin giao hàng
-- ============================================================
CREATE TABLE IF NOT EXISTS `shipment` (
  `shipment_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `receiver_name` VARCHAR(255) NOT NULL DEFAULT '',
  `receiver_phone` VARCHAR(32) NOT NULL DEFAULT '',
  `street` VARCHAR(512) NOT NULL DEFAULT '',
  `city` VARCHAR(255) NOT NULL DEFAULT '',
  `postal_code` VARCHAR(32) NOT NULL DEFAULT '',
  `tracking_number` VARCHAR(64) NULL DEFAULT NULL,
  `shipping_method` VARCHAR(64) NULL DEFAULT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`shipment_id`),
  UNIQUE KEY `uk_shipment_order` (`order_id`),
  CONSTRAINT `fk_shipment_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. ORDER_PAYMENT — Thanh toán đơn mua (VNPay, …)
-- ============================================================
CREATE TABLE IF NOT EXISTS `order_payment` (
  `payment_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `provider` VARCHAR(32) NOT NULL DEFAULT 'VNPAY',
  `payment_type` ENUM('DEPOSIT', 'BALANCE', 'FULL') NOT NULL DEFAULT 'DEPOSIT' COMMENT 'DEPOSIT=cọc, BALANCE=số dư, FULL=toàn bộ',
  `txn_ref` VARCHAR(128) NULL DEFAULT NULL,
  `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  `paid_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`payment_id`),
  KEY `idx_order_payment_order` (`order_id`),
  KEY `idx_order_payment_txn` (`txn_ref`),
  CONSTRAINT `fk_order_payment_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. REVIEW — Đánh giá sau giao dịch
-- ============================================================
CREATE TABLE IF NOT EXISTS `review` (
  `review_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `seller_id` BIGINT UNSIGNED NOT NULL,
  `buyer_id` BIGINT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL COMMENT '1-5',
  `comment` TEXT NULL DEFAULT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'EDITED', 'HIDDEN') NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `uk_review_order` (`order_id`),
  KEY `idx_review_seller` (`seller_id`),
  KEY `idx_review_buyer` (`buyer_id`),
  CONSTRAINT `fk_review_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`),
  CONSTRAINT `fk_review_listing` FOREIGN KEY (`listing_id`) REFERENCES `listing` (`listing_id`),
  CONSTRAINT `fk_review_seller` FOREIGN KEY (`seller_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_review_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. SUBSCRIPTION_PLAN — Catalog gói đăng tin
-- ============================================================
CREATE TABLE IF NOT EXISTS `subscription_plan` (
  `plan_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(32) NOT NULL COMMENT 'BASIC, VIP',
  `name` VARCHAR(255) NOT NULL,
  `amount_vnd` BIGINT NOT NULL,
  `duration_days` INT NOT NULL DEFAULT 30,
  `listing_slots` INT NOT NULL DEFAULT 3 COMMENT 'Số tin tối đa',
  `allow_inspection` TINYINT(1) NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`plan_id`),
  UNIQUE KEY `uk_plan_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. PACKAGE_ORDER — Đơn mua gói đăng tin (seller)
-- ============================================================
CREATE TABLE IF NOT EXISTS `package_order` (
  `package_order_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `seller_id` BIGINT UNSIGNED NOT NULL,
  `plan` ENUM('BASIC', 'VIP') NOT NULL,
  `provider` VARCHAR(32) NOT NULL DEFAULT 'VNPAY',
  `amount_vnd` BIGINT NOT NULL,
  `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `payment_url` VARCHAR(2048) NULL DEFAULT NULL,
  `completed_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`package_order_id`),
  KEY `idx_package_seller` (`seller_id`),
  KEY `idx_package_status` (`status`),
  CONSTRAINT `fk_package_seller` FOREIGN KEY (`seller_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. USER_PAYMENT_METHOD — Phương thức thanh toán của seller
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_payment_method` (
  `method_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('BANK_TRANSFER', 'VISA', 'MASTERCARD') NOT NULL,
  `bank_name` VARCHAR(255) NULL DEFAULT NULL,
  `account_number` VARCHAR(64) NULL DEFAULT NULL,
  `account_holder` VARCHAR(255) NULL DEFAULT NULL,
  `last_four` VARCHAR(4) NULL DEFAULT NULL COMMENT '4 số cuối thẻ (PCI safe)',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`method_id`),
  KEY `idx_payment_method_user` (`user_id`),
  CONSTRAINT `fk_payment_method_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. WISHLIST — Danh sách yêu thích (buyer)
-- ============================================================
CREATE TABLE IF NOT EXISTS `wishlist` (
  `wishlist_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`wishlist_id`),
  UNIQUE KEY `uk_wishlist_user_listing` (`user_id`, `listing_id`),
  KEY `idx_wishlist_listing` (`listing_id`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_listing` FOREIGN KEY (`listing_id`) REFERENCES `listing` (`listing_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. NOTIFICATION — Thông báo in-app
-- ============================================================
CREATE TABLE IF NOT EXISTS `notification` (
  `notification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role` VARCHAR(32) NOT NULL COMMENT 'BUYER, SELLER, ADMIN',
  `title_key` VARCHAR(255) NOT NULL,
  `message_key` VARCHAR(255) NOT NULL,
  `message_params` JSON NULL,
  `entity_type` VARCHAR(64) NULL DEFAULT NULL COMMENT 'order, listing, …',
  `entity_id` VARCHAR(64) NULL DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`notification_id`),
  KEY `idx_notification_user` (`user_id`),
  KEY `idx_notification_role` (`role`),
  KEY `idx_notification_read` (`is_read`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. VNPAY_TRANSACTION_LOG — Log gọi VNPay (audit)
-- ============================================================
CREATE TABLE IF NOT EXISTS `vnpay_transaction_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entity_type` VARCHAR(32) NOT NULL COMMENT 'order, package_order',
  `entity_id` VARCHAR(64) NOT NULL,
  `action` VARCHAR(64) NOT NULL COMMENT 'create_url, ipn, return',
  `request_data` JSON NULL,
  `response_data` JSON NULL,
  `status` VARCHAR(32) NULL DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`log_id`),
  KEY `idx_vnpay_log_entity` (`entity_type`, `entity_id`),
  KEY `idx_vnpay_log_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
