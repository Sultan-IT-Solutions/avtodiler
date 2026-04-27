import { Link } from 'react-router-dom';

export const OwnersFooter = () => {
  const catalogLinks = ['Двигатель', 'Подвеска', 'Тормоза', 'Электрика', 'Оптика'];
  const modelLinks = ['Hongqi H5', 'Hongqi H9', 'Hongqi HS5', 'Hongqi HS7', 'Hongqi E-HS9'];

  return (
    <footer className="parts-scope bg-[#030303] text-white">
      <div className="mx-auto max-w-[1728px] px-6 pb-14 pt-16 sm:px-10 lg:px-12">
        <div className="grid gap-12 border-b border-white/[0.06] pb-16 md:grid-cols-4">
          <div>
            <Link to="/hongqi-parts" className="inline-flex flex-col leading-none">
              <span className="parts-serif text-[18px] font-semibold uppercase tracking-[0.16em] text-white">
                HONGQI
              </span>
              <span className="mt-1.5 flex items-center gap-2.5">
                <span className="h-px w-7 bg-[#e7282d]" />
                <span className="text-[7px] uppercase tracking-[0.36em] text-white/28">
                  ЗАПЧАСТИ
                </span>
              </span>
            </Link>
            <p className="mt-8 max-w-[16rem] text-sm font-medium leading-7 text-white/28">
              Оригинальные запчасти для автомобилей Hongqi с гарантией качества.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/24">Каталог</h4>
            <div className="mt-7 space-y-4 text-sm font-medium text-white/30">
              {catalogLinks.map((item) => (
                <Link
                  key={item}
                  to="/hongqi-parts/catalog"
                  className="block transition-colors hover:text-white/65"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/24">Модели</h4>
            <div className="mt-7 space-y-4 text-sm font-medium text-white/30">
              {modelLinks.map((item) => (
                <Link
                  key={item}
                  to={`/hongqi-parts/catalog?model=${encodeURIComponent(item.replace('Hongqi ', ''))}`}
                  className="block transition-colors hover:text-white/65"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/24">Контакты</h4>
            <div className="mt-7 space-y-4 text-sm font-medium text-white/30">
              <p>г. Алматы, ул. Тимирязева 42</p>
              <a href="tel:+77001234567" className="block transition-colors hover:text-white/65">
                +7 700 123 45 67
              </a>
              <a
                href="mailto:parts@hongqi-almaty.kz"
                className="block transition-colors hover:text-white/65"
              >
                parts@hongqi-almaty.kz
              </a>
              <p className="pt-1 text-xs text-white/20">Пн-Пт: 09:00–18:00</p>
              <p className="text-xs text-white/20">Сб: 10:00–15:00</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-9 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/18 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HONGQI AUTO KAZAKHSTAN</p>
          <p>ВСЕ ПРАВА ЗАЩИЩЕНЫ</p>
        </div>
      </div>
    </footer>
  );
};
