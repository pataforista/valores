# Revisión diagnóstica y plan de mejora — Valores del Valle

*Fecha: 2026-07-18 · Alcance: todo el código de la app (HTML, CSS, JS, SW, manifest)*
*Segunda revisión: actualiza y sustituye el diagnóstico del 2026-07-05.*

## Resumen ejecutivo

Desde la revisión anterior se resolvió la mayor parte de los errores funcionales y de accesibilidad: hoy existe restauración de respaldo, diccionario único de áreas en español, validación y visualización de la fecha del compromiso, drag táctil restringido al asa ≡ (más flechas ▲▼), edición/borrado de valores personalizados con Top 10 migrado a IDs, buscador y filtros del mazo, SMART completo (S, M, A, T + recursos), Web Share, fuentes Outfit self-hosted, SW network-first para navegación, tokens de color unificados, `aria-label` en cabecera, y ejercicios SOS operables con teclado.

Sin embargo, esta revisión encuentra **una regresión crítica que rompe el modo offline** (la razón de ser de la PWA): los módulos `src/dom.js` y `src/illustrations.js` se agregaron al código pero **no** a la lista de precarga del service worker. También quedan pendientes del plan anterior dos bloques grandes (la depuración de `style.css` y la infraestructura de calidad) y aparecen varios bugs menores nuevos.

---

## A. Estado de los hallazgos de la revisión anterior

| Ref. anterior | Hallazgo | Estado |
|---|---|---|
| A1 | Respaldo sin restauración | ✅ Resuelto (`main.js:134-170`, botón 📤) |
| A2 | Claves de área en inglés visibles | ✅ Resuelto (`AREA_LABELS` en `utils.js:14-19`) |
| A3 | Fecha del compromiso ignorada | ✅ Resuelto (valida futura, se muestra en resumen y lista) |
| A4 | Scroll bloqueado en Top 10 móvil | ✅ Resuelto (drag solo desde `.grab` + flechas) |
| A5–A11 | Hint de cartas, re-render del mazo, valores personalizados, ruido, tema, "0s", boxTimer | ✅ Resueltos (render incremental en `updateSingleCardState`, edición/borrado, clase `danger`, icono ☀️ al cargar, `stopBreathing()` al cambiar de pestaña) |
| A12 | Tipografía rota offline | ✅ Resuelto (WOFF2 self-hosted en `/fonts/` + caché + CSP sin Google Fonts) |
| A13 | Caché frágil | ✅ Resuelto (network-first para navegación, `sw.js:69-84`) |
| A14 | `illustrations.js` muerto | ◐ Parcial: `getDomainForValue` ya se usa para filtrar el mazo; `DOMAIN_ILLUSTRATIONS` sigue muerto |
| B1 | Contrastes WCAG | ✅ Resuelto (parches al final de `style.css:2245-2254`), aunque con `!important` — ver C1 |
| B2 | SOS sin teclado | ✅ Resuelto (role="button" + tabindex + Enter/Espacio en sensory-items y burbujas; los dots de la intro ahora son `<button>`) |
| B3 | Botones solo emoji | ✅ Resuelto (`aria-label` explícitos) |
| B4 | GSAP ignora reduced-motion | ◐ Parcial: transiciones de vistas, avatar y burbuja ya lo respetan; **faltan** las entradas de cartas (`ui_values.js:137`) y de ítems del ranking (`ui_values.js:302`) |
| C1 | style.css duplicado/muerto | ❌ Pendiente (2 324 líneas; ver B1 de esta revisión) |
| C2 | Colores de marca inconsistentes | ✅ Resuelto (meta/manifest/CSS alineados en `#5B8C96`, theme-color por esquema) |
| C3 | Estilos inline masivos | ◐ Parcial: el footer y modales migraron a clases; persisten ~25 inline (filtros del mazo `index.html:81-94`, botones SOS, etc.) |
| C4 | Etiquetas de la Diana | ✅ Resuelto (iconos + texto horizontal inyectados por `injectIcons`) |
| C5 | Iconografía emoji | ❌ Pendiente |
| C6 | Partículas rosas fuera de paleta | ❌ Pendiente (`galaxy.js:17`, `#FF9FFC`) |
| C7 | Cabecera desbordada en móvil | ❌ Pendiente (ahora son 8 botones; en ≤768 px consume aún más espacio) |
| C8 | Avatar tapa contenido | ❌ Pendiente |
| D1–D6 | Mejoras de utilidad | ◐ D1 (filtros), D4 (Web Share) y D6 (SMART) hechas; D2 (historial Diana), D3 (export completo) y D5 (recordatorios .ics) pendientes |
| E1–E5 | Infraestructura | ◐ E1 resuelto (`src/dom.js`); E2 pendiente (`initBullseye(el)` sigue con el parámetro fantasma); E3 pendiente (iconos pesados); E4 pendiente (sin README/LICENSE/lint/tests); E5 resuelto (manifest con description y nombre limpio) |

