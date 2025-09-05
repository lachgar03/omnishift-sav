package com.sav.ticket.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
public class DebugController {

    /**
     * Debug endpoint to check JWT token contents
     */
    @GetMapping("/token-info")
    public ResponseEntity<Map<String, Object>> getTokenInfo(Authentication authentication) {
        Map<String, Object> tokenInfo = new HashMap<>();

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            var jwt = jwtAuth.getToken();

            tokenInfo.put("authenticated", authentication.isAuthenticated());
            tokenInfo.put("authorities", authentication.getAuthorities());
            tokenInfo.put("principal", authentication.getPrincipal());

            // JWT Claims
            tokenInfo.put("subject", jwt.getSubject());
            tokenInfo.put("issuer", jwt.getIssuer());
            tokenInfo.put("audience", jwt.getAudience());
            tokenInfo.put("issuedAt", jwt.getIssuedAt());
            tokenInfo.put("expiresAt", jwt.getExpiresAt());

            // All claims
            tokenInfo.put("allClaims", jwt.getClaims());

            // Specific claims we care about
            tokenInfo.put("preferred_username", jwt.getClaimAsString("preferred_username"));
            tokenInfo.put("email", jwt.getClaimAsString("email"));
            tokenInfo.put("realm_access", jwt.getClaimAsMap("realm_access"));
            tokenInfo.put("resource_access", jwt.getClaimAsMap("resource_access"));

        } else {
            tokenInfo.put("error", "Not a JWT authentication");
            tokenInfo.put("authType", authentication.getClass().getSimpleName());
        }

        return ResponseEntity.ok(tokenInfo);
    }
}