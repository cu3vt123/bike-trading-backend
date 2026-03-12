# Hướng dẫn cho Backend – ShopBike API

> Tài liệu này dành cho team Backend (Java Spring Boot). Mục đích: Frontend cần các API sau để tích hợp. Backend implement theo đúng format dưới đây là FE sẽ kết nối được.

---

## 1. Thông tin chung

- **Base URL:** `http://localhost:8081/api` (hoặc domain khi deploy)
- **Frontend dev:** chạy tại `http://localhost:5173` (Vite)
- **Headers mặc định:** `Content-Type: application/json`
- **Auth:** dùng JWT trong header `Authorization: Bearer <token>`

---

## 2. Cần chuẩn bị trước

### 2.1 CORS

Bật CORS cho origin `http://localhost:5173` để FE gọi được API khi dev.

**Ví dụ Spring Boot:**

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 2.2 Swagger (tùy chọn nhưng nên dùng)

Thêm dependency để có Swagger UI tự động:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

Sau khi chạy, mở `http://localhost:8081/swagger-ui.html` để xem và test API.

---

## 3. Thứ tự làm API (đề xuất)

Làm lần lượt để FE test từng bước:

| Bước | API | Mô tả |
|------|-----|-------|
| 1 | POST /api/auth/login | Đăng nhập |
| 2 | POST /api/auth/signup | Đăng ký |
| 3 | GET /api/bikes | Danh sách xe (trang chủ) |
| 4 | GET /api/bikes/:id | Chi tiết 1 xe |
| 5 | GET /api/auth/me | Lấy thông tin user đang login |
| 6 | Các API orders, payments | Làm sau (Sprint 2+) |

---

## 4. Chi tiết từng API

### 4.1 Đăng nhập

**POST** `/api/auth/login`

**Request body:**

```json
{
  "emailOrUsername": "buyer@example.com",
  "password": "password123"
}
```

| Field | Type | Bắt buộc | Ghi chú |
|-------|------|----------|---------|
| emailOrUsername | string | Có | Email hoặc username |
| password | string | Có | Mật khẩu |

**Lưu ý:** FE không gửi `role` – role lấy từ tài khoản trong DB. User ẩn (isHidden) trả 401 `"Account is hidden"`.

**Response 200 OK:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "optional-refresh-token",
  "role": "BUYER"
}
```

- `accessToken` (bắt buộc): JWT để FE gửi trong header `Authorization`
- `refreshToken`, `role`: tùy chọn

**Response 401 (sai mật khẩu / user không tồn tại):**

```json
{
  "message": "Invalid credentials"
}
```

---

### 4.2 Đăng ký

**POST** `/api/auth/signup`

**Business rules – giới hạn (FE đã validate, Backend cũng phải enforce):**

| Field | Giới hạn |
|-------|----------|
| username | 2–30 ký tự, chỉ chữ cái, số, dấu gạch dưới (_) |
| email | Tùy chọn; nếu có thì phải đúng định dạng, max 100 ký tự |
| password | 8–64 ký tự, **ít nhất 1 chữ in hoa** và **ít nhất 1 ký tự đặc biệt** (!@#$%^&*...) |

**Request body:**

```json
{
  "role": "BUYER",
  "username": "buyer01",
  "email": "buyer@example.com",
  "password": "password123"
}
```

| Field | Type | Bắt buộc | Ghi chú |
|-------|------|----------|---------|
| role | string | Có | Chỉ `BUYER` hoặc `SELLER` |
| username | string | Có | 2–30 ký tự, pattern `^[a-zA-Z0-9_]+$` |
| email | string | Không | Email hợp lệ, max 100 ký tự |
| password | string | Có | 8–64 ký tự, ít nhất 1 chữ in hoa và 1 ký tự đặc biệt |

**Response 201 Created:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "optional"
}
```

FE sẽ dùng `accessToken` để tự động đăng nhập sau khi đăng ký.

---

### 4.3 Danh sách xe (marketplace)

**GET** `/api/bikes`

- Không cần token
- Chỉ trả về xe **đã xuất bản (PUBLISHED) và đã duyệt kiểm định (APPROVE)**

**Response 200 OK:**

Có thể trả **mảng trực tiếp** hoặc **wrap trong object**:

