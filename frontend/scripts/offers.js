document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('offersList');
    if (!container) return;

    loadOffers(container).catch(() => {
        if (window.pm && typeof window.pm.renderEmptyState === 'function') {
            window.pm.renderEmptyState(container, { titleKey: 'offers.empty.title', descKey: 'offers.empty.desc' });
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

function parseDate(d) {
    if (!d) return null;
    const dt = new Date(d);
    return Number.isFinite(dt.getTime()) ? dt : null;
}

function formatDateShort(dt) {
    if (!dt) return '';
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = String(dt.getFullYear());
    return `${dd}.${mm}.${yyyy}`;
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

function offerCard(x) {
    const title = textForLang({ ru: x.titleRu, kz: x.titleKz, en: x.titleEn });
    const desc = textForLang({ ru: x.descRu, kz: x.descKz, en: x.descEn });
    const endAt = formatDateShort(parseDate(x.endAt));
    const pillText = endAt ? endAt : '';
    const watermark = x.slug ? String(x.slug).toUpperCase() : 'OFFER';
    const bg = x.imageUrl ? ` style="background-image:url('${escapeHtml(x.imageUrl)}');background-size:cover;background-position:center;"` : '';

    return `<article class="offer" data-watermark="${escapeHtml(watermark)}"${bg}><div class="offer__overlay"></div><div class="offer__content"><div class="offer__pill"><span class="offer__pill-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5.33333 1.33333V2.66667" stroke="#000" stroke-width="1.33333" stroke-linecap="round"/><path d="M10.6667 1.33333V2.66667" stroke="#000" stroke-width="1.33333" stroke-linecap="round"/><path d="M2.66667 3.33333H13.3333" stroke="#000" stroke-width="1.33333" stroke-linecap="round"/><path d="M3.33333 2.66667H12.6667C13.0349 2.66667 13.3333 2.96514 13.3333 3.33333V13C13.3333 13.3682 13.0349 13.6667 12.6667 13.6667H3.33333C2.96514 13.6667 2.66667 13.3682 2.66667 13V3.33333C2.66667 2.96514 2.96514 2.66667 3.33333 2.66667Z" stroke="#000" stroke-width="1.33333"/><path d="M2.66667 6H13.3333" stroke="#000" stroke-width="1.33333" stroke-linecap="round"/></svg></span><span class="offer__pill-text">${pillText ? `${escapeHtml(textForLang({ ru: 'Действует до: ', kz: 'Жарамды: ', en: 'Valid until: ' }))}${escapeHtml(pillText)}` : ''}</span></div><h2 class="offer__title">${escapeHtml(title)}</h2><p class="offer__desc">${escapeHtml(desc)}</p><a class="offer__btn" href="#"><span data-i18n="offers.more">Подробнее</span><span class="offer__btn-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.33333 8H12.6667" stroke="#000" stroke-width="1.33333" stroke-linecap="round"/><path d="M8 3.33333L12.6667 8L8 12.6667" stroke="#000" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a></div></article>`;
}

async function loadOffers(container) {
    const apiFetch = (window.pm && typeof window.pm.apiFetch === 'function') ? window.pm.apiFetch : fetch;
    const r = await apiFetch('/api/offers');
    if (!r.ok) throw new Error('offers');
    const items = await r.json();

    if (!Array.isArray(items) || items.length === 0) {
        if (window.pm && typeof window.pm.renderEmptyState === 'function') {
            window.pm.renderEmptyState(container, { titleKey: 'offers.empty.title', descKey: 'offers.empty.desc' });
        }
        return;
    }

    container.innerHTML = items.map(offerCard).join('');
    document.dispatchEvent(new Event('i18n:updated'));
}
