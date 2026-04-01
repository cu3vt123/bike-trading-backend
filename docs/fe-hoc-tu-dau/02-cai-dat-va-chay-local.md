# 02 — Cài đặt và chạy local

Mục tiêu: sau các bước dưới đây, bạn mở được **http://localhost:5173** và app không báo lỗi do thiếu dependency hoặc thiếu `.env`.

Chi tiết song song: [README.md](../../README.md) (root repo).

---

## 1. Chuẩn bị môi trường

1. Cài **Node.js LTS** (khuyến nghị **v20+**).
2. Mở terminal trong thư mục **gốc repo** (nơi có `package.json` — thường là `c:\SWP\frontend` hoặc tên bạn đặt khi clone).
3. Kiểm tra:
   ```bash
   node -v
   npm -v
   ```

---

## 2. Cài dependency

```bash
npm install
```

Chạy lại lệnh này sau mỗi lần `git pull` nếu đồng đội thêm gói npm.

---

## 3. Tạo file `.env`

Ở **root** repo (cùng cấp với `package.json`):

```bash
cp .env.example .env
```

Trên Windows CMD: `copy .env.example .env` — PowerShell: `Copy-Item .env.example .env`.

**Không** commit file `.env` lên Git (thường đã nằm trong `.gitignore`).

---

## 4. Hai kịch bản chạy

### Kịch bản A — Chỉ UI + mock API (không cần backend)

Trong `.env`:

```env
VITE_USE_MOCK_API=true
```

```bash
npm run dev
```

Phù hợp khi bạn **chỉ học FE** hoặc backend chưa chạy.

### Kịch bản B — FE + API thật (Spring Bespring)

1. Chạy backend theo [BACKEND-BESPRING-CHAY-API.md](../BACKEND-BESPRING-CHAY-API.md).
2. Trong `.env` (root FE):

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

3. `npm run dev`.

**Lưu ý:** Sau khi sửa `.env`, **restart** `npm run dev` (Vite đọc biến môi trường lúc khởi động).

---

## 5. Các lệnh npm hay dùng

| Lệnh | Ý nghĩa |
|------|---------|
| `npm run dev` | Dev server Vite, hot reload |
| `npm run build` | Build production |
| `npm run preview` | Xem bản build local |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript không emit file — bắt lỗi kiểu |

---

## 6. Sự cố thường gặp (tóm tắt)

| Hiện tượng | Hướng xử lý |
|------------|-------------|
| Trang trắng + lỗi trong Console | Đọc stack trace; thường do import sai hoặc env |
| Network Error khi đăng nhập | BE có chạy không? `VITE_API_BASE_URL` đúng? CORS? |
| Vẫn ra dữ liệu “cũ” sau khi đổi API | Restart dev server; xóa cache trình duyệt nếu cần |
| `VITE_USE_MOCK_API=true` nhưng vẫn gọi mạng | Kiểm tra đúng file `.env` ở **root**, không nhầm thư mục con |

---

**Tiếp theo:** [03-luong-chay-ung-dung.md](./03-luong-chay-ung-dung.md) — từ `main.tsx` tới cây provider.
