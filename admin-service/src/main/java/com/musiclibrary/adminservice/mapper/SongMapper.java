package com.musiclibrary.adminservice.mapper;

import com.musiclibrary.adminservice.dto.SongDTO;
import com.musiclibrary.adminservice.entity.Song;

public class SongMapper {
    public static SongDTO toDto(Song song) {
        SongDTO dto = new SongDTO();
        dto.setId(song.getId());
        dto.setName(song.getName());
        dto.setSinger(song.getSinger());
        dto.setMusicDirector(song.getMusicDirector());
        dto.setReleaseDate(song.getReleaseDate());
        dto.setAlbumName(song.getAlbumName());
        dto.setDurationMinutes(song.getDurationMinutes());
        dto.setIsVisible(song.getIsVisible());
        return dto;
    }
}


