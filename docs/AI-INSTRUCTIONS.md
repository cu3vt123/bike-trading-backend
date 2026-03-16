## Hướng dẫn dùng AI cho dự án ShopBike

Tài liệu này giúp bất kỳ ai mới vào dự án hiểu **cách làm việc với AI trong Cursor** để hỗ trợ phát triển và bảo trì hệ thống.

---

## 1. Mục tiêu của AI trong dự án này

- **Hỗ trợ chính**: codebase tại `c:\SWP\frontend` (React + Vite frontend, Node/Express/MongoDB backend demo).
- **Các việc AI thường làm:**
  - Phân tích và sửa bug frontend/backend.
  - Thêm hoặc chỉnh sửa endpoint backend + cập nhật frontend gọi API.
  - Hoàn thiện luồng nghiệp vụ (Buyer / Seller / Inspector / Admin).
  - Đồng bộ i18n (vi/en), text UI, validation.
  - Viết docs ngắn, tóm tắt flow, chuẩn hóa code nhỏ.
- **Các hạng mục AI gần đây đã làm:**
  - Sửa lỗi đổi role gây 403 do giữ token cũ.
  - Đồng bộ checkout theo backend: deposit 8%.
  - Thêm `GET /seller/ratings` để Seller Dashboard hiển thị rating thật.
  - Thêm CRUD brands ở backend/admin và nối seller form với `GET /brands`.
  - Đồng bộ lại docs để phản ánh đúng trạng thái hệ thống.
- **Nguyên tắc chung:**
  - Giữ nguyên UX/UI đang có, chỉ thay đổi khi thực sự cần thiết.
  - Tôn trọng conventions hiện tại (tên file, thư mục, i18n key, style Tailwind).
  - Hạn chế commit/push – chỉ thực hiện khi người dùng yêu cầu rõ ràng.

---

## 2. Cách mở và “gọi” AI trong Cursor

1. Mở dự án trong Cursor: `c:\SWP\frontend`.
2. Mở thanh chat AI (sidebar bên phải hoặc phím tắt của Cursor).
3. Gõ yêu cầu với **ngữ cảnh rõ ràng**:
   - Chỉ rõ *file* hoặc *màn hình* liên quan.
   - Nói rõ muốn **giải thích** hay **sửa code trực tiếp**.

Ví dụ prompt tốt:

- _"Trong `backend/src/controllers/sellerController.js` và `src/pages/SellerDashboardPage.tsx`, ratings seller không hiển thị sau khi buyer review. Hãy tìm nguyên nhân và sửa BE + FE cho đúng, giải thích ngắn gọn."_  
- _"Chỉ giải thích giúp tôi luồng Buyer checkout hiện tại, không sửa code."_
- _"Trong `src/pages/AdminDashboardPage.tsx` và `backend/src/controllers/brandsController.js`, hãy thêm logic để brand mới lưu được và hiện ở seller form."_

AI hiểu tiếng Việt và tiếng Anh; code và i18n vẫn bám theo conventions hiện tại.

---

## 3. Khu vực code quan trọng (để tham chiếu khi hỏi AI)

**Frontend:**

- Trang Seller:
  - `src/pages/SellerDashboardPage.tsx`
  - `src/pages/SellerListingEditorPage.tsx`
- Trang Buyer:
  - `src/pages/HomePage.tsx`
  - `src/pages/CheckoutPage.tsx`
  - `src/pages/FinalizePurchasePage.tsx`
- Trang Admin:
  - `src/pages/AdminDashboardPage.tsx`
- Services & API:
  - `src/services/*.ts` – logic gọi API, mock fallback.
  - `src/apis/*.ts` – mapping endpoint, chuẩn hóa response.
- Cấu hình API:
  - `src/lib/apiConfig.ts`
- i18n:
  - `src/locales/en.json`
  - `src/locales/vi.json`

**Backend Node demo:**

- Server & routes:
  - `backend/src/server.js`
  - `backend/src/routes/*.js`
- Controllers:
  - `backend/src/controllers/*.js`
- Models:
  - `backend/src/models/*.js` (User, Listing, Order, Review, Brand…)
- Seed dữ liệu demo:
  - `backend/src/seed.js`

**Các endpoint đáng chú ý gần đây:**

- `GET /api/seller/ratings`
- `GET /api/brands`
- `GET /api/admin/brands`
- `POST /api/admin/brands`
- `PUT /api/admin/brands/:id`
- `DELETE /api/admin/brands/:id`

Khi yêu cầu AI, nên nhắc trực tiếp tên file để AI nhảy đúng chỗ.

---

## 4. Cách viết yêu cầu để AI làm việc hiệu quả

- **Luôn nói rõ loại task:**
  - _"Chỉ giải thích / viết docs"_  
  - _"Hãy sửa code trực tiếp và cập nhật file cho tôi"_
- **Mô tả hành vi mong muốn, không chỉ mô tả bug:**
  - Thay vì: _"Không thấy ratings"_, hãy dùng:  
    _"Sau khi buyer hoàn tất order và review seller, Seller Dashboard phải hiện số sao trung bình và tổng số review. Hiện giờ Seller Dashboard luôn 'No ratings yet'."_
- **Nếu có rule đặc biệt:** ghi rõ trong yêu cầu (ví dụ: không được chạm vào code auth, không đổi UI…).

---

## 5. Khi nào KHÔNG nên cho AI sửa trực tiếp

Nên yêu cầu AI **chỉ đề xuất / giải thích**, không chỉnh file, trong các trường hợp:

- Thay đổi kiến trúc lớn (đổi DB, đổi framework, refactor toàn bộ module).
- Migration dữ liệu thật (trên môi trường production).
- Phần code đang có quy trình review nội bộ riêng hoặc phụ thuộc hệ thống khác.

Trong các trường hợp này, hãy dùng kiểu prompt:

- _"Đề xuất cách refactor, đưa ví dụ code, **không chỉnh file**."_

---

## 6. Vị trí tài liệu & liên kết với docs hiện có

- Tài liệu chung của dự án: xem `docs/README.md`.
- Tài liệu flow hệ thống: `docs/FLOW-HE-THONG.md`.
- Tài liệu chuyển giao Backend Node → Spring Boot: `docs/CHUYEN-GIAO-NODE-SANG-SPRING-BOOT.md`.
- **Tài liệu này**: `docs/AI-INSTRUCTIONS.md` – dành cho bất kỳ ai muốn làm việc cùng AI trong dự án.

