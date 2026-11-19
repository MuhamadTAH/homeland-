import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import {
  Product,
  Category,
  RoomHotspot,
  RoomScene,
  STARTER_PRODUCTS,
  TintKey,
} from './catalog';

const DEFAULT_SANITY_PROJECT_ID = 'yx4kz08m';

// Sanity Environment Configuration
const rawProjectId = (
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  DEFAULT_SANITY_PROJECT_ID
).trim();

const isValidSanityProjectId = (id: string) => /^[a-z0-9-]+$/.test(id);
const projectId = isValidSanityProjectId(rawProjectId) ? rawProjectId : '';

const rawDataset = (
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  'production'
).trim();
const dataset = /^[a-z0-9_-]+$/.test(rawDataset) ? rawDataset : 'production';

const apiVersion = '2024-03-01';
const token = (process.env.SANITY_API_TOKEN || '').trim();

export function isSanityConfigured(): boolean {
  return Boolean(projectId && projectId !== 'demo');
}

export function getSanityConfig() {
  return {
    projectId,
    dataset,
    apiVersion,
    hasToken: Boolean(token),
    invalidProjectId: Boolean(rawProjectId && !projectId),
  };
}

// Client for Read Operations (useCdn: false ensures newly published Sanity products appear immediately)
export const sanityClient = createClient({
  projectId: projectId || DEFAULT_SANITY_PROJECT_ID,
  dataset: dataset || 'production',
  apiVersion,
  token: token || undefined,
  useCdn: false,
  perspective: token ? 'previewDrafts' : 'published',
});

// Client with Write Token for Server Mutations (create, update, delete)
export function getSanityWriteClient() {
  if (!isSanityConfigured() || !token) {
    throw new Error(
      'Sanity write operations require a valid NEXT_PUBLIC_SANITY_PROJECT_ID (lowercase a-z, 0-9, dashes) and SANITY_API_TOKEN.'
    );
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}

// Image URL builder for Sanity image assets
const builder = imageUrlBuilder(sanityClient);
export function urlForSanityImage(source: any) {
  if (!source) return '';
  if (typeof source === 'string') return source;
  try {
    return builder.image(source).auto('format').fit('max').url();
  } catch {
    return source.url || '';
  }
}

// Raw Sanity Document Interface
export interface SanityProductDocument {
  _id: string;
  _type: 'product';
  _createdAt?: string;
  _updatedAt?: string;
  name?: string;
  title?: string;
  slug?: { current: string };
  category?: string | { _ref?: string; slug?: { current: string }; name?: string; title?: string };
  price?: number;
  stock?: number;
  badge?: string | null;
  blurb?: string;
  description?: string;
  tint?: string;
  image?: any;
  imageUrl?: string;
  scene?: any;
  sceneUrl?: string;
  dimensions?: string;
  care?: string;
  status?: 'active' | 'draft';
  position?: number;
  finishes?: Array<{
    name: string;
    color: string;
    soldOut?: boolean;
    stock?: number;
    _key?: string;
  }>;
  details?: string[];
  specifications?: Array<{ label: string; value: string; _key?: string }>;
  material?: string;
  weight?: string;
  warranty?: string;
  leadTime?: string;
  view360Type?: string;
  frames360?: any[];
}

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'sofas-chairs': 'seating',
  'lamps-lights': 'lighting',
  'textiles-cushions': 'textiles',
  'vases-ceramics': 'ceramics',
};

