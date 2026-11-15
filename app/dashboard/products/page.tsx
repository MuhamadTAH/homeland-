'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  Plus,
  Search,
  X,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  Package,
  ArrowUpRight,
  Check,
  AlertTriangle,
  Cloud,
  RefreshCw,
  Database,
  ExternalLink,
  FileCode,
  Copy,
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard-shell';
import {
  useDashToast,
  DashToast,
  ConfirmDialog,
  NewCategoryInlineForm,
} from '@/components/dashboard-ui';
import {
  COLOR_SWATCH_LIBRARY,
  Product,
  ProductDraft,
  TintKey,
  TINT_BG,
  TINT_KEYS,
  STARTER_PRODUCTS,
  imgPath,
  productToDraft,
  validateProductDraft,
  isSameDraft,
  slugifyProduct,
  formatPrice,
} from '@/lib/catalog';
import { computeWeeklyStock } from '@/lib/metrics';

type StatusTab = 'all' | 'live' | 'drafts' | 'low';

const BUILTIN_PRODUCT_IMAGES: { label: string; path: string }[] = [
  { label: 'Lounge Chair', path: imgPath('chair.webp') },
  { label: 'Table Lamp', path: imgPath('lamp.webp') },
  { label: 'Pendant', path: imgPath('pendant.webp') },
  { label: 'Stool', path: imgPath('stool.webp') },
  { label: 'Side Table', path: imgPath('table.webp') },
  { label: 'Wool Throw', path: imgPath('throw.webp') },
  { label: 'Vase', path: imgPath('vase.webp') },
  { label: 'Bowl', path: imgPath('bowl.webp') },
  { label: 'Cushion', path: imgPath('cushion.webp') },
];

const ROOM_IMAGE_PRESETS: { label: string; path: string }[] = [
  { label: 'None', path: '' },
  { label: 'Chair scene', path: imgPath('best-chair.jpg') },
  { label: 'Lamp scene', path: imgPath('best-lamp.jpg') },
  { label: 'Throw scene', path: imgPath('best-throw.jpg') },
  { label: 'Interior room', path: imgPath('interior.jpg') },
  { label: 'Craft detail', path: imgPath('feature-detail.jpg') },
  { label: 'Living room', path: imgPath('feature-room.jpg') },
];

const FINISH_COLOR_SWATCHES = COLOR_SWATCH_LIBRARY.map((s) => s.color);

