"use strict";

import { el } from './dom.js';
import { valuesData, getActiveValues, setActiveValues, MAX_VALUES, computeNextCustomId } from './values.js';
import { SoundFX } from './audio.js';
import { escapeHTML, toast, LS, safeJSONParse } from './utils.js';
import { renderActionValueOptions } from './ui_path.js';
import { getDomainForValue } from './illustrations.js';

export function initValuesModule() {
  initCustomValueForm();
  initDeckFilters();
  renderCards();
  renderActiveList();
}

function initDeckFilters() {
  const searchInput = document.getElementById("deckSearch");
  const domainFilter = document.getElementById("deckFilterDomain");
  const onlySelectedFilter = document.getElementById("deckOnlySelected");

  searchInput?.addEventListener("input", renderCards);
  domainFilter?.addEventListener("change", renderCards);
  onlySelectedFilter?.addEventListener("change", renderCards);
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

  const searchInput = document.getElementById("deckSearch");
  const domainFilter = document.getElementById("deckFilterDomain");
  const onlySelectedFilter = document.getElementById("deckOnlySelected");

  const query = (searchInput?.value || "").toLowerCase().trim();
  const domain = domainFilter?.value || "all";
  const onlySelected = onlySelectedFilter?.checked || false;

  const filteredValues = valuesData.filter(v => {
    const matchesQuery = v.name.toLowerCase().includes(query) || v.def.toLowerCase().includes(query);
    if (!matchesQuery) return false;

    if (domain !== "all" && getDomainForValue(v.name) !== domain) return false;

    if (onlySelected && !activeIds.includes(v.id)) return false;

    return true;
  });

  if (filteredValues.length === 0) {
    el.cards.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 40px; font-size: 0.95rem;">No se encontraron valores con los filtros aplicados.</div>`;
    return;
  }

  filteredValues.forEach((v, i) => {
    const isSelected = activeIds.includes(v.id);
    const isCustom = v.id > 58;

    const card = document.createElement("div");
    card.className = "card-container";
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Valor ${v.name}`);
    card.innerHTML = `
      <div class="card ${isSelected ? "selected" : ""}">
        <div class="card-content">
          <h3 class="card-title">${escapeHTML(v.name)}</h3>
          <p class="card-def">${escapeHTML(v.def)}</p>
          <div class="card-actions" style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-sm ${isSelected ? 'danger' : 'secondary'} select-btn" data-id="${v.id}">
              ${isSelected ? 'Quitar' : 'Agregar'}
            </button>
            ${isCustom ? `
              <button class="btn btn-sm secondary edit-btn" data-id="${v.id}" title="Editar">✏️</button>
              <button class="btn btn-sm danger delete-btn" data-id="${v.id}" title="Eliminar">🗑️</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    card.querySelector('.select-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleValue(v.id);
    });

    if (isCustom) {
      card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        editCustomValue(v.id);
      });
      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCustomValue(v.id);
      });
    }

    el.cards.appendChild(card);

    // Premium entry animation (reduced delay for fast UI)
    gsap.from(card, { opacity: 0, scale: 0.9, y: 15, duration: 0.3, delay: Math.min(i * 0.02, 0.4) });
  });
}

function updateSingleCardState(id, isSelected) {
  const selectBtn = el.cards?.querySelector(`.select-btn[data-id="${id}"]`);
  if (!selectBtn) return;
  const cardDiv = selectBtn.closest(".card");
  if (!cardDiv) return;

  if (isSelected) {
    cardDiv.classList.add("selected");
    selectBtn.className = "btn btn-sm danger select-btn";
    selectBtn.textContent = "Quitar";
  } else {
    cardDiv.classList.remove("selected");
    selectBtn.className = "btn btn-sm secondary select-btn";
    selectBtn.textContent = "Agregar";
  }
}

export function toggleValue(id) {
  const scrollPos = window.scrollY;
  let active = getActiveValues();
  const idx = active.findIndex(v => v.id === id);
  let isSelected = false;

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
    isSelected = true;
  }

  setActiveValues(active);
  updateSingleCardState(id, isSelected);
  renderActiveList();
  renderActionValueOptions();

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollPos);
  });
}

function editCustomValue(id) {
  const val = valuesData.find(v => v.id === id);
  if (!val) return;

  const newName = prompt("Editar nombre del valor:", val.name);
  if (newName === null) return;
  const trimmedName = newName.trim();
  if (!trimmedName) {
    toast("El nombre no puede estar vacío");
    return;
  }

  const newDef = prompt("Editar definición:", val.def);
  if (newDef === null) return;
  const trimmedDef = newDef.trim();
  if (!trimmedDef) {
    toast("La definición no puede estar vacía");
    return;
  }

  const alreadyExists = valuesData.some(v => v.id !== id && v.name.toLowerCase() === trimmedName.toLowerCase());
  if (alreadyExists) {
    toast("Ese nombre de valor ya existe");
    return;
  }

  const scrollPos = window.scrollY;
  val.name = trimmedName;
  val.def = trimmedDef;

  const customValues = safeJSONParse(localStorage.getItem(LS.customValues), []);
  const customVal = customValues.find(v => v.id === id);
  if (customVal) {
    customVal.name = trimmedName;
    customVal.def = trimmedDef;
    localStorage.setItem(LS.customValues, JSON.stringify(customValues));
  }

  renderCards();
  renderActiveList();
  renderActionValueOptions();
  toast("Valor editado");

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollPos);
  });
}

function deleteCustomValue(id) {
  if (!confirm("¿Seguro que deseas eliminar permanentemente este valor del mazo?")) return;

  const scrollPos = window.scrollY;
  const idx = valuesData.findIndex(v => v.id === id);
  if (idx > -1) valuesData.splice(idx, 1);

  let customValues = safeJSONParse(localStorage.getItem(LS.customValues), []);
  customValues = customValues.filter(v => v.id !== id);
  localStorage.setItem(LS.customValues, JSON.stringify(customValues));

  let active = getActiveValues().map(v => v.id);
  if (active.includes(id)) {
    active = active.filter(activeId => activeId !== id);
    setActiveValues(active);
  }

  renderCards();
  renderActiveList();
  renderActionValueOptions();
  toast("Valor eliminado");

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollPos);
  });
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
    const grab = e.target.closest(".grab");
    if (!grab) return;
    const target = e.target.closest(".rank-item");
    if (!target) return;
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

