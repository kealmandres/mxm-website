/**
 * MxM Universal JavaScript Framework
 * Reusable components and functionality for all MaCHiNE x MaiSON pages
 */

class MxMFramework {
    constructor(options = {}) {
        this.options = {
            enableAnimations: true,
            enableVideoControls: true,
            enableBackgroundEffects: true,
            enableMusicPlayer: false,
            debugMode: false,
            ...options
        };
        
        this.state = {
            isInitialized: false,
            currentBackgroundIndex: 0,
            videoObserver: null,
            intersectionObservers: []
        };
        
        this.init();
    }

    // Core initialization
    init() {
        if (this.state.isInitialized) return;
        
        this.log('Initializing MxM Framework...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        this.log('Initializing framework components...');
        
        // Core components
        this.initializeNavigation();
        this.initializeAccordions();
        this.initializeCards();
        this.initializeButtons();
        
        // Enhanced components
        if (this.options.enableBackgroundEffects) {
            this.initializeDynamicBackground();
            this.initializeBackgroundSlideshow();
        }
        
        if (this.options.enableVideoControls) {
            this.initializeVideoControls();
        }
        
        if (this.options.enableAnimations) {
            this.initializeScrollAnimations();
            this.initializeCardAnimations();
        }
        
        if (this.options.enableMusicPlayer) {
            this.initializeMusicPlayer();
        }
        
        // Initialize page-specific components
        this.initializeProcessSteps();
        
        this.state.isInitialized = true;
        this.log('MxM Framework initialized successfully');
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('mxmFrameworkReady', { 
            detail: { framework: this } 
        }));
    }

    // Logging utility
    log(message, ...args) {
        if (this.options.debugMode) {
            console.log(`[MxM Framework] ${message}`, ...args);
        }
    }

    error(message, ...args) {
        console.error(`[MxM Framework] ${message}`, ...args);
    }

    // Navigation system
    initializeNavigation() {
        const backButtons = document.querySelectorAll('.mxm-nav-back');
        backButtons.forEach(button => {
            button.addEventListener('click', this.handleNavigation.bind(this));
        });
        this.log(`Initialized ${backButtons.length} navigation elements`);
    }

