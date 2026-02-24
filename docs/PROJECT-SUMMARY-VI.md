# ShopBike Frontend – Tổng kết dự án (Bản tiếng Việt)

> Tài liệu tổng hợp toàn bộ chức năng đã hoàn thành, quy tắc nghiệp vụ, và hướng dẫn sử dụng cho dự án ShopBike.
>
> 📄 **Bản gốc (mix EN/VI):** [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)

---

## 1. Tổng quan dự án

**ShopBike** là nền tảng mua bán xe đạp thể thao cũ, kết nối người mua và người bán với cơ chế kiểm định giúp tăng độ tin cậy.

### Công nghệ sử dụng

- **React 19** + **TypeScript**
- **Vite 7** (công cụ build)
- **Tailwind CSS** + **shadcn/ui**
- **React Router v7**
- **Zustand** (quản lý state)
- **Axios** (gọi HTTP)

### Vai trò người dùng

| Vai trò   | Mô tả                                                |
|-----------|------------------------------------------------------|
| Khách     | Xem trang chủ, chi tiết sản phẩm, Đăng nhập, Đăng ký |
| Người mua | Mua hàng, Thanh toán, Giao dịch, Hồ sơ               |
| Người bán | Đăng tin, quản lý tin, Hồ sơ, Thu nhập               |
| Kiểm định | Thuộc hệ thống (Sprint 2)                            |
| Quản trị  | Thuộc hệ thống (Sprint 2)                            |

---

## 2. Quy tắc nghiệp vụ (cốt lõi)

### 2.1 Tin đăng & Kiểm định

- **Xuất bản** chỉ sau khi kiểm định **ĐÃ DUYỆT**
- Vòng kiểm định: `ĐÃ DUYỆT → Xuất bản` | `TỪ CHỐI → Kết thúc` | `CẦN CẬP NHẬT → Người bán sửa → Gửi lại → Kiểm tra lại`
- **Quy tắc chỉnh sửa tin:**
  - **Bản nháp**: Được phép sửa
  - **Chờ kiểm định**: Khóa sửa
  - **Cần cập nhật**: Được phép sửa
  - **Đã xuất bản**: Hạn chế sửa nội dung chính
- Chỉ tin **ĐÃ XUẤT BẢN + ĐÃ DUYỆT** mới hiển thị trên sàn

### 2.2 Giao dịch

- **FIFO**: Còn trống → Đã đặt cọc (khóa sau khi thanh toán cọc thành công) → Đã bán
- Hủy / Thất bại → Về trạng thái còn trống ngay
- **Đặt chỗ** chỉ tạo khi thanh toán cọc thành công (đếm ngược 24 giờ)

### 2.3 Hoàn tiền & Hủy

- Hoàn tiền đơn giản, không xử lý tranh chấp trong ứng dụng
- Thời hạn hoàn tiền: tối đa 7 ngày
- Giới hạn hủy: **tối đa 3 lần mỗi kỳ**

### 2.4 Phương thức thanh toán (Người bán)

- Bắt buộc có **ít nhất 1** phương thức thanh toán
- Khi xóa phương thức **MẶC ĐỊNH**, phương thức còn lại đầu tiên sẽ trở thành MẶC ĐỊNH
- Người bán có thể đặt phương thức khác làm MẶC ĐỊNH (Đặt làm mặc định)

### 2.5 Xác thực & Phân quyền

- **Đăng ký** chỉ dành cho Người mua / Người bán
- **Đăng nhập** hỗ trợ 4 vai trò (Người mua, Người bán, Kiểm định, Quản trị)
- Sai vai trò → chuyển về trang `/403`
- Người mua không vào được các trang thanh toán; Người bán không vào được `/checkout/:id`

---

## 3. Luồng màn hình chính

### 3.1 Luồng Người mua

```
Trang chủ → Chi tiết sản phẩm → Thanh toán → Giao dịch → Hoàn tất → Thành công
```

