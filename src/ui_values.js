"use strict";

import { el } from './main.js';
import { valuesData, getActiveValues, setActiveValues, MAX_VALUES } from './values.js';
import { SoundFX } from './audio.js';
import { escapeHTML, toast } from './utils.js';
import { renderActionValueOptions } from './ui_path.js';

export function initValuesModule() {
  renderCards();
  renderActiveList();
}

export function renderCards() {
  if (!el.cards) return;
  el.cards.innerHTML = "";
  const activeIds = getActiveValues().map(v => v.id);

  valuesData.forEach(v => {
    const isSelected = activeIds.includes(v.id);
    const card = document.createElement("div");
    card.className = `value-card ${isSelected ? "selected" : ""}`;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <strong>${escapeHTML(v.name)}</strong>
        </div>
        <div class="card-back">
          <p>${escapeHTML(v.def)}</p>
          <button class="btn btn-sm ${isSelected ? 'danger' : 'primary'}" data-id="${v.id}">
            ${isSelected ? 'Quitar' : 'Agregar'}
          </button>
        </div>
      </div>
    `;

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
