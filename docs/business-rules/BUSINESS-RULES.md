# Business Rules — ShopBike

> Tài liệu đầy đủ các quy tắc nghiệp vụ (business rules) áp dụng cho hệ thống ShopBike. Đồng bộ với codebase và docs hiện tại (2026-03).

**Tham chiếu:** [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md) §2, [BACKEND-NODE-TO-SPRING-BOOT.md](../BACKEND-NODE-TO-SPRING-BOOT.md) §5, [PAYMENTS-VNPAY.md](../PAYMENTS-VNPAY.md).

---

## 1. Listing & Kiểm định

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-LIST-01 | Publish không bắt buộc kiểm định | Có thể publish **không qua kiểm định** (`requestInspection: false` → UNVERIFIED); hoặc gửi inspector (`true` → PENDING_INSPECTION). |
| BR-LIST-02 | Phân luồng theo trạng thái kiểm định | Listing **đã kiểm định** (CERTIFIED/APPROVE) → luồng **WAREHOUSE**; **chưa kiểm định** (UNVERIFIED) → luồng **DIRECT**. |
| BR-LIST-03 | Vòng kiểm định | APPROVE → Publish; REJECT → End; NEED_UPDATE → Seller cập nhật → Resubmit → Inspect. |
| BR-LIST-04 | Chỉnh sửa tin | Draft: sửa được; Pending Inspection: khóa; Need Update: sửa được; Published: hạn chế sửa nội dung cốt lõi. |
| BR-LIST-05 | Marketplace hiển thị | Listing **PUBLISHED** (CERTIFIED hoặc UNVERIFIED có badge & disclaimer khi checkout). |

---

## 2. Đơn hàng — Luồng kho (WAREHOUSE) vs Giao trực tiếp (DIRECT)

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-ORD-01 | `fulfillmentType` trên Order | **WAREHOUSE**: xe đã kiểm định (CERTIFIED). **DIRECT**: xe chưa kiểm định (UNVERIFIED). |
| BR-ORD-02 | Luồng WAREHOUSE | Xe tại kho (`warehouseIntakeVerifiedAt`) → `AT_WAREHOUSE_PENDING_ADMIN` → admin xác nhận giao → `SHIPPING` trực tiếp (set `expiresAt` = now + 24h). Legacy: SELLER_SHIPPED → RE_INSPECTION → re-inspection-done → SHIPPING. |
| BR-ORD-03 | Luồng DIRECT | Sau thanh toán → `PENDING_SELLER_SHIP` → seller xác nhận đã giao trực tiếp → `SHIPPING` (set `expiresAt`). Không qua kho. |
| BR-ORD-04 | Hủy đơn (buyer) | **Chỉ khi DIRECT.** WAREHOUSE không cho hủy. |
| BR-ORD-05 | Admin confirm-warehouse | Chỉ đơn `fulfillmentType === WAREHOUSE`. Nếu DIRECT → trả 400. |
| BR-ORD-06 | Admin yêu cầu thanh toán | `confirm-warehouse` cho AT_WAREHOUSE_PENDING_ADMIN: yêu cầu `depositPaid` hoặc `vnpayPaymentStatus === "PAID"`. |
| BR-ORD-07 | Query đơn chờ xác nhận kho | Chỉ đơn có `fulfillmentType === WAREHOUSE` (WAREHOUSE_ONLY_FILTER). |
| BR-ORD-08 | Seller GET /orders | Hai nhánh: kho (SELLER_SHIPPED, AT_WAREHOUSE_PENDING_ADMIN, không DIRECT); direct (PENDING_SELLER_SHIP + DIRECT). |
| BR-ORD-09 | FIFO listing | Available → Reserved (lock sau deposit thành công) → Sold. Cancel/Fail → Available ngay. |
| BR-ORD-10 | Reserve & deposit | Reserve chỉ tạo khi deposit payment thành công (24h countdown). |

