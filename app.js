"use strict";

/* ============================
   Valores del Valle — PWA
   - Top 10 valores
   - Bull’s Eye polar correcto
   - Persistencia localStorage
   - Drag reordenamiento (handle ≡)
   ============================ */

// ---- Datos (58 valores) ----
const valuesData = [
  { id: 1, name: "Aceptación", def: "Estar abierto y aceptarme a mí mismo, a los demás, a la vida, etc." },
  { id: 2, name: "Aventura", def: "Ser aventurero; buscar, crear o explorar activamente experiencias novedosas o estimulantes." },
  { id: 3, name: "Asertividad", def: "Defender respetuosamente mis derechos y pedir lo que quiero." },
  { id: 4, name: "Autenticidad", def: "Ser auténtico, genuino, real; ser sincero conmigo mismo." },
  { id: 5, name: "Belleza", def: "Apreciar, crear, nutrir o cultivar la belleza en mí mismo, en los demás, en el ambiente, etc." },
  { id: 6, name: "Cuidado", def: "Cuidarme a mí mismo, a los demás, al medio ambiente, etc." },
  { id: 7, name: "Desafío", def: "Seguir desafiándome a mí mismo para crecer, aprender, mejorar." },
  { id: 8, name: "Compasión", def: "Actuar con bondad hacia los que sufren." },
  { id: 9, name: "Conexión", def: "Participar plenamente en lo que hago y estar presente con los demás." },
  { id: 10, name: "Contribución", def: "Contribuir, ayudar o hacer una diferencia positiva para mí o para los demás." },
  { id: 11, name: "Conformidad", def: "Ser respetuoso y obediente de las reglas y obligaciones." },
  { id: 12, name: "Cooperación", def: "Ser cooperativo y colaborador con los demás." },
  { id: 13, name: "Coraje", def: "Persistir ante el miedo, la amenaza o la dificultad." },
  { id: 14, name: "Creatividad", def: "Ser creativo o innovador." },
  { id: 15, name: "Curiosidad", def: "Ser curioso, de mente abierta e interesado; explorar y descubrir." },
  { id: 16, name: "Estímulo", def: "Alentar y recompensar el comportamiento que valoro en mí o en otros." },
  { id: 17, name: "Igualdad", def: "Tratar a los demás como iguales a mí, y viceversa." },
  { id: 18, name: "Emoción", def: "Buscar, crear y participar en actividades emocionantes o estimulantes." },
  { id: 19, name: "Equidad", def: "Ser justo conmigo mismo o con los demás." },
  { id: 20, name: "Fitness", def: "Velar por mi salud y bienestar físico y mental." },
  { id: 21, name: "Flexibilidad", def: "Adaptarme fácilmente a circunstancias cambiantes." },
  { id: 22, name: "Libertad", def: "Elegir cómo vivo y me comporto (o ayudar a otros a hacerlo)." },
  { id: 23, name: "Amabilidad", def: "Ser amigable, sociable o agradable con los demás." },
  { id: 24, name: "Perdón", def: "Perdonarme a mí mismo o a los demás." },
  { id: 25, name: "Diversión", def: "Buscar, crear y participar en actividades llenas de diversión." },
  { id: 26, name: "Generosidad", def: "Ser generoso, compartir y dar." },
  { id: 27, name: "Gratitud", def: "Estar agradecido y apreciar aspectos positivos de mí, otros y la vida." },
  { id: 28, name: "Honestidad", def: "Ser veraz y sincero conmigo mismo y con los demás." },
  { id: 29, name: "Humor", def: "Ver y apreciar el lado humorístico de la vida." },
  { id: 30, name: "Humildad", def: "Ser modesto; dejar que mis logros hablen por sí mismos." },
  { id: 31, name: "Industria", def: "Ser trabajador y dedicado." },
  { id: 32, name: "Independencia", def: "Ser autosuficiente y elegir mi forma de hacer las cosas." },
  { id: 33, name: "Intimidad", def: "Abrirme y compartirme emocional o físicamente en relaciones cercanas." },
  { id: 34, name: "Justicia", def: "Defender la justicia y la equidad." },
  { id: 35, name: "Bondad", def: "Ser amable, considerado y cariñoso conmigo mismo u otras personas." },
  { id: 36, name: "Amor", def: "Actuar con amor o cariño hacia mí mismo o los demás." },
  { id: 37, name: "Mindfulness", def: "Estar consciente y abierto a mi experiencia aquí y ahora." },
  { id: 38, name: "Orden", def: "Ser ordenado y organizado." },
  { id: 39, name: "Mente abierta", def: "Considerar otros puntos de vista y sopesar evidencia con justicia." },
  { id: 40, name: "Paciencia", def: "Esperar tranquilamente lo que quiero." },
  { id: 41, name: "Persistencia", def: "Continuar con determinación a pesar de dificultades." },
  { id: 42, name: "Placer", def: "Crear y dar placer a mí mismo o a los demás." },
  { id: 43, name: "Poder", def: "Influir fuertemente o liderar (tomar el cargo, organizar)." },
  { id: 44, name: "Reciprocidad", def: "Equilibrio justo entre dar y recibir en relaciones." },
  { id: 45, name: "Respeto", def: "Ser educado, considerado y mostrar respeto positivo." },
  { id: 46, name: "Responsabilidad", def: "Rendir cuentas de mis acciones." },
  { id: 47, name: "Romance", def: "Mostrar y expresar afecto fuerte." },
  { id: 48, name: "Seguridad", def: "Asegurar, proteger o garantizar mi seguridad o la de otros." },
  { id: 49, name: "Autoconciencia", def: "Ser consciente de mis pensamientos, sentimientos y acciones." },
  { id: 50, name: "Autocuidado", def: "Cuidar mi bienestar y satisfacer mis necesidades." },
  { id: 51, name: "Autodesarrollo", def: "Seguir creciendo/mejorando en conocimientos, habilidades o carácter." },
  { id: 52, name: "Autocontrol", def: "Actuar de acuerdo con mis ideales." },
  { id: 53, name: "Sensualidad", def: "Disfrutar experiencias que estimulan los cinco sentidos." },
  { id: 54, name: "Sexualidad", def: "Explorar o expresar mi sexualidad." },
  { id: 55, name: "Espiritualidad", def: "Conectarme con cosas más grandes que yo." },
  { id: 56, name: "Habilidad", def: "Practicar y mejorar continuamente mis habilidades." },
  { id: 57, name: "Apoyo", def: "Ser útil, alentador y estar disponible para mí o para los demás." },
  { id: 58, name: "Confianza", def: "Ser leal, fiel, sincero y confiable." }
];

