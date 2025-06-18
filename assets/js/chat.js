// JavaScript for the Artificial Ingenious page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Artificial Ingenious page specific JS loaded.');

    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.artificial-ingenious .faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.accordion-icon');

        question.addEventListener('click', () => {
            const isActive = item.classList.toggle('active');
            answer.style.maxHeight = isActive ? answer.scrollHeight + 'px' : '0';
        });
    });

    // Force Blonde Bot images to be visible and attempt reload on error
    const blondeBotImages = document.querySelectorAll('.artificial-ingenious .blonde-bot-image');
    blondeBotImages.forEach((img, index) => {
        img.style.setProperty('display', 'block', 'important');
        img.style.setProperty('opacity', '1', 'important');
        img.style.setProperty('visibility', 'visible', 'important');
        img.style.setProperty('z-index', 'auto', 'important'); // Changed from 999 to auto, CSS should handle layering
        
        img.addEventListener('load', function() {
            console.log(`Blonde Bot image #${index + 1} loaded successfully: ${img.src}`);
        });
        
        img.addEventListener('error', function() {
            console.error(`Failed to load Blonde Bot image #${index + 1}: ${img.src}`);
            const originalSrc = img.src;
            // Avoid infinite loop if ?t=... is already there or image truly doesn't exist
            if (!originalSrc.includes('?t=')) {
                 setTimeout(() => {
                    img.src = originalSrc + '?t=' + new Date().getTime();
                }, 500);
            }
        });
        
        // Initial check, if src is placeholder or seems off, try to trigger load if necessary
        // This part might be aggressive if images are meant to lazy load via other scripts
        // Consider if the original 'force reload image' logic is still needed with error handling
        if (img.complete && img.naturalHeight === 0) {
            console.warn(`Blonde Bot image #${index + 1} might be missing or failed to load initially: ${img.src}`);
        }
    });
    console.log('Found', blondeBotImages.length, 'Blonde Bot images to monitor.');

    // Blonde Bot Image Loader for offerings (if applicable, or general image lazy loader)
    // This was a previous example, adjust if this specific image is no longer there or logic needs change
    const blondeBotOfferImage = document.querySelector('.offering-card.featured .offering-image[src*="blonde-bot"]');
    if (blondeBotOfferImage && !blondeBotOfferImage.complete) {
        // Optional: Add a loading class or placeholder handling
        blondeBotOfferImage.onload = () => {
            // Optional: Remove loading class
        };
        blondeBotOfferImage.onerror = () => {
            // Optional: Handle error, e.g., show a default image or message
            // To prevent infinite loops if the image path is broken, don't try to reload it here without a counter/flag.
            console.error('Blonde Bot offering image failed to load.');
        };
    } else if (blondeBotOfferImage && blondeBotOfferImage.complete) {
        // Image was already loaded (e.g. from cache)
    }

    // New: Dynamic Page Background Scroll Logic
    const dynamicBg = document.getElementById('dynamic-page-background');
    const heroSection = document.querySelector('.video-hero-section');

    if (dynamicBg && heroSection) {
        // Ensure initial state is image visible
        dynamicBg.style.opacity = '1'; // Explicitly set initial opacity

        const handlePageBackgroundScroll = () => {
            // Calculate scroll depth relative to the hero section's top
            const heroScrollDepth = window.scrollY - heroSection.offsetTop;
            const heroHeight = heroSection.offsetHeight;
            let opacity = 1;

            // Define fade points: start fading when viewport top is 25% into hero, end at 75%
            const fadeStartPoint = heroHeight * 0.25;
            const fadeEndPoint = heroHeight * 0.75;

            if (heroScrollDepth > fadeStartPoint) { // If we are past the point to start fading
                if (heroScrollDepth < fadeEndPoint) {
                    // Calculate opacity: 1 at fadeStartPoint, 0 at fadeEndPoint
                    opacity = 1 - ((heroScrollDepth - fadeStartPoint) / (fadeEndPoint - fadeStartPoint));
                } else {
                    opacity = 0; // Scrolled past the fade end point, so fully faded
                }
            } else {
                opacity = 1; // Before the fade start point, so fully visible
            }
            
            // Apply opacity, ensuring it's clamped between 0 and 1
            dynamicBg.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
        };

        window.addEventListener('scroll', handlePageBackgroundScroll);
        // Initial call to set state based on current scroll (e.g. if page is reloaded scrolled down)
        handlePageBackgroundScroll(); 
    } else {
        if (!dynamicBg) console.error('Error: #dynamic-page-background element not found.');
        if (!heroSection) console.error('Error: .video-hero-section element not found for dynamic background.');
    }

    // Video Picture-in-Picture (PiP) scroll behavior
    const videoHeroWrapper = document.querySelector('.video-hero-wrapper'); // Target the wrapper
    const videoHeroSectionForPip = document.querySelector('.video-hero-section'); // Section to apply PiP class to

    if (videoHeroWrapper && videoHeroSectionForPip) {
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                // Condition to activate PiP: Wrapper's bottom is above a small fraction of its height from the viewport top
                // (meaning it's mostly scrolled past and out of view upwards)
                const activatePip = !entry.isIntersecting && entry.boundingClientRect.bottom < (entry.target.offsetHeight * 0.05);
                
                // Condition to deactivate PiP: Wrapper is at least 90% visible in the viewport
                const deactivatePip = entry.isIntersecting && entry.intersectionRatio >= 0.90;

                if (activatePip) {
                    videoHeroSectionForPip.classList.add('video-pip-mode');
                    // Styles are forced via JS for reliable positioning
                    videoHeroSectionForPip.style.position = 'fixed';
                    videoHeroSectionForPip.style.bottom = '40px';
                    videoHeroSectionForPip.style.right = '40px';
                    videoHeroSectionForPip.style.top = 'auto';
                    videoHeroSectionForPip.style.left = 'auto';
                    videoHeroSectionForPip.style.width = '320px';
                    videoHeroSectionForPip.style.height = '180px';
                    videoHeroSectionForPip.style.zIndex = '2000';
                    videoHeroSectionForPip.style.opacity = '1';
                } else if (deactivatePip) {
                    videoHeroSectionForPip.classList.remove('video-pip-mode');
                    // Clear forced styles
                    videoHeroSectionForPip.style.position = '';
                    videoHeroSectionForPip.style.bottom = '';
                    videoHeroSectionForPip.style.right = '';
                    videoHeroSectionForPip.style.top = '';
                    videoHeroSectionForPip.style.left = '';
                    videoHeroSectionForPip.style.width = '';
                    videoHeroSectionForPip.style.height = '';
                    videoHeroSectionForPip.style.zIndex = '';
                    videoHeroSectionForPip.style.opacity = '';
                }
            });
        };

        const observerOptions = {
            root: null, // Observing intersections relative to the viewport
            rootMargin: '0px',
            threshold: [0, 0.05, 0.90, 1] // Callbacks at more granular points
        };

        const videoObserver = new IntersectionObserver(observerCallback, observerOptions);
        videoObserver.observe(videoHeroWrapper); // Observe the wrapper
    } else {
        if (!videoHeroWrapper) console.error('Error: .video-hero-wrapper element not found for PiP.');
        if (!videoHeroSectionForPip) console.error('Error: .video-hero-section element not found for PiP class application.');
    }

    // Initialize Process Section Scroll Image Animation
    initProcessScrollImageAnimation();

    // Initialize Hero Background Slideshow
    setupScrollDrivenHeroSlideshow();

    // Initialize Offering Card Tilt Effect
    initOfferingCardTilt();

    // Initialize AI Music Player
    initAiMusicPlayer();

}); 

