package com.musiclibrary.userservice.service;

import com.musiclibrary.userservice.dto.SongDTO;
import com.musiclibrary.userservice.entity.Playlist;
import com.musiclibrary.userservice.entity.PlaylistSong;
import com.musiclibrary.userservice.repository.PlaylistRepository;
import com.musiclibrary.userservice.repository.PlaylistSongRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final Logger logger = LoggerFactory.getLogger(SearchService.class);
    private static final String ADMIN_SERVICE_URL = "http://localhost:9001/api/songs";

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private PlaylistSongRepository playlistSongRepository;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Search songs with multiple criteria
     */
    public List<SongDTO> searchSongs(String name, String singer, String musicDirector, String album, String query) {
        try {
            StringBuilder url = new StringBuilder(ADMIN_SERVICE_URL + "/search?");
            
            if (name != null && !name.trim().isEmpty()) {
                url.append("name=").append(name).append("&");
            }
            if (singer != null && !singer.trim().isEmpty()) {
                url.append("singer=").append(singer).append("&");
            }
            if (musicDirector != null && !musicDirector.trim().isEmpty()) {
                url.append("musicDirector=").append(musicDirector).append("&");
            }
            if (album != null && !album.trim().isEmpty()) {
                url.append("album=").append(album).append("&");
            }
            if (query != null && !query.trim().isEmpty()) {
                url.append("query=").append(query).append("&");
            }

            // Remove trailing &
            String finalUrl = url.toString().replaceAll("&$", "");
            
            SongDTO[] songs = restTemplate.getForObject(finalUrl, SongDTO[].class);
            return songs != null ? Arrays.asList(songs) : new ArrayList<>();
            
        } catch (ResourceAccessException e) {
            logger.error("Failed to connect to admin service for song search: {}", e.getMessage());
            return new ArrayList<>();
        } catch (Exception e) {
            logger.error("Error searching songs: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Search songs by name only
     */
    public List<SongDTO> searchSongsByName(String name) {
        try {
            String url = ADMIN_SERVICE_URL + "/search/name?name=" + name;
            SongDTO[] songs = restTemplate.getForObject(url, SongDTO[].class);
            return songs != null ? Arrays.asList(songs) : new ArrayList<>();
        } catch (Exception e) {
            logger.error("Error searching songs by name: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Search songs by singer
     */
    public List<SongDTO> searchSongsBySinger(String singer) {
        try {
            String url = ADMIN_SERVICE_URL + "/search/singer?singer=" + singer;
            SongDTO[] songs = restTemplate.getForObject(url, SongDTO[].class);
            return songs != null ? Arrays.asList(songs) : new ArrayList<>();
        } catch (Exception e) {
            logger.error("Error searching songs by singer: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Search songs by music director
     */
    public List<SongDTO> searchSongsByMusicDirector(String musicDirector) {
        try {
            String url = ADMIN_SERVICE_URL + "/search/music-director?musicDirector=" + musicDirector;
            SongDTO[] songs = restTemplate.getForObject(url, SongDTO[].class);
            return songs != null ? Arrays.asList(songs) : new ArrayList<>();
        } catch (Exception e) {
            logger.error("Error searching songs by music director: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Search songs by album
     */
    public List<SongDTO> searchSongsByAlbum(String album) {
        try {
            String url = ADMIN_SERVICE_URL + "/search/album?album=" + album;
            SongDTO[] songs = restTemplate.getForObject(url, SongDTO[].class);
            return songs != null ? Arrays.asList(songs) : new ArrayList<>();
        } catch (Exception e) {
            logger.error("Error searching songs by album: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Search visible songs only (for regular users)
     */
    public List<SongDTO> searchVisibleSongs(String name, String singer, String musicDirector, String album, String query) {
        try {
            StringBuilder url = new StringBuilder(ADMIN_SERVICE_URL + "/visible/search?");
            
            if (name != null && !name.trim().isEmpty()) {
                url.append("name=").append(name).append("&");
            }
            if (singer != null && !singer.trim().isEmpty()) {
                url.append("singer=").append(singer).append("&");
            }
            if (musicDirector != null && !musicDirector.trim().isEmpty()) {
                url.append("musicDirector=").append(musicDirector).append("&");
            }
            if (album != null && !album.trim().isEmpty()) {
                url.append("album=").append(album).append("&");
            }
            if (query != null && !query.trim().isEmpty()) {
                url.append("query=").append(query).append("&");
            }

            String finalUrl = url.toString().replaceAll("&$", "");
            
            SongDTO[] songs = restTemplate.getForObject(finalUrl, SongDTO[].class);
            return songs != null ? Arrays.asList(songs) : new ArrayList<>();
            
        } catch (Exception e) {
            logger.error("Error searching visible songs: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Search songs within a playlist by name
     */
    public List<PlaylistSong> searchSongsInPlaylist(Long playlistId, String songName) {
        List<PlaylistSong> allSongs = playlistSongRepository.findByPlaylistId(playlistId);
        
        return allSongs.stream()
                .filter(song -> song.getSongName() != null && 
                               song.getSongName().toLowerCase().contains(songName.toLowerCase()))
                .collect(Collectors.toList());
    }

    /**
     * Search playlists by user and name
     */
    public List<Playlist> searchPlaylistsByUserAndName(Long userId, String name) {
        return playlistRepository.findByUserIdAndNameContainingIgnoreCase(userId, name);
    }
}
