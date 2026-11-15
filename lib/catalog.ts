export type TintKey = 'sage' | 'butter' | 'sand' | 'blush' | 'sky' | 'stone';

export interface ProductFinish {
  name: string;
  color: string;
  soldOut?: boolean;
  stock?: number;
}

export type ColorSwatchGroup = 'neutral' | 'wood' | 'cool' | 'warm' | 'metal';

export interface ColorSwatchPreset {
  en: string;
  ckb: string;
  ar: string;
  color: string;
  group: ColorSwatchGroup;
}

export const COLOR_SWATCH_LIBRARY: ColorSwatchPreset[] = [
  // Neutrals & Monochromes
  { en: 'Pure White', ckb: 'سپی', ar: 'أبيض ناصع', color: '#ffffff', group: 'neutral' },
  { en: 'Warm Cream', ckb: 'کرێمی گەرم', ar: 'كريمي دافئ', color: '#f6f1e7', group: 'neutral' },
  { en: 'Bouclé Ivory', ckb: 'عاجی بووکلێ', ar: 'عاجي بوكليه', color: '#e9e3d7', group: 'neutral' },
  { en: 'Silver Grey', ckb: 'خۆڵەمێشی زیوی', ar: 'رمادي فضي', color: '#c4c5c7', group: 'neutral' },
  { en: 'Warm Stone', ckb: 'بەردینی گەرم', ar: 'حجري دافئ', color: '#a7a299', group: 'neutral' },
  { en: 'Slate Grey', ckb: 'خۆڵەمێشی تۆخ', ar: 'رمادي أردوازي', color: '#6e7175', group: 'neutral' },
  { en: 'Charcoal', ckb: 'ڕەژوویی تۆخ', ar: 'فحمي داكن', color: '#4a4744', group: 'neutral' },
  { en: 'Matte Black', ckb: 'ڕەشی مات', ar: 'أسود مطفي', color: '#191816', group: 'neutral' },

  // Woods & Leather
  { en: 'Natural Birch', ckb: 'تەختەی کاڵ', ar: 'خشب بتولا طبيعي', color: '#ead8b8', group: 'wood' },
  { en: 'Natural Oak', ckb: 'بەڕووی سروشتی', ar: 'بلوط طبيعي', color: '#d8c4a4', group: 'wood' },
  { en: 'Warm Honey Oak', ckb: 'بەڕووی هەنگوینی', ar: 'بلوط عسلي', color: '#c8955a', group: 'wood' },
  { en: 'Teak Wood', ckb: 'تەختەی تیک', ar: 'خشب تيك', color: '#a66e3c', group: 'wood' },
  { en: 'Smoked Walnut', ckb: 'گوێزی تۆخ', ar: 'جوز مدخن', color: '#6e4a2c', group: 'wood' },
  { en: 'Dark Espresso', ckb: 'قاوەیی تۆخ', ar: 'إسبريسو داكن', color: '#3e2a1e', group: 'wood' },
  { en: 'Cognac Leather', ckb: 'چەرمی کۆنیاک', ar: 'جلد كونياك', color: '#9c4f2b', group: 'wood' },

  // Greens & Blues
  { en: 'Sage Green', ckb: 'سەوزی مەیلەو کاڵ', ar: 'أخضر ميرمية', color: '#879c84', group: 'cool' },
  { en: 'Nordic Moss', ckb: 'سەوزی زەیتوونی', ar: 'أخضر طحلبي', color: '#5f6b4f', group: 'cool' },
  { en: 'Emerald Forest', ckb: 'سەوزی زمروودی', ar: 'أخضر زمردي', color: '#2d5a43', group: 'cool' },
  { en: 'Mint Mist', ckb: 'سەوزی نەعنا', ar: 'نعناعي هادئ', color: '#b7d1c4', group: 'cool' },
  { en: 'Sky Blue', ckb: 'شینی ئاسمانی', ar: 'أزرق سماوي', color: '#8aa8be', group: 'cool' },
  { en: 'Denim Blue', ckb: 'شینی جینز', ar: 'أزرق دينيم', color: '#4a6b8a', group: 'cool' },
  { en: 'Midnight Navy', ckb: 'شینی نیلی تۆخ', ar: 'كحلي داكن', color: '#1e324a', group: 'cool' },
  { en: 'Deep Teal', ckb: 'سەوزەشینی تۆخ', ar: 'تركوازي داكن', color: '#1f5c63', group: 'cool' },

  // Warm, Bold & Accent Colors
  { en: 'Blush Rose', ckb: 'پەمەیی کاڵ', ar: 'وردي ناعم', color: '#dca69c', group: 'warm' },
  { en: 'Terracotta Clay', ckb: 'گڵی سوورباو', ar: 'تيراكوتا طيني', color: '#b9653d', group: 'warm' },
  { en: 'Sunset Rust', ckb: 'پرتەقاڵی ژەنگاوی', ar: 'برتقالي صدئ', color: '#c95736', group: 'warm' },
  { en: 'Crimson Red', ckb: 'سووری گەش', ar: 'أحمر قرمزي', color: '#a82c2c', group: 'warm' },
  { en: 'Deep Burgundy', ckb: 'مارۆنی تۆخ', ar: 'عنابي داكن', color: '#68232d', group: 'warm' },
  { en: 'Soft Lavender', ckb: 'مۆری کاڵ', ar: 'لافندر ناعم', color: '#9d8fb3', group: 'warm' },
  { en: 'Mustard Ochre', ckb: 'زەردی خەردەلی', ar: 'أصفر خردلي', color: '#d49b35', group: 'warm' },
  { en: 'Warm Amber', ckb: 'زەردی عەنبەری', ar: 'كهرماني دافئ', color: '#e0b84c', group: 'warm' },

  // Metallics
  { en: 'Brushed Brass', ckb: 'زێڕی مات (برۆنز)', ar: 'نحاس أصفر مطفي', color: '#c5a25d', group: 'metal' },
  { en: 'Antique Bronze', ckb: 'برۆنزی کۆن', ar: 'برونز عتيق', color: '#7a6345', group: 'metal' },
  { en: 'Rose Copper', ckb: 'مسی سوورباو', ar: 'نحاس وردي', color: '#b87355', group: 'metal' },
  { en: 'Brushed Chrome', ckb: 'کرۆم / ستیل', ar: 'كروم مصقول', color: '#b8bcc2', group: 'metal' },
];

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  tint: TintKey;
  image: string;
  scene?: string | null;
  stock: number;
  badge?: string | null;
  blurb: string;
  finishes: ProductFinish[];
  details: string[];
  dimensions: string;
  care: string;
  status: 'active' | 'draft';
  position: number;
  updatedAt?: number;
  view360Type?: 'auto' | 'chair' | 'table' | 'lamp' | 'vase';
  frames360?: string[];
  material?: string;
  weight?: string;
  warranty?: string;
  leadTime?: string;
  customSpecs?: { label: string; value: string }[];
}

