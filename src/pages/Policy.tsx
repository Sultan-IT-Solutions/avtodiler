import { useTranslation } from 'react-i18next';
import { Footer } from '../components/Footer';
import { VisualEditPanel } from '../components/VisualEditPanel';
import { buildAdminUrl } from '../utils/visualAdmin';

const PolicySection = ({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="border-t border-white/10 py-8 first:border-t-0 first:pt-0">
    <div className="grid gap-5 lg:grid-cols-[80px_minmax(0,1fr)]">
      <div className="text-[11px] uppercase tracking-[0.24em] text-luxury-burgundy">
        {String(index).padStart(2, '0')}
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <div className="mt-5 space-y-4 text-white/70 leading-7">{children}</div>
      </div>
    </div>
  </section>
);

export const Policy = () => {
  const { t } = useTranslation();
  const definitions = t('policy.definitions.items', { returnObjects: true }) as Array<{
    term: string;
    text: string;
  }>;
  const userData = t('policy.userData.items', { returnObjects: true }) as string[];
  const purposes = t('policy.purposes.items', { returnObjects: true }) as string[];
  const collectionRules = t('policy.collection.items', { returnObjects: true }) as string[];

  return (
    <div className="bg-luxury-black">
      <section className="border-b border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_100%)] pt-[calc(env(safe-area-inset-top)+12rem)] sm:pt-56 lg:pt-40">
        <div className="container mx-auto px-6 pb-16 lg:px-16 lg:pb-20">
          <p className="text-[10px] uppercase tracking-[0.14em] sm:text-[11px] sm:tracking-[0.28em] text-luxury-burgundy">
            {t('policy.eyebrow')}
          </p>
          <h1 className="mt-5 max-w-5xl text-[clamp(32px,5vw,68px)] font-display font-light leading-[1.02] text-white">
            {t('policy.title')}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60">
            {t('policy.intro')}
          </p>
          <p className="mt-4 text-sm text-white/40">{t('policy.updated')}</p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <VisualEditPanel
          title="Политика обработки данных"
          description="Редактирование SEO и содержимого юридической страницы через общую админку."
          actions={[
            { label: 'SEO', href: buildAdminUrl('seo'), kind: 'primary' },
          ]}
          className="mb-10"
        />
        <div className="card-luxury p-8 lg:p-10">
          <PolicySection index={1} title={t('policy.general.title')}>
            <p>{t('policy.general.p1')}</p>
            <p>{t('policy.general.p2')}</p>
            <p>{t('policy.general.p3')}</p>
          </PolicySection>

          <PolicySection index={2} title={t('policy.definitions.title')}>
            <div className="space-y-4">
              {definitions.map((item) => (
                <div key={item.term} className="border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    {item.term}
                  </p>
                  <p className="mt-3 text-white/65">{item.text}</p>
                </div>
              ))}
            </div>
          </PolicySection>

          <PolicySection index={3} title={t('policy.userData.title')}>
            <ul className="space-y-3">
              {userData.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-luxury-burgundy" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>{t('policy.userData.note')}</p>
          </PolicySection>

          <PolicySection index={4} title={t('policy.purposes.title')}>
            <ul className="space-y-3">
              {purposes.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-luxury-burgundy" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>{t('policy.purposes.optOut')}</p>
          </PolicySection>

          <PolicySection index={5} title={t('policy.legal.title')}>
            <p>{t('policy.legal.p1')}</p>
            <p>{t('policy.legal.p2')}</p>
          </PolicySection>

          <PolicySection index={6} title={t('policy.collection.title')}>
            <ul className="space-y-3">
              {collectionRules.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-luxury-burgundy" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>{t('policy.collection.p1')}</p>
            <p>{t('policy.collection.p2')}</p>
            <p>{t('policy.collection.p3')}</p>
          </PolicySection>

          <PolicySection index={7} title={t('policy.transfer.title')}>
            <p>{t('policy.transfer.p1')}</p>
            <p>{t('policy.transfer.p2')}</p>
          </PolicySection>

          <PolicySection index={8} title={t('policy.final.title')}>
            <p>{t('policy.final.p1')}</p>
            <p>{t('policy.final.p2')}</p>
            <p>{t('policy.final.p3')}</p>
          </PolicySection>
        </div>
      </section>

      <Footer />
    </div>
  );
};
