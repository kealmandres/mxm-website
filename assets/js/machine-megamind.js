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

    // Initialize Hero Background Slideshow
    setupScrollDrivenHeroSlideshow();

    // Initialize Offering Card Tilt Effect (if present)
    initOfferingCardTilt();

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

    if (!slideshowContainer || sections.length === 0) {
        console.warn('Machine Megamind: Slideshow container or sections not found for scroll-driven background. Feature disabled.');
        return;
    }

    const images = Array.from(slideshowContainer.querySelectorAll('.hero-bg-slide'));
    if (images.length === 0) {
        console.warn('Machine Megamind: No images found for scroll-driven hero background slideshow.');
        return;
    }

    // Initialize image styles
    images.forEach(img => {
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease-out'; // Smooth transition for opacity changes
    });

    const numImages = images.length;
    let lastActiveImageIndex = -1;

    function updateSlideshowBasedOnScroll() {
        const vh = window.innerHeight;
        const scrollCenter = vh / 2;
        let activeImageIndex = -1;
        let nextImageIndex = -1;
        let transitionProgress = 0;

        // Find which section is most prominent or which two are transitioning
        for (let i = 0; i < sections.length; i++) {
            const rect = sections[i].getBoundingClientRect();
            // Check if the section is visible in the viewport
            if (rect.top < vh && rect.bottom > 0) {
                const sectionCenter = rect.top + rect.height / 2;
                // If section center is near the viewport center, it's the active one
                if (rect.top <= scrollCenter && rect.bottom >= scrollCenter) {
                    activeImageIndex = i % numImages;
                    break;
                }
                // Check for transition between section i and i+1
                else if (rect.bottom < scrollCenter && i + 1 < sections.length) {
                    const nextRect = sections[i+1].getBoundingClientRect();
                    if (nextRect.top > scrollCenter) {
                        activeImageIndex = i % numImages;
                        nextImageIndex = (i + 1) % numImages;
                        // Calculate progress based on the gap between the two sections
                        const gap = nextRect.top - rect.bottom;
                        transitionProgress = (scrollCenter - rect.bottom) / gap;
                        transitionProgress = Math.max(0, Math.min(1, transitionProgress));
                        break;
                    }
                }
            }
        }
        
        // If no specific section is active (e.g., at the very top or bottom), default to the first or last
        if (activeImageIndex === -1) {
            if (window.scrollY === 0) {
                activeImageIndex = 0;
            } else {
                 // Fallback to the last calculated active index if out of bounds
                 activeImageIndex = lastActiveImageIndex !== -1 ? lastActiveImageIndex : 0;
            }
        }

        // Apply opacities
        images.forEach((img, imgIndex) => {
            let targetOpacity = 0;
            if (imgIndex === activeImageIndex) {
                targetOpacity = 1 - transitionProgress;
            } else if (imgIndex === nextImageIndex) {
                targetOpacity = transitionProgress;
            }
            img.style.opacity = targetOpacity.toString();
        });
        
        lastActiveImageIndex = activeImageIndex;
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
    console.log("Machine Megamind: Advanced scroll-driven hero background slideshow initialized.");
}

// Function to initialize the 3D tilt effect on offering cards (if present)
function initOfferingCardTilt() {
    const cards = document.querySelectorAll('.machine-megamind .offering-card');
    if (cards.length === 0) {
        // console.log('Machine Megamind: No offering cards found for tilt effect. Feature not active.');
        return;
    }
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
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rotateX', '0deg');
            card.style.setProperty('--rotateY', '0deg');
        });
    });
    console.log("Machine Megamind: Offering card tilt effect initialized for", cards.length, "cards.");
}

// Placeholder for any specific Machine Megamind logic that might differ significantly
// from Artificial Ingenious or is unique to this page.
function initMachineMegamindSpecificFeatures() {
    console.log("Initializing Machine Megamind specific features...");
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