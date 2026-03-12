# Nhánh ui-ux+shipping – Hướng dẫn cho Backend

> Nhánh này chứa tài liệu chuyển giao công nghệ đầy đủ từ Node.js sang Java Spring Boot.

---

## Thứ tự đọc (cho team BE Java)

1. **[CHUYEN-GIAO-NODE-SANG-SPRING-BOOT.md](CHUYEN-GIAO-NODE-SANG-SPRING-BOOT.md)** – Đọc đầu tiên. Tổng hợp toàn bộ: models, API, auth, luồng order, admin hide/unhide, checklist.
2. **[HUONG-DAN-BACKEND.md](HUONG-DAN-BACKEND.md)** – Contract API chi tiết (request/response từng endpoint).
3. **[backend/PORTING-NODE-TO-SPRING-BOOT.md](backend/PORTING-NODE-TO-SPRING-BOOT.md)** – Mapping model + API.
4. **[backend/SPRING-BOOT-SKELETON.md](backend/SPRING-BOOT-SKELETON.md)** – Skeleton project Spring Boot.

---

## Thông tin quan trọng

- **Login:** FE không gửi `role` – role lấy từ tài khoản trong DB.
- **User ẩn:** `isHidden = true` → không đăng nhập được, token cũ bị từ chối.
- **Complete order:** Chỉ khi `status = SHIPPING`.
- **Tiền tệ:** Mặc định VND.

---

## Chạy Frontend với Backend Spring Boot

1. Backend Spring Boot chạy tại `http://localhost:8081/api`
2. Trong `.env` của FE:
   ```env
   VITE_API_BASE_URL=http://localhost:8081/api
   VITE_USE_MOCK_API=false
   ```
3. `npm run dev` → mở `http://localhost:5173`
