"use strict";

import { escapeHTML, LS, safeJSONParse, toast } from "./utils.js";
import { SoundFX, isSoundEnabled } from "./audio.js";
import { CompassAvatar } from "./avatar.js";

// Ramas fijas del arroyo, cada una con la franja vertical (% de alto) que
// alcanza a tocar desde su borde. Sirven para el detalle clásico del
// ejercicio: a veces un pensamiento se queda un momento enganchado en una
// rama antes de soltarse solo y seguir flotando; no se fuerza a que avance.
const STREAM_BRANCHES = [
  { xPercent: 22, side: "top", reachMax: 34 },
  { xPercent: 52, side: "bottom", reachMin: 66 },
  { xPercent: 80, side: "top", reachMax: 30 }
];

// Tronquito con un par de ramitas, dibujado con dos trazos superpuestos
// (uno oscuro debajo, uno claro encima) para sugerir el volumen de la
// madera en vez de una forma sólida y redondeada.
const BRANCH_SVG = `
  <svg viewBox="0 0 90 26" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8 C 18 4, 34 14, 50 9 C 64 5, 76 10, 88 7" stroke="#5c3a21" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M2 8 C 18 4, 34 14, 50 9 C 64 5, 76 10, 88 7" stroke="#8b5e34" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M30 10 L 24 20" stroke="#5c3a21" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M58 8 L 64 1" stroke="#5c3a21" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>
`;

function renderStreamBranches(streamEl) {
  if (!streamEl || streamEl.querySelector(".stream-branch")) return;
  STREAM_BRANCHES.forEach(b => {
    const branch = document.createElement("div");
    branch.className = `stream-branch stream-branch-${b.side}`;
    branch.style.left = `${b.xPercent}%`;
    branch.innerHTML = BRANCH_SVG;
    branch.setAttribute("aria-hidden", "true");
    streamEl.appendChild(branch);
  });
}

export function initLeavesModule() {
  const guideBtn = document.getElementById("toggleLeavesGuide");
  const guidePanel = document.getElementById("leavesGuidePanel");
  const leafInput = document.getElementById("leafInput");
  const addLeafBtn = document.getElementById("addLeafBtn");

  renderStreamBranches(document.getElementById("streamCanvas"));
  initWaterCanvas();

  // Toggle Clinical Guide
  guideBtn?.addEventListener("click", () => {
    const isHidden = guidePanel.style.display === "none" || !guidePanel.style.display;
    guidePanel.style.display = isHidden ? "block" : "none";
    guideBtn.setAttribute("aria-expanded", String(isHidden));
  });

  // Launch leaf on Enter or Button click
  leafInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLaunchLeaf();
    }
  });

  addLeafBtn?.addEventListener("click", () => {
    handleLaunchLeaf();
  });

  // Clinical Grounding Persistence
  initGroundingFields();
}

function handleLaunchLeaf() {
  const leafInput = document.getElementById("leafInput");
  const text = (leafInput?.value || "").trim();
  if (!text) {
    toast("Escribe un pensamiento para colocarlo en la hoja");
    return;
  }

  launchLeaf(text);
  if (leafInput) leafInput.value = "";
}

// Un pensamiento que se va para siempre en su primera pasada no se parece al
// ejercicio real. En la versión clínica el pensamiento pegajoso regresa, y el
// trabajo consiste justo en volver a ponerlo sobre otra hoja sin discutir con
// él. Estas cifras modelan ese regreso: la probabilidad cae con cada vuelta,
// porque el pensamiento se va soltando, no porque lo hayamos expulsado.
const RETURN_CHANCE = [0.7, 0.45, 0.25];
const RETURN_DELAY_MS = [3500, 11000];
const MAX_LEAVES_ON_STREAM = 12;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const randBetween = (min, max) => min + Math.random() * (max - min);

// Curvas de avance distintas para cada tramo: mezclarlas evita que el ojo
// reconozca el mismo "empujón" repetido en todas las hojas.
const DRIFT_EASES = ["sine.inOut", "sine.out", "power1.inOut", "power1.out", "none"];

