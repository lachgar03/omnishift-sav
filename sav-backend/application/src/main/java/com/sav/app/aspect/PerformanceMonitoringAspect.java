package com.sav.app.aspect;

import com.sav.app.service.MetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class PerformanceMonitoringAspect {

    private final MetricsService metricsService;

    @Around("execution(* com.sav.ticket.domain.service.*.*(..))")
    public Object monitorTicketServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return monitorMethodExecution(joinPoint, "ticket_service");
    }

    @Around("execution(* com.sav.user.domain.service.*.*(..))")
    public Object monitorUserServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return monitorMethodExecution(joinPoint, "user_service");
    }

    @Around("execution(* com.sav.ticket.api.controller.*.*(..))")
    public Object monitorTicketControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return monitorMethodExecution(joinPoint, "ticket_controller");
    }

    @Around("execution(* com.sav.user.api.controller.*.*(..))")
    public Object monitorUserControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return monitorMethodExecution(joinPoint, "user_controller");
    }

    private Object monitorMethodExecution(ProceedingJoinPoint joinPoint, String serviceType) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String operation = className + "." + methodName;

        Instant start = Instant.now();
        
        try {
            Object result = joinPoint.proceed();
            Duration duration = Duration.between(start, Instant.now());
            
            // Record successful execution
            metricsService.recordTicketProcessingTime(operation, duration);
            
            log.debug("Method {} executed successfully in {}ms", operation, duration.toMillis());
            return result;
            
        } catch (Exception e) {
            Duration duration = Duration.between(start, Instant.now());
            
            // Record failed execution
            metricsService.incrementApiError(serviceType, operation, e.getClass().getSimpleName());
            
            log.warn("Method {} failed after {}ms with error: {}", operation, duration.toMillis(), e.getMessage());
            throw e;
        }
    }
}
