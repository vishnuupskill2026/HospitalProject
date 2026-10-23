package com.homeoclinic.clinic.security;

import com.homeoclinic.clinic.domain.UserAccount;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long tokenMinutes;

    public JwtService(@Value("${clinic.security.jwt-secret}") String secret,
                      @Value("${clinic.security.access-token-minutes}") long tokenMinutes) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.tokenMinutes = tokenMinutes;
    }

    public String issue(UserAccount user) {
        Instant now = Instant.now();
        return Jwts.builder().subject(user.getEmail()).claim("role", user.getRole().name()).claim("admin", user.isAdmin())
                .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(tokenMinutes * 60)))
                .signWith(key).compact();
    }

    public long expiresInSeconds() { return tokenMinutes * 60; }

    public String subject(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }
}