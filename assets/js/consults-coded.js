// JavaScript for the Consults Coded page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Consults Coded page specific JS loaded.');

    // Dynamic Page Background Scroll Logic
    const dynamicBg = document.getElementById('dynamic-page-background');
    const heroSection = document.querySelector('.video-hero-section');

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
        if (!dynamicBg) console.error('Error: #dynamic-page-background element not found.');
        if (!heroSection) console.error('Error: .video-hero-section element not found for dynamic background.');
    }

    // Video Picture-in-Picture (PiP) scroll behavior
    const videoHeroWrapper = document.querySelector('.video-hero-wrapper');
    const videoHeroSectionForPip = document.querySelector('.video-hero-section');

    if (videoHeroWrapper && videoHeroSectionForPip) {
        const observerCallback = (entries) => {
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
        if (!videoHeroWrapper) console.error('Error: .video-hero-wrapper element not found for PiP.');
        if (!videoHeroSectionForPip) console.error('Error: .video-hero-section element not found for PiP class application.');
    }

    // Initialize Hero Background Slideshow
    setupScrollDrivenHeroSlideshow();
}); 

// Scroll-Driven Hero Background Slideshow Functionality
function setupScrollDrivenHeroSlideshow() {
    const slideshowContainer = document.querySelector('body.consults-coded .hero-background-slideshow');
    const sections = Array.from(document.querySelectorAll('.consults-coded .page-section'));

    if (!slideshowContainer) {
        console.error('Hero background slideshow container not found.');
        return;
    }
    if (sections.length === 0) {
        console.error('No .page-section elements found for scroll-driven hero background slideshow.');
        return;
    }

    const images = Array.from(slideshowContainer.querySelectorAll('.hero-bg-slide'));
    if (images.length === 0) {
        console.error('No images (.hero-bg-slide) found for scroll-driven hero background slideshow.');
        return;
    }

    images.forEach(img => {
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.opacity = '0';
    });

    const numImages = images.length;
    let previousPrimaryImageIndex = 0;

    function calculateOpacity(section, vh) {
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
            currentPrimaryImageIndex = previousPrimaryImageIndex;
            opacityForCurrentPrimary = 1.0;
        }

        images.forEach((img, imgIndex) => {
            if (imgIndex === currentPrimaryImageIndex) {
                img.style.opacity = opacityForCurrentPrimary.toString();
            } else if (imgIndex === previousPrimaryImageIndex && currentPrimaryImageIndex !== previousPrimaryImageIndex) {
                const crossfadePartnerOpacity = 1.0 - opacityForCurrentPrimary;
                img.style.opacity = Math.max(0, Math.min(1, crossfadePartnerOpacity)).toString();
            } else if (imgIndex === 0 && currentPrimaryImageIndex !== 0 && 
                       previousPrimaryImageIndex === currentPrimaryImageIndex &&
                       opacityForCurrentPrimary < 1.0) {
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

    if (images.length > 0) {
      images[0].style.opacity = '1';
    }
    previousPrimaryImageIndex = 0;
    updateSlideshowBasedOnSections();
} 