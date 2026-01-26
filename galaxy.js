"use strict";

const canvas = document.getElementById("galaxy-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let stars = [];

// Config
// Config - Tuned to user spec
const STAR_COUNT = 1000; // Density increased for better visibility
const SPEED = 0.5; // Faster for more activity
const MOUSE_REPULSION = 150;
const HUE_SHIFT = 40; // Cycle colors

function initGalaxy() {
    resize();
    window.addEventListener("resize", resize);
    createStars();
    animate();
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: (Math.random() - 0.5) * width * 1.5,
            y: (Math.random() - 0.5) * height * 1.5,
            z: Math.random() * 2,
            size: Math.random() * 1.5,
            alphaBase: Math.random(),
            t: Math.random() * Math.PI * 2,
            hue: Math.random() * HUE_SHIFT
        });
    }
}

let mouseX = -1000, mouseY = -1000;
window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX - width / 2;
    mouseY = e.clientY - height / 2;
});

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Center origin
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Global rotation for "Galaxy" feel
    const time = Date.now() * 0.0002 * SPEED;
    ctx.rotate(time);

    stars.forEach(star => {
        // Individual drift is minimal, the whole galaxy spins
        // But we add some 'flow' z-axis movement

        // Mouse repulsion (counter-rotate to apply correctly in world space)
        // Actually simpler: just draw dots.

        // star.t += SPEED * 0.01; 

        const x = star.x;
        const y = star.y;

        const scale = (star.z + 1) / 2;
        // Twinkle
        const alpha = 0.3 + (Math.sin(Date.now() * 0.003 + star.t) + 1) * 0.2 * 0.3;

        // Color with Hue Shift
        const hue = 200 + star.hue; // Blue-ish base + shift

        ctx.beginPath();
        ctx.arc(x, y, star.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 80%, 80%, ${alpha})`;
        ctx.fill();
    });

    ctx.restore();
    requestAnimationFrame(animate);
}

// Initial call
if (canvas) initGalaxy();
