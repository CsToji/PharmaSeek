package services;

import config.JwtConfig;
import entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Date;
@AllArgsConstructor
@Service
public class JwtService {

    private final JwtConfig jwtConfig;

    private String generateToken(User user, long tokenValidity) {
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + tokenValidity))
                .signWith(jwtConfig.getSecretKey())
                .compact();
    }

    public String generateAccessToken(User user) {
        return generateToken(user, jwtConfig.getAccessTokenValidity());
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, jwtConfig.getRefreshTokenValidity());
    }

    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(jwtConfig.getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            return null;
        }
    }
}
