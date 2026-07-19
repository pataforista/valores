"use strict";

import { LS, toast, safeJSONParse } from "./utils.js";
import { SoundFX, isSoundEnabled } from "./audio.js";

// Definición de logros
const ACHIEVEMENTS = [
    { id: "first_action", label: "Primer paso", desc: "Completaste tu primera acción comprometida.", icon: "👣" },
    { id: "five_actions", label: "Camino recorrido", desc: "Has completado 5 acciones.", icon: "🌟" },
    { id: "ten_actions", label: "Compromiso firme", desc: "Has completado 10 acciones.", icon: "🏆" },
    { id: "bullseye_first", label: "Primera diana", desc: "Guardaste tu primera evaluación de la diana.", icon: "🎯" },
    { id: "bullseye_week", label: "Constancia", desc: "Has actualizado la diana durante 2 semanas seguidas.", icon: "📅" },
    { id: "bullseye_100", label: "¡En el centro!", desc: "Alcanzaste el 100% de satisfacción en un área.", icon: "💯" },
];

let achieved = safeJSONParse(localStorage.getItem(LS.achievements), []);
let confettiActive = false;

/**
 * Comprueba si un logro ya ha sido desbloqueado.
 */
export function isAchieved(id) {
    return achieved.includes(id);
}

/**
 * Desbloquea un logro, muestra celebración y guarda.
 */
export function unlockAchievement(id) {
    if (achieved.includes(id)) return;
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;

    achieved.push(id);
    localStorage.setItem(LS.achievements, JSON.stringify(achieved));
    celebrate(ach);
}

/**
 * Muestra una celebración (confeti + toast + sonido).
 */
function celebrate(ach) {
    // Toast especial
    toast(`🎉 ¡Logro desbloqueado! ${ach.icon} ${ach.label}`);

    // Sonido de éxito
    if (isSoundEnabled()) SoundFX.success();

    // Lanzar confeti
    launchConfetti();

    // Mostrar notificación nativa si está disponible
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🎉 Logro desbloqueado", {
            body: `${ach.icon} ${ach.label}\n${ach.desc}`,
            icon: "./icons/icon-192.png",
        });
    }
}

/**
 * Lanza el confeti (simple con canvas o emojis).
 */
function launchConfetti() {
    if (confettiActive) return;
    confettiActive = true;

    const canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const particles = [];
    const colors = ["#f44336", "#e91e63", "#9c27b0", "#3f51b5", "#4caf50", "#ffeb3b", "#ff9800", "#ffffff"];
    const count = 150;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 8 + 4,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vy: Math.random() * 4 + 2,
            vx: (Math.random() - 0.5) * 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 6,
        });
    }

    let frame = 0;
    const maxFrames = 150;

    function draw() {
        if (frame >= maxFrames || !confettiActive) {
            canvas.remove();
            confettiActive = false;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            ctx.restore();
        });

        frame++;
        requestAnimationFrame(draw);
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();

    // Limpiar después de un tiempo
    setTimeout(() => {
        if (confettiActive) {
            canvas.remove();
            confettiActive = false;
        }
    }, 3000);
}

/**
 * Actualiza el contador de acciones completadas y verifica logros.
 */
export function updateAchievements(actions) {
    const done = actions.filter(a => a.done).length;

    if (done >= 1) unlockAchievement("first_action");
    if (done >= 5) unlockAchievement("five_actions");
    if (done >= 10) unlockAchievement("ten_actions");

    // Guardar conteo actual
    localStorage.setItem(LS.totalActionsDone, String(done));
}

/**
 * Inicializa el módulo de logros.
 */
export function initAchievements() {
    // Verificar logros al inicio
    const actions = safeJSONParse(localStorage.getItem(LS.actions), []);
    updateAchievements(actions);
}

/**
 * Devuelve la lista de logros con estado.
 */
export function getAchievementList() {
    return ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: achieved.includes(a.id),
    }));
}
