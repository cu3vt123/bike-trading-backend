# SWT301 — Defect DEF-SWT-001 … 007: đối chiếu & chứng cứ

Bảng dưới đây khớp **nội dung nguồn** trong `scripts/export-defectlist-xlsx.mjs` (cột Title, Related TC, Steps, Root Cause). Dùng khi **demo**, **viết báo cáo**, hoặc **đính kèm minh chứng** (screenshot, HAR).

**Trạng thái trong script export:** tất cả đang ghi **Closed** — nghĩa là đã có hướng xử lý trong code/docs; vẫn nên **chạy lại kịch bản** trước khi nộp.

---

## Bảng tổng hợp

| ID | Severity | Priority | Related TC (trong DefectList) | Liên quan Req (ghi chú) |
|----|----------|----------|-------------------------------|-------------------------|
| DEF-SWT-001 | Major | P1 | TC-INS-002 | UR-INS-01 |
| DEF-SWT-002 | Major | P1 | TC-ADM-008 | UR-AUTH-04 |
| DEF-SWT-003 | Major | P2 | TC-INS-003 | UR-INS-01 |
| DEF-SWT-004 | Major | P2 | TC-BUY-022 | UR-ORD-05 |
| DEF-SWT-005 | Major | P2 | TC-BUY-001 | UR-AUTH-02 |
| DEF-SWT-006 | Major | P2 | TC-SEL-012 | UR-LIST-03 |
| DEF-SWT-007 | Minor | P3 | TC-ADM-010 | UR-ADM-01 |

---

## DEF-SWT-001 — Inspector/Admin không xem được chi tiết tin PENDING_INSPECTION

**Triệu chứng cũ:** FE chỉ gọi GET marketplace → tin chưa public → “Không tìm thấy tin đăng”.  
**Đã xử lý (tóm tắt):** BE thêm **`GET /api/inspector/listings/{id}`**; FE gọi `fetchListingByIdForInspector` khi cần.

| Mục | Chi tiết |
|-----|----------|
| **Route FE** | `/bikes/:id` (`ProductDetailPage`) |
| **API** | `GET /api/inspector/listings/{id}` (sau Bearer) |
| **File tham chiếu** | `src/services/inspectorService.ts`, `src/apis/inspectorApi.ts`, Spring `InspectorController#getListingById` |
| **Cách demo** | Đăng nhập Inspector hoặc Admin → mở URL chi tiết tin đang `PENDING_INSPECTION` từ `/inspector` |
| **Minh chứng gợi ý** | Screenshot trang chi tiết + Network: response 200 từ `/inspector/listings/...` |
| **Tên file đính kèm (mẫu)** | `network-inspector-detail.har` |

---

## DEF-SWT-002 — Admin bị 403 trên `/api/inspector/**`

**Triệu chứng cũ:** `SecurityConfig` chỉ `hasRole(INSPECTOR)`.  
**Đã xử lý:** `hasAnyRole("INSPECTOR", "ADMIN")` cho `/api/inspector/**`.

| Mục | Chi tiết |
|-----|----------|
| **Route FE** | Bất kỳ màn nào Admin gọi API inspector (vd. cùng luồng xem tin như Inspector) |
| **API** | Mọi path `/api/inspector/**` |
| **File tham chiếu** | `src/main/java/.../security/SecurityConfig.java` (Spring); Node: `backend/src/routes/inspectorRoutes.js` |
| **Cách demo** | Đăng nhập **Admin** → thao tác giống DEF-SWT-001 — Network không 403 chỉ vì role |
| **Minh chứng gợi ý** | Screenshot Network: status 200 trên `inspector/listings/...` |
| **Tên file đính kèm (mẫu)** | `network-403-admin-inspector.har` (trước sửa) / sau sửa dùng HAR mới |

---

## DEF-SWT-003 — ProductDetail: race hydrate / tin pending không tải

**Triệu chứng cũ:** Refresh `/bikes/:id` khi Inspector — đôi khi not found đến khi F5 lại.  
**Đã xử lý:** Sau GET public, nếu chưa có dữ liệu và còn `accessToken`, gọi thêm `fetchListingByIdForInspector`.

