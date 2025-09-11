// Copied from frontend/script.js with same API base URLs
const API_BASE_URL = 'http://localhost:9002';
const ADMIN_API_BASE_URL = 'http://localhost:9001';

let currentUserEmail = null;
let currentUserName = null; // for user role
let currentAdminName = null; // for admin role
let currentUserType = null;
let authToken = null;
// simple client-side playback state for playlist detail
let playlistPlayback = { queue: [], index: -1, isPlaying: false, repeat: false, shuffle: false };
// context for playlist picker modal
let playlistPickContext = null;

// Initialize sections
const sections = {
    home: document.getElementById('home'),
    login: document.getElementById('login'),
    register: document.getElementById('register'),
    songs: document.getElementById('songs'),
    playlists: document.getElementById('playlists'),
    playlistDetail: document.getElementById('playlistDetail'),
    adminPanel: document.getElementById('adminPanel'),
};

// Hide all sections except home by default
Object.values(sections).forEach(section => {
    if (section && section.id !== 'home') {
        section.classList.add('hidden');
    } else if (section) {
        section.classList.remove('hidden');
    }
});

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
    if (sections[sectionName]) {
        sections[sectionName].classList.remove('hidden');
    }
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
async function showAdminPanel() { 
    // Verify admin privileges before showing the admin panel
    if (currentUserType !== 'admin') {
        showMessage('Unauthorized: Admin access required', 'error');
        return;
    }
    showSection('adminPanel'); 
    try {
        await loadAdminSongs();
    } catch (error) {
        console.error('Error loading admin panel:', error);
        showMessage('Failed to load admin panel. Please try again.', 'error');
    }
}

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
    // Show home section by default if no hash is present
    if (!window.location.hash) {
        showSection('home');
    } else {
        const section = window.location.hash.substring(1);
        if (sections[section]) {
            showSection(section);
        } else {
            showSection('home');
        }
    }

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
    const email = formData.get('email').trim();
    const password = formData.get('password');
    
    // Basic validation
    if (!email || !password) {
        showMessage('Please enter both email and password', 'error');
        return;
    }
    
    showMessage('Logging in...', 'info');
    
    try {
        if (userType === 'admin') {
            console.log('Attempting admin login for:', email);
            const response = await fetch(`${ADMIN_API_BASE_URL}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Admin login failed:', response.status, errorText);
                showMessage(`Login failed: ${errorText || 'Invalid credentials'}`, 'error');
                return;
            }
            
            const body = await response.json();
            authToken = body.token || null;
            
            if (!authToken) {
                console.error('No token received in login response');
                showMessage('Login failed: No authentication token received', 'error');
                return;
            }
            
            currentUserEmail = email;
            currentUserType = userType;
            
            // Log authentication information
            console.log('Admin login successful:', { 
                email: currentUserEmail, 
                userType: currentUserType,
                tokenPrefix: authToken ? authToken.substring(0, 10) + '...' : 'None'
            });
            
            // Reset form and update UI
            if (forms.login) { forms.login.reset(); }
            showMessage('Admin login successful!', 'success');
            
            try {
                await Promise.all([
                    resolveAndSetLoggedInName(),
                    resolveAndSetAdminName()
                ]);
                
                updateNavbar();
                personalizeHome();
                showAdminPanel(); // Take admin directly to admin panel
                
            } catch (error) {
                console.error('Error in post-login setup:', error);
                // Continue with login even if name resolution fails
                updateNavbar();
                personalizeHome();
                showAdminPanel();
            }
        } else {
            const response = await fetch(`${API_BASE_URL}/auth/login?email=${formData.get('email')}&password=${formData.get('password')}`, { method: 'POST' });
            if (response.ok) {
                const body = await response.json();
                authToken = body.token || null;
                currentUserEmail = email;
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
    
    // Reset previous errors
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });
    
    const formData = new FormData(e.target);
    const userType = formData.get('userType') || 'user';
    
    // Get and validate form data
    const username = formData.get('username')?.trim();
    const email = formData.get('email')?.trim();
    const password = formData.get('password');
    const phoneNumber = formData.get('phoneNumber')?.trim().replace(/[^0-9]/g, '');
    
    // Basic validation
    if (!username) {
        showErrorFor(document.getElementById('regUsername'), 'Username is required');
        return;
    }
    
    if (!email) {
        showErrorFor(document.getElementById('regEmail'), 'Email is required');
        return;
    }
    
    if (!password) {
        showErrorFor(document.getElementById('regPassword'), 'Password is required');
        return;
    }
    
    if (!phoneNumber || phoneNumber.length !== 10) {
        showErrorFor(document.getElementById('regPhone'), 'Phone number must be exactly 10 digits');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    
    // Add adminLevel for admin registration
    const userData = userType === 'admin' 
        ? { username, email, phoneNumber, password, adminLevel: "SUPER_ADMIN" }
        : { username, email, phoneNumber, password };
    showMessage('Registering...', 'success');
    try {
        const apiUrl = userType === 'admin' ? ADMIN_API_BASE_URL : API_BASE_URL;
        console.log('Sending registration request to:', `${apiUrl}/api/${userType === 'admin' ? 'admins' : 'users'}`);
        console.log('Registration data:', userData);
        
        const response = await fetch(`${apiUrl}/api/${userType === 'admin' ? 'admins' : 'users'}`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(userData) 
        });
        
        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            if (forms.register) { forms.register.reset(); }
            showLogin();
        } else {
            const errorText = await response.text();
            console.error('Registration failed:', response.status, errorText);
            
            // Try to parse as JSON, fallback to text
            let errorMessage = 'Registration failed';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorText;
            } catch (e) {
                // Handle common 500 errors
                if (response.status === 500) {
                    errorMessage = 'Email, username, or phone number already exists. Please use different values.';
                } else {
                    errorMessage = errorText || 'Please check your input';
                }
            }
            
            showMessage(`Registration failed: ${errorMessage}`, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(`Registration failed: ${error.message}`, 'error');
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

async function loadSongs() {
    const songsList = document.getElementById('songsList');
    songsList.innerHTML = '<div class="loading"></div>';
    try {
        // If admin is logged in, show all songs; otherwise show only visible songs
        const endpoint = (currentUserType === 'admin' && authToken) ? 
            `${ADMIN_API_BASE_URL}/api/songs` : 
            `${ADMIN_API_BASE_URL}/api/songs/visible`;
        
        const headers = (currentUserType === 'admin' && authToken) ? 
            { 'Authorization': `Bearer ${authToken}` } : {};
        
        const response = await fetch(endpoint, { headers });
        if (response.ok) { 
            const songs = await response.json(); 
            displaySongs(songs); 
        }
        else { songsList.innerHTML = '<p>Failed to load songs</p>'; }
    } catch (error) { 
        console.error('Error loading songs:', error);
        songsList.innerHTML = '<p>Error loading songs</p>'; 
    }
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

// Show create playlist modal
function showCreatePlaylist() {
    if (!currentUserEmail) {
        showMessage('Please login to create playlists', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Playlist</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="playlistName">Playlist Name</label>
                    <input type="text" id="playlistName" class="form-control" placeholder="My Awesome Playlist" required>
                </div>
                <div class="form-group">
                    <label for="playlistDescription">Description (Optional)</label>
                    <textarea id="playlistDescription" class="form-control" rows="3" placeholder="Add a description..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancelCreatePlaylist">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmCreatePlaylist">Create Playlist</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });

    // Close button
    modal.querySelector('.close-btn').addEventListener('click', () => closeModal(modal));
    
    // Cancel button
    modal.querySelector('#cancelCreatePlaylist').addEventListener('click', () => closeModal(modal));
    
    // Create button
    modal.querySelector('#confirmCreatePlaylist').addEventListener('click', () => {
        const name = modal.querySelector('#playlistName').value.trim();
        const description = modal.querySelector('#playlistDescription').value.trim();
        
        if (name === '') {
            showMessage('Playlist name cannot be empty', 'error');
            return;
        }
        
        closeModal(modal);
        createPlaylist(name, description);
    });
    
    // Focus the input field
    setTimeout(() => {
        const input = modal.querySelector('#playlistName');
        if (input) input.focus();
    }, 100);
}

// Close modal helper function
function closeModal(modal) {
    modal.style.animation = 'fadeOut 0.3s';
    setTimeout(() => {
        modal.remove();
    }, 300);
}

async function createPlaylist(name, description = '') {
    console.log('Starting playlist creation with name:', name);
    
    if (!currentUserEmail) { 
        console.error('No current user email found');
        showMessage('Please login to create playlists', 'error'); 
        return; 
    }
    
    try {
        console.log('Fetching user data for:', currentUserEmail);
        const userResponse = await fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`, { 
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });
        
        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error('Failed to fetch user data:', errorText);
            showMessage('Failed to load user information', 'error');
            return;
        }
        
        const user = await userResponse.json();
        console.log('User data loaded:', user);
        
        if (!user || !user.id) {
            console.error('Invalid user data received:', user);
            showMessage('Invalid user information', 'error');
            return;
        }
        
        currentUserName = user.username || currentUserName;
        const playlistData = { 
            name: name, 
            description: description,
            userId: user.id,
            createdBy: user.id,
            isPublic: false
        };
        
        console.log('Creating playlist with data:', playlistData);
        
        const response = await fetch(`${API_BASE_URL}/api/playlists/user/${user.id}`, { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            }, 
            body: JSON.stringify(playlistData) 
        });
        
        const responseData = await response.json().catch(() => ({}));
        
        if (response.ok) {
            console.log('Playlist created successfully:', responseData);
            showMessage('Playlist created successfully!', 'success');
            // Refresh the playlists list
            loadPlaylists();
            // Switch to playlists view
            showSection('playlists');
        } else {
            console.error('Failed to create playlist:', response.status, responseData);
            const errorMsg = responseData.message || 'Unknown error occurred';
            showMessage(`Failed to create playlist: ${errorMsg}`, 'error');
        }
    } catch (error) {
        console.error('Error in createPlaylist:', error);
        showMessage(`Error creating playlist: ${error.message}`, 'error');
    }
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
        
        const userResponse = await fetch(`${USER_API_BASE_URL}/api/users/email/${currentUserEmail}`, { 
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
        const userResponse = await fetch(`${USER_API_BASE_URL}/api/users/email/${currentUserEmail}`, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
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
        const res = await fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`, { 
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} 
        });
        if (res.ok) { 
            const user = await res.json(); 
            currentUserName = user.username || currentUserEmail.split('@')[0];
            console.log('Set currentUserName:', currentUserName);
            // Update the welcome message with the new name
            personalizeHome();
        }
    } catch (error) {
        console.error('Error resolving user name:', error);
    }
}

async function resolveAndSetAdminName() {
    try {
        if (!currentUserEmail || currentUserType !== 'admin') return;
        const res = await fetch(`${ADMIN_API_BASE_URL}/api/admins/email/${currentUserEmail}`, { 
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} 
        });
        if (res.ok) { 
            const admin = await res.json(); 
            currentAdminName = admin.username || currentUserEmail.split('@')[0];
            console.log('Set currentAdminName:', currentAdminName);
            // Update the welcome message with the new admin name
            personalizeHome();
        }
    } catch (error) {
        console.error('Error resolving admin name:', error);
    }
}

// Navigation State
let isMenuOpen = false;

// DOM Elements
const menuToggleBtn = document.querySelector('.menu-toggle');
const sideNav = document.querySelector('.sidenav');
const profileToggleBtn = document.querySelector('.profile');
const profileDropdown = document.querySelector('.profile-menu');
const mainContent = document.querySelector('.main-content-wrapper');

// Toggle Side Navigation
function toggleMenu() {
    if (!sideNav) return;
    
    isMenuOpen = !isMenuOpen;
    sideNav.classList.toggle('active', isMenuOpen);
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    
    // Update ARIA attributes
    if (menuToggleBtn) {
        menuToggleBtn.setAttribute('aria-expanded', isMenuOpen);
        menuToggleBtn.setAttribute('aria-label', isMenuOpen ? 'Close menu' : 'Open menu');
    }
}

// Toggle Profile Menu
function toggleProfileMenu() {
    if (!profileToggleBtn || !profileDropdown) return;
    
    const isExpanded = profileToggleBtn.getAttribute('aria-expanded') === 'true';
    profileToggleBtn.setAttribute('aria-expanded', !isExpanded);
    profileDropdown.classList.toggle('active', !isExpanded);
}

// Close menus when clicking outside
function handleClickOutside(event) {
    // Close profile menu if clicking outside
    if (profileDropdown && profileToggleBtn && 
        !profileToggleBtn.contains(event.target) && 
        !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove('active');
        profileToggleBtn.setAttribute('aria-expanded', 'false');
    }
    
    // Close side menu on mobile when clicking on main content
    if (window.innerWidth < 1024 && isMenuOpen && 
        sideNav && menuToggleBtn &&
        !sideNav.contains(event.target) && 
        !menuToggleBtn.contains(event.target)) {
        toggleMenu();
    }
}

// Handle keyboard navigation
function handleKeyDown(event) {
    if (event.key !== 'Escape') return;
    
    // Close menus on Escape key
    if (isMenuOpen) toggleMenu();
    
    if (profileDropdown && profileToggleBtn) {
        profileDropdown.classList.remove('active');
        profileToggleBtn.setAttribute('aria-expanded', 'false');
    }
}

// Initialize navigation
function initNavigation() {
    // Add event listeners
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', toggleMenu);
    if (profileToggleBtn) profileToggleBtn.addEventListener('click', toggleProfileMenu);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    // Close menu when clicking on nav links (for mobile)
    const navLinks = document.querySelectorAll('.sidenav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                toggleMenu();
            }
        });
    });
    
    // Update active nav link based on current URL
    updateActiveNavLink();
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!sideNav) return;
            
            if (window.innerWidth >= 1024) {
                sideNav.classList.add('active');
                isMenuOpen = true;
            } else {
                sideNav.classList.remove('active');
                isMenuOpen = false;
            }
        }, 250);
    });
}

// Update active nav link based on current URL
function updateActiveNavLink() {
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidenav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && path.includes(href.split('?')[0])) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Update page title in header
function updatePageTitle(title) {
    const titleElement = document.querySelector('.header-title');
    if (titleElement) {
        titleElement.textContent = title;
    }
    document.title = `${title} | Music Library`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    
    // Set initial state for desktop
    if (window.innerWidth >= 1024) {
        sideNav.classList.add('active');
        isMenuOpen = true;
    }
});

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

/**
 * Loads all songs for the admin panel with enhanced error handling and permission checks
 */
async function loadAdminSongs() {
    const list = document.getElementById('adminSongsList');
    if (!list) {
        console.error('Admin songs list element not found');
        return;
    }
    
    // Verify admin privileges
    if (currentUserType !== 'admin') {
        list.innerHTML = '<div class="error-message">Unauthorized: Admin access required</div>';
        return;
    }
    
    // Show loading state
    list.innerHTML = '<div class="loading">Loading songs...</div>';
    try {
        console.log('Loading admin songs with token:', authToken ? 'Token exists' : 'No token');
        const response = await fetch(`${ADMIN_API_BASE_URL}/api/songs`, { 
            headers: authToken ? { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            } : {}
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const songs = await response.json();
        console.log(`Loaded ${songs.length} songs`);
        
        if (songs.length === 0) {
            list.innerHTML = `
                <div class="no-songs">
                    <i class="fas fa-music" style="font-size: 3rem; color: #95a5a6; margin-bottom: 1rem;"></i>
                    <h3>No songs found</h3>
                    <p>Click the "Add New Song" button to get started.</p>
                </div>`;
            return;
        }
        
        list.innerHTML = `
            <div class="admin-songs-header">
                <h2>Manage Songs</h2>
                <button class="btn btn-primary" onclick="showSongForm()">
                    <i class="fas fa-plus"></i> Add New Song
                </button>
            </div>
            <div class="songs-grid">
                ${songs.map(s => `
                    <div class="admin-song-card" data-id="${s.id}">
                        <div class="song-card-header">
                            <h3>${escapeHtml(s.name)}</h3>
                            <div class="song-actions">
                                <button class="btn-icon" onclick="editSong(${s.id}, event)" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="deleteSong(${s.id}, event)" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="btn-icon ${s.visible ? 'active' : ''}" 
                                        onclick="toggleVisibility(${s.id}, event)" 
                                        title="${s.visible ? 'Visible' : 'Hidden'}">
                                    <i class="fas ${s.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                                </button>
                            </div>
                        </div>
                        <div class="song-details">
                            <p><strong>Singer:</strong> ${escapeHtml(s.singer || 'N/A')}</p>
                            <p><strong>Music Director:</strong> ${escapeHtml(s.musicDirector || 'N/A')}</p>
                            <p><strong>Album:</strong> ${escapeHtml(s.albumName || 'N/A')}</p>
                            <p><strong>Release Date:</strong> ${s.releaseDate ? new Date(s.releaseDate).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Status:</strong> 
                                <span class="badge ${s.visible ? 'badge-success' : 'badge-warning'}">
                                    ${s.visible ? 'Visible' : 'Hidden'}
                                </span>
                            </p>
                        </div>
                    </div>`).join('')}
            </div>`;
    } catch (error) { 
        console.error('Error loading admin songs:', error);
        list.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load songs</h3>
                <p>${error.message || 'Please try again later'}</p>
                <button class="btn btn-primary" onclick="loadAdminSongs()">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>`;
    }
}

/**
 * Shows the song form for creating or editing a song
 * @param {number} [id] - The ID of the song to edit, or undefined for a new song
 */
function showSongForm(id) {
    // Verify admin privileges
    if (currentUserType !== 'admin') {
        showMessage('Unauthorized: Admin access required', 'error');
        return;
    }
    
    const modal = document.getElementById('songFormModal');
    const form = document.getElementById('songForm');
    
    if (id) {
        // Edit mode - load existing song
        editSong(id);
    } else {
        // Create mode - clear form and show modal
        form.reset();
        // Ensure visibility checkbox is checked by default for new songs
        document.getElementById('songVisible').checked = true;
        document.getElementById('songFormTitle').textContent = 'Add New Song';
        modal.classList.remove('hidden');
    }
}

/**
 * Loads a song's data into the form for editing
 * @param {number} id - The ID of the song to edit
 */
async function loadSongForEditing(id) {
    try {
        showMessage('Loading song data...', 'info');
        const response = await fetch(`${ADMIN_API_BASE_URL}/api/songs/${id}`, {
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });

        if (!response.ok) {
            throw new Error('Failed to load song data');
        }

        const song = await response.json();
        
        // Fill the form with song data
        document.getElementById('songId').value = song.id || '';
        document.getElementById('songName').value = song.name || '';
        document.getElementById('songSinger').value = song.singer || '';
        document.getElementById('songDirector').value = song.musicDirector || '';
        document.getElementById('songAlbum').value = song.albumName || '';
        document.getElementById('songRelease').value = song.releaseDate ? song.releaseDate.split('T')[0] : '';
        document.getElementById('songDuration').value = song.durationMinutes || '';
        
    } catch (error) {
        console.error('Error loading song for editing:', error);
        showMessage(`Error loading song: ${error.message}`, 'error');
    }
}

/**
 * Resets the song form to its initial state
 * @param {Event} [e] - Optional event object to prevent default form submission
 */
function resetSongForm(e) { 
    if (e) e.preventDefault(); 
    const form = document.getElementById('songForm'); 
    if (form) {
        form.reset();
        const idField = document.getElementById('songId');
        if (idField) idField.value = '';
        
        // Clear any validation errors
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(el => el.remove());
    } 
}

async function submitSongForm(e) {
    if (e) e.preventDefault();
    
    // Check if user is logged in as admin
    if (currentUserType !== 'admin') {
        showMessage('Unauthorized: Admin access required', 'error');
        return;
    }
    
    // Validate required fields
    const name = document.getElementById('songName').value.trim();
    const singer = document.getElementById('songSinger').value.trim();
    const musicDirector = document.getElementById('songDirector').value.trim();
    
    if (!name || !singer || !musicDirector) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    const payload = {
        name: name,
        singer: singer,
        musicDirector: musicDirector,
        albumName: document.getElementById('songAlbum').value.trim(),
        releaseDate: document.getElementById('songRelease').value || null,
        durationMinutes: parseInt(document.getElementById('songDuration').value || '0', 10),
        isVisible: true
    };
    
    const id = document.getElementById('songId').value;
    const url = `${ADMIN_API_BASE_URL}/api/songs` + (id ? `/${id}` : '');
    const method = id ? 'PUT' : 'POST';
    
    try {
        showMessage('Saving song...', 'info');
        const res = await fetch(url, { 
            method, 
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            }, 
            body: JSON.stringify(payload) 
        });
        
        if (res.ok) {
            const result = await res.json();
            showMessage(`Song ${id ? 'updated' : 'created'} successfully!`, 'success');
            resetSongForm(); 
            await loadAdminSongs(); 
            loadSongs();
        } else {
            const error = await res.text();
            console.error('Failed to save song:', error);
            showMessage(`Failed to save song: ${error}`, 'error');
        }
    } catch (error) { 
        console.error('Error saving song:', error);
        showMessage('Failed to save song. Please try again.', 'error'); 
    }
}

