# Hướng dẫn kiểm tra luồng & API — Frontend V2 (ShopBike)

Tài liệu mô tả **cách tự kiểm tra** sau khi đổi code: build/lint **không thay thế** việc chạy app và gọi API thật. Dùng cho **dev FE**, **QA**, hoặc **review PR** trước khi merge.

**Kiến trúc V2 (TanStack Query, invalidate):** [FE-ARCHITECTURE-V1-VS-V2.md](./FE-ARCHITECTURE-V1-VS-V2.md)  
**Bảng API / role:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)  
**Màn → endpoint:** [BE-FE-API-AUDIT-BY-PAGE.md](./BE-FE-API-AUDIT-BY-PAGE.md)

---

## 1. Mục đích & phạm vi

| Câu hỏi | Trả lời |
|---------|---------|
| **Tài liệu này để làm gì?** | Checklist **có thứ tự**: lint/build → chạy local → kiểm tra luồng theo vai → đối chiếu request/response. |
| **Không đảm bảo gì?** | Không thay thế **test tự động E2E**; không chứng minh BE production an toàn — chỉ giúp bắt lỗi sớm trên môi trường dev. |
| **Sau khi làm xong** | Có thể ghi nhận “đã verify” kèm commit/PR hoặc báo cáo test ngắn. |

---

## 2. Chuẩn bị môi trường

1. **Repo đã pull**, `npm install` ở root (và `cd backend && npm install` nếu dùng API Node).
2. **File `.env`** (root):  
   - Gọi API thật: `VITE_USE_MOCK_API=false`, `VITE_API_BASE_URL` trùng cổng BE (thường `http://localhost:8081/api`).  
   - Chỉ UI: `VITE_USE_MOCK_API=true` (không cần bật BE).
3. **Backend đang chạy** (Spring hoặc Node) — **không** chạy đồng thời hai BE trên cùng cổng. Chi tiết: [BACKEND-LOCAL-SETUP.md](./BACKEND-LOCAL-SETUP.md).
4. **Tài khoản test** — xem [README.md](../README.md) (phần Spring / demo) hoặc seed backend Node.

---

## 3. Bước A — Kiểm tra tự động (bắt buộc trước khi merge)

Chạy ở **thư mục gốc** repo frontend:

```bash
npm run lint
npm run build
```

- **Lint lỗi:** sửa theo báo ESLint; không merge nếu team yêu cầu lint sạch.  
- **Build lỗi:** lỗi TypeScript/bundle — phải xử lý trước.

---

## 4. Bước B — Chạy dev và kiểm tra nhanh

```bash
npm run dev
```

- Mở URL Vite in ra (thường `http://localhost:5173`).  
- Mở **DevTools → Network**: lọc `Fetch/XHR`, bật **Preserve log** nếu cần theo dõi redirect (VNPay).

---

## 5. Bước C — Kiểm tra theo vai (thủ công)

Thực hiện **theo thứ tự** phù hợp dự án; tick từng mục khi đạt.

### 5.1 Chung (mọi vai)

| # | Việc kiểm tra | Kỳ vọng |
|---|----------------|---------|
| 1 | Reload trang, xem có lỗi đỏ trong **Console** | Không lỗi JS chặn render (trừ cảnh báo đã biết). |
| 2 | Đổi theme (nếu có) / ngôn ngữ | UI không vỡ layout. |
| 3 | Gọi API có auth: sau **401** (token hết hạn) | App đưa về login hoặc refresh (theo [apiClient](../src/lib/apiClient.ts)). |

### 5.2 Guest

| # | Luồng | Kiểm tra |
|---|--------|----------|
| 1 | Home — danh sách xe | Có dữ liệu (mock hoặc `GET /bikes`). |
| 2 | Chi tiết xe `/bikes/:id` | Load được; không 404 oan (nếu tin tồn tại). |
| 3 | Đăng ký / đăng nhập | `POST` auth thành công; redirect đúng role. |

### 5.3 Buyer

