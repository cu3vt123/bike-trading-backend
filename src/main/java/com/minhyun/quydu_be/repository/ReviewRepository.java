package com.minhyun.quydu_be.repository;

import com.minhyun.quydu_be.entity.Review;
import com.minhyun.quydu_be.entity.User;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends BaseRepository<Review, Long> {
    List<Review> findByBuyerOrderByCreatedAtDesc(User buyer);
    List<Review> findAllByOrderByCreatedAtDesc();
}
