# Chạy Spring Boot cục bộ — Quydu (`quydu_be`)

Tài liệu này tương đương phần **“Phần A — Backend Spring Boot”** và mục **local setup** trong [bike-trading-backend quydu12](https://github.com/cu3vt123/bike-trading-backend/tree/quydu12), nhưng cho **repo chỉ Java** (không có `package.json` ở root).

## Yêu cầu

| Thành phần | Ghi chú |
|------------|---------|
| **JDK 17** | Khớp `java.version` trong `pom.xml`. Kiểm tra: `java -version`. |
| **Maven** | Dùng wrapper: `mvnw.cmd` (không cần cài Maven global). |
| **MySQL** | Service đang chạy; database trong URL (mặc định `quydu_db`) có thể được tạo nhờ `createDatabaseIfNotExist=true`. |

## Bước 1 — Bản sao cấu hình local (khuyến nghị)

Tránh commit mật khẩu / JWT / VNPay thật:

1. Sao chép `src/main/resources/application-local.properties.example` → `src/main/resources/application-local.properties`.
2. Sửa `spring.datasource.username`, `spring.datasource.password`, `app.jwt-secret` (chuỗi dài, ngẫu nhiên).

File `application-local.properties` đã được thêm vào `.gitignore`.

## Bước 2 — Kích hoạt profile `local`

**Cách A — biến môi trường (PowerShell, session hiện tại):**

```powershell
$env:SPRING_PROFILES_ACTIVE = "local"
.\mvnw.cmd spring-boot:run
```

**Cách B — VS Code / Run:** thêm VM option hoặc env `SPRING_PROFILES_ACTIVE=local` trong launch configuration (Extension Pack for Java).

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

## Cổng, health, Swagger

- API: **http://localhost:8081** (xem `server.port`).
- Health: **GET** [http://localhost:8081/api/health](http://localhost:8081/api/health).
- **Swagger UI** (OpenAPI): [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html) — thử API cần JWT: đăng nhập → **Authorize** → dán token dạng `Bearer` + access token.

## CORS và frontend Vite

BE cấu hình `app.cors.allowed-origins` (mặc định Vite `5173`). Có thể **thêm** origin qua `app.cors.extra-origins` (ngăn cách phẩy), ví dụ preview deploy. Chi tiết `VITE_*`: [FRONTEND-INTEGRATION.md](FRONTEND-INTEGRATION.md).

## So với monorepo quydu12

Repo này **chỉ backend Java**; frontend Vite chạy ở folder/repo riêng (hai terminal: `mvnw spring-boot:run` + `npm run dev` tại FE).

## Xử lý sự cố (Windows)

| Hiện tượng | Hướng xử lý |
|------------|------------|
| Không kết nối MySQL | Kiểm tra service, firewall, user/password, `jdbc:mysql://...` trong profile `local`. |
| `app.jwt-secret` / placeholder | Phải có giá trị không rỗng; HS256 cần đủ độ dài an toàn (secret mạnh). |
| CORS | Đảm bảo FE đúng origin đã liệt kê trong `app.cors.allowed-origins`; thêm origin nếu đổi cổng Vite. |
| PowerShell + `npm` (khi chạy FE) | Lỗi `npm.ps1` → `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` hoặc dùng `npm.cmd`, hoặc CMD. |

Tài liệu sâu hơn: [README quydu12](https://github.com/cu3vt123/bike-trading-backend/blob/quydu12/README.md).