// NEW Scrolling Image Animation for Process Section
function initProcessScrollImageAnimation() {
    const processSection = document.querySelector('body.artificial-ingenious .process-section');
    if (!processSection) {
        console.error('Process section for scroll image animation not found.');
        return;
    }
    
    // Updated to target the new fixed host layer
    const animationContainer = document.getElementById('process-scroll-animation-host');
    if (!animationContainer) {
        console.error('Process scroll animation host (#process-scroll-animation-host) not found.');
        return;
    }

    const scrollingImage = animationContainer.querySelector('.scrolling-process-image');
    if (!scrollingImage) {
        // Image is now a direct child of animationContainer
        // This should not happen if HTML is correct
        console.error('Scrolling process image element not found within #process-scroll-animation-host.');
        return;
    }

    let lastKnownImageWidth = 0;

    const handleAnimation = () => {
        const rect = processSection.getBoundingClientRect();
        const imageWidth = scrollingImage.offsetWidth || lastKnownImageWidth || scrollingImage.naturalWidth * (scrollingImage.offsetHeight / scrollingImage.naturalHeight) || 200;
        if (scrollingImage.offsetWidth > 0) {
             lastKnownImageWidth = scrollingImage.offsetWidth;
        }

        // containerWidth is now the width of the animation host (viewport width)
        const containerWidth = animationContainer.offsetWidth;
        const viewportHeight = window.innerHeight;
        const sectionHeight = processSection.offsetHeight;

        let currentTranslateX;
        let showImage = true;

        if (rect.bottom <= 0 || rect.top >= viewportHeight) {
            showImage = false;
            // Position off-screen based on which side the section has exited
            if (rect.bottom <= 0) { // Scrolled past, section is above viewport
                currentTranslateX = containerWidth; // Position image to the far right
            } else { // Scrolling up, section is below viewport
                currentTranslateX = -imageWidth; // Position image to the far left
            }
        } else {
            // Calculate progress of the section's visibility through the viewport
            // Progress = 0 when section top is at viewport bottom
            // Progress = 1 when section bottom is at viewport top
            let progress = (viewportHeight - rect.top) / (viewportHeight + sectionHeight);
            progress = Math.max(0, Math.min(1, progress)); // Clamp progress between 0 and 1
            
            // Image travels from -imageWidth to containerWidth (viewport width)
            currentTranslateX = -imageWidth + progress * (containerWidth + imageWidth);
        }
        
        scrollingImage.style.visibility = showImage ? 'visible' : 'hidden';
        scrollingImage.style.transform = `translateY(-50%) translateX(${currentTranslateX}px)`;
    };

    const setupInitialPosition = () => {
        handleAnimation(); 
    };

    if (scrollingImage.complete && scrollingImage.naturalWidth > 0) {
        setupInitialPosition();
    } else {
        scrollingImage.onload = setupInitialPosition;
        scrollingImage.onerror = () => {
            console.error("Scrolling process image failed to load for animation.");
            scrollingImage.style.visibility = 'hidden';
        };
        // Ensure it gets setup if already loaded but event missed (e.g. from cache)
        if (scrollingImage.complete && scrollingImage.naturalWidth > 0) {
             setTimeout(setupInitialPosition, 0); // Re-run in next tick
        }
    }
    // Fallback for initial setup if image takes time or events don't fire as expected
    setTimeout(setupInitialPosition, 250); 

    window.addEventListener('scroll', handleAnimation, { passive: true });
    window.addEventListener('resize', handleAnimation, { passive: true });
}

