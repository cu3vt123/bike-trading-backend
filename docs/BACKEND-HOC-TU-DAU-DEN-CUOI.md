# Học backend `quydu_be` từ đầu đến cuối (để trả lời hội đồng)

Tài liệu này dành cho bạn **chưa quen Spring** nhưng cần **hiểu được** cách project chạy và **chỉ được đoạn code** khi giảng viên hỏi. Đọc lần lượt từ trên xuống; không cần thuộc lòng, chỉ cần nắm **ý từng phần** và biết **mở file nào**.

---

## Phần 1 — Backend trong đồ án này làm gì?

- **Frontend (web)** chạy trên trình duyệt (ví dụ cổng 5173): người dùng bấm nút, màn hình gọi **HTTP request** (REST API).
- **Backend (Spring Boot)** chạy trên server Java (ở máy bạn là cổng **8081**): nhận request, **đọc/ghi MySQL**, trả JSON về cho frontend.

Toàn bộ “nghiệp vụ” (được đặt hàng không, đổi trạng thái tin, tính tiền cọc, v.v.) nằm ở backend. Frontend chủ yếu **hiển thị** và **gọi API**.

---

## Phần 2 — Project Spring Boot khởi động thế nào?

1. Class có `public static void main` là **điểm vào** của chương trình:

   - File: `src/main/java/com/minhyun/quydu_be/QuyduBeApplication.java`
   - Annotation `@SpringBootApplication` báo cho Spring: đây là app, quét toàn bộ package con để **tự tạo bean** (controller, service,…).

2. Khi chạy, Spring đọc `src/main/resources/application.properties` (và file `application-local.properties` nếu có): **cổng server**, **chuỗi kết nối MySQL**, **CORS**, v.v.

**Câu trả lời GV:** “Em chạy Spring Boot từ class `QuyduBeApplication`, cấu hình môi trường trong `application.properties`.”

---

## Phần 3 — Một request HTTP đi qua những lớp nào? (khung xương quan trọng nhất)

Thứ tự điển hình:

```
Trình duyệt / Postman
    → Spring nhận HTTP (GET/POST/PUT…)
    → Bộ lọc bảo mật (JWT) — nếu API cần đăng nhập
    → Controller     (@RestController)   … nhận path, gọi Service
    → ServiceImpl    … logic nghiệp vụ, transaction
    → Repository     … câu lệnh truy vấn DB (JPA)
    → Entity         … bản ghi bảng MySQL
    → JSON trả về cho client
```

**Ghi nhớ:**  
- **Controller** = “cửa tiếp khách” (URL, method).  
- **Service** = “xử lý việc” (quy tắc, if/else, đổi trạng thái).  
- **Repository** = “lấy/ghi DB”.  
- **Entity** = “bảng trong DB”.

**Câu trả lời GV:** “Luồng là Controller nhận request → Service xử lý → Repository tương tác database qua entity.”

---

## Phần 4 — Từng loại file trong `com.minhyun.quydu_be` (bạn mở IntelliJ theo thư mục)

| Thư mục / loại | Vai trò |
|----------------|--------|
| `controller/` | Các class `*Controller.java`: map URL (`@RequestMapping`, `@GetMapping`…), gọi service, trả `ResponseEntity` hoặc helper `RestResponses`. |
| `service/` | Interface: ví dụ `BuyerService` — khai báo “có những chức năng gì”. |
| `service/impl/` | `BuyerServiceImpl`, `SellerServiceImpl`… — **code thật**: kiểm tra điều kiện, `save`, `findById`. |
| `repository/` | Interface extends `JpaRepository`: `OrderRepository`, `ListingRepository`… Spring tự sinh `findBy...`, `save`. |
| `entity/` | Class `@Entity` = một bảng: `User`, `Listing`, `Order`… Thuộc tính = cột; `@ManyToOne` + `@JoinColumn` = khóa ngoại. |
| `dto/request/` | Object nhận từ JSON body (form đăng ký, tạo tin…) — tách khỏi entity cho rõ ràng. |
| `exception/` | `GlobalExceptionHandler`: bắt lỗi và trả JSON lỗi chuẩn. |
| `security/` | JWT: filter, tạo token, load user. |
| `config/` | `SecurityConfig` (ai được vào URL nào), CORS, seed data… |
| `web/RestResponses.java` | Gói JSON `{ "data": ... }` hoặc `{ "content": ... }` thống nhất. |
| `util/SecurityUtils.java` | `currentUserId()` — id user đang đăng nhập (đọc từ JWT đã gắn vào context). |

