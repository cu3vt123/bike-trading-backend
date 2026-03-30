package com.minhyun.quydu_be.repository;

import com.minhyun.quydu_be.entity.User;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends BaseRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByResetPasswordToken(String resetPasswordToken);

    java.util.List<User> findByRoleInOrderByCreatedAtDesc(java.util.List<com.minhyun.quydu_be.entity.UserRole> roles);

    java.util.List<User> findByRoleOrderByUpdatedAtDesc(com.minhyun.quydu_be.entity.UserRole role);
}
