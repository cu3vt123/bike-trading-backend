# 02 — Cài đặt và chạy local (ưu tiên mock — học FE)

Mục tiêu: mở **http://localhost:5173** và chỉnh UI/đọc luồng code **không phụ thuộc** máy chủ backend.

Chi tiết thêm (nếu cần): [README.md](../../README.md).

---

## 1. Chuẩn bị

1. **Node.js LTS** (v20+ khuyến nghị).
2. Terminal tại thư mục **gốc** có `package.json`.
3. Kiểm tra: `node -v`, `npm -v`.

---

## 2. Cài dependency

```bash
npm install
```

Lặp lại sau `git pull` nếu có thay đổi `package-lock.json`.

---

## 3. File `.env` (root repo)

```bash
cp .env.example .env
```

Windows: `copy .env.example .env` hoặc `Copy-Item .env.example .env`.

**Không** commit `.env`.

---

## 4. Cách chạy mặc định khi học (mock)

Trong `.env`:

```env
VITE_USE_MOCK_API=true
```

```bash
npm run dev
```

App sẽ dùng dữ liệu giả / nhánh code trong **services & mock** — đủ để học layout, routing, form, TransactionPage, v.v.

---

## 5. (Tùy chọn) Khi bạn **đã** có API chạy sẵn

Chỉ làm bước này khi bạn **thật sự** cần gọi server (tích hợp, debug contract).

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

Sửa xong **restart** `npm run dev`. CORS / 401 là bài toán **mạng + auth**, xử lý sau khi bạn đã quen luồng FE.

---

## 6. Lệnh npm hay dùng

| Lệnh | Ý nghĩa |
|------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Build production |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

---

## 7. Sự cố nhanh

| Hiện tượng | Gợi ý |
|------------|--------|
| Trang trắng | Mở Console trong DevTools |
| Đang mock mà vẫn lỗi mạng | Kiểm tra `VITE_USE_MOCK_API=true` và **đúng file `.env` ở root** |
| Đổi `.env` không thấy đổi | Restart `npm run dev` |

---

**Tiếp theo:** [03-luong-chay-ung-dung.md](./03-luong-chay-ung-dung.md).
