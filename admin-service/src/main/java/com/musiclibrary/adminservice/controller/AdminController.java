package com.musiclibrary.adminservice.controller;

import com.musiclibrary.adminservice.entity.Admin;
import com.musiclibrary.adminservice.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admins")
@Tag(name = "Admin Management", description = "APIs for managing admins")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @PostMapping
    @Operation(summary = "Create a new admin", description = "Register a new admin with email, username, phone number and password")
    public ResponseEntity<Admin> createAdmin(@Valid @RequestBody Admin admin) {
        Admin createdAdmin = adminService.createAdmin(admin);
        return new ResponseEntity<>(createdAdmin, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get admin by ID", description = "Retrieve admin details by admin ID")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long id) {
        Admin admin = adminService.getAdminById(id);
        return ResponseEntity.ok(admin);
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Get admin by email", description = "Retrieve admin details by email address")
    public ResponseEntity<Admin> getAdminByEmail(@PathVariable String email) {
        Admin admin = adminService.getAdminByEmail(email);
        return ResponseEntity.ok(admin);
    }
    
    @GetMapping("/username/{username}")
    @Operation(summary = "Get admin by username", description = "Retrieve admin details by username")
    public ResponseEntity<Admin> getAdminByUsername(@PathVariable String username) {
        Admin admin = adminService.getAdminByUsername(username);
        return ResponseEntity.ok(admin);
    }
    
    @GetMapping
    @Operation(summary = "Get all admins", description = "Retrieve all admins in the system")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        List<Admin> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update admin", description = "Update admin details by admin ID")
    public ResponseEntity<Admin> updateAdmin(@PathVariable Long id, @Valid @RequestBody Admin adminDetails) {
        Admin updatedAdmin = adminService.updateAdmin(id, adminDetails);
        return ResponseEntity.ok(updatedAdmin);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete admin", description = "Delete admin by admin ID")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/authenticate")
    @Operation(summary = "Authenticate admin", description = "Authenticate admin with email and password")
    public ResponseEntity<Boolean> authenticateAdmin(@RequestParam String email, @RequestParam String password) {
        boolean isAuthenticated = adminService.authenticateAdmin(email, password);
        return ResponseEntity.ok(isAuthenticated);
    }
}
