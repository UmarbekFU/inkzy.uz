document.addEventListener('DOMContentLoaded', () => {
    // Timer countdown animation
    const timer = document.querySelector('.timer');
    gsap.to(timer, {
        innerHTML: 0,
        duration: 60,
        snap: { innerHTML: 1 }
    });

    // Initial animations
    gsap.from('.about-header', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    // Cards stagger animation
    gsap.from('.about-card', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.5
    });

    // Tags animation
    gsap.from('.tag', {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'back.out(1.7)',
        delay: 1
    });

    // Quote animation
    gsap.from('blockquote', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 1.5
    });
}); 