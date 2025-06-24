/**
 * MxM Website - Design Enhancement Integration
 * Visual enhancements and design system integration
 */

class DesignEnhancementIntegration {
    constructor() {
        this.init();
    }
    
    init() {
        this.enhanceVisualElements();
        this.addParallaxEffects();
        this.addGlowEffects();
        this.addTextAnimations();
        this.addBackgroundEffects();
    }
    
    enhanceVisualElements() {
        // Add glass morphism effects to cards
        const cards = document.querySelectorAll('.card, .offering-card, .investment-card');
        cards.forEach(card => {
            card.style.backdropFilter = 'blur(10px)';
            card.style.background = 'rgba(255, 255, 255, 0.1)';
            card.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            card.style.borderRadius = '15px';
        });
        
        // Enhance buttons with gradient backgrounds
        const buttons = document.querySelectorAll('.explore-btn, .cta-button');
        buttons.forEach(button => {
            button.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))';
            button.style.backdropFilter = 'blur(10px)';
            button.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            button.style.transition = 'all 0.3s ease';
            
            button.addEventListener('mouseenter', () => {
                button.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2))';
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
            });
        });
    }
    
    addParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-background-slideshow img, .section-image');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }
    
    addGlowEffects() {
        // Add glow effects to important elements
        const glowElements = document.querySelectorAll('.room-title, .section-title');
        
        glowElements.forEach(element => {
            element.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
            element.style.transition = 'text-shadow 0.3s ease';
            
            element.addEventListener('mouseenter', () => {
                element.style.textShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
            });
        });
    }
    
    addTextAnimations() {
        // Add typewriter effect to specific elements
        const typewriterElements = document.querySelectorAll('[data-typewriter]');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid rgba(255, 255, 255, 0.7)';
            element.style.animation = 'blink 1s infinite';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                element.textContent += text.charAt(i);
                i++;
                if (i > text.length) {
                    clearInterval(typeInterval);
                    element.style.borderRight = 'none';
                    element.style.animation = 'none';
                }
            }, 100);
        });
    }
    
    addBackgroundEffects() {
        // Add floating particles
        this.createFloatingParticles();
        
        // Add gradient overlays
        const sections = document.querySelectorAll('.page-section');
        sections.forEach((section, index) => {
            const overlay = document.createElement('div');
            overlay.className = 'gradient-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(${45 + (index * 30)}deg, 
                    rgba(255, 255, 255, 0.05) 0%, 
                    transparent 50%, 
                    rgba(255, 255, 255, 0.02) 100%);
                pointer-events: none;
                z-index: 1;
            `;
            
            section.style.position = 'relative';
            section.appendChild(overlay);
        });
    }
    
    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'floating-particles';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        document.body.appendChild(particleContainer);
        
        // Create particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                animation: float ${Math.random() * 10 + 10}s infinite linear;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            
            particleContainer.appendChild(particle);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DesignEnhancementIntegration();
});

// Add CSS for design enhancements
const style = document.createElement('style');
style.textContent = `
    @keyframes blink {
        0%, 50% { border-color: rgba(255, 255, 255, 0.7); }
        51%, 100% { border-color: transparent; }
    }
    
    @keyframes float {
        0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-1000px) rotate(360deg);
            opacity: 0;
        }
    }
    
    .gradient-overlay {
        animation: gradientShift 20s ease-in-out infinite;
    }
    
    @keyframes gradientShift {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    /* Enhanced scrollbar styling */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
    }
    
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3));
    }
`;
document.head.appendChild(style); 