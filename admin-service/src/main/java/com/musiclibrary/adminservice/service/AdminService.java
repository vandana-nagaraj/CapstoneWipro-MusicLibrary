package com.musiclibrary.adminservice.service;

import com.musiclibrary.adminservice.entity.Admin;
import com.musiclibrary.adminservice.exception.AdminNotFoundException;
import com.musiclibrary.adminservice.exception.DuplicateResourceException;
import com.musiclibrary.adminservice.repository.AdminRepository;
import com.musiclibrary.adminservice.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
public class AdminService {
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public Admin createAdmin(Admin admin) {
        // Check if email already exists
        if (adminRepository.existsByEmail(admin.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + admin.getEmail());
        }
        
        // Check if username already exists
        if (adminRepository.existsByUsername(admin.getUsername())) {
            throw new DuplicateResourceException("Username already exists: " + admin.getUsername());
        }
        
        // Check if phone number already exists
        if (adminRepository.existsByPhoneNumber(admin.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number already exists: " + admin.getPhoneNumber());
        }
        
        return adminRepository.save(admin);
    }
    
    public Admin getAdminById(Long id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new AdminNotFoundException("Admin not found with id: " + id));
    }
    
    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new AdminNotFoundException("Admin not found with email: " + email));
    }
    
    public Admin getAdminByUsername(String username) {
        return adminRepository.findByUsername(username)
                .orElseThrow(() -> new AdminNotFoundException("Admin not found with username: " + username));
    }
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
    
    public Admin updateAdmin(Long id, Admin adminDetails) {
        Admin admin = getAdminById(id);
        
        // Check if email is being changed and if it already exists
        if (!admin.getEmail().equals(adminDetails.getEmail()) && 
            adminRepository.existsByEmail(adminDetails.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + adminDetails.getEmail());
        }
        
        // Check if username is being changed and if it already exists
        if (!admin.getUsername().equals(adminDetails.getUsername()) && 
            adminRepository.existsByUsername(adminDetails.getUsername())) {
            throw new DuplicateResourceException("Username already exists: " + adminDetails.getUsername());
        }
        
        // Check if phone number is being changed and if it already exists
        if (!admin.getPhoneNumber().equals(adminDetails.getPhoneNumber()) && 
            adminRepository.existsByPhoneNumber(adminDetails.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number already exists: " + adminDetails.getPhoneNumber());
        }
        
        admin.setUsername(adminDetails.getUsername());
        admin.setEmail(adminDetails.getEmail());
        admin.setPhoneNumber(adminDetails.getPhoneNumber());
        admin.setPassword(adminDetails.getPassword());
        admin.setAdminLevel(adminDetails.getAdminLevel());
        
        return adminRepository.save(admin);
    }
    
    public void deleteAdmin(Long id) {
        Admin admin = getAdminById(id);
        adminRepository.delete(admin);
    }
    
    public boolean authenticateAdmin(String email, String password) {
        try {
            Admin admin = getAdminByEmail(email);
            return admin.getPassword().equals(password);
        } catch (AdminNotFoundException e) {
            return false;
        }
    }
    
    public String authenticateAdminAndGenerateToken(String email, String password) {
        try {
            Admin admin = getAdminByEmail(email);
            if (admin.getPassword().equals(password)) {
                // Create JWT claims with admin role
                Map<String, Object> claims = new HashMap<>();
                claims.put("roles", List.of("ADMIN"));
                claims.put("adminLevel", admin.getAdminLevel());
                claims.put("adminId", admin.getId());
                
                return jwtUtil.generateToken(email, claims);
            }
            return null;
        } catch (AdminNotFoundException e) {
            return null;
        }
    }
}
