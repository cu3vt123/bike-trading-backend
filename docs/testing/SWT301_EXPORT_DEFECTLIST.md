# SWT301 — Xuất DefectList.xlsx (Lab 4)

Hướng dẫn **chạy script**, **vị trí file output**, **ý nghĩa cột**, và **chỉnh sửa** trước khi nộp (khi không dùng MantisBT).

---

## 1. Yêu cầu

- **Node.js** (phiên bản tương thích project — xem `package.json` / CI nếu có).  
- Đã **`npm install`** ở thư mục gốc frontend (package **`xlsx`** nằm trong `devDependencies`).

---

## 2. Lệnh sinh file

Từ **thư mục gốc** repository frontend (cùng cấp với `package.json`):

```bash
node scripts/export-defectlist-xlsx.mjs
```

**Output:**

- Đường dẫn: **`docs/testing/DefectList.xlsx`**
- Thư mục `docs/testing/` được tạo tự động nếu chưa có.

**Khi chạy thành công**, terminal in dạng:

```text
Written: .../docs/testing/DefectList.xlsx (7 defects)
```

---

## 3. Nguồn dữ liệu

Toàn bộ **7 hàng defect** được định nghĩa **trực tiếp trong code** tại:

- **`scripts/export-defectlist-xlsx.mjs`** — mảng `rows` (mỗi phần tử là một mảng ô theo thứ tự cột).

**Sửa nội dung defect (title, steps, root cause, ngày, v.v.):**

1. Mở `scripts/export-defectlist-xlsx.mjs`.  
2. Chỉnh chuỗi trong `rows`.  
3. Chạy lại lệnh ở mục 2.  
4. Commit file `.mjs` nếu team muốn đồng bộ mô tả defect trên Git — **file `.xlsx` có thể không commit** (xem `.gitignore`).

---

## 4. Cột trong sheet (thứ tự)

Khớp biến `header` trong script:

| Thứ tự | Tên cột | Gợi ý điền |
|--------|---------|------------|
| 1 | Defect ID | DEF-SWT-001 … |
| 2 | Title | Một dòng mô tả lỗi |
| 3 | Severity | Minor / Major / Critical … |
| 4 | Priority | P1, P2, P3 … |
| 5 | Status | Open / Closed / … |
| 6 | Environment | OS, browser, FE port, BE port |
| 7 | Related TC ID | Ví dụ TC-INS-002 |
| 8 | Related Req ID | Mã yêu cầu (nếu có) |
| 9 | Steps to Reproduce | Numbered steps |
| 10 | Expected Result | Hành vi đúng |
| 11 | Actual Result | Hành vi sai (trước fix) hoặc mô tả |
| 12 | Attachments | Tên file HAR/png |
| 13 | Reporter | Tên nhóm / cá nhân |
| 14 | Reported Date | YYYY-MM-DD |
| 15 | Assignee | Có thể để trống |
| 16 | Root Cause | Tóm tắt nguyên nhân + **Đã sửa: …** |

Sheet Excel tên: **`DefectList`** (một sheet).

---

## 5. Trước khi nộp bài

| Việc | Gợi ý |
|------|--------|
| Mở bằng Excel / LibreOffice | Kiểm tra không vỡ font, cột đủ rộng |
| Đồng bộ ngày | Sửa `Reported Date` trong script nếu cần |
| Đính kèm thật | Đặt file HAR/png trong thư mục nộp bài của môn học; tên khớp cột Attachments |
| Khớp với demo | Đối chiếu [SWT301_DEFECTS_AND_EVIDENCE.md](./SWT301_DEFECTS_AND_EVIDENCE.md) |

---

## 6. Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `Cannot find module 'xlsx'` | Chạy `npm install` tại root frontend |
| `ENOENT` thư mục | Script tự `mkdir`; kiểm tra quyền ghi disk |
| File cũ không đổi | Đảm bảo chạy đúng `node scripts/...` từ đúng thư mục; đóng Excel đang mở file đó rồi chạy lại |

---

## 7. Liên kết

- [SWT301_DEFECTS_AND_EVIDENCE.md](./SWT301_DEFECTS_AND_EVIDENCE.md) — ý nghĩa từng DEF-SWT  
- [README.md](./README.md) — mục lục thư mục testing  
