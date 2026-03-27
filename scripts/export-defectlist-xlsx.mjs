/**
 * Sinh docs/testing/DefectList.xlsx — Lab 4 (không MantisBT).
 * Đồng bộ mô tả defect với docs/testing/SWT301_TESTING_GUIDE.md §4–5.
 *
 * Chạy: node scripts/export-defectlist-xlsx.mjs
 * Hoặc: npm run export:defectlist
 *
 * Cập nhật nội dung: sửa mảng `rows` bên dưới → chạy lại.
 * Cập nhật lần cuối dữ liệu mẫu: 2026-03-26
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../docs/testing/DefectList.xlsx");

const header = [
  "Defect ID",
  "Title",
  "Severity",
  "Priority",
  "Status",
  "Environment",
  "Related TC ID",
  "Related Req ID",
  "Steps to Reproduce",
  "Expected Result",
  "Actual Result",
  "Attachments",
  "Reporter",
  "Reported Date",
  "Assignee",
  "Root Cause",
];

/** Các lỗi đã phát hiện khi test (đối chiếu docs/CHANGELOG — Spring BE2 + FE). */
const rows = [
  [
    "DEF-SWT-001",
    "Inspector/Admin: thiếu GET /api/inspector/listings/{id} — không xem được chi tiết tin PENDING_INSPECTION",
    "Major",
    "P1",
    "Closed",
    "Win11 Chrome FE:5173 BE:8081 Spring",
    "TC-INS-002",
    "UR-INS-01",
    "1. Đăng nhập Inspector hoặc Admin. 2. Vào danh sách tin chờ duyệt. 3. Mở \"Xem chi tiết\" /bikes/:id với tin ở trạng thái chờ kiểm định.",
    "Trang chi tiết load đầy đủ thông tin tin đăng (theo quyền staff).",
    "FE gọi GET marketplace listing không có / fail → hiển thị \"Không tìm thấy tin đăng\"; BE chưa có endpoint inspector theo id.",
    "network-inspector-detail.har",
    "Nhóm ShopBike",
    "2026-03-26",
    "",
    "Đã sửa: thêm GET /api/inspector/listings/{id} (InspectorController); FE gọi fetchListingByIdForInspector khi cần.",
  ],
  [
    "DEF-SWT-002",
    "Spring Security: /api/inspector/** chỉ cho INSPECTOR — Admin bị 403 khi gọi API inspector",
    "Major",
    "P1",
    "Closed",
    "Win11 Chrome FE:5173 BE:8081 Spring",
    "TC-ADM-008",
    "UR-AUTH-04",
    "1. Đăng nhập Admin. 2. Mở luồng cần API inspector (vd. xem tin chờ duyệt). 3. Quan sát Network.",
    "Admin được phép gọi API inspector khi FE thiết kế cho phép (khớp RequireInspector).",
    "HTTP 403 Forbidden — SecurityConfig chỉ hasRole INSPECTOR.",
    "network-403-admin-inspector.har",
    "Nhóm ShopBike",
    "2026-03-26",
    "",
    "Đã sửa: hasAnyRole(INSPECTOR, ADMIN) cho /api/inspector/**.",
  ],
  [
    "DEF-SWT-003",
    "ProductDetail: race hydrate role — chưa gọi API inspector nên tin chờ duyệt không tải",
    "Major",
    "P2",
    "Closed",
    "Win11 Chrome FE:5173 BE:8081",
    "TC-INS-003",
    "UR-INS-01",
    "1. Đăng nhập Inspector. 2. Refresh trực tiếp URL /bikes/:id (tin pending). 3. Trước khi role hydrate xong, FE chỉ thử GET public.",
    "Sau khi có token/role, trang vẫn resolve được listing qua API inspector.",
    "Tạm thời không có dữ liệu; có thể hiển thị not found cho đến khi F5.",
    "console-product-detail.txt",
    "Nhóm ShopBike",
    "2026-03-26",
    "",
    "Đã sửa: ProductDetailPage gọi thêm fetchListingByIdForInspector khi public fetch không có dữ liệu và còn accessToken.",
  ],
  [
    "DEF-SWT-004",
    "PurchaseSuccess: 404 / không hiển thị tin sau khi đơn SOLD — GET /bikes/:id public không còn listing",
    "Major",
    "P2",
    "Closed",
    "Win11 Chrome FE:5173 BE:8081",
    "TC-BUY-022",
    "UR-ORD-05",
    "1. Hoàn tất mua hàng đến bước success. 2. Trang cần hiển thị snapshot tin đã mua. 3. Listing đã SOLD không còn trong GET /bikes public.",
    "Trang success vẫn hiển thị thông tin tin (từ order snapshot hoặc orderId).",
    "Lỗi tải listing / 404 khi chỉ fetch theo id marketplace.",
    "screenshot-success-404.png",
    "Nhóm ShopBike",
    "2026-03-20",
    "",
    "Đã sửa: ưu tiên fetch order khi có orderId; dùng listing snapshot từ order; Finalize truyền orderId trong state.",
  ],
  [
    "DEF-SWT-005",
    "Auth: đổi role / phiên cũ — token không khớp role hiện tại gây 403 lặp",
    "Major",
    "P2",
    "Closed",
    "Win11 Chrome FE:5173",
    "TC-BUY-001",
    "UR-AUTH-02",
    "1. Đăng nhập một role. 2. Logout không sạch hoặc đổi role nhanh. 3. Gọi API với token cũ.",
    "API trả đúng theo role hiện tại; không giữ phiên sai.",
    "403 hoặc dữ liệu sai role cho đến khi xóa storage / login lại.",
    "screenshot-403-auth.png",
    "Nhóm ShopBike",
    "2026-03-26",
    "",
    "Đã sửa: chuẩn hóa logout và hydrate token/role (đồng bộ docs CHANGELOG 2026-03).",
  ],
  [
    "DEF-SWT-006",
    "Seller soạn tin: ô Năm sản xuất chấp nhận năm > năm hiện tại (vd. 21312) — không validate",
    "Major",
    "P2",
    "Closed",
    "Win11 Chrome FE:5173",
    "TC-SEL-012",
    "UR-LIST-03",
    "1. Đăng nhập Seller. 2. Tạo/sửa tin — Thông số kỹ thuật. 3. Nhập năm lớn hơn năm hiện tại hoặc quá dài. 4. Lưu nháp / gửi.",
    "Hệ thống chặn hoặc báo lỗi khi năm > năm hiện tại; giới hạn độ dài hợp lý.",
    "Chấp nhận giá trị không thực tế (năm tương lai / nhiều chữ số).",
    "screenshot-year-invalid.png",
    "Nhóm ShopBike",
    "2026-03-26",
    "",
    "Đã sửa: validate năm ≤ năm hiện tại, tối thiểu 1900, tối đa 4 chữ số; hiển thị lỗi dưới ô (SellerListingEditorPage + i18n).",
  ],
  [
    "DEF-SWT-007",
    "Admin kho: nhãn tiêu đề còn \"Bước 5\" / \"Bước 6\" — gây rối UI (không cần đánh số bước)",
    "Minor",
    "P3",
    "Closed",
    "Win11 Chrome FE:5173",
    "TC-ADM-010",
    "UR-ADM-01",
    "1. Đăng nhập Admin. 2. Mục xác nhận xe tới kho / thông báo chuyển Inspector. 3. Đọc dòng mô tả phía trên danh sách.",
    "Chỉ hiển thị nội dung nghiệp vụ, không tiền tố \"Bước X:\".",
    "Chuỗi i18n hiển thị \"Bước 5: …\", \"(Bước 6)\" tương tự.",
    "screenshot-admin-buoc.png",
    "Nhóm ShopBike",
    "2026-03-26",
    "",
    "Đã sửa: chỉnh vi.json / en.json (admin.warehouseSectionAdminConfirm, warehouseMovedToInspector, transaction.nextStep*, orderInProgress).",
  ],
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
ws["!cols"] = [
  { wch: 12 },
  { wch: 56 },
  { wch: 8 },
  { wch: 6 },
  { wch: 8 },
  { wch: 28 },
  { wch: 12 },
  { wch: 10 },
  { wch: 52 },
  { wch: 44 },
  { wch: 44 },
  { wch: 22 },
  { wch: 14 },
  { wch: 12 },
  { wch: 10 },
  { wch: 36 },
];
XLSX.utils.book_append_sheet(wb, ws, "DefectList");

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
console.log("Written:", OUT, `(${rows.length} defects)`);
