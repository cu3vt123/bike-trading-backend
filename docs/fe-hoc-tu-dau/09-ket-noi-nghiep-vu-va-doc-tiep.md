# 09 — Nối kiến thức với nghiệp vụ và đọc tiếp gì

Đến đây bạn đã có “bản đồ” từ **trình duyệt** → **React** → **cấu trúc repo** → **route** → **API** → **cache state**. Phần cuối này nối với **ShopBike thật**: đơn hàng, thanh toán, và tài liệu tra cứu.

---

## 1. Trục nghiệp vụ quan trọng (FE cần biết)

| Luồng | Gợi ý nơi đọc code |
|-------|---------------------|
| Xem xe, chi tiết listing | `features/bikes/`, `apis/bikeApi.ts`, hooks listings |
| Giỏ / checkout | `features/buyer/`, `CheckoutPage`, buyer APIs |
| Theo dõi đơn, trạng thái kho | `TransactionPage`, `types/order.ts`, `lib/workflow.ts` |
| Seller xử lý đơn | `features/seller/`, seller services |
| Admin / inspector | `AdminDashboardPage`, `InspectorDashboardPage`, admin APIs |
| Thanh toán VNPay | [PAYMENTS-VNPAY.md](../PAYMENTS-VNPAY.md), `FinalizePurchasePage`, buyer checkout |

Trạng thái đơn (`OrderStatus`, `fulfillmentType`, …) là **hợp đồng** giữa FE và BE — khi BE thêm trạng thái, FE thường phải cập nhật **type + i18n + nhãn bước** trên UI.

---

## 2. Đọc sâu theo vai trò

### Bạn sẽ chỉnh UI / bug nhỏ

1. [QUICK-REFERENCE.md](../QUICK-REFERENCE.md) — route, env, status.
2. [STRUCTURE.md](../STRUCTURE.md) — tìm đúng file.
3. DevTools Network — so sánh request với bảng quick reference.

### Bạn sẽ nối API mới

1. [FRONTEND-API-FLOWS.md](../FRONTEND-API-FLOWS.md)
2. [FRONTEND-DEVELOPER-GUIDE.md](../FRONTEND-DEVELOPER-GUIDE.md) — checklist, error handling.
3. Cập nhật `apiConfig.ts`, `apis/`, `types/`, rồi hook query.

### Bạn sẽ chỉnh cache / đồng bộ dữ liệu

1. [FE-ARCHITECTURE-V1-VS-V2.md](../FE-ARCHITECTURE-V1-VS-V2.md)
2. Mở `queryKeys.ts` và hook mutation liên quan — đảm bảo `invalidateQueries` đúng.

### Bạn cần hiểu nghiệp vụ end-to-end

1. [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md)
2. [business-rules/BUSINESS-RULES.md](../business-rules/BUSINESS-RULES.md)

---

## 3. Backend và hợp đồng API

Repo FE **front-only** không chứa Java. Khi cần Swagger / schema / CORS:

- [BACKEND-BESPRING-CHAY-API.md](../BACKEND-BESPRING-CHAY-API.md)

---

## 4. Chất lượng trước khi tạo PR

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. Test tay các luồng bạn đụng (login, listing, checkout nếu có).

Chi tiết: [PRODUCTION-HARDENING.md](../PRODUCTION-HARDENING.md).

---

## 5. Quay lại đầu bộ học

Mục lục: [README.md](./README.md).

---

*Chúc bạn đọc code có đường — khi kẹt, hãy mở một route trong `router.tsx` rồi trace ngược về hook và `apis/`.*
