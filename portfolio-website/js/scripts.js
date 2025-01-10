document.addEventListener('DOMContentLoaded', () => {
    // Forzar scroll al inicio
    window.scrollTo(0, 0);

    const lenis = new Lenis({
        duration: 1.2,
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Parallax effect
    const sections = document.querySelectorAll('.section');
    lenis.on('scroll', () => {
        sections.forEach(section => {
            const speed = section.dataset.speed || 1;
            const yPos = -(window.pageYOffset * speed);
            section.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    });

    const observerOptions = {
        root: null,
        threshold: 0.5,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('hero')) {
                    document.body.classList.remove('transition-gray', 'transition-black');
                } else if (entry.target.classList.contains('section-gray')) {
                    document.body.classList.add('transition-gray');
                    document.body.classList.remove('transition-black');
                } else if (entry.target.classList.contains('section-black')) {
                    document.body.classList.add('transition-black');
                }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));

    if (window.innerWidth > 768) {
    sections.forEach(section => {
        const speed = section.dataset.speed || 1;
        const yPos = -(window.pageYOffset * speed);
        section.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
}

function initCodeBlock() {
    const pre = document.querySelector("pre");

    document.addEventListener("mousemove", (e) => {
        rotateElement(e, pre);
    });
}

function rotateElement(event, element) {
    const x = event.clientX;
    const y = event.clientY;
    const middleX = window.innerWidth / 2;
    const middleY = window.innerHeight / 2;
    const offsetX = ((x - middleX) / middleX) * 45;
    const offsetY = ((y - middleY) / middleY) * 45;

    element.style.setProperty("--rotateX", offsetX + "deg");
    element.style.setProperty("--rotateY", -1 * offsetY + "deg");
}

initCodeBlock();
});