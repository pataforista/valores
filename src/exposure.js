"use strict";

import { getActiveValues } from "./values.js";
import { LS, safeJSONParse, toast, escapeHTML, showConfirmModal } from "./utils.js";
import { SoundFX, isSoundEnabled } from "./audio.js";
import { CompassAvatar } from "./avatar.js";
import { updateExposureAchievements } from "./achievements.js";
import { notifySaved } from "./offlineIndicator.js";

// Las metáforas se mantienen deliberadamente vívidas pero sin imágenes de
// sangre, tortura o amenaza de muerte: son un recordatorio de "no pelees
// con el malestar, sigue actuando hacia tus valores", no una inducción de
// pánico en una app de autoayuda sin supervisión clínica.
const METAPHORS = {
    monster: {
        text: "Imagina un monstruo enorme al otro lado de un abismo, sosteniendo el otro extremo de una cuerda atada a tu cintura. Cuanto más fuerte tiras para alejarte, más se acerca él y más se cansan tus brazos. Soltar la cuerda no lo hace desaparecer — sigue ahí, rugiendo — pero tus manos quedan libres para caminar hacia lo que te importa, con él todavía a la distancia.",
        reminders: [
            "Suelta la cuerda: no hace falta ganarle, solo dejar de tirar.",
            "El monstruo puede seguir rugiendo. Tus manos están libres para caminar.",
            "No estás eliminando el miedo. Estás eligiendo no pelearte con él.",
            "Sigue de largo hacia tu montaña, aunque él se quede rugiendo atrás."
        ]
    },
    bus: {
        text: "Eres quien conduce el autobús de tu vida. El miedo es un pasajero ruidoso que grita desde atrás que frenes, que des la vuelta, que no sigas. No puedes echarlo del autobús ni hacerlo callar. Pero el volante lo tienes tú: puedes seguir manejando hacia tu destino mientras él grita.",
        reminders: [
            "Deja que grite en el asiento de atrás. Tú sigues manejando.",
            "No necesitas que se calle para llegar a destino.",
            "El volante es tuyo. Su voz es solo ruido de fondo.",
            "Sigue conduciendo hacia lo que importa, pasajero y todo."
        ]
    }
};

let hierarchyItems = migrateHierarchyItems(safeJSONParse(localStorage.getItem(LS.exposureItems), []));
let logEntries = migrateLogEntries(safeJSONParse(localStorage.getItem(LS.exposureLog), []));

// Versiones anteriores puntuaban por malestar anticipado (SUDs, 0-10). El modelo
// ACT puntúa por interferencia con el valor (0-100): convertimos lo antiguo una
// sola vez para no perder el trabajo ya guardado por el usuario.
function migrateHierarchyItems(items) {
    let changed = false;
    const migrated = items.map(item => {
        if (item.interference !== undefined) return item;
        changed = true;
        return { ...item, interference: Math.round((item.sudsExpected ?? 5) * 10) };
    });
    if (changed) localStorage.setItem(LS.exposureItems, JSON.stringify(migrated));
    return migrated;
}

function migrateLogEntries(entries) {
    let changed = false;
    const migrated = entries.map(entry => {
        if (entry.interferenceBefore !== undefined) return entry;
        changed = true;
        return {
            ...entry,
            interferenceBefore: Math.round((entry.sudsBefore ?? 5) * 10),
            interferenceAfter: Math.round((entry.sudsAfter ?? entry.sudsBefore ?? 5) * 10),
            acceptance: null,
            presence: null,
            actionCompleted: null
        };
    });
    if (changed) localStorage.setItem(LS.exposureLog, JSON.stringify(migrated));
    return migrated;
}

let currentItem = null;
let startTime = null;
let elapsedTimerId = null;
let reminderTimerId = null;
let reminderIdx = 0;

