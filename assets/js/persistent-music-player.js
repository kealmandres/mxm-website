/**
 * Persistent Music Player
 * Maintains continuous background music playback across multiple HTML pages
 * Uses localStorage to persist audio state (currentTime, volume, isPlaying)
 */

class PersistentMusicPlayer {
    constructor() {
        this.audio = null;
        this.audioB = null; // Second audio element for crossfading
        this.activeAudio = 'A'; // Track which audio element is active
        this.crossfadeDuration = 6000; // 6 seconds in milliseconds
        this.crossfadeInterval = null;
        this.isCrossfading = false; // Flag to track crossfading state
        this.crossfadePrepared = false; // Flag to track if crossfade is prepared
        this.playPauseBtn = null;
        this.volumeSlider = null;
        this.volumeToggleBtn = null;
        this.volumeControlContainer = null;
        this.volumeControlVisible = false;
        this.volumeHideTimeout = null;
        this.storageKey = 'persistentMusicPlayer';
        this.updateInterval = null;
        this.userInteracted = false;
        this.autoplayBlocked = false;
        
        // Video ducking properties
        this.originalVolume = 0.5;
        this.duckedVolume = 0.1; // 10% volume when video is playing (changed from 0.05)
        this.isDucked = false;
        this.videoElements = [];
        
        // Debouncing properties to prevent rapid toggling
        this.lastDuckTime = 0;
        this.lastRestoreTime = 0;
        this.lastCheckRestoreTime = 0;
        this.debounceDelay = 500; // 500ms debounce delay
        this.volumeChangeInProgress = false;
        
        // The canonical, unshuffled list of all tracks.
        this.defaultPlaylist = [
            '/assets/audio/background-music.webm',
            '/assets/audio/playlist/02_Electric_Temptation_(1).webm',
            '/assets/audio/playlist/03_Eternal_Groove.webm',
            '/assets/audio/playlist/04_Eternal_Night_(1).webm',
            '/assets/audio/playlist/05_Eternal_Nights_(1).webm',
            '/assets/audio/playlist/06_Euphoria_Rising_(1).webm',
            '/assets/audio/playlist/07_Euphoria_in_Motion_(1)_(1).webm',
            '/assets/audio/playlist/08_Euphoria_in_Motion_(10)_(1).webm',
            '/assets/audio/playlist/09_Euphoria_in_Motion_(11)_(1).webm',
            '/assets/audio/playlist/10_Euphoria_in_Motion_(2)_(1).webm',
            '/assets/audio/playlist/11_Euphoria_in_Motion_(3)_(1).webm',
            '/assets/audio/playlist/12_Euphoria_in_Motion_(4)_(1).webm',
            '/assets/audio/playlist/13_Euphoria_in_Motion_(5)_(1).webm',
            '/assets/audio/playlist/14_Euphoria_in_Motion_(6)_(1).webm',
            '/assets/audio/playlist/15_Euphoria_in_Motion_(7)_(1).webm',
            '/assets/audio/playlist/16_Euphoria_in_Motion_(9)_(1).webm',
            '/assets/audio/playlist/17_Euphoria_of_the_Night_(1)_(1).webm',
            '/assets/audio/playlist/18_Euphoria_of_the_Night_(2).webm',
            '/assets/audio/playlist/19_Euphoric_Nights_(1).webm',
            '/assets/audio/playlist/20_Glamour_Nights_(1).webm',
            '/assets/audio/playlist/21_Glamour_in_Motion_(1).webm',
            '/assets/audio/playlist/22_Lights_of_the_Night_(1).webm',
            '/assets/audio/playlist/23_Rebel_Groove_(1).webm',
            '/assets/audio/playlist/24_Rhythm_of_the_Night_(1).webm',
            '/assets/audio/playlist/25_Rhythms_of_the_Night_(1)_(1).webm',
            '/assets/audio/playlist/26_Rhythms_of_the_Night_(2).webm',
            '/assets/audio/playlist/27_Velvet_Nights_(1).webm',
            '/assets/audio/playlist/Dancing in the Light (1).webm'
        ];
        
        // This will hold the current, shuffled version of the playlist.
        this.playlist = [...this.defaultPlaylist];
        
        // Default state
        this.defaultState = {
            currentTime: 0,
            volume: 0.5,
            isPlaying: false,
            src: '',
            userInteracted: false,
            currentTrackIndex: 0,
            shuffleSeed: null // Used for deterministic shuffling
        };
        
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
        // Get DOM elements, or create them if they don't exist
        this.audio = document.getElementById('background-music');
        if (!this.audio) {
            this.createPlayerElements();
        }
        
        // Create second audio element for crossfading
        this.audioB = document.createElement('audio');
        this.audioB.id = 'background-music-b';
        this.audioB.style.display = 'none';
        document.body.appendChild(this.audioB);
        
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeToggleBtn = document.getElementById('volume-toggle-btn');
        this.volumeControlContainer = document.getElementById('volume-control-container');
        
        if (!this.audio) {
            console.error('❌ Audio element with id "background-music" not found');
            return;
        }
        
        // Disable loop for playlist functionality
        this.audio.loop = false;
        this.audioB.loop = false;
        
        // Load saved state (which will also trigger the seeded shuffle)
        this.loadState();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup video ducking
        this.setupVideoDucking();
        
        // Setup user interaction detection for autoplay
        this.setupUserInteractionDetection();
        
        // Apply saved state to audio element
        this.applyState();
        
        // Start periodic state saving
        this.startStateSaving();
    }
    
    loadState() {
        try {
            const savedState = sessionStorage.getItem(this.storageKey);
            if (savedState) {
                this.state = { ...this.defaultState, ...JSON.parse(savedState) };
            } else {
                this.state = { ...this.defaultState };
                // Generate an initial seed for the very first visit
                // this.state.shuffleSeed = Math.floor(Math.random() * 100000);
                this.state.currentSongIndex = 0;
            }
            // Shuffle the playlist deterministically using the loaded or new seed
            // this.shufflePlaylist();
        } catch (error) {
            console.error('❌ Error loading state from localStorage:', error);
            this.state = { ...this.defaultState };
            this.state.currentSongIndex = 0;
            // this.state.shuffleSeed = Math.floor(Math.random() * 100000);
            // this.shufflePlaylist();
        }
    }
    
