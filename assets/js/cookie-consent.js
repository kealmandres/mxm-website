// Cookie Consent Management
class CookieConsent {
    constructor() {
        this.cookieName = 'mxm_cookie_consent';
        this.consentTypes = {
            necessary: true, // Always true
            analytics: false,
            marketing: false
        };
        
        this.init();
    }
    
    init() {
        // Check if consent has already been given
        const existingConsent = this.getConsent();
        
        if (!existingConsent) {
            this.showBanner();
        } else {
            // Apply existing consent settings
            this.applyConsent(existingConsent);
        }
    }
    
    showBanner() {
        // Create banner HTML
        const bannerHTML = `
            <div id="cookie-consent" class="cookie-consent">
                <div class="cookie-consent-content">
                    <div class="cookie-consent-text">
                        <h4>We use cookies</h4>
                        <p>We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept All", you consent to our use of cookies. <a href="/privacy-policy" target="_blank">Learn more</a></p>
                    </div>
                    <div class="cookie-consent-actions">
                        <button class="cookie-btn secondary" onclick="cookieConsent.managePreferences()">Manage</button>
                        <button class="cookie-btn" onclick="cookieConsent.acceptNecessary()">Necessary Only</button>
                        <button class="cookie-btn primary" onclick="cookieConsent.acceptAll()">Accept All</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add banner to page
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        
        // Show banner with animation
        setTimeout(() => {
            const banner = document.getElementById('cookie-consent');
            if (banner) {
                banner.classList.add('show');
            }
        }, 500);
    }
    
    acceptAll() {
        const consent = {
            necessary: true,
            analytics: true,
            marketing: true,
            timestamp: Date.now()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
    }
    
    acceptNecessary() {
        const consent = {
            necessary: true,
            analytics: false,
            marketing: false,
            timestamp: Date.now()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
    }
    
    managePreferences() {
        // Create preferences modal
        const modalHTML = `
            <div id="cookie-preferences-modal" class="cookie-modal">
                <div class="cookie-modal-content">
                    <div class="cookie-modal-header">
                        <h3>Cookie Preferences</h3>
                        <button class="cookie-modal-close" onclick="cookieConsent.closePreferences()">&times;</button>
                    </div>
                    <div class="cookie-modal-body">
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <h4>Necessary Cookies</h4>
                                <label class="cookie-toggle">
                                    <input type="checkbox" checked disabled>
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                            <p>These cookies are essential for the website to function and cannot be switched off.</p>
                        </div>
                        
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <h4>Analytics Cookies</h4>
                                <label class="cookie-toggle">
                                    <input type="checkbox" id="analytics-toggle">
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                            <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                        </div>
                        
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <h4>Marketing Cookies</h4>
                                <label class="cookie-toggle">
                                    <input type="checkbox" id="marketing-toggle">
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                            <p>These cookies are used to track visitors across websites to display relevant advertisements.</p>
                        </div>
                    </div>
                    <div class="cookie-modal-footer">
                        <button class="cookie-btn secondary" onclick="cookieConsent.closePreferences()">Cancel</button>
                        <button class="cookie-btn primary" onclick="cookieConsent.savePreferences()">Save Preferences</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const modalStyles = `
            <style>
                .cookie-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                }
                
                .cookie-modal-content {
                    background: #1a1a1a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                
                .cookie-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .cookie-modal-header h3 {
                    color: #ffffff;
                    margin: 0;
                    font-family: 'Uniform', Arial, sans-serif;
                }
                
                .cookie-modal-close {
                    background: none;
                    border: none;
                    color: #ffffff;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .cookie-modal-body {
                    padding: 20px;
                }
                
                .cookie-category {
                    margin-bottom: 20px;
                }
                
                .cookie-category-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .cookie-category h4 {
                    color: #ffffff;
                    margin: 0;
                    font-size: 1rem;
                }
                
                .cookie-category p {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9rem;
                    margin: 0;
                    line-height: 1.4;
                }
                
                .cookie-toggle {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                
                .cookie-toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .cookie-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(255, 255, 255, 0.2);
                    transition: .4s;
                    border-radius: 24px;
                }
                
                .cookie-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                
                .cookie-toggle input:checked + .cookie-slider {
                    background-color: rgba(255, 255, 255, 0.4);
                }
                
                .cookie-toggle input:checked + .cookie-slider:before {
                    transform: translateX(26px);
                }
                
                .cookie-toggle input:disabled + .cookie-slider {
                    background-color: rgba(255, 255, 255, 0.3);
                    cursor: not-allowed;
                }
                
                .cookie-modal-footer {
                    padding: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
            </style>
        `;
        
        // Add modal to page
        document.head.insertAdjacentHTML('beforeend', modalStyles);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    closePreferences() {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    savePreferences() {
        const analyticsToggle = document.getElementById('analytics-toggle');
        const marketingToggle = document.getElementById('marketing-toggle');
        
        const consent = {
            necessary: true,
            analytics: analyticsToggle ? analyticsToggle.checked : false,
            marketing: marketingToggle ? marketingToggle.checked : false,
            timestamp: Date.now()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.closePreferences();
        this.hideBanner();
    }
    
    hideBanner() {
        const banner = document.getElementById('cookie-consent');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }
    
    saveConsent(consent) {
        localStorage.setItem(this.cookieName, JSON.stringify(consent));
    }
    
    getConsent() {
        const consent = localStorage.getItem(this.cookieName);
        return consent ? JSON.parse(consent) : null;
    }
    
    applyConsent(consent) {
        // Apply Google Analytics
        if (consent.analytics && typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        } else if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        
        // Apply Facebook Pixel
        if (consent.marketing && typeof fbq !== 'undefined') {
            fbq('consent', 'grant');
        } else if (typeof fbq !== 'undefined') {
            fbq('consent', 'revoke');
        }
    }
    
    // Public method to check if specific consent is given
    hasConsent(type) {
        const consent = this.getConsent();
        return consent ? consent[type] : false;
    }
    
    // Public method to revoke consent (for privacy policy page)
    revokeConsent() {
        localStorage.removeItem(this.cookieName);
        location.reload();
    }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.cookieConsent = new CookieConsent();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieConsent;
} 