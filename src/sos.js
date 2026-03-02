"use strict";

import { el } from './main.js';
import { SoundFX, isSoundEnabled, initAudio } from './audio.js';
import { CompassAvatar } from './avatar.js';
import { toast } from './utils.js';

export function initSosModule() {
    if (!el.tabSos) return;

    // Brown Noise Logic
    let noiseCtx, noiseNode, noiseGain, noiseOn = false;
    const noiseToggle = document.getElementById('noiseToggle');
    const noiseVol = document.getElementById('noiseVol');

    noiseToggle?.addEventListener("click", async () => {
        initAudio();
        if (!noiseOn) {
            if (!noiseCtx) {
                noiseCtx = new (window.AudioContext || window.webkitAudioContext)();
                noiseGain = noiseCtx.createGain();
                noiseNode = createBrownNoise(noiseCtx);
                noiseNode.connect(noiseGain);
                noiseGain.connect(noiseCtx.destination);
            }
            noiseGain.gain.setValueAtTime(0, noiseCtx.currentTime);
            const targetVol = (noiseVol?.value / 100 || 0.25) * 0.1;
            noiseGain.gain.linearRampToValueAtTime(targetVol, noiseCtx.currentTime + 1.5);
            await noiseCtx.resume();
            noiseOn = true;
            noiseToggle.textContent = "Apagar";
            gsap.to(noiseToggle, { backgroundColor: "var(--danger)", duration: 0.3 });
        } else {
            noiseGain.gain.linearRampToValueAtTime(0, noiseCtx.currentTime + 0.8);
            setTimeout(() => { if (!noiseOn) noiseCtx.suspend(); }, 800);
            noiseOn = false;
            noiseToggle.textContent = "Encender";
            gsap.to(noiseToggle, { backgroundColor: "var(--primary)", duration: 0.3 });
        }
    });

    // Box Breathing Logic
    let breathing = false;
    let boxTimer;
    const boxPhases = [
        { name: "Inhala", class: "expanding" },
        { name: "Sostén", class: "holding" },
        { name: "Exhala", class: "contracting" },
        { name: "Sostén", class: "holding" }
    ];

    el.breathToggle?.addEventListener("click", () => {
        breathing = !breathing;
        el.breathToggle.textContent = breathing ? "Detener" : "Iniciar";
        if (breathing) {
            startBoxBreathing();
        } else {
            clearInterval(boxTimer);
            el.breathPhase.textContent = "Listo";
            if (el.breathTimer) el.breathTimer.textContent = "0s";
            gsap.to(el.breathSquare, { scale: 1, duration: 0.5 });
            el.breathSquare.className = "breath-square";
        }
    });

    function startBoxBreathing() {
        let phaseIdx = 0;
        let countdown = 4;

        const update = () => {
            const phase = boxPhases[phaseIdx % 4];
            el.breathPhase.textContent = phase.name;

            // Toggle classes for visual effects (like pulse-glow)
            el.breathSquare.className = `breath-square ${phase.class}`;

            // Sync square expansion/contraction
            const scale = phase.name === "Inhala" ? 1.8 : (phase.name === "Exhala" ? 1 : null);
            if (scale !== null) {
                gsap.to(el.breathSquare, { scale, duration: 4, ease: "sine.inOut" });
            }

            phaseIdx++;
            countdown = 4;
            if (el.breathTimer) el.breathTimer.textContent = `${countdown}s`;
        };

        const tick = () => {
            if (!breathing) return;
            countdown--;
            if (el.breathTimer) el.breathTimer.textContent = `${countdown}s`;

            if (countdown <= 0) {
                update();
            }
        };

        update();
        boxTimer = setInterval(tick, 1000);
    }

    // --- Missing SOS Logic Restoration ---

    const resetOverlay = () => {
        el.sosOverlay.hidden = false;
        el.sosTapArea.style.display = "none";
        el.sosIllustration.style.display = "none";
        el.sosCountdown.style.display = "none";
        el.sosNextBtn.style.display = "block";
        el.sosNextBtn.disabled = false;
        el.sosNextBtn.textContent = "Siguiente";
        el.sosNextBtn.onclick = null;
        el.sosBackBtn.style.display = "none";
        el.sosProgressBar.style.width = "0%";

        // Hide all steps
        document.getElementById("sensoryStep").style.display = "none";
        document.getElementById("categoriesStep").style.display = "none";
        document.getElementById("heelStep").style.display = "none";
        document.getElementById("genericStep").style.display = "none";
    };

    const finishSos = () => {
        resetOverlay();
        document.getElementById("genericStep").style.display = "block";
        document.getElementById("sosStepTitle").textContent = "Completado";
        document.getElementById("sosStepHint").textContent = "Has vuelto al presente. Respira hondo.";
        el.sosProgressBar.style.width = "100%";
        el.sosNextBtn.style.display = "none";
        if (isSoundEnabled()) SoundFX.success();
        CompassAvatar.speak("Lo has hecho muy bien. Te noto más en calma.", "happy");
    };

    // 5-4-3-2-1
    document.getElementById("sos54321Btn")?.addEventListener("click", () => {
        resetOverlay();
        el.sosModalTitle.textContent = "Técnica 5-4-3-2-1";
        document.getElementById("sensoryStep").style.display = "block";

        const steps = [
            { n: 5, title: "5 Cosas que veas", hint: "Toca cada círculo al identificar un objeto.", icon: "👁️" },
            { n: 4, title: "4 Cosas que toques", hint: "Siente la textura de cada objeto.", icon: "🤚" },
            { n: 3, title: "3 Sonidos", hint: "Presta atención al entorno.", icon: "👂" },
            { n: 2, title: "2 Olores", hint: "Identifica aromas cercanos.", icon: "👃" },
            { n: 1, title: "1 Sabor", hint: "Algo que puedas saborear.", icon: "👅" }
        ];

        let idx = 0;
        const loadStep = () => {
            const s = steps[idx];
            document.getElementById("sensoryTitle").textContent = s.title;
            document.getElementById("sensoryHint").textContent = s.hint;
            const area = document.getElementById("sensoryActionArea");
            area.innerHTML = "";
            el.sosNextBtn.disabled = true;
            el.sosProgressBar.style.width = `${(idx / steps.length) * 100}%`;

            let checked = 0;
            for (let i = 0; i < s.n; i++) {
                const item = document.createElement("div");
                item.className = "sensory-item";
                item.textContent = s.icon;
                item.onclick = () => {
                    if (item.classList.contains("checked")) return;
                    item.classList.add("checked");
                    checked++;
                    if (isSoundEnabled()) SoundFX.click();
                    if (checked >= s.n) el.sosNextBtn.disabled = false;
                };
                area.appendChild(item);
            }
        };

        loadStep();
        el.sosNextBtn.onclick = () => {
            idx++;
            if (idx < steps.length) loadStep();
            else finishSos();
        };
    });

    // Categories
    document.getElementById("sosCategoriesBtn")?.addEventListener("click", () => {
        resetOverlay();
        el.sosModalTitle.textContent = "Categorías";
        document.getElementById("categoriesStep").style.display = "block";
        el.sosNextBtn.style.display = "none";

        const cats = [
            { name: "Frutas", items: ["Manzana", "Pera", "Mango", "Fresa"], deco: ["Perro", "Coche", "Azul"] },
            { name: "Colores", items: ["Rojo", "Verde", "Azul", "Amarillo"], deco: ["Lunes", "Sal", "Gato"] }
        ];
        const cat = cats[Math.floor(Math.random() * cats.length)];
        document.getElementById("categoriesTitle").textContent = cat.name;
        const container = document.getElementById("bubblesContainer");
        container.innerHTML = "";

        let found = 0;
        const allWords = [...cat.items, ...cat.deco].sort(() => Math.random() - 0.5);

        // Create all bubbles first, then position after DOM paint
        const bubbles = allWords.map(text => {
            const b = document.createElement("div");
            b.className = "bubble";
            b.textContent = text;
            b.onclick = () => {
                if (cat.items.includes(text)) {
                    b.classList.add("burst", "correct");
                    found++;
                    if (isSoundEnabled()) SoundFX.click();
                    if (found >= cat.items.length) finishSos();
                } else {
                    gsap.to(b, { x: 5, duration: 0.1, repeat: 3, yoyo: true });
                }
            };
            container.appendChild(b);
            return b;
        });

        // Position after paint so offsetWidth/offsetHeight are known
        requestAnimationFrame(() => {
            const cW = container.offsetWidth;
            const cH = container.offsetHeight;
            const placed = [];

            bubbles.forEach(b => {
                const bW = b.offsetWidth || 80;
                const bH = b.offsetHeight || 36;
                let attempts = 0;
                let x, y, ok;

                do {
                    x = Math.random() * Math.max(4, cW - bW - 8) + 4;
                    y = Math.random() * Math.max(4, cH - bH - 8) + 4;
                    ok = placed.every(p =>
                        Math.abs(p.x - x) > (p.w + bW) / 2 + 6 ||
                        Math.abs(p.y - y) > (p.h + bH) / 2 + 6
                    );
                    attempts++;
                } while (!ok && attempts < 30);

                b.style.left = `${x}px`;
                b.style.top = `${y}px`;
                placed.push({ x, y, w: bW, h: bH });
            });
        });
    });

    // Heels
    document.getElementById("sosHeelsBtn")?.addEventListener("click", () => {
        resetOverlay();
        el.sosModalTitle.textContent = "Anclaje de Talones";
        document.getElementById("heelStep").style.display = "block";
        el.sosNextBtn.textContent = "Terminar";
        el.sosNextBtn.onclick = finishSos;

        let beat = 0;
        const t = setInterval(() => {
            if (el.sosOverlay.hidden || document.getElementById("heelStep").style.display === "none") {
                clearInterval(t);
                return;
            }
            beat++;
            const isLeft = beat % 2 !== 0;
            document.getElementById("metronomeBeat").className = `metronome-beat ${isLeft ? "beat-left" : "beat-right"}`;
            document.getElementById("metronomeText").textContent = isLeft ? "Uno..." : "Dos...";
            if (navigator.vibrate) navigator.vibrate(50);
        }, 1000);
    });

    // TIP / DBT Buttons
    const runTimerStep = (title, icon, hint, seconds) => {
        resetOverlay();
        el.sosModalTitle.textContent = title;
        document.getElementById("sosIcon").textContent = icon;
        document.getElementById("sosIllustration").style.display = "block";
        el.sosCountdown.style.display = "flex";
        document.getElementById("genericStep").style.display = "block";
        document.getElementById("sosStepTitle").textContent = "Mantén el enfoque";
        document.getElementById("sosStepHint").textContent = hint;

        let remaining = seconds;
        const t = setInterval(() => {
            remaining--;
            document.getElementById("sosCountdownValue").textContent = `${remaining}s`;
            el.sosProgressBar.style.width = `${((seconds - remaining) / seconds) * 100}%`;
            if (remaining <= 0 || el.sosOverlay.hidden) {
                clearInterval(t);
                if (remaining <= 0) finishSos();
            }
        }, 1000);
    };

    document.getElementById("tipTempBtn")?.addEventListener("click", () => runTimerStep("Temperatura", "🧊", "Usa agua fría o un hielo en tus manos.", 30));
    document.getElementById("tipExerciseBtn")?.addEventListener("click", () => runTimerStep("Intensidad", "🏃‍♂️", "Haz sentadillas o saltos intensos.", 60));
    document.getElementById("tipBreathBtn")?.addEventListener("click", () => runTimerStep("Respiración", "🌬️", "Inhala 4s, exhala 6s pausadamente.", 60));

    // Mental Loop Interventions
    document.getElementById("actSosBtn")?.addEventListener("click", () =>
        runTimerStep("Tomar Distancia (ACT)", "🧘", "Observa este pensamiento como si fuera una nube pasando en el cielo. No intentes atraparla ni alejarla.", 60)
    );
    document.getElementById("dbtSosBtn")?.addEventListener("click", () =>
        runTimerStep("Cambio de Estado (DBT)", "🌡️", "Enclava tu atención en una sensación física intensa (frío, presión) o un cambio de temperatura.", 90)
    );

    document.getElementById("tipRelaxBtn")?.addEventListener("click", () => {
        resetOverlay();
        el.sosModalTitle.textContent = "Relajación Muscular";
        const steps = [
            { title: "Manos", text: "Aprieta los puños fuerte." },
            { title: "Hombros", text: "Súbelos hacia las orejas." },
            { title: "Pies", text: "Encoge los dedos de los pies." }
        ];
        let idx = 0;
        const load = () => {
            document.getElementById("genericStep").style.display = "block";
            document.getElementById("sosStepTitle").textContent = steps[idx].title;
            document.getElementById("sosStepHint").textContent = steps[idx].text;
            el.sosProgressBar.style.width = `${(idx / steps.length) * 100}%`;
        };
        load();
        el.sosNextBtn.onclick = () => {
            idx++;
            if (idx < steps.length) load();
            else finishSos();
        };
    });

    document.getElementById("closeSosOverlay")?.addEventListener("click", () => {
        el.sosOverlay.hidden = true;
        el.sosNextBtn.onclick = null;
        el.sosNextBtn.disabled = false;
    });
}

function createBrownNoise(ctx) {
    const bufferSize = 10 * ctx.sampleRate; // 10 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 3.5;
    }
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    node.start();
    return node;
}
