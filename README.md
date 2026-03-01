# Bike Trading Platform - Backend (BE2)

Đây là mã nguồn Backend cho dự án Sàn Giao Dịch Xe Đạp Thể Thao.

## 🛠 1. Cài đặt môi trường (Prerequisites)
- **Java:** JDK 24
- **Database:**  MySQL Workbench
- **IDE:** IntelliJ IDEA 

##  2. Cách chạy dự án (How to run)
1. Bật MySQL Server (Start MySQL trên XAMPP).
2. Tạo database trắng tên là `bike_trading_db`.
3. Mở IntelliJ, tìm file `ShopBikeApplication.java` (hoặc tên tương tự) chứa hàm `main`.
4. Bấm nút **Run (▶)** màu xanh lá.
5. Code báo `Started Application in ... seconds` là thành công!

## 🔗 3. Tài liệu API (Swagger UI)
Sau khi Server chạy, truy cập link sau để test API:
**[http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)**

##  4. Tài khoản Test có sẵn (Sample Accounts)
Dùng các tài khoản này để test chức năng Đăng nhập (Login):

| Vai trò (Role) | Username | Password | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Seller (Người bán)** | `shop_danang_vip` | `123` | Shop ở Đà Nẵng |
| **Buyer (Người mua)** | `buyer_tuan` | `123` | Dùng test mua hàng |
| **Admin** | `admin` | `123` | Quản trị viên |
