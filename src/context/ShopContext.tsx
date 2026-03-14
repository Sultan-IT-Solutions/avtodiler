import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { seedShopState } from '../data/shopSeed';
import type { CartItem, CategoryItem, HongqiModel, InventoryMovement, OrderItem, PartRequestItem, ProductItem, ReviewItem, SeoPage, ShopState, StoreItem } from '../types/shop';
import { shopAdminApi, shopPublicApi } from '../utils/shopApi';

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const CART_STORAGE_KEY = 'hongqi-parts-cart';
const CART_TTL_MS = 48 * 60 * 60 * 1000;

type CheckoutPayload = {
  name: string;
  phone: string;
  city: string;
  comment: string;
  paymentMethod: OrderItem['paymentMethod'];
  bank?: string;
};

type PartRequestPayload = {
  name: string;
  phone: string;
  vin: string;
  comment: string;
};

type ShopContextValue = {
  state: ShopState;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartNotice: string;
  isLoading: boolean;
  loadError: string;
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  createOrder: (payload: CheckoutPayload) => string;
  submitPartRequest: (payload: PartRequestPayload) => void;
  getProduct: (id: string) => ProductItem | undefined;
  saveProduct: (item: ProductItem) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (item: CategoryItem) => void;
  deleteCategory: (id: string) => void;
  saveModel: (item: HongqiModel) => void;
  deleteModel: (id: string) => void;
  saveStore: (item: StoreItem) => void;
  deleteStore: (id: string) => void;
  saveReview: (item: ReviewItem) => void;
  deleteReview: (id: string) => void;
  saveOrder: (item: OrderItem) => void;
  updateOrderStatus: (orderId: string, status: OrderItem['status']) => void;
  deleteOrder: (orderId: string) => void;
  saveRequest: (item: PartRequestItem) => void;
  deleteRequest: (requestId: string) => void;
  addInventoryMovement: (payload: Omit<InventoryMovement, 'id' | 'date'>) => void;
  saveSeoPage: (item: SeoPage) => void;
  deleteSeoPage: (id: string) => void;
  loadAdminData: () => Promise<void>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export const ShopProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const [state, setState] = useState<ShopState>(seedShopState);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartNotice, setCartNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadPublicData = useCallback(async (cancelled?: () => boolean) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const next = await shopPublicApi.bootstrap();
      if (cancelled?.()) return;
      startTransition(() => {
        setState((current) => ({
          ...current,
          models: next.models,
          categories: next.categories,
          products: next.products,
          stores: next.stores,
          reviews: next.reviews,
          seoPages: next.seoPages,
        }));
      });
    } catch (error) {
      if (cancelled?.()) return;
      setLoadError((error as Error).message);
    } finally {
      if (!cancelled?.()) setIsLoading(false);
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const next = await shopAdminApi.bootstrap();
      startTransition(() => {
        setState({
          models: next.models,
          categories: next.categories,
          products: next.products,
          stores: next.stores,
          reviews: next.reviews,
          requests: next.requests,
          orders: next.orders,
          inventoryMovements: next.inventoryMovements,
          seoPages: next.seoPages,
        });
      });
    } catch (error) {
      setLoadError((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as
        | CartItem[]
        | {
            items?: CartItem[];
            savedAt?: number;
          };
      const items = Array.isArray(parsed) ? parsed : parsed.items ?? [];
      const savedAt = Array.isArray(parsed) ? Date.now() : Number(parsed.savedAt ?? 0);
      if (!savedAt || Date.now() - savedAt > CART_TTL_MS) {
        window.localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }
      if (Array.isArray(items)) {
        setCart(
          items.filter(
            (item): item is CartItem =>
              Boolean(item) &&
              typeof item.productId === 'string' &&
              Number.isFinite(item.quantity) &&
              item.quantity > 0
          )
        );
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        items: cart,
        savedAt: Date.now(),
      })
    );
  }, [cart]);

  useEffect(() => {
    if (!cartNotice) return;
    const timer = window.setTimeout(() => setCartNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [cartNotice]);

  useEffect(() => {
    let cancelled = false;
    const isShopRoute =
      location.pathname === '/' ||
      location.pathname.startsWith('/hongqi-parts') ||
      location.pathname === '/cart' ||
      location.pathname === '/checkout';

    const load = async () => {
      if (!isShopRoute) {
        setIsLoading(false);
        setLoadError('');
        return;
      }

      await loadPublicData(() => cancelled);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [loadPublicData, location.pathname]);

  const productsMap = useMemo(() => new Map(state.products.map((item) => [item.id, item])), [state.products]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (productsMap.get(item.productId)?.price ?? 0) * item.quantity, 0),
    [cart, productsMap]
  );

  const addToCart = (productId: string, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (!existing) return [...current, { productId, quantity }];
      return current.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item);
    });
    setCartNotice('added');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.productId !== productId));
      return;
    }
    setCart((current) => current.map((item) => item.productId === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = (productId: string) => setCart((current) => current.filter((item) => item.productId !== productId));
  const clearCart = () => setCart([]);

  const createOrder = (payload: CheckoutPayload) => {
    const orderId = createId('order');
    const items = cart
      .map((item) => {
        const product = productsMap.get(item.productId);
        return product ? { productId: item.productId, quantity: item.quantity, price: product.price } : null;
      })
      .filter(Boolean) as OrderItem['items'];

    const order: OrderItem = {
      id: orderId,
      ...payload,
      status: payload.paymentMethod === 'card' ? 'paid' : 'new',
      createdAt: new Date().toISOString(),
      total: cartTotal,
      items
    };

    void shopPublicApi.createOrder(order);

    setState((current) => ({
      ...current,
      orders: [order, ...current.orders],
      products: current.products.map((product) => {
        const sold = items.find((item) => item.productId === product.id);
        return sold ? { ...product, stock: Math.max(0, product.stock - sold.quantity) } : product;
      }),
      inventoryMovements: [
        ...items.map((item) => ({
          id: createId('mv'),
          productId: item.productId,
          date: new Date().toISOString(),
          operation: 'expense' as const,
          reason: 'order',
          quantity: item.quantity,
          comment: `Order ${orderId}`
        })),
        ...current.inventoryMovements
      ]
    }));

    clearCart();
    return orderId;
  };

  const submitPartRequest = (payload: PartRequestPayload) => {
    const request = { id: createId('req'), createdAt: new Date().toISOString(), ...payload };
    void shopPublicApi.createRequest(request);
    setState((current) => ({
      ...current,
      requests: [request, ...current.requests]
    }));
  };

  const saveProduct = (item: ProductItem) => {
    void shopAdminApi.upsert('products', item.id, item);
    setState((current) => ({
      ...current,
      products: current.products.some((product) => product.id === item.id)
        ? current.products.map((product) => product.id === item.id ? item : product)
        : [item, ...current.products]
    }));
  };

  const deleteProduct = (id: string) => {
    void shopAdminApi.remove('products', id);
    setState((current) => ({ ...current, products: current.products.filter((product) => product.id !== id) }));
  };

  const saveCategory = (item: CategoryItem) => {
    void shopAdminApi.upsert('categories', item.id, item);
    setState((current) => ({
      ...current,
      categories: current.categories.some((category) => category.id === item.id)
        ? current.categories.map((category) => category.id === item.id ? item : category)
        : [item, ...current.categories]
    }));
  };

  const deleteCategory = (id: string) => {
    void shopAdminApi.remove('categories', id);
    setState((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.id !== id)
    }));
  };

  const saveModel = (item: HongqiModel) => {
    void shopAdminApi.upsert('models', item.id, item);
    setState((current) => ({
      ...current,
      models: current.models.some((model) => model.id === item.id)
        ? current.models.map((model) => model.id === item.id ? item : model)
        : [...current.models, item]
    }));
  };

  const deleteModel = (id: string) => {
    void shopAdminApi.remove('models', id);
    setState((current) => ({
      ...current,
      models: current.models.filter((model) => model.id !== id)
    }));
  };

  const saveStore = (item: StoreItem) => {
    void shopAdminApi.upsert('stores', item.id, item);
    setState((current) => ({
      ...current,
      stores: current.stores.some((store) => store.id === item.id)
        ? current.stores.map((store) => store.id === item.id ? item : store)
        : [...current.stores, item]
    }));
  };

  const deleteStore = (id: string) => {
    void shopAdminApi.remove('stores', id);
    setState((current) => ({
      ...current,
      stores: current.stores.filter((store) => store.id !== id)
    }));
  };

  const saveReview = (item: ReviewItem) => {
    void shopAdminApi.upsert('reviews', item.id, item);
    setState((current) => ({
      ...current,
      reviews: current.reviews.some((review) => review.id === item.id)
        ? current.reviews.map((review) => review.id === item.id ? item : review)
        : [...current.reviews, item]
    }));
  };

  const deleteReview = (id: string) => {
    void shopAdminApi.remove('reviews', id);
    setState((current) => ({
      ...current,
      reviews: current.reviews.filter((review) => review.id !== id)
    }));
  };

  const updateOrderStatus = (orderId: string, status: OrderItem['status']) => {
    setState((current) => {
      const nextOrders = current.orders.map((order) => order.id === orderId ? { ...order, status } : order);
      const updated = nextOrders.find((order) => order.id === orderId);
      if (updated) void shopAdminApi.upsert('orders', updated.id, updated);
      return { ...current, orders: nextOrders };
    });
  };

  const saveOrder = (item: OrderItem) => {
    void shopAdminApi.upsert('orders', item.id, item);
    setState((current) => ({
      ...current,
      orders: current.orders.some((order) => order.id === item.id)
        ? current.orders.map((order) => order.id === item.id ? item : order)
        : [item, ...current.orders]
    }));
  };

  const deleteOrder = (orderId: string) => {
    void shopAdminApi.remove('orders', orderId);
    setState((current) => ({
      ...current,
      orders: current.orders.filter((order) => order.id !== orderId)
    }));
  };

  const saveRequest = (item: PartRequestItem) => {
    void shopAdminApi.upsert('requests', item.id, item);
    setState((current) => ({
      ...current,
      requests: current.requests.some((request) => request.id === item.id)
        ? current.requests.map((request) => request.id === item.id ? item : request)
        : [item, ...current.requests]
    }));
  };

  const deleteRequest = (requestId: string) => {
    void shopAdminApi.remove('requests', requestId);
    setState((current) => ({
      ...current,
      requests: current.requests.filter((request) => request.id !== requestId)
    }));
  };

  const addInventoryMovement = (payload: Omit<InventoryMovement, 'id' | 'date'>) => {
    const movement = { id: createId('mv'), date: new Date().toISOString(), ...payload };
    void shopAdminApi.upsert('inventoryMovements', movement.id, movement);
    setState((current) => {
      const nextProducts = current.products.map((product) => {
        if (product.id !== payload.productId) return product;
        const delta = payload.operation === 'income' ? payload.quantity : -payload.quantity;
        const updated = { ...product, stock: Math.max(0, product.stock + delta) };
        void shopAdminApi.upsert('products', updated.id, updated);
        return updated;
      });
      return {
        ...current,
        products: nextProducts,
        inventoryMovements: [movement, ...current.inventoryMovements]
      };
    });
  };

  const saveSeoPage = (item: SeoPage) => {
    void shopAdminApi.upsert('seoPages', item.id, item);
    setState((current) => ({
      ...current,
      seoPages: current.seoPages.some((page) => page.id === item.id)
        ? current.seoPages.map((page) => page.id === item.id ? item : page)
        : [...current.seoPages, item]
    }));
  };

  const deleteSeoPage = (id: string) => {
    void shopAdminApi.remove('seoPages', id);
    setState((current) => ({
      ...current,
      seoPages: current.seoPages.filter((page) => page.id !== id)
    }));
  };

  const value = useMemo<ShopContextValue>(() => ({
    state,
    cart,
    cartCount,
    cartTotal,
    cartNotice,
    isLoading,
    loadError,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    createOrder,
    submitPartRequest,
    getProduct: (id: string) => productsMap.get(id),
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    saveModel,
    deleteModel,
    saveStore,
    deleteStore,
    saveReview,
    deleteReview,
    saveOrder,
    updateOrderStatus,
    deleteOrder,
    saveRequest,
    deleteRequest,
    addInventoryMovement,
    saveSeoPage,
    deleteSeoPage,
    loadAdminData
  }), [cart, cartCount, cartNotice, cartTotal, isLoading, loadError, productsMap, state]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
