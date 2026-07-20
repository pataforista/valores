"use strict";

export const LS = {
    values: "vv_myValues_v1",
    customValues: "vv_custom_values_v1",
    bullseye: "vv_bullseye_v1",
    bullseyeHistory: "vv_bullseye_history_v1",
    theme: "vv_theme_v1",
    actions: "vv_actions_v1",
    seenIntro: "vv_seenIntro_v1",
    seenInfoCard: "vv_seenInfo_v1",
    sound: "vv_sound_enabled",
    notificationConfig: "vv_notification_config_v1",
    lastBullseyeUpdate: "vv_last_bullseye_update_v1",
    achievements: "vv_achievements_v1",
    totalActionsDone: "vv_total_actions_done_v1",
    seenOnboarding: "vv_seen_onboarding_v1"
};

export const AREA_LABELS = {
    work: "Trabajo / Educación",
    rel: "Relaciones",
    growth: "Crecimiento / Salud",
    leisure: "Ocio / Tiempo libre"
};

export function safeJSONParse(text, fallback) {
    try {
        if (!text) return fallback;
        return JSON.parse(text);
    } catch {
        return fallback;
    }
}

let toastTimer = null;

export function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    const duration = Math.min(Math.max(1200, msg.length * 50), 4000);
    toastTimer = setTimeout(() => {
        el.classList.remove("show");
        toastTimer = null;
    }, duration);
}

export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function formatDateText(d) {
    if (!d) return "No definida";
    const parsed = new Date(d);
    // Si es una fecha válida y parece ser un formato ISO o numérico, la localizamos
    if (!isNaN(parsed) && (d.includes("-") || d.includes("/"))) {
        try {
            return parsed.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
        } catch {
            return d;
        }
    }
    // Si es un texto libre ("en dos semanas", "mañana"), lo devolvemos tal cual
    return d;
}

export function showPromptModal(title, defaultValue = "") {
    return new Promise((resolve) => {
        const modal = document.createElement("div");
        modal.className = "carousel-modal";
        modal.style.cssText = `
            display: flex;
            opacity: 1;
            pointer-events: auto;
            z-index: 9999;
        `;
        modal.innerHTML = `
            <div class="carousel-wrap" style="text-align: left; padding: 24px; max-width: 400px; width: 90%;">
                <h3 style="color: var(--primary); margin-top: 0; margin-bottom: 12px;">${title}</h3>
                <input type="text" id="promptInput" value="${defaultValue}" style="width: 100%; padding: 10px; margin-bottom: 16px; border: 1px solid var(--ring); border-radius: 8px; background: var(--bg); color: var(--text);" />
                <div class="inline-actions" style="display: flex; justify-content: flex-end; gap: 8px;">
                    <button class="btn" id="promptCancel">Cancelar</button>
                    <button class="btn primary" id="promptConfirm">Aceptar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const input = document.getElementById("promptInput");
        input.focus();
        input.select();

        const cleanup = (value) => {
            modal.remove();
            resolve(value);
        };

        document.getElementById("promptConfirm").addEventListener("click", () => {
            cleanup(input.value.trim());
        });

        document.getElementById("promptCancel").addEventListener("click", () => {
            cleanup(null);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                cleanup(input.value.trim());
            } else if (e.key === "Escape") {
                e.preventDefault();
                cleanup(null);
            }
        });
    });
}

export function showConfirmModal(title, text) {
    return new Promise((resolve) => {
        const modal = document.createElement("div");
        modal.className = "carousel-modal";
        modal.style.cssText = `
            display: flex;
            opacity: 1;
            pointer-events: auto;
            z-index: 9999;
        `;
        modal.innerHTML = `
            <div class="carousel-wrap" style="text-align: left; padding: 24px; max-width: 400px; width: 90%;">
                <h3 style="color: var(--primary); margin-top: 0; margin-bottom: 12px;">${title}</h3>
                <p style="margin-bottom: 20px; color: var(--muted); font-size: 0.95rem;">${text}</p>
                <div class="inline-actions" style="display: flex; justify-content: flex-end; gap: 8px;">
                    <button class="btn" id="confirmCancel">Cancelar</button>
                    <button class="btn danger" id="confirmOk">Eliminar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const cancelBtn = document.getElementById("confirmCancel");
        cancelBtn.focus();

        const cleanup = (value) => {
            modal.remove();
            resolve(value);
        };

        document.getElementById("confirmOk").addEventListener("click", () => {
            cleanup(true);
        });

        cancelBtn.addEventListener("click", () => {
            cleanup(false);
        });

        modal.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                cleanup(false);
            }
        });
    });
}


export function escapeHTML(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    }
    return Promise.resolve(false);
}

// Closes the modal on Escape and keeps Tab focus cycling within it.
export function attachModalKeyboard(modal, onClose) {
    if (!modal) return;
    modal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            onClose?.();
            return;
        }
        if (e.key !== "Tab") return;
        const focusables = Array.from(modal.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
}
