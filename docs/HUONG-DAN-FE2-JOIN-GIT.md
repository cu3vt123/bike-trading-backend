# Hướng dẫn FE2 Join dự án – Từng bước (cho người mới Git)

> Tài liệu dành cho thành viên Frontend 2 (FE2) **chưa từng dùng Git** – hướng dẫn chi tiết từ cài đặt đến làm việc hàng ngày.

---

## Git là gì? Tại sao cần?

- **Git** là công cụ quản lý mã nguồn: lưu lịch sử thay đổi, nhiều người cùng làm việc trên 1 dự án.
- **GitHub** là nơi lưu trữ code trên internet. Team dùng GitHub để chia sẻ code với nhau.
- **Clone** = tải code về máy. **Push** = đẩy code lên GitHub. **Pull** = tải code mới nhất từ GitHub.

Bạn cần làm đúng thứ tự các bước dưới đây.

---

## Bước 1: Cài đặt Git (Windows)

### 1.1 Tải Git

1. Mở trình duyệt, vào: **https://git-scm.com/download/win**
2. Tải phiên bản mới nhất (64-bit nếu dùng Windows 64-bit).
3. Chạy file vừa tải (ví dụ: `Git-2.43.0-64-bit.exe`).

### 1.2 Cài đặt

1. Next → Next (giữ nguyên mặc định).
2. Khi hỏi "Choosing the default editor" → chọn **Notepad** (hoặc giữ nguyên).
3. Tiếp tục Next → Install → Finish.

### 1.3 Kiểm tra

1. Nhấn **Win + R**, gõ `cmd`, Enter.
2. Trong cửa sổ đen (Command Prompt), gõ:
   ```
   git --version
   ```
3. Nếu hiện dạng `git version 2.x.x` → đã cài thành công.

---

## Bước 2: Cài đặt Node.js

### 2.1 Tải Node.js

1. Vào: **https://nodejs.org**
2. Tải phiên bản **LTS** (nút màu xanh).
3. Chạy file cài đặt, Next → chấp nhận điều khoản → Next → Install.
4. Hoàn tất, chọn Finish.

### 2.2 Kiểm tra

Mở Command Prompt (Win + R → `cmd`), gõ:

```
node -v
npm -v
```

Nếu hiện số phiên bản (vd: `v20.x.x`) → cài thành công.

---

## Bước 3: Tạo tài khoản GitHub và nhận quyền

### 3.1 Tạo tài khoản (nếu chưa có)

1. Vào **https://github.com**
2. **Sign up** → điền email, mật khẩu, username.
3. Xác minh email nếu có.

### 3.2 Nhận quyền truy cập repo

- **Hỏi FE1 hoặc Team lead** để được thêm vào repo dự án.
- Họ sẽ mời bạn qua email hoặc gửi link invite.
- Chấp nhận invite để có quyền clone và push code.

### 3.3 Lấy URL repo

- Sau khi có quyền, vào trang repo trên GitHub (vd: `https://github.com/org/ten-repo`).
- Click nút **Code** (màu xanh) → chọn **HTTPS** → copy URL.
- Ví dụ: `https://github.com/cu3vt123/bike-trading-backend.git`

---

## Bước 4: Mở Terminal và chọn thư mục làm việc

### 4.1 Mở Command Prompt (Windows)

- Nhấn **Win + R** → gõ `cmd` → Enter.
- Hoặc tìm "Command Prompt" trong Start Menu.

### 4.2 Đi tới thư mục lưu dự án

Ví dụ muốn lưu trong `C:\Projects`:

```
cd C:\Projects
```

Nếu thư mục chưa có, tạo mới:

```
mkdir C:\Projects
cd C:\Projects
```

**Lưu ý:** Bạn sẽ gõ lệnh trong cửa sổ này. Mỗi lệnh xong nhấn **Enter**.

---

## Bước 5: Clone code về máy (Bước quan trọng!)

