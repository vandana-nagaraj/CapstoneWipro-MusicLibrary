package com.musiclibrary.userservice.controller;

import com.musiclibrary.userservice.entity.PlaylistSong;
import com.musiclibrary.userservice.service.PlaylistSongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/playlist-songs")
@Tag(name = "Playlist Songs", description = "APIs for managing songs inside a playlist")
public class PlaylistSongController {

    @Autowired
    private PlaylistSongService playlistSongService;

    @PostMapping("/playlist/{playlistId}")
    @Operation(summary = "Add song to playlist", description = "Add a song by songId and optional name to a playlist")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PlaylistSong> addSongToPlaylist(
            @PathVariable Long playlistId,
            @RequestParam Long songId,
            @RequestParam(required = false) String songName
    ) {
        PlaylistSong created = playlistSongService.addSongToPlaylist(playlistId, songId, songName);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/playlist/{playlistId}")
    @Operation(summary = "Get songs in playlist", description = "List all songs in a playlist")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PlaylistSong>> getSongsInPlaylist(@PathVariable Long playlistId) {
        return ResponseEntity.ok(playlistSongService.getSongsByPlaylist(playlistId));
    }

    @DeleteMapping("/playlist/{playlistId}/song/{songId}")
    @Operation(summary = "Remove song from playlist", description = "Remove a song from the playlist by songId")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> removeSongFromPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        playlistSongService.removeSongFromPlaylist(playlistId, songId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/playlist/{playlistId}")
    @Operation(summary = "Clear playlist", description = "Remove all songs from a playlist")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> clearPlaylist(@PathVariable Long playlistId) {
        playlistSongService.clearPlaylist(playlistId);
        return ResponseEntity.noContent().build();
    }
}