export interface Category {
  id: string;
  name: string;
  tint?: TintKey;
  image?: string;
  builtIn: boolean;
  position?: number;
  updatedAt?: number;
}

export interface RoomHotspot {
  key: string;
  productId: string;
  x: number;
  y: number;
}

export interface RoomScene {
  image: string;
  eyebrow?: string;
  title?: string;
  hotspots: RoomHotspot[];
  updatedAt?: number;
}

export const DEFAULT_ROOM_SCENE: RoomScene = {
  image: '/images/interior.jpg',
  eyebrow: '',
  title: '',
  hotspots: [
    { key: 'spot-1', productId: 'bolle-lounge-chair', x: 28, y: 58 },
    { key: 'spot-2', productId: 'rund-side-table', x: 56, y: 72 },
    { key: 'spot-3', productId: 'moln-pendant', x: 48, y: 22 },
  ],
};

export type OrderStatus = 'paid' | 'packing' | 'shipped' | 'delivered';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  finish?: string | null;
}

export interface Order {
  id: string;
  number: string;
  uid?: string | null;
  customer: string;
  email: string;
  address?: string;
  city: string;
  delivery?: string;
  payment?: string;
  items: OrderItem[];
  itemCount: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
  simulated?: boolean;
}

export const ORDER_STATUSES: OrderStatus[] = ['paid', 'packing', 'shipped', 'delivered'];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  paid: 'Paid',
  packing: 'Packing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

