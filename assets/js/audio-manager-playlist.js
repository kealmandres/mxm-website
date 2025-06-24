/**
 * MxM Website - Audio Manager Playlist
 * Handles playlist functionality and audio management
 */

class AudioManagerPlaylist {
    constructor() {
        this.currentTrack = 0;
        this.isPlaying = false;
        this.playlist = [];
        this.init();
    }
    
    init() {
        this.setupPlaylist();
        this.bindEvents();
    }
    
    setupPlaylist() {
        // Default playlist - can be overridden
        this.playlist = [
            {
                title: "MxM Mix Track 1",
                src: "../assets/audio/background-music.mp3",
                duration: "3:45"
            },
            {
                title: "MxM Mix Track 2", 
                src: "../assets/audio/background-music.ogg",
                duration: "4:12"
            }
        ];
        
        // Check if persistent music player exists and sync with it
        if (window.persistentMusicPlayer) {
            this.syncWithPersistentPlayer();
        }
    }
    
    syncWithPersistentPlayer() {
        // Sync with the persistent music player
        const persistentPlayer = window.persistentMusicPlayer;
        if (persistentPlayer) {
            this.isPlaying = persistentPlayer.isPlaying();
            this.currentTrack = persistentPlayer.getCurrentTrackIndex() || 0;
        }
    }
    
    bindEvents() {
        // Listen for persistent music player events
        document.addEventListener('musicStateChanged', (e) => {
            this.isPlaying = e.detail.isPlaying;
            this.currentTrack = e.detail.currentTrack || 0;
            this.updateUI();
        });
        
        // Setup playlist controls if they exist
        const playlistContainer = document.querySelector('.playlist-container');
        if (playlistContainer) {
            this.renderPlaylist(playlistContainer);
        }
    }
    
    renderPlaylist(container) {
        const playlistHTML = this.playlist.map((track, index) => `
            <div class="playlist-item ${index === this.currentTrack ? 'active' : ''}" data-track="${index}">
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-duration">${track.duration}</div>
                </div>
                <div class="track-controls">
                    <button class="play-track-btn" data-track="${index}">
                        ${index === this.currentTrack && this.isPlaying ? '⏸' : '▶'}
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div class="playlist-header">
                <h3>MxM Playlist</h3>
                <div class="playlist-controls">
                    <button class="shuffle-btn">🔀</button>
                    <button class="repeat-btn">🔁</button>
                </div>
            </div>
            <div class="playlist-tracks">
                ${playlistHTML}
            </div>
        `;
        
        // Bind track controls
        container.querySelectorAll('.play-track-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trackIndex = parseInt(e.target.dataset.track);
                this.playTrack(trackIndex);
            });
        });
    }
    
    playTrack(index) {
        if (window.persistentMusicPlayer) {
            window.persistentMusicPlayer.playTrack(index);
        }
        this.currentTrack = index;
        this.isPlaying = true;
        this.updateUI();
    }
    
    updateUI() {
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentTrack);
            const playBtn = item.querySelector('.play-track-btn');
            if (playBtn) {
                playBtn.textContent = index === this.currentTrack && this.isPlaying ? '⏸' : '▶';
            }
        });
    }
    
    // Public API
    getCurrentTrack() {
        return this.currentTrack;
    }
    
    getPlaylist() {
        return this.playlist;
    }
    
    setPlaylist(newPlaylist) {
        this.playlist = newPlaylist;
        const container = document.querySelector('.playlist-container');
        if (container) {
            this.renderPlaylist(container);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.audioManagerPlaylist = new AudioManagerPlaylist();
});

// Add CSS for playlist
const style = document.createElement('style');
style.textContent = `
    .playlist-container {
        background: rgba(0, 0, 0, 0.7);
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
        backdrop-filter: blur(10px);
    }
    
    .playlist-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding-bottom: 10px;
    }
    
    .playlist-header h3 {
        color: white;
        margin: 0;
    }
    
    .playlist-controls button {
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        margin-left: 10px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .playlist-controls button:hover {
        opacity: 1;
    }
    
    .playlist-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 5px;
        transition: background 0.3s ease;
        cursor: pointer;
    }
    
    .playlist-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .playlist-item.active {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .track-info {
        flex: 1;
    }
    
    .track-title {
        color: white;
        font-weight: 500;
    }
    
    .track-duration {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
    }
    
    .play-track-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .play-track-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }
`;
document.head.appendChild(style); 