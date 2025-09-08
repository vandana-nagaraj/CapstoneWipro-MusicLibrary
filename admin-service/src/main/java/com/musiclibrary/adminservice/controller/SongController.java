package com.musiclibrary.adminservice.controller;

import com.musiclibrary.adminservice.entity.Song;
import com.musiclibrary.adminservice.service.SongService;
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
@RequestMapping("/api/songs")
@Tag(name = "Song Management", description = "APIs for managing songs")
public class SongController {
    
    @Autowired
    private SongService songService;
    
    @PostMapping
    @Operation(summary = "Create a new song", description = "Add a new song to the library")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Song> createSong(@Valid @RequestBody Song song) {
        Song createdSong = songService.createSong(song);
        return new ResponseEntity<>(createdSong, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get song by ID", description = "Retrieve song details by song ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Song> getSongById(@PathVariable Long id) {
        Song song = songService.getSongById(id);
        return ResponseEntity.ok(song);
    }
    
    @GetMapping
    @Operation(summary = "Get all songs", description = "Retrieve all songs in the library (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Song>> getAllSongs() {
        List<Song> songs = songService.getAllSongs();
        return ResponseEntity.ok(songs);
    }
    
    @GetMapping("/visible")
    @Operation(summary = "Get visible songs", description = "Retrieve all visible songs for users")
    public ResponseEntity<List<Song>> getVisibleSongs() {
        List<Song> songs = songService.getVisibleSongs();
        return ResponseEntity.ok(songs);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search songs", description = "Search songs by name, singer, music director, or album")
    public ResponseEntity<List<Song>> searchSongs(@RequestParam String searchTerm) {
        List<Song> songs = songService.searchSongs(searchTerm);
        return ResponseEntity.ok(songs);
    }
    
    @GetMapping("/search/name")
    @Operation(summary = "Search songs by name", description = "Search songs by song name")
    public ResponseEntity<List<Song>> searchSongsByName(@RequestParam String name) {
        List<Song> songs = songService.searchSongsByName(name);
        return ResponseEntity.ok(songs);
    }
    
    @GetMapping("/search/singer")
    @Operation(summary = "Search songs by singer", description = "Search songs by singer name")
    public ResponseEntity<List<Song>> searchSongsBySinger(@RequestParam String singer) {
        List<Song> songs = songService.searchSongsBySinger(singer);
        return ResponseEntity.ok(songs);
    }
    
    @GetMapping("/search/music-director")
    @Operation(summary = "Search songs by music director", description = "Search songs by music director name")
    public ResponseEntity<List<Song>> searchSongsByMusicDirector(@RequestParam String musicDirector) {
        List<Song> songs = songService.searchSongsByMusicDirector(musicDirector);
        return ResponseEntity.ok(songs);
    }
    
    @GetMapping("/search/album")
    @Operation(summary = "Search songs by album", description = "Search songs by album name")
    public ResponseEntity<List<Song>> searchSongsByAlbum(@RequestParam String albumName) {
        List<Song> songs = songService.searchSongsByAlbum(albumName);
        return ResponseEntity.ok(songs);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update song", description = "Update song details by song ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Song> updateSong(@PathVariable Long id, @Valid @RequestBody Song songDetails) {
        Song updatedSong = songService.updateSong(id, songDetails);
        return ResponseEntity.ok(updatedSong);
    }
    
    @PutMapping("/{id}/toggle-visibility")
    @Operation(summary = "Toggle song visibility", description = "Toggle song visibility for users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Song> toggleSongVisibility(@PathVariable Long id) {
        Song song = songService.toggleSongVisibility(id);
        return ResponseEntity.ok(song);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete song", description = "Delete song by song ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }
}
