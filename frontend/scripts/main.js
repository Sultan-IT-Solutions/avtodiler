

document.addEventListener('DOMContentLoaded', function() {
    init();
});

window.pm = window.pm || {};

window.pm.apiBase = (function () {
    try {
        if (typeof window.__PM_API_BASE__ === 'string' && window.__PM_API_BASE__.trim()) {
            return window.__PM_API_BASE__.trim().replace(/\/+$/, '');
        }
    } catch (_) {}

    try {
        const host = window.location && window.location.hostname ? window.location.hostname : '';
        if (host && host !== 'localhost' && host !== '127.0.0.1') {
            return '';
        }
    } catch (_) {}
    return 'http://localhost:4000';
})();

window.pm.apiUrl = function (path) {
    const p = String(path || '');
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    if (!p.startsWith('/')) return (window.pm.apiBase || '') + '/' + p;
    return (window.pm.apiBase || '') + p;
};

window.pm.apiFetch = function (path, init) {
    return fetch(window.pm.apiUrl(path), init);
};

window.pm.getLang = function() {
    try {
        return localStorage.getItem('pm_lang') || 'ru';
    } catch (_) {
        return 'ru';
    }
};

window.pm.textForLang = function(obj) {
    const lang = window.pm.getLang();
    if (lang === 'kz') return obj.kz || obj.ru || obj.en || '';
    if (lang === 'en') return obj.en || obj.ru || obj.kz || '';
    return obj.ru || obj.kz || obj.en || '';
};

window.pm.renderEmptyState = function(container, opts) {
    if (!container) return;
    const titleKey = (opts && opts.titleKey) ? String(opts.titleKey) : 'ui.empty.title';
    const descKey = (opts && opts.descKey) ? String(opts.descKey) : 'ui.empty.desc';
    const actionHref = (opts && opts.actionHref) ? String(opts.actionHref) : '';
    const actionKey = (opts && opts.actionKey) ? String(opts.actionKey) : 'ui.empty.action';

    container.innerHTML = `<div class="pm-empty"><div class="pm-empty__box"><h3 class="pm-empty__title" data-i18n="${titleKey}">Пока пусто</h3><p class="pm-empty__desc" data-i18n="${descKey}">Скоро здесь появится контент</p>${actionHref ? `<a class=\"pm-empty__btn\" href=\"${actionHref}\" data-i18n=\"${actionKey}\">Обновить</a>` : ''}</div></div>`;
    document.dispatchEvent(new Event('i18n:updated'));
};


function init() {
    setupNavigation();
    setupLanguageSwitcher();
    setupLeadCapture();
    setupMobileMenu();
    setupMobileSidebar();
}


function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav__link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            
            navLinks.forEach(l => l.classList.remove('nav__link--active'));
            
            
            this.classList.add('nav__link--active');
        });
    });
}


function setupLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang__btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            langButtons.forEach(btn => btn.classList.remove('lang__btn--active'));
            
            
            this.classList.add('lang__btn--active');
            
            
            const selectedLang = this.textContent;
            console.log('Language switched to:', selectedLang);
            
            
            switchLanguage(selectedLang);
        });
    });
}


function switchLanguage(lang) {
    console.log('Switching to language:', lang);
    localStorage.setItem('selectedLanguage', lang);
}


function setupLeadCapture() {
    ensureLeadModal();

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;

        const trigger = target.closest(
            '.test-drive-btn, .footer__test-drive-btn, .test-drive__button--primary, .catalog-cta__btn--primary, .catalog-cta__btn--secondary, .brands-cta__btn--secondary, .offers-cta__btn--primary, .service-cta__btn--primary'
        );

        if (!trigger) return;
        const a = trigger instanceof HTMLAnchorElement ? trigger : trigger.closest('a');
        if (a && a.getAttribute('href') === '#') e.preventDefault();

        const leadType = inferLeadType(trigger);
        const ctx = {
            type: leadType,
            carId: getClosestDataId(trigger, 'carId'),
            dealerId: getClosestDataId(trigger, 'dealerId'),
            serviceId: getClosestDataId(trigger, 'serviceId')
        };

        openLeadModal(ctx);
    });
}

