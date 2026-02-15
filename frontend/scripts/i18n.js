

(function () {
    const SUPPORTED = ['ru', 'kz', 'en'];
    const DEFAULT_LANG = 'ru';
    const STORAGE_KEY = 'pm_lang';
    const DEBUG = new URLSearchParams(window.location.search).has('i18nDebug');

    
    const I18N_BASE_URL = (() => {
        try {
            
            const scriptUrl = (document.currentScript && document.currentScript.src) || '';
            if (scriptUrl) {
                
                return new URL('../', scriptUrl);
            }

            
            const el = document.querySelector('script[src$="/scripts/i18n.js"], script[src$="scripts/i18n.js"]');
            if (el && el.src) return new URL('../', el.src);
        } catch (_) {
            
        }

        
        return new URL('./', window.location.href);
    })();

    function debugLog(...args) {
        if (DEBUG) console.log('[i18n]', ...args);
    }

    function ensureDebugBadge() {
        if (!DEBUG) return null;
        let el = document.getElementById('pm-i18n-debug');
        if (el) return el;

        el = document.createElement('div');
        el.id = 'pm-i18n-debug';
        el.style.cssText = [
            'position:fixed',
            'left:12px',
            'bottom:12px',
            'z-index:99999',
            'padding:10px 12px',
            'border-radius:10px',
            'background:rgba(0,0,0,0.75)',
            'border:1px solid rgba(212,175,55,0.6)',
            'color:#F8F8F8',
            'font:12px/1.35 system-ui, -apple-system, Segoe UI, Roboto, Arial',
            'max-width:320px'
        ].join(';');
        el.textContent = 'i18n: loading…';
        document.body.appendChild(el);
        return el;
    }

    
    function normalizeLang(lang) {
        const l = String(lang || '').toLowerCase();
        if (SUPPORTED.includes(l)) return l;
        if (l === 'kz' || l === 'kk') return 'kz';
        if (l === 'ru' || l === 'rus') return 'ru';
        if (l === 'en' || l === 'eng') return 'en';
        return DEFAULT_LANG;
    }

    
    function get(obj, path) {
        if (!obj || !path) return undefined;
        if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];

        
        return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
    }

    async function loadJson(lang) {
        const url = new URL(`i18n/${lang}.json`, I18N_BASE_URL).toString();
        debugLog('loading', url);
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load i18n/${lang}.json`);
        return res.json();
    }

    
    function applyTranslations(dict, fallbackDict) {
        const badge = ensureDebugBadge();
        const missing = [];

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const htmlMode = el.getAttribute('data-i18n-html') === 'true';
            const value = get(dict, key) ?? get(fallbackDict, key);

            if (typeof value === 'string') {
                if (htmlMode) el.innerHTML = value;
                else el.textContent = value;
            } else if (DEBUG) {
                missing.push(key);
            }

            const attrList = (el.getAttribute('data-i18n-attr') || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);

            if (attrList.length) {
                attrList.forEach((attr) => {
                    const attrKey = `${key}.${attr}`;
                    const attrVal = get(dict, attrKey) ?? get(fallbackDict, attrKey);
                    if (typeof attrVal === 'string') {
                        el.setAttribute(attr, attrVal);
                    }
                });
            }
        });

        document.documentElement.setAttribute('lang', dict.lang || DEFAULT_LANG);

        if (badge) {
            badge.innerHTML = [
                `<div><b>i18n</b>: <span style="color:#D4AF37">${dict.lang || DEFAULT_LANG}</span></div>`,
                `<div>keys on page: ${document.querySelectorAll('[data-i18n]').length}</div>`,
                `<div>missing keys: ${missing.length}</div>`,
                missing.length ? `<div style="margin-top:6px;opacity:.9">First missing: <code style="color:#D4AF37">${missing.slice(0, 3).join(', ')}</code></div>` : ''
            ].join('');
        }
    }

    function setActiveLangButton(lang) {
        
        document.querySelectorAll('.lang-btn').forEach((btn) => {
            const btnLang = normalizeLang(btn.getAttribute('data-lang') || btn.textContent);
            btn.classList.toggle('lang-btn--active', btnLang === lang);
        });
    }

    async function setLanguage(lang, opts = {}) {
        const normalized = normalizeLang(lang);
        const { persist = true } = opts;

        try {
            debugLog('setLanguage', normalized);
            const [dict, fallback] = await Promise.all([
                loadJson(normalized),
                normalized === DEFAULT_LANG ? Promise.resolve(null) : loadJson(DEFAULT_LANG)
            ]);

            applyTranslations(dict, fallback);
            setActiveLangButton(normalized);

            if (persist) localStorage.setItem(STORAGE_KEY, normalized);

            document.dispatchEvent(new Event('i18n:updated'));
        } catch (e) {
            console.warn('[i18n] failed to set language', normalized, e);
            const badge = ensureDebugBadge();
            if (badge) badge.textContent = `i18n error: ${String(e && e.message ? e.message : e)}`;
        }
    }

    function initLanguageSwitcher() {
        
        
        document.querySelectorAll('.lang-btn').forEach((btn) => {
            const btnLang = normalizeLang(btn.getAttribute('data-lang') || btn.textContent);
            btn.setAttribute('data-lang', btnLang);
            btn.type = 'button';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                setLanguage(btnLang);
            });
        });
    }

    function detectInitialLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return normalizeLang(saved);

        const htmlLang = document.documentElement.getAttribute('lang');
        if (htmlLang) return normalizeLang(htmlLang);

        const nav = navigator.language || navigator.userLanguage;
        return normalizeLang(nav);
    }

    window.PMI18N = {
        setLanguage,
        getLanguage: () => normalizeLang(localStorage.getItem(STORAGE_KEY) || detectInitialLanguage())
    };

    document.addEventListener('DOMContentLoaded', () => {
        initLanguageSwitcher();
        setLanguage(detectInitialLanguage(), { persist: false });
    });
})();
