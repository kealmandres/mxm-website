/**
 * MxM Website - Essential Quantum Enhancement Effects
 * Cleaned version - removed redundant animations and conflicts
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize only essential effects
    initQuantumParticles();    // Keep - nice click feedback
    init3DTiltEffects();       // Keep - main card interaction  
    initFlashlightEffect();    // Keep - subtle mouse tracking
    
    // REMOVED REDUNDANT EFFECTS:
    // initShimmerEffects();   // Redundant with existing glass effects
    // initQuantumButtons();   // Redundant with CSS button hover effects
});

// ===== QUANTUM PARTICLE SYSTEM =====
function initQuantumParticles() {
    const interactiveElements = document.querySelectorAll('.explore-btn, .music-player, .nav-dot');
    
    interactiveElements.forEach(element => {
        element.addEventListener('click', createQuantumBurst);
    });
}

function createQuantumBurst(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create multiple particles
    for (let i = 0; i < 8; i++) {
        createQuantumParticle(centerX, centerY);
    }
}

function createQuantumParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'quantum-particle';
    
    // Random direction
    const angle = (Math.PI * 2 * Math.random());
    const distance = 50 + Math.random() * 100;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--dx', dx + 'px');
    
    document.body.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 1500);
}

// ===== FLASHLIGHT MOUSE EFFECT =====
// function initFlashlightEffect() {
//     // Create flashlight overlay elements
//     const flashlightOverlay = document.createElement('div');
//     flashlightOverlay.className = 'flashlight-overlay';
//     document.body.appendChild(flashlightOverlay);
    
//     const flashlightSpotlight = document.createElement('div');
//     flashlightSpotlight.className = 'flashlight-spotlight';
//     document.body.appendChild(flashlightSpotlight);
    
//     let mouseX = 0;
//     let mouseY = 0;
//     let isActive = false;
    
//     // Track mouse movement with throttling for performance
//     let mouseMoveTimeout;
//     document.addEventListener('mousemove', (e) => {
//         mouseX = e.clientX;
//         mouseY = e.clientY;
        
//         // Throttle updates for better performance
//         clearTimeout(mouseMoveTimeout);
//         mouseMoveTimeout = setTimeout(() => {
//             // Update CSS custom properties for the overlay
//             document.documentElement.style.setProperty('--mouse-x', mouseX + 'px');
//             document.documentElement.style.setProperty('--mouse-y', mouseY + 'px');
            
//             // Update spotlight position
//             flashlightSpotlight.style.left = mouseX + 'px';
//             flashlightSpotlight.style.top = mouseY + 'px';
            
//             // Activate flashlight effect
//             if (!isActive) {
//                 document.body.classList.add('flashlight-active');
//                 isActive = true;
//             }
//         }, 16); // ~60fps
//     });
    
//     // Deactivate when mouse leaves window
//     document.addEventListener('mouseleave', () => {
//         document.body.classList.remove('flashlight-active');
//         isActive = false;
//     });
    
//     // Reactivate when mouse enters window
//     document.addEventListener('mouseenter', () => {
//         if (mouseX !== 0 || mouseY !== 0) {
//             document.body.classList.add('flashlight-active');
//             isActive = true;
//         }
//     });
// }
function initFlashlightEffect() {
    // Create flashlight overlay elements
    const flashlightOverlay = document.createElement('div');
    flashlightOverlay.className = 'flashlight-overlay';
    document.body.appendChild(flashlightOverlay);
    
    const flashlightSpotlight = document.createElement('div');
    flashlightSpotlight.className = 'flashlight-spotlight';
    document.body.appendChild(flashlightSpotlight);
    
    let mouseX = 0;
    let mouseY = 0;
    let isActive = false;
    let ticking = false;
    
    // Ultra-smooth mouse tracking with requestAnimationFrame
    function updateFlashlightPosition() {
        if (!ticking) return;
        
        // Batch all DOM updates
        requestAnimationFrame(() => {
            // Update CSS custom properties
            document.documentElement.style.setProperty('--mouse-x', mouseX + 'px');
            document.documentElement.style.setProperty('--mouse-y', mouseY + 'px');
            
            // Update spotlight position with transform3d for hardware acceleration
            flashlightSpotlight.style.transform = `translate3d(${mouseX - 120}px, ${mouseY - 120}px, 0)`;
            
            ticking = false;
        });
    }
    
    // High-performance mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Activate flashlight effect
        if (!isActive) {
            document.body.classList.add('flashlight-active');
            isActive = true;
        }
        
        // Schedule update on next frame
        if (!ticking) {
            ticking = true;
            updateFlashlightPosition();
        }
    }, { passive: true });
    
    // Deactivate when mouse leaves window
    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('flashlight-active');
        isActive = false;
        ticking = false;
    }, { passive: true });
    
    // Reactivate when mouse enters window
    document.addEventListener('mouseenter', () => {
        if (mouseX !== 0 || mouseY !== 0) {
            document.body.classList.add('flashlight-active');
            isActive = true;
        }
    }, { passive: true });
}
// ===== 3D TILT SYSTEM (CLEANED) =====
function init3DTiltEffects() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.willChange = 'transform';
            element.style.zIndex = '10000';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.willChange = 'auto';
            // Reset to center position - NO SCALING
            element.style.transform = 'translate(-50%, -50%) perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            
            // Reset shadow if exists
            const shadow = element.querySelector('.tilt-shadow');
            if (shadow) {
                shadow.style.transform = 'translateX(-50%) translateY(0px) scale(1)';
                shadow.style.opacity = '0.3';
            }
        });
        
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -15; // Max 15 degrees
            const rotateY = (x - centerX) / centerX * 15;   // Max 15 degrees
            
            // Apply ONLY rotation - NO SCALING to prevent movement
            element.style.transform = `translate(-50%, -50%) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
            
            // Update shadow position if exists
            const shadow = element.querySelector('.tilt-shadow');
            if (shadow) {
                const shadowX = (x - centerX) / centerX * 10;
                const shadowY = (y - centerY) / centerY * 10;
                shadow.style.transform = `translateX(-50%) translateY(${5 + shadowY}px) scale(${1 + Math.abs(rotateX + rotateY) / 100})`;
                shadow.style.opacity = '0.6';
            }
        });
    });
}

// ===== REMOVED REDUNDANT EFFECTS =====

// REMOVED: initShimmerEffects() 
// Reason: Redundant with existing glass panel shimmer in CSS (:before pseudo-element)

// REMOVED: initQuantumButtons()
// Reason: Redundant with CSS button hover effects and transitions

// REMOVED: Quantum ripple CSS injection
// Reason: Buttons already have comprehensive hover effects in main CSS

// ===== PERFORMANCE OPTIMIZATIONS =====

// Debounce function for better performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for mouse tracking
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}