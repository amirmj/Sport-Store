package com.amirmj.store.auth;

import com.amirmj.store.users.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@AllArgsConstructor
@Service
public class JwtService {
    private final JwtConfig jwtConfig;

    public Jwt getAccessToken(User user) {
        return getToken(user, jwtConfig.getAccessTokenExpiration());
    }

    public Jwt getRefreshToken(User user) {
        return getToken(user, jwtConfig.getRefreshTokenExpiration());
    }

    public Jwt parse(String token) {
        try {
            Claims claims = getClaims(token);
            return new Jwt(claims, jwtConfig.getSecretKey());
        } catch (JwtException e) {
            return null;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(jwtConfig.getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    private Jwt getToken(User user, long tokenExpirationInSeconds) {
        Instant expirationInstant = Instant.now().plusSeconds(tokenExpirationInSeconds);

        Claims claims = Jwts.claims()
                .subject(user.getId().toString())
                .add("name", user.getName())
                .add("email", user.getEmail())
                .add("role", user.getRole())
                .issuedAt(new Date())
                .expiration(Date.from(expirationInstant))
                .build();

        return new Jwt(claims, jwtConfig.getSecretKey());
    }
}
