# User Requirements — ShopBike

**Phiên bản tài liệu:** 1.0  
**Mục đích:** Thu thập yêu cầu từ góc nhìn **người dùng / stakeholder** (không mô tả chi tiết kỹ thuật triển khai). Dùng cho đồ án, SRS, hoặc đối chiếu với backlog.

**Liên kết kỹ thuật:** [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md), [BACKEND-GUIDE.md](./BACKEND-GUIDE.md), [SCREEN_FLOW_BY_ACTOR.md](./SCREEN_FLOW_BY_ACTOR.md).

---

## 1. Tổng quan

### 1.1 Bối cảnh

ShopBike là nền tảng **mua bán xe đạp thể thao đã qua sử dụng**, hỗ trợ **kiểm định** để tăng độ tin cậy, với các vai trò: Khách, Người mua, Người bán, Kiểm định viên, Quản trị viên.

### 1.2 Mục tiêu sản phẩm

- Cho phép **đăng tin** và **duyệt / mua** xe minh bạch hơn nhờ trạng thái kiểm định và luồng giao hàng phù hợp (kho / giao trực tiếp).
- Hỗ trợ **thanh toán** (demo: thẻ, chuyển khoản, VNPay QR; module đồ án: VietQR ngân hàng).
- Cho phép **đánh giá** sau giao dịch và **quản trị** nội dung / người dùng cơ bản.

### 1.3 Phạm vi (scope) phiên bản hiện tại

- **Trong scope:** đăng ký/đăng nhập theo role, marketplace, checkout đơn mua xe, theo dõi giao dịch, gói đăng tin seller, kiểm định tin, admin cơ bản, thông báo in-app, i18n VI/EN, module VietQR (đồ án).
- **Ngoài scope / hạn chế:** cổng thanh toán thật hoàn chỉnh (webhook ngân hàng production), dispute/hòa giải phức tạp, app mobile native.

---

## 2. Stakeholder & người dùng mục tiêu

| Nhóm | Mô tả ngắn | Nhu cầu chính |
|------|------------|----------------|
| **Guest (Khách)** | Chưa đăng nhập | Xem danh sách xe, chi tiết tin, đăng ký/đăng nhập |
| **Buyer (Người mua)** | Đã đăng nhập role Buyer | Mua xe, thanh toán (theo luồng app), theo dõi đơn, đánh giá, thông báo |
| **Seller (Người bán)** | Role Seller | Tạo/sửa tin, publish/kiểm định, mua gói đăng tin, xử lý đơn, uy tín |
| **Inspector** | Role Inspector | Duyệt / từ chối / yêu cầu cập nhật tin kiểm định |
| **Admin** | Role Admin | Quản lý user, tin, review, brand, xác nhận kho, xem lịch sử VietQR (demo) |
| **Dev / Giảng viên** | Đồ án | Tài liệu API, business rules, reproducible demo |

---

## 3. Yêu cầu chức năng (Functional Requirements)

Định dạng: **UR-XXX** — có thể trace sang màn hình trong [SCREEN_FLOW_BY_ACTOR.md](./SCREEN_FLOW_BY_ACTOR.md).

### 3.1 Xác thực & tài khoản

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| UR-AUTH-01 | Người dùng có thể **đăng ký** với vai trò Buyer hoặc Seller (theo quy định hệ thống). | Must |
| UR-AUTH-02 | Người dùng có thể **đăng nhập**; hệ thống ghi nhận phiên để truy cập trang được bảo vệ. | Must |
| UR-AUTH-03 | Khi phiên không hợp lệ / hết hạn, người dùng được đưa về luồng đăng nhập. | Must |
| UR-AUTH-04 | Truy cập chức năng sai vai trò phải bị **từ chối** (trải nghiệm rõ ràng, vd. trang 403). | Must |

### 3.2 Marketplace & tin đăng

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| UR-LIST-01 | Khách/Buyer xem **danh sách tin** đang mở bán theo quy tắc hiển thị của hệ thống. | Must |
| UR-LIST-02 | Xem **chi tiết tin**: giá, mô tả, ảnh, trạng thái kiểm định (đã / chưa) và thông tin liên quan. | Must |
| UR-LIST-03 | Seller **tạo và chỉnh sửa** tin (theo trạng thái tin: nháp, chờ duyệt, …). | Must |
| UR-LIST-04 | Seller có thể **đăng lên sàn** với lựa chọn kiểm định hoặc không (theo business rules). | Must |
| UR-LIST-05 | Tin **chưa kiểm định** phải được **cảnh báo rõ** cho buyer trước khi thanh toán. | Must |

### 3.3 Mua hàng & giao dịch

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| UR-ORD-01 | Buyer **đặt mua** từ tin hợp lệ, cung cấp địa chỉ giao hàng và chấp nhận điều khoản khi cần. | Must |
| UR-ORD-02 | Hệ thống phân luồng **giao qua kho / kiểm định lại** (xe đã kiểm định) hoặc **giao trực tiếp** (xe chưa kiểm định) — buyer thấy tiến trình phù hợp. | Must |
| UR-ORD-03 | Buyer theo dõi **trạng thái đơn** và thời gian / bước xử lý (theo thiết kế UI). | Should |
| UR-ORD-04 | Buyer có thể **hủy đặt chỗ** trong các trạng thái được phép (theo policy). | Should |
| UR-ORD-05 | Buyer **hoàn tất** nhận hàng / thanh toán số dư theo luồng ứng dụng. | Must |

