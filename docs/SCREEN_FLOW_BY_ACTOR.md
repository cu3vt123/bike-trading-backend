# Screen Flow — By Actor

> Mô tả luồng màn hình theo từng vai trò (Guest, Buyer, Seller, Inspector, Admin). Dùng để kiểm tra UX, viết test, hoặc đối chiếu với API.

**Tra cứu nhanh:** [QUICK-REFERENCE.md](QUICK-REFERENCE.md) — routes theo role, luồng→API.  
**Kiểm tra UI/UX:** [UI-UX-AUDIT-BY-ACTOR.md](UI-UX-AUDIT-BY-ACTOR.md).

### Ký hiệu

- `[...]` = 1 màn hình (page)
- `(...)` = 1 popup hoặc hành động con
- Mũi tên = chuyển màn hình, có nhãn "Click gì / điều kiện"

---

## Main Flow

```
[Home] → [Login] → [Product Detail] → [Checkout] → [Transaction] → [Finalize] → [Success] → [Profile]
```

Browse bikes → Log in (if needed) → View bike → Pay deposit → Track order → Complete payment → Done → View orders

---

## 1. Seller ScreenFlow

### Main flow (left → right)

```
[Register] ---> [Login] ---> [Home]
```

- Register → Login: Click "Already have account?" or after successful registration.
- Login → Home: Login successful (role = SELLER).

### From Login

```
[Login] --Click "Forgot password?"--> [Forgot Password]
[Forgot Password] --Enter email, receive link--> [Reset Password]
[Reset Password] --Set new password done--> [Login]
```

### From Home

```
[Home] --Click "Profile" (header)--> [Seller Profile]
[Home] --Click "Seller Channel" (header)--> [Seller Dashboard]
[Home] --Click bell icon (header)--> [Notifications]
[Home] --Click "Stats" (header)--> [Stats Dashboard]
```

### From Seller Profile

```
[Seller Profile] --Click "Edit Profile"--> (Edit Profile)
[Seller Profile] --Payment Methods section--> [Payment Methods]
[Seller Profile] --Click "Logout"--> [Home] (logged out)
```

### From Payment Methods (inside Seller Profile)

```
[Payment Methods] --Click "Add New"--> (Add Payment Method)
[Payment Methods] --Click "Remove" on a card--> (Confirm Remove)
[Payment Methods] --Click "Set as default" on a card--> update default
```

### From Seller Dashboard

```
[Seller Dashboard] --Click "Create new"--> [Create Listing]
[Seller Dashboard] --Click "Continue Drafting" (right panel)--> [Create Listing]
[Seller Dashboard] --Click "Edit" on a listing (Draft/Need Update)--> [Edit Listing]
[Seller Dashboard] --View listing table--> [Listing Inventory]
[Seller Dashboard] --View orders--> [Orders & Deposits]
[Seller Dashboard] --View ratings--> [Ratings & Reputation]
```

### From Create Listing

```
[Create Listing] --Click "Save draft"--> (Save draft, stay on page)
[Create Listing] --Click "Submit for inspection" (5 photos OK)--> [Seller Dashboard]
[Create Listing] --Click "Submit for inspection" (missing photos)--> (Show error, stay on page)
[Create Listing] --Click "Back to Dashboard"--> [Seller Dashboard]
```

### From Edit Listing

```
[Edit Listing] --Click "Save draft"--> (Save, stay on page)
[Edit Listing] --Click "Submit for inspection" (5 photos OK)--> [Seller Dashboard]
[Edit Listing] --If listing is Pending Inspection--> (Form locked, view only)
[Edit Listing] --If listing has Need Update status--> (Show inspector reason, allow edit + resubmit)
[Edit Listing] --Click "Back to Dashboard"--> [Seller Dashboard]
```

### From Notifications

