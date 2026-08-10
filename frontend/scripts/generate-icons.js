/**
 * Gera os icones do PWA (PNG em varios tamanhos + favicon.ico) a partir de
 * um unico SVG fonte (icon-assets/icon.svg), via postinstall.
 *
 * Por que gerar em vez de versionar os PNGs direto: o pipeline usado para
 * editar este repositorio grava arquivos como texto puro, entao binarios
 * arbitrarios corrompem ao serem versionados diretamente (e blobs base64
 * longos tambem sao arriscados de reproduzir fielmente). Um SVG e texto
 * legivel e determinístico - sem esse risco - e serve de fonte unica de
 * verdade para todos os tamanhos.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SVG_PATH = path.join(__dirname, '..', 'icon-assets', 'icon.svg');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');
const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

async function main() {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  const svg = fs.readFileSync(SVG_PATH);

  for (const size of SIZES) {
    const outPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(svg, { density: 384 }).resize(size, size).png().toFile(outPath);
    console.log(`icons: gerado ${path.relative(process.cwd(), outPath)}`);
  }

  // favicon como PNG (mais confiavel entre navegadores do que forcar um
  // .ico que na verdade contem dados PNG).
  const faviconPath = path.join(PUBLIC_DIR, 'favicon.png');
  await sharp(svg, { density: 384 }).resize(32, 32).png().toFile(faviconPath);
  console.log(`icons: gerado ${path.relative(process.cwd(), faviconPath)}`);
}

main().catch((err) => {
  console.error('icons: falha ao gerar icones', err);
  process.exit(1);
});
