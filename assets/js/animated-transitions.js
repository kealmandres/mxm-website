/**
 * MxM Website - Animated Transitions
 * Handles page transitions and animations
 */

// Page transition effects
class AnimatedTransitions {
    constructor() {
        this.init();
    }
    
    init() {
        this.addPageTransitions();
        this.addScrollAnimations();
        this.addHoverEffects();
    }
    
    addPageTransitions() {
        // Add fade-in effect when page loads
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        
        window.addEventListener('load', () => {
            document.body.style.opacity = '1';
        });
        
        // Add transition effects for internal links
        const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.target !== '_blank') {
                    this.fadeOutTransition();
                }
            });
        });
    }
    
    addScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll('.animate-on-scroll, .card, .offering-card, .process-step');
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
    
    addHoverEffects() {
        // Add hover effects to interactive elements
        const interactiveElements = document.querySelectorAll('.explore-btn, .cta-button, .room-content');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.classList.add('hover-active');
            });
            
            element.addEventListener('mouseleave', () => {
                element.classList.remove('hover-active');
            });
        });
    }
    
    fadeOutTransition() {
        document.body.style.opacity = '0.7';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 300);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AnimatedTransitions();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .hover-active {
        transform: scale(1.02);
        transition: transform 0.3s ease;
    }
    
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }
`;
document.head.appendChild(style); 