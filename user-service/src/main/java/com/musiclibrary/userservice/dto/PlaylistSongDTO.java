package com.musiclibrary.userservice.dto;

import jakarta.validation.constraints.NotNull;

public class PlaylistSongDTO {
    
    private Long id;
    
    @NotNull(message = "Playlist ID is required")
    private Long playlistId;
    
    @NotNull(message = "Song ID is required")
    private Long songId;
    
    private String songName;
    
    // Constructors
    public PlaylistSongDTO() {}
    
    public PlaylistSongDTO(Long playlistId, Long songId, String songName) {
        this.playlistId = playlistId;
        this.songId = songId;
        this.songName = songName;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getPlaylistId() { return playlistId; }
    public void setPlaylistId(Long playlistId) { this.playlistId = playlistId; }
    
    public Long getSongId() { return songId; }
    public void setSongId(Long songId) { this.songId = songId; }
    
    public String getSongName() { return songName; }
    public void setSongName(String songName) { this.songName = songName; }
}
