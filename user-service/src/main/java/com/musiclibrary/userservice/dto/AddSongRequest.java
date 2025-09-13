package com.musiclibrary.userservice.dto;

import jakarta.validation.constraints.NotNull;

public class AddSongRequest {
    
    @NotNull(message = "Song ID is required")
    private Long songId;
    
    private String songName; // Optional field for song name
    
    // Constructors
    public AddSongRequest() {}
    
    public AddSongRequest(Long songId) {
        this.songId = songId;
    }
    
    public AddSongRequest(Long songId, String songName) {
        this.songId = songId;
        this.songName = songName;
    }
    
    // Getters and Setters
    public Long getSongId() {
        return songId;
    }
    
    public void setSongId(Long songId) {
        this.songId = songId;
    }
    
    public String getSongName() {
        return songName;
    }
    
    public void setSongName(String songName) {
        this.songName = songName;
    }
}
