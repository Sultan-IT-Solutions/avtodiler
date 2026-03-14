import { Link } from 'react-router-dom';
import { Edit3, Plus, Settings } from 'lucide-react';
import { useVisualAdmin } from '../context/VisualAdminContext';

type VisualEditAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  kind?: 'default' | 'primary' | 'add';
};

export const VisualEditPanel = ({
  eyebrow = 'Режим редактирования',
  title,
  description,
  actions,
  details = [],
  className = '',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions: VisualEditAction[];
  details?: Array<{ label: string; value: string }>;
  className?: string;
}) => {
  const { enabled, authed } = useVisualAdmin();

  if (!enabled || !authed) return null;

  return (
    <div className={`mb-8 border border-luxury-burgundy/25 bg-luxury-black/70 p-4 backdrop-blur-sm ${className}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.28em] text-luxury-burgundy">{eyebrow}</p>
          <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-white/55">{description}</p> : null}
          {details.length ? (
            <div className="mt-4 grid gap-2">
              {details.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className="flex flex-wrap items-center gap-2 text-xs text-white/50"
                >
                  <span className="uppercase tracking-[0.18em] text-white/35">{item.label}:</span>
                  <code className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-white/75">
                    {item.value}
                  </code>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/75 transition hover:border-white/25 hover:text-white"
          >
            <Settings size={14} />
            admin панель
          </Link>
          {actions.map((action) =>
            action.onClick ? (
              <button
                key={`${action.label}-button`}
                type="button"
                onClick={action.onClick}
                className={`inline-flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
                  action.kind === 'primary'
                    ? 'border border-luxury-burgundy bg-luxury-burgundy/12 text-white hover:bg-luxury-burgundy/20'
                    : 'border border-white/10 text-white/75 hover:border-white/25 hover:text-white'
                }`}
              >
                {action.kind === 'add' ? <Plus size={14} /> : <Edit3 size={14} />}
                {action.label}
              </button>
            ) : action.href ? (
              <Link
                key={action.href}
                to={action.href}
                className={`inline-flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
                  action.kind === 'primary'
                    ? 'border border-luxury-burgundy bg-luxury-burgundy/12 text-white hover:bg-luxury-burgundy/20'
                    : 'border border-white/10 text-white/75 hover:border-white/25 hover:text-white'
                }`}
              >
                {action.kind === 'add' ? <Plus size={14} /> : <Edit3 size={14} />}
                {action.label}
              </Link>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};
