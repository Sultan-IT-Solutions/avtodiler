document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.catalog-filter__btn');
    const container = document.querySelector('.catalog-cars__container');
    if (container) {
        loadCatalog(container).then(() => {
            initObserver();
            applyFilters(getActiveFilterText());
        }).catch(() => {
            initObserver();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('catalog-filter__btn--active'));
            this.classList.add('catalog-filter__btn--active');
            applyFilters(getActiveFilterText());
        });
    });
    
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const targetElement = document.querySelector(href);
            if (!targetElement) return;

            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
    
    function initObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.car-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
    
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            langButtons.forEach(btn => btn.classList.remove('lang-btn--active'));
            this.classList.add('lang-btn--active');
        });
    });
    
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.header__nav');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('header__nav--active');
            this.classList.toggle('mobile-menu-toggle--active');
        });
    }
});

function getActiveFilterText() {
    const btn = document.querySelector('.catalog-filter__btn--active');
    if (!btn) return '';
    const explicit = btn.getAttribute('data-filter');
    if (explicit) return explicit.trim();
    return btn.textContent.trim();
}

function applyFilters(filter) {
    const carCards = document.querySelectorAll('.car-card');
    const f = (filter || '').toLowerCase();

    carCards.forEach(card => {
        const brand = ((card.getAttribute('data-make') || '') + '').trim();
        const isNew = (card.getAttribute('data-is-new') || '').trim() === '1';
        let shouldShow = false;

    if (!f) shouldShow = true;
    else if (f.includes('все')) shouldShow = true;
    else if (f.includes('нов')) shouldShow = isNew;
    else if (f.includes('пробег') || f.includes('used')) shouldShow = !isNew;
    else shouldShow = brand.toLowerCase().includes(f);

        if (shouldShow) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.5s ease-in-out';
        } else {
            card.style.display = 'none';
        }
    });
}

function numOrNull(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function formatKzt(price) {
    if (price == null) return '';
    try {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
    } catch (_) {
        return String(price) + ' ₸';
    }
}

function textForLang(obj) {
    let lang = 'ru';
    try {
        lang = localStorage.getItem('pm_lang') || 'ru';
    } catch (_) {}
    if (lang === 'kz') return obj.kz || obj.ru || obj.en || '';
    if (lang === 'en') return obj.en || obj.ru || obj.kz || '';
    return obj.ru || obj.kz || obj.en || '';
}

async function loadCatalog(container) {
    const apiFetch = (window.pm && typeof window.pm.apiFetch === 'function') ? window.pm.apiFetch : fetch;
    const r = await apiFetch('/api/catalog');
    if (!r.ok) throw new Error('catalog');
    const items = await r.json();
    if (!Array.isArray(items) || items.length === 0) {
        if (window.pm && typeof window.pm.renderEmptyState === 'function') {
            window.pm.renderEmptyState(container, { titleKey: 'catalog.empty.title', descKey: 'catalog.empty.desc' });
        }
        return;
    }

    const html = items.map(buildCarCard).join('');
    const existing = container.querySelectorAll('.car-card');
    existing.forEach(n => n.remove());
    container.insertAdjacentHTML('beforeend', html);
    document.dispatchEvent(new Event('i18n:updated'));
}

function buildCarCard(x) {
    const make = x.make ? textForLang(x.make) : '';
    const model = x.model ? textForLang(x.model) : '';
    const year = x.year != null ? String(x.year) : '';
    const engine = x.engine || '';
    const mileageType = x.isNew ? 'Новый' : (x.mileageKm != null ? String(x.mileageKm) + ' км' : '');
    const price = formatKzt(numOrNull(x.priceKzt));
    const isNew = x.isNew ? '1' : '0';

    return `<div class="car-card" data-make="${escapeHtml(make)}" data-is-new="${isNew}"><div class="car-card__image"><div class="car-card__overlay"></div><div class="car-card__badges"><span class="car-card__year">${escapeHtml(year)}</span><span class="car-card__status">${x.isNew ? 'NEW' : ''}</span></div></div><div class="car-card__content"><div class="car-card__header"><h3 class="car-card__brand">${escapeHtml(make)}</h3><p class="car-card__model">${escapeHtml(model)}</p></div><div class="car-card__specs"><div class="car-card__spec"><div class="car-card__spec-header"><svg class="car-card__spec-icon" width="16" height="16" viewBox="0 0 16 16"><path d="M8 2V8L12 10" stroke="#A0A0A0" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="8" cy="8" r="6" stroke="#A0A0A0" stroke-width="1.33333" fill="none"/></svg><span class="car-card__spec-label" data-i18n="catalog.spec.engine">Двигатель</span></div><p class="car-card__spec-value">${escapeHtml(engine)}</p></div><div class="car-card__spec"><div class="car-card__spec-header"><svg class="car-card__spec-icon" width="16" height="16" viewBox="0 0 16 16"><path d="M8 6.66667H13.3333" stroke="#A0A0A0" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M2.66667 2.66667H13.3333V13.3333H2.66667V2.66667Z" stroke="#A0A0A0" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg><span class="car-card__spec-label" data-i18n="catalog.spec.mileage">Пробег</span></div><p class="car-card__spec-value">${escapeHtml(mileageType)}</p></div></div><div class="car-card__bottom"><div class="car-card__price-section"><span class="car-card__price-label" data-i18n="catalog.price">Цена</span><span class="car-card__price">${escapeHtml(price)}</span></div><a href="#" class="car-card__link"><span data-i18n="catalog.more">Подробнее</span><svg class="car-card__arrow" width="16" height="16" viewBox="0 0 16 16"><path d="M9.33333 8H3.33333" stroke="#F8F8F8" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M8 3.33333L12.6667 8L8 12.6667" stroke="#F8F8F8" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></a></div></div></div>`;
}

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);