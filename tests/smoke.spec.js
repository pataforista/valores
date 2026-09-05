import { test, expect } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, '..');

let server;
const PORT = 8080;

test.beforeAll(() => {
  // Servidor web estático ligero y nativo de Node.js
  server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0];
    const filePath = path.join(baseDir, urlPath === '/' ? 'index.html' : urlPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(`[HTTP SERV] 404: ${urlPath} -> ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Archivo no encontrado: ${urlPath}`);
        return;
      }

      let contentType = 'text/plain';
      if (filePath.endsWith('.html')) contentType = 'text/html; charset=utf-8';
      else if (filePath.endsWith('.css')) contentType = 'text/css';
      else if (filePath.endsWith('.js')) contentType = 'application/javascript';
      else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (filePath.endsWith('.png')) contentType = 'image/png';
      else if (filePath.endsWith('.json')) contentType = 'application/json';
      else if (filePath.endsWith('.woff2')) contentType = 'font/woff2';

      console.log(`[HTTP SERV] 200: ${urlPath} (${contentType})`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
  server.listen(PORT);
  console.log(`Pruebas: Servidor local web corriendo en puerto ${PORT}`);
});

test.afterAll(() => {
  if (server) {
    server.close();
    console.log('Pruebas: Servidor web detenido.');
  }
});