```
[Notifications] --Click "Read"--> (Mark as read)
[Notifications] --Click "Open"--> [Seller Dashboard] or related page
[Notifications] --Click "Check new orders"--> (Sync new order notifications)
[Notifications] --Click "Delete read"--> (Delete read notifications)
```

### Seller accessing wrong pages

```
[Seller] --Navigate to /checkout or /admin--> [403 Forbidden]
[Seller] --Navigate to /login while logged in--> [Home]
```

### 1.2 Screen Descriptions (Seller)

| # | Screen | Feature | Description |
|---|--------|---------|-------------|
| SE-01 | Register | Authentication | Sign up page, select role as Seller |
| SE-02 | Login | Authentication | Login with email/username and password |
| SE-03 | Forgot Password | Authentication | Enter email to receive password reset link |
| SE-04 | Reset Password | Authentication | Set a new password via reset link |
| SE-05 | Home | Browse Listings | Landing page with hero banner, filters, bike listing grid |
| SE-06 | Seller Dashboard | Listing Management | Main dashboard with stats, inventory table, orders, ratings |
| SE-07 | Listing Inventory | Listing Management | Table of all seller's listings (Draft / Published / Need Update…) |
| SE-08 | Orders & Deposits | Order Management | List of orders and deposit status for seller's bikes |
| SE-09 | Ratings & Reputation | Seller Reputation | Star rating breakdown and average score |
| SE-10 | Create Listing | Listing Management | Form to create a new listing (bike info + 5 photos required) |
| SE-11 | Edit Listing | Listing Management | Form to edit an existing listing (prefilled data) |
| SE-12 | Stats Dashboard | Analytics | Detailed statistics and charts for the seller |
| SE-13 | Seller Profile | Profile Management | Personal info, avatar, email, member since date |
| SE-14 | Edit Profile | Profile Management | Popup to edit name, email, and avatar URL |
| SE-15 | Payment Methods | Payment Management | List of saved Visa/Mastercard cards inside Profile |
| SE-16 | Add Payment Method | Payment Management | Popup to add a new payment card |
| SE-17 | Confirm Remove | Payment Management | Popup to confirm deleting a saved card |
| SE-18 | Notifications | Notifications | List of notifications filtered by Seller role |
| SE-19 | 403 Forbidden | Error Handling | Access denied page when navigating to unauthorized routes |

### Arrows Summary (Seller)

| From | To | Action / Condition |
|------|----|--------------------|
| Register | Login | Click "Already have account?" |
| Login | Register | Click "Don't have account?" |
| Login | Home | Login successful |
| Login | Forgot Password | Click "Forgot password?" |
| Forgot Password | Reset Password | Enter email, receive link |
| Reset Password | Login | New password set successfully |
| Home | Seller Dashboard | Click "Seller Channel" (header) |
| Home | Seller Profile | Click "Profile" (header) |
| Home | Notifications | Click bell icon (header) |
| Home | Stats Dashboard | Click "Stats" (header) |
| Seller Dashboard | Create Listing | Click "Create new" / "Continue Drafting" |
| Seller Dashboard | Edit Listing | Click "Edit" on a listing |
| Create Listing | Seller Dashboard | Submit successful / Back to Dashboard |
| Edit Listing | Seller Dashboard | Submit successful / Back to Dashboard |
| Seller Profile | Edit Profile | Click "Edit Profile" |
| Seller Profile | Home | Click "Logout" |
| Payment Methods | Add Payment Method | Click "Add New" |
| Payment Methods | Confirm Remove | Click "Remove" |
| Notifications | Seller Dashboard | Click "Open" on a notification |
| Any (Seller) | 403 Forbidden | Navigate to Buyer-only / Admin-only URL |

---

## 2. Guest ScreenFlow (Not logged in)

### Main flow

```
[Home] (entry point)
```

### From Home

```
[Home] --Click a bike card--> [Product Detail]
[Home] --Click "Support" (header)--> [Support]
[Home] --Click "Wishlist" (header)--> [Wishlist]
[Home] --Click "Login" (header)--> [Login]
[Home] --Click "Register" (header / from Login)--> [Register]
```

