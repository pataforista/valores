# Revisión diagnóstica y plan de mejora — Valores del Valle

*Fecha: 2026-07-05 · Alcance: todo el código de la app (HTML, CSS, JS, SW, manifest)*

## Resumen ejecutivo

La aplicación es funcional y tiene una base sólida: módulos ES separados por responsabilidad, escape de HTML consistente, focus-trap en modales, fallback si GSAP no carga, y una PWA que funciona offline. Sin embargo, arrastra deuda de iteraciones anteriores que afecta tanto la **utilidad** (respaldo sin restauración, claves internas en inglés visibles al usuario, fecha del compromiso ignorada, scroll bloqueado en móvil) como la **estética** (hoja de estilos con ~40 % de CSS muerto o duplicado que produce estilos impredecibles, colores de marca inconsistentes en 4 sitios, contrastes que fallan WCAG en tema oscuro).

Los hallazgos se listan por categoría con referencia `archivo:línea`, y al final hay un plan de corrección en 6 fases priorizadas.

---

## A. Errores funcionales (utilidad)

### A1. El respaldo se descarga pero no se puede restaurar — **crítico**
`main.js:169-193` genera un JSON con todos los datos, pero no existe ninguna función de importación. Un usuario que pierda su dispositivo o borre datos no puede recuperar nada con su respaldo. Además, el botón 💾 dice "Guardar todo ahora" cuando en realidad descarga un archivo: el guardado ya es automático, el título confunde.

### A2. Claves internas en inglés visibles al usuario — **alto**
- `ui_path.js:128`: el resumen del compromiso muestra `Área: work` (o `rel`, `growth`, `leisure`).
- `ui_path.js:213`: la lista "Acciones comprometidas" muestra la clave cruda igual.

Falta un mapa `{work: "Trabajo / Educación", …}` compartido para toda etiqueta de área.

### A3. La fecha del compromiso se pide pero se ignora — **alto**
El formulario exige "Fecha y hora exactas" (`index.html:157-159`), se guarda en el objeto (`ui_path.js:65`), pero nunca se valida (acepta fechas pasadas o vacías), no aparece en el resumen del compromiso, ni en la lista de acciones, ni en el export para el terapeuta. Para una app de compromisos conductuales, la fecha es el dato central.

### A4. Scroll bloqueado en la lista Top 10 en móvil — **alto**
`ui_values.js:178-202`: `touchstart` inicia el arrastre desde **cualquier punto** del ítem y `touchmove` hace `preventDefault()` (passive: false). Con 10 valores, la lista ocupa gran parte de la pantalla y el usuario no puede desplazar la página si su dedo cae sobre un ítem. El hint dice "Arrastra usando el botón ≡" pero el código no restringe el arrastre al asa. Corrección: iniciar drag táctil solo desde `.grab`.

### A5. Texto de ayuda desactualizado (cartas que ya no se voltean) — **medio**
`index.html:61`: "Toca una carta para ver definición y agrega/quita en la parte de atrás". El sistema de volteo se eliminó: `renderCards()` (`ui_values.js:51-87`) muestra la definición al frente y no existe ningún manejador de flip. El usuario nuevo busca una interacción que no existe.

### A6. Re-render completo del mazo en cada toggle — **medio**
`ui_values.js:107-110`: agregar o quitar un valor reconstruye las 58 cartas con animación de entrada aleatoria (`gsap.from … delay: Math.random()`). Produce parpadeo del mazo completo y sensación de fallo. Basta actualizar la clase y el botón de la carta afectada.

### A7. Valores personalizados sin edición ni borrado — **medio**
`ui_values.js:15-49`: se pueden crear valores propios, pero no hay forma de editarlos ni eliminarlos del mazo (solo quitarlos del Top 10). Además el Top 10 guarda **copias completas** del objeto (`values.js:76-82`), por lo que si una definición cambia, la copia queda desincronizada. Sugerencia: guardar solo IDs en `vv_myValues_v1` y resolver contra el catálogo al cargar (con migración de datos existentes).

### A8. Botón de ruido marrón queda teñido de color primario — **bajo**
`sos.js:38,44`: al apagar, GSAP anima `backgroundColor` a `var(--primary)`, pero el botón es `.btn` neutro; queda teal permanentemente y además GSAP no interpola bien valores `var()`. Corrección: alternar una clase CSS.

### A9. Icono de tema incorrecto al cargar — **bajo**
`main.js:397-399`: si el tema guardado es oscuro, el botón sigue mostrando 🌙 en lugar de ☀️ (el icono solo se actualiza al hacer clic).

### A10. Contador SOS muestra "0s" viejo el primer segundo — **bajo**
`sos.js:296-316`: `runTimerStep` fija `remaining = seconds` pero no pinta el valor hasta el primer tick; el usuario ve el "0s" residual del HTML durante 1 s.

