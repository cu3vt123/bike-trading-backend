# ShopBike — Trợ giúp & FAQ

**Repo monorepo:** React/Vite + Spring Boot trong `src/`. Hướng dẫn **cài đặt, chạy, biến môi trường, lộ trình đọc** nằm ở **[README.md](README.md)** — đọc file đó trước.

---

## Tài liệu chính

| Mục | Link | Khi nào mở |
|-----|------|------------|
| **Chạy BE + FE, env, sự cố, bản đồ docs** | [README.md](README.md) | Luôn — điểm vào dự án |
| **Mục lục `docs/`, lộ trình học 3 cấp** | [docs/README.md](docs/README.md) | Chọn đúng file theo tác vụ |
| **Hướng dẫn Frontend chi tiết (một file)** | [docs/FRONTEND-DEVELOPER-GUIDE.md](docs/FRONTEND-DEVELOPER-GUIDE.md) | Route, API, Query, i18n, checklist — ưu tiên khi làm FE |
| **PM / QA / FE làm việc với Backend** | [docs/BACKEND-COLLABORATION.md](docs/BACKEND-COLLABORATION.md) | Thuật ngữ, mẫu báo bug, không cần dạy lại BE |
| **Tra cứu API, role, routes, env** | [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) | Khi code hoặc debug API |
| **Kiến trúc FE V1 vs V2** (Query, invalidate) | [docs/FE-ARCHITECTURE-V1-VS-V2.md](docs/FE-ARCHITECTURE-V1-VS-V2.md) | Sau khi đọc STRUCTURE |
| **Kiểm tra luồng & API V2** | [docs/FE-ARCHITECTURE-V1-VS-V2.md — Phụ lục](docs/FE-ARCHITECTURE-V1-VS-V2.md#phu-luc-kiem-tra-luong-api) | Trước merge / sau đổi Query |
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

### Trang mở được (Vite chạy) nhưng không gọi được API?

1. BE trong IntelliJ có đang **Run** không — thử Swagger.  
2. `.env`: `VITE_USE_MOCK_API=false`, URL đúng cổng/path; sửa xong **restart** `npm run dev`.  
3. DevTools → **Network** / **Console**: lỗi CORS → chỉnh CORS phía BE cho `http://localhost:5173`.  
4. Chi tiết: [docs/FRONTEND-DEVELOPER-GUIDE.md#fe-ket-noi-be](docs/FRONTEND-DEVELOPER-GUIDE.md#fe-ket-noi-be).

### Làm sao thêm màn hình “đang tải” hình xe đạp?

- Dùng sẵn **`BicycleLoader`** / **`BicycleLoadingBlock`** — xem [docs/FRONTEND-DEVELOPER-GUIDE.md#bicycle-loader](docs/FRONTEND-DEVELOPER-GUIDE.md#bicycle-loader).

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
