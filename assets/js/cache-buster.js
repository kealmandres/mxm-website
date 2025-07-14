// Cache Busting Script
// Automatically updates CSS and JS file URLs with version parameters

class CacheBuster {
    constructor() {
        this.version = null;
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        try {
            await this.fetchVersion();
            this.updateAssetUrls();
        } catch (error) {
            // Fallback to timestamp if API fails
            this.version = Date.now().toString();
            this.updateAssetUrls();
        }
    }

    async fetchVersion() {
        const response = await fetch('/api/version');
        const data = await response.json();
        this.version = data.version;
        return data;
    }

    updateAssetUrls() {
        // Update CSS files
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            if (this.isLocalAsset(link.href)) {
                link.href = this.addVersionParam(link.href);
            }
        });

        // Update JS files
        document.querySelectorAll('script[src]').forEach(script => {
            if (this.isLocalAsset(script.src)) {
                const newSrc = this.addVersionParam(script.src);
                // For existing scripts, we can't change src, but we can note it
                script.dataset.originalSrc = script.src;
                script.dataset.versionedSrc = newSrc;
            }
        });

        // Update any future dynamically loaded assets
        this.interceptDynamicLoads();
    }

    isLocalAsset(url) {
        // Check if URL is a local asset (not external CDN)
        return !url.includes('://') || 
               url.includes(window.location.hostname) ||
               url.startsWith('/') ||
               url.startsWith('./') ||
               url.startsWith('../');
    }

    addVersionParam(url) {
        const separator = url.includes('?') ? '&' : '?';
        // Remove existing version parameter if present
        const cleanUrl = url.replace(/[?&]v=[^&]*/, '');
        return `${cleanUrl}${separator}v=${this.version}`;
    }

    interceptDynamicLoads() {
        // Intercept any dynamically created link/script elements
        const originalCreateElement = document.createElement;
        const self = this;

        document.createElement = function(tagName) {
            const element = originalCreateElement.call(document, tagName);
            
            if (tagName.toLowerCase() === 'link' && element.rel === 'stylesheet') {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = function(name, value) {
                    if (name === 'href' && self.isLocalAsset(value)) {
                        value = self.addVersionParam(value);
                    }
                    return originalSetAttribute.call(this, name, value);
                };
            }
            
            if (tagName.toLowerCase() === 'script') {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = function(name, value) {
                    if (name === 'src' && self.isLocalAsset(value)) {
                        value = self.addVersionParam(value);
                    }
                    return originalSetAttribute.call(this, name, value);
                };
            }
            
            return element;
        };
    }

    // Public method to manually refresh version
    async refresh() {
        await this.fetchVersion();
        this.updateAssetUrls();
        console.log(`🔄 Cache busting refreshed with version: ${this.version}`);
    }

    // Public method to get current version
    getVersion() {
        return this.version;
    }
}

// Initialize cache buster when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cacheBuster = new CacheBuster();
    });
} else {
    window.cacheBuster = new CacheBuster();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheBuster;
} 