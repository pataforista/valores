import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('Validando que todos los archivos JS del proyecto estén precacheados en sw.js...');

// 1. Obtener la lista de archivos JS bajo src/ y el directorio raíz
const jsFiles = [];
const scanDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'vendor' && file !== 'tests' && file !== '.git') {
        scanDir(fullPath);
      }
    } else if (file.endsWith('.js') && file !== 'sw.js' && file !== 'eslint.config.js' && file !== 'playwright.config.js') {
      jsFiles.push(fullPath);
    }
  }
};

scanDir(projectRoot);

// Queremos asegurarnos de que todos los archivos JS de código de la app (en src/ y galaxy.js y main.js) estén en sw.js
const relativeJsFiles = jsFiles.map(file => {
  const rel = path.relative(projectRoot, file).replace(/\\/g, '/');
  return `./${rel}`;
});

// 2. Leer sw.js y extraer la lista de precaché ASSETS
const swPath = path.join(projectRoot, 'sw.js');
if (!fs.existsSync(swPath)) {
  console.error('❌ Error: No se encontró sw.js en la raíz del proyecto.');
  process.exit(1);
}

const swContent = fs.readFileSync(swPath, 'utf8');

// Parsear burdamente los strings dentro del array ASSETS
const assetsMatch = swContent.match(/const\s+ASSETS\s*=\s*\[([\s\S]*?)\];/);
if (!assetsMatch) {
  console.error('❌ Error: No se pudo localizar la constante ASSETS en sw.js.');
  process.exit(1);
}

const rawAssets = assetsMatch[1];
const cachedAssets = [];
const regex = /"([^"]+)"|'([^']+)'/g;
let match;
while ((match = regex.exec(rawAssets)) !== null) {
  cachedAssets.push(match[1] || match[2]);
}

// 3. Comparar las listas
const missingAssets = [];
for (const jsFile of relativeJsFiles) {
  // Ignorar scripts de verificación o configuración si los hubiera
  if (jsFile.startsWith('./scripts/') || jsFile.startsWith('./tests/')) continue;
  
  if (!cachedAssets.includes(jsFile)) {
    missingAssets.push(jsFile);
  }
}

if (missingAssets.length > 0) {
  console.error('\n❌ ERROR CRÍTICO DE PREPRECACCHÉ PWA:');
  console.error('Los siguientes archivos de código Javascript NO están declarados en los ASSETS de sw.js:');
  missingAssets.forEach(file => console.error(`  - ${file}`));
  console.error('\nEsto romperá el funcionamiento offline (PWA) de la aplicación.');
  console.error('Por favor, edita sw.js y agrégalos a la lista de precaché ASSETS.');
  process.exit(1);
}

console.log('✅ Éxito: Todos los módulos JS del proyecto se encuentran correctamente listados en sw.js.');
process.exit(0);
