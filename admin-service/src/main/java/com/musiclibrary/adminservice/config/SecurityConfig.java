package com.musiclibrary.adminservice.config;

import com.musiclibrary.adminservice.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions().disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                            "/h2-console/**",
                            "/", 
                            "/index.html", 
                            "/styles.css", 
                            "/script.js", 
                            "/js/**", 
                            "/favicon.ico", 
                            "/favicon.ico/**",
                            "/static/**",
                            "/v3/api-docs/**", 
                            "/swagger-ui/**", 
                            "/swagger-ui.html",
                            "/webjars/**",
                            "/error"
                        ).permitAll()
                        // Auth endpoints
                        .requestMatchers(
                            "/auth/**",
                            "/api/auth/**"
                        ).permitAll()
                        // Public API endpoints
                        .requestMatchers(
                            "/api/songs/visible", 
                            "/api/songs/search/**",
                            "/api/songs/*/stream"
                        ).permitAll()
                        // Admin API endpoints
                        .requestMatchers(
                            "/api/admins",
                            "/api/admins/**"
                        ).permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow all origins, headers, and methods for development
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // Add more specific CORS configuration for production
        config.addExposedHeader("Authorization");
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}


