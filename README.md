# ShopBike Frontend

React + Vite frontend cho **Bike Trading** – mua bán xe đạp thể thao cũ.

---

## Chạy nhanh

```bash
copy .env.example .env
npm install
npm run dev
```

Mở `http://localhost:5173`.

---

## Cấu trúc (feature-based)

```
src/
├── app/          # Router, providers
├── features/     # auth, landing, bikes, buyer, seller, inspector, support
├── shared/       # components, layouts, constants
└── lib/          # env, apiClient, utils
```

Chi tiết: `docs/STRUCTURE.md`

---

## Chế độ chạy

| Chế độ | VITE_USE_MOCK_API | Cần Backend? |
|--------|-------------------|--------------|
| Mock | `true` | ❌ Không |
| API thật | `false` | ✅ Có |

---

## Tài liệu

| File | Nội dung |
|------|----------|
| `docs/STRUCTURE.md` | Cấu trúc, quy ước import |
| `docs/HUONG-DAN-BACKEND.md` | Contract API |
| `docs/API-SETUP.md` | Kết nối Backend |
| `docs/HUONG-DAN-DEMO.md` | Demo |
| `docs/FLOWS-AND-PROGRESS.md` | Luồng nghiệp vụ |
| `docs/CHANGELOG.md` | Lịch sử thay đổi |
