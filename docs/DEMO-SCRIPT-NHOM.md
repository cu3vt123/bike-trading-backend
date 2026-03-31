# Kịch bản demo webapp ShopBike (nhóm 4 thành viên)

Tài liệu hướng dẫn **demo end-to-end** từ đầu đến cuối, chia theo từng người; có sẵn **§ Gợi ý lời thoại (script)** để tập nói trước hội đồng. Áp dụng khi **frontend** (Vite, mặc định `http://localhost:5173`) và **backend** Spring Boot (`http://localhost:8081`) đã chạy, profile **`local`**, và **VNPAY sandbox** đã cấu hình trong `application-local.properties` (xem [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md), [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md)).

---

## Chuẩn bị chung (cả nhóm)

1. **Khởi động:** MySQL → chạy `quydu_be` → chạy FE.
2. **Trình duyệt:** nên dùng **Chrome/Edge**, **hai profile** hoặc **cửa sổ ẩn danh** nếu cần vừa seller vừa buyer.
3. **Thanh toán test (VNPAY sandbox)** — đây là **thông tin thẻ / tài khoản giả lập trên cổng VNPAY** (sau khi redirect từ ShopBike), **không phải** email đăng nhập webapp:

| Trường trên cổng VNPAY | Giá trị (môi trường TEST) |
|------------------------|---------------------------|
| Ngân hàng | **NCB** |
| Số thẻ / STK thẻ nội địa | `9704198526191432198` |
| Tên chủ thẻ | `NGUYEN VAN A` |
| Ngày hết hạn thẻ (MM/YY) | `07/15` |
| OTP giao dịch (khi cổng gửi OTP) | `123456` |
| CVV / mã bảo mật | Một số giao diện sandbox yêu cầu — thử `123` hoặc để trống nếu form cho phép |

Sau khi nhập đúng, cổng TEST sẽ **duyệt giao dịch giả** và redirect về `http://localhost:8081/payment/vnpay-return` rồi về FE. Chi tiết kỹ thuật: [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md).

4. **Lưu ý JWT:** Checkout mua xe **bắt buộc đăng nhập tài khoản BUYER** (`buyer@demo.com` hoặc `buyer@local.dev`). Đăng nhập **SELLER** rồi vào thanh toán đơn hàng sẽ **403**.
5. **Thứ tự live khuyên dùng:** **Quang** (chuẩn bị xe có kiểm định trên sàn) → **Hoàng** (bổ sung admin/inspector nếu cần) → **Quân** (mua xe kiểm định) → **Bảo** (bán/mua không kiểm định) → **Hoàng** (tổng hợp quản trị). Có thể linh hoạt nếu đã có sẵn dữ liệu.

---

## Bảng tài khoản demo (mật khẩu thống nhất)

Các user dưới đây được **tạo/ cập nhật mỗi lần** backend start bởi `DataSeeder` (email và role cố định). **Mật khẩu demo:** `Password!1` (tám ký tự: chữ P viết hoa, số 1).

| Email | Vai trò | Ghi chú |
|--------|---------|---------|
| `admin@demo.com` | **ADMIN** | Quản trị hệ thống, kho, user, brand |
| `inspector@demo.com` | **INSPECTOR** | Duyệt / từ chối / yêu cầu cập nhật tin kiểm định |
| `seller@demo.com` | **SELLER** | Gói **VIP** + hạn ~30 ngày (seed); dùng cho luồng bán có kiểm định |
| `buyer@demo.com` | **BUYER** | Mua hàng, VNPAY checkout (đăng nhập ShopBike trước khi bấm thanh toán) |

**Thanh toán trên cổng VNPAY:** không có “tài khoản VNPAY” riêng — dùng **bộ thẻ test NCB** ở mục **§ Chuẩn bị chung → bước 3** (số thẻ, tên, hạn `07/15`, OTP `123456`).

**Tài khoản BUYER chỉ tạo khi profile `local` (một lần):**

