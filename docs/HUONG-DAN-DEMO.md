# ShopBike Demo Guide – Step by Step

This document describes how to run and demo the complete buyer purchase flow from start to finish.

---

## 1. Environment Setup

### Step 1.1: Install & start Backend (nếu dùng backend Node trong `backend/`)

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

- API: `http://localhost:8081/api` (hoặc port trong .env)
- Khi thấy log backend ready → Backend sẵn sàng

### Step 1.2: Cấu hình Frontend

Tạo/sửa `.env` ở root frontend (copy từ `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

### Step 1.3: Chạy Frontend

```bash
cd ..
npm run dev
```

- Access: `http://localhost:5173` (or the port Vite displays)

---

## 2. Demo accounts

| Role      | Email                | Password     |
| --------- | -------------------- | ------------ |
| Buyer     | `buyer@demo.com`     | `Password!1` |
| Seller    | `seller@demo.com`    | ` `          |
| Inspector | `inspector@demo.com` | `Password!1` |
| Admin     | `admin@demo.com`     | `Password!1` |

**Note:** Password has capital **P**, exclamation `!` and number `1`.

---

## 3. Demo Flow – Buy a bike (Buyer Flow)

### Step 3.1: Login

1. Open `/login`
2. Select role **Buyer**
3. Enter: `buyer@demo.com` / `Password!1`
4. Click **Log in**

---

### Step 3.2: View bike list (Home)

1. After login, you will see the home page
2. The **Listings** section shows inspected bikes:
   - **Specialized S-Works Tarmac SL7** (~$7,200)
   - **Trek Domane SL** (~$3,100)
3. You can try filters: Brand, Condition, Frame size, Price, Search

---

### Step 3.3: View product details

1. **Click on a bike card** (e.g. Trek Domane SL)
2. The detail page shows:
   - Gallery ảnh
   - Thông tin (brand, model, year, frame size, condition)
   - Inspection Report
   - Technical Specs
3. Tùy chọn:
   - **Thêm vào Wishlist** (trái tim)
   - **Chat với người bán** (demo)
   - **Buy now** → chuyển sang Checkout

---

### Step 3.4: Checkout – Create order

1. Click **Buy now** → go to `/checkout/:id`
2. **Select payment plan:**
   - **Deposit + COD** (popular): pay ~8% deposit, pay rest on delivery
   - **Full Payment**: pay full amount now
3. **Select method:** Card (Visa/Mastercard) / Bank Transfer
4. **Shipping address:** fill Street, City, Postal code
5. Tick **agree** to cancellation & refund policy
6. Click **Pay Deposit & Reserve**  
   → Order created on Backend, redirects to Transaction

---

### Step 3.5: Transaction – Deposit paid

1. Transaction page shows:
   - Countdown (24h to complete)
   - Order status (Reserved)
   - Bike info, deposit amount, remaining balance
2. Click **Finalize Purchase** → go to Finalize

---

### Step 3.6: Finalize – Pay balance & complete

1. Finalize page shows:
   - Address / contact form (if needed)
   - Balance due
   - Order summary
2. Click **Pay Balance & Complete**  
   → Backend updates order to **COMPLETED**, listing to **SOLD**  
   → Redirects to Success page

---

### Step 3.7: Success – Purchase complete

1. Success page shows:
   - **Payment Successful**
   - Order ID
   - Thông tin xe và thanh toán
2. Next actions:
   - **View my orders** → Profile
   - **Continue shopping** → Home

---

### Step 3.8: Profile – Confirm order completed

1. Click **Profile** in header (or "View my orders" button)
2. Scroll to **Recent Orders**
3. The order just purchased will show with status **COMPLETED**

---

## 4. Flow diagram (summary)

```
Login → Home → Bike detail → Checkout → Transaction → Finalize → Success → Profile
         ↓           ↓           ↓           ↓            ↓
      View list   Buy now    Create order Finalize    Complete
      of bikes                (RESERVED)   (COMPLETE)  (COMPLETED)
```

---

## 5. Troubleshooting

| Symptom                          | Solution                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------- |
| 401 Invalid credentials on login | Ensure Backend is running and has log `[seed] demo data loaded`                  |
| Empty page, no listings          | Check `VITE_USE_MOCK_API=false` and restart Frontend                             |
| Cannot create order              | Verify logged in as Buyer, Backend is running                                    |
| Error when completing order      | Ensure `orderId` is passed from Transaction → Finalize (do not refresh mid-flow) |

---

## 6. Inspector flow (optional)

### Step 6.1: Login Inspector

1. Open `/login`
2. Select role **Inspector**
3. Enter: `inspector@demo.com` / `Password!1`
4. Click **Log in**

### Step 6.2: Inspector Dashboard

1. Click **Inspector** in header → `/inspector`
2. View **listings pending inspection** (from seed: Giant TCR, Scott Addict RC)
3. For each listing you can:
   - **View details** → opens `/bikes/:id` (shows "Pending inspection", no Buy button)
   - **Approve** → listing becomes PUBLISHED, appears on marketplace
   - **Reject** → listing closed (REJECTED)
   - **Need update** → add reason (optional), seller must resubmit after editing

### Step 6.3: Demo actions

1. Click **Approve** on Giant TCR → confirm → listing removed from pending, now on Home
2. Or click **Need update** → enter "Need clearer drivetrain photo" → confirm

---

## 7. Seller flow (optional)

- **Seller:** Login `seller@demo.com` → Dashboard → Create listing → Add photos → Submit for inspection
- After submit: listing appears in Inspector Dashboard for approval

---

_Updated: full buyer flow with API backend._
