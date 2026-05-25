"use strict";

export const LS = {
    values: "vv_myValues_v1",
    customValues: "vv_custom_values_v1",
    bullseye: "vv_bullseye_v1",
    theme: "vv_theme_v1",
    actions: "vv_actions_v1",
    seenIntro: "vv_seenIntro_v1",
    seenInfoCard: "vv_seenInfo_v1",
    sound: "vv_sound_enabled"
};

export function safeJSONParse(text, fallback) {
    try {
        if (!text) return fallback;
        return JSON.parse(text);
    } catch {
        return fallback;
    }
}

export function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1200);
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