// Convert Sanity Product Document into App Product
export function sanityDocToProduct(doc: SanityProductDocument, orderIndex = 0): Product {
  const id = doc.slug?.current || doc._id.replace(/^product\./, '').replace(/^drafts\./, '');
  const name = doc.name || doc.title || 'Untitled Piece';

  // Category resolving (either string or referenced object)
  let rawCategory = 'seating';
  if (typeof doc.category === 'string' && doc.category.trim()) {
    rawCategory = doc.category.trim();
  } else if (doc.category && typeof doc.category === 'object') {
    rawCategory = doc.category.slug?.current || doc.category.name || doc.category.title || 'seating';
  }
  const category = LEGACY_CATEGORY_MAP[rawCategory] || rawCategory;

  // Finishes
  const finishes = Array.isArray(doc.finishes) && doc.finishes.length > 0
    ? doc.finishes
        .filter(Boolean)
        .map((f) => ({
          name: f.name || 'Standard',
          color: f.color || '#d8c4a4',
          ...(typeof f.soldOut === 'boolean' ? { soldOut: f.soldOut } : {}),
          ...(typeof f.stock === 'number' ? { stock: f.stock } : {}),
        }))
    : [{ name: 'Natural Oak', color: '#d8c4a4' }];

  const resolvedFrames360 = Array.isArray(doc.frames360)
    ? doc.frames360
        .map((item) =>
          typeof item === 'string'
            ? item
            : typeof item?.url === 'string' && item.url.trim()
            ? item.url
            : item?.asset
            ? urlForSanityImage(item)
            : ''
        )
        .filter(Boolean)
    : [];

  let sceneUrl: string | null = null;
  if (typeof doc.sceneUrl === 'string' && doc.sceneUrl.trim()) {
    sceneUrl = doc.sceneUrl;
  } else if (typeof doc.scene === 'string' && doc.scene.trim()) {
    sceneUrl = doc.scene;
  } else if (doc.scene?.asset) {
    sceneUrl = urlForSanityImage(doc.scene);
  }

  // Image resolving (direct GROQ asset->url, Sanity asset reference, string URL, 360 frame fallback, scene fallback, or default)
  let imageUrl = '';
  if (typeof doc.imageUrl === 'string' && doc.imageUrl.trim()) {
    imageUrl = doc.imageUrl;
  } else if (typeof doc.image === 'string' && doc.image.trim()) {
    imageUrl = doc.image;
  } else if (doc.image?.asset) {
    imageUrl = urlForSanityImage(doc.image);
  }
  if (!imageUrl) {
    imageUrl = resolvedFrames360[0] || sceneUrl || '/images/chair.webp';
  }

  const validTints: TintKey[] = ['sage', 'butter', 'sand', 'blush', 'sky', 'stone'];
  const tint: TintKey = validTints.includes(doc.tint as TintKey) ? (doc.tint as TintKey) : 'stone';

  const parsedPrice = Number(doc.price);
  const price = Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : 450;

  const parsedStock = Number(doc.stock);
  const stock = Number.isFinite(parsedStock) && parsedStock >= 0 ? parsedStock : 8;

  return {
    id,
    name,
    category,
    price,
    rating: 5,
    reviews: 14,
    tint,
    image: imageUrl,
    scene: sceneUrl,
    stock,
    badge: doc.badge || null,
    blurb: doc.blurb || doc.description || '',
    finishes,
    details: Array.isArray(doc.details) ? doc.details.filter(Boolean) : [],
    dimensions: doc.dimensions || '80 × 80 × 75 cm',
    care: doc.care || 'Wipe with a soft damp cloth. Condition timber annually.',
    status: doc.status === 'draft' ? 'draft' : 'active',
    position: typeof doc.position === 'number' ? doc.position : orderIndex,
    updatedAt: doc._updatedAt ? new Date(doc._updatedAt).getTime() : Date.now(),
    view360Type: (doc.view360Type as Product['view360Type']) || 'auto',
    frames360: resolvedFrames360.length > 0 ? resolvedFrames360 : undefined,
    material: doc.material || undefined,
    weight: (doc as any).weight || undefined,
    warranty: doc.warranty || undefined,
    leadTime: doc.leadTime || undefined,
    customSpecs: Array.isArray(doc.specifications)
      ? doc.specifications.filter(Boolean).map((s) => ({ label: s.label, value: s.value }))
      : undefined,
  };
}

