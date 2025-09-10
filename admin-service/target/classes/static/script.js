// Copied from frontend/script.js with same API base URLs
const API_BASE_URL = 'http://localhost:8081';
const ADMIN_API_BASE_URL = 'http://localhost:8083';

let currentUserEmail = null;
let currentUserName = null; // for user role
let currentAdminName = null; // for admin role
let currentUserType = null;
let authToken = null;
// simple client-side playback state for playlist detail
let playlistPlayback = { queue: [], index: -1, isPlaying: false, repeat: false, shuffle: false };
// context for playlist picker modal
let playlistPickContext = null;

const sections = {
    home: document.getElementById('home'),
    login: document.getElementById('login'),
    register: document.getElementById('register'),
    songs: document.getElementById('songs'),
    playlists: document.getElementById('playlists'),
    playlistDetail: document.getElementById('playlistDetail'),
    adminPanel: document.getElementById('adminPanel')
};

const forms = {
    login: document.getElementById('loginForm'),
    register: document.getElementById('registerForm')
};

const navWhoAmI = document.getElementById('whoami');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const authLinks = document.getElementById('authLinks');
const profileArea = document.getElementById('profileArea');
const profileToggle = document.getElementById('profileToggle');
const profileMenu = document.getElementById('profileMenu');
const menuLogout = document.getElementById('menuLogout');
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileRole = document.getElementById('profileRole');
const homeTitle = document.getElementById('homeTitle');
const homeSubtitle = document.getElementById('homeSubtitle');
const homeCta = document.getElementById('homeCta');
const adminLink = document.getElementById('adminLink');

function updateNavbar() {
    if (currentUserEmail) {
        if (authLinks) authLinks.classList.add('hidden');
        if (profileArea) profileArea.classList.remove('hidden');
        const isAdmin = currentUserType === 'admin';
        const nameDisplay = isAdmin ? 'Admin' : (currentUserName || 'User');
        if (profileName) profileName.textContent = nameDisplay;
        if (profileRole) profileRole.textContent = isAdmin ? 'Admin' : 'User';
        if (profileAvatar) profileAvatar.textContent = nameDisplay.charAt(0).toUpperCase();
        if (adminLink) adminLink.classList.add('hidden'); // remove extra admin navigator
        const playlistsNav = document.querySelector('a[href="#playlists"]');
        if (playlistsNav) {
            if (isAdmin) playlistsNav.classList.add('hidden'); else playlistsNav.classList.remove('hidden');
        }
    } else {
        if (authLinks) authLinks.classList.remove('hidden');
        if (profileArea) profileArea.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
    }
}

function personalizeHome() {
    if (currentUserEmail) {
        const isAdmin = currentUserType === 'admin';
        const displayName = isAdmin ? (currentAdminName || 'Admin') : (currentUserName || 'User');
        if (homeTitle) homeTitle.textContent = `Welcome back, ${displayName}!`;
        if (homeSubtitle) homeSubtitle.textContent = isAdmin ? 'Manage the music library and curate content' : 'Discover and save your favorite songs';
        if (homeCta) {
            homeCta.innerHTML = isAdmin
                ? '<button class="btn btn-primary" onclick="showAdminPanel()">Manage Songs</button> <button class="btn btn-secondary" onclick="showSongs()">Explore Songs</button>'
                : '<button class="btn btn-primary" onclick="showSongs()">Explore Songs</button> <button class="btn btn-secondary" onclick="showPlaylists()">My Playlists</button>';
        }
    } else {
        if (homeTitle) homeTitle.textContent = 'Welcome to Music Library';
        if (homeSubtitle) homeSubtitle.textContent = 'Discover, organize, and enjoy your favorite music';
        if (homeCta) homeCta.innerHTML = '<button class="btn btn-primary" onclick="showLogin()">Login</button> <button class="btn btn-secondary" onclick="showRegister()">Register</button>';
    }
}

function showSection(sectionName) {
    Object.values(sections).forEach(section => {
        section.classList.add('hidden');
    });
    sections[sectionName].classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const targetLink = document.querySelector(`[href="#${sectionName}"]`);
    if (targetLink) targetLink.classList.add('active');
    // keep URL hash in sync so back/forward works
    if (location.hash !== `#${sectionName}`) {
        history.replaceState(null, '', `#${sectionName}`);
    }
}

function showLogin() { showSection('login'); if (forms.login) { forms.login.reset(); } }
function showRegister() { showSection('register'); if (forms.register) { forms.register.reset(); } }
function showSongs() { showSection('songs'); loadSongs(); }
function showPlaylists() { 
    showSection('playlists'); 
    if (currentUserEmail) {
        loadPlaylists(); 
    } else {
        document.getElementById('playlistsList').innerHTML = '<div class="text-center"><p>Please login to view playlists</p><button class="btn btn-primary" onclick="showLogin()">Login</button></div>';
    }
}
function showAdminPanel() { showSection('adminPanel'); loadAdminSongs(); }

