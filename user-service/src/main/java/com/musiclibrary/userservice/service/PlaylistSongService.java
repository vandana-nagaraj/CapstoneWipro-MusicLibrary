package com.musiclibrary.userservice.service;

import com.musiclibrary.userservice.entity.Playlist;
import com.musiclibrary.userservice.entity.PlaylistSong;
import com.musiclibrary.userservice.exception.DuplicateResourceException;
import com.musiclibrary.userservice.exception.PlaylistNotFoundException;
import com.musiclibrary.userservice.repository.PlaylistRepository;
import com.musiclibrary.userservice.repository.PlaylistSongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlaylistSongService {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private PlaylistSongRepository playlistSongRepository;

    public PlaylistSong addSongToPlaylist(Long playlistId, Long songId, String songName) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new PlaylistNotFoundException("Playlist not found with id: " + playlistId));

        if (playlistSongRepository.existsByPlaylistIdAndSongId(playlistId, songId)) {
            throw new DuplicateResourceException("Song already exists in playlist");
        }

        PlaylistSong playlistSong = new PlaylistSong(playlist, songId, songName);
        return playlistSongRepository.save(playlistSong);
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


