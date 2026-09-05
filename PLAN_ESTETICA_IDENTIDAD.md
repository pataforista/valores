# Plan de mejora — Estética e identidad visual

*Fecha: 2026-09-05 · Alcance: identidad visual y de marca de Valores del Valle, a partir de la comparación con Headspace, Calm, Forest, Fabulous, Focus Friend y Pokémon Sleep.*

## Resumen ejecutivo

Funcionalmente la app ya no tiene nada que envidiarle a sus competidores directos de ACT (ver comparación de esta misma revisión): cubre el arco completo de valores → jerarquía → evaluación → acción → defusión → exposición → crisis, en español, 100% offline. Estéticamente está en un nivel sólido de "app indie bien cuidada" — consistente, accesible, sin bugs visuales — pero le falta lo único que **todas** las apps premiadas comparadas tienen sin excepción: **una identidad visual propia y ownable** (un personaje, un set de iconos, un mundo visual reconocible). Hoy esa identidad se apoya en emoji del sistema operativo y en un canvas de partículas genérico, que es exactamente lo que separa a una app "bien hecha" de una app "premiada por su diseño".

Este documento no repite lo que ya funciona bien (paleta de tokens consistente, tipografía Outfit self-hosted, modo oscuro completo, animaciones que respetan `prefers-reduced-motion`, sistema de tarjetas uniforme). Se enfoca en las brechas concretas y en un plan de fases para cerrarlas.

---

## A. Hallazgo pendiente de la revisión de dispositivos de hoy

### A1. La burbuja de "Brújula" sigue tapando contenido — parcialmente mitigado

Al revisar la app en iPhone SE (375px, el teléfono común más angosto), la burbuja de diálogo de Brújula se superpone visualmente sobre botones y campos a ancho completo (ej. "Categorías (Cognitivo)" en SOS, el select de valor en Exposición) durante los ~4 segundos que está visible. No bloquea clics (`pointer-events: none`), pero se ve poco profesional y es el mismo problema que el diagnóstico anterior ya había marcado como **C8 — Avatar tapa contenido**.

Hoy se redujo su huella (140px de ancho máx. en vez de 180px, duración 4s en vez de 5s), pero el problema de fondo — un elemento `position: fixed` flotando sobre una columna de contenido a ancho completo — no se resuelve solo con recortar tamaños. Se detalla la solución de fondo en la Fase 1 más abajo.

---

## B. La brecha real: identidad visual ownable

| Elemento | Valores del Valle hoy | Lo que tienen **todas** las apps premiadas comparadas |
|---|---|---|
| Personaje/mascota | "Brújula": un ícono plano con 5 estados de humor vía CSS class-swap, sin ilustración propia por estado | Headspace (familia de blobs), Forest (árbol/bosque evolutivo), Focus Friend (un pájaro con personalidad viral), Fabulous ("Coach Fabulous") |
| Iconografía | Emoji nativo del SO (🍃🧭🎯🌉🧗🧊🏃‍♂️🌬️👁️🤚👂👃👅📥📤📋🔊🌙❓ℹ️📖) — se ve distinto en iOS/Android/Windows y no se puede tematizar | Set de iconos SVG propio, coherente con la marca, igual en todos los dispositivos |
| Fondo/ambientación | Canvas de partículas genérico (`galaxy.js`) sin conexión temática con "valle" o "brújula" | Mundo visual propio: video de naturaleza (Calm), parallax de bosque (Forest), universo ilustrado (Headspace) |
| Momentos de deleite | Confeti genérico al desbloquear logros | Micro-animaciones de marca (árbol creciendo, coach celebrando, blob reaccionando) |

El emoji es el síntoma más visible: renderiza distinto en cada plataforma, no se puede alinear al color de marca (`#5B8C96`), y comunica "prototipo" más que "producto terminado". Es también el punto de mayor apalancamiento: reemplazarlo por un set de iconos propio, coherente, es el cambio individual que más sube la percepción de "app profesional" por el esfuerzo que requiere.

---

## C. Plan de fases

### Fase 1 — Sistema de personaje "Brújula" (prioridad alta)