function routeByHash() {
    const hash = (location.hash || '#home').substring(1);
    if (hash === 'songs') { showSongs(); }
    else if (hash === 'playlists') { showPlaylists(); }
    else if (hash === 'adminPanel') { showAdminPanel(); }
    else if (hash === 'login') { showLogin(); }
    else if (hash === 'register') { showRegister(); }
    else { showSection('home'); }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            if (target === 'songs') { showSongs(); }
            else if (target === 'playlists') { showPlaylists(); }
            else if (target === 'adminPanel') { showAdminPanel(); }
            else { showSection(target); }
        });
    });

    // handle profile menu anchors
    document.querySelectorAll('.profile-menu .menu-item').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href') || '#home';
            const target = href.startsWith('#') ? href.substring(1) : 'home';
            if (target === 'songs') { showSongs(); }
            else if (target === 'playlists') { showPlaylists(); }
            else { showSection(target); }
            if (profileMenu && !profileMenu.classList.contains('hidden')) profileMenu.classList.add('hidden');
        });
    });

    if (profileToggle) {
        profileToggle.addEventListener('click', function() {
            if (profileMenu) profileMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', function(event) {
            if (!profileArea.contains(event.target)) {
                if (profileMenu && !profileMenu.classList.contains('hidden')) profileMenu.classList.add('hidden');
            }
        });
    }
    if (menuLogout) {
        menuLogout.addEventListener('click', function(e) {
            e.preventDefault();
            currentUserEmail = null;
            currentUserName = null;
            currentUserType = null;
            authToken = null;
            updateNavbar();
            personalizeHome();
            showSection('home');
        });
    }

    if (forms.login) forms.login.addEventListener('submit', handleLogin);
    if (forms.register) forms.register.addEventListener('submit', handleRegister);
    updateNavbar();
    personalizeHome();
    // initial route from hash
    routeByHash();
});

