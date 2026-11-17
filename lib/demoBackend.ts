import {
  BUILTIN_CATEGORY_IDS,
  BUILTIN_CATEGORY_LIST,
  Category,
  DEFAULT_ROOM_SCENE,
  generateOrderNumber,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  RoomScene,
  sortByPosition,
  STARTER_PRODUCTS,
} from './catalog';
import { generateHistoricalOrders } from './generate';
import { useSyncExternalStore, useState, useEffect } from 'react';

export interface User {
  uid: string;
  name: string;
  email: string;
}

const KEYS = {
  users: 'kvist:users',
  session: 'kvist:session',
  orders: 'kvist:orders',
  status: 'kvist:status',
  products: 'kvist:products',
  categories: 'kvist:categories',
  roomScene: 'kvist:roomScene',
};

const DEMO_ADMIN: User = {
  uid: 'demo-admin',
  name: 'Demo Admin',
  email: 'demo@kvist.store',
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) ?? fallback) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function writeJsonStrict(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw makeError('storage/quota-exceeded');
  }
}

async function hashPassword(pw: string): Promise<string> {
  const bytes = new TextEncoder().encode(`kvist:${pw}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const makeError = (code: string) => Object.assign(new Error(code), { code });

const channel =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('kvist')
    : null;

type AuthListener = (state: { user: User | null; role: 'admin' | null }) => void;
type OrderListener = { uid?: string; onData: (orders: Order[]) => void };
type ProductListener = { includeDrafts: boolean; onData: (products: Product[]) => void };
type CategoryListener = (categories: Category[]) => void;
type RoomSceneListener = (scene: RoomScene) => void;

const authListeners = new Set<AuthListener>();
const orderListeners = new Set<OrderListener>();
const productListeners = new Set<ProductListener>();
const categoryListeners = new Set<CategoryListener>();
const roomSceneListeners = new Set<RoomSceneListener>();

let historicalOrdersCache: Order[] | null = null;
function getHistoricalOrders(): Order[] {
  if (!historicalOrdersCache) {
    historicalOrdersCache = generateHistoricalOrders();
  }
  return historicalOrdersCache;
}

function currentUser(): User | null {
  const uid = readJson<string | null>(KEYS.session, null);
  if (!uid) return null;
  if (uid === DEMO_ADMIN.uid) return DEMO_ADMIN;
  const users = readJson<Record<string, User & { hash: string }>>(KEYS.users, {});
  const found = Object.values(users).find((u) => u.uid === uid);
  return found ? { uid: found.uid, name: found.name, email: found.email } : null;
}

function notifyAuth() {
  const user = currentUser();
  const payload = { user, role: user ? ('admin' as const) : null };
  authListeners.forEach((fn) => fn(payload));
}

function readAllOrders(): Order[] {
  const statusMap = readJson<Record<string, OrderStatus>>(KEYS.status, {});
  const localOrders = readJson<Order[]>(KEYS.orders, []);
  return [...localOrders, ...getHistoricalOrders()]
    .map((o) => (statusMap[o.id] ? { ...o, status: statusMap[o.id] } : o))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function notifyOrders() {
  const all = readAllOrders();
  orderListeners.forEach(({ uid, onData }) => {
    onData(uid ? all.filter((o) => o.uid === uid) : all);
  });
}

function readProducts(): Product[] {
  return readJson<Product[] | null>(KEYS.products, null) ?? STARTER_PRODUCTS;
}

function notifyProducts() {
  const all = readProducts();
  productListeners.forEach(({ includeDrafts, onData }) => {
    onData(includeDrafts ? all : all.filter((p) => p.status === 'active'));
  });
}

function saveProducts(next: Product[]) {
  writeJsonStrict(KEYS.products, next);
  notifyProducts();
  channel?.postMessage('products');
}

function readCustomCategories(): Category[] {
  return readJson<Category[]>(KEYS.categories, []);
}

function notifyCategories() {
  const cats = readCustomCategories();
  categoryListeners.forEach((fn) => fn(cats));
}

function readRoomScene(): RoomScene {
  return readJson<RoomScene | null>(KEYS.roomScene, null) ?? DEFAULT_ROOM_SCENE;
}

function notifyRoomScene() {
  const scene = readRoomScene();
  roomSceneListeners.forEach((fn) => fn(scene));
}

function requireAuth() {
  // Showroom catalog studio is open without customer/user accounts
}

channel?.addEventListener('message', (e) => {
  if (e.data === 'orders') notifyOrders();
  if (e.data === 'auth') notifyAuth();
  if (e.data === 'products') notifyProducts();
  if (e.data === 'categories') notifyCategories();
  if (e.data === 'roomScene') notifyRoomScene();
});

async function resizeImageFile(file: File, maxDim = 800, quality = 0.82): Promise<string> {
  if (!file.type.startsWith('image/')) throw makeError('invalid-image');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw makeError('canvas-error');
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL('image/webp', quality);
}

export const demoBackend = {
  mode: 'demo' as const,

  onAuthChange(cb: AuthListener) {
    authListeners.add(cb);
    queueMicrotask(() => {
      const user = currentUser();
      cb({ user, role: user ? 'admin' : null });
    });
    return () => {
      authListeners.delete(cb);
    };
  },

  async signIn(email: string, password: string) {
    await sleep(650);
    const users = readJson<Record<string, User & { hash: string }>>(KEYS.users, {});
    const record = users[email.trim().toLowerCase()];
    if (!record || record.hash !== (await hashPassword(password))) {
      throw makeError('auth/invalid-credential');
    }
    writeJson(KEYS.session, record.uid);
    notifyAuth();
    channel?.postMessage('auth');
  },

  async signUp({ name, email, password }: { name: string; email: string; password: string }) {
    await sleep(750);
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw makeError('auth/invalid-email');
    if (password.length < 6) throw makeError('auth/weak-password');
    const users = readJson<Record<string, User & { hash: string }>>(KEYS.users, {});
    if (users[cleanEmail]) throw makeError('auth/email-already-in-use');
    const uid = `u_${crypto.randomUUID().slice(0, 12)}`;
    users[cleanEmail] = {
      uid,
      name: name.trim(),
      email: cleanEmail,
      hash: await hashPassword(password),
    };
    writeJson(KEYS.users, users);
    writeJson(KEYS.session, uid);
    notifyAuth();
    channel?.postMessage('auth');
  },

  async signInWithGoogle() {
    return this.demoSignIn();
  },

  async demoSignIn() {
    await sleep(450);
    writeJson(KEYS.session, DEMO_ADMIN.uid);
    notifyAuth();
    channel?.postMessage('auth');
  },

  async signOut() {
    writeJson(KEYS.session, null);
    notifyAuth();
    channel?.postMessage('auth');
  },

  async placeOrder({
    user,
    items,
    total,
    shipping,
  }: {
    user: User | null;
    items: OrderItem[];
    total: number;
    shipping: {
      name: string;
      address: string;
      city: string;
      delivery: string;
      payment: string;
    };
  }): Promise<Order> {
    await sleep(900);
    const order: Order = {
      id: `ord_${Date.now().toString(36)}`,
      number: generateOrderNumber(),
      uid: user?.uid ?? null,
      customer: shipping.name.trim(),
      email: user?.email ?? 'guest@example.com',
      address: shipping.address.trim(),
      city: shipping.city,
      delivery: shipping.delivery,
      payment: shipping.payment,
      items,
      itemCount: items.reduce((s, i) => s + i.qty, 0),
      total,
      status: 'paid',
      createdAt: Date.now(),
    };
    writeJson(KEYS.orders, [order, ...readJson<Order[]>(KEYS.orders, [])]);
    notifyOrders();
    channel?.postMessage('orders');
    return order;
  },

  subscribeOrders({ uid }: { uid?: string } = {}, onData: (orders: Order[]) => void) {
    const entry: OrderListener = { uid, onData };
    orderListeners.add(entry);
    queueMicrotask(() => {
      const all = readAllOrders();
      onData(uid ? all.filter((o) => o.uid === uid) : all);
    });
    return () => {
      orderListeners.delete(entry);
    };
  },

  async subscribe(email: string) {
    await sleep(600);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) throw makeError('auth/invalid-email');
    const existing = readJson<string[]>('kvist:subscribers', []);
    writeJson('kvist:subscribers', [...new Set([...existing, email.trim().toLowerCase()])]);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const statusMap = readJson<Record<string, OrderStatus>>(KEYS.status, {});
    writeJson(KEYS.status, { ...statusMap, [orderId]: status });
    notifyOrders();
    channel?.postMessage('orders');
  },

  subscribeProducts(
    { includeDrafts = false }: { includeDrafts?: boolean } = {},
    onData: (products: Product[]) => void
  ) {
    const entry: ProductListener = { includeDrafts, onData };
    productListeners.add(entry);
    queueMicrotask(() => {
      const all = readProducts();
      onData(includeDrafts ? all : all.filter((p) => p.status === 'active'));
    });
    return () => {
      productListeners.delete(entry);
    };
  },

  async createProduct(product: Product) {
    requireAuth();
    await sleep(450);
    const all = readProducts();
    if (all.some((p) => p.id === product.id)) throw makeError('product/exists');
    saveProducts([...all, { ...product, updatedAt: Date.now() }]);

    // Sync to Sanity platform via API route if configured
    try {
      fetch('/api/sanity/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      }).catch(() => {});
    } catch {
      // non-fatal
    }
  },

  async updateProduct(id: string, patch: Partial<Product>) {
    requireAuth();
    await sleep(450);
    const all = readProducts();
    if (!all.some((p) => p.id === id)) throw makeError('not-found');
    const updated = all.map((p) =>
      p.id === id ? { ...p, ...patch, id, updatedAt: Date.now() } : p
    );
    saveProducts(updated);

    const target = updated.find((p) => p.id === id);
    if (target) {
      try {
        fetch('/api/sanity/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: target }),
        }).catch(() => {});
      } catch {
        // non-fatal
      }
    }
  },

  async deleteProduct(id: string) {
    requireAuth();
    await sleep(350);
    saveProducts(readProducts().filter((p) => p.id !== id));

    // Delete in Sanity platform via API route if configured
    try {
      fetch(`/api/sanity/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {
      // non-fatal
    }
  },

  async syncFromSanity(): Promise<{ count: number; source: 'sanity' | 'local' }> {
    try {
      const res = await fetch('/api/sanity/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.configured && Array.isArray(data.categories)) {
          const customSanityCats = data.categories.filter(
            (c: Category) => c?.id && !BUILTIN_CATEGORY_IDS.includes(c.id)
          );
          if (customSanityCats.length > 0) {
            writeJson(KEYS.categories, customSanityCats);
            notifyCategories();
            channel?.postMessage('categories');
          }
        }
        if (data.configured && Array.isArray(data.products) && data.products.length > 0) {
          saveProducts(data.products);
          return { count: data.products.length, source: 'sanity' };
        }
      }
    } catch {
      // non-fatal fallback
    }
    return { count: readProducts().length, source: 'local' };
  },

  async importStarterCatalog() {
    requireAuth();
    await sleep(450);
    const existingIds = new Set(readProducts().map((p) => p.id));
    saveProducts([...readProducts(), ...STARTER_PRODUCTS.filter((p) => !existingIds.has(p.id))]);
  },

  subscribeCategories(onData: CategoryListener) {
    categoryListeners.add(onData);
    queueMicrotask(() => onData(readCustomCategories()));
    return () => {
      categoryListeners.delete(onData);
    };
  },

  async createCategory(cat: { id: string; name: string; position: number }) {
    requireAuth();
    await sleep(300);
    const custom = readCustomCategories();
    if (BUILTIN_CATEGORY_IDS.includes(cat.id) || custom.some((c) => c.id === cat.id)) {
      throw makeError('category/exists');
    }
    writeJsonStrict(KEYS.categories, [
      ...custom,
      { ...cat, builtIn: false, updatedAt: Date.now() },
    ]);
    notifyCategories();
    channel?.postMessage('categories');
  },

  async renameCategory(id: string, name: string) {
    requireAuth();
    await sleep(300);
    const custom = readCustomCategories();
    if (!custom.some((c) => c.id === id)) throw makeError('not-found');
    writeJsonStrict(
      KEYS.categories,
      custom.map((c) => (c.id === id ? { ...c, name, updatedAt: Date.now() } : c))
    );
    notifyCategories();
    channel?.postMessage('categories');
  },

  async deleteCategory(id: string, moveToCategoryId: string | null) {
    requireAuth();
    await sleep(400);
    if (BUILTIN_CATEGORY_IDS.includes(id)) throw makeError('permission-denied');
    const products = readProducts();
    if (products.some((p) => p.category === id)) {
      if (!moveToCategoryId || moveToCategoryId === id) throw makeError('category/in-use');
      saveProducts(
        products.map((p) =>
          p.category === id ? { ...p, category: moveToCategoryId, updatedAt: Date.now() } : p
        )
      );
    }
    writeJsonStrict(
      KEYS.categories,
      readCustomCategories().filter((c) => c.id !== id)
    );
    notifyCategories();
    channel?.postMessage('categories');
  },

  async uploadDataUrlToSanity(dataUrl: string, filename: string): Promise<string> {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
    try {
      const res = await fetch('/api/sanity/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.asset?.url) {
          return json.asset.url as string;
        }
      }
    } catch {
      // Fall back cleanly to compressed data URL when Sanity token isn't configured
    }
    return dataUrl;
  },

  async uploadProductImage(file: File): Promise<string> {
    requireAuth();
    const compressed = await resizeImageFile(file, 960, 0.82);
    const baseName = file.name.replace(/\.[^.]+$/, '') || `product-${Date.now()}`;
    return this.uploadDataUrlToSanity(compressed, `${baseName}.webp`);
  },

  async upload360Frame(file: File): Promise<string> {
    requireAuth();
    const compressed = await resizeImageFile(file, 720, 0.74);
    const baseName = file.name.replace(/\.[^.]+$/, '') || `frame-360-${Date.now()}`;
    return this.uploadDataUrlToSanity(compressed, `${baseName}.webp`);
  },

  async uploadRoomSceneImage(file: File): Promise<string> {
    requireAuth();
    const compressed = await resizeImageFile(file, 1440, 0.82);
    const baseName = file.name.replace(/\.[^.]+$/, '') || `room-scene-${Date.now()}`;
    return this.uploadDataUrlToSanity(compressed, `${baseName}.webp`);
  },

  subscribeRoomScene(onData: RoomSceneListener) {
    roomSceneListeners.add(onData);
    queueMicrotask(() => onData(readRoomScene()));
    return () => {
      roomSceneListeners.delete(onData);
    };
  },

  async saveRoomScene(scene: RoomScene) {
    requireAuth();
    await sleep(250);
    const next: RoomScene = {
      ...scene,
      updatedAt: Date.now(),
    };
    writeJsonStrict(KEYS.roomScene, next);
    notifyRoomScene();
    channel?.postMessage('roomScene');

    try {
      fetch('/api/sanity/room-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomScene: next }),
      }).catch(() => {});
    } catch {
      // non-fatal
    }
  },

  async resetRoomScene() {
    requireAuth();
    writeJsonStrict(KEYS.roomScene, DEFAULT_ROOM_SCENE);
    notifyRoomScene();
    channel?.postMessage('roomScene');
  },

  async syncRoomSceneFromSanity(): Promise<RoomScene | null> {
    try {
      const res = await fetch('/api/sanity/room-scene', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.configured && data.roomScene) {
          writeJson(KEYS.roomScene, data.roomScene);
          notifyRoomScene();
          channel?.postMessage('roomScene');
          return data.roomScene;
        }
      }
    } catch {
      // non-fatal fallback
    }
    return null;
  },
};

