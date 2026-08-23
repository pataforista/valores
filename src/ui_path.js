"use strict";

import { el } from "./dom.js";
import { getActiveValues } from "./values.js";
import { LS, safeJSONParse, toast, escapeHTML, copyToClipboard, AREA_LABELS, formatDateText } from "./utils.js";
import { SoundFX, isSoundEnabled } from "./audio.js";
import { CompassAvatar } from "./avatar.js";
import { updateAchievements } from "./achievements.js";
import { notifySaved } from "./offlineIndicator.js";

let committedActions = safeJSONParse(localStorage.getItem(LS.actions), []);
let internalBarriers = [];
let externalBarriers = [];
let pendingAction = null;

export function getCommittedActions() { return committedActions; }

export function initPathModule() {
    if (!el.actionForm) return;

    renderActionValueOptions();
    renderActionsList();
    updateAchievements(committedActions);

    // Suggest Skill Logic
    document.getElementById("suggestSkillBtn")?.addEventListener("click", () => {
        const val = el.internalBarrier.value;
        if (!val.trim()) {
            toast("Escribe una barrera primero");
            return;
        }
        const suggested = suggestMindfulnessSkill(val);
        if (suggested) {
            el.mindfulnessSkill.value = suggested;
            document.getElementById("mindfulnessHint").textContent = `💡 Sugerencia: ${suggested}.`;
            CompassAvatar.speak(`Creo que "${suggested}" te ayudaría con eso.`, "happy");
        }
    });

    document.getElementById("addInternalBarrier")?.addEventListener("click", () => {
        const text = (el.internalBarrier.value || "").trim();
        if (!text) return;
        const skill = el.mindfulnessSkill.value;
        internalBarriers.push({ text, skill });
        el.internalBarrier.value = "";
        renderInternalBarriers();
    });

    document.getElementById("addExternalBarrier")?.addEventListener("click", () => {
        const text = (el.externalBarrier.value || "").trim();
        const plan = (el.externalPlan.value || "").trim();
        if (!text || !plan) return;
        externalBarriers.push({ text, plan });
        el.externalBarrier.value = "";
        el.externalPlan.value = "";
        renderExternalBarriers();
    });

    document.getElementById("declareCommitment")?.addEventListener("click", declareCommitment);
    document.getElementById("shareCommitment")?.addEventListener("click", shareCommitment);
    
    document.getElementById("discardCommitment")?.addEventListener("click", () => {
        pendingAction = null;
        localStorage.removeItem("vv_pending_action_v1");
        const panel = document.getElementById("commitmentPanel");
        if (panel) panel.hidden = true;
        
        el.actionForm.reset();
        internalBarriers = [];
        externalBarriers = [];
        renderInternalBarriers();
        renderExternalBarriers();
        toast("Compromiso descartado");
    });

    el.actionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const action = {
            title: el.actionDesc.value.trim(),
            value: el.actionValue.value,
            area: el.actionArea.value,
            date: el.actionDate.value,
            internal: [...internalBarriers],
            external: [...externalBarriers],
            done: false,
            id: Date.now()
        };

        if (!action.title) {
            toast("Describe la acción");
            return;
        }

        if (!action.value) {
            toast("Selecciona un valor priorizado");
            return;
        }

        if (!action.date) {
            toast("Selecciona una fecha y hora válidas");
            return;
        }

        const inputDate = new Date(action.date);
        if (isNaN(inputDate.getTime())) {
            toast("Selecciona una fecha y hora válidas");
            return;
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (inputDate < startOfToday) {
            toast("⚠️ Nota: Fecha en el pasado (retrospectiva)");
        } else if (inputDate < now) {
            toast("⚠️ Nota: La hora ya ha pasado para hoy");
        }

        const smartSpecific = document.getElementById("smartSpecific")?.checked;
        const smartMeaningful = document.getElementById("smartMeaningful")?.checked;
        const smartAdaptive = document.getElementById("smartAdaptive")?.checked;
        const smartTimebound = document.getElementById("smartTimebound")?.checked;
        const hasResource = ["resTime", "resMoney", "resSkills"].some(id => document.getElementById(id)?.checked);
        const smartError = document.getElementById("smartError");

        if (!smartSpecific || !smartMeaningful || !smartAdaptive || !smartTimebound || !hasResource) {
            if (smartError) {
                smartError.hidden = false;
                smartError.textContent = "Completa todos los parámetros SMART (S, M, A, T y al menos un recurso R).";
            }
            return;
        }
        if (smartError) smartError.hidden = true;

        pendingAction = action;
        localStorage.setItem("vv_pending_action_v1", JSON.stringify(pendingAction));
        showCommitmentPanel(action);
        toast("Revisa y declara tu compromiso");
    });

    // Restore pendingAction from localStorage
    const savedPending = safeJSONParse(localStorage.getItem("vv_pending_action_v1"), null);
    if (savedPending) {
        const active = getActiveValues();
        const valueExists = active.some(v => v.name === savedPending.value);
        if (valueExists) {
            pendingAction = savedPending;
            internalBarriers = pendingAction.internal || [];
            externalBarriers = pendingAction.external || [];
            renderInternalBarriers();
            renderExternalBarriers();
            showCommitmentPanel(pendingAction);
        } else {
            localStorage.removeItem("vv_pending_action_v1");
        }
    }
}

