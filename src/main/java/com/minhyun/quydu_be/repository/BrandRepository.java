package com.minhyun.quydu_be.repository;

import com.minhyun.quydu_be.entity.Brand;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepository extends BaseRepository<Brand, Long> {

    List<Brand> findByActiveTrueOrderByNameAsc();

    List<Brand> findAllByOrderByNameAsc();

    Optional<Brand> findByNameIgnoreCase(String name);
}