| Email | Mật khẩu | Vai trò |
|--------|----------|---------|
| `buyer@local.dev` | `Buyer@123` | **BUYER** — thay thế hoặc song song với `buyer@demo.com` khi demo checkout |

**Gợi ý thêm (không có sẵn trong seed — đăng ký trên FE nếu cần):**

- Tạo thêm **seller** thứ hai (email ví dụ `seller2@demo.com`) nếu muốn **tách** người bán / người mua rõ ràng trong cùng buổi mà không logout liên tục; gói **BASIC** có thể mua qua trang gói sau khi đăng ký.

---

## Gợi ý lời thoại khi demo (script)

*Đây là câu gợi ý — có thể đọc gần nguyên văn hoặc chỉnh theo giọng nhóm. Thời lượng demo ~15–25 phút tùy độ sâu.*

### Mở đầu (1 người dẫn — ~45 giây)

- *“Chào thầy/cô và các bạn. Nhóm em giới thiệu **ShopBike** — nền tảng mua bán xe đạp trực tuyến. Ứng dụng có **người mua**, **người bán**, **kiểm định viên**, **quản trị**, thanh toán qua **VNPAY sandbox** và backend **Spring Boot**.”*
- *“Hôm nay em chia bốn phần: **Quân** demo **mua xe đã kiểm định qua kho**, **Bảo** demo **bán / mua không kiểm định**, **Quang** demo **bán có kiểm định**, **Hoàng** demo **admin và inspector**.”*
- *“Môi trường là **local**: frontend cổng **5173**, API **8081**; thanh toán là **thẻ test**, không phải tiền thật.”*

---

### Quân — mua xe có kiểm định (gợi ý lời thoại)

1. *“Em đóng vai **người mua**, đăng nhập **buyer@demo.com** — lưu ý **checkout bắt buộc tài khoản buyer**, nếu đang login seller sẽ bị chặn.”*
2. *“Trên sàn em chọn một xe **đã kiểm định** — nhóm đã chuẩn bị trước qua luồng seller + inspector + kho. Xe này khi mua sẽ đi **qua kho**, không giao thẳng từ cá nhân như xe không kiểm định.”*
3. *“Em chọn **đặt cọc** hoặc **trả đủ**, điền địa chỉ; hệ thống tạo đơn và chuyển sang **VNPAY**.”*
4. *“Ở cổng test em chọn **NCB**, nhập **số thẻ, tên, hạn thẻ, OTP** theo bảng demo trong tài liệu — đây là dữ liệu ảo của VNPAY.”*
5. *“Sau khi thanh toán thành công, em quay lại app: đơn chuyển trạng thái chờ seller / kho xử lý. Phần giao hàng và cọc lần hai em chỉ **minh họa ngắn** theo màn hình.”*
6. *“Khác biệt cốt lõi: **có kiểm định + kho** giúp người mua yên tâm hơn về tình trạng xe, **chi phí và thời gian vận hành** cao hơn luồng giao trực tiếp.”*

---

### Bảo — mua và bán không kiểm định (gợi ý lời thoại)

**Bán:**

1. *“Em đăng nhập **seller** — cần **gói đăng tin** còn hạn.”*
2. *“Em tạo tin mới, đăng ảnh và **xuất bản không gửi kiểm định**. Tin sẽ là **chưa kiểm định**, hiển thị công khai giống xe thường.”*

**Mua:**

3. *“Em **đăng xuất**, chuyển sang **buyer**, mở đúng tin vừa tạo.”*
4. *“Đặt mua và thanh toán **VNPAY** như phần Quân.”*
5. *“Luồng này backend xử lý **giao trực tiếp** sau khi thanh toán phù hợp — **không qua kho**, phù hợp xe không cần chứng nhận.”*

**So sánh:**

6. *“Tóm lại: **không kiểm định** thì nhanh và đơn giản cho seller, nhưng **rủi ro thông tin** do người mua tự đánh giá; phần Quân thể hiện hướng **chất lượng / niềm tin cao hơn**.”*

---

### Quang — bán xe có kiểm định (gợi ý lời thoại)

