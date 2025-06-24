/**
 * MxM Website - Fourth Wall Breaking Effects
 * Interactive elements that respond to user behavior
 */

class FourthWallBreaking {
    constructor() {
        this.init();
    }
    
    init() {
        this.addCursorEffects();
        this.addScrollEffects();
        this.addInteractiveElements();
    }
    
    addCursorEffects() {
        // Create custom cursor trail
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        });
        
        // Hide default cursor on interactive elements
        const interactiveElements = document.querySelectorAll('button, a, .explore-btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                cursor.style.background = 'rgba(255, 255, 255, 0.6)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = 'rgba(255, 255, 255, 0.3)';
            });
        });
    }
    
    addScrollEffects() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            document.body.classList.add('scrolling');
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('scrolling');
            }, 150);
        });
    }
    
    addInteractiveElements() {
        // Add click ripple effects
        const clickableElements = document.querySelectorAll('button, .explore-btn, .cta-button');
        
        clickableElements.forEach(element => {
            element.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                element.style.position = 'relative';
                element.style.overflow = 'hidden';
                element.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FourthWallBreaking();
});

// Add CSS for effects
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .scrolling {
        cursor: grabbing;
    }
    
    .scrolling * {
        pointer-events: none;
    }
`;
document.head.appendChild(style); 