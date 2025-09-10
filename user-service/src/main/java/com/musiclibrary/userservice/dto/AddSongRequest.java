package com.musiclibrary.userservice.dto;

import jakarta.validation.constraints.NotNull;

public class AddSongRequest {
    
    @NotNull(message = "Song ID is required")
    private Long songId;
    
    // Constructors
    public AddSongRequest() {}
    
    public AddSongRequest(Long songId) {
        this.songId = songId;
    }
    
    // Getters and Setters
    public Long getSongId() {
        return songId;
    }
    
    public void setSongId(Long songId) {
        this.songId = songId;
    }
}
