package com.musiclibrary.userservice.exception;

public class SongNotFoundException extends RuntimeException {
    public SongNotFoundException(String message) {
        super(message);
    }
    
    public SongNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