### A11. Temporizador de respiración cuadrada no se limpia — **bajo**
`sos.js:50,105`: `boxTimer` no pasa por `trackTimer`, así que sigue corriendo si el usuario cambia de pestaña con el ejercicio activo (solo se detiene con el botón).

### A12. Tipografía rota offline — **medio**
`outfit.css` carga los TTF desde `fonts.gstatic.com`; el SW solo cachea recursos same-origin (`sw.js:63`), así que sin conexión la app cae a la fuente del sistema y la identidad visual cambia. Además TTF pesa más que WOFF2. Corrección: self-host Outfit en WOFF2 (`/fonts/`), añadirla a `ASSETS` y quitar los dominios de Google Fonts del CSP.

### A13. Estrategia de caché frágil para actualizaciones — **medio**
`sw.js:56-58` es cache-first incluso para `index.html`: cualquier despliegue depende de acordarse de subir `CACHE_NAME` (v8 manual). Recomendado: network-first (con fallback a caché) para navegaciones, cache-first para estáticos versionados.

### A14. Código muerto: `src/illustrations.js` — **bajo**
Nadie importa `DOMAIN_ILLUSTRATIONS` ni `getDomainForValue`. Decidir: eliminarlo, o (mejor) reutilizar `getDomainForValue` para agrupar el mazo por dominio vital (ver D1). Nota: tampoco está en `ASSETS` del SW, señal de que ya se consideraba huérfano.

---

## B. Accesibilidad

### B1. Contrastes que fallan WCAG AA — **alto**
- `.status-pill` y `.rank-num` (`style.css:1344-1352, 2373-2384`): texto blanco sobre `--ring` `#CBD5E1` ≈ 1.5:1. Ilegible.
- Tema oscuro: `.btn.primary` mantiene texto blanco (`style.css:237-240`) sobre `--primary` `#81E6D9` (teal claro) ≈ 1.9:1. Afecta a todos los botones primarios de la app en oscuro. Corrección: texto oscuro (`#1A202C`) sobre primario claro en tema oscuro.

### B2. Ejercicios SOS no operables con teclado — **alto**
`.sensory-item` (`sos.js:184-194`), `.bubble` (`sos.js:226-241`), `.sos-tap-area` y los `.dot` del carrusel son `div` con `onclick`, sin `role="button"`, `tabindex` ni manejo de Enter/Espacio. Un usuario de teclado o switch no puede completar ninguna técnica de crisis — precisamente la sección más sensible.

### B3. Botones de cabecera solo con emoji — **medio**
`index.html:35-42`: los 7 botones dependen de `title` (no accesible en táctil y anuncio pobre en lectores). Añadir `aria-label` explícito a cada uno.

### B4. GSAP ignora `prefers-reduced-motion` — **medio**
El CSS lo respeta (`style.css:2337-2344`) y galaxy.js también (`galaxy.js:24,135`), pero las animaciones GSAP no: bob infinito del avatar (`avatar.js:51`), parpadeo (`avatar.js:11-25`), transiciones de vistas (`main.js:369`), entradas de cartas. Envolver en un check de `matchMedia("(prefers-reduced-motion: reduce)")` o usar `gsap.matchMedia()`.

---

## C. Estética y consistencia visual

### C1. style.css: duplicación masiva y ~40 % de CSS muerto — **alto (raíz de muchos males)**
El archivo (2 435 líneas) acumula capas de iteraciones que se pisan entre sí:

| Problema | Evidencia |
|---|---|
| `.values-grid` definido 3 veces | líneas 355, 1360, 2176 |
| `.card-container` definido 3+ veces con reglas contradictorias | 362, 1367, 2186 |
| `.bullseye-visual` definido 2 veces — la segunda (2053) **anula** el fondo de cuadrantes de colores de la primera (608) | el diseño con conic-gradient por áreas nunca se ve |
| `.carousel-dots` / `.dot` duplicados con tamaños distintos | 1020-1037 vs 1060-1081 |
| Sistema completo de flip (`.card-face`, `.card-front`, `.card-back`, `.flipped`, `.card-tooltip`) sin ningún uso en JS/HTML | ~1468-1621 y parches posteriores |
| `.ranking-item` + sus animaciones escalonadas: el JS genera `.rank-item` | 291-351, 1678-1692 |
| `.marker-*`, `.breath-circle`, `.carousel-item`, `.compass-glass`, `.character-body`, `.moomin-*`: sin uso | varios bloques |
| Guerra de `!important` para arreglar lo anterior | 1494-1506, 2352-2359 |