export function initExposureModule() {
    const form = document.getElementById("exposureForm");
    if (!form) return;

    renderExposureValueOptions();
    renderHierarchyList();
    renderLogList();

    document.getElementById("toggleExposureGuide")?.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        const panel = document.getElementById("exposureGuidePanel");
        const isHidden = panel.style.display === "none" || !panel.style.display;
        panel.style.display = isHidden ? "block" : "none";
        btn.setAttribute("aria-expanded", String(isHidden));
    });

    const interferenceInput = document.getElementById("exposureInterference");
    interferenceInput?.addEventListener("input", () => {
        document.getElementById("exposureInterferenceNum").textContent = interferenceInput.value;
    });

    ["exposureAcceptance", "exposurePresence", "exposureInterferenceAfter"].forEach(id => {
        const input = document.getElementById(id);
        input?.addEventListener("input", () => {
            document.getElementById(`${id}Num`).textContent = input.value;
        });
    });

    document.getElementById("exposureWillingness")?.addEventListener("change", (e) => {
        const startBtn = document.getElementById("exposureStartBtn");
        if (startBtn) startBtn.disabled = !e.target.checked;
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const value = document.getElementById("exposureValue").value;
        const situation = document.getElementById("exposureSituation").value.trim();
        const interferenceVal = Number(interferenceInput.value);

        if (!value) {
            toast("Selecciona un valor priorizado");
            return;
        }
        if (!situation) {
            toast("Describe la situación evitada");
            return;
        }

        hierarchyItems.push({
            id: Date.now(),
            value,
            situation,
            interference: interferenceVal
        });
        localStorage.setItem(LS.exposureItems, JSON.stringify(hierarchyItems));

        document.getElementById("exposureSituation").value = "";
        interferenceInput.value = 50;
        document.getElementById("exposureInterferenceNum").textContent = "50";

        renderHierarchyList();
        toast("🪜 Agregado a tu jerarquía");
        notifySaved("🪜 Jerarquía actualizada");
    });

    const metaphorSelect = document.getElementById("exposureMetaphorSelect");
    const savedMetaphor = localStorage.getItem(LS.exposureMetaphor);
    if (savedMetaphor && METAPHORS[savedMetaphor]) metaphorSelect.value = savedMetaphor;
    updateMetaphorText();
    metaphorSelect?.addEventListener("change", () => {
        localStorage.setItem(LS.exposureMetaphor, metaphorSelect.value);
        updateMetaphorText();
    });

    document.getElementById("exposureGoToBreathing")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("tab-sos")?.click();
    });

    document.getElementById("exposureStartBtn")?.addEventListener("click", beginExposure);
    document.getElementById("exposureFinishBtn")?.addEventListener("click", finishDuringStage);
    document.getElementById("exposureSaveBtn")?.addEventListener("click", saveExposureLog);
    document.getElementById("exposureCancelBtn1")?.addEventListener("click", cancelPractice);
    document.getElementById("exposureCancelBtn2")?.addEventListener("click", cancelPractice);
}

function updateMetaphorText() {
    const metaphorSelect = document.getElementById("exposureMetaphorSelect");
    const textEl = document.getElementById("exposureMetaphorText");
    if (!metaphorSelect || !textEl) return;
    textEl.textContent = METAPHORS[metaphorSelect.value].text;
}

export function renderExposureValueOptions() {
    const select = document.getElementById("exposureValue");
    if (!select) return;
    select.innerHTML = "";
    const values = getActiveValues();
    if (values.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Primero elige valores en la pestaña Valores";
        select.appendChild(opt);
        return;
    }
    values.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.name;
        opt.textContent = v.name;
        select.appendChild(opt);
    });
}