const makeUid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function DashboardProductsPage() {
  const { catalog } = useDashboard();
  const { notice, show: showToast, dismiss } = useDashToast();

  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  // Editor drawer state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(() => productToDraft(null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [addingInlineCat, setAddingInlineCat] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importingStarter, setImportingStarter] = useState(false);

  // Sanity Platform state
  const [sanityStatus, setSanityStatus] = useState<{
    connected: boolean;
    productCount: number;
    projectId: string;
    dataset: string;
    message: string;
  } | null>(null);
  const [syncingSanity, setSyncingSanity] = useState(false);
  const [exportingSanity, setExportingSanity] = useState(false);
  const [sanityModalOpen, setSanityModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetch('/api/sanity/status')
      .then((res) => res.json())
      .then((data) => setSanityStatus(data))
      .catch(() => {});
  }, []);

  const handleSyncFromSanity = async () => {
    setSyncingSanity(true);
    try {
      const res = await fetch('/api/sanity/products');
      const data = await res.json();
      if (data.configured && Array.isArray(data.products) && data.products.length > 0) {
        showToast(`Synced ${data.products.length} products from Sanity CMS!`);
        fetch('/api/sanity/status').then((r) => r.json()).then(setSanityStatus).catch(() => {});
      } else if (!data.configured) {
        showToast(data.message || 'Sanity Project ID not set in environment.');
      } else {
        showToast('No products found in Sanity dataset.');
      }
    } catch {
      showToast('Could not sync with Sanity platform.', 'error');
    } finally {
      setSyncingSanity(false);
    }
  };

  const handleExportToSanity = async () => {
    setExportingSanity(true);
    try {
      const res = await fetch('/api/sanity/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Exported products to Sanity!');
        fetch('/api/sanity/status').then((r) => r.json()).then(setSanityStatus).catch(() => {});
      } else {
        showToast(data.error || 'Failed to export to Sanity.', 'error');
      }
    } catch {
      showToast('Failed to connect to Sanity.', 'error');
    } finally {
      setExportingSanity(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stockMap = useMemo(() => {
    return new Map(
      catalog.allProducts.map((p) => [
        p.id,
        { product: p, onHand: p.stock, low: p.stock <= 12 },
      ])
    );
  }, [catalog.allProducts]);

  const catLabels = useMemo(
    () => new Map(catalog.categories.map((c) => [c.id, c.name])),
    [catalog.categories]
  );

  const missingStarterCount = useMemo(() => {
    const existingIds = new Set(catalog.allProducts.map((p) => p.id));
    return STARTER_PRODUCTS.filter((p) => !existingIds.has(p.id)).length;
  }, [catalog.allProducts]);

  const counts = useMemo(() => {
    let live = 0;
    let drafts = 0;
    let low = 0;
    for (const p of catalog.allProducts) {
      if (p.status === 'draft') drafts++;
      else live++;
      const st = stockMap.get(p.id);
      if (st?.low) low++;
    }
    return {
      all: catalog.allProducts.length,
      live,
      drafts,
      low,
    };
  }, [catalog.allProducts, stockMap]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.allProducts.filter((p) => {
      if (statusTab === 'live' && p.status !== 'active') return false;
      if (statusTab === 'drafts' && p.status !== 'draft') return false;
      if (statusTab === 'low' && !stockMap.get(p.id)?.low) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.blurb.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [catalog.allProducts, statusTab, categoryFilter, query, stockMap]);

  const initialDraft = useMemo(
    () => productToDraft(editingProduct),
    [editingProduct]
  );
  const isDirty = useMemo(() => !isSameDraft(draft, initialDraft), [draft, initialDraft]);

  const openNewProduct = () => {
    const fresh = productToDraft(null);
    fresh.category = catalog.categories[0]?.id || 'seating';
    fresh.status = 'active';
    fresh.image = BUILTIN_PRODUCT_IMAGES[0].path;
    fresh.finishes = [{ key: makeUid(), name: 'Oiled oak', color: '#c8955a' }];
    fresh.details = [
      { key: makeUid(), text: 'Solid FSC® timber' },
      { key: makeUid(), text: 'Hand-finished in Malmö' },
    ];
    setEditingProduct(null);
    setDraft(fresh);
    setErrors({});
    setAddingInlineCat(false);
    setEditorOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setDraft(productToDraft(product));
    setErrors({});
    setAddingInlineCat(false);
    setEditorOpen(true);
  };

  const requestCloseEditor = () => {
    if (saving) return;
    if (isDirty) {
      setDiscardConfirmOpen(true);
    } else {
      setEditorOpen(false);
    }
  };

  useEffect(() => {
    if (!editorOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !discardConfirmOpen) {
        requestCloseEditor();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await catalog.uploadProductImage(file);
      setDraft((prev) => ({ ...prev, image: dataUrl }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
      showToast('Product image uploaded');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to process image', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const categoryIds = catalog.categories.map((c) => c.id);
    const { input, errors: vErrors } = validateProductDraft(draft, categoryIds);
    if (!input || vErrors) {
      setErrors(vErrors || {});
      showToast('Please fix highlighted fields', 'error');
      return;
    }

    setSaving(true);
    try {
      await catalog.saveProduct(input, editingProduct);
      setEditorOpen(false);
      showToast(
        editingProduct
          ? `Saved "${input.name}"`
          : `Added "${input.name}" to catalog`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      await catalog.setProductStatus(product.id, nextStatus);
      showToast(
        nextStatus === 'active'
          ? `"${product.name}" is now live on the storefront`
          : `"${product.name}" moved to drafts`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update product', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await catalog.deleteProduct(deleteTarget.id);
      showToast(`Deleted "${deleteTarget.name}"`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleHideInstead = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await catalog.setProductStatus(deleteTarget.id, 'draft');
      showToast(`"${deleteTarget.name}" hidden as a draft`);
      setDeleteTarget(null);
    } catch {
      showToast('Could not update product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleImportStarter = async () => {
    setImportingStarter(true);
    try {
      await catalog.importStarterCatalog();
      showToast(`Restored ${missingStarterCount} starter pieces`);
    } catch {
      showToast('Could not import starter catalog', 'error');
    } finally {
      setImportingStarter(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="tile flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            Catalog · Storefront inventory
          </div>
          <h1 className="display mt-1 text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.03em] text-ink">
            Products
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {missingStarterCount > 0 && (
            <button
              type="button"
              onClick={handleImportStarter}
              disabled={importingStarter}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-canvas px-4 text-[12px] font-medium text-ink transition-colors hover:border-ink hover:bg-sand disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {importingStarter
                ? 'Restoring…'
                : `Restore ${missingStarterCount} starter ${
                    missingStarterCount === 1 ? 'piece' : 'pieces'
                  }`}
            </button>
          )}
          <button
            type="button"
            onClick={openNewProduct}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium text-card transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            New product
          </button>
        </div>
      </div>

      {/* Sanity Platform Integration Bar */}
      <div className="tile flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-sand text-ink">
            <Cloud className="size-4.5 text-accent" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">Sanity Platform CMS</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${
                  sanityStatus?.connected
                    ? 'bg-ok/15 text-ok'
                    : 'bg-sand text-ink-soft'
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    sanityStatus?.connected ? 'bg-ok' : 'bg-ink-faint'
                  }`}
                />
                {sanityStatus?.connected
                  ? `Connected (${sanityStatus.projectId})`
                  : 'Ready to Connect'}
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px] text-ink-soft">
              {sanityStatus?.connected
                ? `${sanityStatus.productCount} documents in Sanity dataset "${sanityStatus.dataset}". Adding and deleting products syncs live.`
                : 'Manage product features, 360 models, and specifications directly through the Sanity platform.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSyncFromSanity}
            disabled={syncingSanity}
            className="inline-flex h-8.5 items-center gap-1.5 rounded-full border border-line bg-canvas px-3 text-[11.5px] font-medium text-ink transition-colors hover:border-ink hover:bg-sand disabled:opacity-50"
            title="Fetch live catalog from Sanity platform"
          >
            <RefreshCw className={`size-3 text-accent ${syncingSanity ? 'animate-spin' : ''}`} />
            {syncingSanity ? 'Syncing…' : 'Sync Sanity'}
          </button>
          <button
            type="button"
            onClick={handleExportToSanity}
            disabled={exportingSanity}
            className="inline-flex h-8.5 items-center gap-1.5 rounded-full border border-line bg-canvas px-3 text-[11.5px] font-medium text-ink transition-colors hover:border-ink hover:bg-sand disabled:opacity-50"
            title="Seed starter catalog to your Sanity dataset"
          >
            <Database className="size-3 text-ink-soft" />
            {exportingSanity ? 'Seeding…' : 'Seed to Sanity'}
          </button>
          <button
            type="button"
            onClick={() => setSanityModalOpen(true)}
            className="inline-flex h-8.5 items-center gap-1.5 rounded-full bg-sand px-3 text-[11.5px] font-medium text-ink transition-colors hover:bg-ink hover:text-canvas"
          >
            <FileCode className="size-3" />
            Sanity Studio & Setup
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="tile p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'All', count: counts.all },
                { id: 'live', label: 'Live', count: counts.live },
                { id: 'drafts', label: 'Drafts', count: counts.drafts },
                { id: 'low', label: 'Low stock', count: counts.low },
              ] as const
            ).map((tab) => {
              const active = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                    active
                      ? 'bg-ink text-card'
                      : 'bg-canvas text-ink-soft hover:bg-sand hover:text-ink'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] tabular ${
                      active ? 'bg-card/20 text-card' : 'bg-card text-ink-soft'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="h-10 rounded-full border border-line bg-canvas px-3.5 text-[12px] font-medium text-ink focus:border-ink focus:bg-card focus:outline-none"
            >
              <option value="all">All categories</option>
              {catalog.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-64 sm:flex-initial">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, description, slug…"
                className="h-10 w-full rounded-full border border-line bg-canvas pr-9 pl-9 text-[12px] text-ink placeholder:text-ink-faint focus:border-ink focus:bg-card focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-faint hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Rows */}
        <div className="mt-5 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-ink-faint">
                <Package className="h-5 w-5" />
              </div>
              <div className="mt-3 text-[14px] font-medium text-ink">No pieces found</div>
              <p className="mt-1 text-[12px] text-ink-soft">
                Try adjusting your filters or create a new piece.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                  <th className="pb-3 pl-2">Piece</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Storefront</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[13px]">
                {filtered.map((product) => {
                  const isLive = product.status === 'active';
                  const stock = stockMap.get(product.id);
                  const catLabel =
                    catLabels.get(product.category) ||
                    product.category.charAt(0).toUpperCase() + product.category.slice(1);

                  return (
                    <tr
                      key={product.id}
                      onClick={() => openEditProduct(product)}
                      className="group cursor-pointer transition-colors hover:bg-canvas/75"
                    >
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl p-1.5 ${
                              TINT_BG[product.tint] ?? 'bg-sand'
                            }`}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-ink">
                                {product.name}
                              </span>
                              {product.badge && (
                                <span className="rounded-full bg-sand px-2 py-0.5 font-mono text-[10px] font-medium text-ink">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <div className="truncate max-w-md text-[12px] text-ink-soft">
                              {product.blurb}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                          {catLabel}
                        </span>
                      </td>

                      <td className="py-3.5 font-mono font-semibold text-ink tabular">
                        {formatPrice(product.price)}
                      </td>

                      <td className="py-3.5">
                        {stock ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium tabular ${
                              stock.low
                                ? 'bg-warn-soft text-warn'
                                : 'bg-ok-soft text-ok'
                            }`}
                          >
                            {stock.low && <AlertTriangle className="h-3 w-3" />}
                            {stock.onHand} left
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-ink-faint">
                            {product.stock} in stock
                          </span>
                        )}
                      </td>

                      <td
                        className="py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            isLive
                              ? 'bg-ok-soft text-ok hover:bg-ok/20'
                              : 'bg-canvas text-ink-soft hover:bg-sand hover:text-ink'
                          }`}
                        >
                          {isLive ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Live
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Draft
                            </>
                          )}
                        </button>
                      </td>

                      <td
                        className="py-3.5 pr-2 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1">
                          {isLive && (
                            <Link
                              href={`/product/${product.id}`}
                              title="View on storefront"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditProduct(product)}
                            title="Edit product"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            title="Delete product"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-Over Product Editor Drawer */}
      <AnimatePresence>
        {editorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={requestCloseEditor}
              className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[680px] flex-col bg-card shadow-lift"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    {editingProduct ? `Editing · ${editingProduct.id}` : 'New catalog entry'}
                  </div>
                  <h2 className="display text-[20px] font-semibold tracking-[-0.02em] text-ink">
                    {editingProduct ? editingProduct.name : 'Create new piece'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        status: prev.status === 'active' ? 'draft' : 'active',
                      }))
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${
                      draft.status === 'active'
                        ? 'bg-ok-soft text-ok'
                        : 'bg-canvas text-ink-soft'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        draft.status === 'active' ? 'bg-ok' : 'bg-ink-faint'
                      }`}
                    />
                    {draft.status === 'active' ? 'Live' : 'Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={requestCloseEditor}
                    aria-label="Close editor"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-ink-soft hover:bg-sand hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Form Body */}
              <form
                onSubmit={handleSaveProduct}
                className="flex-1 space-y-6 overflow-y-auto p-6"
              >
                {/* Live Preview Tile */}
                <div className="rounded-2xl border border-line bg-canvas p-4">
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    Live storefront card preview
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <div
                      className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl p-2 ${
                        TINT_BG[draft.tint] ?? 'bg-sand'
                      }`}
                    >
                      {draft.image ? (
                        <img
                          src={draft.image}
                          alt={draft.name || 'Preview'}
                          className="h-full w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-ink-faint" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[15px] font-semibold text-ink">
                          {draft.name || 'Untitled piece'}
                        </span>
                        {draft.badge && (
                          <span className="rounded-full bg-card px-2 py-0.5 font-mono text-[10px] font-medium text-ink">
                            {draft.badge}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[12px] text-ink-soft">
                        {draft.blurb || 'Short editorial description'}
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-2 font-mono">
                        <span className="text-[14px] font-semibold text-ink">
                          {draft.price ? formatPrice(Number(draft.price)) : '$0'}
                        </span>
                        <span className="text-[10px] text-ink-faint">
                          /{editingProduct?.id || slugifyProduct(draft.name || 'new-piece')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name & Category */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-medium text-ink">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => {
                        setDraft((p) => ({ ...p, name: e.target.value }));
                        if (errors.name) setErrors((er) => ({ ...er, name: '' }));
                      }}
                      placeholder="e.g. Bolle Lounge Chair"
                      className={`mt-1.5 h-10 w-full rounded-xl border bg-canvas px-3.5 text-[13px] text-ink focus:bg-card focus:outline-none ${
                        errors.name ? 'border-danger' : 'border-line focus:border-ink'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] text-danger">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[12px] font-medium text-ink">
                        Category <span className="text-danger">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAddingInlineCat((v) => !v)}
                        className="text-[11px] font-medium text-accent hover:underline"
                      >
                        {addingInlineCat ? 'Cancel' : '+ New'}
                      </button>
                    </div>
                    <select
                      value={draft.category}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, category: e.target.value }))
                      }
                      className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3 text-[13px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                    >
                      {catalog.categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {addingInlineCat && (
                  <div className="rounded-2xl border border-line bg-canvas p-3.5">
                    <div className="mb-2 text-[11px] font-medium text-ink-soft">
                      Create new category
                    </div>
                    <NewCategoryInlineForm
                      categories={catalog.categories}
                      onCreate={catalog.createCategory}
                      onCreated={(created) => {
                        setDraft((p) => ({ ...p, category: created.id }));
                        setAddingInlineCat(false);
                        showToast(`Category "${created.name}" created`);
                      }}
                      onCancel={() => setAddingInlineCat(false)}
                    />
                  </div>
                )}

                {/* Price, Stock, Badge */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[12px] font-medium text-ink">
                      Price (USD) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={draft.price}
                      onChange={(e) => {
                        setDraft((p) => ({ ...p, price: e.target.value }));
                        if (errors.price) setErrors((er) => ({ ...er, price: '' }));
                      }}
                      placeholder="680"
                      className={`mt-1.5 h-10 w-full rounded-xl border bg-canvas px-3.5 font-mono text-[13px] text-ink focus:bg-card focus:outline-none ${
                        errors.price ? 'border-danger' : 'border-line focus:border-ink'
                      }`}
                    />
                    {errors.price && (
                      <p className="mt-1 text-[11px] text-danger">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-ink">
                      Stock allocation <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={draft.stock}
                      onChange={(e) => {
                        setDraft((p) => ({ ...p, stock: e.target.value }));
                        if (errors.stock) setErrors((er) => ({ ...er, stock: '' }));
                      }}
                      placeholder="24"
                      className={`mt-1.5 h-10 w-full rounded-xl border bg-canvas px-3.5 font-mono text-[13px] text-ink focus:bg-card focus:outline-none ${
                        errors.stock ? 'border-danger' : 'border-line focus:border-ink'
                      }`}
                    />
                    {errors.stock && (
                      <p className="mt-1 text-[11px] text-danger">{errors.stock}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-ink">
                      Badge
                    </label>
                    <input
                      type="text"
                      value={draft.badge}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, badge: e.target.value }))
                      }
                      placeholder="Bestseller, New…"
                      className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3.5 text-[13px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                    />
                  </div>
                </div>

                {/* Product Image Picker & Upload */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[12px] font-medium text-ink">
                      Studio product image <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-accent hover:underline"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload custom image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFile}
                      className="hidden"
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-9">
                    {BUILTIN_PRODUCT_IMAGES.map((img) => {
                      const active = draft.image === img.path;
                      return (
                        <button
                          key={img.path}
                          type="button"
                          onClick={() =>
                            setDraft((p) => ({ ...p, image: img.path }))
                          }
                          title={img.label}
                          className={`aspect-square overflow-hidden rounded-xl border p-1.5 transition-all ${
                            active
                              ? 'border-ink bg-sand ring-2 ring-ink/15'
                              : 'border-line bg-canvas hover:border-ink/40'
                          }`}
                        >
                          <img
                            src={img.path}
                            alt={img.label}
                            className="h-full w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      );
                    })}
                  </div>
                  {errors.image && (
                    <p className="mt-1 text-[11px] text-danger">{errors.image}</p>
                  )}
                </div>

                {/* Card Tint & Room Scene */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-medium text-ink">
                      Card backdrop tint
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TINT_KEYS.map((tk: TintKey) => (
                        <button
                          key={tk}
                          type="button"
                          onClick={() => setDraft((p) => ({ ...p, tint: tk }))}
                          title={tk}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-transform ${
                            TINT_BG[tk]
                          } ${
                            draft.tint === tk
                              ? 'scale-110 border-ink ring-2 ring-ink/20'
                              : 'border-line hover:scale-105'
                          }`}
                        >
                          {draft.tint === tk && <Check className="h-3.5 w-3.5 text-ink" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-ink">
                      In-the-room scene photo
                    </label>
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {ROOM_IMAGE_PRESETS.map((r) => (
                        <button
                          key={r.label}
                          type="button"
                          onClick={() =>
                            setDraft((p) => ({ ...p, scene: r.path }))
                          }
                          className={`flex h-10 items-center justify-center overflow-hidden rounded-xl border text-[10px] font-medium transition-all ${
                            draft.scene === r.path
                              ? 'border-ink ring-2 ring-ink/15'
                              : 'border-line opacity-75 hover:opacity-100'
                          }`}
                        >
                          {r.path ? (
                            <img
                              src={r.path}
                              alt={r.label}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-ink-soft">None</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Editorial Story / Blurb */}
                <div>
                  <label className="block text-[12px] font-medium text-ink">
                    Story & editorial note <span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={draft.blurb}
                    onChange={(e) => {
                      setDraft((p) => ({ ...p, blurb: e.target.value }));
                      if (errors.blurb) setErrors((er) => ({ ...er, blurb: '' }));
                    }}
                    placeholder="Describe proportions, joinery, and how the piece settles into a room…"
                    className={`mt-1.5 w-full rounded-xl border bg-canvas p-3.5 text-[13px] text-ink focus:bg-card focus:outline-none ${
                      errors.blurb ? 'border-danger' : 'border-line focus:border-ink'
                    }`}
                  />
                  {errors.blurb && (
                    <p className="mt-1 text-[11px] text-danger">{errors.blurb}</p>
                  )}
                </div>

                {/* Finishes */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[12px] font-medium text-ink">
                      Finishes & swatches <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((p) => ({
                          ...p,
                          finishes: [
                            ...p.finishes,
                            {
                              key: makeUid(),
                              name: '',
                              color:
                                FINISH_COLOR_SWATCHES[
                                  p.finishes.length % FINISH_COLOR_SWATCHES.length
                                ],
                            },
                          ],
                        }))
                      }
                      className="text-[11px] font-medium text-accent hover:underline"
                    >
                      + Add finish
                    </button>
                  </div>
                  <div className="mt-2 flex max-h-24 flex-wrap gap-1 overflow-y-auto rounded-xl border border-line bg-canvas p-2">
                    {COLOR_SWATCH_LIBRARY.map((sw) => (
                      <button
                        key={sw.en}
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            finishes: [
                              ...p.finishes,
                              { key: makeUid(), name: sw.en, color: sw.color },
                            ],
                          }))
                        }
                        title={sw.en}
                        className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[10.5px] text-ink ring-1 ring-line hover:bg-sand"
                      >
                        <span
                          className="size-2.5 rounded-full ring-1 ring-ink/20"
                          style={{ backgroundColor: sw.color }}
                        />
                        <span>{sw.en}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 space-y-2">
                    {draft.finishes.map((fin, idx) => {
                      const finErr = errors[`finish-${idx}`];
                      const safePickerColor = /^#[0-9a-f]{6}$/i.test(fin.color)
                        ? fin.color
                        : '#d8c4a4';
                      return (
                        <div key={fin.key} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={safePickerColor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((p) => ({
                                  ...p,
                                  finishes: p.finishes.map((f, i) =>
                                    i === idx ? { ...f, color: val } : f
                                  ),
                                }));
                              }}
                              className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-line bg-canvas p-0.5"
                            />
                            <input
                              type="text"
                              value={fin.color}
                              maxLength={7}
                              dir="ltr"
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((p) => ({
                                  ...p,
                                  finishes: p.finishes.map((f, i) =>
                                    i === idx ? { ...f, color: val } : f
                                  ),
                                }));
                              }}
                              className="h-9 w-20 shrink-0 rounded-xl border border-line bg-canvas px-2 text-center font-mono text-[11px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                            />
                            <input
                              type="text"
                              value={fin.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((p) => ({
                                  ...p,
                                  finishes: p.finishes.map((f, i) =>
                                    i === idx ? { ...f, name: val } : f
                                  ),
                                }));
                              }}
                              placeholder="Color / finish name (e.g. Midnight Navy, Oak)"
                              className={`h-9 flex-1 rounded-xl border bg-canvas px-3 text-[12px] text-ink focus:bg-card focus:outline-none ${
                                finErr ? 'border-danger' : 'border-line focus:border-ink'
                              }`}
                            />
                            {draft.finishes.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((p) => ({
                                    ...p,
                                    finishes: p.finishes.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint hover:bg-canvas hover:text-danger"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {finErr && (
                            <p className="text-[11px] text-danger">{finErr}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Craft Details List */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[12px] font-medium text-ink">
                      Construction highlights
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((p) => ({
                          ...p,
                          details: [...p.details, { key: makeUid(), text: '' }],
                        }))
                      }
                      className="text-[11px] font-medium text-accent hover:underline"
                    >
                      + Add bullet
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {draft.details.map((det, idx) => (
                      <div key={det.key} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={det.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((p) => ({
                              ...p,
                              details: p.details.map((d, i) =>
                                i === idx ? { ...d, text: val } : d
                              ),
                            }));
                          }}
                          placeholder="e.g. Mortise-and-tenon joinery"
                          className="h-9 flex-1 rounded-xl border border-line bg-canvas px-3 text-[12px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                        />
                        {draft.details.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((p) => ({
                                ...p,
                                details: p.details.filter((_, i) => i !== idx),
                              }))
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint hover:bg-canvas hover:text-danger"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specs: Dimensions & Care */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-medium text-ink">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={draft.dimensions}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, dimensions: e.target.value }))
                      }
                      placeholder="W 74 × D 78 × H 72 cm"
                      className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3.5 text-[12px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-ink">
                      Care instructions
                    </label>
                    <input
                      type="text"
                      value={draft.care}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, care: e.target.value }))
                      }
                      placeholder="Brush gently; re-oil oak annually"
                      className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3.5 text-[12px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                    />
                  </div>
                </div>

                {/* Sanity Platform & 360 Features */}
                <div className="rounded-2xl border border-line bg-canvas/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-ink flex items-center gap-1.5">
                      <Cloud className="size-3.5 text-accent" />
                      Sanity CMS Specifications & 360 View
                    </span>
                    <span className="text-[10.5px] font-mono text-ink-soft">
                      Syncs to Sanity dataset
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-medium text-ink-soft">
                        360° Turntable 3D Shape
                      </label>
                      <select
                        className="mt-1 h-9 w-full rounded-xl border border-line bg-card px-3 text-[12px] text-ink focus:border-ink focus:outline-none"
                        defaultValue="chair"
                      >
                        <option value="chair">Lounge Chair / Sofa (Sculpted Cushions)</option>
                        <option value="table">Architectural Table (Pedestal / Top)</option>
                        <option value="lamp">Lighting / Lamp (Turned Shade & Stem)</option>
                        <option value="vase">Ceramic Vase / Object (Lathed Form)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-ink-soft">
                        Showroom Viewing Availability
                      </label>
                      <input
                        type="text"
                        defaultValue="Sulaymaniyah Showroom · Salim Street"
                        className="mt-1 h-9 w-full rounded-xl border border-line bg-card px-3 text-[12px] text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 text-[12px] text-ink cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-ink accent-ink" />
                      <span>FSC® Certified Solid Wood</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-[12px] text-ink cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-ink accent-ink" />
                      <span>10-Year Carpentry Guarantee</span>
                    </label>
                  </div>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="flex items-center justify-between border-t border-line bg-card px-6 py-4">
                <button
                  type="button"
                  onClick={requestCloseEditor}
                  disabled={saving}
                  className="h-10 rounded-full border border-line px-4 text-[12px] font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProduct()}
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[12px] font-medium text-card transition-colors hover:bg-accent disabled:opacity-50"
                >
                  {saving
                    ? 'Saving…'
                    : editingProduct
                    ? 'Save changes'
                    : 'Create product'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Discard Unsaved Changes Confirmation */}
      <ConfirmDialog
        open={discardConfirmOpen}
        title="Discard unsaved changes?"
        description="You have edited fields in the product drawer. Closing now will lose those changes."
        confirmLabel="Discard changes"
        tone="danger"
        onConfirm={() => {
          setDiscardConfirmOpen(false);
          setEditorOpen(false);
        }}
        onCancel={() => setDiscardConfirmOpen(false)}
      />

      {/* Delete Product Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget ? `Delete "${deleteTarget.name}"?` : 'Delete product?'}
        description="This permanently removes the product from your catalog. If you only want to take it off the storefront temporarily, hide it as a draft instead."
        confirmLabel="Delete permanently"
        tone="danger"
        busy={deleting}
        secondaryAction={
          deleteTarget && deleteTarget.status === 'active'
            ? { label: 'Hide as draft instead', onClick: handleHideInstead }
            : undefined
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Sanity Platform Setup & Schemas Modal */}
      <AnimatePresence>
        {sanityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSanityModalOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-card p-6 shadow-tile ring-1 ring-line sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-sand text-ink">
                    <Cloud className="size-5 text-accent" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">
                      Sanity Platform CMS Integration
                    </h3>
                    <p className="text-[12px] text-ink-soft">
                      Manage product catalog, 360 models, and specifications via Sanity
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSanityModalOpen(false)}
                  className="rounded-full p-2 text-ink-soft hover:bg-canvas hover:text-ink"
                >
                  <X className="size-4.5" />
                </button>
              </div>

              {/* Status Card */}
              <div className="mt-5 rounded-2xl border border-line bg-canvas p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-ink">Connection Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      sanityStatus?.connected ? 'bg-ok/15 text-ok' : 'bg-warn-soft text-warn'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        sanityStatus?.connected ? 'bg-ok' : 'bg-warn'
                      }`}
                    />
                    {sanityStatus?.connected ? 'Connected to Sanity' : 'Environment variable needed'}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <span className="text-ink-soft">Project ID:</span>{' '}
                    <code className="font-mono text-ink">
                      {sanityStatus?.projectId || 'Not set (NEXT_PUBLIC_SANITY_PROJECT_ID)'}
                    </code>
                  </div>
                  <div>
                    <span className="text-ink-soft">Dataset:</span>{' '}
                    <code className="font-mono text-ink">
                      {sanityStatus?.dataset || 'production'}
                    </code>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] text-ink-soft border-t border-line/60 pt-2.5">
                  {sanityStatus?.message}
                </p>
              </div>

              {/* Setup Steps */}
              <div className="mt-6 space-y-4">
                <h4 className="text-[13px] font-semibold text-ink">How to connect with Sanity:</h4>
                <ol className="space-y-3 text-[12.5px] text-ink-soft">
                  <li className="flex gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sand font-mono text-[10px] font-bold text-ink">
                      1
                    </span>
                    <div>
                      Create a project at <strong className="text-ink">sanity.io</strong> (free) or use your existing Sanity project.
                    </div>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sand font-mono text-[10px] font-bold text-ink">
                      2
                    </span>
                    <div>
                      Set environment secrets in your app:
                      <div className="mt-2 rounded-xl bg-ink p-3 font-mono text-[11px] text-canvas space-y-1">
                        <div>NEXT_PUBLIC_SANITY_PROJECT_ID=&quot;your_project_id&quot;</div>
                        <div>NEXT_PUBLIC_SANITY_DATASET=&quot;production&quot;</div>
                        <div>SANITY_API_TOKEN=&quot;your_write_token&quot;</div>
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sand font-mono text-[10px] font-bold text-ink">
                      3
                    </span>
                    <div>
                      Schemas are already configured in your codebase:
                      <div className="mt-1 text-[11.5px] font-mono text-ink">
                        • /sanity/schemas/product.ts<br />
                        • /sanity/schemas/category.ts<br />
                        • /sanity.config.ts
                      </div>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('npx sanity dev');
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3.5 py-2 text-[12px] font-medium text-ink transition-colors hover:bg-sand"
                >
                  {copiedCode ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
                  <span>Copy Sanity CLI command</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSanityModalOpen(false)}
                  className="rounded-full bg-ink px-5 py-2 text-[12px] font-medium text-card hover:bg-accent"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DashToast notice={notice} onDismiss={dismiss} />
    </div>
  );
}