// NEW: Scroll-Driven Hero Background Slideshow Functionality
function setupScrollDrivenHeroSlideshow() {
    const slideshowContainer = document.querySelector('body.artificial-ingenious .hero-background-slideshow');
    if (!slideshowContainer) {
        console.error('Hero background slideshow container (.hero-background-slideshow) not found. Ensure it is a child of body.artificial-ingenious.');
        return;
    }
    
    const images = Array.from(slideshowContainer.querySelectorAll('.hero-bg-slide'));
    // Initially hide all images
    images.forEach(img => img.style.opacity = '0');

    // Ensure first background image is visible immediately
    const firstBgImage = document.querySelector('.artificial-ingenious .hero-background-slideshow .hero-bg-slide:first-child');
    if (firstBgImage) {
        firstBgImage.style.opacity = '1';
        console.log('First background image set to visible');
    }

    const sections = Array.from(document.querySelectorAll('.artificial-ingenious .page-section[data-section-key]'));
    
    if (images.length === 0 || sections.length === 0) {
        console.error('No images (.hero-bg-slide) or sections found for scroll-driven hero background slideshow.');
        return;
    }

    const numImages = images.length;
    let previousPrimaryImageIndex = 0; // Added state for previous primary image

    // calculateOpacity function (assuming it's defined here or accessible, keeping existing implementation)
    // This function was part of the original logic and should remain as is.
    // For the sake of this edit, I'm assuming it exists and works as before.
    // If it's not here, this edit might need adjustment regarding its definition.
    // Based on typical structure, it might be an inner function or passed.
    // For now, I will define a placeholder if it's not found by the linter,
    // but the original calculateOpacity logic should be preserved.
    function calculateOpacity(section, vh) {
        // THIS IS A RECONSTRUCTION based on common patterns in the original snippet.
        // The actual implementation details (thresholds) from the original file are critical.
        // If this is not identical, the visual effect may differ.
        const rect = section.getBoundingClientRect();
        let opacity = 0;
        const TOP_SOLID_THRESHOLD = vh * 0.30;
        const BOTTOM_SOLID_THRESHOLD = vh * 0.70;
        const FADE_VH = vh * 0.20;
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;

        let o_top = 0;
        if (sectionTop < TOP_SOLID_THRESHOLD) {
            o_top = 1.0;
        } else if (sectionTop < TOP_SOLID_THRESHOLD + FADE_VH) {
            o_top = ((TOP_SOLID_THRESHOLD + FADE_VH) - sectionTop) / FADE_VH;
        } else {
            o_top = 0;
        }

        let o_bottom = 0;
        if (sectionBottom > BOTTOM_SOLID_THRESHOLD) {
            o_bottom = 1.0;
        } else if (sectionBottom > BOTTOM_SOLID_THRESHOLD - FADE_VH) {
            o_bottom = (sectionBottom - (BOTTOM_SOLID_THRESHOLD - FADE_VH)) / FADE_VH;
        } else {
            o_bottom = 0;
        }
        opacity = Math.min(o_top, o_bottom);
        return Math.max(0, Math.min(1, opacity));
    }


    function updateSlideshowBasedOnSections() {
        const vh = window.innerHeight;
        let dominantSectionScannedIndex = -1;
        let highestVisibleSectionMetric = -Infinity;

        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(vh, rect.bottom);
            const visibleHeight = visibleBottom - visibleTop;

            if (visibleHeight > 0) {
                const midPointCoverage = Math.max(0, Math.min(rect.bottom, vh * 0.75) - Math.max(rect.top, vh * 0.25));
                let currentSectionMetric = visibleHeight + midPointCoverage * 2;
                if (currentSectionMetric > highestVisibleSectionMetric) {
                    highestVisibleSectionMetric = currentSectionMetric;
                    dominantSectionScannedIndex = index;
                }
            }
        });

        let currentPrimaryImageIndex;
        let opacityForCurrentPrimary;

        if (dominantSectionScannedIndex !== -1) {
            currentPrimaryImageIndex = dominantSectionScannedIndex % numImages;
            opacityForCurrentPrimary = calculateOpacity(sections[dominantSectionScannedIndex], vh);
        } else {
            currentPrimaryImageIndex = previousPrimaryImageIndex; // Fallback to last active
            opacityForCurrentPrimary = 1.0; // Make it fully visible
        }

        images.forEach((img, imgIndex) => {
            if (imgIndex === currentPrimaryImageIndex) {
                img.style.opacity = opacityForCurrentPrimary.toString();
            } else if (imgIndex === previousPrimaryImageIndex && currentPrimaryImageIndex !== previousPrimaryImageIndex) {
                // Crossfading: previous image gets inverse opacity of the new primary
                const crossfadePartnerOpacity = 1.0 - opacityForCurrentPrimary;
                img.style.opacity = Math.max(0, Math.min(1, crossfadePartnerOpacity)).toString();
            } else if (imgIndex === 0 && currentPrimaryImageIndex !== 0 && 
                       previousPrimaryImageIndex === currentPrimaryImageIndex && // No crossfade happening
                       opacityForCurrentPrimary < 1.0) {
                // Fallback: image[0] fills if a non-image[0] primary is semi-transparent
                const fallbackBgOpacity = 1.0 - opacityForCurrentPrimary;
                img.style.opacity = Math.max(0, Math.min(1, fallbackBgOpacity)).toString();
            } else {
                img.style.opacity = '0';
            }
        });
        previousPrimaryImageIndex = currentPrimaryImageIndex;
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateSlideshowBasedOnSections();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial call to set state
    if (images.length > 0) { // Ensure images[0] exists
      images[0].style.opacity = '1'; // Start with the first image visible
    }
    previousPrimaryImageIndex = 0; // Explicitly set for the first run logic
    updateSlideshowBasedOnSections(); // Set initial opacities based on scroll/dominant section
}

