/**
 * MxM Website - Micro Interactions
 * Subtle UI enhancements and feedback
 */

class MicroInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        this.addButtonFeedback();
        this.addFormInteractions();
        this.addLoadingStates();
        this.addTooltips();
    }
    
    addButtonFeedback() {
        const buttons = document.querySelectorAll('button, .btn, .explore-btn, .cta-button');
        
        buttons.forEach(button => {
            // Add press effect
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.98)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = 'scale(1)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
            });
            
            // Add focus indicators
            button.addEventListener('focus', () => {
                button.style.outline = '2px solid rgba(255, 255, 255, 0.5)';
                button.style.outlineOffset = '2px';
            });
            
            button.addEventListener('blur', () => {
                button.style.outline = 'none';
            });
        });
    }
    
    addFormInteractions() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Add focus effects
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
                input.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                input.style.borderColor = '';
            });
            
            // Add validation feedback
            input.addEventListener('invalid', () => {
                input.classList.add('error');
                this.showValidationMessage(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error') && input.validity.valid) {
                    input.classList.remove('error');
                    this.hideValidationMessage(input);
                }
            });
        });
    }
    
    addLoadingStates() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitButton = form.querySelector('[type="submit"]');
                if (submitButton && !submitButton.disabled) {
                    submitButton.classList.add('loading');
                    submitButton.disabled = true;
                    
                    const originalText = submitButton.textContent;
                    submitButton.textContent = 'Loading...';
                    
                    // Reset after 3 seconds if not handled by form logic
                    setTimeout(() => {
                        if (submitButton.classList.contains('loading')) {
                            submitButton.classList.remove('loading');
                            submitButton.disabled = false;
                            submitButton.textContent = originalText;
                        }
                    }, 3000);
                }
            });
        });
    }
    
    addTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[title], [data-tooltip]');
        
        elementsWithTooltips.forEach(element => {
            const tooltipText = element.getAttribute('title') || element.getAttribute('data-tooltip');
            if (tooltipText) {
                element.removeAttribute('title'); // Remove default tooltip
                
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = tooltipText;
                tooltip.style.cssText = `
                    position: absolute;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    pointer-events: none;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    white-space: nowrap;
                `;
                
                element.addEventListener('mouseenter', (e) => {
                    document.body.appendChild(tooltip);
                    const rect = element.getBoundingClientRect();
                    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                    tooltip.style.opacity = '1';
                });
                
                element.addEventListener('mouseleave', () => {
                    tooltip.style.opacity = '0';
                    setTimeout(() => {
                        if (tooltip.parentNode) {
                            tooltip.parentNode.removeChild(tooltip);
                        }
                    }, 300);
                });
            }
        });
    }
    
    showValidationMessage(input) {
        const existingMessage = input.parentElement.querySelector('.validation-message');
        if (existingMessage) return;
        
        const message = document.createElement('div');
        message.className = 'validation-message';
        message.textContent = input.validationMessage;
        message.style.cssText = `
            color: #ff6b6b;
            font-size: 12px;
            margin-top: 4px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        input.parentElement.appendChild(message);
        setTimeout(() => message.style.opacity = '1', 10);
    }
    
    hideValidationMessage(input) {
        const message = input.parentElement.querySelector('.validation-message');
        if (message) {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MicroInteractions();
});

// Add CSS for micro interactions
const style = document.createElement('style');
style.textContent = `
    .focused {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
    }
    
    .error {
        border-color: #ff6b6b !important;
        box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2) !important;
    }
    
    .loading {
        position: relative;
        overflow: hidden;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        animation: loading-shine 1.5s infinite;
    }
    
    @keyframes loading-shine {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;
document.head.appendChild(style); 