1. **Ilustrar estados reales**, no solo clases CSS: hoy `setState("happy"|"worried"|"tired"|"surprised"|"neutral")` cambia una clase pero el dibujo base es el mismo compás con ojos; diseñar una pose/expresión ilustrada distinta por estado (aunque sea simple, vectorial, 2-3 colores) para que el cambio de humor se *sienta*, no solo se infiera del texto.
2. **Momento de presentación**: darle a Brújula una escena de introducción en el onboarding (hoy aparece y ya habla) — un instante de "así es tu compañera de viaje" construye el mismo apego que Headspace logra nombrando a sus blobs.
3. **Resolver el solapamiento de fondo**: en vez de solo achicar la burbuja, hacer que Brújula sea *consciente del contenido*: usar `IntersectionObserver` sobre los botones/CTAs principales de la vista activa y, si Brújula fuera a superponerse, mover la burbuja hacia arriba o suprimirla ese ciclo. Alternativa más simple: en pantallas angostas, que la burbuja aparezca como una franja fija en la parte *inferior* de la pantalla (por debajo de todo el contenido interactivo) en vez de flotar sobre la columna central.

**Esfuerzo estimado:** L (ilustración) + M (lógica de posicionamiento).

### Fase 2 — Iconografía propia (prioridad alta, mejor costo/beneficio)

1. Definir un set de ~25-30 iconos SVG *stroke-based* (2px, esquinas redondeadas, un solo color heredando `currentColor`) que cubra: navegación (valores, diana, sendero, hojas, miedos, sos), áreas de vida (trabajo, relaciones, crecimiento, ocio — hoy usan emoji dentro de `injectIcons()` en `bullseye.js`), acciones de header (respaldo, restaurar, copiar, sonido, tema, ayuda, info, glosario), y los 5 sentidos de la técnica 5-4-3-2-1 en SOS.
2. Reemplazar cada emoji del HTML/JS por un `<svg>` inline o sprite, manteniendo el `aria-label` existente (la accesibilidad ya está resuelta, solo cambia el glifo).
3. Mantener el mismo grosor de trazo y radio de esquina en todos para que se sientan "de la misma familia" — este es el detalle que más se nota cuando falta.

**Esfuerzo estimado:** M-L (diseño del set) + S (reemplazo mecánico en el código, ya que los `aria-label` existen).

### Fase 3 — Fondo y ambientación temática (prioridad media)

1. Evolucionar `galaxy.js` de partículas genéricas a un motivo conectado con "valle" o "brújula": por ejemplo, una silueta de montañas/valle en capas con parallax sutil, o un cielo estrellado que dibuje ocasionalmente una constelación con forma de brújula.
2. El agua de "Hojas en el Agua" (rediseñada en esta misma sesión con ondas y cáusticas generadas al azar) ya es el estándar de calidad a replicar: un fondo animado con identidad propia en vez de un efecto de partículas intercambiable con cualquier otra app.

**Esfuerzo estimado:** M.

### Fase 4 — Micro-interacciones de marca (prioridad media)

1. Reemplazar el confeti genérico (`achievements.js`) por una animación de celebración propia coherente con el motivo "valle/sendero" (ej. una hoja cayendo, un destello de brújula, un camino que se ilumina).
2. Dar a Sendero un "pago visual" al completar SMART completo (hoy solo hay confeti + toast): un pequeño momento animado equivalente al árbol de Forest al terminar una sesión de foco.

**Esfuerzo estimado:** S-M por cada micro-interacción.

### Fase 5 — Pulido tipográfico y de color (prioridad baja)

1. La paleta actual (`#5B8C96` teal) es apropiada para el contexto ACT pero comparte el mismo territorio cromático que casi toda la categoría wellness (Calm, Headspace también viven en azul/teal) — considerar un acento secundario cálido usado con moderación (logros, momentos de celebración) para diferenciar el reconocimiento de marca a simple vista.
2. Outfit ya es una buena elección y está self-hosted; se puede introducir un peso/tratamiento distinto para títulos de sección (hoy el peso es bastante uniforme) para dar más jerarquía visual sin agregar una segunda familia tipográfica.

**Esfuerzo estimado:** S.

---

## D. Orden recomendado

| # | Fase | Impacto en percepción de marca | Esfuerzo |
|---|---|---|---|
| 1 | Iconografía propia (C2) | Muy alto | M-L |
| 2 | Sistema de personaje Brújula (C1) | Muy alto | L |
| 3 | Fondo/ambientación temática (C3) | Medio-alto | M |
| 4 | Micro-interacciones de marca (C4) | Medio | S-M |
| 5 | Tipografía/color (C5) | Bajo-medio | S |

Recomendación: empezar por **Iconografía propia** — es el cambio de mayor impacto por esfuerzo invertido, no requiere decisiones de personaje/narrativa, y de inmediato elimina la inconsistencia visual entre plataformas que es la señal más obvia de "no terminado". El sistema de personaje es el de mayor impacto total, pero también el de mayor esfuerzo e involucra decisiones de diseño/narrativa que conviene tomar con calma (posiblemente con bocetos de referencia) antes de implementar.
