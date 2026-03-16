// password.js — gateway logic
(function () {
    const pForm = document.getElementById('pForm');
    const pInput = document.getElementById('pInput');
    const gateTitle = document.querySelector('.section_hero-title-password');
    const gateInfo = document.querySelector('.launch-info');

    if (!pForm || !pInput) return;

    let correctPassword = '';
    const redirectPage = new URLSearchParams(window.location.search).get('redirect') || 'index.html';

    async function loadGateContent() {
        try {
            let data = window.TATC_CONTENT;

            if (!data) {
                const draft = localStorage.getItem('tatc_cms');
                if (draft) {
                    try { data = JSON.parse(draft); } catch (e) { /* ignore */ }
                }
            }

            if (!data) {
                const r = await fetch('content.json?t=' + Date.now());
                data = await r.json();
            }

            const sec = data.security;
            if (!sec) return;

            const pageName = redirectPage.split('/').pop().split('?')[0];
            const pageInfo = data.pages && data.pages[pageName];

            if (pageInfo) {
                if (gateTitle) gateTitle.textContent = pageInfo.name || sec.gate_title || 'ASWEETKID';
                if (gateInfo) gateInfo.textContent = pageInfo.tagline || sec.gate_description || '';
            } else {
                if (gateTitle) gateTitle.textContent = sec.gate_title || 'ASWEETKID';
                if (gateInfo) gateInfo.textContent = sec.gate_description || '';
            }

            const pagePasswords = sec.page_passwords || {};
            correctPassword = pagePasswords[pageName] || sec.gate_password || '';
        } catch (e) {
            console.error('Gate load fail', e);
        }
    }

    loadGateContent();

    pForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = pInput.value.trim();
        if (val === correctPassword) {
            sessionStorage.setItem('tatc-unlocked', 'true');
            if (window.canviaPagina) {
                window.canviaPagina(redirectPage);
            } else {
                window.location.href = redirectPage;
            }
        } else {
            if (window.gsap) {
                window.gsap.to(pForm, { x: 10, repeat: 5, yoyo: true, duration: 0.05, onComplete: () => window.gsap.set(pForm, { x: 0 }) });
            }
            pInput.value = '';
            pInput.placeholder = 'Incorrect Access Code';
        }
    });

    const tPass = document.getElementById('tPass');
    const eOpen = document.getElementById('eOpen');
    const eClosed = document.getElementById('eClosed');

    if (tPass && eOpen && eClosed) {
        tPass.addEventListener('click', () => {
            const isPassword = pInput.type === 'password';
            pInput.type = isPassword ? 'text' : 'password';
            eOpen.style.display = isPassword ? 'none' : 'block';
            eClosed.style.display = isPassword ? 'block' : 'none';
        });
    }
})();
