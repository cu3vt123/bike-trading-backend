# 00 — Nền tảng web và React (tóm tắt cho người mới)

Phần này **không** thay thế khóa học HTML/CSS/JS đầy đủ; mục tiêu là đưa bạn lên cùng “ngôn ngữ chung” với code trong repo ShopBike.

---

## 1. Trình duyệt làm gì khi mở một URL

1. Gửi yêu cầu **HTTP** (thường `GET`) tới **máy chủ** (server).
2. Nhận về **HTML** (và sau đó CSS, JavaScript, hình ảnh).
3. **Parse** HTML thành cây **DOM** (Document Object Model): cấu trúc cây các thẻ trên trang.
4. Chạy **JavaScript** — JS có thể **thay đổi DOM**, gọi API, lưu dữ liệu.

**SPA (Single Page Application):** lần đầu tải thường nhận một trang HTML gần như rỗng + một file JS lớn. Toàn bộ “chuyển trang” diễn ra **trong trình duyệt** bằng JS (React Router), không tải lại full HTML mỗi lần.

---

## 2. HTTP và API

- **Frontend** (trình duyệt) và **Backend** (server API) nói chuyện qua HTTP.
- Thường dùng **JSON** làm định dạng dữ liệu (`{ "key": "value" }`).
- Ví dụ phương thức: `GET` (lấy dữ liệu), `POST` (tạo / gửi body), `PUT`/`PATCH` (cập nhật), `DELETE` (xóa).
- **CORS:** trình duyệt chặn FE gọi API từ **domain khác** nếu server không khai báo header cho phép — khi debug, lỗi CORS xuất hiện trong tab **Network** của DevTools.

Trong ShopBike, FE gọi API qua **Axios** (xem phần 06).

---

## 3. JavaScript cần biết tối thiểu

| Khái niệm | Vì sao quan trọng trong React |
|-----------|--------------------------------|
| `const` / `let`, hàm `function` và arrow `() => {}` | Toàn bộ component và hook viết bằng cú pháp này |
| Mảng / object, destructuring `const { a } = obj` | Props và state thường là object |
| `async` / `await`, `Promise` | Gọi API là bất đồng bộ |
| Module `import` / `export` | Mỗi file `.tsx` export component hoặc hàm |

**TypeScript (.ts, .tsx):** thêm **kiểu** cho biến và props để IDE và compiler bắt lỗi sớm. Repo dùng TypeScript cho toàn bộ FE.

---

## 4. React là gì (một câu)

**React** giúp bạn mô tả giao diện bằng **component** (hàm trả về JSX). Khi **state** thay đổi, React **render lại** phần UI liên quan.

| Thuật ngữ | Ý nghĩa ngắn |
|-----------|--------------|
| **Component** | Hàm hoặc class tái sử dụng, có thể nhận `props` |
| **JSX** | Cú pháp giống HTML trong file JS (`<div>...</div>`) |
| **Props** | Dữ liệu truyền từ component cha xuống con (read-only) |
| **State** | Dữ liệu nội bộ có thể đổi (`useState`, store Zustand, …) |
| **Hook** | Hàm `use*` (`useState`, `useEffect`, `useQuery`, …) gắn với vòng đời component |

**React 19** trong repo: bạn không cần nhớ chi tiết phiên bản; quan trọng là **một component = một hàm trả JSX**, và **logic tái sử dụng** thường đặt trong custom hook.

---

## 5. Từ React “thuần” tới dự án thật

Trong app nhỏ, bạn có thể chỉ cần React + vài component. Trong ShopBike còn có:

- **React Router** — định nghĩa URL nào hiện trang nào.
- **TanStack Query** — tải/cache dữ liệu từ API, loading/error.
- **Zustand** — state toàn cục (ví dụ token đăng nhập).
- **Axios** — HTTP client có interceptor (gắn token, xử lý 401).
- **react-i18next** — đa ngôn ngữ.
- **Tailwind CSS** — styling utility-first.

Các phần 03–08 trong bộ này lần lượt nối khái niệm trên với **đúng thư mục** trong repo.

---

## 6. DevTools (nên làm quen ngay)

- **Console:** lỗi JS, log.
- **Network:** từng request API (status 200/401/404, payload).
- **React DevTools** (tiện ích trình duyệt): xem cây component và props.

---

**Tiếp theo:** [01-du-an-la-gi.md](./01-du-an-la-gi.md) — dự án ShopBike trong repo này là gì.
