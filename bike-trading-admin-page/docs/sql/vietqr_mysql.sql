-- VietQR module – MySQL / MariaDB (tham khảo đồ án; backend mặc định dùng SQLite file).

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_code VARCHAR(32) NOT NULL,
  status ENUM ('CREATED', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED') NOT NULL,
  amount BIGINT NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'VND',
  description VARCHAR(512) NULL,
  buyer_ref VARCHAR(64) NULL,
  listing_ref VARCHAR(64) NULL,
  paid_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_orders_order_code (order_code),
  KEY idx_orders_buyer (buyer_ref),
  KEY idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  payment_code VARCHAR(32) NOT NULL,
  provider VARCHAR(32) NOT NULL DEFAULT 'VIETQR',
  bank_acq_id VARCHAR(16) NOT NULL,
  bank_account_no VARCHAR(32) NOT NULL,
  bank_account_name VARCHAR(255) NOT NULL,
  amount BIGINT NOT NULL,
  transfer_content VARCHAR(64) NOT NULL,
  qr_url VARCHAR(2048) NULL,
  raw_qr_code LONGTEXT NULL,
  status ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED') NOT NULL,
  expired_at DATETIME(3) NOT NULL,
  paid_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_payments_payment_code (payment_code),
  KEY idx_payments_order_id (order_id),
  KEY idx_payments_status (status),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payment_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(64) NOT NULL,
  request_data JSON NULL,
  response_data JSON NULL,
  note VARCHAR(512) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_payment_logs_payment_id (payment_id),
  CONSTRAINT fk_payment_logs_payment FOREIGN KEY (payment_id) REFERENCES payments (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
