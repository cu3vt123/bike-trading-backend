#!/usr/bin/env node
/**
 * Append business rules to ReBike_BusinessRules_Template.xlsx
 * Skips rules that already exist (by Rule ID in first column).
 * Run: node scripts/append-business-rules.mjs
 */

import pkg from "xlsx";
const { readFile, writeFile, utils } = pkg;
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const EXCEL_PATH = join(ROOT, "ReBike_BusinessRules_Template.xlsx");

const NEW_RULES = [
  // BR-ORD-* — Đơn hàng & Luồng giao
  ["BR-ORD-01", "fulfillmentType WAREHOUSE vs DIRECT", "Order có fulfillmentType: WAREHOUSE (xe certified) hoặc DIRECT (xe unverified)."],
  ["BR-ORD-02", "Luồng WAREHOUSE", "Xe tại kho → AT_WAREHOUSE_PENDING_ADMIN → admin confirm → SHIPPING (24h countdown)."],
  ["BR-ORD-03", "Luồng DIRECT", "PENDING_SELLER_SHIP → seller ship-to-buyer → SHIPPING. Không qua kho."],
  ["BR-ORD-04", "Hủy đơn chỉ khi DIRECT", "Buyer chỉ hủy được khi fulfillmentType=DIRECT. WAREHOUSE không cho hủy."],
  ["BR-ORD-05", "confirm-warehouse chỉ WAREHOUSE", "Admin confirm-warehouse chỉ áp dụng đơn WAREHOUSE. DIRECT trả 400."],
  ["BR-ORD-06", "confirm-warehouse yêu cầu thanh toán", "Yêu cầu depositPaid hoặc vnpayPaymentStatus=PAID mới confirm."],
  ["BR-ORD-07", "Query đơn chờ kho", "WAREHOUSE_ONLY_FILTER: chỉ đơn fulfillmentType=WAREHOUSE."],
  ["BR-ORD-08", "Seller GET /orders", "Hai nhánh: kho (SELLER_SHIPPED, AT_WAREHOUSE, không DIRECT); direct (PENDING_SELLER_SHIP + DIRECT)."],
  ["BR-ORD-09", "FIFO listing", "Available → Reserved (sau deposit) → Sold. Cancel/Fail → Available."],
  ["BR-ORD-10", "Reserve khi deposit OK", "Reserve chỉ tạo khi deposit payment thành công (24h countdown)."],
  // BR-PAY-VNP-* — VNPAY
  ["BR-PAY-VNP-01", "Chỉ VNPAY buyer checkout", "Bỏ CASH/COD. POST /api/buyer/orders/vnpay-checkout (DEPOSIT 8% hoặc FULL)."],
  ["BR-PAY-VNP-02", "Chỉ VNPAY gói seller", "Gói đăng tin dùng VNPay (bỏ Postpay)."],
  ["BR-PAY-VNP-03", "Deposit 8%", "Deposit = 8% giá trị đơn. Đồng bộ FE và BE."],
  ["BR-PAY-VNP-04", "Return URL cập nhật depositPaid", "IPN hoặc Return URL cập nhật depositPaid, vnpayPaymentStatus=PAID. Return URL cũng cập nhật khi IPN không gọi được (localhost)."],
  ["BR-PAY-VNP-05", "Finalize thanh toán số dư", "Buyer thanh toán phần còn lại (khi chọn DEPOSIT) trước Complete."],
  // BR-FIN-* — Finalize
  ["BR-FIN-01", "Lấy tin từ order.listing", "Finalize ưu tiên lấy listing từ order.listing khi có orderId. Không phụ thuộc GET /bikes/:id."],
  ["BR-FIN-02", "Bỏ form địa chỉ Finalize", "Finalize không hiển thị form địa chỉ — buyer đã nhập ở checkout."],
  ["BR-FIN-03", "GET /bikes/:id chỉ PUBLISHED", "API chỉ trả PUBLISHED. RESERVED có thể 404. Finalize dùng order.listing."],
  // BR-TIME-*
  ["BR-TIME-01", "Countdown 24h khi SHIPPING", "Hiển thị đếm ngược 24h từ expiresAt để buyer hoàn tất nhận hàng."],
  ["BR-TIME-02", "Refetch khi chờ giao", "Refetch đơn mỗi 5s khi chờ seller/kho xác nhận giao."],
  ["BR-TIME-03", "expiresAt khi chuyển SHIPPING", "Set khi admin confirm (WAREHOUSE) hoặc seller ship-to-buyer (DIRECT)."],
];

function getExistingIds(ws) {
  const ids = new Set();
  const range = utils.decode_range(ws["!ref"] || "A1");
  for (let R = range.s.r; R <= range.e.r; R++) {
    const cell = ws[utils.encode_cell({ r: R, c: 0 })];
    const val = cell?.v?.toString?.() ?? "";
    if (/^BR-[A-Z]+-\d+/.test(val)) ids.add(val.split(/\s/)[0]);
  }
  return ids;
}

function main() {
  let wb;
  try {
    wb = readFile(EXCEL_PATH);
  } catch (e) {
    console.error("Không đọc được file Excel:", EXCEL_PATH, e.message);
    process.exit(1);
  }

  const sheetName = wb.SheetNames[0] || "Business Rules";
  const ws = wb.Sheets[sheetName];
  const existingIds = getExistingIds(ws);

  const toAdd = NEW_RULES.filter(([id]) => !existingIds.has(id));
  if (toAdd.length === 0) {
    console.log("Tất cả rule đã tồn tại. Không thêm mới.");
    return;
  }

  const rows = toAdd.map(([id, topic, desc]) => [id, topic, desc]);
  utils.sheet_add_aoa(ws, rows, { origin: -1 });

  try {
    writeFile(wb, EXCEL_PATH);
    console.log(`Đã thêm ${toAdd.length} rule mới vào ${EXCEL_PATH}:`);
    toAdd.forEach(([id]) => console.log("  -", id));
  } catch (e) {
    console.error("Lỗi ghi file:", e.message);
    process.exit(1);
  }
}

main();