// Convert App Product into Sanity Document for Creating/Updating
export function productToSanityDoc(product: Product): SanityProductDocument {
  const docId = `product.${product.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  return {
    _id: docId,
    _type: 'product',
    name: product.name,
    title: product.name,
    slug: { current: product.id },
    category: product.category,
    price: product.price,
    stock: product.stock,
    badge: product.badge || null,
    blurb: product.blurb,
    description: product.blurb,
    tint: product.tint,
    image: product.image,
    scene: product.scene || null,
    dimensions: product.dimensions,
    care: product.care,
    status: product.status,
    position: product.position,
    finishes: product.finishes.map((f, idx) => ({
      _key: `finish_${idx}`,
      name: f.name,
      color: f.color,
      ...(typeof f.soldOut === 'boolean' ? { soldOut: f.soldOut } : {}),
      ...(typeof f.stock === 'number' ? { stock: f.stock } : {}),
    })),
    details: product.details,
    view360Type: product.view360Type || 'auto',
    frames360: Array.isArray(product.frames360) && product.frames360.length > 0 ? product.frames360 : undefined,
    material: product.material || '',
    weight: product.weight || '',
    warranty: product.warranty || '',
    leadTime: product.leadTime || '',
    specifications: product.customSpecs?.map((s, idx) => ({
      _key: `spec_${idx}`,
      label: s.label,
      value: s.value,
    })),
  };
}

// GROQ Queries (resolve image asset URLs directly)
const ALL_PRODUCTS_QUERY = `*[_type == "product"] | order(position asc, _createdAt desc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  name,
  title,
  slug,
  category,
  price,
  stock,
  badge,
  blurb,
  description,
  tint,
  image,
  "imageUrl": image.asset->url,
  scene,
  "sceneUrl": scene.asset->url,
  dimensions,
  care,
  status,
  position,
  finishes,
  details,
  view360Type,
  "frames360": frames360[]{ _key, _type, asset, "url": asset->url },
  material,
  weight,
  warranty,
  leadTime,
  specifications
}`;

const ALL_CATEGORIES_QUERY = `*[_type == "category"] | order(position asc, _createdAt asc) {
  _id,
  _type,
  _updatedAt,
  name,
  title,
  slug,
  position
}`;

// Fetch products from Sanity (supports both published and drafts, deduplicating by clean ID)
export async function fetchSanityProducts(): Promise<Product[]> {
  if (!isSanityConfigured()) {
    return [];
  }
  try {
    const client = token ? getSanityWriteClient() : sanityClient;
    const rawDocs = await client.fetch<SanityProductDocument[]>(
      ALL_PRODUCTS_QUERY,
      {},
      { cache: 'no-store' }
    );
    if (!Array.isArray(rawDocs) || rawDocs.length === 0) {
      return [];
    }
    const byCleanId = new Map<string, SanityProductDocument>();
    for (const doc of rawDocs) {
      const cleanId = (doc._id || '').replace(/^drafts\./, '');
      const isDraft = (doc._id || '').startsWith('drafts.');
      const prev = byCleanId.get(cleanId);
      if (!prev || (prev._id.startsWith('drafts.') && !isDraft)) {
        byCleanId.set(cleanId, doc);
      }
    }
    return Array.from(byCleanId.values()).map((doc, idx) => sanityDocToProduct(doc, idx));
  } catch (error) {
    console.warn('Failed to fetch products from Sanity:', error);
    return [];
  }
}

// Fetch custom categories from Sanity
export async function fetchSanityCategories(): Promise<Category[]> {
  if (!isSanityConfigured()) {
    return [];
  }
  try {
    const client = token ? getSanityWriteClient() : sanityClient;
    const rows = await client.fetch<any[]>(
      ALL_CATEGORIES_QUERY,
      {},
      { cache: 'no-store' }
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }
    const byCleanId = new Map<string, any>();
    for (const doc of rows) {
      const cleanId = (doc._id || '').replace(/^drafts\./, '');
      const isDraft = (doc._id || '').startsWith('drafts.');
      const prev = byCleanId.get(cleanId);
      if (!prev || (prev._id?.startsWith('drafts.') && !isDraft)) {
        byCleanId.set(cleanId, doc);
      }
    }
    return Array.from(byCleanId.values())
      .filter((r) => Boolean(r?.name || r?.title))
      .map((r, idx) => {
        const name = (r.name || r.title || '').trim();
        const id =
          r.slug?.current ||
          r._id.replace(/^category\./, '').replace(/^drafts\./, '') ||
          `cat-${idx}`;
        return {
          id,
          name,
          builtIn: false,
          position: typeof r.position === 'number' ? r.position : idx + 1,
          updatedAt: r._updatedAt ? new Date(r._updatedAt).getTime() : Date.now(),
        };
      });
  } catch (error) {
    console.warn('Failed to fetch categories from Sanity:', error);
    return [];
  }
}

export interface SanityImageAssetItem {
  _id: string;
  url: string;
  originalFilename?: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt?: string;
}

export function sanityCdnUrlToAssetRef(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname !== 'cdn.sanity.io') return null;
    // Matches /images/<projectId>/<dataset>/<id>-<dimensions>.<ext>
    const segments = parsed.pathname.split('/').filter(Boolean);
    const filename = segments[segments.length - 1];
    if (!filename) return null;
    const dotIdx = filename.lastIndexOf('.');
    if (dotIdx <= 0) return null;
    const base = filename.slice(0, dotIdx);
    const ext = filename.slice(dotIdx + 1).toLowerCase();
    if (!base || !ext) return null;
    return `image-${base}-${ext}`;
  } catch {
    return null;
  }
}

export async function fetchSanityImageAssets(limit = 60): Promise<SanityImageAssetItem[]> {
  if (!isSanityConfigured()) return [];
  try {
    const query = `*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0...$limit] {
      _id,
      url,
      originalFilename,
      size,
      mimeType,
      _createdAt,
      "width": metadata.dimensions.width,
      "height": metadata.dimensions.height
    }`;
    const rows = await sanityClient.fetch<any[]>(query, { limit });
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((r) => Boolean(r?._id && r?.url))
      .map((r) => ({
        _id: r._id,
        url: r.url,
        originalFilename: r.originalFilename || 'sanity-asset',
        size: typeof r.size === 'number' ? r.size : undefined,
        mimeType: r.mimeType || undefined,
        width: typeof r.width === 'number' ? r.width : undefined,
        height: typeof r.height === 'number' ? r.height : undefined,
        createdAt: r._createdAt || undefined,
      }));
  } catch (error) {
    console.warn('Failed to fetch Sanity image assets:', error);
    return [];
  }
}

export async function uploadImageBufferToSanity(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<SanityImageAssetItem> {
  const writeClient = getSanityWriteClient();
  const asset: any = await writeClient.assets.upload('image', buffer, {
    filename,
    contentType,
  });
  return {
    _id: asset._id,
    url: asset.url,
    originalFilename: asset.originalFilename || filename,
    size: typeof asset.size === 'number' ? asset.size : buffer.byteLength,
    mimeType: asset.mimeType || contentType,
    width: asset.metadata?.dimensions?.width,
    height: asset.metadata?.dimensions?.height,
    createdAt: asset._createdAt,
  };
}

// Helper: upload base64 data URL image to Sanity Assets OR map Sanity CDN URL to a native Sanity asset reference
async function resolveSanityImageInput(
  writeClient: ReturnType<typeof getSanityWriteClient>,
  input: any,
  filenamePrefix: string
): Promise<any> {
  if (!input) return input;
  if (typeof input !== 'string') {
    return input;
  }

  // If already a Sanity CDN URL, convert to a native Sanity image reference
  const assetRef = sanityCdnUrlToAssetRef(input);
  if (assetRef) {
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: assetRef,
      },
    };
  }

  if (!input.startsWith('data:image/')) {
    return input;
  }
  const match = input.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return input;

  const contentType = match[1];
  const ext = contentType.split('/')[1] || 'webp';
  const buffer = Buffer.from(match[2], 'base64');
  const asset = await writeClient.assets.upload('image', buffer, {
    filename: `${filenamePrefix}.${ext}`,
    contentType,
  });
  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: asset._id,
    },
  };
}

// Server-side mutation: Create or update product in Sanity (auto-uploading any base64 studio/360 photos to Sanity Assets)
export async function writeProductToSanity(product: Product) {
  const writeClient = getSanityWriteClient();
  const doc: any = productToSanityDoc(product);

  doc.image = await resolveSanityImageInput(writeClient, doc.image, `${product.id}-studio`);
  if (doc.scene) {
    doc.scene = await resolveSanityImageInput(writeClient, doc.scene, `${product.id}-scene`);
  }
  if (Array.isArray(doc.frames360) && doc.frames360.length > 0) {
    const uploadedFrames = await Promise.all(
      doc.frames360.map(async (frame: any, idx: number) => {
        const resolved = await resolveSanityImageInput(
          writeClient,
          frame,
          `${product.id}-360-${idx + 1}`
        );
        if (resolved && typeof resolved === 'object' && resolved._type === 'image') {
          return { ...resolved, _key: `frame_${idx}` };
        }
        return resolved;
      })
    );
    doc.frames360 = uploadedFrames;
  }

  return await writeClient.createOrReplace(doc);
}

// Server-side mutation: Delete product from Sanity
export async function deleteProductFromSanity(productId: string) {
  const writeClient = getSanityWriteClient();
  const docId = `product.${productId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  // Try deleting exact docId, or query matching slug
  try {
    await writeClient.delete(docId);
  } catch {
    // Attempt deleting by slug / query
    await writeClient.delete({
      query: `*[_type == "product" && (slug.current == $slug || _id == $id || _id == $docId)]`,
      params: { slug: productId, id: productId, docId },
    });
  }
}

