-- Chỉ dùng trên MySQL LOCAL (vd. quydu_db). Xóa toàn bộ tin đăng + đơn + đánh giá + ảnh tin.
-- Giữ nguyên users, package_orders, brands.
--
-- Sau khi xóa: nếu khởi động lại Spring mà lại thấy 1 tin "Trek Emonda… Demo" — đó là DataSeeder.
-- Tắt: thêm vào application-local.properties dòng: app.seed-demo-listing=false
--
-- IntelliJ / DataGrip: bôi đen TOÀN BỘ file rồi Execute (đừng chỉ chạy 1 dòng).
-- CLI: mysql -u root -p quydu_db < docs/sql/local-reset-all-listings.sql
--
-- Nếu DELETE báo lỗi FK: dùng khối TRUNCATE + FOREIGN_KEY_CHECKS bên dưới.

USE quydu_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE reviews;
TRUNCATE TABLE orders;
TRUNCATE TABLE listing_images;
TRUNCATE TABLE listings;

SET FOREIGN_KEY_CHECKS = 1;
