# Khớp API Spring ↔ FE ShopBike (`apiConfig.ts`)

**Chuẩn hợp đồng FE:** nhánh Git **`quydu12`** trên [bike-trading-backend](https://github.com/cu3vt123/bike-trading-backend/tree/quydu12) — `src/lib/apiConfig.ts`, các `src/apis/*.ts`, và audit trong `docs/`.

Tham chiếu: [BE-FE-API-AUDIT-BY-PAGE.md](https://github.com/cu3vt123/bike-trading-backend/blob/quydu12/docs/BE-FE-API-AUDIT-BY-PAGE.md).

## Hợp đồng chung

| Hạng mục | Spring `quydu_be` |
|----------|-------------------|
| Prefix API | `/api` + path trong `apiConfig` (vd. `/auth/login` → `POST /api/auth/login`) |
| Body thành công | `{ "data": ... }` hoặc `{ "content": [...] }` (marketplace bikes, seller listings, inspector pending) |
| JWT | `Authorization: Bearer <accessToken>`; refresh: `POST /api/auth/refresh` body `{ "refreshToken" }` |
| Role trong JSON | Enum → chuỗi `BUYER`, `SELLER`, … (khớp `Role` trên FE) |

## Bảng nhanh (theo `API_PATHS`)

| Nhóm | Trạng thái |
|------|------------|
| Auth: login, signup, refresh, me, forgot, reset | Có; signup/login trả `accessToken`, `refreshToken`, `role`, `subscription?` trong `data` |
| Bikes list / by id | Có |
| Packages, brands (public) | Có |
| Buyer: orders CRUD, vnpay-checkout, vnpay-resume, pay-balance, complete, cancel, review, payments/initiate | Có |
| Buyer: chi tiết giao dịch theo listing (sau VNPAY) `GET /api/buyer/transactions/{listingId}?orderId=` hoặc `GET /api/buyer/orders/by-listing/{listingId}` | Có — path là **listingId**; `orderId` query tùy chọn; **không** dùng `GET /api/buyer/orders/{listingId}` (đó là order id) |
| Seller: dashboard, orders, ship-to-buyer, ship-to-warehouse, listings, subscription, upload-images | Có |
| Inspector: pending, listing by id, approve/reject/need-update | Có |
| Admin: warehouse, re-inspection, stats, users, listings, reviews, brands, hide/unhide, revoke subscription | Có |
| Payment (VNPay): `/payment/create`, return, ipn | Có; **POST** `/payment/create` JSON `{"orderId": n}` — **GET trả 405**; base URL **không** có `/api` (dùng `http://localhost:8081`). Checkout buyer/seller trả `paymentUrl` ký sẵn (redirect VNPAY). |
| GET `/api/health` | Có |

## Ghi chú nghiệp vụ đã chỉnh

- **Cọc VNPAY:** 8% giá listing, làm tròn **số nguyên VND** (`RoundingMode.HALF_UP`, 0 chữ số thập phân), giống `Math.round` trên FE/Node. **FULL** = giá xe làm tròn VND.
- **Sau thanh toán cọc (RESERVED):** cả **DIRECT** và **WAREHOUSE** → **`PENDING_SELLER_SHIP`** (khớp luồng seller gửi hàng / gửi kho trên FE `quydu12`). Đơn `AT_WAREHOUSE_PENDING_ADMIN` còn dùng cho dữ liệu cũ hoặc bước “chờ admin kho” đặc biệt.
- **Order JSON:** `findByIdWithGraph` / `findByBuyerWithGraphOrderByCreatedAtDesc` để tránh lỗi Lazy khi trả listing + seller.

## Cấu hình local

Không dùng mật khẩu/secret **production** trong `application.properties` đã push Git — dùng `application-local.properties` + profile **`local`** (xem `application-local.properties.example`, có sandbox VNPAY TEST).

## Checkout VNPAY

- `POST /api/buyer/orders/vnpay-checkout`: `listingId` trong JSON có thể gửi **string** (`"5"`) hoặc number — không trả 400 chỉ vì kiểu chuỗi.
- Phản hồi `data` gồm `paymentUrl`, `txnRef`, `id`, `status`, `vnpayAmountVnd`, `vnpayPaymentStatus`, … (khớp unwrap FE).
