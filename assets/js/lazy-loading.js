/**
 * MxM Lazy Loading System
 * Advanced lazy loading implementation for optimal performance
 * Added during mobile optimization implementation
 */

class LazyImageLoader {
    constructor() {
        this.imageObserver = null;
        this.loadedImages = new Set();
        this.init();
    }

    init() {
        // Add native lazy loading to all images first
        this.addNativeLazyLoading();
        
        // Check for Intersection Observer support
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }

        // Load critical above-fold images immediately
        this.loadCriticalImages();
    }

    addNativeLazyLoading() {
        // Add native loading="lazy" to all non-critical images
        const allImages = document.querySelectorAll('img');
        
        allImages.forEach(img => {
            const isCritical = img.classList.contains('home-logo') || 
                             img.classList.contains('hero-bg-slide') ||
                             img.closest('.room:first-child') ||
                             img.classList.contains('bb-room-info');
            
            if (!isCritical && !img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            } else if (img.classList.contains('hero-bg-slide')) {
                // Ensure hero background slides are always eager loaded
                img.setAttribute('loading', 'eager');
            }
        });
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px', // Start loading 50px before image enters viewport
            threshold: 0.1
        };

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all lazy-loadable images
        this.observeImages();
    }

    observeImages() {
        // Find all images that should be lazy loaded
        const lazyImages = document.querySelectorAll('img[data-lazy]');
        
        lazyImages.forEach(img => {
            // Skip hero background slides completely
            if (img.classList.contains('hero-bg-slide')) {
                return;
            }
            
            if (!this.loadedImages.has(img.src)) {
                this.imageObserver.observe(img);
                
                // Add loading placeholder
                this.addLoadingPlaceholder(img);
            }
        });
    }

    loadCriticalImages() {
        // Images that should load immediately (above fold)
        const criticalSelectors = [
            '.home-logo',
            '.room:first-child img',
            '.blonde-bot-image.bb-room-info'
        ];

        criticalSelectors.forEach(selector => {
            const images = document.querySelectorAll(selector);
            images.forEach(img => {
                img.setAttribute('loading', 'eager');
                this.loadImage(img);
            });
        });

        // Handle hero background slides separately - don't process them at all
        const heroSlides = document.querySelectorAll('.hero-bg-slide');
        heroSlides.forEach(img => {
            img.setAttribute('loading', 'eager');
            // Mark as already loaded to prevent any processing
            this.loadedImages.add(img.src);
        });
    }

    loadImage(img) {
        if (this.loadedImages.has(img.src)) return;

        // Skip hero background slides - they should not be processed by lazy loader
        if (img.classList.contains('hero-bg-slide')) {
            this.loadedImages.add(img.src);
            return;
        }

        const src = img.dataset.lazy || img.src;
        
        // Create a new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Apply smooth fade-in effect
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            img.src = src;
            img.removeAttribute('data-lazy');
            
            // Fade in the image
            setTimeout(() => {
                img.style.opacity = '1';
            }, 10);
            
            this.loadedImages.add(src);
            this.removeLoadingPlaceholder(img);
        };

        imageLoader.onerror = () => {
            console.warn('Failed to load image:', src);
            this.removeLoadingPlaceholder(img);
        };

        imageLoader.src = src;
    }

    addLoadingPlaceholder(img) {
        // Add a subtle loading effect
        img.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
        img.style.backgroundSize = '200% 100%';
        img.style.animation = 'shimmer 1.5s infinite linear';
    }

    removeLoadingPlaceholder(img) {
        img.style.background = '';
        img.style.backgroundSize = '';
        img.style.animation = '';
    }

    loadAllImages() {
        // Fallback: load all images immediately for older browsers
        const lazyImages = document.querySelectorAll('img[data-lazy]');
        lazyImages.forEach(img => this.loadImage(img));
    }

    // Public method to manually trigger loading of specific images
    loadImagesBySelector(selector) {
        const images = document.querySelectorAll(selector);
        images.forEach(img => this.loadImage(img));
    }
}

// Initialize lazy loading when DOM is ready
let lazyLoader;

function initializeLazyLoading() {
    lazyLoader = new LazyImageLoader();
    
    // Re-observe images when new content is loaded (for SPA navigation)
    if (window.MutationObserver) {
        const contentObserver = new MutationObserver(() => {
            lazyLoader.observeImages();
        });
        
        contentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLazyLoading);
} else {
    initializeLazyLoading();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyImageLoader;
}

// Add shimmer animation CSS
const shimmerCSS = `
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
`;

// Inject shimmer CSS
const style = document.createElement('style');
style.textContent = shimmerCSS;
document.head.appendChild(style);

// Make available globally
window.LazyImageLoader = LazyImageLoader; 