test.describe('Valores del Valle - Smoke Tests', () => {
  // Todas las pruebas de este archivo comparten un único servidor HTTP en un puerto
  // fijo (levantado en beforeAll/afterAll de módulo); con fullyParallel varios workers
  // intentarían escuchar el mismo puerto a la vez y chocarían con EADDRINUSE.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Inyectar localStorage antes de cargar para evitar diálogos de bienvenida y onboarding
    await page.addInitScript(() => {
      window.localStorage.setItem('vv_seenIntro_v1', 'true');
      window.localStorage.setItem('vv_seenInfo_v1', 'true');
      window.localStorage.setItem('vv_seen_onboarding_v1', 'true');
    });
  });

  async function preparePage(page) {
    await page.goto('/');
    await page.waitForSelector('#tab-values', { state: 'visible' });
    await page.waitForSelector('.card-container', { state: 'visible' });
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready;
      }
    });
    await page.waitForTimeout(250);
  }

  test('debe cargar la app y navegar por las pestañas sin errores en consola', async ({ page }) => {
    const consoleErrors = [];
    page.on('pageerror', exception => {
      console.log(`[NAVEGADOR EXCEPCIÓN]: ${exception.message}\nStack:\n${exception.stack}`);
      consoleErrors.push(exception.message);
    });
    page.on('console', msg => {
      console.log(`[NAVEGADOR LOG] ${msg.type().toUpperCase()}: ${msg.text()}`);
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await preparePage(page);
    
    // Validar título de la aplicación
    await expect(page).toHaveTitle('Valores del Valle');

    // Validar que se muestre el header principal
    const brandHeader = page.locator('.brand h1');
    await expect(brandHeader).toHaveText('Valores del Valle 🌲');

    // Probar navegación entre pestañas
    const tabs = [
      { id: 'tab-values', view: 'view-values' },
      { id: 'tab-bullseye', view: 'view-bullseye' },
      { id: 'tab-path', view: 'view-path' },
      { id: 'tab-leaves', view: 'view-leaves' },
      { id: 'tab-sos', view: 'view-sos' }
    ];

    for (const tab of tabs) {
      await page.click(`#${tab.id}`);
      const targetView = page.locator(`#${tab.view}`);
      await expect(targetView).toHaveClass(/active/);
    }

    // Comprobar que no hay fallos fatales de script en la carga
    expect(consoleErrors.filter(err => !err.includes('favicon.ico'))).toEqual([]);
  });

  test('debe poder navegar offline con service worker activo', async ({ context, page }) => {
    // 1. Cargar la app inicialmente en modo online
    await preparePage(page);

    // 2. Cambiar el contexto de red a Offline
    await context.setOffline(true);

    // 3. Recargar la página e intentar interactuar
    await page.reload();

    // Comprobar que sigue respondiendo e inyecta la cabecera
    const brandHeader = page.locator('.brand h1');
    await expect(brandHeader).toHaveText('Valores del Valle 🌲');

    // Restaurar red para los demás tests
    await context.setOffline(false);
  });

  test('debe permitir seleccionar más de 5 valores manteniendo la interfaz compacta y sin errores', async ({ page }) => {
    await preparePage(page);

    // Agregar 7 valores usando el botón 'Agregar'
    for (let i = 0; i < 7; i++) {
      const addBtn = page.locator('.select-btn:has-text("Agregar")').first();
      await addBtn.click();
      await page.waitForTimeout(60);
    }

    // Verificar contador y lista de seleccionados
    const counter = page.locator('#counter');
    await expect(counter).toHaveText('7/10 seleccionados');

    const rankItems = page.locator('#active-list .rank-item');
    await expect(rankItems).toHaveCount(7);

    // Verificar que las tarjetas tienen una altura compacta razonable
    const firstCard = page.locator('.card-container').first();
    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    // La altura debe ser compacta (< 190px en lugar de los 240px+ gigantes)
    expect(box.height).toBeLessThan(190);
  });

  test('debe abrir y operar la pestaña de defusión Hojas en el Agua correctamente', async ({ page }) => {
    await preparePage(page);

    // Navegar a la pestaña Hojas
    await page.click('#tab-leaves');
    const viewLeaves = page.locator('#view-leaves');
    await expect(viewLeaves).toHaveClass(/active/);

    // Alternar Guía Clínica
    const guideBtn = page.locator('#toggleLeavesGuide');
    const guidePanel = page.locator('#leavesGuidePanel');
    await expect(guidePanel).toBeHidden();
    await guideBtn.click();
    await expect(guidePanel).toBeVisible();

    // Lanzar pensamiento en la hoja
    const leafInput = page.locator('#leafInput');
    await leafInput.fill('Pensamiento de prueba: No soy suficiente');
    await leafInput.press('Enter');

    // Verificar que la hoja aparece flotando en el contenedor
    const leafItem = page.locator('#leavesContainer .leaf-item');
    await expect(leafItem.first()).toContainText('No soy suficiente');

    // Completar campos de aterrizaje clínico
    const contextoInput = page.locator('#hojas-contexto');
    await contextoInput.fill('Trabajando en un proyecto nuevo');
    
    // Validar persistencia en localStorage
    const savedData = await page.evaluate(() => {
      return localStorage.getItem('vv_hojas_grounding_v1');
    });
    expect(savedData).toContain('Trabajando en un proyecto nuevo');
  });

  test('debe operar la Diana (Bullseye) y guardar evaluación sin errores', async ({ page }) => {
    await preparePage(page);

    await page.click('#tab-bullseye');
    const viewBull = page.locator('#view-bullseye');
    await expect(viewBull).toHaveClass(/active/);

    // Mover sliders
    const sliderWork = page.locator('#input-work');
    await sliderWork.fill('80');
    await sliderWork.dispatchEvent('input');

    const saveBtn = page.locator('#bullseyeSaveBtn');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Validar almacenamiento
    const bullData = await page.evaluate(() => localStorage.getItem('vv_bullseye_v1'));
    expect(bullData).toBeTruthy();
  });

  test('debe crear y gestionar un plan de acción en Sendero sin errores', async ({ page }) => {
    await preparePage(page);

    // Seleccionar al menos un valor primero
    const firstSelectBtn = page.locator('.select-btn').first();
    await firstSelectBtn.click();

    // Ir a Sendero
    await page.click('#tab-path');
    const viewPath = page.locator('#view-path');
    await expect(viewPath).toHaveClass(/active/);

    // Llenar formulario de acción
    await page.locator('#actionDesc').fill('Caminar 20 minutos escuchando música');
    await page.locator('#actionDate').fill('2026-12-31T10:00');

    // Marcar criterios SMART requeridos
    await page.locator('#smartSpecific').check();
    await page.locator('#smartMeaningful').check();
    await page.locator('#smartAdaptive').check();
    await page.locator('#smartTimebound').check();
    await page.locator('#resTime').check();

    // Enviar formulario para abrir panel de compromiso
    const submitBtn = page.locator('#actionForm button[type="submit"]');
    await submitBtn.click();

    // Declarar compromiso
    const declareBtn = page.locator('#declareCommitment');
    await expect(declareBtn).toBeVisible();
    await declareBtn.click();

    // Validar que la acción aparece en la lista
    const actionsList = page.locator('#actionsList li');
    await expect(actionsList).toHaveCount(1);
    await expect(actionsList.first()).toContainText('Caminar 20 minutos');
  });

  test('debe operar las herramientas SOS y controles de audio sin errores', async ({ page }) => {
    await preparePage(page);

    await page.click('#tab-sos');
    const viewSos = page.locator('#view-sos');
    await expect(viewSos).toHaveClass(/active/);

    // Probar Respiración Box
    const breathToggle = page.locator('#breathToggle');
    await breathToggle.click();
    await expect(breathToggle).toHaveText('Detener');
    await breathToggle.click();
    await expect(breathToggle).toHaveText('Iniciar');

    // Probar Ruido Marrón
    const noiseToggle = page.locator('#noiseToggle');
    await noiseToggle.click();
    await expect(noiseToggle).toHaveText('Apagar');
    await noiseToggle.click();
    await expect(noiseToggle).toHaveText('Encender');

    // Probar Modal SOS 5-4-3-2-1
    const sos54321Btn = page.locator('#sos54321Btn');
    await sos54321Btn.click();
    const sosOverlay = page.locator('#sosOverlay');
    await expect(sosOverlay).toBeVisible();

    const closeSosBtn = page.locator('#closeSosOverlay');
    await closeSosBtn.click();
    await expect(sosOverlay).toBeHidden();
  });

  test('debe abrir menú, glosario, cambiar tema y sonido sin errores', async ({ page }) => {
    await preparePage(page);

    // Por debajo de 1500px el menú de acciones secundarias vive colapsado
    // detrás del botón "⋯"; cada clic en un .menu-item lo vuelve a cerrar,
    // así que hay que reabrirlo antes de cada acción.
    const menuToggleBtn = page.locator('#menuToggleBtn');
    const secondaryMenu = page.locator('#secondaryMenu');
    const openMenuIfCollapsed = async () => {
      if (await menuToggleBtn.isVisible() && !(await secondaryMenu.evaluate(el => el.classList.contains('active')))) {
        await menuToggleBtn.click();
      }
    };

    // Alternar tema
    const initialDark = await page.evaluate(() => document.body.classList.contains('dark-theme'));
    await openMenuIfCollapsed();
    const themeBtn = page.locator('#themeBtn');
    await themeBtn.click();
    const isDark = await page.evaluate(() => document.body.classList.contains('dark-theme'));
    expect(isDark).toBe(!initialDark);

    // Alternar sonido
    await openMenuIfCollapsed();
    const soundBtn = page.locator('#soundBtn');
    await soundBtn.click();
    const isMuted = await page.evaluate(() => document.getElementById('soundBtn').classList.contains('muted'));
    expect(isMuted).toBe(true);

    // Abrir Glosario
    await openMenuIfCollapsed();
    const glossaryBtn = page.locator('#glossaryMenuBtn');
    await glossaryBtn.click();
    const glossaryList = page.locator('#glossary-list');
    await expect(glossaryList).toBeVisible();

    const closeGlossary = page.locator('#closeGlossary');
    await closeGlossary.click();
    await expect(glossaryList).not.toBeAttached();
  });

  test('debe crear una jerarquía de exposición y completar una práctica sin errores', async ({ page }) => {
    await preparePage(page);

    // Seleccionar un valor para que el select de Exposición tenga opciones
    const addBtn = page.locator('.select-btn:has-text("Agregar")').first();
    await addBtn.click();
    await page.waitForTimeout(150);

    await page.click('#tab-exposure');
    const viewExposure = page.locator('#view-exposure');
    await expect(viewExposure).toHaveClass(/active/);

    // Alternar guía clínica
    const guideBtn = page.locator('#toggleExposureGuide');
    const guidePanel = page.locator('#exposureGuidePanel');
    await expect(guidePanel).toBeHidden();
    await guideBtn.click();
    await expect(guidePanel).toBeVisible();

    // Agregar situación a la jerarquía
    await page.fill('#exposureSituation', 'Mirar fotos de aviones');
    await page.click('#exposureForm button[type=submit]');

    const hierarchyItems = page.locator('#exposureHierarchyList .action-item');
    await expect(hierarchyItems).toHaveCount(1);
    await expect(hierarchyItems.first()).toContainText('Mirar fotos de aviones');

    // Practicar la exposición de punta a punta
    await page.click('#exposureHierarchyList .practice-btn');
    const practicePanel = page.locator('#exposurePracticePanel');
    await expect(practicePanel).toBeVisible();

    await page.selectOption('#exposureMetaphorSelect', 'bus');
    await expect(page.locator('#exposureMetaphorText')).toContainText('autobús');

    // El botón de inicio requiere declarar disposición a sentir malestar (ACT)
    await expect(page.locator('#exposureStartBtn')).toBeDisabled();
    await page.check('#exposureWillingness');
    await expect(page.locator('#exposureStartBtn')).toBeEnabled();

    await page.click('#exposureStartBtn');
    await expect(page.locator('#exposureDuringStage')).toBeVisible();
    await page.waitForTimeout(300);

    await page.click('#exposureFinishBtn');
    await expect(page.locator('#exposureAfterStage')).toBeVisible();

    await page.fill('#exposureReflection', 'Pude quedarme viendo las fotos.');
    await page.click('#exposureSaveBtn');
    await expect(practicePanel).toBeHidden();

    const logItems = page.locator('#exposureLogList .action-item');
    await expect(logItems).toHaveCount(1);
    await expect(logItems.first()).toContainText('Mirar fotos de aviones');

    // Validar persistencia y logro desbloqueado
    const savedLog = await page.evaluate(() => localStorage.getItem('vv_exposure_log_v1'));
    expect(savedLog).toContain('Mirar fotos de aviones');
    const achievements = await page.evaluate(() => localStorage.getItem('vv_achievements_v1'));
    expect(achievements).toContain('first_exposure');
  });
});
