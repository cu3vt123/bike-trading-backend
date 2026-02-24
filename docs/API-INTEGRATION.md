# Hướng dẫn gộp API thật khi Backend sẵn sàng

> **Cho Backend:** Gửi file [HUONG-DAN-BACKEND.md](./HUONG-DAN-BACKEND.md) – hướng dẫn đầy đủ các API cần implement.

---

## Buyer API (SHOP-21 scaffold)

| Endpoint | Method | Ghi chú |
|----------|--------|---------|
| `/bikes` | GET | Danh sách listing (chỉ PUBLISHED + APPROVE) |
| `/bikes/:id` | GET | Chi tiết listing |
| `/buyer/orders` | POST | Tạo order |
| `/buyer/orders/:id` | GET | Chi tiết order |
| `/buyer/orders` | GET | Danh sách order của buyer |
| `/buyer/payments/initiate` | POST | Khởi tạo thanh toán |
| `/buyer/payments/confirm/:orderId` | POST | Xác nhận thanh toán |
| `/buyer/profile` | GET | Profile buyer |
| `/buyer/transactions/:orderId` | GET | Trạng thái transaction |

`buyerService.ts` có fallback mock khi API lỗi. Set `VITE_USE_MOCK_API=true` để force dùng mock.

---

## Auth API

Khi 2 bạn làm Backend có API, chỉ cần đổi vài chỗ.

---

## 1. Cấu hình baseURL

File `.env` (hoặc `.env.local`):

```
VITE_API_BASE_URL=http://localhost:8081/api
```

`apiClient` đã dùng biến này (`src/lib/apiClient.ts`).

---

## 2. Đổi Login: mock → API thật

**Vị trí:** `src/pages/LoginPage.tsx`

**Hiện tại (mock):**
```ts
const res = await mockLogin({ role, emailOrUsername, password });
```

**Khi có API – đổi thành:**
```ts
import { authApi } from "@/apis/authApi";

const res = await authApi.login({ role, emailOrUsername, password });
setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken, role });
```

Cách xử lý response giữ nguyên, chỉ cần thay lời gọi.

---

## 3. Đổi Register: mock → API thật

**Vị trí:** `src/pages/RegisterPage.tsx`

**Hiện tại (mock):**
```ts
const res = await mockSignup({ role, username, email, password });
```

**Khi có API – đổi thành:**
```ts
import { authApi } from "@/apis/authApi";

const res = await authApi.signup({
  role: role as "BUYER" | "SELLER",
  username,
  email: email || undefined,
  password,
});
```

---

## 4. Cấu trúc đã chuẩn bị

| File | Ghi chú |
|------|---------|
| `src/lib/apiClient.ts` | Axios instance, baseURL, Bearer token, 401 → logout |
| `src/apis/authApi.ts` | `login`, `signup`, `getProfile` – sẵn sàng gọi |
| `src/apis/buyerApi.ts` | Order, payment, transaction, profile – scaffold |
| `src/services/buyerService.ts` | Facade có fallback mock khi API lỗi |
| `src/stores/useAuthStore.ts` | Lưu token + role, dùng trong `apiClient` |

---

## 5. Backend cần chuẩn bị

- **CORS:** Mở cho `http://localhost:5173` (FE dev) – xem SHOP-33
- **Endpoints** (baseURL đã có `/api`):
  - `POST /auth/login` → `{ accessToken, refreshToken?, role }`
  - `POST /auth/signup` → `{ accessToken, refreshToken?, role }`
- **Contract:** Gửi cho FE Swagger/OpenAPI để đối chiếu payload

---

## 6. Tóm tắt

- Đổi `mockLogin` → `authApi.login` trong LoginPage
- Đổi `mockSignup` → `authApi.signup` trong RegisterPage
- Cấu hình `VITE_API_BASE_URL` trong `.env`
- Không cần sửa `apiClient`, `useAuthStore` hay flow token
