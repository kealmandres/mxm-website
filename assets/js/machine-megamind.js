// JavaScript for Machine Megamind page

document.addEventListener('DOMContentLoaded', () => {
    console.log('Machine Megamind page specific JS loaded.');

    // FAQ Accordion functionality (if present on Machine Megamind)
    const faqItems = document.querySelectorAll('.machine-megamind .faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        // const icon = item.querySelector('.accordion-icon'); // Icon handling might differ

        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.toggle('active');
                answer.style.maxHeight = isActive ? answer.scrollHeight + 'px' : '0';
            });
        }
    });

    // Force Blonde Bot images to be visible (if used on Machine Megamind)
    const blondeBotImages = document.querySelectorAll('.machine-megamind .blonde-bot-image');
    blondeBotImages.forEach((img, index) => {
        img.style.setProperty('display', 'block', 'important');
        img.style.setProperty('opacity', '1', 'important');
        img.style.setProperty('visibility', 'visible', 'important');
        img.style.setProperty('z-index', 'auto', 'important');
        
        img.addEventListener('load', function() {
            console.log(`Blonde Bot image #${index + 1} loaded successfully: ${img.src}`);
        });
        
        img.addEventListener('error', function() {
            console.error(`Failed to load Blonde Bot image #${index + 1}: ${img.src}`);
            const originalSrc = img.src;
            if (!originalSrc.includes('?t=')) {
                 setTimeout(() => {
                    img.src = originalSrc + '?t=' + new Date().getTime();
                }, 500);
            }
        });
        
        if (img.complete && img.naturalHeight === 0) {
            console.warn(`Blonde Bot image #${index + 1} might be missing or failed to load initially: ${img.src}`);
        }
    });
    if (blondeBotImages.length > 0) {
        console.log('Found', blondeBotImages.length, 'Blonde Bot images to monitor on Machine Megamind page.');
    }

    // Dynamic Page Background Scroll Logic
    const dynamicBg = document.getElementById('dynamic-page-background');
    const heroSection = document.querySelector('.machine-megamind .video-hero-section'); // Adjusted selector

    if (dynamicBg && heroSection) {
        dynamicBg.style.opacity = '1'; 

        const handlePageBackgroundScroll = () => {
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
            } else {
                opacity = 1;
            }
            dynamicBg.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
        };

        window.addEventListener('scroll', handlePageBackgroundScroll);
        handlePageBackgroundScroll(); 
    } else {
        if (!dynamicBg) console.error('Machine Megamind: #dynamic-page-background element not found.');
        if (!heroSection) console.error('Machine Megamind: .video-hero-section element not found for dynamic background.');
    }

    // Video Picture-in-Picture (PiP) scroll behavior (if video hero is present)
    const videoHeroWrapper = document.querySelector('.machine-megamind .video-hero-wrapper'); 
    const videoHeroSectionForPip = document.querySelector('.machine-megamind .video-hero-section');

    if (videoHeroWrapper && videoHeroSectionForPip) {
        let pipActivationAllowed = false;
        setTimeout(() => {
            pipActivationAllowed = true;
        }, 500); // Prevent PiP mode for the first 500ms

        const observerCallback = (entries) => {
            if (!pipActivationAllowed) {
                return; // Do not run PiP logic on initial load
            }
            entries.forEach(entry => {
                const activatePip = !entry.isIntersecting && entry.boundingClientRect.bottom < (entry.target.offsetHeight * 0.05);
                const deactivatePip = entry.isIntersecting && entry.intersectionRatio >= 0.90;

                if (activatePip) {
                    videoHeroSectionForPip.classList.add('video-pip-mode');
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
            root: null, 
            rootMargin: '0px',
            threshold: [0, 0.05, 0.90, 1] 
        };

        const videoObserver = new IntersectionObserver(observerCallback, observerOptions);
        videoObserver.observe(videoHeroWrapper); 
    } else {
        if (!videoHeroWrapper) console.warn('Machine Megamind: .video-hero-wrapper element not found for PiP. PiP feature will be disabled.');
        // No error for videoHeroSectionForPip if wrapper is missing, as it's dependent.
    }

    // Initialize Process Section Scroll Image Animation (if present)
    initProcessScrollImageAnimation();

    // Initialize Hero Background Slideshow with a small delay to ensure lazy loading doesn't interfere
    setTimeout(() => {
        setupScrollDrivenHeroSlideshow();
    }, 100);

    // Initialize Investment Card Tilt Effect (updated from offering card tilt)
    initInvestmentCardTilt();

}); 

// Scrolling Image Animation for Process Section (if present)
function initProcessScrollImageAnimation() {
    const processSection = document.querySelector('body.machine-megamind .process-section');
    if (!processSection) {
        console.warn('Machine Megamind: Process section for scroll image animation not found. Feature disabled.');
        return;
    }
    
    const animationContainer = document.getElementById('process-scroll-animation-host');
    if (!animationContainer) {
        console.error('Machine Megamind: Process scroll animation host (#process-scroll-animation-host) not found.');
        return;
    }

    const scrollingImage = animationContainer.querySelector('.scrolling-process-image');
    if (!scrollingImage) {
        console.warn('Machine Megamind: Scrolling process image element not found within #process-scroll-animation-host. Feature disabled.');
        return;
    }

    let lastKnownImageWidth = 0;

    const handleAnimation = () => {
        const rect = processSection.getBoundingClientRect();
        const imageWidth = scrollingImage.offsetWidth || lastKnownImageWidth || scrollingImage.naturalWidth * (scrollingImage.offsetHeight / scrollingImage.naturalHeight) || 200;
        if (scrollingImage.offsetWidth > 0) {
             lastKnownImageWidth = scrollingImage.offsetWidth;
        }

        const containerWidth = animationContainer.offsetWidth;
        const viewportHeight = window.innerHeight;
        const sectionHeight = processSection.offsetHeight;
        let currentTranslateX;
        let showImage = true;

        if (rect.bottom <= 0 || rect.top >= viewportHeight) {
            showImage = false;
            if (rect.bottom <= 0) { 
                currentTranslateX = containerWidth; 
            } else { 
                currentTranslateX = -imageWidth; 
            }
        } else {
            let progress = (viewportHeight - rect.top) / (viewportHeight + sectionHeight);
            progress = Math.max(0, Math.min(1, progress)); 
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
            console.error("Machine Megamind: Scrolling process image failed to load for animation.");
            scrollingImage.style.visibility = 'hidden';
        };
        if (scrollingImage.complete && scrollingImage.naturalWidth > 0) {
             setTimeout(setupInitialPosition, 0); 
        }
    }
    setTimeout(setupInitialPosition, 250); 

    window.addEventListener('scroll', handleAnimation, { passive: true });
    window.addEventListener('resize', handleAnimation, { passive: true });
    console.log("Machine Megamind: Process scroll image animation initialized.");
}

// Scroll-Driven Hero Background Slideshow Functionality
function setupScrollDrivenHeroSlideshow() {
    const slideshowContainer = document.querySelector('body.machine-megamind .hero-background-slideshow');
    const sections = Array.from(document.querySelectorAll('.machine-megamind .page-section'));

    console.log('Machine Megamind: Slideshow container found:', !!slideshowContainer);
    console.log('Machine Megamind: Sections found:', sections.length);

    if (!slideshowContainer || sections.length === 0) {
        console.warn('Machine Megamind: Slideshow container or sections not found for scroll-driven background. Feature disabled.');
        return;
    }

    const images = Array.from(slideshowContainer.querySelectorAll('.hero-bg-slide'));
    console.log('Machine Megamind: Images found:', images.length);
    
    if (images.length === 0) {
        console.warn('Machine Megamind: No images found for scroll-driven hero background slideshow.');
        return;
    }

    // Initialize image styles and protect from lazy loading interference
    images.forEach((img, index) => {
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.opacity = index === 0 ? '1' : '0'; // First image visible by default
        
        // Ensure the image is loaded eagerly and remove any lazy loading attributes
        img.setAttribute('loading', 'eager');
        img.removeAttribute('data-lazy');
        
        // Remove any inline transitions that might have been added by lazy loading
        img.style.transition = '';
        
        // Force reflow to ensure styles are applied
        img.offsetHeight;
    });

    const numImages = images.length;
    let lastActiveImageIndex = -1;

    function updateSlideshowBasedOnScroll() {
        const vh = window.innerHeight;
        const scrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Simple approach: divide scroll position by number of images
        const scrollProgress = scrollY / (documentHeight - vh);
        const activeImageIndex = Math.floor(scrollProgress * (numImages - 1));
        const clampedIndex = Math.max(0, Math.min(numImages - 1, activeImageIndex));
        
        // Apply opacities - only show one image at a time for clarity
        images.forEach((img, imgIndex) => {
            const targetOpacity = imgIndex === clampedIndex ? 1 : 0;
            img.style.opacity = targetOpacity.toString();
        });
        
        lastActiveImageIndex = clampedIndex;
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateSlideshowBasedOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    updateSlideshowBasedOnScroll(); // Initial call
    console.log(`Machine Megamind: Hero background slideshow initialized with ${numImages} images.`);
}

// Function to initialize the 3D tilt effect on investment cards (EXACT copy from artificial-ingenious.js)
function initInvestmentCardTilt() {
    const cards = document.querySelectorAll('.machine-megamind .diagnosis-section .investment-card');
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

// Placeholder for any specific Machine Megamind logic that might differ significantly
// from Artificial Ingenious or is unique to this page.
function initMachineMegamindSpecificFeatures() {
    console.log("Initializing Machine Megamind specific features...");
    
    // Initialize testimonials section
    initTestimonialsSection();
    
    // Example: if Machine Megamind has a unique interactive element
    // const specialElement = document.querySelector('.machine-megamind .special-interactive-element');
    // if (specialElement) {
    //     specialElement.addEventListener('click', () => {
    //         console.log('Machine Megamind special element clicked!');
    //     });
    // }
}

// Call page-specific features initializer
document.addEventListener('DOMContentLoaded', () => {
    initMachineMegamindSpecificFeatures();
});



// Testimonials Section Functionality
function initTestimonialsSection() {
    const testimonialsSection = document.querySelector('.machine-megamind .testimonials-section');
    const testimonialsRows = document.querySelectorAll('.machine-megamind .testimonials-row');
    const testimonialsCards = document.querySelectorAll('.machine-megamind .testimonial-card');
    
    if (!testimonialsSection || testimonialsRows.length === 0) {
        console.warn('Testimonials section not found or no testimonial rows available.');
        return;
    }

    let isPaused = false;
    let pauseTimeout;
    let isTouch = false;

    // Detect touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Function to pause specific row animation
    function pauseRowAnimation(row) {
        row.style.animationPlayState = 'paused';
    }

    // Function to resume specific row animation
    function resumeRowAnimation(row) {
        row.style.animationPlayState = 'running';
    }

    // Function to pause both animations (for touch/keyboard)
    function pauseAllAnimations() {
        if (isPaused) return;
        isPaused = true;
        testimonialsRows.forEach(row => {
            row.style.animationPlayState = 'paused';
        });
    }

    // Function to resume both animations (for touch/keyboard)
    function resumeAllAnimations() {
        isPaused = false;
        testimonialsRows.forEach(row => {
            row.style.animationPlayState = 'running';
        });
    }

    // Initialize animations to start immediately
    function initializeAnimations() {
        testimonialsRows.forEach((row, index) => {
            row.style.animationPlayState = 'running';
            // Ensure proper initial positioning
            if (index === 0) {
                // Row 1 starts at position 0
                row.style.transform = 'translateX(0)';
            } else {
                // Row 2 starts off-screen left
                row.style.transform = 'translateX(-100%)';
            }
        });
    }

    // Function to handle auto-resume after delay
    function scheduleAutoResume() {
        clearTimeout(pauseTimeout);
        pauseTimeout = setTimeout(() => {
            if (!isTouch) {
                resumeAllAnimations();
            }
        }, 3000); // Resume after 3 seconds of no interaction
    }

    // Desktop hover events with tilt effect - individual row pausing
    if (!isTouchDevice) {
        testimonialsRows.forEach(row => {
            const cardsInRow = row.querySelectorAll('.testimonial-card');
            const MAX_ROTATION = 2; // Max rotation in degrees

            // Row-level hover events
            row.addEventListener('mouseenter', () => {
                pauseRowAnimation(row);
            });

            row.addEventListener('mouseleave', () => {
                resumeRowAnimation(row);
                // Reset global pause state when mouse leaves the row
                isPaused = false;
            });

            // Card-level tilt effects
            cardsInRow.forEach(card => {
                card.addEventListener('mouseleave', () => {
                    // Reset tilt on mouse leave
                    card.style.setProperty('--rotateX', '0deg');
                    card.style.setProperty('--rotateY', '0deg');
                });

                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left - rect.width / 2;
                    const mouseY = e.clientY - rect.top - rect.height / 2;

                    // Calculate rotation for tilt effect
                    const rotateY = (mouseX / (rect.width / 2)) * MAX_ROTATION;
                    const rotateX = -1 * (mouseY / (rect.height / 2)) * MAX_ROTATION;

                    card.style.setProperty('--rotateX', `${rotateX}deg`);
                    card.style.setProperty('--rotateY', `${rotateY}deg`);
                });
            });
        });
    }

    // Touch events for mobile
    if (isTouchDevice) {
        testimonialsCards.forEach(card => {
            card.addEventListener('touchstart', (e) => {
                isTouch = true;
                pauseAllAnimations();
                scheduleAutoResume();
            }, { passive: true });

            card.addEventListener('touchend', () => {
                isTouch = false;
                scheduleAutoResume();
            }, { passive: true });
        });

        // Section-level touch events
        testimonialsSection.addEventListener('touchstart', (e) => {
            isTouch = true;
            pauseAllAnimations();
            scheduleAutoResume();
        }, { passive: true });

        testimonialsSection.addEventListener('touchend', () => {
            isTouch = false;
            scheduleAutoResume();
        }, { passive: true });
    }

    // Keyboard navigation support
    testimonialsCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', 'Customer testimonial');

        card.addEventListener('focus', () => {
            pauseAllAnimations();
        });

        card.addEventListener('blur', () => {
            resumeAllAnimations();
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Toggle pause/resume on Enter or Space
                if (isPaused) {
                    resumeAllAnimations();
                } else {
                    pauseAllAnimations();
                }
            }
        });
    });

    // Intersection Observer for performance optimization
    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const testimonialsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Section is visible, reset pause state and resume animations
                isPaused = false;
                clearTimeout(pauseTimeout);
                
                // Small delay to ensure DOM is ready and animations can resume properly
                setTimeout(() => {
                    resumeAllAnimations();
                    // Force animation restart if they appear stuck
                    testimonialsRows.forEach((row, index) => {
                        if (row.style.animationPlayState === 'paused') {
                            row.style.animationPlayState = 'running';
                        }
                    });
                    console.log('Testimonials animations resumed after section became visible');
                }, 100);
            } else {
                // Section is not visible, pause animations to save resources
                testimonialsRows.forEach(row => {
                    row.style.animationPlayState = 'paused';
                });
            }
        });
    }, observerOptions);

    testimonialsObserver.observe(testimonialsSection);

    // Handle reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function handleReducedMotion() {
        if (prefersReducedMotion.matches) {
            testimonialsRows.forEach(row => {
                row.style.animationPlayState = 'paused';
            });
        } else {
            resumeAllAnimations();
        }
    }

    // Initial check and listener for reduced motion
    handleReducedMotion();
    prefersReducedMotion.addEventListener('change', handleReducedMotion);

    // Cleanup function (useful for SPA navigation)
    window.testimonialsCleanup = () => {
        clearTimeout(pauseTimeout);
        testimonialsObserver.disconnect();
        prefersReducedMotion.removeEventListener('change', handleReducedMotion);
    };

    // Performance monitoring
    let animationFrameId;
    
    function monitorPerformance() {
        const startTime = performance.now();
        
        animationFrameId = requestAnimationFrame(() => {
            const endTime = performance.now();
            const frameTime = endTime - startTime;
            
            // If frame time is too high (> 16.67ms for 60fps), reduce animation complexity
            if (frameTime > 20) {
                testimonialsRows.forEach(row => {
                    row.style.willChange = 'auto';
                });
            }
            
            monitorPerformance();
        });
    }

    // Start performance monitoring
    monitorPerformance();

    // Cleanup performance monitoring on page unload
    window.addEventListener('beforeunload', () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });

    // Initialize animations immediately
    initializeAnimations();

    console.log('Testimonials section initialized with enhanced touch and accessibility support.');
}