    saveState() {
        try {
            // Create a fresh object to save, ensuring we don't save the entire audio element
            const stateToSave = {
                currentTime: this.audio ? this.audio.currentTime : 0,
                volume: this.audio ? this.audio.volume : 0.5,
                isPlaying: this.audio ? !this.audio.paused && !this.audio.ended : false,
                src: this.audio ? this.audio.src : '',
                userInteracted: this.userInteracted,
                currentTrackIndex: this.state.currentTrackIndex,
                shuffleSeed: this.state.shuffleSeed,
            };
            sessionStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('❌ Error saving state to localStorage:', error);
        }
    }
    
    applyState() {
        if (!this.audio) return;
        
        this.audio.volume = this.state.volume;
        if (this.volumeSlider) {
            this.volumeSlider.value = this.state.volume;
        }
        
        // Update volume display to match restored state
        this.updateVolumeDisplay();
        
        // Set the source from our deterministically shuffled playlist
        const currentTrackSrc = this.playlist[this.state.currentTrackIndex];
        if (currentTrackSrc && this.audio.src !== currentTrackSrc) {
            this.audio.src = currentTrackSrc;
        }

        const setCurrentTimeAndResume = () => {
            if (this.state.currentTime > 0 && this.audio.duration > this.state.currentTime) {
                this.audio.currentTime = this.state.currentTime;
            }
            if (this.state.isPlaying && this.state.userInteracted) {
                this.attemptAutoResume();
            }
        };

        if (this.audio.readyState >= 2) {
            setCurrentTimeAndResume();
        } else {
            this.audio.addEventListener('canplay', setCurrentTimeAndResume, { once: true });
        }
        
        this.updatePlayPauseButton();
    }
    
    async attemptAutoResume() {
        try {
            await this.audio.play();
        } catch (error) {
            this.autoplayBlocked = true;
            this.showAutoplayPrompt();
        }
    }
    