export const ACCOUNT_STATUS_LABELS: Record<OrderStatus, string> = {
  paid: 'Confirmed',
  packing: 'Packing',
  shipped: 'On its way',
  delivered: 'Delivered',
};

export const STATUS_TONES: Record<OrderStatus, string> = {
  paid: 'bg-accent-soft text-accent',
  packing: 'bg-warn-soft text-warn',
  shipped: 'bg-sky text-ink',
  delivered: 'bg-ok-soft text-ok',
};

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: 'packing',
  packing: 'shipped',
  shipped: 'delivered',
};

export const imgPath = (name: string) => `/images/${name}`;

export const TINT_BG: Record<TintKey, string> = {
  sage: 'bg-sage',
  butter: 'bg-butter',
  sand: 'bg-sand',
  blush: 'bg-blush',
  sky: 'bg-sky',
  stone: 'bg-stone',
};

export const TINT_KEYS = Object.keys(TINT_BG) as TintKey[];

export const BUILTIN_CATEGORIES: { id: string; name: string; tint: TintKey; image: string }[] = [
  { id: 'seating', name: 'Sofas & Chairs', tint: 'sage', image: imgPath('chair.webp') },
  { id: 'lighting', name: 'Lamps & Lights', tint: 'butter', image: imgPath('pendant.webp') },
  { id: 'tables', name: 'Tables', tint: 'sand', image: imgPath('table.webp') },
  { id: 'textiles', name: 'Textiles & Cushions', tint: 'blush', image: imgPath('throw.webp') },
  { id: 'ceramics', name: 'Vases & Ceramics', tint: 'sky', image: imgPath('vase.webp') },
];

export const BUILTIN_CATEGORY_LIST: Category[] = BUILTIN_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  tint: c.tint,
  image: c.image,
  builtIn: true,
}));

export const BUILTIN_CATEGORY_IDS = BUILTIN_CATEGORY_LIST.map((c) => c.id);

