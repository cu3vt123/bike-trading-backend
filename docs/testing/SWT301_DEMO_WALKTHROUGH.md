# SWT301 — Kịch bản demo từng bước (Walkthrough)

Tài liệu này mô tả **đường dẫn URL thực tế** trong `src/routes/AppRouter.tsx` và **thứ tự thao tác** gợi ý để demo ổn định. Điều chỉnh theo dữ liệu seed trên máy bạn (id tin, id đơn).

**Base URL giả định:** `http://localhost:5173` (đổi nếu Vite in cổng khác).

---

## 0. Chuẩn bị

1. FE: `npm run dev`  
2. BE: chạy và khớp `VITE_API_BASE_URL` (xem [SWT301_ENVIRONMENT.md](./SWT301_ENVIRONMENT.md))  
3. Mở **Chrome DevTools → Network** (filter `Fetch/XHR`) khi cần chứng minh API cho giảng viên

---

## 1. Vai trò Guest (không đăng nhập)

| Bước | Hành động | Kỳ vọng |
|------|-----------|---------|
| 1.1 | Mở `/` | Trang chủ, danh sách tin (public) |
| 1.2 | Mở `/bikes/<id>` với id tin **PUBLISHED** | Chi tiết tin load |
| 1.3 | Thử `/login` | Form đăng nhập |

**Lưu ý:** Guest **không** vào `/checkout`, `/seller`, `/inspector` (guard sẽ redirect / 403).

---

## 2. Vai trò Seller

**Điều kiện:** đăng nhập tài khoản role **SELLER**.

| Bước | Route | Mô tả |
|------|-------|--------|
| 2.1 | `/seller` | Dashboard seller |
| 2.2 | `/seller/listings/new` | Tạo tin mới — **DEF-SWT-006**: thử ô năm sản xuất (năm > năm hiện tại, 3 chữ số, < 1900) → phải có thông báo lỗi phù hợp; lưu nháp / gửi chỉ khi năm hợp lệ |
| 2.3 | `/seller/listings/<id>/edit` | Sửa tin đã có — load tin lên nếu năm trong DB không hợp lệ vẫn hiển thị lỗi validation |

**Gợi ý chứng minh DEF-SWT-006:** chụp màn hình ô năm + message lỗi; hoặc ghi lại `year` không gửi trong payload khi invalid (DevTools → Payload).

---

## 3. Vai trò Inspector hoặc Admin

**Điều kiện:** đăng nhập **INSPECTOR** hoặc **ADMIN**.

| Bước | Route | Mô tả |
|------|-------|--------|
| 3.1 | `/inspector` | Danh sách tin chờ kiểm định (pending) — từ đây có thể điều hướng tới chi tiết tin |
| 3.2 | `/bikes/<id>` với tin **PENDING_INSPECTION** | **DEF-SWT-001 / 003:** phải xem được chi tiết (API `GET /api/inspector/listings/:id`). Thử **F5** trang — sau khi session có, tin vẫn load |
| 3.3 | Network | Khi mở chi tiết, đảm bảo có request inspector (không chỉ GET public `/bikes/:id` rồi 404) |

**Admin:** cùng quyền gọi `/api/inspector/**` — **DEF-SWT-002** không còn 403 chỉ vì role Admin.

---

## 4. Vai trò Buyer

**Điều kiện:** đăng nhập **BUYER**.

Luồng mua đơn giản (phụ thuộc có tin PUBLISHED + đủ điều kiện checkout):

| Bước | Route | Ghi chú |
|------|-------|---------|
| 4.1 | `/bikes/<id>` | Mở tin published → nút mua / checkout (nếu UI có) |
| 4.2 | `/checkout/<listingId>` | Thanh toán / đặt cọc theo luồng app |
| 4.3 | `/transaction/<listingId>?orderId=...` | Theo dõi đơn — có thể có `orderId` trên query |
| 4.4 | `/finalize/<listingId>?orderId=...` | Hoàn tất / thanh toán số dư (tùy trạng thái đơn) |
| 4.5 | `/success/<listingId>` | **DEF-SWT-004:** state nên có `orderId` khi navigate từ Finalize (để load snapshot từ order nếu listing không còn public) |

**Kịch bản ngắn cho DEF-SWT-004:**

1. Hoàn tất mua đến `FinalizePurchasePage` → bấm hoàn tất → `navigate('/success/:id', { state: { orderId, ... } })`.  
2. Trên `/success/:id`, kiểm tra thông tin xe vẫn hiển thị (từ order snapshot).  
3. Nếu có nút từ `TransactionPage` khi đơn COMPLETED → Link `/success` kèm `state.orderId`.

---

## 5. Vai trò Admin (màn hình kho / giao dịch)

Tùy cấu hình routing, Admin có thể vào dashboard admin qua **profile** hoặc route riêng (kiểm tra `ProfilePage` / `AdminDashboardPage`).

**DEF-SWT-007:** trên màn **xác nhận kho / chuyển Inspector / transaction**, đọc các dòng mô tả — **không** có tiền tố “Bước 5:” / “(Bước 6)” trong chuỗi i18n (đã chỉnh trong `vi.json` / `en.json`).

---

## 6. DEF-SWT-005 — Phiên đăng nhập

**Không cần route cố định:** thao tác trên `/login`, header **Đăng xuất**, và các API sau khi đăng nhập.

| Bước | Hành động | Kỳ vọng |
|------|-----------|---------|
| 6.1 | Đăng nhập user A | API có Bearer token |
| 6.2 | Đăng xuất | Token xóa; không gọi API với token cũ |
| 6.3 | Đăng nhập user B (role khác) | Không bị “kẹt” role/token A |
| 6.4 | (Tùy chọn) Gây 401 | `apiClient` clear token (xem `src/lib/apiClient.ts`) |

---

## 7. Tổng hợp route (tham chiếu nhanh)

| Route | Guard / role |
|-------|----------------|
| `/` | Public |
| `/bikes/:id` | Public (nhưng Inspector/Admin dùng thêm API inspector) |
| `/profile` | RequireAuth |
| `/inspector` | Inspector hoặc Admin |
| `/checkout/:id`, `/transaction/:id`, `/finalize/:id`, `/success/:id` | Buyer |
| `/seller`, `/seller/listings/new`, `/seller/listings/:id/edit` | Seller |
| `/login`, `/register` | Guest (GuestGuard) |

---

## 8. Sau buổi demo

- Lưu screenshot / HAR vào `docs/testing/screenshots/` (local, không bắt buộc commit)  
- Cập nhật DefectList nếu có thay đổi trạng thái bug — xem [SWT301_EXPORT_DEFECTLIST.md](./SWT301_EXPORT_DEFECTLIST.md)  
