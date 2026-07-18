"use strict";

import { LS, safeJSONParse, toast } from './utils.js';

const ONBOARDING_STEPS = [
    {
        title: '🌲 Bienvenido a Valores del Valle',
        text: 'Esta brújula te ayudará a vivir una vida más alineada con lo que realmente te importa.\n\nBasada en ACT y DBT, te guiará paso a paso.',
        icon: '🧭',
    },
    {
        title: '1️⃣ Elige tus Valores',
        text: 'Los valores son direcciones, no metas. ¿Qué cualidades quieres cultivar?\n\nEjemplo: "Ser una persona compasiva" o "Vivir con autenticidad".\n\n👉 En la pestaña "Valores", explora el mazo y selecciona tus 10 valores principales.',
        icon: '🌱',
    },
    {
        title: '2️⃣ Ordena tu Top 10',
        text: 'Arrastra los valores para ordenarlos según su importancia para ti.\n\nEl primero será tu faro principal.',
        icon: '🏅',
    },
    {
        title: '3️⃣ Mide tu Diana',
        text: 'En "Diana", evalúa cómo estás viviendo esos valores en 4 áreas de tu vida.\n\n100 = muy cerca, 0 = muy lejos.\n\nEjemplo: si valoras la salud pero no haces ejercicio, pon 40 en "Crecimiento/Salud".',
        icon: '🎯',
    },
    {
        title: '4️⃣ Crea tu Sendero',
        text: 'En "Sendero", convierte tus valores en acciones concretas.\n\nEjemplo: "Llamar a mi hermana cada viernes" (valor: Conexión).\n\nIdentifica barreras y haz un plan para superarlas.',
        icon: '👣',
    },
    {
        title: '5️⃣ SOS para momentos difíciles',
        text: 'Cuando la emoción te desborde, usa las herramientas SOS:\n- Respiración cuadrada\n- Técnica 5-4-3-2-1\n- Anclaje de talones\n\nTe ayudarán a volver al presente.',
        icon: '🌊',
    },
    {
        title: '✨ ¡Ya estás listo!',
        text: 'Ahora puedes empezar tu viaje.\n\nRecuerda: los valores son un horizonte, no un destino.\n\n¡Cada pequeño paso cuenta!',
        icon: '🌟',
    },
];

let currentStep = 0;
let modal = null;
let track = null;
let dots = null;

/**
 * Muestra el onboarding modal.
 */
export function showOnboarding() {
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'onboardingModal';
    modal.className = 'carousel-modal';
    modal.style.cssText = `
        display: flex;
        opacity: 1;
        pointer-events: auto;
        z-index: 9999;
    `;
    modal.innerHTML = `
        <div class="carousel-wrap" style="max-height: 90vh; overflow-y: auto;">
            <div class="carousel-track" id="onboardingTrack"></div>
            <div class="carousel-dots" id="onboardingDots"></div>
            <div class="intro-controls" style="display: flex; gap: 8px; justify-content: center; margin-top: 16px;">
                <button class="btn" id="onboardingPrev">Anterior</button>
                <button class="btn primary" id="onboardingNext">Siguiente</button>
            </div>
            <button class="btn ghost" id="closeOnboarding" style="margin-top:10px; width:100%;">Cerrar</button>
        </div>
    `;
    document.body.appendChild(modal);

    track = document.getElementById('onboardingTrack');
    dots = document.getElementById('onboardingDots');

    // Renderizar slides
    track.innerHTML = ONBOARDING_STEPS.map(s => `
        <div class="intro-slide">
            <div style="font-size: 3rem;">${s.icon}</div>
            <h2>${s.title}</h2>
            <p style="white-space: pre-wrap;">${s.text}</p>
        </div>
    `).join('');

    dots.innerHTML = ONBOARDING_STEPS.map((_, i) => `
        <button class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>
    `).join('');

    currentStep = 0;
    updateSlide();

    const nextBtn = document.getElementById('onboardingNext');
    const prevBtn = document.getElementById('onboardingPrev');
    const closeBtn = document.getElementById('closeOnboarding');

    nextBtn.addEventListener('click', () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            currentStep++;
            updateSlide();
        } else {
            finishOnboarding();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateSlide();
        }
    });

    closeBtn.addEventListener('click', finishOnboarding);

    // Navegación por puntos
    dots.addEventListener('click', (e) => {
        const dot = e.target.closest('.dot');
        if (dot) {
            currentStep = parseInt(dot.dataset.index, 10);
            updateSlide();
        }
    });

    // Teclado
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') finishOnboarding();
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentStep < ONBOARDING_STEPS.length - 1) currentStep++;
            updateSlide();
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentStep > 0) currentStep--;
            updateSlide();
        }
    });

    // Enfocar el modal
    modal.focus();
}

function updateSlide() {
    if (!track || !dots) return;
    track.style.transform = `translateX(-${currentStep * 100}%)`;
    const dotButtons = dots.querySelectorAll('.dot');
    dotButtons.forEach((dot, i) => dot.classList.toggle('active', i === currentStep));
    const nextBtn = document.getElementById('onboardingNext');
    if (nextBtn) {
        nextBtn.textContent = currentStep === ONBOARDING_STEPS.length - 1 ? 'Comenzar' : 'Siguiente';
    }
    document.getElementById('onboardingPrev').disabled = currentStep === 0;
}

function finishOnboarding() {
    localStorage.setItem(LS.seenOnboarding, 'true');
    if (modal) {
        modal.remove();
        modal = null;
        track = null;
        dots = null;
    }
    toast('🚀 ¡Comienza tu viaje!');
}

/**
 * Inicializa el onboarding solo si no se ha visto antes.
 */
export function initOnboarding() {
    const seen = localStorage.getItem(LS.seenOnboarding) === 'true';
    if (!seen) {
        setTimeout(showOnboarding, 800);
    }
}