1. *“Em đăng nhập seller **VIP** — **chỉ gói VIP** mới được gửi xe đi kiểm định theo luồng hiện tại.”*
2. *“Em soạn tin và chọn **đăng kèm kiểm định** / gửi inspector — tin chuyển **chờ duyệt**, **chưa** lên sàn bán.”*
3. *“Inspector duyệt xong, xe vào giai đoạn **chờ gửi kho**; em thao tác **xác nhận đã gửi tới kho** trên kênh seller.”*
4. *“Admin và inspector phía kho **nhập kho và kiểm định lại**; khi đạt, tin mới **lên sàn** với trạng thái **đã kiểm định** — lúc đó Quân hoặc buyer khác mới mua được đúng luồng có kiểm định.”*
5. *“Nếu inspector **từ chối**, hệ thống **bắt buộc ghi lý do**; tin **không tính** vào lượt đăng để seller không bị mất slot oan.”*

---

### Hoàng — admin và inspector (gợi ý lời thoại)

**Inspector:**

1. *“Em đăng **inspector** — đây là vai trò **chuyên môn**, không phải khách mua bán.”*
2. *“Màn **chờ kiểm định**: em **duyệt** xe đạt chuẩn, hoặc **từ chối / yêu cầu cập nhật** kèm **lý do rõ ràng** để seller biết chỉnh gì.”*

**Admin:**

3. *“Em đăng **admin** — quản trị toàn hệ thống.”*
4. *“Dashboard cho thấy **quy mô vận hành**; em có thể **ẩn user / tin** khi vi phạm.”*
5. *“Phần **kho**: em xác nhận xe vào kho và **chốt kiểm định lại** để tin được **certified** trên sàn.”*
6. *“Em còn minh họa **gói đăng tin seller**, **brand**, và **đánh giá** nếu FE có — thể hiện bộ khẩu **vận hành + nội dung**.”*

**Chốt phân quyền:**

7. *“**Inspector** lo chất lượng tin và quy trình kỹ thuật; **admin** lo policy, người dùng, kho và danh mục — hai vai trò tách bạch.”*

---

### Kết thúc (~30 giây)

- *“Tóm lại ShopBike hỗ trợ **hai đường mua bán**: **có và không kiểm định**, có **kho và thanh toán VNPAY**, có **phân quyền rõ ràng**. Nhóm em xin nhận câu hỏi.”*

---

### Khi demo gặp sự cố (câu dự phòng)

| Tình huống | Gợi ý nói |
|------------|-----------|
| VNPAY chậm / lỗi | *“Đây là **sandbox**; trên môi trường thật merchant sẽ cấu hình product và kết nối ổn định hơn. Em có thể **thử lại** hoặc xem **return URL** backend đã nhận redirect chưa.”* |
| 403 khi checkout | Nhắc: *“Session đang là **seller** — cần **đăng xuất và login buyer**; quyền lấy theo **JWT từ DB**.”* |
| Không có xe certified trên sàn | *“Luồng có kiểm định cần **chuỗi bước** trước; nhóm em đã chuẩn bị dữ liệu **từ trước buổi** hoặc chạy lại phần Quang + Hoàng.”* |
| FE khác nhãn với tài liệu | *“Nhãn có thể đổi theo phiên bản FE, nhưng **thứ tự nghiệp vụ** vẫn theo API backend.”* |

---

## Phần 1 — Quân: Luồng **mua xe có kiểm định** (qua kho)

**Mục tiêu:** Buyer mua một xe **đã hiển thị trên sàn** với trạng thái kiểm định **CERTIFIED** (đơn hàng **WAREHOUSE** — giao qua kho).

### Điều kiện trước khi Quân lên demo

Trên marketplace phải có **ít nhất một** tin:

- `state`: **PUBLISHED**
- `certificationStatus`: **CERTIFIED** (sau chuỗi kiểm định + nhập kho + kiểm định lại — xem phần **Quang** và **Hoàng**).

Nếu chưa có, nhờ nhóm chạy nhanh phần chuẩn bị của Quang/Hoàng trước.

