"use strict";

/* ============================
   Valores del Valle — PWA
   - Top 10 valores
   - Bull’s Eye polar correcto
   - Persistencia localStorage
   - Drag reordenamiento (handle ≡)
   - Intro Carousel
   - Sorting A-Z
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

// Sort alphabetically by default
valuesData.sort((a, b) => a.name.localeCompare(b.name));

// ---- Storage keys ----
const LS = {
  values: "vv_myValues_v1",
  bullseye: "vv_bullseye_v1",
  theme: "vv_theme_v1",
  actions: "vv_actions_v1",
  seenIntro: "vv_seenIntro_v1"
};

const MAX_VALUES = 10;

// ---- State ----
let activeValues = safeJSONParse(localStorage.getItem(LS.values), []);
let customNextId = computeNextCustomId();
let committedActions = safeJSONParse(localStorage.getItem(LS.actions), []);
let pendingAction = null;
let internalBarriers = [];
let externalBarriers = [];

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
  viewPath: document.getElementById("view-path"),

  themeBtn: document.getElementById("themeBtn"),
  resetBtn: document.getElementById("resetBtn"),
  helpBtn: document.getElementById("helpBtn"),

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
  bullReset: document.getElementById("bullseyeResetBtn"),

  tabPath: document.getElementById("tab-path"),

  actionForm: document.getElementById("actionForm"),
  actionValue: document.getElementById("actionValue"),
  actionDesc: document.getElementById("actionDesc"),
  actionArea: document.getElementById("actionArea"),
  actionDate: document.getElementById("actionDate"),
  smartMeaningful: document.getElementById("smartMeaningful"),
  smartAdaptive: document.getElementById("smartAdaptive"),
  resTime: document.getElementById("resTime"),
  resMoney: document.getElementById("resMoney"),
  resSkills: document.getElementById("resSkills"),
  smartError: document.getElementById("smartError"),
  valueHint: document.getElementById("valueHint"),

  internalBarrier: document.getElementById("internalBarrier"),
  mindfulnessSkill: document.getElementById("mindfulnessSkill"),
  addInternalBarrier: document.getElementById("addInternalBarrier"),
  internalList: document.getElementById("internalList"),
  mindfulnessHint: document.getElementById("mindfulnessHint"),

  externalBarrier: document.getElementById("externalBarrier"),
  externalPlan: document.getElementById("externalPlan"),
  addExternalBarrier: document.getElementById("addExternalBarrier"),
  externalList: document.getElementById("externalList"),

  commitmentPanel: document.getElementById("commitmentPanel"),
  commitmentSummary: document.getElementById("commitmentSummary"),
  declareCommitment: document.getElementById("declareCommitment"),
  shareCommitment: document.getElementById("shareCommitment"),
  commitmentStatus: document.getElementById("commitmentStatus"),
  actionsList: document.getElementById("actionsList"),

  // Intro Modal
  introModal: document.getElementById("introModal"),
  carouselTrack: document.getElementById("carouselTrack"),
  carouselDots: document.getElementById("carouselDots"),
  closeIntroBtn: document.getElementById("closeIntroBtn")
};

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  wireTabs();
  wireTheme();
  wireResetAll();
  wireCustomAdd();
  wirePathModule();
  wireIntro();

  renderCards();
  renderActiveList();
  renderActionValueOptions();
  renderActionsList();

  loadBullseye();
  wireBullseye();
  updateBullseyeVisual();

  checkIntro();
});

// =====================
// Intro Carousel
// =====================
const introSlides = [
  { icon: "👋", title: "Bienvenido", text: "Explora tus valores y construye una vida con significado." },
  { icon: "💎", title: "1. Elige", text: "Selecciona tus Top 10 valores de la lista." },
  { icon: "🔢", title: "2. Prioriza", text: "Ordena tus valores arrastrando la lista 'Mis Top 10'." },
  { icon: "🎯", title: "3. La Diana", text: "Evalúa qué tan coherente eres en 4 áreas vitales." },
  { icon: "👣", title: "4. Actúa", text: "Usa el Sendero para comprometerte con acciones pequeñas." }
];

let currentSlide = 0;
let carouselTimer = null;
let isPaused = false;

function wireIntro() {
  if (!el.introModal) return;

  // Render slides
  el.carouselTrack.innerHTML = "";
  introSlides.forEach(slide => {
    const div = document.createElement("div");
    div.className = "carousel-item";
    div.innerHTML = `
      <div style="font-size:2.5rem;">${slide.icon}</div>
      <h3>${slide.title}</h3>
      <p class="carousel-p">${slide.text}</p>
    `;
    el.carouselTrack.appendChild(div);
  });

  // Render dots
  el.carouselDots.innerHTML = "";
  introSlides.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => {
      goToSlide(i);
      resetTimer();
    });
    el.carouselDots.appendChild(dot);
  });

  el.closeIntroBtn.addEventListener("click", closeIntro);
  el.helpBtn.addEventListener("click", openIntro);

  // Hover Pause logic
  el.introModal.querySelector(".carousel-wrap").addEventListener("mouseenter", () => isPaused = true);
  el.introModal.querySelector(".carousel-wrap").addEventListener("mouseleave", () => isPaused = false);

  startTimer();
}

function startTimer() {
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    if (el.introModal.classList.contains("active") && !isPaused) {
      nextSlide();
    }
  }, 3000); // 3000ms delay per user spec
}

function resetTimer() {
  startTimer();
}

function nextSlide() {
  goToSlide((currentSlide + 1) % introSlides.length);
}

function goToSlide(index) {
  currentSlide = index;
  const offset = -100 * currentSlide;
  el.carouselTrack.style.transform = `translateX(${offset}%)`;

  const dots = el.carouselDots.querySelectorAll(".dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));
}

function openIntro() {
  el.introModal.classList.add("active");
  currentSlide = 0;
  goToSlide(0);
}

function closeIntro() {
  el.introModal.classList.remove("active");
  localStorage.setItem(LS.seenIntro, "true");
}

function checkIntro() {
  if (!localStorage.getItem(LS.seenIntro)) {
    openIntro();
  }
}

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

    // Wire 3D Tilt
    wireTilt(cardWrap);
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

  renderActionValueOptions();
}

function saveValues() {
  localStorage.setItem(LS.values, JSON.stringify(activeValues));
}

// =====================
// Sendero de los Pasos Pequeños
// =====================

function wirePathModule() {
  if (!el.actionForm) return;

  el.internalBarrier.addEventListener("input", () => {
    const suggested = suggestMindfulnessSkill(el.internalBarrier.value);
    if (suggested) {
      el.mindfulnessSkill.value = suggested;
      el.mindfulnessHint.textContent = `Sugerencia: ${suggested}.`;
    } else {
      el.mindfulnessHint.textContent = "Sugeriremos una habilidad según la barrera.";
    }
  });

  el.addInternalBarrier.addEventListener("click", () => {
    const text = (el.internalBarrier.value || "").trim();
    if (!text) {
      toast("Describe la barrera interna");
      return;
    }
    const skill = el.mindfulnessSkill.value;
    internalBarriers.push({ text, skill });
    el.internalBarrier.value = "";
    renderInternalBarriers();
  });

  el.addExternalBarrier.addEventListener("click", () => {
    const text = (el.externalBarrier.value || "").trim();
    const plan = (el.externalPlan.value || "").trim();
    if (!text || !plan) {
      toast("Completa barrera y plan");
      return;
    }
    externalBarriers.push({ text, plan });
    el.externalBarrier.value = "";
    el.externalPlan.value = "";
    renderExternalBarriers();
  });

  el.actionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const validation = validateActionForm();
    if (!validation.ok) {
      return;
    }
    pendingAction = buildActionDraft();
    renderCommitmentPanel();
  });

  el.declareCommitment.addEventListener("click", () => {
    if (!pendingAction) return;
    committedActions.unshift(pendingAction);
    saveActions();
    pendingAction = null;
    internalBarriers = [];
    externalBarriers = [];
    el.actionForm.reset();
    el.smartError.hidden = true;
    el.smartError.textContent = "";
    renderInternalBarriers();
    renderExternalBarriers();
    renderCommitmentPanel();
    renderActionsList();
    toast("Compromiso guardado");
  });

  el.shareCommitment.addEventListener("click", async () => {
    if (!pendingAction) return;
    const shareText = buildShareText(pendingAction);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mi compromiso", text: shareText });
      } catch {
        toast("No se pudo compartir");
      }
    } else {
      await navigator.clipboard?.writeText(shareText);
      toast("Copiado al portapapeles");
    }
  });
}

function renderActionValueOptions() {
  if (!el.actionValue) return;
  el.actionValue.innerHTML = "";

  if (activeValues.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Primero elige tus Top 10 valores";
    el.actionValue.appendChild(opt);
    el.actionValue.disabled = true;
    el.valueHint.textContent = "Necesitas al menos un valor seleccionado para crear acciones.";
    return;
  }

  el.actionValue.disabled = false;
  el.valueHint.textContent = "Selecciona un valor para anclar tu acción.";
  activeValues.forEach(value => {
    const opt = document.createElement("option");
    opt.value = String(value.id);
    opt.textContent = value.name;
    el.actionValue.appendChild(opt);
  });
}

function validateActionForm() {
  const errors = [];
  if (activeValues.length === 0) errors.push("Selecciona al menos un valor.");
  const desc = (el.actionDesc.value || "").trim();
  if (!desc) errors.push("Describe la acción específica.");
  if (!el.smartMeaningful.checked) errors.push("Marca la alineación con el valor (M).");
  if (!el.smartAdaptive.checked) errors.push("Marca la mejora de calidad de vida (A).");

  const hasTime = el.resTime.checked;
  const hasMoney = el.resMoney.checked;
  const hasSkills = el.resSkills.checked;
  if (!(hasTime && hasMoney && hasSkills)) {
    errors.push("Confirma disponibilidad de tiempo, dinero y habilidades (R).");
  }

  if (!el.actionDate.value) errors.push("Selecciona fecha y hora.");

  if (errors.length > 0) {
    el.smartError.hidden = false;
    el.smartError.textContent = errors.join(" ");
    toast("Revisa los campos marcados");
    return { ok: false };
  }

  el.smartError.hidden = true;
  el.smartError.textContent = "";
  return { ok: true };
}

function buildActionDraft() {
  const valueId = Number(el.actionValue.value);
  const valueObj = activeValues.find(v => v.id === valueId);

  return {
    id: `act_${Date.now()}`,
    valueId,
    valueName: valueObj?.name ?? "Valor",
    descripcion: el.actionDesc.value.trim(),
    area: el.actionArea.value,
    fechaCompromiso: el.actionDate.value,
    parametrosSMART: {
      meaningful: el.smartMeaningful.checked,
      adaptive: el.smartAdaptive.checked,
      realistic: {
        time: el.resTime.checked,
        money: el.resMoney.checked,
        skills: el.resSkills.checked
      }
    },
    barrerasInternas: [...internalBarriers],
    barrerasExternas: [...externalBarriers],
    status: "Pendiente",
    createdAt: new Date().toISOString()
  };
}

function renderCommitmentPanel() {
  if (!pendingAction) {
    el.commitmentPanel.hidden = true;
    el.commitmentSummary.textContent = "";
    return;
  }

  el.commitmentPanel.hidden = false;
  el.commitmentStatus.textContent = pendingAction.status;
  el.commitmentStatus.classList.toggle("done", pendingAction.status === "Realizada");

  el.commitmentSummary.innerHTML = `
    <strong>Valor:</strong> ${escapeHTML(pendingAction.valueName)}<br />
    <strong>Acción:</strong> ${escapeHTML(pendingAction.descripcion)}<br />
    <strong>Fecha:</strong> ${formatDateTime(pendingAction.fechaCompromiso)}<br />
    <strong>Barreras internas:</strong> ${pendingAction.barrerasInternas.length || "Sin registrar"}<br />
    <strong>Barreras externas:</strong> ${pendingAction.barrerasExternas.length || "Sin registrar"}
  `;
}

function renderInternalBarriers() {
  el.internalList.innerHTML = "";
  internalBarriers.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "card-panel";
    li.innerHTML = `
      <div class="panel-title">
        <span>${escapeHTML(item.text)}</span>
        <button class="mini-btn" type="button" data-index="${index}">✕</button>
      </div>
      <div class="hint">Habilidad: ${escapeHTML(item.skill)}</div>
    `;
    li.querySelector("button")?.addEventListener("click", () => {
      internalBarriers.splice(index, 1);
      renderInternalBarriers();
    });
    el.internalList.appendChild(li);
  });
}

function renderExternalBarriers() {
  el.externalList.innerHTML = "";
  externalBarriers.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "card-panel";
    li.innerHTML = `
      <div class="panel-title">
        <span>${escapeHTML(item.text)}</span>
        <button class="mini-btn" type="button" data-index="${index}">✕</button>
      </div>
      <div class="hint">Plan: ${escapeHTML(item.plan)}</div>
    `;
    li.querySelector("button")?.addEventListener("click", () => {
      externalBarriers.splice(index, 1);
      renderExternalBarriers();
    });
    el.externalList.appendChild(li);
  });
}

function renderActionsList() {
  if (!el.actionsList) return;
  el.actionsList.innerHTML = "";

  if (!committedActions.length) {
    const empty = document.createElement("li");
    empty.className = "hint";
    empty.textContent = "Aún no hay acciones comprometidas.";
    el.actionsList.appendChild(empty);
    return;
  }

  committedActions.forEach(action => {
    const li = document.createElement("li");
    li.className = "card-panel";
    li.innerHTML = `
      <div class="panel-title">
        <span>${escapeHTML(action.descripcion)}</span>
        <span class="status-pill ${action.status === "Realizada" ? "done" : ""}">${action.status}</span>
      </div>
      <div class="hint">
        Valor: ${escapeHTML(action.valueName)} · Área: ${formatAreaLabel(action.area)} ·
        Fecha: ${formatDateTime(action.fechaCompromiso)}
      </div>
      <div class="inline-actions">
        ${action.status === "Pendiente" ? `<button class="btn primary" type="button" data-id="${action.id}">Marcar realizada</button>` : ""}
      </div>
    `;

    const btn = li.querySelector("button[data-id]");
    if (btn) {
      btn.addEventListener("click", () => markActionDone(action.id));
    }

    el.actionsList.appendChild(li);
  });
}

function markActionDone(actionId) {
  const action = committedActions.find(item => item.id === actionId);
  if (!action || action.status === "Realizada") return;
  action.status = "Realizada";
  saveActions();
  renderActionsList();
  toast("Bien hecho por actuar según tus valores");

  if (action.parametrosSMART?.meaningful) {
    updateBullseyeFromAction(action.area);
  }
}

function updateBullseyeFromAction(areaKey) {
  const current = getBullseye();
  const delta = 8;
  const updated = { ...current };
  if (areaKey === "work") updated.work = clampInt(current.work + delta, 0, 100);
  if (areaKey === "rel") updated.rel = clampInt(current.rel + delta, 0, 100);
  if (areaKey === "growth") updated.growth = clampInt(current.growth + delta, 0, 100);
  if (areaKey === "leisure") updated.leisure = clampInt(current.leisure + delta, 0, 100);
  setBullseye(updated, true);
}

function saveActions() {
  localStorage.setItem(LS.actions, JSON.stringify(committedActions));
}

function buildShareText(action) {
  return `Me comprometo con el valor "${action.valueName}". Acción: ${action.descripcion}. Fecha: ${formatDateTime(action.fechaCompromiso)}.`;
}

function formatDateTime(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

function formatAreaLabel(areaKey) {
  switch (areaKey) {
    case "work":
      return "Trabajo/Educación";
    case "leisure":
      return "Tiempo libre";
    case "rel":
      return "Relaciones";
    case "growth":
      return "Salud";
    default:
      return "Área";
  }
}

function suggestMindfulnessSkill(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes("ansiedad") || normalized.includes("miedo") || normalized.includes("estrés")) {
    return "Expansión";
  }
  if (normalized.includes("autocrítica") || normalized.includes("juicio") || normalized.includes("perfeccion")) {
    return "Defusión";
  }
  if (normalized.includes("pereza") || normalized.includes("apatía") || normalized.includes("desánimo")) {
    return "Contacto con valores";
  }
  if (normalized.includes("tristeza") || normalized.includes("culpa")) {
    return "Autocompasión";
  }
  return "";
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
    const isBull = which === "bullseye";

    el.viewValues.classList.toggle("active", isValues);
    el.viewBull.classList.toggle("active", isBull);
    el.viewPath.classList.toggle("active", which === "path");

    el.tabValues.classList.toggle("active", isValues);
    el.tabBull.classList.toggle("active", isBull);
    el.tabPath.classList.toggle("active", which === "path");

    el.tabValues.setAttribute("aria-selected", isValues ? "true" : "false");
    el.tabBull.setAttribute("aria-selected", isBull ? "true" : "false");
    el.tabPath.setAttribute("aria-selected", which === "path" ? "true" : "false");
  };

  el.tabValues.addEventListener("click", () => activate("values"));
  el.tabBull.addEventListener("click", () => activate("bullseye"));
  el.tabPath.addEventListener("click", () => activate("path"));
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
    localStorage.removeItem(LS.actions);
    localStorage.removeItem(LS.seenIntro);

    activeValues = [];
    committedActions = [];
    pendingAction = null;
    internalBarriers = [];
    externalBarriers = [];
    document.body.classList.remove("dark-theme");
    el.themeBtn.textContent = "🌙";

    renderCards();
    renderActiveList();
    setBullseye({ work: 50, rel: 50, growth: 50, leisure: 50 }, false);
    renderActionsList();
    renderCommitmentPanel();

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

// =====================
// 3D Tilt & Spotlight Effect
// =====================

function wireTilt(card) {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    // Tilt (Rotate Amplitude 14 deg)
    // Normalized coords: -1 to 1
    const xPct = (x / rect.width - 0.5) * 2;
    const yPct = (y / rect.height - 0.5) * 2;

    const rX = yPct * -14;
    const rY = xPct * 14;

    card.style.setProperty("--rotate-x", `${rX}deg`);
    card.style.setProperty("--rotate-y", `${rY}deg`);
    card.style.setProperty("--scale", "1.1");
  });

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
    card.style.setProperty("--scale", "1");
    // Do not reset mouse-x/y to keep the spotlight where it left off (optional) or let it fade
  });
}

// Global listener removed in favor of per-card wireTilt

