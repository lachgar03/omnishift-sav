package com.sav.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
        "com.sav"
})
@EntityScan(basePackages = {
        "com.sav.ticket.domain.entity",
        "com.sav.user.domain.entity"
})
@EnableJpaRepositories(basePackages = {
        "com.sav.ticket.infrastructure.repository",
        "com.sav.user.infrastructure.repository"
})
public class SavApplication {
    public static void main(String[] args) {
        SpringApplication.run(SavApplication.class, args);
    }
}