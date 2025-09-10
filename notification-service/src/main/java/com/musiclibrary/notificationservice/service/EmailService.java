package com.musiclibrary.notificationservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNewSongEmail(@NonNull String to, @NonNull String songName, @NonNull String artist) {
        if (to.isBlank() || fromAddress == null || fromAddress.isBlank()) {
            return; // skip if not configured
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("New song added: " + songName);
        message.setText("A new song has been added to Music Library!\n\n" +
                "Song: " + songName + "\n" +
                "Artist: " + artist + "\n\n" +
                "Enjoy!\nMusic Library");
        mailSender.send(message);
    }
}


