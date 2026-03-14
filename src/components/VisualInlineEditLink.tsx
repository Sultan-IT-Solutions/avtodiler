import type { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { Edit3 } from 'lucide-react';
import { useVisualAdmin } from '../context/VisualAdminContext';

export const VisualInlineEditLink = ({
  to,
  onClick,
  label = 'Редактировать',
  className = '',
}: {
  to?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  label?: string;
  className?: string;
}) => {
  const { enabled, authed } = useVisualAdmin();

  if (!enabled || !authed) return null;

  const classes = `absolute right-3 top-3 z-20 inline-flex items-center gap-2 border border-luxury-burgundy/50 bg-luxury-black/80 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-sm transition hover:bg-luxury-burgundy/20 ${className}`.trim();

  if (onClick) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick(event);
        }}
        className={classes}
      >
        <Edit3 size={12} />
        {label}
      </button>
    );
  }

  if (!to) return null;

  return (
    <Link
      to={to}
      onClick={(event) => event.stopPropagation()}
      className={classes}
    >
      <Edit3 size={12} />
      {label}
    </Link>
  );
};