---

## 3. Thanh toán — Chỉ VNPAY

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-PAY-VNP-01 | Chỉ VNPAY cho buyer checkout | Bỏ CASH/COD. Checkout dùng `POST /api/buyer/orders/vnpay-checkout` với plan DEPOSIT (8%) hoặc FULL. |
| BR-PAY-VNP-02 | Chỉ VNPAY cho gói seller | Gói đăng tin, initiate payment dùng **VNPay** (VNPAY_QR, provider: VNPAY). Bỏ Postpay. |
| BR-PAY-VNP-03 | Deposit 8% | Deposit = 8% giá trị đơn hàng (đồng bộ FE và BE). |
| BR-PAY-VNP-04 | Cập nhật sau thanh toán | IPN hoặc Return URL cập nhật `depositPaid`, `vnpayPaymentStatus = PAID`. Return URL cũng cập nhật khi IPN không gọi được (vd. localhost). |
| BR-PAY-VNP-05 | Finalize thanh toán số dư | Buyer hoàn tất thanh toán phần còn lại (khi chọn DEPOSIT) trước khi Complete. |

---

## 4. Finalize & GET /bikes/:id

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-FIN-01 | Lấy tin từ order | Finalize page: **ưu tiên** lấy listing từ `order.listing` (snapshot) khi có `orderId`. Không phụ thuộc `GET /bikes/:id` cho tin đã RESERVED. |
| BR-FIN-02 | Bỏ form địa chỉ | Finalize **không** hiển thị form nhập địa chỉ — buyer đã nhập ở checkout. |
| BR-FIN-03 | GET /bikes/:id | Chỉ trả listing **PUBLISHED**. Khi order RESERVED, listing → RESERVED nên API có thể 404 — Finalize không cần gọi API này cho tin đã mua. |

---

## 5. Countdown & Thời gian

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-TIME-01 | Countdown 24h khi SHIPPING | Khi status = SHIPPING, hiển thị đếm ngược 24h (từ `expiresAt`) để buyer hoàn tất nhận hàng. |
| BR-TIME-02 | Refetch khi chờ giao | Khi chờ seller/kho xác nhận giao, refetch đơn mỗi 5s. |
| BR-TIME-03 | expiresAt | Được set khi AT_WAREHOUSE_PENDING_ADMIN → SHIPPING (admin confirm); hoặc PENDING_SELLER_SHIP → SHIPPING (seller ship-to-buyer). |

---

## 6. Refund & Hủy (chính sách chung)

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-REF-01 | Hoàn tiền đơn giản | Không có dispute trong app. |
| BR-REF-02 | Thời hạn refund | Tối đa 7 ngày. |
| BR-REF-03 | Giới hạn hủy | Tối đa 3 lần / kỳ. |
| BR-REF-04 | Cancel dialog | Hiển thị: refund 7 ngày, giới hạn 3 lần/kỳ. |

---

## 7. Payment Methods (Seller Profile)

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-SELL-01 | Bắt buộc ≥1 phương thức | Seller phải giữ ít nhất 1 phương thức thanh toán. |
| BR-SELL-02 | Xóa DEFAULT | Khi xóa phương thức DEFAULT, phương thức đầu tiên còn lại sẽ là DEFAULT. |
| BR-SELL-03 | Set as default | Seller có thể đặt phương thức khác làm DEFAULT. |

---

## 8. Auth & RBAC

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-AUTH-01 | Register | Chỉ cho Buyer / Seller. |
| BR-AUTH-02 | Login | Không chọn role — role lấy từ tài khoản. |
| BR-AUTH-03 | Sai role | Chuyển về `/403` Forbidden. |
| BR-AUTH-04 | Guards | Buyer không vào seller routes; Seller không vào buyer checkout/:id; v.v. |
| BR-AUTH-05 | Đổi role / logout | Xóa token cũ để tránh lỗi 403 do giữ phiên sai. |