window.addEventListener('hashchange', routeByHash);

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userType = formData.get('userType');
    const loginData = { email: formData.get('email'), password: formData.get('password') };
    showMessage('Logging in...', 'success');
    try {
        if (userType === 'admin') {
            const response = await fetch(`${ADMIN_API_BASE_URL}/auth/login?email=${loginData.email}&password=${loginData.password}`, { method: 'POST' });
            if (response.ok) {
                const body = await response.json();
                authToken = body.token || null;
                currentUserEmail = loginData.email;
                currentUserType = userType;
                
                // Log authentication information
                console.log('Admin login successful:', { 
                    email: currentUserEmail, 
                    userType: currentUserType, 
                    tokenReceived: authToken ? 'Yes' : 'No' 
                });
                
                showMessage('Login successful!', 'success');
                if (forms.login) { forms.login.reset(); }
                await resolveAndSetLoggedInName();
                await resolveAndSetAdminName();
                updateNavbar();
                personalizeHome();
                showSongs();
            } else {
                console.error('Admin login failed:', response.status);
                showMessage('Invalid credentials!', 'error');
            }
        } else {
            const response = await fetch(`${API_BASE_URL}/auth/login?email=${loginData.email}&password=${loginData.password}`, { method: 'POST' });
            if (response.ok) {
                const body = await response.json();
                authToken = body.token || null;
                currentUserEmail = loginData.email;
                currentUserType = userType;
                
                // Log authentication information
                console.log('User login successful:', { 
                    email: currentUserEmail, 
                    userType: currentUserType, 
                    tokenReceived: authToken ? 'Yes' : 'No' 
                });
                
                showMessage('Login successful!', 'success');
                if (forms.login) { forms.login.reset(); }
                await resolveAndSetLoggedInName();
                updateNavbar();
                personalizeHome();
                showSongs();
            } else {
                console.error('User login failed:', response.status);
                showMessage('Invalid credentials!', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(`Login failed! ${error.message}`, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userType = formData.get('userType');
    const userData = { username: formData.get('username'), email: formData.get('email'), phoneNumber: formData.get('phoneNumber'), password: formData.get('password') };
    showMessage('Registering...', 'success');
    try {
        const apiUrl = userType === 'admin' ? ADMIN_API_BASE_URL : API_BASE_URL;
        const response = await fetch(`${apiUrl}/api/${userType === 'admin' ? 'admins' : 'users'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            if (forms.register) { forms.register.reset(); }
            showLogin();
        } else {
            const errorText = await response.text();
            showMessage(`Registration failed: ${errorText}`, 'error');
        }
    } catch (error) {
        showMessage(`Registration failed! ${error.message}`, 'error');
    }
}

async function loadSongs() {
    const songsList = document.getElementById('songsList');
    songsList.innerHTML = '<div class="loading"></div>';
    try {
        const response = await fetch(`${ADMIN_API_BASE_URL}/api/songs/visible`);
        if (response.ok) { const songs = await response.json(); displaySongs(songs); }
        else { songsList.innerHTML = '<p>Failed to load songs</p>'; }
    } catch (error) { songsList.innerHTML = '<p>Error loading songs</p>'; }
}

function displaySongs(songs) {
    const songsList = document.getElementById('songsList');
    if (songs.length === 0) { songsList.innerHTML = '<p>No songs available</p>'; return; }
    songsList.innerHTML = songs.map(s => `
        <div class="song-card" onclick="playSong(${s.id}, '${s.name.replace(/'/g, "\\'")}', '${(s.singer || 'Unknown Artist').replace(/'/g, "\\'")}')">
            <div class="song-header">
                <div class="song-info">
                    <div class="song-title">${s.name} <i class="fas fa-play-circle play-icon"></i></div>
                    <div class="song-artist">${s.singer || 'Unknown Artist'}</div>
                </div>
                <div class="song-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-primary btn-small" onclick="addToPlaylist(${s.id}, '${s.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-plus"></i> Add to Playlist
                    </button>
                </div>
            </div>
            <div class="song-details">
                ${s.musicDirector ? `<div class="detail-item"><i class="fas fa-user-tie"></i> <strong>Music Director:</strong> ${s.musicDirector}</div>` : ''}
                ${s.albumName ? `<div class="detail-item"><i class="fas fa-compact-disc"></i> <strong>Album:</strong> ${s.albumName}</div>` : ''}
                ${s.releaseDate ? `<div class="detail-item"><i class="fas fa-calendar"></i> <strong>Release Date:</strong> ${new Date(s.releaseDate).toLocaleDateString()}</div>` : ''}
                ${s.durationMinutes ? `<div class="detail-item"><i class="fas fa-clock"></i> <strong>Duration:</strong> ${s.durationMinutes} minutes</div>` : ''}
            </div>
        </div>
    `).join('');
}

async function searchSongs() {
    const searchTerm = document.getElementById('songSearch').value;
    const songsList = document.getElementById('songsList');
    if (!searchTerm.trim()) { loadSongs(); return; }
    songsList.innerHTML = '<div class="loading"></div>';
    try {
        const response = await fetch(`${ADMIN_API_BASE_URL}/api/songs/search?searchTerm=${encodeURIComponent(searchTerm)}`);
        if (response.ok) { const songs = await response.json(); displaySongs(songs); }
        else { songsList.innerHTML = '<p>Search failed</p>'; }
    } catch (error) { songsList.innerHTML = '<p>Error searching songs</p>'; }
}

async function loadPlaylists() {
    const playlistsList = document.getElementById('playlistsList');
    if (!currentUserEmail) { 
        playlistsList.innerHTML = '<p>Please login to view playlists</p>'; 
        return; 
    }
    
    try {
        const userResponse = await fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`, { 
            headers: { 'Authorization': `Bearer ${authToken}` } 
        });
        
        if (userResponse.ok) { 
            const user = await userResponse.json(); 
            currentUserName = user.username || currentUserName;
            
            const response = await fetch(`${API_BASE_URL}/api/playlists/user/${user.id}`, { 
                headers: { 'Authorization': `Bearer ${authToken}` } 
            });
            
            if (response.ok) { 
                const playlists = await response.json(); 
                if (playlists.length === 0) {
                    playlistsList.innerHTML = '<div class="text-center"><p>No playlists created yet</p><button class="btn btn-primary" onclick="showCreatePlaylist()">Create Your First Playlist</button></div>';
                } else {
                    displayPlaylists(playlists); 
                }
            } else { 
                console.error('Failed to load playlists:', response.status);
                playlistsList.innerHTML = '<p>Failed to load playlists</p>'; 
            }
        } else { 
            console.error('User not found:', userResponse.status);
            playlistsList.innerHTML = '<p>User not found</p>'; 
        }
    } catch (error) { 
        console.error('Error loading playlists:', error);
        playlistsList.innerHTML = '<p>Error loading playlists</p>'; 
    }
}

function displayPlaylists(playlists) {
    const playlistsList = document.getElementById('playlistsList');
    if (playlists.length === 0) { 
        playlistsList.innerHTML = '<div class="text-center"><p>No playlists created yet</p><button class="btn btn-primary" onclick="showCreatePlaylist()">Create Your First Playlist</button></div>'; 
        return; 
    }
    playlistsList.innerHTML = `
        <div style="margin-bottom: 1rem; text-align: center;">
            <button class="btn btn-primary" onclick="showCreatePlaylist()"><i class="fas fa-plus"></i> Create New Playlist</button>
        </div>
        ${playlists.map(playlist => `
            <div class="playlist-card">
                <h3>${playlist.name}</h3>
                <p>${playlist.description || 'No description'}</p>
                <p><strong>Created:</strong> ${new Date(playlist.createdAt).toLocaleDateString()}</p>
                <div class="playlist-actions">
                    <button class="btn btn-primary btn-small" onclick="openPlaylist(${playlist.id}, '${playlist.name.replace(/'/g, "\\'")}')"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-secondary btn-small" onclick="renamePlaylist(${playlist.id}, '${playlist.name.replace(/'/g, "\\'")}')"><i class="fas fa-edit"></i> Rename</button>
                    <button class="btn btn-secondary btn-small" onclick="deletePlaylist(${playlist.id})"><i class="fas fa-trash"></i> Delete</button>
                    <button class="btn btn-secondary btn-small" onclick="showPlaylistStats(${playlist.id})"><i class="fas fa-chart-bar"></i> Stats</button>
                </div>
            </div>
        `).join('')}
    `;
}

