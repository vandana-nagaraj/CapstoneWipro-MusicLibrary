package com.musiclibrary.userservice.repository;

import com.musiclibrary.userservice.entity.Playlist;
import com.musiclibrary.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByUser(User user);
    List<Playlist> findByUserId(Long userId);
    List<Playlist> findByUserAndNameContainingIgnoreCase(User user, String name);
}
