import { cars as catalogCars } from '../data/cars';
import type {
  AdminCar,
  AdminData,
  DealerItem,
  LeadItem,
  LocaleText,
  OfferItem,
} from '../types/admin';

const STORAGE_KEY = 'luxury_admin_data_v1';

const localeText = (ru: string, en?: string, kz?: string): LocaleText => ({
  ru,
  en: en ?? ru,
  kz: kz ?? ru,
});

const adminCars: AdminCar[] = catalogCars.map((car) => ({
  id: car.id,
  brand: car.brand,
  makeId: 'hongqi',
  modelId: car.model.toLowerCase(),
  model: car.model,
  modelDisplay: car.modelDisplay,
  title: localeText(`${car.brand} ${car.model}`),
  year: car.year,
  price: car.price,
  availability: car.availability ?? 'inStock',
  mileage: car.mileage,
  featured: car.featured,
  images: car.images,
  image360: car.image360,
  specifications: car.specifications,
  colors: car.colors,
  interiors: car.interiors,
  wheels: car.wheels,
  description: localeText(car.description ?? ''),
}));

const offers: OfferItem[] = [
  {
    id: 'offer-1',
    title: localeText('Специальные условия на Hongqi E-HS9', 'Special terms for Hongqi E-HS9', 'Hongqi E-HS9 арнайы шарттары'),
    description: localeText(
      'Электрический флагман по выгодной цене. Трейд-ин программа — скидка до 500 000 ₸.',
      'Flagship EV with trade-in benefits.',
      'Флагманды EV және трейд-ин жеңілдігі.'
    ),
    badge: localeText('Хит', 'Hot', 'Хит'),
    validUntil: '31 марта 2025',
    image: 'https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/19/297/19297/01jaz17hfkatcmvsxywakv7ggd.jpg',
  },
];

const dealers: DealerItem[] = [
  {
    id: 'dealer-1',
    name: localeText('Luxury Auto — Аль-Фараби'),
    address: localeText('ул. Аль-Фараби, 77, Алматы', 'Al-Farabi Ave 77, Almaty', 'Әл-Фараби даңғылы, 77, Алматы'),
    phone: '+7 (700) 123-45-67',
    hours: 'Пн–Сб: 09:00–20:00, Вс: 10:00–17:00',
    lat: 43.222,
    lng: 76.8512,
    services: ['Продажа', 'Сервис', 'Тест-драйв'],
  },
  {
    id: 'dealer-2',
    name: localeText('Luxury Auto — Назарбаева'),
    address: localeText('пр. Назарбаева, 120, Алматы', 'Nazarbayev Ave 120, Almaty', 'Назарбаев даңғылы, 120, Алматы'),
    phone: '+7 (700) 234-56-78',
    hours: 'Пн–Сб: 09:00–20:00, Вс: 10:00–17:00',
    lat: 43.238,
    lng: 76.945,
    services: ['Продажа', 'Тест-драйв'],
  },
];

const defaultAdminData: AdminData = {
  cars: adminCars,
  offers,
  dealers,
  leads: [],
};

const mergeDefaults = (data: Partial<AdminData>): AdminData => ({
  ...defaultAdminData,
  ...data,
  cars: data.cars ?? defaultAdminData.cars,
  offers: data.offers ?? defaultAdminData.offers,
  dealers: data.dealers ?? defaultAdminData.dealers,
  leads: data.leads ?? defaultAdminData.leads,
});

export const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const getAdminData = (): AdminData => {
  if (typeof window === 'undefined') {
    return defaultAdminData;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAdminData;
  try {
    const parsed = JSON.parse(raw) as Partial<AdminData>;
    return mergeDefaults(parsed);
  } catch (error) {
    if (!import.meta.env.PROD) {
      console.warn('Failed to parse admin data', error);
    }
    return defaultAdminData;
  }
};

export const saveAdminData = (data: AdminData) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const updateAdminData = (updater: (data: AdminData) => AdminData) => {
  const current = getAdminData();
  const next = updater(current);
  saveAdminData(next);
  return next;
};

export const appendLead = (lead: LeadItem) =>
  updateAdminData((data) => ({
    ...data,
    leads: [lead, ...data.leads],
  }));