Consecuencia práctica: cualquier cambio visual es impredecible (hay que saber cuál de las 3 definiciones gana). **La depuración de este archivo es prerequisito de cualquier mejora estética seria.** Estimo que puede quedar en ~1 400 líneas sin cambiar la apariencia actual.

### C2. Colores de marca inconsistentes en 4 fuentes de verdad — **medio**
- `--primary` = `#5B8C96` (style.css:9)
- `<meta theme-color>` = `#739BA3` (index.html:12)
- manifest `theme_color` = `#8BC4C2` (manifest.json:11)
- manifest `background_color` = `#FFFBF0` vs `--bg` = `#F0F2F5`

Resultado: la barra de estado, el splash de la PWA y la app muestran tres teales distintos y el splash "flashea" crema→gris. Unificar en tokens y añadir `<meta name="theme-color" media="(prefers-color-scheme: dark)">`.

### C3. Más de 30 estilos inline en index.html — **medio**
Botones SOS, footer completo, modal de info, etc. (`index.html:274-431` es el caso extremo). Dificultan el theming (p. ej. el footer usa `var(--card)` inline pero no puede reaccionar a media queries) y ensucian el HTML. Migrar a clases.

### C4. Etiquetas de la Diana rotadas 90° y nomenclatura inconsistente — **medio**
- Las etiquetas derecha/izquierda se leen en vertical (`style.css:661-683`), incómodo.
- La misma área se llama distinto según la pestaña: Diana dice "Crecimiento / Salud" y "Ocio / Tiempo libre"; el Sendero dice "Salud" y "Tiempo libre" (`index.html:149-154` vs `101-115`). Unificar con el mismo diccionario de A2.
- Conceptualmente, el radar invertido (100 = centro) más la frase "100 = más cerca del centro" exige esfuerzo; ayudaría un mini-ejemplo visual o etiquetas "cerca/lejos" en los extremos de los sliders.

### C5. Iconografía emoji — **bajo**
Los emoji de cabecera y cartas TIP se ven distintos en cada plataforma y desentonan con la estética Moomin cuidada del avatar. Un set SVG inline (Lucide/Heroicons, self-hosted) daría consistencia sin dependencias.

### C6. Partículas rosas fuera de paleta — **bajo**
`galaxy.js:17`: `#FF9FFC` (rosa neón) no pertenece a la paleta teal/arena/coral. Tematizarlas (`--primary` con alpha, o un tono por tema claro/oscuro).

### C7. Cabecera desbordada en móvil — **medio**
Con 7 botones, en ≤768 px el header pasa a dos filas de ancho completo (`style.css:2422-2434`), consumiendo espacio vertical valioso. Opciones: agrupar acciones secundarias (guardar, info, ayuda) en un menú "⋯", o mover la navegación de pestañas a una barra inferior fija (patrón app nativa, más alcanzable con el pulgar).

### C8. Avatar puede tapar contenido — **bajo**
140 px fijos abajo-derecha (`style.css:1139-1162`); en pantallas pequeñas cubre los botones SOS y el footer. Añadir botón para minimizarlo/ocultarlo (persistido) y reducirlo en viewports chicos.

---

## D. Mejoras de utilidad propuestas

1. **Buscador y filtros del mazo**: 58 cartas exigen mucho scroll. Añadir input de búsqueda, filtro "solo seleccionados" y agrupación por dominio vital reutilizando `getDomainForValue()` (hoy muerto, A14).
2. **Historial de la Diana**: hoy solo se guarda el estado actual. Guardar snapshots fechados al pulsar "Guardar" y graficar la evolución semanal — es el dato de progreso que un terapeuta querría ver, y Chart.js ya está cargado.
3. **Export terapeuta completo**: `export.js` omite barreras internas (con su habilidad mindfulness), barreras externas (con plan), fechas y áreas de cada acción. Incluirlo todo.
4. **Compartir nativo**: `shareCommitment` (`ui_path.js:158-169`) usa solo portapapeles; usar `navigator.share` con fallback a clipboard.
5. **Recordatorios**: generar archivo `.ics` por acción comprometida (funciona offline y sin permisos) como primera iteración; Notifications API como segunda.
6. **SMART completo**: hoy solo hay M, A, R (`index.html:163-198`). S (específico) y T (tiempo) existen como campos pero no como criterios marcados; explicitarlos cierra el modelo de Russ Harris.
7. **Toast con duración proporcional** al largo del mensaje (hoy 1 200 ms fijos, `utils.js:28`).
8. **CSP más estricta**: `script-src` no necesita `'unsafe-inline'` (no hay scripts inline, index.html:7-8); tras self-hostear la fuente también sobran los dominios de Google Fonts.

---

## E. Calidad de código e infraestructura

