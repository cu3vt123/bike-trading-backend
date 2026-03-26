# SWT301 — Mục lục tài liệu demo & testing

Thư mục này gom **hướng dẫn chạy demo**, **checklist**, **đối chiếu defect** (Lab 4) và ghi chú về file **chỉ dùng local** (Excel nộp bài, screenshot).

| Tài liệu | Nội dung |
|----------|----------|
| **[README.md](./README.md)** (trang này) | Mục lục + luồng đọc gợi ý |
| **[SWT301_ENVIRONMENT.md](./SWT301_ENVIRONMENT.md)** | Cài đặt, biến môi trường, cổng, mock vs API thật, lỗi thường gặp |
| **[SWT301_DEMO_WALKTHROUGH.md](./SWT301_DEMO_WALKTHROUGH.md)** | Kịch bản demo theo từng vai (Buyer / Seller / Inspector / Admin) + route thực tế |
| **[SWT301_DEFECTS_AND_EVIDENCE.md](./SWT301_DEFECTS_AND_EVIDENCE.md)** | Bảng DEF-SWT-001…007: TC, route, API, cách chứng minh, gợi ý file đính kèm |
| **[SWT301_EXPORT_DEFECTLIST.md](./SWT301_EXPORT_DEFECTLIST.md)** | Sinh `DefectList.xlsx`, cột Excel, chỉnh sửa trước khi nộp |

**Nhánh Git:** làm việc trên nhánh dự án (khuyến nghị **`demo`**). Không bắt buộc nhánh tên `testing`.

---

## Đọc theo thứ tự nào?

1. **Lần đầu chạy máy:** [SWT301_ENVIRONMENT.md](./SWT301_ENVIRONMENT.md)  
2. **Chuẩn bị demo trước giảng viên:** [SWT301_DEMO_WALKTHROUGH.md](./SWT301_DEMO_WALKTHROUGH.md)  
3. **Nộp Lab defect / đối chiếu slide:** [SWT301_DEFECTS_AND_EVIDENCE.md](./SWT301_DEFECTS_AND_EVIDENCE.md) + [SWT301_EXPORT_DEFECTLIST.md](./SWT301_EXPORT_DEFECTLIST.md)

---

## File local (thường không commit)

Các pattern sau được liệt kê trong **`.gitignore`** ở root repo:

- `DefectList.xlsx`, `*.xlsx` / `*.csv` trong `docs/testing/` (trừ khi dùng `git add -f`)  
- Thư mục `docs/testing/generated/`, `docs/testing/screenshots/`  
- Ảnh `.png` / `.jpg` / … trong `docs/testing/`

**Các file `*.md` trong `docs/testing/` được giữ trong Git** để cả nhóm xem cùng hướng dẫn.

---

## Lệnh tóm tắt (tham chiếu nhanh)

```bash
# Frontend
cd <thư-mục-gốc-repo-frontend>
npm install
npm run dev
```

```bash
# Sinh DefectList.xlsx (output vào docs/testing/)
node scripts/export-defectlist-xlsx.mjs
```

---

## Liên kết repo chính

| File | Mục đích |
|------|----------|
| [../CHANGELOG.md](../CHANGELOG.md) | Lịch sử sửa lỗi / tính năng (inspector API, Security, v.v.) |
| [../QUICK-REFERENCE.md](../QUICK-REFERENCE.md) | Role, API, response chuẩn |
| [../../README.md](../../README.md) | Chạy monorepo / BE + FE (nếu có hướng dẫn) |
| `scripts/export-defectlist-xlsx.mjs` | Nguồn dữ liệu 7 dòng defect khi export Excel |
