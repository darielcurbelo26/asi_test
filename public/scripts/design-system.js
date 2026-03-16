// ═════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM - SISTEMA DE DISEÑO CENTRALIZADO
// ═════════════════════════════════════════════════════════════════════════════

const DesignSystem = {
    // ─── CONFIG ───────────────────────────────────────────────────────────────
    THEME: {
        LIGHT: 'light',
        DARK: 'dark',
        STORAGE_KEY: 'theme-mode',
        TRANSITION_DURATION: 250, // ms (simple dissolve)
        EASING: 'ease'
    },

    COLORS: {
        light: {
            bg: '#FAFAFA',
            text: '#050505',
            border: '#050505',
            accent: '#050505'
        },
        dark: {
            bg: '#050505',
            text: '#FAFAFA',
            border: '#FAFAFA',
            accent: '#FAFAFA'
        }
    },

    // ─── ESTADO ───────────────────────────────────────────────────────────────
    currentTheme: null,
    _themeSwitchTimeout: null,

    withThemeTransition(fn) {
        // Apply a temporary class so CSS can transition color/bg/border
        // without affecting normal interactions.
        const root = document.documentElement;
        root.classList.add('theme-switching');
        if (document.body) document.body.classList.add('theme-switching');

        if (this._themeSwitchTimeout) {
            clearTimeout(this._themeSwitchTimeout);
            this._themeSwitchTimeout = null;
        }

        try {
            fn();
        } finally {
            this._themeSwitchTimeout = window.setTimeout(() => {
                root.classList.remove('theme-switching');
                if (document.body) document.body.classList.remove('theme-switching');
                this._themeSwitchTimeout = null;
            }, this.THEME.TRANSITION_DURATION);
        }
    },

    // ─── STORAGE HELPERS ──────────────────────────────────────────────────────
    getStoredTheme() {
        try {
            return localStorage.getItem(this.THEME.STORAGE_KEY);
        } catch (err) {
            console.warn('[DesignSystem] Unable to read theme from storage:', err);
            return null;
        }
    },

    setStoredTheme(theme) {
        try {
            localStorage.setItem(this.THEME.STORAGE_KEY, theme);
        } catch (err) {
            console.warn('[DesignSystem] Unable to persist theme preference:', err);
        }
    },

    resolveInitialTheme() {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        return prefersDark ? this.THEME.DARK : this.THEME.LIGHT;
    },

    applyTheme(theme, { persist = false } = {}) {
        const nextTheme = theme === this.THEME.DARK ? this.THEME.DARK : this.THEME.LIGHT;

        document.documentElement.setAttribute('data-theme', nextTheme);
        document.documentElement.style.setProperty('color-scheme', nextTheme === this.THEME.DARK ? 'dark' : 'light');

        const toggleBodyTheme = () => {
            document.body.classList.toggle('dark-mode', nextTheme === this.THEME.DARK);
            document.body.classList.toggle('light-mode', nextTheme === this.THEME.LIGHT);
        };

        if (document.body) {
            toggleBodyTheme();
        } else {
            document.addEventListener('DOMContentLoaded', toggleBodyTheme, { once: true });
        }

        this.currentTheme = nextTheme;

        if (persist) {
            this.setStoredTheme(nextTheme);
        }
    },

    // ─── INICIALIZAR TEMA ANTES DE RENDERIZAR ─────────────────────────────────
    initThemeBeforeRender() {
        const stored = this.getStoredTheme();
        const initialTheme = stored || this.resolveInitialTheme();
        this.applyTheme(initialTheme);
        // Ensure the preference is stored so all pages stay in sync
        if (!stored) {
            this.setStoredTheme(initialTheme);
        }
    },

    // ─── TOGGLE TEMA ──────────────────────────────────────────────────────────
    toggleTheme() {
        const newTheme = this.isCurrentThemeDark() ? this.THEME.LIGHT : this.THEME.DARK;

        this.withThemeTransition(() => {
            this.applyTheme(newTheme, { persist: true });
        });

        // Disparar evento personalizado para que otros componentes se enteren
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: newTheme }
        }));
    },

    // ─── OBTENER TEMA ACTUAL ──────────────────────────────────────────────────
    isCurrentThemeDark() {
        return this.currentTheme === this.THEME.DARK;
    },

    getThemeColor(colorKey) {
        const theme = this.isCurrentThemeDark() ? 'dark' : 'light';
        return this.COLORS[theme][colorKey];
    },

    // ─── ESCUCHAR CAMBIOS DE TEMA DESDE OTRAS PESTAÑAS ────────────────────────
    syncStorageChanges() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.THEME.STORAGE_KEY) {
                const nextTheme = e.newValue === this.THEME.DARK ? this.THEME.DARK : this.THEME.LIGHT;
                this.withThemeTransition(() => {
                    this.applyTheme(nextTheme);
                });
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { theme: this.currentTheme, external: true }
                }));
            }
        });
    },

    // ─── INICIALIZAR EL SISTEMA ───────────────────────────────────────────────
    init() {
        this.initThemeBeforeRender();
        this.syncStorageChanges();
        this.watchSystemScheme();
    },

    watchSystemScheme() {
        if (!window.matchMedia) return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (event) => {
            const stored = this.getStoredTheme();
            if (stored) return; // User has an explicit preference.
            this.applyTheme(event.matches ? this.THEME.DARK : this.THEME.LIGHT);
        };
        if (media.addEventListener) media.addEventListener('change', handler);
        else if (media.addListener) media.addListener(handler);
    }
};

// Ejecutar inmediatamente (antes de DOMContentLoaded)
DesignSystem.init();
