package com.musiclibrary.userservice.dto;

import java.time.LocalDate;

public class SongDTO {
    private Long id;
    private String name;
    private String singer;
    private String musicDirector;
    private LocalDate releaseDate;
    private String albumName;
    private Integer durationMinutes;
    private String filePath;
    private Boolean isVisible;

    // Constructors
    public SongDTO() {}

    public SongDTO(Long id, String name, String singer, String musicDirector, 
                   LocalDate releaseDate, String albumName, Integer durationMinutes, 
                   String filePath, Boolean isVisible) {
        this.id = id;
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
}
