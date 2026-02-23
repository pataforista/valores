"use strict";

import { LS, toast, safeJSONParse } from './utils.js';
import { valuesData, getActiveValues, setActiveValues } from './values.js';
import { initAudio, SoundFX, toggleSound, isSoundEnabled } from './audio.js';
import { initBullseye, refreshChart } from './bullseye.js';
import { CompassAvatar } from './avatar.js';
import { initValuesModule } from './ui_values.js';
import { initSosModule } from './sos.js';
import { initPathModule } from './ui_path.js';
import { runExport } from './export.js';

// DOM Elements
export const el = {
    cards: document.getElementById("cards-container"),
    list: document.getElementById("active-list"),
    counter: document.getElementById("counter"),
    toast: document.getElementById("toast"),
    tabValues: document.getElementById("tab-values"),
    tabBull: document.getElementById("tab-bullseye"),
    tabPath: document.getElementById("tab-path"),
    tabSos: document.getElementById("tab-sos"),
    viewValues: document.getElementById("view-values"),
    viewBull: document.getElementById("view-bullseye"),
    viewPath: document.getElementById("view-path"),
    viewSos: document.getElementById("view-sos"),
    themeBtn: document.getElementById("themeBtn"),
    soundBtn: document.getElementById("soundBtn"),
    exportBtn: document.getElementById("exportBtn"),
    manualSaveBtn: document.getElementById("manualSaveBtn"),
    resetBtn: document.getElementById("resetBtn"),

    // Bullseye inputs
    inWork: document.getElementById("input-work"),
    inRel: document.getElementById("input-rel"),
    inGrowth: document.getElementById("input-growth"),
    inLeisure: document.getElementById("input-leisure"),
    numWork: document.getElementById("num-work"),
    numRel: document.getElementById("num-rel"),
    numGrowth: document.getElementById("num-growth"),
    numLeisure: document.getElementById("num-leisure"),

    // SOS Elements
    sosOverlay: document.getElementById("sosOverlay"),
    sosModalTitle: document.getElementById("sosModalTitle"),
    sosIcon: document.getElementById("sosIcon"),
    sosIllustration: document.getElementById("sosIllustration"),
    sosProgressBar: document.getElementById("sosProgressBar"),
    sosNextBtn: document.getElementById("sosNextBtn"),
    sosBackBtn: document.getElementById("sosBackBtn"),
    sosCountdown: document.getElementById("sosCountdown"),
    sosCountdownValue: document.getElementById("sosCountdownValue"),
    sosTapArea: document.getElementById("sosTapArea"),
    breathToggle: document.getElementById("breathToggle"),
    breathTimer: document.getElementById("breathTimer"),
    breathPhase: document.getElementById("breathPhase"),
    breathSquare: document.getElementById("breathSquare"),

    // Path Elements
    actionForm: document.getElementById("actionForm"),
    actionDesc: document.getElementById("actionDesc"),
    actionValue: document.getElementById("actionValue"),
    actionArea: document.getElementById("actionArea"),
    actionDate: document.getElementById("actionDate"),
    internalBarrier: document.getElementById("internalBarrier"),
    mindfulnessSkill: document.getElementById("mindfulnessSkill"),
    internalList: document.getElementById("internalList"),
    externalBarrier: document.getElementById("externalBarrier"),
    externalPlan: document.getElementById("externalPlan"),
    externalList: document.getElementById("externalList"),
    actionsList: document.getElementById("actionsList")
};

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
    initTabs();
    initTheme();
    initAudio();
    initSoundToggle();
    await initBullseye();
    CompassAvatar.init();
    initValuesModule();
    initPathModule();
    initSosModule();
    initResetAll();
    initExport();
    initManualSave();
    initIntro();
    registerSW();
});

function initManualSave() {
    el.manualSaveBtn?.addEventListener("click", () => {
        toast("💾 Todo guardado localmente");
        if (isSoundEnabled()) SoundFX.approval();
    });
}

