# Cấu trúc Frontend – Theo main-course-project-clone

> Tái cấu trúc theo mẫu feature-based, dễ mở rộng.

## Thư mục chính

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
│   ├── apiClient.ts
│   ├── apiConfig.ts
│   ├── utils.ts
│   └── validateExpiry.ts  # Kiểm tra ngày hết hạn thẻ (trả errorKey cho i18n)
│
├── locales/               # i18n (react-i18next)
│   ├── vi.json            # Tiếng Việt
│   └── en.json            # English
│
├── apis/                  # (giữ tạm) authApi, bikeApi, buyerApi, ...
├── services/              # buyerService, sellerService, `sellerOrderNotificationFlow.ts` (tách luồng thông báo seller)
├── pages/                 # (giữ tạm) Các page – features re-export từ đây
├── components/            # (giữ tạm) Header, ListingCard, ui
├── layouts/               # (giữ tạm) MainLayout
├── stores/                # useAuthStore, useWishlistStore, useNotificationStore, useLanguageStore
├── types/                 # auth, shopbike, order
└── mocks/                 # Mock data
```

## Quy ước

- **features/** – Mỗi feature có `index.ts` re-export pages, hooks, services
- **shared/** – Component, layout, constant dùng chung
- **app/** – Router config, providers
- **lib/** – API client, env, utils

## Import

```ts
import { LoginPage, RegisterPage } from "@/features/auth";
import { HomePage } from "@/features/landing";
import { GuestRoute, RequireAuth } from "@/shared/components/common";
import { env } from "@/lib/env";
```
