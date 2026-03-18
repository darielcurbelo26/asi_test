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

  // --- SCENE INIT ---
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.055);

  const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.05, 80);
  camera.position.set(0, 0, 0);

  window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  // --- room geometry ---
  const R = 5.5, RH = 2.1;
  const roomMat = new THREE.MeshStandardMaterial({ color: 0xeae6e1, roughness: 0.95, metalness: 0 });
  function addPlane(mat, w, h, px, py, pz, rx, ry) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(px, py, pz);
    m.rotation.set(rx, ry, 0);
    scene.add(m);
  }
  const floorM = new THREE.Mesh(new THREE.PlaneGeometry(R * 2, R * 2), roomMat);
  floorM.rotation.x = -Math.PI / 2; floorM.position.y = -RH; scene.add(floorM);
  const ceilM = new THREE.Mesh(new THREE.PlaneGeometry(R * 2, R * 2), roomMat);
  ceilM.rotation.x = Math.PI / 2; ceilM.position.y = RH; scene.add(ceilM);
  addPlane(roomMat, R * 2, RH * 2,  0, 0, -R, 0, 0);
  addPlane(roomMat, R * 2, RH * 2,  0, 0,  R, 0, Math.PI);
  addPlane(roomMat, R * 2, RH * 2, -R, 0,  0, 0,  Math.PI / 2);
  addPlane(roomMat, R * 2, RH * 2,  R, 0,  0, 0, -Math.PI / 2);

  // --- lights ---
  scene.add(new THREE.AmbientLight(0xd0c0e8, 0.75));
  const overhead = new THREE.PointLight(0xe0d0f8, 2.2, 26, 1.6);
  overhead.position.set(0, RH - 0.2, 0); scene.add(overhead);

  // --- artworks ---
  const AW = 1.1, AH = 1.5;
  const texLoader = new THREE.TextureLoader();
  const artMeshes = [];
  const spotLights = [];
  const clickTargets = [];
  ARTS.forEach(a => {
    const tex = texLoader.load(a.src);
    tex.colorSpace = THREE.SRGBColorSpace;
    const group = new THREE.Group();
    group.position.set(...a.pos);
    group.rotation.y = a.ry;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.15, metalness: 0 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(AW, AH), mat);
    group.add(mesh);
    clickTargets.push({ mesh, id: a.id });
    artMeshes.push({ mat, id: a.id });
    scene.add(group);
    const spot = new THREE.SpotLight(0xf0e8ff, 22, 16, Math.PI / 6.5, 0.55, 1.5);
    spot.position.set(...a.lp);
    const tgt = new THREE.Object3D();
    tgt.position.set(...a.pos);
    scene.add(tgt); scene.add(spot);
    spot.target = tgt;
    spotLights.push({ light: spot, id: a.id });
  });

  // --- resto de la lógica interactiva y render loop ---
  // ...existing code...
}
});