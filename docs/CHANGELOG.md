# Changelog – Tóm tắt thay đổi ShopBike Frontend

Tài liệu ghi nhận các thay đổi chính so với phiên bản trước (sau Sprint 1 + Sprint 2).

---

## [2026-03-26] Spring BE2 — GET inspector listing + FE chi tiết tin chờ duyệt

| Thay đổi | Chi tiết |
|----------|----------|
| **`InspectorController.java`** | **Mới:** `GET /api/inspector/listings/{id}` — trả `ListingDTO` theo id (mọi `ListingState`), phục vụ trang **`/bikes/:id`** khi Inspector/Admin mở **Xem chi tiết** tin **PENDING_INSPECTION**. Trước đây endpoint không tồn tại → FE gọi lỗi → màn “Không tìm thấy tin đăng”. |
| **`SecurityConfig.java`** | `/api/inspector/**` dùng **`hasAnyRole("INSPECTOR", "ADMIN")`** thay vì chỉ `INSPECTOR`, để Admin mở cùng API inspector (khớp FE và `RequireInspector`). |
| **`ProductDetailPage.tsx`** | Sau `fetchListingById` (public) nếu vẫn không có dữ liệu và còn **`accessToken`**, gọi thêm **`fetchListingByIdForInspector`** — tránh race khi `role` chưa hydrate từ persist; vẫn tải được tin chờ duyệt. |
| **`docs/QUICK-REFERENCE.md`** | Bảng Inspector: thêm dòng **GET `/inspector/listings/:id`**; ghi chú Spring. |
| **`docs/BE-FE-API-AUDIT-BY-PAGE.md`** | Mục Inspector: thêm **`ProductDetailPage`** — luồng GET marketplace + fallback inspector. |
| **`docs/FRONTEND-API-FLOWS.md`** | §5.9 / §7: bổ sung **`fetchListingByIdForInspector`** cho Product detail khi staff. |

---

## [2026-03-25] SWT301 — Test case & Lab 4 Defect Management

| Thay đổi | Chi tiết |
|----------|----------|
| **docs/testing/SWT301_TestCase.md** | ~33 test case theo **USER-REQUIREMENTS** (UR-*), bảng TC ID / Req / steps / expected; nhóm Auth, Marketplace, Order/VNPay, Inspector, Admin, Review, upload ảnh; mục **thực thi kiểm thử thủ công** (repo chưa có automated test). |
| **docs/testing/SWT301_DefectManagement_Lab4.md** | Mô tả **DMS**: quy trình log bug, bảng field (Severity, Priority, Status, trace TC/Req), ví dụ defect; **export DefectList.xlsx** (Excel, Jira/Azure, CSV). |
| **docs/testing/DefectList_Template.csv** | Template hàng tiêu đề → mở Excel → Save As **DefectList.xlsx**. |
| **docs/testing/README.md** | Mục lục thư mục testing. |
| **docs/README.md** | Link nhóm SWT301 / testing. |

---

## [2026-03-25] FRONTEND-API-FLOWS — luồng xử lý API chi tiết

| Thay đổi | Chi tiết |
|----------|----------|
| **docs/FRONTEND-API-FLOWS.md** | Mở rộng: **mục lục**; **§5** từng tính năng (auth, marketplace, checkout+VNPay **sequence Mermaid**, Transaction polling/resume/cancel, Finalize pay-balance/complete, **PurchaseSuccess**+review, **VnpayResult** query-only, seller upload); **§6** bảng trạng thái đơn → API/UI; **§7** bảng trang→file→service; đánh số lại §8. |
| **docs/README.md** | Mô tả FRONTEND-API-FLOWS cập nhật. |

---

## [2026-03-25] Docs: FRONTEND-API-FLOWS + đồng bộ QUICK-REFERENCE / STRUCTURE / README

| Thay đổi | Chi tiết |
|----------|----------|
| **docs/FRONTEND-API-FLOWS.md** | **Mới:** kiến trúc tầng FE (apiConfig → apiClient → apis → services), mock env, chuẩn JSON/multipart/401, luồng auth / marketplace / VNPay / seller upload / inspector-admin, bảng màn hình → service. |
| **docs/README.md**, **README.md** (root) | Link tới FRONTEND-API-FLOWS; mục lục docs. |
| **docs/QUICK-REFERENCE.md** | Sửa body **vnpay-checkout**; thêm **upload-images**, **PUBLIC_ORIGIN** / **CORS_EXTRA_ORIGINS**; §6–§7; footer ngày cập nhật. |
| **docs/STRUCTURE.md** | Ghi chú `apiErrors`, apis/services + link FRONTEND-API-FLOWS; **mục “Luồng API Order”** (bảng file/path buyer–seller–admin–review), `orderOverrides`, `listingSnapshotFromOrder`, `types/order.ts`. |
| **docs/BACKEND-GUIDE.md** | Dòng link FE API flows. |
| **docs/BE-FE-API-AUDIT-BY-PAGE.md** | Link FRONTEND-API-FLOWS; dòng **uploadListingImages** cho SellerListingEditorPage. |
| **docs/PROJECT-SUMMARY.md** | Link FRONTEND-API-FLOWS ở phần tra cứu. |
| **docs/PRODUCTION-HARDENING.md** | Link FRONTEND-API-FLOWS trong cheatsheet debug API. |

