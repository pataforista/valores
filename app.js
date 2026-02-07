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
let soundEnabled = localStorage.getItem("vv_sound_enabled") !== "false";

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
  closeIntroBtn: document.getElementById("closeIntroBtn"),

  // SOS Elements
  tabSos: document.getElementById("tab-sos"),
  viewSos: document.getElementById("view-sos"),
  sosBtn: document.getElementById("sosBtn"),
  sosOverlay: document.getElementById("sosOverlay"),
  closeSosOverlay: document.getElementById("closeSosOverlay"),
  sosModalTitle: document.getElementById("sosModalTitle"),
  sosStepTitle: document.getElementById("sosStepTitle"),
  sosStepHint: document.getElementById("sosStepHint"),
  sosTapArea: document.getElementById("sosTapArea"),
  sosTapCount: document.getElementById("sosTapCount"),
  sosProgressBar: document.getElementById("sosProgressBar"),
  sosNextBtn: document.getElementById("sosNextBtn"),
  sosIcon: document.getElementById("sosIcon"),
  sosIllustration: document.getElementById("sosIllustration"),
  sosCountdown: document.getElementById("sosCountdown"),
  sosCountdownValue: document.getElementById("sosCountdownValue"),

  breathToggle: document.getElementById("breathToggle"),
  breathPhase: document.getElementById("breathPhase"),
  breathTimer: document.getElementById("breathTimer"),
  breathCircle: document.getElementById("breathCircle"),
  breathCircleInner: document.getElementById("breathCircleInner"),

  noiseToggle: document.getElementById("noiseToggle"),
  noiseVol: document.getElementById("noiseVol"),
  actSosBtn: document.getElementById("actSosBtn"),
  dbtSosBtn: document.getElementById("dbtSosBtn"),
  tipTempBtn: document.getElementById("tipTempBtn"),
  tipExerciseBtn: document.getElementById("tipExerciseBtn"),
  tipBreathBtn: document.getElementById("tipBreathBtn"),
  tipRelaxBtn: document.getElementById("tipRelaxBtn"),
  soundBtn: document.getElementById("soundBtn")
};

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  wireTabs();
  wireTheme();
  wireResetAll();
  wireExport(); // New export feature
  wireCustomAdd();
  wirePathModule();
  wireIntro();

  // Manual Save (User Request)
  const manualSaveBtn = document.getElementById("manualSaveBtn");
  if (manualSaveBtn) {
    manualSaveBtn.addEventListener("click", () => {
      saveData();
      CompassAvatar.speak("¡Todo guardado en mi bitácora!", "happy");
      // Visual feedback
      manualSaveBtn.textContent = "✅";
      setTimeout(() => manualSaveBtn.textContent = "💾", 1500);
    });
  }

  renderCards();
  renderActiveList();
  renderActionValueOptions();
  renderActionsList();

  loadBullseye();
  wireBullseye();
  updateBullseyeVisual();

  updateBullseyeVisual();

  checkIntro();
  initAvatar(); // Start the Compass
  wireSoundToggle();
  wireSosModule();

  // Global focus reactions
  const inputs = document.querySelectorAll("input[type='text'], textarea");
  inputs.forEach(inp => {
    inp.addEventListener("focus", () => {
      // Only sometimes
      if (Math.random() > 0.7) CompassAvatar.speak("Te escucho... escríbelo.", "neutral");
    });
  });
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
    // Tooltip
    const tip = document.createElement("div");
    tip.className = "card-tooltip";
    tip.textContent = "Ver Carta"; // "Caption"
    cardWrap.appendChild(tip);

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

function saveData() {
  saveValues();
  saveActions();
  saveBullseye();
  console.log("Manual save triggered.");
}

// =====================
// Sendero de los Pasos Pequeños
// =====================

