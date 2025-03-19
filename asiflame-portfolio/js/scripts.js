document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    const lenis = new Lenis({
        duration: 1.0,
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1.0,
        lerp: 0.1,
        touchMultiplier: 1.5,
        infinite: false
    });
    lenis.scrollTo(0, { immediate: true });
    lenis.stop();
    setTimeout(() => lenis.start(), 100);
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Particle Animation (White, Full Screen, Avoiding Title/Subtitle)
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        const numberOfParticles = 50; // Back to a sparse but full-screen count

        // Set canvas size and adjust on resize
        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Define exclusion zone based on hero-text (title + subtitle)
        const heroText = document.querySelector('.hero-text');
        let exclusionZone = {};
        function updateExclusionZone() {
            const rect = heroText.getBoundingClientRect();
            exclusionZone = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height * 0.6 // Focus on title + subtitle, not full padding
            };
        }
        updateExclusionZone();
        window.addEventListener('resize', updateExclusionZone);

        // Particle class with glow pulse
        class Particle {
            constructor() {
                this.spawnOutsideExclusionZone();
                this.baseSize = Math.random() * 2 + 1; // Base size 1–3px
                this.size = this.baseSize;
                this.speedX = Math.random() * 0.4 - 0.2; // Slow drift
                this.speedY = Math.random() * 0.4 - 0.2;
                this.pulseSpeed = Math.random() * 0.05 + 0.02; // Pulse rate
            }
            spawnOutsideExclusionZone() {
                do {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                } while (this.isInExclusionZone());
            }
            isInExclusionZone() {
                return (
                    this.x > exclusionZone.x &&
                    this.x < exclusionZone.x + exclusionZone.width &&
                    this.y > exclusionZone.y &&
                    this.y < exclusionZone.y + exclusionZone.height
                );
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                // Pulse size for glow effect
                this.size = this.baseSize + Math.sin(Date.now() * this.pulseSpeed) * 0.5;

                // Respawn if entering exclusion zone
                if (this.isInExclusionZone()) {
                    this.spawnOutsideExclusionZone();
                }
                // Loop particles when they leave the screen
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 10; // Glow effect
                ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0; // Reset to avoid affecting other drawings
            }
        }

        // Initialize particles
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }

        // Animation function
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles); // Runs indefinitely
        }

        // Start animation
        animateParticles();
    }

    // Existing Parallax and Background Transition
    const parallaxSections = document.querySelectorAll('.section[data-parallax="true"]');
    function updateParallaxAndBackground() {
        const scrollY = lenis.scroll;
        const heroSection = document.querySelector('.hero');
        const blackSection = document.querySelector('.section-black');
        const heroRect = heroSection.getBoundingClientRect();
        const blackRect = blackSection.getBoundingClientRect();
        const bodyStyle = document.body.style;

        parallaxSections.forEach(section => {
            const speed = parseFloat(section.dataset.speed) || 0.8;
            const rect = section.getBoundingClientRect();
            const offsetTop = rect.top + scrollY;
            const yPos = -(scrollY - offsetTop) * speed;
            section.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });

        const blackTop = blackRect.top + scrollY;
        if (scrollY < blackTop) {
            bodyStyle.background = '#060311';
        } else {
            bodyStyle.background = '#121212';
        }
    }

    lenis.on('scroll', updateParallaxAndBackground);
    updateParallaxAndBackground();

    // Fade-In Observer
    const fadeItems = document.querySelectorAll('.project-card, .bento-item, .language-item');
    const observerOptions = { root: null, threshold: [0.2, 0.5], rootMargin: "0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    fadeItems.forEach(item => observer.observe(item));

    // Debounce Function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 3D CV Card Drag Rotation
    const cvCard = document.getElementById('cvCard');
    if (cvCard) {
        let isDragging = false;
        let previousX, previousY;
        let rotateX = 0, rotateY = 0;

        cvCard.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousX = e.clientX;
            previousY = e.clientY;
            cvCard.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - previousX;
            const deltaY = e.clientY - previousY;
            rotateY += deltaX * 0.5;
            rotateX -= deltaY * 0.5;
            cvCard.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
            previousX = e.clientX;
            previousY = e.clientY;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            cvCard.style.cursor = 'grab';
        });

        const cvObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    rotateX = 0;
                    rotateY = 0;
                    cvCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
                }
            });
        }, { threshold: 0.1 });
        cvObserver.observe(cvCard);
    }
});