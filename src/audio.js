"use strict";

import { LS } from './utils.js';

let soundEnabled = localStorage.getItem(LS.sound) !== "false";
let audioCtx = null;

export function isSoundEnabled() {
    // Fresh check against localStorage to ensure consistency across modules
    return localStorage.getItem(LS.sound) !== "false";
}

export function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(LS.sound, soundEnabled);
    return soundEnabled;
}

export function initAudio() {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtx = new Ctx();
    }
}

export function playSound(freqs = [800, 1200], type = "sine", duration = 0.1) {
    if (!isSoundEnabled()) return; // Use the function check for the latest state

    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqs[0], now);
    if (freqs.length > 1) {
        osc.frequency.exponentialRampToValueAtTime(freqs[1], now + duration);
    }

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(now + duration + 0.05);
}

export const SoundFX = {
    approval: () => {
        if (!isSoundEnabled()) return;
        playSound([440, 880], "triangle", 0.2);
        setTimeout(() => playSound([660, 1320], "triangle", 0.2), 100);
    },
    success: () => {
        if (!isSoundEnabled()) return;
        playSound([1000, 1500], "sine", 0.3);
    },
    click: () => {
        if (!isSoundEnabled()) return;
        playSound([800, 1200], "sine", 0.1);
    }
};
