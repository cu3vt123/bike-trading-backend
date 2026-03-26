# So sánh kiến trúc Frontend ShopBike — Bản cũ (V1) và bản hiện tại (V2)

Tài liệu mô tả **điểm khác biệt** giữa cách tổ chức dữ liệu và form **trước refactor** (V1) và **sau refactor** (V2), cùng **điểm mạnh / điểm yếu** để onboard và quyết định tiếp tục phát triển.

**Phạm vi:** lớp React (state server, form, HTTP). Không đổi nghiệp vụ BE hay routes chính.

---

## 1. Định nghĩa ngắn

| | **V1 (bản cũ)** | **V2 (bản hiện tại)** |
|---|-----------------|----------------------|
| **Server state** | `useState` + `useEffect` + gọi hàm trong `services/*` | **TanStack Query** (`useQuery` / `useQueries` / `invalidateQueries`) |
| **Form auth** | Controlled component + `useState`, validate tay hoặc rải rác | **React Hook Form** + **Zod** (`zodResolver`) |
| **HTTP / auth** | `apiClient`: Bearer + 401 → `clearTokens` | Giữ Bearer + **401 → thử `POST /auth/refresh`** (axios thuần) → retry 1 lần; không refresh được thì `clearTokens` |
| **Logout** | Chỉ Zustand `clearTokens` | `clearTokens` + **`queryClient.removeQueries()`** (tránh lộ cache user trước) |
| **Query keys** | Không chuẩn hóa | `src/lib/queryKeys.ts` — invalidate thống nhất |
| **Chi tiết listing (public)** | Logic trong `useEffect` từng trang | `fetchListingDetailForPage` + `useListingDetailQuery` |

---

## 2. Điểm khác biệt cụ thể (theo file / hành vi)

### 2.1 Tải danh sách & trang có dữ liệu server

- **V1:** Mỗi trang tự `useEffect` fetch, tự `setLoading` / `setError` / `setData`; dễ lệch nhau về loading/error/empty.
- **V2:** `useQuery` với `queryKey`, cache, refetch có kiểm soát; nhiều trang dùng chung hook (`useListingsQuery`, `useSellerDashboardQueries`, …).

### 2.2 Sau khi ghi dữ liệu (mutation)

- **V1:** Gọi lại API tay (`fetchSellerDashboardOrders()` sau ship, v.v.) hoặc cập nhật state cục bộ — dễ lệch với server.
- **V2:** `invalidateQueries` theo `queryKeys` (seller dashboard, inspector pending, `listings`, …) để UI đồng bộ với BE.

### 2.3 Form đăng nhập / đăng ký / forgot / reset

- **V1:** Nhiều `useState`, validate trùng logic với message i18n rải trong component.
- **V2:** Schema Zod (có factory nhận `t` cho i18n) + `useMutation` trong custom hook; nút submit `disabled` khi `isPending`.

### 2.4 `apiClient`

- **V1:** 401 → xóa session ngay.
- **V2:** Bỏ qua refresh cho các path auth công khai; có `refreshToken` thì gọi `/auth/refresh` rồi retry request — **cần BE triển khai đúng contract** (xem `apiConfig` `AUTH.REFRESH`).

### 2.5 Phần chưa nâng cấp hết sang V2 (có chủ đích)

- **Admin dashboard:** vẫn nhiều `load*` theo tab (file lớn); có thể chuyển dần sang `useQuery` + `enabled` theo tab.
- **Purchase success / Transaction / Finalize:** luồng order snapshot + fallback listing phức tạp — vẫn dùng `useEffect` để giữ hành vi đúng.

---

## 3. Điểm mạnh (V2 so với V1)

| Điểm mạnh | Giải thích ngắn |
|-----------|-----------------|
| **Cache & trạng thái server rõ ràng** | Giảm fetch trùng, dễ debug bằng DevTools React Query. |
| **Đồng bộ sau thao tác** | `invalidateQueries` thay cho gọi lại tay từng chỗ. |
| **Form bền vững hơn** | Zod + RHF giảm bug validation và trùng message. |
| **Logout an toàn hơn** | Xóa cache query, giảm rủi ro hiển thị dữ liệu user trước. |
| **Sẵn sàng mở rộng** | Khớp hướng dẫn kat-minh (React Query, RHF) và checklist hardening. |

---

## 4. Điểm yếu / rủi ro (V2)