---

## [2026-03-25] BACKEND-NODE-TO-SPRING-BOOT — upload ảnh & contract checkout

| Thay đổi | Chi tiết |
|----------|----------|
| **docs/BACKEND-NODE-TO-SPRING-BOOT.md** | Bổ sung **`POST /api/seller/listings/upload-images`**, static **`/uploads/listings/*`**, env **`PUBLIC_ORIGIN`** / `CORS_EXTRA_ORIGINS`; **§9.9** file tĩnh; **§11.6** hợp đồng multipart; **§7** ánh xạ multer/static; chỉnh **§11.3** + bảng buyer **`vnpay-checkout`** khớp Node (`listingId` string, `acceptedUnverifiedDisclaimer`, không gửi `fulfillmentType`); checklist §16, curl §18, bảng lệch §22; kịch bản seller §17. |

---

## [2026-03-15] BACKEND-NODE-TO-SPRING-BOOT — bản chi tiết (chuyển giao BE)

| Thay đổi | Chi tiết |
|----------|----------|
| **docs/BACKEND-NODE-TO-SPRING-BOOT.md** | Viết lại thành tài liệu dài: mục lục, lộ trình onboard, monorepo, env/secrets, mapping thư mục Node↔Spring, **danh mục endpoint đầy đủ** theo `backend/src/routes`, class Spring tương ứng, JSON contract, enum, business rules, VNPay, CORS, checklist, kịch bản test, curl, **bảng lệch Security (ADMIN/INSPECTOR vs Node)**. |

---

## [2026-03-15] Tài liệu monorepo BE2 + Git hygiene

| Thay đổi | Chi tiết |
|----------|----------|
| **README.md (root)** | Ghi rõ monorepo: `src/` vừa FE (Vite) vừa Spring (`src/main/java`, `src/main/resources`); entry Spring đúng tên `BikeTradingBackendApplication.java`. |
| **docs/README.md, STRUCTURE.md, PROJECT-SUMMARY.md** | Bổ sung / làm rõ cấu trúc nhánh BE2, tránh nhầm lẫn khi sửa `src/`. |
| **docs/BACKEND-NODE-TO-SPRING-BOOT.md** | Tiêu đề + **§0 Bối cảnh BE2 (monorepo)** — hướng dẫn chuyển giao công nghệ thực tế (Spring đã trong repo, Node ở `backend/` đối chiếu); checklist bước 1 điều chỉnh cho BE2. |
| **README.md, docs/README.md** | Dòng “Chuyển giao công nghệ” trỏ rõ vào BACKEND-NODE-TO-SPRING-BOOT. |
| **.gitignore** | Đã có `.cursor/` — thư mục Cursor local không đưa lên Git. |
| **Lịch sử Git (repo)** | Rewrite message: xóa dòng `Co-authored-by: Cursor <cursoragent@cursor.com>` trên các commit liên quan để GitHub Contributors không tính user `cursoragent`. Đã force-push toàn bộ nhánh trên remote — máy clone cũ cần `git fetch` + `git reset --hard origin/<nhánh>`. |

---

## [2026-03] Rà soát API BE–FE theo actor/page, xóa dead code, cập nhật docs

### BE–FE API Audit

| Thay đổi | Chi tiết |
|----------|----------|
| **docs/BE-FE-API-AUDIT.md** | Báo cáo rà soát theo khu vực: Auth, Bikes, Buyer, Seller, Inspector, Admin. Sửa Inspector method: POST → PUT. |
| **docs/BE-FE-API-AUDIT-BY-PAGE.md** | **Mới.** Báo cáo theo từng trang/actor: mapping Page → API gọi → FE path → BE route → Method. |
| **Kết quả** | Guest, Buyer, Seller, Inspector, Admin — khớp. Không có bug runtime nghiêm trọng. |

### Code cleanup (dead code)

| File | Thay đổi |
|------|----------|
| `src/lib/apiConfig.ts` | Xóa `PAYMENTS_CONFIRM`, `TRANSACTIONS`, `BUYER.PROFILE` khỏi `API_PATHS.BUYER`. |
| `src/apis/buyerApi.ts` | Xóa `paymentApi.confirm`, `transactionApi.getStatus`, `buyerProfileApi`, type `BuyerProfile`. |
| `src/shared/constants/index.ts` | Xóa `BUYER.PROFILE` khỏi `API_ENDPOINTS`. |

**Lưu ý:** `BUYER.PROFILE` (`/buyer/profile`) — BE không có route; BuyerProfilePage dùng `authApi.getProfile()` (GET `/auth/me`).

### Docs cập nhật

| File | Thay đổi |
|------|----------|
| `docs/README.md` | Thêm BE-FE-API-AUDIT-BY-PAGE.md vào Bắt đầu nhanh và Mục lục. |
| `docs/QUICK-REFERENCE.md` | Thêm BE-FE-API-AUDIT-BY-PAGE.md vào mục Kiểm tra khớp API. |
| `README.md` | Thay đổi gần đây: bổ sung audit theo page, dead code BUYER.PROFILE. |
| `docs/CHANGELOG.md` | Entry này. |

### Khuyến nghị từ audit

- Test E2E luồng chính: Login → Checkout VNPAY → Resume/Pay balance → Seller ship → Inspector approve/reject → Admin confirm warehouse.
- IPN VNPAY: Đảm bảo return/IPN callback cập nhật đúng status đơn hàng.

