// Copied from frontend/script.js with same API base URLs
const API_BASE_URL = 'http://localhost:8081';
const ADMIN_API_BASE_URL = 'http://localhost:8083';

let currentUserEmail = null;
let currentUserName = null; // for user role
let currentAdminName = null; // for admin role
let currentUserType = null;
let authToken = null;

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
}

function showLogin() { showSection('login'); if (forms.login) { forms.login.reset(); } }
function showRegister() { showSection('register'); if (forms.register) { forms.register.reset(); } }
function showSongs() { showSection('songs'); loadSongs(); }
function showPlaylists() { showSection('playlists'); loadPlaylists(); }
function showAdminPanel() { showSection('adminPanel'); loadAdminSongs(); }

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

    forms.login.addEventListener('submit', handleLogin);
    forms.register.addEventListener('submit', handleRegister);
    updateNavbar();
    personalizeHome();
    showSection('home');
});

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
                showMessage('Login successful!', 'success');
                if (forms.login) { forms.login.reset(); }
                await resolveAndSetLoggedInName();
                await resolveAndSetAdminName();
                updateNavbar();
                personalizeHome();
                showSongs();
            } else {
                showMessage('Invalid credentials!', 'error');
            }
        } else {
            const response = await fetch(`${API_BASE_URL}/auth/login?email=${loginData.email}&password=${loginData.password}`, { method: 'POST' });
            if (response.ok) {
                const body = await response.json();
                authToken = body.token || null;
                currentUserEmail = loginData.email;
                currentUserType = userType;
                showMessage('Login successful!', 'success');
                if (forms.login) { forms.login.reset(); }
                await resolveAndSetLoggedInName();
                updateNavbar();
                personalizeHome();
                showSongs();
            } else {
                showMessage('Invalid credentials!', 'error');
            }
        }
    } catch (error) {
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
    songsList.innerHTML = songs.map(song => `
        <div class="song-card">
            <h3>${song.name}</h3>
            <p><strong>Singer:</strong> ${song.singer}</p>
            <p><strong>Music Director:</strong> ${song.musicDirector}</p>
            <p><strong>Album:</strong> ${song.albumName}</p>
            <p><strong>Release Date:</strong> ${new Date(song.releaseDate).toLocaleDateString()}</p>
            ${song.durationMinutes ? `<p><strong>Duration:</strong> ${song.durationMinutes} minutes</p>` : ''}
            <div class="song-actions">
                <button class="btn btn-primary btn-small" onclick="addToPlaylist(${song.id}, '${song.name}')"><i class="fas fa-plus"></i> Add to Playlist</button>
                <button class="btn btn-secondary btn-small" onclick="playSong(${song.id})"><i class="fas fa-play"></i> Play</button>
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
    if (!currentUserEmail) { document.getElementById('playlistsList').innerHTML = '<p>Please login to view playlists</p>'; return; }
    const playlistsList = document.getElementById('playlistsList');
    playlistsList.innerHTML = '<div class="loading"></div>';
    try {
        const userResponse = await fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (userResponse.ok) {
            const user = await userResponse.json();
            currentUserName = user.username || currentUserName;
            const response = await fetch(`${API_BASE_URL}/api/playlists/user/${user.id}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
            if (response.ok) { const playlists = await response.json(); displayPlaylists(playlists); }
            else { playlistsList.innerHTML = '<p>Failed to load playlists</p>'; }
        } else { playlistsList.innerHTML = '<p>User not found</p>'; }
    } catch (error) { playlistsList.innerHTML = '<p>Error loading playlists</p>'; }
}

