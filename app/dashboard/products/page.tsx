'use client';

import React, { Suspense, useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  Plus,
  Minus,
  Search,
  X,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  Package,
  ArrowUpLeft,
  ArrowUpRight,
  Check,
  AlertTriangle,
  Cloud,
  RefreshCw,
  Database,
  ExternalLink,
  FileCode,
  Copy,
  LayoutGrid,
  List,
  Scissors,
  Image as ImageIcon,
  Orbit,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard-shell';
import { useShowroom } from '@/components/providers';
import {
  useDashToast,
  DashToast,
  ConfirmDialog,
  NewCategoryInlineForm,
} from '@/components/dashboard-ui';
import { ImageAssetPickerModal } from '@/components/image-asset-picker';
import { BackgroundRemoverModal } from '@/components/background-remover-modal';
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
import { localizeCategoryName, localizeFinishName, localizeProduct } from '@/lib/i18n';
import { getDashCopy } from '@/lib/dashboard-i18n';

type StatusTab = 'all' | 'live' | 'drafts' | 'low';
type ViewMode = 'table' | 'grid';
type SortOption = 'order' | 'price-asc' | 'price-desc' | 'stock-asc';
type EditorTab = 'essentials' | 'media' | 'finishes';

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

function ProductsWorkspaceInner() {
  const { catalog, sanityStatus, sanitySyncing, refreshSanityStatus, syncCatalogFromSanity } =
    useDashboard();
  const { locale, dir } = useShowroom();
  const d = getDashCopy(locale);
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;
  const { notice, show: showToast, dismiss } = useDashToast();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [statusTab, setStatusTab] = useState<StatusTab>(() => {
    const t = searchParams.get('tab');
    return t === 'live' || t === 'drafts' || t === 'low' ? t : 'all';
  });
  const [categoryFilter, setCategoryFilter] = useState<string>(() => {
    return searchParams.get('cat') || 'all';
  });
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [query, setQuery] = useState('');

  // Editor drawer state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>('essentials');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(() => productToDraft(null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [addingInlineCat, setAddingInlineCat] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  // Asset picker & Background remover modal states
  const [assetPickerTarget, setAssetPickerTarget] = useState<
    null | 'main' | 'scene' | 'frames360'
  >(null);
  const [bgRemoveSource, setBgRemoveSource] = useState<File | string | null>(null);
  const [bgRemoveOpen, setBgRemoveOpen] = useState(false);

  // Delete / Starter / Sanity states
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importingStarter, setImportingStarter] = useState(false);
  const [exportingSanity, setExportingSanity] = useState(false);
  const [sanityModalOpen, setSanityModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [stockBusyId, setStockBusyId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);
  const handledQueryRef = useRef<string>('');

  const openNewProduct = React.useCallback(() => {
    const fresh = productToDraft(null);
    fresh.category = catalog.categories[0]?.id || 'seating';
    fresh.status = 'active';
    fresh.image = BUILTIN_PRODUCT_IMAGES[0].path;
    fresh.finishes = [{ key: makeUid(), name: 'Oiled oak', color: '#c8955a' }];
    fresh.details = [
      { key: makeUid(), text: 'Solid FSC® timber' },
      { key: makeUid(), text: 'Hand-finished' },
    ];
    setEditingProduct(null);
    setDraft(fresh);
    setErrors({});
    setAddingInlineCat(false);
    setEditorTab('essentials');
    setEditorOpen(true);
  }, [catalog.categories]);

  const openEditProduct = React.useCallback((product: Product) => {
    setEditingProduct(product);
    setDraft(productToDraft(product));
    setErrors({});
    setAddingInlineCat(false);
    setEditorTab('essentials');
    setEditorOpen(true);
  }, []);

  // Sync deep-link query params (?tab=low, ?cat=seating, ?edit=<id>, ?new=1)
  useEffect(() => {
    const sig = searchParams.toString();
    if (!sig || handledQueryRef.current === sig) return;
    handledQueryRef.current = sig;

    const tabParam = searchParams.get('tab');
    const catParam = searchParams.get('cat');
    const editParam = searchParams.get('edit');
    const newParam = searchParams.get('new');

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (tabParam === 'all' || tabParam === 'live' || tabParam === 'drafts' || tabParam === 'low') {
        setStatusTab(tabParam);
      }
      if (catParam && (catParam === 'all' || catalog.categories.some((c) => c.id === catParam))) {
        setCategoryFilter(catParam);
      }
      if (editParam) {
        const target = catalog.allProducts.find((p) => p.id === editParam);
        if (target) {
          openEditProduct(target);
        }
      } else if (newParam === '1') {
        openNewProduct();
        router.replace('/dashboard/products', { scroll: false });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [
    searchParams,
    catalog.categories,
    catalog.allProducts,
    openEditProduct,
    openNewProduct,
    router,
  ]);

  const handleSyncFromSanity = async () => {
    try {
      const res = await syncCatalogFromSanity();
      if (res.source === 'sanity') {
        showToast(`${d.sanityConnected} (${res.count})`);
      } else {
        showToast(sanityStatus?.message || d.sanityStandby);
      }
    } catch {
      showToast('Could not sync with Sanity platform.', 'error');
    }
  };

  const handleExportToSanity = async () => {
    setExportingSanity(true);
    try {
      const res = await fetch('/api/sanity/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Exported catalog to Sanity!');
        await refreshSanityStatus();
      } else {
        showToast(data.error || 'Failed to export to Sanity.', 'error');
      }
    } catch {
      showToast('Failed to connect to Sanity.', 'error');
    } finally {
      setExportingSanity(false);
    }
  };

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
      if (p.stock <= 12) low++;
    }
    return {
      all: catalog.allProducts.length,
      live,
      drafts,
      low,
    };
  }, [catalog.allProducts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = catalog.allProducts.filter((p) => {
      if (statusTab === 'live' && p.status !== 'active') return false;
      if (statusTab === 'drafts' && p.status !== 'draft') return false;
      if (statusTab === 'low' && p.stock > 12) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (!q) return true;
      const loc = localizeProduct(p, locale);
      return (
        p.name.toLowerCase().includes(q) ||
        loc.name.toLowerCase().includes(q) ||
        p.blurb.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'stock-asc') return [...list].sort((a, b) => a.stock - b.stock);
    return list;
  }, [catalog.allProducts, statusTab, categoryFilter, query, sortBy, locale]);

  const initialDraft = useMemo(() => productToDraft(editingProduct), [editingProduct]);
  const isDirty = useMemo(() => !isSameDraft(draft, initialDraft), [draft, initialDraft]);

  const requestCloseEditor = React.useCallback(() => {
    if (saving) return;
    if (isDirty) {
      setDiscardConfirmOpen(true);
    } else {
      setEditorOpen(false);
    }
  }, [saving, isDirty]);

  useEffect(() => {
    if (!editorOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !discardConfirmOpen && !assetPickerTarget && !bgRemoveOpen) {
        requestCloseEditor();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editorOpen, discardConfirmOpen, assetPickerTarget, bgRemoveOpen, requestCloseEditor]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploadedUrl = await catalog.uploadProductImage(file);
      setDraft((prev) => ({ ...prev, image: uploadedUrl }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
      showToast('Studio photo uploaded');
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
      if (vErrors?.image) setEditorTab('media');
      else if (vErrors?.finishes || Object.keys(vErrors || {}).some((k) => k.startsWith('finish-')))
        setEditorTab('finishes');
      else setEditorTab('essentials');
      showToast('Please check highlighted fields', 'error');
      return;
    }

    setSaving(true);
    try {
      await catalog.saveProduct(input, editingProduct);
      setEditorOpen(false);
      showToast(
        editingProduct ? `Saved "${input.name}"` : `Added "${input.name}" to catalog`
      );
      await refreshSanityStatus();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustStock = async (product: Product, nextStock: number) => {
    setStockBusyId(product.id);
    try {
      await catalog.updateStock(product.id, nextStock);
    } catch {
      showToast('Could not update stock', 'error');
    } finally {
      setStockBusyId(null);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      await catalog.setProductStatus(product.id, nextStatus);
      showToast(
        nextStatus === 'active'
          ? `"${product.name}" · ${d.liveLabel}`
          : `"${product.name}" · ${d.draftLabel}`
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
      await refreshSanityStatus();
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
      showToast(`"${deleteTarget.name}" · ${d.draftLabel}`);
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
      showToast(`Restored ${missingStarterCount} pieces`);
    } catch {
      showToast('Could not import starter catalog', 'error');
    } finally {
      setImportingStarter(false);
    }
  };

  const moveFrame360 = (index: number, delta: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev.frames360];
      const targetIdx = index + delta;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
      return { ...prev, frames360: next };
    });
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-[24px] border border-line bg-card p-6">
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-ink-soft">
            {d.workspace} · {d.navProducts}
          </div>
          <h1 className="display mt-1 text-balance text-[clamp(22px,2.8vw,32px)] font-semibold tracking-[-0.03em] text-ink">
            {d.productsTitle}
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">{d.productsSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {missingStarterCount > 0 && (
            <button
              type="button"
              onClick={handleImportStarter}
              disabled={importingStarter}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-canvas px-4 text-[12px] font-medium text-ink whitespace-nowrap transition-colors hover:border-ink hover:bg-sand disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>
                {importingStarter ? d.restoringStarter : `${d.restoreStarter} (${missingStarterCount})`}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={openNewProduct}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium text-card whitespace-nowrap transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            <span>{d.newPieceCta}</span>
          </button>
        </div>
      </div>

      {/* Sanity Platform Sync Strip (Clean single-elevation row) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <Cloud className="h-5 w-5 shrink-0 text-accent" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-semibold text-ink">
                {sanityStatus?.connected ? d.sanityConnected : d.sanityStandby}
              </span>
              <span className="text-ink-faint" aria-hidden="true">
                ·
              </span>
              <span dir="ltr" className="font-mono text-[12px] text-ink-soft tabular">
                {sanityStatus?.projectId || 'yx4kz08m'} / {sanityStatus?.dataset || 'production'}
              </span>
              {sanityStatus?.connected && (
                <>
                  <span className="text-ink-faint" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono text-[12px] text-ink tabular">
                    {sanityStatus.productCount} {d.sanityDocsCount}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncFromSanity}
            disabled={sanitySyncing}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-canvas px-3.5 text-[12px] font-medium text-ink whitespace-nowrap transition-colors hover:border-ink hover:bg-sand disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-accent ${sanitySyncing ? 'animate-spin' : ''}`} />
            <span>{sanitySyncing ? d.syncingSanity : d.syncSanity}</span>
          </button>
          <button
            type="button"
            onClick={handleExportToSanity}
            disabled={exportingSanity}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-canvas px-3.5 text-[12px] font-medium text-ink whitespace-nowrap transition-colors hover:border-ink hover:bg-sand disabled:opacity-50"
          >
            <Database className="h-3.5 w-3.5 text-ink-soft" />
            <span>{exportingSanity ? d.seedingSanity : d.seedSanity}</span>
          </button>
          <a
            href="https://kvist-yx4kz08m.sanity.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-canvas px-3.5 text-[12px] font-medium text-ink whitespace-nowrap transition-colors hover:border-ink hover:bg-sand"
          >
            <ExternalLink className="h-3.5 w-3.5 text-ink-soft" />
            <span>Studio</span>
          </a>
          <button
            type="button"
            onClick={() => setSanityModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-canvas px-3.5 text-[12px] font-medium text-ink-soft whitespace-nowrap transition-colors hover:bg-sand hover:text-ink"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>{d.sanityGuide}</span>
          </button>
        </div>
      </div>

      {/* Filters, Search, Sort & Table/Grid View Switcher */}
      <div className="rounded-[24px] border border-line bg-card p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Interactive Status Filter Bar */}
          <div className="flex flex-wrap items-center gap-1 self-start rounded-xl bg-canvas p-1">
            {(
              [
                { id: 'all', label: d.tabAll, count: counts.all },
                { id: 'live', label: d.tabLive, count: counts.live },
                { id: 'drafts', label: d.tabDrafts, count: counts.drafts },
                { id: 'low', label: d.tabLow, count: counts.low },
              ] as const
            ).map((tab) => {
              const active = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id)}
                  className={`inline-flex h-8.5 items-center gap-2 rounded-lg px-3 text-[12px] font-medium whitespace-nowrap transition-colors ${
                    active ? 'bg-card text-ink shadow-xs' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono text-[11px] text-ink-faint tabular">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Category + Sort + Search + View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label={d.colCategory}
              className="h-10 rounded-xl border border-line bg-canvas px-3 text-[12px] font-medium text-ink focus:border-ink focus:bg-card focus:outline-none"
            >
              <option value="all">{d.allCategoriesOpt}</option>
              {catalog.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {localizeCategoryName(cat.id, catalog.categoriesById, locale)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort products"
              className="h-10 rounded-xl border border-line bg-canvas px-3 text-[12px] font-medium text-ink focus:border-ink focus:bg-card focus:outline-none"
            >
              <option value="order">{d.sortOrderOpt}</option>
              <option value="price-asc">{d.sortPriceAscOpt}</option>
              <option value="price-desc">{d.sortPriceDescOpt}</option>
              <option value="stock-asc">{d.sortStockAscOpt}</option>
            </select>

            <div className="relative min-w-[200px] flex-1 sm:w-56 sm:flex-initial">
              <Search className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={d.searchProductsPlaceholder}
                className="h-10 w-full rounded-xl border border-line bg-canvas pe-8 ps-9 text-[12px] text-ink placeholder:text-ink-faint focus:border-ink focus:bg-card focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 end-2.5 -translate-y-1/2 text-ink-faint hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Table / Grid View Toggle */}
            <div className="inline-flex h-10 items-center rounded-xl bg-canvas p-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title={d.viewTable}
                aria-label={d.viewTable}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-card text-ink shadow-xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title={d.viewGrid}
                aria-label={d.viewGrid}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-card text-ink shadow-xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-ink-faint">
              <Package className="h-5 w-5" />
            </div>
            <div className="mt-3 text-[15px] font-semibold text-ink">{d.noPiecesFound}</div>
            <p className="mt-1 max-w-sm text-[12.5px] text-ink-soft">{d.noPiecesFoundHint}</p>
            <button
              type="button"
              onClick={openNewProduct}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium text-card hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              <span>{d.newPieceCta}</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* High-Utility Table View */
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-start">
              <thead>
                <tr className="border-b border-line text-[11px] font-medium text-ink-faint">
                  <th className="pb-3 ps-2 text-start">{d.colPiece}</th>
                  <th className="pb-3 text-start">{d.colCategory}</th>
                  <th className="pb-3 text-start">{d.colPrice}</th>
                  <th className="pb-3 text-start">{d.colStock}</th>
                  <th className="pb-3 text-start">{d.colFinishes}</th>
                  <th className="pb-3 text-start">{d.colStatus}</th>
                  <th className="pb-3 pe-2 text-end">{d.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[13px]">
                {filtered.map((rawProduct) => {
                  const product = localizeProduct(rawProduct, locale);
                  const isLive = product.status === 'active';
                  const isOut = product.stock <= 0;
                  const isLow = product.stock > 0 && product.stock <= 12;
                  const has360 = Array.isArray(rawProduct.frames360) && rawProduct.frames360.length > 0;
                  const catLabel = localizeCategoryName(
                    product.category,
                    catalog.categoriesById,
                    locale
                  );
                  const busy = stockBusyId === product.id;

                  return (
                    <tr
                      key={product.id}
                      onClick={() => openEditProduct(rawProduct)}
                      className="group cursor-pointer transition-colors hover:bg-canvas/75"
                    >
                      <td className="py-3.5 ps-2">
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
                              <span className="truncate font-semibold text-ink">
                                {product.name}
                              </span>
                              {has360 && (
                                <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-accent">
                                  <Orbit className="h-3 w-3" />
                                  360°
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-soft">
                              <span dir="ltr" className="font-mono text-ink-faint">
                                /{product.id}
                              </span>
                              {product.badge && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{product.badge}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-[12.5px] text-ink-soft">{catLabel}</td>

                      <td dir="ltr" className="py-3.5 font-mono font-semibold text-ink tabular">
                        {formatPrice(product.price)}
                      </td>

                      <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <div
                            dir="ltr"
                            className="inline-flex h-8 items-center rounded-lg border border-line bg-canvas px-0.5"
                          >
                            <button
                              type="button"
                              disabled={busy || product.stock <= 0}
                              onClick={() => handleAdjustStock(rawProduct, product.stock - 1)}
                              aria-label="Decrease stock"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-card hover:text-ink disabled:opacity-35"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span
                              className={`w-9 text-center font-mono text-[12px] font-semibold tabular ${
                                isOut ? 'text-danger' : isLow ? 'text-warn' : 'text-ink'
                              }`}
                            >
                              {product.stock}
                            </span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleAdjustStock(rawProduct, product.stock + 1)}
                              aria-label="Increase stock"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-card hover:text-ink disabled:opacity-35"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          {isOut ? (
                            <span className="text-[11px] font-medium text-danger whitespace-nowrap">
                              {d.soldOutLabel}
                            </span>
                          ) : isLow ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-warn" />
                          ) : null}
                        </div>
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          {product.finishes.slice(0, 5).map((f) => (
                            <span
                              key={f.name}
                              title={`${f.name}${f.soldOut ? ` (${d.soldOutLabel})` : ''}`}
                              className={`h-4 w-4 rounded-full ring-1 ring-ink/20 ${
                                f.soldOut ? 'opacity-30' : ''
                              }`}
                              style={{ backgroundColor: f.color }}
                            />
                          ))}
                          {product.finishes.length > 5 && (
                            <span className="font-mono text-[11px] text-ink-faint tabular">
                              +{product.finishes.length - 5}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(rawProduct)}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-medium whitespace-nowrap transition-colors ${
                            isLive
                              ? 'border-ok/30 bg-ok-soft text-ok hover:bg-ok/20'
                              : 'border-line bg-canvas text-ink-soft hover:border-ink hover:text-ink'
                          }`}
                        >
                          {isLive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          <span>{isLive ? d.liveLabel : d.draftLabel}</span>
                        </button>
                      </td>

                      <td className="py-3.5 pe-2 text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          {isLive && (
                            <Link
                              href={`/product/${product.id}`}
                              title="View on storefront"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                            >
                              <CornerArrow className="h-4 w-4" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditProduct(rawProduct)}
                            title={d.editingLabel}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(rawProduct)}
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
          </div>
        ) : (
          /* Visual Card Grid View */
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((rawProduct) => {
              const product = localizeProduct(rawProduct, locale);
              const isLive = product.status === 'active';
              const isOut = product.stock <= 0;
              const isLow = product.stock > 0 && product.stock <= 12;
              const catLabel = localizeCategoryName(
                product.category,
                catalog.categoriesById,
                locale
              );
              const busy = stockBusyId === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => openEditProduct(rawProduct)}
                  className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-line bg-canvas/50 p-4 transition-colors hover:border-ink/40"
                >
                  <div>
                    <div
                      className={`relative aspect-[4/3] overflow-hidden rounded-xl p-4 ${
                        TINT_BG[product.tint] ?? 'bg-sand'
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(rawProduct);
                        }}
                        className={`absolute top-2.5 end-2.5 inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium shadow-xs ${
                          isLive ? 'bg-card text-ok' : 'bg-card text-ink-soft'
                        }`}
                      >
                        {isLive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{isLive ? d.liveLabel : d.draftLabel}</span>
                      </button>
                    </div>

                    <div className="mt-3.5 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-[14px] font-semibold text-ink">
                          {product.name}
                        </h3>
                        <div className="mt-0.5 text-[11.5px] text-ink-soft">
                          {catLabel} · {product.finishes.length} {d.colFinishes}
                        </div>
                      </div>
                      <span dir="ltr" className="font-mono text-[14px] font-semibold text-ink tabular">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="mt-4 flex items-center justify-between border-t border-line pt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      dir="ltr"
                      className="inline-flex h-8 items-center rounded-lg border border-line bg-card px-0.5"
                    >
                      <button
                        type="button"
                        disabled={busy || product.stock <= 0}
                        onClick={() => handleAdjustStock(rawProduct, product.stock - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-canvas hover:text-ink disabled:opacity-35"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span
                        className={`w-9 text-center font-mono text-[12px] font-semibold tabular ${
                          isOut ? 'text-danger' : isLow ? 'text-warn' : 'text-ink'
                        }`}
                      >
                        {product.stock}
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleAdjustStock(rawProduct, product.stock + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-canvas hover:text-ink disabled:opacity-35"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditProduct(rawProduct)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-ink-soft hover:text-ink"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(rawProduct)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-ink-soft hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabbed Slide-Over Product Editor Drawer */}
      <AnimatePresence>
        {editorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={requestCloseEditor}
              className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: dir === 'rtl' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '-100%' : '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 end-0 z-50 flex h-full w-full max-w-[700px] flex-col border-s border-line bg-card shadow-lift"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-ink-faint">
                    {editingProduct ? `${d.editingLabel} · /${editingProduct.id}` : d.newEntryLabel}
                  </div>
                  <h2 className="display truncate text-[20px] font-semibold tracking-[-0.02em] text-ink">
                    {draft.name || editingProduct?.name || d.newPieceCta}
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        status: prev.status === 'active' ? 'draft' : 'active',
                      }))
                    }
                    className={`inline-flex h-8.5 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-medium ${
                      draft.status === 'active'
                        ? 'border-ok/30 bg-ok-soft text-ok'
                        : 'border-line bg-canvas text-ink-soft'
                    }`}
                  >
                    {draft.status === 'active' ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    <span>{draft.status === 'active' ? d.liveLabel : d.draftLabel}</span>
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

              {/* Pinned Compact Card Preview + 3-Tab Switcher */}
              <div className="border-b border-line bg-canvas/70 px-6 py-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1.5 ${
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
                      <Package className="h-5 w-5 text-ink-faint" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-semibold text-ink">
                        {draft.name || 'Untitled piece'}
                      </span>
                      <span dir="ltr" className="font-mono text-[13px] font-semibold text-ink tabular">
                        {draft.price ? formatPrice(Number(draft.price)) : '$0'}
                      </span>
                    </div>
                    <div className="truncate text-[11.5px] text-ink-soft">
                      /{editingProduct?.id || slugifyProduct(draft.name || 'new-piece')} ·{' '}
                      {draft.finishes.length} {d.colFinishes}
                      {draft.frames360.length > 0 ? ` · ${draft.frames360.length} 360°` : ''}
                    </div>
                  </div>
                </div>

                {/* Drawer Section Tabs */}
                <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-canvas p-1 ring-1 ring-line">
                  {(
                    [
                      { id: 'essentials', label: d.tabEssentials },
                      { id: 'media', label: d.tabMedia },
                      { id: 'finishes', label: d.tabFinishes },
                    ] as const
                  ).map((tab) => {
                    const active = editorTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setEditorTab(tab.id)}
                        className={`h-8.5 rounded-lg px-2 text-[12px] font-medium whitespace-nowrap truncate transition-colors ${
                          active ? 'bg-ink text-card' : 'text-ink-soft hover:text-ink'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Form Body */}
              <form onSubmit={handleSaveProduct} className="flex-1 space-y-5 overflow-y-auto p-6">
                {editorTab === 'essentials' && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[12px] font-medium text-ink">
                          {d.fieldName} <span className="text-danger">*</span>
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
                            {d.fieldCategory} <span className="text-danger">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setAddingInlineCat((v) => !v)}
                            className="text-[11px] font-medium text-accent hover:underline"
                          >
                            {addingInlineCat ? d.cancelBtn : '+ New'}
                          </button>
                        </div>
                        <select
                          value={draft.category}
                          onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                          className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3 text-[13px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                        >
                          {catalog.categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {localizeCategoryName(cat.id, catalog.categoriesById, locale)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {addingInlineCat && (
                      <div className="rounded-2xl border border-line bg-canvas p-3.5">
                        <NewCategoryInlineForm
                          categories={catalog.categories}
                          onCreate={catalog.createCategory}
                          onCreated={(created) => {
                            setDraft((p) => ({ ...p, category: created.id }));
                            setAddingInlineCat(false);
                            showToast(`Added "${created.name}"`);
                          }}
                          onCancel={() => setAddingInlineCat(false)}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-[12px] font-medium text-ink">
                          {d.fieldPrice} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          dir="ltr"
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
                          {d.fieldStock} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          dir="ltr"
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
                          {d.fieldBadge}
                        </label>
                        <input
                          type="text"
                          value={draft.badge}
                          onChange={(e) => setDraft((p) => ({ ...p, badge: e.target.value }))}
                          placeholder="Signature, New…"
                          className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3.5 text-[13px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-ink">
                        {d.fieldBlurb} <span className="text-danger">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={draft.blurb}
                        onChange={(e) => {
                          setDraft((p) => ({ ...p, blurb: e.target.value }));
                          if (errors.blurb) setErrors((er) => ({ ...er, blurb: '' }));
                        }}
                        placeholder="Short architectural description of material, proportion, and feel..."
                        className={`mt-1.5 w-full rounded-xl border bg-canvas p-3 text-[13px] text-ink focus:bg-card focus:outline-none ${
                          errors.blurb ? 'border-danger' : 'border-line focus:border-ink'
                        }`}
                      />
                      {errors.blurb && (
                        <p className="mt-1 text-[11px] text-danger">{errors.blurb}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-ink">{d.fieldTint}</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {TINT_KEYS.map((tk: TintKey) => (
                          <button
                            key={tk}
                            type="button"
                            onClick={() => setDraft((p) => ({ ...p, tint: tk }))}
                            title={tk}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-transform ${
                              TINT_BG[tk]
                            } ${
                              draft.tint === tk
                                ? 'scale-110 border-ink ring-2 ring-ink/20'
                                : 'border-line hover:scale-105'
                            }`}
                          >
                            {draft.tint === tk && <Check className="h-4 w-4 text-ink" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {editorTab === 'media' && (
                  <>
                    {/* Studio Cutout Main Image */}
                    <div className="space-y-3 rounded-2xl border border-line bg-canvas/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-[12.5px] font-semibold text-ink">
                          {d.fieldMainImage} <span className="text-danger">*</span>
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (draft.image) {
                                setBgRemoveSource(draft.image);
                                setBgRemoveOpen(true);
                              } else {
                                bgFileInputRef.current?.click();
                              }
                            }}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-[11px] font-medium text-card hover:bg-accent"
                          >
                            <Scissors className="h-3.5 w-3.5" />
                            <span>{d.btnAiCutout}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssetPickerTarget('main')}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-[11px] font-medium text-ink hover:border-ink"
                          >
                            <Cloud className="h-3.5 w-3.5 text-accent" />
                            <span>{d.btnSanityLibrary}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-[11px] font-medium text-ink hover:border-ink"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>{d.btnUploadPhoto}</span>
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadFile}
                          className="hidden"
                        />
                        <input
                          ref={bgFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setBgRemoveSource(f);
                              setBgRemoveOpen(true);
                            }
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </div>

                      <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
                        {BUILTIN_PRODUCT_IMAGES.map((img) => {
                          const active = draft.image === img.path;
                          return (
                            <button
                              key={img.path}
                              type="button"
                              onClick={() => setDraft((p) => ({ ...p, image: img.path }))}
                              title={img.label}
                              className={`aspect-square overflow-hidden rounded-xl border p-1.5 transition-all ${
                                active
                                  ? 'border-ink bg-sand ring-2 ring-ink/15'
                                  : 'border-line bg-card hover:border-ink/40'
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

                      <input
                        type="text"
                        value={draft.image}
                        onChange={(e) => setDraft((p) => ({ ...p, image: e.target.value }))}
                        dir="ltr"
                        placeholder="https://cdn.sanity.io/images/... or /images/chair.webp"
                        className="h-9 w-full rounded-xl border border-line bg-card px-3 font-mono text-[11.5px] text-ink focus:border-ink focus:outline-none"
                      />
                      {errors.image && <p className="text-[11px] text-danger">{errors.image}</p>}
                    </div>

                    {/* In-the-Room Scene Photo */}
                    <div className="space-y-2.5 rounded-2xl border border-line bg-canvas/60 p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[12.5px] font-semibold text-ink">
                          {d.fieldSceneImage}
                        </label>
                        <button
                          type="button"
                          onClick={() => setAssetPickerTarget('scene')}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-[11px] font-medium text-ink hover:border-ink"
                        >
                          <ImageIcon className="h-3.5 w-3.5 text-accent" />
                          <span>{d.btnSanityLibrary}</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                        {ROOM_IMAGE_PRESETS.map((r) => (
                          <button
                            key={r.label}
                            type="button"
                            onClick={() => setDraft((p) => ({ ...p, scene: r.path }))}
                            className={`flex h-11 items-center justify-center overflow-hidden rounded-xl border text-[10px] font-medium ${
                              draft.scene === r.path
                                ? 'border-ink ring-2 ring-ink/15'
                                : 'border-line bg-card'
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
                              <span className="text-ink-faint">None</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 360° Multi-Angle Photos Strip */}
                    <div className="space-y-3 rounded-2xl border border-line bg-canvas/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <label className="block text-[12.5px] font-semibold text-ink">
                            {d.fieldFrames360}
                          </label>
                          <p className="text-[11px] text-ink-soft font-mono tabular">
                            {draft.frames360.length} frames
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAssetPickerTarget('frames360')}
                          className="inline-flex h-8.5 items-center gap-1.5 rounded-full bg-ink px-3.5 text-[11px] font-medium text-card hover:bg-accent"
                        >
                          <Orbit className="h-3.5 w-3.5" />
                          <span>{d.btnAdd360Photos}</span>
                        </button>
                      </div>

                      {draft.frames360.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {draft.frames360.map((frameUrl, idx) => (
                            <div
                              key={`${idx}-${frameUrl.slice(0, 24)}`}
                              className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-card p-1"
                            >
                              <img
                                src={frameUrl}
                                alt={`Frame ${idx + 1}`}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-contain"
                              />
                              <div className="absolute inset-x-1 bottom-1 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveFrame360(idx, -1)}
                                  className="flex h-5 w-5 items-center justify-center rounded bg-ink/80 text-card disabled:opacity-30"
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === draft.frames360.length - 1}
                                  onClick={() => moveFrame360(idx, 1)}
                                  className="flex h-5 w-5 items-center justify-center rounded bg-ink/80 text-card disabled:opacity-30"
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((p) => ({
                                    ...p,
                                    frames360: p.frames360.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="absolute top-1 end-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-card opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {editorTab === 'finishes' && (
                  <>
                    {/* Finishes & Per-Color Sold Out Toggle */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[12.5px] font-semibold text-ink">
                          {d.colFinishes} <span className="text-danger">*</span>
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
                          className="text-[11.5px] font-medium text-accent hover:underline"
                        >
                          {d.addFinishBtn}
                        </button>
                      </div>

                      {/* Quick 35-Swatch Picker */}
                      <div className="mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-line bg-canvas p-2.5">
                        {COLOR_SWATCH_LIBRARY.map((sw) => (
                          <button
                            key={sw.en}
                            type="button"
                            onClick={() =>
                              setDraft((p) => ({
                                ...p,
                                finishes: [
                                  ...p.finishes,
                                  { key: makeUid(), name: sw[locale] || sw.en, color: sw.color },
                                ],
                              }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-0.5 text-[11px] text-ink hover:bg-sand"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full ring-1 ring-ink/20"
                              style={{ backgroundColor: sw.color }}
                            />
                            <span>{localizeFinishName(sw.en, locale)}</span>
                          </button>
                        ))}
                      </div>

                      {/* Editable Finish Rows with Sold-Out Switch */}
                      <div className="mt-3 space-y-2">
                        {draft.finishes.map((fin, idx) => {
                          const finErr = errors[`finish-${idx}`];
                          const safePickerColor = /^#[0-9a-f]{6}$/i.test(fin.color)
                            ? fin.color
                            : '#d8c4a4';
                          const isColorOut = Boolean(fin.soldOut);

                          return (
                            <div key={fin.key} className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
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
                                  placeholder="Finish / color name"
                                  className={`h-9 min-w-[130px] flex-1 rounded-xl border bg-canvas px-3 text-[12px] text-ink focus:bg-card focus:outline-none ${
                                    finErr ? 'border-danger' : 'border-line focus:border-ink'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDraft((p) => ({
                                      ...p,
                                      finishes: p.finishes.map((f, i) =>
                                        i === idx ? { ...f, soldOut: !f.soldOut } : f
                                      ),
                                    }))
                                  }
                                  className={`h-9 shrink-0 rounded-xl border px-2.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
                                    isColorOut
                                      ? 'border-danger/30 bg-danger/10 text-danger'
                                      : 'border-ok/30 bg-ok-soft text-ok'
                                  }`}
                                >
                                  {isColorOut ? d.markColorSoldOut : d.markColorAvailable}
                                </button>
                                {draft.finishes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDraft((p) => ({
                                        ...p,
                                        finishes: p.finishes.filter((_, i) => i !== idx),
                                      }))
                                    }
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-canvas hover:text-danger"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              {finErr && <p className="text-[11px] text-danger">{finErr}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Construction Highlights */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[12.5px] font-semibold text-ink">
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
                          className="text-[11.5px] font-medium text-accent hover:underline"
                        >
                          {d.addHighlightBtn}
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
                                  details: p.details.map((item, i) =>
                                    i === idx ? { ...item, text: val } : item
                                  ),
                                }));
                              }}
                              placeholder="e.g. Solid FSC® oak frame"
                              className="h-9 flex-1 rounded-xl border border-line bg-canvas px-3 text-[12px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                            />
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
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dimensions, Care & 360 Shape */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[12px] font-medium text-ink">
                          {d.fieldDimensions}
                        </label>
                        <input
                          type="text"
                          value={draft.dimensions}
                          onChange={(e) =>
                            setDraft((p) => ({ ...p, dimensions: e.target.value }))
                          }
                          placeholder="W 82 × D 78 × H 74 cm"
                          className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3.5 text-[12px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-ink">
                          {d.fieldCare}
                        </label>
                        <input
                          type="text"
                          value={draft.care}
                          onChange={(e) => setDraft((p) => ({ ...p, care: e.target.value }))}
                          placeholder="Wipe clean; re-oil oak yearly"
                          className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3.5 text-[12px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-ink">
                        {d.field360Shape}
                      </label>
                      <select
                        value={draft.view360Type}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            view360Type: e.target.value as ProductDraft['view360Type'],
                          }))
                        }
                        className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3 text-[12.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                      >
                        <option value="auto">Auto-detect from Category</option>
                        <option value="chair">Lounge Chair / Sofa</option>
                        <option value="table">Architectural Table</option>
                        <option value="lamp">Lamp / Lighting</option>
                        <option value="vase">Ceramic / Object</option>
                      </select>
                    </div>
                  </>
                )}
              </form>

              {/* Drawer Footer */}
              <div className="flex items-center justify-between border-t border-line bg-card px-6 py-4">
                <button
                  type="button"
                  onClick={requestCloseEditor}
                  disabled={saving}
                  className="h-10 rounded-full border border-line px-4 text-[12px] font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {d.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProduct()}
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[12px] font-medium text-card transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {saving
                      ? d.savingBtn
                      : editingProduct
                      ? d.saveChangesBtn
                      : d.createPieceBtn}
                  </span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Embedded Sanity Media Picker Modal */}
      <ImageAssetPickerModal
        open={assetPickerTarget !== null}
        onClose={() => setAssetPickerTarget(null)}
        multiple={assetPickerTarget === 'frames360'}
        currentUrl={
          assetPickerTarget === 'main'
            ? draft.image
            : assetPickerTarget === 'scene'
            ? draft.scene
            : ''
        }
        title={
          assetPickerTarget === 'frames360'
            ? d.fieldFrames360
            : assetPickerTarget === 'scene'
            ? d.fieldSceneImage
            : d.fieldMainImage
        }
        onSelectSingle={(url) => {
          if (assetPickerTarget === 'main') {
            setDraft((p) => ({ ...p, image: url }));
            setErrors((er) => ({ ...er, image: '' }));
          } else if (assetPickerTarget === 'scene') {
            setDraft((p) => ({ ...p, scene: url }));
          }
          showToast('Image selected');
        }}
        onSelectMultiple={(urls) => {
          setDraft((p) => ({
            ...p,
            frames360: [...p.frames360, ...urls],
          }));
          showToast(`Added ${urls.length} 360° angles`);
        }}
      />

      {/* Embedded AI Background Remover ($0 On-Device) */}
      <BackgroundRemoverModal
        open={bgRemoveOpen}
        source={bgRemoveSource}
        filenameHint={draft.name || 'studio-piece'}
        canOfferKeepScene={true}
        onClose={() => {
          setBgRemoveOpen(false);
          setBgRemoveSource(null);
        }}
        onApply={({ cutoutUrl, originalSceneUrl }) => {
          setDraft((p) => ({
            ...p,
            image: cutoutUrl,
            ...(originalSceneUrl ? { scene: originalSceneUrl } : {}),
          }));
          setErrors((er) => ({ ...er, image: '' }));
          setBgRemoveOpen(false);
          setBgRemoveSource(null);
          showToast('Clean cutout applied');
        }}
      />

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
        description="This permanently removes the product from your catalog and Sanity CMS."
        confirmLabel="Delete permanently"
        tone="danger"
        busy={deleting}
        secondaryAction={
          deleteTarget && deleteTarget.status === 'active'
            ? { label: 'Move to drafts instead', onClick: handleHideInstead }
            : undefined
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Sanity Platform Setup Modal */}
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
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-card p-6 shadow-lift sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Cloud className="h-6 w-6 text-accent" />
                  <div>
                    <h3 className="display text-xl font-semibold text-ink">
                      Sanity CMS Integration
                    </h3>
                    <p className="text-[12px] text-ink-soft">
                      Connected project: yx4kz08m · production dataset
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSanityModalOpen(false)}
                  className="rounded-full p-2 text-ink-soft hover:bg-canvas hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-line bg-canvas p-4 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Connection Status</span>
                  <span className="font-mono text-ink">
                    {sanityStatus?.connected ? d.sanityConnected : d.sanityStandby}
                  </span>
                </div>
                <div dir="ltr" className="mt-2 font-mono text-[11.5px] text-ink-soft">
                  Project: {sanityStatus?.projectId || 'yx4kz08m'} · Dataset:{' '}
                  {sanityStatus?.dataset || 'production'}
                </div>
                <p className="mt-2 border-t border-line pt-2 text-[11.5px] text-ink-soft">
                  {sanityStatus?.message}
                </p>
              </div>

              <div className="mt-5 space-y-2.5 text-[12.5px] text-ink-soft">
                <p className="font-semibold text-ink">Environment Variables (Vercel & Local):</p>
                <div dir="ltr" className="rounded-xl bg-ink p-3.5 font-mono text-[11px] text-canvas">
                  <div>NEXT_PUBLIC_SANITY_PROJECT_ID=&quot;yx4kz08m&quot;</div>
                  <div>NEXT_PUBLIC_SANITY_DATASET=&quot;production&quot;</div>
                  <div>SANITY_API_TOKEN=&quot;your_editor_token&quot;</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('npx sanity deploy');
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-4 py-2 text-[12px] font-medium text-ink hover:bg-sand"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy CLI command</span>
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

export default function DashboardProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[24px] border border-line bg-card p-10 text-center text-[13px] text-ink-soft">
          Loading catalog studio…
        </div>
      }
    >
      <ProductsWorkspaceInner />
    </Suspense>
  );
}