    setupEventListeners() {
        if (!this.audio) return;
        
        // Setup listeners for both audio elements
        [this.audio, this.audioB].forEach((audioElement, index) => {
            const elementName = index === 0 ? 'A' : 'B';
            
            // Audio event listeners
            audioElement.addEventListener('play', () => {
                if (this.getActiveAudio() === audioElement) {
                    this.state.isPlaying = true;
                    this.updatePlayPauseButton();
                    this.saveState();
                }
            });
            
            audioElement.addEventListener('pause', () => {
                // Don't update button state if we're crossfading and this is the old audio being paused
                if (this.getActiveAudio() === audioElement && !this.isCrossfading) {
                    this.state.isPlaying = false;
                    this.updatePlayPauseButton();
                    this.saveState();
                }
            });
            
            audioElement.addEventListener('ended', () => {
                if (this.getActiveAudio() === audioElement) {
                    this.playNextSongWithCrossfade();
                }
            });
            
            audioElement.addEventListener('volumechange', () => {
                if (this.getActiveAudio() === audioElement) {
                    this.state.volume = audioElement.volume;
                    if (this.volumeSlider) {
                        this.volumeSlider.value = audioElement.volume;
                    }
                    // Update volume display when volume changes
                    this.updateVolumeDisplay();
                    this.saveState();
                }
            });
            
            audioElement.addEventListener('loadedmetadata', () => {
                if (this.getActiveAudio() === audioElement) {
                    this.state.src = audioElement.src;
                    this.saveState();
                }
            });
            
            audioElement.addEventListener('error', (e) => {
                console.error(`❌ Audio ${elementName} error:`, e);
                if (this.getActiveAudio() === audioElement) {
                    this.state.isPlaying = false;
                    this.updatePlayPauseButton();
                }
            });
            
            // Add timeupdate listener to check for near-end of track
            audioElement.addEventListener('timeupdate', () => {
                if (this.getActiveAudio() === audioElement && audioElement.duration) {
                    const timeRemaining = audioElement.duration - audioElement.currentTime;
                    // Improved crossfade trigger - start preparation earlier and with wider window
                    if (timeRemaining <= 8 && timeRemaining > 4 && !this.crossfadePrepared && !this.isCrossfading) {
                        this.prepareNextTrackForCrossfade();
                    }
                    // Fallback trigger closer to the end
                    else if (timeRemaining <= 3 && timeRemaining > 2.5 && !this.crossfadePrepared && !this.isCrossfading) {
                        this.prepareNextTrackForCrossfade();
                    }
                }
            });
        });
        
        // Play/Pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }
        
        // Volume slider
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(parseFloat(e.target.value));
            });
        }
        
        // Volume toggle button
        if (this.volumeToggleBtn) {
            this.volumeToggleBtn.addEventListener('click', () => {
                this.toggleVolumeControl();
            });
        }
        
        // Auto-hide volume control when clicking outside
        document.addEventListener('click', (e) => {
            if (this.volumeControlVisible && 
                !this.volumeControlContainer.contains(e.target) && 
                !this.volumeToggleBtn.contains(e.target)) {
                this.hideVolumeControl();
            }
        });
        
        // Keep volume control visible when interacting with it
        if (this.volumeControlContainer) {
            this.volumeControlContainer.addEventListener('mouseenter', () => {
                this.clearVolumeHideTimeout();
            });
            
            this.volumeControlContainer.addEventListener('mouseleave', () => {
                this.scheduleVolumeHide();
            });
        }
        
        // Page visibility change (pause when tab is hidden, resume when visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, save current state and immediately restore volume
                this.saveState();
                this.forceRestoreVolume();
            } else {
                // Page is visible, potentially resume if it was playing
                if (this.state.isPlaying && this.getActiveAudio().paused) {
                    this.play();
                }
                // Re-check video states after page becomes visible
                setTimeout(() => this.forceCheckVideoState(), 1000);
            }
        });
        
        // Enhanced navigation detection
        window.addEventListener('beforeunload', () => {
            this.saveState();
            this.forceRestoreVolume();
        });
        
        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            this.forceRestoreVolume();
            setTimeout(() => {
                this.forceCheckVideoState();
            }, 500);
        });
        
        // Handle hash changes (SPA navigation)
        window.addEventListener('hashchange', () => {
            setTimeout(() => {
                this.forceCheckVideoState();
            }, 300);
        });
        
        // Handle focus/blur for the entire window
        window.addEventListener('focus', () => {
            setTimeout(() => this.forceCheckVideoState(), 300);
        });
        
        window.addEventListener('blur', () => {
            this.forceRestoreVolume();
        });
    }
    
    setupUserInteractionDetection() {
        // Enhanced autoplay detection for home page
        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '/index.html';
        
        const handleFirstInteraction = () => {
            if (!this.userInteracted) {
                this.userInteracted = true;
                this.state.userInteracted = true;
                this.saveState();
            }
            
            // If autoplay was blocked and this is the first interaction, try to play
            if (this.autoplayBlocked || (isHomePage && !this.state.isPlaying)) {
                this.attemptAutoplayOnInteraction();
            }
            
            // Remove listeners after first interaction
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            
            // Remove enhanced listeners for home page
            if (isHomePage) {
                document.removeEventListener('mousemove', handleMinimalInteraction);
                document.removeEventListener('scroll', handleMinimalInteraction);
                window.removeEventListener('focus', handleMinimalInteraction);
            }
        };
        
        // Enhanced interaction detection for home page autoplay
        const handleMinimalInteraction = () => {
            this.userInteracted = true;
            this.state.userInteracted = true;
            this.saveState();
            
            // Attempt autoplay on minimal interaction for home page
            if (!this.state.isPlaying) {
                this.attemptAutoplayOnInteraction();
            }
            
            // Remove minimal interaction listeners
            document.removeEventListener('mousemove', handleMinimalInteraction);
            document.removeEventListener('scroll', handleMinimalInteraction);
            window.removeEventListener('focus', handleMinimalInteraction);
            
            // Keep the main interaction listeners for other functionality
        };
        
        // Standard interaction listeners
        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);
        
        // Enhanced listeners for home page autoplay
        if (isHomePage) {
            // Attempt immediate autoplay on page load
            setTimeout(() => {
                if (!this.userInteracted && !this.state.isPlaying) {
                    this.attemptImmediateAutoplay();
                }
            }, 1000); // Wait 1 second for page to settle
            
            // Listen for minimal interactions
            document.addEventListener('mousemove', handleMinimalInteraction, { once: true });
            document.addEventListener('scroll', handleMinimalInteraction, { once: true });
            window.addEventListener('focus', handleMinimalInteraction, { once: true });
        }
    }
    
    async attemptImmediateAutoplay() {
        try {
            await this.audio.play();
            this.state.isPlaying = true;
            this.updatePlayPauseButton();
            this.saveState();
        } catch (error) {
            this.autoplayBlocked = true;
            // Don't show prompt immediately, wait for user interaction
        }
    }
    
    async attemptAutoplayOnInteraction() {
        try {
            await this.audio.play();
            this.state.isPlaying = true;
            this.updatePlayPauseButton();
            this.saveState();
            this.autoplayBlocked = false;
            this.hideAutoplayPrompt();
        } catch (error) {
            this.showAutoplayPrompt();
        }
    }
    
    async play() {
        if (!this.audio) return false;
        
        const activeAudio = this.getActiveAudio();
        
        try {
            await activeAudio.play();
            return true;
        } catch (error) {
            console.error('❌ Failed to play audio:', error);
            if (error.name === 'NotAllowedError') {
                this.autoplayBlocked = true;
                this.showAutoplayPrompt();
            }
            return false;
        }
    }
    
    pause() {
        if (!this.audio) return;
        
        const activeAudio = this.getActiveAudio();
        activeAudio.pause();
    }
    
    async togglePlayPause() {
        if (!this.audio) return;
        
        const activeAudio = this.getActiveAudio();
        
        if (activeAudio.paused || activeAudio.ended) {
            await this.play();
        } else {
            this.pause();
        }
    }
    
    setVolume(volume) {
        if (!this.audio) return;
        
        // Clamp volume between 0 and 1
        volume = Math.max(0, Math.min(1, volume));
        
        // Set volume on both audio elements
        const activeAudio = this.getActiveAudio();
        const inactiveAudio = this.getInactiveAudio();
        
        if (this.isDucked) {
            // If currently ducked, update the original volume but don't change current volume
            this.originalVolume = volume;
        } else {
            // Normal volume change
            activeAudio.volume = volume;
            inactiveAudio.volume = 0; // Keep inactive at 0
            this.originalVolume = volume;
        }
        
        // Update volume display
        this.updateVolumeDisplay();
    }
    
    // New method to update volume display
    updateVolumeDisplay() {
        const volumeDisplay = document.querySelector('.volume-display');
        if (volumeDisplay && this.volumeSlider) {
            const displayVolume = Math.round(this.volumeSlider.value * 100);
            volumeDisplay.textContent = displayVolume + '%';
        }
    }
    
    updatePlayPauseButton() {
        if (!this.playPauseBtn) return;
        
        const activeAudio = this.getActiveAudio();
        let isPlaying = false;
        
        if (this.isCrossfading) {
            // During crossfade, consider music as playing if either audio is playing
            const inactiveAudio = this.getInactiveAudio();
            isPlaying = (!activeAudio.paused && !activeAudio.ended) || (!inactiveAudio.paused && !inactiveAudio.ended);
        } else {
            // Normal state - check only active audio
            isPlaying = !activeAudio.paused && !activeAudio.ended;
        }
        
        // Update button text/icon
        if (isPlaying) {
            this.playPauseBtn.textContent = this.playPauseBtn.dataset.pauseText || '⏸️';
            this.playPauseBtn.setAttribute('aria-label', 'Pause music');
        } else {
            this.playPauseBtn.textContent = this.playPauseBtn.dataset.playText || '▶️';
            this.playPauseBtn.setAttribute('aria-label', 'Play music');
        }
        
        // Update button class for styling
        this.playPauseBtn.classList.toggle('playing', isPlaying);
        this.playPauseBtn.classList.toggle('paused', !isPlaying);
    }
    
    showAutoplayPrompt() {
        // Don't show multiple prompts
        if (document.querySelector('.autoplay-prompt')) return;
        
        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '/index.html';
        
        const prompt = document.createElement('div');
        prompt.className = 'autoplay-prompt';
        
        const promptText = isHomePage 
            ? 'Welcome to MxM! Enable ambient music for the full experience?' 
            : 'Enable background music to continue your MxM experience?';
        
        prompt.innerHTML = `
            <div class="autoplay-content">
                <p>${promptText}</p>
                <button id="enable-autoplay-btn">Enable Music</button>
            </div>
            <button id="dismiss-autoplay-btn">×</button>
        `;
        
        document.body.appendChild(prompt);
        
        // Add event listeners
        const enableBtn = document.getElementById('enable-autoplay-btn');
        const dismissBtn = document.getElementById('dismiss-autoplay-btn');
        
        enableBtn.addEventListener('click', async () => {
            try {
                await this.audio.play();
                this.state.isPlaying = true;
                this.userInteracted = true;
                this.state.userInteracted = true;
                this.updatePlayPauseButton();
                this.saveState();
                this.autoplayBlocked = false;
                this.hideAutoplayPrompt();
            } catch (error) {
                console.error('❌ Failed to enable music:', error);
            }
        });
        
        dismissBtn.addEventListener('click', () => {
            this.hideAutoplayPrompt();
        });
    }
    
    hideAutoplayPrompt() {
        const prompt = document.querySelector('.autoplay-prompt');
        if (prompt) {
            prompt.remove();
        }
    }
    
    startStateSaving() {
        // Save state every 5 seconds while playing
        this.updateInterval = setInterval(() => {
            if (this.audio && !this.audio.paused) {
                this.saveState();
            }
        }, 5000);
    }
    
    stopStateSaving() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // Public API methods - update to use active audio
    getCurrentTime() {
        const activeAudio = this.getActiveAudio();
        return activeAudio ? activeAudio.currentTime : 0;
    }
    
    getDuration() {
        const activeAudio = this.getActiveAudio();
        return activeAudio ? activeAudio.duration : 0;
    }
    
    getVolume() {
        const activeAudio = this.getActiveAudio();
        return activeAudio ? activeAudio.volume : 0;
    }
    
    isPlaying() {
        const activeAudio = this.getActiveAudio();
        return activeAudio ? (!activeAudio.paused && !activeAudio.ended) : false;
    }
    
    setCurrentTime(time) {
        const activeAudio = this.getActiveAudio();
        if (activeAudio && activeAudio.duration) {
            activeAudio.currentTime = Math.max(0, Math.min(time, activeAudio.duration));
        }
    }
    
    // Volume control methods
    toggleVolumeControl() {
        if (this.volumeControlVisible) {
            this.hideVolumeControl();
        } else {
            this.showVolumeControl();
        }
    }
    
    showVolumeControl() {
        if (!this.volumeControlContainer) return;
        
        this.volumeControlVisible = true;
        this.volumeControlContainer.classList.add('show');
        this.clearVolumeHideTimeout();
        
        // Auto-hide after 3 seconds of no interaction
        this.scheduleVolumeHide();
    }
    
    hideVolumeControl() {
        if (!this.volumeControlContainer) return;
        
        this.volumeControlVisible = false;
        this.volumeControlContainer.classList.remove('show');
        this.clearVolumeHideTimeout();
    }
    
    scheduleVolumeHide() {
        this.clearVolumeHideTimeout();
        this.volumeHideTimeout = setTimeout(() => {
            this.hideVolumeControl();
        }, 3000);
    }
    
    clearVolumeHideTimeout() {
        if (this.volumeHideTimeout) {
            clearTimeout(this.volumeHideTimeout);
            this.volumeHideTimeout = null;
        }
    }
    
    // Video ducking methods - update to handle both audio elements
    setupVideoDucking() {
        // Find all video elements (including iframes with video content)
        this.findVideoElements();
        
        // Setup observers for dynamically added videos
        this.setupVideoObserver();
        
        console.log(`🎬 Found ${this.videoElements.length} video elements for ducking`);
    }
    
    findVideoElements() {
        // Clear existing video elements
        this.videoElements = [];
        
        // Find HTML5 video elements
        const videos = document.querySelectorAll('video');
        videos.forEach(video => this.addVideoListeners(video));
        
        // Find iframe elements (for embedded videos like Vimeo, YouTube)
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const src = iframe.src.toLowerCase();
            if (src.includes('vimeo') || src.includes('youtube') || src.includes('video')) {
                this.addIframeListeners(iframe);
            }
        });
    }
    
    addVideoListeners(video) {
        this.videoElements.push(video);
        
        video.addEventListener('play', () => {
            console.log(`🎬 Video started playing - ducking music volume`);
            this.duckVolume();
        });
        
        video.addEventListener('pause', () => {
            console.log(`⏸️ Video paused - checking if should restore volume`);
            this.checkRestoreVolume();
        });
        
        video.addEventListener('ended', () => {
            console.log(`🏁 Video ended - checking if should restore volume`);
            this.checkRestoreVolume();
        });
    }
    
    addIframeListeners(iframe) {
        this.videoElements.push(iframe);
        
        // Check if it's a Vimeo iframe and use Vimeo Player API
        const src = iframe.src.toLowerCase();
        if (src.includes('vimeo')) {
            this.setupVimeoPlayer(iframe);
        } else {
            this.setupGenericIframe(iframe);
        }
    }
    
    setupVimeoPlayer(iframe) {
        // Use Vimeo Player API for accurate event detection
        if (typeof Vimeo !== 'undefined' && Vimeo.Player) {
            try {
                const player = new Vimeo.Player(iframe);
                
                player.on('play', () => {
                    console.log(`🎬 Vimeo video started playing - ducking music volume to 10%`);
                    this.duckVolume();
                });
                
                player.on('pause', () => {
                    console.log(`⏸️ Vimeo video paused - checking if should restore music volume`);
                    this.checkRestoreVolume();
                });
                
                player.on('ended', () => {
                    console.log(`🏁 Vimeo video ended - checking if should restore music volume`);
                    this.checkRestoreVolume();
                });
                
                // Store player reference for cleanup
                iframe._vimeoPlayer = player;
                
                console.log(`✅ Vimeo Player API connected successfully`);
                return;
            } catch (error) {
                console.log(`⚠️ Vimeo Player API not available, using fallback detection`);
            }
        }
        
        // Fallback to generic iframe handling if Vimeo API not available
        this.setupGenericIframe(iframe);
    }
    
    setupGenericIframe(iframe) {
        // Enhanced detection for generic iframes
        let isPlaying = false;
        let playCheckInterval = null;
        const isYouTube = iframe.src.toLowerCase().includes('youtube');
        
        console.log(`🎬 Setting up ${isYouTube ? 'YouTube' : 'generic'} iframe detection`);
        
        // Method 1: Intersection Observer for visibility (with debouncing)
        let lastVisibilityChange = 0;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const now = Date.now();
                if (now - lastVisibilityChange < 300) { // 300ms debounce for visibility changes
                    return;
                }
                lastVisibilityChange = now;
                
                if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
                    // For YouTube, don't auto-duck just because it's visible
                    if (isYouTube) {
                        console.log(`👁️ YouTube iframe is visible but NOT auto-ducking volume (waiting for user interaction)`);
                        // Only duck if we have clear evidence of playing
                        return;
                    }
                    
                    // For non-YouTube iframes, assume playing when highly visible
                    if (!isPlaying) {
                        console.log(`🎬 Non-YouTube iframe video likely started - ducking music volume`);
                        this.duckVolume();
                        isPlaying = true;
                        
                        // Start monitoring for when it might stop
                        this.startPlaybackMonitoring(iframe);
                    }
                } else if (entry.intersectionRatio < 0.3) {
                    // Iframe is barely visible or hidden
                    if (isPlaying) {
                        console.log(`👁️ ${isYouTube ? 'YouTube' : 'Iframe'} video likely stopped - checking if should restore volume`);
                        this.checkRestoreVolume(); // Use checkRestoreVolume instead of direct restore
                        isPlaying = false;
                        this.stopPlaybackMonitoring(iframe);
                    }
                }
            });
        }, { threshold: [0, 0.3, 0.7, 1] });
        
        observer.observe(iframe);
        iframe._intersectionObserver = observer;
        
        // Method 2: Enhanced click detection for YouTube (with debouncing)
        let lastClickTime = 0;
        iframe.addEventListener('click', () => {
            const now = Date.now();
            if (now - lastClickTime < 1000) { // 1 second debounce for clicks
                return;
            }
            lastClickTime = now;
            
            console.log(`🖱️ ${isYouTube ? 'YouTube' : 'Iframe'} clicked - toggling video state`);
            if (isPlaying) {
                console.log(`⏸️ Assuming video paused - checking if should restore volume`);
                this.checkRestoreVolume(); // Use checkRestoreVolume instead of direct restore
                isPlaying = false;
                this.stopPlaybackMonitoring(iframe);
            } else {
                console.log(`▶️ Assuming video played - ducking volume`);
                this.duckVolume();
                isPlaying = true;
                this.startPlaybackMonitoring(iframe);
            }
        });
        
        // Method 3: Focus events
        iframe.addEventListener('focus', () => {
            if (!isPlaying && !isYouTube) {
                console.log(`🎯 Non-YouTube iframe focused - likely video starting`);
                setTimeout(() => {
                    this.duckVolume();
                    isPlaying = true;
                    this.startPlaybackMonitoring(iframe);
                }, 1000);
            } else if (isYouTube) {
                console.log(`🎯 YouTube iframe focused - waiting for user interaction (NOT auto-ducking)`);
                // Don't auto-duck for YouTube focus, wait for explicit click
            }
        });
        
        // Method 4: YouTube-specific enhancements
        if (isYouTube) {
            // Remove aggressive mouse enter/leave detection - only use scroll-based detection
            
            // Enhanced scroll detection for YouTube (only restore if playing)
            let scrollTimeout;
            const handleScroll = () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    // Only check scroll if we think the video is playing
                    if (!isPlaying) return;
                    
                    const rect = iframe.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    const isLargeEnough = rect.width > 200 && rect.height > 150;
                    
                    if (!isVisible || !isLargeEnough) {
                        console.log(`📜 YouTube scrolled out of view - restoring volume`);
                        this.restoreVolume();
                        isPlaying = false;
                        this.stopPlaybackMonitoring(iframe);
                    }
                }, 500);
            };
            
            window.addEventListener('scroll', handleScroll);
            iframe._scrollHandler = handleScroll;
        }
        
        // Store state and cleanup function
        iframe._isPlaying = () => isPlaying;
        iframe._setPlaying = (playing) => { 
            console.log(`🎬 ${isYouTube ? 'YouTube' : 'Iframe'} playing state set to: ${playing}`);
            const wasPlaying = isPlaying;
            isPlaying = playing;
            
            // Handle volume ducking/restoration based on state change
            if (playing && !wasPlaying) {
                console.log(`🔉 Video started playing - ducking volume`);
                this.duckVolume();
                this.startPlaybackMonitoring(iframe);
            } else if (!playing && wasPlaying) {
                console.log(`🔊 Video stopped playing - restoring volume`);
                this.restoreVolume();
                this.stopPlaybackMonitoring(iframe);
            }
        };
        iframe._cleanup = () => {
            if (iframe._scrollHandler) {
                window.removeEventListener('scroll', iframe._scrollHandler);
            }
            if (iframe._intersectionObserver) {
                iframe._intersectionObserver.disconnect();
            }
            this.stopPlaybackMonitoring(iframe);
        };
    }
    
    startPlaybackMonitoring(iframe) {
        // Monitor for signs that video has stopped
        if (iframe._playbackMonitor) {
            clearInterval(iframe._playbackMonitor);
        }
        
        const isYouTube = iframe.src.toLowerCase().includes('youtube');
        const monitorInterval = isYouTube ? 2000 : 3000; // Reduced frequency: Check YouTube every 2s, others every 3s
        
        console.log(`🔍 Starting playback monitoring for ${isYouTube ? 'YouTube' : 'generic'} iframe (${monitorInterval}ms interval)`);
        
        let lastMonitorAction = 0;
        iframe._playbackMonitor = setInterval(() => {
            // Debounce monitoring actions
            const now = Date.now();
            if (now - lastMonitorAction < 1000) { // 1 second debounce for monitoring actions
                return;
            }
            
            // Check if iframe is still visible and likely playing
            const rect = iframe.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            const isLargeEnough = rect.width > 200 && rect.height > 150;
            
            // Additional checks for YouTube
            let shouldStop = false;
            
            if (!isVisible || !isLargeEnough || document.hidden) {
                shouldStop = true;
            }
            
            // For YouTube, also check if the user has scrolled significantly away
            if (isYouTube && isVisible) {
                const viewportHeight = window.innerHeight;
                const iframeCenter = rect.top + rect.height / 2;
                const distanceFromCenter = Math.abs(iframeCenter - viewportHeight / 2);
                
                // If YouTube iframe is more than 80% of viewport height away from center, likely not focused
                if (distanceFromCenter > viewportHeight * 0.8) {
                    shouldStop = true;
                    console.log(`📜 YouTube iframe too far from viewport center - assuming paused`);
                }
            }
            
            if (shouldStop) {
                lastMonitorAction = now;
                console.log(`📱 Video monitoring detected stop condition - checking if should restore volume`);
                this.checkRestoreVolume(); // Use checkRestoreVolume instead of direct restore
                if (iframe._setPlaying) iframe._setPlaying(false);
                this.stopPlaybackMonitoring(iframe);
            }
        }, monitorInterval);
    }
    
    stopPlaybackMonitoring(iframe) {
        if (iframe._playbackMonitor) {
            clearInterval(iframe._playbackMonitor);
            iframe._playbackMonitor = null;
        }
    }
    
    setupVideoObserver() {
        // Watch for dynamically added video elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check for video elements
                        if (node.tagName === 'VIDEO') {
                            this.addVideoListeners(node);
                        }
                        
                        // Check for iframe elements
                        if (node.tagName === 'IFRAME') {
                            const src = node.src.toLowerCase();
                            if (src.includes('vimeo') || src.includes('youtube') || src.includes('video')) {
                                this.addIframeListeners(node);
                            }
                        }
                        
                        // Check for nested video/iframe elements
                        const nestedVideos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                        const nestedIframes = node.querySelectorAll ? node.querySelectorAll('iframe') : [];
                        
                        nestedVideos.forEach(video => this.addVideoListeners(video));
                        nestedIframes.forEach(iframe => {
                            const src = iframe.src.toLowerCase();
                            if (src.includes('vimeo') || src.includes('youtube') || src.includes('video')) {
                                this.addIframeListeners(iframe);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    duckVolume() {
        if (!this.audio || this.isDucked || this.volumeChangeInProgress) return;
        
        // Debounce rapid duck volume calls
        const now = Date.now();
        if (now - this.lastDuckTime < this.debounceDelay) {
            return;
        }
        
        this.lastDuckTime = now;
        this.volumeChangeInProgress = true;
        
        // Store the current volume as original volume
        const activeAudio = this.getActiveAudio();
        this.originalVolume = activeAudio.volume;
        
        // Duck the volume on both audio elements
        this.audio.volume = this.duckedVolume;
        this.audioB.volume = this.duckedVolume;
        this.isDucked = true;
        
        // Update volume slider to reflect ducked volume
        if (this.volumeSlider) {
            this.volumeSlider.value = this.duckedVolume;
        }
        
        // Update volume display
        this.updateVolumeDisplay();
    }
    
    restoreVolume() {
        if (!this.audio || !this.isDucked || this.volumeChangeInProgress) return;
        
        // Debounce rapid restore volume calls
        const now = Date.now();
        if (now - this.lastRestoreTime < this.debounceDelay) {
            return;
        }
        
        this.lastRestoreTime = now;
        this.volumeChangeInProgress = true;
        
        // Restore the original volume on both audio elements (to match duckVolume behavior)
        this.audio.volume = this.originalVolume;
        this.audioB.volume = this.originalVolume;
        this.isDucked = false;
        
        // Update volume slider to reflect restored volume
        if (this.volumeSlider) {
            this.volumeSlider.value = this.originalVolume;
        }
        
        // Update volume display
        this.updateVolumeDisplay();
    }
    
    checkRestoreVolume() {
        // Debounce rapid checkRestoreVolume calls
        const now = Date.now();
        if (this.lastCheckRestoreTime && now - this.lastCheckRestoreTime < 300) {
            return;
        }
        this.lastCheckRestoreTime = now;
        
        // Enhanced check for video playback state
        let anyVideoPlaying = false;
        
        // Check HTML5 videos
        const htmlVideos = this.videoElements.filter(el => el.tagName === 'VIDEO');
        anyVideoPlaying = htmlVideos.some(video => !video.paused && !video.ended);
        
        // Check iframe videos with enhanced detection
        if (!anyVideoPlaying) {
            const iframes = this.videoElements.filter(el => el.tagName === 'IFRAME');
            anyVideoPlaying = iframes.some(iframe => {
                // Check if iframe has playing state
                if (iframe._isPlaying && iframe._isPlaying()) {
                    return true;
                }
                
                // Fallback: check visibility and size (removed intersectionRatio bug)
                const rect = iframe.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                const isLargeEnough = rect.width > 200 && rect.height > 150;
                const isInViewport = isVisible && isLargeEnough;
                
                // For YouTube iframes, be more conservative - only consider playing if explicitly set
                if (iframe.src.toLowerCase().includes('youtube')) {
                    return iframe._isPlaying && iframe._isPlaying();
                }
                
                // For other iframes, use visibility as fallback
                return isInViewport;
            });
        }
        
        // If page is hidden, definitely not playing
        if (document.hidden) {
            anyVideoPlaying = false;
        }
        
        if (!anyVideoPlaying) {
            this.restoreVolume();
        }
    }
    
    // Force restore volume immediately (for navigation)
    forceRestoreVolume() {
        this.restoreVolume();
        
        // Also stop all monitoring
        this.videoElements.forEach(element => {
            if (element.tagName === 'IFRAME') {
                this.stopPlaybackMonitoring(element);
                if (element._setPlaying) element._setPlaying(false);
            }
        });
    }
    
    // Enhanced method to force check video states
    forceCheckVideoState() {
        // If we're on a different page or no videos visible, restore volume
        const hasVisibleVideos = this.videoElements.some(element => {
            const rect = element.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 200;
        });
        
        if (!hasVisibleVideos) {
            this.forceRestoreVolume();
            return;
        }
        
        // Re-scan for videos in case DOM changed
        this.findVideoElements();
        
        // Check current state
        setTimeout(() => this.checkRestoreVolume(), 500);
    }
    
    seededRandom(seed) {
        // A simple pseudo-random number generator for deterministic shuffling
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    shufflePlaylist() {
        const seed = this.state.shuffleSeed;
        if (seed === null) {
            console.error("🚫 Cannot shuffle playlist without a seed.");
            return;
        }

        let shuffled = [...this.defaultPlaylist]; // Always start from the original order

        // Shuffle the array using the seed
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(this.seededRandom(seed + i) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        this.playlist = shuffled; // Update the in-memory playlist
    }

    playNextSongWithCrossfade() {
        // If crossfade is already in progress, let it complete
        if (this.isCrossfading) {
            return;
        }
        
        // If crossfade was prepared but not started, try to start it
        if (this.crossfadePrepared) {
            this.startCrossfade();
            return;
        }
        
        // If no crossfade was prepared, fall back to regular next song
        this.playNextSong();
    }
    
    playNextSong() {
        // Clear any ongoing crossfade and reset flags
        if (this.crossfadeInterval) {
            clearInterval(this.crossfadeInterval);
            this.crossfadeInterval = null;
        }
        this.resetCrossfadeFlags();
        
        this.state.currentTrackIndex++;
        if (this.state.currentTrackIndex >= this.playlist.length) {
            // The playlist has finished. Generate a new seed for a fresh shuffle.
            this.state.shuffleSeed = Math.floor(Math.random() * 100000);
            this.shufflePlaylist(); // Re-shuffle with the new seed
            this.state.currentTrackIndex = 0; // Start from the beginning
        }
        
        const activeAudio = this.getActiveAudio();
        activeAudio.src = this.playlist[this.state.currentTrackIndex];
        activeAudio.currentTime = 0;
        
        // Ensure correct volume when not crossfading
        const correctVolume = this.isDucked ? this.duckedVolume : this.originalVolume;
        activeAudio.volume = correctVolume;
        
        // Update volume slider and display
        if (this.volumeSlider) {
            this.volumeSlider.value = correctVolume;
        }
        this.updateVolumeDisplay();
        this.state.volume = correctVolume;
        
        const playPromise = activeAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                setTimeout(() => this.playNextSong(), 1000);
            });
        }
        this.saveState();
    }
    
    // Cleanup method - update to handle both audio elements
    destroy() {
        this.stopStateSaving();
        this.saveState();
        this.hideAutoplayPrompt();
        
        // Clear crossfade interval and reset flags
        if (this.crossfadeInterval) {
            clearInterval(this.crossfadeInterval);
            this.crossfadeInterval = null;
        }
        this.resetCrossfadeFlags();
        
        // Clean up all video element listeners
        this.videoElements.forEach(element => {
            if (element.tagName === 'IFRAME' && element._cleanup) {
                element._cleanup();
            }
        });
        
        // Force restore volume before cleanup
        this.forceRestoreVolume();
        
        // Remove second audio element
        if (this.audioB && this.audioB.parentNode) {
            this.audioB.parentNode.removeChild(this.audioB);
        }
    }

    createPlayerElements() {
        console.log('🎨 Creating player DOM elements because they were not found.');

        // Create audio element
        this.audio = document.createElement('audio');
        this.audio.id = 'background-music';
        this.audio.loop = false; // We handle looping with our playlist logic
        document.body.appendChild(this.audio);

        // Create player container
        const playerContainer = document.createElement('div');
        playerContainer.id = 'music-player-container';
        playerContainer.className = 'music-player-container'; // Add a class for styling

        // Player controls HTML
        playerContainer.innerHTML = `
            <button id="play-pause-btn" class="paused" aria-label="Play music" data-play-text="▶️" data-pause-text="⏸️">▶️</button>
            <div id="volume-wrapper">
                <button id="volume-toggle-btn">🔊</button>
                <div id="volume-control-container">
                    <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="0.5">
                </div>
            </div>
        `;
        document.body.appendChild(playerContainer);

        // Add some default styles for the created player
        const style = document.createElement('style');
        style.textContent = `
            .music-player-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                background-color: rgba(0, 0, 0, 0.5);
                padding: 8px;
                border-radius: 50px;
                z-index: 10001;
            }
            #play-pause-btn, #volume-toggle-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }
            #volume-wrapper {
                position: relative;
            }
            #volume-control-container {
                position: absolute;
                bottom: 100%;
                right: 0;
                background-color: rgba(0, 0, 0, 0.7);
                padding: 10px;
                border-radius: 10px;
                margin-bottom: 10px;
                display: none; /* Hidden by default */
            }
            #volume-control-container.show {
                display: block;
            }
            #volume-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 100px;
                height: 5px;
                background: #ddd;
                outline: none;
                opacity: 0.7;
                transition: opacity .2s;
                border-radius: 3px;
            }
            #volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 15px;
                height: 15px;
                background: #87CEEB;
                cursor: pointer;
                border-radius: 50%;
            }
            #volume-slider::-moz-range-thumb {
                width: 15px;
                height: 15px;
                background: #87CEEB;
                cursor: pointer;
                border-radius: 50%;
            }
        `;
        document.head.appendChild(style);
    }

    getActiveAudio() {
        return this.activeAudio === 'A' ? this.audio : this.audioB;
    }
    
    getInactiveAudio() {
        return this.activeAudio === 'A' ? this.audioB : this.audio;
    }
    
    prepareNextTrackForCrossfade() {
        // Don't prepare if already crossfading or already prepared
        if (this.isCrossfading || this.crossfadePrepared) return;
        
        this.crossfadePrepared = true;
        
        const nextIndex = (this.state.currentTrackIndex + 1) % this.playlist.length;
        const nextTrack = this.playlist[nextIndex];
        const inactiveAudio = this.getInactiveAudio();
        
        // If we're at the end of playlist, reshuffle
        if (nextIndex === 0) {
            this.state.shuffleSeed = Math.floor(Math.random() * 100000);
            this.shufflePlaylist();
        }
        
        // Load next track on inactive audio element
        inactiveAudio.src = nextTrack;
        inactiveAudio.volume = 0;
        inactiveAudio.currentTime = 0;
        
        // Start the crossfade when the inactive audio is ready
        const startCrossfadeWhenReady = () => {
            if (inactiveAudio.readyState >= 2) { // HAVE_CURRENT_DATA or better
                this.startCrossfade();
            } else {
                inactiveAudio.addEventListener('canplay', () => {
                    this.startCrossfade();
                }, { once: true });
                
                // Fallback timeout in case canplay doesn't fire
                setTimeout(() => {
                    if (this.crossfadePrepared && !this.isCrossfading) {
                        this.startCrossfade();
                    }
                }, 2000);
            }
        };
        
        startCrossfadeWhenReady();
    }
    
    startCrossfade() {
        // Don't start if already crossfading
        if (this.isCrossfading) return;
        
        const activeAudio = this.getActiveAudio();
        const inactiveAudio = this.getInactiveAudio();
        const steps = 60; // 60 steps for smooth transition (100ms intervals)
        const interval = this.crossfadeDuration / steps;
        let currentStep = 0;
        
        this.isCrossfading = true;
        
        // Start playing the new track
        inactiveAudio.play().catch(e => {
            this.resetCrossfadeFlags();
            return;
        });
        
        this.crossfadeInterval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            
            // Calculate volumes
            const fadeOutVolume = this.isDucked ? 
                this.duckedVolume * (1 - progress) : 
                this.originalVolume * (1 - progress);
            const fadeInVolume = this.isDucked ? 
                this.duckedVolume * progress : 
                this.originalVolume * progress;
            
            activeAudio.volume = Math.max(0, fadeOutVolume);
            inactiveAudio.volume = Math.max(0, fadeInVolume);
            
            // Update button state periodically during crossfade
            if (currentStep % 10 === 0) { // Every 10 steps
                this.updatePlayPauseButton();
            }
            
            if (currentStep >= steps) {
                // Crossfade complete
                clearInterval(this.crossfadeInterval);
                this.crossfadeInterval = null;
                
                // Switch active audio
                activeAudio.pause();
                activeAudio.currentTime = 0;
                this.activeAudio = this.activeAudio === 'A' ? 'B' : 'A';
                
                // CRITICAL FIX: Ensure new active audio has correct final volume
                const newActiveAudio = this.getActiveAudio();
                const finalVolume = this.isDucked ? this.duckedVolume : this.originalVolume;
                newActiveAudio.volume = finalVolume;
                
                // Update volume slider and display to match final volume
                if (this.volumeSlider) {
                    this.volumeSlider.value = finalVolume;
                }
                this.updateVolumeDisplay();
                
                // Update state
                this.state.currentTrackIndex = (this.state.currentTrackIndex + 1) % this.playlist.length;
                this.state.currentTime = 0;
                this.state.volume = finalVolume; // Ensure state reflects correct volume
                
                // Reset crossfade flags
                this.resetCrossfadeFlags();
                
                // Ensure button state is correct after crossfade
                this.state.isPlaying = true;
                this.updatePlayPauseButton();
                this.saveState();
            }
        }, interval);
    }
    
    resetCrossfadeFlags() {
        this.isCrossfading = false;
        this.crossfadePrepared = false;
    }

    // Public method to manually restore volume (for debugging)
    manualVolumeRestore() {
        this.forceRestoreVolume();
        // Also reset all iframe states
        this.videoElements.forEach(element => {
            if (element.tagName === 'IFRAME' && element._setPlaying) {
                element._setPlaying(false);
            }
        });
    }
}

// Initialize the music player when the script loads
let persistentMusicPlayer;

// Auto-initialize
if (typeof window !== 'undefined') {
    persistentMusicPlayer = new PersistentMusicPlayer();
    
    // Make it globally accessible
    window.PersistentMusicPlayer = PersistentMusicPlayer;
    window.persistentMusicPlayer = persistentMusicPlayer;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersistentMusicPlayer;
} 