function scheduleReturn(text, returnCount) {
  const chance = RETURN_CHANCE[returnCount];
  if (chance === undefined || Math.random() >= chance) return;

  setTimeout(() => {
    const container = document.getElementById("leavesContainer");
    // Si la pestaña Hojas no está a la vista, el regreso se descarta: animar
    // sobre un contenedor de 0x0 produce trayectorias absurdas y hojas
    // acumuladas que el usuario nunca llega a ver.
    if (!container || !container.offsetParent) return;
    if (container.childElementCount >= MAX_LEAVES_ON_STREAM) return;
    launchLeaf(text, { returnCount: returnCount + 1 });
  }, randBetween(RETURN_DELAY_MS[0], RETURN_DELAY_MS[1]));
}

// El recorrido se arma como una serie de puntos sueltos, no como una recta
// con tres paradas fijas: cada tramo termina donde le toca al azar, la hoja
// se desplaza de carril mientras avanza y arrastra con una resistencia
// propia. Dos hojas nunca describen la misma línea sobre el agua.
function buildDriftPath(yStart) {
  const legs = 4 + Math.floor(Math.random() * 3); // 4 a 6 tramos
  const cuts = [];
  for (let i = 1; i < legs; i++) {
    cuts.push(clamp(i / legs + randBetween(-0.45, 0.45) / legs, 0.06, 0.94));
  }
  cuts.sort((a, b) => a - b);
  cuts.push(1);

  let y = yStart;
  return cuts.map(progress => {
    y = clamp(y + randBetween(-9, 9), 8, 84);
    return {
      progress,
      y,
      rotation: randBetween(-16, 16),
      drag: randBetween(0.55, 1.6),
      ease: DRIFT_EASES[Math.floor(Math.random() * DRIFT_EASES.length)]
    };
  });
}

function yAtProgress(points, target, yStart) {
  let prevProgress = 0;
  let prevY = yStart;
  for (const point of points) {
    if (point.progress >= target) {
      const span = point.progress - prevProgress;
      const t = span > 0 ? (target - prevProgress) / span : 0;
      return prevY + (point.y - prevY) * t;
    }
    prevProgress = point.progress;
    prevY = point.y;
  }
  return prevY;
}

function insertCatchPoint(points, catchProgress, yStart) {
  const point = {
    progress: catchProgress,
    y: yAtProgress(points, catchProgress, yStart),
    rotation: randBetween(-8, 8),
    drag: randBetween(0.8, 1.2),
    ease: "sine.inOut",
    catch: true
  };
  const idx = points.findIndex(p => p.progress > catchProgress);
  if (idx === -1) points.push(point); else points.splice(idx, 0, point);
  return points;
}

// Un remolino: la hoja retrocede un poco antes de que la corriente vuelva a
// llevársela. No le pasa a todas, y ahí está la gracia.
function addEddy(points) {
  const spots = points
    .map((p, i) => (i > 0 && i < points.length - 1 && !p.catch ? i : -1))
    .filter(i => i !== -1);
  if (spots.length === 0) return points;

  const i = spots[Math.floor(Math.random() * spots.length)];
  const anchor = points[i];
  points.splice(i + 1, 0, {
    progress: Math.max(0.04, anchor.progress - randBetween(0.03, 0.07)),
    y: clamp(anchor.y + randBetween(-5, 5), 8, 84),
    rotation: -anchor.rotation * 0.6,
    drag: randBetween(1.4, 2.2),
    ease: "sine.inOut"
  });
  return points;
}

