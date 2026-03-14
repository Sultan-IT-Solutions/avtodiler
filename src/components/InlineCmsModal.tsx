import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { LocaleText } from '../types/admin';

export const InlineCmsModal = ({
  title,
  children,
  onClose,
  actions,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions: ReactNode;
}) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-black/75 px-4 py-8"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="max-h-[88vh] w-full max-w-4xl overflow-y-auto overscroll-contain border border-white/10 bg-luxury-elevated p-6 shadow-2xl lg:p-8"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/70 transition hover:border-white/25 hover:text-white"
              aria-label="Закрыть"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-5">{children}</div>
          <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
        </div>
      </div>
    </div>
  );
};

export const InlineCmsInput = ({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className="h-12 w-full bg-luxury-surface border border-white/10 px-4 text-white"
  />
);

export const InlineCmsTextarea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <textarea
    rows={rows}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className="min-h-[120px] w-full bg-luxury-surface border border-white/10 px-4 py-3 text-white"
  />
);

export const InlineCmsLocaleFields = ({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: LocaleText;
  onChange: (next: LocaleText) => void;
  multiline?: boolean;
}) => (
  <div>
    <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/45">{label}</p>
    <div className="grid gap-3 lg:grid-cols-3">
      {(['ru', 'kz', 'en'] as const).map((locale) =>
        multiline ? (
          <InlineCmsTextarea
            key={locale}
            value={value[locale]}
            onChange={(nextValue) => onChange({ ...value, [locale]: nextValue })}
            placeholder={locale.toUpperCase()}
          />
        ) : (
          <InlineCmsInput
            key={locale}
            value={value[locale]}
            onChange={(nextValue) => onChange({ ...value, [locale]: nextValue })}
            placeholder={locale.toUpperCase()}
          />
        )
      )}
    </div>
  </div>
);