1. **Trang chủ** (`/`): Danh sách tin đăng (API hoặc dữ liệu mẫu)
2. **Chi tiết sản phẩm** (`/bikes/:id`): Chi tiết xe, báo cáo kiểm định, nút Mua ngay
3. **Thanh toán** (`/checkout/:id`): Chọn gói (TRẢ ĐỦ / TRẢ CỌC), phương thức thanh toán, địa chỉ giao hàng, đồng ý chính sách
4. **Giao dịch** (`/transaction/:id`): Đếm ngược 24 giờ, thông tin logistics, Hủy / Hoàn tất
5. **Hoàn tất** (`/finalize/:id`): Thanh toán số dư, xác nhận giao hàng
6. **Thành công** (`/success/:id`): Xác nhận đã hoàn tất

### 3.2 Luồng Người bán

```
Bảng điều khiển → Tạo/Sửa tin → Hồ sơ → Thống kê
```

- **Bảng điều khiển** (`/seller`): Tổng quan tin, thống kê, hành động
- **Biên tập tin** (`/seller/listings/new`, `/seller/listings/:id/edit`): Tạo/sửa tin, tải ảnh
- **Hồ sơ** (`/profile`): Khi vai trò = Người bán → Hồ sơ Người bán
- **Thống kê** (`/seller/stats`): Thống kê chi tiết

### 3.3 Luồng Xác thực

- **Đăng nhập** (`/login`): Chọn vai trò, đăng nhập (dữ liệu mẫu)
- **Đăng ký** (`/register`): Chọn Người mua/Người bán, đăng ký (dữ liệu mẫu) → tự động đăng nhập
- **Đăng xuất**: Xóa token → quay về Trang chủ

---

## 4. Các chức năng đã hoàn thành

### 4.1 Nền tảng UI (SHOP-19)

- Cài đặt shadcn/ui, theme tokens
- Thành phần: `Button`, `Card`, `Input`, `Badge`, `Label`, `Select`, `Checkbox`, `Dialog`

### 4.2 Xác thực & Bảo vệ tuyến

