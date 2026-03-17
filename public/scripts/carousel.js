document.addEventListener('DOMContentLoaded', () => {
    const { gsap } = window;
    const gallery = document.getElementById('carrusel-galley');
    const root = document.getElementById('carousel-root');

    if (!gallery || !root || typeof gsap === 'undefined') return;

    // 1. Generate image paths in random order with a minimum gap of 10 between adjacent indices
    const TOTAL_IMAGES = 406;
    const MIN_GAP = 10;

    function buildShuffledImages() {
        // Fisher-Yates shuffle
        const pool = Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1);
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        // Greedy reordering: no adjacent pair with difference < MIN_GAP
        const result = [];
        const remaining = [...pool];

        while (remaining.length > 0) {
            const lastNum = result.length > 0 ? result[result.length - 1] : null;
            let chosen = -1;
            for (let i = 0; i < remaining.length; i++) {
                if (lastNum === null || Math.abs(remaining[i] - lastNum) >= MIN_GAP) {
                    chosen = i;
                    break;
                }
            }
            // Fallback: the one with the largest difference with the previous one
            if (chosen === -1) {
                let maxDiff = -1;
                for (let i = 0; i < remaining.length; i++) {
                    const diff = Math.abs(remaining[i] - lastNum);
                    if (diff > maxDiff) { maxDiff = diff; chosen = i; }
                }
            }
            result.push(remaining.splice(chosen, 1)[0]);
        }

        return result.map(n => `assets/images/_${n}.webp`);
    }

    // Each row generates its own independent random order
    if (buildShuffledImages().length === 0) return;

    // 2. Follower Label Logic (Dynamic Container/Mask Effect)
    const follower = document.getElementById('carousel-cursor');

    if (follower) {
        const text = follower.innerText.trim();

        follower.innerHTML = `
            <div class="cursor-mask">
                <div class="cursor-text">${text}</div>
            </div>
        `;

        const mask = follower.querySelector('.cursor-mask');
        const innerText = follower.querySelector('.cursor-text');

        let pointerClientX = window.innerWidth / 2;
        let pointerClientY = window.innerHeight / 2;
        const xTo = gsap.quickTo(follower, 'x', { duration: 0.15, ease: 'power2.out' });
        const yTo = gsap.quickTo(follower, 'y', { duration: 0.15, ease: 'power2.out' });
        window.addEventListener('pointermove', (e) => {
            pointerClientX = e.clientX;
            pointerClientY = e.clientY;
            xTo(pointerClientX);
            yTo(pointerClientY);
        }, { passive: true });

        // ANIMACIÓN DE ENTRADA
        root.addEventListener('mouseenter', () => {
            follower.classList.add('active');
            xTo(pointerClientX);
            yTo(pointerClientY);
            gsap.to(follower, {
                opacity: 1,
                duration: 0.12,
                overwrite: 'auto'
            });

            gsap.killTweensOf(mask);
            gsap.fromTo(mask,
                { width: 0 },
                // Usamos offsetWidth para que se abra exactamente hasta donde termina el texto
                { width: innerText.offsetWidth, duration: 0.4, ease: "power3.inOut" }
            );
        });

        // ANIMACIÓN DE SALIDA
        root.addEventListener('mouseleave', () => {
            gsap.killTweensOf(mask);
            gsap.to(mask, {
                width: 0,
                duration: 0.3,
                ease: "power3.inOut"
            });

            gsap.to(follower, {
                opacity: 0,
                duration: 0.1,
                delay: 0.3,
                overwrite: 'auto',
                onComplete: () => follower.classList.remove('active')
            });
        });
    }

    // 3. Fullscreen Overlay Logic
    const overlay = document.getElementById('gallery-overlay');
    const overlayImg = document.getElementById('overlay-img');
    const btnPrev = document.querySelector('.overlay-prev');
    const btnNext = document.querySelector('.overlay-next');
    let currentIndex = 0;
    let currentImages = [];

    const updateImage = () => {
        if (!currentImages || currentImages.length === 0) return;
        if (currentIndex < 0) currentIndex = currentImages.length - 1;
        if (currentIndex >= currentImages.length) currentIndex = 0;
        if (overlayImg) {
            overlayImg.decoding = 'async';
            overlayImg.src = currentImages[currentIndex];
        }
    };

    const openOverlay = (index, imagesArray) => {
        if (imagesArray) currentImages = imagesArray;
        currentIndex = index;
        updateImage();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeOverlay = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); currentIndex++; updateImage(); });
    if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); currentIndex--; updateImage(); });
    const btnClose = overlay.querySelector('#overlay-close-btn');
    if (btnClose) btnClose.addEventListener('click', (e) => { e.stopPropagation(); closeOverlay(); });
    if (overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('overlay-content')) closeOverlay();
    });

    document.addEventListener('keydown', (e) => {
        if (!overlay || !overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeOverlay();
        if (e.key === 'ArrowRight') { currentIndex++; updateImage(); }
        if (e.key === 'ArrowLeft') { currentIndex--; updateImage(); }
    });

    // 4. Carousel Logic (DOM, Physics, Trackpad, and Swipe)
    const rows = root.querySelectorAll('.carousel-container');
    const AUTOPLAY_SPEED = 0.5;

    const mod = (n, m) => ((n % m) + m) % m;

    let lastPointerClientX = window.innerWidth / 2;
    let lastPointerClientY = window.innerHeight / 2;

    root.addEventListener('pointermove', (e) => {
        lastPointerClientX = e.clientX;
        lastPointerClientY = e.clientY;
    }, { passive: true });

    rows.forEach(row => {
        const track = row.querySelector('.carousel-track');
        if (!track) return;

        const direction = parseInt(row.dataset.direction || "1");
        // Shuffle propio por fila — orden y punto de inicio distintos
        const images = buildShuffledImages();

        const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
        const cardHeight = parseFloat(
            window.getComputedStyle(document.documentElement).getPropertyValue('--card-height')
        ) || 160;
        const estimatedSpan = Math.max(120, cardHeight * 1.4) + gap;

        function fitSlideWidth(slideEl, imgEl) {
            if (!slideEl || !imgEl) return;
            if (!imgEl.naturalWidth || !imgEl.naturalHeight) return;
            const fittedWidth = Math.max(60, Math.round((imgEl.naturalWidth / imgEl.naturalHeight) * cardHeight));
            slideEl.style.width = `${fittedWidth}px`;
        }

        function createSlide(imageIdx) {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            // Start with a compact fallback width, then fit to real image aspect ratio.
            slide.style.width = `${Math.max(90, cardHeight)}px`;

            const card = document.createElement('div');
            card.className = 'carousel-card';
            card.dataset.idx = String(imageIdx);
            card.style.width = '100%';

            const img = document.createElement('img');
            img.className = 'carousel-image';
            img.draggable = false;
            img.loading = 'eager';
            img.decoding = 'async';
            img.src = images[imageIdx];
            img.alt = `Image ${imageIdx + 1}`;

            img.addEventListener('load', () => {
                fitSlideWidth(slide, img);
            }, { passive: true });

            if (img.complete) {
                fitSlideWidth(slide, img);
            }

            card.appendChild(img);
            slide.appendChild(card);
            return slide;
        }

        let currentX = 0;
        let velocity = 0;
        let isSwiping = false;
        let startX = 0, lastX = 0, lastTime = 0;
        let sequenceWidth = 0;
        let baseSlideCount = 0;
        let measurePending = false;
        let animFrameId = null;

        function scheduleMeasure() {
            if (measurePending) return;
            measurePending = true;
            requestAnimationFrame(() => {
                measurePending = false;
                const previous = sequenceWidth;
                measureSequenceWidth();
                if (previous > 0 && sequenceWidth > 0) {
                    const ratio = sequenceWidth / previous;
                    currentX *= ratio;
                    wrapPosition();
                    gsap.set(track, { x: currentX });
                }
            });
        }

        const getSlideSpan = (slideEl) => {
            if (!slideEl) return estimatedSpan;
            const w = slideEl.getBoundingClientRect().width || slideEl.offsetWidth;
            return (w || (estimatedSpan - gap)) + gap;
        };

        function measureSequenceWidth() {
            if (baseSlideCount <= 0) return;
            const slides = track.children;
            let width = 0;
            for (let i = 0; i < baseSlideCount && i < slides.length; i++) {
                width += getSlideSpan(slides[i]);
            }
            if (width > 0) sequenceWidth = width;
        }

        function wrapPosition() {
            if (!sequenceWidth) return;
            while (currentX < -2 * sequenceWidth) currentX += sequenceWidth;
            while (currentX > -sequenceWidth) currentX -= sequenceWidth;
        }

        function buildTrack() {
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }
            const desiredSpan = Math.max((row.clientWidth || window.innerWidth) * 1.5, window.innerWidth + 320);
            const startIdx = Math.floor(Math.random() * images.length);
            const baseSlides = [];
            const baseFrag = document.createDocumentFragment();

            let accSpan = 0;
            let i = 0;
            while (accSpan < desiredSpan && i < images.length * 2) {
                const imgIdx = mod(startIdx + i, images.length);
                const slide = createSlide(imgIdx);
                baseSlides.push(slide);
                baseFrag.appendChild(slide);
                accSpan += estimatedSpan;
                i += 1;
            }

            baseSlideCount = baseSlides.length;
            track.replaceChildren(baseFrag);

            const cloneFrag = document.createDocumentFragment();
            for (let copy = 0; copy < 2; copy++) {
                for (let j = 0; j < baseSlides.length; j++) {
                    cloneFrag.appendChild(baseSlides[j].cloneNode(true));
                }
            }
            track.appendChild(cloneFrag);

            measureSequenceWidth();
            if (!sequenceWidth) sequenceWidth = estimatedSpan * Math.max(1, baseSlideCount);
            currentX = direction === -1 ? -2 * sequenceWidth : -sequenceWidth;
            track.style.visibility = 'hidden';
            gsap.set(track, { x: currentX });
            requestAnimationFrame(() => { track.style.visibility = ''; });

            track.querySelectorAll('img').forEach((img) => {
                const slide = img.closest('.carousel-slide');

                // Ensure cloned slides also get aspect-ratio-based widths.
                fitSlideWidth(slide, img);

                img.addEventListener('load', () => {
                    fitSlideWidth(slide, img);
                    scheduleMeasure();
                }, { passive: true });
            });

            animFrameId = requestAnimationFrame(animate);
        }

        buildTrack();

        function animate() {
            // La dirección base del autoplay más la aceleración por gestos
            currentX -= (AUTOPLAY_SPEED * direction) - velocity;
            // Fricción constante
            velocity *= 0.95;

            wrapPosition();
            gsap.set(track, { x: currentX });
            animFrameId = requestAnimationFrame(animate);
        }

        // Mouse wheel and trackpad acceleration (both axes)
        row.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            velocity -= delta * 0.02 * direction;
        }, { passive: false });

        // Touch Swipe acceleration (Mobile)
        row.addEventListener('touchstart', e => {
            isSwiping = false;
            startX = lastX = e.touches[0].clientX;
            lastTime = Date.now();
        }, { passive: true });

        row.addEventListener('touchmove', e => {
            const currentX = e.touches[0].clientX;
            const now = Date.now();
            const dt = now - lastTime;

            if (Math.abs(currentX - startX) > 10) isSwiping = true;

            if (dt > 0) velocity += ((currentX - lastX) / dt) * 2;

            lastX = currentX;
            lastTime = now;
        }, { passive: true });

        const getClosestCardFromPoint = (clientX, clientY) => {
            const elementAtPoint = document.elementFromPoint(clientX, clientY);
            const directCard = elementAtPoint?.closest('.carousel-card');
            if (directCard && row.contains(directCard)) return directCard;

            const cards = Array.from(row.querySelectorAll('.carousel-card'));
            if (cards.length === 0) return null;

            let closestCard = null;
            let closestDistance = Number.POSITIVE_INFINITY;

            cards.forEach((cardEl) => {
                const rect = cardEl.getBoundingClientRect();
                const centerX = rect.left + (rect.width / 2);
                const centerY = rect.top + (rect.height / 2);
                const distance = Math.hypot(clientX - centerX, clientY - centerY);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCard = cardEl;
                }
            });

            return closestCard;
        };

        // CARD CLICK (Opens gallery)
        row.addEventListener('click', (e) => {
            if (isSwiping) return;
            const card = e.target.closest('.carousel-card') || getClosestCardFromPoint(lastPointerClientX, lastPointerClientY);
            if (card) {
                const targetImgIdx = parseInt(card.dataset.idx);
                openOverlay(targetImgIdx, images);
            }
        });

        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                buildTrack();
            }, 250);
        });
    });
});