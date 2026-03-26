# Gợi ý tài liệu đính kèm cho AI — Cả team (Backend, Frontend, QA / Tester)

Tài liệu này **phân rõ từng vai** (dev backend, dev frontend, người kiểm thử / tester trong team) và mô tả **nên copy đính kèm file `.md` nào**, **theo thứ tự nào**, và **mẫu prompt** khi bạn nhờ **một AI khác** (Gemini, ChatGPT, Claude, Copilot Chat, …) đọc và trả lời — để AI có đủ bối cảnh ShopBike mà không đoán sai cấu trúc repo, cổng, hay hợp đồng API/UI.

**File gốc một cửa:** đọc file này trước; sau đó nhảy tới [Phần A](#phan-a-backend), [Phần B](#phan-b-frontend), hoặc [Phần C](#phan-c-qa) tuỳ vai.

**Liên kết nhanh:** [README.md](../README.md) (chạy dự án), [docs/README.md](README.md) (mục lục `docs/`).

---

## 0. Bối cảnh chung — copy vào đầu mọi cuộc hội thoại với AI

Khi bạn dán tài liệu kèm prompt, **luôn thêm một khối “bối cảnh”** (copy nguyên hoặc rút gọn) để mọi vai đều đồng nhất:

```text
Dự án: ShopBike — Bike Trading (monorepo BE2).
- Thư mục gốc có package.json (React + Vite) và pom.xml (Spring Boot).
- Frontend: src/app/, src/features/, src/pages/, … — TypeScript/React, Vite dev server thường http://localhost:5173.
- Backend Spring: src/main/java/, src/main/resources/application.properties — API thường http://localhost:8081/api (kiểm tra server.port).
- File .env ở root: VITE_API_BASE_URL, VITE_USE_MOCK_API — sau khi sửa .env phải restart npm run dev.
- Có thể có thư mục backend/ (Node/Express) để đối chiếu — không chạy đồng thời Node và Spring trên cùng cổng 8081.
- Tài liệu chi tiết nằm trong docs/; đừng giả định cấu trúc khác nếu không có trong file đính kèm.
```

Tuỳ vai, bạn **bổ sung một dòng** ở cuối khối:

| Vai | Thêm dòng |
|-----|-----------|
| Backend | `Tôi là dev backend Java/Spring — ưu tiên khớp docs/BACKEND-NODE-TO-SPRING-BOOT và audit API.` |
| Frontend | `Tôi là dev frontend React — ưu tiên khớp apis/, services/, TanStack Query và docs/FE-ARCHITECTURE-V1-VS-V2.` |
| QA / Tester | `Tôi là QA kiểm thử thủ công / SWT301 — ưu tiên kịch bản trong docs/testing và BE-FE-API-AUDIT-BY-PAGE để map màn hình ↔ API.` |

<a id="phan-a-backend"></a>

## Phần A — Backend (Java / Spring Boot)

### A.1. Ai dùng phần này

Dev **Java / Spring Boot** trong repo: controller, service, entity, security, VNPay callback, CORS, DB (JPA).

### A.2. Gói tài liệu tiêu chuẩn (thứ tự — nên dán đủ)

| Thứ tự | File (từ root repo) | Vì sao |
|--------|----------------------|--------|
| 1 | [README.md](../README.md) — tối thiểu: *Sau khi clone hoặc pull*, *Dành cho Backend*, *Phần A — Backend Spring Boot*, dòng Swagger | Monorepo, IntelliJ, MySQL, cổng, nối FE. |
| 2 | [BACKEND-LOCAL-SETUP.md](BACKEND-LOCAL-SETUP.md) | Clone/pull, cổng, xung đột Node vs Spring. |
| 3 | [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) | **Trọng tâm:** map Node ↔ Spring, JWT, enum, multipart, VNPay, CORS. |
| 4 | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Auth, order status, env — khớp với FE. |

### A.3. Thêm file theo loại công việc (backend)

| Việc cần AI giúp | Thêm file |
|------------------|-----------|
| Endpoint khớp với FE (method/path/body) | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md), [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) |
| Rule nghiệp vụ (đơn, thanh toán, kiểm định) | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) |
| DB: bảng, cột, ENUM, FK | [ERD-SPEC.md](ERD-SPEC.md); tuỳ chọn [ERD-MYSQL.md](ERD-MYSQL.md), [sql/shopbike_mysql_schema.sql](sql/shopbike_mysql_schema.sql) |
| VNPay | [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) |
| So sánh với Node trong repo | [BACKEND-GUIDE.md](BACKEND-GUIDE.md), [../backend/README.md](../backend/README.md) — nhắc không trùng cổng Spring |
| Phối hợp PM/QA/FE | [BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md) |

### A.4. Chỉ được đính kèm một file

