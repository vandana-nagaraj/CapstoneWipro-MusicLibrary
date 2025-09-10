package com.musiclibrary.notificationservice.controller;

import com.musiclibrary.notificationservice.entity.Notification;
import com.musiclibrary.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Management", description = "APIs for managing notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @PostMapping("/new-song")
    @Operation(summary = "Send new song notification", description = "Send notification to all users about a new song")
    public ResponseEntity<String> sendNewSongNotification(
            @RequestParam String songName,
            @RequestParam String singer,
            @RequestParam String albumName) {
        try {
            notificationService.sendNewSongNotification(songName, singer, albumName);
            return ResponseEntity.ok("New song notification sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send notification: " + e.getMessage());
        }
    }
    
    @GetMapping("/pending")
    @Operation(summary = "Get pending notifications", description = "Retrieve all pending notifications")
    public ResponseEntity<List<Notification>> getPendingNotifications() {
        List<Notification> notifications = notificationService.getPendingNotifications();
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Get notifications by email", description = "Retrieve all notifications for a specific email")
    public ResponseEntity<List<Notification>> getNotificationsByEmail(@PathVariable String email) {
        List<Notification> notifications = notificationService.getNotificationsByEmail(email);
        return ResponseEntity.ok(notifications);
    }
}