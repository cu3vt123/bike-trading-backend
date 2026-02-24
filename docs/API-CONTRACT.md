# ShopBike – API Contract (cho Backend)

> Tài liệu mô tả các API mà Frontend cần. Backend (Spring Boot) implement theo đúng format này để FE tích hợp được.

**Base URL:** `http://localhost:8081/api` (hoặc domain deploy)

**Headers:** `Content-Type: application/json` | `Authorization: Bearer <token>` (khi cần auth)

---

## Thứ tự ưu tiên (Backend làm lần lượt)

| # | API | Ưu tiên | Ghi chú |
|---|-----|---------|---------|
| 1 | POST /auth/login | Cao | Đăng nhập – cần đầu tiên |
| 2 | POST /auth/signup | Cao | Đăng ký |
| 3 | GET /bikes | Cao | Danh sách xe – trang chủ |
| 4 | GET /bikes/:id | Cao | Chi tiết xe – trang detail |
| 5 | GET /auth/me | Trung bình | Profile user (sau khi login) |
| 6 | Các API orders/payments | Thấp | Sprint 2+ |

---

## 1. Auth – Đăng nhập

**POST** `/api/auth/login`

### Request

```json
{
  "role": "BUYER",
  "emailOrUsername": "buyer@example.com",
  "password": "password123"
}
```

| Field | Type | Bắt buộc | Ghi chú |
|-------|------|----------|---------|
| role | string | Có | `BUYER` \| `SELLER` \| `INSPECTOR` \| `ADMIN` |
| emailOrUsername | string | Có | Email hoặc username |
| password | string | Có | Mật khẩu |

### Response (200)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "optional-refresh-token",
  "role": "BUYER"
}
```

| Field | Type | Ghi chú |
|-------|------|---------|
| accessToken | string | Bắt buộc – JWT |
| refreshToken | string | Tùy chọn |
| role | string | Tùy chọn – FE có thể lấy từ token |

### Lỗi (401)

```json
{
  "message": "Invalid credentials"
}
```

---

## 2. Auth – Đăng ký

**POST** `/api/auth/signup`

### Request

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
| username | string | Có | Tên đăng nhập |
| email | string | Không | Email |
| password | string | Có | Mật khẩu |

### Response (201)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "optional"
}
```

Sau khi đăng ký thành công, FE dùng `accessToken` để auto-login.

---

## 3. Bikes – Danh sách (marketplace)

**GET** `/api/bikes`

Không cần auth. Chỉ trả về listing **đã xuất bản + đã kiểm định duyệt**.

### Response (200)

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

### Các field chính

| Field | Type | Ghi chú |
|-------|------|---------|
| id | string | Bắt buộc |
| title | string | Tiêu đề tin |
| brand | string | Hãng |
| model | string | Model |
| price | number | Giá bán |
| thumbnailUrl | string | Ảnh thumbnail |
| imageUrls | string[] | Danh sách ảnh |
| state | string | `PUBLISHED` |
| inspectionResult | string | `APPROVE` |

**Lưu ý:** Backend có thể wrap trong object `{ data: [...] }` hoặc `{ content: [...] }` – FE đã xử lý cả hai.

---

## 4. Bikes – Chi tiết

**GET** `/api/bikes/:id`

Không cần auth. Trả về chi tiết 1 listing.

### Response (200)

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

**Nếu không tìm thấy:** trả `404` hoặc `null` – FE sẽ hiển thị "Listing not found".

---

## 5. Auth – Profile (sau khi đăng nhập)

**GET** `/api/auth/me`

**Headers:** `Authorization: Bearer <accessToken>`

### Response (200)

```json
{
  "id": "U001",
  "username": "buyer01",
  "email": "buyer@example.com",
  "displayName": "Alex Rider",
  "role": "BUYER"
}
```

---

## 6. CORS

Backend cần cho phép:

- **Origin:** `http://localhost:5173` (Vite dev server)
- **Methods:** GET, POST, PUT, PATCH, DELETE
- **Headers:** Content-Type, Authorization

---

## 7. Một số enum Frontend dùng

### Role

`BUYER` | `SELLER` | `INSPECTOR` | `ADMIN`

### Condition (xe)

`NEW` | `LIKE_NEW` | `MINT_USED` | `GOOD_USED` | `FAIR_USED`

### Listing state

`DRAFT` | `PENDING_INSPECTION` | `NEED_UPDATE` | `PUBLISHED` | `RESERVED` | `SOLD` | `REJECTED`

### Currency

`VND` | `USD`

---

## 8. Liên hệ

Frontend đã sẵn sàng tích hợp. Khi Backend có endpoint, đổi `VITE_USE_MOCK_API=false` và set `VITE_API_BASE_URL` trong `.env`.
