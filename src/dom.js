"use strict";

// DOM Elements shared across modules
export const el = {
    cards: document.getElementById("cards-container"),
    list: document.getElementById("active-list"),
    counter: document.getElementById("counter"),
    toast: document.getElementById("toast"),
    tabValues: document.getElementById("tab-values"),
    tabBull: document.getElementById("tab-bullseye"),
    tabPath: document.getElementById("tab-path"),
    tabSos: document.getElementById("tab-sos"),
    viewValues: document.getElementById("view-values"),
    viewBull: document.getElementById("view-bullseye"),
    viewPath: document.getElementById("view-path"),
    viewSos: document.getElementById("view-sos"),
    themeBtn: document.getElementById("themeBtn"),
    soundBtn: document.getElementById("soundBtn"),
    exportBtn: document.getElementById("exportBtn"),
    manualSaveBtn: document.getElementById("manualSaveBtn"),
    resetBtn: document.getElementById("resetBtn"),
    menuToggleBtn: document.getElementById("menuToggleBtn"),
    secondaryMenu: document.getElementById("secondaryMenu"),

    // Bullseye inputs
    inWork: document.getElementById("input-work"),
    inRel: document.getElementById("input-rel"),
    inGrowth: document.getElementById("input-growth"),
    inLeisure: document.getElementById("input-leisure"),
    numWork: document.getElementById("num-work"),
    numRel: document.getElementById("num-rel"),
    numGrowth: document.getElementById("num-growth"),
    numLeisure: document.getElementById("num-leisure"),

    // SOS Elements
    sosOverlay: document.getElementById("sosOverlay"),
    sosModalTitle: document.getElementById("sosModalTitle"),
    sosIcon: document.getElementById("sosIcon"),
    sosIllustration: document.getElementById("sosIllustration"),
    sosProgressBar: document.getElementById("sosProgressBar"),
    sosNextBtn: document.getElementById("sosNextBtn"),
    sosCountdown: document.getElementById("sosCountdown"),
    sosCountdownValue: document.getElementById("sosCountdownValue"),
    sosTapArea: document.getElementById("sosTapArea"),
    breathToggle: document.getElementById("breathToggle"),
    breathTimer: document.getElementById("breathTimer"),
    breathPhase: document.getElementById("breathPhase"),
    breathSquare: document.getElementById("breathSquare"),

    // Path Elements
    actionForm: document.getElementById("actionForm"),
    actionDesc: document.getElementById("actionDesc"),
    actionValue: document.getElementById("actionValue"),
    actionArea: document.getElementById("actionArea"),
    actionDate: document.getElementById("actionDate"),
    internalBarrier: document.getElementById("internalBarrier"),
    mindfulnessSkill: document.getElementById("mindfulnessSkill"),
    internalList: document.getElementById("internalList"),
    externalBarrier: document.getElementById("externalBarrier"),
    externalPlan: document.getElementById("externalPlan"),
    externalList: document.getElementById("externalList"),
    actionsList: document.getElementById("actionsList")
};
