package com.musiclibrary.userservice.service;

import com.musiclibrary.userservice.dto.SongDTO;
import com.musiclibrary.userservice.exception.SongNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SongValidationService {
    
    private static final Logger logger = LoggerFactory.getLogger(SongValidationService.class);
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${admin-service.url:http://localhost:9001}")
    private String adminServiceUrl;
    
    /**
     * Check if a song exists in the admin service
     */
    public boolean songExists(Long songId) {
        try {
            String url = adminServiceUrl + "/api/songs/" + songId;
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            logger.warn("Failed to validate song existence for songId: {}. Error: {}", songId, e.getMessage());
            return false;
        }
    }
    
    /**
     * Get song details from the admin service
     */
    public SongDTO getSongDetails(Long songId) {
        try {
            String url = adminServiceUrl + "/api/songs/" + songId;
            ResponseEntity<SongDTO> response = restTemplate.getForEntity(url, SongDTO.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new SongNotFoundException("Song not found with id: " + songId);
            }
        } catch (Exception e) {
            logger.error("Failed to fetch song details for songId: {}. Error: {}", songId, e.getMessage());
            throw new SongNotFoundException("Song not found with id: " + songId);
        }
    }
    
    /**
     * Check if a song is visible/available for adding to playlists
     */
    public boolean isSongAvailable(Long songId) {
        try {
            SongDTO song = getSongDetails(songId);
            return song.getIsVisible() != null && song.getIsVisible();
        } catch (Exception e) {
            logger.warn("Failed to check song availability for songId: {}. Error: {}", songId, e.getMessage());
            return false;
        }
    }
}
