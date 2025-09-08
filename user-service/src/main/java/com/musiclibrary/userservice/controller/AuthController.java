package com.musiclibrary.userservice.controller;

import com.musiclibrary.userservice.entity.User;
import com.musiclibrary.userservice.security.JwtUtil;
import com.musiclibrary.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
        claims.put("role", "USER");
        String token = jwtUtil.generateToken(user.getEmail(), claims);
        Map<String, String> body = new HashMap<>();
        body.put("token", token);
        return ResponseEntity.ok(body);
    }
}


