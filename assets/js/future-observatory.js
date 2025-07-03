/**
 * Future Observatory Page JavaScript
 * Handles Substack RSS feed, YouTube video detection, Crystal Cube form, and volume display
 */

// Substack RSS Feed Loading
function loadSubstackFeed() {
    
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://marissakos.substack.com/feed')
        .then(r => r.json())
        .then(data => {
            const feed = document.getElementById('substack-feed');
            if (!feed) {
                console.error('Substack feed container not found');
                return;
            }
            
            data.items.slice(0, 2).forEach((post, index) => {
                
                // Handle thumbnail with fallback
                let thumbnailSrc = post.thumbnail || post.enclosure?.link || '';
                
                // If no thumbnail, try to extract from content
                if (!thumbnailSrc && post.content) {
                    const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) {
                        thumbnailSrc = imgMatch[1];
                    }
                }
                
                // Fallback to a default image if still no thumbnail
                if (!thumbnailSrc) {
                    thumbnailSrc = '../assets/images/future-observatory/default-post-image.png';
                }
                
                
                feed.innerHTML += `
                    <a href="${post.link}" target="_blank">
                        <div class="mm-offering-card">
                            <div class="mm-offering-text-content">
                                <img src="${thumbnailSrc}" 
                                     alt="${post.title}"
                                     onerror="this.style.display='none';"
                                     onload="">
                                <h3 class="mm-offering-title">${post.title}</h3>
                                <p class="mm-offering-description">${post.description}</p>
                            </div>
                        </div>
                    </a>
                `;
            });
        })
        .catch(error => {
            console.error('RSS Feed Error:', error);
            const feed = document.getElementById('substack-feed');
            if (feed) {
                feed.innerHTML = 'Unable to load posts';
            }
        });
}

// Enhanced YouTube Video Detection
function setupYouTubeDetection() {
    
    // Find the YouTube iframe in the Teleportation Telescope section
    const youtubeIframe = document.querySelector('iframe[src*="youtube.com"]');
    
    if (youtubeIframe && window.persistentMusicPlayer) {
        
        // Add additional click detection for the video wrapper
        const videoWrapper = youtubeIframe.closest('.video-yt-wrapper') || youtubeIframe.closest('.video-placeholder');
        if (videoWrapper) {
            videoWrapper.addEventListener('click', function() {
                // Give the iframe a moment to process the click, then set playing state
                setTimeout(() => {
                    if (youtubeIframe._setPlaying) {
                        // Toggle the playing state
                        const currentlyPlaying = youtubeIframe._isPlaying ? youtubeIframe._isPlaying() : false;
                        youtubeIframe._setPlaying(!currentlyPlaying);
                    }
                }, 100);
            });
            
            // Add visual feedback when clicking
            videoWrapper.style.cursor = 'pointer';
            videoWrapper.title = 'Click to play/pause video (will duck background music)';
        }
        
        // Add section-specific scroll detection
        const telescopeSection = document.querySelector('[data-section-key="Teleportation Telescope Section"]');
        if (telescopeSection) {
            let scrollTimer;
            const handleSectionScroll = () => {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                    const rect = telescopeSection.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    
                    if (!isVisible && youtubeIframe._isPlaying && youtubeIframe._isPlaying()) {
                        if (youtubeIframe._setPlaying) {
                            youtubeIframe._setPlaying(false);
                        }
                    }
                }, 300);
            };
            
            window.addEventListener('scroll', handleSectionScroll);
        }
        
        // Add keyboard support for accessibility
        youtubeIframe.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (youtubeIframe._setPlaying) {
                    const currentlyPlaying = youtubeIframe._isPlaying ? youtubeIframe._isPlaying() : false;
                    youtubeIframe._setPlaying(!currentlyPlaying);
                }
            }
        });
    }
    
    // Add debug functionality if debug mode is enabled
    if (window.location.search.includes('debug=true')) {
        setupDebugMode(youtubeIframe);
    }
}

