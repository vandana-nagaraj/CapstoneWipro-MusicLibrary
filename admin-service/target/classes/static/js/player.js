// Music Player functionality
class MusicPlayer {
    constructor() {
        this.currentPlaylist = null;
        this.playerState = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        this.createPlayerUI();
        this.bindEvents();
        this.isInitialized = true;
    }

    createPlayerUI() {
        const playerHTML = `
            <div id="musicPlayer" class="music-player hidden">
                <div class="player-content">
                    <div class="song-info">
                        <div class="song-artwork">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="song-details">
                            <div class="song-title" id="currentSongTitle">No song selected</div>
                            <div class="song-artist" id="currentSongArtist">Unknown artist</div>
                        </div>
                    </div>
                    
                    <div class="player-controls">
                        <button id="shuffleBtn" class="control-btn" title="Shuffle">
                            <i class="fas fa-random"></i>
                        </button>
                        <button id="prevBtn" class="control-btn" title="Previous">
                            <i class="fas fa-step-backward"></i>
                        </button>
                        <button id="playPauseBtn" class="control-btn play-pause" title="Play">
                            <i class="fas fa-play"></i>
                        </button>
                        <button id="nextBtn" class="control-btn" title="Next">
                            <i class="fas fa-step-forward"></i>
                        </button>
                        <button id="repeatBtn" class="control-btn" title="Repeat">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                    
                    <div class="player-progress">
                        <span class="time-current" id="currentTime">0:00</span>
                        <div class="progress-bar">
                            <div class="progress-track" id="progressTrack">
                                <div class="progress-fill" id="progressFill"></div>
                                <div class="progress-handle" id="progressHandle"></div>
                            </div>
                        </div>
                        <span class="time-total" id="totalTime">0:00</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', playerHTML);
    }

    bindEvents() {
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSong());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousSong());
        document.getElementById('shuffleBtn').addEventListener('click', () => this.toggleShuffle());
        document.getElementById('repeatBtn').addEventListener('click', () => this.toggleRepeat());
        
        // Progress bar interaction
        const progressTrack = document.getElementById('progressTrack');
        progressTrack.addEventListener('click', (e) => this.seekTo(e));
    }

    async playPlaylist(playlistId) {
        try {
            this.currentPlaylist = playlistId;
            const response = await fetch(`/api/player/play/${playlistId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.playerState = await response.json();
                this.updateUI();
                this.showPlayer();
            }
        } catch (error) {
            console.error('Error playing playlist:', error);
            showNotification('Error playing playlist', 'error');
        }
    }

    async togglePlayPause() {
        if (!this.currentPlaylist) return;
        
        try {
            const endpoint = this.playerState?.isPlaying ? 'pause' : 'play';
            const response = await fetch(`/api/player/${endpoint}/${this.currentPlaylist}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.playerState = await response.json();
                this.updateUI();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    }

    async nextSong() {
        if (!this.currentPlaylist) return;
        
        try {
            const response = await fetch(`/api/player/next/${this.currentPlaylist}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.playerState = await response.json();
                this.updateUI();
            }
        } catch (error) {
            console.error('Error playing next song:', error);
        }
    }

    async previousSong() {
        if (!this.currentPlaylist) return;
        
        try {
            const response = await fetch(`/api/player/previous/${this.currentPlaylist}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getToken('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.playerState = await response.json();
                this.updateUI();
            }
        } catch (error) {
            console.error('Error playing previous song:', error);
        }
    }

    async toggleShuffle() {
        if (!this.currentPlaylist) return;
        
        try {
            // Toggle shuffle state immediately for better UX
            this.playerState = this.playerState || {};
            const newShuffleState = !this.playerState.shuffle;
            
            // Update UI immediately
            const shuffleBtn = document.getElementById('shuffleBtn');
            if (shuffleBtn) {
                shuffleBtn.classList.toggle('active', newShuffleState);
                shuffleBtn.title = newShuffleState ? 'Disable Shuffle' : 'Enable Shuffle';
            }
            
            // Show visual feedback
            this.showNotification(newShuffleState ? 'Shuffle enabled' : 'Shuffle disabled');
            
            // Send request to server
            const response = await fetch(`/api/player/shuffle/${this.currentPlaylist}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ shuffle: newShuffleState })
            });
            
            if (response.ok) {
                this.playerState = await response.json();
                this.updateUI();
                
                // If shuffle was enabled, update the queue immediately
                if (newShuffleState && this.playerState.queue && this.playerState.queue.length > 1) {
                    this.shuffleQueue();
                }
            } else {
                // Revert UI if request fails
                if (shuffleBtn) {
                    shuffleBtn.classList.toggle('active', !newShuffleState);
                    shuffleBtn.title = !newShuffleState ? 'Disable Shuffle' : 'Enable Shuffle';
                }
                throw new Error('Failed to update shuffle state');
            }
        } catch (error) {
            console.error('Error toggling shuffle:', error);
            this.showNotification('Failed to update shuffle', 'error');
        }
    }
    
    shuffleQueue() {
        if (!this.playerState?.queue?.length) return;
        
        // Fisher-Yates shuffle algorithm
        const queue = [...this.playerState.queue];
        let currentIndex = queue.length;
        
        while (currentIndex !== 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            
            // Swap elements
            [queue[currentIndex], queue[randomIndex]] = 
                [queue[randomIndex], queue[currentIndex]];
        }
        
        // Update queue but keep current song at its position if playing
        if (this.playerState.currentTrackIndex >= 0) {
            const currentSong = this.playerState.queue[this.playerState.currentTrackIndex];
            const newIndex = queue.findIndex(song => song.id === currentSong.id);
            if (newIndex >= 0) {
                // Move current song to the front of the shuffled queue
                queue.splice(newIndex, 1);
                queue.unshift(currentSong);
                this.playerState.currentTrackIndex = 0;
            }
        }
        
        this.playerState.queue = queue;
        this.updateUI();
    }
    
    showNotification(message, type = 'success') {
        // Create or update notification element
        let notification = document.getElementById('player-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'player-notification';
            notification.className = 'player-notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = `player-notification ${type}`;
        notification.style.display = 'block';
        
        // Auto-hide after 3 seconds
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    async toggleRepeat() {
        if (!this.currentPlaylist) return;
        
        try {
            const response = await fetch(`/api/player/repeat/${this.currentPlaylist}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.playerState = await response.json();
                this.updateUI();
            }
        } catch (error) {
            console.error('Error toggling repeat:', error);
        }
    }

    async seekTo(event) {
        if (!this.currentPlaylist || !this.playerState) return;
        
        const progressTrack = document.getElementById('progressTrack');
        const rect = progressTrack.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newPosition = Math.floor(percentage * this.playerState.duration);
        
        try {
            const response = await fetch(`/api/player/seek/${this.currentPlaylist}?position=${newPosition}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.playerState = await response.json();
                this.updateUI();
            }
        } catch (error) {
            console.error('Error seeking:', error);
        }
    }

    updateUI() {
        if (!this.playerState) return;
        
        // Update song info
        const currentSong = this.playerState.currentSong;
        if (currentSong) {
            document.getElementById('currentSongTitle').textContent = currentSong.songName || 'Unknown Song';
            document.getElementById('currentSongArtist').textContent = 'Unknown Artist';
        }
        
        // Update play/pause button
        const playPauseBtn = document.getElementById('playPauseBtn');
        const playPauseIcon = playPauseBtn.querySelector('i');
        if (this.playerState.isPlaying) {
            playPauseIcon.className = 'fas fa-pause';
            playPauseBtn.title = 'Pause';
        } else {
            playPauseIcon.className = 'fas fa-play';
            playPauseBtn.title = 'Play';
        }
        
        // Update shuffle button
        const shuffleBtn = document.getElementById('shuffleBtn');
        shuffleBtn.classList.toggle('active', this.playerState.shuffleEnabled);
        
        // Update repeat button
        const repeatBtn = document.getElementById('repeatBtn');
        repeatBtn.classList.remove('active', 'repeat-one');
        if (this.playerState.repeatMode === 'ONE') {
            repeatBtn.classList.add('active', 'repeat-one');
        } else if (this.playerState.repeatMode === 'ALL') {
            repeatBtn.classList.add('active');
        }
        
        // Update progress bar
        this.updateProgress();
        
        // Update time display
        document.getElementById('currentTime').textContent = this.formatTime(this.playerState.currentPosition);
        document.getElementById('totalTime').textContent = this.formatTime(this.playerState.duration);
    }

    updateProgress() {
        if (!this.playerState) return;
        
        const percentage = (this.playerState.currentPosition / this.playerState.duration) * 100;
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressHandle').style.left = `${percentage}%`;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showPlayer() {
        document.getElementById('musicPlayer').classList.remove('hidden');
    }

    hidePlayer() {
        document.getElementById('musicPlayer').classList.add('hidden');
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});