// External store hooks
function createExternalStore<TRaw, TState>(
  buildState: (items: TRaw[], loaded: boolean) => TState,
  initialItems: TRaw[],
  subscribeFn: (onData: (items: TRaw[]) => void) => () => void
) {
  let state = buildState(initialItems, false);
  const listeners = new Set<() => void>();
  let teardown: (() => void) | null = null;

  const setState = (next: TState) => {
    state = next;
    listeners.forEach((l) => l());
  };

  const start = () => {
    const unsub = subscribeFn((items) => {
      setState(buildState(items, true));
    });
    teardown = () => {
      unsub();
      teardown = null;
    };
  };

  return {
    subscribe(l: () => void) {
      listeners.add(l);
      if (!teardown && typeof window !== 'undefined') start();
      return () => {
        listeners.delete(l);
        if (listeners.size === 0) teardown?.();
      };
    },
    get: () => state,
  };
}

function buildProductsState(items: Product[], loaded: boolean) {
  const sorted = sortByPosition(items);
  return {
    products: sorted,
    byId: Object.fromEntries(sorted.map((p) => [p.id, p])),
    loaded,
    error: null as { code?: string; message: string } | null,
  };
}

const activeProductsStore = createExternalStore(
  buildProductsState,
  STARTER_PRODUCTS,
  (onData) => demoBackend.subscribeProducts({ includeDrafts: false }, onData)
);

