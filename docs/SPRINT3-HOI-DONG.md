# Sprint 3 – Chuẩn bị đem dự án ra hội đồng

> Giả định Sprint 1 + Sprint 2 đã hoàn thành đủ. Sprint 3 cần làm gì để sẵn sàng bảo vệ / trình bày trước hội đồng.

**Ghi nhận:** Tính cả khi hoàn thành task Sprint 1+2, vẫn thiếu API cho 3 luồng: **Seller, Inspector, Admin**. Sprint 3 cần bổ sung.

---

## 0. API còn thiếu – Bổ sung Sprint 3 (Backend)

> Các API này chưa có trong scope Sprint 1+2 hoặc chưa được Backend làm. Cần giao và hoàn thành trong Sprint 3 để demo đầy đủ 4 luồng.

### Luồng bán (Seller)

| API | Người | Mô tả |
|-----|-------|-------|
| GET /api/seller/dashboard | Bảo | Thống kê: tổng tin, published, in review, need update |
| POST /api/seller/listings | Bảo | Tạo tin đăng xe mới |
| GET /api/seller/listings | Bảo | Danh sách tin của seller |
| PUT /api/seller/listings/:id | Bảo | Sửa tin (Draft, Need Update) |
| GET /api/seller/profile | Bảo | Profile seller + payment methods |
| POST /api/seller/payment-methods | Bảo | Thêm phương thức thanh toán |
| DELETE /api/seller/payment-methods/:id | Bảo | Xóa phương thức thanh toán |
| PUT /api/seller/payment-methods/:id/default | Bảo | Đặt làm mặc định |

### Luồng kiểm định (Inspector)

| API | Người | Mô tả |
|-----|-------|-------|
| GET /api/inspector/pending-listings | Quân/Bảo | Danh sách tin chờ kiểm định |
| GET /api/inspector/listings/:id | Quân/Bảo | Chi tiết tin cần kiểm định |
| PUT /api/inspector/listings/:id/approve | Quân/Bảo | Duyệt tin → PUBLISHED |
| PUT /api/inspector/listings/:id/reject | Quân/Bảo | Từ chối tin |
| PUT /api/inspector/listings/:id/need-update | Quân/Bảo | Yêu cầu seller cập nhật |

### Luồng Admin (tùy phạm vi)

| API | Người | Mô tả |
|-----|-------|-------|
| GET /api/admin/dashboard | Quân/Bảo | Thống kê tổng quan |
| GET /api/admin/users | Quân/Bảo | Danh sách user (nếu có) |
| GET /api/admin/listings | Quân/Bảo | Quản lý tin (nếu có) |

---

## 1. Mục tiêu Sprint 3 (cho hội đồng)

| Mục tiêu | Mô tả |
|----------|-------|
| **Demo ổn định** | Hệ thống chạy end-to-end, không crash khi trình diễn |
| **Luồng hoàn chỉnh** | Buyer mua, Seller bán, Inspector kiểm định (nếu có) |
| **Tài liệu đầy đủ** | Báo cáo, hướng dẫn chạy, slide thuyết trình |
| **Sẵn sàng trình bày** | Có thể demo live hoặc video, trả lời câu hỏi hội đồng |

---

## 2. Chức năng Sprint 3 cần hoàn thành

### 2.1 Shipping / Vận chuyển (từ task list)

| Task | Nội dung | Ghi chú |
|------|----------|---------|
| SHOP-28 | BA: Shipping MVP Spec | Phạm vi, trạng thái, matrix quyền |
| SHOP-29 | BA: Business Rules Shipping | Đã Done |
| SHOP-30 | BA: ERD v2 Shipping (Shipment 1-1 Order) | Thiết kế DB |

→ Backend + FE implement Shipping nếu hội đồng yêu cầu luồng vận chuyển.

### 2.2 Polish & ổn định

| Mục | Mô tả |
|-----|-------|
| **Fix bug** | Sửa lỗi còn sót, UX trải nghiệm mượt |
| **Error handling** | Thông báo lỗi rõ ràng, không crash trắng |
| **Loading state** | Có spinner/skeleton khi load, không đứng hình |
| **Responsive** | Hiển thị ổn trên màn hình demo (laptop, tablet) |

