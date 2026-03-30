package com.minhyun.quydu_be.service;

import java.util.List;
import java.util.Map;

public interface BrandService {

    List<Map<String, Object>> listActiveBrands();

    List<Map<String, Object>> adminListBrands();

    Map<String, Object> adminCreateBrand(String name, String slug);

    Map<String, Object> adminUpdateBrand(Long id, String name, String slug, Boolean active);

    Map<String, Object> adminDeleteBrand(Long id);
}