export const RAW_PRODUCTS: Omit<Product, 'status' | 'position'>[] = [
  {
    id: 'bolle-lounge-chair',
    name: 'Bolle Lounge Chair',
    category: 'seating',
    price: 890,
    rating: 4.9,
    reviews: 312,
    tint: 'sage',
    image: imgPath('chair.webp'),
    scene: imgPath('best-chair.jpg'),
    stock: 42,
    badge: 'Bestseller',
    blurb:
      'A low, rounded lounge chair in heavy wool bouclé on four solid-oak legs. Deep enough to fold your legs under.',
    finishes: [
      { name: 'Oat bouclé', color: '#e9e3d7' },
      { name: 'Moss bouclé', color: '#5f6b4f' },
      { name: 'Clay bouclé', color: '#b97a5b' },
    ],
    details: [
      'Wool-blend bouclé, 780 g/m²',
      'Solid FSC® oak legs, oiled',
      'Removable seat cushion',
      'Arrives fully assembled',
    ],
    dimensions: 'W 82 × D 78 × H 74 cm · Seat height 40 cm',
    care: 'Vacuum weekly with a soft brush. Blot spills, never rub. Re-oil legs once a year.',
  },
  {
    id: 'linne-table-lamp',
    name: 'Linne Table Lamp',
    category: 'lighting',
    price: 189,
    rating: 4.8,
    reviews: 204,
    tint: 'butter',
    image: imgPath('lamp.webp'),
    scene: imgPath('best-lamp.jpg'),
    stock: 36,
    badge: 'New',
    blurb:
      'Hand-pleated linen shade over a turned oak base. Throws a warm, low pool of light for evenings that start early.',
    finishes: [
      { name: 'Natural linen', color: '#efe6d6' },
      { name: 'Sand linen', color: '#d8c4a4' },
    ],
    details: [
      'Pleated linen shade',
      'Turned solid oak base',
      'Dimmable E27, 2700K bulb included',
      '2 m braided cord',
    ],
    dimensions: 'Ø 30 × H 52 cm',
    care: 'Dust the shade with a dry brush. Wipe the base with a damp cloth.',
  },
  {
    id: 'moln-pendant',
    name: 'Moln Pendant',
    category: 'lighting',
    price: 249,
    rating: 4.7,
    reviews: 158,
    tint: 'sky',
    image: imgPath('pendant.webp'),
    scene: imgPath('interior.jpg'),
    stock: 28,
    blurb:
      'A paper-and-rice-fibre cloud that softens any bulb into a glow. Light enough to hang from a single hook.',
    finishes: [
      { name: 'Rice paper', color: '#f3efe6' },
      { name: 'Warm paper', color: '#e8dcc6' },
    ],
    details: [
      'Rice-fibre paper over steel frame',
      'Oak canopy and cord grip',
      'Adjustable 2.5 m drop',
      'E27, max 40 W LED',
    ],
    dimensions: 'Ø 48 × H 40 cm',
    care: 'Keep dry. Dust with a hairdryer on cool.',
  },
  {
    id: 'stubbe-stool',
    name: 'Stubbe Stool',
    category: 'seating',
    price: 210,
    rating: 4.8,
    reviews: 121,
    tint: 'sand',
    image: imgPath('stool.webp'),
    stock: 16,
    blurb:
      'A three-legged milking stool carved from a single oak blank. Side table, plant stand or the extra seat at dinner.',
    finishes: [
      { name: 'Oiled oak', color: '#c8955a' },
      { name: 'Smoked oak', color: '#6e4a2c' },
    ],
    details: [
      'Solid FSC® oak',
      'Hand-shaped seat',
      'Holds 120 kg',
      'Stackable in pairs',
    ],
    dimensions: 'Ø 34 × H 46 cm',
    care: 'Wipe clean. Re-oil every 12 months.',
  },
  {
    id: 'rund-side-table',
    name: 'Rund Side Table',
    category: 'tables',
    price: 640,
    rating: 4.9,
    reviews: 97,
    tint: 'stone',
    image: imgPath('table.webp'),
    scene: imgPath('feature-detail.jpg'),
    stock: 9,
    badge: 'Low stock',
    blurb:
      'A pedestal table turned from laminated oak, with a top that takes coffee, books and the occasional elbow.',
    finishes: [
      { name: 'White oak', color: '#e2cfae' },
      { name: 'Ash grey', color: '#a7a299' },
    ],
    details: [
      'Laminated solid oak',
      'Matte hard-wax oil finish',
      'Felt-lined base',
      'Ships flat, assembles in 5 minutes',
    ],
    dimensions: 'Ø 60 × H 48 cm',
    care: 'Use coasters for hot cups. Refresh the wax twice a year.',
  },
  {
    id: 'vagn-wool-throw',
    name: 'Vagn Wool Throw',
    category: 'textiles',
    price: 129,
    rating: 4.9,
    reviews: 268,
    tint: 'blush',
    image: imgPath('throw.webp'),
    scene: imgPath('best-throw.jpg'),
    stock: 40,
    blurb:
      'Brushed lambswool woven with a single forest stripe and finished with a hand-knotted fringe.',
    finishes: [
      { name: 'Oat / forest', color: '#d9cfbd' },
      { name: 'Stone / ink', color: '#bdb7ad' },
    ],
    details: [
      '100% lambswool',
      'Brushed on both sides',
      'Hand-knotted fringe',
      'Woven in Portugal',
    ],
    dimensions: '130 × 180 cm',
    care: 'Air between uses. Dry clean or hand wash cold.',
  },
  {
    id: 'lera-vase',
    name: 'Lera Vase',
    category: 'ceramics',
    price: 78,
    rating: 4.6,
    reviews: 88,
    tint: 'sky',
    image: imgPath('vase.webp'),
    stock: 30,
    blurb:
      'Thrown on the wheel in speckled stoneware and left unglazed outside, so the clay keeps its texture.',
    finishes: [
      { name: 'Speckled sand', color: '#cbbfa8' },
      { name: 'Charcoal', color: '#4a4744' },
    ],
    details: [
      'Speckled stoneware',
      'Glazed inside, watertight',
      'Each one slightly different',
      'Made in Denmark',
    ],
    dimensions: 'Ø 15 × H 30 cm',
    care: 'Hand wash. Not for the dishwasher.',
  },
  {
    id: 'skal-bowl',
    name: 'Skål Serving Bowl',
    category: 'ceramics',
    price: 56,
    rating: 4.7,
    reviews: 143,
    tint: 'butter',
    image: imgPath('bowl.webp'),
    stock: 44,
    blurb:
      'A wide, low bowl in terracotta with a satin glaze. Salad on Sunday, lemons the rest of the week.',
    finishes: [
      { name: 'Terracotta', color: '#b9653d' },
      { name: 'Bone', color: '#e8e0d0' },
    ],
    details: ['Terracotta with satin glaze', 'Food safe', 'Dishwasher safe', 'Ø 28 cm'],
    dimensions: 'Ø 28 × H 11 cm',
    care: 'Dishwasher safe. Avoid sudden temperature changes.',
  },
  {
    id: 'kudde-cushion',
    name: 'Kudde Linen Cushion',
    category: 'textiles',
    price: 64,
    rating: 4.8,
    reviews: 176,
    tint: 'sage',
    image: imgPath('cushion.webp'),
    stock: 52,
    blurb:
      'Stonewashed Belgian linen over a feather-and-down insert. Soft from day one, softer every wash.',
    finishes: [
      { name: 'Forest', color: '#3f4a36' },
      { name: 'Oat', color: '#ddd3c1' },
      { name: 'Rust', color: '#a65a3a' },
    ],
    details: [
      'Stonewashed Belgian linen',
      'Feather and down insert',
      'Hidden zip',
      '50 × 50 cm',
    ],
    dimensions: '50 × 50 cm',
    care: 'Cover machine washes at 40°C. Tumble dry low.',
  },
];