async function deleteSong(id) {
    if (!confirm('Are you sure you want to delete this song? This action cannot be undone.')) return;
    
    // Check if user is logged in as admin
    if (currentUserType !== 'admin') {
        showMessage('Unauthorized: Admin access required', 'error');
        return;
    }
    
    try {
        showMessage('Deleting song...', 'info');
        const res = await fetch(`${ADMIN_API_BASE_URL}/api/songs/${id}`, { 
            method: 'DELETE', 
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} 
        });
        
        if (res.ok) { 
            showMessage('Song deleted successfully', 'success'); 
            await loadAdminSongs(); 
            loadSongs(); // Refresh the main songs list if needed
        } else {
            const error = await res.text();
            console.error('Failed to delete song:', error);
            showMessage(`Failed to delete song: ${error}`, 'error');
        }
    } catch (error) { 
        console.error('Error deleting song:', error);
        showMessage('Failed to delete song. Please try again.', 'error'); 
    }
}

async function toggleVisibility(id) {
    // Check if user is logged in as admin
    if (currentUserType !== 'admin') {
        showMessage('Unauthorized: Admin access required', 'error');
        return;
    }
    
    try {
        showMessage('Updating song visibility...', 'info');
        const res = await fetch(`${ADMIN_API_BASE_URL}/api/songs/${id}/toggle-visibility`, { 
            method: 'PUT', 
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });
        
        if (res.ok) { 
            const result = await res.json();
            showMessage(`Song visibility updated to ${result.isVisible ? 'visible' : 'hidden'}`, 'success'); 
            await loadAdminSongs();
            loadSongs(); // Refresh the main songs list if needed
        } else {
            const error = await res.text();
            console.error('Failed to toggle visibility:', error);
            showMessage(`Failed to update visibility: ${error}`, 'error');
        }
    } catch (error) { 
        console.error('Error toggling visibility:', error);
        showMessage('Failed to update visibility. Please try again.', 'error'); 
    }
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

// Message
/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} unsafe - The unsafe HTML string
 * @returns {string} The escaped HTML string
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper function to show form field errors
function showErrorFor(inputElement, message) {
    // Remove existing error
    const existingError = inputElement.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error class to form group
    inputElement.parentNode.classList.add('error');
    
    // Create and add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    inputElement.parentNode.appendChild(errorDiv);
    
    // Focus the input
    inputElement.focus();
}

