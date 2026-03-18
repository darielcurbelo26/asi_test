// --- AUTH CHECK ---
if (sessionStorage.getItem('tatc-unlocked') !== 'true') {
  window.location.href = 'password.html?redirect=a-sweet-kid-online.html';
  throw new Error('Not authenticated');
}

import * as THREE from 'https://esm.sh/three@0.163.0';

// The rest of the file content remains the same...