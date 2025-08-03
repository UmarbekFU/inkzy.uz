class ParallaxManager {
    constructor() {
        this.parallaxElements = [];
        this.scrollY = 0;
        this.requestId = null;
        
        // Bind methods
        this.onScroll = this.onScroll.bind(this);
        this.animate = this.animate.bind(this);
        
        // Initialize
        this.init();
    }
    
    init() {
        // Find all elements with data-parallax attribute
        document.querySelectorAll('[data-parallax]').forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.1;
            const direction = element.dataset.direction || 'vertical';
            const offset = element.dataset.offset || 0;
            
            this.parallaxElements.push({
                element,
                speed,
                direction,
                offset,
                initialY: element.getBoundingClientRect().top + window.pageYOffset
            });
        });
        
        // Add event listeners
        window.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.init.bind(this));
        
        // Start animation
        this.animate();
    }
    
    onScroll() {
        this.scrollY = window.pageYOffset;
    }
    
    animate() {
        this.parallaxElements.forEach(({ element, speed, direction, offset, initialY }) => {
            const rect = element.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (inView) {
                const relativeY = this.scrollY - initialY;
                let transform = '';
                
                if (direction === 'horizontal') {
                    transform = `translateX(${relativeY * speed + offset}px)`;
                } else {
                    transform = `translateY(${relativeY * speed + offset}px)`;
                }
                
                element.style.transform = transform;
                element.style.willChange = 'transform';
            }
        });
        
        this.requestId = requestAnimationFrame(this.animate);
    }
    
    destroy() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.init);
    }
} 
