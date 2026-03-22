# Hướng dẫn VNPAY Sandbox (học tập) — dễ hiểu cho người mới

Dự án đã tích hợp **Node.js + Express** (backend sẵn có trong `backend/`). Chọn Express vì:

- Một ngôn ngữ (JavaScript) giống frontend, dễ đọc.
- Chạy nhanh, ít file cấu hình, phù hợp đồ án / học phần thanh toán.

---

## Luồng hoạt động (5 bước)

1. **Frontend** (`http://localhost:5173/payment/vnpay-demo`): người dùng nhập số tiền → bấm **Thanh toán VNPAY**.
2. **Frontend** gọi `POST http://localhost:8081/payment/create` (chỉ gửi `amount` — **không** gửi bí mật).
3. **Backend** tạo đơn giả lập (`PENDING_PAYMENT`), sinh `vnp_TxnRef` duy nhất, nhân tiền × 100, **ký HMAC SHA512** bằng `VNP_HASHSECRET` (trong `.env`), trả về `paymentUrl`.
4. **Trình duyệt** chuyển sang `paymentUrl` → người dùng thanh toán trên **cổng VNPAY Sandbox**.
5. Sau khi xong:
   - **Return URL** (`GET /payment/vnpay-return`): VNPAY **redirect trình duyệt** của user về đây → backend **kiểm tra chữ ký** → redirect tiếp sang `http://localhost:5173/payment/vnpay-result?...` để **hiển thị kết quả**.
   - **IPN URL** (`GET /payment/vnpay-ipn`): VNPAY **gọi từ server của họ** tới URL public của bạn → backend **kiểm tra chữ ký**, **khớp số tiền**, cập nhật đơn → **`PAID`** hoặc **`FAILED`** → trả JSON cho VNPAY.

---

## Vì sao IPN phải ở backend, không đặt ở frontend?

| Return URL | IPN URL |
|------------|---------|
| Mở trong **trình duyệt** của user (có thể tắt tab, mất mạng). | VNPAY **server gọi server** tới backend bạn. |
| Thích hợp **hiển thị** “thanh toán xong / thất bại”. | Thích hợp **chốt đơn**, cập nhật DB, **tin cậy** cho nghiệp vụ. |
| User có thể sửa query trên URL. | VNPAY gửi trực tiếp; bạn **verify chữ ký** bằng secret chỉ có trên server. |

**Hash secret không bao giờ đưa lên React** — nếu đặt IPN ở frontend, secret lộ hết, ai cũng giả mạo “đã thanh toán”.

### Gói seller (`PackageOrder`) dùng chung Return / IPN

Khi `VNP_TMNCODE`, `VNP_HASHSECRET`, `VNP_RETURNURL` đã cấu hình (hoặc tên cũ `VNP_TMN_CODE` / `VNP_HASH_SECRET`):

- `POST /api/seller/subscription/checkout` tạo bản ghi Mongo **`PackageOrder`** (`PENDING`) và trả **`paymentUrl`** sandbox thật với **`vnp_TxnRef` = `_id` đơn** (24 ký tự hex).
- **`GET /payment/vnpay-return`**: nếu `vnp_TxnRef` khớp đơn gói → redirect về **`/seller/packages?vnpay=1&ok=...`** (không qua trang `vnpay-result` demo).
- **`GET /payment/vnpay-ipn`**: verify chữ ký + khớp tiền với `PackageOrder.amountVnd` → **`COMPLETED`** + `activateSubscription`; thất bại → **`FAILED`**. Luồng **`POST /payment/create`** (đơn RAM `DEMO…`) vẫn hoạt động song song.

Nếu thiếu cấu hình VNP_*, checkout gói vẫn trả URL demo cùng origin + **`mock-complete`** như trước.

---

## File đã tạo mới

| File | Vai trò |
|------|---------|
| `backend/src/vnpay/vnpayOrderStore.js` | Lưu đơn giả lập trong RAM (`PENDING_PAYMENT` / `PAID` / `FAILED`). |
| `backend/src/config/vnpayDemoConfig.js` | Đọc biến môi trường VNP_* (không hardcode secret). |
| `backend/src/controllers/vnpayDemoPaymentController.js` | Logic create / return / IPN. |
| `backend/src/routes/vnpayDemoPaymentRoutes.js` | Route `/payment/...`. |
| `src/pages/VnpayDemoPage.tsx` | Trang nút thanh toán. |
| `src/pages/VnpayResultPage.tsx` | Trang kết quả sau return. |
| `docs/VNPAY-SANDBOX-HOC-TAP.md` | Tài liệu này. |

## File đã sửa

