
(function () {
    var wrapper = document.getElementById('projects-gallery-wrapper');
    var cursor = document.getElementById('proj-cursor');
    var progressEl = document.getElementById('proj-progress');
    var scrollHint = document.getElementById('scroll-hint');

    if (!wrapper || !cursor || !progressEl) return;

    var state = {
        projects: [],
        baseCount: 0,
        count: 0,
        slides: [],
        height: window.innerHeight,
        current: 0,
        offset: 0,
        anim: null,
        isAnimating: false,
        hintDone: false,
        touchStartY: 0,
        touchDelta: 0,
        isDragging: false,
        wasDragging: false,
        cursorZone: 'mid'
    };

    (async function bootstrap() {
        state.projects = await loadProjectEntries();
        if (!state.projects.length) return;

        state.baseCount = state.projects.length;
        if (state.projects.length < 3) {
            state.projects = state.projects.concat(state.projects);
        }
        state.count = state.projects.length;

        buildSlides();
        buildDots();
        positionSlides();
        updateCursor('mid');
        bindEvents();
    })();

    async function loadProjectEntries() {
        var fallback = [
            {
                src: 'projects/a-sweet-kid-cdmx/images/proyecto_1.jpg',
                title: 'A Sweet Kid',
                desc: 'Multimedia installation',
                date: '2025',
                loc: 'Mexico City — Salon Silicon',
                link: 'a-sweet-kid.html'
            },
            {
                iframe: 'cube-scene.html',
                title: 'A Sweet Kid Online',
                desc: 'Virtual Experience',
                date: '2025',
                loc: '',
                link: 'a-sweet-kid-online.html'
            }
        ];

        var data = null;
        try {
            var draft = localStorage.getItem('tatc_cms');
            if (draft) data = JSON.parse(draft);
        } catch (err) {
            console.warn('Draft CMS data invalid:', err);
        }

        if (!data) {
            try {
                var res = await fetch('content.json', { cache: 'no-cache' });
                if (res.ok) data = await res.json();
            } catch (err) {
                console.warn('Unable to fetch content.json', err);
            }
        }

        var items = data && data.projects && Array.isArray(data.projects.items) ? data.projects.items : null;
        if (!items || !items.length) return fallback;
        return items.map(normalizeProject);
    }

    function normalizeProject(entry, idx) {
        return {
            id: entry.id != null ? entry.id : idx,
            title: entry.title || 'Untitled project',
            desc: entry.desc || '',
            date: entry.date || '',
            loc: entry.loc || '',
            link: entry.link || '',
            src: entry.src || '',
            iframe: entry.iframe || entry.embed || ''
        };
    }

    // ── HIDE HINT ───────────────────────────────────────────────────────────
    function hideHint() {
        if (state.hintDone || !scrollHint) return;
        state.hintDone = true;

        // 1. Apagamos la animación CSS infinita
        scrollHint.style.animation = 'none';

        // 2. ¡EL TRUCO MÁGICO! Forzamos un reflow para que el navegador se actualice
        void scrollHint.offsetWidth;

        // 3. Aplicamos la transición suave y la opacidad a 0
        scrollHint.style.transition = 'opacity 0.8s ease-out';
        scrollHint.style.opacity = '0';

        // 4. Lo desactivamos para los clics
        scrollHint.style.pointerEvents = 'none';
    }

    // ── ZONA según posición Y del ratón ─────────────────────────────────────
    // Arriba: 0–25%   Centro: 25–75%   Abajo: 75–100%
    function getZone(mouseY) {
        var pct = mouseY / state.height;
        if (pct < 0.25) return 'up';
        if (pct < 0.75) return 'mid';
        return 'down';
    }

    // ── UPDATE CURSOR according to zone ─────────────────────────────────────────
    function updateCursor(zone) {
        var isMobile = window.innerWidth <= 768;
        if (isMobile) zone = 'mid';

        state.cursorZone = zone;
        var proj = state.projects[state.current];
        var hasLink = proj && proj.link;

        cursor.dataset.zone = zone;
        var symbol = cursor.querySelector('.cursor-symbol');
        var label = cursor.querySelector('.cursor-text');

        if (zone === 'up') {
            symbol.textContent = '';
            label.textContent = '(prev)';
            cursor.classList.remove('cursor-mid');
        } else if (zone === 'down') {
            symbol.textContent = '';
            label.textContent = '(next)';
            cursor.classList.remove('cursor-mid');
        } else {
            symbol.textContent = '';
            label.textContent = '(explore more)';
            cursor.classList.add('cursor-mid');
        }
    }

    function buildSlides() {
        wrapper.innerHTML = '';
        state.slides = [];

        state.projects.forEach(function (project) {
            var div = document.createElement('div');
            div.className = 'proj-slide' + (project.link ? ' has-link' : '');

            var mediaHtml = '';
            if (project.iframe) {
                mediaHtml = '<iframe src="' + project.iframe + '" style="width:100%;height:100%;border:none;pointer-events:none;" loading="lazy"></iframe>';
            } else if (project.src) {
                mediaHtml = '<img src="' + project.src + '" alt="' + project.title + '">';
            } else {
                mediaHtml = '<div class="proj-placeholder">Coming soon</div>';
            }

            div.innerHTML =
                mediaHtml +
                '<div class="proj-info">' +
                '<div class="proj-title">' + project.title + '</div>' +
                '<div class="proj-meta">' +
                (project.desc ? '<div>DESCRIPTION: ' + project.desc + '</div>' : '') +
                (project.loc ? '<div>LOCATION: ' + project.loc + '</div>' : '') +
                (project.date ? '<div>DATE: ' + project.date + '</div>' : '') +
                '</div>' +
                '</div>';
            wrapper.appendChild(div);
            state.slides.push(div);
        });
    }

    function buildDots() {
        progressEl.innerHTML = '';
        for (var i = 0; i < state.baseCount; i++) {
            var dot = document.createElement('div');
            dot.className = 'prog-dot' + (i === 0 ? ' active' : '');
            progressEl.appendChild(dot);
        }
    }

    // ── POSICIONAMIENTO INFINITO ─────────────────────────────────────────────
    function positionSlides() {
        for (var i = 0; i < state.count; i++) {
            var rel = i - state.current;
            if (rel > state.count / 2) rel -= state.count;
            if (rel < -state.count / 2) rel += state.count;
            var translateY = rel * state.height + state.offset;
            state.slides[i].style.transform = 'translate3d(0,' + translateY + 'px,0)';
        }
    }

    function updateDots() {
        var dots = progressEl.querySelectorAll('.prog-dot');
        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === (state.current % state.baseCount));
        });
    }

    // ── NAVEGACIÓN INFINITA ──────────────────────────────────────────────────
    function goTo(index, opts) {
        if (state.isAnimating) return;
        var target = wrap(index);
        hideHint();
        state.isAnimating = true;

        var steps = Math.max(1, Math.abs(index - state.current));
        var direction = index > state.current ? 1 : -1;
        var travel = -direction * steps * state.height;
        if (state.anim) state.anim.kill();

        state.anim = gsap.to(state, {
            offset: travel,
            duration: (opts && opts.fast ? 0.45 : 0.85) + (steps - 1) * 0.15,
            ease: 'power4.inOut',
            onUpdate: positionSlides,
            onComplete: function () {
                state.current = target;
                state.offset = 0;
                positionSlides();
                updateDots();
                updateCursor(state.cursorZone);
                state.isAnimating = false;
                state.anim = null;
            }
        });
    }

    function wrap(index) {
        if (!state.count) return 0;
        return ((index % state.count) + state.count) % state.count;
    }

    // ── EVENTOS ──────────────────────────────────────────────────────────────
    function bindEvents() {

        wrapper.addEventListener('mousemove', function (e) {
            // Removed hideHint() call here
            gsap.set(cursor, { x: e.clientX, y: e.clientY });
            updateCursor(getZone(e.clientY));
            cursor.classList.add('visible');
        });

        wrapper.addEventListener('mouseenter', function () {
            cursor.classList.add('visible');
        });

        wrapper.addEventListener('mouseleave', function () {
            cursor.classList.remove('visible');
        });

        wrapper.addEventListener('click', function () {
            if (state.wasDragging) { state.wasDragging = false; return; }
            hideHint();
            if (state.cursorZone === 'up') {
                goTo(state.current - 1);
            } else if (state.cursorZone === 'down') {
                goTo(state.current + 1);
            } else {
                // center zone: navigate to project with smooth black overlay
                var proj = state.projects[state.current];
                if (proj && proj.link) {
                    navigateTo(proj.link);
                }
            }
        });

        wrapper.addEventListener('wheel', function (e) {
            e.preventDefault();
            hideHint();
            if (state.isAnimating) return;
            if (e.deltaY > 5) goTo(state.current + 1);
            else if (e.deltaY < -5) goTo(state.current - 1);
        }, { passive: false });

        wrapper.addEventListener('touchstart', function (e) {
            if (state.isAnimating) return;
            state.touchStartY = e.touches[0].clientY;
            state.touchDelta = 0;
            state.isDragging = true;
            state.wasDragging = false;
            hideHint();
        }, { passive: true });

        wrapper.addEventListener('touchmove', function (e) {
            if (!state.isDragging) return;
            var dy = state.touchStartY - e.touches[0].clientY;
            if (Math.abs(dy) > 8) { e.preventDefault(); state.wasDragging = true; }
            state.touchDelta = dy;
            state.offset = -state.touchDelta;
            positionSlides();
        }, { passive: false });

        wrapper.addEventListener('touchend', function () {
            if (!state.isDragging) return;
            state.isDragging = false;
            if (state.wasDragging) {
                var thr = state.height * 0.15;
                if (state.touchDelta > thr) goTo(state.current + 1);
                else if (state.touchDelta < -thr) goTo(state.current - 1);
                else goTo(state.current, { fast: true });
            } else if (state.cursorZone === 'mid') {
                var proj = state.projects[state.current];
                if (proj && proj.link) navigateTo(proj.link);
            }
        }, { passive: true });

        document.addEventListener('keydown', function (e) {
            if (state.isAnimating) return;
            hideHint();
            if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goTo(state.current + 1); }
            if (e.key === 'ArrowUp') { e.preventDefault(); goTo(state.current - 1); }
        });

        window.addEventListener('resize', function () {
            state.height = window.innerHeight;
            positionSlides();
        });
    }

    // ── NAVIGATE — always use canviaPagina for consistent black curtain transition ──
    function navigateTo(url) {
        if (window.canviaPagina) {
            window.canviaPagina(url);
        } else {
            var overlay = document.querySelector('.transition-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9999;opacity:0;pointer-events:all;transition:opacity 0.35s ease;';
                document.body.appendChild(overlay);
            }
            overlay.style.background = '#000';
            overlay.style.opacity = '0';
            requestAnimationFrame(function() {
                overlay.style.opacity = '1';
                setTimeout(function() { window.location.href = url; }, 360);
            });
        }
    }

})();