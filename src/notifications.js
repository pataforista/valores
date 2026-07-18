"use strict";

import { LS, toast } from './utils.js';
import { getCommittedActions } from './ui_path.js';

// Configuración por defecto
const DEFAULTS = {
    actionsReminder: true,
    breathingReminder: false,
    bullseyeReminder: true,
    reminderInterval: 60, // minutos entre recordatorios
};

let reminderIntervalId = null;

/**
 * Solicita permiso para notificaciones y devuelve el estado.
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('Este navegador no soporta notificaciones.');
        return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    return result === 'granted';
}

/**
 * Envía una notificación nativa si hay permiso.
 */
function sendNativeNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
        new Notification(title, {
            body,
            icon: './icons/icon-192.png',
            silent: false,
        });
    } catch (e) {
        console.warn('Error al mostrar notificación nativa:', e);
    }
}

/**
 * Muestra un toast y opcionalmente una notificación nativa.
 */
function notifyUser(title, body) {
    toast(`🔔 ${title}: ${body}`);
    sendNativeNotification(title, body);
}

/**
 * Verifica las acciones comprometidas y notifica si alguna está próxima.
 */
function checkActions() {
    const actions = getCommittedActions();
    const now = new Date();
    const threshold = 24 * 60 * 60 * 1000; // 24h

    actions.forEach(a => {
        if (a.done) return;
        if (!a.date) return;
        const actionDate = new Date(a.date);
        const diff = actionDate - now;
        if (diff > 0 && diff < threshold) {
            const hours = Math.ceil(diff / (60 * 60 * 1000));
            notifyUser(
                '⏳ Acción próxima',
                `"${a.title}" está programada para dentro de ${hours} horas.`
            );
        }
    });
}

/**
 * Comprueba si ha pasado suficiente tiempo desde la última actualización de la diana
 * y sugiere revisarla.
 */
function checkBullseyeUpdate() {
    const lastUpdate = localStorage.getItem(LS.lastBullseyeUpdate);
    const now = Date.now();
    if (lastUpdate) {
        const diff = now - parseInt(lastUpdate, 10);
        const week = 7 * 24 * 60 * 60 * 1000;
        if (diff > week) {
            notifyUser(
                '🎯 Actualiza tu Diana',
                'Ha pasado más de una semana desde tu última evaluación. ¿Cómo te sientes hoy?'
            );
        }
    } else {
        // Primera vez: sugerir actualización después de 1 día
        localStorage.setItem(LS.lastBullseyeUpdate, String(now));
    }
}

/**
 * Ejecuta un recordatorio de respiración (opcional).
 */
function remindBreathing() {
    notifyUser('🌬️ Pausa de respiración', 'Tómate 1 minuto para respirar conscientemente.');
}

/**
 * Inicia los recordatorios periódicos.
 */
export function startReminders() {
    const config = loadConfig();

    // Limpiar intervalo anterior
    if (reminderIntervalId) {
        clearInterval(reminderIntervalId);
        reminderIntervalId = null;
    }

    // Comprobar inmediatamente
    if (config.actionsReminder) checkActions();
    if (config.bullseyeReminder) checkBullseyeUpdate();

    // Programar intervalos
    const intervalMs = config.reminderInterval * 60 * 1000;
    reminderIntervalId = setInterval(() => {
        if (config.actionsReminder) checkActions();
        if (config.bullseyeReminder) checkBullseyeUpdate();
        if (config.breathingReminder) remindBreathing();
    }, intervalMs);
}

/**
 * Detiene los recordatorios.
 */
export function stopReminders() {
    if (reminderIntervalId) {
        clearInterval(reminderIntervalId);
        reminderIntervalId = null;
    }
}

/**
 * Carga la configuración desde localStorage.
 */
function loadConfig() {
    const stored = localStorage.getItem(LS.notificationConfig);
    if (stored) {
        try {
            return { ...DEFAULTS, ...JSON.parse(stored) };
        } catch { /* ignore */ }
    }
    return { ...DEFAULTS };
}

/**
 * Guarda la configuración.
 */
function saveConfig(config) {
    localStorage.setItem(LS.notificationConfig, JSON.stringify(config));
}

/**
 * Actualiza la configuración y reinicia los recordatorios.
 */
export function updateReminderConfig(config) {
    saveConfig(config);
    startReminders();
}

/**
 * Inicializa el módulo de notificaciones (solicita permiso y arranca).
 */
export function initNotifications() {
    requestNotificationPermission().then(granted => {
        if (granted) {
            console.log('Notificaciones permitidas.');
        } else {
            console.log('Notificaciones no permitidas, se usarán toasts.');
        }
    });
    startReminders();
}

// Guardar la fecha de actualización de la diana automáticamente al guardar
export function recordBullseyeUpdate() {
    localStorage.setItem(LS.lastBullseyeUpdate, String(Date.now()));
}
