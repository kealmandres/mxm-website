/**
 * MxM Website - Audio Management System with Autoplay
 * Enhanced with smart autoplay functionality
 */

class MxMAudioManager {
    constructor() {
        this.isPlaying = false;
        this.currentVolume = 0.3;
        this.audioElement = null;
        this.musicPlayer = null;
        this.currentRoom = 'entrance-hall';
        this.silentMode = false;
        this.userInteracted = false;
        this.autoplayAttempted = false;
        this.autoplayEnabled = true; // Set to false to disable autoplay
         this.userPreferences = { autoplay: true }; // Force autoplay to true
        // Multiple audio source options
        this.audioSources = [       
            'assets/audio/background-music.mp3',
            '../assets/audio/background-music.mp3',
            './assets/audio/background-music.mp3',
        ];
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    initialize() {
        console.log('🎵 Initializing MxM Audio Manager...');
        this.createMusicPlayer();
        this.setupAudio();
        this.setupEventListeners();
        this.setupUserInteractionDetection();
        
        // // Show autoplay prompt after site loads
        // if (this.autoplayEnabled) {
        //     setTimeout(() => {
        //         if (!this.userInteracted && !this.isPlaying) {
        //             this.showAutoplayPrompt();
        //         }
        //     }, 2000);
        // }
    }
    
    createMusicPlayer() {
        // Create unified music player
        this.musicPlayer = document.createElement('div');
        this.musicPlayer.className = 'music-player corner-position';
        
        const musicButton = document.createElement('div');
        musicButton.className = 'music-button';
        musicButton.setAttribute('title', 'Play/Pause Music');
        
        const playIcon = document.createElement('span');
        playIcon.className = 'play-icon';
        playIcon.innerHTML = '&#9658;'; // Play triangle
        
        const pauseIcon = document.createElement('span');
        pauseIcon.className = 'pause-icon';
        pauseIcon.innerHTML = '&#10074;&#10074;'; // Pause icon
        pauseIcon.style.display = 'none';
        
        const musicLabel = document.createElement('div');
        musicLabel.className = 'music-label';
        musicLabel.textContent = 'MxM Mix (Silent Mode)';
        
        // Assemble music player
        musicButton.appendChild(playIcon);
        musicButton.appendChild(pauseIcon);
        this.musicPlayer.appendChild(musicButton);
        this.musicPlayer.appendChild(musicLabel);
        
        // Add to page
        document.body.appendChild(this.musicPlayer);
        
        // Add click handler
        musicButton.addEventListener('click', () => this.toggleMusic());
        
        console.log('🎵 Music player created');
    }
    
    setupAudio() {
        // Create audio element
        this.audioElement = document.createElement('audio');
        this.audioElement.loop = true;
        this.audioElement.volume = this.currentVolume;
        this.audioElement.preload = 'auto'; // Changed to auto for autoplay
        this.audioElement.crossOrigin = 'anonymous';
        
        // Add to DOM (required for some browsers)
        this.audioElement.style.display = 'none';
        document.body.appendChild(this.audioElement);
        
        // Setup event listeners BEFORE trying to load
        this.setupAudioEventListeners();
        
        // Try to load audio sources
        this.loadAudioSource(0);
    }
    
    setupAudioEventListeners() {
        this.audioElement.addEventListener('loadstart', () => {
            console.log('🎵 Audio loading started...');
        });
        
        this.audioElement.addEventListener('canplay', () => {
            console.log('✅ Audio ready to play');
            this.updateMusicLabel('MxM Mix');
            this.silentMode = false;
            
            // Attempt autoplay when audio is ready
            if (this.autoplayEnabled && !this.autoplayAttempted) {
                this.attemptAutoplay();
            }
        });
        
        this.audioElement.addEventListener('canplaythrough', () => {
            console.log('✅ Audio fully loaded');
        });
        
        this.audioElement.addEventListener('error', (e) => {
            console.warn('❌ Audio loading failed:', e);
            console.warn('Error details:', {
                code: this.audioElement.error?.code,
                message: this.audioElement.error?.message,
                src: this.audioElement.src
            });
            this.handleAudioError();
        });
        
        this.audioElement.addEventListener('play', () => {
            console.log('🎵 Audio started playing');
            this.isPlaying = true;
            this.updatePlayButton(true);
        });
        
        this.audioElement.addEventListener('pause', () => {
            console.log('⏸️ Audio paused');
            this.isPlaying = false;
            this.updatePlayButton(false);
        });
        
        this.audioElement.addEventListener('ended', () => {
            console.log('🔄 Audio ended, looping...');
            this.isPlaying = false;
            this.updatePlayButton(false);
        });
    }
    
    loadAudioSource(sourceIndex = 0) {
        if (sourceIndex >= this.audioSources.length) {
            console.warn('❌ All audio sources failed - entering silent mode');
            this.createSilentMode();
            return;
        }
        
        const source = this.audioSources[sourceIndex];
        console.log(`🎵 Trying audio source ${sourceIndex + 1}/${this.audioSources.length}: ${source}`);
        
        // Remove previous error listener to avoid conflicts
        this.audioElement.removeEventListener('error', this.currentErrorHandler);
        
        // Create new error handler for this attempt
        this.currentErrorHandler = () => {
            console.warn(`❌ Source ${sourceIndex + 1} failed, trying next...`);
            setTimeout(() => this.loadAudioSource(sourceIndex + 1), 100);
        };
        
        this.audioElement.addEventListener('error', this.currentErrorHandler, { once: true });
        
        // Set source and attempt to load
        this.audioElement.src = source;
        this.audioElement.load();
    }
    
    createSilentMode() {
        console.log('🔇 Entering silent mode - no audio available');
        this.silentMode = true;
        this.updateMusicLabel('MxM Mix (Silent Mode)');
        
        // Show notification
        this.showNotification('Audio unavailable - Visual mode only', 'warning');
    }
    
    setupUserInteractionDetection() {
        // Modern browsers require user interaction before audio can play.
        // This function sets up a one-time listener for the first interaction.
        const enableAudio = () => {
            this.userInteracted = true;
            console.log('✅ User interaction detected - audio enabled.');

            // If audio isn't playing and the initial autoplay has already been
            // attempted and failed, this interaction should start the music.
            if (this.autoplayEnabled && !this.isPlaying && !this.silentMode && this.autoplayAttempted) {
                // We don't "attempt" again; we just play directly.
                this.toggleMusic();
            }
        };
        
        // Listen for the first user interaction
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, enableAudio, { once: true, passive: true });
        });
    }
    
    async attemptAutoplay() {
        if (this.autoplayAttempted || this.silentMode || this.isPlaying) return;
        
        this.autoplayAttempted = true;
        console.log('🎵 Attempting autoplay...');
        
        try {
            // Try silent autoplay first (some browsers allow this)
            const originalVolume = this.audioElement.volume;
            this.audioElement.muted = true;
            
            await this.audioElement.play();
            
            // If successful, unmute and continue
            setTimeout(() => {
                this.audioElement.muted = false;
                this.audioElement.volume = originalVolume;
                this.showNotification('🎵 Background music started!', 'success');
            }, 500);
            
            console.log('✅ Autoplay successful');
            
        } catch (error) {
            console.log('❌ Autoplay blocked:', error.name);
            
            // If autoplay fails, show a subtle prompt
            this.showAutoplayButton();
        }
    }
    
    showAutoplayPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'autoplay-prompt';
        prompt.innerHTML = `
            <div class="prompt-content">
                <div class="prompt-icon">🎵</div>
                <h3>Enable Background Music?</h3>
                <p>Enhance your experience with ambient soundscape</p>
                <div class="prompt-buttons">
                    <button class="enable-audio-btn">Enable Music</button>
                    <button class="skip-audio-btn">Skip</button>
                </div>
            </div>
        `;
        
        prompt.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .prompt-content {
                background: rgba(25, 25, 30, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(120, 219, 255, 0.3);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
                color: white;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            }
            .prompt-icon {
                font-size: 3rem;
                margin-bottom: 20px;
                animation: pulse 2s infinite;
            }
            .prompt-content h3 {
                font-family: "Uniform Extra Condensed", sans-serif;
                font-size: 1.8rem;
                margin-bottom: 15px;
                color: rgba(120, 219, 255, 0.9);
            }
            .prompt-content p {
                font-size: 1rem;
                margin-bottom: 30px;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.5;
            }
            .prompt-buttons {
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            .enable-audio-btn, .skip-audio-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .enable-audio-btn {
                background: linear-gradient(135deg, rgba(120, 219, 255, 0.8) 0%, rgba(255, 119, 198, 0.8) 100%);
                color: white;
            }
            .enable-audio-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(120, 219, 255, 0.4);
            }
            .skip-audio-btn {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .skip-audio-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(prompt);
        
        // Fade in
        requestAnimationFrame(() => {
            prompt.style.opacity = '1';
        });
        
        prompt.querySelector('.enable-audio-btn').onclick = () => {
            this.toggleMusic();
            this.fadeOutPrompt(prompt);
        };
        
        prompt.querySelector('.skip-audio-btn').onclick = () => {
            this.autoplayEnabled = false;
            this.fadeOutPrompt(prompt);
        };
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (prompt.parentNode) {
                this.fadeOutPrompt(prompt);
            }
        }, 10000);
    }
    
    showAutoplayButton() {
        // Create a subtle floating button for manual audio start
        const button = document.createElement('div');
        button.className = 'autoplay-button';
        button.innerHTML = '🎵';
        button.title = 'Start background music';
        
        button.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, rgba(120, 219, 255, 0.8) 0%, rgba(255, 119, 198, 0.8) 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(120, 219, 255, 0.3);
            transition: all 0.3s ease;
            animation: bounceIn 0.5s ease-out;
        `;
        
        button.onclick = () => {
            this.toggleMusic();
            button.remove();
        };
        
        document.body.appendChild(button);
        
        // Remove after 8 seconds
        setTimeout(() => {
            if (button.parentNode) {
                button.style.opacity = '0';
                setTimeout(() => button.remove(), 300);
            }
        }, 8000);
    }
    
    fadeOutPrompt(prompt) {
        prompt.style.opacity = '0';
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
            }
        }, 500);
    }
    
    async toggleMusic() {
        console.log(`🎵 Toggle music - Current state: ${this.isPlaying ? 'playing' : 'paused'}`);
        
        if (this.silentMode) {
            // Visual-only toggle for silent mode
            this.isPlaying = !this.isPlaying;
            this.updatePlayButton(this.isPlaying);
            this.showNotification('Silent mode - no audio available', 'info');
            return;
        }
        
        if (!this.userInteracted) {
            this.showNotification('Click detected - audio enabled!', 'success');
            this.userInteracted = true;
        }
        
        if (!this.audioElement) {
            console.warn('❌ No audio element available');
            return;
        }
        
        try {
            if (this.isPlaying) {
                // Pause audio
                this.audioElement.pause();
                console.log('⏸️ Audio paused by user');
            } else {
                // Play audio
                console.log('▶️ Attempting to play audio...');
                
                // Ensure audio is loaded
                if (this.audioElement.readyState < 2) {
                    console.log('🔄 Audio not ready, loading first...');
                    this.audioElement.load();
                    
                    // Wait for it to be ready
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => reject(new Error('Load timeout')), 5000);
                        
                        this.audioElement.addEventListener('canplay', () => {
                            clearTimeout(timeout);
                            resolve();
                        }, { once: true });
                        
                        this.audioElement.addEventListener('error', () => {
                            clearTimeout(timeout);
                            reject(new Error('Load failed'));
                        }, { once: true });
                    });
                }
                
                // Attempt to play
                const playPromise = this.audioElement.play();
                
                if (playPromise !== undefined) {
                    await playPromise;
                    console.log('✅ Audio playing successfully');
                    this.showNotification('Music started! 🎵', 'success');
                }
            }
        } catch (error) {
            console.error('❌ Audio play failed:', error);
            this.handlePlayError(error);
        }
    }
    
    handlePlayError(error) {
        console.error('Audio play error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        
        if (error.name === 'NotAllowedError') {
            this.showNotification('Click the music button to enable audio', 'warning');
        } else if (error.name === 'NotSupportedError') {
            this.showNotification('Audio format not supported', 'error');
            this.createSilentMode();
        } else {
            this.showNotification('Audio playback failed', 'error');
            this.createSilentMode();
        }
    }
    
    updatePlayButton(playing) {
        const playIcon = this.musicPlayer?.querySelector('.play-icon');
        const pauseIcon = this.musicPlayer?.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            if (playing) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'inline';
                this.musicPlayer.classList.add('active');
            } else {
                playIcon.style.display = 'inline';
                pauseIcon.style.display = 'none';
                this.musicPlayer.classList.remove('active');
            }
        }
    }
    
    updateMusicLabel(text) {
        const musicLabel = this.musicPlayer?.querySelector('.music-label');
        if (musicLabel) {
            musicLabel.textContent = text;
            musicLabel.style.opacity = this.silentMode ? '0.7' : '1';
        }
    }
    
    handleAudioError() {
        // This will be called if all sources fail
        this.createSilentMode();
    }
    
    showNotification(message, type = 'info') {
        // This function is now disabled
    }
    
    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        // ... existing code ...
    }
    
    setupEventListeners() {
        // Listen for room changes
        document.addEventListener('roomChanged', (e) => {
            this.handleRoomChange(e.detail.roomId);
        });
        
        // Listen for visibility changes (pause when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isPlaying && !this.silentMode) {
                this.audioElement?.pause();
            }
        });
    }
    
    handleRoomChange(roomId) {
        this.currentRoom = roomId;
        console.log(`🏠 Room changed to: ${roomId}`);
        
        // Ensure music player always stays in corner position
        if (this.musicPlayer.className !== 'music-player corner-position') {
            this.musicPlayer.className = 'music-player corner-position';
        }
        
        // Try autoplay on room change if user has interacted
        if (this.autoplayEnabled && this.userInteracted && !this.isPlaying && !this.silentMode && !this.autoplayAttempted) {
            setTimeout(() => {
                this.attemptAutoplay();
            }, 1000);
        }
    }
    
    // Public methods for external control
    setVolume(volume) {
        this.currentVolume = Math.max(0, Math.min(1, volume));
        if (this.audioElement) {
            this.audioElement.volume = this.currentVolume;
        }
        console.log(`🔊 Volume set to: ${this.currentVolume}`);
    }
    
    enableAutoplay() {
        this.autoplayEnabled = true;
        console.log('✅ Autoplay enabled');
    }
    
    disableAutoplay() {
        this.autoplayEnabled = false;
        console.log('❌ Autoplay disabled');
    }
    
    destroy() {
        console.log('🗑️ Destroying audio manager...');
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.remove();
        }
        if (this.musicPlayer) {
            this.musicPlayer.remove();
        }
    }
}

// Initialize audio manager with error handling
try {
    console.log('🎵 Starting MxM Audio Manager...');
    const audioManager = new MxMAudioManager();
    
    // Make it globally available for debugging
    window.audioManager = audioManager;
    console.log('✅ Audio manager initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize audio manager:', error);
}