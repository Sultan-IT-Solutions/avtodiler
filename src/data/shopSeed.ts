import type { ShopState } from '../types/shop';

export const seedShopState: ShopState = {
  models: [
    { id: 'm-hs3', code: 'HS3', slug: 'hongqi-hs3', name: { ru: 'Hongqi HS3', en: 'Hongqi HS3', kz: 'Hongqi HS3' } },
    { id: 'm-eqm5', code: 'EQM5', slug: 'hongqi-eqm5', name: { ru: 'Hongqi EQM5', en: 'Hongqi EQM5', kz: 'Hongqi EQM5' } },
    { id: 'm-hs5', code: 'HS5', slug: 'hongqi-hs5', name: { ru: 'Hongqi HS5', en: 'Hongqi HS5', kz: 'Hongqi HS5' } },
    { id: 'm-hs7', code: 'HS7', slug: 'hongqi-hs7', name: { ru: 'Hongqi HS7', en: 'Hongqi HS7', kz: 'Hongqi HS7' } },
    { id: 'm-h5', code: 'H5', slug: 'hongqi-h5', name: { ru: 'Hongqi H5', en: 'Hongqi H5', kz: 'Hongqi H5' } },
    { id: 'm-h6', code: 'H6', slug: 'hongqi-h6', name: { ru: 'Hongqi H6', en: 'Hongqi H6', kz: 'Hongqi H6' } },
    { id: 'm-h9', code: 'H9', slug: 'hongqi-h9', name: { ru: 'Hongqi H9', en: 'Hongqi H9', kz: 'Hongqi H9' } },
    { id: 'm-hq9', code: 'HQ9', slug: 'hongqi-hq9', name: { ru: 'Hongqi HQ9', en: 'Hongqi HQ9', kz: 'Hongqi HQ9' } },
    { id: 'm-ehs9', code: 'E-HS9', slug: 'hongqi-e-hs9', name: { ru: 'Hongqi E-HS9', en: 'Hongqi E-HS9', kz: 'Hongqi E-HS9' } }
  ],
  categories: [
    {
      id: 'c-engine',
      slug: 'engine',
      name: { ru: 'Двигатель', en: 'Engine', kz: 'Қозғалтқыш' },
      description: { ru: 'Фильтры, прокладки, охлаждение.', en: 'Filters, gaskets, cooling.', kz: 'Сүзгілер, төсемдер, салқындату.' },
      subcategories: [
        { id: 'sc-engine-filters', slug: 'filters', name: { ru: 'Фильтры', en: 'Filters', kz: 'Сүзгілер' } },
        { id: 'sc-engine-gaskets', slug: 'gaskets', name: { ru: 'Прокладки', en: 'Gaskets', kz: 'Төсемдер' } },
        { id: 'sc-engine-cooling', slug: 'cooling', name: { ru: 'Охлаждение', en: 'Cooling', kz: 'Салқындату' } }
      ]
    },
    {
      id: 'c-transmission',
      slug: 'transmission',
      name: { ru: 'Трансмиссия', en: 'Transmission', kz: 'Трансмиссия' },
      description: { ru: 'Сцепление, валы, опоры.', en: 'Clutch, shafts, mounts.', kz: 'Ілінісу, біліктер, тіректер.' },
      subcategories: [
        { id: 'sc-tr-clutch', slug: 'clutch', name: { ru: 'Сцепление', en: 'Clutch', kz: 'Ілінісу' } },
        { id: 'sc-tr-shafts', slug: 'shafts', name: { ru: 'Приводные валы', en: 'Drive shafts', kz: 'Жетек біліктері' } },
        { id: 'sc-tr-mounts', slug: 'mounts', name: { ru: 'Опоры КПП', en: 'Transmission mounts', kz: 'ҚПП тіректері' } }
      ]
    },
    {
      id: 'c-suspension',
      slug: 'suspension',
      name: { ru: 'Подвеска и рулевое управление', en: 'Suspension & steering', kz: 'Аспа және рульдік басқару' },
      description: { ru: 'Амортизаторы, рычаги, рулевое.', en: 'Shocks, arms, steering.', kz: 'Амортизаторлар, иінтіректер, рульдік жүйе.' },
      subcategories: [
        { id: 'sc-sus-shocks', slug: 'shock-absorbers', name: { ru: 'Амортизаторы', en: 'Shock absorbers', kz: 'Амортизаторлар' } },
        { id: 'sc-sus-arms', slug: 'control-arms', name: { ru: 'Рычаги', en: 'Control arms', kz: 'Иінтіректер' } },
        { id: 'sc-sus-steering', slug: 'steering', name: { ru: 'Рулевое', en: 'Steering', kz: 'Рульдік жүйе' } }
      ]
    },
    {
      id: 'c-brakes',
      slug: 'brakes',
      name: { ru: 'Тормозная система', en: 'Brake system', kz: 'Тежегіш жүйесі' },
      description: { ru: 'Колодки, диски, суппорты.', en: 'Pads, rotors, calipers.', kz: 'Қалыптар, дискілер, суппорттар.' },
      subcategories: [
        { id: 'sc-br-pads', slug: 'pads', name: { ru: 'Колодки', en: 'Brake pads', kz: 'Қалыптар' } },
        { id: 'sc-br-rotors', slug: 'rotors', name: { ru: 'Диски', en: 'Rotors', kz: 'Дискілер' } },
        { id: 'sc-br-calipers', slug: 'calipers', name: { ru: 'Суппорты', en: 'Calipers', kz: 'Суппорттар' } }
      ]
    },
    {
      id: 'c-body',
      slug: 'body',
      name: { ru: 'Кузовные детали', en: 'Body parts', kz: 'Кузов бөлшектері' },
      description: { ru: 'Бамперы, фары, зеркала.', en: 'Bumpers, headlights, mirrors.', kz: 'Бамперлер, фаралар, айналар.' },
      subcategories: [
        { id: 'sc-body-bumpers', slug: 'bumpers', name: { ru: 'Бамперы', en: 'Bumpers', kz: 'Бамперлер' } },
        { id: 'sc-body-headlights', slug: 'headlights', name: { ru: 'Фары', en: 'Headlights', kz: 'Фаралар' } },
        { id: 'sc-body-mirrors', slug: 'mirrors', name: { ru: 'Зеркала', en: 'Mirrors', kz: 'Айналар' } }
      ]
    },
    {
      id: 'c-electronics',
      slug: 'electronics',
      name: { ru: 'Электроника', en: 'Electronics', kz: 'Электроника' },
      description: { ru: 'Датчики, камеры, блоки.', en: 'Sensors, cameras, modules.', kz: 'Датчиктер, камералар, блоктар.' },
      subcategories: [
        { id: 'sc-el-sensors', slug: 'sensors', name: { ru: 'Датчики', en: 'Sensors', kz: 'Датчиктер' } },
        { id: 'sc-el-cameras', slug: 'cameras', name: { ru: 'Камеры', en: 'Cameras', kz: 'Камералар' } },
        { id: 'sc-el-modules', slug: 'control-modules', name: { ru: 'Блоки управления', en: 'Control modules', kz: 'Басқару блоктары' } }
      ]
    },
    {
      id: 'c-interior',
      slug: 'interior',
      name: { ru: 'Салон и интерьер', en: 'Interior', kz: 'Салон және интерьер' },
      description: { ru: 'Панели, кнопки, коврики.', en: 'Panels, switches, mats.', kz: 'Панельдер, батырмалар, кілемшелер.' },
      subcategories: [
        { id: 'sc-in-panels', slug: 'panels', name: { ru: 'Панели', en: 'Panels', kz: 'Панельдер' } },
        { id: 'sc-in-switches', slug: 'switches', name: { ru: 'Кнопки', en: 'Switches', kz: 'Батырмалар' } },
        { id: 'sc-in-mats', slug: 'mats', name: { ru: 'Коврики', en: 'Mats', kz: 'Кілемшелер' } }
      ]
    },
    {
      id: 'c-consumables',
      slug: 'consumables',
      name: { ru: 'Расходники и ТО', en: 'Consumables & service', kz: 'Шығын материалдары және ТО' },
      description: { ru: 'Масла, свечи, жидкости.', en: 'Oils, plugs, fluids.', kz: 'Майлар, шамдар, сұйықтықтар.' },
      subcategories: [
        { id: 'sc-co-oils', slug: 'oils', name: { ru: 'Масла', en: 'Oils', kz: 'Майлар' } },
        { id: 'sc-co-plugs', slug: 'spark-plugs', name: { ru: 'Свечи', en: 'Spark plugs', kz: 'Шамдар' } },
        { id: 'sc-co-fluids', slug: 'fluids', name: { ru: 'Жидкости', en: 'Fluids', kz: 'Сұйықтықтар' } }
      ]
    }
  ],
  products: [
    {
      id: 'p-hs5-pad-front',
      slug: 'front-brake-pad-set-hs5',
      name: { ru: 'Комплект передних тормозных колодок HS5', en: 'Front brake pad set HS5', kz: 'HS5 aldyngy tezhigish kalyptar zhiintygy' },
      categorySlug: 'brakes',
      subcategorySlug: 'pads',
      article: 'HQ-BR-HS5-001',
      oem: '3501131XKZ16A',
      manufacturer: 'Hongqi Genuine Parts',
      price: 48900,
      stock: 12,
      images: [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=80'
      ],
      models: ['HS5', 'HS7'],
      kaspiUrl: 'https://kaspi.kz/',
      popular: true,
      description: { ru: 'Оригинальные передние колодки для Hongqi.', en: 'Genuine front pads for Hongqi.', kz: 'Hongqi ushin tupnuska aldyngy kalyptar.' },
      seoText: { ru: 'Подходят для штатной тормозной системы и ежедневной эксплуатации.', en: 'Fits the OEM brake system and daily use.', kz: 'Standartty tezhigish zhuiesine saikes zhane kundelikti paydalanu ushin.' },
      specs: [
        { id: 'material', label: { ru: 'Материал', en: 'Material', kz: 'Material' }, value: { ru: 'Керамика', en: 'Ceramic', kz: 'Keramika' } },
        { id: 'axle', label: { ru: 'Ось', en: 'Axle', kz: 'Os' }, value: { ru: 'Передняя', en: 'Front', kz: 'Aldyngy' } }
      ],
      compatibility: [
        { modelCode: 'HS5', year: '2021-2026', engine: '2.0T', note: { ru: 'Без адаптаций', en: 'No modifications required', kz: 'Kosymsha beimdeu kerek emes' } }
      ]
    },
    {
      id: 'p-h9-filter-kit',
      slug: 'service-filter-kit-h9',
      name: { ru: 'Комплект фильтров для ТО Hongqi H9', en: 'Service filter kit for Hongqi H9', kz: 'Hongqi H9 TO suzgiler zhiintygy' },
      categorySlug: 'engine',
      subcategorySlug: 'filters',
      article: 'HQ-EN-H9-210',
      oem: '1017100A1-HQ',
      manufacturer: 'FAW OEM',
      price: 63500,
      stock: 8,
      images: [
        'https://images.unsplash.com/photo-1632823471565-1ecdf5c76e9d?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
      ],
      models: ['H9'],
      kaspiUrl: 'https://kaspi.kz/',
      popular: true,
      description: { ru: 'Набор для планового ТО: масляный, воздушный и салонный фильтр.', en: 'Scheduled service kit: oil, air, and cabin filter.', kz: 'Zhosparly TO zhiintygy: mai, aua zhane salon suzgisi.' },
      seoText: { ru: 'Удобно заказывать комплектом для регламентного обслуживания.', en: 'Convenient one-shot purchase for scheduled maintenance.', kz: 'Reglamenttik kyzmet korsetuge ьңғайлы zhiyn retinde tapsyrys beruge bolady.' },
      specs: [
        { id: 'set', label: { ru: 'Состав', en: 'Contents', kz: 'Kuramy' }, value: { ru: '3 фильтра', en: '3 filters', kz: '3 suzgi' } },
        { id: 'interval', label: { ru: 'Интервал', en: 'Interval', kz: 'Interval' }, value: { ru: '10 000 км', en: '10,000 km', kz: '10 000 km' } }
      ],
      compatibility: [
        { modelCode: 'H9', year: '2022-2026', engine: '2.0T', note: { ru: 'Для рестайлинга и дорестайлинга', en: 'For facelift and pre-facelift', kz: 'Restailing zhane dorestailing ushin' } }
      ]
    },
    {
      id: 'p-ehs9-headlight',
      slug: 'left-led-headlight-e-hs9',
      name: { ru: 'Левая LED фара E-HS9', en: 'Left LED headlight E-HS9', kz: 'E-HS9 sol zhak LED farasy' },
      categorySlug: 'body',
      subcategorySlug: 'headlights',
      article: 'HQ-BD-EHS9-044',
      oem: '4121100XJZ08A',
      manufacturer: 'Hongqi Genuine Parts',
      price: 289000,
      stock: 2,
      images: [
        'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'
      ],
      models: ['E-HS9'],
      kaspiUrl: 'https://kaspi.kz/',
      description: { ru: 'Оригинальная левая матричная фара для E-HS9.', en: 'Genuine left matrix headlight for E-HS9.', kz: 'E-HS9 ushin tupnuska sol zhak matricalyk fara.' },
      seoText: { ru: 'Поддерживает штатные блоки и автокорректор.', en: 'Supports OEM modules and auto leveling.', kz: 'Standartty bloktar men avtotuzetkishpen zhumys isteidi.' },
      specs: [
        { id: 'type', label: { ru: 'Тип', en: 'Type', kz: 'Turi' }, value: { ru: 'Матричная LED', en: 'Matrix LED', kz: 'Matricalyk LED' } }
      ],
      compatibility: [
        { modelCode: 'E-HS9', year: '2021-2026', engine: 'EV', note: { ru: 'Требуется кодирование после установки', en: 'Coding required after installation', kz: 'Ornatudan keiin kodtau kerek' } }
      ]
    },
    {
      id: 'p-h5-arm-front',
      slug: 'front-control-arm-h5',
      name: { ru: 'Передний рычаг подвески H5', en: 'Front control arm H5', kz: 'H5 aldyngy aspa iintirigi' },
      categorySlug: 'suspension',
      subcategorySlug: 'control-arms',
      article: 'HQ-SU-H5-019',
      oem: '2904100A5Q',
      manufacturer: 'Hongqi Genuine Parts',
      price: 72900,
      stock: 5,
      images: [
        'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80'
      ],
      models: ['H5', 'H6'],
      popular: true,
      description: { ru: 'Рычаг передней подвески в сборе.', en: 'Complete front control arm assembly.', kz: 'Aldyngy aspa iintirigi zhinaktalgan turde.' },
      seoText: { ru: 'Ускоряет ремонт подвески без подбора отдельных втулок.', en: 'Speeds up repairs without sourcing separate bushings.', kz: 'Bolek vtulkalardy izdeusiz zhondeudi zhyldamatady.' },
      specs: [
        { id: 'position', label: { ru: 'Расположение', en: 'Position', kz: 'Ornalasuy' }, value: { ru: 'Передняя ось', en: 'Front axle', kz: 'Aldyngy os' } }
      ],
      compatibility: [
        { modelCode: 'H5', year: '2022-2026', engine: '1.5T / 2.0T', note: { ru: 'Уточнить VIN', en: 'Confirm by VIN', kz: 'VIN arkyly naktylau kerek' } }
      ]
    }
  ],
  stores: [
    { id: 'store-almaty', city: 'Almaty', name: { ru: 'Магазин Алматы', en: 'Almaty store', kz: 'Almaty dukeni' }, address: { ru: 'Алматы, пр. Рыскулова 72Б', en: '72B Ryskulov Ave, Almaty', kz: 'Almaty, Ryskulov dangyly 72B' }, phone: '+7 (775) 381-38-39', hours: { ru: 'Пн-Сб 10:00-19:00', en: 'Mon-Sat 10:00-19:00', kz: 'Ds-Sb 10:00-19:00' } },
    { id: 'store-astana', city: 'Astana', name: { ru: 'Магазин Астана', en: 'Astana store', kz: 'Astana dukeni' }, address: { ru: 'Астана, ул. Сыганак 11', en: '11 Syganak St, Astana', kz: 'Astana, Syganak 11' }, phone: '+7 (701) 000-11-22', hours: { ru: 'Пн-Пт 09:00-18:00', en: 'Mon-Fri 09:00-18:00', kz: 'Ds-Zhm 09:00-18:00' } }
  ],
  reviews: [
    { id: 'r-1', name: 'Азамат', rating: 5, text: { ru: 'Подобрали редкую фару на E-HS9 и отправили в Астану за два дня.', en: 'They sourced a rare E-HS9 headlight and shipped it to Astana in two days.', kz: 'Сирек фараны тауып, Астанаға екі күнде жіберді.' } },
    { id: 'r-2', name: 'Madi', rating: 5, text: { ru: 'Удобный поиск по OEM, сразу видно остаток.', en: 'The OEM search is convenient and stock is visible immediately.', kz: 'OEM бойынша іздеу ыңғайлы, қалдық бірден көрінеді.' } },
    { id: 'r-3', name: 'Айгерим', rating: 4, text: { ru: 'Менеджер быстро подтвердил заказ и помог с доставкой.', en: 'The manager confirmed the order quickly and helped with delivery.', kz: 'Менеджер тапсырысты тез растап, жеткізуге көмектесті.' } }
  ],
  requests: [],
  orders: [],
  inventoryMovements: [],
  seoPages: [
    { id: 'seo-shop-home', slug: '/hongqi-parts', title: { ru: 'Каталог запчастей Hongqi', en: 'Hongqi parts catalog', kz: 'Hongqi bolshekter katalogy' }, description: { ru: 'Каталог запчастей Hongqi с фильтрами по моделям и OEM.', en: 'Hongqi parts catalog with model and OEM filters.', kz: 'Model men OEM boiynsha suzgi bar Hongqi bolshekter katalogy.' }, h1: { ru: 'Каталог запчастей Hongqi', en: 'Hongqi parts catalog', kz: 'Hongqi bolshekter katalogy' } }
  ]
};