### From Product Detail

```
[Product Detail] --Click "Home" (breadcrumb)--> [Home]
[Product Detail] --Click "Buy now"--> (Redirect to /checkout → not logged in → redirect) --> [Login]
[Product Detail] --Click "Message seller"--> (Chat / email popup)
[Product Detail] --Click "Add to wishlist"--> (Not logged in, depends on UI)
```

### From Login

```
[Login] --Login successful--> [Home] (or previous page if redirected)
[Login] --Click "Forgot password?"--> [Forgot Password]
[Login] --Click "Register"--> [Register]
```

### From Register

```
[Register] --Registration successful--> [Home]
[Register] --Click "Already have account?"--> [Login]
```

### From Forgot Password / Reset Password

```
[Forgot Password] --Send email--> [Reset Password]
[Reset Password] --Set new password--> [Login]
```

### Guest accessing protected pages

```
[Guest] --Navigate to /profile--> [Login] (redirect)
[Guest] --Navigate to /notifications--> [Login] (redirect)
[Guest] --Navigate to /checkout/:id--> [Login] (redirect)
[Guest] --Navigate to /seller--> [Login] (redirect)
[Guest] --Navigate to /inspector--> [Login] (redirect)
[Guest] --Navigate to /admin--> [Login] (redirect)
```

### 2.2 Screen Descriptions (Guest)

| # | Screen | Feature | Description |
|---|--------|---------|-------------|
| GU-01 | Home | Browse Listings | Landing page with hero banner, filters, and bike listing grid |
| GU-02 | Product Detail | Browse Listings | Bike photos, inspection report, specs, price, and Buy now button |
| GU-03 | Support | Help & Support | FAQ section and contact information |
| GU-04 | Wishlist | Favorites | List of favorited bikes (may require login) |
| GU-05 | Login | Authentication | Login form with email/username and password |
| GU-06 | Register | Authentication | Registration form with role selection (Buyer / Seller) |
| GU-07 | Forgot Password | Authentication | Enter email to receive password reset link |
| GU-08 | Reset Password | Authentication | Set a new password via reset link |

### Arrows Summary (Guest)

| From | To | Action / Condition |
|------|----|--------------------|
| Home | Product Detail | Click a bike card |
| Home | Support | Click "Support" (header) |
| Home | Wishlist | Click "Wishlist" (header) |
| Home | Login | Click "Login" (header) |
| Product Detail | Home | Click "Home" (breadcrumb) |
| Product Detail | Login | Click "Buy now" → not logged in → redirect |
| Login | Home | Login successful |
| Login | Register | Click "Register" |
| Login | Forgot Password | Click "Forgot password?" |
| Register | Home | Registration successful |
| Register | Login | Click "Already have account?" |
| Forgot Password | Reset Password | Email sent successfully |
| Reset Password | Login | New password set successfully |
| Any (Guest) | Login | Navigate to any protected URL → redirect |

---

## 3. Buyer ScreenFlow (Role = BUYER)

### Main flow

```
[Register] ---> [Login] ---> [Home]
```

### From Home

```
[Home] --Click a bike card--> [Product Detail]
[Home] --Click "Support" (header)--> [Support]
[Home] --Click "Wishlist" (header)--> [Wishlist]
[Home] --Click "Profile" (header)--> [Buyer Profile]
[Home] --Click bell icon (header)--> [Notifications]
```

### From Product Detail

```
[Product Detail] --Click "Home" (breadcrumb)--> [Home]
[Product Detail] --Click "Buy now"--> [Checkout]
[Product Detail] --Click "Add to wishlist"--> (Toggle wishlist)
[Product Detail] --Click "Message seller"--> (Chat popup)
[Product Detail] --Click "View full report"--> (Inspection Report popup)
```

