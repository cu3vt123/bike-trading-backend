# Hướng dẫn FE2 Join dự án qua Git

> Tài liệu dành cho thành viên Frontend 2 (FE2) tham gia dự án ShopBike – clone, setup, và quy trình làm việc với Git.

---

## 1. Yêu cầu trước khi bắt đầu

- **Node.js** 18+ (khuyến nghị LTS)
- **npm** hoặc **pnpm**
- **Git** đã cài đặt
- **Tài khoản GitHub** đã được team lead cấp quyền truy cập repo

---

## 2. Clone repository

```bash
# Clone repo (thay <REPO_URL> bằng URL thực tế – hỏi FE1 hoặc team lead)
git clone https://github.com/<org>/<repo>.git
cd <repo>

# Nếu frontend nằm trong subfolder (ví dụ: repo có /frontend)
# cd frontend
```

**Ví dụ:**
```bash
git clone https://github.com/cu3vt123/bike-trading-backend.git
cd bike-trading-backend
# Nếu có thư mục frontend:
# cd frontend
```

---

## 3. Cấu hình Git (lần đầu)

```bash
# Đặt tên và email (nếu chưa có)
git config user.name "Tên của bạn"
git config user.email "email@example.com"

# Xem branch hiện tại
git branch -a
```

---

## 4. Branch & cập nhật code

### 4.1 Chuyển sang branch Frontend

```bash
# Branch chính cho FE: fe-frontend
git checkout fe-frontend

# Lấy code mới nhất từ remote
git pull origin fe-frontend
```

### 4.2 Branch structure

| Branch         | Mô tả                |
|----------------|----------------------|
| `fe-frontend`  | Branch chính cho FE  |
| `main` / `master` | Branch chính dự án (nếu có) |

---

## 5. Cài đặt & chạy dự án

### 5.1 Cài dependencies

```bash
npm install
```

### 5.2 Cấu hình biến môi trường

Tạo file `.env` (copy từ `.env.example`):

```bash
cp .env.example .env
```

Nội dung `.env`:

```
# API Backend (Spring Boot)
VITE_API_BASE_URL=http://localhost:8081/api

# true = dùng mock (không cần Backend), false = gọi API thật
VITE_USE_MOCK_API=true
```

- **`VITE_USE_MOCK_API=true`** → Chạy được ngay không cần Backend (dùng mock data)
- **`VITE_USE_MOCK_API=false`** → Gọi API thật (cần Backend chạy)

### 5.3 Chạy dev server

```bash
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

### 5.4 Build production

```bash
npm run build
```

---

## 6. Quy trình làm việc với Git

### 6.1 Trước khi code – luôn pull mới nhất

```bash
git checkout fe-frontend
git pull origin fe-frontend
```

### 6.2 Tạo branch feature (khuyến nghị)

```bash
# Tạo branch mới từ fe-frontend
git checkout -b fe/ten-tinh-nang

# Ví dụ:
git checkout -b fe/wishlist-improve
git checkout -b fe/seller-orders
```

### 6.3 Commit & Push

```bash
# Xem file thay đổi
git status

# Thêm file vào staging
git add .
# Hoặc thêm từng file: git add src/pages/MyPage.tsx

# Commit với message rõ ràng
git commit -m "feat: mô tả ngắn gọn thay đổi"

# Push lên remote (branch hiện tại)
git push origin fe/ten-tinh-nang
```

**Quy ước commit message (Conventional Commits):**

| Prefix   | Ý nghĩa                    |
|----------|----------------------------|
| `feat:`  | Tính năng mới              |
| `fix:`   | Sửa lỗi                   |
| `docs:`  | Chỉ sửa tài liệu           |
| `style:` | Format, CSS, không đổi logic |
| `refactor:` | Refactor code          |
| `chore:` | Công việc phụ (deps, config) |

### 6.4 Merge về fe-frontend

Sau khi feature xong, tạo Pull Request (PR) từ `fe/ten-tinh-nang` → `fe-frontend`, hoặc merge local:

```bash
git checkout fe-frontend
git merge fe/ten-tinh-nang
git push origin fe-frontend
```

---

## 7. Cấu trúc code cơ bản

```
src/
├── apis/           # API clients (authApi, buyerApi, sellerApi, inspectorApi)
├── components/     # Reusable components (common, listing, ui)
├── layouts/        # MainLayout
├── lib/            # apiClient, utils
├── mocks/          # Mock data
├── pages/          # Các trang (Home, Login, Profile, ...)
├── routes/         # AppRouter, Guards
├── services/       # buyerService, sellerService (facade + mock fallback)
├── stores/         # Zustand (useAuthStore, useWishlistStore)
└── types/          # TypeScript types
```

**Khi thêm tính năng mới:**
- Trang mới → `src/pages/`
- Component dùng lại → `src/components/`
- API mới → `src/apis/` + `src/services/` (có fallback mock)
- Route mới → `src/routes/AppRouter.tsx`

---

## 8. Tài liệu tham khảo

| File                       | Nội dung                                  |
|----------------------------|--------------------------------------------|
| `docs/PROJECT-SUMMARY.md`  | Tổng quan dự án, business rules, checklist |
| `docs/FLOWS-AND-PROGRESS.md` | Luồng nghiệp vụ, tiến độ                   |
| `docs/API-INTEGRATION.md`  | Cách gắn API thật khi Backend sẵn sàng     |
| `docs/CHANGELOG.md`        | Lịch sử thay đổi                           |
| `docs/HUONG-DAN-BACKEND.md` | API cần Backend implement                  |

---

## 9. Lưu ý

1. **Không commit** file `.env` (có secret). File `.env.example` chỉ là mẫu.
2. **Luôn pull** trước khi bắt đầu code để tránh conflict.
3. **Commit thường xuyên**, message rõ ràng.
4. Khi gặp conflict: giải quyết xong, test lại rồi mới push.
5. Hỏi FE1 hoặc team lead nếu không rõ task hoặc quy trình.

---

## 10. Liên hệ

- **FE1** / Team lead: (điền thông tin)
- **Repo:** (điền URL chính xác)
- **Slack/Discord:** (nếu có)

---

*Cập nhật: 2025-02*
