# SWT301 — Hướng dẫn testing & demo (ShopBike)

Tài liệu **gộp một chỗ**: môi trường chạy demo, walkthrough theo vai, workbook Excel **200 test** (`SWT301_TestCase_Functional_and_Unit_Combined.xlsx`), defect **DEF-SWT-001…007**, và **xuất DefectList.xlsx**.

## Mục lục

1. [Môi trường & cấu hình](#1-môi-trường--cấu-hình-chạy-demo)
2. [Walkthrough demo theo vai (route thực tế)](#2-walkthrough-demo-theo-vai-route-thực-tế)
3. [Workbook Excel 200 TC — Functional + Unit](#3-workbook-excel-200-tc--functional--unit)
4. [Defect DEF-SWT-001 … 007](#4-defect-def-swt-001--007-đối-chiếu--chứng-cứ)
5. [Xuất DefectList.xlsx (Lab 4)](#5-xuất-defectlistxlsx-lab-4)
6. [Gợi ý thuyết trình (thao tác + lời nói)](#6-gợi-ý-thuyết-trình-thao-tác--lời-nói)
7. [Liên kết repo](#7-liên-kết-repo)

---

## 1. Môi trường & cấu hình chạy demo

### 1.1. Kiến trúc tối thiểu

```
Trình duyệt  →  Vite (FE) :5173  →  HTTP  →  API Spring/Node :8081  →  DB
```

- **FE:** React + Vite, thường `http://localhost:5173`.
- **BE:** REST dưới base **`/api`** (vd. `http://localhost:8081/api`).
- Nếu BE khác cổng: chỉnh `VITE_API_BASE_URL` cho khớp.

### 1.2. Frontend

```bash
npm install
npm run dev
```

| Lệnh | Khi nào |
|------|---------|
| `npm run build` | Kiểm tra build trước merge / demo |
| `npm run preview` | Xem bản build |
| `npm run lint` | ESLint |

Xác nhận: Vite in URL, trang chủ load, Console không lỗi đỏ hàng loạt.

### 1.3. Biến môi trường (Vite)

File tại root frontend: `.env`, `.env.local`, … (tiền tố `VITE_`). `.env.local` thường không commit.

**`VITE_API_BASE_URL`** — URL gốc API. Mặc định trong `src/lib/apiConfig.ts`: `http://localhost:8081/api`.

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

**`VITE_API_TIMEOUT`** — timeout axios (ms), mặc định ~15000.

**`VITE_USE_MOCK_API=true`** — dùng mock khi không có BE. Demo SWT301 trên API thật: **`false`** hoặc không set. Sau khi sửa env: **restart** `npm run dev`.

### 1.4. Backend

- **Spring:** `src/main/java/...` — xem README root + `docs/`. Security: `/api/inspector/**` → `hasAnyRole(INSPECTOR, ADMIN)` (liên quan DEF-SWT-002).
- **Node:** `backend/README.md`, cổng trong `server.js` / env. Inspector: `requireRole(["INSPECTOR", "ADMIN"])`.

### 1.5. CORS

Nếu bị chặn CORS: BE cho phép origin Vite (`http://localhost:5173`), không mở FE bằng `file://`, kiểm tra http/https và cổng.

### 1.6. Tài khoản demo

Seed từ DatabaseSeeder / `seed.js` — đủ Buyer, Seller, Inspector, Admin (xem README backend, `docs/QUICK-REFERENCE.md`).

### 1.7. Checklist 5 phút trước demo

| # | Việc | OK? |
|---|------|-----|
| 1 | `npm run dev`, trang chủ load | ☐ |
| 2 | BE chạy hoặc mock có chủ đích | ☐ |
| 3 | Network: `/api/...` không failed hàng loạt | ☐ |
| 4 | Đăng nhập được role cần cho kịch bản | ☐ |
| 5 | Console: không lỗi đỏ chặn luồng | ☐ |

### 1.8. Xử lý nhanh theo triệu chứng

| Triệu chứng | Hướng xử lý |
|-------------|-------------|
| Trắng trang | `npm install`, cài lại `node_modules` nếu cần |
| 401 mọi API | Đăng xuất, đăng nhập lại |
| 403 `/api/inspector/**` | Role Admin/Inspector + Security BE |
| 404 `/api/...` | Sai `VITE_API_BASE_URL` hoặc thiếu route BE |
| Inspector không load `/bikes/:id` pending | DEF-SWT-001/003 — cần `GET /inspector/listings/:id` + FE |
| Không sinh DefectList | `npm install` (package `xlsx`), `node scripts/export-defectlist-xlsx.mjs` |

---

## 2. Walkthrough demo theo vai (route thực tế)

**Base URL:** `http://localhost:5173` (đổi nếu Vite khác). Route theo `src/routes/AppRouter.tsx`.

**Chuẩn bị:** FE + BE khớp env; Chrome **DevTools → Network** (XHR) khi cần chứng minh API.

### 2.1. Guest

| Bước | Hành động | Kỳ vọng |
|------|-----------|---------|
| 1.1 | Mở `/` | Trang chủ, danh sách tin |
| 1.2 | Mở `/bikes/<id>` (tin PUBLISHED) | Chi tiết load |
| 1.3 | `/login` | Form đăng nhập |

Guest không vào `/checkout`, `/seller`, `/inspector` (guard).

### 2.2. Seller

Đăng nhập **SELLER**.

| Route | Ghi chú |
|-------|---------|
| `/seller` | Dashboard |
| `/seller/listings/new` | **DEF-SWT-006:** năm SX — thử năm > năm hiện tại, 3 số, &lt; 1900 → lỗi; lưu/gửi khi hợp lệ |
| `/seller/listings/<id>/edit` | Sửa tin, validation khi load |

### 2.3. Inspector hoặc Admin

Đăng nhập **INSPECTOR** hoặc **ADMIN**.

| Route | Ghi chú |
|-------|---------|
| `/inspector` | Danh sách pending |
| `/bikes/<id>` (tin PENDING_INSPECTION) | **DEF-SWT-001 / 003:** chi tiết load; thử **F5** — vẫn có dữ liệu |
| Network | Có request `inspector/listings/...`, không chỉ public `/bikes/:id` rồi 404 |

**DEF-SWT-002:** Admin gọi `/api/inspector/**` không bị 403 chỉ vì role.

### 2.4. Buyer

Đăng nhập **BUYER**.

| Route | Ghi chú |
|-------|---------|
| `/bikes/<id>` | Mở tin → checkout |
| `/checkout/<listingId>` | Đặt cọc / thanh toán |
| `/transaction/<listingId>?orderId=...` | Theo dõi đơn |
| `/finalize/<listingId>?orderId=...` | Hoàn tất / số dư |
| `/success/<listingId>` | **DEF-SWT-004:** `state.orderId` → snapshot từ order |

### 2.5. Admin (kho / giao dịch)

Vào dashboard admin (route `/admin` hoặc qua Profile — tùy build).

**DEF-SWT-007:** Không còn tiền tố “Bước 5/6” trong chuỗi i18n kho / transaction.

### 2.6. DEF-SWT-005 — Phiên đăng nhập

Đăng nhập A → đăng xuất → đăng nhập B; hoặc 401 → `apiClient` clear token (`src/lib/apiClient.ts`, `useAuthStore`).

### 2.7. Bảng route nhanh

| Route | Guard |
|-------|--------|
| `/`, `/bikes/:id` | Public (+ Inspector/Admin dùng thêm API inspector) |
| `/profile` | RequireAuth |
| `/inspector` | Inspector hoặc Admin |
| `/checkout`, `/transaction`, `/finalize`, `/success` | Buyer |
| `/seller`, `/seller/listings/new`, `/seller/listings/:id/edit` | Seller |
| `/login`, `/register` | Guest (GuestGuard) |

### 2.8. Sau demo

Screenshot / HAR → `docs/testing/screenshots/` (local). Cập nhật DefectList nếu cần — xem [mục 5](#5-xuất-defectlistxlsx-lab-4).

---

## 3. Workbook Excel 200 TC — Functional + Unit

File: **`docs/testing/SWT301_TestCase_Functional_and_Unit_Combined.xlsx`** (thường **không** commit — xem `.gitignore`).

**Quy ước:** **200** dòng = **100 TC chức năng** (25×4 actor) + **100 UTC** (25×4 actor). Không phải 400.

### 3.1. Các sheet

| Sheet | Vai trò |
|-------|---------|
| `_00_INDEX` | Mục lục tổng quan |
| `F_Cover`, `F_Test case List` | Bìa + môi trường kiểm thử |
| `F_Buyer` … `F_Admin` | 25 TC mỗi sheet: `TC-BUY-*`, `TC-SEL-*`, `TC-INS-*`, `TC-ADM-*` |
| `F_Test Report` | Báo cáo tổng hợp functional |
| `U_Guidleline` | Unit: **N** Normal, **A** Abnormal, **B** Boundary; gợi ý chu kỳ N,N,N,B,A |
| `U_Cover`, `U_FunctionList` | Bìa + môi trường UTC |
| `U_Buyer` … `U_Admin` | 25 UTC mỗi sheet: `UTC-BUY-*`, … |
| `U_Test Report` | Báo cáo unit |

**Cột Functional (`F_*`):** ID, Test Case Description, Procedure, Expected Output, Inter-test case Dependence, **Result**, **Test date**, **Note**.

**Cột Unit (`U_*`):** UTCID, Function Code, Precondition, Condition/Input, Expected confirmation, **Type (N/A/B)**, Result, Executed Date, Defect ID, Note.

### 3.2. Chạy Functional trên UI

1. Đọc Description → xác định **route**.  
2. Xem **Dependence** — chạy TC trước hoặc chuẩn bị seed.  
3. Procedure (template 5 bước trong sheet).  
4. So Expected → điền **Result**, **Test date**, **Note** (defect id nếu Fail).  
5. Thứ tự actor gợi ý: **Buyer → Seller → Inspector → Admin** (giảm đăng xuất).

Các TC **001–012** và **013–025** trong file có **mẫu lặp** — có thể ưu tiên demo **001–012** đủ luồng, phần còn lại điền Pass theo checklist.

### 3.3. Bảng tra cứu Functional (rút gọn)

**F_Buyer:** TC-BUY-001 `/` marketplace; 002 `/bikes/:id` published; 003 profile checkout; 004 UNVERIFIED disclaimer; 005 checkout thiếu street; 006 transaction thiếu city; 007 finalize paymentUrl; 008 success VNPay resume; 009 vnpay-result cancel; 010 login polling 5s; 011 register pay balance; 012 complete SHIPPING; 013–025 lặp pattern.

**F_Seller:** 001 dashboard; 002 stats nháp; 003 packages upload; 004 listings/new; 005 edit publish unverified; 006 orders VIP inspection; 007 slot limit; 008 ship direct; 009 warehouse; 010 subscription VNPay; 011 revoke subscription; 012 ratings (**DEF-SWT-006**); 013–025 lặp.

**F_Inspector:** 001 pending list; 002 detail inspector (**DEF-SWT-001/003**); 003 approve; 004 reject; 005 need-update; 006 re-inspection; 007 token expired; 008 filter; 009–025 lặp.

**F_Admin:** 001 stats; 002–003 users hide/unhide; 004–005 listings; 006 warehouse-pending; 007 confirm-warehouse; 008 re-inspection (**DEF-SWT-002**); 009 re-inspection-done; 010 reviews (**DEF-SWT-007**); 011–017 brands, subscriptions; 018–025 lặp.

### 3.4. Unit (UTC) — thực thi thủ công có chứng cứ

- **N:** luồng đúng. **A:** lỗi mong đợi (401/403…). **B:** biên.  
- Dùng Network + Application (token) + Console; hoặc automation sau (map Function Code → test file).

Ví dụ map Functional ↔ Unit cùng số: TC-BUY-012 ↔ UTC-BUY-012 (Finalize ưu tiên order); TC-INS-002 ↔ UTC-INS-002 (`GET /inspector/listings/:id`).

### 3.5. Ghi báo cáo

Điền **F_Test Report** / **U_Test Report** sau buổi test. Defect trace **Related TC ID** khớp `TC-*` / `UTC-*` — xem [mục 4–5](#4-defect-def-swt-001--007-đối-chiếu--chứng-cứ).

### 3.6. Demo ngắn (~20–30 phút)

Buyer 001–002 + một luồng checkout; Seller 001,004,005 (năm xe); Inspector 001–002; Admin 006,008,010; Unit: vài dòng U_Buyer (401, polling) + U_Inspector (GET listing).

### 3.7. Git

File `.xlsx` thường ignore; backup workbook trên drive nhóm hoặc nộp bài theo yêu cầu môn.

---

## 4. Defect DEF-SWT-001 … 007 (đối chiếu & chứng cứ)

Nguồn export: `scripts/export-defectlist-xlsx.mjs`. Trạng thái trong script thường **Closed** — vẫn nên chạy lại kịch bản trước nộp.

### 4.1. Bảng tổng hợp

| ID | Severity | Priority | Related TC | Req (ghi chú) |
|----|----------|----------|------------|---------------|
| DEF-SWT-001 | Major | P1 | TC-INS-002 | UR-INS-01 |
| DEF-SWT-002 | Major | P1 | TC-ADM-008 | UR-AUTH-04 |
| DEF-SWT-003 | Major | P2 | TC-INS-003 | UR-INS-01 |
| DEF-SWT-004 | Major | P2 | TC-BUY-022 | UR-ORD-05 |
| DEF-SWT-005 | Major | P2 | TC-BUY-001 | UR-AUTH-02 |
| DEF-SWT-006 | Major | P2 | TC-SEL-012 | UR-LIST-03 |
| DEF-SWT-007 | Minor | P3 | TC-ADM-010 | UR-ADM-01 |

### 4.2. Chi tiết từng defect

**DEF-SWT-001** — Không xem chi tiết tin PENDING_INSPECTION: BE `GET /api/inspector/listings/{id}`, FE `fetchListingByIdForInspector`. Route: `/bikes/:id`. Minh chứng: Network 200 `inspector/listings/...`.

**DEF-SWT-002** — Admin 403 trên inspector: `hasAnyRole(INSPECTOR, ADMIN)` trong Security. Demo: Admin gọi API inspector → 200.

**DEF-SWT-003** — Race hydrate ProductDetail: fallback gọi inspector khi có token. Demo: F5 `/bikes/:id` tin pending.

**DEF-SWT-004** — PurchaseSuccess: `orderId` + `fetchOrderById` + snapshot. Route `/success/:id`.

**DEF-SWT-005** — Token/role: `clearTokens`, 401 interceptor, login clear. Files: `useAuthStore`, `apiClient`, `LoginPage`.

**DEF-SWT-006** — Năm SX Seller: `validateYearField`, `yearStringToApi`, i18n. Route: `/seller/listings/new`, `.../edit`.

**DEF-SWT-007** — Bỏ nhãn “Bước 5/6”: `vi.json` / `en.json` (warehouse, transaction).

Minh chứng local: `docs/testing/screenshots/` hoặc `evidence/` (có thể ignore).

---

## 5. Xuất DefectList.xlsx (Lab 4)

**Yêu cầu:** Node.js, `npm install` (package `xlsx`).

```bash
node scripts/export-defectlist-xlsx.mjs
```

**Output:** `docs/testing/DefectList.xlsx` — terminal: `Written: ... (7 defects)`.

**Sửa nội dung defect:** chỉnh mảng `rows` trong `scripts/export-defectlist-xlsx.mjs` → chạy lại lệnh.

**Cột sheet `DefectList`:** Defect ID, Title, Severity, Priority, Status, Environment, Related TC ID, Related Req ID, Steps to Reproduce, Expected Result, Actual Result, Attachments, Reporter, Reported Date, Assignee, Root Cause.

**Trước khi nộp:** mở Excel kiểm tra font/cột; đồng bộ ngày; tên file Attachments khớp file đính kèm thật.

**Lỗi thường gặp:** thiếu module `xlsx` → `npm install`; đóng Excel trước khi ghi đè file.

---

## 6. Gợi ý thuyết trình (thao tác + lời nói)

Mục này bổ sung **kịch bản nói gợi ý** đi kèm **thao tác** — bạn có thể đọc lại bằng lời của mình, không cần thuộc lòng.

### 6.1. Hai file `docs/testing/` dùng thế nào khi báo cáo?

| File | Vai trò khi thuyết trình |
|------|---------------------------|
| **`README.md`** | **Mở đầu 30 giây:** chỉ ra “đây là thư mục testing, có workbook Excel + DefectList local, link sang guide đầy đủ”. Không cần đọc hết. |
| **`SWT301_TESTING_GUIDE.md`** | **Bài đọc chính:** môi trường, từng bước demo theo vai, bảng TC/UTC, defect — **và mục 6 này** (lời gợi ý). |

**Lưu ý:** Phần trên của guide (mục 1–5) là **chi tiết kỹ thuật**; mục **6** tập trung **cách nói + thứ tự làm** trước lớp.

### 6.2. Mở đầu (~1 phút) — gợi ý lời nói

> “Em xin demo hệ thống ShopBike: frontend React/Vite kết nối backend REST. Đồ án SWT301 em có **bộ test case gộp Functional và Unit** trong file Excel 200 dòng, và **quản lý defect** theo Lab 4 với file DefectList.  
> Em sẽ chạy app trên trình duyệt, lần lượt thể hiện luồng **Buyer, Seller, Inspector/Admin**, và kết nối với một vài defect đã ghi nhận.  
> Môi trường: FE chạy cổng 5173, API đã cấu hình trong `VITE_API_BASE_URL`.”

*(Điều chỉnh “em” / “nhóm em” theo quy định lớp.)*

### 6.3. Demo theo khối — thao tác + lời gợi ý

| Khối | Thao tác (màn hình) | Gợi ý lời nói (tóm tắt) |
|------|---------------------|-------------------------|
| **Guest / Buyer** | Mở `/`, `/bikes/:id`; đăng nhập Buyer; nếu kịp: vào checkout hoặc transaction | “Đây là **marketplace** — khách xem tin đã publish. Khi đăng nhập **Buyer**, em được vào **checkout**, **transaction**, **finalize**, **success** theo luồng đặt mua và thanh toán đã mô tả trong test case TC-BUY.” |
| **Seller** | `/seller` → `/seller/listings/new` hoặc sửa tin; nhập **năm sản xuất** sai (tương lai / không đủ 4 số) | “Luồng **Seller** tạo và sửa tin. Em minh họa **validation năm xe**: hệ thống không chấp nhận năm > năm hiện tại — liên quan defect **DEF-SWT-006** và test case **TC-SEL-012** trong Excel.” |
| **Inspector / Admin** | `/inspector` → chọn tin pending → `/bikes/:id`; có thể F5; bật tab **Network** | “Inspector **duyệt tin chờ**: chi tiết tin **không** chỉ lấy từ API public mà còn **GET /inspector/listings/:id** — defect **DEF-SWT-001**, **003**. **Admin** cũng gọi được API inspector, không bị 403 — **DEF-SWT-002**.” |
| **Success / đơn hàng** | (Nếu có dữ liệu) `/success/:id` hoặc từ transaction | “Sau khi đơn hoàn tất, trang **success** lấy **snapshot tin từ order** để vẫn hiển thị khi listing không còn public — **DEF-SWT-004**.” |
| **Admin UI** | Màn kho / transaction (nếu có route) | “Phần nhãn giao diện admin đã bỏ tiền tố “Bước 5/6” gây rối — **DEF-SWT-007**.” |
| **Unit / Excel** | Chỉ vào sheet `F_Buyer` / `U_Buyer` trên Excel hoặc slide | “Trong workbook **200 test**, **100** là test chức năng trên UI, **100** là unit test map với FE — **Type N/A/B** trong sheet `U_*`. Em đối chiếu **Expected** với kết quả khi chạy.” |
| **DefectList** | Terminal: `node scripts/export-defectlist-xlsx.mjs` hoặc mở `DefectList.xlsx` | “DefectList em sinh bằng script trong repo, có **Related TC ID** trùng với mã trong Excel — **trace** từ bug về test case.” |

### 6.4. Kết thúc (~30 giây) — gợi ý lời nói

> “Tóm lại em đã demo đúng các luồng chính theo **USER-REQUIREMENTS**, có **bảng test case và defect** để truy vết. Em sẵn sàng trả lời thêm về API hoặc cấu hình. Cảm ơn thầy cô.”

### 6.5. Mẹo

- **Không** cần đọc hết bảng TC trong Excel trước lớp; chỉ cần **chỉ đúng sheet + mã TC** khi giảng viên hỏi.  
- Giữ **một tab Network** sẵn để chứng minh request **inspector** (200) khi hỏi defect.  
- Nếu thiếu thời gian: ưu tiên **Seller (năm xe)** + **Inspector (chi tiết tin pending)** + **DefectList**.

---

## 7. Liên kết repo

| File | Mục đích |
|------|----------|
| [../CHANGELOG.md](../CHANGELOG.md) | Lịch sử (inspector API, Security, …) |
| [../QUICK-REFERENCE.md](../QUICK-REFERENCE.md) | API, role, routes |
| [../../README.md](../../README.md) | Chạy monorepo / BE + FE |
| [../FRONTEND-API-FLOWS.md](../FRONTEND-API-FLOWS.md) | Luồng API FE chi tiết |
| `scripts/export-defectlist-xlsx.mjs` | Nguồn 7 dòng defect |

[↑ Về mục lục](#mục-lục)
