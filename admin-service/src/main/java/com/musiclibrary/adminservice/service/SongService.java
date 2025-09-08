package com.musiclibrary.adminservice.service;

import com.musiclibrary.adminservice.entity.Song;
import com.musiclibrary.adminservice.exception.SongNotFoundException;
import com.musiclibrary.adminservice.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SongService {
    
    @Autowired
    private SongRepository songRepository;
    
    public Song createSong(Song song) {
        return songRepository.save(song);
    }
    
    public Song getSongById(Long id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new SongNotFoundException("Song not found with id: " + id));
    }
    
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }
    
    public List<Song> getVisibleSongs() {
        return songRepository.findByIsVisibleTrue();
    }
    
    public List<Song> searchSongs(String searchTerm) {
        return songRepository.searchSongs(searchTerm);
    }
    
    public List<Song> searchSongsByName(String name) {
        return songRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<Song> searchSongsBySinger(String singer) {
        return songRepository.findBySingerContainingIgnoreCase(singer);
    }
    
    public List<Song> searchSongsByMusicDirector(String musicDirector) {
        return songRepository.findByMusicDirectorContainingIgnoreCase(musicDirector);
    }
    
    public List<Song> searchSongsByAlbum(String albumName) {
        return songRepository.findByAlbumNameContainingIgnoreCase(albumName);
    }
    
    public Song updateSong(Long id, Song songDetails) {
        Song song = getSongById(id);
        
        song.setName(songDetails.getName());
        song.setSinger(songDetails.getSinger());
        song.setMusicDirector(songDetails.getMusicDirector());
        song.setReleaseDate(songDetails.getReleaseDate());
        song.setAlbumName(songDetails.getAlbumName());
        song.setDurationMinutes(songDetails.getDurationMinutes());
        song.setFilePath(songDetails.getFilePath());
        song.setIsVisible(songDetails.getIsVisible());
        
        return songRepository.save(song);
    }
    
    public void deleteSong(Long id) {
        Song song = getSongById(id);
        songRepository.delete(song);
    }
    
    public Song toggleSongVisibility(Long id) {
        Song song = getSongById(id);
        song.setIsVisible(!song.getIsVisible());
        return songRepository.save(song);
    }
}