// Admin Panel Functions
function showAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const targetTab = document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked tab button
    event.target.classList.add('active');
    
    // Load data for the selected tab
    switch(tabName) {
        case 'songs':
            loadAdminSongs();
            updateAdminStats();
            break;
        case 'notifications':
            loadNotificationHistory();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

function updateAdminStats() {
    // Update admin dashboard statistics
    fetch(`${ADMIN_API_BASE_URL}/api/songs`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        credentials: 'include'
    })
    .then(response => response.json())
    .then(songs => {
        document.getElementById('totalSongs').textContent = songs.length;
        document.getElementById('visibleSongs').textContent = songs.filter(s => s.visible).length;
    })
    .catch(error => console.error('Error loading stats:', error));
    
    // Load user count (you'll need to implement this endpoint)
    fetch(`${API_BASE_URL}/api/users/count`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalUsers').textContent = data.count || 0;
    })
    .catch(error => console.error('Error loading user count:', error));
}

function closeSongForm() {
    const modal = document.getElementById('songFormModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function editSong(songId) {
    // Find the song data from the loaded songs
    fetch(`${ADMIN_API_BASE_URL}/api/songs/${songId}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(song => {
        // Populate the form with song data
        document.getElementById('songName').value = song.name || '';
        document.getElementById('songSinger').value = song.singer || '';
        document.getElementById('songDirector').value = song.musicDirector || '';
        document.getElementById('songAlbum').value = song.albumName || '';
        document.getElementById('songRelease').value = song.releaseDate || '';
        document.getElementById('songDuration').value = song.durationMinutes || '';
        document.getElementById('songGenre').value = song.genre || '';
        document.getElementById('songVisible').checked = song.isVisible !== false;
        document.getElementById('songId').value = songId;
        
        // Update modal title
        document.getElementById('songFormTitle').textContent = 'Edit Song';
        
        // Show the modal
        const modal = document.getElementById('songFormModal');
        modal.classList.remove('hidden');
    })
    .catch(error => {
        console.error('Error loading song for edit:', error);
        showMessage('Error loading song details', 'error');
    });
}

async function submitSongForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('songForm');
    const formData = new FormData(form);
    const songId = formData.get('id');
    const isEdit = songId && songId !== '';
    
    // Get form values
    const songData = {
        name: formData.get('name'),
        singer: formData.get('singer'),
        musicDirector: formData.get('musicDirector'),
        albumName: formData.get('album') || 'Unknown Album',
        releaseDate: formData.get('releaseDate') || new Date().toISOString().split('T')[0],
        durationMinutes: formData.get('duration') ? Math.round(parseFloat(formData.get('duration'))) : null,
        genre: formData.get('genre') || '',
        isVisible: formData.get('visible') === 'on'
    };
    
    // Validate required fields
    if (!songData.name || !songData.singer || !songData.musicDirector) {
        showMessage('Please fill in all required fields (Song Name, Singer, Music Director)', 'error');
        return;
    }
    
    try {
        console.log('Submitting song data:', songData);
        
        // Show loading state
        const submitBtn = document.querySelector('#songFormModal .btn-primary');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Save Song';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }
        
        const url = isEdit ? `${ADMIN_API_BASE_URL}/api/songs/${songId}` : `${ADMIN_API_BASE_URL}/api/songs`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(songData)
        });
        
        if (response.ok) {
            const savedSong = await response.json();
            console.log('Song saved successfully:', savedSong);
            showMessage(isEdit ? 'Song updated successfully!' : 'Song added successfully!', 'success');
            closeSongForm();
            form.reset();
            document.getElementById('songId').value = '';
            document.getElementById('songFormTitle').textContent = 'Add New Song';
            // Reload songs list
            await loadSongs();
        } else {
            const errorText = await response.text();
            console.error('Failed to save song:', response.status, errorText);
            showMessage(`Failed to save song: ${errorText}`, 'error');
        }
    } catch (error) {
        console.error('Error saving song:', error);
        showMessage(`Error saving song: ${error.message}`, 'error');
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('#songFormModal .btn-primary');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Song';
        }
    }
}

function sendNotification() {
    const form = document.getElementById('notificationForm');
    const formData = new FormData(form);
    
    const notification = {
        title: formData.get('title'),
        message: formData.get('message'),
        type: formData.get('type'),
        timestamp: new Date().toISOString()
    };
    
    // Send notification via notification service
    fetch(`${ADMIN_API_BASE_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(notification),
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            showMessage('Notification sent successfully!', 'success');
            form.reset();
            loadNotificationHistory();
        } else {
            throw new Error('Failed to send notification');
        }
    })
    .catch(error => {
        console.error('Error sending notification:', error);
        showMessage('Failed to send notification', 'error');
    });
}

