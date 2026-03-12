# Cấu trúc Frontend – Theo main-course-project-clone

> Tái cấu trúc theo mẫu feature-based, dễ mở rộng.

## Thư mục chính

```
src/
├── app/                    # App root, router, providers
│   ├── App.tsx
│   ├── router.tsx         # createBrowserRouter
│   └── providers/
│       ├── index.ts
│       └── RouterProvider.tsx
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
│   └── utils.ts
│
├── apis/                  # (giữ tạm) authApi, bikeApi, buyerApi, ...
├── services/              # (giữ tạm) buyerService, sellerService, ...
├── pages/                 # (giữ tạm) Các page – features re-export từ đây
├── components/            # (giữ tạm) Header, ListingCard, ui
├── layouts/               # (giữ tạm) MainLayout
├── stores/                # useAuthStore, useWishlistStore, useNotificationStore
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
