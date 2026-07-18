"use strict";

import { getActiveValues } from './values.js';
import { getBullseye } from './bullseye.js';
import { getCommittedActions } from './ui_path.js';
import { copyToClipboard, toast, AREA_LABELS } from './utils.js';
import { SoundFX } from './audio.js';

export function runExport() {
    const d = new Date().toLocaleDateString();
    let text = `--- Resumen de Valores y Compromisos (${d}) ---\n\n`;

    const active = getActiveValues();
    if (active.length > 0) {
        text += "🌟 Mis Valores Top:\n";
        active.forEach((v, i) => {
            text += `${i + 1}. ${v.name}\n`;
        });
    } else {
        text += "🌟 Sin valores seleccionados aún.\n";
    }

    const bulls = getBullseye();
    text += "\n🎯 Mi Diana (Satisfacción %):\n";
    text += `- Trabajo/Educación: ${bulls.work}%\n`;
    text += `- Relaciones: ${bulls.rel}%\n`;
    text += `- Crecimiento: ${bulls.growth}%\n`;
    text += `- Ocio: ${bulls.leisure}%\n`;

    const actions = getCommittedActions();
    if (actions.length > 0) {
        text += "\n🚀 Mis Compromisos:\n";
        actions.forEach((a, i) => {
            const areaText = AREA_LABELS[a.area] || a.area;
            const dateText = a.date ? new Date(a.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : 'No definida';
            text += `${i + 1}. [${a.done ? "X" : " "}] ${a.title}\n`;
            text += `   · Área: ${areaText}\n`;
            text += `   · Valor relacionado: ${a.value}\n`;
            text += `   · Fecha/Hora límite: ${dateText}\n`;
            if (a.internal && a.internal.length > 0) {
                text += `   · Obstáculos Internos (Mente):\n`;
                a.internal.forEach(obs => {
                    text += `     - Barrera: "${obs.text}" -> Plan de Aceptación (Mindfulness): "${obs.skill}"\n`;
                });
            }
            if (a.external && a.external.length > 0) {
                text += `   · Obstáculos Externos (Entorno):\n`;
                a.external.forEach(obs => {
                    text += `     - Barrera: "${obs.text}" -> Plan de Acción Práctico: "${obs.plan}"\n`;
                });
            }
            text += "\n";
        });
    }

    copyToClipboard(text).then(ok => {
        if (ok) {
            toast("📋 ¡Resumen completo copiado!");
            SoundFX.success();
        } else {
            prompt("El copiado automático no está disponible o ha fallado.\n\nPor favor, copia el siguiente resumen manualmente (Ctrl+C o Cmd+C):", text);
        }
    });
}