### Các bước Quân thực hiện (buyer)

1. Đăng xuất nếu đang là seller; **đăng nhập** `buyer@demo.com` / `Password!1` (hoặc `buyer@local.dev` / `Buyer@123`).
2. Vào **trang chủ / danh sách xe**, chọn xe **đã kiểm định** (UI thường hiển thị badge kiểm định / certified).
3. **Đặt mua:** chọn **cọc** hoặc **thanh toán đủ** theo app → điền **địa chỉ giao hàng** → xác nhận tạo đơn.
4. **Thanh toán VNPAY:** redirect sang sandbox → chọn NCB → nhập thẻ test → OTP `123456`.
5. Sau khi redirect về app: kiểm tra **trạng thái đơn** (đã cọc / chờ seller gửi kho — tùy cấu hình FE).
6. **Tiếp tục theo kịch bản kho (minh họa):** sau khi seller gửi kho và admin xử lý, buyer có thể thanh toán **số dư** (nếu ban đầu là cọc) qua VNPAY; theo dõi trạng thái cho đến **đang giao**; khi nhận xe, bấm **hoàn tất đơn** (nếu FE có).
7. (Tuỳ chọn) **Đánh giá** seller sau khi đơn **hoàn tất**.

### Điểm cần nói khi demo

- Buyer **luôn dùng role BUYER** khi checkout.
- Xe có kiểm định: luồng **kho** (warehouse), khác với giao trực tiếp từ seller.

---

## Phần 2 — Bảo: Luồng **mua xe** và **bán xe không kiểm định**

**Mục tiêu:** Một tin **PUBLISHED**, **UNVERIFIED** (không gửi kiểm định); buyer đặt mua; đơn **DIRECT** (seller giao thẳng).

### A. Bán xe không kiểm định (seller)

1. Đăng nhập tài khoản **SELLER** (`seller@demo.com` hoặc seller mới đăng ký; cần **gói đăng tin còn hạn** — BASIC hoặc VIP).
2. **Tạo tin mới:** điền thông tin xe, ảnh (đủ checklist nếu FE yêu cầu).
3. **Xuất bản:** chọn **đăng lên sàn không kiểm định** (không tick gửi kiểm định / không gửi inspector). Kết quả: tin **Đã xuất bản**, **chưa kiểm định**.
4. (Tuỳ chọn) Giữ tab seller hoặc đăng xuất, chuyển sang buyer.

### B. Mua xe không kiểm định (buyer)

1. **Đăng nhập BUYER** (`buyer@demo.com` hoặc `buyer@local.dev`).
2. Mở tin vừa đăng trên marketplace → **đặt mua** → **VNPAY** như bảng thẻ test.
3. Sau cọc: theo dõi đơn; seller (Bảo đổi lại session seller) **xác nhận giao trực tiếp** tới buyer khi app cho phép.
4. Buyer: **hoàn tất nhận hàng** khi trạng thái phù hợp.

### Điểm cần nói khi demo

- Không kiểm định → backend coi **UNVERIFIED** → **giao trực tiếp (DIRECT)**.
- So sánh ngắn với phần Quân: **không qua kho**, ít bước vận hành hơn.

---

## Phần 3 — Quang: Luồng **bán xe có kiểm định**

**Mục tiêu:** Tin đi qua **PENDING_INSPECTION** → inspector duyệt → seller gửi kho → admin/inspector tại kho → tin **PUBLISHED + CERTIFIED** trên sàn (để Quân hoặc buyer khác mua).

### Điều kiện

- Seller **VIP** (seed `seller@demo.com` đã VIP) hoặc seller đã **mua gói VIP** còn hạn.
- Inspector + Admin sẵn sàng (Hoàng) nếu demo **live nối tiếp**.

### Các bước gợi ý (seller Quang)

