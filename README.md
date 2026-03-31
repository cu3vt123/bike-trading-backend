# Quydu — Spring Boot API

Backend **Spring Boot** (REST, JWT, MySQL, VNPay sandbox). Repository **Java/Maven**; frontend Vite/React là project riêng.

## Tài liệu tham chiếu (nhánh quydu12)

**[bike-trading-backend — quydu12](https://github.com/cu3vt123/bike-trading-backend/tree/quydu12)** — nghiệp vụ, FE, đặc tả API.

| bike-trading-backend (quydu12) | `quydu_be` |
|--------------------------------|------------|
| `BikeTradingBackendApplication` | `com.minhyun.quydu_be.QuyduBeApplication` |
| Cổng API thường **8081** | `server.port=8081` |
| FE: `VITE_API_BASE_URL=.../api` | Cùng convention `/api/...` |
| Swagger | **http://localhost:8081/swagger-ui/index.html** |

## Chạy nhanh (MySQL + JWT + VNPAY sandbox)

1. **JDK 17** (khuyến nghị theo `pom.xml`; JDK mới hơn có thể cảnh báo Tomcat native — bỏ qua hoặc thêm `--enable-native-access=ALL-UNNAMED` trong Run config).
2. **Bắt buộc:** sao chép `src/main/resources/application-local.properties.example` → `src/main/resources/application-local.properties`.
3. Sửa trong file local: `spring.datasource.password`, `app.jwt-secret`. File example đã có **sandbox VNPAY TEST** (`vnpay.tmnCode`, `vnpay.hashSecret`, …); giữ nguyên hoặc thay credential merchant riêng.
4. Chạy app: **`application.properties` đã đặt `spring.profiles.default=local`** — Spring nạp `application-local.properties` tự động (không cần chỉnh Active profiles trong IDE).

```powershell
cd D:\SWP392\quydu_be
.\mvnw.cmd spring-boot:run
```

(Tuỳ chọn: vẫn có thể truyền `-Dspring-boot.run.profiles=local` để rõ ràng. Production: đặt `SPRING_PROFILES_ACTIVE=prod`.)

**IntelliJ:** Run bình thường; nếu từng đặt Active profiles rỗng hoặc khác, xóa/để mặc định để dùng `spring.profiles.default=local`.

5. Health: [http://localhost:8081/api/health](http://localhost:8081/api/health)  
6. Swagger: [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)

**Tài khoản BUYER dev (profile `local`):** lần đầu chạy, BE tự tạo **`buyer@local.dev` / `Buyer@123`** nếu chưa có. Đăng nhập bằng tài khoản này rồi checkout — tránh 403 do đang dùng session **SELLER**.

### Xác minh VNPAY (không còn `VNPAY is not configured`)

Sau khi có `application-local.properties` + profile `local`, tạo đơn buyer (hoặc dùng `orderId` đã có trong DB), rồi **POST** (không dùng GET trên trình duyệt):

```powershell
curl -s -X POST "http://localhost:8081/payment/create" -H "Content-Type: application/json" -d "{\"orderId\":1}"
```

Kỳ vọng: HTTP **200** và JSON có `data.paymentUrl` chứa `https://sandbox.vnpayment.vn/paymentv2/...`.  
Nếu thiếu `vnpay.tmnCode` / `vnpay.hashSecret`: HTTP **503** (*Service Unavailable*) với `message` hướng dẫn bật profile `local` và file local.

**GET** [http://localhost:8081/payment/create](http://localhost:8081/payment/create) → **405** (chỉ dùng POST + JSON).

Chi tiết path `/payment/*` vs `/api/*`: [docs/PAYMENTS-VNPAY.md](docs/PAYMENTS-VNPAY.md), [docs/FRONTEND-INTEGRATION.md](docs/FRONTEND-INTEGRATION.md).

### Xác minh luồng giống FE (POST `/api/buyer/orders/vnpay-checkout`)

Cần tài khoản **BUYER** và JWT. Lấy token: **POST** `/api/auth/login`, copy `data.accessToken`.

Thay `LISTING_ID` bằng ID tin đăng **PUBLISHED** trong DB; thay `YOUR_ACCESS_TOKEN`:

```powershell
curl -s -X POST "http://localhost:8081/api/buyer/orders/vnpay-checkout" -H "Authorization: Bearer YOUR_ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"listingId\":\"5\",\"plan\":\"DEPOSIT\",\"shippingAddress\":{\"street\":\"1 Le Loi\",\"city\":\"Ho Chi Minh City\"},\"acceptedUnverifiedDisclaimer\":true}"
```

(`listingId` có thể là **số** hoặc **chuỗi số** — backend parse cùng được.)

Kỳ vọng: HTTP **201**, body dạng `{ "data": { "id", "status", "paymentUrl", "txnRef", "vnpayAmountVnd", "vnpayPaymentStatus", "listingId", ... } }`.  
Hoặc dùng Swagger → **Authorize** Bearer → `POST /api/buyer/orders/vnpay-checkout` với body mẫu trên.

Nếu VNPAY chưa cấu hình: HTTP **503**, `message` nêu rõ key thiếu (vd `vnpay.tmnCode`, `vnpay.hashSecret`).

## Tài liệu trong repo

| File | Nội dung |
|------|----------|
| [docs/README.md](docs/README.md) | Mục lục |
| [docs/BACKEND-LOCAL-SETUP.md](docs/BACKEND-LOCAL-SETUP.md) | Windows, Maven, MySQL, profile `local`, VNPAY |
| [docs/PAYMENTS-VNPAY.md](docs/PAYMENTS-VNPAY.md) | Property VNPAY, return URL, test thẻ |
| [docs/FRONTEND-INTEGRATION.md](docs/FRONTEND-INTEGRATION.md) | `VITE_API_BASE_URL`, payment origin |
| [docs/FE-API-PARITY.md](docs/FE-API-PARITY.md) | Đối chiếu FE |

## Bảo mật

- **Không** commit `application-local.properties` (đã `.gitignore`). **Không** dán block chứa mật khẩu DB hay `app.jwt-secret` lên GitHub / Discord công khai — chỉ file local hoặc chat riêng.
- File **`application-local.properties.example`** chỉ là mẫu (password/JWT placeholder; VNPAY có thể là sandbox TEST công khai).
- `application.properties` trong Git chỉ giữ giá trị không nhạy cảm.