function loadNotificationHistory() {
    fetch(`${ADMIN_API_BASE_URL}/api/notifications/history`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        credentials: 'include'
    })
    .then(response => response.json())
    .then(notifications => {
        displayNotifications(notifications);
    })
    .catch(error => {
        console.error('Error loading notifications:', error);
        document.getElementById('notificationsList').innerHTML = '<p>No notifications found</p>';
    });
}

function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    
    if (!notifications || notifications.length === 0) {
        container.innerHTML = '<p>No notifications sent yet</p>';
        return;
    }
    
    container.innerHTML = notifications.map(notification => `
        <div class="notification-item">
            <div class="notification-content">
                <h4>${escapeHtml(notification.title)}</h4>
                <p>${escapeHtml(notification.message)}</p>
                <div class="notification-meta">
                    Type: ${notification.type} | Sent: ${new Date(notification.timestamp).toLocaleString()}
                </div>
            </div>
        </div>
    `).join('');
}

function loadUsers() {
    fetch(`${API_BASE_URL}/api/users`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        credentials: 'include'
    })
    .then(response => response.json())
    .then(users => {
        displayUsers(users);
    })
    .catch(error => {
        console.error('Error loading users:', error);
        document.getElementById('usersList').innerHTML = '<p>Error loading users</p>';
    });
}

function displayUsers(users) {
    const container = document.getElementById('usersList');
    
    if (!users || users.length === 0) {
        container.innerHTML = '<p>No users found</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-info">
                <h4>${escapeHtml(user.username)}</h4>
                <p><i class="fas fa-envelope"></i> ${escapeHtml(user.email)}</p>
                <p><i class="fas fa-phone"></i> ${escapeHtml(user.phoneNumber || 'N/A')}</p>
                <p><i class="fas fa-calendar"></i> Joined: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.trim();
    
    fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        credentials: 'include'
    })
    .then(response => response.json())
    .then(users => {
        displayUsers(users);
    })
    .catch(error => {
        console.error('Error searching users:', error);
        loadUsers(); // Fallback to loading all users
    });
}

// Logout function
function logout() {
    // Clear all authentication data
    authToken = null;
    currentUserEmail = null;
    currentUserName = null;
    currentAdminName = null;
    currentUserType = null;
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('adminName');
    
    // Update UI
    updateNavbar();
    
    // Show success message
    showMessage('Logged out successfully', 'success');
    
    // Redirect to home
    showSection('home');
    window.location.hash = '#home';
}

// Helper function to show a message
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


