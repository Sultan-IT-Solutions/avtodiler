import { useTranslation } from 'react-i18next';

export const EmptyState = ({ title, subtitle }: { title?: string; subtitle?: string }) => {
  const { t } = useTranslation();
  return (
    <div className="border border-white/10 bg-luxury-elevated p-10 text-center">
      <p className="text-white text-sm font-semibold">{title ?? t('empty.title')}</p>
      <p className="mt-2 text-white/50 text-sm">{subtitle ?? t('empty.subtitle')}</p>
    </div>
  );
};