| File | Thay đổi |
|------|----------|
| `backend/src/controllers/packageController.js` | Checkout gói: URL VNPAY sandbox khi đủ `VNP_*`; `TxnRef` = id `PackageOrder`. |
| `backend/src/controllers/vnpayDemoPaymentController.js` | Return / IPN nhận diện đơn gói + kích hoạt subscription. |
| `src/pages/SellerPackagePage.tsx` | `paymentKind` — không rewrite URL sang origin khi là sandbox VNPAY; xử lý `?vnpay=1`. |
| `backend/src/utils/vnpaySandbox.js` | Thêm `verifyVnpaySecureHash`, `payUrl` / `vnp_IpnUrl` tùy chọn. |
| `backend/src/server.js` | Gắn `app.use("/payment", ...)`, CORS nhiều origin. |
| `backend/.env.example` | Thêm biến `VNP_*`. |
| `.env.example` (root) | Thêm `VITE_PAYMENT_API_ORIGIN`. |
| `src/app/router.tsx` | Route `payment/vnpay-demo`, `payment/vnpay-result`. |
| `src/locales/vi.json`, `en.json` | Chuỗi giao diện demo. |

---

## Những chỗ bạn cần thay (copy vào `backend/.env`)

**Không commit** file `.env` có giá trị thật lên Git.

```env
# TMN + HashSecret lấy tại cổng sandbox VNPAY (tài khoản merchant demo của bạn)
VNP_TMNCODE=THAY_BANG_TMN_CUA_BAN
VNP_HASHSECRET=THAY_BANG_HASH_SECRET_CUA_BAN

VNP_PAYURL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Khi chạy local: Return có thể dùng ngrok trỏ vào cổng BACKEND (vd 8081)
VNP_RETURNURL=https://YOUR_SUBDOMAIN.ngrok-free.dev/payment/vnpay-return
VNP_IPNURL=https://YOUR_SUBDOMAIN.ngrok-free.dev/payment/vnpay-ipn

# Frontend để redirect sau return (trang kết quả SPA)
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend** (`/.env` hoặc copy từ `.env.example`):

```env
VITE_PAYMENT_API_ORIGIN=http://localhost:8081
```

Nếu sau này bạn public backend bằng ngrok, đổi thành `https://YOUR_SUBDOMAIN.ngrok-free.dev` (vẫn **không** có `/api`).

### Ánh xạ tên tham số VNPAY ↔ biến `.env` (dự án)

| VNPAY gửi trong thư / tài liệu | Biến trong `backend/.env` |
|--------------------------------|---------------------------|
| `vnp_TmnCode` (Terminal ID / Mã Website) | `VNP_TMNCODE` |
| `vnp_HashSecret` (Secret Key) | `VNP_HASHSECRET` |
| `vnp_Url` (URL cổng thanh toán TEST) | `VNP_PAYURL` |
| Return URL (trình duyệt quay lại) | `VNP_RETURNURL` → trỏ tới `.../payment/vnpay-return` trên **backend** |
| IPN URL (server VNPAY → server bạn) | `VNP_IPNURL` → trỏ tới `.../payment/vnpay-ipn` trên **backend** |

**TMN + HashSecret** chỉ đặt trong `backend/.env`, **không** commit. Nếu đã lộ secret (chat, screenshot, Git), nên xin/đổi lại trên cổng merchant sandbox.

### Sandbox báo "Sai chữ ký" / `Error.html?code=70`

- **Chữ ký phải tính trên chuỗi query đã URL-encode** (giống `URLSearchParams.toString()`), vì `vnp_ReturnUrl` chứa `://`, `/`, `:`… Nếu ký trên chuỗi thô `http://...`, VNPAY sẽ không khớp → lỗi 70. Code trong `backend/src/utils/vnpaySandbox.js` đã làm đúng hướng này.
- **Sai cặp TMN + HashSecret** (copy nhầm, thừa khoảng trắng, BOM, dấu ngoặc trong `.env`) cũng ra lỗi tương tự — kiểm tra lại trên cổng merchant sandbox.

### Có thể không chuyển sang trang VNPAY, giữ UI trong app được không?

- Luồng **Pay chuẩn** của VNPAY là **redirect** trình duyệt sang domain họ (`sandbox.vnpayment.vn` / `pay.vnpay.vn`) để nhập thẻ — đáp ứng PCI, trình duyệt và chính VNPAY thường **chặn nhúng iframe** (`X-Frame-Options` / CSP), nên **iframe trang thanh toán trong SPA hầu như không khả thi**.
- **Không** tự vẽ form nhập thẻ trong UI của bạn rồi gửi thẻ qua server bạn — vi phạm PCI và không được VNPAY hỗ trợ theo kiểu đó.
- Nếu VNPAY có sản phẩm/SDK **embedded** cho từng loại hợp đồng (hiếm với sandbox học tập), phải lấy đúng tài liệu từ họ; còn tích hợp demo Pay phổ biến thì **chỉ nên redirect** (có thể mở tab mới `window.open(paymentUrl)` nếu muốn “ít rời app” hơn, nhưng vẫn là trang VNPAY).