export const STARTER_PRODUCTS: Product[] = RAW_PRODUCTS.map((p, idx) => ({
  ...p,
  status: 'active',
  position: idx,
  scene: p.scene ?? null,
  badge: p.badge ?? null,
}));

export const PRODUCT_LIMITS = {
  name: 60,
  category: 30,
  badge: 20,
  blurb: 300,
  text: 200,
  price: 100000,
  stock: 100000,
  finishes: 8,
  details: 12,
};

export function generateOrderNumber(): string {
  return `KV-${String(Date.now()).slice(-5)}${Math.floor(Math.random() * 10)}`;
}

export function formatAuthError(err: unknown): string {
  const e = err as { code?: string; message?: string } | null;
  const code = e?.code || e?.message || '';
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(code))
    return 'That email and password don’t match an account.';
  if (/email-already-in-use/.test(code))
    return 'An account with this email already exists. Try signing in.';
  if (/weak-password/.test(code))
    return 'Use at least 6 characters for your password.';
  if (/invalid-email/.test(code))
    return 'That doesn’t look like an email address.';
  if (/too-many-requests/.test(code))
    return 'Too many attempts. Wait a minute and try again.';
  if (/popup-closed/.test(code))
    return 'The Google window was closed before signing in.';
  if (/network/.test(code))
    return 'You seem to be offline. Check your connection.';
  return 'Something went wrong. Please try again.';
}

export function formatCatalogError(err: unknown): string {
  const e = err as { code?: string; message?: string } | null;
  const code = e?.code || e?.message || '';
  if (/product\/exists/.test(code))
    return 'A product with this name already exists. Change the name a little.';
  if (/category\/exists/.test(code)) return 'That category already exists.';
  if (/category\/in-use/.test(code))
    return 'Products still use this category. Pick where they should move.';
  if (/permission-denied|unauthorized/.test(code))
    return 'This account can’t edit products. Ask an owner to make you an admin.';
  if (/not-found/.test(code)) return 'This product was deleted somewhere else.';
  if (/no-bucket/.test(code))
    return 'Image uploads need Cloud Storage. Pick a built-in image or upload locally.';
  if (/quota|resource-exhausted/.test(code))
    return 'Storage is full. Use a smaller image or remove an uploaded one.';
  if (/unavailable|network|offline/.test(code))
    return 'You seem to be offline. Check your connection and try again.';
  return 'That didn’t save. Please try again.';
}

export function sortByPosition<T extends { position?: number; name: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name)
  );
}

export function normalizeCategoryName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  return trimmed.charAt(0).toLocaleUpperCase() + trimmed.slice(1);
}

