"use strict";

export const DOMAIN_ILLUSTRATIONS = {
    work: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 80L50 20L80 80H20Z" fill="var(--primary)" fill-opacity="0.1" stroke="var(--primary)" stroke-width="2"/>
        <path d="M45 40V60M55 40V60M40 50H60" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="50" cy="85" r="5" fill="var(--highlight)"/>
    </svg>`,
    rel: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 80C20 80 10 50 10 30C10 10 30 10 50 30C70 10 90 10 90 30C90 50 80 80 50 80Z" fill="var(--danger)" fill-opacity="0.1" stroke="var(--danger)" stroke-width="2"/>
        <circle cx="40" cy="40" r="5" fill="var(--danger)" fill-opacity="0.2"/>
        <circle cx="60" cy="45" r="5" fill="var(--danger)" fill-opacity="0.2"/>
    </svg>`,
    growth: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 90V40" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
        <path d="M50 40C30 40 20 60 50 70C80 60 70 40 50 40Z" fill="#10b981" fill-opacity="0.1" stroke="#10b981" stroke-width="2"/>
        <path d="M50 40C60 20 80 20 80 40" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
        <circle cx="50" cy="30" r="10" fill="var(--highlight)" fill-opacity="0.3"/>
    </svg>`,
    leisure: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 70H80L90 50H10L20 70Z" fill="#f59e0b" fill-opacity="0.1" stroke="#f59e0b" stroke-width="2"/>
        <path d="M50 70V20L80 50H50" fill="#f59e0b" fill-opacity="0.05" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="30" cy="30" r="5" fill="#f59e0b" fill-opacity="0.2"/>
    </svg>`
};

export function getDomainForValue(name) {
    const n = name.toLowerCase();
    const work = ["industria", "poder", "habilidad", "responsabilidad", "orden", "independencia", "conformidad", "contribución"];
    const rel = ["amor", "compasión", "intimidad", "romance", "perdón", "amabilidad", "cooperación", "asertividad", "conexión", "respeto", "confianza", "reciprocidad", "apoyo"];
    const growth = ["fitness", "mindfulness", "curiosidad", "coraje", "flexibilidad", "autoconciencia", "autocuidado", "autodesarrollo", "autocontrol", "desafío", "espiritualidad", "paciencia", "persistencia", "aceptación", "autenticidad", "belleza", "mente abierta"];
    const leisure = ["aventura", "humor", "diversión", "placer", "sensualidad", "sexualidad", "emoción", "libertad", "creatividad", "estímulo", "igualdad", "equidad", "justicia", "gratitud"];

    if (work.some(k => n.includes(k))) return "work";
    if (rel.some(k => n.includes(k))) return "rel";
    if (growth.some(k => n.includes(k))) return "growth";
    if (leisure.some(k => n.includes(k))) return "leisure";
    return "growth"; // Default
}