### 5.1 Clone repo

Gõ (thay `URL_REPO` bằng URL thực tế team cung cấp):

```
git clone URL_REPO
```

**Ví dụ:**

```
git clone https://github.com/cu3vt123/bike-trading-backend.git
```

- Có thể hỏi đăng nhập GitHub (username + password hoặc token).
- Khi xong, sẽ tạo thư mục tên repo (vd: `bike-trading-backend`).

### 5.2 Vào thư mục dự án

```
cd bike-trading-backend
```

### 5.3 Nếu frontend nằm trong thư mục con

Nếu cấu trúc repo có thư mục `frontend` hoặc `frontend-setup`:

```
cd frontend
```

hoặc

```
cd frontend-setup
```

*(Hỏi team lead nên dùng thư mục nào.)*

---

## Bước 6: Cấu hình Git (chỉ làm 1 lần)

Git cần biết tên và email của bạn khi tạo "commit" (ghi chú thay đổi).

### 6.1 Đặt tên

```
git config --global user.name "Tên của bạn"
```

Ví dụ:

```
git config --global user.name "Nguyen Van A"
```

### 6.2 Đặt email (dùng email GitHub)

```
git config --global user.email "email@example.com"
```

Ví dụ:

```
git config --global user.email "nguyenvana@gmail.com"
```

---

## Bước 7: Chọn branch và lấy code mới nhất

### 7.1 Branch là gì?

- **Branch** = nhánh code. Dự án có thể có nhiều nhánh (vd: `main`, `fe-frontend`).
- FE thường làm việc trên branch `fe-frontend` hoặc branch team quy định.

### 7.2 Chuyển sang branch Frontend

```
git checkout fe-frontend
```

*(Thay `fe-frontend` nếu team dùng tên khác.)*

### 7.3 Tải code mới nhất từ GitHub (Pull)

```
git pull origin fe-frontend
```

**Pull** = tải bản mới nhất từ server về máy. Luôn làm trước khi bắt đầu code.

---

## Bước 8: Cài đặt và chạy dự án

### 8.1 Cài thư viện (dependencies)

Trong thư mục frontend (vd: `frontend` hoặc `frontend-setup`), gõ:

```
npm install
```

Chờ vài phút. Khi xong sẽ thấy thư mục `node_modules`.

### 8.2 Tạo file cấu hình .env

```
copy .env.example .env
```

Hoặc tạo file `.env` thủ công, nội dung:

```
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=true
```

- `VITE_USE_MOCK_API=true` → Chạy được ngay, không cần Backend.

### 8.3 Chạy ứng dụng

