export type LocaleText = {
  ru: string;
  en: string;
  kz: string;
};

export type OrderStatus = 'new' | 'paid' | 'shipped' | 'completed';
export type PaymentMethod = 'card' | 'kaspi' | 'manager';

export interface HongqiModel {
  id: string;
  code: string;
  slug: string;
  name: LocaleText;
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: LocaleText;
  description: LocaleText;
  subcategories: {
    id: string;
    slug: string;
    name: LocaleText;
  }[];
}

export interface ProductSpec {
  id: string;
  label: LocaleText;
  value: LocaleText;
}

export interface ProductCompatibility {
  modelCode: string;
  year: string;
  engine: string;
  note: LocaleText;
}

export interface ProductItem {
  id: string;
  slug: string;
  name: LocaleText;
  categorySlug: string;
  subcategorySlug: string;
  article: string;
  oem: string;
  manufacturer: string;
  price: number;
  stock: number;
  images: string[];
  models: string[];
  kaspiUrl?: string;
  popular?: boolean;
  description: LocaleText;
  seoText: LocaleText;
  specs: ProductSpec[];
  compatibility: ProductCompatibility[];
}

export interface StoreItem {
  id: string;
  city: string;
  name: LocaleText;
  address: LocaleText;
  phone: string;
  hours: LocaleText;
}

export interface ReviewItem {
  id: string;
  name: string;
  rating: number | null;
  text: LocaleText;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface PartRequestItem {
  id: string;
  name: string;
  phone: string;
  vin: string;
  comment: string;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  date: string;
  operation: 'income' | 'expense';
  reason?: string;
  quantity: number;
  comment: string;
}

export interface OrderItem {
  id: string;
  name: string;
  phone: string;
  city: string;
  comment: string;
  paymentMethod: PaymentMethod;
  bank?: string;
  status: OrderStatus;
  createdAt: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

export interface SeoPage {
  id: string;
  slug: string;
  title: LocaleText;
  description: LocaleText;
  h1: LocaleText;
}

export interface ShopState {
  models: HongqiModel[];
  categories: CategoryItem[];
  products: ProductItem[];
  stores: StoreItem[];
  reviews: ReviewItem[];
  requests: PartRequestItem[];
  orders: OrderItem[];
  inventoryMovements: InventoryMovement[];
  seoPages: SeoPage[];
}