| Chức năng        | Mô tả                                                      |
|------------------|------------------------------------------------------------|
| Đăng nhập        | Mock đăng nhập, chọn 4 vai trò                             |
| Đăng ký          | Mock đăng ký, chỉ Người mua/Người bán                      |
| GuestGuard       | Chuyển hướng user đã đăng nhập ra khỏi /login, /register   |
| RequireAuth      | Bảo vệ /profile                                            |
| RequireBuyer     | Bảo vệ /checkout, /transaction, /finalize, /success        |
| RequireSeller    | Bảo vệ /seller, /seller/stats, /seller/listings/*          |
| 403 Forbidden    | Trang khi truy cập sai vai trò                             |

### 4.3 Trang Người mua

| Trang              | Chức năng chính                                                       |
|--------------------|-----------------------------------------------------------------------|
| Trang chủ          | Tải danh sách qua `buyerService` (API + mock)                        |
| Chi tiết sản phẩm  | Chi tiết xe, báo cáo kiểm định, Xem báo cáo đầy đủ (Dialog)          |
| Thanh toán         | Gói thanh toán, phương thức, địa chỉ giao hàng, kiểm tra chính sách (lỗi inline) |
| Giao dịch          | Đếm ngược, Hủy (xác nhận), Xem báo cáo (Dialog), Hỗ trợ chat (Dialog) |
| Hoàn tất mua       | Thanh toán số dư, xác nhận giao hàng                                 |
| Mua thành công     | Tóm tắt đơn, liên kết                                                |
| Hồ sơ Người mua    | Thông tin cá nhân, Đơn hàng gần đây, điều hướng cuộn                  |

### 4.4 Trang Người bán

| Trang                | Chức năng chính                                                       |
|----------------------|-----------------------------------------------------------------------|
| Bảng điều khiển      | Thống kê tin, kho hàng, Xem tất cả                                   |
| Biên tập tin         | Tạo/sửa tin, tải 1–8 ảnh, logic Bản nháp/Chờ kiểm định               |
| Hồ sơ Người bán      | Sửa hồ sơ, Phương thức thanh toán (Thêm/Xóa/Đặt mặc định)             |
| Thống kê             | Tổng doanh số, Tin đang hiển thị, Giao dịch hoàn tất                  |

### 4.5 Hồ sơ Người bán – Chi tiết

#### Sửa hồ sơ

- Dialog: Họ tên*, Email*, URL ảnh đại diện
- Kiểm tra: tên và email bắt buộc, email hợp lệ

#### Phương thức thanh toán

- **Xóa**: Xóa mục, dialog xác nhận; bắt buộc giữ tối thiểu 1 phương thức
- **Đặt làm mặc định**: Chỉ với mục chưa phải MẶC ĐỊNH, khi có ≥2 phương thức
- **Thêm mới**: Dialog thêm Visa/MoMo; với Visa yêu cầu nhập 4 số cuối
- Khi xóa MẶC ĐỊNH, mục còn lại đầu tiên trở thành MẶC ĐỊNH

### 4.6 API & Dịch vụ

| Tệp               | Mô tả                                                         |
|-------------------|---------------------------------------------------------------|
| `apiClient.ts`    | Axios instance, Bearer token, 401 → đăng xuất                 |
| `authApi.ts`      | login, signup, getProfile (scaffold)                          |
| `buyerApi.ts`     | bikes, orders, payments (scaffold)                            |
| `buyerService.ts` | Facade + fallback mock khi API lỗi                            |
| `useAuthStore`    | Lưu token, vai trò, persist `auth-storage`                    |

### 4.7 Các thay đổi theo quy tắc nghiệp vụ (gần đây)

| Khu vực        | Thay đổi                                                           |
|----------------|--------------------------------------------------------------------|
| Hồ sơ Người bán| Đặt làm mặc định, kiểm tra Sửa hồ sơ & Thêm phương thức thanh toán |
| Hồ sơ Người bán| Xác nhận khi xóa, quy tắc MẶC ĐỊNH khi xóa                         |
| Giao dịch      | Dialog Hủy ghi rõ: hoàn tiền 7 ngày, giới hạn 3 lần/kỳ             |
| Hồ sơ Người mua| Nav cuộn (Thông tin cá nhân, Đơn của tôi), liên kết Xem tất cả đơn |
| Bảng điều khiển| Xem tất cả → dùng Link thay button                               |
| Thanh toán     | Kiểm tra chính sách → lỗi inline thay alert                        |

---

## 5. Cấu trúc thư mục chính

```
src/
├── apis/           # authApi, buyerApi, bikeApi
├── components/
│   ├── common/     # Header
│   ├── listing/   # ListingCard
│   └── ui/         # shadcn components
├── layouts/        # MainLayout
├── lib/            # apiClient, utils, cn
├── mocks/          # bikeApi.mock, listings.mock
├── pages/          # Các trang (Home, Detail, Checkout, ...)
├── routes/         # AppRouter, Guards (RequireAuth, RequireBuyer, RequireSeller)
├── services/       # buyerService
├── stores/         # useAuthStore
└── types/          # auth, shopbike, order, listing
```

---

## 6. Tài liệu liên quan

| Tệp                                | Nội dung                                          |
|------------------------------------|---------------------------------------------------|
| `docs/FLOWS-AND-PROGRESS.md`       | Luồng nghiệp vụ, tiến độ theo ticket              |
| `docs/API-INTEGRATION.md`          | Hướng dẫn gắn API thật khi BE sẵn sàng            |
| `docs/HUONG-DAN-BACKEND.md`        | Hướng dẫn gửi cho Backend – các API cần implement   |
| `.kiro/steering/project-standards.md` | Chuẩn dự án, quy tắc nghiệp vụ                 |
| `.kiro/steering/product.md`        | Mô tả sản phẩm                                    |

---

## 7. Điều kiện test với Backend (Sprint 2 trở đi)

- CORS cho `http://localhost:5173`
- Swagger / OpenAPI
- Các endpoint: `POST /auth/login`, `POST /auth/signup`, `GET /bikes`, `GET /bikes/:id`
- Đặt `VITE_API_BASE_URL` trong `.env`

---

## 8. Checklist demo nhanh

1. Đăng ký Người mua → Về Trang chủ
2. Trang chủ → Chi tiết sản phẩm → Mua ngay → Thanh toán → Trả cọc → Giao dịch → Hoàn tất → Thành công
3. Đăng xuất → Đăng nhập Người bán → Vào Hồ sơ → Sửa hồ sơ, Thêm/Xóa phương thức thanh toán, Đặt mặc định
4. Người bán → /seller/stats
5. Người mua thử vào /seller → 403
6. Người bán thử vào /checkout/:id → 403

---

*Tài liệu cập nhật: Sprint 1 hoàn thiện + tích hợp Backend API*
