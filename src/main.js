"use strict";

import { LS, toast, safeJSONParse, attachModalKeyboard } from './utils.js';
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
    ensureGsapFallback();
    initTabs();
    initTheme();
    initAudio();
    initSoundToggle();
    // La diana depende de Chart.js; si falla (p. ej. sin librería), no debe
    // impedir que se inicialice el resto de la app (sobre todo SOS).
    try {
        await initBullseye();
    } catch (err) {
        console.error("No se pudo inicializar la diana:", err);
    }
    CompassAvatar.init();
    initValuesModule();
    initPathModule();
    initSosModule();
    initResetAll();
    initExport();
    initManualSave();
    initInstallPrompt();
    initIntro();
    initInfoCard();
    registerSW();
});

// Si GSAP no llegó a cargar (red, bloqueo, etc.), define un sustituto sin
// animaciones para que las decenas de llamadas a `gsap.*` no lancen errores y
// la app siga siendo usable. Respeta los callbacks onStart/onComplete.
function ensureGsapFallback() {
    if (window.gsap) return;

    const fire = (vars) => {
        try { vars?.onStart?.(); } catch { /* noop */ }
        try { vars?.onComplete?.(); } catch { /* noop */ }
    };

    const api = {
        to: (_t, vars) => { fire(vars); return api; },
        from: (_t, vars) => { fire(vars); return api; },
        fromTo: (_t, _from, vars) => { fire(vars); return api; },
        set: () => api,
        killTweensOf: () => { },
        timeline: (vars) => {
            const t = { to: () => t, from: () => t, fromTo: () => t, set: () => t };
            fire(vars);
            return t;
        }
    };

    window.gsap = api;
}

function initInfoCard() {
    const modal = document.getElementById("appInfoModal");
    const showBtn = document.getElementById("showInfoModalBtn");
    const hideBtn = document.getElementById("hideInfoModalBtn");

    if (!modal) return;

    let infoOpener = null;

    const showModal = () => {
        infoOpener = document.activeElement;
        modal.style.display = "flex";
        requestAnimationFrame(() => {
            modal.style.opacity = 1;
            modal.style.pointerEvents = "auto";
            hideBtn?.focus();
        });
    };

    const hideModal = () => {
        modal.style.opacity = 0;
        modal.style.pointerEvents = "none";
        setTimeout(() => modal.style.display = "none", 400);
        localStorage.setItem(LS.seenInfoCard, "true");
        infoOpener?.focus?.();
    };

    if (localStorage.getItem(LS.seenInfoCard) !== "true") {
        setTimeout(showModal, 500);
    }

    showBtn?.addEventListener("click", showModal);
    hideBtn?.addEventListener("click", hideModal);
    attachModalKeyboard(modal, hideModal);

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
        if (e.target === modal) hideModal();
    });
}

function initManualSave() {
    el.manualSaveBtn?.addEventListener("click", () => {
        // Mejorar la capacidad de guardar: generar un respaldo JSON completo.
        const fullData = {
            values: safeJSONParse(localStorage.getItem(LS.values), []),
            customValues: safeJSONParse(localStorage.getItem(LS.customValues), []),
            bullseye: safeJSONParse(localStorage.getItem(LS.bullseye), {}),
            actions: safeJSONParse(localStorage.getItem(LS.actions), []),
            theme: localStorage.getItem(LS.theme) || "light"
        };

        const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Valores_Respaldo_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast("💾 Respaldo descargado");
        if (isSoundEnabled()) SoundFX.approval();
    });
}

function initInstallPrompt() {
    let deferredPrompt;
    const installBtn = document.getElementById("installPwaBtn");

    window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        if (installBtn) installBtn.style.display = "inline-flex";
    });

    installBtn?.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.style.display = "none";
        }
        deferredPrompt = null;
    });

    window.addEventListener("appinstalled", () => {
        if (installBtn) installBtn.style.display = "none";
        deferredPrompt = null;
        toast("App instalada con éxito 🎉");
    });
}