// Function to initialize the 3D tilt effect on offering cards
function initOfferingCardTilt() {
    const cards = document.querySelectorAll('.artificial-ingenious .offering-card');
    const MAX_ROTATION = 2; // Max rotation in degrees

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // e.offsetX/Y are relative to the padding box of the target element.
            // This is usually what we want for calculating position within the card itself.
            const mouseX = e.offsetX - rect.width / 2;
            const mouseY = e.offsetY - rect.height / 2;

            // Calculate rotation:
            // RotateY based on mouseX position (horizontal movement -> Y-axis rotation)
            // RotateX based on mouseY position (vertical movement -> X-axis rotation)
            // The -1 for rotateX makes it tilt "into" the screen at the top when mouse is high,
            // and "out" at the bottom when mouse is low.
            const rotateY = (mouseX / (rect.width / 2)) * MAX_ROTATION;
            const rotateX = -1 * (mouseY / (rect.height / 2)) * MAX_ROTATION;

            card.style.setProperty('--rotateX', `${rotateX}deg`);
            card.style.setProperty('--rotateY', `${rotateY}deg`);
        });

        card.addEventListener('mouseleave', () => {
            // Reset the rotation when the mouse leaves the card
            // The CSS transition will smoothly return the card to its original state
            card.style.setProperty('--rotateX', '0deg');
            card.style.setProperty('--rotateY', '0deg');
            // We can also explicitly reset the transform if needed, but relying on CSS vars is cleaner
            // card.style.transform = ''; // Or specific base transform if any
        });
    });
}

