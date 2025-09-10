package com.musiclibrary.userservice.controller;

import com.musiclibrary.userservice.dto.PlaylistStatsDTO;
import com.musiclibrary.userservice.entity.Playlist;
import com.musiclibrary.userservice.service.PlaylistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/playlists")
@Tag(name = "Playlist Management", description = "APIs for managing playlists")
public class PlaylistController {
    
    @Autowired
    private PlaylistService playlistService;
    
    @PostMapping("/user/{userId}")
    @Operation(summary = "Create a new playlist", description = "Create a new playlist for a specific user")
    public ResponseEntity<Playlist> createPlaylist(@PathVariable Long userId, @Valid @RequestBody Playlist playlist) {
        Playlist createdPlaylist = playlistService.createPlaylist(userId, playlist);
        return new ResponseEntity<>(createdPlaylist, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get playlist by ID", description = "Retrieve playlist details by playlist ID")
    public ResponseEntity<Playlist> getPlaylistById(@PathVariable Long id) {
        Playlist playlist = playlistService.getPlaylistById(id);
        return ResponseEntity.ok(playlist);
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get playlists by user ID", description = "Retrieve all playlists for a specific user")
    public ResponseEntity<List<Playlist>> getPlaylistsByUserId(@PathVariable Long userId) {
        List<Playlist> playlists = playlistService.getPlaylistsByUserId(userId);
        return ResponseEntity.ok(playlists);
    }
    
    @GetMapping("/user/{userId}/search")
    @Operation(summary = "Search playlists by name", description = "Search playlists by name for a specific user")
    public ResponseEntity<List<Playlist>> searchPlaylistsByUserIdAndName(@PathVariable Long userId, @RequestParam String name) {
        List<Playlist> playlists = playlistService.searchPlaylistsByUserIdAndName(userId, name);
        return ResponseEntity.ok(playlists);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update playlist", description = "Update playlist details by playlist ID")
    public ResponseEntity<Playlist> updatePlaylist(@PathVariable Long id, @Valid @RequestBody Playlist playlistDetails) {
        Playlist updatedPlaylist = playlistService.updatePlaylist(id, playlistDetails);
        return ResponseEntity.ok(updatedPlaylist);
    }
    
    @GetMapping("/user/{userId}/stats")
    @Operation(summary = "Get playlist statistics", description = "Get statistics for all playlists of a user")
    public ResponseEntity<List<PlaylistStatsDTO>> getPlaylistStats(@PathVariable Long userId) {
        List<PlaylistStatsDTO> stats = playlistService.getPlaylistStats(userId);
        return ResponseEntity.ok(stats);
    }
}
