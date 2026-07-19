"use strict";

import { LS, safeJSONParse, toast, AREA_LABELS } from "./utils.js";
import { SoundFX } from "./audio.js";
import { recordBullseyeUpdate } from "./notifications.js";
import { notifySaved } from "./offlineIndicator.js";
import { unlockAchievement } from "./achievements.js";

let bullseyeData = safeJSONParse(localStorage.getItem(LS.bullseye), {
    work: 50,
    rel: 50,
    growth: 50,
    leisure: 50
});

let chart = null;
let resizeHandler = null;
let pointImages = [];

let bullseyeHistory = safeJSONParse(localStorage.getItem(LS.bullseyeHistory), []);
let evolutionChart = null;

function getChartPadding() {
    return 40; // Symmetric padding for perfect centering
}

function getPointLabelFontSize() {
    return window.matchMedia("(max-width: 768px)").matches ? 11 : 13;
}

/**
 * Prepares Image objects from PNG assets for Chart.js pointStyle
 * We resize them to 128x128 for high fidelity on all displays.
 */
async function preparePointImages() {
    const assets = [
        "assets/trabajo_educacion.png",
        "assets/relaciones.png",
        "assets/crecimiento.png",
        "assets/ocio.png"
    ];

    const loadAndResize = (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 28; // Small icon size for chart points
                canvas.height = 28;
                const ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, 28, 28);

                const scaledImg = new Image();
                scaledImg.onload = () => resolve(scaledImg);
                scaledImg.src = canvas.toDataURL("image/png", 1.0);
            };
            img.onerror = () => {
                console.error("Error loading asset:", src);
                resolve(null);
            };
            img.src = src;
        });
    };

    pointImages = await Promise.all(assets.map(loadAndResize));
}

function injectIcons() {
    const labels = {
        top: document.querySelector(".bullseye-label-top"),
        right: document.querySelector(".bullseye-label-right"),
        bottom: document.querySelector(".bullseye-label-bottom"),
        left: document.querySelector(".bullseye-label-left")
    };

    if (labels.top) labels.top.innerHTML = `<div class="bullseye-icon"><img src="assets/trabajo_educacion.png" alt="Trabajo"></div><span>${AREA_LABELS.work}</span>`;
    if (labels.right) labels.right.innerHTML = `<div class="bullseye-icon"><img src="assets/relaciones.png" alt="Relaciones"></div><span>${AREA_LABELS.rel}</span>`;
    if (labels.bottom) labels.bottom.innerHTML = `<div class="bullseye-icon"><img src="assets/crecimiento.png" alt="Crecimiento"></div><span>${AREA_LABELS.growth}</span>`;
    if (labels.left) labels.left.innerHTML = `<div class="bullseye-icon"><img src="assets/ocio.png" alt="Ocio"></div><span>${AREA_LABELS.leisure}</span>`;
}

