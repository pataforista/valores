"use strict";

import { safeJSONParse, LS } from './utils.js';

export const valuesData = [
    { id: 1, name: "Aceptación", def: "Estar abierto y aceptarme a mí mismo, a los demás, a la vida, etc." },
    { id: 2, name: "Aventura", def: "Ser aventurero; buscar, crear o explorar activamente experiencias novedosas o estimulantes." },
    { id: 3, name: "Asertividad", def: "Defender respetuosamente mis derechos y pedir lo que quiero." },
    { id: 4, name: "Autenticidad", def: "Ser auténtico, genuino, real; ser sincero conmigo mismo." },
    { id: 5, name: "Belleza", def: "Apreciar, crear, nutrir o cultivar la belleza en mí mismo, en los demás, en el ambiente, etc." },
    { id: 6, name: "Cuidado", def: "Cuidarme a mí mismo, a los demás, al medio ambiente, etc." },
    { id: 7, name: "Desafío", def: "Seguir desafiándome a mí mismo para crecer, aprender, mejorar." },
    { id: 8, name: "Compasión", def: "Actuar con bondad hacia los que sufren." },
    { id: 9, name: "Conexión", def: "Participar plenamente en lo que hago y estar presente con los demás." },
    { id: 10, name: "Contribución", def: "Contribuir, ayudar o hacer una diferencia positiva para mí o para los demás." },
    { id: 11, name: "Conformidad", def: "Ser respetuoso y obediente de las reglas y obligaciones." },
    { id: 12, name: "Cooperación", def: "Ser cooperativo y colaborador con los demás." },
    { id: 13, name: "Coraje", def: "Persistir ante el miedo, la amenaza o la dificultad." },
    { id: 14, name: "Creatividad", def: "Ser creativo o innovador." },
    { id: 15, name: "Curiosidad", def: "Ser curioso, de mente abierta e interesado; explorar y descubrir." },
    { id: 16, name: "Estímulo", def: "Alentar y recompensar el comportamiento que valoro en mí o en otros." },
    { id: 17, name: "Igualdad", def: "Tratar a los demás como iguales a mí, y viceversa." },
    { id: 18, name: "Emoción", def: "Buscar, crear y participar en actividades emocionantes o estimulantes." },
    { id: 19, name: "Equidad", def: "Ser justo conmigo mismo o con los demás." },
    { id: 20, name: "Fitness", def: "Velar por mi salud y bienestar físico y mental." },
    { id: 21, name: "Flexibilidad", def: "Adaptarme fácilmente a circunstancias cambiantes." },
    { id: 22, name: "Libertad", def: "Elegir cómo vivo y me comporto (o ayudar a otros a hacerlo)." },
    { id: 23, name: "Amabilidad", def: "Ser amigable, sociable o agradable con los demás." },
    { id: 24, name: "Perdón", def: "Perdonarme a mí mismo o a los demás." },
    { id: 25, name: "Diversión", def: "Buscar, crear y participar en actividades llenas de diversión." },
    { id: 26, name: "Generosidad", def: "Ser generoso, compartir y dar." },
    { id: 27, name: "Gratitud", def: "Estar agradecido y apreciar aspectos positivos de mí, otros y la vida." },
    { id: 28, name: "Honestidad", def: "Ser veraz y sincero conmigo mismo y con los demás." },
    { id: 29, name: "Humor", def: "Ver y apreciar el lado humorístico de la vida." },
    { id: 30, name: "Humildad", def: "Ser modesto; dejar que mis logros hablen por sí mismos." },
    { id: 31, name: "Industria", def: "Ser trabajador y dedicado." },
    { id: 32, name: "Independencia", def: "Ser autosuficiente y elegir mi forma de hacer las cosas." },
    { id: 33, name: "Intimidad", def: "Abrirme y compartirme emocional o físicamente en relaciones cercanas." },
    { id: 34, name: "Justicia", def: "Defender la justicia y la equidad." },
    { id: 35, name: "Bondad", def: "Ser amable, considerado y cariñoso conmigo mismo u otras personas." },
    { id: 36, name: "Amor", def: "Actuar con amor o cariño hacia mí mismo o los demás." },
    { id: 37, name: "Mindfulness", def: "Estar consciente y abierto a mi experiencia aquí y ahora." },
    { id: 38, name: "Orden", def: "Ser ordenado y organizado." },
    { id: 39, name: "Mente abierta", def: "Considerar otros puntos de vista y sopesar evidencia con justicia." },
    { id: 40, name: "Paciencia", def: "Esperar tranquilamente lo que quiero." },
    { id: 41, name: "Persistencia", def: "Continuar con determinación a pesar de dificultades." },
    { id: 42, name: "Placer", def: "Crear y dar placer a mí mismo o a los demás." },
    { id: 43, name: "Poder", def: "Influir fuertemente o liderar (tomar el cargo, organizar)." },
    { id: 44, name: "Reciprocidad", def: "Equilibrio justo entre dar y recibir en relaciones." },
    { id: 45, name: "Respeto", def: "Ser educado, considerado y mostrar respeto positivo." },
    { id: 46, name: "Responsabilidad", def: "Rendir cuentas de mis acciones." },
    { id: 47, name: "Romance", def: "Mostrar y expresar afecto fuerte." },
    { id: 48, name: "Seguridad", def: "Asegurar, proteger o garantizar mi seguridad o la de otros." },
    { id: 49, name: "Autoconciencia", def: "Ser consciente de mis pensamientos, sentimientos y acciones." },
    { id: 50, name: "Autocuidado", def: "Cuidar mi bienestar y satisfacer mis necesidades." },
    { id: 51, name: "Autodesarrollo", def: "Seguir creciendo/mejorando en conocimientos, habilidades o carácter." },
    { id: 52, name: "Autocontrol", def: "Actuar de acuerdo con mis ideales." },
    { id: 53, name: "Sensualidad", def: "Disfrutar experiencias que estimulan los cinco sentidos." },
    { id: 54, name: "Sexualidad", def: "Explorar o expresar mi sexualidad." },
    { id: 55, name: "Espiritualidad", def: "Conectarme con cosas más grandes que yo." },
    { id: 56, name: "Habilidad", def: "Practicar y mejorar continuamente mis habilidades." },
    { id: 57, name: "Apoyo", def: "Ser útil, alentador y estar disponible para mí o para los demás." },
    { id: 58, name: "Confianza", def: "Ser leal, fiel, sincero y confiable." }
];

valuesData.sort((a, b) => a.name.localeCompare(b.name));

export const MAX_VALUES = 10;

let activeValues = safeJSONParse(localStorage.getItem(LS.values), []);

export function getActiveValues() { return activeValues; }
export function setActiveValues(v) {
    activeValues = v;
    localStorage.setItem(LS.values, JSON.stringify(activeValues));
}

export function computeNextCustomId() {
    const ids = [58, ...activeValues.map(v => v.id).filter(id => id > 58)];
    return Math.max(...ids) + 1;
}
