"use strict";

import { LS, safeJSONParse, toast } from './utils.js';
import { SoundFX } from './audio.js';

let bullseyeData = safeJSONParse(localStorage.getItem(LS.bullseye), {
    work: 50,
    rel: 50,
    growth: 50,
    leisure: 50
});

let chart = null;
let resizeHandler = null;
let pointImages = [];

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
        'assets/trabajo_educacion.png',
        'assets/relaciones.png',
        'assets/crecimiento.png',
        'assets/ocio.png'
    ];

    const loadAndResize = (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 28; // Small icon size for chart points
                canvas.height = 28;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, 28, 28);

                const scaledImg = new Image();
                scaledImg.onload = () => resolve(scaledImg);
                scaledImg.src = canvas.toDataURL('image/png', 1.0);
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
        top: document.querySelector('.bullseye-label-top'),
        right: document.querySelector('.bullseye-label-right'),
        bottom: document.querySelector('.bullseye-label-bottom'),
        left: document.querySelector('.bullseye-label-left')
    };

    if (labels.top) labels.top.innerHTML = `<div class="bullseye-icon"><img src="assets/trabajo_educacion.png" alt="Trabajo"></div><span>Trabajo</span>`;
    if (labels.right) labels.right.innerHTML = `<div class="bullseye-icon"><img src="assets/relaciones.png" alt="Relaciones"></div><span>Relaciones</span>`;
    if (labels.bottom) labels.bottom.innerHTML = `<div class="bullseye-icon"><img src="assets/crecimiento.png" alt="Crecimiento"></div><span>Crecimiento</span>`;
    if (labels.left) labels.left.innerHTML = `<div class="bullseye-icon"><img src="assets/ocio.png" alt="Ocio"></div><span>Ocio</span>`;
}

export async function initBullseye(el) {
    injectIcons();
    await preparePointImages();

    const ctx = document.createElement('canvas');
    const container = document.querySelector('.bullseye-visual');
    if (!container) return;

    // Remove existing canvas to avoid duplicates, but preserve labels
    const oldCanvas = container.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    container.appendChild(ctx);

    chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Trabajo', 'Relaciones', 'Crecimiento', 'Ocio'],
            datasets: [{
                label: 'Mi Alineación',
                data: [bullseyeData.work, bullseyeData.rel, bullseyeData.growth, bullseyeData.leisure],
                backgroundColor: 'rgba(91, 140, 150, 0.15)',
                borderColor: 'rgba(91, 140, 150, 0.4)',
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
                        color: 'rgba(148, 163, 184, 0.25)',
                        lineWidth: 1
                    },
                    angleLines: {
                        color: 'rgba(148, 163, 184, 0.25)'
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
                easing: 'easeOutQuart'
            },
            maintainAspectRatio: true,
            responsive: true
        }
    });

    // Theme change listener for icons
    const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
            if (mutation.attributeName === 'class') {
                await preparePointImages();
                if (chart) {
                    chart.data.datasets[0].pointStyle = pointImages;
                    chart.update('none');
                }
                injectIcons();
                break;
            }
        }
    });
    observer.observe(document.body, { attributes: true });

    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    resizeHandler = () => {
        if (!chart) return;
        chart.options.layout.padding = getChartPadding();
        // Only update font size if pointLabels are visible
        if (chart.options.scales.r.pointLabels?.display) {
            chart.options.scales.r.pointLabels.font = chart.options.scales.r.pointLabels.font || {};
            chart.options.scales.r.pointLabels.font.size = getPointLabelFontSize();
        }
        chart.update('none');
    };
    window.addEventListener('resize', resizeHandler, { passive: true });

    // Wire sliders
    const inputs = {
        work: document.getElementById('input-work'),
        rel: document.getElementById('input-rel'),
        growth: document.getElementById('input-growth'),
        leisure: document.getElementById('input-leisure')
    };

    const nums = {
        work: document.getElementById('num-work'),
        rel: document.getElementById('num-rel'),
        growth: document.getElementById('num-growth'),
        leisure: document.getElementById('num-leisure')
    };

    Object.keys(inputs).forEach(key => {
        if (!inputs[key]) return;
        inputs[key].value = bullseyeData[key];
        if (nums[key]) nums[key].textContent = bullseyeData[key];

        inputs[key].addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            bullseyeData[key] = val;
            if (nums[key]) nums[key].textContent = val;
            updateChart();

            if (val === 100) {
                SoundFX.success();
                const container = document.querySelector('.bullseye-visual');
                container?.classList.add('bullseye-success');
                setTimeout(() => container?.classList.remove('bullseye-success'), 1000);
            }
        });
    });

    document.getElementById('bullseyeSaveBtn')?.addEventListener('click', () => {
        localStorage.setItem(LS.bullseye, JSON.stringify(bullseyeData));
        toast('🎯 Diana guardada');
        SoundFX.success();
    });

    document.getElementById('bullseyeResetBtn')?.addEventListener('click', () => {
        bullseyeData = { work: 50, rel: 50, growth: 50, leisure: 50 };
        Object.keys(inputs).forEach(key => {
            if (inputs[key]) inputs[key].value = 50;
            if (nums[key]) nums[key].textContent = 50;
        });
        updateChart();
        localStorage.setItem(LS.bullseye, JSON.stringify(bullseyeData));
        toast('Reiniciado');
    });
}

function updateChart() {
    if (!chart) return;
    chart.data.datasets[0].data = [
        bullseyeData.work,
        bullseyeData.rel,
        bullseyeData.growth,
        bullseyeData.leisure
    ];
    chart.update('none');
}

export function refreshChart() {
    if (chart) {
        chart.resize();
        chart.update('none');
    }
}

export function getBullseye() {
    return bullseyeData;
}