export function renderActionValueOptions() {
    const select = el.actionValue;
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

function showCommitmentPanel(action) {
    const panel = document.getElementById("commitmentPanel");
    const summary = document.getElementById("commitmentSummary");
    const status = document.getElementById("commitmentStatus");
    if (!panel || !summary || !status) return;

    const areaText = AREA_LABELS[action.area] || action.area;
    const dateText = formatDateText(action.date);
    summary.textContent = `Acción: ${action.title} — Valor: ${action.value} — Área: ${areaText} — Fecha: ${dateText}`;
    status.textContent = "Pendiente";
    panel.hidden = false;
}

function declareCommitment() {
    if (!pendingAction) {
        toast("Primero prepara una acción");
        return;
    }

    committedActions.push(pendingAction);
    localStorage.setItem(LS.actions, JSON.stringify(committedActions));
    localStorage.removeItem("vv_pending_action_v1");
    renderActionsList();
    updateAchievements(committedActions);
    notifySaved("👣 Compromiso guardado");

    el.actionForm.reset();
    internalBarriers = [];
    externalBarriers = [];
    renderInternalBarriers();
    renderExternalBarriers();

    const status = document.getElementById("commitmentStatus");
    if (status) status.textContent = "Declarado";

    pendingAction = null;
    toast("👣 Acción comprometida");
    if (isSoundEnabled()) SoundFX.success();
    CompassAvatar.speak("¡Un paso más en tu sendero!", "happy");
}

function shareCommitment() {
    const summary = document.getElementById("commitmentSummary")?.textContent;
    if (!summary) {
        toast("No hay compromiso para compartir");
        return;
    }
    if (navigator.share) {
        navigator.share({
            title: "Mi Compromiso — Valores del Valle",
            text: summary
        }).catch(() => {
            fallbackShare(summary);
        });
    } else {
        fallbackShare(summary);
    }
}

function fallbackShare(text) {
    copyToClipboard(text).then(ok => {
        if (ok) {
            toast("📋 Resumen copiado al portapapeles");
        } else {
            prompt("El copiado automático no está disponible o ha fallado.\n\nPor favor, copia el siguiente texto de forma manual (Ctrl+C o Cmd+C):", text);
        }
    });
}

function renderInternalBarriers() {
    const list = el.internalList;
    if (!list) return;
    list.innerHTML = "";
    internalBarriers.forEach((b, i) => {
        const li = document.createElement("li");
        li.style.cssText = "display:flex; align-items:center; gap:8px;";
        li.innerHTML = `<span style="flex:1">${escapeHTML(b.text)} <small>(${escapeHTML(b.skill)})</small></span><button class="mini-btn" title="Quitar barrera" aria-label="Quitar barrera">✕</button>`;
        li.querySelector("button").addEventListener("click", () => {
            internalBarriers.splice(i, 1);
            renderInternalBarriers();
        });
        list.appendChild(li);
    });
}

function renderExternalBarriers() {
    const list = el.externalList;
    if (!list) return;
    list.innerHTML = "";
    externalBarriers.forEach((b, i) => {
        const li = document.createElement("li");
        li.style.cssText = "display:flex; align-items:center; gap:8px;";
        li.innerHTML = `<span style="flex:1">${escapeHTML(b.text)} <small>-> ${escapeHTML(b.plan)}</small></span><button class="mini-btn" title="Quitar barrera" aria-label="Quitar barrera">✕</button>`;
        li.querySelector("button").addEventListener("click", () => {
            externalBarriers.splice(i, 1);
            renderExternalBarriers();
        });
        list.appendChild(li);
    });
}

export function renderActionsList() {
    const list = el.actionsList;
    if (!list) return;
    list.innerHTML = "";
    committedActions.forEach(a => {
        const li = document.createElement("li");
        li.className = `action-item ${a.done ? "done" : ""}`;
        const areaText = AREA_LABELS[a.area] || a.area;
        const dateText = formatDateText(a.date);
        
        const isExactDate = a.date && !isNaN(new Date(a.date)) && (a.date.includes("-") || a.date.includes("/"));
        const icsBtnHTML = isExactDate
            ? '<button class="mini-btn download-ics" title="Descargar recordatorio de calendario (.ics)" aria-label="Descargar recordatorio de calendario">📅</button>'
            : "";

        li.innerHTML = `
        <div style="flex:1">
          <strong>${escapeHTML(a.title)}</strong>
          <p class="hint">${escapeHTML(a.value)} · ${escapeHTML(areaText)}<br>📅 ${escapeHTML(dateText)}</p>
        </div>
        ${icsBtnHTML}
        <button class="mini-btn toggle-action" title="${a.done ? "Marcar como pendiente" : "Marcar como hecha"}" aria-label="Marcar como hecha">${a.done ? "↩" : "✓"}</button>
        <button class="mini-btn remove-action" title="Eliminar acción" aria-label="Eliminar acción">🗑️</button>
      `;
        if (isExactDate) {
            li.querySelector(".download-ics").onclick = () => downloadIcs(a);
        }
        li.querySelector(".toggle-action").onclick = () => {
            a.done = !a.done;
            localStorage.setItem(LS.actions, JSON.stringify(committedActions));
            renderActionsList();
            updateAchievements(committedActions);
            notifySaved("✅ Estado de acción actualizado");
        };
        li.querySelector(".remove-action").onclick = () => {
            const idx = committedActions.indexOf(a);
            if (idx > -1) committedActions.splice(idx, 1);
            localStorage.setItem(LS.actions, JSON.stringify(committedActions));
            renderActionsList();
            updateAchievements(committedActions);
            notifySaved("🗑️ Acción eliminada");
        };
        list.appendChild(li);
    });
}

function escapeICS(text) {
    return String(text || "")
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
}

function downloadIcs(a) {
    const areaText = AREA_LABELS[a.area] || a.area;
    const start = new Date(a.date);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 mins
    
    const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const title = escapeICS(`Compromiso: ${a.title}`);
    const desc = escapeICS(`Compromiso de valores.\nValor: ${a.value}\nÁrea: ${areaText}\n\nCreado en Valores del Valle.`);
    
    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Valores del Valle//ES",
        "BEGIN:VEVENT",
        `UID:${a.id}@valoresdelvalle.com`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${desc}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compromiso_${a.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast("📅 Recordatorio .ics descargado");
}

function suggestMindfulnessSkill(text) {
    const map = {
        "ansiedad": "Expansión",
        "miedo": "Aceptación",
        "pereza": "Contacto con valores",
        "estres": "Aceptación",
        "tristeza": "Autocompasión",
        "autocritica": "Defusión"
    };
    const t = (text || "").toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    for (let k in map) {
        if (t.includes(k)) return map[k];
    }
    return "Defusión";
}