```
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

Xem thêm: `docs/HUONG-DAN-DEMO.md` (frontend) hoặc `docs/HUONG-DAN-DEMO-SETUP.md` (frontend-setup).

---

## Bước 9: Quy trình làm việc hàng ngày với Git

### 9.1 Trước khi bắt đầu code mỗi ngày

```
git checkout fe-frontend
git pull origin fe-frontend
```

→ Luôn **pull** để có code mới nhất, tránh xung đột với người khác.

### 9.2 Giải thích nhanh các lệnh

| Lệnh | Ý nghĩa đơn giản |
|------|------------------|
| `git status` | Xem bạn đã sửa file nào |
| `git add .` | Chọn tất cả file đã sửa (chuẩn bị gửi) |
| `git commit -m "tin nhắn"` | Ghi chú thay đổi với mô tả ngắn |
| `git push` | Đẩy code lên GitHub |

### 9.3 Tạo nhánh mới cho tính năng (khuyến nghị)

```
git checkout -b fe/ten-tinh-nang
```

Ví dụ:

```
git checkout -b fe/them-wishlist
git checkout -b fe/sua-giao-dien-login
```

### 9.4 Sau khi sửa code xong – Commit và Push

**Bước 1 – Xem file đã thay đổi:**

```
git status
```

**Bước 2 – Chọn file muốn gửi:**

```
git add .
```

(Chọn tất cả) hoặc:

```
git add src/pages/MyPage.tsx
```

(Chọn từng file)

**Bước 3 – Ghi chú thay đổi (Commit):**

```
git commit -m "feat: thêm tính năng wishlist"
```

**Quy ước tin nhắn commit:**

| Tiền tố | Ý nghĩa |
|---------|---------|
| `feat:` | Tính năng mới |
| `fix:` | Sửa lỗi |
| `docs:` | Chỉ sửa tài liệu |
| `style:` | Sửa giao diện, không đổi logic |
| `chore:` | Công việc phụ (cài đặt, cấu hình) |

**Bước 4 – Đẩy lên GitHub (Push):**

```
git push origin fe/ten-tinh-nang
```

Ví dụ:

```
git push origin fe/them-wishlist
```

### 9.5 Sau khi feature xong – Gộp về branch chính

Hỏi FE1/Team lead: thường sẽ tạo **Pull Request** (PR) trên GitHub.

Hoặc nếu merge trực tiếp:

```
git checkout fe-frontend
git merge fe/ten-tinh-nang
git push origin fe-frontend
```

---

## Bước 10: Cấu trúc code (tham khảo)

```
src/
├── apis/        # Gọi API (auth, buyer, seller, inspector)
├── components/  # Component dùng lại (Header, Card, ...)
├── pages/       # Các trang (Home, Login, Profile, ...)
├── services/    # Service (gọi API + mock)
├── stores/      # Quản lý state (auth, wishlist)
└── types/       # Định nghĩa kiểu dữ liệu
```

**Khi thêm tính năng mới:**
- Trang mới → `src/pages/`
- Component dùng lại → `src/components/`
- API mới → `src/apis/` và `src/services/`
- Route mới → `src/routes/AppRouter.tsx`

---

## Bước 11: Lỗi thường gặp và cách xử lý

### "git is not recognized"

→ Chưa cài Git hoặc chưa khởi động lại Command Prompt sau khi cài. Thử mở lại cmd.

### "Permission denied" / "Access denied" khi clone/push

→ Chưa có quyền truy cập repo. Hỏi Team lead thêm bạn vào repo.
→ Hoặc dùng **Personal Access Token** thay mật khẩu khi GitHub hỏi.

### "Merge conflict" khi pull

→ Có người khác sửa cùng file. Hỏi FE1/Team lead để được hướng dẫn giải conflict.

### "npm install" báo lỗi

→ Kiểm tra đã cài Node.js chưa (`node -v`). Chạy cmd với quyền Administrator thử.

### Trang trống, không có dữ liệu

→ Kiểm tra `.env` có `VITE_USE_MOCK_API=true` (chạy mock) hoặc Backend đang chạy nếu dùng API thật.

---

## Bước 12: Lưu ý quan trọng

1. **Không commit file `.env`** – file này có thể chứa thông tin nhạy cảm.
2. **Luôn `git pull`** trước khi bắt đầu code trong ngày.
3. **Commit thường xuyên** với message rõ ràng.
4. **Hỏi FE1 hoặc Team lead** nếu không rõ task hoặc quy trình.

---

## Tài liệu tham khảo

| File | Nội dung |
|------|----------|
| `docs/HUONG-DAN-DEMO.md` | Hướng dẫn demo (frontend) |
| `docs/HUONG-DAN-DEMO-SETUP.md` | Hướng dẫn demo (frontend-setup) |
| `docs/PROJECT-SUMMARY.md` | Tổng quan dự án |
| `docs/API-SETUP.md` | Cách tích hợp API |

---

## Liên hệ

- **FE1 / Team lead:** (điền thông tin)
- **Repo:** (điền URL)
- **Slack/Discord:** (nếu có)

---

*Cập nhật: 2025-02 – Hướng dẫn chi tiết cho người mới Git*
