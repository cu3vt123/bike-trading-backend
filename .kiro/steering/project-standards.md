# Project Standards (ShopBike Frontend)

## UI (shadcn-first)
- Use shadcn/ui components by default (Button, Input, Card, Form, Dialog, Table, etc.).
- Avoid building raw Tailwind-only form controls if a shadcn component exists.
- Ensure consistent UI states for pages: Loading / Error / Empty.
- Component structure: layout → page → components.

## Forms (React Hook Form + Zod)
- RHF is the single source of truth for forms.
- Schema-first validation with Zod; keep schemas in `src/utils/rules.ts`.
- Use `zodResolver(schema)` and `z.infer<typeof schema>` for types.
- Do not use `useState` for form fields; do not use `useRef` to manage form values.
- Use `isSubmitting` to prevent double submit.
- Map backend 422 errors to fields with `setError(...)`.

## Routing (React Router v6 + Guards)
- Protected routes use RequireAuth (check Zustand `accessToken`).
- If not authenticated: `Navigate("/login", state:{ from: location }, replace)`.
- `/login` is wrapped with GuestGuard to redirect authenticated users back.

## Auth State (Zustand Persist)
- Tokens stored in Zustand (`accessToken`, `refreshToken`) with persist key `auth-storage`.
- Components must not read/write tokens directly from localStorage.
- Logout calls `clearTokens()` then navigates to `/login` or `/`.

## API Layer (Axios + Interceptors + Refresh)
- Use centralized `apiClient` (axios instance).
- Request interceptor attaches JWT from Zustand.
- Response interceptor returns `response.data`.
- On 401: refresh once with `_retry`; refresh uses plain axios (no interceptors).
- Refresh fail: clear tokens and redirect to login.
- Components call service-layer APIs (authApi, bikesApi); never call axios directly.

## Business Rules (Core)
- Publish listing only after inspection APPROVE.
- Inspection loop: APPROVE→Publish, REJECT→End, NEED_UPDATE→Seller update→Resubmit→Inspect.
- Listing edit rules: Draft editable; Pending locked; Need Update editable; Published restrict core edits.
- FIFO transaction: Available→Reserved(lock after successful deposit)→Sold; Cancel/Fail→Available immediately.
- Refund: simple flow (no in-app dispute), up to 7 days, cancel limit max 3 per period.
