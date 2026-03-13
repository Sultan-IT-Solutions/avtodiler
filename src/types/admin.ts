export type LocaleText = {
  ru: string;
  kz: string;
  en: string;
};

export interface CarMake {
  id: string;
  slug: string;
  name: LocaleText;
}

export interface CarModel {
  id: string;
  makeId: string;
  name: LocaleText;
  code: string;
  yearStart?: number;
  yearEnd?: number;
}

export interface AdminCar {
  id: string;
  brand: string;
  makeId: string;
  model: string;
  modelId?: string;
  modelDisplay?: string;
  title: LocaleText;
  year: number;
  price: number;
  availability: string;
  mileage: number;
  featured: boolean;
  images: string[];
  image360?: string[];
  specifications: {
    engine: string;
    power: string;
    acceleration: string;
    topSpeed: string;
    transmission: string;
    drivetrain: string;
    fuelType: string;
    consumption: string;
    seats: number;
  };
  colors: {
    name: string;
    hex: string;
    image?: string;
  }[];
  interiors: {
    name: string;
    description: string;
    image?: string;
  }[];
  wheels: {
    name: string;
    size: string;
    image?: string;
  }[];
  description: LocaleText;
}

export interface BrandItem {
  id: string;
  name: LocaleText;
  logoUrl: string;
  website?: string;
}

export interface ServiceItem {
  id: string;
  title: LocaleText;
  description: LocaleText;
  price?: string;
}

export interface OfferItem {
  id: string;
  title: LocaleText;
  description: LocaleText;
  badge: LocaleText;
  validUntil: string;
  image: string;
}

export interface DealerItem {
  id: string;
  name: LocaleText;
  address: LocaleText;
  phone: string;
  hours: string;
  lat?: number;
  lng?: number;
  services: string[];
}

export type LeadType = 'test-drive' | 'service' | 'contact' | 'callback';

export interface LeadItem {
  id: string;
  type: LeadType;
  name: string;
  phone: string;
  car?: string;
  service?: string;
  dealer?: string;
  comment?: string;
  createdAt: string;
}

export interface PageContentItem {
  id: string;
  slug: string;
  title: LocaleText;
  heroTitle: LocaleText;
  heroSubtitle: LocaleText;
  body: LocaleText;
}

export interface SeoItem {
  id: string;
  slug: string;
  title: LocaleText;
  description: LocaleText;
  keywords: LocaleText;
  image?: string;
  favicon?: string;
}

export interface AdminData {
  cars: AdminCar[];
  services: ServiceItem[];
  offers: OfferItem[];
  dealers: DealerItem[];
  leads: LeadItem[];
  seo: SeoItem[];
  shop: null;
}

export type AdminSectionKey = keyof AdminData;
