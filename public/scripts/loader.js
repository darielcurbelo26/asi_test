// loader.js — index preloader logic (runs after cms:ready when possible)
(function () {
    function initLoader(loaderText) {
        const loaderWrapper = document.getElementById('loader-wrapper');
        if (!loaderWrapper) return;

        const isInternal = document.referrer && document.referrer.includes(window.location.host);
        if (sessionStorage.getItem('tatc-loaded') || isInternal) {
            loaderWrapper.style.display = 'none';
            document.dispatchEvent(new CustomEvent('tatc:loaderDone'));
            return;
        }

        document.body.style.overflow = 'hidden';

        const textEl = document.getElementById('loader-text');
        if (!textEl) return;
        textEl.innerHTML = '';

        const words = String(loaderText || '').trim().split(/\s+/).filter(Boolean);
        words.forEach((word) => {
            const span = document.createElement('span');
            span.className = 'loader-word';
            span.innerText = word + ' ';
            textEl.appendChild(span);
        });

        const cursorFollower = document.getElementById('loader-cursor');
        if (!cursorFollower) return;

        const cursorMask = cursorFollower.querySelector('.cursor-mask');
        const cursorText = cursorFollower.querySelector('.cursor-text');

        let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
        let targetX = cursorX, targetY = cursorY;
        let isMobile = window.innerWidth <= 768;
        let loaderState = 0;
        let reqId;

        // Hard failsafe: never let the loader block the site indefinitely.
        const hardTimeoutId = window.setTimeout(() => {
            try { exitLoader(); } catch { /* ignore */ }
        }, 20000);

        const updateCursor = () => {
            if (loaderState === 2) return;
            cursorX += (targetX - cursorX) * 0.15;
            cursorY += (targetY - cursorY) * 0.15;
            cursorFollower.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            reqId = requestAnimationFrame(updateCursor);
        };

        if (!isMobile) {
            window.addEventListener('mousemove', (e) => {
                targetX = e.clientX;
                targetY = e.clientY;
            });
            updateCursor();
        }

        setTimeout(() => {
            if (loaderState < 2 && window.gsap) {
                window.gsap.to(cursorFollower, { opacity: 1, duration: 0.3 });
                if (cursorMask && cursorText) {
                    window.gsap.to(cursorMask, { width: cursorText.offsetWidth, duration: 0.4, ease: 'power2.out' });
                }
            }
        }, 3000);

        const tl = window.gsap ? window.gsap.timeline({
            onComplete: () => {
                loaderState = 1;
                // Extended delay to 7s as requested
                window.gsap.delayedCall(7.0, exitLoader);
            }
        }) : null;

        if (tl) {
            tl.to('.loader-word', {
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out'
            });
        } else {
            // No GSAP: show briefly, then exit automatically.
            window.setTimeout(exitLoader, 1200);
        }

        function exitLoader() {
            if (loaderState === 2) return;
            loaderState = 2;
            if (reqId) cancelAnimationFrame(reqId);
            sessionStorage.setItem('tatc-loaded', 'true');

            window.clearTimeout(hardTimeoutId);

            if (window.gsap) {
                if (cursorMask) window.gsap.killTweensOf(cursorMask);
                window.gsap.killTweensOf(cursorFollower);
                window.gsap.to(loaderWrapper, {
                    y: '-100%',
                    duration: 0.8,
                    ease: 'power4.inOut',
                    onComplete: () => {
                        loaderWrapper.style.display = 'none';
                        document.body.style.overflow = '';
                        document.dispatchEvent(new CustomEvent('tatc:loaderDone'));
                    }
                });
            } else {
                // Fallback without GSAP: animate out via CSS, then remove.
                loaderWrapper.style.willChange = 'transform';
                loaderWrapper.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                loaderWrapper.style.transform = 'translateY(-110%)';
                window.setTimeout(() => {
                    loaderWrapper.style.display = 'none';
                    document.body.style.overflow = '';
                    document.dispatchEvent(new CustomEvent('tatc:loaderDone'));
                }, 850);
            }
        }

        cursorFollower.addEventListener('click', (e) => {
            e.stopPropagation();
            if (tl) tl.progress(1);
            exitLoader();
        });

        loaderWrapper.addEventListener('click', () => {
            if (isMobile) {
                if (loaderState === 0) {
                    if (tl) tl.progress(1);
                    loaderState = 1;
                } else if (loaderState === 1) {
                    exitLoader();
                }
            } else {
                if (tl) tl.progress(1);
                exitLoader();
            }
        });
    }

    document.addEventListener('cms:ready', ({ detail: data }) => {
        const text = (data && data.home && data.home.loader_text)
            ? data.home.loader_text
            : (document.getElementById('loader-text')?.innerText || '');
        initLoader(text);
    });

    setTimeout(() => {
        if (!window.TATC_CONTENT) {
            const fallbackText = document.getElementById('loader-text')?.innerText || '';
            initLoader(fallbackText);
        }
    }, 500);
})();
