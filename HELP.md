# ShopBike — Trợ giúp & FAQ

**Repo monorepo:** React/Vite + Spring Boot trong `src/`. Hướng dẫn **cài đặt, chạy, biến môi trường, lộ trình đọc** nằm ở **[README.md](README.md)** — đọc file đó trước.

---

## Tài liệu chính

| Mục | Link | Khi nào mở |
|-----|------|------------|
| **Chạy BE + FE, env, sự cố, bản đồ docs** | [README.md](README.md) | Luôn — điểm vào dự án |
| **Mục lục `docs/`, lộ trình học 3 cấp** | [docs/README.md](docs/README.md) | Chọn đúng file theo tác vụ |
| **PM / QA / FE làm việc với Backend** | [docs/BACKEND-COLLABORATION.md](docs/BACKEND-COLLABORATION.md) | Thuật ngữ, mẫu báo bug, không cần dạy lại BE |
| **Tra cứu API, role, routes, env** | [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) | Khi code hoặc debug API |
| **Kiến trúc FE V1 vs V2** (Query, invalidate) | [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md) | Sau khi đọc STRUCTURE |
| **Luồng code → API** | [docs/FRONTEND-API-FLOWS.md](docs/FRONTEND-API-FLOWS.md) | Tìm đúng chỗ gọi axios/service |
| **Backend sau clone/pull (Node + Spring)** | [docs/BACKEND-LOCAL-SETUP.md](docs/BACKEND-LOCAL-SETUP.md) | Full stack local, cổng 8081 |
| **Backend Node (tham chiếu)** | [backend/README.md](backend/README.md) | Nếu repo có thư mục `backend/` |

**Maven / Spring Boot** (plugin, JPA): xem [Apache Maven](https://maven.apache.org/guides/index.html) và tài liệu Spring Boot nếu chỉnh `pom.xml`.

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

### File test Excel / DefectList có commit không?

- Thường **không** — nằm trong `docs/testing/` hoặc `generated/` và có thể bị `.gitignore`.  
- Xem [docs/testing/README.md](docs/testing/README.md).

---

## Gợi ý xử lý nhanh

| Vấn đề | Việc thử |
|--------|----------|
| Lỗi sau khi sửa `.env` | Restart `npm run dev` (Vite chỉ đọc env lúc khởi động). |
| CORS | Cấu hình BE cho `http://localhost:5173`; kiểm tra URL gọi đúng base. |
| Cache lạ | React Query DevTools (nếu bật) hoặc `invalidateQueries` sau mutation. |
| Import lỗi `@/...` | Kiểm tra `tsconfig` alias và đường dẫn thật trong [docs/STRUCTURE.md](docs/STRUCTURE.md). |

---

*Cập nhật: đồng bộ với README gốc và mục lục docs.*
