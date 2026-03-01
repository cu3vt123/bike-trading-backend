package com.biketrading.backend;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BikeTradingBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BikeTradingBackendApplication.class, args);
    }

    @Bean // Khai báo bean này để BuyerServiceImpl có thể dùng @Autowired
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}