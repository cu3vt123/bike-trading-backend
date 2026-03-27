/**
 * Sinh docs/testing/SWT301_TestCase_Functional_and_Unit_Combined.xlsx — khung 200 TC (100 F + 100 U).
 * Cột khớp docs/testing/SWT301_TESTING_GUIDE.md §3.1 (sheet names, prefix TC-* / UTC-*).
 *
 * Chạy: node scripts/generate-swt301-testcase-workbook.mjs
 * Hoặc: npm run generate:testcase-workbook
 *
 * File .xlsx thường bị .gitignore — dùng local / nộp bài.
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../docs/testing/SWT301_TestCase_Functional_and_Unit_Combined.xlsx");

const F_HEADERS = [
  "ID",
  "Test Case Description",
  "Procedure",
  "Expected Output",
  "Inter-test case Dependence",
  "Result",
  "Test date",
  "Note",
];

const U_HEADERS = [
  "UTCID",
  "Function Code",
  "Precondition",
  "Condition/Input",
  "Expected confirmation",
  "Type (N/A/B)",
  "Result",
  "Executed Date",
  "Defect ID",
  "Note",
];

function functionalRows(actorPrefix) {
  const rows = [F_HEADERS];
  for (let i = 1; i <= 25; i++) {
    const id = `TC-${actorPrefix}-${String(i).padStart(3, "0")}`;
    rows.push([id, "", "", "", "", "", "", ""]);
  }
  return rows;
}

function unitRows(actorPrefix) {
  const rows = [U_HEADERS];
  for (let i = 1; i <= 25; i++) {
    const id = `UTC-${actorPrefix}-${String(i).padStart(3, "0")}`;
    rows.push([id, "", "", "", "", "", "", "", "", ""]);
  }
  return rows;
}

function indexSheet() {
  return [
    ["Sheet", "Mô tả"],
    ["_00_INDEX", "Mục lục (file này)"],
    ["F_Cover", "Bìa functional"],
    ["F_Test case List", "Môi trường / danh sách TC"],
    ["F_Buyer", "25 TC — TC-BUY-001 … 025"],
    ["F_Seller", "25 TC — TC-SEL-001 … 025"],
    ["F_Inspector", "25 TC — TC-INS-001 … 025"],
    ["F_Admin", "25 TC — TC-ADM-001 … 025"],
    ["F_Test Report", "Báo cáo sau khi chạy test"],
    ["U_Guidleline", "Unit: N=Normal, A=Abnormal, B=Boundary"],
    ["U_Cover", "Bìa unit"],
    ["U_FunctionList", "Danh sách function / môi trường UTC"],
    ["U_Buyer", "25 UTC — UTC-BUY-001 … 025"],
    ["U_Seller", "25 UTC — UTC-SEL-001 … 025"],
    ["U_Inspector", "25 UTC — UTC-INS-001 … 025"],
    ["U_Admin", "25 UTC — UTC-ADM-001 … 025"],
    ["U_Test Report", "Báo cáo unit"],
  ];
}

function coverF() {
  return [
    ["ShopBike — SWT301 Functional Test (template)"],
    ["Generated from repo script — điền team / ngày trước khi nộp."],
    [""],
    ["Môi trường FE", "http://localhost:5173"],
    ["API base", "http://localhost:8081/api"],
  ];
}

function coverU() {
  return [
    ["ShopBike — SWT301 Unit Test (template)"],
    ["Generated from repo script — map Function Code với code FE/BE."],
  ];
}

function guidelineU() {
  return [
    ["Type", "Ý nghĩa"],
    ["N", "Normal — luồng đúng"],
    ["A", "Abnormal — lỗi mong đợi (401/403/…) có chứng cứ"],
    ["B", "Boundary — biên input"],
  ];
}

function testReportF() {
  return [
    ["Metric", "Value"],
    ["Total TC", "100"],
    ["Passed", ""],
    ["Failed", ""],
    ["Blocked", ""],
    ["Tester", ""],
    ["Date", ""],
  ];
}

function testReportU() {
  return [
    ["Metric", "Value"],
    ["Total UTC", "100"],
    ["Passed", ""],
    ["Failed", ""],
    ["Tester", ""],
    ["Date", ""],
  ];
}

function listEnvF() {
  return [
    ["Field", "Value"],
    ["Browser", "Chrome"],
    ["FE URL", "http://localhost:5173"],
    ["BE URL", "http://localhost:8081/api"],
    ["Mock API", "false (khuyến nghị demo tích hợp)"],
  ];
}

function listEnvU() {
  return [
    ["Field", "Value"],
    ["Scope", "Unit / component / API theo Function Code"],
    ["Evidence", "Network / Console / token"],
  ];
}

const wb = XLSX.utils.book_new();

const sheets = [
  ["_00_INDEX", indexSheet()],
  ["F_Cover", coverF()],
  ["F_Test case List", listEnvF()],
  ["F_Buyer", functionalRows("BUY")],
  ["F_Seller", functionalRows("SEL")],
  ["F_Inspector", functionalRows("INS")],
  ["F_Admin", functionalRows("ADM")],
  ["F_Test Report", testReportF()],
  ["U_Guidleline", guidelineU()],
  ["U_Cover", coverU()],
  ["U_FunctionList", listEnvU()],
  ["U_Buyer", unitRows("BUY")],
  ["U_Seller", unitRows("SEL")],
  ["U_Inspector", unitRows("INS")],
  ["U_Admin", unitRows("ADM")],
  ["U_Test Report", testReportU()],
];

for (const [name, data] of sheets) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = Array.from({ length: Math.max(...data.map((r) => r.length), 10) }, () => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
console.log("Written:", OUT);
console.log("Sheets:", sheets.map((s) => s[0]).join(", "));
