"use strict";

import { SoundFX, isSoundEnabled } from './audio.js';

const STATES = ["neutral", "happy", "worried", "tired", "surprised"];

function initBlinkEffect() {
    const eyes = document.getElementById('eyes');
    if (!eyes) return;

    const blink = () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.killTweensOf(eyes);
        gsap.timeline({
            onComplete: () => {
                const next = 1700 + Math.random() * 3200;
                setTimeout(blink, next);
            }
        })
            .to(eyes, { scaleY: 0.08, duration: 0.09, transformOrigin: "center center", ease: "power1.in" })
            .to(eyes, { scaleY: 1, duration: 0.1, ease: "power1.out" })
            .to(eyes, { scaleY: 0.18, duration: 0.06, ease: "power1.in", delay: 0.12 })
            .to(eyes, { scaleY: 1, duration: 0.08, ease: "power1.out" });
    };

    setTimeout(blink, 1400);
}

export const CompassAvatar = (function () {
    let box, compass, bubble, bubbleText, pupilL, pupilR, shineL, shineR;
    let speakTimer;

    function init() {
        box = document.getElementById('avatarBox');
        const root = document.getElementById('avatarRoot');
        if (!box || !root) return;

        root.hidden = false;
        root.classList.add("walking");
        compass = document.getElementById('compass');
        initBlinkEffect();
        bubble = document.getElementById('avatarBubble');
        bubbleText = document.getElementById('avatarText');
        pupilL = document.getElementById('pupilL');
        pupilR = document.getElementById('pupilR');
        shineL = document.getElementById('shineL');
        shineR = document.getElementById('shineR');

        setState("neutral");

        // Add micro-animation with GSAP (disabled if reduced motion preferred)
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.to(box, { y: -5, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });
        }

        box.addEventListener("click", () => {
            const r = Math.random();
            if (r < 0.33) speak("¡Aquí estoy! ¿Seguimos al norte?", "happy");
            else if (r < 0.66) speak("Tú tienes el control del timón.", "neutral");
            else speak("¡Bip bip! Lista para navegar.", "surprised");
        });

        document.addEventListener("mousemove", (e) => {
            const r = box.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const nx = (e.clientX - cx) / (r.width / 2);
            const ny = (e.clientY - cy) / (r.height / 2);
            setPupilOffset(nx * 3.8, ny * 3.2);
        });

        setTimeout(() => {
            speak("Hola. Soy tu brújula: te acompaño en el camino.", "happy");
        }, 1000);
    }

    function setState(next) {
        if (!compass) return;
        STATES.forEach(s => compass.classList.remove("state-" + s));
        compass.classList.add("state-" + next);
    }

    function speak(text, nextState) {
        if (!compass) return;
        if (nextState) setState(nextState);

        if (bubbleText) bubbleText.textContent = text;
        if (bubble) {
            bubble.classList.add("show");
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            gsap.fromTo(bubble, { scale: reduced ? 1 : 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: reduced ? 0 : 0.3, ease: "back.out(1.7)" });

            clearTimeout(speakTimer);
            speakTimer = setTimeout(() => {
                gsap.to(bubble, { scale: reduced ? 1 : 0.8, opacity: 0, duration: reduced ? 0 : 0.2, onComplete: () => bubble.classList.remove("show") });
            }, 5000);
        }

        compass.classList.add("talking");
        setTimeout(() => compass.classList.remove("talking"), 1500);

        if (isSoundEnabled()) SoundFX.click();
    }

    function setPupilOffset(dx, dy) {
        if (!pupilL) return;
        const x = Math.max(-3.2, Math.min(3.2, dx));
        const y = Math.max(-2.6, Math.min(2.6, dy));
        const xs = dx * 0.7;
        const ys = dy * 0.7;

        const pupils = [pupilL, pupilR];
        const shines = [shineL, shineR];

        pupils.forEach(p => {
            p.style.setProperty("--px", x + "px");
            p.style.setProperty("--py", y + "px");
        });
        shines.forEach(s => {
            s.style.setProperty("--px", xs + "px");
            s.style.setProperty("--py", ys + "px");
        });
    }

    return {
        init,
        speak,
        setState
    };
})();
