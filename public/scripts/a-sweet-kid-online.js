// --- AUTH CHECK ---
if (sessionStorage.getItem('tatc-unlocked') !== 'true') {
  window.location.href = 'password.html?redirect=a-sweet-kid-online.html';
  throw new Error('Not authenticated');
}

import * as THREE from 'https://esm.sh/three@0.163.0';

// --- CMS DATA LOADER ---
async function loadCMS() {
  let CMS = window.TATC_CONTENT && window.TATC_CONTENT.gallery_3d;
  if (!CMS) {
    try {
      const r = await fetch('content.json', { cache: 'no-cache' });
      if (r.ok) {
        const data = await r.json();
        CMS = data.gallery_3d;
      }
    } catch (e) {}
  }
  return CMS;
}

// --- MAIN INIT ---
loadCMS().then(CMS => {
  if (!CMS) return;

  // --- HUD META ---
  const hudTL = document.getElementById('hud-tl');
  if (hudTL) hudTL.textContent = CMS.hud_label || 'A Sweet Kid — Immersive';
  const loader = document.getElementById('loader');
  if (loader) loader.querySelector('.l-wordmark').textContent = CMS.loader_text || 'A Sweet Kid';
  const hudBR = document.getElementById('hud-br');
  if (hudBR) hudBR.textContent = CMS.credits || 'ISEEASI — 2024';

  // --- ARTWORKS ---
  const ARTS = (CMS.artworks || []).map((a, i) => ({
    id: i,
    title: a.title || '',
    desc: a.alt || '',
    src: a.src,
    pos: a.wall === 'front' ? [-5.5 + .05, 0, 0] : a.wall === 'left' ? [0, 0, -5.5 + .05] : [5.5 - .05, 0, 0],
    ry: a.wall === 'front' ? Math.PI / 2 : a.wall === 'left' ? 0 : -Math.PI / 2,
    cam: a.wall === 'front' ? [-5.5 + 2.5, 0, 0] : a.wall === 'left' ? [0, 0, -5.5 + 2.5] : [5.5 - 2.5, 0, 0],
    look: a.wall === 'front' ? [-5.5 + .1, 0, 0] : a.wall === 'left' ? [0, 0, -5.5 + .1] : [5.5 - .1, 0, 0],
    lp: a.wall === 'front' ? [-5.5 * .5, 2.1 - .3, 0] : a.wall === 'left' ? [0, 2.1 - .3, -5.5 * .5] : [5.5 * .5, 2.1 - .3, 0]
  }));

  // --- SCENE INIT & INTERACTION ---
  // ...toda la lógica de escena, interacción y render loop aquí...
  // (Mover el resto del código JS dentro de este bloque)
}
});