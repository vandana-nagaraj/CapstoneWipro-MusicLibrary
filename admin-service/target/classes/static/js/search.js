// Enhanced Search functionality
class SearchManager {
    constructor() {
        this.searchResults = [];
        this.currentSearchType = 'songs';
        this.init();
    }

    init() {
        this.createSearchUI();
        this.bindEvents();
    }

    createSearchUI() {
        const searchHTML = `
            <div id="searchContainer" class="search-container">
                <div class="search-header">
                    <h2>Search Music Library</h2>
                    <div class="search-tabs">
                        <button class="search-tab active" data-type="songs">Songs</button>
                        <button class="search-tab" data-type="playlists">Playlists</button>
                    </div>
                </div>
                
                <div class="search-form">
                    <div class="search-input-group">
                        <input type="text" id="searchQuery" placeholder="Search songs, artists, albums..." class="search-input">
                        <button id="searchBtn" class="search-button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    
                    <div class="advanced-search" id="advancedSearch">
                        <div class="search-filters">
                            <input type="text" id="songNameFilter" placeholder="Song Name" class="filter-input">
                            <input type="text" id="singerFilter" placeholder="Singer/Artist" class="filter-input">
                            <input type="text" id="musicDirectorFilter" placeholder="Music Director" class="filter-input">
                            <input type="text" id="albumFilter" placeholder="Album" class="filter-input">
                        </div>
                        <button id="advancedSearchBtn" class="advanced-search-btn">Advanced Search</button>
                    </div>
                    
                    <button id="toggleAdvanced" class="toggle-advanced">
                        <i class="fas fa-sliders-h"></i> Advanced Search
                    </button>
                </div>
                
                <div id="searchResults" class="search-results">
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <p>Enter a search term to find songs and playlists</p>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('searchSection') || document.createElement('div');
        container.id = 'searchSection';
        container.innerHTML = searchHTML;
        
        if (!document.getElementById('searchSection')) {
            document.querySelector('.main-content').appendChild(container);
        }
    }

    bindEvents() {
        // Search tabs
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSearchType(e.target.dataset.type));
        });

        // Search buttons
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('advancedSearchBtn').addEventListener('click', () => this.performAdvancedSearch());
        
        // Toggle advanced search
        document.getElementById('toggleAdvanced').addEventListener('click', () => this.toggleAdvancedSearch());
        
        // Enter key search
        document.getElementById('searchQuery').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        // Advanced search inputs
        document.querySelectorAll('.filter-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performAdvancedSearch();
            });
        });
    }

    switchSearchType(type) {
        this.currentSearchType = type;
        
        // Update active tab
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });
        
        // Update placeholder
        const searchInput = document.getElementById('searchQuery');
        if (type === 'songs') {
            searchInput.placeholder = 'Search songs, artists, albums...';
        } else {
            searchInput.placeholder = 'Search your playlists...';
        }
        
        // Clear results
        this.clearResults();
    }

    toggleAdvancedSearch() {
        const advancedSearch = document.getElementById('advancedSearch');
        const toggleBtn = document.getElementById('toggleAdvanced');
        
        advancedSearch.classList.toggle('visible');
        toggleBtn.classList.toggle('active');
    }

    async performSearch() {
        const query = document.getElementById('searchQuery').value.trim();
        if (!query) return;
        
        this.showLoading();
        
        try {
            if (this.currentSearchType === 'songs') {
                await this.searchSongs(query);
            } else {
                await this.searchPlaylists(query);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please try again.');
        }
    }

    async performAdvancedSearch() {
        const filters = {
            name: document.getElementById('songNameFilter').value.trim(),
            singer: document.getElementById('singerFilter').value.trim(),
            musicDirector: document.getElementById('musicDirectorFilter').value.trim(),
            album: document.getElementById('albumFilter').value.trim()
        };
        
        // Check if at least one filter is provided
        if (!Object.values(filters).some(value => value)) {
            showNotification('Please enter at least one search criteria', 'warning');
            return;
        }
        
        this.showLoading();
        
        try {
            await this.searchSongsAdvanced(filters);
        } catch (error) {
            console.error('Advanced search error:', error);
            this.showError('Advanced search failed. Please try again.');
        }
    }

    async searchSongs(query) {
        const response = await fetch(`http://localhost:9002/api/search/songs/visible?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const songs = await response.json();
            this.displaySongResults(songs);
        } else {
            throw new Error('Failed to search songs');
        }
    }

    async searchSongsAdvanced(filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        
        const response = await fetch(`http://localhost:9002/api/search/songs/visible?${params}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const songs = await response.json();
            this.displaySongResults(songs);
        } else {
            throw new Error('Failed to perform advanced search');
        }
    }

    async searchPlaylists(query) {
        const userId = getCurrentUserId();
        if (!userId) {
            showNotification('Please log in to search playlists', 'warning');
            return;
        }
        
        const response = await fetch(`http://localhost:9002/api/search/playlists?userId=${userId}&name=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const playlists = await response.json();
            this.displayPlaylistResults(playlists);
        } else {
            throw new Error('Failed to search playlists');
        }
    }

    displaySongResults(songs) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (songs.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-music"></i>
                    <p>No songs found matching your search</p>
                </div>
            `;
            return;
        }
        
        const songsHTML = songs.map(song => `
            <div class="search-result-item song-item" data-song-id="${song.id}">
                <div class="song-info">
                    <div class="song-artwork">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="song-details">
                        <h4 class="song-title">${song.name}</h4>
                        <p class="song-artist">${song.singer}</p>
                        <p class="song-album">${song.albumName || 'Unknown Album'}</p>
                    </div>
                </div>
                <div class="song-actions">
                    <button class="action-btn add-to-playlist" data-song-id="${song.id}" title="Add to Playlist">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="action-btn play-song" data-song-id="${song.id}" title="Play">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h3>Songs (${songs.length} found)</h3>
            </div>
            <div class="results-list">
                ${songsHTML}
            </div>
        `;
        
        this.bindSongResultEvents();
    }

    displayPlaylistResults(playlists) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (playlists.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-list"></i>
                    <p>No playlists found matching your search</p>
                </div>
            `;
            return;
        }
        
        const playlistsHTML = playlists.map(playlist => `
            <div class="search-result-item playlist-item" data-playlist-id="${playlist.id}">
                <div class="playlist-info">
                    <div class="playlist-artwork">
                        <i class="fas fa-list"></i>
                    </div>
                    <div class="playlist-details">
                        <h4 class="playlist-title">${playlist.name}</h4>
                        <p class="playlist-description">${playlist.description || 'No description'}</p>
                        <p class="playlist-meta">Created: ${new Date(playlist.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="playlist-actions">
                    <button class="action-btn play-playlist" data-playlist-id="${playlist.id}" title="Play Playlist">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-btn view-playlist" data-playlist-id="${playlist.id}" title="View Playlist">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h3>Playlists (${playlists.length} found)</h3>
            </div>
            <div class="results-list">
                ${playlistsHTML}
            </div>
        `;
        
        this.bindPlaylistResultEvents();
    }

    bindSongResultEvents() {
        document.querySelectorAll('.add-to-playlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const songId = e.target.closest('.action-btn').dataset.songId;
                this.showAddToPlaylistModal(songId);
            });
        });
        
        document.querySelectorAll('.play-song').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const songId = e.target.closest('.action-btn').dataset.songId;
                // This would integrate with the music player
                showNotification('Song play functionality would be implemented here', 'info');
            });
        });
    }

    bindPlaylistResultEvents() {
        document.querySelectorAll('.play-playlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playlistId = e.target.closest('.action-btn').dataset.playlistId;
                if (window.musicPlayer) {
                    window.musicPlayer.playPlaylist(playlistId);
                }
            });
        });
        
        document.querySelectorAll('.view-playlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playlistId = e.target.closest('.action-btn').dataset.playlistId;
                // Navigate to playlist view
                window.location.hash = `#playlists/${playlistId}`;
            });
        });
    }

    showAddToPlaylistModal(songId) {
        // This would show a modal to select playlist
        showNotification('Add to playlist modal would be shown here', 'info');
    }

    showLoading() {
        document.getElementById('searchResults').innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching...</p>
            </div>
        `;
    }

    showError(message) {
        document.getElementById('searchResults').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    clearResults() {
        document.getElementById('searchResults').innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Enter a search term to find ${this.currentSearchType}</p>
            </div>
        `;
    }
}

// Initialize search manager
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});
