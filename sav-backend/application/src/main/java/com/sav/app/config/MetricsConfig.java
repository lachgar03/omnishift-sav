package com.sav.app.config;

import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {

    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }

    @Bean
    public Counter ticketCreatedCounter(MeterRegistry registry) {
        return Counter.builder("tickets.created")
                .description("Number of tickets created")
                .register(registry);
    }

    @Bean
    public Counter ticketAssignedCounter(MeterRegistry registry) {
        return Counter.builder("tickets.assigned")
                .description("Number of tickets assigned")
                .register(registry);
    }

    @Bean
    public Counter ticketStatusChangedCounter(MeterRegistry registry) {
        return Counter.builder("tickets.status_changed")
                .description("Number of ticket status changes")
                .register(registry);
    }

    @Bean
    public Counter userCreatedCounter(MeterRegistry registry) {
        return Counter.builder("users.created")
                .description("Number of users created")
                .register(registry);
    }

    @Bean
    public Timer ticketProcessingTimer(MeterRegistry registry) {
        return Timer.builder("tickets.processing_time")
                .description("Time taken to process ticket operations")
                .register(registry);
    }

    @Bean
    public Timer userProcessingTimer(MeterRegistry registry) {
        return Timer.builder("users.processing_time")
                .description("Time taken to process user operations")
                .register(registry);
    }

    @Bean
    public Counter apiRequestCounter(MeterRegistry registry) {
        return Counter.builder("api.requests")
                .description("Number of API requests")
                .register(registry);
    }

    @Bean
    public Counter apiErrorCounter(MeterRegistry registry) {
        return Counter.builder("api.errors")
                .description("Number of API errors")
                .register(registry);
    }
}
