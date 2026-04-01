# Gợi ý tài liệu đính kèm cho AI — Frontend & QA (repo front-only)

Tài liệu này giúp **dev frontend** và **QA** chọn file `.md` nên dán kèm khi nhờ AI (Gemini, ChatGPT, Claude, …). **Mã backend Java** không nằm trong repo này — làm việc trên nhánh **`Bespring`** (xem [BACKEND-BESPRING-CHAY-API.md](./BACKEND-BESPRING-CHAY-API.md)).

**Mục lục docs:** [docs/README.md](README.md).

---

## 0. Bối cảnh chung — copy vào đầu mọi cuộc hội thoại

```text
Dự án: ShopBike — repo front-only (React + Vite + TypeScript).
- Frontend: src/app/, src/pages/, src/apis/, ... — dev server thường http://localhost:5173.
- API Spring Boot không có trong repo này: nhánh Bespring trên bike-trading-backend (clone/worktree riêng), thường http://localhost:8081/api.
- File .env ở root FE: VITE_API_BASE_URL, VITE_USE_MOCK_API — sau khi sửa .env phải restart npm run dev.
- Chi tiết nối BE: docs/BACKEND-BESPRING-CHAY-API.md.
```

| Vai | Thêm một dòng |
|-----|----------------|
| **Frontend** | `Tôi là dev frontend — ưu tiên apis/, services/, TanStack Query và FE-ARCHITECTURE-V1-VS-V2.` |
| **QA** | `Tôi là QA — ưu tiên QUICK-REFERENCE, FRONTEND-API-FLOWS, FE-ARCHITECTURE (phụ lục kiểm tra) để map màn ↔ API.` |

**Dev backend (Java):** không dùng gói file trong repo FE; mở repo nhánh **Bespring** và README/`docs/` ở đó.

---

## Phần B — Frontend (React / Vite)

### B.1. Gói tiêu chuẩn (thứ tự)

| Thứ tự | File | Vì sao |
|--------|------|--------|
| 1 | [README.md](../README.md) — setup, `.env`, Phần B Frontend | Mock vs API thật. |
| 2 | [FRONTEND-DEVELOPER-GUIDE.md](FRONTEND-DEVELOPER-GUIDE.md) | Tổng hợp một file cho FE. |
| 3 | [STRUCTURE.md](STRUCTURE.md) | Cây `src/`, `queryKeys`. |
| 4 | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Route, role, API path. |
| 5 | [FE-ARCHITECTURE-V1-VS-V2.md](FE-ARCHITECTURE-V1-VS-V2.md) | Query, invalidate. |
| 6 | [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) | Luồng request trong code. |

### B.2. Thêm theo việc

| Việc | Thêm file |
|------|-----------|
| Kiểm tra sau mutation / nhiều màn | [FE-ARCHITECTURE — Phụ lục kiểm tra](FE-ARCHITECTURE-V1-VS-V2.md#phu-luc-kiem-tra-luong-api) |
| Ship / release | [PRODUCTION-HARDENING.md](PRODUCTION-HARDENING.md) |
| Nghiệp vụ / copy UI | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) (mục liên quan) |
| Tổng quan sản phẩm | [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) |

### B.3. Mẫu prompt (frontend)

```text
[Khối mục 0 + dòng vai Frontend]

Đính kèm: FRONTEND-DEVELOPER-GUIDE, QUICK-REFERENCE, FE-ARCHITECTURE-V1-VS-V2 (hoặc FRONTEND-API-FLOWS nếu hỏi luồng file).

Ràng buộc: path API khớp QUICK-REFERENCE; không đổi env sang mock nếu đang debug API thật.
```

---

## Phần C — QA / Kiểm thử

### C.1. Gói tiêu chuẩn

| Thứ tự | File |
|--------|------|
| 1 | [README.md](../README.md) — chạy FE + [BACKEND-BESPRING-CHAY-API.md](BACKEND-BESPRING-CHAY-API.md) nếu cần API |
| 2 | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) |
| 3 | [FRONTEND-API-FLOWS.md](FRONTEND-API-FLOWS.md) — map màn ↔ endpoint |
| 4 | [FE-ARCHITECTURE — Phụ lục kiểm tra](FE-ARCHITECTURE-V1-VS-V2.md#phu-luc-kiem-tra-luong-api) |
| 5 | [business-rules/BUSINESS-RULES.md](business-rules/BUSINESS-RULES.md) khi cần expected theo rule |

### C.2. Mẫu prompt (QA)

```text
[Khối mục 0 + dòng vai QA]

Đính kèm: QUICK-REFERENCE, FRONTEND-API-FLOWS, FE-ARCHITECTURE (phụ lục kiểm tra).

Ràng buộc: route và API phải trích dẫn được từ QUICK-REFERENCE; nghiệp vụ từ BUSINESS-RULES nếu có.
```

---

## Phần D — Tóm tắt một trang

| Vai | Gói tối thiểu |
|-----|----------------|
| **Frontend** | README (env + B) → FRONTEND-DEVELOPER-GUIDE → STRUCTURE → QUICK-REFERENCE → FE-ARCHITECTURE → FRONTEND-API-FLOWS |
| **QA** | README → BACKEND-BESPRING (nếu E2E API) → QUICK-REFERENCE → FRONTEND-API-FLOWS → FE-ARCHITECTURE (phụ lục) |

---

## Phần E — Lỗi prompt thường gặp

| Lỗi | Cách sửa |
|-----|----------|
| AI bịa cổng / URL | Dán khối mục 0 + nội dung `.env.example`. |
| AI bịa API không có trên FE | Đính kèm **QUICK-REFERENCE**. |
| AI sửa FE làm hỏng cache | Đính kèm **FE-ARCHITECTURE-V1-VS-V2** + `queryKeys`. |

---

*Cập nhật cho repo front-only: gỡ tài liệu BE chi tiết; dev backend dùng repo nhánh Bespring.*
