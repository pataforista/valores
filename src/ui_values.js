"use strict";

import { el } from './main.js';
import { valuesData, getActiveValues, setActiveValues, MAX_VALUES, computeNextCustomId } from './values.js';
import { SoundFX } from './audio.js';
import { escapeHTML, toast, LS, safeJSONParse } from './utils.js';
import { renderActionValueOptions } from './ui_path.js';

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
    card.innerHTML = `
      <div class="card ${isSelected ? "selected" : ""}">
        <div class="card-face card-front">
          <p class="star">⭐</p>
          <h3 class="card-title">${escapeHTML(v.name)}</h3>
        </div>
        <div class="card-face card-back">
          <h3 class="card-title">${escapeHTML(v.name)}</h3>
          <p class="def">${escapeHTML(v.def)}</p>
          <div class="card-actions">
            <button class="btn btn-sm ${isSelected ? 'danger' : 'primary'}" data-id="${v.id}">
              ${isSelected ? 'Quitar' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      card.querySelector('.card')?.classList.toggle('flipped');
    });

    card.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleValue(v.id);
    });

    el.cards.appendChild(card);

    // Premium entry animation
    gsap.from(card, { opacity: 0, scale: 0.9, y: 20, duration: 0.4, delay: Math.random() * 0.2 });
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
      <div class="grab">≡</div>
      <div class="rank-name">
        ${escapeHTML(v.name)}
      </div>
      <button class="mini-btn" data-id="${v.id}">✕</button>
    `;

    // Reordering Logic
    li.addEventListener("dragstart", (e) => {
      li.classList.add("dragging");
      e.dataTransfer.setData("text/plain", i);
      e.dataTransfer.effectAllowed = "move";
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      document.querySelectorAll(".rank-item").forEach(item => item.classList.remove("drop-target"));
    });

    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      li.classList.add("drop-target");
    });

    li.addEventListener("dragleave", () => {
      li.classList.remove("drop-target");
    });

    li.addEventListener("drop", (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
      const toIndex = i;
      if (fromIndex !== toIndex) {
        reorderValues(fromIndex, toIndex);
      }
    });

    li.querySelector('button').addEventListener('click', () => toggleValue(v.id));
    el.list.appendChild(li);

    gsap.from(li, { x: -20, opacity: 0, duration: 0.3, delay: i * 0.05 });
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