1. Đăng nhập **`seller@demo.com` / `Password!1`**.
2. Tạo tin nháp (tiêu đề, giá, ảnh…).
3. Chọn **đăng kèm yêu cầu kiểm định** (VIP) hoặc **Gửi kiểm định** — tin vào trạng thái chờ inspector.
4. Nhờ **Hoàng** (inspector) **duyệt** tin trên giao diện inspector → tin chuyển **chờ gửi kho** (`AWAITING_WAREHOUSE`).
5. Trên kênh seller: **Xác nhận đã gửi xe tới kho** (mark shipped to warehouse) → tin **chờ kho xác nhận**.
6. Nhờ **Hoàng** (admin): **xác nhận nhập kho** và **kiểm định lại tại kho** (chấp nhận) để tin thành **PUBLISHED**, **CERTIFIED**, có hạn đăng tin trên sàn.
7. Kiểm tra tin đã hiện ở **danh sách xe công khai** với trạng thái kiểm định.

### Điểm cần nói khi demo

- Chỉ **VIP** mới gửi kiểm định.
- Từ chối kiểm định: inspector gửi **`reason`**, tin **REJECTED** — **không** tính vào lượt đăng (theo logic BE hiện tại).

---

## Phần 4 — Hoàng: Chức năng **ADMIN** và **INSPECTOR**

**Mục tiêu:** Minh họa thống kê, duyệt nội dung, vận hành kho, người dùng, thương hiệu.

### Đăng nhập

- **Admin:** `admin@demo.com` / `Password!1`
- **Inspector:** `inspector@demo.com` / `Password!1`  
  (Một số màn FE gộp vai trò; nếu tách, đổi đúng tài khoản.)

### Inspector (ưu tiên minh họa)

1. **Danh sách chờ kiểm định:** duyệt tin (approve), hoặc **từ chối** với **lý do bắt buộc** (`PUT reject` + JSON `reason` nếu gọi API; trên FE nhập ô lý do nếu đã nối).
2. **Từ chối / cần cập nhật:** seller thấy lý do trên tin.

### Admin

1. **Dashboard / thống kê** (số user, tin, … — theo FE).
2. **Người dùng:** ẩn / hiện tài khoản vi phạm (nếu có màn).
3. **Tin đăng:** ẩn / hiện tin; danh sách tin toàn hệ thống.
4. **Hàng chờ kho:** đơn/tin cần **xác nhận nhập kho**, **kiểm định lại** — thao tác khớp với kịch bản Quang (confirm intake, re-inspection approve).
5. **Đánh giá:** duyệt / ẩn review (nếu FE có).
6. **Gói seller:** xem subscription seller, có thể **thu hồi gói** thử nghiệm (revoke).
7. **Thương hiệu (brands):** thêm / sửa / xóa brand demo.

### Điểm cần nói khi demo

- Phân quyền: **ADMIN** ≠ **INSPECTOR** (một số API inspector admin cũng vào được — kiểm tra UI thực tế).
- VNPAY **return URL** về `8081` — nếu demo thanh toán, nhắc cấu hình đúng `application-local.properties`.

---

## Checklist nhanh trước giờ G

| Mục | Đã xong? |
|-----|----------|
| MySQL chạy, DB `quydu_db` | ☐ |
| `application-local.properties` (JWT, MySQL, `vnpay.*`) | ☐ |
| Backend `8081`, FE `5173` | ☐ |
| Đăng nhập thử `admin@demo.com`, `seller@demo.com`, `buyer@demo.com` | ☐ |
| Thanh toán thử 1 giao dịch sandbox | ☐ |

---

## Tài liệu liên quan trong repo

- [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) — chạy project
- [BACKEND-ARCHITECTURE-AND-FLOWS.md](BACKEND-ARCHITECTURE-AND-FLOWS.md) — luồng nghiệp vụ chi tiết
- [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) — endpoint `/payment/*`, thẻ test
- [FRONTEND-INTEGRATION.md](FRONTEND-INTEGRATION.md) — biến môi trường FE

---

*Tài liệu mô tả hành vi backend `quydu_be` tại thời điểm soạn; nếu FE thay đổi nhãn màn hình, giữ nguyên thứ tự nghiệp vụ và đối chiếu Swagger: `/swagger-ui/index.html`.*
