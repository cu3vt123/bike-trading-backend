# Business Rules — Hướng dẫn

Tài liệu và công cụ cập nhật **Business Rules** cho dự án ShopBike.

**Đối tượng đọc:** dev/backend/BA cần **source of truth** cho quy tắc nghiệp vụ (đơn, listing, VNPay, finalize). **Frontend** khi sửa luồng mua/bán nên đối chiếu [BUSINESS-RULES.md](./BUSINESS-RULES.md) cùng với [FRONTEND-API-FLOWS.md](../FRONTEND-API-FLOWS.md). **Onboard tổng quát** (chạy app, cấu trúc code): xem [README.md](../../README.md) trước.

---

## 1. Tài liệu đầy đủ

| File | Nội dung |
|------|----------|
| **[BUSINESS-RULES.md](./BUSINESS-RULES.md)** | Toàn bộ business rules có cấu trúc, theo nhóm (Listing, Order, Payment, Finalize, VietQR, …). **Source of truth** cho quy tắc nghiệp vụ. |
| **[../PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md)** | §2 Business rules tóm tắt; luồng màn hình, API, flow runtime. |
| **[../BACKEND-NODE-TO-SPRING-BOOT.md](../BACKEND-NODE-TO-SPRING-BOOT.md)** | §5 Business rules bắt buộc khi port Node → Spring Boot. |

---

## 2. File Excel (ReBike_BusinessRules_Template.xlsx)

File gốc: **`ReBike_BusinessRules_Template.xlsx`** (ở thư mục gốc repo, sheet đầu **Business Rules**).

Cột thường dùng: Rule ID, Chủ đề ngắn, Mô tả chi tiết, Nhóm, Ngày cập nhật.

---

## 3. Script append vào Excel

Để thêm các rule mới vào sheet Excel mà không ghi đè rule đã tồn tại:

```bash
npm install   # đã có devDependency xlsx
node scripts/append-business-rules.mjs
```

Script sẽ:
- Đọc file `ReBike_BusinessRules_Template.xlsx`
- Kiểm tra các Rule ID đã có trong sheet
- Append các dòng mới (BR-ORD-*, BR-PAY-VNP-*, BR-FIN-*, BR-TIME-*, …) nếu chưa tồn tại
- Ghi lại file Excel

---

## 4. Danh sách Rule ID đã định nghĩa

### Đơn hàng & Luồng giao (BR-ORD-*)
| ID | Chủ đề ngắn |
|----|-------------|
| BR-ORD-01 | fulfillmentType WAREHOUSE vs DIRECT |
| BR-ORD-02 | Luồng WAREHOUSE (xe tại kho → admin confirm → SHIPPING) |
| BR-ORD-03 | Luồng DIRECT (seller giao trực tiếp) |
| BR-ORD-04 | Hủy đơn chỉ khi DIRECT |
| BR-ORD-05 | confirm-warehouse chỉ WAREHOUSE |
| BR-ORD-06 | confirm-warehouse yêu cầu depositPaid/vnpayPaymentStatus |
| BR-ORD-07 | Query đơn chờ kho: WAREHOUSE_ONLY_FILTER |
| BR-ORD-08 | Seller GET /orders: hai nhánh kho/direct |
| BR-ORD-09 | FIFO listing: Available → Reserved → Sold |
| BR-ORD-10 | Reserve khi deposit thành công (24h countdown) |

### Thanh toán VNPAY (BR-PAY-VNP-*)
| ID | Chủ đề ngắn |
|----|-------------|
| BR-PAY-VNP-01 | Chỉ VNPAY cho buyer checkout (bỏ CASH/COD) |
| BR-PAY-VNP-02 | Chỉ VNPAY cho gói seller (bỏ Postpay) |
| BR-PAY-VNP-03 | Deposit 8% giá trị đơn |
| BR-PAY-VNP-04 | Return URL / IPN cập nhật depositPaid, vnpayPaymentStatus |
| BR-PAY-VNP-05 | Finalize thanh toán số dư khi chọn DEPOSIT |

### Finalize (BR-FIN-*)
| ID | Chủ đề ngắn |
|----|-------------|
| BR-FIN-01 | Lấy tin từ order.listing khi có orderId |
| BR-FIN-02 | Bỏ form địa chỉ ở Finalize |
| BR-FIN-03 | GET /bikes/:id chỉ PUBLISHED; RESERVED có thể 404 |

### VietQR & Notif (BR-PAY-VQR-*, BR-NOTIF-*)
| ID | Chủ đề ngắn |
|----|-------------|
| BR-PAY-VQR-01 … 10 | VietQR: mã đơn/CK, env, trạng thái, TTL, chống trùng QR, logs, RBAC |
| BR-NOTIF-I18N-01 | Thông báo dùng titleKey/messageKey + legacy map |

Chi tiết đầy đủ: [BUSINESS-RULES.md](./BUSINESS-RULES.md).

---

## 5. Import thủ công (CSV)

Nếu cần bản CSV để paste vào Google Sheet: export từ Excel sau khi chạy script, hoặc tạo CSV từ nội dung [BUSINESS-RULES.md](./BUSINESS-RULES.md).

---

*Cập nhật: 2026-03 — BUSINESS-RULES.md mới, script append-business-rules.mjs.*
