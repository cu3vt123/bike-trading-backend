# Chạy Spring Boot cục bộ — Quydu (`quydu_be`)

Tài liệu này tương đương phần **“Phần A — Backend Spring Boot”** và mục **local setup** trong [bike-trading-backend quydu12](https://github.com/cu3vt123/bike-trading-backend/tree/quydu12), nhưng cho **repo chỉ Java** (không có `package.json` ở root).

## Yêu cầu

| Thành phần | Ghi chú |
|------------|---------|
| **JDK 17** | Khớp `java.version` trong `pom.xml`. Kiểm tra: `java -version`. |
| **Maven** | Dùng wrapper: `mvnw.cmd` (không cần cài Maven global). |
| **MySQL** | Service đang chạy; database trong URL (mặc định `quydu_db`) có thể được tạo nhờ `createDatabaseIfNotExist=true`. |

## Bước 1 — Bản sao cấu hình local (khuyến nghị)

Tránh lộ secret:

1. Sao chép `src/main/resources/application-local.properties.example` → `src/main/resources/application-local.properties`.
2. Điền **trên máy bạn** `spring.datasource.url` / `username` / `password` và **`app.jwt-secret`** (tên key trong Bespring **phải** là `app.jwt-secret`, khớp `JwtTokenProvider`). **Đừng** commit file local; **đừng** dán block chứa mật khẩu DB hay JWT lên GitHub / Discord công khai.
3. **VNPAY sandbox:** `.example` có credential TEST và **`vnpay.returnUrl=http://localhost:8081/payment/vnpay-return`** — khớp `PaymentController`. `vnpay.ipnUrl` chỉ cần khi test IPN qua HTTPS public (ngrok).

File `application-local.properties` đã được thêm vào `.gitignore`.

## Bước 2 — Profile `local`

Trong `application.properties` đã có **`spring.profiles.default=local`**: chỉ cần có `application-local.properties` rồi **Run** bình thường (IntelliJ không bắt buộc nhập Active profiles).  
Muốn tắt local: đặt biến môi trường **`SPRING_PROFILES_ACTIVE`** khác (vd. `prod`) hoặc VM option `-Dspring.profiles.active=prod`.

**Cách A — biến môi trường (PowerShell, session hiện tại):**

```powershell
$env:SPRING_PROFILES_ACTIVE = "local"
.\mvnw.cmd spring-boot:run
```

**Cách B — IntelliJ / VS Code:** trong Run configuration của Spring Boot, đặt **Active profiles:** `local`, hoặc biến môi trường `SPRING_PROFILES_ACTIVE=local`, hoặc VM options `-Dspring.profiles.active=local`.  
(Lưu ý: `-Dspring-boot.run.profiles=local` chỉ dùng khi chạy qua **`mvn spring-boot:run`**, không phải tên VM option chuẩn cho main class trực tiếp.)

**Cách C — một dòng Maven:**

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

Khi profile `local` bật, các giá trị trong `application-local.properties` **ghi đè** `application.properties`.

## Bước 3 — Chạy ứng dụng

Thư mục làm việc: **thư mục gốc** của repo (`quydu_be`, nơi có `pom.xml` và `mvnw.cmd`).

```powershell
cd D:\SWP392\quydu_be
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

Entrypoint Java: `com.minhyun.quydu_be.QuyduBeApplication`.

### Tài khoản BUYER mẫu (chỉ profile `local`)

Lần đầu start với profile `local`, ứng dụng **tự tạo** user **BUYER** nếu email `buyer@local.dev` chưa tồn tại:

- **Email:** `buyer@local.dev`
- **Mật khẩu:** `Buyer@123`

Dùng tài khoản này cho `POST /api/auth/login` và **`vnpay-checkout`**. Nếu bạn đăng nhập **SELLER** mà vào checkout vẫn bị **403**, đó là đúng theo rule bảo mật — hãy login buyer (hoặc user trên).

## Cổng, health, Swagger

- API: **http://localhost:8081** (xem `server.port`).
- Health: **GET** [http://localhost:8081/api/health](http://localhost:8081/api/health).
- **Swagger UI** (OpenAPI): [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html) — thử API cần JWT: đăng nhập → **Authorize** → dán token dạng `Bearer` + access token.

## CORS và frontend Vite

BE cấu hình `app.cors.allowed-origins` (mặc định Vite `5173`). Có thể **thêm** origin qua `app.cors.extra-origins` (ngăn cách phẩy), ví dụ preview deploy. Chi tiết `VITE_*`: [FRONTEND-INTEGRATION.md](FRONTEND-INTEGRATION.md).

## So với monorepo quydu12

Repo này **chỉ backend Java**; frontend Vite chạy ở folder/repo riêng (hai terminal: `mvnw spring-boot:run` + `npm run dev` tại FE).

## VNPAY sandbox — kiểm tra nhanh

- Bật profile **`local`** và đảm bảo `application-local.properties` có `vnpay.tmnCode` + `vnpay.hashSecret` không rỗng.
- `POST http://localhost:8081/payment/create` với body `{"orderId":1}` (thay `1` bằng ID đơn có trong DB) phải trả `paymentUrl` ký VNPAY, không báo *VNPAY is not configured*.
- **GET** `/payment/create` cố ý trả **405** — chỉ dùng POST; xem [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md).

## Xử lý sự cố (Windows)

| Hiện tượng | Hướng xử lý |
|------------|------------|
| Không kết nối MySQL | Kiểm tra service, firewall, user/password, `jdbc:mysql://...` trong profile `local`. |
| `app.jwt-secret` / placeholder | Phải có giá trị không rỗng; HS256 cần đủ độ dài an toàn (secret mạnh). |
| `VNPAY is not configured` / HTTP 503 | Chưa nạp secret: kiểm tra profile `local`, file `application-local.properties`, xem README mục Verify. |
| CORS | Đảm bảo FE đúng origin đã liệt kê trong `app.cors.allowed-origins`; thêm origin nếu đổi cổng Vite. |
| PowerShell + `npm` (khi chạy FE) | Lỗi `npm.ps1` → `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` hoặc dùng `npm.cmd`, hoặc CMD. |

Tài liệu sâu hơn: [README quydu12](https://github.com/cu3vt123/bike-trading-backend/blob/quydu12/README.md).
