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

export function launchLeaf(text) {
  const container = document.getElementById("leavesContainer");
  if (!container) return;

  const safeText = escapeHTML(text);
  const yPos = 15 + Math.random() * 60; // 15% to 75%
  const leafEl = document.createElement("div");
  leafEl.className = "leaf-item";
  leafEl.style.top = `${yPos}%`;
  leafEl.innerHTML = `<span class="leaf-icon">🍃</span> <span class="leaf-text">${safeText}</span>`;
  container.appendChild(leafEl);

  if (isSoundEnabled()) SoundFX.click();

  const cWidth = container.offsetWidth || window.innerWidth || 600;
  const startX = -220; // Coincide con el `left: -220px` fijo del CSS del `.leaf-item`
  const targetX = cWidth + 280;
  const totalDuration = 14 + Math.random() * 4;
  const randomRot = -12 + Math.random() * 24;

  // Convierte un punto visual del arroyo (0-100% del ancho) en la coordenada
  // `x` que anima la hoja, que se mide como desplazamiento respecto al
  // `left: -220px` fijo del CSS (por eso el +220).
  const xForPercent = (percent) => (percent / 100) * cWidth + 220;

  // Solo puede engancharse en una rama cuya franja vertical coincide con la
  // altura en la que flota esta hoja en particular, para que el enganche se
  // vea creíble. No siempre hay una rama a esa altura, así que no todas las
  // hojas se detienen — igual que no todos los pensamientos se "atoran".
  const candidateBranches = STREAM_BRANCHES.filter(b =>
    b.side === "top" ? yPos <= b.reachMax : yPos >= b.reachMin
  );
  const branch = candidateBranches.length > 0 && Math.random() < 0.45
    ? candidateBranches[Math.floor(Math.random() * candidateBranches.length)]
    : null;

  const bobAmplitude = 5 + Math.random() * 5;
  const bobDuration = 1 + Math.random() * 0.8;

  if (window.gsap) {
    gsap.set(leafEl, { x: startX, rotation: randomRot * -0.5 });

    // Bamboleo vertical continuo e independiente del avance horizontal, para
    // que el recorrido no se vea como una línea recta sobre la corriente.
    gsap.to(leafEl, {
      y: `+=${bobAmplitude}`,
      duration: bobDuration,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.killTweensOf(leafEl);
        leafEl.remove();
      }
    });

    if (branch) {
      const branchX = xForPercent(branch.xPercent);
      const pauseDuration = 1.6 + Math.random() * 2.2;
      const totalDist = targetX - startX;
      const distBefore = branchX - startX;
      const distAfter = targetX - branchX;

      tl.to(leafEl, {
        x: branchX,
        rotation: randomRot * 0.35,
        duration: totalDuration * (distBefore / totalDist),
        ease: "sine.inOut"
      });
      // Forcejeo leve sin avanzar: la corriente empuja la hoja contra la
      // rama un momento antes de que se suelte sola.
      tl.to(leafEl, {
        rotation: `+=${5 + Math.random() * 5}`,
        duration: pauseDuration / 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1
      });
      tl.to(leafEl, {
        x: targetX,
        rotation: randomRot,
        duration: totalDuration * (distAfter / totalDist),
        ease: "sine.inOut"
      });
    } else {
      // Sin enganche: igual se evita la línea recta variando la velocidad en
      // tramos, como el empuje irregular de una corriente real.
      tl.to(leafEl, { x: startX + (targetX - startX) * 0.32, rotation: randomRot * 0.25, duration: totalDuration * 0.3, ease: "sine.inOut" });
      tl.to(leafEl, { x: startX + (targetX - startX) * 0.7, rotation: randomRot * 0.7, duration: totalDuration * 0.4, ease: "sine.inOut" });
      tl.to(leafEl, { x: targetX, rotation: randomRot, duration: totalDuration * 0.3, ease: "sine.inOut" });
    }
  } else {
    // Web Animations API fallback: keyframes con offsets para reproducir el
    // mismo recorrido no lineal (y el enganche en rama, si aplica).
    let keyframes, offsets, waapiDuration;
    if (branch) {
      const branchX = xForPercent(branch.xPercent);
      const catchOffset = (branchX - startX) / (targetX - startX);
      keyframes = [
        { transform: `translateX(${startX}px) rotate(${randomRot * -0.5}deg)` },
        { transform: `translateX(${branchX}px) rotate(${randomRot * 0.35}deg)` },
        { transform: `translateX(${branchX}px) rotate(${randomRot * 0.35 + 6}deg)` },
        { transform: `translateX(${targetX}px) rotate(${randomRot}deg)` }
      ];
      offsets = [0, catchOffset, Math.min(catchOffset + 0.12, 0.95), 1];
      waapiDuration = (totalDuration + 2.2) * 1000;
    } else {
      keyframes = [
        { transform: `translateX(${startX}px) rotate(${randomRot * -0.5}deg)` },
        { transform: `translateX(${startX + (targetX - startX) * 0.32}px) rotate(${randomRot * 0.25}deg)` },
        { transform: `translateX(${startX + (targetX - startX) * 0.7}px) rotate(${randomRot * 0.7}deg)` },
        { transform: `translateX(${targetX}px) rotate(${randomRot}deg)` }
      ];
      offsets = [0, 0.3, 0.7, 1];
      waapiDuration = totalDuration * 1000;
    }
    const anim = leafEl.animate(
      keyframes.map((k, i) => ({ ...k, offset: offsets[i] })),
      { duration: waapiDuration, easing: "ease-in-out", fill: "forwards" }
    );
    anim.onfinish = () => leafEl.remove();
  }

  // Compass Avatar encouragement
  const randomQuote = pickAvatarQuote();
  setTimeout(() => {
    CompassAvatar.speak(randomQuote, "neutral");
  }, 1000);
}

// Frases de aliento del avatar al lanzar una hoja. Se evita repetir la misma
// frase dos veces seguidas para que no se sientan como un pensamiento que
// vuelve en bucle, justo lo contrario de lo que busca este ejercicio.
const avatarQuotes = [
  "Mira cómo la corriente se lleva el pensamiento sin luchar con él.",
  "El pensamiento sigue de largo. Tú sigues en la orilla.",
  "No es necesario retenerlo ni empujarlo; solo déjalo flotar."
];
let lastAvatarQuoteIndex = -1;

function pickAvatarQuote() {
  if (avatarQuotes.length <= 1) return avatarQuotes[0];
  let index;
  do {
    index = Math.floor(Math.random() * avatarQuotes.length);
  } while (index === lastAvatarQuoteIndex);
  lastAvatarQuoteIndex = index;
  return avatarQuotes[index];
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