// NEW AI Music Player Functionality
function initAiMusicPlayer() {
    const musicPlayer = document.getElementById('ai-music-player');
    const audioPlayer = document.getElementById('ai-audio-player');
    const musicButton = musicPlayer ? musicPlayer.querySelector('.music-button') : null;
    const playIcon = musicButton ? musicButton.querySelector('.play-icon') : null;
    const pauseIcon = musicButton ? musicButton.querySelector('.pause-icon') : null;
    const videoIframe = document.querySelector('.video-hero-section iframe[src*="player.vimeo.com"]');

    if (!musicPlayer || !audioPlayer || !musicButton || !playIcon || !pauseIcon) {
        console.error('Music player elements not found.');
        return;
    }

    // Set initial volume (0.0 to 1.0)
    audioPlayer.volume = 0.2;

    function updateMusicPlayerUI(isPlaying) {
        musicPlayer.classList.toggle('active', isPlaying);
        if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
        if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }

    function togglePlay() {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(e => {
                console.warn('Manual audio play prevented:', e);
                updateMusicPlayerUI(false);
            });
        } else {
            audioPlayer.pause();
        }
    }
    
    // Update UI based on audio events
    audioPlayer.onplay = () => updateMusicPlayerUI(true);
    audioPlayer.onpause = () => updateMusicPlayerUI(false);

    musicButton.addEventListener('click', togglePlay);

    // Set initial UI state
    updateMusicPlayerUI(false);
    
    if (videoIframe) {
        try {
            const vimeoPlayer = new Vimeo.Player(videoIframe);

            vimeoPlayer.on('play', () => {
                if (!audioPlayer.paused) {
                    audioPlayer.pause();
                }
            });

            vimeoPlayer.on('pause', (data) => {
                // Resume audio if video is paused manually (not ended)
                if (data.percent < 1 && audioPlayer.paused) {
                    audioPlayer.play().catch(e => console.warn('Audio autoplay on video pause prevented.', e));
                }
            });

            // Optional: resume audio when video ends
            vimeoPlayer.on('ended', () => {
                if (audioPlayer.paused) {
                    audioPlayer.play().catch(e => console.warn('Audio autoplay on video end prevented.', e));
                }
            });
            
            vimeoPlayer.ready().catch(error => {
                console.error('Error initializing Vimeo player:', error);
            });

        } catch (e) {
            console.error("Failed to initialize Vimeo Player. Music controls will work independently.", e);
        }
    } else {
        console.log("No Vimeo player found. Music player will operate independently.");
    }
    
    // Attempt to autoplay audio, gracefully handle failure
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Audio autoplay was prevented by the browser.");
            updateMusicPlayerUI(false);
        });
    }

    // Ensure audio is paused if it's playing and page becomes hidden (e.g. tab change)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && !audioPlayer.paused) {
            audioPlayer.pause();
        }
    });
}
