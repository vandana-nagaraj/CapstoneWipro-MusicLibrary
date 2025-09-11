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
            String url = "http://localhost:9002/api/users/emails";
            String[] emails = restTemplate.getForObject(url, String[].class);
            return emails != null ? List.of(emails) : List.of();
        } catch (Exception e) {
            // Fallback to demo emails if user-service is not available
            System.err.println("Failed to fetch user emails from user-service: " + e.getMessage());
            return List.of("user1@example.com", "user2@example.com", "user3@example.com");
        }
    }
    
    public void sendUserRegistrationNotification(String userEmail, String username) {
        String subject = "Welcome to Music Library!";
        String message = String.format(
            "Hello %s!\n\n" +
            "Welcome to Music Library! Your account has been successfully created.\n\n" +
            "You can now:\n" +
            "- Browse thousands of songs\n" +
            "- Create and manage playlists\n" +
            "- Search for your favorite music\n" +
            "- Enjoy our music player features\n\n" +
            "Start exploring the music library now!\n\n" +
            "Best regards,\nMusic Library Team",
            username
        );
        
        try {
            Notification notification = createNotification(userEmail, subject, message, NotificationType.USER_REGISTRATION);
            sendNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to send registration notification to " + userEmail + ": " + e.getMessage());
        }
    }
    
    public void sendPlaylistCreatedNotification(String userEmail, String playlistName) {
        String subject = "Playlist Created Successfully";
        String message = String.format(
            "Hello!\n\n" +
            "Your playlist '%s' has been created successfully.\n\n" +
            "You can now add songs to your playlist and start enjoying your music collection!\n\n" +
            "Best regards,\nMusic Library Team",
            playlistName
        );
        
        try {
            Notification notification = createNotification(userEmail, subject, message, NotificationType.PLAYLIST_CREATED);
            sendNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to send playlist notification to " + userEmail + ": " + e.getMessage());
        }
    }
}
