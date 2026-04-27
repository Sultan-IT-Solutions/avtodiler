import { seedShopState } from '../../../src/data/shopSeed.js';
import type { InventoryMovement, OrderItem, PartRequestItem, ShopState } from '../../../src/types/shop.js';

type Row<T> = {
  id: string;
  data: T;
  updated_at: string;
};

const cloneState = () => JSON.parse(JSON.stringify(seedShopState)) as ShopState;

let memoryState: ShopState | null = null;

const getMemoryState = () => {
  if (!memoryState) {
    memoryState = cloneState();
  }

  return memoryState;
};

const createRows = <T extends { id: string }>(items: T[]): Row<T>[] =>
  items.map((item) => ({
    id: item.id,
    data: item,
    updated_at: new Date().toISOString(),
  }));

export const isShopMemoryMode = () => !process.env.DATABASE_URL?.trim();

export const getPublicShopBootstrapMemory = () => {
  const state = getMemoryState();

  return {
    models: createRows(state.models),
    categories: createRows(state.categories),
    products: createRows(state.products),
    stores: createRows(state.stores),
    reviews: createRows(state.reviews),
    seoPages: createRows(state.seoPages),
  };
};

export const createMemoryRequest = (item: PartRequestItem) => {
  const state = getMemoryState();
  state.requests = [item, ...state.requests];
};

export const createMemoryOrder = (order: OrderItem) => {
  const state = getMemoryState();

  state.orders = [order, ...state.orders];
  state.products = state.products.map((product) => {
    const orderedItem = order.items.find((item) => item.productId === product.id);
    if (!orderedItem) return product;
    return {
      ...product,
      stock: Math.max(0, product.stock - orderedItem.quantity),
    };
  });

  const movements: InventoryMovement[] = order.items.map((item) => ({
    id: `mv-memory-${Math.random().toString(36).slice(2, 10)}`,
    productId: item.productId,
    date: new Date().toISOString(),
    operation: 'expense',
    reason: 'order',
    quantity: item.quantity,
    comment: `Order ${order.id}`,
  }));

  state.inventoryMovements = [...movements, ...state.inventoryMovements];
};
