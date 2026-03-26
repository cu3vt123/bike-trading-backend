# Cấu trúc Frontend – Theo main-course-project-clone

> Tái cấu trúc theo mẫu feature-based, dễ mở rộng.

## Nhánh BE2 (monorepo)

Cùng thư mục gốc `src/` còn chứa **Spring Boot**:

- `src/main/java/` — mã Java (`com.biketrading.backend`, …)
- `src/main/resources/` — `application.properties`, static template, …

Khi refactor FE, **không xóa / không đổi tên** `main/java` và `main/resources`. Backend entry: `BikeTradingBackendApplication.java`.

## Thư mục chính (phần Frontend trong `src/`)

```
src/
├── app/                    # App root, router, providers
│   ├── App.tsx
│   ├── router.tsx         # createBrowserRouter (không có route /cart)
│   └── providers/
│       ├── index.ts
│       ├── RouterProvider.tsx
│       └── ThemeProvider.tsx   # Dark/light mode, class "dark" trên html
│
├── features/              # Theo từng tính năng
│   ├── auth/              # Login, Register, Forgot, Reset
│   ├── landing/           # HomePage
│   ├── bikes/             # ProductDetailPage
│   ├── buyer/             # Checkout, Transaction, Finalize, Success, Profile
│   ├── seller/            # Dashboard, ListingEditor, Stats, Profile
│   ├── inspector/         # InspectorDashboard
│   └── support/           # Support, Wishlist
│
├── shared/                # Dùng chung
│   ├── components/
│   │   ├── common/        # GuestRoute, ProtectedRoute, RequireAuth, RequireBuyer, RequireSeller, RequireInspector
│   │   └── ui/            # Button, Card, Input, ...
│   ├── constants/         # API_ENDPOINTS, hero (HERO_SLIDES)
│   ├── layouts/           # MainLayout
│   ├── pages/             # ForbiddenPage
│   └── types/             # UserRole
│
├── lib/                   # Utils, config
│   ├── env.ts             # env.API_URL, env.USE_MOCK_API
│   ├── apiClient.ts       # Axios + Bearer + 401; FormData → bỏ Content-Type
│   ├── apiConfig.ts       # API_BASE_URL, API_PATHS (**BUYER.ORDERS_***, **SELLER.ORDERS**, **ADMIN** warehouse / re-inspection), USE_MOCK_API
│   ├── apiErrors.ts       # getApiErrorMessage (đọc { message } từ BE)
│   ├── orderOverrides.ts  # Ghi đè trạng thái đơn cục bộ (demo / debug UI)
│   ├── listingSnapshotFromOrder.ts  # Lấy snapshot listing từ object order (hiển thị)
│   ├── utils.ts
│   └── validateExpiry.ts  # Kiểm tra ngày hết hạn thẻ (trả errorKey cho i18n)
│
├── locales/               # i18n (react-i18next)
│   ├── vi.json            # Tiếng Việt
│   └── en.json            # English
│
├── apis/                  # Gọi apiClient + API_PATHS (xem bảng **Luồng Order** bên dưới)
├── services/              # buyerService, sellerService, reviewService; mock & fallback; xem docs/FRONTEND-API-FLOWS.md
├── pages/                 # (giữ tạm) Các page – features re-export từ đây
├── components/            # (giữ tạm) Header, ListingCard, ui
├── layouts/               # (giữ tạm) MainLayout
├── stores/                # useAuthStore, useWishlistStore, useNotificationStore, useLanguageStore
├── types/                 # auth, shopbike, **order.ts** (Order, CreateOrderRequest, status, fulfillmentType, …)
└── mocks/                 # Mock data
```

## Luồng API Order trên Frontend (có — phân tán theo tầng)

Dự án **có** đầy đủ luồng gọi API liên quan **đơn mua xe** (buyer), **đơn phía seller** (giao hàng / danh sách), **kho & kiểm định lại** (admin), và **đánh giá sau đơn**. Không có một folder riêng tên `orders/`; code nằm trong **`apis/*`**, **`services/*`**, **`types/order.ts`**, **`lib/order*.ts`**, và các trang **`features/buyer/*`**, **`features/seller/*`**, admin.

### Bảng tra cứu nhanh

| Vai trò | File chính (FE) | API / path (khai báo trong `apiConfig.ts`) |
|---------|-----------------|--------------------------------------------|
| **Buyer** | `src/apis/buyerApi.ts` → **`orderApi`** | `POST .../buyer/orders/vnpay-checkout`, `.../vnpay-resume`, `.../vnpay-pay-balance`, `GET/PUT .../buyer/orders`, `.../:id`, `.../complete`, `.../cancel`; legacy `POST .../orders`, `.../payments/initiate` |
| **Buyer (logic + mock)** | `src/services/buyerService.ts` | Bọc `orderApi`: `createVnpayCheckoutOrder`, `fetchOrderById`, `fetchMyOrders`, `completeOrder`, `cancelOrder`, `resumeVnpayCheckoutOrder`, `payBalanceVnpayOrder`, … + `orderOverrides` |
| **Seller** | `src/apis/sellerApi.ts` | `GET /seller/orders`, `PUT /seller/orders/:orderId/ship-to-buyer` |
| **Seller (dashboard)** | `src/services/sellerService.ts` | `fetchSellerDashboardOrders`, xử lý thông báo: `sellerOrderNotificationFlow.ts` |
| **Admin (kho)** | `src/apis/adminApi.ts` | `GET .../admin/orders/warehouse-pending`, `PUT .../confirm-warehouse`, `GET .../re-inspection`, `PUT .../re-inspection-done` |
| **Admin (thông báo)** | `src/services/adminOrderNotificationFlow.ts` | Phân loại đơn cho UI admin (không thay thế `adminApi`) |
| **Review theo đơn** | `src/apis/reviewApi.ts` | `POST .../buyer/orders/:orderId/review` (path trong `API_PATHS.REVIEWS`) |
| **Kiểu dữ liệu** | `src/types/order.ts` | `Order`, `CreateOrderRequest`, enum status / `fulfillmentType` khớp BE |

**Trang (UI) gọi service/API:** chủ yếu `features/buyer/` (Checkout, Transaction, Finalize, Success), `features/seller/` (dashboard đơn), các trang `admin/*` — chi tiết mapping: [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md), luồng xử lý: [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md).

**Backend tham chiếu (Node demo):** `backend/src/controllers/buyerController.js`, `sellerController.js`, `adminController.js` (không nằm trong cây `src/` FE ở trên).

## Quy ước

- **features/** – Mỗi feature có `index.ts` re-export pages, hooks, services
- **shared/** – Component, layout, constant dùng chung
- **app/** – Router config, providers
- **lib/** – API client, env, utils — luồng chi tiết: [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md)

## Import

```ts
import { LoginPage, RegisterPage } from "@/features/auth";
import { HomePage } from "@/features/landing";
import { GuestRoute, RequireAuth } from "@/shared/components/common";
import { env } from "@/lib/env";
```
