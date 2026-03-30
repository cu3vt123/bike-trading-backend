# Hướng dẫn chi tiết — Frontend ShopBike

Tài liệu này tập trung **100% vào dev frontend** (React + Vite + TypeScript): cấu trúc repo, routing, dữ liệu, API, form, i18n, UI và quy trình làm việc. Đọc kèm [STRUCTURE.md](STRUCTURE.md) (cây thư mục), [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) (Query/cache), [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) (luồng axios), [QUICK-REFERENCE.md](QUICK-REFERENCE.md) (endpoint & route).

**Entry app:** `src/main.tsx` → `App` → `RouterProvider` → `createBrowserRouter` trong `src/app/router.tsx`.

---

## 1. Stack & công cụ

| Thành phần | Ghi chú |
|------------|---------|
| **React 19** + **TypeScript** | `strict: true`, alias import `@/` → `src/` |
| **Vite 7** | Dev server mặc định `http://localhost:5173`, HMR |
| **react-router-dom 7** | `createBrowserRouter`, nested routes, `NavLink` |
| **TanStack Query** | Server state, cache, `invalidateQueries` |
| **Zustand** | Client state: auth, wishlist, notifications, language |
| **Axios** | `src/lib/apiClient.ts` — Bearer, refresh, timeout |
| **React Hook Form + Zod** | Form + validation (`@hookform/resolvers`) |
| **react-i18next** | `src/locales/vi.json`, `en.json` |
| **Tailwind CSS 3** + **shadcn/ui** (Radix) | `src/components/ui/*`, `cn()` |
| **lucide-react** | Icon |

**Lệnh thường dùng:** `npm install`, `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.

---

## 2. Cài đặt & chạy nhanh

1. Ở **thư mục gốc** (có `package.json`): `npm install`
2. `cp .env.example .env` (Windows: `copy .env.example .env`)
3. Chỉnh `.env` — xem mục [Biến môi trường](#3-biến-môi-trường-vite)
4. `npm run dev` → mở URL Vite in ra (thường port **5173**)

**Mock không cần backend:** `VITE_USE_MOCK_API=true` trong `.env`, restart dev server.

**API thật:** `VITE_USE_MOCK_API=false` và `VITE_API_BASE_URL` trỏ tới backend (ví dụ Spring `http://localhost:8081/api`).

---

## 3. Biến môi trường (Vite)

Chỉ biến bắt đầu bằng `VITE_` mới có trong client. **Sau khi sửa `.env` phải restart** `npm run dev`.

| Biến | Ý nghĩa |
|------|---------|
| `VITE_API_BASE_URL` | Base URL API, **không** có `/` cuối. Ví dụ: `http://localhost:8081/api` |
| `VITE_USE_MOCK_API` | `true` = dùng mock trong services (không gọi BE thật) |
| `VITE_PAYMENT_API_ORIGIN` | Origin cho luồng demo/thanh toán (không có `/api`) |
| `VITE_API_TIMEOUT` | Timeout ms (tuỳ `apiClient`) |
| `VITE_VNPAY_MAINTENANCE` | Tuỳ tính năng: banner bảo trì VNPay |

Đọc giá trị qua `src/lib/env.ts` (không hardcode URL trong component).

---

