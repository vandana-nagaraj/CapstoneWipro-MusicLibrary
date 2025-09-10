package com.musiclibrary.notificationservice.service;

import com.musiclibrary.notificationservice.entity.Notification;
import com.musiclibrary.notificationservice.entity.NotificationStatus;
import com.musiclibrary.notificationservice.entity.NotificationType;
import com.musiclibrary.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private RestTemplate restTemplate;
    
    public Notification createNotification(String recipientEmail, String subject, String message, NotificationType type) {
        Notification notification = new Notification(recipientEmail, subject, message, type);
        return notificationRepository.save(notification);
    }
    
    public void sendNotification(Notification notification) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(notification.getRecipientEmail());
            mailMessage.setSubject(notification.getSubject());
            mailMessage.setText(notification.getMessage());
            
            mailSender.send(mailMessage);
            
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            notification.setStatus(NotificationStatus.FAILED);
            notificationRepository.save(notification);
            throw new RuntimeException("Failed to send notification: " + e.getMessage(), e);
        }
    }
    
    public void sendNewSongNotification(String songName, String singer, String albumName) {
        // Get all user emails from user-service
        List<String> userEmails = getUserEmails();
        
        for (String email : userEmails) {
            String subject = "New Song Added to Music Library";
            String message = String.format(
                "Hello!\n\nA new song has been added to the music library:\n\n" +
                "Song: %s\n" +
                "Singer: %s\n" +
                "Album: %s\n\n" +
                "Check it out in the Music Library!\n\n" +
                "Best regards,\nMusic Library Team",
                songName, singer, albumName
            );
            
            try {
                Notification notification = createNotification(email, subject, message, NotificationType.NEW_SONG_ADDED);
                sendNotification(notification);
            } catch (Exception e) {
                // Log error but continue with other users
                System.err.println("Failed to send notification to " + email + ": " + e.getMessage());
            }
        }
    }
    
    public List<Notification> getPendingNotifications() {
        return notificationRepository.findByStatus(NotificationStatus.PENDING);
    }
    
    public List<Notification> getNotificationsByEmail(String email) {
        return notificationRepository.findByRecipientEmail(email);
    }
    
    // Call user-service to get all user emails
    private List<String> getUserEmails() {
        try {
            // Make REST call to user-service to get all user emails
            String url = "http://user-service/api/users/emails";
            String[] emails = restTemplate.getForObject(url, String[].class);
            return emails != null ? List.of(emails) : List.of();
        } catch (Exception e) {
            // Fallback to demo emails if user-service is not available
            return List.of("user1@example.com", "user2@example.com", "user3@example.com");
        }
    }
}
