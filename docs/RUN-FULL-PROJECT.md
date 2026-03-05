# Hướng dẫn chạy toàn bộ dự án ShopBike (Frontend + Backend)

> Mục tiêu: bất kỳ backend dev nào (hoặc AI) cũng có thể **tự chạy full dự án trên máy** mà không cần VSCode, chỉ dùng terminal + trình duyệt.

---

## 1. Chuẩn bị môi trường

1. **NodeJS** (bắt buộc cho cả FE & BE)
   - Tải tại `https://nodejs.org` (chọn bản LTS).
   - Sau khi cài xong, mở `Command Prompt` hoặc `PowerShell`:
     ```bash
     node -v
     npm -v
     ```
     Nếu hiện version là OK.

2. **Git** (nếu cần clone repo)
   - Tải tại `https://git-scm.com/download/win`.

> Không bắt buộc cài MongoDB: backend demo có thể chạy bằng **Mongo in-memory**.

---

## 2. Cấu trúc chính của dự án

```text
frontend/                 # Thư mục gốc (nơi bạn đang đứng)
├── src/                  # React + Vite frontend
├── backend/              # NodeJS + Express + Mongo (MERN backend demo)
└── docs/                 # Tài liệu FE–BE (API, flow, v.v.)
```

Backend quan trọng cho BE/AI đọc:

- `backend/README.md`
- `backend/docs/DEMO-BACKEND-GUIDE.md`
- `backend/docs/PORTING-NODE-TO-SPRING-BOOT.md`
- `docs/HUONG-DAN-BACKEND.md` (contract FE–BE)

---

## 3. Chạy Backend (NodeJS/Express)

Làm trong thư mục `backend`:

```bash
cd backend
npm install
copy .env.example .env   # nếu lần đầu chưa có
npm run dev
```

- Server chạy tại: `http://localhost:8081/api`
- Lần đầu có thể tải MongoDB in-memory (~600MB) → chờ cho tải xong.

> Nếu muốn dùng MongoDB thật: xem `backend/README.md` phần **Run with real MongoDB**.

Khi cần dừng backend: quay lại cửa sổ terminal đang chạy và bấm `Ctrl + C`.

---

## 4. Chạy Frontend (React + Vite)

Mở **cửa sổ terminal mới** (không tắt backend) và về lại thư mục gốc `frontend` (nơi có `package.json` của FE):

```bash
cd /c/SWP/frontend        # chỉnh lại path đúng với máy bạn

npm install               # nếu chưa cài
copy .env.example .env    # nếu lần đầu chưa có
```

Mở file `.env` và đảm bảo hai dòng sau (để FE gọi backend thật):

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

Sau đó chạy FE:

```bash
npm run dev
```

- Vite sẽ hiện URL, mặc định: `http://localhost:5173`
- Mở trình duyệt và truy cập `http://localhost:5173`.

---

## 5. Luồng demo full stack

Sau khi backend và frontend đều đang chạy:

1. **Trang chủ** (`/`)
   - FE gọi `GET /api/bikes` để lấy danh sách xe.
2. **Chi tiết xe** (`/bikes/:id`)
   - FE gọi `GET /api/bikes/:id`.
3. **Đăng nhập**
   - FE gọi `POST /api/auth/login` với `role` = `BUYER` / `SELLER` / `INSPECTOR` / `ADMIN`.
   - Tài khoản demo: xem `backend/README.md` hoặc `backend/docs/DEMO-BACKEND-GUIDE.md`.
4. **Seller flow**
   - Trang seller dashboard, tạo listing, submit kiểm định → dùng `/api/seller/...`.
5. **Inspector flow**
   - Trang inspector dashboard, xem pending listings, approve/reject/need-update → dùng `/api/inspector/...`.
6. **Buyer checkout**
   - Chọn xe, checkout, tạo order → `/api/buyer/orders` + `/api/buyer/payments/initiate`.

Chi tiết request/response cho từng API: đọc `docs/HUONG-DAN-BACKEND.md`.

---

## 6. Dành cho backend Java Spring Boot

Khi backend NodeJS đã chạy ổn và bạn muốn viết lại bằng Java Spring Boot, làm theo thứ tự:

1. Đọc:
   - `docs/HUONG-DAN-BACKEND.md` – **contract FE–BE** (quan trọng nhất).
   - `backend/docs/PORTING-NODE-TO-SPRING-BOOT.md` – mapping model + controller.
2. Implement backend Spring Boot:
   - Giữ nguyên path (`/api/auth/...`, `/api/bikes`, `/api/seller/...`, `/api/inspector/...`). 
   - Trả JSON đúng như docs.
3. Đổi FE sang dùng Spring Boot:
   - Trong `.env` của FE, sửa `VITE_API_BASE_URL` trỏ sang backend Spring Boot mới (ví dụ `http://localhost:8081/api`).
4. Chạy lại FE (`npm run dev`) và test lại các luồng như ở mục 5.

Khi Spring Boot tuân theo contract hiện tại, frontend không cần đổi code – chỉ đổi URL backend trong `.env`.

