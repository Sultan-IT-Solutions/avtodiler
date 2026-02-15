document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initScrollAnimations();
    initBrandInteractions();
    initCTAButtons();

    const container = document.getElementById('brandsList');
    if (container) {
        loadBrands(container).then(() => {
            initScrollAnimations();
            initBrandInteractions();
        }).catch(() => {
            initScrollAnimations();
            initBrandInteractions();
        });
    }
});

function textForLang(obj) {
    let lang = 'ru';
    try {
        lang = localStorage.getItem('pm_lang') || 'ru';
    } catch (_) {}
    if (lang === 'kz') return obj.kz || obj.ru || obj.en || '';
    if (lang === 'en') return obj.en || obj.ru || obj.kz || '';
    return obj.ru || obj.kz || obj.en || '';
}

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

function pickBgUrl(brand) {
    const media = parseJsonArray(brand.mediaJson);
    for (const m of media) {
        if (!m) continue;
        if (typeof m === 'string') return m;
        if (typeof m === 'object') {
            if (m.url) return m.url;
            if (m.src) return m.src;
            if (m.imageUrl) return m.imageUrl;
        }
    }
    return '';
}

function renderBrandSection(brand, index) {
    const title = textForLang({ ru: brand.titleRu, kz: brand.titleKz, en: brand.titleEn });
    const desc = textForLang({ ru: brand.descRu, kz: brand.descKz, en: brand.descEn });
    const history = textForLang({ ru: brand.historyRu, kz: brand.historyKz, en: brand.historyEn });
    const philosophy = textForLang({ ru: brand.philosophyRu, kz: brand.philosophyKz, en: brand.philosophyEn });
    const bgUrl = pickBgUrl(brand);
    const reverse = index % 2 === 1 ? ' brand-section--reverse' : '';
    const style = bgUrl ? ` style="background-image:url('${escapeHtml(bgUrl)}');background-size:cover;background-position:center;"` : '';

    return `<div class="brand-section${reverse}"><div class="brand-section__image"${style}><div class="brand-section__image-overlay"></div></div><div class="brand-section__content"><h2 class="brand-section__title">${escapeHtml(title)}</h2><p class="brand-section__description">${escapeHtml(desc)}</p><div class="brand-section__info"><div class="brand-info"><div class="brand-info__header"><div class="brand-info__accent"></div><h3 class="brand-info__title" data-i18n="brands.history">История</h3></div><p class="brand-info__text">${escapeHtml(history)}</p></div><div class="brand-info"><div class="brand-info__header"><div class="brand-info__accent"></div><h3 class="brand-info__title" data-i18n="brands.philosophy">Философия</h3></div><p class="brand-info__text">${escapeHtml(philosophy)}</p></div></div></div></div>`;
}

async function loadBrands(container) {
    const r = await fetch('http://localhost:4000/api/brands');
    if (!r.ok) throw new Error('brands');
    const items = await r.json();
    if (!Array.isArray(items) || items.length === 0) {
        if (window.pm && typeof window.pm.renderEmptyState === 'function') {
            window.pm.renderEmptyState(container, { titleKey: 'brands.empty.title', descKey: 'brands.empty.desc' });
        } else {
            container.innerHTML = '';
        }
        return;
    }
    container.innerHTML = items.map(renderBrandSection).join('');
    document.dispatchEvent(new Event('i18n:updated'));
}

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.brands-header__mobile-menu');
    const mobileOverlay = document.querySelector('.brands-header__mobile-overlay');
    const mobileNavLinks = document.querySelectorAll('.brands-header__mobile-nav-link');
    
    if (!mobileMenuBtn || !mobileOverlay) return;
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
        
        const lines = mobileMenuBtn.querySelectorAll('.brands-header__mobile-menu-line');
        lines.forEach((line, index) => {
            if (mobileOverlay.classList.contains('active')) {
                if (index === 0) line.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) line.style.opacity = '0';
                if (index === 2) line.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                line.style.transform = '';
                line.style.opacity = '';
            }
        });
    });
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            const lines = mobileMenuBtn.querySelectorAll('.brands-header__mobile-menu-line');
            lines.forEach(line => {
                line.style.transform = '';
                line.style.opacity = '';
            });
        });
    });
    
    mobileOverlay.addEventListener('click', function(e) {
        if (e.target === mobileOverlay) {
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            const lines = mobileMenuBtn.querySelectorAll('.brands-header__mobile-menu-line');
            lines.forEach(line => {
                line.style.transform = '';
                line.style.opacity = '';
            });
        }
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    const brandSections = document.querySelectorAll('.brand-section');
    brandSections.forEach(section => {
        observer.observe(section);
    });
    
    const brandInfoCards = document.querySelectorAll('.brand-info');
    brandInfoCards.forEach(card => {
        observer.observe(card);
    });
    
    const ctaSection = document.querySelector('.brands-cta');
    if (ctaSection) {
        observer.observe(ctaSection);
    }
}

function initBrandInteractions() {
    const brandImages = document.querySelectorAll('.brand-section__image');
    
    brandImages.forEach(image => {
        image.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        image.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    const brandInfoCards = document.querySelectorAll('.brand-info');
    
    brandInfoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 8px 32px rgba(212, 175, 55, 0.1)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
}

function initCTAButtons() {
    const ctaButtons = document.querySelectorAll('.brands-cta__btn');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                return true;
            } else {
                e.preventDefault();
                if (this.textContent.includes('Связаться')) {
                    showContactModal();
                }
            }
        });
    });
}

function showContactModal() {
    const phoneLink = document.querySelector('a.phone-link');
    if (phoneLink && phoneLink.getAttribute('href')) {
        window.location.href = phoneLink.getAttribute('href');
    }
}

window.addEventListener('scroll', function() {
    const header = document.querySelector('.brands-header');
    if (!header) return;
    
    if (window.scrollY > 50) {
        header.style.background = 'rgba(13, 13, 13, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#0D0D0D';
        header.style.backdropFilter = '';
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.brands-header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const mobileOverlay = document.querySelector('.brands-header__mobile-overlay');
        const mobileMenuBtn = document.querySelector('.brands-header__mobile-menu');
        
        if (mobileOverlay && mobileOverlay.classList.contains('active')) {
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            if (mobileMenuBtn) {
                const lines = mobileMenuBtn.querySelectorAll('.brands-header__mobile-menu-line');
                lines.forEach(line => {
                    line.style.transform = '';
                    line.style.opacity = '';
                });
            }
        }
    }
});

const style = document.createElement('style');
style.textContent = `
    .brand-section,
    .brand-info,
    .brands-cta {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .brand-section.animate-in,
    .brand-info.animate-in,
    .brands-cta.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .brand-section:nth-child(even).animate-in {
        animation: slideInRight 0.6s ease forwards;
    }
    
    .brand-section:nth-child(odd).animate-in {
        animation: slideInLeft 0.6s ease forwards;
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .brands-header {
        transition: all 0.3s ease;
    }
    
    .brand-section__image {
        transition: transform 0.3s ease;
    }
    
    .brand-info {
        transition: all 0.3s ease;
    }
    
    .brands-cta__btn {
        transition: all 0.2s ease;
    }
`;
document.head.appendChild(style);