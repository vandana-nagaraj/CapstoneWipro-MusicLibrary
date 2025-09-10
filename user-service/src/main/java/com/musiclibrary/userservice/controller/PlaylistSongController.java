package com.musiclibrary.userservice.controller;

import com.musiclibrary.userservice.dto.AddSongRequest;
import com.musiclibrary.userservice.dto.AddSongsRequest;
import com.musiclibrary.userservice.entity.PlaylistSong;
import com.musiclibrary.userservice.service.PlaylistSongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/playlists")
@Tag(name = "Playlist Songs", description = "APIs for managing songs inside a playlist")
public class PlaylistSongController {

    @Autowired
    private PlaylistSongService playlistSongService;

    @PostMapping("/{playlistId}/songs")
    @Operation(summary = "Add song to playlist", description = "Add a single song to a playlist with validation")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<PlaylistSong> addSongToPlaylist(
            @PathVariable Long playlistId,
            @Valid @RequestBody AddSongRequest request
    ) {
        PlaylistSong created = playlistSongService.addSongToPlaylist(playlistId, request.getSongId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/{playlistId}/songs/batch")
    @Operation(summary = "Add multiple songs to playlist", description = "Add multiple songs to a playlist in batch")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<PlaylistSong>> addSongsToPlaylist(
            @PathVariable Long playlistId,
            @Valid @RequestBody AddSongsRequest request
    ) {
        List<PlaylistSong> created = playlistSongService.addSongsToPlaylist(playlistId, request.getSongIds());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // Legacy endpoint for backward compatibility
    @PostMapping("/playlist/{playlistId}")
    @Operation(summary = "Add song to playlist (Legacy)", description = "Legacy endpoint - use POST /playlists/{id}/songs instead")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<PlaylistSong> addSongToPlaylistLegacy(
            @PathVariable Long playlistId,
            @RequestParam Long songId,
            @RequestParam(required = false) String songName
    ) {
        PlaylistSong created = playlistSongService.addSongToPlaylist(playlistId, songId, songName);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{playlistId}/songs")
    @Operation(summary = "Get songs in playlist", description = "List all songs in a playlist")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<PlaylistSong>> getSongsInPlaylist(@PathVariable Long playlistId) {
        return ResponseEntity.ok(playlistSongService.getSongsByPlaylist(playlistId));
    }

    @DeleteMapping("/{playlistId}/songs/{songId}")
    @Operation(summary = "Remove song from playlist", description = "Remove a song from the playlist by songId")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> removeSongFromPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        playlistSongService.removeSongFromPlaylist(playlistId, songId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{playlistId}/songs")
    @Operation(summary = "Clear playlist", description = "Remove all songs from a playlist")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> clearPlaylist(@PathVariable Long playlistId) {
        playlistSongService.clearPlaylist(playlistId);
        return ResponseEntity.noContent().build();
    }

    // Legacy endpoints for backward compatibility
    @GetMapping("/playlist/{playlistId}")
    @Operation(summary = "Get songs in playlist (Legacy)", description = "Legacy endpoint - use GET /playlists/{id}/songs instead")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<PlaylistSong>> getSongsInPlaylistLegacy(@PathVariable Long playlistId) {
        return ResponseEntity.ok(playlistSongService.getSongsByPlaylist(playlistId));
    }

    @DeleteMapping("/playlist/{playlistId}/song/{songId}")
    @Operation(summary = "Remove song from playlist (Legacy)", description = "Legacy endpoint - use DELETE /playlists/{id}/songs/{songId} instead")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> removeSongFromPlaylistLegacy(@PathVariable Long playlistId, @PathVariable Long songId) {
        playlistSongService.removeSongFromPlaylist(playlistId, songId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/playlist/{playlistId}")
    @Operation(summary = "Clear playlist (Legacy)", description = "Legacy endpoint - use DELETE /playlists/{id}/songs instead")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> clearPlaylistLegacy(@PathVariable Long playlistId) {
        playlistSongService.clearPlaylist(playlistId);
        return ResponseEntity.noContent().build();
    }
}


