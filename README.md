# Quydu — Spring Boot API

Backend **Spring Boot** (REST, JWT, MySQL, VNPay sandbox). Repository **Java/Maven**; frontend Vite/React là project riêng.

## Tài liệu tham chiếu (nhánh quydu12)

**[bike-trading-backend — quydu12](https://github.com/cu3vt123/bike-trading-backend/tree/quydu12)** — nghiệp vụ, FE, đặc tả API.

| bike-trading-backend (quydu12) | `quydu_be` |
|--------------------------------|------------|
| `BikeTradingBackendApplication` | `com.minhyun.quydu_be.QuyduBeApplication` |
| Cổng API thường **8081** | `server.port=8081` |
| FE: `VITE_API_BASE_URL=.../api` | Cùng convention `/api/...` |
| Swagger | **http://localhost:8081/swagger-ui/index.html** |

## Chạy nhanh

1. **JDK 17**, **MySQL**.
2. Sao chép `src/main/resources/application-local.properties.example` → `application-local.properties` (DB, `app.jwt-secret`).
3. Chạy (profile `local` nếu dùng file trên):

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

4. Health: [http://localhost:8081/api/health](http://localhost:8081/api/health)  
5. Swagger: [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)

## Tài liệu trong repo

| File | Nội dung |
|------|----------|
| [docs/README.md](docs/README.md) | Mục lục |
| [docs/BACKEND-LOCAL-SETUP.md](docs/BACKEND-LOCAL-SETUP.md) | Windows, VS Code, Maven, MySQL |
| [docs/FRONTEND-INTEGRATION.md](docs/FRONTEND-INTEGRATION.md) | `VITE_API_BASE_URL`, CORS |

## Bảo mật

Không commit secret thật. Dùng `application-local.properties` (đã `.gitignore`) hoặc biến môi trường.
