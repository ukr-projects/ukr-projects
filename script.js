// Performance-optimized JavaScript

// Page loader
window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 1000);
});

// Optimized smooth scrolling with requestAnimationFrame
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const targetPosition = target.offsetTop - 80;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for scroll animations with enhanced performance
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Throttled scroll handler for navbar with RAF
let navbarTicking = false;
function updateNavbar() {
    const nav = document.querySelector('nav');
    const scrolled = window.pageYOffset;
    const scrollProgress = Math.min(scrolled / 100, 1); // Normalize to 0-1

    // Smooth interpolation
    const bgOpacity = 0.9 + (0.05 * scrollProgress);
    const glowIntensity = 0.3 + (0.3 * scrollProgress);

    nav.style.background = `rgba(10, 10, 15, ${bgOpacity})`;
    nav.style.boxShadow = `0 0 ${20 + (20 * scrollProgress)}px rgba(0, 255, 255, ${glowIntensity})`;
    nav.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    navbarTicking = false;
}

window.addEventListener('scroll', () => {
    if (!navbarTicking) {
        requestAnimationFrame(updateNavbar);
        navbarTicking = true;
    }
}, { passive: true });

// Enhanced parallax effect for floating icons (desktop only)
if (window.innerWidth > 768) {
    let parallaxTicking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const floatingIcons = document.querySelectorAll('.floating-icon');

        floatingIcons.forEach((icon, index) => {
            const speed = 0.1 + (index * 0.05); // Varied speeds
            const yPos = -(scrolled * speed);
            icon.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
        });
        parallaxTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            requestAnimationFrame(updateParallax);
            parallaxTicking = true;
            setTimeout(() => { parallaxTicking = false; }, 16); // ~60fps
        }
    });
}

// Cursor trail effect (desktop only)
if (window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0;
    let cursorTrail = [];

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function createCursorTrail() {
        const trail = document.createElement('div');
        trail.style.position = 'fixed';
        trail.style.left = mouseX + 'px';
        trail.style.top = mouseY + 'px';
        trail.style.width = '4px';
        trail.style.height = '4px';
        trail.style.background = 'var(--accent-neon)';
        trail.style.borderRadius = '50%';
        trail.style.pointerEvents = 'none';
        trail.style.zIndex = '9999';
        trail.style.opacity = '0.8';
        trail.className = 'gpu-accelerated';

        document.body.appendChild(trail);
        cursorTrail.push(trail);

        // Animate trail
        let opacity = 0.8;
        const fadeOut = setInterval(() => {
            opacity -= 0.1;
            trail.style.opacity = opacity;
            if (opacity <= 0) {
                clearInterval(fadeOut);
                document.body.removeChild(trail);
                cursorTrail = cursorTrail.filter(t => t !== trail);
            }
        }, 50);
    }

    // Throttled cursor trail
    let trailTicking = false;
    document.addEventListener('mousemove', () => {
        if (!trailTicking) {
            requestAnimationFrame(createCursorTrail);
            trailTicking = true;
            setTimeout(() => { trailTicking = false; }, 16); // ~60fps
        }
    });
}

// Enhanced domain card interactions
document.querySelectorAll('.domain-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        const icon = this.querySelector('.domain-icon i');
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(10deg)';
            icon.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    });

    card.addEventListener('mouseleave', function () {
        const icon = this.querySelector('.domain-icon i');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

// Tech tag hover effects
document.querySelectorAll('.tech-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.05) translateY(-2px)';
        this.style.boxShadow = '0 5px 15px rgba(0, 255, 255, 0.3)';
    });

    tag.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1) translateY(0)';
        this.style.boxShadow = 'none';
    });
});

// Preload critical animations
function preloadAnimations() {
    const testEl = document.createElement('div');
    testEl.style.transform = 'translateZ(0)';
    testEl.style.animation = 'none';
    document.body.appendChild(testEl);
    document.body.removeChild(testEl);
}

// Initialize performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Performance:', {
                loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
                domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime + 'ms'
            });
        }, 0);
    });
}

// Preload animations on page load
preloadAnimations();