function renderHierarchyList() {
    const list = document.getElementById("exposureHierarchyList");
    if (!list) return;
    list.innerHTML = "";

    const sorted = [...hierarchyItems].sort((a, b) => a.interference - b.interference);

    if (sorted.length === 0) {
        const li = document.createElement("li");
        li.className = "hint";
        li.textContent = "Todavía no agregaste ninguna situación. Empieza por una que te genere poco malestar.";
        list.appendChild(li);
        return;
    }

    sorted.forEach(item => {
        const li = document.createElement("li");
        li.className = "action-item";
        li.innerHTML = `
            <div style="flex:1">
                <strong>${escapeHTML(item.situation)}</strong>
                <p class="hint">${escapeHTML(item.value)} · interferencia con el valor <span class="score-badge">${item.interference}/100</span></p>
            </div>
            <button class="btn btn-sm primary practice-btn" type="button">Practicar</button>
            <button class="mini-btn remove-item" title="Eliminar de la jerarquía" aria-label="Eliminar de la jerarquía">🗑️</button>
        `;
        li.querySelector(".practice-btn").addEventListener("click", () => startPractice(item));
        li.querySelector(".remove-item").addEventListener("click", async () => {
            const ok = await showConfirmModal("¿Eliminar situación?", "¿Seguro que deseas quitar esta situación de tu jerarquía?");
            if (!ok) return;
            hierarchyItems = hierarchyItems.filter(i => i.id !== item.id);
            localStorage.setItem(LS.exposureItems, JSON.stringify(hierarchyItems));
            renderHierarchyList();
        });
        list.appendChild(li);
    });
}

function renderLogList() {
    const list = document.getElementById("exposureLogList");
    if (!list) return;
    list.innerHTML = "";

    if (logEntries.length === 0) {
        const li = document.createElement("li");
        li.className = "hint";
        li.textContent = "Todavía no registraste ninguna exposición practicada.";
        list.appendChild(li);
        return;
    }

    const actionLabels = { yes: "✅ acción completa", partial: "🔄 acción a medias", no: "⛔ se retiró" };

    [...logEntries].reverse().forEach(entry => {
        const li = document.createElement("li");
        li.className = "action-item";
        const dateText = new Date(entry.date).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
        const actionText = actionLabels[entry.actionCompleted] || "";
        const actMeasures = (entry.acceptance !== null && entry.acceptance !== undefined)
            ? `<br>aceptación <span class="score-badge">${entry.acceptance}/100</span> · presencia <span class="score-badge">${entry.presence}/100</span>${actionText ? ` · ${actionText}` : ""}`
            : "";
        li.innerHTML = `
            <div style="flex:1">
                <strong>${escapeHTML(entry.situation)}</strong>
                <p class="hint">${escapeHTML(entry.value)} · interferencia <span class="score-badge">${entry.interferenceBefore}→${entry.interferenceAfter}/100</span>${actMeasures}<br>
                📅 ${escapeHTML(dateText)}${entry.reflection ? `<br>💭 ${escapeHTML(entry.reflection)}` : ""}</p>
            </div>
            <button class="mini-btn remove-log" title="Eliminar registro" aria-label="Eliminar registro">🗑️</button>
        `;
        li.querySelector(".remove-log").addEventListener("click", async () => {
            const ok = await showConfirmModal("¿Eliminar registro?", "¿Seguro que deseas eliminar este registro de exposición?");
            if (!ok) return;
            logEntries = logEntries.filter(e => e.id !== entry.id);
            localStorage.setItem(LS.exposureLog, JSON.stringify(logEntries));
            renderLogList();
        });
        list.appendChild(li);
    });
}

function startPractice(item) {
    currentItem = item;
    const panel = document.getElementById("exposurePracticePanel");
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });

    document.getElementById("exposureItemSummary").textContent = `${item.situation} (${item.value})`;
    document.getElementById("exposureStageLabel").textContent = "Preparación";

    document.getElementById("exposurePrepStage").hidden = false;
    document.getElementById("exposureDuringStage").hidden = true;
    document.getElementById("exposureAfterStage").hidden = true;

    const willingness = document.getElementById("exposureWillingness");
    if (willingness) willingness.checked = false;
    const startBtn = document.getElementById("exposureStartBtn");
    if (startBtn) startBtn.disabled = true;

    updateMetaphorText();
    CompassAvatar.speak(`Vas a tu ritmo. No hace falta que el malestar baje a cero para acercarte a tu valor de ${item.value}.`, "neutral");
}