// ---- Storage keys ----
const LS = {
  values: "vv_myValues_v1",
  bullseye: "vv_bullseye_v1",
  theme: "vv_theme_v1"
};

const MAX_VALUES = 10;

// ---- State ----
let activeValues = safeJSONParse(localStorage.getItem(LS.values), []);
let customNextId = computeNextCustomId();

// ---- DOM ----
const el = {
  cards: document.getElementById("cards-container"),
  list: document.getElementById("active-list"),
  counter: document.getElementById("counter"),
  toast: document.getElementById("toast"),

  tabValues: document.getElementById("tab-values"),
  tabBull: document.getElementById("tab-bullseye"),
  viewValues: document.getElementById("view-values"),
  viewBull: document.getElementById("view-bullseye"),

  themeBtn: document.getElementById("themeBtn"),
  resetBtn: document.getElementById("resetBtn"),

  customName: document.getElementById("customName"),
  customDef: document.getElementById("customDef"),
  addCustomBtn: document.getElementById("addCustomBtn"),

  // Bullseye inputs
  inWork: document.getElementById("input-work"),
  inRel: document.getElementById("input-rel"),
  inGrowth: document.getElementById("input-growth"),
  inLeisure: document.getElementById("input-leisure"),

  numWork: document.getElementById("num-work"),
  numRel: document.getElementById("num-rel"),
  numGrowth: document.getElementById("num-growth"),
  numLeisure: document.getElementById("num-leisure"),

  mWork: document.getElementById("mark-work"),
  mRel: document.getElementById("mark-rel"),
  mGrowth: document.getElementById("mark-growth"),
  mLeisure: document.getElementById("mark-leisure"),

  bullSave: document.getElementById("bullseyeSaveBtn"),
  bullReset: document.getElementById("bullseyeResetBtn")
};

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  wireTabs();
  wireTheme();
  wireResetAll();
  wireCustomAdd();

  renderCards();
  renderActiveList();

  loadBullseye();
  wireBullseye();
  updateBullseyeVisual();
});