---

## [2026-03] Dọn file tài liệu trùng / không cần thiết

| Thay đổi | Chi tiết |
|----------|----------|
| **Xóa** | `ReBike_BusinessRules_Template.backup.xlsx` — file backup, trùng với template chính |
| **.gitignore** | Thêm `*.backup.xlsx`, `*.backup.*` — tránh commit file backup |

---

## [2026-03] Dọn câu từ UI — bỏ sandbox, dev note, backend (phù hợp demo)

| Thay đổi | Chi tiết |
|----------|----------|
| **VNPAY** | Đổi "VNPAY Sandbox", "Demo VNPAY Sandbox" → "VNPAY", "Thanh toán VNPAY". Lỗi thanh toán: bỏ tham chiếu HashSecret, backend/.env; dùng thông báo tổng quát. |
| **Chat & Hỗ trợ** | "Chat sẽ có khi tích hợp Backend" → "Liên hệ qua email để được hỗ trợ". |
| **Gói seller** | "Giả lập thanh toán" → "Kích hoạt gói ngay (bỏ qua cổng thanh toán)". packageDemoPayBody bỏ từ "giả lập". |
| **Lỗi API** | inspectorService, sellerService: "Backend không phản hồi" → "Hệ thống không phản hồi. Vui lòng thử lại." |
| **Backend** | packageController: note "Sandbox: redirect + IPN" → "Thanh toán qua cổng VNPAY." |
| **devNote, ordersApiNote** | Xóa nội dung; ratingsApiNote rút gọn. |

---

## [2026-03] Fix địa chỉ, hủy WAREHOUSE, pay balance VNPay, Success & Review

| Thay đổi | Chi tiết |
|----------|----------|
| **Địa chỉ giao hàng** | TransactionPage dùng `order.shippingAddress` (đã nhập checkout), bỏ hardcode. |
| **Hủy đơn WAREHOUSE** | Backend cho phép hủy cả DIRECT và WAREHOUSE khi RESERVED, SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN, RE_INSPECTION, RE_INSPECTION_DONE, SHIPPING. Frontend hiển thị nút hủy cho cả hai luồng. |
| **Thanh toán số dư VNPay** | Finalize: nút "Thanh toán nốt X qua VNPay" khi `balancePaid === false`; API `POST /orders/:id/vnpay-pay-balance`; Return về Finalize `?vnpay_balance=1`; Order có `balancePaid`. |
| **Success page 404** | Ưu tiên fetch order khi có `state.orderId` → dùng `order.listing` snapshot (tin SOLD không còn trong GET /bikes). Finalize navigate truyền `orderId` trong state. |
| **Form đánh giá** | `getOrderById` trả `sellerId` (từ Listing), bổ sung `listing.seller`; createOrder lưu seller trong snapshot. Sửa "Thiếu thông tin đơn hàng để đánh giá". |
| **Docs** | Cập nhật BUSINESS-RULES, BACKEND-NODE-TO-SPRING-BOOT, PROJECT-SUMMARY, BACKEND-GUIDE, PAYMENTS-VNPAY, CHANGELOG. |

---

## [2026-03] Dọn MD thừa — xóa ERD.md, VNPAY-SANDBOX-HOC-TAP

| Thay đổi | Chi tiết |
|----------|----------|
| **Xóa ERD.md** | Nội dung trùng ERD-MYSQL.md; cập nhật mọi ref → ERD-MYSQL. |
| **Xóa VNPAY-SANDBOX-HOC-TAP.md** | Gộp nội dung học tập (Return vs IPN, biến .env, thẻ test) vào PAYMENTS-VNPAY.md. |
| **Sửa ref VIETQR-MODULE** | File không tồn tại; trỏ về PROJECT-SUMMARY §2.7, business-rules. |

---

## [2026-03] Thiết kế MySQL 17 bảng + ERD

| Thay đổi | Chi tiết |
|----------|----------|
| **docs/ERD-MYSQL.md** | Mới: thiết kế database MySQL 17 bảng (user, brand, category, listing, listing_media, inspection_report, order, order_snapshot, shipment, order_payment, review, subscription_plan, package_order, user_payment_method, wishlist, notification, vnpay_transaction_log). |
| **docs/sql/shopbike_mysql_schema.sql** | Mới: CREATE TABLE đầy đủ, InnoDB, utf8mb4. |
| **Sơ đồ ERD Mermaid** | Trong ERD-MYSQL.md — quan hệ 17 bảng. |
| **docs/ERD.md** | Thêm link tới ERD-MYSQL.md. |
| **docs/README, PROJECT-SUMMARY, BACKEND-GUIDE, BACKEND-NODE-TO-SPRING-BOOT** | Tham chiếu MySQL 17 bảng. |

---

## [2026-03] Business Rules đầy đủ

| Thay đổi | Chi tiết |
|----------|----------|
| **docs/business-rules/BUSINESS-RULES.md** | Mới: toàn bộ business rules có cấu trúc (BR-ORD-*, BR-PAY-VNP-*, BR-FIN-*, BR-TIME-*, …). |
| **docs/business-rules/README.md** | Cập nhật: link BUSINESS-RULES.md, danh sách Rule ID, script append. |
| **scripts/append-business-rules.mjs** | Mới: append rule mới vào Excel (tránh trùng Rule ID). |
| **PROJECT-SUMMARY, USER-REQUIREMENTS, docs/README** | Tham chiếu tới BUSINESS-RULES.md. |

