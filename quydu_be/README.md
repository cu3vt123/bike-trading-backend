# quydu_be (Spring Boot)

Trong repo **monorepo** này, mã nguồn backend **quydu_be** không nằm trong thư mục này dưới dạng project Maven riêng, mà nằm tại:

- **`src/main/java/com/minhyun/quydu_be/`** — mã Java (controller, service, entity, …)
- **`src/main/resources/`** — `application.properties`, v.v.
- **`src/test/java/com/minhyun/quydu_be/`** — test Spring Boot
- **`docs/quydu_be/`** — tài liệu backend đi kèm

Trên máy local, bạn có thể mở đúng folder `quydu_be` cạnh `FE` trong IntelliJ; sau khi push lên GitHub, cùng một code được theo dõi dưới đường dẫn package ở trên để chạy chung Vite/React ở root repo.
