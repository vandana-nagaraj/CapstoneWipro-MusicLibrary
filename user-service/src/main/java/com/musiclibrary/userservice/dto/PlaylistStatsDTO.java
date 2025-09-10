package com.musiclibrary.userservice.dto;

public class PlaylistStatsDTO {
    
    private Long playlistId;
    private String playlistName;
    private int totalSongs;
    private int totalDurationMinutes;
    private String averageDuration;
    private String createdDate;
    
    // Constructors
    public PlaylistStatsDTO() {}
    
    public PlaylistStatsDTO(Long playlistId, String playlistName, int totalSongs, 
                           int totalDurationMinutes, String createdDate) {
        this.playlistId = playlistId;
        this.playlistName = playlistName;
        this.totalSongs = totalSongs;
        this.totalDurationMinutes = totalDurationMinutes;
        this.averageDuration = totalSongs > 0 ? String.format("%.1f", (double) totalDurationMinutes / totalSongs) : "0";
        this.createdDate = createdDate;
    }
    
    // Getters and Setters
    public Long getPlaylistId() { return playlistId; }
    public void setPlaylistId(Long playlistId) { this.playlistId = playlistId; }
    
    public String getPlaylistName() { return playlistName; }
    public void setPlaylistName(String playlistName) { this.playlistName = playlistName; }
    
    public int getTotalSongs() { return totalSongs; }
    public void setTotalSongs(int totalSongs) { this.totalSongs = totalSongs; }
    
    public int getTotalDurationMinutes() { return totalDurationMinutes; }
    public void setTotalDurationMinutes(int totalDurationMinutes) { this.totalDurationMinutes = totalDurationMinutes; }
    
    public String getAverageDuration() { return averageDuration; }
    public void setAverageDuration(String averageDuration) { this.averageDuration = averageDuration; }
    
    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }
}
