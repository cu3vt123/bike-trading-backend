# SWT301 — Testing (`docs/testing/`)

Thư mục dùng cho **file Excel / screenshot nộp bài** (thường **không** commit) và **hướng dẫn** trong repo.

---

## Bạn nên đọc file nào?

| Mục đích | File | Ghi chú |
|----------|------|---------|
| **Chuẩn bị báo cáo / bảo vệ / nộp SWT301** | [**SWT301_TESTING_GUIDE.md**](./SWT301_TESTING_GUIDE.md) | **Một file đủ dài** — môi trường, walkthrough theo vai, workbook 200 TC, defect DEF-SWT, xuất DefectList, **mục thuyết trình** (thao tác + lời nói mẫu). |
| **Sinh workbook Excel 200 TC (khung sheet + mã TC/UTC)** | [TESTCASE-WORKBOOK.md](./TESTCASE-WORKBOOK.md) | `npm run generate:testcase-workbook` → `SWT301_TestCase_Functional_and_Unit_Combined.xlsx` (local). |
| **Chạy dự án để test** | [README.md](../../README.md) | Cài Node, `.env`, `npm run dev`, tài khoản test BE. |
| **Tra API / role khi viết test case** | [../QUICK-REFERENCE.md](../QUICK-REFERENCE.md) | Routes, endpoint, thuật ngữ. |

**Trang README này:** mục lục + lệnh nhanh + quy ước file — **không** thay cho kịch bản đầy đủ trong `SWT301_TESTING_GUIDE.md`.

**Nhánh làm việc:** khuyến nghị `demo` (hoặc nhánh team thống nhất).

---

## Quy trình gợi ý (từng bước)

1. **Cài và chạy** FE (+ BE nếu test tích hợp) theo [README.md](../../README.md).
2. **Đọc** [SWT301_TESTING_GUIDE.md](./SWT301_TESTING_GUIDE.md) từ đầu — đặc biệt phần môi trường và phân vai.
3. Mở workbook **`SWT301_TestCase_Functional_and_Unit_Combined.xlsx`** (hoặc bản team) — chạy từng TC, ghi kết quả Pass/Fail.
4. Khi có lỗi: ghi **Defect ID** (theo quy ước DEF-SWT trong guide), mô tả bước tái hiện, severity.
5. **Export DefectList** (nếu dùng script repo):

   ```bash
   node scripts/export-defectlist-xlsx.mjs
   ```

6. Chuẩn bị **screenshot / evidence** vào thư mục local (có thể ignore Git).

---

## File thường gặp

| File | Ghi chú |
|------|---------|
| `SWT301_TestCase_Functional_and_Unit_Combined.xlsx` | 100 TC chức năng + 100 UTC (4 actor × 25) — tên có thể biến thể theo lớp |
| `DefectList.xlsx` | Sinh bằng `node scripts/export-defectlist-xlsx.mjs` |
| `generated/`, `screenshots/`, `evidence/` | Chỉ local, có thể ignore |

Các **`.xlsx` / `.csv` / `.har` / ảnh** trong `docs/testing/` có thể bị **`.gitignore`** ở root repo; **file `.md` hướng dẫn** được track.

---

## Lệnh nhanh

```bash
npm install && npm run dev
```

```bash
npm run export:defectlist
```

```bash
npm run generate:testcase-workbook
```

---

## Liên kết ngoài thư mục

| Tài liệu | Mục đích |
|----------|----------|
| [../QUICK-REFERENCE.md](../QUICK-REFERENCE.md) | API, role, routes |
| [../CHANGELOG.md](../CHANGELOG.md) | Lịch sử thay đổi |
| [../../README.md](../../README.md) | Chạy dự án đầy đủ |

---

*Cập nhật: `npm run export:defectlist`, `npm run generate:testcase-workbook`; TESTCASE-WORKBOOK.md.*