function showCreatePlaylist() { const name = prompt('Enter playlist name:'); if (name) { createPlaylist(name); } }

async function createPlaylist(name) {
    if (!currentUserEmail) { showMessage('Please login to create playlists', 'error'); return; }
    try {
        const userResponse = await fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (userResponse.ok) {
            const user = await userResponse.json();
            currentUserName = user.username || currentUserName;
            const playlistData = { name: name, description: '' };
            const response = await fetch(`${API_BASE_URL}/api/playlists/user/${user.id}`, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, authToken ? { 'Authorization': `Bearer ${authToken}` } : {}), body: JSON.stringify(playlistData) });
            if (response.ok) { showMessage('Playlist created successfully!', 'success'); loadPlaylists(); }
            else { showMessage('Failed to create playlist', 'error'); }
        }
    } catch (error) { showMessage('Error creating playlist', 'error'); }
}

async function addToPlaylist(songId, songName) {
    if (!currentUserEmail) { 
        showMessage('Please login to add songs to playlists', 'error'); 
        return; 
    }
    
    // Allow both users and admins to add songs to playlists
    if (currentUserType !== 'user' && currentUserType !== 'admin') {
        showMessage('Please login as a user to add songs to playlists.', 'error');
        return;
    }
    
    // Check if we have a valid auth token
    if (!authToken) {
        showMessage('Authentication token missing. Please login again.', 'error');
        return;
    }
    
    try {
        console.log('Starting addToPlaylist:', { songId, songName, currentUserEmail, currentUserType });
        
        const userResponse = await fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`, { 
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!userResponse.ok) { 
            console.error('User lookup failed:', userResponse.status);
            showMessage('User not found', 'error'); 
            return; 
        }
        
        const user = await userResponse.json();
        console.log('User found:', user);
        
        const plRes = await fetch(`${API_BASE_URL}/api/playlists/user/${user.id}`, { 
            headers: { 'Authorization': `Bearer ${authToken}` } 
        });
        
        if (!plRes.ok) { 
            console.error('Playlist lookup failed:', plRes.status);
            showMessage('Could not load playlists', 'error'); 
            return; 
        }
        
        const playlists = await plRes.json();
        console.log('Playlists found:', playlists);
        
        if (!Array.isArray(playlists) || playlists.length === 0) { 
            showMessage('Create a playlist first by going to the Playlists section', 'error'); 
            return; 
        }
        
        // open modal picker
        playlistPickContext = { songId, songName: songName || `Song ${songId}`, playlists };
        openPlaylistPickerUI(playlists);
    } catch (error) { 
        console.error('Error in addToPlaylist:', error);
        showMessage(`Error adding song to playlist: ${error.message}`, 'error'); 
    }
}

function openPlaylistPickerUI(playlists) {
    const modal = document.getElementById('playlistPicker');
    const body = document.getElementById('playlistPickerBody');
    if (!modal || !body) return;
    body.innerHTML = playlists.map((p, i) => `
        <label style="display:flex; align-items:center; gap:0.5rem; padding:0.4rem 0;">
            <input type="radio" name="plChoice" value="${i}"> <span>${p.name}</span>
        </label>
    `).join('');
    modal.classList.remove('hidden');
}

function closePlaylistPicker() {
    const modal = document.getElementById('playlistPicker');
    if (modal) modal.classList.add('hidden');
}

async function confirmAddToPickedPlaylist() {
    const idx = parseInt((document.querySelector('input[name="plChoice"]:checked')?.value) || '-1', 10);
    if (isNaN(idx) || idx < 0 || idx >= playlistPickContext.playlists.length) { 
        showMessage('Please select a playlist', 'error'); 
        return; 
    }
    const playlistId = playlistPickContext.playlists[idx].id;
    
    // Check if user is logged in
    if (!currentUserEmail) {
        showMessage('Please login to add songs to playlists', 'error');
        return;
    }
    
    // Ensure we have a valid auth token
    if (!authToken) {
        showMessage('Authentication token missing. Please login again.', 'error');
        return;
    }
    
    try {
        console.log('Adding song to playlist:', { 
            playlistId, 
            songId: playlistPickContext.songId, 
            songName: playlistPickContext.songName,
            userType: currentUserType,
            authToken: authToken ? 'present' : 'missing',
            apiBaseUrl: API_BASE_URL
        });
        
        // Check if user-service is running
        try {
            const healthCheck = await fetch(`${API_BASE_URL}/actuator/health`);
            console.log('User service health check:', healthCheck.status);
        } catch (healthError) {
            console.error('User service appears to be down:', healthError);
            showMessage('User service is not running. Please start the user-service on port 8081.', 'error');
            return;
        }
        
        const fullUrl = `${API_BASE_URL}/api/playlists/${playlistId}/songs`;
        console.log('Full API URL:', fullUrl);
        
        const requestBody = {
            songId: playlistPickContext.songId
        };
        
        const response = await fetch(fullUrl, { 
            method: 'POST', 
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status, 'Auth token used:', authToken ? 'Yes' : 'No');
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (response.ok) { 
            showMessage('Song added to playlist successfully!', 'success'); 
            closePlaylistPicker(); 
        } else { 
            const errorText = await response.text();
            console.error('Failed to add song:', response.status, errorText);
            if (response.status === 401) {
                showMessage('Authentication failed. Please login again.', 'error');
            } else if (response.status === 409) {
                showMessage('Song is already in this playlist', 'error');
            } else if (response.status === 404) {
                showMessage('Playlist not found', 'error');
            } else if (response.status === 403) {
                showMessage('Access denied. Please check your permissions.', 'error');
            } else {
                showMessage(`Failed to add song: ${response.status} - ${errorText}`, 'error'); 
            }
        }
    } catch (error) { 
        console.error('Error in confirmAddToPickedPlaylist:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showMessage('Cannot connect to user service. Please ensure user-service is running on port 8081.', 'error');
        } else {
            showMessage(`Network error: ${error.message}`, 'error'); 
        }
    }
}

async function searchMyPlaylists() {
    if (!currentUserEmail) { showMessage('Please login to search your playlists', 'error'); return; }
    const query = (document.getElementById('playlistSearch')?.value || '').trim();
    const playlistsList = document.getElementById('playlistsList');
    if (!query) { loadPlaylists(); return; }
    playlistsList.innerHTML = '<div class="loading"></div>';
    try {
        const userResponse = await fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (!userResponse.ok) { playlistsList.innerHTML = '<p>User not found</p>'; return; }
        const user = await userResponse.json();
        const response = await fetch(`${API_BASE_URL}/api/playlists/user/${user.id}/search?name=${encodeURIComponent(query)}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (response.ok) {
            const playlists = await response.json();
            displayPlaylists(playlists);
        } else {
            playlistsList.innerHTML = '<p>Search failed</p>';
        }
    } catch (_) { playlistsList.innerHTML = '<p>Error searching playlists</p>'; }
}

