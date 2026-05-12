package com.amirmj.store.services;

import com.amirmj.store.configs.JwtConfig;
import com.amirmj.store.entities.Role;
import com.amirmj.store.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Map;

@AllArgsConstructor
@Service
public class JwtService {
    private final JwtConfig jwtConfig;

    public String getAccessToken(User user) {
        return getToken(user, jwtConfig.getAccessTokenExpiration());
    }

    public String getRefreshToken(User user) {
        return getToken(user, jwtConfig.getRefreshTokenExpiration());
    }

    private String getToken(User user, long tokenExpirationInSeconds) {
        Instant expirationInstant = Instant.now().plusSeconds(tokenExpirationInSeconds);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claims(Map.of("name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole()))
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(expirationInstant))
                .signWith(jwtConfig.getSecretKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(jwtConfig.getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getIdToken(String token) {
        return Long.valueOf(getClaims(token).getSubject());
    }

    public Role getRoleToken(String token) {
        return Role.valueOf(getClaims(token).get("role", String.class));
    }
}