export function slugifyProduct(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/gi, 'o')
    .replace(/æ/gi, 'ae')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function uniqueProductSlug(name: string, existingIds: string[]): string {
  const set = new Set(existingIds);
  const base = slugifyProduct(name) || 'product';
  let candidate = base;
  for (let i = 2; set.has(candidate); i++) {
    candidate = `${base}-${i}`;
  }
  return candidate;
}

export function validateCategoryName(name: string): string | null {
  if (!name) return 'Name the category.';
  if (name.length > PRODUCT_LIMITS.category)
    return `Keep it under ${PRODUCT_LIMITS.category} characters.`;
  return slugifyProduct(name) ? null : 'Use at least one letter or number.';
}

export function findDuplicateCategory(
  categories: Category[],
  name: string,
  excludeId?: string
): Category | undefined {
  const lower = name.toLocaleLowerCase();
  return categories.find((c) => c.id !== excludeId && c.name.toLocaleLowerCase() === lower);
}

export function categoryLabel(id: string, byId: Record<string, Category>): string {
  return byId[id]?.name ?? id;
}

export interface ProductDraft {
  name: string;
  category: string;
  price: string;
  stock: string;
  status: 'active' | 'draft';
  tint: TintKey;
  image: string;
  scene: string;
  badge: string;
  blurb: string;
  finishes: { key: string; name: string; color: string; soldOut?: boolean; stock?: number }[];
  details: { key: string; text: string }[];
  dimensions: string;
  care: string;
}

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function productToDraft(p?: Product | null): ProductDraft {
  if (p) {
    return {
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      status: p.status,
      tint: p.tint,
      image: p.image,
      scene: p.scene ?? '',
      badge: p.badge ?? '',
      blurb: p.blurb,
      finishes: p.finishes.map((f) => ({ key: uid(), ...f })),
      details: p.details.map((text) => ({ key: uid(), text })),
      dimensions: p.dimensions,
      care: p.care,
    };
  }
  return {
    name: '',
    category: 'seating',
    price: '',
    stock: '20',
    status: 'draft',
    tint: 'sand',
    image: '',
    scene: '',
    badge: '',
    blurb: '',
    finishes: [{ key: uid(), name: '', color: '#d8c4a4' }],
    details: [],
    dimensions: '',
    care: '',
  };
}

