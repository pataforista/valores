"use strict";

import { LS, toast, safeJSONParse, attachModalKeyboard } from './utils.js';
import { valuesData, getActiveValues, setActiveValues } from './values.js';
import { initAudio, SoundFX, toggleSound, isSoundEnabled } from './audio.js';
import { initBullseye, refreshChart } from './bullseye.js';
import { CompassAvatar } from './avatar.js';
import { initValuesModule } from './ui_values.js';
import { initSosModule, clearAllTimers } from './sos.js';
import { initPathModule } from './ui_path.js';
import { runExport } from './export.js';
import { initNotifications } from './notifications.js';
import { initAchievements } from './achievements.js';
import { initOfflineIndicator } from './offlineIndicator.js';
import { initOnboarding, showOnboarding } from './onboarding.js';
import { initGlossaryButton } from './glossary.js';

import { el } from './dom.js';

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
    initBackupSystem();
    initInstallPrompt();
    initIntro();
    initInfoCard();
    registerSW();

    initNotifications();
    initAchievements();
    initOfflineIndicator();
    initOnboarding();
    initGlossaryButton();
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

function initBackupSystem() {
    el.manualSaveBtn?.addEventListener("click", () => {
        const fullData = {
            values: safeJSONParse(localStorage.getItem(LS.values), []),
            customValues: safeJSONParse(localStorage.getItem(LS.customValues), []),
            bullseye: safeJSONParse(localStorage.getItem(LS.bullseye), {}),
            bullseyeHistory: safeJSONParse(localStorage.getItem(LS.bullseyeHistory), []),
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

    const restoreBtn = document.getElementById("restoreBackupBtn");
    const restoreInput = document.getElementById("restoreBackupInput");

    restoreBtn?.addEventListener("click", () => {
        restoreInput?.click();
    });

    function validateBackup(data) {
        if (!data || typeof data !== 'object') return false;

        let hasAnyValidKey = false;

        if (data.values !== undefined) {
            if (!Array.isArray(data.values)) return false;
            for (const v of data.values) {
                if (!v || typeof v.id !== 'number' || typeof v.name !== 'string') return false;
            }
            hasAnyValidKey = true;
        }

        if (data.customValues !== undefined) {
            if (!Array.isArray(data.customValues)) return false;
            for (const v of data.customValues) {
                if (!v || typeof v.id !== 'number' || typeof v.name !== 'string' || typeof v.def !== 'string') return false;
            }
            hasAnyValidKey = true;
        }

        if (data.bullseye !== undefined) {
            if (typeof data.bullseye !== 'object' || data.bullseye === null) return false;
            const keys = ['work', 'rel', 'growth', 'leisure'];
            for (const k of keys) {
                const val = data.bullseye[k];
                if (val !== undefined && (typeof val !== 'number' || val < 0 || val > 100)) return false;
            }
            hasAnyValidKey = true;
        }

        if (data.bullseyeHistory !== undefined) {
            if (!Array.isArray(data.bullseyeHistory)) return false;
            for (const h of data.bullseyeHistory) {
                if (!h || typeof h.date !== 'string' || typeof h.work !== 'number' || typeof h.rel !== 'number' || typeof h.growth !== 'number' || typeof h.leisure !== 'number') return false;
            }
            hasAnyValidKey = true;
        }

        if (data.actions !== undefined) {
            if (!Array.isArray(data.actions)) return false;
            for (const a of data.actions) {
                if (!a || typeof a.title !== 'string' || typeof a.area !== 'string' || typeof a.value !== 'string') return false;
            }
            hasAnyValidKey = true;
        }

        return hasAnyValidKey;
    }

    restoreInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (validateBackup(data)) {
                    if (data.values) localStorage.setItem(LS.values, JSON.stringify(data.values));
                    if (data.customValues) localStorage.setItem(LS.customValues, JSON.stringify(data.customValues));
                    if (data.bullseye) localStorage.setItem(LS.bullseye, JSON.stringify(data.bullseye));
                    if (data.bullseyeHistory) localStorage.setItem(LS.bullseyeHistory, JSON.stringify(data.bullseyeHistory));
                    if (data.actions) localStorage.setItem(LS.actions, JSON.stringify(data.actions));
                    if (data.theme) localStorage.setItem(LS.theme, data.theme);

                    toast("✅ Respaldo restaurado");
                    if (isSoundEnabled()) SoundFX.approval();
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    toast("❌ Formato inválido o dañado");
                }
            } catch (err) {
                console.error("Error parsing backup:", err);
                toast("❌ Archivo corrupto");
            }
        };
        reader.readAsText(file);
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
    const helpBtn = document.getElementById("helpBtn");
    helpBtn?.addEventListener("click", () => {
        showOnboarding();
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
                        showUpdateBanner(newWorker);
                    }
                });
            });
            // Check if there is already a waiting worker on page load
            if (reg.waiting && navigator.serviceWorker.controller) {
                showUpdateBanner(reg.waiting);
            }
        }).catch(() => { });

        // Listen for messages from the SW (e.g., activation of a new version)
        navigator.serviceWorker.addEventListener("message", (e) => {
            try {
                if (e.data && e.data.type === 'SW_UPDATED') {
                    toast('Nueva versión disponible — recargando...');
                    // If a waiting worker exists, request it to skip waiting (defensive)
                    if (navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                    }
                }
            } catch (err) { /* noop */ }
        });

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

    window.addEventListener("beforeunload", () => {
        clearAllTimers();
    });
}

function showUpdateBanner(worker) {
    let banner = document.getElementById("swUpdateBanner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "swUpdateBanner";
        banner.className = "sw-update-banner";
        document.body.appendChild(banner);
    }
    banner.innerHTML = `
        <div style="font-weight:bold; color:var(--text); font-size:0.9rem;">✨ ¡Nueva versión disponible!</div>
        <div class="hint" style="margin:0; font-size:0.8rem;">Se han aplicado mejoras para tu experiencia.</div>
        <button class="btn primary" id="swUpdateBtn" style="padding:8px 16px; font-size:0.85rem;">Actualizar y recargar</button>
    `;
    
    document.getElementById("swUpdateBtn")?.addEventListener("click", () => {
        worker.postMessage({ type: "SKIP_WAITING" });
        banner.remove();
    });
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

        if (views[i] && views[i].id !== 'view-sos') {
            clearAllTimers();
        }

        // Premium transition using GSAP
        if (views[i]) {
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            gsap.fromTo(views[i], { opacity: 0, y: reduced ? 0 : 10 }, {
                opacity: 1,
                y: 0,
                duration: reduced ? 0 : 0.4,
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
    const isDark = savedTheme === "dark";
    
    const updateThemeBtn = (dark) => {
        if (!el.themeBtn) return;
        el.themeBtn.textContent = dark ? "☀️" : "🌙";
        el.themeBtn.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
        el.themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    };

    if (isDark) {
        document.body.classList.add("dark-theme");
    }
    updateThemeBtn(isDark);

    el.themeBtn?.addEventListener("click", () => {
        const isDarkNow = document.body.classList.toggle("dark-theme");
        localStorage.setItem(LS.theme, isDarkNow ? "dark" : "light");
        updateThemeBtn(isDarkNow);
        if (isSoundEnabled()) SoundFX.click();
    });
}

function initSoundToggle() {
    const updateIcon = (enabled) => {
        if (!el.soundBtn) return;
        el.soundBtn.textContent = enabled ? "🔊" : "🔈";
        el.soundBtn.setAttribute("aria-label", enabled ? "Silenciar sonido" : "Activar sonido");
        el.soundBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
    };
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