// Test Connection
export async function testSanityConnection(): Promise<{
  connected: boolean;
  productCount: number;
  projectId: string;
  dataset: string;
  message: string;
}> {
  if (!isSanityConfigured()) {
    return {
      connected: false,
      productCount: 0,
      projectId: '',
      dataset: '',
      message: 'NEXT_PUBLIC_SANITY_PROJECT_ID is not set in environment.',
    };
  }

  try {
    const client = token ? getSanityWriteClient() : sanityClient;
    const count = await client.fetch<number>(
      `count(*[_type == "product"])`,
      {},
      { cache: 'no-store' }
    );
    return {
      connected: true,
      productCount: count || 0,
      projectId,
      dataset,
      message: `Successfully connected to Sanity project "${projectId}" (${count || 0} products found).`,
    };
  } catch (err: any) {
    return {
      connected: false,
      productCount: 0,
      projectId,
      dataset,
      message: err.message || 'Could not connect to Sanity.',
    };
  }
}

export interface SanityRoomSceneDocument {
  _id: string;
  _type: 'roomScene';
  _updatedAt?: string;
  title?: string;
  eyebrow?: string;
  image?: any;
  imageUrl?: string;
  hotspots?: Array<{
    _key?: string;
    product?: { _ref?: string; slug?: { current: string } };
    productId?: string;
    x?: number;
    y?: number;
  }>;
}

