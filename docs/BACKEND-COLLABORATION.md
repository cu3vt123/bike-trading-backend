# Backend ShopBike — làm việc chung (không chỉ dev Backend)

Tài liệu giúp **PM, QA, Frontend, người mới**, hoặc **Tech lead** nắm đủ ngữ cảnh để **hỗ trợ team Backend** (báo lỗi có căn cứ, đối chiếu contract, chạy demo) **mà không cần BE dạy lại từ đầu**.

**Chạy API trên máy:** [BACKEND-LOCAL-SETUP.md](./BACKEND-LOCAL-SETUP.md)  
**API tóm tắt:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)  
**Luồng FE gọi API:** [FRONTEND-API-FLOWS.md](./FRONTEND-API-FLOWS.md)

---

## 1. Ai nên đọc gì (5 phút chọn đúng file)

| Vai trò | Đọc trước | Mục đích |
|---------|-----------|----------|
| **PM / PO** | [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) § nghiệp vụ, [business-rules/BUSINESS-RULES.md](./business-rules/BUSINESS-RULES.md) (mục lục) | Hiểu luồng đặt cọc, kho, VNPay — tránh đặt spec trái BR. |
| **QA / Tester** | [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) § Roles & Routes, § API; [BE-FE-API-AUDIT-BY-PAGE.md](./BE-FE-API-AUDIT-BY-PAGE.md) | Biết **màn nào** gọi **endpoint nào**; báo bug kèm **HTTP status + path**. |
| **Frontend** | [FRONTEND-API-FLOWS.md](./FRONTEND-API-FLOWS.md), `src/lib/apiConfig.ts` | Biết FE đang gửi body/headers gì; lỗi lệch thường là contract JSON. |
| **Backend (Node/Java)** | [BACKEND-GUIDE.md](./BACKEND-GUIDE.md) hoặc [BACKEND-NODE-TO-SPRING-BOOT.md](./BACKEND-NODE-TO-SPRING-BOOT.md) | Code + port map. |
| **Người review PR** | §3–4 dưới đây + [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Checklist merge an toàn. |

---

## 2. Thuật ngữ tối thiểu (chung cả team)

| Thuật ngữ | Giải thích ngắn (không cần biết code BE) |
|-----------|------------------------------------------|
| **API / endpoint** | Địa chỉ HTTP (vd. `GET /api/bikes`) mà app gọi để lấy dữ liệu hoặc thêm đơn. |
| **Base URL** | Phần đầu giống nhau: thường `http://localhost:8081/api` khi dev. |
| **Prefix `/api`** | Hầu hết REST trong repo dùng prefix này (trừ một số route VNPay public — xem `docs`). |
| **JWT / Bearer** | Sau khi đăng nhập, FE gửi header `Authorization: Bearer <token>` — BE kiểm tra quyền. |
| **Role** | `BUYER`, `SELLER`, `INSPECTOR`, `ADMIN` — quyết định route nào được gọi (403 nếu sai role). |
| **CORS** | Trình duyệt chỉ cho phép FE (vd. `localhost:5173`) gọi BE nếu BE cấu hình đúng — lỗi CORS thường là BE chưa mở origin hoặc sai URL. |
| **Status HTTP** | `200` OK; `400` sai dữ liệu gửi; `401` chưa login / hết hạn token; `403` đủ login nhưng không đủ quyền; `404` không có resource; `500` lỗi server. |
| **Contract** | Thống nhất **path + method + JSON** request/response giữa FE và BE — xem `docs/BE-FE-API-AUDIT*.md`. |

---

## 3. Cách báo bug / yêu cầu để BE xử lý nhanh

Copy mẫu dưới đây vào ticket / chat (điền nội dung):

```
- Môi trường: dev local / staging / …
- FE: VITE_USE_MOCK_API=… , VITE_API_BASE_URL=…
- Bước tái hiện: (1) … (2) …
- Màn hình / route: /checkout/…
- API: METHOD /path (vd. PUT /api/buyer/orders/:id/cancel)
- Response thực tế: status ___ , body (rút gọn) { "message": "…" }
- Kỳ vọng: …
- Ảnh Network tab (DevTools) hoặc log BE nếu có
```

**Frontend nên** bật tab **Network**, lọc request lỗi, gửi **URL đầy đủ + status + preview JSON** — không cần giải thích code.

---

## 4. Việc “không phải BE” vẫn giúp được

| Việc | Cách làm | Tài liệu |
|------|----------|----------|
| **Xác nhận lỗi do FE hay BE** | Thử cùng thao tác với **Postman/Swagger** gọi thẳng API; nếu BE trả đúng → nghi FE; BE trả sai → ticket BE. | Swagger Spring: thường `http://localhost:8081/swagger-ui/index.html` |
| **Kiểm tra đúng cổng** | Node và Spring **không** cùng lúc chiếm cổng `8081` (nếu không đổi cổng). | [BACKEND-LOCAL-SETUP.md](./BACKEND-LOCAL-SETUP.md) |
| **Đối chiếu nghiệp vụ** | Tranh luận “đúng/sai” nên dẫn **BR-ID** trong `business-rules/BUSINESS-RULES.md`. | [business-rules/BUSINESS-RULES.md](./business-rules/BUSINESS-RULES.md) |
| **Test theo vai** | Đăng nhập đúng role (Buyer/Seller/…) — bảng tài khoản test trong [README.md](../README.md). | [README.md](../README.md) phần Spring / demo |

---

## 5. Tránh phải “dạy lại” lần sau

- **Một nguồn chạy:** [BACKEND-LOCAL-SETUP.md](./BACKEND-LOCAL-SETUP.md)  
- **Một bảng path:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)  
- **Một bảng màn → API:** [BE-FE-API-AUDIT-BY-PAGE.md](./BE-FE-API-AUDIT-BY-PAGE.md)  
- **Khi đổi API:** cập nhật `docs/BE-FE-API-AUDIT*.md` + `CHANGELOG.md` (một dòng) — để người sau không hỏi lại.

---

## 6. Liên kết nhanh

| Nội dung | File |
|----------|------|
| Cài đặt clone/pull | [README.md](../README.md), [BACKEND-LOCAL-SETUP.md](./BACKEND-LOCAL-SETUP.md) |
| Hướng dẫn code Node (Express) | [BACKEND-GUIDE.md](./BACKEND-GUIDE.md) |
| Port Spring ↔ Node | [BACKEND-NODE-TO-SPRING-BOOT.md](./BACKEND-NODE-TO-SPRING-BOOT.md) |
| Thư mục `backend/` (README ngắn) | [backend/README.md](../backend/README.md) |

---

*Tài liệu này nhằm giảm onboarding trùng lặp; cập nhật khi quy trình team thay đổi.*