const allProductsStore = createExternalStore(
  buildProductsState,
  STARTER_PRODUCTS,
  (onData) => demoBackend.subscribeProducts({ includeDrafts: true }, onData)
);

function buildCategoriesState(custom: Category[], loaded: boolean) {
  const all: Category[] = [
    ...BUILTIN_CATEGORY_LIST,
    ...sortByPosition(custom).map((c) => ({ ...c, builtIn: false })),
  ];
  return {
    categories: all,
    byId: Object.fromEntries(all.map((c) => [c.id, c])),
    loaded,
    error: null as { code?: string; message: string } | null,
  };
}

const categoriesStore = createExternalStore(buildCategoriesState, [], (onData) =>
  demoBackend.subscribeCategories(onData)
);

export function useStoreProducts() {
  return useSyncExternalStore(
    activeProductsStore.subscribe,
    activeProductsStore.get,
    activeProductsStore.get
  );
}

export function useAllProducts() {
  return useSyncExternalStore(
    allProductsStore.subscribe,
    allProductsStore.get,
    allProductsStore.get
  );
}

export function useCategories() {
  return useSyncExternalStore(
    categoriesStore.subscribe,
    categoriesStore.get,
    categoriesStore.get
  );
}

const roomSceneStore = createExternalStore<RoomScene, RoomScene>(
  (items) => items[0] ?? DEFAULT_ROOM_SCENE,
  [DEFAULT_ROOM_SCENE],
  (onData) => demoBackend.subscribeRoomScene((scene) => onData([scene]))
);

export function useRoomScene() {
  return useSyncExternalStore(
    roomSceneStore.subscribe,
    roomSceneStore.get,
    roomSceneStore.get
  );
}

export function useOrders({ uid, enabled = true }: { uid?: string; enabled?: boolean } = {}) {
  const [state, setState] = useState<{
    orders: Order[];
    loading: boolean;
    error: { code?: string; message: string } | null;
  }>({
    orders: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;
    const unsub = demoBackend.subscribeOrders({ uid }, (orders) => {
      setState({ orders, loading: false, error: null });
    });
    return () => unsub();
  }, [uid, enabled]);

  return state;
}
