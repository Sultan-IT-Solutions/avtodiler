import * as XLSX from 'xlsx';
import type { CategoryItem, HongqiModel, ProductItem, SeoPage, StoreItem } from '../types/shop';

type SupportedCollection = 'models' | 'categories' | 'products' | 'stores' | 'seoPages';

type ImportPayload = {
  models: HongqiModel[];
  categories: CategoryItem[];
  products: ProductItem[];
  stores: StoreItem[];
  seoPages: SeoPage[];
};

const toText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
};
const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  const next = String(value ?? '').trim().toLowerCase();
  return next === '1' || next === 'true' || next === 'yes';
};

const parseJson = <T,>(value: unknown, fallback: T): T => {
  if (Array.isArray(value) || (value && typeof value === 'object')) return value as T;
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const localeFromRow = (row: Record<string, unknown>, prefix: string) => ({
  ru: toText(row[`${prefix}_ru`]),
  en: toText(row[`${prefix}_en`]),
  kz: toText(row[`${prefix}_kz`]),
});

const getSheetRows = (workbook: XLSX.WorkBook, name: string) => {
  const sheetName = workbook.SheetNames.find((item) => item.toLowerCase() === name.toLowerCase());
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
};

const parseModels = (rows: Record<string, unknown>[]): HongqiModel[] =>
  rows
    .map((row) => {
      if (typeof row.data === 'string' && row.data.trim()) {
        return parseJson<HongqiModel>(row.data, null as never);
      }
      return {
        id: toText(row.id),
        code: toText(row.code),
        slug: toText(row.slug),
        name: localeFromRow(row, 'name'),
      };
    })
    .filter((item): item is HongqiModel => Boolean(item?.id));

const parseCategories = (rows: Record<string, unknown>[]): CategoryItem[] =>
  rows
    .map((row) => {
      if (typeof row.data === 'string' && row.data.trim()) {
        return parseJson<CategoryItem>(row.data, null as never);
      }
      return {
        id: toText(row.id),
        slug: toText(row.slug),
        name: localeFromRow(row, 'name'),
        description: localeFromRow(row, 'description'),
        subcategories: parseJson<CategoryItem['subcategories']>(row.subcategories_json, []),
      };
    })
    .filter((item): item is CategoryItem => Boolean(item?.id));

const parseProducts = (rows: Record<string, unknown>[]): ProductItem[] =>
  rows
    .map((row) => {
      if (typeof row.data === 'string' && row.data.trim()) {
        return parseJson<ProductItem>(row.data, null as never);
      }
      return {
        id: toText(row.id),
        slug: toText(row.slug),
        name: localeFromRow(row, 'name'),
        categorySlug: toText(row.categorySlug),
        subcategorySlug: toText(row.subcategorySlug),
        article: toText(row.article),
        oem: toText(row.oem),
        manufacturer: toText(row.manufacturer),
        price: toNumber(row.price),
        stock: toNumber(row.stock),
        images: parseJson<string[]>(row.images_json, []),
        models: parseJson<string[]>(row.models_json, []),
        kaspiUrl: toText(row.kaspiUrl) || undefined,
        popular: toBoolean(row.popular),
        description: localeFromRow(row, 'description'),
        seoText: localeFromRow(row, 'seoText'),
        specs: parseJson<ProductItem['specs']>(row.specs_json, []),
        compatibility: parseJson<ProductItem['compatibility']>(row.compatibility_json, []),
      };
    })
    .filter((item): item is ProductItem => Boolean(item?.id));

const parseStores = (rows: Record<string, unknown>[]): StoreItem[] =>
  rows
    .map((row) => {
      if (typeof row.data === 'string' && row.data.trim()) {
        return parseJson<StoreItem>(row.data, null as never);
      }
      return {
        id: toText(row.id),
        city: toText(row.city),
        phone: toText(row.phone),
        name: localeFromRow(row, 'name'),
        address: localeFromRow(row, 'address'),
        hours: localeFromRow(row, 'hours'),
      };
    })
    .filter((item): item is StoreItem => Boolean(item?.id));

const parseSeoPages = (rows: Record<string, unknown>[]): SeoPage[] =>
  rows
    .map((row) => {
      if (typeof row.data === 'string' && row.data.trim()) {
        return parseJson<SeoPage>(row.data, null as never);
      }
      return {
        id: toText(row.id),
        slug: toText(row.slug),
        title: localeFromRow(row, 'title'),
        description: localeFromRow(row, 'description'),
        h1: localeFromRow(row, 'h1'),
      };
    })
    .filter((item): item is SeoPage => Boolean(item?.id));

export const parseShopWorkbook = async (file: File): Promise<ImportPayload> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  return {
    models: parseModels(getSheetRows(workbook, 'models')),
    categories: parseCategories(getSheetRows(workbook, 'categories')),
    products: parseProducts(getSheetRows(workbook, 'products')),
    stores: parseStores(getSheetRows(workbook, 'stores')),
    seoPages: parseSeoPages(getSheetRows(workbook, 'seoPages')),
  };
};

export const summarizeImportPayload = (payload: ImportPayload) => {
  const order: SupportedCollection[] = ['models', 'categories', 'products', 'stores', 'seoPages'];
  return order
    .map((key) => ({ key, count: payload[key].length }))
    .filter((item) => item.count > 0);
};