    handleNavigation(event) {
        // Add smooth transition effect
        const button = event.currentTarget;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    // Accordion/FAQ system
    initializeAccordions() {
        const accordionItems = document.querySelectorAll('.mxm-accordion-item');
        
        accordionItems.forEach(item => {
            const trigger = item.querySelector('.mxm-accordion-trigger');
            const content = item.querySelector('.mxm-accordion-content');
            const icon = item.querySelector('.mxm-accordion-icon');

            if (trigger && content) {
                trigger.addEventListener('click', () => {
                    const isActive = item.classList.toggle('active');
                    content.style.maxHeight = isActive ? content.scrollHeight + 'px' : '0';
                    
                    // Smooth icon rotation
                    if (icon) {
                        icon.style.transform = isActive ? 'rotate(45deg)' : 'rotate(0deg)';
                    }
                });
            }
        });
        
        this.log(`Initialized ${accordionItems.length} accordion items`);
    }

    // Card system with tilt effects
    initializeCards() {
        const cards = document.querySelectorAll('.mxm-card');
        const MAX_ROTATION = 2;

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const mouseX = e.offsetX - rect.width / 2;
                const mouseY = e.offsetY - rect.height / 2;

                const rotateY = (mouseX / (rect.width / 2)) * MAX_ROTATION;
                const rotateX = -1 * (mouseY / (rect.height / 2)) * MAX_ROTATION;

                card.style.setProperty('--rotateX', `${rotateX}deg`);
                card.style.setProperty('--rotateY', `${rotateY}deg`);
                card.style.transform = `rotateX(var(--rotateX, 0deg)) rotateY(var(--rotateY, 0deg)) scale3d(1.03, 1.03, 1.03)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--rotateX', '0deg');
                card.style.setProperty('--rotateY', '0deg');
                card.style.transform = '';
            });
        });

        this.log(`Initialized ${cards.length} interactive cards`);
    }

    // Button enhancements
    initializeButtons() {
        const buttons = document.querySelectorAll('.mxm-btn');
        
        buttons.forEach(button => {
            // Add ripple effect
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: mxm-ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                if (!button.style.position || button.style.position === 'static') {
                    button.style.position = 'relative';
                }
                button.style.overflow = 'hidden';
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        });

        // Add ripple animation CSS if not already present
        if (!document.querySelector('#mxm-ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'mxm-ripple-styles';
            style.textContent = `
                @keyframes mxm-ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        this.log(`Enhanced ${buttons.length} buttons with ripple effects`);
    }

    // Dynamic background system
    initializeDynamicBackground() {
        const dynamicBg = document.querySelector('.mxm-bg-dynamic');
        const heroSection = document.querySelector('.mxm-video-hero, .mxm-section--hero');

        if (!dynamicBg || !heroSection) {
            this.log('Dynamic background elements not found, skipping initialization');
            return;
        }

        dynamicBg.style.opacity = '1';

        const handleScroll = () => {
            const heroScrollDepth = window.scrollY - heroSection.offsetTop;
            const heroHeight = heroSection.offsetHeight;
            let opacity = 1;

            const fadeStartPoint = heroHeight * 0.25;
            const fadeEndPoint = heroHeight * 0.75;

            if (heroScrollDepth > fadeStartPoint) {
                if (heroScrollDepth < fadeEndPoint) {
                    opacity = 1 - ((heroScrollDepth - fadeStartPoint) / (fadeEndPoint - fadeStartPoint));
                } else {
                    opacity = 0;
                }
            }
            
            dynamicBg.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        
        this.log('Dynamic background initialized');
    }

    // Background slideshow system
    initializeBackgroundSlideshow() {
        const slideshowContainer = document.querySelector('.mxm-bg-slideshow');
        const sections = Array.from(document.querySelectorAll('.mxm-section'));

        if (!slideshowContainer || sections.length === 0) {
            this.log('Background slideshow elements not found, skipping initialization');
            return;
        }

        const images = Array.from(slideshowContainer.querySelectorAll('.mxm-bg-slide'));
        if (images.length === 0) {
            this.log('No slideshow images found');
            return;
        }

        // Initialize image styles
        images.forEach((img, index) => {
            img.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: ${index === 0 ? '1' : '0'};
                transition: opacity 0.75s ease-in-out;
            `;
        });

        let previousImageIndex = 0;

        const calculateOpacity = (section, vh) => {
            const rect = section.getBoundingClientRect();
            const TOP_THRESHOLD = vh * 0.30;
            const BOTTOM_THRESHOLD = vh * 0.70;
            const FADE_VH = vh * 0.20;

            let topOpacity = 0;
            if (rect.top < TOP_THRESHOLD) {
                topOpacity = 1.0;
            } else if (rect.top < TOP_THRESHOLD + FADE_VH) {
                topOpacity = ((TOP_THRESHOLD + FADE_VH) - rect.top) / FADE_VH;
            }

            let bottomOpacity = 0;
            if (rect.bottom > BOTTOM_THRESHOLD) {
                bottomOpacity = 1.0;
            } else if (rect.bottom > BOTTOM_THRESHOLD - FADE_VH) {
                bottomOpacity = (rect.bottom - (BOTTOM_THRESHOLD - FADE_VH)) / FADE_VH;
            }

            return Math.max(0, Math.min(1, Math.min(topOpacity, bottomOpacity)));
        };

        const updateSlideshow = () => {
            const vh = window.innerHeight;
            let dominantSectionIndex = -1;
            let highestMetric = -Infinity;

            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                const visibleTop = Math.max(0, rect.top);
                const visibleBottom = Math.min(vh, rect.bottom);
                const visibleHeight = visibleBottom - visibleTop;

                if (visibleHeight > 0) {
                    const midCoverage = Math.max(0, Math.min(rect.bottom, vh * 0.75) - Math.max(rect.top, vh * 0.25));
                    const metric = visibleHeight + midCoverage * 2;
                    
                    if (metric > highestMetric) {
                        highestMetric = metric;
                        dominantSectionIndex = index;
                    }
                }
            });

            let currentImageIndex;
            let primaryOpacity;

            if (dominantSectionIndex !== -1) {
                currentImageIndex = dominantSectionIndex % images.length;
                primaryOpacity = calculateOpacity(sections[dominantSectionIndex], vh);
            } else {
                currentImageIndex = previousImageIndex;
                primaryOpacity = 1.0;
            }

            images.forEach((img, imgIndex) => {
                if (imgIndex === currentImageIndex) {
                    img.style.opacity = primaryOpacity.toString();
                } else if (imgIndex === previousImageIndex && currentImageIndex !== previousImageIndex) {
                    img.style.opacity = Math.max(0, 1.0 - primaryOpacity).toString();
                } else if (imgIndex === 0 && currentImageIndex !== 0 && 
                          previousImageIndex === currentImageIndex && primaryOpacity < 1.0) {
                    img.style.opacity = Math.max(0, 1.0 - primaryOpacity).toString();
                } else {
                    img.style.opacity = '0';
                }
            });

            previousImageIndex = currentImageIndex;
        };

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateSlideshow();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        updateSlideshow();
        this.log(`Background slideshow initialized with ${images.length} images`);
    }

    // Video controls and PiP functionality
    initializeVideoControls() {
        const videoWrapper = document.querySelector('.mxm-video-hero');
        const videoContainer = document.querySelector('.mxm-video-container');

        if (!videoWrapper || !videoContainer) {
            this.log('Video elements not found, skipping video controls');
            return;
        }

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                const activatePip = !entry.isIntersecting && 
                                 entry.boundingClientRect.bottom < (entry.target.offsetHeight * 0.05);
                const deactivatePip = entry.isIntersecting && entry.intersectionRatio >= 0.90;

                if (activatePip) {
                    videoContainer.classList.add('mxm-video-pip');
                    Object.assign(videoContainer.style, {
                        position: 'fixed',
                        bottom: '40px',
                        right: '40px',
                        top: 'auto',
                        left: 'auto',
                        width: '320px',
                        height: '180px',
                        zIndex: '2000',
                        opacity: '1'
                    });
                } else if (deactivatePip) {
                    videoContainer.classList.remove('mxm-video-pip');
                    ['position', 'bottom', 'right', 'top', 'left', 'width', 'height', 'zIndex', 'opacity']
                        .forEach(prop => videoContainer.style[prop] = '');
                }
            });
        };

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.05, 0.90, 1]
        };

        this.state.videoObserver = new IntersectionObserver(observerCallback, observerOptions);
        this.state.videoObserver.observe(videoWrapper);
        
        this.log('Video controls initialized');
    }

    // Scroll-based animations
    initializeScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-mxm-animate]');
        
        if (animatedElements.length === 0) {
            this.log('No elements with data-mxm-animate found');
            return;
        }

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationType = element.getAttribute('data-mxm-animate');
                    
                    switch (animationType) {
                        case 'fade-in':
                            element.classList.add('mxm-fade-in');
                            break;
                        case 'slide-up':
                            element.classList.add('mxm-slide-up');
                            break;
                        case 'float':
                            element.classList.add('mxm-float');
                            break;
                        case 'glow':
                            element.classList.add('mxm-glow');
                            break;
                        default:
                            element.classList.add('mxm-fade-in');
                    }
                    
                    // Remove observer after animation triggers
                    this.state.intersectionObservers.forEach(obs => obs.unobserve(element));
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });

        this.state.intersectionObservers.push(observer);
        this.log(`Scroll animations initialized for ${animatedElements.length} elements`);
    }

    // Card hover animations
    initializeCardAnimations() {
        const cards = document.querySelectorAll('.mxm-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.willChange = 'transform, box-shadow';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.willChange = 'auto';
            });
        });
        
        this.log(`Card animations initialized for ${cards.length} cards`);
    }

    // Process steps with scroll animations
    initializeProcessSteps() {
        const processContainer = document.querySelector('.mxm-process-steps');
        if (!processContainer) return;

        const steps = processContainer.querySelectorAll('.mxm-process-step');
        
        steps.forEach((step, index) => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(50px)';
            step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            step.style.transitionDelay = `${index * 0.1}s`;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const steps = entry.target.querySelectorAll('.mxm-process-step');
                    steps.forEach((step, index) => {
                        setTimeout(() => {
                            step.style.opacity = '1';
                            step.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(processContainer);
        this.log(`Process steps animation initialized for ${steps.length} steps`);
    }

    // Music player functionality
    initializeMusicPlayer() {
        const musicPlayer = document.querySelector('#mxm-music-player');
        const audioPlayer = document.querySelector('#mxm-audio-player');
        
        if (!musicPlayer || !audioPlayer) {
            this.log('Music player elements not found');
            return;
        }

        const musicButton = musicPlayer.querySelector('.music-button');
        const playIcon = musicPlayer.querySelector('.play-icon');
        const pauseIcon = musicPlayer.querySelector('.pause-icon');

        if (!musicButton || !playIcon || !pauseIcon) {
            this.error('Required music player elements missing');
            return;
        }

        audioPlayer.volume = 0.2;

        const updateUI = (isPlaying) => {
            musicPlayer.classList.toggle('active', isPlaying);
            playIcon.style.display = isPlaying ? 'none' : 'block';
            pauseIcon.style.display = isPlaying ? 'block' : 'none';
        };

        const togglePlay = () => {
            if (audioPlayer.paused) {
                audioPlayer.play().catch(e => {
                    this.log('Audio play prevented:', e);
                    updateUI(false);
                });
            } else {
                audioPlayer.pause();
            }
        };

        audioPlayer.onplay = () => updateUI(true);
        audioPlayer.onpause = () => updateUI(false);
        musicButton.addEventListener('click', togglePlay);

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !audioPlayer.paused) {
                audioPlayer.pause();
            }
        });

        updateUI(false);
        this.log('Music player initialized');
    }

    // Utility methods for external use
    showSection(sectionSelector, animationType = 'fade-in') {
        const section = document.querySelector(sectionSelector);
        if (section) {
            section.classList.add(`mxm-${animationType}`);
        }
    }

    hideSection(sectionSelector) {
        const section = document.querySelector(sectionSelector);
        if (section) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
        }
    }

    updateBackgroundImage(imageUrl) {
        const dynamicBg = document.querySelector('.mxm-bg-dynamic');
        if (dynamicBg) {
            dynamicBg.style.backgroundImage = `url('${imageUrl}')`;
        }
    }

    triggerRipple(element, x, y) {
        if (!element) return;
        
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x - size/2}px;
            top: ${y - size/2}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: mxm-ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Cleanup method
    destroy() {
        // Remove event listeners and observers
        if (this.state.videoObserver) {
            this.state.videoObserver.disconnect();
        }
        
        this.state.intersectionObservers.forEach(observer => {
            observer.disconnect();
        });
        
        this.state.isInitialized = false;
        this.log('MxM Framework destroyed');
    }
}

// Auto-initialize framework when script loads
let mxmFramework;

// Configuration based on page type or data attributes
const getFrameworkConfig = () => {
    const body = document.body;
    const config = {
        debugMode: body.hasAttribute('data-mxm-debug'),
        enableAnimations: !body.hasAttribute('data-mxm-no-animations'),
        enableVideoControls: !!document.querySelector('.mxm-video-hero'),
        enableBackgroundEffects: !!document.querySelector('.mxm-bg-dynamic, .mxm-bg-slideshow'),
        enableMusicPlayer: !!document.querySelector('#mxm-music-player')
    };
    
    return config;
};

// Initialize framework
document.addEventListener('DOMContentLoaded', () => {
    const config = getFrameworkConfig();
    mxmFramework = new MxMFramework(config);
    
    // Make framework globally available
    window.MxM = mxmFramework;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MxMFramework;
}