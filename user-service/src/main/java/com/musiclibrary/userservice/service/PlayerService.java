package com.musiclibrary.userservice.service;

import com.musiclibrary.userservice.dto.PlayerStateDTO;
import com.musiclibrary.userservice.entity.Playlist;
import com.musiclibrary.userservice.entity.PlaylistSong;
import com.musiclibrary.userservice.exception.PlaylistNotFoundException;
import com.musiclibrary.userservice.repository.PlaylistRepository;
import com.musiclibrary.userservice.repository.PlaylistSongRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PlayerService {

    private static final Logger logger = LoggerFactory.getLogger(PlayerService.class);
    
    // In-memory storage for player states (in production, use Redis or database)
    private final Map<Long, PlayerStateDTO> playerStates = new ConcurrentHashMap<>();
    private final Map<Long, List<Integer>> shuffleOrders = new ConcurrentHashMap<>();

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private PlaylistSongRepository playlistSongRepository;

    public PlayerStateDTO playPlaylist(Long playlistId) {
        PlayerStateDTO state = getOrCreatePlayerState(playlistId);
        List<PlaylistSong> songs = playlistSongRepository.findByPlaylistId(playlistId);
        
        if (songs.isEmpty()) {
            logger.warn("Playlist {} has no songs", playlistId);
            return state;
        }

        state.setPlaying(true);
        state.setPaused(false);
        state.setTotalSongs(songs.size());
        
        if (state.getCurrentSongIndex() >= songs.size()) {
            state.setCurrentSongIndex(0);
        }
        
        updateCurrentSong(state, songs);
        logger.info("Started playing playlist {}", playlistId);
        return state;
    }

    public PlayerStateDTO playSong(Long playlistId, int songIndex) {
        PlayerStateDTO state = getOrCreatePlayerState(playlistId);
        List<PlaylistSong> songs = playlistSongRepository.findByPlaylistId(playlistId);
        
        if (songIndex < 0 || songIndex >= songs.size()) {
            logger.warn("Invalid song index {} for playlist {}", songIndex, playlistId);
            return state;
        }

        state.setCurrentSongIndex(songIndex);
        state.setPlaying(true);
        state.setPaused(false);
        state.setCurrentPosition(0);
        state.setTotalSongs(songs.size());
        
        updateCurrentSong(state, songs);
        logger.info("Playing song at index {} in playlist {}", songIndex, playlistId);
        return state;
    }

    public PlayerStateDTO pausePlayback(Long playlistId) {
        PlayerStateDTO state = getOrCreatePlayerState(playlistId);
        state.setPlaying(false);
        state.setPaused(true);
        logger.info("Paused playback for playlist {}", playlistId);
        return state;
    }

    public PlayerStateDTO stopPlayback(Long playlistId) {
        PlayerStateDTO state = getOrCreatePlayerState(playlistId);
        state.setPlaying(false);
        state.setPaused(false);
        state.setCurrentPosition(0);
        logger.info("Stopped playback for playlist {}", playlistId);
        return state;
    }

    public PlayerStateDTO nextSong(Long playlistId) {
        PlayerStateDTO state = getOrCreatePlayerState(playlistId);
        List<PlaylistSong> songs = playlistSongRepository.findByPlaylistId(playlistId);
        
        if (songs.isEmpty()) {
            return state;
        }

        int nextIndex = calculateNextSongIndex(state, songs.size());
        state.setCurrentSongIndex(nextIndex);
        state.setCurrentPosition(0);
        
        updateCurrentSong(state, songs);
        logger.info("Moved to next song (index {}) in playlist {}", nextIndex, playlistId);
        return state;
    }

    public PlayerStateDTO previousSong(Long playlistId) {
        PlayerStateDTO state = getOrCreatePlayerState(playlistId);
        List<PlaylistSong> songs = playlistSongRepository.findByPlaylistId(playlistId);
        
        if (songs.isEmpty()) {
            return state;
        }

        int prevIndex = calculatePreviousSongIndex(state, songs.size());
        state.setCurrentSongIndex(prevIndex);
        state.setCurrentPosition(0);
        
        updateCurrentSong(state, songs);
        logger.info("Moved to previous song (index {}) in playlist {}", prevIndex, playlistId);
        return state;
    }

    public PlayerStateDTO toggleRepeat(Long playlistId) {
        PlayerStateDTO state = getOrCreatePlayerState(playlistId);
        
        switch (state.getRepeatMode()) {
            case OFF:
                state.setRepeatMode(PlayerStateDTO.RepeatMode.ONE);
                break;
            case ONE:
                state.setRepeatMode(PlayerStateDTO.RepeatMode.ALL);
                break;
            case ALL:
                state.setRepeatMode(PlayerStateDTO.RepeatMode.OFF);
                break;
        }
        
        logger.info("Toggled repeat mode to {} for playlist {}", state.getRepeatMode(), playlistId);
        return state;
    }

    public PlayerStateDTO toggleShuffle(Long playlistId) {
        PlayerStateDTO state = getOrCreatePlayerState(playlistId);
        boolean newShuffleState = !state.isShuffleEnabled();
        state.setShuffleEnabled(newShuffleState);
        
        if (newShuffleState) {
            generateShuffleOrder(playlistId, state.getTotalSongs());
        } else {
            shuffleOrders.remove(playlistId);
        }
        
        logger.info("Toggled shuffle to {} for playlist {}", newShuffleState, playlistId);
        return state;
    }

    public PlayerStateDTO seekPosition(Long playlistId, int position) {
        PlayerStateDTO state = getOrCreatePlayerState(playlistId);
        state.setCurrentPosition(Math.max(0, position));
        logger.info("Seeked to position {} in playlist {}", position, playlistId);
        return state;
    }

    public PlayerStateDTO getPlayerState(Long playlistId) {
        return getOrCreatePlayerState(playlistId);
    }

    private PlayerStateDTO getOrCreatePlayerState(Long playlistId) {
        return playerStates.computeIfAbsent(playlistId, id -> {
            Playlist playlist = playlistRepository.findById(id)
                    .orElseThrow(() -> new PlaylistNotFoundException("Playlist not found with id: " + id));
            return new PlayerStateDTO(id, playlist.getName());
        });
    }

    private void updateCurrentSong(PlayerStateDTO state, List<PlaylistSong> songs) {
        if (state.getCurrentSongIndex() >= 0 && state.getCurrentSongIndex() < songs.size()) {
            PlaylistSong currentSong = songs.get(state.getCurrentSongIndex());
            state.setCurrentSong(currentSong);
            // Set a default duration (in a real app, this would come from the audio file)
            state.setDuration(180); // 3 minutes default
        }
    }

    private int calculateNextSongIndex(PlayerStateDTO state, int totalSongs) {
        if (state.isShuffleEnabled()) {
            List<Integer> shuffleOrder = shuffleOrders.get(state.getPlaylistId());
            if (shuffleOrder != null) {
                int currentPos = shuffleOrder.indexOf(state.getCurrentSongIndex());
                if (currentPos < shuffleOrder.size() - 1) {
                    return shuffleOrder.get(currentPos + 1);
                } else if (state.getRepeatMode() == PlayerStateDTO.RepeatMode.ALL) {
                    return shuffleOrder.get(0);
                }
            }
        }

        int nextIndex = state.getCurrentSongIndex() + 1;
        
        if (nextIndex >= totalSongs) {
            if (state.getRepeatMode() == PlayerStateDTO.RepeatMode.ALL) {
                return 0;
            } else if (state.getRepeatMode() == PlayerStateDTO.RepeatMode.ONE) {
                return state.getCurrentSongIndex();
            } else {
                return totalSongs - 1; // Stay at last song
            }
        }
        
        return nextIndex;
    }

    private int calculatePreviousSongIndex(PlayerStateDTO state, int totalSongs) {
        if (state.isShuffleEnabled()) {
            List<Integer> shuffleOrder = shuffleOrders.get(state.getPlaylistId());
            if (shuffleOrder != null) {
                int currentPos = shuffleOrder.indexOf(state.getCurrentSongIndex());
                if (currentPos > 0) {
                    return shuffleOrder.get(currentPos - 1);
                } else if (state.getRepeatMode() == PlayerStateDTO.RepeatMode.ALL) {
                    return shuffleOrder.get(shuffleOrder.size() - 1);
                }
            }
        }

        int prevIndex = state.getCurrentSongIndex() - 1;
        
        if (prevIndex < 0) {
            if (state.getRepeatMode() == PlayerStateDTO.RepeatMode.ALL) {
                return totalSongs - 1;
            } else {
                return 0; // Stay at first song
            }
        }
        
        return prevIndex;
    }

    private void generateShuffleOrder(Long playlistId, int totalSongs) {
        List<Integer> order = new ArrayList<>();
        for (int i = 0; i < totalSongs; i++) {
            order.add(i);
        }
        Collections.shuffle(order);
        shuffleOrders.put(playlistId, order);
    }
}
