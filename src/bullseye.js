"use strict";

import { LS, safeJSONParse } from './utils.js';
import { SoundFX } from './audio.js';

let bullseyeData = safeJSONParse(localStorage.getItem(LS.bullseye), {
    work: 50,
    rel: 50,
    growth: 50,
    leisure: 50
});

let chart = null;
let resizeHandler = null;

function getChartPadding() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    return isMobile ? 22 : 28;
}

export function initBullseye(el) {
    const ctx = document.createElement('canvas');
    const container = document.querySelector('.bullseye-visual');
    if (container) {
        container.innerHTML = '';
        container.appendChild(ctx);
    }

    chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['💼 TRABAJO / EDUCACIÓN', '👪 RELACIONES', '🌱 CRECIMIENTO PERSONAL', '🎨 OCIO / RECREACIÓN'],
            datasets: [{
                label: 'Mi Alineación',
                data: [bullseyeData.work, bullseyeData.rel, bullseyeData.growth, bullseyeData.leisure],
                backgroundColor: 'rgba(115, 155, 163, 0.2)',
                borderColor: 'rgba(115, 155, 163, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(115, 155, 163, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(115, 155, 163, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    beginAtZero: true,
                    ticks: { stepSize: 20, display: false },
                    grid: { color: 'rgba(148, 163, 184, 0.22)' },
                    angleLines: { color: 'rgba(148, 163, 184, 0.22)' },
                    pointLabels: {
                        color: '#6B7280',
                        font: {
                            size: 13,
                            weight: 'bold',
                            family: "'Segoe UI', system-ui, sans-serif"
                        }
                    }
                }
            },
            plugins: { legend: { display: false } },
            layout: { padding: getChartPadding() },
            animation: false,
            maintainAspectRatio: false,
            responsive: true
        }
    });

    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    resizeHandler = () => {
        if (!chart) return;
        chart.options.layout.padding = getChartPadding();
        chart.resize();
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
    chart.update('none'); // Update without animation for performance while dragging
}

export function getBullseye() {
    return bullseyeData;
}
