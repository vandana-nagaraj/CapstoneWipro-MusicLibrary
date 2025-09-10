package com.musiclibrary.userservice.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class AddSongsRequest {
    
    @NotEmpty(message = "Song IDs list cannot be empty")
    private List<Long> songIds;
    
    // Constructors
    public AddSongsRequest() {}
    
    public AddSongsRequest(List<Long> songIds) {
        this.songIds = songIds;
    }
    
    // Getters and Setters
    public List<Long> getSongIds() {
        return songIds;
    }
    
    public void setSongIds(List<Long> songIds) {
        this.songIds = songIds;
    }
}
