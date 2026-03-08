# Skeleton Spring Boot cho ShopBike Backend (dành cho team Java)

> Mục tiêu: cung cấp **khung dự án Spring Boot** và cấu trúc gợi ý để team Java import vào IntelliJ / IDE bất kỳ, rồi implement logic theo các tài liệu sau:
>
> - `docs/HUONG-DAN-BACKEND.md` – contract FE–BE (request/response, enum…)
> - `docs/backend/PORTING-NODE-TO-SPRING-BOOT.md` – mapping model + API

---

## 1. Tạo project Spring Boot

Sử dụng Spring Initializr (`https://start.spring.io/`) hoặc IntelliJ:

- **Project**: Maven
- **Language**: Java
- **Spring Boot**: 3.x
- **Group**: `com.shopbike`
- **Artifact**: `shopbike-backend-spring`
- **Package name**: `com.shopbike.backend`

### Dependencies cần chọn

- `Spring Web`
- `Spring Security`
- `Spring Data JPA`
- `H2 Database` (demo in-memory; sau này có thể đổi sang MySQL/Postgres)
- `springdoc-openapi-starter-webmvc-ui` (Swagger UI) – thêm sau trong `pom.xml`.

Ví dụ `pom.xml` (rút gọn, chỉ phần dependencies chính):

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Swagger / OpenAPI -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>
</dependencies>
```

---

## 2. Cấu hình application.properties

Đảm bảo backend Spring Boot xuất hiện đúng base URL mà FE mong đợi.

### Cấu hình đơn giản (dùng context-path `/api`)

```properties
server.port=8081
server.servlet.context-path=/api

spring.datasource.url=jdbc:h2:mem:shopbike
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

Khi đó, các endpoint sẽ có dạng:

- `http://localhost:8081/api/auth/login`
- `http://localhost:8081/api/bikes`
- … khớp với FE.

> Lưu ý: FE chỉ cần base URL `http://localhost:8081/api` (set trong `.env` của FE).

---

## 3. Gợi ý cấu trúc package Spring Boot

```text
com.shopbike.backend
├── ShopbikeBackendApplication.java        # class main
├── config/
│   ├── SecurityConfig.java               # cấu hình Spring Security + JWT
│   └── CorsConfig.java                   # cấu hình CORS cho FE
├── auth/
│   ├── controller/AuthController.java
│   ├── dto/LoginRequest.java
│   ├── dto/SignupRequest.java
│   ├── dto/AuthResponse.java
│   ├── model/User.java
│   ├── model/UserRole.java
│   ├── repository/UserRepository.java
│   └── service/AuthService.java
├── bikes/
│   ├── controller/BikeController.java
│   ├── dto/BikeResponse.java
│   ├── model/Listing.java
│   ├── model/ListingState.java
│   ├── model/ListingCondition.java
│   ├── repository/ListingRepository.java
│   └── service/BikeService.java
├── buyer/
│   ├── controller/BuyerController.java
│   ├── dto/CreateOrderRequest.java
│   ├── dto/OrderResponse.java
│   ├── model/Order.java
│   ├── model/OrderStatus.java
│   ├── repository/OrderRepository.java
│   └── service/BuyerService.java
├── seller/
│   ├── controller/SellerController.java
│   └── service/SellerService.java
├── inspector/
│   ├── controller/InspectorController.java
│   └── service/InspectorService.java
└── common/
    ├── exception/ApiException.java
    ├── exception/GlobalExceptionHandler.java
    ├── security/JwtAuthenticationFilter.java
    └── security/CurrentUser.java          # tiện ích lấy user hiện tại
```

Đây chỉ là gợi ý; team có thể điều chỉnh tên package cho phù hợp, miễn là API contract giữ nguyên.

---

## 4. Controller skeleton (ví dụ)

### 4.1 AuthController

```java
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal UserPrincipal user) {
        UserProfileResponse profile = authService.getProfile(user);
        return ResponseEntity.ok(profile);
    }
}
```

### 4.2 BikeController

```java
@RestController
@RequestMapping("/bikes")
public class BikeController {

    private final BikeService bikeService;

    public BikeController(BikeService bikeService) {
        this.bikeService = bikeService;
    }

    @GetMapping
    public ResponseEntity<List<BikeResponse>> getBikes() {
        return ResponseEntity.ok(bikeService.getPublishedApprovedBikes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BikeResponse> getBike(@PathVariable String id) {
        return ResponseEntity.ok(bikeService.getBikeById(id));
    }
}
```

### 4.3 Seller & Inspector (chỉ skeleton)

```java
@RestController
@RequestMapping("/seller")
@PreAuthorize("hasRole('SELLER')")
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @GetMapping("/listings")
    public ResponseEntity<List<BikeResponse>> getMyListings(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(sellerService.getListingsForSeller(user.getId()));
    }

    @PostMapping("/listings")
    public ResponseEntity<BikeResponse> createListing(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody CreateListingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sellerService.createListing(user.getId(), request));
    }

    @PutMapping("/listings/{id}/submit")
    public ResponseEntity<Void> submitForInspection(@PathVariable String id,
                                                    @AuthenticationPrincipal UserPrincipal user) {
        sellerService.submitForInspection(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
```

```java
@RestController
@RequestMapping("/inspector")
@PreAuthorize("hasRole('INSPECTOR') or hasRole('ADMIN')")
public class InspectorController {

    private final InspectorService inspectorService;

    public InspectorController(InspectorService inspectorService) {
        this.inspectorService = inspectorService;
    }

    @GetMapping("/pending-listings")
    public ResponseEntity<List<BikeResponse>> getPendingListings() {
        return ResponseEntity.ok(inspectorService.getPendingListings());
    }

    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable String id,
                                        @RequestBody InspectionDecisionRequest request) {
        inspectorService.approve(id, request);
        return ResponseEntity.noContent().build();
    }

    // Tương tự cho reject, need-update
}
```

---

## 5. Gợi ý cấu hình Security tối thiểu

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtFilter) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/bikes/**").permitAll()
                .requestMatchers("/buyer/**").hasRole("BUYER")
                .requestMatchers("/seller/**").hasRole("SELLER")
                .requestMatchers("/inspector/**").hasAnyRole("INSPECTOR", "ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

JWT filter có thể tạm thời **giả lập** (nhận token fake, load user từ DB) để demo nhanh, sau đó mới làm chuẩn.

---

## 6. Cách chạy Spring Boot backend cùng với FE hiện tại

1. Chạy Spring Boot (port `8081`, context-path `/api`):
   - Từ IDE (Run `ShopbikeBackendApplication`)
   - Hoặc `mvn spring-boot:run`

2. Chỉnh `.env` của frontend (trong thư mục gốc FE):

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK_API=false
```

3. Chạy FE:

```bash
cd /c/SWP/frontend
npm install
npm run dev
```

4. Mở trình duyệt tại `http://localhost:5173` và test toàn bộ luồng:
   - Trang chủ, chi tiết xe → `/api/bikes`, `/api/bikes/{id}`
   - Login → `/api/auth/login`
   - Seller dashboard → `/api/seller/...`
   - Inspector dashboard → `/api/inspector/...`
   - Checkout → `/api/buyer/...`

Chỉ cần Spring Boot tuân theo contract trong `docs/HUONG-DAN-BACKEND.md`, FE sẽ hoạt động bình thường mà không cần sửa code.