function displayPlaylists(playlists) {
    const playlistsList = document.getElementById('playlistsList');
    if (playlists.length === 0) { playlistsList.innerHTML = '<p>No playlists created yet</p>'; return; }
    playlistsList.innerHTML = playlists.map(playlist => `
        <div class="playlist-card">
            <h3>${playlist.name}</h3>
            <p>${playlist.description || 'No description'}</p>
            <p><strong>Created:</strong> ${new Date(playlist.createdAt).toLocaleDateString()}</p>
            <div class="playlist-actions">
                <button class="btn btn-primary btn-small" onclick="openPlaylist(${playlist.id}, '${playlist.name.replace(/'/g, "\\'")}')"><i class="fas fa-eye"></i> View</button>
                <button class="btn btn-secondary btn-small" onclick="renamePlaylist(${playlist.id}, '${playlist.name.replace(/'/g, "\\'")}')"><i class="fas fa-edit"></i> Rename</button>
                <button class="btn btn-secondary btn-small" onclick="deletePlaylist(${playlist.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
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
    if (!currentUserEmail) { showMessage('Please login to add songs to playlists', 'error'); return; }
    const playlistId = prompt('Enter playlist ID to add song to:');
    if (playlistId) {
        try {
            const playlistSongData = { songId: songId, songName: songName };
            const response = await fetch(`${API_BASE_URL}/api/playlist-songs/playlist/${playlistId}?songId=${songId}&songName=${encodeURIComponent(songName)}`, { method: 'POST', headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
            if (response.ok) { showMessage('Song added to playlist!', 'success'); }
            else { showMessage('Failed to add song to playlist', 'error'); }
        } catch (error) { showMessage('Error adding song to playlist', 'error'); }
    }
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
    showSection('playlistDetail');
    const title = document.getElementById('playlistDetailTitle');
    if (title) title.textContent = name || 'Playlist';
    loadPlaylistSongs(id);
}

async function loadPlaylistSongs(id) {
    const list = document.getElementById('playlistSongsList');
    list.innerHTML = '<div class="loading"></div>';
    try {
        const response = await fetch(`${API_BASE_URL}/api/playlist-songs/playlist/${id}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (response.ok) {
            const songs = await response.json();
            list.innerHTML = songs.map(ps => `
                <div class="song-card">
                    <h3>${ps.songName || 'Song ' + ps.songId}</h3>
                    <div class="song-actions">
                        <button class="btn btn-secondary btn-small" onclick="removeSongFromPlaylist(${id}, ${ps.songId})"><i class="fas fa-trash"></i> Remove</button>
                    </div>
                </div>
            `).join('');
        } else { list.innerHTML = '<p>Failed to load playlist songs</p>'; }
    } catch (_) { list.innerHTML = '<p>Error loading playlist songs</p>'; }
}

async function removeSongFromPlaylist(playlistId, songId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/playlist-songs/playlist/${playlistId}/song/${songId}`, { method: 'DELETE', headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
        if (response.ok) { showMessage('Removed from playlist', 'success'); loadPlaylistSongs(playlistId); }
        else { showMessage('Remove failed', 'error'); }
    } catch (_) { showMessage('Remove failed', 'error'); }
}

function backToPlaylists() { showPlaylists(); }

function filterPlaylistSongs() {
    const q = (document.getElementById('playlistSongSearch')?.value || '').toLowerCase();
    const cards = document.querySelectorAll('#playlistSongsList .song-card');
    cards.forEach(c => { c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none'; });
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

function playSong(songId) { /* placeholder for future playback */ }

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
                <div class="song-card">
                    <h3>${s.name}</h3>
                    <p><strong>Singer:</strong> ${s.singer || ''}</p>
                    <p><strong>Album:</strong> ${s.albumName || ''}</p>
                    <p><strong>Visible:</strong> ${s.isVisible ? 'Yes' : 'No'}</p>
                    <div class="song-actions">
                        <button class="btn btn-primary btn-small" onclick='editSong(${JSON.stringify({id:""}).replace("{}","" )})'>Edit</button>
                    </div>
                </div>
            `).replace(/\{id:""\}/g, JSON.stringify(s).replace(/'/g, "&apos;"));
        } else { list.innerHTML = '<p>Failed to load songs</p>'; }
    } catch (_) { list.innerHTML = '<p>Error loading songs</p>'; }
}

function resetSongForm(e) { if (e) e.preventDefault(); const f=document.getElementById('songForm'); if (f) f.reset(); const id=document.getElementById('songId'); if (id) id.value=''; }

function editSong(song) {
    if (!song) return;
    document.getElementById('songId').value = song.id || '';
    document.getElementById('songName').value = song.name || '';
    document.getElementById('songSinger').value = song.singer || '';
    document.getElementById('songDirector').value = song.musicDirector || '';
    document.getElementById('songAlbum').value = song.albumName || '';
    document.getElementById('songRelease').value = song.releaseDate ? String(song.releaseDate).substring(0,10) : '';
    document.getElementById('songDuration').value = song.durationMinutes || '';
}

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

function showMessage(message, type) {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    setTimeout(() => { messageDiv.remove(); }, 5000);
}


