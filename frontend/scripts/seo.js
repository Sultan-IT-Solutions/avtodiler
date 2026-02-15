(function(){
    function getSlugFromPath(pathname){
        const name = String(pathname || '').split('/').pop() || '';
        if (!name || name === '/' ) return 'home';
        if (name === 'index.html') return 'home';
        const base = name.replace(/\.html$/i, '');
        return base || 'home';
    }

    async function loadSeo(){
        const slug = getSlugFromPath(location.pathname);
        try {
            const resp = await fetch(`http://localhost:4000/api/pages/${encodeURIComponent(slug)}`);
            if (!resp.ok) return;
            const page = await resp.json();
            if (!page) return;

            if (page.titleRu || page.titleKz || page.titleEn){
                const title = window.pm && window.pm.textForLang ? window.pm.textForLang({ru: page.titleRu, kz: page.titleKz, en: page.titleEn}) : (page.titleRu || page.titleKz || page.titleEn);
                if (title) document.title = title;
            }

            if (page.descriptionRu || page.descriptionKz || page.descriptionEn){
                const desc = window.pm && window.pm.textForLang ? window.pm.textForLang({ru: page.descriptionRu, kz: page.descriptionKz, en: page.descriptionEn}) : (page.descriptionRu || page.descriptionKz || page.descriptionEn);
                if (desc){
                    let meta = document.querySelector('meta[name="description"]');
                    if (!meta){
                        meta = document.createElement('meta');
                        meta.setAttribute('name','description');
                        document.head.appendChild(meta);
                    }
                    meta.setAttribute('content', desc);
                }
            }

            if (page.h1Ru || page.h1Kz || page.h1En){
                const h1 = document.querySelector('h1');
                if (h1 && !h1.hasAttribute('data-i18n')){
                    const value = window.pm && window.pm.textForLang ? window.pm.textForLang({ru: page.h1Ru, kz: page.h1Kz, en: page.h1En}) : (page.h1Ru || page.h1Kz || page.h1En);
                    if (value) h1.textContent = value;
                }
            }
        } catch (_e) {
        }
    }

    document.addEventListener('DOMContentLoaded', loadSeo);
    document.addEventListener('i18n:updated', loadSeo);
})();
