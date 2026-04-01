# 10 — Thực hành: luồng mua xe có kiểm định (đọc code theo thứ tự)

Phần này **chỉ nói về frontend**: bạn học bằng cách mở đúng file và theo dõi **dữ liệu + hành động** trên màn hình. Không cần cài backend nếu bạn bật **`VITE_USE_MOCK_API=true`** (dữ liệu giả lập trong FE / service).

---

## 1. Hai ý tưởng cần tách bạch

| Khái niệm | Ý nghĩa trong app |
|-----------|-------------------|
| **Tin đăng (listing)** | Xe bán: trạng thái tin (nháp, chờ kiểm định, đã duyệt, v.v.) — không phải “đơn hàng”. |
| **Đơn mua (order)** | Buyer đặt mua một tin: có `status`, `fulfillmentType` (**DIRECT** giao thẳng / **WAREHOUSE** qua kho). |

**Kiểm định** có thể xuất hiện **hai lớp** trong luồng nghiệp vụ:

1. **Trước khi lên sàn:** inspector duyệt tin (trang Inspector).
2. **Sau khi xe vào kho (luồng WAREHOUSE):** kiểm định lại / xác nhận tại kho — buyer thấy bước trên trang **giao dịch**.

FE không “tự tính” hết quy tắc: nó **hiển thị** `status` + `fulfillmentType` từ API (hoặc mock) và gọi **đúng nút** (mutation) tương ứng.

---

## 2. Chỗ khai báo trạng thái đơn (đọc trước khi vào page)

File **`src/types/order.ts`**:

- `OrderStatus`: các giá trị như `SELLER_SHIPPED`, `AT_WAREHOUSE_PENDING_ADMIN`, `RE_INSPECTION`, `SHIPPING`, `COMPLETED`, …
- `OrderFulfillmentType`: `WAREHOUSE` | `DIRECT`

Đây là **bản đồ từ vựng**: khi debug, luôn đối chiếu **UI đang hiện gì** với **giá trị enum** trong object order.

---

## 3. Buyer: từ chọn xe → thanh toán → theo dõi

### 3.1 Xem danh sách xe (marketplace)

- **`src/pages/HomePage.tsx`**: lọc + lưới thẻ xe (`ListingCard`).
- Dữ liệu listings: hook/query (xem import trong file — thường `useListingsQuery` hoặc tương đương).

### 3.2 Chi tiết xe & thêm giỏ

- **`src/pages/ProductDetailPage.tsx`** (hoặc feature `features/bikes` nếu đã tách).

### 3.3 Checkout (tạo đơn)

- **`src/features/buyer`** — thường **`CheckoutPage.tsx`**: form địa chỉ, chọn plan thanh toán, gọi API tạo đơn / redirect VNPay tùy cấu hình.

API layer: **`src/apis/buyerApi.ts`**, có thể qua **`src/services/buyerService.ts`** (gom mock + map lỗi).

### 3.4 Trang “Giao dịch / theo dõi đơn” (buyer thấy kho & kiểm định)

- **`src/pages/TransactionPage.tsx`**: **đây là file trung tâm** để hiểu luồng warehouse + trạng thái từng bước.
  - Tìm chỗ render **timeline / bước** theo `order.status` và `fulfillmentType`.
  - Tìm các handler gọi API (hoàn tất nhận hàng, hủy, v.v.).

Khi đổi **nhãn bước** hoặc **điều kiện hiện nút**, bạn sửa **trong file này** + đảm bảo i18n trong **`src/locales/vi.json`** / **`en.json`** (khóa `transaction.*` hoặc tương đương).

---

## 4. Seller / Inspector / Admin (cùng một câu chuyện, góc khác)

| Vai | File gợi ý (mở và tìm “order” / “listing” / “warehouse”) |
|-----|-----------------------------------------------------------|
| Seller xử lý đơn, gửi kho | `src/features/seller`, `src/pages/SellerDashboardPage.tsx`, `src/apis/sellerApi.ts` |
| Inspector duyệt tin / kiểm định lại | `src/features/inspector`, `src/pages/InspectorDashboardPage.tsx` |
| Admin xác nhận kho, chuyển bước | `src/pages/AdminDashboardPage.tsx`, `src/services/adminService.ts` |

Luồng **listing** (tin chưa thành đơn) khác **order**: đừn nhầm API `seller/listings` với `buyer/orders`.

---

## 5. Cách học thực tế trên máy bạn (30–60 phút)

1. `.env`: `VITE_USE_MOCK_API=true` → `npm run dev`.
2. Đăng nhập tài khoản **buyer** (xem mock seed hoặc README / `QUICK-REFERENCE` nếu có tài khoản demo).
3. Mở DevTools → tab **Network** (nếu `false` mock) hoặc xem **Console** / React DevTools.
4. Vào **Checkout** tạo đơn WAREHOUSE (nếu UI cho phép) → mở **Transaction**.
5. Cùng lúc mở **`src/pages/TransactionPage.tsx`** và **`src/types/order.ts`**, tìm `switch` / điều kiện theo `status`.

Khi bạn nói “luồng mua xe có kiểm định”, trong code thường là: **một chuỗi `OrderStatus`** với `fulfillmentType === "WAREHOUSE"` + các màn Admin/Inspector cập nhật trạng thái — Transaction là nơi buyer **đọc** chuỗi đó.

---

**Tiếp theo:** [11-thuc-hanh-doi-so-cot-luoi-tailwind.md](./11-thuc-hanh-doi-so-cot-luoi-tailwind.md) — đổi lưới 3 cột thành 4 cột.