### 3.4 Thanh toán (ứng dụng)

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| UR-PAY-01 | Buyer chọn **phương thức thanh toán** phù hợp (thẻ, CK, VNPay QR — theo bản triển khai). | Must |
| UR-PAY-02 | Seller mua **gói đăng tin** với thanh toán demo qua **VNPay** (không dùng Postpay trong bản hiện tại). | Must |
| UR-PAY-03 | (Đồ án) Buyer có thể dùng luồng **VietQR**: tạo đơn riêng, nhận **mã QR** chuyển khoản, thấy **thời gian hết hạn** và **tạo lại QR** khi cần. | Should |
| UR-PAY-04 | (Đồ án) Admin xem **lịch sử thanh toán VietQR** và **log** request/response (phục vụ báo cáo). | Should |
| UR-PAY-05 | Thông tin tài khoản nhận / API key **không** hiển thị cứng trên mã nguồn công khai; cấu hình qua môi trường triển khai. | Must |

### 3.5 Kiểm định (Inspector)

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| UR-INS-01 | Inspector xem **hàng chờ duyệt** và chi tiết tin. | Must |
| UR-INS-02 | Inspector **phê duyệt**, **từ chối**, hoặc **yêu cầu cập nhật** tin. | Must |

### 3.6 Quản trị (Admin)

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| UR-ADM-01 | Admin xem / ẩn / hiện **người dùng** (theo khả năng hệ thống). | Must |
| UR-ADM-02 | Admin quản lý **tin đăng** (ẩn/hiện). | Must |
| UR-ADM-03 | Admin **duyệt / chỉnh** đánh giá (moderation). | Should |
| UR-ADM-04 | Admin quản lý **thương hiệu (brand)** cho form seller. | Should |
| UR-ADM-05 | Admin **xác nhận xe tới kho** cho đơn luồng kho. | Must |
| UR-ADM-06 | Admin thao tác **re-inspection** theo luồng đơn (nếu có trong bản triển khai). | Should |

### 3.7 Đánh giá & uy tín seller

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| UR-REV-01 | Buyer gửi **đánh giá** sau khi giao dịch ở trạng thái cho phép. | Must |
| UR-REV-02 | Seller xem **tổng hợp điểm / nhận xét** (dashboard). | Should |

### 3.8 Thông báo & ngôn ngữ

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| UR-NOTIF-01 | Người dùng xem **danh sách thông báo** trong ứng dụng. | Should |
| UR-NOTIF-02 | Nội dung thông báo **theo ngôn ngữ** giao diện đang chọn (VI/EN), tránh lẫn ngôn ngữ cố định khi đổi locale. | Should |
| UR-I18N-01 | Giao diện hỗ trợ **Tiếng Việt** và **English** cho các màn chính. | Should |

---

## 4. Yêu cầu phi chức năng (Non-Functional)

| ID | Yêu cầu | Ghi chú |
|----|---------|---------|
| UR-NFR-01 | API có thể chạy **demo cục bộ** (Mongo in-memory + seed). | Môi trường lab |
| UR-NFR-02 | CORS cấu hình theo **origin frontend** (`CLIENT_ORIGIN`). | Bảo mật cơ bản |
| UR-NFR-03 | Mật khẩu / JWT secret không lưu trong repo; dùng **.env**. | Must |
| UR-NFR-04 | Dữ liệu thanh toán VietQR có **nhật ký (log)** để kiểm tra & báo cáo đồ án. | Module VietQR |

---

## 5. Giả định & ràng buộc

- Người dùng có trình duyệt hiện đại; kết nối mạng ổn định khi gọi API thanh toán bên thứ ba.
- Demo thanh toán **không** thay thế hợp đồng merchant thật; production cần tích hợp IPN/webhook theo từng cổng.
- Module VietQR là **đường thanh toán riêng** (SQLite), không tự động đồng bộ với đơn MongoDB “mua xe” — nếu cần một đơn thống nhất, phải mở rộng thiết kế.

---

## 6. Thuật ngữ

| Thuật ngữ | Ý nghĩa |
|-----------|---------|
| Kiểm định | Quy trình inspector xác minh mô tả/ảnh tin (mức độ theo app). |
| Luồng kho | Xe đã kiểm định: có bước gửi kho / kiểm định lại / giao hàng theo thiết kế. |
| Luồng trực tiếp | Xe chưa kiểm định: seller giao trực tiếp buyer, không qua kho. |
| VietQR | Chuẩn QR chuyển khoản ngân hàng qua dịch vụ VietQR.io (API). |

---

## 7. Traceability (tham chiếu nhanh)

| Nhóm UR | Tài liệu / mã |
|---------|----------------|
| UR-PAY-03, 04, 05 | [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) §2.7, [business-rules/BUSINESS-RULES.md](./business-rules/BUSINESS-RULES.md), `backend/src/vietqr/` |
| UR-PAY-01, 02 | [PAYMENTS-VNPAY.md](./PAYMENTS-VNPAY.md), `paymentController.js`, `packageController.js` |
| UR-ORD-* | [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) §2.2a, `buyerController.js` |
| Business rules chi tiết | [business-rules/BUSINESS-RULES.md](./business-rules/BUSINESS-RULES.md), `ReBike_BusinessRules_Template.xlsx`, [business-rules/README.md](./business-rules/README.md) |

---

*Bạn có thể copy bảng mục 3 vào Excel/Google Sheet làm cột “Requirement ID / Description / Priority” cho báo cáo SRS.*
