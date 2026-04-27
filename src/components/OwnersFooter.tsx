import { Link } from 'react-router-dom';

export const OwnersFooter = () => {
  const catalogLinks = ['Двигатель', 'Подвеска', 'Тормоза', 'Электрика', 'Оптика'];
  const modelLinks = ['Hongqi H5', 'Hongqi H9', 'Hongqi HS5', 'Hongqi HS7', 'Hongqi E-HS9'];

  return (
    <footer className="parts-scope bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 border-b border-white/8 pb-16 md:grid-cols-4">
          <div>
            <Link to="/hongqi-parts" className="inline-flex flex-col leading-none">
              <span className="parts-serif text-base font-semibold uppercase tracking-[0.16em]">
                HONGQI
              </span>
              <span className="mt-1 flex items-center gap-2">
                <span className="h-px w-6 bg-luxury-burgundy" />
                <span className="text-[7px] uppercase tracking-[0.35em] text-white/30">
                  ЗАПЧАСТИ
                </span>
              </span>
            </Link>
            <p className="mt-6 max-w-[14rem] text-sm leading-7 text-white/32">
              Оригинальные запчасти для автомобилей Hongqi с гарантией качества.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.28em] text-white/25">Каталог</h4>
            <div className="mt-6 space-y-3 text-sm text-white/38">
              {catalogLinks.map((item) => (
                <Link
                  key={item}
                  to="/hongqi-parts/catalog"
                  className="block transition-colors hover:text-white/72"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.28em] text-white/25">Модели</h4>
            <div className="mt-6 space-y-3 text-sm text-white/38">
              {modelLinks.map((item) => (
                <Link
                  key={item}
                  to={`/hongqi-parts/catalog?model=${encodeURIComponent(item.replace('Hongqi ', ''))}`}
                  className="block transition-colors hover:text-white/72"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.28em] text-white/25">Контакты</h4>
            <div className="mt-6 space-y-3 text-sm text-white/38">
              <p>г. Алматы, ул. Тимирязева 42</p>
              <a href="tel:+77001234567" className="block transition-colors hover:text-white/72">
                +7 700 123 45 67
              </a>
              <a
                href="mailto:parts@hongqi-almaty.kz"
                className="block transition-colors hover:text-white/72"
              >
                parts@hongqi-almaty.kz
              </a>
              <p className="pt-2 text-xs text-white/25">Пн-Пт: 09:00-18:00</p>
              <p className="text-xs text-white/25">Сб: 10:00-15:00</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-8 text-[10px] uppercase tracking-[0.24em] text-white/20 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HONGQI AUTO KAZAKHSTAN</p>
          <p>Все права защищены</p>
        </div>
      </div>
    </footer>
  );
};
