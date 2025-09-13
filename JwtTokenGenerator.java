import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JwtTokenGenerator {
    
    // Same secret as your user service
    private static final String SECRET_BASE64 = "ZmFrZV9zZWNyZXRfZm9yX3VzZXJfc2VydmljZV9qd3Q=";
    private static final long EXPIRATION_MILLIS = 86400000; // 24 hours
    
    private static Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_BASE64);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    public static String generateUserToken(String email, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", List.of("USER"));
        claims.put("userId", userId);
        
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MILLIS);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public static String generateAdminToken(String email, Long adminId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", List.of("ADMIN"));
        claims.put("adminId", adminId);
        
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MILLIS);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public static String generateCustomToken(String email, List<String> roles, Map<String, Object> additionalClaims) {
        Map<String, Object> claims = new HashMap<>(additionalClaims);
        claims.put("roles", roles);
        
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MILLIS);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    // Example usage
    public static void main(String[] args) {
        // Generate a user token
        String userToken = generateUserToken("user@example.com", 1L);
        System.out.println("User Token: " + userToken);
        
        // Generate an admin token
        String adminToken = generateAdminToken("admin@example.com", 1L);
        System.out.println("Admin Token: " + adminToken);
        
        // Generate a custom token
        Map<String, Object> customClaims = new HashMap<>();
        customClaims.put("department", "IT");
        customClaims.put("level", "senior");
        
        String customToken = generateCustomToken("custom@example.com", 
            List.of("USER", "MODERATOR"), customClaims);
        System.out.println("Custom Token: " + customToken);
    }
}
