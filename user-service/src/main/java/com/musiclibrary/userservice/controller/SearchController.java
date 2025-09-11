package com.musiclibrary.userservice.controller;

import com.musiclibrary.userservice.dto.SongDTO;
import com.musiclibrary.userservice.entity.Playlist;
import com.musiclibrary.userservice.entity.PlaylistSong;
import com.musiclibrary.userservice.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@Tag(name = "Search", description = "APIs for searching songs and playlists")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping("/songs")
    @Operation(summary = "Search songs", description = "Search songs by name, singer, music director, or album")
    public ResponseEntity<List<SongDTO>> searchSongs(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String singer,
            @RequestParam(required = false) String musicDirector,
            @RequestParam(required = false) String album,
            @RequestParam(required = false) String query) {
        
        List<SongDTO> songs = searchService.searchSongs(name, singer, musicDirector, album, query);
        return ResponseEntity.ok(songs);
    }

    @GetMapping("/songs/name")
    @Operation(summary = "Search songs by name", description = "Search songs by name only")
    public ResponseEntity<List<SongDTO>> searchSongsByName(@RequestParam String name) {
        List<SongDTO> songs = searchService.searchSongsByName(name);
        return ResponseEntity.ok(songs);
    }

    @GetMapping("/songs/singer")
    @Operation(summary = "Search songs by singer", description = "Search songs by singer/artist")
    public ResponseEntity<List<SongDTO>> searchSongsBySinger(@RequestParam String singer) {
        List<SongDTO> songs = searchService.searchSongsBySinger(singer);
        return ResponseEntity.ok(songs);
    }

    @GetMapping("/songs/music-director")
    @Operation(summary = "Search songs by music director", description = "Search songs by music director")
    public ResponseEntity<List<SongDTO>> searchSongsByMusicDirector(@RequestParam String musicDirector) {
        List<SongDTO> songs = searchService.searchSongsByMusicDirector(musicDirector);
        return ResponseEntity.ok(songs);
    }

    @GetMapping("/songs/album")
    @Operation(summary = "Search songs by album", description = "Search songs by album name")
    public ResponseEntity<List<SongDTO>> searchSongsByAlbum(@RequestParam String album) {
        List<SongDTO> songs = searchService.searchSongsByAlbum(album);
        return ResponseEntity.ok(songs);
    }

    @GetMapping("/playlists/{playlistId}/songs")
    @Operation(summary = "Search songs in playlist", description = "Search songs within a specific playlist by name")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<PlaylistSong>> searchSongsInPlaylist(
            @PathVariable Long playlistId,
            @RequestParam String songName) {
        
        List<PlaylistSong> songs = searchService.searchSongsInPlaylist(playlistId, songName);
        return ResponseEntity.ok(songs);
    }

    @GetMapping("/playlists")
    @Operation(summary = "Search playlists", description = "Search playlists by name for a specific user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Playlist>> searchPlaylists(
            @RequestParam Long userId,
            @RequestParam String name) {
        
        List<Playlist> playlists = searchService.searchPlaylistsByUserAndName(userId, name);
        return ResponseEntity.ok(playlists);
    }

    @GetMapping("/songs/visible")
    @Operation(summary = "Search visible songs", description = "Search only visible songs (for regular users)")
    public ResponseEntity<List<SongDTO>> searchVisibleSongs(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String singer,
            @RequestParam(required = false) String musicDirector,
            @RequestParam(required = false) String album,
            @RequestParam(required = false) String query) {
        
        List<SongDTO> songs = searchService.searchVisibleSongs(name, singer, musicDirector, album, query);
        return ResponseEntity.ok(songs);
    }
}