---

## [2026-03] Luồng kho/DIRECT, thanh toán VNPAY, Finalize, docs

| Thay đổi | Chi tiết |
|----------|----------|
| **Hai luồng giao hàng** | WAREHOUSE: xe certified tại kho → AT_WAREHOUSE_PENDING_ADMIN → admin confirm → SHIPPING (24h countdown). DIRECT: seller giao → SHIPPING. |
| **Thanh toán chỉ VNPAY** | Bỏ CASH/COD. Checkout: DEPOSIT 8% hoặc FULL. Return URL cập nhật depositPaid khi IPN không gọi được. |
| **Hủy đơn** | Chỉ DIRECT được hủy. WAREHOUSE không hủy. |
| **Finalize** | Ưu tiên lấy listing từ order khi có orderId (fix "Không tải được tin đăng"). Bỏ form địa chỉ. |
| **Countdown** | Khi SHIPPING hiển thị đếm ngược 24h. Refetch định kỳ khi chờ seller/kho xác nhận. |
| **Docs** | Cập nhật BACKEND-NODE-TO-SPRING-BOOT, backend/README, BACKEND-GUIDE, PROJECT-SUMMARY, STATE_TRANSITION, CHANGELOG. |

---

## [2026-03] Nhánh follow thầy Lâm — docs Spring Boot + đồng bộ MD

| Thay đổi | Chi tiết |
|----------|----------|
| **docs/BACKEND-NODE-TO-SPRING-BOOT.md** | Mới: ánh xạ Express → Spring Boot, JWT, bảng endpoint, rules `WAREHOUSE` / `DIRECT`, thứ tự port. |
| **docs/README.md**, **README.md** | Thêm link tới tài liệu Spring Boot. |
| **PROJECT-SUMMARY.md** | Bổ sung đơn hàng kho vs giao trực tiếp + thông báo seller (file flow). |
| **backend/README.md** | Cập nhật endpoint (warehouse, ship-to-buyer, packages, reviews). |
| **STRUCTURE.md** | Ghi chú `sellerOrderNotificationFlow.ts`. |
| **Codebase** | Gói đăng tin, `fulfillmentType`, thông báo seller tách luồng, hardening — commit cùng nhánh. |

---

## [2026-03] Production hardening (theo Bài 09 kat-minh/react)

| Thay đổi | Chi tiết |
|----------|----------|
| **Error Boundary** | `src/app/ErrorBoundary.tsx` bọc `App`; dev log stack, production message gọn. |
| **Route fallback** | `RouteFallback` + `Suspense` thay `Loading...` text thuần. |
| **API errors** | `src/lib/apiErrors.ts` — `getApiErrorMessage`; dùng thử ở `SellerPackagePage`. |
| **ESLint** | Ignore `backend/**`, `tailwind.config.js`, `postcss.config.js` để `npm run lint` sạch cho FE. |
| **Docs** | `docs/PRODUCTION-HARDENING.md`, README mở rộng Setup / Structure / link Bài 09. |

---

## [2026-03] Gọn docs – xóa file hướng dẫn FE/BE, gộp ERD

| Thay đổi | Chi tiết |
|----------|----------|
| **Xóa file hướng dẫn FE/BE** | `RUN-FULL-PROJECT`, `BACKEND_SPRING_BOOT_GUIDE`, `AI-INSTRUCTIONS`, `backend/DEMO-BACKEND-GUIDE`, `backend/SPRING-BOOT-SKELETON`. |
| **Gộp ERD** | `ERD-SPEC.md` + `ERD-MYSQL.md` → `docs/ERD.md` (MongoDB entities + SQL Starter & Normalized). |
| **Cập nhật link** | `docs/README.md`, `README.md`, `PROJECT-SUMMARY.md`, `backend/README.md`, `STATE_TRANSITION_DIAGRAM_GUIDE.md` – bỏ tham chiếu tới file đã xóa. |

---

## [2026-03] Gọn docs – gộp, xóa file thừa, sửa link

### Docs