export async function initBullseye() {
    injectIcons();
    await preparePointImages();

    const container = document.querySelector(".bullseye-visual");
    if (!container) return;

    // Show temporary loader
    let loader = container.querySelector(".bullseye-loader");
    if (!loader) {
        loader = document.createElement("div");
        loader.className = "bullseye-loader";
        loader.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:0.9rem; color:var(--muted); font-weight:500; z-index:3;";
        loader.textContent = "Cargando diana...";
        container.appendChild(loader);
    }

    const ctx = document.createElement("canvas");

    // Remove existing canvas to avoid duplicates, but preserve labels
    const oldCanvas = container.querySelector("canvas");
    if (oldCanvas) oldCanvas.remove();

    container.appendChild(ctx);

    try {
        chart = new Chart(ctx, {
            type: "radar",
            data: {
                labels: [AREA_LABELS.work, AREA_LABELS.rel, AREA_LABELS.growth, AREA_LABELS.leisure],
                datasets: [{
                    label: "Mi Alineación",
                    data: [bullseyeData.work, bullseyeData.rel, bullseyeData.growth, bullseyeData.leisure],
                    backgroundColor: "rgba(91, 140, 150, 0.15)",
                    borderColor: "rgba(91, 140, 150, 0.4)",
                    borderWidth: 2,
                    pointStyle: pointImages,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBorderWidth: 0
                }]
            },
            options: {
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        reverse: true, // 100 IS THE CENTER
                        beginAtZero: false,
                        ticks: {
                            display: false,
                            stepSize: 20
                        },
                        grid: {
                            color: "rgba(148, 163, 184, 0.25)",
                            lineWidth: 1
                        },
                        angleLines: {
                            color: "rgba(148, 163, 184, 0.25)"
                        },
                        pointLabels: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Cercanía al objetivo: ${ctx.raw}%`
                        }
                    }
                },
                layout: {
                    padding: 15
                },
                animation: {
                    duration: 600,
                    easing: "easeOutQuart"
                },
                maintainAspectRatio: true,
                responsive: true
            }
        });
        if (loader) loader.remove();
    } catch (e) {
        if (loader) loader.remove();
        console.error("Chart.js failed to load. Rendering fallback table.", e);
        ctx.remove();
        let fallback = container.querySelector(".bullseye-fallback");
        if (!fallback) {
            fallback = document.createElement("div");
            fallback.className = "bullseye-fallback";
            fallback.style.cssText = "position:absolute; inset:20px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:16px; background:var(--card); border:1px solid var(--ring); border-radius:12px; z-index:4;";
            container.appendChild(fallback);
        }
        fallback.innerHTML = `
            <div style="font-size:1.5rem; margin-bottom:8px;">🎯</div>
            <strong style="font-size:0.9rem; color:var(--text);">Diana (Valores de Satisfacción)</strong>
            <table role="table" aria-label="Valores de Satisfacción de la Diana" style="width:100%; margin-top:12px; border-collapse:collapse; font-size:0.85rem;">
                <thead>
                    <tr style="border-bottom:2px solid var(--primary); text-align:left;">
                        <th style="padding:6px; color:var(--text);">Área Vital</th>
                        <th style="padding:6px; text-align:right; color:var(--text);">Satisfacción</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom:1px solid var(--ring);">
                        <td style="padding:6px; text-align:left; color:var(--muted);">${AREA_LABELS.work}</td>
                        <td style="padding:6px; text-align:right; font-weight:bold; color:var(--primary);">${bullseyeData.work}%</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--ring);">
                        <td style="padding:6px; text-align:left; color:var(--muted);">${AREA_LABELS.rel}</td>
                        <td style="padding:6px; text-align:right; font-weight:bold; color:var(--primary);">${bullseyeData.rel}%</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--ring);">
                        <td style="padding:6px; text-align:left; color:var(--muted);">${AREA_LABELS.growth}</td>
                        <td style="padding:6px; text-align:right; font-weight:bold; color:var(--primary);">${bullseyeData.growth}%</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--ring);">
                        <td style="padding:6px; text-align:left; color:var(--muted);">${AREA_LABELS.leisure}</td>
                        <td style="padding:6px; text-align:right; font-weight:bold; color:var(--primary);">${bullseyeData.leisure}%</td>
                    </tr>
                </tbody>
            </table>
            <p class="hint" style="margin-top:12px; font-size:0.75rem;">(El gráfico interactivo no se pudo cargar. Los datos siguen guardándose con normalidad).</p>
        `;
    }



    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    resizeHandler = () => {
        if (!chart) return;
        chart.options.layout.padding = getChartPadding();
        // Only update font size if pointLabels are visible
        if (chart.options.scales.r.pointLabels?.display) {
            chart.options.scales.r.pointLabels.font = chart.options.scales.r.pointLabels.font || {};
            chart.options.scales.r.pointLabels.font.size = getPointLabelFontSize();
        }
        chart.update("none");
    };
    window.addEventListener("resize", resizeHandler, { passive: true });

    // Wire sliders
    const inputs = {
        work: document.getElementById("input-work"),
        rel: document.getElementById("input-rel"),
        growth: document.getElementById("input-growth"),
        leisure: document.getElementById("input-leisure")
    };

    const nums = {
        work: document.getElementById("num-work"),
        rel: document.getElementById("num-rel"),
        growth: document.getElementById("num-growth"),
        leisure: document.getElementById("num-leisure")
    };

    Object.keys(inputs).forEach(key => {
        if (!inputs[key]) return;
        inputs[key].value = bullseyeData[key];
        if (nums[key]) nums[key].textContent = bullseyeData[key];

        inputs[key].addEventListener("input", (e) => {
            const val = parseInt(e.target.value);
            bullseyeData[key] = val;
            if (nums[key]) nums[key].textContent = val;
            updateChart();

            if (val === 100) {
                SoundFX.success();
                const container = document.querySelector(".bullseye-visual");
                container?.classList.add("bullseye-success");
                setTimeout(() => container?.classList.remove("bullseye-success"), 1000);
                try { unlockAchievement("bullseye_100"); } catch { /* ignore */ }
            }
        });
    });

    document.getElementById("bullseyeSaveBtn")?.addEventListener("click", () => {
        localStorage.setItem(LS.bullseye, JSON.stringify(bullseyeData));
        
        // Save snapshot to history
        const snapshot = {
            date: new Date().toISOString(),
            work: bullseyeData.work,
            rel: bullseyeData.rel,
            growth: bullseyeData.growth,
            leisure: bullseyeData.leisure
        };
        // Avoid saving multiple snapshots for the same day
        const todayStr = new Date().toLocaleDateString();
        bullseyeHistory = bullseyeHistory.filter(h => new Date(h.date).toLocaleDateString() !== todayStr);
        bullseyeHistory.push(snapshot);
        if (bullseyeHistory.length > 10) {
            bullseyeHistory.shift();
        }
        localStorage.setItem(LS.bullseyeHistory, JSON.stringify(bullseyeHistory));

        recordBullseyeUpdate();
        notifySaved("🎯 Diana guardada");
        
        // Logros de Diana
        try {
            unlockAchievement("bullseye_first");
            if (bullseyeHistory.length >= 2) {
                const dates = bullseyeHistory.map(h => new Date(h.date).getTime());
                const minDate = Math.min(...dates);
                const maxDate = Math.max(...dates);
                const diffDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
                if (diffDays >= 7) {
                    unlockAchievement("bullseye_week");
                }
            }
        } catch (err) {
            console.error("No se pudieron verificar los logros de la Diana:", err);
        }

        toast("🎯 Diana guardada e historial actualizado");
        SoundFX.success();
        updateEvolutionChart();
    });

    document.getElementById("bullseyeResetBtn")?.addEventListener("click", () => {
        bullseyeData = { work: 50, rel: 50, growth: 50, leisure: 50 };
        Object.keys(inputs).forEach(key => {
            if (inputs[key]) inputs[key].value = 50;
            if (nums[key]) nums[key].textContent = 50;
        });
        updateChart();
        localStorage.setItem(LS.bullseye, JSON.stringify(bullseyeData));
        
        bullseyeHistory = [];
        localStorage.removeItem(LS.bullseyeHistory);
        updateEvolutionChart();
        
        toast("Reiniciado");
    });
}

function updateChart() {
    if (!chart) {
        const container = document.querySelector(".bullseye-visual");
        if (container) {
            const table = container.querySelector("table");
            if (table) {
                table.innerHTML = `
                    <tr style="border-bottom:1px solid var(--ring);">
                        <td style="padding:6px; text-align:left; color:var(--muted);">${AREA_LABELS.work}</td>
                        <td style="padding:6px; text-align:right; font-weight:bold; color:var(--primary);">${bullseyeData.work}%</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--ring);">
                        <td style="padding:6px; text-align:left; color:var(--muted);">${AREA_LABELS.rel}</td>
                        <td style="padding:6px; text-align:right; font-weight:bold; color:var(--primary);">${bullseyeData.rel}%</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--ring);">
                        <td style="padding:6px; text-align:left; color:var(--muted);">${AREA_LABELS.growth}</td>
                        <td style="padding:6px; text-align:right; font-weight:bold; color:var(--primary);">${bullseyeData.growth}%</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--ring);">
                        <td style="padding:6px; text-align:left; color:var(--muted);">${AREA_LABELS.leisure}</td>
                        <td style="padding:6px; text-align:right; font-weight:bold; color:var(--primary);">${bullseyeData.leisure}%</td>
                    </tr>
                `;
            }
        }
        return;
    }
    chart.data.datasets[0].data = [
        bullseyeData.work,
        bullseyeData.rel,
        bullseyeData.growth,
        bullseyeData.leisure
    ];
    chart.update("none");
}

function updateEvolutionChart() {
    const ctx = document.getElementById("evolutionChart");
    if (!ctx) return;

    if (evolutionChart) {
        evolutionChart.destroy();
    }

    let dataPoints = [...bullseyeHistory];
    if (dataPoints.length === 0) {
        dataPoints.push({
            date: new Date().toISOString(),
            work: bullseyeData.work,
            rel: bullseyeData.rel,
            growth: bullseyeData.growth,
            leisure: bullseyeData.leisure
        });
    }

    const labels = dataPoints.map(h => new Date(h.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }));
    const datasetWork = dataPoints.map(h => h.work);
    const datasetRel = dataPoints.map(h => h.rel);
    const datasetGrowth = dataPoints.map(h => h.growth);
    const datasetLeisure = dataPoints.map(h => h.leisure);

    const isDark = document.body.classList.contains("dark-theme");
    const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
    const textColor = isDark ? "#E2E8F0" : "#475569";

    try {
        evolutionChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: AREA_LABELS.work,
                        data: datasetWork,
                        borderColor: "#0ea5e9",
                        backgroundColor: "rgba(14, 165, 233, 0.1)",
                        tension: 0.3,
                        fill: false,
                        borderWidth: 2
                    },
                    {
                        label: AREA_LABELS.rel,
                        data: datasetRel,
                        borderColor: "#f43f5e",
                        backgroundColor: "rgba(244, 63, 94, 0.1)",
                        tension: 0.3,
                        fill: false,
                        borderWidth: 2
                    },
                    {
                        label: AREA_LABELS.growth,
                        data: datasetGrowth,
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        tension: 0.3,
                        fill: false,
                        borderWidth: 2
                    },
                    {
                        label: AREA_LABELS.leisure,
                        data: datasetLeisure,
                        borderColor: "#f59e0b",
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        tension: 0.3,
                        fill: false,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: gridColor },
                        ticks: { color: textColor, stepSize: 20 }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: textColor, boxWidth: 12, font: { size: 10 } }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Chart.js failed to load for evolution chart.", e);
        const container = document.querySelector(".chart-container-line");
        if (container) {
            container.innerHTML = `
                <div style="padding:16px; border:1px dashed var(--ring); border-radius:8px; text-align:center;">
                    <p class="hint">No se puede renderizar el gráfico del historial porque la librería no está disponible.</p>
                </div>
            `;
        }
    }
}

export function refreshChart() {
    if (chart && typeof chart.resize === "function") {
        chart.resize();
        chart.update("none");
    }
    updateEvolutionChart();
}

export function getBullseye() {
    return bullseyeData;
}
