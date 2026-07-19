"use strict";

const canvas = document.getElementById("galaxy-canvas");

if (canvas) {
    try {
        const ctx = canvas.getContext("2d");

        let width, height;
        let particles = [];

        // Config - Antigravity Theme
        const COUNT = 300;
        const MAGNET_RADIUS = 150;
        const RING_RADIUS = 100;
        const WAVE_SPEED = 0.4;
        const WAVE_AMPLITUDE = 10;
        const LERP_SPEED = 0.08;
        const PARTICLE_SIZE = 2;
        let particleColor = '#5B8C96';
        function updateParticleColor() {
            const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            if (primary) {
                particleColor = primary;
            }
        }
        const AUTO_ANIMATE = true;

        let mouseX = -1000, mouseY = -1000;
        let lastMouseMoveTime = Date.now();
        let virtualMouse = { x: 0, y: 0 };

        const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        let rafId = null;

        function initAntigravity() {
            resize();
            updateParticleColor();

            const themeObserver = new MutationObserver(() => {
                updateParticleColor();
            });
            themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

            window.addEventListener("resize", resize);
            window.addEventListener("mousemove", (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                lastMouseMoveTime = Date.now();
            });
            // Support touch
            window.addEventListener("touchmove", (e) => {
                if (e.touches[0]) {
                    mouseX = e.touches[0].clientX;
                    mouseY = e.touches[0].clientY;
                    lastMouseMoveTime = Date.now();
                }
            });

            createParticles();
            
            // Only start loop if not prefersReducedMotion
            if (!prefersReducedMotion) {
                rafId = requestAnimationFrame(animate);
            } else {
                // Render single static frame for reduced motion
                ctx.clearRect(0, 0, width, height);
                createParticles();
                particles.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.cx, p.cy, PARTICLE_SIZE, 0, Math.PI * 2);
                    ctx.fillStyle = particleColor;
                    ctx.globalAlpha = 0.15;
                    ctx.fill();
                });
            }

            // Pause the loop when the tab is hidden
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
                } else if (!prefersReducedMotion && rafId == null) {
                    rafId = requestAnimationFrame(animate);
                }
            });

            // IntersectionObserver to pause loop when off-screen
            if (typeof IntersectionObserver !== 'undefined') {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) {
                            if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
                        } else if (!prefersReducedMotion && rafId == null) {
                            rafId = requestAnimationFrame(animate);
                        }
                    });
                }, { threshold: 0.05 });
                observer.observe(canvas);
            }
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < COUNT; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                particles.push({
                    t: Math.random() * 100,
                    speed: 0.01 + Math.random() / 50,
                    mx: x,
                    my: y,
                    cx: x,
                    cy: y,
                    randomRadiusOffset: (Math.random() - 0.5) * 15
                });
            }
        }

        function animate() {
            rafId = null;
            ctx.clearRect(0, 0, width, height);

            let destX = mouseX;
            let destY = mouseY;

            // Auto-animate if idle
            if (AUTO_ANIMATE && Date.now() - lastMouseMoveTime > 2000) {
                const time = Date.now() * 0.001;
                destX = width / 2 + Math.sin(time * 0.5) * (width / 4);
                destY = height / 2 + Math.cos(time * 0.5 * 2) * (height / 4);
            }

            // Smooth virtual mouse
            virtualMouse.x += (destX - virtualMouse.x) * 0.05;
            virtualMouse.y += (destY - virtualMouse.y) * 0.05;

            particles.forEach(p => {
                p.t += p.speed;

                const dx = p.mx - virtualMouse.x;
                const dy = p.my - virtualMouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let targetX = p.mx;
                let targetY = p.my;

                if (dist < MAGNET_RADIUS) {
                    const angle = Math.atan2(dy, dx);
                    const wave = Math.sin(p.t * WAVE_SPEED + angle) * (WAVE_AMPLITUDE);
                    const currentRingRadius = RING_RADIUS + wave + p.randomRadiusOffset;

                    targetX = virtualMouse.x + currentRingRadius * Math.cos(angle);
                    targetY = virtualMouse.y + currentRingRadius * Math.sin(angle);
                }

                // Lerp to target
                p.cx += (targetX - p.cx) * LERP_SPEED;
                p.cy += (targetY - p.cy) * LERP_SPEED;

                // Draw
                const distToMouse = Math.sqrt(Math.pow(p.cx - virtualMouse.x, 2) + Math.pow(p.cy - virtualMouse.y, 2));
                const distFromRing = Math.abs(distToMouse - RING_RADIUS);
                let opacity = 0.1 + (1 - Math.min(distFromRing / 100, 1)) * 0.4;

                ctx.beginPath();
                ctx.arc(p.cx, p.cy, PARTICLE_SIZE, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.globalAlpha = Math.max(0, opacity);
                ctx.fill();
            });

            if (!prefersReducedMotion) rafId = requestAnimationFrame(animate);
        }

        initAntigravity();
    } catch (e) {
        console.error("Antigravity background failed initialization:", e);
    }
}
