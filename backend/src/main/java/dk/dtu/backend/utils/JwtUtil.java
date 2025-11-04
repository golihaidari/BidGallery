package dk.dtu.backend.utils;

import java.security.Key;
import java.util.Date;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;


public class JwtUtil {

    // -----------------------
    // Secret & Key
    // -----------------------
    private static final String JWT_SECRET = "wR8x!vP9sK2tM4uH1qL5jF3oZ6eN7rY0bG9aD2cS1kL8pV0xB3yH5mQ7tW9uR2fX";
    private static final Key KEY = Keys.hmacShaKeyFor(JWT_SECRET.getBytes());

    private static final long JWT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24h
     

    public static String generateToken(String email, String role, int userId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
                .signWith(KEY, SignatureAlgorithm.HS512) // modern API
                .compact();
    }

    public static boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("JWT token expired: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.out.println("JWT token invalid: " + e.getMessage());
            return false;
        }
    }

    public static String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public static String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return (String) claims.get("role");
    }

    public static int getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return (int) claims.get("userId");
    }
}