| # | Luồng | Kiểm tra API (Network) |
|---|--------|-------------------------|
| 1 | Checkout → tạo đơn (VNPay/mock) | `POST .../buyer/orders/vnpay-checkout` hoặc luồng tương đương; response có `orderId` / `paymentUrl` khi đúng nghiệp vụ. |
| 2 | Transaction / theo dõi đơn | `GET .../buyer/orders/:id` — UI khớp trạng thái. |
| 3 | Hủy đơn (nếu được phép) | `PUT .../cancel` — sau đó **danh sách đơn** (profile/home) **không còn cache cũ** (invalidate Query — xem §6). |
| 4 | Profile — đơn gần đây | `GET .../buyer/orders` — trạng thái khớp chi tiết đơn. |

### 5.4 Seller / Inspector / Admin

| # | Gợi ý | Ghi chú |
|---|--------|---------|
| 1 | Đăng nhập đúng role | Không vào được route role khác (403 / redirect). |
| 2 | Dashboard / tab chính | Có gọi `GET` đúng path trong [QUICK-REFERENCE.md](./QUICK-REFERENCE.md). |
| 3 | Thao tác ghi (ship, duyệt, v.v.) | Sau khi thành công, **danh sách** hoặc **chi tiết** refetch hoặc invalidate — không kẹt dữ liệu cũ. |

---

## 6. Kiểm tra riêng FE V2 (TanStack Query)

Sau **mutation** (hủy đơn, ship, cập nhật listing, …):

1. Xem trong code (hoặc nhớ theo feature): có `queryClient.invalidateQueries({ queryKey: ... })` đúng `queryKeys` không — xem [queryKeys](../src/lib/queryKeys.ts).  
2. Trên UI: màn **khác** (ví dụ list đơn) phải **khớp** server sau khi quay lại hoặc refetch — nếu list vẫn cũ: thiếu invalidate hoặc sai key.  
3. Có thể cài **React Query DevTools** (nếu project bật) để xem `queryKey` / stale.

---

## 7. Đối chiếu API (không cần đọc hết code)

1. Mở **Swagger** (Spring): thường `http://localhost:8081/swagger-ui/index.html` — so path/method với [QUICK-REFERENCE.md](./QUICK-REFERENCE.md).  
2. So **status code** + **body** `message` / `data` với [FRONTEND-API-FLOWS.md](./FRONTEND-API-FLOWS.md).  
3. Nếu lệch contract: cập nhật **một** nguồn thật (BE hoặc FE) và ghi [CHANGELOG.md](./CHANGELOG.md) / PR mô tả.

---

## 8. Khi phát hiện lỗi — gửi BE/team (mẫu ngắn)

Dùng mẫu trong [BACKEND-COLLABORATION.md](./BACKEND-COLLABORATION.md) §3 (môi trường, bước tái hiện, **METHOD + path**, status, body, screenshot Network).

---

## 9. Checklist tóm tắt (copy vào PR)

```
[ ] npm run lint
[ ] npm run build
[ ] Chạy dev + ít nhất 1 luồng Buyer (list → detail → checkout hoặc profile orders)
[ ] Sau mutation: list/cache không lệch (nếu có thay đổi trạng thái)
[ ] (Tùy PR) Seller / Admin / Inspector: 1 luồng chính
```

---

## 10. Tài liệu liên quan

| Nội dung | File |
|----------|------|
| Cài đặt BE + FE | [BACKEND-LOCAL-SETUP.md](./BACKEND-LOCAL-SETUP.md), [README.md](../README.md) |
| PM/QA/FE hỗ trợ BE | [BACKEND-COLLABORATION.md](./BACKEND-COLLABORATION.md) |
| Rà soát API đã ghi trong repo | [BE-FE-API-AUDIT.md](./BE-FE-API-AUDIT.md) |

---

*Tài liệu này là quy trình kiểm tra thủ công + lint/build; bổ sung test E2E tự động nếu team thêm Cypress/Playwright sau này.*
