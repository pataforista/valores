"use strict";

import { el } from './main.js';
import { getActiveValues } from './values.js';
import { LS, safeJSONParse, toast, escapeHTML } from './utils.js';
import { SoundFX, isSoundEnabled } from './audio.js';
import { CompassAvatar } from './avatar.js';

let committedActions = safeJSONParse(localStorage.getItem(LS.actions), []);
let internalBarriers = [];
let externalBarriers = [];
let pendingAction = null;

export function getCommittedActions() { return committedActions; }

export function initPathModule() {
    if (!el.actionForm) return;

    renderActionValueOptions();
    renderActionsList();

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

    el.actionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const action = {
            title: el.actionDesc.value,
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

        const smartMeaningful = document.getElementById("smartMeaningful")?.checked;
        const smartAdaptive = document.getElementById("smartAdaptive")?.checked;
        const hasResource = ["resTime", "resMoney", "resSkills"].some(id => document.getElementById(id)?.checked);
        const smartError = document.getElementById("smartError");
        if (!smartMeaningful || !smartAdaptive || !hasResource) {
            if (smartError) {
                smartError.hidden = false;
                smartError.textContent = "Completa M, A y al menos un recurso (R).";
            }
            return;
        }
        if (smartError) smartError.hidden = true;

        pendingAction = action;
        showCommitmentPanel(action);
        toast("Revisa y declara tu compromiso");
    });
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

    summary.textContent = `Acción: ${action.title} · Valor: ${action.value} · Área: ${action.area}`;
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
    renderActionsList();

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
    if (!navigator.clipboard?.writeText) {
        toast("Portapapeles no disponible");
        return;
    }
    navigator.clipboard.writeText(summary).then(() => toast("Resumen copiado")).catch(() => toast("No se pudo copiar"));
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
        li.className = `action-item ${a.done ? 'done' : ''}`;
        li.innerHTML = `
      <div style="flex:1">
        <strong>${escapeHTML(a.title)}</strong>
        <p class="hint">${escapeHTML(a.value)} · ${escapeHTML(a.area)}</p>
      </div>
      <button class="mini-btn">${a.done ? '✓' : '○'}</button>
    `;
        li.querySelector('button').onclick = () => {
            a.done = !a.done;
            localStorage.setItem(LS.actions, JSON.stringify(committedActions));
            renderActionsList();
        };
        list.appendChild(li);
    });
}

function suggestMindfulnessSkill(text) {
    const map = {
        "ansiedad": "Expansión",
        "miedo": "Coraje",
        "pereza": "Contacto con valores",
        "estres": "Aceptación",
        "tristeza": "Autocompasión",
        "autocrítica": "Defusión"
    };
    const t = text.toLowerCase();
    for (let k in map) {
        if (t.includes(k)) return map[k];
    }
    return "Defusión";
}
