package com.musiclibrary.userservice.dto;

import com.musiclibrary.userservice.entity.PlaylistSong;

public class PlayerStateDTO {
    private Long playlistId;
    private String playlistName;
    private boolean isPlaying;
    private boolean isPaused;
    private int currentSongIndex;
    private PlaylistSong currentSong;
    private int totalSongs;
    private RepeatMode repeatMode;
    private boolean shuffleEnabled;
    private int currentPosition; // in seconds
    private int duration; // in seconds

    public enum RepeatMode {
        OFF, ONE, ALL
    }

    // Constructors
    public PlayerStateDTO() {}

    public PlayerStateDTO(Long playlistId, String playlistName) {
        this.playlistId = playlistId;
        this.playlistName = playlistName;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentSongIndex = 0;
        this.repeatMode = RepeatMode.OFF;
        this.shuffleEnabled = false;
        this.currentPosition = 0;
        this.duration = 0;
    }

    // Getters and Setters
    public Long getPlaylistId() {
        return playlistId;
    }

    public void setPlaylistId(Long playlistId) {
        this.playlistId = playlistId;
    }

    public String getPlaylistName() {
        return playlistName;
    }

    public void setPlaylistName(String playlistName) {
        this.playlistName = playlistName;
    }

    public boolean isPlaying() {
        return isPlaying;
    }

    public void setPlaying(boolean playing) {
        isPlaying = playing;
    }

    public boolean isPaused() {
        return isPaused;
    }

    public void setPaused(boolean paused) {
        isPaused = paused;
    }

    public int getCurrentSongIndex() {
        return currentSongIndex;
    }

    public void setCurrentSongIndex(int currentSongIndex) {
        this.currentSongIndex = currentSongIndex;
    }

    public PlaylistSong getCurrentSong() {
        return currentSong;
    }

    public void setCurrentSong(PlaylistSong currentSong) {
        this.currentSong = currentSong;
    }

    public int getTotalSongs() {
        return totalSongs;
    }

    public void setTotalSongs(int totalSongs) {
        this.totalSongs = totalSongs;
    }

    public RepeatMode getRepeatMode() {
        return repeatMode;
    }

    public void setRepeatMode(RepeatMode repeatMode) {
        this.repeatMode = repeatMode;
    }

    public boolean isShuffleEnabled() {
        return shuffleEnabled;
    }

    public void setShuffleEnabled(boolean shuffleEnabled) {
        this.shuffleEnabled = shuffleEnabled;
    }

    public int getCurrentPosition() {
        return currentPosition;
    }

    public void setCurrentPosition(int currentPosition) {
        this.currentPosition = currentPosition;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }
}
