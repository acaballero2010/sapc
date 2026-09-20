const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const frontendDir = path.join(rootDir, 'frontend');
const frontendNext = path.join(frontendDir, '.next');
const rootNext = path.join(rootDir, '.next');

if (fs.existsSync(frontendNext)) {
  fs.mkdirSync(rootNext, { recursive: true });

  // 1. Copy required metadata and server files
  const itemsToCopy = ['BUILD_ID', 'routes-manifest.json', 'prerender-manifest.json', 'required-server-files.json', 'server', 'static'];
  for (const item of itemsToCopy) {
    const src = path.join(frontendNext, item);
    const dest = path.join(rootNext, item);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
    }
  }

  // 2. Flatten frontend/.next/standalone/frontend/* into .next/standalone/
  const standaloneFrontend = path.join(frontendNext, 'standalone', 'frontend');
  const rootStandalone = path.join(rootNext, 'standalone');
  
  if (fs.existsSync(standaloneFrontend)) {
    fs.cpSync(standaloneFrontend, rootStandalone, { recursive: true });
  } else {
    const directStandalone = path.join(frontendNext, 'standalone');
    if (fs.existsSync(directStandalone)) {
      fs.cpSync(directStandalone, rootStandalone, { recursive: true });
    }
  }

  // 3. Ensure static assets are present in standalone
  const frontendStatic = path.join(frontendNext, 'static');
  const standaloneStatic = path.join(rootStandalone, '.next', 'static');
  if (fs.existsSync(frontendStatic)) {
    fs.mkdirSync(path.dirname(standaloneStatic), { recursive: true });
    fs.cpSync(frontendStatic, standaloneStatic, { recursive: true });
  }

  // 4. Copy public assets to root and standalone public
  const frontendPublic = path.join(frontendDir, 'public');
  if (fs.existsSync(frontendPublic)) {
    fs.cpSync(frontendPublic, path.join(rootDir, 'public'), { recursive: true });
    fs.cpSync(frontendPublic, path.join(rootStandalone, 'public'), { recursive: true });
  }

  console.log('[prepare-apphosting] Successfully prepared .next standalone bundle for Firebase App Hosting.');
} else {
  console.warn('[prepare-apphosting] frontend/.next was not found.');
}
