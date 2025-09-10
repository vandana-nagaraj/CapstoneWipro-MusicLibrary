package com.musiclibrary.userservice.service;

import com.musiclibrary.userservice.entity.User;
import com.musiclibrary.userservice.exception.DuplicateResourceException;
import com.musiclibrary.userservice.exception.UserNotFoundException;
import com.musiclibrary.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    
    public User createUser(User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + user.getEmail());
        }
        
        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new DuplicateResourceException("Username already exists: " + user.getUsername());
        }
        
        // Check if phone number already exists
        if (userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number already exists: " + user.getPhoneNumber());
        }
        
        return userRepository.save(user);
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        
        // Check if email is being changed and if it already exists
        if (!user.getEmail().equals(userDetails.getEmail()) && 
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + userDetails.getEmail());
        }
        
        // Check if username is being changed and if it already exists
        if (!user.getUsername().equals(userDetails.getUsername()) && 
            userRepository.existsByUsername(userDetails.getUsername())) {
            throw new DuplicateResourceException("Username already exists: " + userDetails.getUsername());
        }
        
        // Check if phone number is being changed and if it already exists
        if (!user.getPhoneNumber().equals(userDetails.getPhoneNumber()) && 
            userRepository.existsByPhoneNumber(userDetails.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number already exists: " + userDetails.getPhoneNumber());
        }
        
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setPassword(userDetails.getPassword());
        
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
    
    public boolean authenticateUser(String email, String password) {
        try {
            User user = getUserByEmail(email);
            return user.getPassword().equals(password);
        } catch (UserNotFoundException e) {
            return false;
        }
    }
    
    public List<String> getAllUserEmails() {
        return userRepository.findAll().stream()
                .map(User::getEmail)
                .toList();
    }
}