function beginExposure() {
    document.getElementById("exposureStageLabel").textContent = "En curso";
    document.getElementById("exposurePrepStage").hidden = true;
    document.getElementById("exposureDuringStage").hidden = false;

    startTime = Date.now();
    reminderIdx = 0;
    const metaphorKey = document.getElementById("exposureMetaphorSelect").value;
    const reminders = METAPHORS[metaphorKey].reminders;
    document.getElementById("exposureDuringReminder").textContent = reminders[0];

    updateElapsedDisplay();
    elapsedTimerId = setInterval(updateElapsedDisplay, 1000);
    reminderTimerId = setInterval(() => {
        reminderIdx = (reminderIdx + 1) % reminders.length;
        document.getElementById("exposureDuringReminder").textContent = reminders[reminderIdx];
    }, 8000);
}

function updateElapsedDisplay() {
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
    const ss = String(elapsedSec % 60).padStart(2, "0");
    const displayEl = document.getElementById("exposureTimerDisplay");
    if (displayEl) displayEl.textContent = `${mm}:${ss}`;
}

function stopPracticeTimers() {
    if (elapsedTimerId) { clearInterval(elapsedTimerId); elapsedTimerId = null; }
    if (reminderTimerId) { clearInterval(reminderTimerId); reminderTimerId = null; }
}

function finishDuringStage() {
    stopPracticeTimers();
    document.getElementById("exposureStageLabel").textContent = "Reflexión";
    document.getElementById("exposureDuringStage").hidden = true;
    document.getElementById("exposureAfterStage").hidden = false;

    const acceptance = document.getElementById("exposureAcceptance");
    const presence = document.getElementById("exposurePresence");
    const interferenceAfter = document.getElementById("exposureInterferenceAfter");
    acceptance.value = 50;
    document.getElementById("exposureAcceptanceNum").textContent = "50";
    presence.value = 50;
    document.getElementById("exposurePresenceNum").textContent = "50";
    document.getElementById("exposureActionCompleted").value = "yes";
    interferenceAfter.value = currentItem.interference;
    document.getElementById("exposureInterferenceAfterNum").textContent = interferenceAfter.value;
    document.getElementById("exposureReflection").value = "";
}

function cancelPractice() {
    stopPracticeTimers();
    currentItem = null;
    document.getElementById("exposurePracticePanel").hidden = true;
}

function saveExposureLog() {
    if (!currentItem) return;

    const entry = {
        id: Date.now(),
        itemId: currentItem.id,
        situation: currentItem.situation,
        value: currentItem.value,
        interferenceBefore: currentItem.interference,
        interferenceAfter: Number(document.getElementById("exposureInterferenceAfter").value),
        acceptance: Number(document.getElementById("exposureAcceptance").value),
        presence: Number(document.getElementById("exposurePresence").value),
        actionCompleted: document.getElementById("exposureActionCompleted").value,
        reflection: document.getElementById("exposureReflection").value.trim(),
        date: new Date().toISOString()
    };

    logEntries.push(entry);
    localStorage.setItem(LS.exposureLog, JSON.stringify(logEntries));
    updateExposureAchievements(logEntries);

    document.getElementById("exposurePracticePanel").hidden = true;
    const practicedItem = currentItem;
    currentItem = null;

    renderLogList();
    toast("🌉 Exposición registrada");
    notifySaved("🌉 Exposición registrada");
    if (isSoundEnabled()) SoundFX.success();
    CompassAvatar.speak("Actuaste según lo que te importa, con el malestar presente. Eso es lo que cuenta.", "happy");
    suggestNextStep(practicedItem);
}

function suggestNextStep(practicedItem) {
    const practicedIds = new Set(logEntries.map(e => e.itemId));
    const next = [...hierarchyItems]
        .filter(i => i.id !== practicedItem.id && !practicedIds.has(i.id))
        .sort((a, b) => a.interference - b.interference)[0];

    if (next) {
        setTimeout(() => {
            CompassAvatar.speak(`No se trata de que el miedo desaparezca, sino de seguir avanzando hacia tu valor. ¿Te comprometes a intentar "${next.situation}" en los próximos días?`, "neutral");
        }, 3500);
    }
}
