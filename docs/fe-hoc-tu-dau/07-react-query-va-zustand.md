# 07 — TanStack React Query và Zustand

Hai thư viện này trả lời hai câu hỏi khác nhau:

- **React Query:** “**Dữ liệu từ server** này đã tải chưa, có cần tải lại không, cache key là gì?”
- **Zustand:** “**State client** (ví dụ auth) cần lưu ở đâu để mọi nơi đọc được?”

---

## 1. TanStack Query (React Query)

### Khái niệm

| Khái niệm | Ý nghĩa |
|-----------|---------|
| `useQuery` | **Đọc** dữ liệu (GET), có `data`, `isLoading`, `error`, `refetch` |
| `useMutation` | **Ghi** dữ liệu (POST/PUT/…), gọi `mutate` khi user submit |
| `queryKey` | “Khóa” định danh cache — **key giống nhau → dùng chung cache** |
| `invalidateQueries` | Đánh dấu dữ liệu **cũ** — Query tự refetch khi cần |

### Trong repo ShopBike

- Cấu hình client mặc định: `src/lib/queryClient.ts` (stale time, retry, …).
- Các key thống nhất: `src/lib/queryKeys.ts` — **khi thêm màn mới**, nên thêm key ở đây thay vì string tự phát.
- Hook bọc query: `src/hooks/queries/*` — page import hook thay vì gọi `useQuery` trực tiếp mỗi file (dễ test và tái sử dụng).

### Sau mutation phải làm gì?

Ví dụ: tạo đơn xong cần list đơn **cập nhật**. Pattern thường gặp:

- `onSuccess` của `useMutation` gọi `queryClient.invalidateQueries({ queryKey: queryKeys.buyer.orders })` (tên minh họa — đọc đúng key trong `queryKeys.ts`).

Nếu quên invalidate, UI có thể **hiển thị cache cũ** dù API đã thành công.

Chi tiết kiến trúc: [FE-ARCHITECTURE-V1-VS-V2.md](../FE-ARCHITECTURE-V1-VS-V2.md).

---

## 2. Zustand

### Khái niệm

**Store** là object **ngoài** cây React; component `subscribe` khi dùng selector.

Trong repo, ví dụ quan trọng: `src/stores/useAuthStore.ts`:

- Lưu `accessToken`, `refreshToken`, `role`, …
- `apiClient` đọc token qua `useAuthStore.getState()` trong interceptor — **không phụ thuộc** vào component đang mount.

### Khi nào dùng Zustand vs React Query?

| Dùng React Query | Dùng Zustand |
|------------------|--------------|
| Dữ liệu **từ server**, có vòng đời cache/refetch | Trạng thái **UI / phiên** (theme, sidebar, token) |
| Nhiều nơi cùng xem một **API** | Cần đọc nhanh **ngoài React** (axios interceptor) |

---

## 3. Auth + Query: tương tác ngắn gọn

1. Login thành công → lưu token vào **Zustand** (và thường localStorage — xem implementation store).
2. Mọi request sau → interceptor gắn **Bearer**.
3. Các query “cần login” thường `enabled: !!isAuthenticated` (hoặc tương đương) để **không** gọi API khi chưa có token.

---

## 4. Lỗi thường gặp

| Hiện tượng | Nguyên nhân có thể |
|------------|-------------------|
| Đổi tab quay lại mới thấy data mới | Chưa invalidate / refetch sau mutation |
| Hook báo loading mãi | Query `enabled: false` hoặc API lỗi im lặng |
| Hai component hai bộ data “lệch” | Hai `queryKey` khác nhau cho cùng resource |

---

**Tiếp theo:** [08-form-i18n-giao-dien.md](./08-form-i18n-giao-dien.md).
