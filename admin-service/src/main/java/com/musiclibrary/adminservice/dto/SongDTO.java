package com.musiclibrary.adminservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

import java.time.LocalDate;

public class SongDTO {
    
    private Long id;
    
    @NotBlank(message = "Song name is required")
    private String name;
    
    @NotBlank(message = "Singer is required")
    private String singer;
    
    @NotBlank(message = "Music director is required")
    private String musicDirector;
    
    @NotNull(message = "Release date is required")
    private LocalDate releaseDate;
    
    @NotBlank(message = "Album name is required")
    private String albumName;
    
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;
    
    private String filePath;
    
    private Boolean isVisible;
    
    // Constructors
    public SongDTO() {}
    
    public SongDTO(String name, String singer, String musicDirector, LocalDate releaseDate, 
                   String albumName, Integer durationMinutes, String filePath, Boolean isVisible) {
        this.name = name;
        this.singer = singer;
        this.musicDirector = musicDirector;
        this.releaseDate = releaseDate;
        this.albumName = albumName;
        this.durationMinutes = durationMinutes;
        this.filePath = filePath;
        this.isVisible = isVisible;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSinger() { return singer; }
    public void setSinger(String singer) { this.singer = singer; }
    
    public String getMusicDirector() { return musicDirector; }
    public void setMusicDirector(String musicDirector) { this.musicDirector = musicDirector; }
    
    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }
    
    public String getAlbumName() { return albumName; }
    public void setAlbumName(String albumName) { this.albumName = albumName; }
    
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public Boolean getIsVisible() { return isVisible; }
    public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }
}