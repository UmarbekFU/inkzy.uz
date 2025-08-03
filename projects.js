document.addEventListener('DOMContentLoaded', () => {
    // Animate projects on scroll
    gsap.from('.project-card', {
        scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top bottom',
            end: 'center center',
            toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
    });

    // Header animations
    gsap.from('.projects-header', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    });

    // Hover animations for project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card.querySelectorAll('.project-link'), {
                y: -5,
                opacity: 1,
                duration: 0.3,
                stagger: 0.1,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card.querySelectorAll('.project-link'), {
                y: 0,
                opacity: 0.6,
                duration: 0.3,
                stagger: 0.1,
                ease: 'power2.out'
            });
        });
    });
}); 