function inferLeadType(el) {
    if (!el) return 'test-drive';
    if (el.closest('.service-cta')) return 'service';
    if (el.closest('.offers-cta')) return 'offer';
    if (el.closest('.catalog-cta')) return 'catalog-help';
    if (el.classList && (el.classList.contains('catalog-cta__btn--secondary') || el.classList.contains('brands-cta__btn--secondary'))) return 'contact';
    return 'test-drive';
}

function getClosestDataId(el, key) {
    let cur = el;
    while (cur && cur !== document.body) {
        if (cur instanceof HTMLElement && cur.dataset && cur.dataset[key]) return cur.dataset[key];
        cur = cur.parentElement;
    }
    return '';
}

function ensureLeadModal() {
    if (document.getElementById('pmLeadModal')) return;

    const root = document.createElement('div');
    root.id = 'pmLeadModal';
    root.className = 'pm-modal';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `
        <div class="pm-modal__overlay" data-pm-modal-close="1"></div>
        <div class="pm-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pmLeadModalTitle">
            <button class="pm-modal__close" type="button" data-pm-modal-close="1" aria-label="Close">×</button>
            <h3 class="pm-modal__title" id="pmLeadModalTitle" data-i18n="lead.modal.title">Оставьте заявку</h3>
            <p class="pm-modal__subtitle" data-i18n="lead.modal.subtitle">Мы свяжемся с вами в ближайшее время</p>

            <form class="pm-form" id="pmLeadForm">
                <input type="hidden" name="type" />
                <input type="hidden" name="carId" />
                <input type="hidden" name="dealerId" />
                <input type="hidden" name="serviceId" />

                <label class="pm-form__label">
                    <span class="pm-form__label-text" data-i18n="lead.form.name">Имя</span>
                    <input class="pm-form__input" name="name" type="text" autocomplete="name" required />
                </label>

                <label class="pm-form__label">
                    <span class="pm-form__label-text" data-i18n="lead.form.phone">Телефон</span>
                    <input class="pm-form__input" name="phone" type="tel" autocomplete="tel" required />
                </label>

                <label class="pm-form__label">
                    <span class="pm-form__label-text" data-i18n="lead.form.comment">Комментарий</span>
                    <textarea class="pm-form__textarea" name="comment" rows="3"></textarea>
                </label>

                <div class="pm-form__actions">
                    <button class="pm-form__submit" type="submit" data-i18n="lead.form.submit">Отправить</button>
                </div>

                <div class="pm-form__status" aria-live="polite"></div>
            </form>
        </div>
    `.trim();

    document.body.appendChild(root);
    document.dispatchEvent(new Event('i18n:updated'));

    root.addEventListener('click', (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        if (t.matches('[data-pm-modal-close]')) closeLeadModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLeadModal();
    });

    const form = root.querySelector('#pmLeadForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitLeadForm();
        });
    }
}

function openLeadModal(ctx) {
    ensureLeadModal();
    const modal = document.getElementById('pmLeadModal');
    if (!modal) return;

    const form = modal.querySelector('#pmLeadForm');
    const statusEl = modal.querySelector('.pm-form__status');
    if (statusEl) {
        statusEl.textContent = '';
        statusEl.classList.remove('pm-form__status--ok', 'pm-form__status--error');
    }

    if (form instanceof HTMLFormElement) {
        form.reset();
        setFormValue(form, 'type', (ctx && ctx.type) ? ctx.type : 'test-drive');
        setFormValue(form, 'carId', (ctx && ctx.carId) ? ctx.carId : '');
        setFormValue(form, 'dealerId', (ctx && ctx.dealerId) ? ctx.dealerId : '');
        setFormValue(form, 'serviceId', (ctx && ctx.serviceId) ? ctx.serviceId : '');
    }

    modal.classList.add('pm-modal--open');
    modal.setAttribute('aria-hidden', 'false');

    const nameInput = modal.querySelector('input[name="name"]');
    if (nameInput instanceof HTMLInputElement) nameInput.focus();
}

function closeLeadModal() {
    const modal = document.getElementById('pmLeadModal');
    if (!modal) return;
    modal.classList.remove('pm-modal--open');
    modal.setAttribute('aria-hidden', 'true');
}

function setFormValue(form, name, value) {
    const el = form.querySelector(`[name="${CSS.escape(name)}"]`);
    if (!el) return;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = value;
}

