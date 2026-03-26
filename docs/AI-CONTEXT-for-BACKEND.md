# Gợi ý tài liệu đính kèm cho AI — Backend (ShopBike)

Tài liệu này mô tả **nên copy/ghi đính kèm file `.md` nào** khi bạn (dev backend) nhờ **một mô hình AI khác** (Gemini, ChatGPT, Claude, v.v.) đọc và trả lời về **Spring Boot, API, DB, VNPay** trong repo ShopBike — để AI có đủ bối cảnh mà không phải đoán cấu trúc repo hay lệch hợp đồng API.

**Đọc kèm:** [README.md](../README.md) mục **Dành cho Backend (Java Spring Boot, IntelliJ)** — hướng dẫn chạy máy; file này tập trung vào **gói tài liệu cho AI**.

---

## 1. Giả định về repo (nhắc nhanh cho AI)

Khi dán nội dung vào chat AI, nên có **một dòng mở đầu** (copy đoạn sau hoặc tóm tắt):

- Repo **monorepo BE2**: **Spring Boot** ở `src/main/java/`, **React + Vite** ở `src/app/`, `src/features/`, … — cùng thư mục gốc có `pom.xml` và `package.json`.
- API Spring thường chạy cổng **8081** (xem `server.port` trong `src/main/resources/application.properties`); FE dev `http://localhost:5173`, base API trong `.env`: `VITE_API_BASE_URL=.../api`.
- Có thể có thư mục **`backend/`** (Node/Express) để **đối chiếu** — **không** chạy đồng thời Node và Spring trên **cùng một cổng**.

---

## 2. Gói tài liệu tiêu chuẩn (thứ tự ưu tiên)

Dán theo **thứ tự dưới đây** giúp AI hiểu từ “chạy máy” → “hợp đồng API” → “tra cứu nhanh”.

| Thứ tự | File (đường dẫn từ root repo) | Vì sao cần |
|--------|-------------------------------|------------|
| 1 | [README.md](../README.md) — **tối thiểu** các mục: *Sau khi clone hoặc pull*, *Dành cho Backend (Java Spring Boot, IntelliJ)*, *Phần A — Backend Spring Boot*, và dòng Swagger | Bối cảnh monorepo, IntelliJ, MySQL, cổng, cách nối FE. |
| 2 | [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) | Bước cài, clone/pull, cổng, xử lý trùng cổng — tránh AI “bịa” môi trường. |
| 3 | [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | **Trọng tâm kỹ thuật:** map endpoint Node ↔ Spring, JWT, enum, multipart/upload, VNPay, CORS — khi sửa controller/service. |
| 4 | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Base URL, auth refresh, order status, env — tra nhanh khi AI gợi ý sửa API hoặc so khớp với FE. |

---

## 3. Thêm file theo loại công việc

| Bạn đang nhờ AI làm gì | Thêm file |
|------------------------|-----------|
| Sửa/ghi endpoint **khớp với FE** (method, path, body) | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) và/hoặc [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) |
| Logic nghiệp vụ, rule đơn hàng / thanh toán / kiểm định | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) |
| Entity, migration, cột, ENUM, FK | [ERD-SPEC.md](ERD-SPEC.md); tuỳ chọn [ERD-MYSQL.md](ERD-MYSQL.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) |
| VNPay (return URL, IPN, trạng thái thanh toán) | [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) |
| So sánh hành vi với **Node** trong repo | [BACKEND-GUIDE.md](BACKEND-GUIDE.md), [../backend/README.md](../backend/README.md) — **nhắc AI không chạy trùng cổng với Spring** |
| Làm việc với PM/QA/FE (thuật ngữ, ticket) | [BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md) |

---

## 4. Chỉ được đính kèm **một** file (giới hạn token)

- **Không đủ chỗ** hoặc tool chỉ cho một file: ưu tiên **[BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md)** (hợp đồng & port Spring).
- **Bắt buộc** dán thêm **đoạn ngắn** từ [README.md](../README.md) mục **Dành cho Backend** (entry class `BikeTradingBackendApplication`, IntelliJ, MySQL, Swagger) — vì file port thường **không** mô tả đủ “mở project ở đâu, chạy class nào”.

---

## 5. Mẫu câu gợi ý (prompt) khi chat với AI

Bạn có thể đính kèm gói file ở §2, rồi thêm đoạn tương tự:

> Đây là repo ShopBike (monorepo: Spring trong `src/main/java`, FE React trong `src/`). Ưu tiên khớp [BACKEND-NODE-TO-SPRING-BOOT] và audit API; không đổi cổng 8081/5173 nếu không nêu lý do. Khi đề xuất code Java, trỏ rõ package/controller liên quan.

---

## 6. Những thứ **thường không** cần gửi (trừ khi đúng chủ đề)

| Nội dung | Ghi chú |
|----------|---------|
| Toàn bộ [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | Chỉ cần khi AI phải hiểu **luồng gọi từ TS** chi tiết; thường audit API + Quick reference là đủ. |
| [STRUCTURE.md](STRUCTURE.md), [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) | Chủ yếu cho dev FE / Query; BE chỉ cần khi debug chéo với cache UI. |
| Export cả repo dạng “mọi file `.md`” | Dễ tràn ngữ cảnh; nên chọn theo §2 + §3. |

---

## 7. Liên kết nhanh

| | |
|--|--|
| Mục lục `docs/` | [README.md](README.md) |
| Chỉ mục Backend trong `docs/README` | [README.md#backend-java-spring-boot-hướng-dẫn--tài-liệu](README.md#backend-java-spring-boot-hướng-dẫn--tài-liệu) |

---

*Cập nhật: 26-03-2026 — gói tài liệu gợi ý cho AI (backend).*