const ROOM_SCENE_QUERY = `*[_type == "roomScene" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0] {
  _id,
  _type,
  _updatedAt,
  title,
  eyebrow,
  image,
  "imageUrl": image.asset->url,
  hotspots[] {
    _key,
    productId,
    x,
    y,
    product-> { slug }
  }
}`;

export function sanityDocToRoomScene(doc: SanityRoomSceneDocument): RoomScene {
  let imageUrl = '/images/interior.jpg';
  if (typeof doc.imageUrl === 'string' && doc.imageUrl.trim()) {
    imageUrl = doc.imageUrl;
  } else if (typeof doc.image === 'string' && doc.image.trim()) {
    imageUrl = doc.image;
  } else if (doc.image?.asset) {
    imageUrl = urlForSanityImage(doc.image);
  }

  const hotspots: RoomHotspot[] = Array.isArray(doc.hotspots)
    ? doc.hotspots
        .map((h, idx) => {
          const productId = h.productId || h.product?.slug?.current || '';
          if (!productId) return null;
          return {
            key: h._key || `spot-${idx + 1}`,
            productId,
            x: typeof h.x === 'number' ? Math.max(0, Math.min(100, h.x)) : 50,
            y: typeof h.y === 'number' ? Math.max(0, Math.min(100, h.y)) : 50,
          };
        })
        .filter((item): item is RoomHotspot => item !== null)
    : [];

  return {
    image: imageUrl,
    eyebrow: doc.eyebrow || '',
    title: doc.title || '',
    hotspots,
    updatedAt: doc._updatedAt ? new Date(doc._updatedAt).getTime() : Date.now(),
  };
}

export function roomSceneToSanityDoc(scene: RoomScene): SanityRoomSceneDocument {
  return {
    _id: 'roomScene.primary',
    _type: 'roomScene',
    eyebrow: scene.eyebrow || '',
    title: scene.title || '',
    image: scene.image,
    hotspots: scene.hotspots.map((spot, idx) => ({
      _key: spot.key || `spot_${idx}`,
      productId: spot.productId,
      x: spot.x,
      y: spot.y,
    })),
  };
}

export async function fetchSanityRoomScene(): Promise<RoomScene | null> {
  if (!isSanityConfigured()) return null;
  try {
    const client = token ? getSanityWriteClient() : sanityClient;
    const doc = await client.fetch<SanityRoomSceneDocument | null>(
      ROOM_SCENE_QUERY,
      {},
      { cache: 'no-store' }
    );
    if (!doc) return null;
    return sanityDocToRoomScene(doc);
  } catch (error) {
    console.warn('Failed to fetch roomScene from Sanity:', error);
    return null;
  }
}

export async function writeRoomSceneToSanity(scene: RoomScene) {
  const writeClient = getSanityWriteClient();
  const doc: any = roomSceneToSanityDoc(scene);
  doc.image = await resolveSanityImageInput(writeClient, doc.image, 'room-vignette-primary');
  return await writeClient.createOrReplace(doc);
}
