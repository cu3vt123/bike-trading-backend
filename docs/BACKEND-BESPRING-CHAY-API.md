# Chạy API backend (nhánh Bespring) — dành cho dev Frontend

Repo **`front-only`** chỉ có **React + Vite**. Mã **Spring Boot / MySQL** nằm trên **cùng remote GitHub**, nhánh **`Bespring`**.

**Remote:** [bike-trading-backend @ Bespring](https://github.com/cu3vt123/bike-trading-backend/tree/Bespring)  
Chi tiết cài đặt (MySQL, IntelliJ, cổng, Swagger) **đọc README và `docs/` trong repo đó** sau khi đã checkout nhánh `Bespring`.

---

## 1. Lấy mã backend về máy (không đè lên thư mục FE)

Chọn **một** cách:

### Cách A — Git worktree (một clone, hai thư mục)

Trong thư mục đã có remote `origin` trùng GitHub:

```bash
cd /đường-dẫn/bất-kỳ/có-git-repo   # ví dụ: repo FE hoặc bất kỳ clone nào đã fetch origin
git fetch origin
git worktree add ../bike-trading-bespring Bespring
```

Mở **`../bike-trading-bespring`** trong IntelliJ để chạy Spring; giữ **`c:/SWP/frontend`** (hoặc repo FE) cho `npm run dev`.

### Cách B — Clone thứ hai

```bash
git clone -b Bespring https://github.com/cu3vt123/bike-trading-backend.git bike-trading-bespring
cd bike-trading-bespring
```

---

## 2. Chạy API

Làm theo README của nhánh `Bespring`: bật MySQL, cấu hình `application.properties`, chạy `BikeTradingBackendApplication` (hoặc `mvn spring-boot:run`).

- Cổng API thường là **`http://localhost:8081`**, base path **`/api`** — kiểm tra `server.port` và context path trên **Swagger** (ví dụ `http://localhost:8081/swagger-ui/index.html`).

---

## 3. Nối Frontend với API

Trong thư mục **FE** (repo `front-only`), tạo/sửa **`.env`** (cùng cấp `package.json`):

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

Sửa `.env` xong: **restart** `npm run dev`.

- Tra cứu path REST nhanh khi code FE: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md).

---

## 4. Sự cố thường gặp

| Hiện tượng | Hướng xử lý |
|------------|-------------|
| **Trình duyệt mở FE được nhưng không gọi được API** | BE có đang chạy trong IntelliJ không; `.env`: `VITE_USE_MOCK_API=false`, `VITE_API_BASE_URL` đúng (không `/` cuối); sau sửa `.env` **restart** `npm run dev`; DevTools → CORS / Network. Chi tiết: [FRONTEND-DEVELOPER-GUIDE.md#fe-ket-noi-be](./FRONTEND-DEVELOPER-GUIDE.md#fe-ket-noi-be). |
| CORS / Network Error | BE phải cho phép origin FE (thường `http://localhost:5173`); xem cấu hình CORS trên repo Bespring. |
| 404 / sai path | Đối chiếu `VITE_API_BASE_URL` và prefix `/api` với Swagger trên BE. |
| Hai cổng trùng | Chỉ chạy **một** instance API trên cổng đã cấu hình. |

---

*Tài liệu này chỉ mô tả cách làm việc chéo FE ↔ nhánh Bespring; chi tiết build/run BE nằm trong repo backend.*