export function launchLeaf(text, options = {}) {
  const container = document.getElementById("leavesContainer");
  if (!container) return;

  const returnCount = options.returnCount || 0;
  const isReturn = returnCount > 0;

  const safeText = escapeHTML(text);
  const yPos = randBetween(12, 76);
  const leafEl = document.createElement("div");
  leafEl.className = isReturn ? "leaf-item leaf-item-return" : "leaf-item";
  leafEl.style.top = `${yPos}%`;
  leafEl.innerHTML = `<span class="leaf-icon">🍃</span> <span class="leaf-text">${safeText}</span>` +
    (isReturn ? " <span class=\"leaf-return-mark\" aria-label=\"Este pensamiento volvió\" title=\"Este pensamiento volvió\">↺</span>" : "");
  container.appendChild(leafEl);

  // La hoja que regresa llega sola, sin que nadie pulse nada: un clic ahí
  // sonaría a error del sistema y no a pensamiento que vuelve.
  if (isSoundEnabled() && !isReturn) SoundFX.click();

  const cWidth = container.offsetWidth || window.innerWidth || 600;
  const cHeight = container.offsetHeight || 250;
  const startX = -220; // Coincide con el `left: -220px` fijo del CSS del `.leaf-item`
  const targetX = cWidth + 280;
  const trackLength = targetX - startX;
  const totalDuration = randBetween(11, 20);
  const startRotation = randBetween(-14, 14);

  const xAt = (progress) => startX + trackLength * progress;
  // `top` ya fija el carril inicial en %, así que la deriva vertical se anima
  // como desplazamiento en píxeles respecto de ese carril.
  const yAt = (yPercent) => ((yPercent - yPos) / 100) * cHeight;

  // Convierte un punto visual del arroyo (0-100% del ancho) en la coordenada
  // `x` que anima la hoja, que se mide como desplazamiento respecto al
  // `left: -220px` fijo del CSS (por eso el +220).
  const xForPercent = (percent) => (percent / 100) * cWidth + 220;

  let points = buildDriftPath(yPos);

  // Solo puede engancharse en una rama cuya franja vertical coincide con la
  // altura a la que la hoja pasa por debajo de ella, no con la altura en la
  // que empezó: ahora la hoja cambia de carril durante el recorrido. No
  // siempre hay una rama a esa altura, así que no todas las hojas se
  // detienen — igual que no todos los pensamientos se "atoran".
  const candidateBranches = STREAM_BRANCHES.filter(b => {
    const progress = (xForPercent(b.xPercent) - startX) / trackLength;
    if (progress <= 0.05 || progress >= 0.95) return false;
    const yThere = yAtProgress(points, progress, yPos);
    return b.side === "top" ? yThere <= b.reachMax : yThere >= b.reachMin;
  });
  const branch = candidateBranches.length > 0 && Math.random() < 0.45
    ? candidateBranches[Math.floor(Math.random() * candidateBranches.length)]
    : null;

  if (branch) {
    points = insertCatchPoint(points, (xForPercent(branch.xPercent) - startX) / trackLength, yPos);
  }
  if (Math.random() < 0.35) {
    points = addEddy(points);
  }

  // Cada tramo dura según lo que recorre y la resistencia que le tocó; el
  // total se normaliza para que la hoja cruce en el tiempo previsto aunque
  // haya dado un rodeo.
  let prevProgress = 0;
  const weights = points.map(p => {
    const w = Math.max(0.02, Math.abs(p.progress - prevProgress)) * p.drag;
    prevProgress = p.progress;
    return w;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const durations = weights.map(w => totalDuration * (w / totalWeight));
  const pauseDuration = branch ? randBetween(1.6, 3.8) : 0;

  const bobAmplitude = randBetween(18, 42); // % de la altura de la propia hoja
  const bobDuration = randBetween(0.9, 2.1);

  if (window.gsap) {
    gsap.set(leafEl, {
      x: startX,
      y: 0,
      yPercent: -bobAmplitude / 2,
      rotation: startRotation,
      scale: randBetween(0.92, 1.06)
    });

    // Cabeceo vertical corto e independiente del avance: se anima en
    // `yPercent` para no pelearse con la deriva de carril, que usa `y`.
    gsap.to(leafEl, {
      yPercent: bobAmplitude / 2,
      duration: bobDuration,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: Math.random()
    });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.killTweensOf(leafEl);
        leafEl.remove();
        scheduleReturn(text, returnCount);
      }
    });

    points.forEach((point, i) => {
      tl.to(leafEl, {
        x: xAt(point.progress),
        y: yAt(point.y),
        rotation: point.rotation,
        duration: durations[i],
        ease: point.ease
      });
      if (point.catch) {
        // Forcejeo leve sin avanzar: la corriente empuja la hoja contra la
        // rama un momento antes de que se suelte sola.
        tl.to(leafEl, {
          rotation: `+=${randBetween(5, 11)}`,
          duration: pauseDuration / 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1
        });
      }
    });
  } else {
    // Web Animations API fallback: los mismos puntos traducidos a keyframes
    // con offsets, para conservar el recorrido irregular sin GSAP.
    const totalSeconds = totalDuration + pauseDuration;
    const keyframes = [{ transform: `translate(${startX}px, 0px) rotate(${startRotation}deg)`, offset: 0 }];
    let elapsed = 0;

    points.forEach((point, i) => {
      elapsed += durations[i];
      const transform = `translate(${xAt(point.progress)}px, ${yAt(point.y)}px)`;
      keyframes.push({
        transform: `${transform} rotate(${point.rotation}deg)`,
        offset: clamp(elapsed / totalSeconds, 0, 1)
      });
      if (point.catch) {
        elapsed += pauseDuration;
        keyframes.push({
          transform: `${transform} rotate(${point.rotation + 7}deg)`,
          offset: clamp(elapsed / totalSeconds, 0, 1)
        });
      }
    });

    const anim = leafEl.animate(keyframes, {
      duration: totalSeconds * 1000,
      easing: "ease-in-out",
      fill: "forwards"
    });
    anim.onfinish = () => {
      leafEl.remove();
      scheduleReturn(text, returnCount);
    };
  }

  // El avatar no comenta cada regreso: si hablara siempre, la práctica se
  // volvería una conversación y no una observación.
  if (!isReturn || Math.random() < 0.5) {
    const quote = pickQuote(isReturn ? returnQuotes : launchQuotes);
    setTimeout(() => {
      CompassAvatar.speak(quote, "neutral");
    }, isReturn ? 600 : 1000);
  }
}

