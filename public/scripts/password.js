// password.js — gateway logic with lockout, hints, and recovery
(function () {
    const pForm = document.getElementById('pForm');
    const pInput = document.getElementById('pInput');
    const gateTitle = document.querySelector('.section_hero-title-password');
    const gateInfo = document.querySelector('.launch-info');
    const hintEl = document.getElementById('gate-hint');
    const lockoutEl = document.getElementById('gate-lockout');
    const recoveryEl = document.getElementById('gate-recovery');

    if (!pForm || !pInput) return;

    let correctPassword = '';
    let maxAttempts = 5;
    let lockoutMinutes = 30;
    let hintAfterAttempts = 3;
    let passwordHint = '';
    let recoveryEmail = '';
    let recoveryCode = '';

    const redirectPage = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
    const isAdmin = redirectPage.includes('admin/admin.html');
    const lockoutKey = `tatc-lockout-${isAdmin ? 'admin' : 'site'}`;
    const attemptsKey = `tatc-attempts-${isAdmin ? 'admin' : 'site'}`;

    // --- Lockout helpers ---
    function getLockoutState() {
        try {
            const raw = localStorage.getItem(lockoutKey);
            if (!raw) return null;
            const state = JSON.parse(raw);
            if (Date.now() >= state.until) {
                localStorage.removeItem(lockoutKey);
                return null;
            }
            return state;
        } catch (e) { return null; }
    }

    function getAttempts() {
        return parseInt(sessionStorage.getItem(attemptsKey) || '0', 10);
    }

    function setAttempts(n) {
        sessionStorage.setItem(attemptsKey, String(n));
    }

    function lockOut() {
        const until = Date.now() + lockoutMinutes * 60 * 1000;
        localStorage.setItem(lockoutKey, JSON.stringify({ until }));
        sessionStorage.removeItem(attemptsKey);
    }

    // --- UI state ---
    let countdownTimer = null;

    function showLocked(state) {
        pForm.style.display = 'none';
        if (hintEl) hintEl.style.display = 'none';
        if (lockoutEl) {
            lockoutEl.style.display = '';
            startCountdown(state.until);
        }
        if (recoveryEl) {
            recoveryEl.style.display = recoveryEmail ? '' : 'none';
        }
    }

    function showUnlocked() {
        pForm.style.display = '';
        if (lockoutEl) lockoutEl.style.display = 'none';
        if (recoveryEl) recoveryEl.style.display = 'none';
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
        try { pInput.focus({ preventScroll: true }); } catch (e) {}
    }

    function startCountdown(until) {
        function tick() {
            const remaining = Math.max(0, until - Date.now());
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            const span = document.getElementById('gate-countdown');
            if (span) span.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            if (remaining <= 0) {
                clearInterval(countdownTimer);
                countdownTimer = null;
                if (!getLockoutState()) showUnlocked();
            }
        }
        tick();
        countdownTimer = setInterval(tick, 1000);
    }

    function maybeShowHint(attempts) {
        if (!hintEl || !passwordHint) return;
        if (attempts >= hintAfterAttempts) {
            hintEl.textContent = `Hint: ${passwordHint}`;
            hintEl.style.display = '';
        }
    }

    // --- Load gate content ---
    try { pInput.focus({ preventScroll: true }); } catch (e) {}

    async function loadGateContent() {
        try {
            let data = window.TATC_CONTENT;

            if (!data) {
                const draft = localStorage.getItem('tatc_cms');
                if (draft) { try { data = JSON.parse(draft); } catch (e) {} }
            }

            if (!data) {
                const r = await fetch('content.json', { cache: 'no-cache' });
                if (!r.ok) throw new Error('content.json load failed');
                data = await r.json();
            }

            const sec = data.security;
            if (!sec) return;

            // Read lockout / hint config
            maxAttempts = parseInt(sec.max_attempts, 10) || 5;
            lockoutMinutes = parseInt(sec.lockout_minutes, 10) || 30;
            hintAfterAttempts = parseInt(sec.hint_after_attempts, 10) || 3;
            passwordHint = sec.password_hint || '';
            recoveryEmail = sec.recovery_email || '';

            // Wire recovery link
            if (recoveryEl && recoveryEmail) {
                const a = recoveryEl.querySelector('a');
                if (a) a.href = `mailto:${recoveryEmail}`;
            }

            if (isAdmin) {
                if (gateTitle) gateTitle.textContent = 'ADMIN';
                if (gateInfo) gateInfo.textContent = 'CONTROL ROOM ACCESS';
                correctPassword = sec.admin_password || sec.gate_password || '';
                recoveryCode = sec.admin_recovery_code || sec.recovery_code || '';
            } else {
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
                recoveryCode = sec.recovery_code || '';
            }

            // Restore hint if this session already had attempts
            maybeShowHint(getAttempts());

        } catch (e) {
            console.error('Gate load fail', e);
        }
    }

    loadGateContent();

    // Check for an active lockout immediately on page load
    const initialLock = getLockoutState();
    if (initialLock) showLocked(initialLock);

    // --- SHA-256 helper ---
    async function sha256Hex(text) {
        const data = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // --- Form submit ---
    pForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Re-check in case lockout just started
        const lock = getLockoutState();
        if (lock) { showLocked(lock); return; }

        const val = pInput.value.trim();

        function grantAccess() {
            localStorage.removeItem(lockoutKey);
            sessionStorage.removeItem(attemptsKey);
            sessionStorage.setItem('tatc-unlocked', 'true');
            if (isAdmin) sessionStorage.setItem('tatc-admin-unlocked', 'true');
            window.location.href = redirectPage;
        }

        // If no password configured, auto-unlock
        if (!correctPassword) { grantAccess(); return; }

        // Recovery code bypasses lockout (plaintext comparison)
        if (recoveryCode && val === recoveryCode) { grantAccess(); return; }

        // Try plaintext match first (in case password stored as plaintext)
        if (val === correctPassword) { grantAccess(); return; }

        const hashedInput = await sha256Hex(val);
        if (hashedInput === correctPassword) {
            grantAccess();
        } else {
            // Shake animation
            if (window.gsap) {
                window.gsap.to(pForm, { x: 10, repeat: 5, yoyo: true, duration: 0.05, onComplete: () => window.gsap.set(pForm, { x: 0 }) });
            }
            pInput.value = '';

            const attempts = getAttempts() + 1;
            setAttempts(attempts);
            const remaining = maxAttempts - attempts;

            if (remaining <= 0) {
                lockOut();
                showLocked(getLockoutState());
            } else {
                pInput.placeholder = remaining === 1 ? '1 attempt remaining' : `${remaining} attempts remaining`;
                maybeShowHint(attempts);
            }
        }
    });

    // --- Reveal toggle ---
    const tPass = document.getElementById('tPass');
    const eOpen = document.getElementById('eOpen');
    const eClosed = document.getElementById('eClosed');

    if (tPass && eOpen && eClosed) {
        const setRevealState = (reveal) => {
            pInput.type = reveal ? 'text' : 'password';
            eOpen.style.display = reveal ? 'none' : 'block';
            eClosed.style.display = reveal ? 'block' : 'none';
            tPass.setAttribute('aria-pressed', reveal ? 'true' : 'false');
            tPass.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
        };

        setRevealState(false);

        tPass.addEventListener('click', () => {
            const reveal = pInput.type === 'password';
            setRevealState(reveal);
        });

        tPass.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tPass.click();
            }
        });
    }
})();
