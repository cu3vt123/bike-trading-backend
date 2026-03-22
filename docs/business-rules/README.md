# Business Rules (sheet Excel)

File gốc: **`ReBike_BusinessRules_Template.xlsx`** (ở thư mục repo, sheet đầu **Business Rules**).

## Cập nhật tự động (VietQR + VNPay + thông báo i18n)

Đã có script append các rule mới (tránh ghi đè nếu đã tồn tại `BR-PAY-VQR-*`):

```bash
npm install   # đã có devDependency xlsx
node scripts/append-vietqr-business-rules.mjs
```

## Nội dung đã thêm (Rule ID)

| ID | Chủ đề ngắn |
|----|-------------|
| BR-PAY-VQR-01 … 13 | Module VietQR: mã đơn/CK, env, trạng thái, TTL, chống trùng QR, logs, simulate admin, RBAC, tách SQLite |
| BR-PAY-VNP-02 | Chỉ VNPay cho QR gói/checkout (đã bỏ Postpay) |
| BR-NOTIF-I18N-01 | Thông báo dùng `titleKey`/`messageKey` + legacy map |

Chi tiết kỹ thuật: [VIETQR-MODULE.md](../VIETQR-MODULE.md), [PAYMENTS-VNPAY.md](../PAYMENTS-VNPAY.md), [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md) §2.7–2.9.

## Import thủ công (CSV)

Nếu cần bản CSV để paste vào Google Sheet: tạo từ cùng nội dung script hoặc export lại từ Excel sau khi chạy script.