---

## B. Hallazgos de esta revisión

### B0. El service worker no precachea `src/dom.js` ni `src/illustrations.js` — **CRÍTICO (regresión offline)**

`sw.js:5-36` lista los módulos a precachear, pero al crear `src/dom.js` (usado por casi todos los módulos) y al empezar a usar `src/illustrations.js` (importado por `ui_values.js:8`) nadie los añadió a `ASSETS`.

Consecuencia: en una instalación nueva, sin conexión, el navegador no puede resolver esos dos imports, **todo el grafo de módulos ES falla y la app queda muerta offline** (pantalla sin interactividad). En instalaciones con uso previo online puede funcionar de rebote porque el fetch handler cachea en runtime lo que se pidió alguna vez, pero no está garantizado. Es exactamente el escenario para el que existe la PWA (usarla en crisis, sin señal).

Corrección: añadir ambos a `ASSETS`, subir `CACHE_NAME` a v10, y añadir a la rutina de despliegue la regla "todo import nuevo entra en ASSETS" (o un mini-script que compare `src/*.js` contra `sw.js` y falle si difieren).

### B1. `style.css` sigue siendo la deuda principal — **alto**

2 324 líneas (eran 2 435), 36 `!important`, y persisten las definiciones múltiples y el CSS muerto detectados en la revisión anterior:

- `.values-grid` definido 3 veces (líneas 294, 1299, 1934) y `.card-container` 4+ veces (301, 1306, 1474, 1944, más media queries 2047, 2077).
- Sistema completo de volteo sin ningún uso en JS/HTML: `.card-face` (423, 1481, 1956, 2111…), `.card-front`, `.card-back`, `.card.flipped` (1403), `.card-tooltip` (1354-1377, 2086).
- Bloques huérfanos: `.marker-*` (701-737), `.compass-glass` (829), `.character-body` (843), `.moomin-*` (876), `.breath-circle` (1532-1541, el JS usa `.breath-square`), `.carousel-item` (984).
- `.carousel-dots`/`.dot` duplicados con tamaños distintos (959-975 vs 999-1016).
- Los arreglos de contraste (2245-2254) son parches `!important` encima de las definiciones viejas en vez de corregirlas en origen.

Sigue aplicando la conclusión anterior: depurar este archivo es prerequisito de cualquier mejora estética seria; puede quedar en ~1 400 líneas sin cambiar la apariencia.

### B2. Export para terapeuta sigue incompleto — **alto**

`export.js:30-36` solo imprime título y estado de cada compromiso. Omite el valor asociado, el área, la **fecha** (dato central del compromiso), las barreras internas con su habilidad mindfulness y las externas con su plan — precisamente lo que un terapeuta necesita revisar. Todo está ya en el objeto `action`; es solo formatear.

### B3. El sugeridor de habilidades puede sugerir una opción que no existe — **medio**

`ui_path.js:263-277`: para "miedo" devuelve `"Coraje"`, pero el `<select id="mindfulnessSkill">` (`index.html:235-241`) solo tiene Defusión, Expansión, Aceptación, Contacto con valores y Autocompasión. Asignar `select.value = "Coraje"` falla en silencio: el hint y el avatar anuncian una sugerencia que el select no refleja. Además `"estres"` (sin tilde) nunca coincide con lo que escribe un usuario ("estrés") y la comparación no normaliza acentos en general. Corrección: mapear solo a opciones existentes y comparar con `normalize("NFD")` sin diacríticos.

### B4. Toasts que se pisan entre sí — **medio**