// =====================
// Values UI
// =====================

function renderCards() {
  el.cards.innerHTML = "";

  for (const v of valuesData) {
    const isSelected = activeValues.some(x => x.id === v.id);

    const cardWrap = document.createElement("div");
    cardWrap.className = "card-container";

    const flipBtn = document.createElement("button");
    flipBtn.type = "button";
    flipBtn.className = "card";
    flipBtn.id = `card-${v.id}`;
    flipBtn.setAttribute("aria-pressed", "false");
    flipBtn.setAttribute("aria-label", `${v.name}. Toca para ver definición`);
    flipBtn.style.border = "none";
    flipBtn.style.padding = "0";
    flipBtn.style.background = "transparent";
    flipBtn.style.cursor = "pointer";
    flipBtn.style.textAlign = "inherit";
    if (isSelected) flipBtn.classList.add("selected");

    flipBtn.addEventListener("click", () => {
      flipBtn.classList.toggle("flipped");
      flipBtn.setAttribute("aria-pressed", flipBtn.classList.contains("flipped") ? "true" : "false");
    });

    const front = document.createElement("div");
    front.className = "card-face card-front";
    front.innerHTML = `
      <div class="card-title">${escapeHTML(v.name)}</div>
      ${isSelected ? `<div class="star" aria-hidden="true">⭐</div>` : ""}
      <div style="font-size:0.8rem; opacity:0.75;">Tocar para ver</div>
    `;

    const back = document.createElement("div");
    back.className = "card-face card-back";
    back.innerHTML = `
      <div style="font-weight:950; font-size:0.95rem;">${escapeHTML(v.name)}</div>
      <div class="def">${escapeHTML(v.def)}</div>
      <div class="card-actions">
        <button class="btn ${isSelected ? "danger" : "primary"}" type="button" data-action="toggle" data-id="${v.id}">
          ${isSelected ? "Quitar" : "Agregar"}
        </button>
      </div>
    `;

    flipBtn.appendChild(front);
    flipBtn.appendChild(back);
    cardWrap.appendChild(flipBtn);
    el.cards.appendChild(cardWrap);
  }

  el.cards.querySelectorAll("button[data-action='toggle']").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.getAttribute("data-id"));
      toggleValue(id);
    });
  });
}

function toggleValue(id) {
  const idx = activeValues.findIndex(v => v.id === id);

  if (idx >= 0) {
    activeValues.splice(idx, 1);
    saveValues();
    renderCards();
    renderActiveList();
    toast("Quitado");
    return;
  }

  if (activeValues.length >= MAX_VALUES) {
    toast("Límite: 10 valores");
    return;
  }

  const item = valuesData.find(v => v.id === id);
  if (!item) return;

  activeValues.push(item);
  saveValues();
  renderCards();
  renderActiveList();
  toast("Agregado");
}

function renderActiveList() {
  el.list.innerHTML = "";
  el.counter.textContent = `${activeValues.length}/${MAX_VALUES}`;

  if (activeValues.length === 0) {
    const li = document.createElement("li");
    li.className = "ranking-item";
    li.style.opacity = "0.75";
    li.textContent = "Aún no has seleccionado valores.";
    el.list.appendChild(li);
    return;
  }

  activeValues.forEach((v, i) => {
    const li = document.createElement("li");
    li.className = "ranking-item";
    if (i === 0) li.classList.add("is-first"); // ✅ resalta el #1 con tu CSS

    li.setAttribute("data-id", String(v.id));
    li.innerHTML = `
      <div class="rank-badge" aria-hidden="true">${i + 1}</div>
      <div class="grab" title="Arrastrar" aria-hidden="true">≡</div>
      <div class="rank-name">
        ${escapeHTML(v.name)}
        <span>${escapeHTML(v.def)}</span>
      </div>
      <button class="mini-btn" type="button" data-action="remove" data-id="${v.id}">✕</button>
    `;

    // Drag (pointer) - inicia solo si toca el "≡"
    const grab = li.querySelector(".grab");
    if (grab) {
      grab.addEventListener("pointerdown", (e) => onPointerDown(e, v.id));
    }

    el.list.appendChild(li);
  });

  el.list.querySelectorAll("button[data-action='remove']").forEach(btn => {
    btn.addEventListener("click", () => toggleValue(Number(btn.getAttribute("data-id"))));
  });
}

