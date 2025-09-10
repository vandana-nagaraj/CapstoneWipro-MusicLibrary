package com.musiclibrary.userservice.dto;

import jakarta.validation.constraints.NotBlank;

public class PlaylistDTO {
    
    private Long id;
    
    @NotBlank(message = "Playlist name is required")
    private String name;
    
    private String description;
    
    private Long userId;
    
    // Constructors
    public PlaylistDTO() {}
    
    public PlaylistDTO(String name, String description, Long userId) {
        this.name = name;
        this.description = description;
        this.userId = userId;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}