// Playlist UI helpers
async function renamePlaylist(id, currentName) {
    const name = prompt('Enter new name:', currentName || '');
    if (!name) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/playlists/${id}`, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, authToken ? { 'Authorization': `Bearer ${authToken}` } : {}), body: JSON.stringify({ name }) });
        if (response.ok) { showMessage('Playlist renamed', 'success'); loadPlaylists(); }
        else { showMessage('Rename failed', 'error'); }
    } catch (_) { showMessage('Rename failed', 'error'); }
}

async function deletePlaylist(id) {
    if (!confirm('Delete this playlist?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/playlists/${id}`, { method: 'DELETE', headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (response.ok) { showMessage('Playlist deleted', 'success'); loadPlaylists(); }
        else { showMessage('Delete failed', 'error'); }
    } catch (_) { showMessage('Delete failed', 'error'); }
}

function openPlaylist(id, name) {
    currentPlaylistId = id; // Set current playlist for add songs functionality
    showSection('playlistDetail');
    const title = document.getElementById('playlistDetailTitle');
    if (title) title.textContent = name || 'Playlist';
    loadPlaylistSongs(id);
}

async function loadPlaylistSongs(id) {
    const list = document.getElementById('playlistSongsList');
    list.innerHTML = '<div class="loading"></div>';
    
    // Check if we have a valid auth token
    if (!authToken) {
        list.innerHTML = '<p>Authentication token missing. Please login again.</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/playlists/${id}/songs`, { 
            headers: { 'Authorization': `Bearer ${authToken}` } 
        });
        
        if (response.ok) {
            const songs = await response.json();
            // prepare playback queue
            playlistPlayback.queue = songs.map(ps => ({ id: ps.songId, name: ps.songName || ('Song ' + ps.songId) }));
            playlistPlayback.index = playlistPlayback.queue.length > 0 ? 0 : -1;
            list.innerHTML = songs.map(ps => `
                <div class="song-card">
                    <h3>${ps.songName || 'Song ' + ps.songId}</h3>
                    <div class="song-actions">
                        <button class="btn btn-primary btn-small" onclick="playlistPlaySpecific(${ps.songId})"><i class=\"fas fa-play\"></i> Play</button>
                        <button class="btn btn-secondary btn-small" onclick="removeSongFromPlaylist(${id}, ${ps.songId})"><i class="fas fa-trash"></i> Remove</button>
                    </div>
                </div>
            `).join('');
            updatePlaybackNowPlaying();
        } else { 
            console.error('Failed to load playlist songs:', response.status);
            list.innerHTML = '<p>Failed to load playlist songs</p>'; 
        }
    } catch (error) { 
        console.error('Error loading playlist songs:', error);
        list.innerHTML = '<p>Error loading playlist songs</p>'; 
    }
}

async function removeSongFromPlaylist(playlistId, songId) {
    // Check if we have a valid auth token
    if (!authToken) {
        showMessage('Authentication token missing. Please login again.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}/songs/${songId}`, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${authToken}` } 
        });
        
        if (response.ok) { 
            showMessage('Removed from playlist', 'success'); 
            loadPlaylistSongs(playlistId); 
        } else { 
            console.error('Failed to remove song:', response.status);
            showMessage('Remove failed', 'error'); 
        }
    } catch (error) { 
        console.error('Error removing song:', error);
        showMessage('Remove failed', 'error'); 
    }
}