- Ưu tiên **[BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md)**.
- **Bắt buộc** dán thêm **đoạn ngắn** từ README mục *Dành cho Backend* (class `BikeTradingBackendApplication`, IntelliJ, MySQL, Swagger).

### A.5. Mẫu prompt (backend)

```text
[Khối bối cảnh §0 + dòng vai Backend]

Đính kèm: README (mục Backend + Phần A), BACKEND-LOCAL-SETUP, BACKEND-NODE-TO-SPRING-BOOT, QUICK-REFERENCE.

Câu hỏi: <mô tả bug hoặc task — ví dụ: chỉnh POST /orders/... để khớp FE checkout>.

Ràng buộc: không đổi cổng 8081/5173 nếu không giải thích; mọi endpoint mới phải khớp BE-FE-API-AUDIT.
```

### A.6. Thường không cần gửi (backend)

| File | Khi nào mới cần |
|------|-----------------|
| [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) full | Debug luồng TS chi tiết; thường audit + Quick ref là đủ. |
| [STRUCTURE.md](STRUCTURE.md), [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) | Debug chéo cache/UI với FE. |

<a id="phan-b-frontend"></a>

## Phần B — Frontend (React / Vite)

### B.1. Ai dùng phần này

Dev **React + TypeScript + Vite**: `src/apis/`, `src/services/`, hooks, TanStack Query, React Hook Form, Zod, route, i18n.

### B.2. Gói tài liệu tiêu chuẩn (thứ tự)

| Thứ tự | File | Vì sao |
|--------|------|--------|
| 1 | [README.md](../README.md) — *Sau khi clone*, *Phần B — ShopBike Frontend*, *Biến môi trường* | `.env`, mock vs API thật, `npm run dev`. |
| 2 | [STRUCTURE.md](STRUCTURE.md) | Cây `src/`, `queryKeys`, `hooks/queries/`, quy ước import. |
| 3 | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Routes, role, API path, order status, env — tránh lệch với BE. |
| 4 | [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) | **Bắt buộc** khi sửa data server: Query, `invalidateQueries`, RHF, tránh cache sai. |
| 5 | [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | Luồng axios → apiClient → apis → services; VNPay, upload — tìm đúng file khi sửa màn. |

### B.3. Thêm file theo loại công việc (frontend)

| Việc cần AI giúp | Thêm file |
|------------------|-----------|
| Kiểm tra sau khi sửa nhiều màn / mutation | [FE-V2-VERIFICATION-GUIDE.md](FE-V2-VERIFICATION-GUIDE.md) |
| Ship / checklist trước release | [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) |
| Đối chiếu BE có đúng endpoint không | [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) (theo page) |
| Hiểu nghiệp vụ khi viết UI copy / validation | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) (mục liên quan) |
| Tổng quan sản phẩm | [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) |

### B.4. Chỉ được đính kèm một file

- Ưu tiên **[FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md)** nếu câu hỏi về Query/cache/mutation.
- Hoặc **[FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md)** nếu câu hỏi “request đi từ component nào”.
- Luôn dán kèm **5–10 dòng** từ README về `.env` (`VITE_API_BASE_URL`, `VITE_USE_MOCK_API`).

### B.5. Mẫu prompt (frontend)

```text
[Khối bối cảnh §0 + dòng vai Frontend]

Đính kèm: STRUCTURE, QUICK-REFERENCE, FE-ARCHITECTURE-V1-VS-V2, FRONTEND-API-FLOWS (hoặc rút mục liên quan).

Câu hỏi: <ví dụ: sau khi mutate createOrder cần invalidate queryKeys nào>.

Ràng buộc: không đề xuất đổi env sang mock nếu đang debug API thật; mọi path API phải khớp QUICK-REFERENCE / audit.
```

### B.6. Thường không cần gửi (frontend)

| File | Ghi chú |
|------|---------|
| Toàn bộ [ERD-SPEC.md](ERD-SPEC.md) | Chỉ khi sửa form map trực tiếp cột DB hoặc debug lệch payload với schema. |
| [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) full | Khi debug hợp đồng JSON với BE; không cần cho thuần UI styling. |

<a id="phan-c-qa"></a>

## Phần C — QA / Kiểm thử thủ công / SWT301

### C.1. Ai dùng phần này

**Tester / QA** trong team: viết test case, chạy thủ công, ghi defect, báo cáo SWT301, walkthrough theo vai (Guest, Buyer, Seller, Inspector, Admin).

### C.2. Gói tài liệu tiêu chuẩn (thứ tự)

