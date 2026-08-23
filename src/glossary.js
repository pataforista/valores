"use strict";

const TERMS = [
    {
        term: "Valores",
        definition: "Direcciones que eliges en la vida, cualidades que quieres cultivar. No son metas, sino un horizonte.",
        example: "Ser compasivo, vivir con autenticidad, conectar con los demás.",
    },
    {
        term: "Aceptación",
        definition: "Permitir que los pensamientos y emociones estén ahí sin luchar contra ellos.",
        example: "Sentir ansiedad y no intentar eliminarla, sino hacer espacio para ella mientras actúas alineado con tus valores.",
    },
    {
        term: "Defusión",
        definition: "Desengancharse de los pensamientos, verlos como palabras y no como hechos.",
        example: 'Repetir mentalmente "Estoy teniendo el pensamiento de que soy un fracaso" en lugar de "soy un fracaso".',
    },
    {
        term: "Expansión",
        definition: "Abrirse a las emociones difíciles, hacer espacio para ellas sin evitarlas.",
        example: "Respirar profundamente y permitir que la tristeza esté presente sin intentar cambiarla.",
    },
    {
        term: "Contacto con el momento presente",
        definition: "Estar consciente de lo que ocurre aquí y ahora, sin dejarse atrapar por el pasado o el futuro.",
        example: "Prestar atención a las sensaciones del cuerpo mientras caminas.",
    },
    {
        term: "Yo observador",
        definition: "La parte de ti que observa los pensamientos y emociones sin identificarse con ellos.",
        example: "Darte cuenta de que estás enojado, pero no eres el enojo.",
    },
    {
        term: "Compromiso",
        definition: "Actuar de acuerdo con tus valores, incluso cuando sea difícil.",
        example: "Llamar a un amigo para ofrecer apoyo aunque sientas timidez.",
    },
    {
        term: "DBT (Terapia Dialéctica Conductual)",
        definition: "Terapia que combina aceptación y cambio, con énfasis en habilidades de regulación emocional.",
        example: "Técnicas como la respiración cuadrada y el anclaje de talones.",
    },
    {
        term: "Habilidad TIP (DBT)",
        definition: "Estrategia para cambiar la fisiología rápidamente: Temperatura, Intensidad, Respiración pausada.",
        example: "Sumergir la cara en agua fría para activar el reflejo de inmersión.",
    },
    {
        term: "Mindfulness",
        definition: "Prestar atención al momento presente con apertura y curiosidad.",
        example: "Observar una flor con todos los sentidos, sin juzgar.",
    },
];

/**
 * Muestra el glosario en un modal.
 */
export function showGlossary() {
    const modal = document.createElement("div");
    modal.className = "carousel-modal";
    modal.style.cssText = `
        display: flex;
        opacity: 1;
        pointer-events: auto;
        z-index: 9999;
    `;

    modal.innerHTML = `
        <div class="carousel-wrap" style="text-align: left; max-height: 90vh; overflow-y: auto; padding: 24px;">
            <h2 style="color: var(--primary); margin-top: 0;">📖 Glosario ACT / DBT</h2>
            <p style="font-size:0.9rem; color:var(--muted);">Toca un término para ver su definición y ejemplo.</p>
            <div id="glossary-list" style="display: flex; flex-direction: column; gap: 12px; margin: 16px 0;">
                ${TERMS.map((t) => `
                    <details style="border: 1px solid var(--ring); border-radius: 12px; padding: 12px;">
                        <summary style="font-weight: 700; cursor: pointer; color: var(--primary);">
                            ${t.term}
                        </summary>
                        <p style="margin: 8px 0 0 0;">${t.definition}</p>
                        <p style="margin: 6px 0 0 0; font-size:0.9rem; color:var(--muted);">
                            <strong>Ejemplo:</strong> ${t.example}
                        </p>
                    </details>
                `).join("")}
            </div>
            <button class="btn primary" id="closeGlossary" style="width:100%; margin-top: 12px;">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("closeGlossary").addEventListener("click", () => {
        modal.remove();
    });

    // Cerrar con Escape
    modal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") modal.remove();
    });

    modal.focus();
}

/**
 * Agrega un botón de glosario en la interfaz (por ejemplo, en el header o en la pestaña de valores).
 */
export function initGlossaryButton() {
    const btn = document.getElementById("glossaryMenuBtn");
    btn?.addEventListener("click", showGlossary);
}
