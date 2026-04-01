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
| **react-i18next** | `src/locales/vi.json`, `en.json` — khởi tạo `src/i18n/index.ts` |
| **Tailwind CSS 3** + **shadcn/ui** (Radix) | `src/components/ui/*`, `cn()` |
| **lucide-react** | Icon |

**Lệnh thường dùng:** `npm install`, `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run preview`.

### 1.1 TypeScript path alias và Vite

- **`tsconfig.json`:** `"paths": { "@/*": ["./src/*"] }` — import dạng `@/lib/utils`, `@/features/auth`.
- **`vite.config.js`:** `resolve.alias["@"]` trỏ tới thư mục `./src` (phải khớp với `tsconfig` để IDE và build không lệch).

Khi thêm file mới, luôn dùng `@/` thay vì đường dẫn tương đối dài (`../../../`).

---

## 2. Cài đặt & chạy nhanh

1. Ở **thư mục gốc** (có `package.json`): `npm install`
2. `cp .env.example .env` (Windows CMD: `copy .env.example .env`, PowerShell: `Copy-Item .env.example .env`)
3. Chỉnh `.env` — xem [Biến môi trường](#3-biến-môi-trường-vite)
4. `npm run dev` → mở URL Vite in ra trong terminal (thường **http://localhost:5173**)

**Mock không cần backend:** `VITE_USE_MOCK_API=true` trong `.env`, **restart** dev server.

**API thật:** `VITE_USE_MOCK_API=false` và `VITE_API_BASE_URL` trỏ tới backend (ví dụ Spring `http://localhost:8081/api`).

**Đổi cổng Vite:** `npm run dev -- --port 3000` (hoặc sửa `vite.config.js` nếu team thống nhất).

### 2.1 Chạy trong VS Code / Cursor

1. **File → Open Folder** → chọn thư mục gốc có `package.json` (ví dụ folder `FE`).
2. **Terminal → New Terminal** tại đúng thư mục đó.
3. `npm install` (lần đầu hoặc sau khi đổi `package-lock.json`), rồi `npm run dev`.
4. Mở URL in ra (thường `http://localhost:5173`). Extension **Live Server** không thay cho Vite — luôn dùng `npm run dev`.

<a id="fe-ket-noi-be"></a>

### 2.2 FE mở được nhưng không kết nối được backend

| Kiểm tra | Việc làm |
|---------|----------|
| BE có chạy | IntelliJ Run; thử Swagger / health trên cổng BE. |
| `.env` | `VITE_API_BASE_URL` trùng cổng + path (vd. `http://localhost:8081/api`, **không** `/` cuối); `VITE_USE_MOCK_API=false`. |
| Restart Vite | Sửa `.env` xong **tắt và chạy lại** `npm run dev`. |
| CORS | Console/Network báo CORS → cấu hình BE cho origin `http://localhost:5173` (hoặc cổng Vite thực tế). |
| `localhost` vs `127.0.0.1` | Thống nhất một kiểu cho URL trình duyệt và `VITE_API_BASE_URL`. |

Chi tiết clone/worktree BE: [BACKEND-BESPRING-CHAY-API.md](BACKEND-BESPRING-CHAY-API.md).

---

## 3. Biến môi trường (Vite)

Chỉ biến bắt đầu bằng `VITE_` mới embed vào bundle client. **Sau khi sửa `.env` phải restart** `npm run dev`.

| Biến | Ý nghĩa |
|------|---------|
| `VITE_API_BASE_URL` | Base URL API, **không** có `/` cuối. Ví dụ: `http://localhost:8081/api` |
| `VITE_USE_MOCK_API` | `true` = nhánh mock trong `services` (không gọi BE thật); đọc qua `USE_MOCK_API` trong `apiConfig.ts` |
| `VITE_PAYMENT_API_ORIGIN` | Origin cho luồng demo/thanh toán (không có `/api`) — xem `.env.example` |
| `VITE_API_TIMEOUT` | Timeout ms; mặc định **15000** nếu không set |
| `VITE_VNPAY_MAINTENANCE` | Tuỳ tính năng: banner bảo trì VNPay |

### 3.1 Hai nơi đọc env (cần biết khi refactor)

| File | Export / dùng cho |
|------|-------------------|
| **`src/lib/env.ts`** | `env.API_URL`, `env.USE_MOCK_API`, `env.API_TIMEOUT` — dùng chỗ cần object `env` gọn |
| **`src/lib/apiConfig.ts`** | `API_BASE_URL`, `API_TIMEOUT`, `USE_MOCK_API` — dùng trực tiếp cho `apiClient` và constant path |

Cả hai đều đọc `import.meta.env.VITE_*`. Giữ **cùng một giá trị** với `.env`; tránh hardcode URL trong component.

---

## 4. Cấu trúc thư mục `src/` (tóm tắt có định hướng)

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx          # createBrowserRouter — nguồn sự thật cho mọi route
│   ├── ErrorBoundary.tsx
│   └── providers/          # RouterProvider, QueryClient, Theme
├── features/               # Theo domain; nhiều file re-export từ pages/
├── shared/                 # Re-export layout, guards — có thể trỏ về @/layouts, @/components
├── pages/                  # Trang cụ thể (Profile, Admin, Checkout, AboutUs, …)
├── components/             # Header, Logo, listing UI, ui (shadcn)
├── layouts/                # MainLayout thật (Header + Outlet + footer)
├── lib/                    # apiClient, apiConfig, queryKeys, queryClient, env, apiErrors, utils
├── apis/                   # Hàm gọi HTTP mỏng
├── services/               # Logic + mock + gọi apis
├── hooks/                  # useLogout; hooks/queries/*.ts
├── stores/                 # Zustand
├── i18n/                   # index.ts — init i18next + đồng bộ useLanguageStore
├── locales/                # vi.json, en.json
├── types/                  # order, shopbike, auth…
└── mocks/                  # Dữ liệu mock
```

**Quy tắc:** Feature mới → đặt trong `features/<name>/`, export page qua `index.ts` nếu cần; router import từ `@/features/...` hoặc `@/pages/...` tùy convention từng module (ví dụ `features/buyer` re-export từ `pages/`).

**Layout:** `MainLayout` nằm tại `src/layouts/MainLayout.tsx`; `src/shared/layouts/MainLayout.tsx` có thể chỉ re-export — khi sửa UI khung trang, mở file trong `layouts/`.

---

## 5. Routing (file `src/app/router.tsx`)

### 5.1. Layout chung

- Hầu hết trang nằm trong **`MainLayout`** (`element: <MainLayout />`) + `children`.
- Auth pages (`login`, `register`, `forgot-password`, `reset-password`) **ngoài** MainLayout, bọc **`GuestRoute`** (user chưa đăng nhập).
- **`403`:** route tĩnh `{ path: "403", element: <ForbiddenPage /> }`.

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

**Lazy load:** Nhiều trang dùng `lazy(() => import(...))` + `withSuspense` bọc `<Suspense fallback={<RouteFallback />}>`.

**`useNavigate` + state:** `MainLayout` có thể đọc `location.state.scrollTo` để scroll tới `#listings` (xem `MainLayout.tsx`).

**Thêm route mới:**

1. Tạo component (trong `features/` hoặc `pages/`).
2. Thêm `lazy` + `withSuspense` nếu muốn tách chunk.
3. Chèn `{ path, element }` đúng nhánh `children` (public / `RequireAuth` / `RequireBuyer` / …).
4. Thêm `Link` / `NavLink` trong `Header` hoặc menu nếu cần.
5. Thêm key trong `vi.json` / `en.json` cho mọi nhãn hiển thị.

---

## 6. Bảo vệ route & guard

Các wrapper trong `src/shared/components/common/` (import `@/shared/components/common`):

| Component | Hành vi tóm tắt |
|-----------|-----------------|
| **`GuestRoute`** | Chỉ cho user **chưa** đăng nhập (thường redirect nếu đã có token). |
| **`RequireAuth`** | Cần đăng nhập. |
| **`RequireBuyer`** | Role Buyer — các route checkout/transaction/… |
| **`RequireSeller`** | Role Seller — khu `/seller/*`. |
| **`RequireInspector`** | Inspector (và có thể kết hợp Admin tùy BE). |
| **`RequireAdmin`** | Admin. |

Khi thêm màn hình theo role: đặt route làm **child** của đúng `Require*` để không render UI khi sai quyền.

---

## 7. Lớp API: `apiClient` → `apis` → `services`

1. **`src/lib/apiConfig.ts`** — `API_BASE_URL`, `API_TIMEOUT`, `USE_MOCK_API`, **`API_PATHS`** (object hằng path). Endpoint mới: **thêm hằng tại đây** rồi dùng trong `apis/*`.
2. **`src/lib/apiClient.ts`** — instance Axios: `baseURL`, `timeout`, `withCredentials`, interceptor.
3. **`src/apis/*.ts`** — Hàm gọi HTTP (GET/POST/PUT/DELETE) dùng `apiClient` + `API_PATHS`.
4. **`src/services/*.ts`** — Nếu `USE_MOCK_API` thì trả mock; không thì gọi `apis` + map kiểu dữ liệu.

**Luồng debug:** Component → hook/service → `apis/*` → Network tab (URL đầy đủ = `API_BASE_URL` + path).

### 7.1 Chi tiết `apiClient.ts`

- **Request interceptor:** Gắn `Authorization: Bearer <accessToken>` từ `useAuthStore.getState().accessToken`.
- **FormData:** Nếu `config.data instanceof FormData` thì **xóa** header `Content-Type` để trình duyệt tự gắn `multipart boundary`.
- **401 response:** Không phải endpoint auth “public” → thử `POST .../auth/refresh` với `refreshToken` (gọi bằng `axios` thuần, tránh vòng interceptor). Thành công → `setTokens` + **retry một lần** request gốc (`original._retry = true`). Thất bại hoặc không có refresh → `clearTokens()`.
- Các URL auth (login, signup, refresh, forgot, reset) được coi là **public** — 401 không refresh, có thể clear session tùy logic.

### 7.2 Lỗi API hiển thị cho user — `getApiErrorMessage`

**`src/lib/apiErrors.ts`:** `getApiErrorMessage(err, fallback)` — đọc `response.data.message` nếu có; xử lý timeout, mất mạng, 403/404/5xx. Dùng trong `catch` của mutation/query hoặc try/catch gọi service.

### 7.3 Quy trình thêm API mới (khuyến nghị)

1. Xác nhận contract BE (method, path, body) — [QUICK-REFERENCE](QUICK-REFERENCE.md) / Swagger.
2. Thêm path vào **`API_PATHS`** trong `apiConfig.ts` (nhóm AUTH / BUYER / …).
3. Tạo hoặc cập nhật hàm trong **`src/apis/<domain>Api.ts`** — gọi `apiClient.get/post/...`.
4. Bọc trong **`services`** nếu cần mock hoặc gộp nhiều bước.
5. Trong component/hook: dùng **TanStack Query** (`useQuery` / `useMutation`) và **`invalidateQueries`** sau mutation.

Chi tiết luồng nghiệp vụ: [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md).

---

## 8. TanStack Query & `queryKeys`

- **`src/lib/queryClient.ts`** — `new QueryClient` với mặc định:
  - **queries:** `staleTime: 60_000` (1 phút), `retry: 1`, `refetchOnWindowFocus: false`
  - **mutations:** `retry: 0`
- **`src/lib/queryKeys.ts`** — Toàn bộ key dùng cho `useQuery` / `invalidateQueries`. **Không** tạo mảng key “tự phỏng đoán” rải rác trong component.

Sau **mutation** thành công (tạo/sửa đơn, listing, …): gọi `queryClient.invalidateQueries({ queryKey: queryKeys.... })` đúng phạm vi — ví dụ đơn buyer: `queryKeys.buyer.orders`, chi tiết đơn: `queryKeys.order.buyer(id)`.

**Ví dụ ý tưởng (pseudo):**

```ts
await mutation.mutateAsync(payload);
await queryClient.invalidateQueries({ queryKey: queryKeys.buyer.orders });
```

Đọc sâu: [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md).

---

## 9. Zustand stores (`src/stores/`)

| Store | Vai trò |
|-------|---------|
| `useAuthStore` | `accessToken`, `refreshToken`, `role`, user — persist/hydrate (xem implementation) |
| `useWishlistStore` | Id listing yêu thích (local) |
| `useNotificationStore` | Thông báo UI |
| `useLanguageStore` | `vi` / `en` — đồng bộ với `i18n.changeLanguage` |

**Logout:** hook **`useLogout`** — xóa token, có thể `queryClient.removeQueries` / navigate — đừng chỉ xóa localStorage thủ công mà bỏ qua store.

---

## 10. Form: React Hook Form + Zod

- Schema mẫu: **`src/lib/authSchemas.ts`** — tái sử dụng pattern `z.object` + message i18n.
- **`useForm` + `zodResolver(schema)`** từ `@hookform/resolvers/zod`.
- Hiển thị lỗi: `formState.errors` + `t("...")` cho nhãn trường.

---

## 11. i18n

- **Khởi tạo:** `src/i18n/index.ts` — `i18n.use(initReactI18next).init({ resources, lng, fallbackLng: "vi", ... })`.
- **Ngôn ngữ:** `useLanguageStore.getState().lang` làm `lng` ban đầu; **`useLanguageStore.subscribe`** gọi `i18n.changeLanguage` khi user đổi ngôn ngữ trong Header.
- **File:** `src/locales/vi.json`, `en.json` — key dạng phẳng `common.support` hoặc nested `aboutUs.members.huong.name`.
- **Component:** `useTranslation()` → `t("key")`, plural/interpolation khi cần.
- **`document.documentElement.lang`:** Header (hoặc effect global) có thể set `lang` cho HTML — hỗ trợ accessibility và SEO nhẹ.

---

## 12. UI: Tailwind & component & layout

- **Global CSS:** `src/index.css` — biến theme, `@tailwind` layers, class `.dark` trên `html`.
- **Theme:** `ThemeProvider` (`src/app/providers/ThemeProvider.tsx`) + nút dark/light trên `Header`.
- **Component:** `src/components/ui/*` — Button, Card, Input, … (shadcn-style).
- **Gộp class:** `cn()` từ `@/lib/utils` (clsx + tailwind-merge).

### 12.1 MainLayout

- File: **`src/layouts/MainLayout.tsx`** — `Header`, `<main><Outlet /></main>`, footer (link Support, `#listings`).
- **`location.state.scrollTo`:** Nếu navigate kèm `state: { scrollTo: "listings" }`, layout scroll tới `document.getElementById("listings")` rồi clear state (tránh scroll lặp khi back).

<a id="bicycle-loader"></a>

### 12.2 Loading hình xe đạp (`BicycleLoader`)

Đã có sẵn trong **`src/components/common/BicycleLoader.tsx`** — SVG xe đạp, bánh quay + hiệu ứng trượt nhẹ (`animate-bicycle-glide` trong `tailwind.config.js`). Màu theo **`text-primary`** (theme sáng/tối).

| Export | Khi nào dùng |
|--------|----------------|
| **`BicycleLoader`** | Chỉ icon; props: `size?: "sm" \| "md" \| "lg"`, `noGlide`, `className`. Phù hợp inline (nút, hàng bảng). |
| **`BicycleLoadingBlock`** | Icon + dòng chữ phía dưới; props: `message?: string`, `size`, `className`. Phù hợp **full màn** hoặc vùng chờ data. |

**Ví dụ trong trang (query đang tải):**

```tsx
import { BicycleLoadingBlock } from "@/components/common/BicycleLoader";

if (isPending) {
  return (
    <BicycleLoadingBlock message={t("mycategory.loading")} size="md" />
  );
}
```

**Lazy route:** `src/app/router.tsx` bọc `<Suspense fallback={<RouteFallback />}>` — **`RouteFallback`** (`src/shared/components/common/RouteFallback.tsx`) đã dùng `BicycleLoadingBlock` + `t("common.loading")`. Đổi fallback ở đó nếu muốn toàn app thống nhất một kiểu khác.

**Guard đang kiểm tra auth:** các `RequireAuth`, `RequireBuyer`, … hiển thị **`BicycleLoader`** nhỏ khi chờ hydrate token.

**Thêm chỗ mới:** import component → hiển thị khi `isLoading` / `isPending` của TanStack Query (hoặc `useState` tương đương); thêm key i18n cho `message` trong `vi.json` / `en.json`.

---

## 13. Thêm tính năng FE — checklist

**Màn hình + API:**

- [ ] Route trong `router.tsx` + guard đúng
- [ ] `API_PATHS` + hàm trong `apis/`
- [ ] `service` nếu cần mock / map
- [ ] `queryKeys` (nếu dùng query mới) + hook + `invalidateQueries` sau mutation
- [ ] i18n mọi chuỗi user-facing
- [ ] Xử lý lỗi với `getApiErrorMessage` hoặc toast
- [ ] Trạng thái chờ: `BicycleLoadingBlock` / `BicycleLoader` (§12.2) + `t("...loading")`
- [ ] `npm run lint` + `npm run typecheck` + `npm run build`

**Chỉ UI:**

- [ ] Đặt file đúng `features/` hoặc `components/`
- [ ] `t()` cho text; không ghép chuỗi tiếng Việt trực tiếp trong JSX nếu cần đa ngôn ngữ
- [ ] Responsive (`sm:`, `md:`, `lg:`) cho màn chính

---

## 14. Xử lý sự cố thường gặp (FE)

| Hiện tượng | Hướng xử lý |
|------------|-------------|
| **CORS / Network Error** | BE có chạy không; `VITE_API_BASE_URL` đúng; CORS trên BE cho origin `http://localhost:5173` |
| **401 sau login** | Xem refresh token; tab Network: request có `Authorization` không; interceptor refresh có lỗi không |
| **Sau mutation không đổi list** | Thiếu `invalidateQueries` hoặc sai `queryKey` |
| **Mock không đổi** | `VITE_USE_MOCK_API=true`, restart Vite |
| **Env không ăn** | Tên `VITE_*`; không đặt nhầm trong `import.meta.env` ngoài client; restart dev server |
| **Hydration / flash theme** | Theme lưu local — kiểm tra `ThemeProvider` và class `dark` trên `html` |

Thêm: [README.md](../README.md), [QUICK-REFERENCE.md](QUICK-REFERENCE.md) §10.

---

## 15. Backend (Spring) — repo nhánh Bespring

- Repo nhánh **`front-only`** **không** chứa mã Java. API chạy từ project/backend clone nhánh **`Bespring`** (IntelliJ, MySQL, v.v.).
- Chạy song song: **IntelliJ** — Run BE (thường cổng **8081**); terminal FE — `npm run dev` (**5173**).
- Hướng dẫn worktree/clone và `.env`: [BACKEND-BESPRING-CHAY-API.md](BACKEND-BESPRING-CHAY-API.md).

---

## 16. Chất lượng code

| Việc | Lệnh / ghi chú |
|------|----------------|
| **Lint** | `npm run lint` — ESLint 9, plugin React Hooks / Refresh |
| **Typecheck** | `npm run typecheck` — `tsc --noEmit` (strict); **Vite build không chạy bước này** |
| **Build** | `npm run build` — bundle production; nên kết hợp với `typecheck` trước merge |
| **Preview build** | `npm run preview` — kiểm tra bản production local |

Sửa cảnh báo ESLint trong file đang chạm; tránh `@ts-ignore` trừ khi có lý do ghi chú ngắn.

---

## 17. Tài liệu liên quan (mục lục nhanh)

| File | Nội dung |
|------|----------|
| [STRUCTURE.md](STRUCTURE.md) | Cây thư mục, luồng order trên FE |
| [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) | So sánh V1/V2, cache, invalidate |
| [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | Luồng API chi tiết |
| [FE-ARCHITECTURE-V1-VS-V2 — Phụ lục kiểm tra](FE-ARCHITECTURE-V1-VS-V2.md#phu-luc-kiem-tra-luong-api) | Checklist kiểm tra thủ công |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Endpoint, role, route |
| [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) | Trước khi deploy |
| [README.md](../README.md) | Hướng dẫn gốc repo |

---

*Cập nhật: khi đổi route, `API_PATHS`, hoặc `queryKeys`, nên sửa đồng thời `router.tsx` / `apiConfig.ts` / `queryKeys.ts` và bảng mục 5.2 & 8 trong file này.*
