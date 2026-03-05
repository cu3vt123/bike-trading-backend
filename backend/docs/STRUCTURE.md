# Cấu trúc Backend – Theo 03-shoppingCartBE

> Cấu trúc học từ `C:\back\ch05-nodejs\02-practice\03-shoppingCartBE`

## Thư mục chính

```
src/
├── server.js              # Entry point, khởi tạo app
├── seed.js                # Seed demo data
│
├── constants/             # Hằng số
│   ├── httpStatus.js     # HTTP status codes (200, 401, 404, ...)
│   └── messages.js      # Response messages
│
├── controllers/          # Xử lý request, gọi services
│   ├── authController.js
│   ├── bikesController.js
│   ├── buyerController.js
│   ├── sellerController.js
│   └── inspectorController.js
│
├── middlewares/          # Middleware
│   ├── error.middlewares.js   # defaultErrorHandler – bắt mọi error
│   └── auth.middlewares.js    # requireAuth, requireRole
│
├── models/               # Mongoose schemas + custom Errors
│   ├── User.js
│   ├── Listing.js
│   ├── Order.js
│   └── Errors.js         # ErrorWithStatus (custom error có status)
│
├── routes/               # Định nghĩa routes
│   ├── authRoutes.js
│   ├── bikesRoutes.js
│   ├── buyerRoutes.js
│   ├── sellerRoutes.js
│   └── inspectorRoutes.js
│
├── services/             # (tùy chọn) Business logic – tách từ controller
│   └── ...
│
├── utils/                # Helper functions
│   ├── handler.js        # wrapAsync – bọc async handler, tự catch → next(err)
│   └── http.js           # ok, created, badRequest, unauthorized, ...
│
└── config/               # Cấu hình
    └── db.js             # connectDb (Mongoose)
```

## Quy ước (theo shoppingCartBE)

### 1. wrapAsync

Mọi async controller phải bọc bằng `wrapAsync` để error tự động chuyển sang error middleware:

```js
import { wrapAsync } from "../utils/handler.js";

router.post("/login", wrapAsync(loginController));
```

### 2. Error handler

Đặt `defaultErrorHandler` **cuối cùng** trong app. Bắt mọi error từ `next(err)`.

### 3. ErrorWithStatus

Khi cần throw error với status cụ thể:

```js
import { ErrorWithStatus } from "../models/Errors.js";

throw new ErrorWithStatus({ message: "Email already exists", status: 422 });
```

### 4. Constants

Dùng `HTTP_STATUS`, `AUTH_MESSAGES` từ `constants/` thay vì magic number/string.

### 5. Middleware

- `middlewares/auth.middlewares.js` – requireAuth, requireRole
- `middlewares/error.middlewares.js` – defaultErrorHandler

## So sánh với shoppingCartBE

| shoppingCartBE | ShopBike Backend |
|----------------|------------------|
| TypeScript | JavaScript (ESM) |
| MongoDB native | Mongoose |
| users.routes | authRoutes, bikesRoutes, buyerRoutes, ... |
| ~/ alias | Relative import |
| services/users.services | Logic trong controllers (có thể tách sau) |
