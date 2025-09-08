package com.musiclibrary.adminservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "songs")
public class Song {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Song name is required")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "Singer is required")
    @Column(nullable = false)
    private String singer;
    
    @NotBlank(message = "Music director is required")
    @Column(nullable = false)
    private String musicDirector;
    
    @NotNull(message = "Release date is required")
    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;
    
    @NotBlank(message = "Album name is required")
    @Column(nullable = false)
    private String albumName;
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "is_visible")
    private Boolean isVisible = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Song() {}
    
    public Song(String name, String singer, String musicDirector, LocalDate releaseDate, String albumName) {
        this.name = name;
        this.singer = singer;
        this.musicDirector = musicDirector;
        this.releaseDate = releaseDate;
        this.albumName = albumName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getSinger() {
        return singer;
    }
    
    public void setSinger(String singer) {
        this.singer = singer;
    }
    
    public String getMusicDirector() {
        return musicDirector;
    }
    
    public void setMusicDirector(String musicDirector) {
        this.musicDirector = musicDirector;
    }
    
    public LocalDate getReleaseDate() {
        return releaseDate;
    }
    
    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }
    
    public String getAlbumName() {
        return albumName;
    }
    
    public void setAlbumName(String albumName) {
        this.albumName = albumName;
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public Boolean getIsVisible() {
        return isVisible;
    }
    
    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