export function validateProductDraft(
  draft: ProductDraft,
  categoryIds: string[]
): {
  errors: Record<string, string> | null;
  input: Omit<Product, 'id' | 'position' | 'rating' | 'reviews'> | null;
} {
  const errors: Record<string, string> = {};
  const name = draft.name.trim();
  const priceStr = draft.price.trim().replace(/^\$/, '');
  const stockStr = draft.stock.trim();

  if (!name) errors.name = 'Give the product a name.';
  else if (name.length > PRODUCT_LIMITS.name)
    errors.name = `Keep the name under ${PRODUCT_LIMITS.name} characters.`;

  if (!new Set(categoryIds).has(draft.category)) errors.category = 'Pick a category.';

  if (!/^\d+$/.test(priceStr) || Number(priceStr) < 1)
    errors.price = 'Enter a price in whole dollars, like 129.';
  else if (Number(priceStr) > PRODUCT_LIMITS.price)
    errors.price = `The price can’t be over $${PRODUCT_LIMITS.price.toLocaleString('en-US')}.`;

  if (!/^\d+$/.test(stockStr)) errors.stock = 'Enter a whole number, 0 or more.';
  else if (Number(stockStr) > PRODUCT_LIMITS.stock)
    errors.stock = `Stock can’t be over ${PRODUCT_LIMITS.stock.toLocaleString('en-US')}.`;

  if (!TINT_KEYS.includes(draft.tint)) errors.tint = 'Pick a background.';
  if (!draft.image) errors.image = 'Add a product image.';
  if (draft.badge.trim().length > PRODUCT_LIMITS.badge)
    errors.badge = `Keep the badge under ${PRODUCT_LIMITS.badge} characters.`;

  if (!draft.blurb.trim()) errors.blurb = 'Write a short description.';
  else if (draft.blurb.trim().length > PRODUCT_LIMITS.blurb)
    errors.blurb = `Keep the description under ${PRODUCT_LIMITS.blurb} characters.`;

  if (draft.dimensions.trim().length > PRODUCT_LIMITS.text)
    errors.dimensions = `Keep this under ${PRODUCT_LIMITS.text} characters.`;
  if (draft.care.trim().length > PRODUCT_LIMITS.text)
    errors.care = `Keep this under ${PRODUCT_LIMITS.text} characters.`;
  if (draft.finishes.length === 0) errors.finishes = 'Add at least one finish.';

  const seenFinishes = new Set<string>();
  draft.finishes.forEach((f, idx) => {
    const fn = f.name.trim();
    if (!fn) errors[`finish-${idx}`] = 'Name this finish.';
    else if (fn.length > PRODUCT_LIMITS.text) errors[`finish-${idx}`] = 'That name is too long.';
    else if (seenFinishes.has(fn.toLowerCase()))
      errors[`finish-${idx}`] = 'Two finishes can’t share a name.';
    else if (!/^#[0-9a-f]{6}$/i.test(f.color)) errors[`finish-${idx}`] = 'Pick a colour.';
    seenFinishes.add(fn.toLowerCase());
  });

  draft.details.forEach((d, idx) => {
    if (d.text.trim().length > PRODUCT_LIMITS.text)
      errors[`detail-${idx}`] = 'That line is too long.';
  });

  if (Object.keys(errors).length > 0) {
    return { input: null, errors };
  }

  return {
    errors: null,
    input: {
      name,
      category: draft.category,
      price: Number(priceStr),
      stock: Number(stockStr),
      status: draft.status,
      tint: draft.tint,
      image: draft.image,
      scene: draft.scene || null,
      badge: draft.badge.trim() || null,
      blurb: draft.blurb.trim(),
      finishes: draft.finishes.map((f) => ({
        name: f.name.trim(),
        color: f.color.toLowerCase(),
        ...(typeof f.soldOut === 'boolean' ? { soldOut: f.soldOut } : {}),
        ...(typeof f.stock === 'number' ? { stock: f.stock } : {}),
      })),
      details: draft.details.map((d) => d.text.trim()).filter(Boolean),
      dimensions: draft.dimensions.trim(),
      care: draft.care.trim(),
    },
  };
}

export function isSameDraft(a: ProductDraft, b: ProductDraft): boolean {
  const serialize = (d: ProductDraft) =>
    JSON.stringify({
      ...d,
      finishes: d.finishes.map(({ name, color }) => [name, color]),
      details: d.details.map((x) => x.text),
    });
  return serialize(a) === serialize(b);
}

// Formatting helpers
const usdInt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const usdDec = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const intFmt = new Intl.NumberFormat('en-US');

export const formatPrice = (n: number) => usdInt.format(n);
export const formatDecimalPrice = (n: number) => usdDec.format(n);
export const formatCompactPrice = (n: number) =>
  n >= 10000 ? `$${compactFmt.format(n)}` : usdInt.format(n);
export const formatInt = (n: number) => intFmt.format(Math.round(n));
export const formatDelta = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;

export function timeAgo(ts: number, now = Date.now()): string {
  const sec = Math.max(0, Math.round((now - ts) / 1000));
  if (sec < 10) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return hr < 24 ? `${hr}h ago` : `${Math.floor(hr / 24)}d ago`;
}

export function formatDate(
  ts: number,
  opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
): string {
  return new Date(ts).toLocaleDateString('en-US', opts);
}

export function initials(name = ''): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');
}

// Shared button & input class constants
export const BTN_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none';
export const BTN_PRIMARY = `${BTN_BASE} bg-ink text-canvas hover:bg-[#33312c] h-12 px-6 text-[15px]`;
export const BTN_SECONDARY = `${BTN_BASE} bg-card text-ink ring-1 ring-line hover:ring-ink/30 h-12 px-6 text-[15px]`;
export const TAB_PILL =
  'relative isolate inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors duration-300';
export const INPUT_CLASS =
  'h-12 w-full rounded-2xl bg-canvas px-4 text-[15px] text-ink ring-1 ring-line outline-none transition-[box-shadow,background-color] duration-300 placeholder:text-ink-faint focus:bg-card focus:ring-2 focus:ring-ink';
export const EYEBROW_CLASS = 'eyebrow-label';
