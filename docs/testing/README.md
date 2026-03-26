# SWT301 — Testing (`docs/testing/`)

Thư mục dùng cho **file Excel / screenshot nộp bài** (thường **không** commit) và **hướng dẫn** trong repo.

**Toàn bộ hướng dẫn demo & testing (1 file):** [**SWT301_TESTING_GUIDE.md**](./SWT301_TESTING_GUIDE.md) — môi trường, walkthrough theo vai, workbook `SWT301_TestCase_Functional_and_Unit_Combined.xlsx` (200 TC), defect DEF-SWT, script `export-defectlist-xlsx.mjs`.

**Nhánh làm việc:** khuyến nghị `demo`.

---

## File thường gặp

| File | Ghi chú |
|------|---------|
| `SWT301_TestCase_Functional_and_Unit_Combined.xlsx` | 100 TC chức năng + 100 UTC (4 actor × 25) |
| `DefectList.xlsx` | Sinh bằng `node scripts/export-defectlist-xlsx.mjs` |
| `generated/`, `screenshots/`, `evidence/` | Chỉ local, có thể ignore |

Các **`.xlsx` / `.csv` / `.har` / ảnh** trong `docs/testing/` được liệt kê trong `.gitignore` ở root repo; **file `.md` hướng dẫn** được track.

---

## Lệnh nhanh

```bash
npm install && npm run dev
```

```bash
node scripts/export-defectlist-xlsx.mjs
```

---

## Liên kết ngoài thư mục

| Tài liệu | Mục đích |
|----------|----------|
| [../QUICK-REFERENCE.md](../QUICK-REFERENCE.md) | API, role, routes |
| [../CHANGELOG.md](../CHANGELOG.md) | Lịch sử thay đổi |
| [../../README.md](../../README.md) | Chạy dự án |
