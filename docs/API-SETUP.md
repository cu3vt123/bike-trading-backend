# API Setup & Backend Connection

Guide for connecting the Frontend to the Backend API and preparing for Swagger integration.

---

## 1. Current Setup

### Environment Variables

Create `.env` in the frontend root (copy from `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL (no trailing slash) | `http://localhost:8081/api` |
| `VITE_API_TIMEOUT` | Request timeout (ms) | `15000` |
| `VITE_USE_MOCK_API` | `true` = mock data, `false` = real API | `false` |

### API Configuration

- **`src/lib/apiConfig.ts`** – Base URL, timeout, and path constants
- **`src/lib/apiClient.ts`** – Axios instance with JWT interceptor and 401 handling
- **`src/apis/*`** – API modules that use `API_PATHS` from `apiConfig`

### Current Endpoint Mapping

| Module | Paths | Backend Route |
|--------|-------|---------------|
| authApi | `/auth/login`, `/auth/me`, etc. | `POST /api/auth/login`, `GET /api/auth/me` |
| bikeApi | `/bikes`, `/bikes/:id` | `GET /api/bikes`, `GET /api/bikes/:id` |
| buyerApi | `/buyer/orders`, etc. | `POST /api/buyer/orders`, `GET /api/buyer/orders` |
| sellerApi | `/seller/dashboard`, `/seller/listings`, etc. | `GET /api/seller/dashboard` |
| inspectorApi | `/inspector/pending-listings`, etc. | `GET /api/inspector/pending-listings` |

---

## 2. When Swagger Arrives

### Step 1: Compare Paths

1. Open the Swagger/OpenAPI spec from the backend team
2. Compare each path with `src/lib/apiConfig.ts` → `API_PATHS`
3. Update any path that differs (e.g. `/api/v1/auth/login` vs `/auth/login`)

### Step 2: Update Base URL (if needed)

If backend uses a version prefix (e.g. `/api/v1`):

```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

Then in `apiConfig.ts`, paths should NOT include the prefix (they’re relative to baseURL).

### Step 3: Update Response Unwrapping

Current backend returns `{ data: ... }` or `{ content: [...] }`. If the new API changes format:

- Single object: `r.data?.data ?? r.data`
- List: `r.data?.content ?? r.data?.data ?? r.data`

Update these in each `*.ts` API file if the spec differs.

### Step 4: Optional – Generate Types from Swagger

If you use `openapi-typescript` or similar:

```bash
npx openapi-typescript http://localhost:8081/api-docs/swagger.json -o src/types/api.d.ts
```

Then use generated types in API functions.

---

## 3. Quick Connection Test

1. Start backend: `cd backend && npm run dev`
2. Set frontend: `VITE_USE_MOCK_API=false`, `VITE_API_BASE_URL=http://localhost:8081/api`
3. Start frontend: `npm run dev`
4. Log in with `buyer@demo.com` / `Password!1`
5. Check Network tab: requests should go to `http://localhost:8081/api/*`

---

## 4. CORS

Backend CORS is set to `CLIENT_ORIGIN` (default `http://localhost:5173`). If frontend runs on another origin, set in backend `.env`:

```env
CLIENT_ORIGIN=http://localhost:3000
```

---

## 5. File Reference

| File | Purpose |
|------|---------|
| `src/lib/apiConfig.ts` | Base URL, timeout, `API_PATHS` |
| `src/lib/apiClient.ts` | Axios instance, auth header, 401 handling |
| `src/apis/authApi.ts` | Auth endpoints |
| `src/apis/bikeApi.ts` | Public bikes/listings |
| `src/apis/buyerApi.ts` | Buyer orders, payments |
| `src/apis/sellerApi.ts` | Seller dashboard, listings |
| `src/apis/inspectorApi.ts` | Inspector pending, approve, reject |
| `.env` / `.env.example` | Environment config |