### From Checkout (Purchase flow)

```
[Checkout] --Enter shipping + select plan + select method + tick agree + Submit--> [Transaction]
[Checkout] --Submit but payment fails--> (Show error, stay on Checkout)
[Checkout] --Listing not found--> (Show Not Found error)
```

### From Transaction

```
[Transaction] --Click "Continue" / auto when conditions met--> [Finalize]
[Transaction] --Click "Cancel reservation"--> (Cancel Confirm popup)
(Cancel Confirm) --Click "Confirm cancel"--> [Buyer Profile] (order cancelled)
[Transaction] --Click "Report issue"--> (Report Issue popup)
[Transaction] --Click "Contact support"--> (Contact Support popup)
[Transaction] --Click "View profile"--> [Buyer Profile]
[Transaction] --Click "View listing"--> [Product Detail]
```

### From Finalize

```
[Finalize] --Click "Complete purchase"--> [Success]
[Finalize] --Click "Back"--> [Transaction]
```

### From Success

```
[Success] --Click "View my orders"--> [Buyer Profile]
[Success] --Click "Back to home"--> [Home]
[Success] --Rating section: select stars + enter comment + Submit--> (Submit review)
```

### From Wishlist

```
[Wishlist] --Click a bike--> [Product Detail]
[Wishlist] --Click "Remove"--> (Remove from wishlist)
```

### From Buyer Profile

```
[Buyer Profile] --Click "Personal Info"--> (Scroll to info section)
[Buyer Profile] --Click "Wishlist"--> [Wishlist]
[Buyer Profile] --Click "Continue payment" on an order--> [Transaction]
[Buyer Profile] --Click "View progress" on an order--> [Transaction]
[Buyer Profile] --Click "Go home"--> [Home]
[Buyer Profile] --Click "Logout"--> [Home] (logged out)
```

### From Notifications

```
[Notifications] --Click "Read"--> (Mark as read)
[Notifications] --Click "Open"--> Related page (Profile / Transaction…)
[Notifications] --Click "Delete read"--> (Delete read notifications)
```

### Buyer accessing wrong pages

```
[Buyer] --Navigate to /seller--> [403 Forbidden]
[Buyer] --Navigate to /admin--> [403 Forbidden]
[Buyer] --Navigate to /inspector--> [403 Forbidden]
```

### 3.2 Screen Descriptions (Buyer)

| # | Screen | Feature | Description |
|---|--------|---------|-------------|
| BU-01 | Register | Authentication | Sign up page, select role as Buyer |
| BU-02 | Login | Authentication | Login with email/username and password |
| BU-03 | Forgot Password | Authentication | Enter email to receive password reset link |
| BU-04 | Reset Password | Authentication | Set a new password via reset link |
| BU-05 | Home | Browse Listings | Landing page with hero banner, filters, bike listing grid |
| BU-06 | Product Detail | Browse Listings | Bike photos, specs, inspection report, price, Buy now button |
| BU-07 | Checkout | Purchase Flow | Enter shipping address, select plan/method, make payment |
| BU-08 | Transaction | Purchase Flow | Track order status, countdown timer, cancel or continue |
| BU-09 | Finalize | Purchase Flow | Confirm and complete the purchase, pay remaining balance |
| BU-10 | Success | Purchase Flow | Purchase success confirmation with review submission form |
| BU-11 | Buyer Profile | Profile Management | Personal info display, recent orders list with actions |
| BU-12 | Wishlist | Favorites | List of favorited bikes with remove option |
| BU-13 | Support | Help & Support | FAQ section and contact information |
| BU-14 | Notifications | Notifications | List of notifications filtered by Buyer role |
| BU-15 | Inspection Report | Browse Listings | Popup showing detailed bike inspection scores and notes |
| BU-16 | Cancel Confirm | Purchase Flow | Popup to confirm order cancellation |
| BU-17 | Report Issue | Purchase Flow | Popup to report a problem with the order |
| BU-18 | Contact Support | Purchase Flow | Popup to contact customer support |
| BU-19 | 403 Forbidden | Error Handling | Access denied page when navigating to unauthorized routes |

