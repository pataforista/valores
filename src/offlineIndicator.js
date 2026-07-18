"use strict";

let indicatorElement = null;
let timeoutId = null;

/**
 * Crea el indicador visual (badge fijo).
 */
function createIndicator() {
    if (indicatorElement) return;
    indicatorElement = document.createElement('div');
    indicatorElement.id = 'offline-indicator';
    indicatorElement.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 20px;
        background: var(--card);
        border: 1px solid var(--ring);
        border-radius: 30px;
        padding: 6px 16px;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--muted);
        box-shadow: var(--shadow);
        z-index: 500;
        transition: opacity 0.3s, transform 0.3s;
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 6px;
    `;
    document.body.appendChild(indicatorElement);
}

/**
 * Muestra el indicador con un mensaje.
 */
function showIndicator(text) {
    if (!indicatorElement) createIndicator();
    if (!indicatorElement) return;
    indicatorElement.textContent = text;
    indicatorElement.style.opacity = '1';
    indicatorElement.style.transform = 'translateY(0)';
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        indicatorElement.style.opacity = '0';
        indicatorElement.style.transform = 'translateY(10px)';
    }, 3000);
}

/**
 * Notifica que los datos se han guardado.
 */
export function notifySaved(message = '✅ Datos guardados') {
    showIndicator(message);
}

/**
 * Inicializa el indicador y escucha eventos de guardado.
 */
export function initOfflineIndicator() {
    createIndicator();

    // Escuchar cambios en localStorage (solo para otras pestañas)
    window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('vv_')) {
            notifySaved('🔄 Datos sincronizados (otra pestaña)');
        }
    });

    setTimeout(() => {
        notifySaved('💾 Todo listo, trabajando offline');
    }, 500);
}
