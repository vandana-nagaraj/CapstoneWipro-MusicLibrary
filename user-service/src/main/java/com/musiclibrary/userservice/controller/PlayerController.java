package com.musiclibrary.userservice.controller;

import com.musiclibrary.userservice.dto.PlayerStateDTO;
import com.musiclibrary.userservice.service.PlayerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/player")
@Tag(name = "Music Player", description = "APIs for music player controls")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class PlayerController {

    @Autowired
    private PlayerService playerService;

    @PostMapping("/play/{playlistId}")
    @Operation(summary = "Play playlist", description = "Start playing a playlist from the beginning or resume")
    public ResponseEntity<PlayerStateDTO> playPlaylist(@PathVariable Long playlistId) {
        PlayerStateDTO state = playerService.playPlaylist(playlistId);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/play/{playlistId}/song/{songIndex}")
    @Operation(summary = "Play specific song", description = "Play a specific song in the playlist by index")
    public ResponseEntity<PlayerStateDTO> playSong(@PathVariable Long playlistId, @PathVariable int songIndex) {
        PlayerStateDTO state = playerService.playSong(playlistId, songIndex);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/pause/{playlistId}")
    @Operation(summary = "Pause playback", description = "Pause the current playback")
    public ResponseEntity<PlayerStateDTO> pausePlayback(@PathVariable Long playlistId) {
        PlayerStateDTO state = playerService.pausePlayback(playlistId);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/stop/{playlistId}")
    @Operation(summary = "Stop playback", description = "Stop the current playback and reset position")
    public ResponseEntity<PlayerStateDTO> stopPlayback(@PathVariable Long playlistId) {
        PlayerStateDTO state = playerService.stopPlayback(playlistId);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/next/{playlistId}")
    @Operation(summary = "Next song", description = "Skip to the next song in the playlist")
    public ResponseEntity<PlayerStateDTO> nextSong(@PathVariable Long playlistId) {
        PlayerStateDTO state = playerService.nextSong(playlistId);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/previous/{playlistId}")
    @Operation(summary = "Previous song", description = "Go to the previous song in the playlist")
    public ResponseEntity<PlayerStateDTO> previousSong(@PathVariable Long playlistId) {
        PlayerStateDTO state = playerService.previousSong(playlistId);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/repeat/{playlistId}")
    @Operation(summary = "Toggle repeat", description = "Toggle repeat mode (off, one, all)")
    public ResponseEntity<PlayerStateDTO> toggleRepeat(@PathVariable Long playlistId) {
        PlayerStateDTO state = playerService.toggleRepeat(playlistId);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/shuffle/{playlistId}")
    @Operation(summary = "Toggle shuffle", description = "Toggle shuffle mode on/off")
    public ResponseEntity<PlayerStateDTO> toggleShuffle(@PathVariable Long playlistId) {
        PlayerStateDTO state = playerService.toggleShuffle(playlistId);
        return ResponseEntity.ok(state);
    }

    @GetMapping("/state/{playlistId}")
    @Operation(summary = "Get player state", description = "Get current player state for a playlist")
    public ResponseEntity<PlayerStateDTO> getPlayerState(@PathVariable Long playlistId) {
        PlayerStateDTO state = playerService.getPlayerState(playlistId);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/seek/{playlistId}")
    @Operation(summary = "Seek position", description = "Seek to a specific position in the current song")
    public ResponseEntity<PlayerStateDTO> seekPosition(@PathVariable Long playlistId, @RequestParam int position) {
        PlayerStateDTO state = playerService.seekPosition(playlistId, position);
        return ResponseEntity.ok(state);
    }
}
