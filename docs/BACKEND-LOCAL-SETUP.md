# Cài đặt Backend & full stack local — sau khi `clone` hoặc `git pull`

Tài liệu **một chỗ** để sau khi lấy code về máy bạn **chạy được** API (Node hoặc Spring) kết hợp Frontend. Đọc kèm **[README.md](../README.md)** (mục clone/pull và biến `VITE_*`).

---

## 1. Bước chung (luôn làm)

| Bước | Lệnh / việc | Ghi chú |
|------|-------------|---------|
| 1 | `git clone <url-repo>` lần đầu; các lần sau: `git pull` trong thư mục repo | Luôn làm việc ở **root monorepo** (có `package.json` + `pom.xml` nếu có Spring). |
| 2 | Cài **Node.js LTS** (v20+), kiểm tra `node -v`, `npm -v` | FE và folder `backend/` (Node) đều cần npm. |
| 3 | Ở **root repo**: `npm install` | Bắt buộc sau mỗi lần pull nếu `package-lock.json` đổi. |
| 4 | Tạo `/.env` từ mẫu: `cp .env.example .env` (Linux/macOS/Git Bash) hoặc `copy .env.example .env` (Windows CMD/PowerShell) | Không commit `.env`. |

---

## 2. Ba cách chạy (chọn một)

### 2.1 Chỉ Frontend + mock API (không cần Java/Mongo)

Phù hợp: xem UI, không cần dữ liệu thật.

1. Trong `.env` đặt `VITE_USE_MOCK_API=true`.
2. `npm run dev` ở root → mở `http://localhost:5173`.

**Không** cần bật backend.

---

### 2.2 Frontend + Backend Node (`backend/` — Express + MongoDB)

Phù hợp: demo MERN trong repo, contract gần với FE.

**Terminal 1 — API Node**

```bash
cd backend
npm install
cp .env.example .env
# Windows CMD: copy .env.example .env
npm run dev
```

- API mặc định: **`http://localhost:8081/api`** (đổi `PORT` trong `backend/.env` nếu trùng cổng).
- `MONGODB_URI` để trống → Mongo in-memory + seed tự động (lần đầu có thể tải binary ~600MB).

**Terminal 2 — Frontend**

Trong `.env` ở **root** (không phải `backend/.env`):

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

```bash
npm run dev
```

**Lưu ý:** Nếu bạn đang chạy **Spring** trên cổng 8081, **tắt một trong hai** — không chạy Node và Spring cùng lúc trừ khi đổi cổng một bên.

Chi tiết code Node: [BACKEND-GUIDE.md](./BACKEND-GUIDE.md), [backend/README.md](../backend/README.md).

---

### 2.3 Frontend + Spring Boot (BE2 — trong cùng repo)

Phù hợp: nhánh BE2, API Java + MySQL.

**Yêu cầu**

- **JDK** (theo `pom.xml` / team — thường JDK 21–24).
- **MySQL** chạy local; tạo **database trống** — **tên DB và user/mật khẩu** phải khớp `spring.datasource.*` trong `src/main/resources/application.properties` (mỗi máy dev nên dùng **credential riêng**, không commit mật khẩu thật lên Git).

**Chạy Spring**

- IntelliJ: Run `BikeTradingBackendApplication` (`src/main/java/com/biketrading/backend/...`), **hoặc**
- CLI (tại root repo, nơi có `pom.xml`):

```bash
mvn spring-boot:run
```

- Swagger: thường **`http://localhost:8081/swagger-ui/index.html`** (kiểm tra `server.port` trong `application.properties`).

**Frontend**

Cùng `.env` như mục 2.2:

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

`npm run dev` ở root.

Chi tiết port, CORS, contract: [BACKEND-NODE-TO-SPRING-BOOT.md](./BACKEND-NODE-TO-SPRING-BOOT.md) §3–4, §15.

---

## 3. Sau mỗi lần `git pull`

1. `git pull`
2. `npm install` (root)
3. Nếu dùng Node backend: `cd backend && npm install`
4. Đọc [CHANGELOG.md](./CHANGELOG.md) hoặc tin nhắn merge — có đổi env, DB migration, hay script không
5. Khởi động lại `npm run dev` (FE) và backend nếu đang bật

---

## 4. Xử lý sự cố nhanh

| Hiện tượng | Hướng xử lý |
|------------|-------------|
| **Port 8081 đã được dùng** | Tắt process cũ; hoặc đổi `server.port` / `PORT` và cập nhật `VITE_API_BASE_URL` cho khớp. |
| **Spring không kết nối MySQL** | Bật MySQL; đúng tên DB; đúng user/password trong `application.properties` (local). |
| **FE báo Network / CORS** | BE có chạy không? `VITE_API_BASE_URL` đúng? BE cho phép origin `http://localhost:5173` (CORS). |
| **`npm install` lỗi** | Xóa `node_modules` + lock nếu cần (theo hướng dẫn team); dùng đúng phiên bản Node. |

---

## 5. Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [README.md](../README.md) | Clone/pull, mục lục, FE chi tiết |
| [BACKEND-GUIDE.md](./BACKEND-GUIDE.md) | Node: cấu trúc, env, auth, VNPay |
| [backend/README.md](../backend/README.md) | Quick start Node, endpoint tóm tắt |
| [BACKEND-NODE-TO-SPRING-BOOT.md](./BACKEND-NODE-TO-SPRING-BOOT.md) | Spring vs Node, checklist |
| [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Bảng API, env |

---

*Cập nhật: hướng dẫn full stack local sau clone/pull; đồng bộ README gốc.*