| Mục | Chi tiết |
|-----|----------|
| **Route FE** | `/bikes/:id` |
| **File tham chiếu** | `src/pages/ProductDetailPage.tsx` (khối `useEffect` load listing) |
| **Cách demo** | Inspector đăng nhập → dán URL tin pending → **F5** nhiều lần — cuối cùng vẫn ra dữ liệu |
| **Minh chứng gợi ý** | Video ngắn hoặc console log + Network thứ tự request |
| **Tên file đính kèm (mẫu)** | `console-product-detail.txt` |

---

## DEF-SWT-004 — PurchaseSuccess: listing SOLD không còn GET public

**Triệu chứng cũ:** Trang success chỉ `fetchListingById` → 404.  
**Đã xử lý:** Có `orderId` trong `location.state` → `fetchOrderById` + `listingSnapshotToDetail`.

| Mục | Chi tiết |
|-----|----------|
| **Route FE** | `/success/:id` (`PurchaseSuccessPage`); điều hướng từ `FinalizePurchasePage`, `TransactionPage` |
| **API** | `GET /buyer/orders/:id` (hoặc tương đương) để lấy snapshot |
| **File tham chiếu** | `src/pages/PurchaseSuccessPage.tsx`, `src/lib/listingSnapshotFromOrder.ts` |
| **Cách demo** | Hoàn tất đơn đến success → kiểm tra thông tin xe vẫn hiện khi tin đã SOLD |
| **Minh chứng gợi ý** | Screenshot trang success + state có `orderId` |
| **Tên file đính kèm (mẫu)** | `screenshot-success-404.png` (trước sửa) |

---

## DEF-SWT-005 — Token/role cũ → 403 lặp

**Đã xử lý (FE):** `clearTokens` khi logout / login mới / 401; persist auth có `_hasHydrated`.

| Mục | Chi tiết |
|-----|----------|
| **File tham chiếu** | `src/stores/useAuthStore.ts`, `src/lib/apiClient.ts`, `LoginPage` (clear trước login) |
| **Cách demo** | Đăng xuất → đăng nhập user khác; kiểm tra API dùng đúng Bearer mới |
| **Minh chứng gợi ý** | Mô tả bước + (tùy chọn) HAR |
| **Tên file đính kèm (mẫu)** | `screenshot-403-auth.png` |

---

## DEF-SWT-006 — Seller: năm sản xuất không validate (năm tương lai / quá dài)

**Đã xử lý:** `validateYearField`, `yearStringToApi`, i18n `seller.yearFourDigits`, `yearFuture`, `yearTooOld`, `yearInvalid`.

| Mục | Chi tiết |
|-----|----------|
| **Route FE** | `/seller/listings/new`, `/seller/listings/:id/edit` |
| **File tham chiếu** | `src/pages/SellerListingEditorPage.tsx`, `src/locales/vi.json`, `en.json` |
| **Cách demo** | Nhập năm `2030`, `21312`, `1890`, `123` — báo lỗi đúng; năm hợp lệ mới lưu/gửi |
| **Minh chứng gợi ý** | Screenshot ô năm + message |
| **Tên file đính kèm (mẫu)** | `screenshot-year-invalid.png` |

---

## DEF-SWT-007 — Admin kho: nhãn “Bước 5/6” gây rối

**Đã xử lý:** Sửa chuỗi i18n (không tiền tố đánh số bước như trước).

| Mục | Chi tiết |
|-----|----------|
| **Key i18n (ví dụ)** | `admin.warehouseSectionAdminConfirm`, `admin.warehouseMovedToInspector`, `transaction.nextStep*`, `transaction.orderInProgress*` |
| **File tham chiếu** | `src/locales/vi.json`, `src/locales/en.json` |
| **Cách demo** | Admin: màn kho / luồng liên quan warehouse + buyer transaction — đọc text, không còn “Bước 5:” |
| **Minh chứng gợi ý** | Screenshot vùng tiêu đề |
| **Tên file đính kèm (mẫu)** | `screenshot-admin-buoc.png` |

---

## Gợi ý lưu file minh chứng (local)

Đặt dưới `docs/testing/screenshots/` hoặc `docs/testing/evidence/` — các thư mục/file nhị phân vẫn có thể bị ignore theo `.gitignore`; chỉ cần nộp cho giảng viên theo yêu cầu môn học.

---

## Cập nhật DefectList.xlsx

Khi cần file Excel thống nhất với bảng này:

```bash
node scripts/export-defectlist-xlsx.mjs
```

Chi tiết cột và chỉnh sửa: [SWT301_EXPORT_DEFECTLIST.md](./SWT301_EXPORT_DEFECTLIST.md).