---

## 9. VietQR (module đồ án)

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-PAY-VQR-01 | Tách dữ liệu | Đơn/payment VietQR lưu **SQLite** (`data/vietqr.sqlite`), không thay thế Order MongoDB. |
| BR-PAY-VQR-02 | Mã đơn | `orderCode` = ORDyyyyMMddxxx, `paymentCode` = PAYyyyyMMddxxx (unique). |
| BR-PAY-VQR-03 | Nội dung CK | `TT_<orderCode>`, chuẩn hóa VietQR, giới hạn ≤25 ký tự cho addInfo. |
| BR-PAY-VQR-04 | Cấu hình | VIETQR_* chỉ trong .env — không hardcode trong source. |
| BR-PAY-VQR-05 | Trạng thái đơn | CREATED → AWAITING_PAYMENT → PAID / CANCELLED. |
| BR-PAY-VQR-06 | Trạng thái payment | PENDING | SUCCESS | FAILED | EXPIRED; tự EXPIRED khi quá expired_at. |
| BR-PAY-VQR-07 | Chống trùng QR | Không tạo QR mới nếu còn PENDING trong thời hạn. |
| BR-PAY-VQR-08 | Audit | Mọi lần gọi VietQR ghi `payment_logs`. |
| BR-PAY-VQR-09 | Demo admin | Admin simulate-success — production thay bằng webhook/IPN ngân hàng. |
| BR-PAY-VQR-10 | RBAC | Buyer chỉ thao tác đơn có buyer_ref trùng user; Admin xem toàn bộ. |

---

## 10. Thông báo (i18n)

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-NOTIF-I18N-01 | titleKey / messageKey | Thông báo lưu `titleKey`, `messageKey` (+ params) để đổi ngôn ngữ theo locale. Có map chuỗi legacy → key khi hiển thị. |
| BR-NOTIF-02 | Seller notification flow | Logic tách trong `sellerOrderNotificationFlow.ts`: nhóm *có thông báo* vs *im lặng* tùy trạng thái đơn (kho vs direct). |

---

## 11. Reviews, Ratings & Brands

| ID | Rule | Chi tiết |
|----|------|----------|
| BR-REV-01 | Review khi COMPLETED | Buyer chỉ review khi order ở trạng thái COMPLETED. |
| BR-REV-02 | Seller ratings | Lấy từ `GET /seller/ratings` (backend aggregate). |
| BR-REV-03 | Admin review | Xem/chỉnh qua GET/PUT /admin/reviews/:id. |
| BR-BRAND-01 | Brands | Admin CRUD brands; seller form lấy brand từ `GET /api/brands`. |

---

## 12. Ánh xạ Rule ID ↔ File Excel

File Excel: **`ReBike_BusinessRules_Template.xlsx`** (sheet **Business Rules**).

| Nhóm Rule ID | Nội dung |
|--------------|----------|
| BR-LIST-* | Listing & Kiểm định |
| BR-ORD-* | Đơn hàng (WAREHOUSE/DIRECT, hủy, query) |
| BR-PAY-VNP-* | Thanh toán VNPAY (buyer checkout, gói seller) |
| BR-FIN-* | Finalize (lấy tin từ order, bỏ form địa chỉ) |
| BR-TIME-* | Countdown, expiresAt |
| BR-REF-* | Refund & Hủy |
| BR-SELL-* | Payment methods seller |
| BR-AUTH-* | Auth & RBAC |
| BR-PAY-VQR-* | VietQR module |
| BR-NOTIF-* | Thông báo i18n |
| BR-REV-*, BR-BRAND-* | Review, Ratings, Brands |

Script append: `node scripts/append-business-rules.mjs` (xem [README.md](./README.md)).

---

*Cập nhật: 2026-03 — WAREHOUSE/DIRECT, VNPAY only, Finalize từ order, countdown 24h, hủy chỉ DIRECT.*
