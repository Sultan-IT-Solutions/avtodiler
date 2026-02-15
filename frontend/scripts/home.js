document.addEventListener('DOMContentLoaded', function() {
    const popular = document.getElementById('homePopular');
    const offers = document.getElementById('homeOffers');
    if (!popular && !offers) return;

    loadHome(popular, offers).catch(() => {
        if (popular && window.pm && typeof window.pm.renderEmptyState === 'function') {
            window.pm.renderEmptyState(popular, { titleKey: 'index.popular.empty.title', descKey: 'index.popular.empty.desc' });
        }
        if (offers && window.pm && typeof window.pm.renderEmptyState === 'function') {
            window.pm.renderEmptyState(offers, { titleKey: 'index.offers.empty.title', descKey: 'index.offers.empty.desc' });
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

function formatKzt(price) {
    const n = Number(price);
    if (!Number.isFinite(n)) return '';
    try {
        return new Intl.NumberFormat('ru-RU').format(n) + ' ₸';
    } catch (_) {
        return String(n) + ' ₸';
    }
}

function parseJsonArray(maybeJson) {
    if (!maybeJson) return [];
    if (Array.isArray(maybeJson)) return maybeJson;
    if (typeof maybeJson !== 'string') return [];
    try {
        const v = JSON.parse(maybeJson);
        return Array.isArray(v) ? v : [];
    } catch (_) {
        return [];
    }
}

function pickCarImage(car) {
    const arr = parseJsonArray(car.imagesJson);
    if (arr.length === 0) return '';
    const first = arr[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') return first.url || first.src || first.imageUrl || '';
    return '';
}

function popularCard(car) {
    const make = car.make ? textForLang({ ru: car.make.nameRu, kz: car.make.nameKz, en: car.make.nameEn }) : '';
    const model = car.model ? textForLang({ ru: car.model.nameRu, kz: car.model.nameKz, en: car.model.nameEn }) : '';
    const engine = car.engine || '';
    const mileage = car.isNew ? textForLang({ ru: '0 км', kz: '0 км', en: '0 km' }) : (car.mileageKm != null ? String(car.mileageKm) + textForLang({ ru: ' км', kz: ' км', en: ' km' }) : '');
    const year = car.year != null ? String(car.year) : '';
    const price = car.priceKzt != null ? formatKzt(car.priceKzt) : '';
    const img = pickCarImage(car);
    const bg = img ? ` style="background-image:url('${escapeHtml(img)}');background-size:cover;background-position:center;"` : '';

    return `<div class="car-card"><div class="car-card__image-wrapper"><div class="car-card__image"${bg}></div><div class="car-card__year">${escapeHtml(year)}</div></div><div class="car-card__content"><div class="car-card__header"><h3 class="car-card__brand">${escapeHtml(make)}</h3><p class="car-card__model">${escapeHtml(model)}</p></div><div class="car-card__specs"><span class="spec__item">${escapeHtml(engine)}</span><span class="spec__item">${escapeHtml(mileage)}</span></div><div class="car-card__footer"><div class="car-card__price-wrapper"><p class="price__label" data-i18n="index.priceLabel">PRICE</p><p class="price__value">${escapeHtml(price)}</p></div><a href="catalog.html" class="car-card__link"><span data-i18n="common.more">Подробнее</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3.33333L12.6667 8L8 12.6667" stroke="#F8F8F8" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.33333 8H12.6667" stroke="#F8F8F8" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div></div></div>`;
}

function offerCard(offer, index) {
    const title = textForLang({ ru: offer.titleRu, kz: offer.titleKz, en: offer.titleEn });
    const desc = textForLang({ ru: offer.descRu, kz: offer.descKz, en: offer.descEn });
    const endAt = offer.endAt ? new Date(offer.endAt) : null;
    const badge = endAt && Number.isFinite(endAt.getTime()) ? formatDate(endAt) : '';
    const isLarge = index === 0;
    const img = offer.imageUrl || '';
    const bg = img ? ` style="background-image:url('${escapeHtml(img)}');background-size:cover;background-position:center;"` : '';

    return `<div class="offer-card${isLarge ? ' offer-card--large' : ''}"${bg}><div class="offer-card__badge">${badge ? escapeHtml(textForLang({ ru: 'ДЕЙСТВУЕТ ДО: ', kz: 'ЖАРАМДЫ: ', en: 'VALID UNTIL: ' })) + escapeHtml(badge) : ''}</div><div class="offer-card__content"><h3 class="offer-card__title">${escapeHtml(title)}</h3><p class="offer-card__description">${escapeHtml(desc)}</p><a href="offers.html" class="offer-card__button"><span data-i18n="common.more">Подробнее</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3.33333L12.6667 8L8 12.6667" stroke="#000000" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.33333 8H12.6667" stroke="#000000" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div><div class="offer-card__watermark">${escapeHtml(offer.slug ? String(offer.slug) : 'Offer')}</div></div>`;
}

function formatDate(dt) {
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = String(dt.getFullYear());
    return `${dd}.${mm}.${yyyy}`;
}

async function loadHome(popularEl, offersEl) {
    const apiFetch = (window.pm && typeof window.pm.apiFetch === 'function') ? window.pm.apiFetch : fetch;
    const r = await apiFetch('/api/home');
    if (!r.ok) throw new Error('home');
    const data = await r.json();
    const popular = Array.isArray(data && data.popular) ? data.popular : [];
    const offers = Array.isArray(data && data.offers) ? data.offers : [];

    if (popularEl) {
        if (popular.length === 0) {
            if (window.pm && typeof window.pm.renderEmptyState === 'function') {
                window.pm.renderEmptyState(popularEl, { titleKey: 'index.popular.empty.title', descKey: 'index.popular.empty.desc' });
            }
        } else {
            popularEl.innerHTML = popular.map(popularCard).join('');
        }
    }

    if (offersEl) {
        if (offers.length === 0) {
            if (window.pm && typeof window.pm.renderEmptyState === 'function') {
                window.pm.renderEmptyState(offersEl, { titleKey: 'index.offers.empty.title', descKey: 'index.offers.empty.desc' });
            }
        } else {
            offersEl.innerHTML = offers.slice(0, 2).map(offerCard).join('');
        }
    }

    document.dispatchEvent(new Event('i18n:updated'));
}
