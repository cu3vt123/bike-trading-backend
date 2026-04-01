# ShopBike — Trợ giúp & FAQ

**Repo frontend:** React/Vite trong `src/`. Backend nằm trên nhánh **`Bespring`** (clone/worktree riêng). Hướng dẫn **cài đặt, chạy, biến môi trường** ở **[README.md](README.md)**.

---

## Tài liệu chính

| Mục | Link | Khi nào mở |
|-----|------|------------|
| **Chạy FE, env, sự cố** | [README.md](README.md) | Điểm vào dự án |
| **Chạy API + nối FE (nhánh Bespring)** | [docs/BACKEND-BESPRING-CHAY-API.md](docs/BACKEND-BESPRING-CHAY-API.md) | Worktree/clone, Swagger, `VITE_API_BASE_URL` |
| **Mục lục `docs/`** | [docs/README.md](docs/README.md) | Chọn file theo tác vụ |
| **Hướng dẫn Frontend (một file)** | [docs/FRONTEND-DEVELOPER-GUIDE.md](docs/FRONTEND-DEVELOPER-GUIDE.md) | Route, API, Query, i18n |
| **Tra cứu API, role, routes, env** | [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) | Khi code hoặc debug API |
| **Kiến trúc FE V1 vs V2** | [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md) | Query, invalidate |
| **Kiểm tra luồng** | [docs/FE-ARCHITECTURE-V1-VS-V2.md — Phụ lục](docs/FE-ARCHITECTURE-V1-VS-V2.md#phu-luc-kiem-tra-luong-api) | Trước merge |
| **Luồng code → API** | [docs/FRONTEND-API-FLOWS.md](docs/FRONTEND-API-FLOWS.md) | axios/service |
| **Backend (mã nguồn)** | Nhánh `Bespring` trên GitHub | Không nằm trong repo FE |

---

## Câu hỏi thường gặp (FAQ)

### Làm sao chạy FE mà không cần Java?

- Sao chép `.env.example` → `.env`, đặt `VITE_USE_MOCK_API=true`, chạy `npm install` và `npm run dev`.  
- Xem [README.md](README.md) phần **Bắt đầu nhanh**.

### FE kết nối Spring ở cổng nào?

- Mặc định tài liệu dùng `http://localhost:8081/api` — cần đồng bộ với `server.port` + `context-path` (nếu có) trong Spring.  
- `VITE_API_BASE_URL` phải **không** có dấu `/` ở cuối.

### Sửa đơn / hủy đơn xong mà danh sách trên trang khác vẫn cũ?

- Kiến trúc V2 dùng **TanStack Query** — sau thao tác ghi API cần **`invalidateQueries`** với đúng `queryKeys` (ví dụ `buyer.orders`, `listings`).  
- Chi tiết: [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md) phần **hướng dẫn thực hành**.

### `/auth/refresh` là gì?

- FE có thể gửi refresh token khi 401; backend cần implement đúng contract.  
- Nếu không có refresh, user sẽ bị đăng xuất khi access token hết hạn.  
- Xem [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) và `src/lib/apiClient.ts`.

## Gợi ý xử lý nhanh

| Vấn đề | Việc thử |
|--------|----------|
| Lỗi sau khi sửa `.env` | Restart `npm run dev` (Vite chỉ đọc env lúc khởi động). |
| CORS | Cấu hình BE cho `http://localhost:5173`; kiểm tra URL gọi đúng base. |
| Cache lạ | React Query DevTools (nếu bật) hoặc `invalidateQueries` sau mutation. |
| Import lỗi `@/...` | Kiểm tra `tsconfig` alias và đường dẫn thật trong [docs/STRUCTURE.md](docs/STRUCTURE.md). |
| TypeScript báo lỗi nhưng `npm run build` vẫn chạy xong | Chạy **`npm run typecheck`** (`tsc --noEmit`) — xem [README.md](README.md) mục **Lệnh npm & chất lượng**. |

---

*Cập nhật: đồng bộ với README gốc và mục lục docs; nhắc `typecheck`.*
