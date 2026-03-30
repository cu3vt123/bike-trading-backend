package com.minhyun.quydu_be.service;

import java.util.List;
import java.util.Map;

public interface BikeService {

    List<Map<String, Object>> listBikes();

    Map<String, Object> getBikeById(Long id);
}