function wirePathModule() {
  if (!el.actionForm) return;

  el.internalBarrier.addEventListener("input", () => {
    // Optional: clear hint if user types
    // el.mindfulnessHint.textContent = "Sugeriremos una habilidad según la barrera.";
  });

  // New "Sugerir" button logic
  const suggestBtn = document.getElementById("suggestSkillBtn");
  if (suggestBtn) {
    suggestBtn.addEventListener("click", () => {
      const val = el.internalBarrier.value;
      if (!val.trim()) {
        toast("Escribe una barrera primero");
        CompassAvatar.speak("Escribe qué sientes para ayudarte.", "neutral");
        return;
      }
      const suggested = suggestMindfulnessSkill(val);
      if (suggested) {
        el.mindfulnessSkill.value = suggested;
        el.mindfulnessHint.textContent = `💡 Sugerencia: ${suggested}.`;
        el.mindfulnessHint.style.color = "var(--primary)";
        // Avatar reaction
        CompassAvatar.speak(`Creo que "${suggested}" te ayudaría con eso.`, "happy");
      } else {
        el.mindfulnessHint.textContent = "No encontré una sugerencia exacta, elige la que mejor te calce.";
        CompassAvatar.speak("Mmm, elige la habilidad que sientas mejor.", "worried");
      }
    });
  }

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
    CompassAvatar.speak("¡Excelente! Ahora declara tu compromiso.", "happy");
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
        ${action.status === "Pendiente" ? `<button class="btn primary" type="button" data-action="complete" data-id="${action.id}">Marcar realizada</button>` : ""}
        <button class="btn danger" type="button" data-action="delete" data-id="${action.id}">Borrar</button>
      </div>
    `;

    const completeBtn = li.querySelector("button[data-action='complete']");
    if (completeBtn) completeBtn.addEventListener("click", () => markActionDone(action.id));

    const deleteBtn = li.querySelector("button[data-action='delete']");
    if (deleteBtn) deleteBtn.addEventListener("click", () => deleteAction(action.id));

    el.actionsList.appendChild(li);
  });
}

function deleteAction(actionId) {
  if (confirm("¿Estás seguro de que quieres borrar este compromiso?")) {
    const idx = committedActions.findIndex(a => a.id === actionId);
    if (idx >= 0) {
      committedActions.splice(idx, 1);
      saveActions();
      renderActionsList();
      toast("Compromiso eliminado");
      CompassAvatar.speak("Entendido, compromiso eliminado.", "neutral");
    }
  }
}

function markActionDone(actionId) {
  const action = committedActions.find(item => item.id === actionId);
  if (!action || action.status === "Realizada") return;
  action.status = "Realizada";
  saveActions();
  renderActionsList();
  saveActions();
  renderActionsList();
  toast("Bien hecho por actuar según tus valores");
  CompassAvatar.speak("¡Muy bien! Un paso más en tu camino.", "happy");

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

  // Avatar React
  if (Math.random() > 0.5) {
    CompassAvatar.speak("¡Organiza lo que es vital para ti!", "happy");
  }
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
    // Interaction on change confirm (change vs input)
    x.addEventListener("change", () => {
      CompassAvatar.speak("Buscando el equilibrio...", "neutral");
    });
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
    const views = [el.viewValues, el.viewBull, el.viewPath, el.viewSos];
    const tabs = [el.tabValues, el.tabBull, el.tabPath, el.tabSos];
    const keys = ["values", "bullseye", "path", "sos"];

    keys.forEach((key, i) => {
      const active = key === which;
      if (views[i]) views[i].classList.toggle("active", active);
      if (tabs[i]) tabs[i].classList.toggle("active", active);
      if (tabs[i]) tabs[i].setAttribute("aria-selected", active ? "true" : "false");
    });

    // Avatar Guidance
    if (which === "values") {
      CompassAvatar.speak("Los valores son direcciones de vida, no destinos.", "neutral");
    } else if (which === "bullseye") {
      CompassAvatar.speak("La Diana te ayuda a ver si estás dando en el blanco.", "neutral");
    } else if (which === "path") {
      CompassAvatar.speak("Definamos metas SMART. ¿Sabes qué significa?", "happy");
      setTimeout(() => {
        CompassAvatar.speak("S: Specific, M: Meaningful, A: Adaptive, R: Realistic, T: Time-bound.", "neutral");
      }, 4000);
    } else if (which === "sos") {
      CompassAvatar.speak("Herramientas de calma inmediata. Aquí estoy contigo.", "neutral");
    }
  };

  el.tabValues.addEventListener("click", () => activate("values"));
  el.tabBull.addEventListener("click", () => activate("bullseye"));
  el.tabPath.addEventListener("click", () => activate("path"));
  el.tabSos.addEventListener("click", () => activate("sos"));
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
  // Modal elements
  const modal = document.getElementById("deleteModal");
  const cancel = document.getElementById("cancelDeleteBtn");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const timerDisplay = document.getElementById("deleteTimer");

  if (!modal) return;

  let timerInt = null;

  el.resetBtn.addEventListener("click", () => {
    modal.classList.add("active");
    // Start timer
    let timeLeft = 3;
    confirmBtn.disabled = true;
    confirmBtn.style.opacity = "0.5";
    timerDisplay.textContent = timeLeft;

    if (timerInt) clearInterval(timerInt);
    timerInt = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        timerDisplay.textContent = timeLeft;
      } else {
        timerDisplay.textContent = "⚠️";
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = "1";
        clearInterval(timerInt);
      }
    }, 1000);
    CompassAvatar.speak("Ten cuidado, esto borrará todo.", "worried");
  });

  cancel.addEventListener("click", () => {
    modal.classList.remove("active");
    if (timerInt) clearInterval(timerInt);
  });

  confirmBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    // Perform delete
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
    CompassAvatar.speak("Hecho. Empezamos de nuevo.", "neutral");
  });
}

function wireExport() {
  const btn = document.getElementById("exportBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const d = new Date().toLocaleDateString();
    let text = `--- Resumen de Valores (${d}) ---\n\n`;

    // 1. Valores
    if (activeValues.length > 0) {
      text += "🌟 Mis Valores Top:\n";
      activeValues.forEach((v, i) => {
        text += `${i + 1}. ${v.name}\n`;
      });
    } else {
      text += "🌟 Sin valores seleccionados aún.\n";
    }

    // 2. Bull's Eye
    const bulls = getBullseye();
    text += "\n🎯 Mi Diana (Satisfacción %):\n";
    text += `- Trabajo/Educación: ${bulls.work}%\n`;
    text += `- Relaciones: ${bulls.rel}%\n`;
    text += `- Crecimiento: ${bulls.growth}%\n`;
    text += `- Ocio: ${bulls.leisure}%\n`;

    // 3. Compromisos
    if (committedActions.length > 0) {
      text += "\n🚀 Mis Compromisos:\n";
      committedActions.forEach(a => {
        text += `- [${a.done ? "X" : " "}] ${a.title} (Sendero: ${a.barriers.length} barreras)\n`;
      });
    }

    copyToClipboard(text).then(ok => {
      if (ok) {
        toast("📋 ¡Copiado al portapapeles!");
        CompassAvatar.playSuccess();
      } else {
        toast("❌ Error al copiar");
      }
    });
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
// =====================
// Avatar (Brújula) Logic
// =====================
const CompassAvatar = (function () {
  let box, compass, bubble, bubbleText, pupilL, pupilR, shineL, shineR;
  let speakTimer, blinkTimer;
  const STATES = ["neutral", "happy", "worried", "tired", "surprised"];

  function init() {
    // Elements
    box = document.getElementById('avatarBox');
    const root = document.getElementById('avatarRoot');
    // If HTML not present, abort
    if (!box || !root) return;

    // Unhide
    root.hidden = false;

    compass = document.getElementById('compass');
    bubble = document.getElementById('avatarBubble');
    bubbleText = document.getElementById('avatarText');
    pupilL = document.getElementById('pupilL');
    pupilR = document.getElementById('pupilR');
    shineL = document.getElementById('shineL');
    shineR = document.getElementById('shineR');

    // Init state
    setState("neutral");

    // Start blink loop
    scheduleBlink();

    // Sound context init on first interaction (browser policy)
    document.body.addEventListener("click", initAudio, { once: true });

    // Click reaction
    box.addEventListener("click", () => {
      // Random reaction
      const r = Math.random();
      if (r < 0.33) speak("¡Aquí estoy! ¿Seguimos al norte?", "happy");
      else if (r < 0.66) speak("Tú tienes el control del timón.", "neutral");
      else speak("¡Bip bip! Lista para navegar.", "surprised");
    });

    // Eye tracking
    document.addEventListener("mousemove", (e) => {
      // Calculate relative to avatar center
      const r = box.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const nx = (e.clientX - cx) / (r.width / 2); // -1 to 1 approx
      const ny = (e.clientY - cy) / (r.height / 2);

      // Limit range
      setPupilOffset(nx * 3.8, ny * 3.2);
    });

    // Say hello initially
    setTimeout(() => {
      speak("Hola. Soy tu brújula: te acompaño en el camino.", "happy");
    }, 1000);
  }

  function scheduleBlink() {
    // Simple recurrent blink
    // The CSS animation 'blink' handles the motion, we just let it run or toggling class for random control.
    // Actually the user CSS has infinite animation: .blink .eyeLid { animation: blink 4.6s infinite; }
    // So we just ensure class is there.
    if (compass) compass.classList.add("blink");
  }

  function setState(next) {
    if (!compass) return;
    STATES.forEach(s => compass.classList.remove("state-" + s));
    compass.classList.add("state-" + next);
  }

  function speak(text, nextState) {
    if (!compass) return;
    if (nextState) setState(nextState);

    if (bubbleText) bubbleText.textContent = text;
    if (bubble) {
      bubble.classList.add("show");
      // Hide bubble after 5s
      clearTimeout(speakTimer);
      speakTimer = setTimeout(() => {
        bubble.classList.remove("show");
        // Revert to neutral after finished speaking? Optional.
        // setState("neutral");
      }, 5000);
    }

    compass.classList.add("talking");
    setTimeout(() => {
      compass.classList.remove("talking");
    }, 1500);

    playSound();
  }

  // --- Audio ---
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
  }

  function playSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    // Chirp effect: slide freq
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function setPupilOffset(dx, dy) {
    if (!pupilL) return;
    const x = clamp(dx, -3.2, 3.2);
    const y = clamp(dy, -2.6, 2.6);
    const xs = clamp(dx * 0.7, -2.2, 2.2);
    const ys = clamp(dy * 0.7, -1.8, 1.8);

    pupilL.style.setProperty("--px", x + "px");
    pupilL.style.setProperty("--py", y + "px");
    pupilR.style.setProperty("--px", x + "px");
    pupilR.style.setProperty("--py", y + "px");

    shineL.style.setProperty("--px", xs + "px");
    shineL.style.setProperty("--py", ys + "px");
    shineR.style.setProperty("--px", xs + "px");
    shineR.style.setProperty("--py", ys + "px");
  }

  return {
    init,
    speak,
    setState,
    playClick: () => { if (soundEnabled) playSound(); },
    playSuccess: () => { if (soundEnabled) SoundFX.success(); },
    playApproval: () => { if (soundEnabled) SoundFX.approval(); }
  };
})();

// =====================
// SoundFX Engine (Procedural)
// =====================
const SoundFX = (function () {
  function getCtx() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    return Ctx ? new Ctx() : null;
  }

  function play(freqs, type = "sine", duration = 0.1) {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;

    osc.frequency.setValueAtTime(freqs[0], now);
    if (freqs.length > 1) {
      osc.frequency.exponentialRampToValueAtTime(freqs[1], now + duration);
    }

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + duration + 0.05);
  }

  return {
    approval: () => {
      // Rising arpeggio
      play([440, 880], "triangle", 0.2);
      setTimeout(() => play([660, 1320], "triangle", 0.2), 100);
    },
    success: () => {
      // High chime
      play([1000, 1500], "sine", 0.3);
    },
    click: () => play([800, 1200], "sine", 0.1)
  };
})();

function wireSoundToggle() {
  const updateIcon = () => el.soundBtn.textContent = soundEnabled ? "🔊" : "🔈";
  updateIcon();
  el.soundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("vv_sound_enabled", soundEnabled);
    updateIcon();
    if (soundEnabled) SoundFX.approval();
  });
}

// =====================
// SOS Module (Steam Out)
// =====================
function wireSosModule() {
  if (!el.tabSos) return;

  const SOS_STEPS = [
    { title: "Mira 5 cosas", count: 5, hint: "Observa tu entorno y busca 5 objetos distintos." },
    { title: "Siente 4 cosas", count: 4, hint: "Toca texturas o nota el contacto de tu cuerpo." },
    { title: "Escucha 3 sonidos", count: 3, hint: "Presta atención a ruidos lejanos o cercanos." },
    { title: "Huele 2 aromas", count: 2, hint: "Busca olores en el ambiente o en tu ropa." },
    { title: "Saborea 1 cosa", count: 1, hint: "Nota el sabor en tu boca o imagina uno placentero." }
  ];

  let currentSosIdx = 0;
  let currentSosCount = 0;
  let tipTimer = null;
  let tipPhaseTimer = null;

  const clearTipTimers = () => {
    if (tipTimer) clearInterval(tipTimer);
    if (tipPhaseTimer) clearInterval(tipPhaseTimer);
    tipTimer = null;
    tipPhaseTimer = null;
  };

  const resetOverlayState = () => {
    clearTipTimers();
    el.sosTapArea.style.display = "none";
    el.sosIllustration.style.display = "block";
    el.sosCountdown.style.display = "none";
    el.sosNextBtn.style.display = "block";
    el.sosNextBtn.disabled = false;
    el.sosNextBtn.textContent = "Siguiente";
  };

  const openSos = () => {
    el.sosOverlay.hidden = false;
    currentSosIdx = 0;
    loadSosStep();
    CompassAvatar.speak("Estoy contigo. Vamos a anclarnos al presente.", "neutral");
  };

  const loadSosStep = () => {
    const step = SOS_STEPS[currentSosIdx];
    el.sosStepTitle.textContent = step.title;
    el.sosStepHint.textContent = step.hint;
    el.sosTapCount.textContent = "0";
    currentSosCount = 0;
    el.sosTapArea.style.display = "flex";
    el.sosCountdown.style.display = "none";
    el.sosNextBtn.textContent = "Siguiente";
    el.sosNextBtn.disabled = true;
    el.sosProgressBar.style.width = `${(currentSosIdx / SOS_STEPS.length) * 100}%`;
  };

  const handleSosNext = () => {
    currentSosIdx++;
    if (currentSosIdx < SOS_STEPS.length) {
      loadSosStep();
    } else {
      el.sosStepTitle.textContent = "Completado";
      el.sosStepHint.textContent = "Has vuelto al presente. Respira hondo.";
      el.sosTapArea.style.display = "none";
      el.sosProgressBar.style.width = "100%";
      el.sosNextBtn.style.display = "none";
      if (soundEnabled) SoundFX.success();
      CompassAvatar.speak("Lo has hecho muy bien. Te noto más en calma.", "happy");
    }
  };

  el.sosBtn.addEventListener("click", () => {
    el.sosNextBtn.onclick = handleSosNext;
    openSos();
  });
  el.closeSosOverlay.addEventListener("click", () => {
    clearTipTimers();
    el.sosOverlay.hidden = true;
  });

  el.sosTapArea.addEventListener("click", () => {
    currentSosCount++;
    el.sosTapCount.textContent = currentSosCount;
    if (soundEnabled) SoundFX.click();
    if (currentSosCount >= SOS_STEPS[currentSosIdx].count) {
      el.sosNextBtn.disabled = false;
      if (soundEnabled) SoundFX.approval();
    }
  });

  el.sosNextBtn.onclick = handleSosNext;

  // Breathing
  let breathing = false;
  let breathTimer;
  let breathPhaseIdx = 0;
  const phases = ["Inhala", "Sostén", "Exhala", "Sostén"];

  el.breathToggle.addEventListener("click", () => {
    breathing = !breathing;
    el.breathToggle.textContent = breathing ? "Detener" : "Iniciar";
    if (breathing) {
      startBreathing();
    } else {
      clearInterval(breathTimer);
      el.breathPhase.textContent = "Listo";
      el.breathCircle.style.transform = "scale(1)";
      el.breathCircleInner.style.transform = "scale(1)";
    }
  });

  function startBreathing() {
    breathPhaseIdx = 0;
    const run = () => {
      const phase = phases[breathPhaseIdx % 4];
      el.breathPhase.textContent = phase;
      const scale = (breathPhaseIdx % 4 === 0 || breathPhaseIdx % 4 === 1) ? "2.2" : "1";
      el.breathCircle.style.transform = `scale(${scale})`;
      el.breathCircleInner.style.transform = `scale(${scale})`;

      let timeLeft = 4;
      el.breathTimer.textContent = `${timeLeft}s`;
      const t = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0 || !breathing) clearInterval(t);
        else el.breathTimer.textContent = `${timeLeft}s`;
      }, 1000);

      breathPhaseIdx++;
    };
    run();
    breathTimer = setInterval(run, 4000);
  }

  // Noise
  let noiseCtx, noiseNode, noiseGain, noiseOn = false;
  el.noiseToggle.addEventListener("click", async () => {
    if (!noiseOn) {
      if (!noiseCtx) {
        noiseCtx = new (window.AudioContext || window.webkitAudioContext)();
        noiseGain = noiseCtx.createGain();
        noiseNode = createBrownNoise(noiseCtx);
        noiseNode.connect(noiseGain);
        noiseGain.connect(noiseCtx.destination);
      }
      noiseGain.gain.setValueAtTime(0, noiseCtx.currentTime);
      noiseGain.gain.linearRampToValueAtTime((el.noiseVol.value / 100) * 0.1, noiseCtx.currentTime + 1);
      await noiseCtx.resume();
      noiseOn = true;
      el.noiseToggle.textContent = "Apagar";
    } else {
      noiseGain.gain.linearRampToValueAtTime(0, noiseCtx.currentTime + 0.5);
      setTimeout(() => { if (!noiseOn) noiseCtx.suspend(); }, 500);
      noiseOn = false;
      el.noiseToggle.textContent = "Encender";
    }
  });

  function createBrownNoise(ctx) {
    const bufferSize = 4096;
    const node = ctx.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0.0;
    node.onaudioprocess = e => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 3.5;
      }
    };
    return node;
  }

  // ACT / DBT
  const runSteps = (title, steps, icon = "🧘") => {
    el.sosOverlay.hidden = false;
    el.sosModalTitle.textContent = title;
    el.sosIcon.textContent = icon;
    resetOverlayState();
    let stepIdx = 0;
    const loadStep = () => {
      el.sosStepTitle.textContent = steps[stepIdx].title;
      el.sosStepHint.textContent = steps[stepIdx].text;
      el.sosProgressBar.style.width = `${(stepIdx / steps.length) * 100}%`;
      el.sosNextBtn.disabled = false;
      el.sosNextBtn.style.display = "block";
    };
    loadStep();
    el.sosNextBtn.onclick = () => {
      stepIdx++;
      if (stepIdx < steps.length) loadStep();
      else {
        el.sosStepTitle.textContent = "Listo";
        el.sosStepHint.textContent = "Has completado el ejercicio.";
        el.sosProgressBar.style.width = "100%";
        el.sosNextBtn.style.display = "none";
        if (soundEnabled) SoundFX.success();
      }
    };
  };

  const runTipTimer = ({ title, icon, hint, seconds }) => {
    el.sosOverlay.hidden = false;
    el.sosModalTitle.textContent = title;
    el.sosIcon.textContent = icon;
    resetOverlayState();
    el.sosCountdown.style.display = "flex";
    el.sosStepTitle.textContent = "Cuenta regresiva";
    el.sosStepHint.textContent = hint;
    el.sosProgressBar.style.width = "0%";
    let remaining = seconds;
    el.sosCountdownValue.textContent = `${remaining}s`;
    tipTimer = setInterval(() => {
      remaining--;
      el.sosCountdownValue.textContent = `${Math.max(remaining, 0)}s`;
      const progress = ((seconds - remaining) / seconds) * 100;
      el.sosProgressBar.style.width = `${Math.min(progress, 100)}%`;
      if (remaining <= 0) {
        clearTipTimers();
        el.sosStepTitle.textContent = "Listo";
        el.sosStepHint.textContent = "Buen trabajo. Nota cómo baja la intensidad.";
        el.sosNextBtn.style.display = "none";
        if (soundEnabled) SoundFX.success();
      }
    }, 1000);
    el.sosNextBtn.textContent = "Cerrar";
    el.sosNextBtn.onclick = () => {
      clearTipTimers();
      el.sosOverlay.hidden = true;
    };
  };

  const runTipBreathing = () => {
    el.sosOverlay.hidden = false;
    el.sosModalTitle.textContent = "Respiración pausada";
    el.sosIcon.textContent = "🌬️";
    resetOverlayState();
    el.sosCountdown.style.display = "flex";
    el.sosProgressBar.style.width = "0%";
    el.sosNextBtn.textContent = "Cerrar";
    el.sosNextBtn.onclick = () => {
      clearTipTimers();
      el.sosOverlay.hidden = true;
    };
    const totalSeconds = 60;
    let elapsed = 0;
    let phase = "Inhala";
    let phaseSeconds = 4;
    el.sosStepTitle.textContent = phase;
    el.sosStepHint.textContent = "Inhala 4s, exhala 6s. Exhala más largo.";
    el.sosCountdownValue.textContent = `${totalSeconds}s`;
    const updatePhase = () => {
      phase = phase === "Inhala" ? "Exhala" : "Inhala";
      phaseSeconds = phase === "Inhala" ? 4 : 6;
      el.sosStepTitle.textContent = phase;
    };
    tipPhaseTimer = setInterval(() => {
      phaseSeconds--;
      if (phaseSeconds <= 0) updatePhase();
    }, 1000);
    tipTimer = setInterval(() => {
      elapsed++;
      const remaining = Math.max(totalSeconds - elapsed, 0);
      el.sosCountdownValue.textContent = `${remaining}s`;
      const progress = (elapsed / totalSeconds) * 100;
      el.sosProgressBar.style.width = `${Math.min(progress, 100)}%`;
      if (elapsed >= totalSeconds) {
        clearTipTimers();
        el.sosStepTitle.textContent = "Listo";
        el.sosStepHint.textContent = "Observa tu cuerpo: debería sentirse más estable.";
        el.sosNextBtn.style.display = "none";
        if (soundEnabled) SoundFX.success();
      }
    }, 1000);
  };

  const runTipRelax = () => {
    runSteps("Relajación muscular", [
      { title: "Manos y brazos", text: "Aprieta puños 5s al inhalar. Suelta con un suspiro." },
      { title: "Hombros y cuello", text: "Eleva hombros 5s. Suelta y deja caer." },
      { title: "Mandíbula", text: "Aprieta suave, luego relaja y separa." },
      { title: "Piernas", text: "Tensa muslos y pantorrillas 5s. Suelta." }
    ], "🧘‍♀️");
  };

  el.actSosBtn.addEventListener("click", () => {
    runSteps("ACT (Distancia)", [
      { title: "Observar", text: "Identifica lo que sientes (ansiedad, enojo, tensión). Ponle nombre." },
      { title: "Etiquetar", text: "Dite: 'Estoy teniendo el pensamiento de que...'" },
      { title: "Anclar", text: "Exhala lento 3 veces y siente el peso de tus pies." }
    ], "🧭");
  });

  el.dbtSosBtn.addEventListener("click", () => {
    runSteps("DBT (Cambio)", [
      { title: "Respirar", text: "Inhala 4s, exhala 6s. El cerebro se calma al exhalar largo." },
      { title: "Frío", text: "Toca algo frío o lávate la cara. Bloquea el estrés." },
      { title: "Mínimo", text: "Vuelve con la tarea más pequeña posible." }
    ], "🧘");
  });

  el.tipTempBtn.addEventListener("click", () => {
    runTipTimer({
      title: "TIP · Temperatura",
      icon: "🧊",
      hint: "Aplica hielo en mejillas o sumerge el rostro en agua fría.",
      seconds: 30
    });
  });

  el.tipExerciseBtn.addEventListener("click", () => {
    runTipTimer({
      title: "TIP · Intensidad",
      icon: "🏃‍♂️",
      hint: "Muévete al máximo: saltos, burpees o subir escaleras.",
      seconds: 60
    });
  });

  el.tipBreathBtn.addEventListener("click", runTipBreathing);
  el.tipRelaxBtn.addEventListener("click", runTipRelax);
}

// Robust clipboard helper
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API failed, using fallback", err);
  }

  // Fallback
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    document.body.removeChild(textarea);
    return false;
  }
}

function initAvatar() {
  CompassAvatar.init();

  // Global button click sound
  document.addEventListener("click", (e) => {
    // Try to init/resume audio on any click to comply with browser policies
    SoundFX.initContext();

    const t = e.target.closest("button, .btn, .card-container, a, .marker");
    if (t && soundEnabled) {
      CompassAvatar.playClick();
    }
  });
}
