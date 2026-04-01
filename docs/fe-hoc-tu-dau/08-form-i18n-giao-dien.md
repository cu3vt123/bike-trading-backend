# 08 — Form, i18n và giao diện (Tailwind / component UI)

Phần này bao quát cách app nhập liệu, hiển thị đa ngôn ngữ, và “dựng” giao diện.

---

## 1. Form: React Hook Form + Zod

Stack trong `package.json`:

- **react-hook-form** — quản lý state form, ít re-render.
- **zod** — schema validate; kết hợp **@hookform/resolvers** để map lỗi vào field.
- File ví dụ schema auth: `src/lib/authSchemas.ts` (có thể tích hợp message i18n).

**Luồng điển hình:**

1. `useForm({ resolver: zodResolver(schema), defaultValues })`
2. `register` hoặc `Controller` gắn input.
3. `handleSubmit(onValid)` gọi mutation API.

Khi BE trả lỗi validation (400), map vào `setError` field tương ứng hoặc hiển thị toast qua `getApiErrorMessage`.

---

## 2. i18n: react-i18next

- Cấu hình khởi tạo: `src/i18n/index.ts` (được import sớm trong `main.tsx`).
- Chuỗi UI: `src/locales/vi.json`, `en.json`.
- Trong component: `const { t } = useTranslation();` rồi `t("key.path")`.

**Quy ước:** key lồng nhau theo feature (`auth.login.title`, …). Khi thêm text mới, **thêm cả hai file** vi/en tránh thiếu ngôn ngữ.

---

## 3. Styling: Tailwind CSS + shadcn-flavoured UI

- **Tailwind:** class utility trên JSX (`className="flex gap-2 ..."`).
- Cấu hình: `tailwind.config.js`, `postcss.config.js`, `src/index.css`.
- Thư mục `src/components/ui/` (và một phần `shared/`) chứa primitive: Button, Input, Dialog, … — thường xây trên **Radix UI** + `class-variance-authority`.

**Khi customize:** ưu tiên sửa component UI một lần để mọi màn đồng bộ.

---

## 4. Thông báo (toast)

**sonner** — dùng cho toast nhỏ (thành công / lỗi). Tìm chỗ gọi `toast.*` trong codebase để bắt chước pattern.

---

## 5. Icon

**lucide-react** — icon dạng component React.

---

## 6. Checklist thêm màn có form

1. Tạo schema Zod (hoặc tái sử dụng).
2. Hook submit → `apis/` / `useMutation`.
3. Mọi text user-facing → `t(...)`.
4. Trạng thái loading / disabled nút khi `mutation.isPending`.

---

**Tiếp theo:** [09-ket-noi-nghiep-vu-va-doc-tiep.md](./09-ket-noi-nghiep-vu-va-doc-tiep.md) — nối kiến thức với luồng đơn hàng và tài liệu sâu.
