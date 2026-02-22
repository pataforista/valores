"use strict";

import { getActiveValues } from './values.js';
import { getBullseye } from './bullseye.js';
import { getCommittedActions } from './ui_path.js';
import { copyToClipboard, toast } from './utils.js';
import { SoundFX } from './audio.js';

export function runExport() {
    const d = new Date().toLocaleDateString();
    let text = `--- Resumen de Valores (${d}) ---\n\n`;

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
        actions.forEach(a => {
            text += `- [${a.done ? "X" : " "}] ${a.title}\n`;
        });
    }

    copyToClipboard(text).then(ok => {
        if (ok) {
            toast("📋 ¡Copiado!");
            SoundFX.success();
        } else {
            toast("❌ Error al copiar");
        }
    });
}