| Điểm yếu / rủi ro | Ghi chú |
|-------------------|---------|
| **Độ phức tạp ban đầu** | Dev mới cần đọc `queryKeys`, hooks `queries/`, và luồng invalidate. |
| **Phụ thuộc BE refresh** | Nếu `/auth/refresh` không có hoặc contract sai, user vẫn bị đăng xuất khi access hết hạn (hành vi an toàn nhưng trải nghiệm có thể “cứng”). |
| **Bundle size** | Thêm `@tanstack/react-query`, `react-hook-form`, `zod` — chấp nhận được so với lợi ích. |
| **Tài liệu cần theo kịp** | `FRONTEND-API-FLOWS.md` / `STRUCTURE.md` phải nói rõ tầng Query + hooks (đã bổ sung dần). |

---

## 5. Khi nào vẫn “giống V1” là hợp lý

- Luồng **một lần** hoặc **phụ thuộc điều kiện phức tạp** (redirect VNPay, snapshot order) — ưu tiên **đúng hành vi** hơn là ép Query.
- **UI thuần** (mở dialog, scroll) — không cần Query.

---

## 6. Tham chiếu mã

| Nội dung | Vị trí (gợi ý) |
|-----------|----------------|
| Query client + provider | `src/lib/queryClient.ts`, `src/app/providers/QueryClientProvider.tsx`, `src/app/App.tsx` |
| Query keys | `src/lib/queryKeys.ts` |
| Hooks query | `src/hooks/queries/*.ts`, `src/hooks/useListingsQuery.ts` |
| Auth mutations / logout | `src/hooks/useAuthMutations.ts`, `src/hooks/useLogout.ts` |
| Schemas form | `src/lib/authSchemas.ts` |
| Axios + refresh | `src/lib/apiClient.ts` |
| Listing detail tách service | `src/services/listingDetailService.ts` |

---

## 7. Hướng dẫn thực hành (cho dev)

### 7.1 Checklist khi thêm màn hình có dữ liệu server

1. Xác định **API** và **query key** (thêm vào `src/lib/queryKeys.ts` nếu chưa có).
2. Tạo hoặc tái sử dụng hook trong `src/hooks/queries/` với `useQuery({ queryKey, queryFn })`.
3. Trong component, dùng `isPending` / `isError` / `data` từ hook — tránh tự `useEffect` fetch trùng logic (trừ luồng đặc biệt như VNPay redirect).
4. **Không** hard-code `queryKey` dạng mảng rải rác; luôn tham chiếu `queryKeys.*`.

### 7.2 Checklist sau khi gọi API ghi (POST/PUT/DELETE)

1. Xác định **query nào** phụ thuộc dữ liệu vừa đổi (ví dụ: danh sách đơn, danh sách listing, dashboard seller).
2. Trong handler `async`, sau `await` thành công:

   ```ts
   await queryClient.invalidateQueries({ queryKey: queryKeys.buyer.orders });
   ```

3. Nếu có **chi tiết một entity** (một đơn, một tin), thêm invalidate theo id: `queryKeys.order.buyer(id)`, `queryKeys.listingBuyer(id)`, v.v.
4. Với **danh sách công khai** (trang chủ), thường cần `queryKeys.listings` sau khi trạng thái tin/đơn ảnh hưởng hiển thị trên home.

### 7.3 Khi đọc code cũ (V1) trong cùng repo

- Một số trang (Transaction, Finalize, Admin) vẫn **kết hợp** `useEffect` + local state + service — đó là có chủ đích (snapshot order, redirect).
- **Đừng** refactor hàng loạt sang Query nếu không có thời gian test; chỉ thêm invalidate khi sửa bug đồng bộ cache.

### 7.4 Form auth

- Schema nằm trong `src/lib/authSchemas.ts` (Zod + `t` cho i18n).
- Mẫu: `useForm` + `zodResolver` + `useMutation` trong `useAuthMutations.ts`.

### 7.5 Logout

- Gọi `useLogout()` hoặc logic tương đương: **`clearTokens` + `queryClient.removeQueries()`** — tránh hiển thị dữ liệu user trước sau khi session kết thúc.

---

*Tài liệu này đi kèm cập nhật mục lục [docs/README.md](README.md). Phiên bản V2 align với refactor trong repo (2026-Q1). §7 bổ sung hướng dẫn thực hành (2026-03-26).*