async function submitLeadForm() {
    const modal = document.getElementById('pmLeadModal');
    if (!modal) return;
    const form = modal.querySelector('#pmLeadForm');
    const statusEl = modal.querySelector('.pm-form__status');
    if (!(form instanceof HTMLFormElement)) return;

    const fd = new FormData(form);
    const payload = {
        type: String(fd.get('type') || ''),
        name: String(fd.get('name') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        comment: String(fd.get('comment') || '').trim(),
        lang: window.pm && window.pm.getLang ? window.pm.getLang() : 'ru'
    };

    const carId = String(fd.get('carId') || '').trim();
    const dealerId = String(fd.get('dealerId') || '').trim();
    const serviceId = String(fd.get('serviceId') || '').trim();
    if (carId) payload.carId = Number(carId);
    if (dealerId) payload.dealerId = Number(dealerId);
    if (serviceId) payload.serviceId = Number(serviceId);
    if (!payload.comment) delete payload.comment;

    if (statusEl) {
        statusEl.textContent = '';
        statusEl.classList.remove('pm-form__status--ok', 'pm-form__status--error');
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;

    try {
        const apiFetch = (window.pm && typeof window.pm.apiFetch === 'function') ? window.pm.apiFetch : fetch;
        const resp = await apiFetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            const message = (data && data.error) ? String(data.error) : 'Ошибка при отправке';
            if (statusEl) {
                statusEl.textContent = message;
                statusEl.classList.add('pm-form__status--error');
            }
            return;
        }

        const okMessage = (data && data.message) ? String(data.message) : 'Готово';
        if (statusEl) {
            statusEl.textContent = okMessage;
            statusEl.classList.add('pm-form__status--ok');
        }

        setTimeout(() => closeLeadModal(), 900);
    } catch (err) {
        if (statusEl) {
            statusEl.textContent = 'Ошибка сети';
            statusEl.classList.add('pm-form__status--error');
        }
    } finally {
        if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
    }
}


function setupMobileMenu() {
    
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            
            header.style.transform = 'translateY(-100%)';
        } else {
            
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
}

function setupMobileSidebar() {
    const burger = document.querySelector('.header__burger');
    const sidebar = document.getElementById('pmMobileSidebar');
    const actions = document.getElementById('pmHeaderActions');
    const mobileActions = document.getElementById('pmMobileActions');

    if (!burger || !sidebar || !actions || !mobileActions) return;

    const mq = window.matchMedia('(max-width: 768px)');

    const syncActions = () => {
        if (mq.matches) {
            if (actions.children.length) {
                while (actions.firstChild) mobileActions.appendChild(actions.firstChild);
            }
        } else {
            if (mobileActions.children.length) {
                while (mobileActions.firstChild) actions.appendChild(mobileActions.firstChild);
            }
            closeSidebar();
        }

        document.dispatchEvent(new Event('i18n:updated'));
    };

    const openSidebar = () => {
        sidebar.classList.add('pm-sidebar--open');
        sidebar.setAttribute('aria-hidden', 'false');
        burger.setAttribute('aria-expanded', 'true');
        document.documentElement.classList.add('pm-sidebar-open');
        document.body.classList.add('pm-sidebar-open');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('pm-sidebar--open');
        sidebar.setAttribute('aria-hidden', 'true');
        burger.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('pm-sidebar-open');
        document.body.classList.remove('pm-sidebar-open');
    };

    const isOpen = () => sidebar.classList.contains('pm-sidebar--open');

    burger.addEventListener('click', () => {
        if (isOpen()) closeSidebar();
        else openSidebar();
    });

    sidebar.addEventListener('click', (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        if (t.matches('[data-pm-sidebar-close]')) closeSidebar();
        if (t.closest('.pm-sidebar__nav-link')) closeSidebar();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });

    syncActions();
    if (mq.addEventListener) {
        mq.addEventListener('change', syncActions);
    } else {
        mq.addListener(syncActions);
    }
}


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


function loadUserLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
        const langButton = document.querySelector(`[data-lang="${savedLang}"]`);
        if (langButton) {
            langButton.click();
        }
    }
}


document.addEventListener('DOMContentLoaded', loadUserLanguage);