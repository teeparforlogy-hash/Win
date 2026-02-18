/* ========================================
   وين لقيت؟ - Landing Page Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    initScrollAnimations();
    initCarousel();
    initCounterAnimation();
    initSmoothScroll();
});

/* === Particle Background === */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.1
        };
    }

    function init() {
        resize();
        particles = [];
        const count = Math.min(Math.floor(canvas.width * canvas.height / 15000), 80);
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(15, 191, 138, ${p.opacity})`;
            ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(15, 191, 138, ${0.05 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(drawParticles);
    }

    init();
    drawParticles();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            cancelAnimationFrame(animationId);
            init();
            drawParticles();
        }, 200);
    });
}

/* === Navbar === */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    // Scroll behavior
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Mobile toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    links.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
}

/* === Scroll Animations === */
function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* === Screenshot Carousel === */
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');

    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    let currentIndex = 0;
    let slidesPerView = getSlidesPerView();
    const totalPages = Math.ceil(slides.length / slidesPerView);

    function getSlidesPerView() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        const pages = Math.ceil(slides.length / slidesPerView);
        for (let i = 0; i < pages; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function goToSlide(index) {
        const pages = Math.ceil(slides.length / slidesPerView);
        currentIndex = Math.max(0, Math.min(index, pages - 1));
        const slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(track).gap);
        const offset = currentIndex * slidesPerView * slideWidth;
        // RTL: use positive transform
        track.style.transform = `translateX(${offset}px)`;
        updateDots();
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex - 1));

    createDots();

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swipe left (next in RTL)
                goToSlide(currentIndex + 1);
            } else {
                // Swipe right (prev in RTL)
                goToSlide(currentIndex - 1);
            }
        }
    }, { passive: true });

    // Resize handler
    window.addEventListener('resize', () => {
        slidesPerView = getSlidesPerView();
        createDots();
        goToSlide(0);
    });

    // Auto play
    let autoplayInterval = setInterval(() => {
        const pages = Math.ceil(slides.length / slidesPerView);
        if (currentIndex < pages - 1) {
            goToSlide(currentIndex + 1);
        } else {
            goToSlide(0);
        }
    }, 4000);

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    track.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(() => {
            const pages = Math.ceil(slides.length / slidesPerView);
            if (currentIndex < pages - 1) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(0);
            }
        }, 4000);
    });
}

/* === Counter Animation === */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString('ar-EG');
    }, 16);
}

/* === Smooth Scroll === */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}
