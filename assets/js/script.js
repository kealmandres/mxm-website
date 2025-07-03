/**
 * MxM Website - Main Script
 * Basic functionality and utilities
 */

// MxM Website Core Initialization

// Additional universal initialization can be added here as needed
document.addEventListener('DOMContentLoaded', function() {
    // Website loaded
    
    // Initialize any cross-page functionality here
});

// Global feature initialization
function initializeGlobalFeatures() {
    // Add smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading states for buttons
    const buttons = document.querySelectorAll('button, .btn, .explore-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1000);
            }
        });
    });
}

// Utility functions
window.MxM = window.MxM || {};
window.MxM.utils = {
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}; 