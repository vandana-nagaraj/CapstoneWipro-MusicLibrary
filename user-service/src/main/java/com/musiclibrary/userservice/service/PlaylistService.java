package com.musiclibrary.userservice.service;

import com.musiclibrary.userservice.dto.PlaylistStatsDTO;
import com.musiclibrary.userservice.entity.Playlist;
import com.musiclibrary.userservice.entity.User;
import com.musiclibrary.userservice.exception.PlaylistNotFoundException;
import com.musiclibrary.userservice.exception.UserNotFoundException;
import com.musiclibrary.userservice.repository.PlaylistRepository;
import com.musiclibrary.userservice.repository.PlaylistSongRepository;
import com.musiclibrary.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaylistService {
    
    @Autowired
    private PlaylistRepository playlistRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PlaylistSongRepository playlistSongRepository;
    
    public Playlist createPlaylist(Long userId, Playlist playlist) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        playlist.setUser(user);
        return playlistRepository.save(playlist);
    }
    
    public Playlist getPlaylistById(Long id) {
        return playlistRepository.findById(id)
                .orElseThrow(() -> new PlaylistNotFoundException("Playlist not found with id: " + id));
    }
    
    public List<Playlist> getPlaylistsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        return playlistRepository.findByUser(user);
    }
    
    public List<Playlist> searchPlaylistsByUserIdAndName(Long userId, String name) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        return playlistRepository.findByUserAndNameContainingIgnoreCase(user, name);
    }
    
    public Playlist updatePlaylist(Long id, Playlist playlistDetails) {
        Playlist playlist = getPlaylistById(id);
        
        playlist.setName(playlistDetails.getName());
        playlist.setDescription(playlistDetails.getDescription());
        
        return playlistRepository.save(playlist);
    }
    
    public void deletePlaylist(Long id) {
        Playlist playlist = getPlaylistById(id);
        playlistRepository.delete(playlist);
    }
    
    public List<PlaylistStatsDTO> getPlaylistStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        List<Playlist> playlists = playlistRepository.findByUser(user);
        
        return playlists.stream().map(playlist -> {
            int songCount = playlistSongRepository.countByPlaylistId(playlist.getId());
            // For demo purposes, assume average song duration of 3.5 minutes
            int totalDuration = songCount * 3; // Simplified calculation
            String createdDate = playlist.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            
            return new PlaylistStatsDTO(
                playlist.getId(),
                playlist.getName(),
                songCount,
                totalDuration,
                createdDate
            );
        }).collect(Collectors.toList());
    }
}
