package com.musiclibrary.userservice.service;

import com.musiclibrary.userservice.dto.SongDTO;
import com.musiclibrary.userservice.entity.Playlist;
import com.musiclibrary.userservice.entity.PlaylistSong;
import com.musiclibrary.userservice.exception.DuplicateResourceException;
import com.musiclibrary.userservice.exception.PlaylistNotFoundException;
import com.musiclibrary.userservice.exception.SongNotFoundException;
import com.musiclibrary.userservice.repository.PlaylistRepository;
import com.musiclibrary.userservice.repository.PlaylistSongRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PlaylistSongService {

    private static final Logger logger = LoggerFactory.getLogger(PlaylistSongService.class);

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private PlaylistSongRepository playlistSongRepository;

    @Autowired
    private SongValidationService songValidationService;

    /**
     * Add a single song to playlist with validation
     */
    public PlaylistSong addSongToPlaylist(Long playlistId, Long songId) {
        // 1. Validate playlist exists
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new PlaylistNotFoundException("Playlist not found with id: " + playlistId));

        // 2. Validate song exists and is available
        if (!songValidationService.isSongAvailable(songId)) {
            throw new SongNotFoundException("Song not found or not available with id: " + songId);
        }

        // 3. Check for duplicates
        if (playlistSongRepository.existsByPlaylistIdAndSongId(playlistId, songId)) {
            throw new DuplicateResourceException("Song already exists in playlist");
        }

        // 4. Get song details and create relationship
        SongDTO songDetails = songValidationService.getSongDetails(songId);
        PlaylistSong playlistSong = new PlaylistSong(playlist, songId, songDetails.getName());

        logger.info("Adding song {} to playlist {}", songId, playlistId);
        return playlistSongRepository.save(playlistSong);
    }

    /**
     * Legacy method for backward compatibility
     */
    public PlaylistSong addSongToPlaylist(Long playlistId, Long songId, String songName) {
        return addSongToPlaylist(playlistId, songId);
    }

    /**
     * Add multiple songs to playlist in batch
     */
    @Transactional
    public List<PlaylistSong> addSongsToPlaylist(Long playlistId, List<Long> songIds) {
        // 1. Validate playlist exists
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new PlaylistNotFoundException("Playlist not found with id: " + playlistId));

        List<PlaylistSong> addedSongs = new ArrayList<>();
        List<Long> failedSongs = new ArrayList<>();

        for (Long songId : songIds) {
            try {
                // Check if song is available and not already in playlist
                if (songValidationService.isSongAvailable(songId) && 
                    !playlistSongRepository.existsByPlaylistIdAndSongId(playlistId, songId)) {
                    
                    SongDTO songDetails = songValidationService.getSongDetails(songId);
                    PlaylistSong playlistSong = new PlaylistSong(playlist, songId, songDetails.getName());
                    addedSongs.add(playlistSongRepository.save(playlistSong));
                    
                    logger.info("Successfully added song {} to playlist {}", songId, playlistId);
                } else {
                    logger.warn("Skipping song {} - already exists in playlist or not available", songId);
                }
            } catch (Exception e) {
                logger.error("Failed to add song {} to playlist {}: {}", songId, playlistId, e.getMessage());
                failedSongs.add(songId);
            }
        }

        if (!failedSongs.isEmpty()) {
            logger.warn("Failed to add {} songs to playlist {}: {}", failedSongs.size(), playlistId, failedSongs);
        }

        return addedSongs;
    }

    public List<PlaylistSong> getSongsByPlaylist(Long playlistId) {
        // Ensure playlist exists
        playlistRepository.findById(playlistId)
                .orElseThrow(() -> new PlaylistNotFoundException("Playlist not found with id: " + playlistId));
        return playlistSongRepository.findByPlaylistId(playlistId);
    }

    public void removeSongFromPlaylist(Long playlistId, Long songId) {
        // Ensure playlist exists
        playlistRepository.findById(playlistId)
                .orElseThrow(() -> new PlaylistNotFoundException("Playlist not found with id: " + playlistId));
        if (!playlistSongRepository.existsByPlaylistIdAndSongId(playlistId, songId)) {
            return; // idempotent delete
        }
        playlistSongRepository.deleteByPlaylistIdAndSongId(playlistId, songId);
    }

    public void clearPlaylist(Long playlistId) {
        // Ensure playlist exists
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new PlaylistNotFoundException("Playlist not found with id: " + playlistId));
        List<PlaylistSong> songs = playlistSongRepository.findByPlaylistId(playlist.getId());
        playlistSongRepository.deleteAll(songs);
    }
}


