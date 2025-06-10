/**
 * MxM Website - Ultra-Smooth Navigation
 * Optimized for 60fps+ performance on all devices
 * ENHANCED: Added room entrance animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const rooms = document.querySelectorAll('.room');
    const container = document.querySelector('.container');
    const navDots = document.querySelectorAll('.nav-dot');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    
    // State
    let currentRoomIndex = 0;
    let isTransitioning = false;
    let animationFrame = null;
    let scrollProgress = 0;
    let lastTime = 0;
    
    // ADDED: Animation cancellation tracking
    let activeRoomAnimations = new Set();
    let roomAnimationTimeouts = new Map();
    
    // Performance optimization: Pre-calculate positions
    const positionCache = new Map();
    
    // ADDED: Room ID to animation type mapping
    const roomAnimationMap = {
        'entrance-hall': null, // No animation for entrance
        'machine-megamind': 'neural-network',
        'artificial-ingenious': 'agent-system',
        'consults-coded': 'data-visualization',
        'blonde-bot-lair': 'signature-text',
        'future-observatory': 'time-portal',
        'success-gallery': 'gallery-frames',
        'chat-chamber': 'chat-bubble'
    };
    
    // Initialize
    if (rooms.length === 0) {
        console.warn('No rooms found');
        return;
    }
    
    // Set initial room as active
    rooms[0].classList.add('active');
    if (navDots.length > 0) {
        navDots[0].classList.add('active');
    }
    
    // Initialize room positions
    updateRoomPositions();
    
    // Enhanced transition animation with performance optimizations
    function animateTransition(targetIndex) {
        if (isTransitioning || targetIndex === currentRoomIndex || targetIndex < 0 || targetIndex >= rooms.length) {
            return;
        }
        
        // ADDED: Cancel any running room animations before transitioning
        cancelAllRoomAnimations();
        
        isTransitioning = true;
        scrollProgress = 0;
        lastTime = performance.now();
        
        // Pre-calculate all positions for smooth animation
        clearPositionCache();
        
        // Show transition effects
        container.classList.add('transitioning');
        
        // Add glass reflections during transition
        document.querySelectorAll('.room-content').forEach(content => {
            content.classList.add('reflect');
        });
        
        // Update navigation state
        navDots.forEach(dot => dot.classList.remove('active'));
        if (navDots[targetIndex]) {
            navDots[targetIndex].classList.add('active');
        }
        
        const nextRoomIndex = targetIndex;
        
        function animate(currentTime) {
            // Calculate delta time for consistent speed across devices
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // Adaptive speed based on frame rate
            const adaptiveSpeed = Math.min(0.2, 0.1 * (deltaTime / 16.67)); // Reduced 0.08 to 0.05 to slow down
            scrollProgress += adaptiveSpeed;
            
            if (scrollProgress >= 1) {
                completeTransition(nextRoomIndex);
                return;
            }
            
            // Ultra-smooth easing function (smoothstep)
            const easedProgress = smoothStep(scrollProgress);
            
            // Batch DOM updates for better performance
            batchUpdateRooms(currentRoomIndex, nextRoomIndex, easedProgress);
            
            // Update progress bar
            updateProgressBarDuringTransition(currentRoomIndex, nextRoomIndex, easedProgress);
            
            animationFrame = requestAnimationFrame(animate);
        }
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    // Ultra-smooth easing function
    function smoothStep(t) {
        return t * t * (3 - 2 * t);
    }
    
    // Optimized batch update function
    function batchUpdateRooms(currentIndex, nextIndex, progress) {
        // Batch all DOM updates together
        const updates = [];
        
        rooms.forEach((room, index) => {
            const transformData = calculateOptimizedTransform(room, index, currentIndex, nextIndex, progress);
            updates.push({ room, ...transformData });
        });
        
        // Apply all updates at once
        updates.forEach(({ room, transform, opacity, zIndex, roomScale }) => {
            room.style.transform = transform;
            room.style.opacity = opacity;
            room.style.zIndex = zIndex;

            const roomContent = room.querySelector('.room-content');
            if (roomContent) {
                roomContent.style.opacity = opacity; // Match parent room's opacity
                roomContent.style.transform = `translate(-50%, -50%) scale(${roomScale})`; // Scale with parent room
            }
        });
    }
    
    function calculateOptimizedTransform(room, index, currentIndex, nextIndex, progress) {
        // Get cached positions or calculate new ones
        const startPos = getCachedPosition(index, currentIndex);
        const endPos = getCachedPosition(index, nextIndex);
        
        // Smooth interpolation with rounding to prevent sub-pixel jitter
        const x = Math.round(startPos.x + (endPos.x - startPos.x) * progress);
        const z = Math.round(startPos.z + (endPos.z - startPos.z) * progress);
        const rotation = Math.round((startPos.rotation + (endPos.rotation - startPos.rotation) * progress) * 100) / 100;
        
        // Original linearly interpolated scale
        let baseScale = startPos.scale + (endPos.scale - startPos.scale) * progress;

        // Introduce a dip in the scale during the transition - Temporarily commenting out to assess base effect
        // const SCALE_DIP_AMOUNT = 0.075; 
        // const dipFactor = Math.sin(Math.PI * progress); 
        // let finalAppliedScale = baseScale - SCALE_DIP_AMOUNT * dipFactor;
        // finalAppliedScale = Math.max(0.5, finalAppliedScale); 
        // const calculatedScale = Math.round(finalAppliedScale * 1000) / 1000;
        
        const calculatedScale = Math.round(baseScale * 1000) / 1000; // Use interpolated baseScale directly for now
        
        // Enhanced fade effect with different timing for each room type
        let opacity, zIndex;
        
        if (index === currentIndex) {
            // Current room fading out - faster fade
            const fadeOutProgress = Math.min(1, progress * 1.8);
            opacity = Math.max(0, 1 - fadeOutProgress);
            zIndex = '1';
        } else if (index === nextIndex) {
            // Next room fading in - delayed start, smooth entrance
            const fadeInProgress = Math.max(0, (progress - 0.15) * 1.4);
            opacity = Math.min(1, fadeInProgress);
            zIndex = '2';
        } else {
            // Other rooms - smooth interpolation
            opacity = Math.max(0, startPos.opacity + (endPos.opacity - startPos.opacity) * progress);
            zIndex = '0';
        }
        
        // Use translate3d for hardware acceleration
        const transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rotation}deg) scale3d(${calculatedScale}, ${calculatedScale}, 1)`;
        
        return { transform, opacity, zIndex, roomScale: calculatedScale }; // Return calculatedScale as roomScale
    }
    
    function getCachedPosition(index, currentIndex) {
        const key = `${index}-${currentIndex}`;
        if (!positionCache.has(key)) {
            positionCache.set(key, calculatePosition(index, currentIndex));
        }
        return positionCache.get(key);
    }
    
    function clearPositionCache() {
        positionCache.clear();
    }
    
    function calculatePosition(roomIndex, activeRoomIndex) {
        const numRooms = rooms.length;
        if (numRooms === 0) return { x: 0, z: 0, opacity: 0, rotation: 0, scale: 0 };

        const RADIUS = 1200; // Radius of the circle on which rooms are placed.
        const MIN_SCALE_NON_ACTIVE = 0.5; // Min scale for rooms not in direct view
        const MIN_OPACITY_NON_ACTIVE = 0.2; // Min opacity for rooms not in direct view

        // Calculate the angular position of 'roomIndex' RELATIVE to 'activeRoomIndex'
        // 'activeRoomIndex' is considered to be at 0 degrees (directly in front of the viewer).
        let offset = roomIndex - activeRoomIndex;

        // Normalize offset to be within [-numRooms/2, numRooms/2] to find the shortest path
        if (offset > numRooms / 2) {
            offset -= numRooms;
        } else if (offset < -numRooms / 2) {
            offset += numRooms;
        }

        const angle = (offset / numRooms) * 2 * Math.PI; // Angle in radians relative to the front (-PI to PI)

        // Calculate position on the circle
        // Active room (angle=0) will be at x=0, z=0.
        // Other rooms curve away into negative Z space.
        const x = RADIUS * Math.sin(angle);
        const z = RADIUS * (Math.cos(angle) - 1); // Ensures z=0 for active, negative z for others

        // Room rotation: each room should rotate to face the origin (0,0,0) where the viewer is.
        const rotationY = angle * (180 / Math.PI);

        let scale, opacity;

        if (roomIndex === activeRoomIndex) { // Current active room (angle is 0)
            scale = 1;
            opacity = 1;
        } else {
            // Scale and opacity decrease as the room moves away from the front.
            // cos(angle) is 1 for front (active), 0 for sides (90deg), -1 for back.
            // (cos(angle) + 1) / 2 gives a factor from 1 (front) to 0 (directly behind).
            const cosFactor = (Math.cos(angle) + 1) / 2;

            scale = MIN_SCALE_NON_ACTIVE + (1 - MIN_SCALE_NON_ACTIVE) * cosFactor;
            opacity = MIN_OPACITY_NON_ACTIVE + (1 - MIN_OPACITY_NON_ACTIVE) * cosFactor;
        }
        
        return { x, z, opacity, rotation: rotationY, scale };
    }
    
    function completeTransition(targetIndex) {
        // Clean up animation
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        
        // Update current room
        if (rooms[currentRoomIndex]) { // Check if currentRoomIndex is valid before removing class
            rooms[currentRoomIndex].classList.remove('active');
        }
        currentRoomIndex = targetIndex;
        rooms[currentRoomIndex].classList.add('active');
        
        // Reset all room positions and their content cards
        rooms.forEach((room, idx) => {
            const pos = calculatePosition(idx, currentRoomIndex);
            room.style.transform = `translate3d(${pos.x}px, 0, ${pos.z}px) rotateY(${pos.rotation}deg) scale3d(${pos.scale}, ${pos.scale}, 1)`;
            room.style.opacity = pos.opacity;
            room.style.zIndex = idx === currentRoomIndex ? '1' : '0';

            const rc = room.querySelector('.room-content');
            if (rc) {
                if (idx === currentRoomIndex) {
                    rc.style.opacity = '1';
                    rc.style.transform = 'translate(-50%, -50%) scale(1)';
                } else {
                    rc.style.opacity = pos.opacity; // Match parent room's final opacity
                    rc.style.transform = `translate(-50%, -50%) scale(${pos.scale})`; // Match parent room's final scale
                }
            }
        });
        
        // Remove transition effects from container and content reflection
        container.classList.remove('transitioning');
        document.querySelectorAll('.room-content').forEach(content => {
            content.classList.remove('reflect');
        });
        
        // Clear performance optimizations
        clearPositionCache();
        
        // ADDED: Trigger room entrance animation
        const currentRoomId = rooms[currentRoomIndex].id;
        const animationType = roomAnimationMap[currentRoomId];
        if (animationType) {
            setTimeout(() => {
                applyRoomEntrance(animationType);
            }, 300); // Small delay after transition completes
        }
        
        // Dispatch room change event
        document.dispatchEvent(new CustomEvent('roomChanged', {
            detail: { roomId: currentRoomId }
        }));
        
        // Update CSS progress bar
        updateProgressBar();
        
        // Reset transition state
        isTransitioning = false;
    }
    
    function updateRoomPositions() {
        rooms.forEach((room, index) => {
            const pos = calculatePosition(index, currentRoomIndex);
            
            // Use translate3d and scale3d for hardware acceleration
            room.style.transform = `translate3d(${pos.x}px, 0, ${pos.z}px) rotateY(${pos.rotation}deg) scale3d(${pos.scale}, ${pos.scale}, 1)`;
            room.style.opacity = pos.opacity;
            room.style.zIndex = index === currentRoomIndex ? '1' : '0';
        });
    }
    
    // Navigation functions
    function goToRoom(index) {
        animateTransition(index);
    }
    
    function nextRoom() {
        const nextIndex = (currentRoomIndex + 1) % rooms.length;
        animateTransition(nextIndex);
    }
    
    function prevRoom() {
        const prevIndex = (currentRoomIndex - 1 + rooms.length) % rooms.length;
        animateTransition(prevIndex);
    }
    
    // Optimized progress bar functions
    function updateProgressBar() {
        const progressIndicator = document.querySelector('.progress-indicator');
        if (progressIndicator) {
            const progress = ((currentRoomIndex + 1) / rooms.length) * 100;
            
            // Use requestAnimationFrame for smooth updates
            requestAnimationFrame(() => {
                progressIndicator.style.width = progress + '%';
            });
        }
    }
    
    function updateProgressBarDuringTransition(currentIndex, nextIndex, progress) {
        const progressIndicator = document.querySelector('.progress-indicator');
        if (progressIndicator) {
            const currentProgress = ((currentIndex + 1) / rooms.length) * 100;
            const nextProgress = ((nextIndex + 1) / rooms.length) * 100;
            const interpolatedProgress = currentProgress + (nextProgress - currentProgress) * progress;
            
            // Smooth progress bar update
            progressIndicator.style.width = Math.round(interpolatedProgress * 100) / 100 + '%';
        }
    }
    
    // ===== ADDED: ROOM ENTRANCE ANIMATION SYSTEM ===== //
    
    // ADDED: Animation cancellation system
    function cancelAllRoomAnimations() {
        // Cancel all running timeouts
        roomAnimationTimeouts.forEach((timeoutId) => {
            clearTimeout(timeoutId);
        });
        roomAnimationTimeouts.clear();
        
        // Remove all active animation elements
        activeRoomAnimations.forEach((animationElement) => {
            if (animationElement && animationElement.parentNode) {
                animationElement.style.transition = 'opacity 0.2s ease-out';
                animationElement.style.opacity = '0';
                setTimeout(() => {
                    if (animationElement.parentNode) {
                        animationElement.parentNode.removeChild(animationElement);
                    }
                }, 200);
            }
        });
        activeRoomAnimations.clear();
        
        // Clean up any orphaned animation elements
        const container = document.querySelector('.floating-elements-container');
        if (container) {
            const existingAnimations = container.querySelectorAll('div');
            existingAnimations.forEach(element => {
                element.style.transition = 'opacity 0.2s ease-out';
                element.style.opacity = '0';
                setTimeout(() => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }, 200);
            });
        }
    }
    
    function applyRoomEntrance(animationType) {
        // Cancel any existing animations first
        cancelAllRoomAnimations();
        
        switch(animationType) {
            case 'neural-network':
                createNeuralNetworkEntrance();
                break;
            case 'agent-system':
                createAgentSystemEntrance();
                break;
            case 'data-visualization':
                createDataVisualizationEntrance();
                break;
            case 'time-portal':
                createTimePortalEntrance();
                break;
            case 'signature-text':
                createSignatureTextEntrance();
                break;
            case 'gallery-frames':
                createGalleryFramesEntrance();
                break;
            case 'chat-bubble':
                createChatBubbleEntrance();
                break;
        }
    }
    
    // Neural network entrance animation for Machine Megamind
    function createNeuralNetworkEntrance() {
        const container = document.querySelector('.floating-elements-container');
        if (!container) return;
        
        const neuralNet = document.createElement('div');
        neuralNet.className = 'neural-network-entrance';
        neuralNet.style.position = 'absolute';
        neuralNet.style.top = '0';
        neuralNet.style.left = '0';
        neuralNet.style.width = '100%';
        neuralNet.style.height = '100%';
        neuralNet.style.pointerEvents = 'none';
        neuralNet.style.zIndex = '0'; /* Contained within floating-elements-container's stacking context */
        container.appendChild(neuralNet);
        
        // ADDED: Track this animation
        activeRoomAnimations.add(neuralNet);
        
        const nodeCount = 20;
        const nodes = [];
        
        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
            const node = document.createElement('div');
            node.className = 'neural-node';
            node.style.position = 'absolute';
            node.style.width = '8px';
            node.style.height = '8px';
            node.style.borderRadius = '50%';
            node.style.backgroundColor = 'rgba(120, 219, 255, 0.7)';
            node.style.boxShadow = '0 0 10px rgba(120, 219, 255, 0.5)';
            
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            node.style.left = `${x}%`;
            node.style.top = `${y}%`;
            node.style.opacity = '0';
            node.style.transform = 'scale(0)';
            
            neuralNet.appendChild(node);
            nodes.push({element: node, x, y});
        }
        
        // Create connections
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (Math.random() > 0.7) continue;
                
                const connection = document.createElement('div');
                connection.className = 'neural-connection';
                connection.style.position = 'absolute';
                connection.style.backgroundColor = 'rgba(120, 219, 255, 0.2)';
                connection.style.zIndex = '0';
                
                const x1 = nodes[i].x;
                const y1 = nodes[i].y;
                const x2 = nodes[j].x;
                const y2 = nodes[j].y;
                
                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                
                connection.style.width = `${length}%`;
                connection.style.height = '1px';
                connection.style.left = `${x1}%`;
                connection.style.top = `${y1}%`;
                connection.style.transformOrigin = '0 0';
                connection.style.transform = `rotate(${angle}deg)`;
                connection.style.opacity = '0';
                
                neuralNet.appendChild(connection);
            }
        }
        
        // Animate with cancellation support
        const timeout1 = setTimeout(() => {
            if (!activeRoomAnimations.has(neuralNet)) return; // Check if cancelled
            
            const nodeElements = neuralNet.querySelectorAll('.neural-node');
            const connectionElements = neuralNet.querySelectorAll('.neural-connection');
            
            nodeElements.forEach((node, index) => {
                if (!activeRoomAnimations.has(neuralNet)) return; // Check if cancelled
                node.style.transition = `opacity 0.5s ease-in-out ${index * 50}ms, transform 0.5s ease-in-out ${index * 50}ms`;
                node.style.opacity = '1';
                node.style.transform = 'scale(1)';
            });
            
            connectionElements.forEach((connection, index) => {
                if (!activeRoomAnimations.has(neuralNet)) return; // Check if cancelled
                connection.style.transition = `opacity 0.8s ease-in-out ${index * 20 + 300}ms`;
                connection.style.opacity = '1';
            });
            
            const timeout2 = setTimeout(() => {
                if (!activeRoomAnimations.has(neuralNet)) return; // Check if cancelled
                neuralNet.style.transition = 'opacity 1s ease-in-out';
                neuralNet.style.opacity = '0';
                
                const timeout3 = setTimeout(() => {
                    if (neuralNet.parentNode) {
                        neuralNet.parentNode.removeChild(neuralNet);
                    }
                    activeRoomAnimations.delete(neuralNet);
                    roomAnimationTimeouts.delete('neural-network-cleanup');
                }, 1000);
                
                roomAnimationTimeouts.set('neural-network-cleanup', timeout3);
            }, 3000);
            
            roomAnimationTimeouts.set('neural-network-fade', timeout2);
        }, 500);
        
        roomAnimationTimeouts.set('neural-network-start', timeout1);
    }
    
    // Agent system entrance
    function createAgentSystemEntrance() {
        const container = document.querySelector('.floating-elements-container');
        if (!container) return;
        
        const agentSystem = document.createElement('div');
        agentSystem.style.position = 'absolute';
        agentSystem.style.top = '0';
        agentSystem.style.left = '0';
        agentSystem.style.width = '100%';
        agentSystem.style.height = '100%';
        agentSystem.style.pointerEvents = 'none';
        agentSystem.style.zIndex = '0'; /* Contained within floating-elements-container's stacking context */
        container.appendChild(agentSystem);
        
        // ADDED: Track this animation
        activeRoomAnimations.add(agentSystem);
        
        // Central agent
        const centralAgent = document.createElement('div');
        centralAgent.style.position = 'absolute';
        centralAgent.style.width = '80px';
        centralAgent.style.height = '80px';
        centralAgent.style.borderRadius = '50%';
        centralAgent.style.backgroundColor = 'rgba(255, 119, 198, 0.2)';
        centralAgent.style.border = '2px solid rgba(255, 119, 198, 0.4)';
        centralAgent.style.boxShadow = '0 0 30px rgba(255, 119, 198, 0.3)';
        centralAgent.style.top = '50%';
        centralAgent.style.left = '50%';
        centralAgent.style.transform = 'translate(-50%, -50%) scale(0)';
        centralAgent.style.opacity = '0';
        agentSystem.appendChild(centralAgent);
        
        // Satellite agents
        const agentCount = 6;
        const satellites = [];
        
        for (let i = 0; i < agentCount; i++) {
            const angle = (i / agentCount) * Math.PI * 2;
            const x = 50 + Math.cos(angle) * 30;
            const y = 50 + Math.sin(angle) * 30;
            
            const agent = document.createElement('div');
            agent.style.position = 'absolute';
            agent.style.width = '40px';
            agent.style.height = '40px';
            agent.style.borderRadius = '50%';
            agent.style.backgroundColor = 'rgba(120, 219, 255, 0.1)';
            agent.style.border = '1px solid rgba(120, 219, 255, 0.3)';
            agent.style.boxShadow = '0 0 15px rgba(120, 219, 255, 0.2)';
            agent.style.left = `${x}%`;
            agent.style.top = `${y}%`;
            agent.style.transform = 'translate(-50%, -50%) scale(0)';
            agent.style.opacity = '0';
            
            agentSystem.appendChild(agent);
            satellites.push(agent);
            
            // Connection line
            const connection = document.createElement('div');
            connection.style.position = 'absolute';
            connection.style.width = '150px';
            connection.style.height = '2px';
            connection.style.backgroundColor = 'rgba(120, 219, 255, 0.2)';
            connection.style.top = '50%';
            connection.style.left = '50%';
            connection.style.transformOrigin = '0 0';
            connection.style.transform = `translate(-50%, -50%) rotate(${angle}rad) scaleX(0)`;
            connection.style.opacity = '0';
            
            agentSystem.appendChild(connection);
        }
        
        // Animate with cancellation support
        const timeout1 = setTimeout(() => {
            if (!activeRoomAnimations.has(agentSystem)) return;
            
            centralAgent.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1s ease-in-out';
            centralAgent.style.transform = 'translate(-50%, -50%) scale(1)';
            centralAgent.style.opacity = '1';
            
            const connections = agentSystem.querySelectorAll('div:nth-child(n+3):nth-child(odd)');
            connections.forEach((connection, index) => {
                const timeout = setTimeout(() => {
                    if (!activeRoomAnimations.has(agentSystem)) return;
                    connection.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease-in-out';
                    connection.style.transform = `translate(-50%, -50%) rotate(${(index / agentCount) * Math.PI * 2}rad) scaleX(1)`;
                    connection.style.opacity = '1';
                }, 500 + index * 100);
                roomAnimationTimeouts.set(`agent-connection-${index}`, timeout);
            });
            
            satellites.forEach((satellite, index) => {
                const timeout = setTimeout(() => {
                    if (!activeRoomAnimations.has(agentSystem)) return;
                    satellite.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease-in-out';
                    satellite.style.transform = 'translate(-50%, -50%) scale(1)';
                    satellite.style.opacity = '1';
                }, 800 + index * 100);
                roomAnimationTimeouts.set(`agent-satellite-${index}`, timeout);
            });
            
            const timeout2 = setTimeout(() => {
                if (!activeRoomAnimations.has(agentSystem)) return;
                agentSystem.style.transition = 'opacity 1s ease-in-out';
                agentSystem.style.opacity = '0';
                
                const timeout3 = setTimeout(() => {
                    if (agentSystem.parentNode) {
                        agentSystem.parentNode.removeChild(agentSystem);
                    }
                    activeRoomAnimations.delete(agentSystem);
                }, 1000);
                
                roomAnimationTimeouts.set('agent-cleanup', timeout3);
            }, 3500);
            
            roomAnimationTimeouts.set('agent-fade', timeout2);
        }, 500);
        
        roomAnimationTimeouts.set('agent-start', timeout1);
    }
    
    // Data visualization entrance
    function createDataVisualizationEntrance() {
        const container = document.querySelector('.floating-elements-container');
        if (!container) return;
        
        const dataViz = document.createElement('div');
        dataViz.style.position = 'absolute';
        dataViz.style.top = '0';
        dataViz.style.left = '0';
        dataViz.style.width = '100%';
        dataViz.style.height = '100%';
        dataViz.style.pointerEvents = 'none';
        dataViz.style.zIndex = '0'; /* Contained within floating-elements-container's stacking context */
        container.appendChild(dataViz);
        
        // Create data bars
        const barCount = 12;
        const barWidth = 100 / barCount - 1;
        
        for (let i = 0; i < barCount; i++) {
            const height = 20 + Math.random() * 60;
            
            const bar = document.createElement('div');
            bar.style.position = 'absolute';
            bar.style.width = `${barWidth}%`;
            bar.style.height = `${height}%`;
            bar.style.bottom = '10%';
            bar.style.left = `${i * (barWidth + 1)}%`;
            bar.style.backgroundColor = 'rgba(120, 219, 255, 0.2)';
            bar.style.borderTop = '2px solid rgba(120, 219, 255, 0.5)';
            bar.style.borderRadius = '2px 2px 0 0';
            bar.style.transform = 'scaleY(0)';
            bar.style.opacity = '0';
            
            dataViz.appendChild(bar);
        }
        
        // Create data points
        const pointCount = 8;
        const points = [];
        
        for (let i = 0; i < pointCount; i++) {
            const x = 10 + (i / (pointCount - 1)) * 80;
            const y = 20 + Math.random() * 30;
            
            const point = document.createElement('div');
            point.style.position = 'absolute';
            point.style.width = '10px';
            point.style.height = '10px';
            point.style.borderRadius = '50%';
            point.style.backgroundColor = 'rgba(255, 119, 198, 0.7)';
            point.style.boxShadow = '0 0 10px rgba(255, 119, 198, 0.5)';
            point.style.left = `${x}%`;
            point.style.top = `${y}%`;
            point.style.transform = 'scale(0)';
            point.style.opacity = '0';
            
            dataViz.appendChild(point);
            points.push(point);
        }
        
        // Animate
        setTimeout(() => {
            const bars = dataViz.querySelectorAll('div:not(:nth-last-child(-n+8))');
            bars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1s ease-in-out';
                    bar.style.transform = 'scaleY(1)';
                    bar.style.opacity = '1';
                }, index * 50);
            });
            
            points.forEach((point, index) => {
                setTimeout(() => {
                    point.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-in-out';
                    point.style.transform = 'scale(1)';
                    point.style.opacity = '1';
                }, 600 + index * 100);
            });
            
            setTimeout(() => {
                dataViz.style.transition = 'opacity 1s ease-in-out';
                dataViz.style.opacity = '0';
                setTimeout(() => dataViz.remove(), 1000);
            }, 3500);
        }, 500);
    }
    
    // Time portal entrance
    function createTimePortalEntrance() {
        const container = document.querySelector('.floating-elements-container');
        if (!container) return;
        
        const timePortal = document.createElement('div');
        timePortal.style.position = 'absolute';
        timePortal.style.top = '0';
        timePortal.style.left = '0';
        timePortal.style.width = '100%';
        timePortal.style.height = '100%';
        timePortal.style.pointerEvents = 'none';
        timePortal.style.zIndex = '0'; /* Contained within floating-elements-container's stacking context */
        container.appendChild(timePortal);
        
        // Create concentric circles
        const circleCount = 5;
        
        for (let i = 0; i < circleCount; i++) {
            const circle = document.createElement('div');
            circle.style.position = 'absolute';
            circle.style.top = '50%';
            circle.style.left = '50%';
            circle.style.width = `${(i + 1) * 20}%`;
            circle.style.height = `${(i + 1) * 20}%`;
            circle.style.borderRadius = '50%';
            circle.style.border = '2px solid rgba(120, 219, 255, 0.3)';
            circle.style.transform = 'translate(-50%, -50%) scale(0)';
            circle.style.opacity = '0';
            
            timePortal.appendChild(circle);
        }
        
        // Create time particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = 'rgba(255, 119, 198, 0.7)';
            particle.style.boxShadow = '0 0 10px rgba(255, 119, 198, 0.5)';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 10 + Math.random() * 40;
            const x = 50 + Math.cos(angle) * distance;
            const y = 50 + Math.sin(angle) * distance;
            
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.opacity = '0';
            
            timePortal.appendChild(particle);
        }
        
        // Animate
        setTimeout(() => {
            const circles = timePortal.querySelectorAll('div:nth-child(-n+5)');
            circles.forEach((circle, index) => {
                setTimeout(() => {
                    circle.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1.2s ease-in-out';
                    circle.style.transform = 'translate(-50%, -50%) scale(1)';
                    circle.style.opacity = '1';
                }, index * 150);
            });
            
            const particles = timePortal.querySelectorAll('div:nth-child(n+6)');
            particles.forEach((particle) => {
                const delay = Math.random() * 1000 + 500;
                setTimeout(() => {
                    particle.style.transition = 'opacity 0.5s ease-in-out';
                    particle.style.opacity = '1';
                }, delay);
            });
            
            setTimeout(() => {
                timePortal.style.transition = 'opacity 1s ease-in-out';
                timePortal.style.opacity = '0';
                setTimeout(() => timePortal.remove(), 1000);
            }, 3500);
        }, 500);
    }
    
    // Signature text entrance
    function createSignatureTextEntrance() {
        const container = document.querySelector('.floating-elements-container');
        if (!container) return;
        
        const signatureText = document.createElement('div');
        signatureText.style.position = 'absolute';
        signatureText.style.top = '0';
        signatureText.style.left = '0';
        signatureText.style.width = '100%';
        signatureText.style.height = '100%';
        signatureText.style.display = 'flex';
        signatureText.style.justifyContent = 'center';
        signatureText.style.alignItems = 'center';
        signatureText.style.pointerEvents = 'none';
        signatureText.style.zIndex = '0'; /* Contained within floating-elements-container's stacking context */
        container.appendChild(signatureText);
        
        const text = document.createElement('div');
        text.style.fontSize = '4rem';
        text.style.fontWeight = '200';
        text.style.fontStyle = 'italic';
        text.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
        text.style.webkitBackgroundClip = 'text';
        text.style.webkitTextFillColor = 'transparent';
        text.style.backgroundClip = 'text';
        text.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
        text.style.opacity = '0';
        text.style.transform = 'scale(1.5)';
        text.textContent = 'THE BLONDE BOT';
        
        signatureText.appendChild(text);
        
        setTimeout(() => {
            text.style.transition = 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1.5s ease-in-out';
            text.style.transform = 'scale(1)';
            text.style.opacity = '1';
            
            setTimeout(() => {
                signatureText.style.transition = 'opacity 1s ease-in-out';
                signatureText.style.opacity = '0';
                setTimeout(() => signatureText.remove(), 1000);
            }, 2500);
        }, 500);
    }
    
    // Gallery frames entrance
    function createGalleryFramesEntrance() {
        const container = document.querySelector('.floating-elements-container');
        if (!container) return;
        
        const galleryFrames = document.createElement('div');
        galleryFrames.style.position = 'absolute';
        galleryFrames.style.top = '0';
        galleryFrames.style.left = '0';
        galleryFrames.style.width = '100%';
        galleryFrames.style.height = '100%';
        galleryFrames.style.pointerEvents = 'none';
        galleryFrames.style.zIndex = '0'; /* Contained within floating-elements-container's stacking context */
        container.appendChild(galleryFrames);
        
        const framePositions = [
            { left: '20%', top: '30%', width: '25%', height: '40%' },
            { left: '50%', top: '20%', width: '20%', height: '30%' },
            { left: '75%', top: '35%', width: '15%', height: '25%' },
            { left: '30%', top: '60%', width: '18%', height: '28%' },
            { left: '60%', top: '55%', width: '22%', height: '35%' }
        ];
        
        framePositions.forEach((pos, i) => {
            const frame = document.createElement('div');
            frame.style.position = 'absolute';
            frame.style.left = pos.left;
            frame.style.top = pos.top;
            frame.style.width = pos.width;
            frame.style.height = pos.height;
            frame.style.border = '2px solid rgba(255, 255, 255, 0.2)';
            frame.style.backgroundColor = 'rgba(20, 20, 25, 0.3)';
            frame.style.backdropFilter = 'blur(10px)';
            frame.style.borderRadius = '5px';
            frame.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            frame.style.transform = 'scale(0) rotate(5deg)';
            frame.style.opacity = '0';
            
            galleryFrames.appendChild(frame);
        });
        
        setTimeout(() => {
            const frames = galleryFrames.querySelectorAll('div');
            frames.forEach((frame, index) => {
                setTimeout(() => {
                    frame.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1s ease-in-out';
                    frame.style.transform = 'scale(1) rotate(0deg)';
                    frame.style.opacity = '1';
                }, index * 150);
            });
            
            setTimeout(() => {
                galleryFrames.style.transition = 'opacity 1s ease-in-out';
                galleryFrames.style.opacity = '0';
                setTimeout(() => galleryFrames.remove(), 1000);
            }, 3000);
        }, 500);
    }
    
    // Chat bubble entrance
    function createChatBubbleEntrance() {
        const container = document.querySelector('.floating-elements-container');
        if (!container) return;
        
        const chatBubble = document.createElement('div');
        chatBubble.style.position = 'absolute';
        chatBubble.style.top = '0';
        chatBubble.style.left = '0';
        chatBubble.style.width = '100%';
        chatBubble.style.height = '100%';
        chatBubble.style.display = 'flex';
        chatBubble.style.justifyContent = 'center';
        chatBubble.style.alignItems = 'center';
        chatBubble.style.pointerEvents = 'none';
        chatBubble.style.zIndex = '0'; /* Contained within floating-elements-container's stacking context */
        container.appendChild(chatBubble);
        
        const bubble = document.createElement('div');
        bubble.style.position = 'relative';
        bubble.style.width = '300px';
        bubble.style.padding = '25px';
        bubble.style.backgroundColor = 'rgba(40, 40, 45, 0.4)';
        bubble.style.backdropFilter = 'blur(15px)';
        bubble.style.borderRadius = '20px';
        bubble.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        bubble.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        bubble.style.transform = 'scale(0)';
        bubble.style.opacity = '0';
        
        const tail = document.createElement('div');
        tail.style.position = 'absolute';
        tail.style.bottom = '-15px';
        tail.style.left = '30px';
        tail.style.width = '30px';
        tail.style.height = '30px';
        tail.style.backgroundColor = 'rgba(40, 40, 45, 0.4)';
        tail.style.backdropFilter = 'blur(15px)';
        tail.style.borderRight = '1px solid rgba(255, 255, 255, 0.1)';
        tail.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        tail.style.transform = 'rotate(45deg)';
        bubble.appendChild(tail);
        
        const dotsContainer = document.createElement('div');
        dotsContainer.style.display = 'flex';
        dotsContainer.style.gap = '8px';
        dotsContainer.style.justifyContent = 'center';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.style.width = '10px';
            dot.style.height = '10px';
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            dotsContainer.appendChild(dot);
        }
        
        bubble.appendChild(dotsContainer);
        chatBubble.appendChild(bubble);
        
        setTimeout(() => {
            bubble.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease-in-out';
            bubble.style.transform = 'scale(1)';
            bubble.style.opacity = '1';
            
            const dots = dotsContainer.querySelectorAll('div');
            dots.forEach((dot, index) => {
                dot.style.animation = `typingDot 1s infinite ${index * 0.2}s`;
            });
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes typingDot {
                    0%, 100% { opacity: 0.3; transform: translateY(0); }
                    50% { opacity: 1; transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
            
            setTimeout(() => {
                chatBubble.style.transition = 'opacity 1s ease-in-out';
                chatBubble.style.opacity = '0';
                setTimeout(() => chatBubble.remove(), 1000);
            }, 3000);
        }, 500);
    }
    
    // ===== END ROOM ENTRANCE ANIMATION SYSTEM ===== //
    
    // Event listeners with performance optimizations
    
    // Keyboard navigation with debouncing
    let keyboardTimeout;
    document.addEventListener('keydown', function(e) {
        if (isTransitioning) return;
        
        clearTimeout(keyboardTimeout);
        keyboardTimeout = setTimeout(() => {
            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    nextRoom();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    prevRoom();
                    break;
            }
        }, 50);
    });
    
    // Optimized mouse wheel navigation
    let wheelTimeout;
    let lastWheelTime = 0;
    document.addEventListener('wheel', function(e) {
        if (isTransitioning) return;
        
        const now = performance.now();
        if (now - lastWheelTime < 150) return; // Prevent too frequent triggers
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (e.deltaY > 0) {
                nextRoom();
            } else {
                prevRoom();
            }
            lastWheelTime = now;
        }, 50);
    }, { passive: true });
    
    // Touch navigation with improved gesture detection
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = performance.now();
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (isTransitioning) return;
        
        const touchEndTime = performance.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        // Ignore very short or very long touches
        if (touchDuration < 50 || touchDuration > 1000) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchStartX - touchEndX;
        const deltaY = touchStartY - touchEndY;
        
        const minSwipeDistance = 75; // Increased for more deliberate gestures
        
        // Horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                nextRoom(); // Swipe left = next room
            } else {
                prevRoom(); // Swipe right = previous room
            }
        }
        // Vertical swipe
        else if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                nextRoom(); // Swipe up = next room
            } else {
                prevRoom(); // Swipe down = previous room
            }
        }
    }, { passive: true });
    
    // Navigation dots with performance optimization
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isTransitioning) {
                goToRoom(index);
            }
        });
    });
    
    // Navigation arrows
    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            if (!isTransitioning) {
                prevRoom();
            }
        });
    }
    
    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            if (!isTransitioning) {
                nextRoom();
            }
        });
    }
    
    // Initialize
    updateProgressBar();
    
    // ADDED: Trigger initial animation for entrance hall if needed
    setTimeout(() => {
        const currentRoomId = rooms[currentRoomIndex].id;
        const animationType = roomAnimationMap[currentRoomId];
        if (animationType) {
            applyRoomEntrance(animationType);
        }
    }, 1000);
    
    // Performance monitoring (optional - remove in production)
    if (window.performance && performance.mark) {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.duration > 16.67) { // Over 60fps threshold
                    console.warn(`Animation frame took ${entry.duration.toFixed(2)}ms`);
                }
            });
        });
        observer.observe({ entryTypes: ['measure'] });
    }
});