package com.musiclibrary.notificationservice.dto;

import com.musiclibrary.notificationservice.entity.NotificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NotificationDTO {
    
    private Long id;
    
    @Email(message = "Invalid email format")
    @NotBlank(message = "Recipient email is required")
    private String recipientEmail;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    @NotNull(message = "Notification type is required")
    private NotificationType type;
    
    // Constructors
    public NotificationDTO() {}
    
    public NotificationDTO(String recipientEmail, String subject, String message, NotificationType type) {
        this.recipientEmail = recipientEmail;
        this.subject = subject;
        this.message = message;
        this.type = type;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
}
