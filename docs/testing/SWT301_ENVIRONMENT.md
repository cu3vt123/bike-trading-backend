# SWT301 — Môi trường & cấu hình chạy demo

Tài liệu này mô tả **cách bật frontend**, **nối backend**, **biến môi trường**, và **xử lý lỗi thường gặp** khi demo hoặc test thủ công.

---

## 1. Kiến trúc tối thiểu khi demo “full stack”

```
Trình duyệt  →  Vite (FE) :5173  →  HTTP  →  API Spring/Node :8081  →  DB
```

- **FE:** React + Vite, mặc định **`http://localhost:5173`**.  
- **BE:** REST dưới base path **`/api`** (ví dụ `http://localhost:8081/api`).  
- **Cùng máy:** tránh lệch cổng; nếu BE chạy cổng khác, chỉnh `VITE_API_BASE_URL` cho khớp.

---

## 2. Frontend — cài đặt và chạy

Từ **thư mục gốc** của project frontend (nơi có `package.json`):

```bash
npm install
npm run dev
```

### Các lệnh khác (tham khảo)

| Lệnh | Khi nào dùng |
|------|----------------|
| `npm run build` | Kiểm tra build production trước khi merge / demo build |
| `npm run preview` | Xem bản build sau `npm run build` |
| `npm run lint` | ESLint toàn project |

### Xác nhận FE đã lên

1. Mở terminal — Vite in URL (thường `http://localhost:5173`).  
2. Mở trình duyệt — trang chủ ShopBike load được.  
3. Mở DevTools → tab **Console** — không có lỗi đỏ hàng loạt (cảnh báo vàng có thể chấp nhận tùy môi trường).

---

## 3. Biến môi trường (Vite)

FE đọc biến có tiền tố **`VITE_`**. File đặt tại **root frontend**: `.env`, `.env.local`, `.env.development.local`, …

**Lưu ý:** `.env.local` thường nằm trong `.gitignore` — không đẩy secret lên Git.

### 3.1. `VITE_API_BASE_URL`

- **Ý nghĩa:** URL gốc của API (có `/api` ở cuối nếu backend thiết kế như vậy).  
- **Mặc định trong code:** `src/lib/apiConfig.ts` fallback `http://localhost:8081/api`.  
- **Ví dụ `.env.local`:**

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

**Sai URL** → Tab Network: request 404, failed, hoặc CORS (nếu BE không cho origin của Vite).

### 3.2. `VITE_API_TIMEOUT`

- Timeout axios (ms). Mặc định khoảng **15000** nếu không set.

### 3.3. `VITE_USE_MOCK_API`

- Giá trị **`true`**: một số service dùng mock (khi không có BE).  
- **Demo SWT301 / chứng minh defect trên API thật:** nên **`false`** hoặc không set, và chạy BE.

```env
VITE_USE_MOCK_API=false
```

Sau khi sửa `.env.local`, **restart** `npm run dev` (Vite đọc env lúc khởi động).

---

## 4. Backend (Spring trong monorepo)

Repo có thể chứa Spring tại `src/main/java/...`. Cách chạy cụ thể xem **`README.md`** ở root và phần backend trong **`docs/`**.

**Khớp với FE:**

- BE lắng nghe **`8081`** (hoặc đổi BE + đổi `VITE_API_BASE_URL` cùng lúc).  
- Endpoint public/auth/inspector… khớp `docs/QUICK-REFERENCE.md`.

**Spring Security (nhắc nhanh):**

- `/api/inspector/**` cần **`INSPECTOR`** hoặc **`ADMIN`** — liên quan defect DEF-SWT-002.

---

## 5. Backend Node (thư mục `backend/`)

Nếu team chạy **Node** thay cho Spring:

- Đọc `backend/README.md` + cổng trong `server.js` / env.  
- FE vẫn trỏ `VITE_API_BASE_URL` tới đúng base `/api` của Node.

Inspector routes trong Node thường dùng `requireRole(["INSPECTOR", "ADMIN"])` — tương đương ý fix DEF-SWT-002.

---

## 6. CORS

Nếu trình duyệt báo:

> blocked by CORS policy

**Hướng xử lý:**

1. BE bật CORS cho origin `http://localhost:5173` (hoặc cổng Vite thực tế).  
2. Không dùng `file://` mở FE — luôn qua `http://localhost:...`.  
3. Kiểm tra không gọi nhầm URL (http/https, cổng).

Chi tiết cấu hình nằm phía backend (`CorsConfig` Spring hoặc `cors` trong Express).

---

## 7. Tài khoản demo (gợi ý)

Tài khoản seed phụ thuộc **DatabaseSeeder** / `seed.js` của backend. Thường có:

- Buyer / Seller / Inspector / Admin — email/password xem README backend hoặc `docs/QUICK-REFERENCE.md`.

**Trước demo:** đăng nhập 1 lần từng role, ghi lại URL và bước để không lãng phí thời gian trước giảng viên.

---

## 8. Checklist trước khi demo (5 phút)

| # | Việc | OK? |
|---|------|-----|
| 1 | `npm run dev` chạy, trang chủ load | ☐ |
| 2 | BE chạy (hoặc mock bật có chủ đích) | ☐ |
| 3 | Network: request `/api/...` không failed hàng loạt | ☐ |
| 4 | Đăng nhập được ít nhất 1 role cần cho kịch bản | ☐ |
| 5 | Tab Console: không có lỗi đỏ chặn luồng | ☐ |

---

## 9. Xử lý nhanh theo triệu chứng

| Triệu chứng | Hướng xử lý |
|-------------|-------------|
| Trắng trang, lỗi import | `npm install`, xóa `node_modules` và cài lại nếu cần |
| 401 mọi API | Token hết hạn; đăng xuất, đăng nhập lại |
| 403 trên `/api/inspector/**` | Kiểm tra role (Admin/Inspector) và Security backend |
| 404 `/api/...` | Sai `VITE_API_BASE_URL` hoặc BE chưa có route |
| Không load tin `/bikes/:id` khi Inspector | Xem DEF-SWT-001/003 — cần `GET /inspector/listings/:id` + FE |
| DefectList không sinh được | `npm install` (cần `xlsx`), chạy từ root: `node scripts/export-defectlist-xlsx.mjs` |

---

## 10. Liên kết

- [SWT301_DEMO_WALKTHROUGH.md](./SWT301_DEMO_WALKTHROUGH.md) — kịch bản từng bước  
- [SWT301_DEFECTS_AND_EVIDENCE.md](./SWT301_DEFECTS_AND_EVIDENCE.md) — đối chiếu defect  