### Arrows Summary (Buyer)

| From | To | Action / Condition |
|------|----|--------------------|
| Register | Login | Click "Already have account?" |
| Login | Home | Login successful |
| Login | Forgot Password | Click "Forgot password?" |
| Forgot Password | Reset Password | Email sent |
| Reset Password | Login | Done |
| Home | Product Detail | Click a bike card |
| Home | Buyer Profile | Click "Profile" (header) |
| Home | Notifications | Click bell icon (header) |
| Home | Wishlist | Click "Wishlist" (header) |
| Home | Support | Click "Support" (header) |
| Product Detail | Checkout | Click "Buy now" |
| Product Detail | Home | Click "Home" (breadcrumb) |
| Checkout | Transaction | Submit successful |
| Transaction | Finalize | Click "Continue" |
| Transaction | Cancel Confirm | Click "Cancel reservation" |
| Cancel Confirm | Buyer Profile | Confirm cancellation |
| Finalize | Success | Click "Complete purchase" |
| Success | Buyer Profile | Click "View my orders" |
| Success | Home | Click "Back to home" |
| Buyer Profile | Transaction | Click "Continue payment" / "View progress" |
| Buyer Profile | Wishlist | Click "Wishlist" |
| Buyer Profile | Home | Click "Go home" / "Logout" |
| Wishlist | Product Detail | Click a bike |
| Notifications | Related page | Click "Open" |
| Any (Buyer) | 403 Forbidden | Navigate to Seller-only / Admin-only URL |

---

## 4. Inspector ScreenFlow (Role = INSPECTOR)

### Main flow

```
[Login] --Login (role = INSPECTOR)--> [Home]
```

Note: Inspector cannot self-register. Account is created by the system/admin.

### From Home

```
[Home] --Click "Inspector" (header)--> [Inspector Dashboard]
[Home] --Click "Profile" (header)--> [Inspector Dashboard] (Profile route shows Inspector Dashboard)
[Home] --Click bell icon (header)--> [Notifications]
```

### Inspector Dashboard — Part 1: Pending Listings

```
[Inspector Dashboard] --Auto-loads pending listings-->
    Each listing has 3 action buttons:

    --Click "Approve"--> (Approve Popup)
    --Click "Reject"--> (Reject Popup)
    --Click "Need update"--> (Need Update Popup)
```

### Approve Popup

```
(Approve Popup) --Rate each item (Frame / Drivetrain / Braking) + Click "Confirm"--> [Inspector Dashboard] (listing removed from list)
(Approve Popup) --Click "Cancel"--> [Inspector Dashboard]
```

### Reject Popup

```
(Reject Popup) --Click "Confirm"--> [Inspector Dashboard] (listing removed)
(Reject Popup) --Click "Cancel"--> [Inspector Dashboard]
```

### Need Update Popup

```
(Need Update Popup) --Enter reason (>= 5 chars) + Click "Confirm"--> [Inspector Dashboard] (listing removed)
(Need Update Popup) --Reason too short--> (Show error, stay on popup)
(Need Update Popup) --Click "Cancel"--> [Inspector Dashboard]
```

### Inspector Dashboard — Part 2: Re-inspection Orders

```
[Inspector Dashboard] --Auto-loads orders needing re-inspection-->
    Each order has:
    --Click "Submit re-inspection done"--> (Update status, order removed from list)
```

### From Notifications

```
[Notifications] --Click "Read"--> (Mark as read)
[Notifications] --Click "Open"--> [Inspector Dashboard]
```

### Inspector accessing wrong pages

```
[Inspector] --Navigate to /checkout--> [403 Forbidden]
[Inspector] --Navigate to /seller--> [403 Forbidden]
[Inspector] --Navigate to /admin--> [403 Forbidden]
```