function backToPlaylists() { showPlaylists(); }

function filterPlaylistSongs() {
    const q = (document.getElementById('playlistSongSearch')?.value || '').toLowerCase();
    const cards = document.querySelectorAll('#playlistSongsList .song-card');
    cards.forEach(c => { c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none'; });
}

function updatePlaybackNowPlaying() {
    const label = document.getElementById('nowPlaying');
    if (!label) return;
    if (playlistPlayback.isPlaying && playlistPlayback.index >= 0 && playlistPlayback.queue[playlistPlayback.index]) {
        label.textContent = `Now Playing: ${playlistPlayback.queue[playlistPlayback.index].name}`;
    } else {
        label.textContent = '';
    }
    const repeatBtn = document.getElementById('repeatBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (repeatBtn) repeatBtn.textContent = `Repeat: ${playlistPlayback.repeat ? 'On' : 'Off'}`;
    if (shuffleBtn) shuffleBtn.textContent = `Shuffle: ${playlistPlayback.shuffle ? 'On' : 'Off'}`;
}

function playlistPlay() {
    if (playlistPlayback.queue.length === 0) { showMessage('No songs in playlist', 'error'); return; }
    if (playlistPlayback.index < 0) playlistPlayback.index = 0;
    playlistPlayback.isPlaying = true;
    updatePlaybackNowPlaying();
}

function playlistStop() {
    playlistPlayback.isPlaying = false;
    updatePlaybackNowPlaying();
}

function playlistNext() {
    if (playlistPlayback.queue.length === 0) return;
    if (playlistPlayback.shuffle) {
        playlistPlayback.index = Math.floor(Math.random() * playlistPlayback.queue.length);
    } else if (playlistPlayback.index < playlistPlayback.queue.length - 1) {
        playlistPlayback.index += 1;
    } else if (playlistPlayback.repeat) {
        playlistPlayback.index = 0;
    } else {
        playlistStop();
        return;
    }
    playlistPlayback.isPlaying = true;
    updatePlaybackNowPlaying();
}

function playlistToggleRepeat() { playlistPlayback.repeat = !playlistPlayback.repeat; updatePlaybackNowPlaying(); }
function playlistToggleShuffle() { playlistPlayback.shuffle = !playlistPlayback.shuffle; updatePlaybackNowPlaying(); }
function playlistPlaySpecific(songId) {
    const idx = playlistPlayback.queue.findIndex(s => s.id === songId);
    if (idx >= 0) { playlistPlayback.index = idx; playlistPlayback.isPlaying = true; updatePlaybackNowPlaying(); }
}

async function resolveAndSetLoggedInName() {
    try {
        if (!currentUserEmail) return;
        const res = await fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (res.ok) { const user = await res.json(); currentUserName = user.username || currentUserName; }
    } catch (_) {}
}

async function resolveAndSetAdminName() {
    try {
        if (!currentUserEmail || currentUserType !== 'admin') return;
        const res = await fetch(`${ADMIN_API_BASE_URL}/api/admins/email/${currentUserEmail}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (res.ok) { const admin = await res.json(); currentAdminName = admin.username || currentAdminName; }
    } catch (_) {}
}

// Global music player state
let currentSong = null;
let isPlaying = false;
let isRepeat = false;
let isShuffle = false;
let currentTime = 0;
let totalTime = 0;
let progressInterval = null;

function playSong(songId, songName, artist) {
    // Show the music player bar
    const musicPlayer = document.getElementById('musicPlayer');
    if (musicPlayer) musicPlayer.classList.remove('hidden');
    
    // Update song info
    const titleEl = document.getElementById('currentSongTitle');
    const artistEl = document.getElementById('currentSongArtist');
    if (titleEl) titleEl.textContent = songName || `Song ${songId}`;
    if (artistEl) artistEl.textContent = artist || 'Unknown Artist';
    
    // Set current song
    currentSong = { id: songId, name: songName, artist: artist };
    
    // Start playing
    startPlayback();
    showMessage(`Now playing: ${songName || `Song ${songId}`}`, 'success');
}

function startPlayback() {
    isPlaying = true;
    updatePlayButton();
    
    // Simulate playback with progress
    totalTime = 180; // 3 minutes default
    currentTime = 0;
    updateTimeDisplay();
    
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (isPlaying && currentTime < totalTime) {
            currentTime++;
            updateProgress();
            updateTimeDisplay();
        } else if (currentTime >= totalTime) {
            // Song ended
            if (isRepeat) {
                currentTime = 0;
            } else {
                stopSong();
            }
        }
    }, 1000);
}

function togglePlay() {
    if (!currentSong) {
        showMessage('No song selected', 'error');
        return;
    }
    
    isPlaying = !isPlaying;
    updatePlayButton();
    
    if (isPlaying) {
        showMessage('Resumed playback', 'success');
    } else {
        showMessage('Paused playback', 'success');
    }
}

function stopSong() {
    isPlaying = false;
    currentTime = 0;
    updatePlayButton();
    updateProgress();
    updateTimeDisplay();
    
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    showMessage('Playback stopped', 'success');
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    const repeatBtn = document.getElementById('repeatBtn');
    if (repeatBtn) {
        repeatBtn.classList.toggle('active', isRepeat);
    }
    showMessage(`Repeat ${isRepeat ? 'enabled' : 'disabled'}`, 'success');
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', isShuffle);
    }
    showMessage(`Shuffle ${isShuffle ? 'enabled' : 'disabled'}`, 'success');
}

function updatePlayButton() {
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        const icon = playBtn.querySelector('i');
        if (icon) {
            icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    if (progressFill && totalTime > 0) {
        const percentage = (currentTime / totalTime) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

function updateTimeDisplay() {
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
    if (totalTimeEl) totalTimeEl.textContent = formatTime(totalTime);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Admin panel: songs CRUD + visibility
async function loadAdminSongs() {
    const list = document.getElementById('adminSongsList');
    if (!list) return;
    list.innerHTML = '<div class="loading"></div>';
    try {
        const response = await fetch(`${ADMIN_API_BASE_URL}/api/songs`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (response.ok) {
            const songs = await response.json();
            list.innerHTML = songs.map(s => `
                <div class="song-card" onclick="playSong(${s.id}, '${s.name.replace(/'/g, "\\'")}', '${(s.singer || 'Unknown Artist').replace(/'/g, "\\'")}')">
                    <h3>${s.name} <i class="fas fa-play-circle" style="color: #3498db; margin-left: 0.5rem; cursor: pointer;"></i></h3>
                    <p><strong>Singer:</strong> ${s.singer || ''}</p>
                    <p><strong>Music Director:</strong> ${s.musicDirector || ''}</p>
                    <p><strong>Album:</strong> ${s.albumName || ''}</p>
                    <p><strong>Release Date:</strong> ${s.releaseDate ? new Date(s.releaseDate).toLocaleDateString() : ''}</p>
                    <p><strong>Duration:</strong> ${s.durationMinutes ? s.durationMinutes + ' minutes' : ''}</p>
                    <p><strong>Visible:</strong> <span style="color: ${s.isVisible ? '#28a745' : '#dc3545'}; font-weight: bold;">${s.isVisible ? 'Yes' : 'No'}</span></p>
                    <div class="admin-action-bar" onclick="event.stopPropagation()">
                        <button class="action-btn visibility" onclick='toggleVisibility(${s.id})'>
                            <i class="fas fa-eye${s.isVisible ? '-slash' : ''}"></i> ${s.isVisible ? 'Hide' : 'Show'}
                        </button>
                        <button class="action-btn delete" onclick='deleteSong(${s.id})'>
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } else { list.innerHTML = '<p>Failed to load songs</p>'; }
    } catch (_) { list.innerHTML = '<p>Error loading songs</p>'; }
}

function resetSongForm(e) { if (e) e.preventDefault(); const f=document.getElementById('songForm'); if (f) f.reset(); const id=document.getElementById('songId'); if (id) id.value=''; }

async function submitSongForm(e) {
    if (e) e.preventDefault();
    const payload = {
        name: document.getElementById('songName').value,
        singer: document.getElementById('songSinger').value,
        musicDirector: document.getElementById('songDirector').value,
        albumName: document.getElementById('songAlbum').value,
        releaseDate: document.getElementById('songRelease').value || null,
        durationMinutes: parseInt(document.getElementById('songDuration').value || '0', 10),
        isVisible: true
    };
    const id = document.getElementById('songId').value;
    const url = `${ADMIN_API_BASE_URL}/api/songs` + (id ? `/${id}` : '');
    const method = id ? 'PUT' : 'POST';
    try {
        const res = await fetch(url, { method, headers: Object.assign({ 'Content-Type': 'application/json' }, authToken ? { 'Authorization': `Bearer ${authToken}` } : {}), body: JSON.stringify(payload) });
        if (res.ok) { showMessage('Song saved', 'success'); resetSongForm(); loadAdminSongs(); }
        else { showMessage('Save failed', 'error'); }
    } catch (_) { showMessage('Save failed', 'error'); }
}

async function deleteSong(id) {
    if (!confirm('Delete this song?')) return;
    try {
        const res = await fetch(`${ADMIN_API_BASE_URL}/api/songs/${id}`, { method: 'DELETE', headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (res.ok) { showMessage('Song deleted', 'success'); loadAdminSongs(); }
        else { showMessage('Delete failed', 'error'); }
    } catch (_) { showMessage('Delete failed', 'error'); }
}

async function toggleVisibility(id) {
    try {
        const res = await fetch(`${ADMIN_API_BASE_URL}/api/songs/${id}/toggle-visibility`, { method: 'PUT', headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (res.ok) { showMessage('Visibility toggled', 'success'); loadAdminSongs(); }
        else { showMessage('Toggle failed', 'error'); }
    } catch (_) { showMessage('Toggle failed', 'error'); }
}

async function showPlaylistStats(playlistId) {
    if (!currentUserEmail) { showMessage('Please login to view playlist stats', 'error'); return; }
    try {
        const userResponse = await fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (!userResponse.ok) { showMessage('User not found', 'error'); return; }
        const user = await userResponse.json();
        const response = await fetch(`${API_BASE_URL}/api/playlists/user/${user.id}/stats`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (response.ok) {
            const stats = await response.json();
            const playlistStats = stats.find(s => s.playlistId === playlistId);
            if (playlistStats) {
                const statsMessage = `Playlist: ${playlistStats.playlistName}\n` +
                    `Total Songs: ${playlistStats.totalSongs}\n` +
                    `Total Duration: ${playlistStats.totalDurationMinutes} minutes\n` +
                    `Average Duration: ${playlistStats.averageDuration} minutes\n` +
                    `Created: ${playlistStats.createdDate}`;
                alert(statsMessage);
            } else {
                showMessage('Playlist stats not found', 'error');
            }
        } else {
            showMessage('Failed to load playlist stats', 'error');
        }
    } catch (error) {
        showMessage('Error loading playlist stats', 'error');
    }
}

// Add Songs Modal Functions
let currentPlaylistId = null;
let selectedSongs = new Set();

function showAddSongsModal() {
    if (!currentPlaylistId) {
        showMessage('No playlist selected', 'error');
        return;
    }
    
    document.getElementById('addSongsModal').classList.remove('hidden');
    selectedSongs.clear();
    loadAvailableSongs();
}

function closeAddSongsModal() {
    document.getElementById('addSongsModal').classList.add('hidden');
    selectedSongs.clear();
}

async function loadAvailableSongs() {
    try {
        const response = await fetch(`${ADMIN_API_BASE_URL}/api/songs/visible`);
        if (response.ok) {
            const songs = await response.json();
            displayAvailableSongs(songs);
        } else {
            showMessage('Failed to load songs', 'error');
        }
    } catch (error) {
        showMessage('Error loading songs', 'error');
    }
}

async function searchAvailableSongs() {
    const searchTerm = document.getElementById('songSearchInput').value.trim();
    try {
        const url = searchTerm ? 
            `${ADMIN_API_BASE_URL}/api/songs/search/${encodeURIComponent(searchTerm)}` : 
            `${ADMIN_API_BASE_URL}/api/songs/visible`;
        
        const response = await fetch(url);
        if (response.ok) {
            const songs = await response.json();
            displayAvailableSongs(songs);
        } else {
            showMessage('Search failed', 'error');
        }
    } catch (error) {
        showMessage('Search error', 'error');
    }
}

function displayAvailableSongs(songs) {
    const container = document.getElementById('availableSongsList');
    if (!songs || songs.length === 0) {
        container.innerHTML = '<p>No songs available</p>';
        return;
    }
    
    container.innerHTML = songs.map(song => `
        <div class="song-card" style="cursor: pointer; border: 2px solid transparent;" 
             onclick="toggleSongSelection(${song.id}, this)">
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <input type="checkbox" id="song-${song.id}" style="margin-right: 0.5rem;" 
                       onchange="toggleSongSelection(${song.id}, this.parentElement.parentElement)">
                <h3 style="margin: 0;">${song.name}</h3>
            </div>
            <p><strong>Singer:</strong> ${song.singer || ''}</p>
            <p><strong>Album:</strong> ${song.albumName || ''}</p>
            <p><strong>Duration:</strong> ${song.durationMinutes ? song.durationMinutes + ' minutes' : ''}</p>
        </div>
    `).join('');
}

function toggleSongSelection(songId, cardElement) {
    const checkbox = document.getElementById(`song-${songId}`);
    
    if (selectedSongs.has(songId)) {
        selectedSongs.delete(songId);
        checkbox.checked = false;
        cardElement.style.border = '2px solid transparent';
        cardElement.style.backgroundColor = '';
    } else {
        selectedSongs.add(songId);
        checkbox.checked = true;
        cardElement.style.border = '2px solid #8b4513';
        cardElement.style.backgroundColor = 'rgba(139, 69, 19, 0.1)';
    }
}

async function addSelectedSongs() {
    if (selectedSongs.size === 0) {
        showMessage('Please select at least one song', 'error');
        return;
    }
    
    if (!currentPlaylistId) {
        showMessage('No playlist selected', 'error');
        return;
    }
    
    try {
        const songIds = Array.from(selectedSongs);
        const response = await fetch(`${API_BASE_URL}/api/playlists/${currentPlaylistId}/songs/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            },
            body: JSON.stringify({ songIds: songIds })
        });
        
        if (response.ok) {
            showMessage(`${songIds.length} song(s) added successfully`, 'success');
            closeAddSongsModal();
            loadPlaylistSongs(currentPlaylistId); // Refresh playlist view
        } else {
            const errorText = await response.text();
            showMessage(`Failed to add songs: ${errorText}`, 'error');
        }
    } catch (error) {
        showMessage('Error adding songs', 'error');
    }
}

// Message display function
function showMessage(message, type = 'info') {
    // Remove any existing message
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 4000);
}