`utils.js:30-36`: cada llamada programa `remove("show")` a los 1 200 ms sin cancelar el timer anterior. Dos toasts seguidos (patrón común: "¡Agregado!" + "Máximo 10 valores") hacen que el timer del primero oculte el segundo casi de inmediato. Corrección: guardar el timer y `clearTimeout` al reentrar; de paso, duración proporcional al largo del mensaje (pendiente D7 anterior).

### B5. Observer de tema en la Diana recarga los mismos PNG en cada cambio de clase — **medio**

`bullseye.js:152-165`: un `MutationObserver` sobre `class` de `<body>` vuelve a ejecutar `preparePointImages()` + `injectIcons()` ante **cualquier** cambio de clase, pero los iconos no dependen del tema: recarga y re-rasteriza exactamente las mismas imágenes sin efecto visual. El observer nunca se desconecta. Corrección: eliminarlo (o dejarlo solo si algún día hay iconos por tema). Aprovechar para quitar el parámetro fantasma `initBullseye(el)` (E2 anterior).

### B6. Filtro "Solo Top 10" no expulsa la carta al quitarla — **bajo**

Con el checkbox activo, pulsar "Quitar" en una carta solo actualiza su botón (`updateSingleCardState`, `ui_values.js:141-156`) pero la carta ya no cumple el filtro y sigue visible hasta el próximo render. Corrección: si `deckOnlySelected` está activo, re-ejecutar `renderCards()` tras el toggle.

### B7. Renombrar un valor personalizado desvincula sus compromisos — **bajo**

Las acciones guardan el valor por **nombre** (`ui_path.js:63`, `opt.value = v.name`). Si el usuario edita el nombre de un valor personalizado (`editCustomValue`), los compromisos ya declarados conservan el nombre viejo. Corrección de fondo: guardar `valueId` en la acción y resolver el nombre al renderizar (con migración de datos existentes); mientras tanto, al renombrar, actualizar también las acciones que lo referencian.

### B8. `galaxy.js` revienta si falta el canvas — **bajo**

`galaxy.js:3-4` hace `canvas.getContext("2d")` antes del check `if (canvas)` de la línea 138. Si el canvas no existe, lanza TypeError antes de llegar a la guarda. Mover el `getContext` dentro de `initAntigravity()`.

### B9. Edición de valores con `prompt()`/`confirm()` — **bajo**

`ui_values.js:188-228`: los `prompt()` nativos rompen la estética cuidada de la app, no se pueden estilizar, y en modo standalone de iOS se muestran con el origen del sitio. Sustituir por un mini-modal reutilizando el patrón de `deleteModal`.

### B10. Restos muertos en el flujo SOS — **bajo**

`#sosTapArea` y `#sosBackBtn` (`index.html:620-623, 632`) nunca se muestran: ningún ejercicio actual usa contador de toques ni navegación hacia atrás, pero `resetOverlay`/`closeOverlay` los siguen gestionando. Eliminarlos junto con su CSS, o reintroducir el ejercicio de toques que los usaba.

### B11. Restauración de respaldo sin validación profunda — **bajo**

`main.js:147-160` valida solo que existan las claves de primer nivel; un JSON con `values: ["a", {}]` o `actions: [{...sin title}]` se escribe tal cual a localStorage y puede dejar la app en estado raro tras el reload. Validar forma mínima de cada elemento (ids numéricos, acciones con title/área/fecha) y rechazar el resto con un mensaje claro.

### B12. Accesibilidad restante — **medio**

- Entradas de cartas y de ranking animan con GSAP sin respetar `prefers-reduced-motion` (`ui_values.js:137, 302`) — resto del B4 anterior.
- El estado del botón de sonido/tema se comunica solo por emoji; añadir `aria-pressed` o actualizar el `aria-label` ("Silenciar sonido" / "Activar sonido").
- El `<div class="grab">` del ranking no es enfocable; el reordenamiento por teclado existe vía flechas ▲▼, así que basta marcar el asa `aria-hidden="true"`.

---

## C. Mejoras propuestas (siguen vigentes del plan anterior)