// Frases de aliento del avatar al lanzar una hoja.
const launchQuotes = [
  "Mira cómo la corriente se lleva el pensamiento sin luchar con él.",
  "El pensamiento sigue de largo. Tú sigues en la orilla.",
  "No es necesario retenerlo ni empujarlo; solo déjalo flotar."
];

// Cuando el pensamiento vuelve no hay nada que reparar: en el ejercicio
// original volver forma parte del guion, no es una falla de la práctica.
const returnQuotes = [
  "Volvió. Ponlo otra vez sobre una hoja; ese es todo el trabajo.",
  "Los pensamientos pegajosos regresan. Notarlo ya es desengancharse.",
  "Otra vez el mismo. No lo discutas: obsérvalo pasar de nuevo.",
  "Que vuelva no significa que hayas fallado. Vuelve a soltarlo."
];

// Se evita repetir la misma frase dos veces seguidas dentro de un mismo grupo
// para que el avatar no suene como un pensamiento en bucle, justo lo
// contrario de lo que busca este ejercicio.
const lastQuoteIndex = new Map();

function pickQuote(pool) {
  if (pool.length <= 1) return pool[0];
  const last = lastQuoteIndex.get(pool);
  let index;
  do {
    index = Math.floor(Math.random() * pool.length);
  } while (index === last);
  lastQuoteIndex.set(pool, index);
  return pool[index];
}

function initGroundingFields() {
  const saved = safeJSONParse(localStorage.getItem(LS.leavesGrounding), {});
  const fields = ["contexto", "aprendizaje", "accion"];

  fields.forEach(field => {
    const inputEl = document.getElementById(`hojas-${field}`);
    if (!inputEl) return;

    if (saved[field]) {
      inputEl.value = saved[field];
    }

    inputEl.addEventListener("input", () => {
      saved[field] = inputEl.value;
      localStorage.setItem(LS.leavesGrounding, JSON.stringify(saved));
    });
  });
}