---

## Liên kết chính thức (Sandbox)

- **Tích hợp thanh toán Pay:** [sandbox.vnpayment.vn — Pay](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html)
- **Code demo tích hợp (VNPAY):** [vnpay-demo / code demo](https://sandbox.vnpayment.vn/apis/vnpay-demo/code-demo-tích-hợp)
- **Merchant Admin (quản lý giao dịch TEST):** [sandbox.vnpayment.vn/merchantv2](https://sandbox.vnpayment.vn/merchantv2/) — đăng nhập bằng tài khoản đã đăng ký merchant TEST.
- **Công cụ kiểm thử IPN (SIT):** [vnpaygw-sit-testing](https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login) — dùng để kiểm tra kịch bản IPN theo hướng dẫn VNPAY.

Merchant cần **cung cấp cho VNPAY** URL **IPN** public (HTTPS) trùng với giá trị bạn đưa vào `VNP_IPNURL` và đã triển khai tại backend.

---

## Thẻ thử nghiệm (Sandbox — VNPAY công bố)

Dùng trên cổng sandbox, **không** dùng cho tiền thật.

| Trường | Giá trị mẫu |
|--------|-------------|
| Ngân hàng | NCB |
| Số thẻ | `9704198526191432198` |
| Tên chủ thẻ | NGUYEN VAN A |
| Ngày phát hành | 07/15 |
| Mật khẩu OTP | `123456` |

*(Nếu VNPAY đổi bộ thẻ test, lấy bản mới nhất trong email / tài liệu họ gửi.)*

---

## Cách chạy (copy-paste)

### 1) Backend

```bash
cd backend
cp .env.example .env
# Sửa .env: điền VNP_TMNCODE, VNP_HASHSECRET, VNP_PAYURL, VNP_RETURNURL, VNP_IPNURL
npm install
node src/server.js
# hoặc: npm run dev  (nếu có script trong package.json)
```

Mặc định API: **http://localhost:8081**  
Health: http://localhost:8081/api/health  
Payment create: `POST http://localhost:8081/payment/create`

### 2) Frontend

```bash
# từ thư mục gốc frontend (có package.json Vite)
cp .env.example .env
npm install
npm run dev
```

Mở: **http://localhost:5173/payment/vnpay-demo**

### 3) Ngrok (bắt buộc để VNPAY gọi Return + IPN từ internet)

VNPAY cần URL **HTTPS public** trỏ vào **backend** (nơi có `/payment/vnpay-return` và `/payment/vnpay-ipn`):

```bash
ngrok http 8081
```

Copy URL dạng `https://xxxx.ngrok-free.dev` → gán vào `VNP_RETURNURL` và `VNP_IPNURL` trong `backend/.env` → **restart backend**.

Trên **merchant sandbox VNPAY**, nếu có chỗ cấu hình IPN/Return, nhập đúng hai URL trên.

---

## Cách test luồng thanh toán (checklist)

### Chuẩn bị

1. **Backend** chạy (vd. `http://localhost:8081`), **frontend** chạy (vd. `http://localhost:5173`).
2. Trong `backend/.env`: `VNP_TMNCODE`, `VNP_HASHSECRET`, `VNP_PAYURL` (sandbox), `VNP_RETURNURL` trỏ tới **`…/payment/vnpay-return`** trên **backend** (vd. `http://localhost:8081/payment/vnpay-return` khi chỉ test Return trên máy; hoặc URL **ngrok** nếu VNPAY yêu cầu HTTPS).
3. Root `.env`: `VITE_PAYMENT_API_ORIGIN=http://localhost:8081` (hoặc URL API thật).
4. Đăng nhập **buyer** nếu test mua xe bằng VNPAY (checkout).

### Kịch bản A — Demo nhanh (`/payment/vnpay-demo`)

1. Mở `http://localhost:5173/payment/vnpay-demo`.
2. Nhập số tiền (VND) → **Thanh toán VNPAY** → trình duyệt sang sandbox VNPAY.
3. Dùng **thẻ test NCB** (bảng trên).
4. Sau khi xác nhận, VNPAY redirect về backend **`/payment/vnpay-return`** → backend redirect tiếp tới **`/payment/vnpay-result`** trên frontend.
5. **Thành công:** tiêu đề kiểu *“Thanh toán đã được ghi nhận”*, có thể mở *“Xem chi tiết kỹ thuật”* nếu cần mã phản hồi.
6. **Thất bại / hủy:** thông báo thân thiện + gợi ý; lỗi **checksum** = kiểm tra lại cặp TMN + HashSecret và **restart backend** sau khi sửa `.env`.

### Kịch bản B — Mua xe (checkout VNPAY)

1. Chọn xe → checkout → **VNPAY** → thanh toán trên cổng.
2. Khi thành công (`vnp_ResponseCode=00`), thường có nút **Tiếp tục theo dõi đơn hàng** tới `/transaction/...?orderId=...`.
3. Trạng thái **PAID** / đơn cập nhật có thể đến sau vài giây nhờ **IPN** — cần `VNP_IPNURL` **public** (ngrok) nếu test IPN từ internet.

### Quét mã QR thì sao?

Trong ShopBike, **QR thanh toán gói (seller)** / demo là **cùng một URL cổng VNPAY** (sandbox `vpcpay.html` đã ký) được **vẽ thành mã QR**. Khi **quét bằng điện thoại**:

1. Điện thoại mở **trình duyệt hoặc app** tới đúng URL đó → bạn thanh toán **trên điện thoại** (thẻ test, v.v.) giống khi bấm link trên máy tính.
2. Sau khi xong, VNPAY **redirect trình duyệt trên điện thoại** về **`VNP_RETURNURL`** (backend) → rồi về trang kết quả frontend — thường bạn **xem kết quả trên điện thoại**, không tự quay lại tab máy tính.
3. **IPN** (nếu đã cấu hình URL public + `VNP_IPNURL`) vẫn do **VNPAY gọi backend** như bình thường; không phụ thuộc máy tính hay điện thoại.
4. Đây **không** phải QR VietQR chuyển khoản tĩnh; vẫn là luồng **VNPAY Pay (redirect / web)**.

### Ghi chú

- Trang **`/payment/vnpay-result`** là kết quả bước **Return (trình duyệt)**; không nhầm với IPN (server-to-server).
- Nếu luôn gặp **checksum** trên Return: xác nhận HashSecret không có dấu cách/BOM, đúng sandbox, và code verify dùng **chuỗi query đã encode** (đồng bộ với cách tạo URL thanh toán).

---

## API tham chiếu

### `POST /payment/create`

Body JSON:

```json
{ "amount": 100000 }
```

Response thành công:

```json
{
  "ok": true,
  "orderCode": "DEMO...",
  "txnRef": "DEMO...",
  "amountVnd": 100000,
  "status": "PENDING_PAYMENT",
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
}
```

### `GET /payment/vnpay-return`

Query do VNPAY gắn vào. Backend verify chữ ký → redirect `CLIENT_ORIGIN/payment/vnpay-result?...`.

### `GET /payment/vnpay-ipn`

Query giống return. Response JSON ví dụ:

- Thành công cập nhật: `{"RspCode":"00","Message":"Confirm Success"}`
- Không thấy đơn: `{"RspCode":"01","Message":"Order not Found"}`
- Sai số tiền: `RspCode":"04",...`
- Sai chữ ký: `RspCode":"97",...`

---

## Gợi ý khi lỗi

1. **503 từ `/payment/create`**: thiếu `VNP_TMNCODE` / `VNP_HASHSECRET` / `VNP_RETURNURL` (hoặc bộ tên cũ tương đương).
2. **CORS**: chỉ các origin trong `CLIENT_ORIGIN` và `CORS_EXTRA_ORIGINS` được gọi API có cookie. Demo `fetch` không cần cookie; nếu lỗi CORS, thêm origin vào `CORS_EXTRA_ORIGINS` trong `backend/.env`.
3. **Ngrok warning page**: bản free có thể chặn bot; IPN là server-to-server thường ổn. Nếu IPN không tới, xem log VNPAY / thử bản trả phí hoặc cấu hình header.
4. **Số tiền**: luôn so sánh `vnp_Amount` (đã ×100) với `amountVnd * 100` trên server.

---

## Tương thích tên biến môi trường

- `backend/src/config/vnpayDemoConfig.js` ưu tiên **`VNP_TMNCODE`**, **`VNP_HASHSECRET`**, **`VNP_PAYURL`**, **`VNP_RETURNURL`**, **`VNP_IPNURL`**; vẫn đọc được tên cũ (`VNP_TMN_CODE`, `VNP_HASH_SECRET`, `VNP_PAY_URL`, …) nếu bạn chưa đổi `.env`.
- **COD:** `POST /api/buyer/payments/initiate` chỉ còn **`CASH`**.
- **VNPAY redirect (đặt xe):** `POST /api/buyer/orders/vnpay-checkout` (JWT) trả `paymentUrl`.

Chúc bạn học VNPAY mượt — lớp lưu đơn demo RAM vẫn là `vnpayOrderStore.js`; đơn buyer/gói seller dùng MongoDB, **giữ nguyên verify chữ ký và IPN**.
