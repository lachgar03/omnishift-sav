package com.sav.app.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "SAV Backend API",
        description = "Modular monolith Spring Boot application for ticket management system",
        version = "1.0.0",
        contact = @Contact(
            name = "SAV Team",
            email = "support@sav.com",
            url = "https://sav.com"
        ),
        license = @License(
            name = "MIT License",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT token obtained from Keycloak"
)
public class OpenApiConfig {
    // OpenAPI configuration is handled by annotations above
    // The swagger-ui will be available at /swagger-ui.html
    // API documentation will be available at /v3/api-docs
}
