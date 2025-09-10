package com.musiclibrary.notificationservice.repository;

import com.musiclibrary.notificationservice.entity.Notification;
import com.musiclibrary.notificationservice.entity.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStatus(NotificationStatus status);
    List<Notification> findByRecipientEmail(String recipientEmail);
    List<Notification> findByRecipientEmailAndStatus(String recipientEmail, NotificationStatus status);
}