// Dibuja el agua del arroyo con capas de ondas y destellos generados al azar
// en cada carga, para que nunca se vea como un patrón repetitivo estático.
function initWaterCanvas() {
  const canvas = document.getElementById("streamWaterCanvas");
  const container = document.getElementById("streamCanvas");
  if (!canvas || !container) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let width = 0, height = 0, rafId = null, startTime = null;

  const rand = (min, max) => min + Math.random() * (max - min);

  // Cada capa de onda tiene su propia amplitud, frecuencia, velocidad y
  // dirección: al combinarlas se rompe cualquier apariencia de repetición.
  const waveLayers = Array.from({ length: 4 }, (_, i) => ({
    amplitude: rand(9, 22),
    frequency: rand(0.006, 0.018),
    speed: rand(0.2, 0.5) * (i % 2 === 0 ? 1 : -1),
    phase: rand(0, Math.PI * 2),
    baseY: 0.22 + i * 0.2 + rand(-0.05, 0.05),
    hue: ["#7dd3fc", "#38bdf8", "#bae6fd", "#e0f2fe"][i % 4],
    alpha: rand(0.16, 0.28)
  }));

  // Manchas de luz tipo cáustica (como sol reflejado en el agua): cada una
  // deriva lentamente y respira en tamaño/opacidad con su propio ritmo.
  const caustics = Array.from({ length: 7 }, () => ({
    x: Math.random(),
    y: rand(0.1, 0.9),
    radius: rand(30, 70),
    phase: rand(0, Math.PI * 2),
    pulseSpeed: rand(0.3, 0.7),
    driftX: rand(-0.01, 0.01),
    driftY: rand(-0.004, 0.004)
  }));

  // Destellos de luz pequeños y brillantes flotando sobre el agua, cada uno
  // con su propio tamaño, fase de parpadeo y deriva horizontal.
  const sparkles = Array.from({ length: 26 }, () => ({
    x: Math.random(),
    y: rand(0.08, 0.92),
    size: rand(1.2, 3.2),
    phase: rand(0, Math.PI * 2),
    blinkSpeed: rand(0.6, 1.8),
    drift: rand(0.005, 0.014)
  }));

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
  waveLayers.forEach(l => { l.rgb = hexToRgb(l.hue); });

  function drawFrame(t) {
    ctx.clearRect(0, 0, width, height);

    // Ondas: bandas translúcidas superpuestas que fluyen a distinta
    // velocidad y dirección, creando profundidad en vez de un patrón plano.
    waveLayers.forEach(layer => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      const step = Math.max(6, width / 60);
      for (let x = 0; x <= width + step; x += step) {
        const y = height * layer.baseY +
          Math.sin(x * layer.frequency + layer.phase + t * layer.speed) * layer.amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = `rgba(${layer.rgb}, ${layer.alpha.toFixed(3)})`;
      ctx.fill();
    });

    // Cáusticas: manchas de luz suaves que laten y derivan, como el
    // reflejo del sol atravesando la superficie del agua.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    caustics.forEach(c => {
      const pulse = (Math.sin(t * c.pulseSpeed + c.phase) + 1) / 2;
      const cx = ((c.x + t * c.driftX) % 1.15 + 1.15) % 1.15 * width - width * 0.075;
      const cy = ((c.y + t * c.driftY) % 1.15 + 1.15) % 1.15 * height - height * 0.075;
      const r = c.radius * (0.75 + pulse * 0.5);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(255, 255, 255, ${(0.16 + pulse * 0.14).toFixed(3)})`);
      grad.addColorStop(0.6, `rgba(224, 242, 254, ${(0.08 + pulse * 0.06).toFixed(3)})`);
      grad.addColorStop(1, "rgba(224, 242, 254, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Destellos: puntos de brillo pequeños con parpadeo propio.
    sparkles.forEach(s => {
      const twinkle = 0.2 + (Math.sin(t * s.blinkSpeed + s.phase) + 1) / 2 * 0.65;
      const x = ((s.x + t * s.drift) % 1.04) * width;
      ctx.beginPath();
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 6;
      ctx.arc(x, s.y * height, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle.toFixed(3)})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function animate(timestamp) {
    if (startTime === null) startTime = timestamp;
    drawFrame((timestamp - startTime) / 1000);
    rafId = requestAnimationFrame(animate);
  }

  resize();

  if (prefersReducedMotion) {
    drawFrame(0);
  } else {
    rafId = requestAnimationFrame(animate);
  }

  // El contenedor arranca oculto (la pestaña Hojas no es la activa al
  // cargar), así que un simple listener de "resize" de window no basta:
  // ResizeObserver también dispara cuando el contenedor pasa de 0x0 a su
  // tamaño real al activar la pestaña.
  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (prefersReducedMotion) drawFrame(0);
    });
    resizeObserver.observe(container);
  } else {
    window.addEventListener("resize", () => {
      resize();
      if (prefersReducedMotion) drawFrame(0);
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (!prefersReducedMotion && rafId == null) {
      startTime = null;
      rafId = requestAnimationFrame(animate);
    }
  });

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
        } else if (!prefersReducedMotion && rafId == null && !document.hidden) {
          startTime = null;
          rafId = requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.05 });
    observer.observe(container);
  }
}
