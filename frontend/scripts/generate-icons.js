/**
 * Decodifica os icones do PWA (guardados como texto base64 em icon-assets/)
 * para arquivos binarios reais em public/.
 *
 * Por que base64 em vez de commitar os PNGs direto: o pipeline usado para
 * editar este repositorio grava arquivos como texto puro, entao binarios
 * arbitrarios (PNG/ICO) corrompem ao serem versionados diretamente. Guardar
 * como texto e decodificar num passo de postinstall mantem os icones no
 * repo (git-friendly, diffs legiveis) sem depender de upload binario.
 */
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'icon-assets');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

fs.mkdirSync(ICONS_DIR, { recursive: true });

const entries = fs.readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.b64'));

for (const entry of entries) {
  const outputName = entry.replace(/\.b64$/, '');
  const isFavicon = outputName === 'favicon.ico';
  const outputPath = isFavicon ? path.join(PUBLIC_DIR, outputName) : path.join(ICONS_DIR, outputName);

  const base64 = fs.readFileSync(path.join(ASSETS_DIR, entry), 'utf-8').trim();
  fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));
  console.log(`icons: gerado ${path.relative(process.cwd(), outputPath)}`);
}