### 4.2 Screen Descriptions (Inspector)

| # | Screen | Feature | Description |
|---|--------|---------|-------------|
| IN-01 | Login | Authentication | Login page (account provided by admin) |
| IN-02 | Home | Browse Listings | Landing page (shared layout) |
| IN-03 | Inspector Dashboard | Listing Inspection | List of pending listings to review + re-inspection orders |
| IN-04 | Approve Popup | Listing Inspection | Rate frame/drivetrain/braking scores and confirm approval |
| IN-05 | Reject Popup | Listing Inspection | Confirm rejection of a listing |
| IN-06 | Need Update Popup | Listing Inspection | Enter reason for requesting seller to update the listing |
| IN-07 | Notifications | Notifications | List of notifications filtered by Inspector role |
| IN-08 | 403 Forbidden | Error Handling | Access denied page when navigating to unauthorized routes |

### Arrows Summary (Inspector)

| From | To | Action / Condition |
|------|----|--------------------|
| Login | Home | Login successful |
| Home | Inspector Dashboard | Click "Inspector" (header) |
| Home | Notifications | Click bell icon (header) |
| Inspector Dashboard | Approve Popup | Click "Approve" on a listing |
| Inspector Dashboard | Reject Popup | Click "Reject" on a listing |
| Inspector Dashboard | Need Update Popup | Click "Need update" on a listing |
| Approve Popup | Inspector Dashboard | Confirm / Cancel |
| Reject Popup | Inspector Dashboard | Confirm / Cancel |
| Need Update Popup | Inspector Dashboard | Confirm / Cancel |
| Notifications | Inspector Dashboard | Click "Open" |
| Any (Inspector) | 403 Forbidden | Navigate to Buyer-only / Seller-only / Admin-only URL |

---

## 5. Admin ScreenFlow (Role = ADMIN)

### Main flow

```
[Login] --Login (role = ADMIN)--> [Home]
```

Note: Admin cannot self-register. Account is created by the system.

### From Home

```
[Home] --Click "Admin" (header)--> [Admin Dashboard]
[Home] --Click "Inspector" (header)--> [Inspector Dashboard] (Admin also has access)
[Home] --Click "Profile" (header)--> [Inspector Dashboard] (Profile shows Inspector Dashboard for Admin)
[Home] --Click bell icon (header)--> [Notifications]
```

### Admin Dashboard — 7 tabs (left sidebar)

```
[Admin Dashboard] --Click tab "Warehouse"--> [Tab Warehouse]
[Admin Dashboard] --Click tab "Users"--> [Tab Users]
[Admin Dashboard] --Click tab "Listings"--> [Tab Listings]
[Admin Dashboard] --Click tab "Reviews"--> [Tab Reviews]
[Admin Dashboard] --Click tab "Categories"--> [Tab Categories & Brands]
[Admin Dashboard] --Click tab "Transactions"--> [Tab Transactions & Fees]
[Admin Dashboard] --Click tab "Stats"--> [Tab Stats & Reports]
```

### Tab Warehouse (Confirm bike arrival)

```
[Tab Warehouse] --Auto-loads orders waiting for confirmation-->
    Each order has:
    --Click "Confirm arrived"--> (Confirmed, order removed from list)
```

### Tab Users (Manage users)

```
[Tab Users] --Auto-loads user list-->
    Each user has:
    --Click "Hide user" (if active)--> (User hidden)
    --Click "Unhide user" (if hidden)--> (User restored)
```

### Tab Listings (Manage listings)

```
[Tab Listings] --Auto-loads listing list-->
    Each listing has:
    --Click "Hide listing" (if visible)--> (Listing hidden from marketplace)
    --Click "Unhide listing" (if hidden)--> (Listing restored)
```

### Tab Reviews (Manage reviews)