## 4. Cấu trúc thư mục `src/` (tóm tắt có định hướng)

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx          # createBrowserRouter — nguồn sự thật cho mọi route
│   ├── ErrorBoundary.tsx
│   └── providers/          # RouterProvider, QueryClient, Theme
├── features/               # Theo domain: auth, landing, bikes, buyer, seller, inspector, support
├── shared/                 # Layout, guards, UI dùng chung, types chung
├── pages/                  # Một số trang đặt trực tiếp (Profile, Admin, AboutUs, VNPay…)
├── components/             # Header, Logo, listing cards… (có thể overlap với shared)
├── layouts/                # Bản legacy / alias; router dùng shared/layouts
├── lib/                    # apiClient, apiConfig, queryKeys, env, utils
├── apis/                   # Hàm gọi HTTP thuần (map API_PATHS)
├── services/               # Logic + mock + gọi apis
├── hooks/                  # useLogout, queries trong hooks/queries/
├── stores/                 # Zustand: auth, wishlist, notifications, language
├── locales/                # i18n JSON
├── types/                  # order, shopbike, auth…
└── mocks/                  # Dữ liệu mock
```

**Quy tắc:** Feature mới → ưu tiên đặt trong `features/<name>/` và export qua `index.ts`; route chỉ import từ `features` hoặc `pages` tùy convention hiện tại.

---

## 5. Routing (file `src/app/router.tsx`)

### 5.1. Layout chung

- Hầu hết trang nằm trong **`MainLayout`** + children.
- Auth pages (`login`, `register`, `forgot-password`, `reset-password`) **ngoài** MainLayout, bọc **`GuestRoute`** (chưa đăng nhập).

### 5.2. Bảng route chính (cập nhật theo `router.tsx`)

| Path | Guard / layout | Ghi chú |
|------|----------------|---------|
| `/` | Public | `HomePage` — marketplace |
| `/bikes/:id` | Public | Chi tiết tin (lazy) |
| `/support` | Public | Hỗ trợ |
| `/about-us` | Public | Giới thiệu / đội ngũ |
| `/wishlist` | Public | Yêu thích |
| `/payment/vnpay-demo`, `/payment/vnpay-result` | Public | VNPay demo / callback |
| `/profile`, `/notifications` | `RequireAuth` | Đã login |
| `/inspector` | `RequireInspector` | Inspector |
| `/admin` | `RequireAdmin` | Admin |
| `/checkout/:id`, `/transaction/:id`, `/finalize/:id`, `/success/:id` | `RequireBuyer` | Luồng buyer |
| `/seller`, `/seller/stats`, `/seller/packages`, `/seller/listings/...` | `RequireSeller` | Seller |
| `/login`, `/register`, … | `GuestRoute` | Auth |

**Lazy load:** Nhiều trang dùng `lazy()` + `<Suspense fallback={<RouteFallback />}>`.

**Thêm route mới:**

1. Tạo component (feature hoặc `pages/`).
2. Thêm `lazy` + `withSuspense` nếu cần.
3. Chèn object `{ path, element }` đúng nhóm guard.
4. Thêm link trong `Header` / menu nếu là mục điều hướng công khai.
5. Thêm key i18n nếu có nhãn mới.

---

## 6. Bảo vệ route & guard

Các wrapper trong `src/shared/components/common/` (hoặc `@/shared/...`):

- **`GuestRoute`** — chỉ cho user **chưa** có token (trang login/register).
- **`RequireAuth`** — cần đăng nhập.
- **`RequireBuyer`**, **`RequireSeller`**, **`RequireInspector`**, **`RequireAdmin`** — kiểm tra `role` trong store (và thường redirect `/login` hoặc `/403`).

Khi thêm route role-specific: đặt làm `children` của đúng `Require*` để không lộ UI.

---

## 7. Lớp API: `apiClient` → `apis` → `services`

1. **`src/lib/apiConfig.ts`** — `API_BASE_URL`, `API_PATHS` (object path chuẩn). Mọi path mới nên khai báo tại đây.
2. **`src/lib/apiClient.ts`** — Axios instance: `Authorization: Bearer`, xử lý 401/refresh (nếu BE hỗ trợ), FormData bỏ `Content-Type` tự động.
3. **`src/apis/*.ts`** — Hàm gọi HTTP mỏng (GET/POST/PUT…) với type request/response.
4. **`src/services/*.ts`** — Ghép `api` + mock + `USE_MOCK_API` + business nhỏ (map dữ liệu).

**Luồng đọc khi debug:** Component → hook/service → `apis/*` → `apiClient` → Network tab.

Chi tiết từng nhóm endpoint: [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md), [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md).

---

## 8. TanStack Query & `queryKeys`

- **`src/lib/queryKeys.ts`** — Hằng số key cho `useQuery` / `invalidateQueries`. **Không** dùng string rời rạc khắp nơi.
- Sau **mutation** (tạo/sửa đơn, listing, …): gọi `queryClient.invalidateQueries({ queryKey: queryKeys.... })` đúng phạm vi để tránh list/detail lệch.

Đọc sâu: [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md).

---

## 9. Zustand stores (`src/stores/`)

| Store | Vai trò |
|-------|---------|
| `useAuthStore` | `accessToken`, `role`, user — hydrate từ storage |
| `useWishlistStore` | Id listing yêu thích (local) |
| `useNotificationStore` | Thông báo UI |
| `useLanguageStore` | `vi` / `en` — đồng bộ với i18n |

Logout: dùng `useLogout` — xóa token + clear query nếu cần.

---

## 10. Form: React Hook Form + Zod

- Schema auth: `src/lib/authSchemas.ts` (có thể mở rộng pattern tương tự cho form khác).
- Resolver: `@hookform/resolvers/zod`.
- Thông báo lỗi: ưu tiên `t()` từ i18n cho message hiển thị user.

---

## 11. i18n

- Cấu hình: `src/i18n.ts`.
- File: `src/locales/vi.json`, `en.json` — namespace phẳng hoặc nested `aboutUs.members...`.
- Component: `useTranslation()` → `t("key")`.
- **Header / SEO:** `document.documentElement.lang` được cập nhật theo ngôn ngữ (xem `Header`).

---

## 12. UI: Tailwind & component

- **Global:** `src/index.css` — biến CSS/theme, `dark` class trên `html`.
- **Theme:** `ThemeProvider` + toggle trong `Header`.
- **Component:** `src/components/ui/*` (Button, Card, Input, …) — pattern shadcn.
- **Gộp class:** `cn()` từ `@/lib/utils`.

---

## 13. Thêm tính năng FE — checklist

**Màn hình + API:**

- [ ] Route trong `router.tsx` + guard đúng
- [ ] `API_PATHS` + hàm trong `apis/`
- [ ] `service` nếu cần mock / map
- [ ] `queryKeys` + hook `useXxxQuery` / mutation + `invalidateQueries`
- [ ] i18n cho mọi chuỗi hiển thị
- [ ] `npm run lint` + `npm run build`

**Chỉ UI:**

- [ ] Component đặt đúng feature/shared
- [ ] `t()` cho text
- [ ] Responsive (sm/md/lg) nếu là layout chính

---

## 14. Xử lý sự cố thường gặp (FE)

| Hiện tượng | Hướng xử lý |
|------------|-------------|
| **CORS / Network Error** | BE có chạy không, `VITE_API_BASE_URL` đúng, CORS cho `http://localhost:5173` |
| **401 sau login** | Token, refresh; interceptor trong `apiClient` |
| **Sau mutation không đổi list** | Thiếu `invalidateQueries` hoặc sai `queryKey` |
| **Mock không đổi** | `VITE_USE_MOCK_API=true`, restart Vite |
| **Env không ăn** | Tên phải `VITE_*`, restart dev server |

Thêm: [README.md](../README.md) mục xử lý sự cố, [QUICK-REFERENCE.md](QUICK-REFERENCE.md) §10.

---

## 15. Monorepo với Spring (Java)

- Code Java: `src/main/java/`, không đụng khi chỉ sửa FE.
- Vite chỉ bundle `src/**/*.tsx`… theo `tsconfig` + `vite.config` — không compile Java.
- Chạy song song: terminal 1 Spring (`8081`), terminal 2 `npm run dev` (`5173`).

---

## 16. Tài liệu liên quan (mục lục nhanh)

| File | Nội dung |
|------|----------|
| [STRUCTURE.md](STRUCTURE.md) | Cây thư mục, luồng order trên FE |
| [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) | So sánh V1/V2, cache, invalidate |
| [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | Luồng API chi tiết |
| [FE-V2-VERIFICATION-GUIDE.md](FE-V2-VERIFICATION-GUIDE.md) | Checklist kiểm tra thủ công |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Endpoint, role, route |
| [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) | Trước khi deploy |
| [README.md](../README.md) | Hướng dẫn gốc repo |

---

*Cập nhật: mục đích là một điểm vào duy nhất cho dev frontend — khi đổi route hoặc cấu trúc, nên sửa đồng thời `router.tsx` và bảng trong mục 5.2 của file này.*
