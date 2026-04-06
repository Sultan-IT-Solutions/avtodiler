import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, MapPin, Phone } from 'lucide-react';

export const OwnersFooter = () => {
  const { t } = useTranslation();
  const ownerLinks = [
    { path: '/hongqi-parts', label: t('nav.parts') },
    { path: '/hongqi-parts/catalog', label: t('shop.actions.goCatalog') },
    { path: '/hongqi-parts#service', label: t('shop.home.quickActions.service.title') },
    { path: '/hongqi-parts/stores', label: t('shop.stores.title') },
    { path: '/hongqi-parts/request', label: t('shop.request.title') },
  ];

  return (
    <footer className="border-t border-black/6 bg-[linear-gradient(180deg,#fff8f6_0%,#f6efec_100%)]">
      <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[34px] border border-luxury-burgundy/12 bg-[linear-gradient(135deg,#ffffff_0%,#fff6f3_100%)] p-8 shadow-[0_28px_80px_rgba(157,34,53,0.08)] lg:p-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-luxury-burgundy/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#fff1ec] blur-3xl" />
            </div>
            <div className="relative z-10">
              <p className="inline-flex items-center rounded-full border border-luxury-burgundy/12 bg-luxury-burgundy/6 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-black/55">
              {t('shop.home.hero.dealerBadge')}
              </p>
              <h2 className="mt-6 font-display text-[clamp(32px,4vw,52px)] font-semibold leading-[1.02] text-[#1e1716]">
                {t('shop.home.hero.titleLine1')} <span className="text-luxury-burgundy">{t('shop.home.hero.titleHighlight')}</span>
                <br />
                <span className="text-black/25">{t('shop.home.hero.titleLine2')}</span>
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-black/62">
                {t('shop.home.hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/hongqi-parts#service-booking"
                  className="inline-flex items-center gap-2 rounded-xl bg-luxury-burgundy px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-luxury-burgundyHover"
                >
                  {t('shop.home.quickActions.service.title')}
                </Link>
                <Link
                  to="/hongqi-parts/catalog"
                  className="inline-flex items-center gap-2 rounded-xl border border-luxury-burgundy/18 bg-[#fff9f8] px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-[#7b2232] transition-all duration-300 hover:border-luxury-burgundy/30 hover:text-[#5d1725]"
                >
                  {t('shop.actions.goCatalog')}
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-luxury-burgundy/14 bg-[linear-gradient(180deg,#ffffff_0%,#fff7f4_100%)] p-8 shadow-[0_20px_56px_rgba(157,34,53,0.08)]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/50">
              {t('shop.routes.shop')}
            </p>
            <div className="mt-6 grid gap-3">
              {ownerLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-luxury-burgundy/14 bg-white px-4 py-4 text-sm font-medium text-[#2a2220] shadow-[0_12px_30px_rgba(157,34,53,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-luxury-burgundy/28 hover:shadow-[0_16px_36px_rgba(157,34,53,0.1)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-luxury-burgundy/18 bg-luxury-burgundy/8 text-[10px] uppercase tracking-[0.18em] text-luxury-burgundy">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">{link.label}</span>
                  </div>
                  <ArrowUpRight size={15} className="shrink-0 text-black/40 transition-colors duration-300 group-hover:text-luxury-burgundy" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-luxury-burgundy/12 bg-white/92 p-8 shadow-[0_20px_56px_rgba(157,34,53,0.06)]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/40">{t('footer.contact')}</p>
            <div className="mt-6 grid gap-4 text-sm text-black/65">
              <a
                href="tel:+77753813839"
                className="flex items-start gap-3 rounded-2xl border border-black/8 bg-[#fff8f7] px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:text-black"
              >
                <Phone size={16} className="mt-0.5 text-luxury-burgundy" />
                <span>+7 (775) 381-38-39</span>
              </a>
              <div className="flex items-start gap-3 rounded-2xl border border-black/8 bg-[#fff8f7] px-4 py-4">
                <MapPin size={16} className="mt-0.5 text-luxury-burgundy" />
                <span>{t('footer.address')}</span>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-luxury-burgundy transition-colors hover:text-[#5d1725]"
              >
                {t('nav.contact')}
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
