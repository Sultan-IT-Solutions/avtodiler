import { Link } from 'react-router-dom';
import { Eye, Settings, X } from 'lucide-react';
import { useVisualAdmin } from '../context/VisualAdminContext';

export const VisualAdminToolbar = () => {
  const { disable } = useVisualAdmin();

  return (
    <div className="fixed bottom-5 left-5 z-[65] max-w-[calc(100vw-2.5rem)]">
      <div className="border border-luxury-burgundy/35 bg-luxury-black/90 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-luxury-burgundy">Режим редактирования</p>
            <p className="mt-1 truncate text-sm text-white/70">Вы видите сайт как пользователь, но с admin-доступом.</p>
          </div>
          <button
            type="button"
            onClick={disable}
            className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/70 transition hover:border-white/25 hover:text-white"
            aria-label="Выключить режим редактирования"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 px-4 py-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 border border-luxury-burgundy bg-luxury-burgundy/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-luxury-burgundy/20"
          >
            <Settings size={14} />
            Админка
          </Link>
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/45">
          <Eye size={13} />
          Остальные инструменты редактирования доступны прямо на текущей странице.
        </div>
      </div>
    </div>
  );
};
