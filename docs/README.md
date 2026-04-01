# Tài liệu dự án ShopBike (Frontend)

Repo nhánh **`front-only`**: chỉ **React + Vite**. **[README.md](../README.md)** ở gốc repo: cài đặt, `.env`, chạy `npm run dev`.

**Cần chạy API thật:** [BACKEND-BESPRING-CHAY-API.md](./BACKEND-BESPRING-CHAY-API.md) — lấy nhánh **`Bespring`**, worktree/clone riêng, nối `VITE_API_BASE_URL`.

**Mới học FE / lộ trình từ đầu đến cuối:** [fe-hoc-tu-dau/README.md](./fe-hoc-tu-dau/README.md).

---

## Đọc nhanh

| Nhu cầu | File |
|---------|------|
| Học FE & repo từ nền tảng web tới `src/` (00–09) | [fe-hoc-tu-dau/README.md](./fe-hoc-tu-dau/README.md) |
| Hướng dẫn FE một file | [FRONTEND-DEVELOPER-GUIDE.md](./FRONTEND-DEVELOPER-GUIDE.md) |
| API, route, role, env | [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) |
| Luồng axios → apis → services | [FRONTEND-API-FLOWS.md](./FRONTEND-API-FLOWS.md) |
| TanStack Query, invalidate | [FE-ARCHITECTURE-V1-VS-V2.md](./FE-ARCHITECTURE-V1-VS-V2.md) |
| Cây `src/`, quy ước | [STRUCTURE.md](./STRUCTURE.md) |
| Tổng quan sản phẩm | [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) |
| Business rules | [business-rules/BUSINESS-RULES.md](./business-rules/BUSINESS-RULES.md) |
| VNPay (luồng thanh toán FE ↔ BE) | [PAYMENTS-VNPAY.md](./PAYMENTS-VNPAY.md) |
| Trước production | [PRODUCTION-HARDENING.md](./PRODUCTION-HARDENING.md) |
| Gợi ý tài liệu cho AI (FE / QA) | [AI-CONTEXT-for-TEAM.md](./AI-CONTEXT-for-TEAM.md) |
| Lịch sử ghi nhận trong docs | [CHANGELOG.md](./CHANGELOG.md) |

---

## FAQ ngắn

| Câu hỏi | Trả lời |
|---------|---------|
| Backend nằm đâu? | Nhánh **`Bespring`** trên [bike-trading-backend](https://github.com/cu3vt123/bike-trading-backend/tree/Bespring), không nằm trong thư mục FE. |
| Mock không cần API? | `VITE_USE_MOCK_API=true` — xem README gốc. |

---

*Mục lục đã rút gọn cho repo front-only; schema/SQL chi tiết xem trong repo nhánh Bespring nếu cần.*