| Thứ tự | File | Vì sao |
|--------|------|--------|
| 1 | [README.md](../README.md) — *Sau khi clone*, bảng kịch bản A/B/C, *Phần B*, tài khoản test (nếu có) | Cài máy, chạy FE + BE, `.env`, đăng nhập. |
| 2 | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Route, role, endpoint — viết bước TC và expected. |
| 3 | [BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md) | **Page → API** — map màn hình với request để mô tả bug đúng chỗ. |
| 4 | [testing/README.md](testing/README.md) | Quy trình SWT301, lệnh, file Excel local, export defect. |
| 5 | [testing/SWT301_TESTING_GUIDE.md](testing/SWT301_TESTING_GUIDE.md) | Kịch bản dài, workbook TC, DEF-SWT, thuyết trình — **bài chính cho môn / báo cáo**. |

### C.3. Thêm file theo loại công việc (QA)

| Việc cần AI giúp | Thêm file |
|------------------|-----------|
| Viết expected theo rule nghiệp vụ | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) |
| Hiểu luồng tổng thể / demo | [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) |
| Kiểm tra checklist sau khi dev báo “đã sửa” | [FE-V2-VERIFICATION-GUIDE.md](FE-V2-VERIFICATION-GUIDE.md) |
| Thanh toán / VNPay (lỗi tiền, redirect) | [PAYMENTS-VNPAY.md](PAYMENTS-VNPAY.md) |
| Audit theo endpoint (không theo page) | [BE-FE-API-AUDIT.md](BE-FE-API-AUDIT.md) |
| Phối hợp dev, mẫu ticket | [BACKEND-COLLABORATION.md](BACKEND-COLLABORATION.md) |

### C.4. Chỉ được đính kèm một file

- Ưu tiên **[testing/SWT301_TESTING_GUIDE.md](testing/SWT301_TESTING_GUIDE.md)** nếu AI phải giúp **bài SWT301 / slide / lời thuyết trình**.
- Hoặc **[BE-FE-API-AUDIT-BY-PAGE.md](BE-FE-API-AUDIT-BY-PAGE.md)** nếu AI phải giúp **mô tả bug theo màn + API**.
- Luôn dán kèm **khối §0** + **3–5 dòng** từ README về cách bật app (mock vs API thật).

### C.5. Mẫu prompt (QA / Tester)

```text
[Khối bối cảnh §0 + dòng vai QA]

Đính kèm: QUICK-REFERENCE, BE-FE-API-AUDIT-BY-PAGE, testing/README, SWT301_TESTING_GUIDE (hoặc đoạn mục liên quan).

Câu hỏi: <ví dụ: viết thêm 5 test case cho luồng Inspector duyệt tin — format ID, bước, expected, trace BR>.

Ràng buộc: mọi expected phải có thể chỉ ra route trong QUICK-REFERENCE hoặc rule trong BUSINESS-RULES; không bịa endpoint.
```

### C.6. Thường không cần gửi (QA)

| File | Ghi chú |
|------|---------|
| [BACKEND-NODE-TO-SPRING-BOOT.md](BACKEND-NODE-TO-SPRING-BOOT.md) full | Chỉ khi bug sâu ở contract JSON / enum phía Spring. |
| [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) | Chỉ khi bug liên quan cache / không refresh sau hành động. |
| File `.xlsx` / screenshot | Đính kèm **mô tả** trong chat; file nhị phân nhiều AI không đọc trực tiếp — tóm tắt bảng TC/defect bằng text. |

---

## Phần D — Bảng tổng hợp nhanh (một trang)

| Vai | Gói tối thiểu (4–5 file đầu) |
|-----|------------------------------|
| **Backend** | README (mục BE + A) → BACKEND-LOCAL-SETUP → BACKEND-NODE-TO-SPRING-BOOT → QUICK-REFERENCE |
| **Frontend** | README (mục B + env) → STRUCTURE → QUICK-REFERENCE → FE-ARCHITECTURE-V1-VS-V2 → FRONTEND-API-FLOWS |
| **QA / Tester** | README (chạy app) → QUICK-REFERENCE → BE-FE-API-AUDIT-BY-PAGE → testing/README → SWT301_TESTING_GUIDE |

---

## Phần E — Lỗi thường gặp khi prompt AI

| Lỗi | Cách sửa |
|-----|----------|
| AI “bịa” cổng hoặc URL | Luôn dán khối **§0** + dòng từ `application.properties` / `.env.example`. |
| AI đề xuất API không tồn tại trên FE | Đính kèm **BE-FE-API-AUDIT** hoặc **QUICK-REFERENCE**. |
| AI sửa FE làm hỏng cache | Đính kèm **FE-ARCHITECTURE-V1-VS-V2** + **queryKeys**. |
| AI viết TC không khớp role/route | Đính kèm **QUICK-REFERENCE** + **BE-FE-API-AUDIT-BY-PAGE**. |

---

*Tài liệu gốc cho cả team: một file — cập nhật 26-03-2026. File [AI-CONTEXT-for-BACKEND.md](AI-CONTEXT-for-BACKEND.md) trỏ về đây (phần Backend).*
