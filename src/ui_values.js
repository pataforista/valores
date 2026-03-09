"use strict";

import { el } from './main.js';
import { valuesData, getActiveValues, setActiveValues, MAX_VALUES, computeNextCustomId } from './values.js';
import { SoundFX } from './audio.js';
import { escapeHTML, toast, LS, safeJSONParse } from './utils.js';
import { renderActionValueOptions } from './ui_path.js';
import { DOMAIN_ILLUSTRATIONS, getDomainForValue } from './illustrations.js';

const CARD_THEMES = [
  { border: '#3B82F6', gradient: 'linear-gradient(145deg, rgba(59,130,246,0.25), rgba(15,23,42,0.02))', icon: '💙' },
  { border: '#10B981', gradient: 'linear-gradient(145deg, rgba(16,185,129,0.25), rgba(15,23,42,0.02))', icon: '💚' },
  { border: '#F59E0B', gradient: 'linear-gradient(145deg, rgba(245,158,11,0.25), rgba(15,23,42,0.02))', icon: '🧡' },
  { border: '#8B5CF6', gradient: 'linear-gradient(145deg, rgba(139,92,246,0.25), rgba(15,23,42,0.02))', icon: '💜' },
  { border: '#EF4444', gradient: 'linear-gradient(145deg, rgba(239,68,68,0.25), rgba(15,23,42,0.02))', icon: '❤️' },
  { border: '#06B6D4', gradient: 'linear-gradient(145deg, rgba(6,182,212,0.24), rgba(15,23,42,0.02))', icon: '🩵' }
];

export function initValuesModule() {
  initCustomValueForm();
  renderCards();
  renderActiveList();
}

function initCustomValueForm() {
  const addBtn = document.getElementById("addCustomBtn");
  const nameInput = document.getElementById("customName");
  const defInput = document.getElementById("customDef");
  if (!addBtn || !nameInput || !defInput) return;

  addBtn.addEventListener("click", () => {
    const name = (nameInput.value || "").trim();
    const def = (defInput.value || "").trim();

    if (!name || !def) {
      toast("Completa nombre y definición");
      return;
    }

    const alreadyExists = valuesData.some(v => v.name.toLowerCase() === name.toLowerCase());
    if (alreadyExists) {
      toast("Ese valor ya existe");
      return;
    }

    const newValue = { id: computeNextCustomId(), name, def };
    valuesData.push(newValue);
    valuesData.sort((a, b) => a.name.localeCompare(b.name));

    const customValues = safeJSONParse(localStorage.getItem(LS.customValues), []);
    customValues.push(newValue);
    localStorage.setItem(LS.customValues, JSON.stringify(customValues));

    toggleValue(newValue.id);
    nameInput.value = "";
    defInput.value = "";
    toast("Valor personalizado agregado");
  });
}