```json
[
  {
    "id": "B001",
    "title": "Specialized Tarmac SL7 2022",
    "brand": "Specialized",
    "model": "Tarmac SL7",
    "year": 2022,
    "price": 4500,
    "msrp": 5200,
    "currency": "USD",
    "frameSize": "54cm",
    "condition": "MINT_USED",
    "location": "Ho Chi Minh City",
    "thumbnailUrl": "https://example.com/bike1.jpg",
    "imageUrls": ["https://example.com/bike1.jpg", "https://example.com/bike1-2.jpg"],
    "state": "PUBLISHED",
    "inspectionResult": "APPROVE",
    "inspectionScore": 4.6
  }
]
```

**Hoặc wrap:** `{ "data": [...] }` hoặc `{ "content": [...] }` – FE đã hỗ trợ.

**Các field quan trọng:**

| Field | Type | Ghi chú |
|-------|------|---------|
| id | string | Bắt buộc |
| title | string | Tiêu đề tin |
| brand | string | Hãng xe |
| model | string | Model |
| price | number | Giá bán |
| thumbnailUrl | string | Ảnh thumbnail |
| imageUrls | string[] | Danh sách URL ảnh |
| state | string | `PUBLISHED` |
| inspectionResult | string | `APPROVE` |

---

### 4.4 Chi tiết 1 xe

**GET** `/api/bikes/:id`

- Không cần token
- `:id` là ID xe (vd: `B001`)

**Response 200 OK:**

```json
{
  "id": "B001",
  "title": "Specialized Tarmac SL7 2022",
  "brand": "Specialized",
  "model": "Tarmac SL7",
  "year": 2022,
  "price": 4500,
  "msrp": 5200,
  "currency": "USD",
  "frameSize": "54cm",
  "condition": "MINT_USED",
  "location": "Ho Chi Minh City",
  "thumbnailUrl": "https://example.com/bike1.jpg",
  "imageUrls": ["https://example.com/bike1.jpg"],
  "state": "PUBLISHED",
  "inspectionResult": "APPROVE",
  "inspectionScore": 4.6,
  "description": "Mô tả chi tiết xe...",
  "specs": [
    { "label": "Frame", "value": "Carbon" },
    { "label": "Wheels", "value": "700c" }
  ],
  "seller": {
    "id": "S01",
    "name": "Alex Rivera",
    "email": "alex@example.com"
  }
}
```

**Field thêm so với danh sách:**

| Field | Type | Ghi chú |
|-------|------|---------|
| description | string | Mô tả chi tiết |
| specs | array | `[{ "label": "...", "value": "..." }]` |
| seller | object | `{ id, name, email }` |

**Không tìm thấy:** trả `404` hoặc body rỗng – FE sẽ hiển thị "Listing not found".

---

### 4.5 Profile user (sau khi đăng nhập)

**GET** `/api/auth/me`

**Headers:** `Authorization: Bearer <accessToken>`

**Response 200 OK:**

```json
{
  "id": "U001",
  "username": "buyer01",
  "email": "buyer@example.com",
  "displayName": "Alex Rider",
  "role": "BUYER"
}
```

**401:** token không hợp lệ hoặc hết hạn.

---

## 5. Enum và giá trị chuẩn

Dùng các giá trị sau để FE hiển thị đúng:

**Role:** `BUYER` | `SELLER` | `INSPECTOR` | `ADMIN`

**Condition (tình trạng xe):** `NEW` | `LIKE_NEW` | `MINT_USED` | `GOOD_USED` | `FAIR_USED`

**Listing state:** `DRAFT` | `PENDING_INSPECTION` | `NEED_UPDATE` | `PUBLISHED` | `RESERVED` | `SOLD` | `REJECTED`

**Currency:** `VND` | `USD`

---

## 6. Khi Backend xong – Frontend cấu hình

1. Chạy Backend: `http://localhost:8081`
2. Tạo file `.env` (copy từ `.env.example`) và đặt:
   ```
   VITE_API_BASE_URL=http://localhost:8081/api
   VITE_USE_MOCK_API=false
   ```
3. Restart dev server (`npm run dev`)
4. Login, Signup, Bikes sẽ gọi API thật

---

## 7. Tóm tắt

| API | Method | Auth | Mô tả |
|-----|--------|------|-------|
| /api/auth/login | POST | Không | Đăng nhập |
| /api/auth/signup | POST | Không | Đăng ký |
| /api/auth/me | GET | Bearer | Profile user |
| /api/bikes | GET | Không | Danh sách xe |
| /api/bikes/:id | GET | Không | Chi tiết xe |

Nếu có thắc mắc về format request/response, có thể hỏi team FE.
