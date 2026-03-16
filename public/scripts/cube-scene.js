(function () {
    const cube = document.querySelector('.cube');
    if (!cube) return;

    const baseX = -15;
    const tiltRange = 12;
    let mouseX = 0, mouseY = 0;
    let currentTiltX = 0, currentTiltY = 0;
    let isMobile = window.innerWidth <= 768;

    // Listen on parent window if embedded in iframe, otherwise on self
    const targetWindow = (window.parent && window.parent !== window) ? window.parent : window;

    try {
        targetWindow.addEventListener('mousemove', (e) => {
            if (isMobile) return;
            mouseX = (e.clientX / targetWindow.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / targetWindow.innerHeight - 0.5) * 2;
        });
    } catch (err) {
        // Cross-origin fallback: listen on own window
        window.addEventListener('mousemove', (e) => {
            if (isMobile) return;
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
    });

    let startTime = null;
    const spinDuration = 25000;
    let isDragging = false;
    let lastTouchX = 0, lastTouchY = 0;

    // Touch events for mobile drag
    if (isMobile) {
        cube.addEventListener('touchstart', (e) => {
            isDragging = true;
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
            e.preventDefault(); // Prevent scroll
        }, { passive: false });

        cube.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const deltaX = e.touches[0].clientX - lastTouchX;
            const deltaY = e.touches[0].clientY - lastTouchY;
            currentTiltY += deltaX * 0.5; // Adjust sensitivity
            currentTiltX -= deltaY * 0.5;
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });

        cube.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    function animate(ts) {
        if (!startTime) startTime = ts;
        const elapsed = (ts - startTime) % spinDuration;
        const spinY = -90 + (elapsed / spinDuration) * 360;

        if (!isMobile || !isDragging) {
            currentTiltX += (0 - currentTiltX) * 0.05; // Dampen to center
            currentTiltY += (0 - currentTiltY) * 0.05;
        }

        cube.style.transform = `rotateX(${baseX + currentTiltX}deg) rotateY(${spinY + currentTiltY}deg)`;
        requestAnimationFrame(animate);
    }

    cube.style.animation = 'none';
    requestAnimationFrame(animate);
})();