export function renderCards() {
  if (!el.cards) return;
  el.cards.innerHTML = "";
  const activeIds = getActiveValues().map(v => v.id);

  valuesData.forEach((v, i) => {
    const isSelected = activeIds.includes(v.id);
    const theme = CARD_THEMES[i % CARD_THEMES.length];
    const card = document.createElement("div");
    card.className = "card-container";
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Valor ${v.name}`);
    card.innerHTML = `
      <div class="card ${isSelected ? "selected" : ""}">
        <div class="card-content">
          <h3 class="card-title">${escapeHTML(v.name)}</h3>
          <p class="card-def">${escapeHTML(v.def)}</p>
          <div class="card-actions">
            <button class="btn btn-sm ${isSelected ? 'danger' : 'secondary'}" data-id="${v.id}">
              ${isSelected ? 'Quitar' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    `;

    card.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleValue(v.id);
    });

    el.cards.appendChild(card);

    // Premium entry animation
    gsap.from(card, { opacity: 0, scale: 0.9, y: 15, duration: 0.3, delay: Math.random() * 0.15 });
  });
}

export function toggleValue(id) {
  let active = getActiveValues();
  const idx = active.findIndex(v => v.id === id);

  if (idx > -1) {
    active.splice(idx, 1);
    toast("Removido");
  } else {
    if (active.length >= MAX_VALUES) {
      toast("Máximo 10 valores");
      return;
    }
    const val = valuesData.find(v => v.id === id);
    if (val) active.push(val);
    toast("¡Agregado!");
    SoundFX.approval();
  }

  setActiveValues(active);
  renderCards();
  renderActiveList();
  renderActionValueOptions();
}

export function renderActiveList() {
  if (!el.list) return;
  el.list.innerHTML = "";
  const active = getActiveValues();
  el.counter.textContent = `${active.length}/${MAX_VALUES}`;

  active.forEach((v, i) => {
    const li = document.createElement("li");
    li.className = "rank-item";
    li.draggable = true;
    li.dataset.index = i;
    li.innerHTML = `
      <span class="rank-num">${i + 1}</span>
      <div class="grab" title="Arrastrar para reordenar">≡</div>
      <div class="rank-name">${escapeHTML(v.name)}</div>
      <div class="rank-arrows">
        ${i > 0 ? `<button class="arrow-btn" data-from="${i}" data-to="${i - 1}" title="Subir">▲</button>` : `<span class="arrow-placeholder"></span>`}
        ${i < active.length - 1 ? `<button class="arrow-btn" data-from="${i}" data-to="${i + 1}" title="Bajar">▼</button>` : `<span class="arrow-placeholder"></span>`}
      </div>
      <button class="mini-btn remove-btn" data-id="${v.id}">✕</button>
    `;

    // Desktop drag-and-drop
    li.addEventListener("dragstart", (e) => {
      li.classList.add("dragging");
      e.dataTransfer.setData("text/plain", i);
      e.dataTransfer.effectAllowed = "move";
    });
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      el.list.querySelectorAll(".rank-item").forEach(item => item.classList.remove("drop-target"));
    });
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      li.classList.add("drop-target");
    });
    li.addEventListener("dragleave", () => li.classList.remove("drop-target"));
    li.addEventListener("drop", (e) => {
      e.preventDefault();
      const from = parseInt(e.dataTransfer.getData("text/plain"));
      if (from !== i) reorderValues(from, i);
    });

    // Arrow buttons (reliable tap-based reorder for mobile)
    li.querySelectorAll(".arrow-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        reorderValues(parseInt(btn.dataset.from), parseInt(btn.dataset.to));
      });
    });

    li.querySelector(".remove-btn").addEventListener("click", () => toggleValue(v.id));
    el.list.appendChild(li);
    gsap.from(li, { x: -20, opacity: 0, duration: 0.3, delay: i * 0.05 });
  });

  // Touch drag-to-reorder (mobile)
  addTouchReorder(el.list);
}

function addTouchReorder(list) {
  let dragEl = null;
  let fromIdx = -1;
  let ghost = null;

  list.addEventListener("touchstart", (e) => {
    const target = e.target.closest(".rank-item");
    if (!target || e.target.closest("button")) return;
    dragEl = target;
    fromIdx = parseInt(target.dataset.index);
    dragEl.classList.add("dragging");

    ghost = dragEl.cloneNode(true);
    ghost.style.cssText = `position:fixed;opacity:0.6;pointer-events:none;z-index:9999;width:${dragEl.offsetWidth}px;transition:none;border:2px dashed var(--primary);`;
    document.body.appendChild(ghost);
  }, { passive: true });

  list.addEventListener("touchmove", (e) => {
    if (!dragEl) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (ghost) {
      ghost.style.left = `${touch.clientX - dragEl.offsetWidth / 2}px`;
      ghost.style.top = `${touch.clientY - dragEl.offsetHeight / 2}px`;
    }
    const el2 = document.elementFromPoint(touch.clientX, touch.clientY);
    const overItem = el2?.closest(".rank-item");
    list.querySelectorAll(".rank-item").forEach(i => i.classList.remove("drop-target"));
    if (overItem && overItem !== dragEl) overItem.classList.add("drop-target");
  }, { passive: false });

  list.addEventListener("touchend", (e) => {
    if (!dragEl) return;
    if (ghost) { ghost.remove(); ghost = null; }
    dragEl.classList.remove("dragging");
    const touch = e.changedTouches[0];
    const overEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const overItem = overEl?.closest(".rank-item");
    if (overItem && overItem !== dragEl) {
      const toIdx = parseInt(overItem.dataset.index);
      if (toIdx !== fromIdx) reorderValues(fromIdx, toIdx);
    } else {
      list.querySelectorAll(".rank-item").forEach(i => i.classList.remove("drop-target"));
    }
    dragEl = null;
    fromIdx = -1;
  });
}

function reorderValues(from, to) {
  let active = getActiveValues();
  const [movedItem] = active.splice(from, 1);
  active.splice(to, 0, movedItem);
  setActiveValues(active);
  renderActiveList();
  renderActionValueOptions();
  SoundFX.click();
}

