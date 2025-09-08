package com.musiclibrary.adminservice.repository;

import com.musiclibrary.adminservice.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    List<Song> findByIsVisibleTrue();
    List<Song> findByNameContainingIgnoreCase(String name);
    List<Song> findBySingerContainingIgnoreCase(String singer);
    List<Song> findByMusicDirectorContainingIgnoreCase(String musicDirector);
    List<Song> findByAlbumNameContainingIgnoreCase(String albumName);
    
    @Query("SELECT s FROM Song s WHERE s.isVisible = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.singer) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.musicDirector) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.albumName) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Song> searchSongs(@Param("searchTerm") String searchTerm);
}
