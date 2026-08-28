"use strict";

import { escapeHTML, LS, safeJSONParse, toast } from "./utils.js";
import { SoundFX, isSoundEnabled } from "./audio.js";
import { CompassAvatar } from "./avatar.js";

export function initLeavesModule() {
  const guideBtn = document.getElementById("toggleLeavesGuide");
  const guidePanel = document.getElementById("leavesGuidePanel");
  const leafInput = document.getElementById("leafInput");
  const addLeafBtn = document.getElementById("addLeafBtn");

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