function initIntro() {
    const modal = document.getElementById("introModal");
    const closeBtn = document.getElementById("closeIntroBtn");
    const helpBtn = document.getElementById("helpBtn");

    const show = () => {
        modal.style.display = "flex";
        requestAnimationFrame(() => {
            modal.style.opacity = 1;
            modal.style.pointerEvents = "auto";
        });
    };

    const hide = () => {
        modal.style.opacity = 0;
        modal.style.pointerEvents = "none";
        setTimeout(() => modal.style.display = "none", 400);
        localStorage.setItem(LS.seenIntro, "true");
    };

    helpBtn?.addEventListener("click", show);
    closeBtn?.addEventListener("click", hide);

    const slides = [
        { t: "¡Bienvenido! 🌟", d: "Esta es tu brújula personal para vivir una vida con propósito basándonos en ACT y DBT." },
        { t: "Define tus Valores 🌲", d: "Elige lo que realmente te importa. Tus valores son direcciones, no metas." },
        { t: "La Diana 🎯", d: "Mide qué tan cerca estás de tus valores en las áreas clave de tu vida." },
        { t: "El Sendero 👣", d: "Convierte tus valores en pasos pequeños y acciones comprometidas." },
        { t: "Botón SOS 🌊", d: "Cuando las emociones te desborden, usa estas técnicas para volver al presente." }
    ];

    const track = document.getElementById("carouselTrack");
    const dots = document.getElementById("carouselDots");
    const nextBtn = document.getElementById("introNextBtn");
    const prevBtn = document.getElementById("introPrevBtn");
    let currentSlide = 0;

    const renderSlide = () => {
        if (!track || !dots) return;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        Array.from(dots.children).forEach((d, i) => d.classList.toggle("active", i === currentSlide));
        if (prevBtn) prevBtn.disabled = currentSlide === 0;
        if (nextBtn) {
            nextBtn.textContent = currentSlide === slides.length - 1 ? "Comenzar" : "Siguiente";
            nextBtn.setAttribute("aria-label", nextBtn.textContent);
        }
    };

    if (track) {
        track.innerHTML = slides.map(s => `
            <div class="intro-slide">
                <h2>${s.t}</h2>
                <p>${s.d}</p>
            </div>
        `).join("");
    }
    if (dots) {
        dots.innerHTML = slides.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join("");
    }

    if (localStorage.getItem(LS.seenIntro) !== "true") {
        setTimeout(show, 1000);
    }

    renderSlide();

    nextBtn?.addEventListener("click", () => {
        if (currentSlide >= slides.length - 1) {
            hide();
            return;
        }
        currentSlide++;
        renderSlide();
    });

    prevBtn?.addEventListener("click", () => {
        if (currentSlide === 0) return;
        currentSlide--;
        renderSlide();
    });

    // Dot navigation
    dots?.addEventListener("click", (e) => {
        if (e.target.classList.contains("dot")) {
            currentSlide = Array.from(dots.children).indexOf(e.target);
            renderSlide();
        }
    });
}

function registerSW() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js").catch(() => { });
    }
}

function initTabs() {
    const tabs = [el.tabValues, el.tabBull, el.tabPath, el.tabSos];
    const views = [el.viewValues, el.viewBull, el.viewPath, el.viewSos];

    tabs.forEach((tab, i) => {
        if (!tab) return;
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            views.forEach(v => v.classList.remove("active"));
            tab.classList.add("active");
            views[i].classList.add("active");

            // Premium transition using GSAP
            gsap.fromTo(views[i], { opacity: 0, y: 10 }, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => {
                    if (tab.id === 'tab-bullseye') refreshChart();
                }
            });
        });
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem(LS.theme);
    if (savedTheme === "dark") document.body.classList.add("dark-theme");

    el.themeBtn?.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-theme");
        localStorage.setItem(LS.theme, isDark ? "dark" : "light");
        el.themeBtn.textContent = isDark ? "☀️" : "🌙";
        if (isSoundEnabled()) SoundFX.click();
    });
}

function initSoundToggle() {
    const updateIcon = (enabled) => el.soundBtn.textContent = enabled ? "🔊" : "🔈";
    updateIcon(isSoundEnabled());

    el.soundBtn?.addEventListener("click", () => {
        const enabled = toggleSound();
        updateIcon(enabled);
        if (enabled) SoundFX.approval();
    });
}

function initResetAll() {
    el.resetBtn?.addEventListener("click", () => {
        if (confirm("¿Borrar todos los datos?")) {
            localStorage.clear();
            window.location.reload();
        }
    });
}

function initExport() {
    el.exportBtn?.addEventListener("click", runExport);
}

document.getElementById("closeSosOverlay")?.addEventListener("click", () => {
    // finishSos is in sos.js, we need to handle closing correctly if needed or export it
});
