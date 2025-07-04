class NullismWorship {
    constructor() {
        this.worshipper = document.getElementById('worshipper');
        this.sacredZero = document.getElementById('sacredZero');
        this.globalCounter = document.getElementById('globalCounter');
        this.notification = document.getElementById('notification');
        this.orbitProgress = document.getElementById('orbitProgress');
        this.progressText = document.getElementById('progressText');
        
        // Orbit tracking
        this.orbitRadius = 150;
        this.centerX = 200;
        this.centerY = 200;
        this.currentAngle = 0;
        this.startAngle = 0;
        this.totalRotations = 0;
        this.isDragging = false;
        this.lastAngle = 0;
        this.orbitProgressValue = 0; // Track orbit progress (0 to 2π)
        this.completedOrbits = 0; // Track completed orbits
        
        // Local storage for user's orbit count
        this.userOrbitCount = parseInt(localStorage.getItem('userOrbitCount')) || 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGlobalCounter();
        this.positionWorshipper();
        this.updateUserOrbitDisplay();
        
        // Add some fun effects
        this.addSacredZeroEffects();
    }
    
    setupEventListeners() {
        // Mouse events
        this.worshipper.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // Touch events for mobile
        this.worshipper.addEventListener('touchstart', (e) => this.startDrag(e));
        document.addEventListener('touchmove', (e) => this.drag(e));
        document.addEventListener('touchend', () => this.endDrag());
        
        // Prevent context menu
        this.worshipper.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.worshipper.style.cursor = 'grabbing';
        
        // Store the initial mouse position relative to the figure
        const rect = this.worshipper.parentElement.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        this.dragOffsetX = clientX - rect.left - this.centerX;
        this.dragOffsetY = clientY - rect.top - this.centerY;
        
        // Calculate the angle from center to mouse position
        this.startAngle = Math.atan2(this.dragOffsetY, this.dragOffsetX);
        this.lastAngle = this.currentAngle;
    }
    
    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const rect = this.worshipper.parentElement.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        // Calculate the angle from center to current mouse position
        const x = clientX - rect.left - this.centerX;
        const y = clientY - rect.top - this.centerY;
        const newAngle = Math.atan2(y, x);
        
        // Calculate the angle change from the previous position
        let angleChange = newAngle - this.currentAngle;
        
        // Handle angle wrapping for smooth continuous rotation
        if (angleChange > Math.PI) {
            angleChange -= 2 * Math.PI;
        } else if (angleChange < -Math.PI) {
            angleChange += 2 * Math.PI;
        }
        
        // Update current angle for visual positioning
        this.currentAngle = newAngle;
        
        // Update orbit progress with the angle change
        this.orbitProgressValue += Math.abs(angleChange);
        
        // Handle orbit completion
        if (this.orbitProgressValue >= 2 * Math.PI) {
            this.completeOrbit();
            this.orbitProgressValue = 0; // Reset for next orbit
        }
        
        // Update progress indicator
        const progressPercent = (this.orbitProgressValue / (2 * Math.PI)) * 100;
        this.updateProgressIndicator(progressPercent);
        
        this.positionWorshipper();
    }
    
    endDrag() {
        this.isDragging = false;
        this.worshipper.style.cursor = 'grab';
    }
    
    positionWorshipper() {
        const x = this.centerX + this.orbitRadius * Math.cos(this.currentAngle);
        const y = this.centerY + this.orbitRadius * Math.sin(this.currentAngle);
        
        this.worshipper.style.left = `${x - 20}px`;
        this.worshipper.style.top = `${y - 20}px`;
    }
    
    checkOrbitCompletion() {
        // This is now handled directly in the drag method
    }
    
    updateProgressIndicator(progress) {
        if (this.orbitProgress && this.progressText) {
            this.orbitProgress.style.width = `${Math.min(progress, 100)}%`;
            this.progressText.textContent = `${Math.round(progress)}%`;
        }
    }
    
    async completeOrbit() {
        console.log('🎉 Orbit completed! Progress:', this.orbitProgressValue);
        
        this.totalRotations++;
        this.userOrbitCount++;
        
        // Update local storage
        localStorage.setItem('userOrbitCount', this.userOrbitCount.toString());
        
        // Update display
        this.updateUserOrbitDisplay();
        
        // Send to server
        try {
            const response = await fetch('/api/increment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.showNotification(data.message);
                this.loadGlobalCounter();
                console.log('✅ Global counter updated:', data.orbits);
            } else {
                console.error('❌ Failed to increment global counter');
            }
        } catch (error) {
            console.error('❌ Error communicating with server:', error);
        }
        
        // Add celebration effect
        this.celebrateOrbit();
    }
    
    celebrateOrbit() {
        // Add a celebration animation to the sacred zero
        this.sacredZero.style.animation = 'none';
        setTimeout(() => {
            this.sacredZero.style.animation = 'zeroGlow 0.5s ease-in-out';
        }, 10);
        
        // Add particle effect (simple CSS animation)
        this.addParticleEffect();
    }
    
    addParticleEffect() {
        const particles = document.createElement('div');
        particles.className = 'particles';
        particles.innerHTML = '✨✨✨✨✨';
        particles.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            animation: particleExplosion 1s ease-out forwards;
            pointer-events: none;
            z-index: 100;
        `;
        
        document.body.appendChild(particles);
        
        setTimeout(() => {
            document.body.removeChild(particles);
        }, 1000);
    }
    
    async loadGlobalCounter() {
        try {
            const response = await fetch('/api/counter');
            if (response.ok) {
                const data = await response.json();
                this.globalCounter.textContent = data.orbits.toLocaleString();
            }
        } catch (error) {
            console.error('Error loading global counter:', error);
        }
    }
    
    updateUserOrbitDisplay() {
        // This could be expanded to show user's personal orbit count
        // For now, we'll just store it in localStorage
    }
    
    showNotification(message) {
        this.notification.textContent = message;
        this.notification.classList.add('show');
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
    
    addSacredZeroEffects() {
        // Add some interactive effects to the sacred zero
        this.sacredZero.addEventListener('mouseenter', () => {
            this.sacredZero.style.transform = 'scale(1.1)';
        });
        
        this.sacredZero.addEventListener('mouseleave', () => {
            this.sacredZero.style.transform = 'scale(1)';
        });
        
        // Add click effect
        this.sacredZero.addEventListener('click', () => {
            this.showNotification('🙏 The Sacred Zero acknowledges your devotion');
        });
    }
}

// Add particle explosion animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes particleExplosion {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
        }
        50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.5);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2);
        }
    }
`;
document.head.appendChild(style);

// Initialize the worship experience
document.addEventListener('DOMContentLoaded', () => {
    new NullismWorship();
});

// Add some ambient effects
setInterval(() => {
    const zero = document.getElementById('sacredZero');
    if (zero && Math.random() < 0.1) {
        zero.style.animation = 'none';
        setTimeout(() => {
            zero.style.animation = 'zeroGlow 0.3s ease-in-out';
        }, 10);
    }
}, 5000); 