**Câu trả lời GV:** “Em tách lớp: controller chỉ điều phối, business nằm service impl, data access là repository.”

---

## Phần 5 — Entity và JPA (tại sao có `@ManyToOne`, `id`?)

- **`BaseEntity`**: hầu hết bảng có `id` (PK tự tăng), `created_at`, `updated_at`.
- **`@ManyToOne`**: nhiều bản ghi bên này thuộc **một** bản ghi bên kia. Ví dụ nhiều `Listing` thuộc một `User` seller → trong `Listing` có `seller` với `@JoinColumn(name = "seller_id")`.

**Câu trả lời GV:** “ORM Hibernate map entity sang bảng MySQL; quan hệ một-nhiều thể hiện bằng khóa ngoại trong bảng con.”

Chi tiết quan hệ: xem `docs/DATABASE-RELATIONSHIPS-HOI-DONG.md`.

---

## Phần 6 — `@Transactional` là gì?

Trong `*ServiceImpl`, nhiều method có `@Transactional`: “các thao tác DB trong method này **cùng một giao dịch**”. Nếu giữa chừng **ném exception**, Spring có thể **rollback** — tránh lệch dữ liệu (ví dụ đã tạo order mà chưa đổi listing).

**Câu trả lời GV:** “Em bọc nghiệp vụ quan trọng trong transaction để đảm bảo toàn vẹn khi nhiều lần `save`.”

---

## Phần 7 — Bảo mật: JWT và `SecurityConfig`

- **`SecurityConfig`**: quy định URL nào **không cần** đăng nhập (`permitAll`) — ví dụ `/api/auth/login`, `GET /api/bikes`, `/payment/**`. Còn lại phải **authenticated**.
- **`JwtAuthenticationFilter`**: đọc header `Authorization: Bearer ...`, giải mã token, lấy `userId` và role, gắn vào `SecurityContext`.
- Trên controller, `@PreAuthorize("hasAnyRole('BUYER','ADMIN')")` chặn sai vai (seller không gọi API buyer).

**Câu trả lời GV:** “Hệ thống stateless JWT; filter xác thực mỗi request; phân quyền theo annotation role.”

---

## Phần 8 — Lỗi trả về cho frontend

- Code nghiệp vụ ném `BadRequestException`, `ForbiddenException`…
- `GlobalExceptionHandler` bắt và trả JSON có `message`, HTTP status tương ứng.

**Câu trả lời GV:** “Exception dùng handler tập trung để API trả lỗi thống nhất.”

---

## Phần 9 — File thanh toán VNPAY (vì sao không nằm dưới `/api`?)

- `PaymentController` đặt ở path `/payment/...` (theo cấu hình VNPAY return URL).
- Cũng **permitAll** vì VNPAY redirect trình duyệt về đây, không gửi Bearer token.

**Câu trả lời GV:** “Callback thanh toán do cổng bên thứ ba gọi nên để route riêng và không bắt JWT.”

---

## Phần 10 — Thứ tự **đọc code** để hiểu dần (khuyến nghị)

Đọc **theo thứ tự** này một lần, mỗi file chỉ cần đọc **chữ ký method** và vài dòng giữa:

1. `QuyduBeApplication.java` — entry.
2. `config/SecurityConfig.java` — ai được vào đâu.
3. `security/JwtAuthenticationFilter.java` (lướt) — token vào context thế nào.
4. `controller/AuthController.java` + `service/impl/AuthServiceImpl.java` — đăng nhập tạo token.
5. `controller/BikeController.java` + `BikeServiceImpl.java` — đọc DB trả danh sách xe.
6. `controller/SellerController.java` — danh sách URL seller; mở **một** method, ví dụ tạo tin → `SellerServiceImpl#createListing`.
7. `controller/BuyerController.java` → `BuyerServiceImpl#createOrderVnpayCheckout` — đặt hàng.
8. `controller/PaymentController.java` (phần `vnpay-return`, `markDepositPaid`) — cọc xong đổi trạng thái đơn.
9. `controller/InspectorController.java` + `InspectorServiceImpl.java`.
10. `controller/AdminController.java` + `AdminServiceImpl.java` (lướt các method kho).

