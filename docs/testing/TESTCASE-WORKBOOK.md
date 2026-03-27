# Workbook Excel 200 TC — sinh từ repo

File **`SWT301_TestCase_Functional_and_Unit_Combined.xlsx`** (thường **không** commit — xem `.gitignore`) có thể được **tạo lại** từ script trong repo để đồng bộ cấu trúc sheet và mã **TC-** / **UTC-** với [SWT301_TESTING_GUIDE.md](./SWT301_TESTING_GUIDE.md) mục §3.

## Lệnh

```bash
npm run generate:testcase-workbook
```

Tương đương:

```bash
node scripts/generate-swt301-testcase-workbook.mjs
```

**Output:** `docs/testing/SWT301_TestCase_Functional_and_Unit_Combined.xlsx`

**Yêu cầu:** `npm install` (package `xlsx`).

## Nội dung script tạo

| Nhóm | Sheet | Ghi chú |
|------|-------|---------|
| Index | `_00_INDEX` | Danh sách sheet |
| Functional | `F_Cover`, `F_Test case List`, `F_Buyer`, `F_Seller`, `F_Inspector`, `F_Admin`, `F_Test Report` | `F_*` actor: **25 dòng** + header; ID dạng `TC-BUY-001` … `TC-ADM-025` |
| Unit | `U_Guidleline`, `U_Cover`, `U_FunctionList`, `U_Buyer`, `U_Seller`, `U_Inspector`, `U_Admin`, `U_Test Report` | `U_*` actor: **25 dòng** + header; ID dạng `UTC-BUY-001` … `UTC-ADM-025` |

Cột chi tiết (Functional / Unit) và cách điền: xem **§3.1** trong `SWT301_TESTING_GUIDE.md`.

## Sau khi sinh file

- Điền **Description / Procedure / Expected** theo môn học hoặc bảng tra cứu §3.3 trong guide.
- Giữ **Defect ID** trong sheet Unit khớp **DEF-SWT-*** khi Fail — đồng bộ với [export DefectList](./SWT301_TESTING_GUIDE.md#5-xuất-defectlistxlsx-lab-4).

---

*Nguồn script: `scripts/generate-swt301-testcase-workbook.mjs` — cập nhật 2026-03-26.*
