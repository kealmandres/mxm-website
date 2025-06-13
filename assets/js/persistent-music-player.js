/**
 * Persistent Music Player
 * Maintains continuous background music playback across multiple HTML pages
 * Uses localStorage to persist audio state (currentTime, volume, isPlaying)
 */

class PersistentMusicPlayer {
    constructor() {
        this.audio = null;
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
        this.duckedVolume = 0.05; // 5% volume when video is playing
        this.isDucked = false;
        this.videoElements = [];
        
        // Default state
        this.defaultState = {
            currentTime: 0,
            volume: 0.5,
            isPlaying: false,
            src: '',
            userInteracted: false
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
        console.log('🎵 Initializing Persistent Music Player...');
        
        // Get DOM elements
        this.audio = document.getElementById('background-music');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeToggleBtn = document.getElementById('volume-toggle-btn');
        this.volumeControlContainer = document.getElementById('volume-control-container');
        
        if (!this.audio) {
            console.error('❌ Audio element with id "background-music" not found');
            return;
        }
        
        // Load saved state
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
        
        console.log('✅ Persistent Music Player initialized');
    }
    
    loadState() {
        try {
            const savedState = localStorage.getItem(this.storageKey);
            if (savedState) {
                this.state = { ...this.defaultState, ...JSON.parse(savedState) };
                console.log('📁 Loaded saved state:', this.state);
            } else {
                this.state = { ...this.defaultState };
                console.log('🆕 Using default state');
            }
        } catch (error) {
            console.error('❌ Error loading state from localStorage:', error);
            this.state = { ...this.defaultState };
        }
    }
    
    saveState() {
        try {
            const stateToSave = {
                currentTime: this.audio.currentTime || 0,
                volume: this.audio.volume || 0.5,
                isPlaying: !this.audio.paused && !this.audio.ended,
                src: this.audio.src || '',
                userInteracted: this.userInteracted
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('❌ Error saving state to localStorage:', error);
        }
    }
    
    applyState() {
        if (!this.audio) return;
        
        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '/index.html';
        
        // Set volume
        this.audio.volume = this.state.volume;
        if (this.volumeSlider) {
            this.volumeSlider.value = this.state.volume;
        }
        
        // Set source if it exists and is different
        if (this.state.src && this.audio.src !== this.state.src) {
            this.audio.src = this.state.src;
        }
        
        // Set current time when audio is ready
        const setCurrentTime = () => {
            if (this.state.currentTime > 0) {
                this.audio.currentTime = this.state.currentTime;
                console.log(`⏰ Restored playback position: ${this.state.currentTime.toFixed(2)}s`);
            }
        };
        
        if (this.audio.readyState >= 2) {
            setCurrentTime();
        } else {
            this.audio.addEventListener('canplay', setCurrentTime, { once: true });
        }
        
        // Update UI
        this.updatePlayPauseButton();
        
        // Enhanced autoplay logic for home page
        if (isHomePage) {
            console.log('🏠 Home page detected - attempting enhanced autoplay');
            
            // For returning users who had music playing
            if (this.state.isPlaying && this.state.userInteracted) {
                this.attemptAutoResume();
            }
            // For new users on home page - try to start music
            else if (!this.state.userInteracted) {
                console.log('🆕 New user on home page - will attempt autoplay');
                // The actual autoplay attempt will happen in setupUserInteractionDetection
            }
        } else {
            // Standard behavior for other pages
            if (this.state.isPlaying && this.state.userInteracted) {
                this.attemptAutoResume();
            }
        }
    }
    
    async attemptAutoResume() {
        try {
            await this.audio.play();
            console.log('🎵 Successfully resumed playback');
        } catch (error) {
            console.log('⚠️ Autoplay blocked, waiting for user interaction:', error.message);
            this.autoplayBlocked = true;
            this.showAutoplayPrompt();
        }
    }
    
    setupEventListeners() {
        if (!this.audio) return;
        
        // Audio event listeners
        this.audio.addEventListener('play', () => {
            this.state.isPlaying = true;
            this.updatePlayPauseButton();
            this.saveState();
        });
        
        this.audio.addEventListener('pause', () => {
            this.state.isPlaying = false;
            this.updatePlayPauseButton();
            this.saveState();
        });
        
        this.audio.addEventListener('ended', () => {
            this.state.isPlaying = false;
            this.updatePlayPauseButton();
            this.saveState();
        });
        
        this.audio.addEventListener('volumechange', () => {
            this.state.volume = this.audio.volume;
            if (this.volumeSlider) {
                this.volumeSlider.value = this.audio.volume;
            }
            this.saveState();
        });
        
        this.audio.addEventListener('loadedmetadata', () => {
            this.state.src = this.audio.src;
            this.saveState();
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('❌ Audio error:', e);
            this.state.isPlaying = false;
            this.updatePlayPauseButton();
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
                console.log('📱 Page hidden - immediately restoring volume');
                this.forceRestoreVolume();
            } else {
                // Page is visible, potentially resume if it was playing
                console.log('📱 Page visible - checking music and video state');
                if (this.state.isPlaying && this.audio.paused) {
                    this.play();
                }
                // Re-check video states after page becomes visible
                setTimeout(() => this.forceCheckVideoState(), 1000);
            }
        });
        
        // Enhanced navigation detection
        window.addEventListener('beforeunload', () => {
            console.log('🚪 Page unloading - saving state and restoring volume');
            this.saveState();
            this.forceRestoreVolume();
        });
        
        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            console.log('⬅️ Browser navigation detected - restoring volume');
            this.forceRestoreVolume();
            setTimeout(() => {
                this.forceCheckVideoState();
            }, 500);
        });
        