| Thay đổi | Chi tiết |
|----------|----------|
| **Xóa file thừa** | `HUONG-DAN-DEMO`, `FLOW-HE-THONG`, `HUONG_DAN_VE_STATE_DIAGRAM`, `MERMAID_STANDARD` – nội dung đã gộp vào các file còn lại. |
| **RUN-FULL-PROJECT** | Gộp demo step-by-step (tài khoản, luồng Buyer/Inspector/Seller, troubleshooting); sửa link `BACKEND_SPRING_BOOT_GUIDE`. |
| **PROJECT-SUMMARY** | Thêm mục 6. Flow làm việc (runtime); cập nhật mục 7. Các tài liệu liên quan. |
| **STATE_TRANSITION_DIAGRAM_GUIDE** | Gộp hướng dẫn vẽ từng bước + sơ đồ Mermaid gộp 1 (Order+Listing+Review). |
| **docs/README.md** | Mục lục mới, bỏ link file đã xóa. |
| **AI-INSTRUCTIONS, backend/** | Sửa link `FLOW-HE-THONG` → PROJECT-SUMMARY, `HUONG-DAN-BACKEND` → BACKEND_SPRING_BOOT_GUIDE. |

---

## [2026-03] Đồng bộ docs, fix role/403, ratings seller thật, CRUD brands

### Frontend

| Thay đổi | Chi tiết |
|----------|----------|
| **Auth / 403** | Sửa luồng đổi role và logout để xóa token cũ; tránh giữ phiên sai gây 403 lặp lại. |
| **ForbiddenPage** | Điều chỉnh điều hướng để quay lại luồng đúng sau khi sai role. |
| **Checkout** | Đồng bộ logic deposit với backend: **8%** giá trị đơn; bỏ ghi chú dev cũ; hoàn thiện bản dịch cho Checkout, Finalize Purchase, Purchase Success và một phần Admin warehouse. |
| **Seller Dashboard** | Card `Ratings & reputation` dùng dữ liệu thật từ backend thay vì luôn rơi vào trạng thái rỗng khi seller đã có review. |
| **Seller Listing Editor** | Dropdown brand không còn hardcode cố định; lấy từ API public `GET /brands`, có fallback khi API lỗi. |
| **Admin Dashboard** | Tab Categories/Brands có phần quản lý brand riêng: thêm, sửa, xóa brand; brand mới sẽ xuất hiện ở form seller. |

### Backend

| Thay đổi | Chi tiết |
|----------|----------|
| **Seller ratings API** | Thêm `GET /api/seller/ratings`, tổng hợp `averageRating`, `totalReviews`, `positivePercent`, `breakdown` từ reviews theo `sellerId`. |
| **Brands model & API** | Thêm model `Brand`; public route `GET /api/brands`; admin CRUD `GET/POST/PUT/DELETE /api/admin/brands`. |
| **Seed** | Seed thêm danh sách brand mặc định để seller form và admin dashboard có dữ liệu ngay khi chạy in-memory DB. |

### Docs

| File | Nội dung |
|------|----------|
| **docs/AI-INSTRUCTIONS.md** | Mới. Hướng dẫn cho người mới hoặc AI khác khi làm việc với codebase này trong Cursor. |
| **docs/PROJECT-SUMMARY.md** | Bổ sung deposit 8%, ratings seller thật, CRUD brands, fix role/403 và AI instructions. |
| **docs/FLOW-HE-THONG.md** | Cập nhật flow buyer review seller, ratings seller, admin quản lý brands, auth/403. |
| **docs/README.md** | Thêm link tới `AI-INSTRUCTIONS.md`. |
| **README.md** | Bổ sung tham chiếu tới docs dùng AI trong dự án. |

---

## [2025-03] i18n toàn app, thông báo lỗi đa ngôn ngữ, Seller Orders/Ratings, Admin Categories/Transactions

### i18n (Internationalization)

| Thay đổi | Chi tiết |
|----------|----------|
| **react-i18next** | Thêm i18n cho toàn bộ UI – Tiếng Việt / English. |
| **locales** | `src/locales/vi.json`, `src/locales/en.json` – namespace: common, auth, home, profile, wishlist, notifications, support, forbidden, header, footer, listing, admin, inspector, checkout, transaction, order, seller. |
| **Trang đã i18n** | Logo, ListingCard, ProductDetailPage, HomePage, BuyerProfilePage, AdminDashboardPage, InspectorDashboardPage, CheckoutPage, TransactionPage, MainLayout, NotificationsPage, SellerDashboardPage, SellerListingEditorPage, SupportPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, FinalizePurchasePage, PurchaseSuccessPage, SellerProfilePage, ForbiddenPage. |
| **Thông báo lỗi** | Tất cả thông báo lỗi validate và API trên mọi trang dùng `t()` – Register, ForgotPassword, ResetPassword, FinalizePurchase, PurchaseSuccess, Checkout, SellerProfile, HomePage. |
| **validateExpiry** | Trả về `errorKey` thay vì `message`; component gọi `t(errorKey)` để hiển thị bản dịch. |

### Seller Dashboard

| Thay đổi | Chi tiết |
|----------|----------|
| **Orders / Deposits** | Gọi `fetchSellerDashboardOrders()` – API + mock fallback. |
| **Ratings & reputation** | Gọi `fetchSellerRatings()` – `sellerApi.getRatings()`, `GET /seller/ratings`; fallback mock. |

### Admin Dashboard

| Thay đổi | Chi tiết |
|----------|----------|
| **Tab Categories** | CRUD danh mục (mock); cấu hình phí. |
| **Tab Transactions** | Cấu hình phí, bảng lịch sử giao dịch. |

### Khác

| Thay đổi | Chi tiết |
|----------|----------|
| **Price input (Seller Listing Editor)** | Chỉ cho nhập số (`replace(/[^\d]/g, "")`), `inputMode="numeric"`. |
| **Xóa ghi chú dev** | Bỏ "Chỉ PUBLISHED + APPROVE", "Will integrate API when Backend...", "Ratings from successful transactions...". |
| **useNotificationStore** | Hỗ trợ `titleKey`, `messageKey`, `messageParams` cho thông báo i18n; `syncSellerOrderNotifications(t)` dùng `t()` tạo nội dung. |

---

## [2025-03] Flow hệ thống, cập nhật docs, logic thông báo, ngôn ngữ & theme

### Docs

| File | Nội dung |
|------|----------|
| **docs/FLOW-HE-THONG.md** | **Mới.** Giải thích flow làm việc toàn bộ hệ thống: khởi động app, auth, phân quyền route, Header (ngôn ngữ, theme, thông báo), luồng Buyer/Seller/Inspector/Admin, stores, API. |
| **README.md** | Thêm mục "Tài liệu flow hệ thống" với link FLOW-HE-THONG.md. |
| **docs/README.md** | Thêm FLOW-HE-THONG.md vào mục lục. |
| **docs/STRUCTURE.md** | ThemeProvider, useLanguageStore; ghi chú router không có /cart. |
| **docs/PROJECT-SUMMARY.md** | Thêm 4.9 Giao diện toàn cục (dark/light, ngôn ngữ, Header giỏ hàng→wishlist, thông báo); bổ sung useLanguageStore, FLOW-HE-THONG vào tài liệu liên quan. |

### Frontend

| Thay đổi | Chi tiết |
|----------|----------|
| **Thông báo** | Chỉ tin đã đọc mới được xóa (clearReadForRole, removeItem); nút "Đánh dấu đã đọc" thay bằng "Hiển thị thông báo chưa đọc" / "Hiển thị tất cả". |
| **Header** | Icon tim thay bằng icon giỏ hàng (link /wishlist); bỏ nút giỏ hàng riêng; thêm icon Globe bên trái "Hỗ trợ" – dropdown chọn Tiếng Việt/English (useLanguageStore). |
| **Router** | Bỏ route `/cart`. |
| **useNotificationStore** | Thêm clearReadForRole, removeItem; bỏ clearForRole. |

---

## [2025-02] Chuyển giao Node → Spring Boot (nhánh ui-ux+shipping)

### Thay đổi docs

| File | Nội dung |
|------|----------|
| **docs/CHUYEN-GIAO-NODE-SANG-SPRING-BOOT.md** | Tài liệu chuyển giao công nghệ đầy đủ: tổng quan, models, API endpoints, Auth/JWT, luồng Order & Shipping, Admin hide/unhide, checklist Spring Boot. Dành cho BE Java và AI. |
| **docs/HUONG-DAN-BACKEND.md** | Cập nhật Login: không gửi role, role lấy từ tài khoản; user ẩn trả 401 "Account is hidden" |
| **docs/README.md** | Thêm tham chiếu CHUYEN-GIAO-NODE-SANG-SPRING-BOOT |

---

## [2025-02] Cập nhật UI, Admin, Notifications, VND, Wishlist

### Frontend

| Thay đổi | Chi tiết |
|----------|----------|
| **Hero (HomePage)** | Slogan mới: "Những chiếc xe đã được kiểm định, sẵn sàng lên đường" / "Cùng ShopBike bắt đầu hành trình tiếp theo của bạn"; "ShopBike" và "bạn" màu primary; nút "Khám phá ngay" |
| **LoginPage** | Bỏ chọn role; layout 2 cột (hero trái, form phải); nền hero slider; text branding "Để ShopBike đồng hành cùng Bạn bắt đầu chuyến đi mới"; "Bạn" viết hoa, màu primary |
| **Wishlist** | ProductDetailPage: nút wishlist chỉ hiện khi role BUYER (đã đăng nhập) |
| **TransactionPage** | Countdown chỉ chạy khi status SHIPPING; text "Bước tiếp theo" rõ hơn |
| **ProductDetailPage** | Format tiền VND; dùng `inspectionReport` từ API |
| **AdminDashboardPage** | Nút "Hiện" (unhide) cho user/listing đã ẩn |
| **SellerDashboardPage, NotificationsPage** | Gọi sync thông báo khi mount; nút "Kiểm tra đơn mới" |
| **Header** | Polling thông báo 10s; gọi sync ngay khi mount |
| **sellerService** | `syncSellerOrderNotifications` |
| **adminService, adminApi** | Unhide user/listing |
| **constants/hero.ts** | HERO_SLIDES, HERO_AUTO_SLIDE_MS |
| **useNotificationStore** | Store thông báo seller |

### Backend

| Thay đổi | Chi tiết |
|----------|----------|
| **Listing** | Thêm `inspectionReport`; mặc định `currency: "VND"` |
| **inspectorController** | Lưu `inspectionReport` khi approve |
| **adminController** | `unhideUser`, `unhideListing`; `markReInspectionDone` set `expiresAt` |
| **buyerController** | `completeOrder` chỉ chấp nhận status SHIPPING; bỏ role khỏi login |
| **authController** | Bỏ role khỏi login payload (role từ tài khoản) |
| **seed.js** | Đổi `currency` và giá sang VND |

### Docs

| File | Nội dung |
|------|----------|
| **docs/ERD-SPEC.md** | Đặc tả ERD – entities, quan hệ (User, Listing, Order, Review) |
| **docs/KIEM-KE-HE-THONG.md** | Báo cáo kiểm kê hệ thống – cấu trúc, models, routes, logic |

---

## [2025-02] Wishlist yêu cầu đăng nhập BUYER

### Thay đổi

- **ProductDetailPage**: Nút wishlist (trái tim) chỉ hiển thị khi user đã đăng nhập với role BUYER. Khi chưa đăng nhập hoặc role khác, nút không hiện – tránh thêm wishlist khi chưa đăng nhập.
- **ListingCard**: Đã có sẵn `canWishlist = showWishlist && role === "BUYER"` – nhất quán với ProductDetailPage.

---

## [Gần đây] Gộp toàn bộ docs vào một folder `docs/`

### Thay đổi

- **Một folder docs duy nhất**: Toàn bộ tài liệu nằm trong `docs/`.
- **Backend docs chuyển vào `docs/backend/`**: Các file trước đây trong `backend/docs/` (STRUCTURE, DEMO-BACKEND-GUIDE, PORTING-NODE-TO-SPRING-BOOT, SPRING-BOOT-SKELETON) đã được chuyển vào `docs/backend/`. Các tham chiếu trong nội dung đã được cập nhật (`backend/docs/...` → `docs/backend/...`).
- **Mục lục**: Thêm `docs/README.md` làm mục lục toàn bộ tài liệu (docs chung + docs/backend).
- **Cập nhật tham chiếu**: README.md (root), PROJECT-SUMMARY.md, RUN-FULL-PROJECT.md, backend/README.md đã được cập nhật để trỏ đúng tới `docs/` và `docs/backend/`.

Sau khi gộp, có thể xóa thư mục `backend/docs/` cũ (nội dung đã nằm trong `docs/backend/`).

---

## [2025-03] Tái cấu trúc + dọn dẹp docs

### Thay đổi code

- Tái cấu trúc theo `main-course-project-clone`: `app/`, `features/`, `shared/`
- Router: `createBrowserRouter` thay `BrowserRouter`
- Guards: `GuestRoute`, `ProtectedRoute`, `RequireAuth`, `RequireBuyer`, `RequireSeller`, `RequireInspector` trong `shared/components/common`

### Thay đổi docs

#### Xóa

| File / thư mục | Lý do |
|----------------|-------|
| `API-CONTRACT.md` | Trùng HUONG-DAN-BACKEND |
| `API-INTEGRATION.md` | Lỗi thời |
| `BACKEND-API-CON-THIEU.md` | Task list cũ |
| `docs/sheets/` | Requirements CSV – không dùng trong dev |

#### Cập nhật

| File | Nội dung |
|------|----------|
| `PROJECT-SUMMARY.md` | Cấu trúc mới, danh sách docs |
| `CHANGELOG.md` | Entry này |

#### Mới

| File | Nội dung |
|------|----------|
| `docs/STRUCTURE.md` | Cấu trúc feature-based |

---

## [Sprint 3 – 2025-02] Chuẩn bị hội đồng

### Thay đổi code (FE)

#### 1. Inspector Dashboard (SHOP-41)

| Thay đổi | Chi tiết |
|----------|----------|
| **InspectorDashboardPage** | Trang mới: danh sách tin chờ kiểm định, nút Duyệt / Từ chối / Cần cập nhật |
| **inspectorApi.ts** | Scaffold: `getPendingListings`, `approve`, `reject`, `needUpdate` |
| **RequireInspector.tsx** | Guard bảo vệ route `/inspector` (role INSPECTOR, ADMIN) |
| **Route /inspector** | Thêm route với `RequireInspector` |
| **ProfilePage** | Khi role = Inspector/Admin → hiển thị `InspectorDashboardPage` thay placeholder |
| **Header** | Nút "Inspector" khi role INSPECTOR hoặc ADMIN |

#### 2. Seller API & Service

| Thay đổi | Chi tiết |
|----------|----------|
| **sellerApi.ts** | Scaffold: `getDashboard`, `getListings`, `getListingById`, `create`, `update`, `submitForInspection` |
| **sellerService.ts** | Facade: `fetchSellerDashboard`, `createListing`, `updateListing`, `submitForInspection`, `fetchListingById` – fallback mock khi API lỗi |
| **SellerDashboardPage** | Dùng `fetchSellerDashboard()` thay `SELLER_MOCK` cố định |
| **SellerListingEditorPage** | Save draft / Submit for inspection gọi `sellerService`; load listing khi edit mode |

#### 3. Auth & RBAC

| Thay đổi | Chi tiết |
|----------|----------|
| **LoginPage** | `resolvePostLoginPath`: cho phép ADMIN vào `/inspector` |
| **AppRouter** | Thêm route `/inspector` với `RequireInspector` |

---

### Thay đổi tài liệu (docs/)

#### 4. Xóa file trùng / không cần thiết

| File đã xóa | Lý do |
|-------------|-------|
| `PROJECT-SUMMARY-VI.md` | Trùng nội dung với `PROJECT-SUMMARY.md` (bản tiếng Việt đầy đủ) |
| `BACKEND-CHECKLIST-SPRINT2.md` | Trùng với `BACKEND-API-CON-THIEU.md` |
| `CON-THIEU-SAU-2-SPRINT.md` | Nội dung đã có trong `SPRINT3-HOI-DONG.md`, `BACKEND-API-CON-THIEU.md` |

#### 5. Cập nhật file hiện có

| File | Nội dung cập nhật |
|------|-------------------|
| **PROJECT-SUMMARY.md** | Luồng Inspector, roles, Inspector pages, API/Services (sellerApi, inspectorApi, sellerService), RequireInspector, cấu trúc thư mục, checklist demo, tham chiếu CHANGELOG |
| **SPRINT3-HOI-DONG.md** | Trạng thái luồng demo (FE đã có Inspector Dashboard, Seller scaffold), tóm tắt Frontend Sprint 3 |
| **FLOWS-AND-PROGRESS.md** | Flow Inspector (Flow D), roles Inspector/Admin, SHOP-41, Sprint 3 FE, cấu trúc api (sellerApi, inspectorApi), checklist demo |
| **API-INTEGRATION.md** | Thêm Seller API, Inspector API; cập nhật bảng cấu trúc |
| **BACKEND-API-CON-THIEU.md** | Xóa tham chiếu `BACKEND-CHECKLIST-SPRINT2.md` |

---

### Tổng kết

| Hạng mục | Số lượng |
|----------|----------|
| File code mới | 5 (`inspectorApi.ts`, `sellerApi.ts`, `sellerService.ts`, `InspectorDashboardPage.tsx`, `RequireInspector.tsx`) |
| File code sửa | 6 (`ProfilePage`, `SellerDashboardPage`, `SellerListingEditorPage`, `AppRouter`, `Header`, `LoginPage`) |
| File docs xóa | 3 |
| File docs cập nhật | 5 |
| File docs mới | 1 (`CHANGELOG.md`) |

---

## [2025-02] Forgot Password, Support, Wishlist, Filters, UI Polish

### Thay đổi code

#### 1. Forgot Password

| Thay đổi | Chi tiết |
|----------|----------|
| **authApi.ts** | `forgotPassword(email)`, `resetPassword({ token, newPassword })` |
| **ForgotPasswordPage** | Form nhập email, gửi yêu cầu reset (mock + API) |
| **ResetPasswordPage** | Form đặt mật khẩu mới với token từ URL |
| **LoginPage** | Link "Quên mật khẩu?" → `/forgot-password` |
| **Routes** | `/forgot-password`, `/reset-password` (GuestGuard) |

#### 2. Support Page

| Thay đổi | Chi tiết |
|----------|----------|
| **SupportPage** | Trang FAQ + liên hệ (email support) |
| **Route** | `/support` – sửa 404 từ link Header/Login |
| **HomePage** | Card Support trong Hero → Link tới `/support` |

#### 3. Wishlist (Master Concept – Buyer)

| Thay đổi | Chi tiết |
|----------|----------|
| **useWishlistStore** | Lưu ID xe yêu thích (persist localStorage) |
| **WishlistPage** | Danh sách xe đã lưu, xóa khỏi wishlist |
| **ProductDetailPage** | Nút trái tim thêm/xóa wishlist |
| **Header** | Link "Wishlist" khi role = BUYER |
| **Route** | `/wishlist` |

#### 4. HomePage – Bộ lọc nâng cao

| Thay đổi | Chi tiết |
|----------|----------|
| **Filters** | Thêm: tình trạng (Condition), kích thước khung (Frame size), khoảng giá (Min/Max $) |
| **Filter logic** | Lọc theo keyword, brand, condition, frameSize, priceMin, priceMax |

#### 5. ProductDetailPage – Chat với seller

| Thay đổi | Chi tiết |
|----------|----------|
| **Chat** | Nút "Chat với người bán" / "Nhắn tin" → Dialog placeholder (email support) |

#### 6. Seller Dashboard – Orders & Ratings

| Thay đổi | Chi tiết |
|----------|----------|
| **Đơn đặt mua / đặt cọc** | Card mock: danh sách đơn, buyer, deposit, status |
| **Đánh giá & uy tín** | Card mock: 4.8★, 12 đánh giá, phân bố sao |

#### 7. UI Polish

| File | Thay đổi |
|------|----------|
| BuyerProfilePage, CheckoutPage, PurchaseSuccessPage, FinalizePurchasePage | Bỏ "Sprint 1" placeholder, cập nhật message |
| SellerListingEditorPage, InspectorDashboardPage | Bỏ text "Sprint 1/3" |
| TransactionPage | Cập nhật Support chat (link email) |
| SellerDashboardPage | Fallback ảnh `thumbnailUrl ?? imageUrls[0]` |
| API-INTEGRATION.md | Thêm forgot-password, reset-password |

### Tổng kết phiên bản này

| Hạng mục | Số lượng |
|----------|----------|
| File mới | 6 (`ForgotPasswordPage`, `ResetPasswordPage`, `SupportPage`, `WishlistPage`, `useWishlistStore`) |
| File sửa | 15+ |

---

---

## [2025-02] Hướng dẫn FE2 Join Git

### Thay đổi tài liệu

| File | Nội dung |
|------|----------|
| **HUONG-DAN-FE2-JOIN-GIT.md** | Hướng dẫn FE2: clone repo, cấu hình Git, branch, cài đặt & chạy, quy trình commit/push, cấu trúc code, tài liệu tham khảo |
| **PROJECT-SUMMARY.md** | Thêm tham chiếu `HUONG-DAN-FE2-JOIN-GIT.md` |

---

## [2026-03] Dọn file tài liệu trùng / không cần thiết

| Thay đổi | Chi tiết |
|----------|----------|
| **Xóa** | `ReBike_BusinessRules_Template.backup.xlsx` — file backup, trùng với template chính |
| **.gitignore** | Thêm `*.backup.xlsx`, `*.backup.*` — tránh commit file backup |

*Cập nhật lần cuối: 2026-03 – rà soát API, xóa dead code, dọn file backup*
