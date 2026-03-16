/**
 * cms-engine.js — TATC Content Engine v2
 *
 * Priority: localStorage draft (admin edits) → content.json → fallback
 *
 * Usage:
 *   data-cms="path.to.key"          → sets innerHTML
 *   data-cms-attr="href"            → sets attribute instead
 *
 * Admin saves via: localStorage.setItem('tatc_cms', JSON.stringify(data))
 */
(function () {
  function get(obj, path) {
    return path.split('.').reduce((a, k) => a && a[k], obj);
  }

  function inject(el, value) {
    const attr = el.getAttribute('data-cms-attr');
    const mode = (el.getAttribute('data-cms-mode') || '').toLowerCase();
    const allowHtml = el.hasAttribute('data-cms-html') || mode === 'html';

    if (attr) {
      // Basic URL hardening: never allow javascript: URLs.
      if ((attr === 'href' || attr === 'src') && /^\s*javascript:/i.test(value)) return;
      el.setAttribute(attr, value);
      return;
    }

    if (el.tagName === 'TITLE') {
      document.title = 'TATC';
      return;
    }

    // Safe-by-default: treat CMS values as text unless explicitly opted into HTML.
    if (allowHtml) el.innerHTML = value;
    else el.textContent = value;
  }

  function hydrate(data) {
    document.querySelectorAll('[data-cms]').forEach(el => {
      const path  = el.getAttribute('data-cms');
      const value = get(data, path);
      if (value !== undefined && typeof value !== 'object') inject(el, String(value));
    });
    window.TATC_CONTENT = data;
    document.dispatchEvent(new CustomEvent('cms:ready', { detail: data }));
  }

  async function init() {
    let data = null;

    // 1 — Admin draft (localStorage) takes priority
    try {
      const draft = localStorage.getItem('tatc_cms');
      if (draft) data = JSON.parse(draft);
    } catch(e) {}

    // 2 — Merge/fallback with content.json
    try {
      // Prefer revalidation over hard cache-busting (better caching + fewer bytes).
      const res = await fetch('content.json', { cache: 'no-cache' });
      if (res.ok) {
        const fresh = await res.json();
        // If no draft, use fresh. If draft exists, use draft but fill missing top-level keys from fresh.
        if (!data) {
          data = fresh;
        } else {
          Object.keys(fresh).forEach(k => { if (!(k in data)) data[k] = fresh[k]; });
        }
      }
    } catch(e) { console.warn('[CMS] content.json unavailable'); }

    if (!data) { console.warn('[CMS] No content loaded.'); return; }
    hydrate(data);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