1. **Historial de la Diana** (D2 anterior): guardar snapshot fechado en cada "Guardar" y graficar evolución — Chart.js ya está cargado. Es el dato de progreso más valioso para el seguimiento terapéutico.
2. **Recordatorios .ics** por acción comprometida (D5): funciona offline y sin permisos; Notifications API como segunda iteración.
3. **Cabecera móvil** (C7): agrupar acciones secundarias (respaldo, restaurar, info, ayuda) en un menú "⋯" o mover las pestañas a barra inferior fija.
4. **Avatar minimizable** (C8) y reducido en viewports chicos.
5. **Iconos SVG** (C5) y partículas tematizadas con la paleta (C6).
6. **CSP**: `style-src` aún necesita `'unsafe-inline'` por los estilos inline; al completar la migración a clases (C3) se puede endurecer.
7. **Optimizar iconos PWA** (E3): `icon-512.png` 342 KB y maskable 220 KB; comprimibles a <60 KB.
8. **README + LICENSE + ESLint + smoke test Playwright + CI** (E4): sigue sin existir nada de esto; un test que cargue la app, cambie pestañas y verifique que no hay errores de consola habría detectado B0 automáticamente.

---

## Plan de corrección por fases

Esfuerzo: **S** < 1 h · **M** 1-4 h · **L** > 4 h.

### Fase 0 — Urgente (hoy)
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 0.1 | Añadir `src/dom.js` y `src/illustrations.js` a `ASSETS`, subir `CACHE_NAME` a v10 | B0 | S |
| 0.2 | Verificación manual offline (DevTools → Network offline → recarga desde instalación limpia) | B0 | S |

### Fase 1 — Bugs funcionales
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 1.1 | Export terapeuta completo: valor, área, fecha, barreras int./ext. con habilidad y plan | B2 | S |
| 1.2 | Sugeridor: mapear solo a opciones existentes + normalizar acentos | B3 | S |
| 1.3 | Toast: cancelar timer previo + duración proporcional | B4 | S |
| 1.4 | Quitar MutationObserver de la Diana y el parámetro `initBullseye(el)` | B5 | S |
| 1.5 | Re-render del mazo al quitar con "Solo Top 10" activo | B6 | S |
| 1.6 | Acciones referenciadas por `valueId` con migración (o sincronizar nombre al renombrar) | B7 | M |
| 1.7 | Guarda de canvas en galaxy.js | B8 | S |
| 1.8 | Validación profunda del respaldo restaurado | B11 | S-M |

### Fase 2 — Accesibilidad y pulido de interacción
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 2.1 | Reduced-motion en entradas de cartas y ranking | B12 | S |
| 2.2 | `aria-pressed`/labels dinámicos en sonido y tema; `aria-hidden` en el asa ≡ | B12 | S |
| 2.3 | Modal propio para editar valores (sustituir `prompt`) | B9 | M |
| 2.4 | Eliminar restos muertos del SOS (tap-area, back) | B10 | S |

### Fase 3 — Saneamiento de CSS (prerequisito estético)
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 3.1 | Depurar `style.css`: una definición por componente, eliminar flip/markers/moomin/breath-circle/carousel duplicado, integrar los parches de contraste en origen y reducir `!important` | B1 | L |
| 3.2 | Terminar migración de estilos inline a clases (filtros del mazo, botones SOS) y endurecer CSP | C3/D6 | M |

### Fase 4 — Estética y ergonomía móvil
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 4.1 | Cabecera móvil: menú "⋯" o tab bar inferior | C7 ant. | M-L |
| 4.2 | Avatar minimizable y adaptativo | C8 ant. | S |
| 4.3 | Iconos SVG coherentes + partículas en paleta | C5/C6 ant. | M |

### Fase 5 — Nuevas capacidades
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 5.1 | Historial de la Diana con gráfica de evolución | C-1 | L |
| 5.2 | Recordatorios .ics por compromiso | C-2 | M |

### Fase 6 — Infraestructura
| # | Tarea | Ref | Esfuerzo |
|---|---|---|---|
| 6.1 | README + LICENSE | C-8 | S |
| 6.2 | ESLint + smoke test Playwright (incluye prueba offline que cubre B0) + GitHub Actions | C-8 | M |
| 6.3 | Optimizar iconos PWA | C-7 | S |
| 6.4 | Script/checklist que valide `ASSETS` del SW contra `src/*.js` | B0 | S |

**Orden recomendado**: Fase 0 debe desplegarse de inmediato (es una regresión que anula el modo offline). Después 1 → 2 → 3 → 4 → 5 → 6; la 6.2 puede adelantarse porque el smoke test protege todo lo demás.