function saveValues() {
  localStorage.setItem(LS.values, JSON.stringify(activeValues));
}

// =====================
// Custom value add
// =====================

function wireCustomAdd() {
  if (!el.addCustomBtn) return;

  el.addCustomBtn.addEventListener("click", () => {
    const name = (el.customName?.value || "").trim();
    const def = (el.customDef?.value || "").trim();

    if (!name) { toast("Falta el nombre"); return; }
    if (!def) { toast("Falta la definición"); return; }

    const newItem = { id: customNextId++, name, def };
    valuesData.push(newItem);

    el.customName.value = "";
    el.customDef.value = "";

    renderCards();
    toast("Valor agregado");
  });
}

function computeNextCustomId() {
  const maxId = valuesData.reduce((m, v) => Math.max(m, v.id), 0);
  return maxId + 1;
}

// =====================
// Drag reorder (Top 10)
// =====================

let drag = {
  active: false,
  pointerId: null,
  fromIndex: -1,
  itemId: null
};

function onPointerDown(e, itemId) {
  if (e.button !== undefined && e.button !== 0) return; // solo click primario
  e.preventDefault();

  const li = e.target.closest(".ranking-item");
  if (!li) return;

  drag.active = true;
  drag.pointerId = e.pointerId;
  drag.itemId = itemId;
  drag.fromIndex = activeValues.findIndex(v => v.id === itemId);

  li.classList.add("dragging");
  li.setPointerCapture?.(e.pointerId);

  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp, { passive: false, once: true });
}

function onPointerMove(e) {
  if (!drag.active) return;
  e.preventDefault();

  const over = document.elementFromPoint(e.clientX, e.clientY)?.closest(".ranking-item");
  if (!over) return;

  const overId = Number(over.getAttribute("data-id"));
  const toIndex = activeValues.findIndex(v => v.id === overId);

  if (toIndex < 0 || toIndex === drag.fromIndex) return;

  const moved = activeValues.splice(drag.fromIndex, 1)[0];
  activeValues.splice(toIndex, 0, moved);
  drag.fromIndex = toIndex;

  saveValues();
  renderCards();
  renderActiveList();
}

function onPointerUp() {
  drag.active = false;
  drag.pointerId = null;
  drag.fromIndex = -1;
  drag.itemId = null;

  window.removeEventListener("pointermove", onPointerMove);
}

// =====================
// Bull's Eye (polar correcto)
// =====================

function wireBullseye() {
  const onInput = () => {
    updateBullseyeNumbers();
    updateBullseyeVisual();
  };

  [el.inWork, el.inRel, el.inGrowth, el.inLeisure].forEach(x => {
    x.addEventListener("input", onInput);
  });

  el.bullSave.addEventListener("click", () => {
    saveBullseye();
    toast("Diana guardada");
  });

  el.bullReset.addEventListener("click", () => {
    setBullseye({ work: 50, rel: 50, growth: 50, leisure: 50 }, true);
    toast("Diana reiniciada");
  });
}

function loadBullseye() {
  const saved = safeJSONParse(localStorage.getItem(LS.bullseye), null);
  if (saved && typeof saved === "object") {
    setBullseye(saved, false);
  } else {
    setBullseye({ work: 50, rel: 50, growth: 50, leisure: 50 }, false);
  }
  updateBullseyeNumbers();
}

function saveBullseye() {
  const data = getBullseye();
  localStorage.setItem(LS.bullseye, JSON.stringify(data));
}

function getBullseye() {
  return {
    work: clampInt(el.inWork.value, 0, 100),
    rel: clampInt(el.inRel.value, 0, 100),
    growth: clampInt(el.inGrowth.value, 0, 100),
    leisure: clampInt(el.inLeisure.value, 0, 100)
  };
}