// Debug Mode Setup
function setupDebugMode(youtubeIframe) {
    // Add manual volume restore button for debugging
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Restore Volume';
    debugButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 10000;
        background: red;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
    `;
    debugButton.onclick = () => {
        if (window.persistentMusicPlayer) {
            window.persistentMusicPlayer.manualVolumeRestore();
        }
    };
    document.body.appendChild(debugButton);
    
    // Add debug info display
    const debugInfo = document.createElement('div');
    debugInfo.id = 'debug-info';
    debugInfo.style.cssText = `
        position: fixed;
        top: 60px;
        right: 10px;
        z-index: 10000;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        max-width: 300px;
    `;
    document.body.appendChild(debugInfo);
    
    // Update debug info every second
    setInterval(() => {
        if (youtubeIframe && window.persistentMusicPlayer) {
            const isPlaying = youtubeIframe._isPlaying ? youtubeIframe._isPlaying() : false;
            const isDucked = window.persistentMusicPlayer.isDucked;
            const volume = window.persistentMusicPlayer.getVolume();
            
            debugInfo.innerHTML = `
                <strong>YouTube Debug Info:</strong><br>
                Playing: ${isPlaying}<br>
                Volume Ducked: ${isDucked}<br>
                Current Volume: ${(volume * 100).toFixed(0)}%<br>
                Iframe Visible: ${youtubeIframe.getBoundingClientRect().top < window.innerHeight}
            `;
        }
    }, 1000);
}

// Volume Display Updates
function setupVolumeDisplay() {
    // Update volume display in real-time
    const volumeSlider = document.getElementById('volume-slider');
    const volumeDisplay = document.querySelector('.volume-display');
    
    if (volumeSlider && volumeDisplay) {
        volumeSlider.addEventListener('input', function() {
            volumeDisplay.textContent = Math.round(this.value * 100) + '%';
        });
    }
    
    // Update music status label based on playback state
    function updateMusicLabel() {
        const label = document.querySelector('.music-status-label');
        if (window.persistentMusicPlayer && label) {
            const isPlaying = window.persistentMusicPlayer.isPlaying();
            label.textContent = isPlaying ? 'MxM Mix ♪' : 'MxM Mix';
        }
    }
    
    // Update label every second
    setInterval(updateMusicLabel, 1000);
}

// Crystal Cube Form Handling
function setupCrystalCubeForm() {
    const form = document.getElementById('crystalCubeForm');
    if (!form) {
        console.error('Crystal Cube form not found');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Basic validation
        if (!validateCrystalCubeForm()) {
            return;
        }
        
        const button = document.getElementById('submitCrystalCubeButton');
        const originalText = button.innerHTML;
        
        // Show loading state
        button.innerHTML = 'Transmitting to Crystal Cube...';
        button.disabled = true;
        
        try {
            // Prepare form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // Handle checkbox - set to "Yes" if checked, "No" if not
            data.permission = document.getElementById('crystalPermission').checked ? 'Yes' : 'No';
            
            
            // Send to n8n webhook
            const response = await fetch('https://themxm.app.n8n.cloud/webhook/form-submission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Success - Monochrome styling
                button.innerHTML = 'Transmitted ✓';
                button.style.background = 'rgba(255, 255, 255, 0.9)';
                button.style.color = '#000000';
                button.style.borderColor = 'rgba(255, 255, 255, 1)';
                button.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
                
                // Show success message
                showCrystalCubeMessage('Your prediction has been transmitted to the Crystal Cube! Expect insights within 24-48 hours.', 'success');
                
                // Reset after 3 seconds
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                    button.style.color = '';
                    button.style.borderColor = '';
                    button.style.boxShadow = '';
                    button.disabled = false;
                    this.reset();
                    clearCrystalCubeMessages();
                }, 3000);
                
            } else {
                throw new Error('Network response was not ok');
            }
            
        } catch (error) {
            // Error handling - Monochrome styling
            button.innerHTML = 'Transmission Failed - Try Again?';
            button.style.background = 'rgba(128, 128, 128, 0.8)';
            button.style.color = '#FFFFFF';
            button.style.borderColor = 'rgba(128, 128, 128, 1)';
            button.disabled = false;
            
            showCrystalCubeMessage('Failed to transmit to Crystal Cube. Please try again.', 'error');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
                button.style.color = '';
                button.style.borderColor = '';
                clearCrystalCubeMessages();
            }, 3000);
            
            console.error('Crystal Cube submission error:', error);
        }
    });
    
    // Setup real-time validation
    setupCrystalCubeValidation();
}

// Form validation function for Crystal Cube
function validateCrystalCubeForm() {
    const requiredFields = ['crystalName', 'crystalEmail', 'crystalPrediction', 'crystalIndustry'];
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.form-field-error').forEach(field => {
        field.classList.remove('form-field-error');
    });
    
    // Check required fields
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('form-field-error');
            isValid = false;
        }
    });
    
    // Email validation
    const email = document.getElementById('crystalEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        email.classList.add('form-field-error');
        isValid = false;
    }
    
    if (!isValid) {
        showCrystalCubeMessage('Please fill in all required fields correctly.', 'error');
    } else {
        clearCrystalCubeMessages();
    }
    
    return isValid;
}

// Setup real-time validation for Crystal Cube form
function setupCrystalCubeValidation() {
    // Add real-time validation for Crystal Cube form
    const emailField = document.getElementById('crystalEmail');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.classList.add('form-field-error');
            } else {
                this.classList.remove('form-field-error');
            }
        });
    }
    
    // Remove error styling when user starts typing
    ['crystalName', 'crystalEmail', 'crystalPrediction', 'crystalIndustry'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                this.classList.remove('form-field-error');
            });
        }
    });
}

// Helper functions for Crystal Cube messages
function showCrystalCubeMessage(text, type) {
    clearCrystalCubeMessages();
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'form-error-message' : 'form-success-message';
    messageDiv.textContent = text;
    const submitContainer = document.querySelector('.submit-button-container');
    if (submitContainer) {
        submitContainer.prepend(messageDiv);
    }
}

function clearCrystalCubeMessages() {
    const errorMsg = document.querySelector('.form-error-message');
    const successMsg = document.querySelector('.form-success-message');
    if (errorMsg) errorMsg.remove();
    if (successMsg) successMsg.remove();
}

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all components
    loadSubstackFeed();
    setupYouTubeDetection();
    setupVolumeDisplay();
    setupCrystalCubeForm();
    
});

// Cleanup function for when user navigates away
function cleanupFutureObservatory() {
    
    // Find any YouTube iframes and reset their playing state
    const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"]');
    youtubeIframes.forEach(iframe => {
        if (iframe._setPlaying) {
            iframe._setPlaying(false);
        }
    });
    
    // Force music player to check and restore volume if needed
    if (window.persistentMusicPlayer && window.persistentMusicPlayer.isDucked) {
        setTimeout(() => {
            window.persistentMusicPlayer.forceCheckVideoState();
        }, 100);
    }
}

// Run cleanup when page is about to unload
window.addEventListener('beforeunload', cleanupFutureObservatory);

// Run cleanup on visibility change (when user switches tabs/windows)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        cleanupFutureObservatory();
    }
}); 