### 2.3 Luồng demo đầy đủ

| Luồng | Cần chạy được | Trạng thái FE |
|-------|----------------|---------------|
| **Luồng mua** | Register/Login → Home → Detail → Checkout → Transaction → Finalize → Success | ✅ Sẵn sàng |
| **Luồng bán** | Login Seller → Dashboard → Create/Edit Listing → Profile | ✅ Sẵn sàng (API scaffold + mock) |
| **Luồng kiểm định** | Login Inspector → Dashboard → Duyệt/Từ chối tin | ✅ **Đã có** (InspectorDashboardPage, mock + API) |
| **RBAC** | Buyer không vào /seller, Seller không vào /checkout | ✅ |

---

## 3. Tài liệu cho hội đồng

| Tài liệu | Nội dung |
|----------|----------|
| **Báo cáo / Đồ án** | Tổng quan dự án, công nghệ, chức năng, kết quả |
| **Hướng dẫn chạy** | Cách clone, cài đặt, chạy FE + BE, env variables |
| **Slide thuyết trình** | Giới thiệu, demo, kết luận, Q&A |
| **Video demo** (tùy chọn) | Ghi màn hình luồng chính – backup nếu mạng lỗi khi bảo vệ |
| **Sơ đồ kiến trúc** | FE, BE, DB, luồng dữ liệu |
| **Danh sách chức năng** | Checklist đã làm gì (từ PROJECT-SUMMARY) |

---

## 4. Deploy & Demo

| Mục | Mô tả |
|-----|-------|
| **Deploy FE** | Vercel / Netlify – URL công khai để hội đồng xem |
| **Deploy BE** | Railway / Render / Heroku – API chạy 24/7 khi bảo vệ |
| **Env production** | FE trỏ `VITE_API_BASE_URL` tới BE đã deploy |
| **Demo local** (dự phòng) | Nếu deploy lỗi, sẵn sàng chạy local để demo |

---

## 5. Checklist trước ngày bảo vệ

| # | Việc | Trạng thái |
|---|------|------------|
| 1 | Tất cả luồng demo chạy ổn | ☐ |
| 2 | Seed data có sẵn (bikes, tài khoản test) | ☐ |
| 3 | Deploy FE + BE (hoặc sẵn sàng local) | ☐ |
| 4 | Báo cáo / slide đã xong | ☐ |
| 5 | Hướng dẫn chạy đã viết | ☐ |
| 6 | Video backup (nếu cần) đã ghi | ☐ |
| 7 | Tập demo 1–2 lần trước ngày bảo vệ | ☐ |
| 8 | Chuẩn bị câu trả lời cho câu hỏi thường gặp | ☐ |

---

## 6. Câu hỏi hội đồng có thể hỏi – Chuẩn bị sẵn

| Câu hỏi | Gợi ý trả lời |
|---------|---------------|
| Business model? | Marketplace mua bán xe đạp cũ, có kiểm định tăng tin cậy |
| Công nghệ dùng? | React, Spring Boot, … (theo tech stack thực tế) |
| Bảo mật? | JWT, CORS, validation, password hashing |
| Còn hạn chế gì? | Chưa tích hợp payment thật, Shipping có thể đơn giản |
| Hướng phát triển? | Tích hợp payment gateway thật, tối ưu UX, mobile app |

---

## 7. Tóm tắt Sprint 3 cho hội đồng

| Nhóm | Công việc Sprint 3 |
|------|--------------------|
| **BA** | Shipping spec (SHOP-28), ERD Shipping (SHOP-30) |
| **Backend** | **API Seller, Inspector, Admin** (mục 0), Shipping API (nếu làm), fix bug, deploy |
| **Frontend** | ✅ Inspector Dashboard (SHOP-41) đã xong – UI + scaffold API. Seller Dashboard/Listing đã gọi sellerService. Còn: map API thật khi BE xong, Shipping UI (nếu làm), fix bug, deploy |
| **Cả team** | Báo cáo, slide, hướng dẫn chạy, tập demo, deploy |

→ **Mục tiêu:** 4 luồng (Mua, Bán, Kiểm định, Admin) chạy với API thật, dự án ổn định, sẵn sàng trình bày trước hội đồng.
