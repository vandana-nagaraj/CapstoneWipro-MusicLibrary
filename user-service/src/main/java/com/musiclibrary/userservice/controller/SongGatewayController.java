package com.musiclibrary.userservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/songs")
@Tag(name = "Songs (User Facing)", description = "User facing endpoints that proxy to admin-service")
public class SongGatewayController {

    private static final String ADMIN_SERVICE = "http://admin-service";

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/visible")
    @Operation(summary = "List visible songs")
    public ResponseEntity<List> getVisibleSongs() {
        List body = restTemplate.getForObject(ADMIN_SERVICE + "/api/songs/visible", List.class);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/search")
    @Operation(summary = "Search songs by term")
    public ResponseEntity<List> search(@RequestParam String searchTerm) {
        List body = restTemplate.getForObject(ADMIN_SERVICE + "/api/songs/search?searchTerm=" + searchTerm, List.class);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/search/name")
    public ResponseEntity<List> searchByName(@RequestParam String name) {
        List body = restTemplate.getForObject(ADMIN_SERVICE + "/api/songs/search/name?name=" + name, List.class);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/search/singer")
    public ResponseEntity<List> searchBySinger(@RequestParam String singer) {
        List body = restTemplate.getForObject(ADMIN_SERVICE + "/api/songs/search/singer?singer=" + singer, List.class);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/search/music-director")
    public ResponseEntity<List> searchByMusicDirector(@RequestParam String musicDirector) {
        List body = restTemplate.getForObject(ADMIN_SERVICE + "/api/songs/search/music-director?musicDirector=" + musicDirector, List.class);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/search/album")
    public ResponseEntity<List> searchByAlbum(@RequestParam String albumName) {
        List body = restTemplate.getForObject(ADMIN_SERVICE + "/api/songs/search/album?albumName=" + albumName, List.class);
        return ResponseEntity.ok(body);
    }
}


