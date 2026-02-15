document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('servicesList');
    if (!container) return;

    loadServices(container).catch(() => {
        if (window.pm && typeof window.pm.renderEmptyState === 'function') {
            window.pm.renderEmptyState(container, { titleKey: 'service.empty.title', descKey: 'service.empty.desc' });
        }
    });
});

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatKzt(price) {
    if (price == null) return '';
    const n = Number(price);
    if (!Number.isFinite(n)) return '';
    try {
        return new Intl.NumberFormat('ru-RU').format(n) + ' ₸';
    } catch (_) {
        return String(n) + ' ₸';
    }
}

function textForLang(obj) {
    if (window.pm && typeof window.pm.textForLang === 'function') return window.pm.textForLang(obj);
    let lang = 'ru';
    try {
        lang = localStorage.getItem('pm_lang') || 'ru';
    } catch (_) {}
    if (lang === 'kz') return obj.kz || obj.ru || obj.en || '';
    if (lang === 'en') return obj.en || obj.ru || obj.kz || '';
    return obj.ru || obj.kz || obj.en || '';
}

function serviceCard(x) {
    const title = textForLang({ ru: x.titleRu, kz: x.titleKz, en: x.titleEn });
    const desc = textForLang({ ru: x.descRu, kz: x.descKz, en: x.descEn });
    const price = x.priceKzt != null ? formatKzt(x.priceKzt) : '';

    return `<article class="service-card"><div class="service-card__top"><div class="service-card__icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M7 7L10.5 10.5" stroke="#F8F8F8" stroke-width="2.33333" stroke-linecap="round"/><path d="M6 22L10 18" stroke="#F8F8F8" stroke-width="2.33333" stroke-linecap="round"/><path d="M21 6L18 10" stroke="#F8F8F8" stroke-width="2.33333" stroke-linecap="round"/><path d="M11 17L17 11" stroke="#F8F8F8" stroke-width="2.33333" stroke-linecap="round"/><path d="M18.5 9.5L22 13" stroke="#F8F8F8" stroke-width="2.33333" stroke-linecap="round"/></svg></div><div class="service-card__price${price ? '' : ' service-card__price--empty'}">${price ? escapeHtml(textForLang({ ru: 'от ', kz: 'бастап ', en: 'from ' })) + escapeHtml(price) : ''}</div></div><h3 class="service-card__title">${escapeHtml(title)}</h3><p class="service-card__text">${escapeHtml(desc)}</p></article>`;
}

async function loadServices(container) {
    const apiFetch = (window.pm && typeof window.pm.apiFetch === 'function') ? window.pm.apiFetch : fetch;
    const r = await apiFetch('/api/services');
    if (!r.ok) throw new Error('services');
    const items = await r.json();

    if (!Array.isArray(items) || items.length === 0) {
        if (window.pm && typeof window.pm.renderEmptyState === 'function') {
            window.pm.renderEmptyState(container, { titleKey: 'service.empty.title', descKey: 'service.empty.desc' });
        }
        return;
    }

    container.innerHTML = items.map(serviceCard).join('');
    document.dispatchEvent(new Event('i18n:updated'));
}
