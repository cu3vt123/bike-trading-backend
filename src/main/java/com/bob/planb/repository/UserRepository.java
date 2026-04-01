package com.bob.planb.repository;

import com.bob.planb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm kiếm user bằng email (Dùng cho đăng nhập)
    Optional<User> findByEmail(String email);

    // Kiểm tra email đã tồn tại chưa (Dùng cho đăng ký - Sửa lỗi bạn đang gặp)
    Boolean existsByEmail(String email);
}