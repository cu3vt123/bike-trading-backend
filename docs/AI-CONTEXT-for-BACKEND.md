# Gợi ý tài liệu đính kèm cho AI — Backend (ShopBike)

Tài liệu này dành cho **dev backend Java / Spring Boot** khi nhờ AI (Gemini, ChatGPT, Copilot, …) hỗ trợ code, debug API hoặc schema.

---

## Chuẩn kỹ thuật (đọc trước khi dán prompt)

| Đúng | Sai (tránh để AI đoán) |
|------|-------------------------|
| **Spring Boot** trong `src/main/java/`, chạy từ IntelliJ (`BikeTradingBackendApplication`) | Coi `backend/` (Express) là backend chính của đồ án |
| **MySQL + JPA (Hibernate)** — bảng/cột theo [ERD-SPEC.md](ERD-SPEC.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) | **MongoDB / Mongoose** làm mô hình persistence cho Spring |
| Hợp đồng REST + JSON khớp FE: [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md), [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Tự bịa path API hoặc field không có trong audit |
| Folder **`backend/`** (Express) chỉ **tham chiếu HTTP tùy chọn** khi đối chiếu | Copy schema/logic DB từ Mongoose sang JPA nguyên xi |

---

## Gói file đính kèm (thứ tự — nên giữ)

Chi tiết đầy đủ, mẫu prompt dài và bảng “thêm file theo việc”: xem **[Phần A — Backend](AI-CONTEXT-for-TEAM.md#phan-a-backend)** trong [AI-CONTEXT-for-TEAM.md](AI-CONTEXT-for-TEAM.md).

| Thứ tự | File | Vai trò |
|--------|------|---------|
| 1 | [README.md](../README.md) (mục Backend, Phần A Spring) | Monorepo, IntelliJ, MySQL, Swagger |
| 2 | [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) | Cổng, sau `git pull`, không trùng Node/Spring |
| 3 | **[BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md)** | **Trọng tâm:** IntelliJ, contract `/api`, JWT, multipart, VNPay, **thiết kế SQL** |
| 4 | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Env, role, endpoint — khớp FE |

**Thường thêm khi:** sửa entity → [ERD-SPEC.md](ERD-SPEC.md); nghiệp vụ → [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md); VNPay → [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md); đối chiếu route cũ → [BACKEND-GUIDE.md](BACKEND-GUIDE.md) / [../backend/README.md](../backend/README.md) (nhắc: chỉ tham chiếu, DB vẫn MySQL).

---

## Khối bối cảnh ngắn (copy vào đầu chat)

Dùng bản **đầy đủ** ở đầu [AI-CONTEXT-for-TEAM.md](AI-CONTEXT-for-TEAM.md) (mục **0. Bối cảnh chung**). Tối thiểu cho backend:

```text
ShopBike BE2 — backend chính: Spring Boot + MySQL (JPA), không dùng Mongo cho Spring.
IntelliJ: BikeTradingBackendApplication; API http://localhost:8081/api (kiểm tra server.port).
Đính kèm: BACKEND-NODE-TO-SPRING-BOOT.md + QUICK-REFERENCE.md (và ERD-SPEC nếu sửa bảng).
```

---

## Mẫu prompt tối thiểu

```text
[Khối bối cảnh trên + dòng: Tôi là dev backend Java/Spring.]

Task: <mô tả>.
Ràng buộc: mọi endpoint/path phải khớp QUICK-REFERENCE / BE-FE-API-AUDIT; entity/FK khớp ERD-SPEC; không đề xuất Mongoose/Mongo cho code Spring.
```

---

**Bản đầy đủ (Phần A–E, QA, lỗi prompt):** [AI-CONTEXT-for-TEAM.md](AI-CONTEXT-for-TEAM.md)

---

*Cập nhật 30-03-2026 — đồng bộ Spring + IntelliJ + SQL; `AI-CONTEXT-for-TEAM` vẫn là file gốc một cửa cho cả team.*
