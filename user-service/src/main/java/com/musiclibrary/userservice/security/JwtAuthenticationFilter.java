package com.musiclibrary.userservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                Claims claims = jwtUtil.parseClaims(token);
                String username = claims.getSubject();
                
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) claims.get("roles");
                
                // Debug logging
                logger.debug("JWT Claims: {}", claims);
                logger.debug("Username: {}, Roles: {}", username, roles);
                
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    List<SimpleGrantedAuthority> authorities = roles != null ? 
                            roles.stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                                .collect(Collectors.toList()) :
                            List.of(new SimpleGrantedAuthority("ROLE_USER"));
                    
                    logger.debug("Authorities granted: {}", authorities);
                    
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(username, null, authorities);
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("JWT authentication successful for user: {}", username);
                }
            } catch (ExpiredJwtException e) {
                logger.warn("JWT token expired: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Token expired\"}");
                return;
            } catch (MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
                logger.warn("Invalid JWT token: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Invalid token\"}");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
