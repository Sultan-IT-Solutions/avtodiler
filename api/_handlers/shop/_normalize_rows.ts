import type {
  CategoryItem,
  HongqiModel,
  InventoryMovement,
  OrderItem,
  PartRequestItem,
  ProductItem,
  ReviewItem,
  SeoPage,
  StoreItem,
} from '../../../src/types/shop.js';
import { normalizeShopState } from '../../../src/utils/shopNormalization.js';

type DataRow<T> = Record<string, unknown> & {
  data?: T;
};

type ShopRowsPayload = {
  models: DataRow<HongqiModel>[];
  categories: DataRow<CategoryItem>[];
  products: DataRow<ProductItem>[];
  stores: DataRow<StoreItem>[];
  reviews: DataRow<ReviewItem>[];
  requests?: DataRow<PartRequestItem>[];
  orders?: DataRow<OrderItem>[];
  inventoryMovements?: DataRow<InventoryMovement>[];
  seoPages: DataRow<SeoPage>[];
};

const attachNormalizedData = <T,>(rows: DataRow<T>[], items: T[]) =>
  rows.map((row, index) => ({
    ...row,
    data: items[index] ?? row.data,
  })) as typeof rows;

export const normalizeShopRows = <T extends ShopRowsPayload>(rows: T): T => {
  const normalized = normalizeShopState({
    models: rows.models.flatMap((row) => (row.data ? [row.data] : [])),
    categories: rows.categories.flatMap((row) => (row.data ? [row.data] : [])),
    products: rows.products.flatMap((row) => (row.data ? [row.data] : [])),
    stores: rows.stores.flatMap((row) => (row.data ? [row.data] : [])),
    reviews: rows.reviews.flatMap((row) => (row.data ? [row.data] : [])),
    requests: (rows.requests ?? []).flatMap((row) => (row.data ? [row.data] : [])),
    orders: (rows.orders ?? []).flatMap((row) => (row.data ? [row.data] : [])),
    inventoryMovements: (rows.inventoryMovements ?? []).flatMap((row) => (row.data ? [row.data] : [])),
    seoPages: rows.seoPages.flatMap((row) => (row.data ? [row.data] : [])),
  });

  return {
    ...rows,
    models: attachNormalizedData(rows.models, normalized.models),
    categories: attachNormalizedData(rows.categories, normalized.categories),
    products: attachNormalizedData(rows.products, normalized.products),
    stores: attachNormalizedData(rows.stores, normalized.stores),
    reviews: attachNormalizedData(rows.reviews, normalized.reviews),
    requests: rows.requests ? attachNormalizedData(rows.requests, normalized.requests) : rows.requests,
    orders: rows.orders ? attachNormalizedData(rows.orders, normalized.orders) : rows.orders,
    inventoryMovements: rows.inventoryMovements
      ? attachNormalizedData(rows.inventoryMovements, normalized.inventoryMovements)
      : rows.inventoryMovements,
    seoPages: attachNormalizedData(rows.seoPages, normalized.seoPages),
  };
};