1. **Import circular** `main.js ⇄ ui_values.js/ui_path.js/sos.js` a través del objeto `el`. Funciona por hoisting de ESM pero es frágil: extraer `el` a un módulo `src/dom.js`.
2. **`initBullseye(el)`** (`bullseye.js:78`) declara un parámetro que nadie pasa y que sombrea el nombre `el` usado en el resto del código. Eliminar.
3. **Iconos PNG pesados**: `icon-512.png` 341 KB y `icon-maskable-512.png` 220 KB (`icons/`). Optimizables a <60 KB sin pérdida visible (afecta a instalación y caché).
4. **Sin README, LICENSE, lint ni tests.** Mínimo recomendable: README con propósito/estructura/deploy, licencia explícita (importante al pedir donaciones), ESLint flat config y un smoke test Playwright (cargar, cambiar pestañas, agregar valor, abrir SOS) en GitHub Actions.
5. **Manifest**: falta `description`; el `name` "Valores del Valle CACB" contiene un acrónimo sin explicar que aparece en el instalador.

---

## Plan de corrección por fases

Cada ítem referencia el hallazgo. Esfuerzo: **S** < 1 h · **M** 1-4 h · **L** > 4 h.

### Fase 1 — Correcciones funcionales (máximo impacto/esfuerzo)
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 1.1 | Importar/restaurar respaldo JSON (validando esquema) + renombrar botón a "Descargar respaldo" | A1 | M |
| 1.2 | Diccionario único de áreas (ES) usado en resumen, lista, export y ambos selects | A2, C4 | S |
| 1.3 | Validar fecha (futura, opcionalmente obligatoria) y mostrarla en resumen, lista y export | A3 | M |
| 1.4 | Drag táctil solo desde el asa ≡; restaurar scroll normal en la lista | A4 | M |
| 1.5 | Corregir hint de cartas, icono de tema, botón de ruido, "0s" inicial, boxTimer | A5, A8-A11 | S |
| 1.6 | Render incremental de cartas (sin reconstruir el mazo) | A6 | M |
| 1.7 | Borrar/editar valores personalizados; migrar Top 10 a IDs | A7 | M-L |

### Fase 2 — Accesibilidad
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 2.1 | Corregir contrastes (pills, rank-num, primario en oscuro) | B1 | S |
| 2.2 | Teclado + roles en sensory-items, burbujas, tap-area, dots | B2 | M |
| 2.3 | `aria-label` en botones de cabecera | B3 | S |
| 2.4 | `gsap.matchMedia` para reduced-motion | B4 | S |

### Fase 3 — Saneamiento estético (el CSS primero)
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 3.1 | Depurar style.css: eliminar duplicados y CSS muerto, consolidar en una sola definición por componente, verificando pantalla por pantalla | C1 | L |
| 3.2 | Unificar tokens de color (CSS ⇄ meta ⇄ manifest) + theme-color por esquema | C2 | S |
| 3.3 | Migrar estilos inline a clases | C3 | M |
| 3.4 | Rediseñar etiquetas de la Diana (horizontales) y pista visual cerca/lejos | C4 | M |
| 3.5 | Iconos SVG en cabecera y TIP; partículas tematizadas | C5, C6 | M |
| 3.6 | Cabecera móvil: menú "⋯" o tabs en barra inferior | C7 | M-L |
| 3.7 | Avatar minimizable | C8 | S |

### Fase 4 — PWA y offline
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 4.1 | Self-host Outfit (WOFF2) + caché + CSP sin Google Fonts | A12, D8 | M |
| 4.2 | SW network-first para navegación; limpiar ASSETS | A13 | S |
| 4.3 | Optimizar iconos PNG; manifest con description y colores alineados | E3, E5, C2 | S |

### Fase 5 — Nuevas capacidades
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 5.1 | Buscador + filtros + agrupación por dominio en el mazo | D1 | M |
| 5.2 | Historial de la Diana con gráfica de evolución | D2 | L |
| 5.3 | Export completo + Web Share API | D3, D4 | S |
| 5.4 | Recordatorios .ics por compromiso | D5 | M |
| 5.5 | SMART completo (S y T) | D6 | S |

### Fase 6 — Infraestructura
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 6.1 | README + LICENSE | E4 | S |
| 6.2 | ESLint + smoke test Playwright + CI | E4 | M |
| 6.3 | Extraer `src/dom.js` (romper import circular) y limpiar `initBullseye(el)`, `illustrations.js` | E1, E2, A14 | S |

**Orden recomendado**: 1 → 2 → 3 → 4 → 5 → 6, aunque 3.1 (depuración de CSS) puede adelantarse si se va a tocar estética antes que funcionalidad, porque todo cambio visual posterior se abarata.
