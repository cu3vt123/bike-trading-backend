package com.bob.planb.repository;

import com.bob.planb.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Dành cho Buyer: Lấy lịch sử mua hàng của một User, sắp xếp đơn mới nhất lên đầu
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    // Dành cho Payment: Tìm kiếm đơn hàng dựa trên mã giao dịch (VD: ORD-123456)
    Optional<Order> findByOrderCode(String orderCode);
    // 3. Dành cho SELLER (THÊM DÒNG NÀY ĐỂ FIX LỖI)
    List<Order> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
}