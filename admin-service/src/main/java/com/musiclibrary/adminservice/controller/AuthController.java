package com.musiclibrary.adminservice.controller;

import com.musiclibrary.adminservice.entity.Admin;
import com.musiclibrary.adminservice.security.JwtUtil;
import com.musiclibrary.adminservice.service.AdminService;
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
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    @Operation(summary = "Login as admin and get JWT token")
    public ResponseEntity<Map<String, String>> login(@RequestParam String email, @RequestParam String password) {
        boolean ok = adminService.authenticateAdmin(email, password);
        if (!ok) {
            return ResponseEntity.status(401).build();
        }
        Admin admin = adminService.getAdminByEmail(email);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ADMIN");
        String token = jwtUtil.generateToken(admin.getEmail(), claims);
        Map<String, String> body = new HashMap<>();
        body.put("token", token);
        return ResponseEntity.ok(body);
    }
}


