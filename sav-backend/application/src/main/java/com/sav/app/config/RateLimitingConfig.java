package com.sav.app.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class RateLimitingConfig implements WebMvcConfigurer {

    @Bean
    public RateLimitingInterceptor rateLimitingInterceptor() {
        return new RateLimitingInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitingInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/actuator/**", "/api/debug/**");
    }

    public static class RateLimitingInterceptor implements org.springframework.web.servlet.HandlerInterceptor {
        
        private final ConcurrentHashMap<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();
        private static final int MAX_REQUESTS = 100;
        private static final long WINDOW_SIZE = 60_000;
        private static final long CLEANUP_INTERVAL = 300_000; // 5 minutes
        private volatile long lastCleanup = System.currentTimeMillis();

        @Override
        public boolean preHandle(jakarta.servlet.http.HttpServletRequest request, 
                               jakarta.servlet.http.HttpServletResponse response, 
                               Object handler) throws Exception {
            
            // Cleanup old entries periodically to prevent memory leak
            cleanupOldEntries();
            
            String clientId = getClientId(request);
            RateLimitInfo rateLimitInfo = rateLimitMap.computeIfAbsent(clientId, 
                k -> new RateLimitInfo(System.currentTimeMillis(), new AtomicInteger(0)));

            long currentTime = System.currentTimeMillis();
            
            if (currentTime - rateLimitInfo.getWindowStart() > WINDOW_SIZE) {
                rateLimitInfo.setWindowStart(currentTime);
                rateLimitInfo.getRequestCount().set(0);
            }

            if (rateLimitInfo.getRequestCount().get() >= MAX_REQUESTS) {
                response.setStatus(429); // Too Many Requests
                response.setHeader("Retry-After", "60");
                response.getWriter().write("{\"error\":\"Rate limit exceeded. Please try again later.\"}");
                return false;
            }

            rateLimitInfo.getRequestCount().incrementAndGet();
            return true;
        }

        private String getClientId(jakarta.servlet.http.HttpServletRequest request) {
            // In production, use a more sophisticated client identification
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }

        /**
         * Clean up old rate limit entries to prevent memory leak
         */
        private void cleanupOldEntries() {
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastCleanup > CLEANUP_INTERVAL) {
                synchronized (this) {
                    if (currentTime - lastCleanup > CLEANUP_INTERVAL) {
                        rateLimitMap.entrySet().removeIf(entry -> 
                            currentTime - entry.getValue().getWindowStart() > WINDOW_SIZE * 2);
                        lastCleanup = currentTime;
                    }
                }
            }
        }

        @Getter
        private static class RateLimitInfo {

            @Setter
            private long windowStart;
            private final AtomicInteger requestCount;

            public RateLimitInfo(long windowStart, AtomicInteger requestCount) {
                this.windowStart = windowStart;
                this.requestCount = requestCount;
            }

        }
    }
}