function setBullseye(data, persist) {
  const d = normalizeBullseye(data);

  el.inWork.value = d.work;
  el.inRel.value = d.rel;
  el.inGrowth.value = d.growth;
  el.inLeisure.value = d.leisure;

  updateBullseyeNumbers();
  updateBullseyeVisual();

  if (persist) saveBullseye();
}

function normalizeBullseye(data) {
  return {
    work: clampInt(data?.work ?? 50, 0, 100),
    rel: clampInt(data?.rel ?? 50, 0, 100),
    growth: clampInt(data?.growth ?? 50, 0, 100),
    leisure: clampInt(data?.leisure ?? 50, 0, 100)
  };
}

function updateBullseyeNumbers() {
  const d = getBullseye();
  el.numWork.textContent = String(d.work);
  el.numRel.textContent = String(d.rel);
  el.numGrowth.textContent = String(d.growth);
  el.numLeisure.textContent = String(d.leisure);
}

function updateBullseyeVisual() {
  const board = document.getElementById("targetBoard");
  const rect = board.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const maxR = Math.min(cx, cy) - 16;
  const d = getBullseye();

  const theta = {
    work: degToRad(225),
    leisure: degToRad(315),
    growth: degToRad(135),
    rel: degToRad(45)
  };

  movePolar(el.mWork, cx, cy, maxR, d.work, theta.work);
  movePolar(el.mLeisure, cx, cy, maxR, d.leisure, theta.leisure);
  movePolar(el.mGrowth, cx, cy, maxR, d.growth, theta.growth);
  movePolar(el.mRel, cx, cy, maxR, d.rel, theta.rel);
}

function movePolar(markerEl, cx, cy, maxR, value0to100, angleRad) {
  const r = (1 - (value0to100 / 100)) * maxR;
  const x = cx + Math.cos(angleRad) * r;
  const y = cy + Math.sin(angleRad) * r;

  markerEl.style.left = `${(x / (cx * 2)) * 100}%`;
  markerEl.style.top = `${(y / (cy * 2)) * 100}%`;
}

// =====================
// Tabs / Theme / Reset
// =====================

function wireTabs() {
  const activate = (which) => {
    const isValues = which === "values";

    el.viewValues.classList.toggle("active", isValues);
    el.viewBull.classList.toggle("active", !isValues);

    el.tabValues.classList.toggle("active", isValues);
    el.tabBull.classList.toggle("active", !isValues);

    el.tabValues.setAttribute("aria-selected", isValues ? "true" : "false");
    el.tabBull.setAttribute("aria-selected", !isValues ? "true" : "false");
  };

  el.tabValues.addEventListener("click", () => activate("values"));
  el.tabBull.addEventListener("click", () => activate("bullseye"));
}

function wireTheme() {
  const saved = localStorage.getItem(LS.theme);
  if (saved === "dark") document.body.classList.add("dark-theme");
  el.themeBtn.textContent = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";

  el.themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem(LS.theme, isDark ? "dark" : "light");
    el.themeBtn.textContent = isDark ? "☀️" : "🌙";
  });
}

function wireResetAll() {
  el.resetBtn.addEventListener("click", () => {
    const ok = confirm("¿Borrar datos locales (valores, diana y tema)?");
    if (!ok) return;

    localStorage.removeItem(LS.values);
    localStorage.removeItem(LS.bullseye);
    localStorage.removeItem(LS.theme);

    activeValues = [];
    document.body.classList.remove("dark-theme");
    el.themeBtn.textContent = "🌙";

    renderCards();
    renderActiveList();
    setBullseye({ work: 50, rel: 50, growth: 50, leisure: 50 }, false);

    toast("Datos borrados");
  });
}

// =====================
// Toast + Utils
// =====================

let toastTimer = null;
function toast(msg) {
  if (!el.toast) return;
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 1200);
}

function safeJSONParse(text, fallback) {
  try {
    if (!text) return fallback;
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function clampInt(v, min, max) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function degToRad(d) { return (d * Math.PI) / 180; }

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =====================
// Service Worker register
// =====================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* silencio: si falla, sigue como web normal */
    });
  });
}