        // Handle hash changes (SPA navigation)
        window.addEventListener('hashchange', () => {
            console.log('🔗 Hash change detected - checking videos');
            setTimeout(() => {
                this.forceCheckVideoState();
            }, 300);
        });
        
        // Handle focus/blur for the entire window
        window.addEventListener('focus', () => {
            console.log('🎯 Window focused - checking video states');
            setTimeout(() => this.forceCheckVideoState(), 300);
        });
        
        window.addEventListener('blur', () => {
            console.log('😴 Window blurred - restoring volume');
            this.forceRestoreVolume();
        });
    }
    
    setupUserInteractionDetection() {
        // Enhanced autoplay detection for home page
        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '/index.html';
        
        const handleFirstInteraction = () => {
            console.log('👆 First user interaction detected');
            this.userInteracted = true;
            this.state.userInteracted = true;
            this.saveState();
            
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
            console.log('🎯 Minimal interaction detected on home page');
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
            console.log('🏠 Home page detected - enabling enhanced autoplay detection');
            
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
        console.log('🚀 Attempting immediate autoplay on home page...');
        try {
            await this.audio.play();
            console.log('🎵 Immediate autoplay successful!');
            this.state.isPlaying = true;
            this.updatePlayPauseButton();
            this.saveState();
        } catch (error) {
            console.log('⚠️ Immediate autoplay blocked:', error.message);
            this.autoplayBlocked = true;
            // Don't show prompt immediately, wait for user interaction
        }
    }
    
    async attemptAutoplayOnInteraction() {
        console.log('🎵 Attempting autoplay after user interaction...');
        try {
            await this.audio.play();
            console.log('✅ Autoplay successful after interaction!');
            this.state.isPlaying = true;
            this.updatePlayPauseButton();
            this.saveState();
            this.autoplayBlocked = false;
            this.hideAutoplayPrompt();
        } catch (error) {
            console.log('❌ Autoplay still blocked after interaction:', error.message);
            this.showAutoplayPrompt();
        }
    }
    
    async play() {
        if (!this.audio) return false;
        
        try {
            await this.audio.play();
            console.log('🎵 Music started playing');
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
        
        this.audio.pause();
        console.log('⏸️ Music paused');
    }
    
    async togglePlayPause() {
        if (!this.audio) return;
        
        if (this.audio.paused || this.audio.ended) {
            await this.play();
        } else {
            this.pause();
        }
    }
    
    setVolume(volume) {
        if (!this.audio) return;
        
        // Clamp volume between 0 and 1
        volume = Math.max(0, Math.min(1, volume));
        
        if (this.isDucked) {
            // If currently ducked, update the original volume but don't change current volume
            this.originalVolume = volume;
            console.log(`🔊 Original volume updated to: ${(volume * 100).toFixed(0)}% (will restore when video ends)`);
        } else {
            // Normal volume change
            this.audio.volume = volume;
            this.originalVolume = volume;
            console.log(`🔊 Volume set to: ${(volume * 100).toFixed(0)}%`);
        }
    }
    
    updatePlayPauseButton() {
        if (!this.playPauseBtn) return;
        
        const isPlaying = !this.audio.paused && !this.audio.ended;
        
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
                console.log('🎵 Music enabled by user');
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
            console.log('❌ User dismissed autoplay prompt');
            this.hideAutoplayPrompt();
        });
        
        console.log('📢 Autoplay prompt displayed');
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
    
    // Public API methods
    getCurrentTime() {
        return this.audio ? this.audio.currentTime : 0;
    }
    
    getDuration() {
        return this.audio ? this.audio.duration : 0;
    }
    
    getVolume() {
        return this.audio ? this.audio.volume : 0;
    }
    
    isPlaying() {
        return this.audio ? (!this.audio.paused && !this.audio.ended) : false;
    }
    
    setCurrentTime(time) {
        if (this.audio && this.audio.duration) {
            this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
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
    
    // Video ducking methods
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
            console.log('🎬 Video started playing - ducking music volume');
            this.duckVolume();
        });
        
        video.addEventListener('pause', () => {
            console.log('⏸️ Video paused - checking if should restore volume');
            this.checkRestoreVolume();
        });
        
        video.addEventListener('ended', () => {
            console.log('🏁 Video ended - checking if should restore volume');
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
                    console.log('🎬 Vimeo video started playing - ducking music volume');
                    this.duckVolume();
                });
                
                player.on('pause', () => {
                    console.log('⏸️ Vimeo video paused - restoring music volume');
                    this.restoreVolume();
                });
                
                player.on('ended', () => {
                    console.log('🏁 Vimeo video ended - restoring music volume');
                    this.restoreVolume();
                });
                
                // Store player reference for cleanup
                iframe._vimeoPlayer = player;
                
                console.log('✅ Vimeo Player API connected successfully');
                return;
            } catch (error) {
                console.log('⚠️ Vimeo Player API not available, using fallback detection');
            }
        }
        
        // Fallback to generic iframe handling if Vimeo API not available
        this.setupGenericIframe(iframe);
    }
    
    setupGenericIframe(iframe) {
        // Enhanced detection for generic iframes
        let isPlaying = false;
        let playCheckInterval = null;
        
        // Method 1: Intersection Observer for visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
                    // Iframe is highly visible, likely playing
                    if (!isPlaying) {
                        console.log('🎬 Iframe video likely started - ducking music volume');
                        this.duckVolume();
                        isPlaying = true;
                        
                        // Start monitoring for when it might stop
                        this.startPlaybackMonitoring(iframe);
                    }
                } else if (entry.intersectionRatio < 0.3) {
                    // Iframe is barely visible or hidden
                    if (isPlaying) {
                        console.log('👁️ Iframe video likely stopped - restoring music volume');
                        this.restoreVolume();
                        isPlaying = false;
                        this.stopPlaybackMonitoring(iframe);
                    }
                }
            });
        }, { threshold: [0, 0.3, 0.7, 1] });
        
        observer.observe(iframe);
        iframe._intersectionObserver = observer;
        
        // Method 2: Click detection to assume play/pause
        iframe.addEventListener('click', () => {
            console.log('🖱️ Iframe clicked - toggling video state');
            if (isPlaying) {
                console.log('⏸️ Assuming video paused - restoring volume');
                this.restoreVolume();
                isPlaying = false;
                this.stopPlaybackMonitoring(iframe);
            } else {
                console.log('▶️ Assuming video played - ducking volume');
                this.duckVolume();
                isPlaying = true;
                this.startPlaybackMonitoring(iframe);
            }
        });
        
        // Method 3: Focus events
        iframe.addEventListener('focus', () => {
            if (!isPlaying) {
                console.log('🎯 Iframe focused - likely video starting');
                setTimeout(() => {
                    this.duckVolume();
                    isPlaying = true;
                    this.startPlaybackMonitoring(iframe);
                }, 1000);
            }
        });
        
        // Store state
        iframe._isPlaying = () => isPlaying;
        iframe._setPlaying = (playing) => { isPlaying = playing; };
    }
    
    startPlaybackMonitoring(iframe) {
        // Monitor for signs that video has stopped
        if (iframe._playbackMonitor) {
            clearInterval(iframe._playbackMonitor);
        }
        
        iframe._playbackMonitor = setInterval(() => {
            // Check if iframe is still visible and likely playing
            const rect = iframe.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            const isLargeEnough = rect.width > 200 && rect.height > 150;
            
            if (!isVisible || !isLargeEnough || document.hidden) {
                console.log('📱 Video monitoring detected stop condition - restoring volume');
                this.restoreVolume();
                if (iframe._setPlaying) iframe._setPlaying(false);
                this.stopPlaybackMonitoring(iframe);
            }
        }, 2000); // Check every 2 seconds
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
        if (!this.audio || this.isDucked) return;
        
        // Store the current volume as original volume
        this.originalVolume = this.audio.volume;
        
        // Duck the volume
        this.audio.volume = this.duckedVolume;
        this.isDucked = true;
        
        // Update volume slider to reflect ducked volume
        if (this.volumeSlider) {
            this.volumeSlider.value = this.duckedVolume;
        }
        
        console.log(`🔉 Music volume ducked from ${(this.originalVolume * 100).toFixed(0)}% to ${(this.duckedVolume * 100).toFixed(0)}%`);
    }
    
    restoreVolume() {
        if (!this.audio || !this.isDucked) return;
        
        // Restore the original volume
        this.audio.volume = this.originalVolume;
        this.isDucked = false;
        
        // Update volume slider to reflect restored volume
        if (this.volumeSlider) {
            this.volumeSlider.value = this.originalVolume;
        }
        
        console.log(`🔊 Music volume restored to ${(this.originalVolume * 100).toFixed(0)}%`);
    }
    
    checkRestoreVolume() {
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
                
                // Fallback: check visibility and size
                const rect = iframe.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                const isLargeEnough = rect.width > 200 && rect.height > 150;
                const isInViewport = isVisible && isLargeEnough;
                
                // Only consider it playing if it's prominently visible
                return isInViewport && rect.intersectionRatio > 0.7;
            });
        }
        
        // If page is hidden, definitely not playing
        if (document.hidden) {
            anyVideoPlaying = false;
        }
        
        console.log(`🔍 Checking restore volume - any video playing: ${anyVideoPlaying}`);
        
        if (!anyVideoPlaying) {
            console.log('✅ No videos playing - restoring volume');
            this.restoreVolume();
        }
    }
    
    // Force restore volume immediately (for navigation)
    forceRestoreVolume() {
        console.log('🔊 Force restoring volume immediately');
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
        console.log('🔄 Force checking all video states');
        
        // If we're on a different page or no videos visible, restore volume
        const hasVisibleVideos = this.videoElements.some(element => {
            const rect = element.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 200;
        });
        
        if (!hasVisibleVideos) {
            console.log('📭 No visible videos found - restoring volume');
            this.forceRestoreVolume();
            return;
        }
        
        // Re-scan for videos in case DOM changed
        this.findVideoElements();
        
        // Check current state
        setTimeout(() => this.checkRestoreVolume(), 500);
    }
    
    // Cleanup method
    destroy() {
        this.stopStateSaving();
        this.saveState();
        this.hideAutoplayPrompt();
        console.log('🧹 Persistent Music Player destroyed');
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