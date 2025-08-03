document.addEventListener('DOMContentLoaded', () => {
    // Animate FAQ items on scroll
    const faqItems = document.querySelectorAll('.faq-item');
    
    gsap.set(faqItems, { opacity: 0, y: 20 });

    faqItems.forEach((item, index) => {
        gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: item,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Add hover animation
    faqItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}); 