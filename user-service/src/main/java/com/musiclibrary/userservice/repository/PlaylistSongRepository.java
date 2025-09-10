package com.musiclibrary.userservice.repository;

import com.musiclibrary.userservice.entity.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    List<PlaylistSong> findByPlaylistId(Long playlistId);
    List<PlaylistSong> findBySongId(Long songId);
    void deleteByPlaylistIdAndSongId(Long playlistId, Long songId);
    boolean existsByPlaylistIdAndSongId(Long playlistId, Long songId);
    int countByPlaylistId(Long playlistId);
}
