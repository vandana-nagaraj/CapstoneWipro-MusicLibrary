package com.musiclibrary.userservice.controller;

import com.musiclibrary.userservice.entity.User;
import com.musiclibrary.userservice.security.JwtUtil;
import com.musiclibrary.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    @Operation(summary = "Login and get JWT token")
    public ResponseEntity<Map<String, String>> login(@RequestParam String email, @RequestParam String password) {
        boolean ok = userService.authenticateUser(email, password);
        if (!ok) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.getUserByEmail(email);
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", List.of("USER"));
        claims.put("userId", user.getId());
        String token = jwtUtil.generateToken(user.getEmail(), claims);
        Map<String, String> body = new HashMap<>();
        body.put("token", token);
        return ResponseEntity.ok(body);
    }
    
    @PostMapping("/generate-token")
    @Operation(summary = "Generate JWT token for testing", description = "Generate a JWT token with custom claims")
    public ResponseEntity<Map<String, String>> generateToken(
            @RequestParam String email,
            @RequestParam(defaultValue = "USER") String role,
            @RequestParam(required = false) Long userId) {
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", List.of(role.toUpperCase()));
        if (userId != null) {
            claims.put("userId", userId);
        }
        
        String token = jwtUtil.generateToken(email, claims);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("email", email);
        response.put("role", role);
        
        return ResponseEntity.ok(response);
    }
}


