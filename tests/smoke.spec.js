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
    // Eliminar query parameters de la URL para mapear a archivos físicos
    const urlPath = req.url.split('?')[0];
    const filePath = path.join(baseDir, urlPath === '/' ? 'index.html' : urlPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Archivo no encontrado: ${urlPath}`);
        return;
      }

      // Resolver MIME Type adecuado
      let contentType = 'text/plain';
      if (filePath.endsWith('.html')) contentType = 'text/html; charset=utf-8';
      else if (filePath.endsWith('.css')) contentType = 'text/css';
      else if (filePath.endsWith('.js')) contentType = 'application/javascript';
      else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (filePath.endsWith('.png')) contentType = 'image/png';
      else if (filePath.endsWith('.json')) contentType = 'application/json';
      else if (filePath.endsWith('.woff2')) contentType = 'font/woff2';

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
  
  test('debe cargar la app y navegar por las pestañas sin errores en consola', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    
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
    await page.goto('/');
    
    // Dar un tiempo para que el Service Worker se instale y active
    await page.waitForTimeout(2000);

    // 2. Cambiar el contexto de red a Offline
    await context.setOffline(true);

    // 3. Recargar la página e intentar interactuar
    await page.reload();

    // Comprobar que sigue respondiendo e inyecta la cabecera
    const brandHeader = page.locator('.brand h1');
    await expect(brandHeader).toHaveText('Valores del Valle 🌲');

    // Probar que el indicador offline funciona si aplica
    // Restaurar red para los demás tests
    await context.setOffline(false);
  });
});