function initIntro() {
    const modal = document.getElementById("introModal");
    const closeBtn = document.getElementById("closeIntroBtn");
    const helpBtn = document.getElementById("helpBtn");

    let introOpener = null;

    const show = () => {
        introOpener = document.activeElement;
        modal.style.display = "flex";
        requestAnimationFrame(() => {
            modal.style.opacity = 1;
            modal.style.pointerEvents = "auto";
            (document.getElementById("introNextBtn") || closeBtn)?.focus();
        });
    };

    const hide = () => {
        modal.style.opacity = 0;
        modal.style.pointerEvents = "none";
        setTimeout(() => modal.style.display = "none", 400);
        localStorage.setItem(LS.seenIntro, "true");
        introOpener?.focus?.();
    };

    helpBtn?.addEventListener("click", show);
    closeBtn?.addEventListener("click", hide);
    attachModalKeyboard(modal, hide);

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
        navigator.serviceWorker.register("./sw.js").then((reg) => {
            reg.addEventListener("updatefound", () => {
                const newWorker = reg.installing;
                if (!newWorker) return;
                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                        // Forzar la actualización
                        newWorker.postMessage({ type: "SKIP_WAITING" });
                    }
                });
            });
        }).catch(() => { });

        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }

    // Offline / Online Status
    window.addEventListener("online", () => toast("Conexión recuperada 🟢"));
    window.addEventListener("offline", () => toast("Estás navegando sin conexión 🔴"));
}

function initTabs() {
    const tabs = [el.tabValues, el.tabBull, el.tabPath, el.tabSos];
    const views = [el.viewValues, el.viewBull, el.viewPath, el.viewSos];

    const activateTab = (i, setFocus = false) => {
        tabs.forEach((t, j) => {
            if (!t) return;
            const selected = j === i;
            t.classList.toggle("active", selected);
            t.setAttribute("aria-selected", selected ? "true" : "false");
            t.tabIndex = selected ? 0 : -1;
        });
        views.forEach((v, j) => v?.classList.toggle("active", j === i));
        if (setFocus) tabs[i]?.focus();

        // Premium transition using GSAP
        if (views[i]) {
            gsap.fromTo(views[i], { opacity: 0, y: 10 }, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => {
                    if (tabs[i]?.id === 'tab-bullseye') refreshChart();
                }
            });
        }
    };

    tabs.forEach((tab, i) => {
        if (!tab) return;
        tab.addEventListener("click", () => activateTab(i));
        tab.addEventListener("keydown", (e) => {
            let next = null;
            if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
            else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
            else if (e.key === "Home") next = 0;
            else if (e.key === "End") next = tabs.length - 1;
            if (next === null) return;
            e.preventDefault();
            activateTab(next, true);
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
    const deleteModal = document.getElementById("deleteModal");
    const cancelBtn = document.getElementById("cancelDeleteBtn");
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const timerEl = document.getElementById("deleteTimer");

    let countdownTimer = null;
    let deleteOpener = null;

    el.resetBtn?.addEventListener("click", () => {
        if (!deleteModal) {
            // Fallback if modal not found
            if (confirm("¿Borrar todos los datos?")) {
                localStorage.clear();
                window.location.reload();
            }
            return;
        }
        // Show modal
        deleteOpener = document.activeElement;
        deleteModal.style.display = "flex";
        requestAnimationFrame(() => {
            deleteModal.style.opacity = 1;
            deleteModal.style.pointerEvents = "auto";
            cancelBtn?.focus();
        });
        // Countdown
        confirmBtn.disabled = true;
        let count = 3;
        if (timerEl) timerEl.textContent = count;
        if (countdownTimer) clearInterval(countdownTimer);
        countdownTimer = setInterval(() => {
            count--;
            if (timerEl) timerEl.textContent = count;
            if (count <= 0) {
                clearInterval(countdownTimer);
                countdownTimer = null;
                confirmBtn.disabled = false;
            }
        }, 1000);
    });

    const hideDeleteModal = () => {
        if (!deleteModal) return;
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
        deleteModal.style.opacity = 0;
        deleteModal.style.pointerEvents = "none";
        setTimeout(() => deleteModal.style.display = "none", 400);
        deleteOpener?.focus?.();
    };

    cancelBtn?.addEventListener("click", hideDeleteModal);
    attachModalKeyboard(deleteModal, hideDeleteModal);

    confirmBtn?.addEventListener("click", () => {
        localStorage.clear();
        window.location.reload();
    });

    // Close on backdrop click
    deleteModal?.addEventListener("click", (e) => {
        if (e.target === deleteModal) hideDeleteModal();
    });
}

function initExport() {
    el.exportBtn?.addEventListener("click", runExport);
}
