/**
 * MxM Performance Monitor
 * Tracks and reports on optimization metrics
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            imageLoadTimes: [],
            lazyLoadedImages: 0,
            totalImages: 0,
            startTime: performance.now(),
            contentLoadedTime: null,
            windowLoadedTime: null,
            formSubmissions: 0,
            videoInteractions: 0,
            scrollDepth: 0
        };
        
        this.sentryEnabled = typeof Sentry !== 'undefined';
        this.init();
    }

    init() {
        // Track page loading events
        document.addEventListener('DOMContentLoaded', () => {
            this.metrics.contentLoadedTime = performance.now() - this.metrics.startTime;
            this.countImages();
            this.trackImageLoading();
            this.setupBusinessMetrics();
            // DOM Content Loaded tracking
        });

        window.addEventListener('load', () => {
            this.metrics.windowLoadedTime = performance.now() - this.metrics.startTime;
            this.generateReport();
            this.reportToExternalServices();
        });

        // Track lazy loading
        this.observeLazyLoading();
    }

    setupBusinessMetrics() {
        this.trackFormSubmissions();
        this.trackVideoEngagement();
        this.trackScrollDepth();
        this.trackCoreWebVitals();
    }

    trackFormSubmissions() {
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            form.addEventListener('submit', (e) => {
                this.metrics.formSubmissions++;
                const formData = {
                    formId: form.id || `form-${index}`,
                    timestamp: Date.now(),
                    url: window.location.href
                };
                
                // Form submission tracked
                
                if (this.sentryEnabled) {
                    Sentry.addBreadcrumb({
                        category: 'user-action',
                        message: 'Form submitted',
                        data: formData,
                        level: 'info'
                    });
                }
            });
        });
    }

    trackVideoEngagement() {
        const videos = document.querySelectorAll('video, iframe[src*="vimeo"], iframe[src*="youtube"]');
        videos.forEach((video, index) => {
            const trackInteraction = () => {
                this.metrics.videoInteractions++;
                const videoData = {
                    videoId: video.id || `video-${index}`,
                    timestamp: Date.now(),
                    url: window.location.href
                };
                
                // Video interaction tracked
                
                if (this.sentryEnabled) {
                    Sentry.addBreadcrumb({
                        category: 'user-engagement',
                        message: 'Video interaction',
                        data: videoData
                    });
                }
            };

            if (video.tagName === 'VIDEO') {
                video.addEventListener('play', trackInteraction);
            } else {
                // For iframes, track clicks
                video.addEventListener('load', () => {
                    video.addEventListener('click', trackInteraction);
                });
            }
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        const updateScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.metrics.scrollDepth = maxScroll;
                
                // Track milestone scroll depths
                if ([25, 50, 75, 90].includes(scrollPercent)) {
                    // Scroll depth milestone reached
                    
                    if (this.sentryEnabled) {
                        Sentry.addBreadcrumb({
                            category: 'user-engagement',
                            message: `Scroll depth: ${scrollPercent}%`,
                            data: {
                                scrollPercent,
                                url: window.location.href,
                                timestamp: Date.now()
                            }
                        });
                    }
                }
            }
        };

        window.addEventListener('scroll', updateScrollDepth);
    }

    trackCoreWebVitals() {
        // Track Core Web Vitals using web-vitals library if available
        if (typeof getCLS === 'function') {
            getCLS((metric) => {
                this.reportWebVital('CLS', metric);
            });
        }
        
        if (typeof getFID === 'function') {
            getFID((metric) => {
                this.reportWebVital('FID', metric);
            });
        }
        
        if (typeof getLCP === 'function') {
            getLCP((metric) => {
                this.reportWebVital('LCP', metric);
            });
        }
    }

    reportWebVital(name, metric) {
        const vitalsData = {
            name,
            value: metric.value,
            rating: metric.rating,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        // Core Web Vital tracked
        
        if (this.sentryEnabled) {
            Sentry.addBreadcrumb({
                category: 'performance',
                message: `Core Web Vital: ${name}`,
                data: vitalsData,
                level: metric.rating === 'good' ? 'info' : 'warning'
            });
        }
    }

    countImages() {
        this.metrics.totalImages = document.querySelectorAll('img').length;
        // Total images found
    }

    trackImageLoading() {
        const images = document.querySelectorAll('img');
        
        images.forEach((img, index) => {
            const startTime = performance.now();
            
            const trackLoad = () => {
                const loadTime = performance.now() - startTime;
                this.metrics.imageLoadTimes.push({
                    index,
                    src: img.src,
                    loadTime,
                    isLazy: img.hasAttribute('data-lazy') || img.getAttribute('loading') === 'lazy',
                    isCritical: img.getAttribute('loading') === 'eager'
                });
            };

            if (img.complete) {
                trackLoad();
            } else {
                img.addEventListener('load', trackLoad);
                img.addEventListener('error', () => {
                    // Image failed to load
                    
                    if (this.sentryEnabled) {
                        Sentry.captureMessage('Image load error', {
                            level: 'warning',
                            extra: {
                                src: img.src,
                                url: window.location.href
                            }
                        });
                    }
                });
            }
        });
    }

    observeLazyLoading() {
        // Watch for data-lazy attribute changes to track lazy loading
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'data-lazy') {
                    if (!mutation.target.hasAttribute('data-lazy')) {
                        this.metrics.lazyLoadedImages++;
                        // Lazy loaded image tracked
                    }
                }
            });
        });

        document.querySelectorAll('img[data-lazy]').forEach(img => {
            observer.observe(img, { attributes: true });
        });
    }

    reportToExternalServices() {
        if (this.sentryEnabled) {
            const performanceData = this.getDetailedMetrics();
            
            Sentry.setContext('performance', {
                pageLoadTime: performanceData.pageLoadTime,
                contentLoadTime: performanceData.contentLoadTime,
                totalImages: performanceData.totalImages,
                lazyLoadedImages: performanceData.lazyLoadedImages,
                performanceGrade: performanceData.performanceGrade,
                businessMetrics: {
                    formSubmissions: this.metrics.formSubmissions,
                    videoInteractions: this.metrics.videoInteractions,
                    scrollDepth: this.metrics.scrollDepth
                }
            });

            // Report performance issues
            if (performanceData.pageLoadTime > 5000) {
                Sentry.captureMessage('Slow page load detected', {
                    level: 'warning',
                    extra: performanceData
                });
            }
        }
    }

    generateReport() {
        const report = this.getDetailedMetrics();

        // Performance report generated

        // Store report for debugging
        window.mxmPerformanceReport = report;
        
        return report;
    }

    getDetailedMetrics() {
        return {
            pageLoadTime: this.metrics.windowLoadedTime || 0,
            contentLoadTime: this.metrics.contentLoadedTime || 0,
            totalImages: this.metrics.totalImages,
            lazyLoadedImages: this.metrics.lazyLoadedImages,
            averageImageLoadTime: this.calculateAverageImageLoadTime(),
            criticalImagesCount: this.metrics.imageLoadTimes.filter(img => img.isCritical).length,
            lazyImagesCount: this.metrics.imageLoadTimes.filter(img => img.isLazy).length,
            performanceGrade: this.calculatePerformanceGrade(),
            suggestions: this.generateSuggestions(),
            businessMetrics: {
                formSubmissions: this.metrics.formSubmissions,
                videoInteractions: this.metrics.videoInteractions,
                scrollDepth: this.metrics.scrollDepth
            }
        };
    }

    calculateAverageImageLoadTime() {
        if (this.metrics.imageLoadTimes.length === 0) return 0;
        
        const total = this.metrics.imageLoadTimes.reduce((sum, img) => sum + img.loadTime, 0);
        return total / this.metrics.imageLoadTimes.length;
    }

    calculatePerformanceGrade() {
        const loadTime = this.metrics.windowLoadedTime;
        const lazyRatio = this.metrics.lazyLoadedImages / this.metrics.totalImages;
        
        if (loadTime < 1000 && lazyRatio > 0.7) return 'A+';
        if (loadTime < 2000 && lazyRatio > 0.5) return 'A';
        if (loadTime < 3000 && lazyRatio > 0.3) return 'B';
        if (loadTime < 5000) return 'C';
        return 'D';
    }

    generateSuggestions() {
        const suggestions = [];
        
        if (this.metrics.windowLoadedTime > 3000) {
            suggestions.push('Consider further image optimization or compression');
        }
        
        if (this.metrics.lazyLoadedImages < this.metrics.totalImages * 0.5) {
            suggestions.push('More images could benefit from lazy loading');
        }
        
        const heavyImages = this.metrics.imageLoadTimes.filter(img => img.loadTime > 1000);
        if (heavyImages.length > 0) {
            suggestions.push(`${heavyImages.length} images are loading slowly (>1s)`);
        }

        if (this.metrics.scrollDepth < 50) {
            suggestions.push('Users are not scrolling deep - consider improving above-fold content');
        }

        if (this.metrics.formSubmissions === 0 && document.querySelectorAll('form').length > 0) {
            suggestions.push('No form submissions detected - consider form optimization');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('Performance looks good! 🎉');
        }
        
        return suggestions;
    }

    // Public method to get current metrics
    getMetrics() {
        return { ...this.metrics };
    }

    // Public method to manually trigger external reporting
    sendToMonitoring(customData = {}) {
        if (this.sentryEnabled) {
            Sentry.addBreadcrumb({
                category: 'monitoring',
                message: 'Manual performance report',
                data: { ...this.getDetailedMetrics(), ...customData },
                level: 'info'
            });
        }
    }
}

// Auto-initialize performance monitoring in development
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    document.body.hasAttribute('data-performance-monitor')) {
    
    window.mxmPerformanceMonitor = new PerformanceMonitor();
    
    // Add keyboard shortcut to show report (Ctrl/Cmd + Shift + P)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
            if (window.mxmPerformanceMonitor) {
                window.mxmPerformanceMonitor.generateReport();
            }
        }
    });
}

// Export for module environments, fallback for script tag environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
} else if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
} 