Sau đó lặp lại: **chọn một nút trên web** → tìm API trong Swagger hoặc FE → vào **đúng Controller method** → **Ctrl+click** vào Service.

---

## Phần 11 — Cách **tự trace** một luồng (luyện trước hội đồng)

**Ví dụ:** “Buyer bấm thanh toán cọc.”

1. Biết API: `POST /api/buyer/orders/vnpay-checkout` (hoặc từ Swagger/FE).
2. IntelliJ: **Ctrl+Shift+F** tìm chuỗi `vnpay-checkout` → ra `BuyerController`.
3. Trong method, thấy `buyerService.createOrderVnpayCheckout(...)` → **Ctrl+Alt+B** → `BuyerServiceImpl`.
4. Đọc lần lượt: kiểm tra listing → tạo `Order` → `listingRepository.save` → build URL thanh toán.
5. Sau khi trả tiền: tìm `vnpay-return` trong `PaymentController` → xem gọi `markDepositPaid`.

Làm như vậy **3 luồng**: (1) đăng nhập, (2) seller publish tin, (3) buyer + VNPAY — bạn sẽ quen tay.

---

## Phần 12 — Enum và “trạng thái” (GV hay hỏi)

- `ListingState`: trạng thái **tin** (DRAFT, PUBLISHED, PENDING_INSPECTION, …).
- `OrderStatus`: trạng thái **đơn** (RESERVED, SHIPPING, COMPLETED, …).

Đổi trạng thái = gán `order.setStatus(...)` hoặc `listing.setState(...)` rồi `repository.save`.

**Câu trả lời GV:** “Nghiệp vụ biểu diễn bằng enum string lưu DB; chuyển trạng thái tập trung trong service.”

---

## Phần 13 — Câu hỏi tổng hợp — gợi ý trả lời ngắn

| GV hỏi | Bạn nói gì (ý) |
|--------|-----------------|
| Tại sao tách Service ra khỏi Controller? | Dễ test, tránh nhồi logic vào controller, có thể gọi lại service từ chỗ khác. |
| Repository là gì? | Lớp do Spring Data tạo, thực hiện CRUD/query JPA, không viết SQL tay nhiều. |
| DTO khác Entity chỗ nào? | DTO là dữ liệu request/response; Entity map bảng DB — tách để đổi API mà không đổi schema lung tung. |
| Làm sao biết user hiện tại là ai? | `SecurityUtils.currentUserId()` (hoặc tương đương) lấy từ JWT đã gắn vào SecurityContext. |
| Swagger dùng làm gì? | Liệt kê endpoint, test nhanh không cần FE. |

---

## Phần 14 — Tài liệu trong repo nên đọc kèm

| File | Dùng để |
|------|---------|
| `docs/HOI-DONG-LUONG-VA-CODE-GUIDE.md` | Từng thao tác web → API → file Java |
| `docs/BACKEND-ARCHITECTURE-AND-FLOWS.md` | Luồng nghiệp vụ chi tiết hơn |
| `docs/DATABASE-RELATIONSHIPS-HOI-DONG.md` | PK/FK, quan hệ bảng |
| `docs/sql/ALL-FLOWS-BY-ROLE.sql` | Truy vấn minh họa DB |

---

## Phần 15 — Thực tế khi “em không nhớ hết code”

Hội đồng không yêu cầu **thuộc từng dòng**. Bạn chỉ cần:

1. Nói đúng **lớp trong luồng** (Controller → Service → Repository).  
2. Nói **điều kiện chính** (ví dụ “chỉ khi listing PUBLISHED mới được đặt”).  
3. Biết **mở IntelliJ** tìm tên method hoặc path mapping.

Nếu lạc: **Swagger** hoặc **tìm chuỗi URL** trong project là cách an toàn nhất.

Chúc bạn đọc dần sẽ hiểu hết “khung” backend; chi tiết từng case nằm trong `*ServiceImpl` tương ứng.
