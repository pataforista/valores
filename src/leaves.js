"use strict";

import { escapeHTML, LS, safeJSONParse, toast } from "./utils.js";
import { SoundFX, isSoundEnabled } from "./audio.js";
import { CompassAvatar } from "./avatar.js";

export function initLeavesModule() {
  const guideBtn = document.getElementById("toggleLeavesGuide");
  const guidePanel = document.getElementById("leavesGuidePanel");
  const leafInput = document.getElementById("leafInput");
  const addLeafBtn = document.getElementById("addLeafBtn");

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
  const targetX = cWidth + 280;
  const duration = 14 + Math.random() * 4;
  const randomRot = -12 + Math.random() * 24;

  if (window.gsap) {
    gsap.fromTo(
      leafEl,
      { x: -220, rotation: randomRot * -0.5 },
      {
        x: targetX,
        rotation: randomRot,
        duration: duration,
        ease: "none",
        onComplete: () => {
          leafEl.remove();
        }
      }
    );
  } else {
    // Web Animations API fallback
    const anim = leafEl.animate(
      [
        { transform: `translateX(-220px) rotate(${randomRot * -0.5}deg)` },
        { transform: `translateX(${targetX}px) rotate(${randomRot}deg)` }
      ],
      {
        duration: duration * 1000,
        easing: "linear",
        fill: "forwards"
      }
    );
    anim.onfinish = () => leafEl.remove();
  }

  // Compass Avatar encouragement
  const avatarQuotes = [
    "Mira cómo la corriente se lleva el pensamiento sin luchar con él.",
    "El pensamiento sigue de largo. Tú sigues en la orilla.",
    "No es necesario retenerlo ni empujarlo; solo déjalo flotar."
  ];
  const randomQuote = avatarQuotes[Math.floor(Math.random() * avatarQuotes.length)];
  setTimeout(() => {
    CompassAvatar.speak(randomQuote, "neutral");
  }, 1000);
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