```
[Tab Reviews] --Auto-loads review list-->
    Each review has:
    --Click "Approve" / "Reject" / change status--> (Update review)
```

### Tab Categories & Brands (Manage brands)

```
[Tab Categories & Brands] --Auto-loads brand list-->
    --Click "Add brand" + enter name + click Add--> (New brand added)
    --Click "Edit" on a brand + change name + click Save--> (Brand updated)
    --Click "Delete" on a brand--> (Brand deleted)
```

### Tab Transactions & Fees

```
[Tab Transactions] --Displays transaction list + platform fees + inspection fees-->
    (View only, UI demo)
```

### Tab Stats & Reports

```
[Tab Stats] --Displays 4 stat cards: Total Users / Listings / Pending Warehouse / Re-inspection-->
    (View only)
```

### Admin also has access to Inspector Dashboard

```
[Admin Dashboard] --> (back to Home) --> [Inspector Dashboard]
    (Full Inspector permissions: Approve/Reject/Need Update listings, Submit re-inspection done)
```

### Admin accessing wrong pages

```
[Admin] --Navigate to /checkout--> [403 Forbidden]
[Admin] --Navigate to /seller--> [403 Forbidden]
```

### 5.2 Screen Descriptions (Admin)

| # | Screen | Feature | Description |
|---|--------|---------|-------------|
| AD-01 | Login | Authentication | Login page (account provided by system) |
| AD-02 | Home | Browse Listings | Landing page (shared layout) |
| AD-03 | Admin Dashboard | Administration | Main dashboard with 4 stat cards and 7 management tabs |
| AD-04 | Tab Warehouse | Order Management | Confirm bike arrival at warehouse for pending orders |
| AD-05 | Tab Users | User Management | View all users, hide or unhide user accounts |
| AD-06 | Tab Listings | Listing Management | View all listings, hide or unhide listings from marketplace |
| AD-07 | Tab Reviews | Review Management | Review moderation — approve or reject user reviews |
| AD-08 | Tab Categories & Brands | Brand Management | CRUD operations for bike brands |
| AD-09 | Tab Transactions & Fees | Finance | View transaction history, platform fees, and inspection fees |
| AD-10 | Tab Stats & Reports | Analytics | View summary statistics (users, listings, pending orders) |
| AD-11 | Inspector Dashboard | Listing Inspection | Admin also has full Inspector access (approve/reject/need-update) |
| AD-12 | Notifications | Notifications | List of notifications |
| AD-13 | 403 Forbidden | Error Handling | Access denied page when navigating to unauthorized routes |

### Arrows Summary (Admin)

| From | To | Action / Condition |
|------|----|--------------------|
| Login | Home | Login successful |
| Home | Admin Dashboard | Click "Admin" (header) |
| Home | Inspector Dashboard | Click "Inspector" (header) |
| Home | Notifications | Click bell icon (header) |
| Admin Dashboard | Tab Warehouse | Click tab "Warehouse" |
| Admin Dashboard | Tab Users | Click tab "Users" |
| Admin Dashboard | Tab Listings | Click tab "Listings" |
| Admin Dashboard | Tab Reviews | Click tab "Reviews" |
| Admin Dashboard | Tab Categories & Brands | Click tab "Categories" |
| Admin Dashboard | Tab Transactions & Fees | Click tab "Transactions" |
| Admin Dashboard | Tab Stats & Reports | Click tab "Stats" |
| Tab Warehouse | (Update order) | Click "Confirm arrived" |
| Tab Users | (Update user) | Click "Hide" / "Unhide" |
| Tab Listings | (Update listing) | Click "Hide" / "Unhide" |
| Tab Reviews | (Update review) | Click "Approve" / "Reject" |
| Tab Categories | (Update brand) | Click "Add" / "Edit" / "Delete" |
| Notifications | Admin Dashboard | Click "Open" |
| Any (Admin) | 403 Forbidden | Navigate to Buyer-only / Seller-only URL |
