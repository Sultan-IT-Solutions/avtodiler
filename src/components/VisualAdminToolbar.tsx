import { Link, useLocation } from 'react-router-dom';
import { Edit3, Eye, Settings, X } from 'lucide-react';
import { buildAdminUrl } from '../utils/visualAdmin';
import { useVisualAdmin } from '../context/VisualAdminContext';

type ToolbarAction = {
  label: string;
  href: string;
};

const getToolbarActions = (pathname: string): ToolbarAction[] => {
  if (pathname === '/') {
    return [
      { label: 'Отзывы', href: buildAdminUrl('reviews') },
      { label: 'Автомобили', href: buildAdminUrl('cars') },
      { label: 'SEO', href: buildAdminUrl('seo') },
    ];
  }

  if (pathname === '/catalog' || pathname.startsWith('/car/')) {
    return [
      { label: 'Автомобили', href: buildAdminUrl('cars') },
      { label: 'SEO', href: buildAdminUrl('seo') },
    ];
  }

  if (pathname.startsWith('/hongqi-parts/stores')) {
    return [
      { label: 'Товары', href: buildAdminUrl('shop', 'products') },
      { label: 'Магазины', href: buildAdminUrl('shop', 'stores') },
      { label: 'SEO', href: buildAdminUrl('shop', 'seo') },
    ];
  }

  if (pathname.startsWith('/hongqi-parts/request')) {
    return [
      { label: 'Заявки', href: buildAdminUrl('shop', 'requests') },
      { label: 'Товары', href: buildAdminUrl('shop', 'products') },
      { label: 'SEO', href: buildAdminUrl('shop', 'seo') },
    ];
  }

  if (
    pathname.startsWith('/hongqi-parts') ||
    pathname === '/cart' ||
    pathname === '/checkout'
  ) {
    return [
      { label: 'Товары', href: buildAdminUrl('shop', 'products') },
      { label: 'Категории', href: buildAdminUrl('shop', 'categories') },
      { label: 'Заказы', href: buildAdminUrl('shop', 'orders') },
      { label: 'SEO', href: buildAdminUrl('shop', 'seo') },
    ];
  }

  if (pathname === '/offers') {
    return [
      { label: 'Предложения', href: buildAdminUrl('offers') },
      { label: 'SEO', href: buildAdminUrl('seo') },
    ];
  }

  if (pathname === '/service' || pathname === '/test-drive') {
    return [
      { label: 'Сервисы', href: buildAdminUrl('services') },
      { label: 'SEO', href: buildAdminUrl('seo') },
    ];
  }

  if (pathname === '/dealers' || pathname === '/contact') {
    return [
      { label: 'Дилеры', href: buildAdminUrl('dealers') },
      { label: 'SEO', href: buildAdminUrl('seo') },
    ];
  }

  return [{ label: 'SEO', href: buildAdminUrl('seo') }];
};

export const VisualAdminToolbar = () => {
  const location = useLocation();
  const { disable } = useVisualAdmin();
  const actions = getToolbarActions(location.pathname);

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
          {actions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/75 transition hover:border-white/25 hover:text-white"
            >
              <Edit3 size={14} />
              {action.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/45">
          <Eye size={13} />
          Переходы открывают нужный раздел админки по текущей странице.
        </div>
      </div>
    </div>
  );
};
