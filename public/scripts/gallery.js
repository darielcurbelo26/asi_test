// gallery.js — scroll-driven grid gallery
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        const container = document.getElementById('gallery-items-container');
        const overlay = document.getElementById('gallery-overlay');
        const overlayImg = document.getElementById('overlay-img');
        const btnPrev = document.querySelector('.overlay-prev');
        const btnNext = document.querySelector('.overlay-next');

        if (!container || !overlay || !overlayImg || !window.gsap || !window.ScrollTrigger) return;

        const itemCount = 28;
        const images = [];
        const imagesSrcList = [];

        const columns = 6;
        const rows = 5;
        let cells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                if (r >= 2 && r <= 2 && c >= 2 && c <= 3) continue;
                cells.push({ r, c });
            }
        }
        cells.sort(() => Math.random() - 0.5);

        let currentIdx = 0;
        const updateOverlay = () => {
            overlayImg.src = imagesSrcList[currentIdx];
        };
        const openOverlay = (idx) => {
            currentIdx = idx;
            updateOverlay();
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        const closeOverlay = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (btnNext) btnNext.onclick = (e) => {
            e.stopPropagation();
            currentIdx = (currentIdx + 1) % imagesSrcList.length;
            updateOverlay();
        };
        if (btnPrev) btnPrev.onclick = (e) => {
            e.stopPropagation();
            currentIdx = (currentIdx - 1 + imagesSrcList.length) % imagesSrcList.length;
            updateOverlay();
        };
        overlay.onclick = (e) => {
            if (e.target === overlay || e.target.classList.contains('overlay-content')) closeOverlay();
        };

        for (let i = 0; i < Math.min(itemCount, cells.length); i++) {
            const img = document.createElement('img');
            const imgNum = Math.floor(Math.random() * 400) + 1;
            const src = `assets/images/_${imgNum}.webp`;
            img.src = src;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.className = 'gallery-item';
            imagesSrcList.push(src);

            const cell = cells[i];
            const xBase = (cell.c / columns) * 100;
            const yBase = (cell.r / rows) * 100;

            const xJitter = (Math.random() * 4) - 2;
            const yJitter = (Math.random() * 4) - 2;

            img.style.left = `${xBase + 5 + xJitter}%`;
            img.style.top = `${yBase + 5 + yJitter}%`;
            img.style.transform = 'scale(0.8) rotate(0deg)';

            img.addEventListener('click', () => openOverlay(i));

            container.appendChild(img);
            images.push(img);
        }

        let scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const autoSpeed = 2.5;
        let targetScroll = scrollY;
        let manualAccumulator = 0;

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            targetScroll += e.deltaY;
            manualAccumulator += e.deltaY;

            if (targetScroll < 0) targetScroll = 0;
            if (targetScroll > maxScroll) targetScroll = maxScroll;

            const blurAmount = Math.min(Math.max(manualAccumulator / 40, 0), 20);
            const opacityAmount = 1 - (blurAmount / 20);

            window.gsap.to('.gallery-center-text', {
                filter: `blur(${blurAmount}px)`,
                opacity: opacityAmount,
                duration: 0.3,
                overwrite: true
            });
        }, { passive: false });

        window.gsap.ticker.add(() => {
            targetScroll += autoSpeed;

            if (targetScroll >= maxScroll - 5) {
                targetScroll = 1;
                scrollY = 0;
                window.scrollTo(0, 0);
                window.ScrollTrigger.getAll().forEach(st => st.update());
                window.ScrollTrigger.refresh();
            }

            scrollY += (targetScroll - scrollY) * 0.1;
            window.scrollTo(0, scrollY);
        });

        window.gsap.registerPlugin(window.ScrollTrigger);

        images.forEach((img, i) => {
            const totalItems = images.length;
            const enterStart = (i / totalItems) * 0.70;
            const duration = 0.25;

            const tl = window.gsap.timeline({
                scrollTrigger: {
                    trigger: '.scroll-proxy',
                    start: `${enterStart * 100}% top`,
                    end: `${(enterStart + duration) * 100}% top`,
                    scrub: true
                }
            });

            if (enterStart === 0) {
                window.gsap.set(img, { opacity: 1 });
            }

            tl.to(img, { opacity: 1, duration: 0.3 })
                .to(img, { opacity: 0, duration: 0.3 }, '+=0.4');
        });
    });
})();
