'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  LayoutGrid,
  Package,
  Tags,
  Crosshair,
  Orbit,
  ArrowUpLeft,
  ArrowUpRight,
  Menu,
  X,
  Plus,
  Cloud,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Logo } from './ui-primitives';
import { LanguageSwitcher } from './store-shell';
import { useShowroom } from './providers';
import {
  useAllProducts,
  useCategories,
  demoBackend,
} from '@/lib/demoBackend';
import {
  Product,
  Category,
  normalizeCategoryName,
  slugifyProduct,
  uniqueProductSlug,
} from '@/lib/catalog';
import { getDashCopy } from '@/lib/dashboard-i18n';

export interface SanityConnectionInfo {
  connected: boolean;
  productCount: number;
  projectId: string;
  dataset: string;
  message: string;
}

export interface CatalogManager {
  products: Product[];
  allProducts: Product[];
  byId: Record<string, Product>;
  categories: Category[];
  categoriesById: Record<string, Category>;
  loaded: boolean;
  error: string | null;
  saveProduct: (
    input: Omit<Product, 'id' | 'position' | 'rating' | 'reviews'>,
    existing?: Product | null
  ) => Promise<void>;
  setProductStatus: (id: string, status: 'active' | 'draft') => Promise<void>;
  updateStock: (id: string, stock: number) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  importStarterCatalog: () => Promise<void>;
  createCategory: (name: string) => Promise<Category>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string, moveToCategoryId: string | null) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
}

export interface DashboardContextValue {
  now: number;
  catalog: CatalogManager;
  sanityStatus: SanityConnectionInfo | null;
  sanitySyncing: boolean;
  refreshSanityStatus: () => Promise<void>;
  syncCatalogFromSanity: () => Promise<{ count: number; source: 'sanity' | 'local' }>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside DashboardShell');
  return ctx;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, dir, t } = useShowroom();
  const d = getDashCopy(locale);
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;

  const {
    products: allProducts,
    byId: productsById,
    loaded: productsLoaded,
  } = useAllProducts();
  const {
    categories,
    byId: categoriesById,
    loaded: categoriesLoaded,
  } = useCategories();

  const [now] = useState(() => Date.now());
  const [drawerOpenPath, setDrawerOpenPath] = useState<string | null>(null);
  const [sanityStatus, setSanityStatus] = useState<SanityConnectionInfo | null>(null);
  const [sanitySyncing, setSanitySyncing] = useState(false);

  const drawerOpen = drawerOpenPath === pathname;

  const setDrawerOpen = useCallback(
    (open: boolean) => {
      setDrawerOpenPath(open ? pathname : null);
    },
    [pathname]
  );

  const refreshSanityStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/sanity/status');
      if (res.ok) {
        const data = await res.json();
        setSanityStatus(data);
      }
    } catch {
      // non-fatal
    }
  }, []);

  const syncCatalogFromSanity = useCallback(async () => {
    setSanitySyncing(true);
    try {
      const result = await demoBackend.syncFromSanity();
      await demoBackend.syncRoomSceneFromSanity();
      await refreshSanityStatus();
      return result;
    } finally {
      setSanitySyncing(false);
    }
  }, [refreshSanityStatus]);

  useEffect(() => {
    let active = true;
    fetch('/api/sanity/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setSanityStatus(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen, setDrawerOpen]);

  const catalog = useMemo<CatalogManager>(() => {
    const active = allProducts.filter((p) => p.status === 'active');
    return {
      products: active,
      allProducts,
      byId: productsById,
      categories,
      categoriesById,
      loaded: productsLoaded && categoriesLoaded,
      error: null,
      saveProduct: async (input, existing) => {
        if (existing) {
          await demoBackend.updateProduct(existing.id, input);
        } else {
          const id = uniqueProductSlug(
            input.name,
            allProducts.map((p) => p.id)
          );
          const nextPos =
            allProducts.reduce((m, p) => Math.max(m, p.position ?? 0), -1) + 1;
          await demoBackend.createProduct({
            ...input,
            id,
            position: nextPos,
            rating: 4.9,
            reviews: 12,
          });
        }
      },
      setProductStatus: async (id, status) => {
        await demoBackend.updateProduct(id, { status });
      },
      updateStock: async (id, stock) => {
        const clamped = Math.max(0, Math.round(stock));
        await demoBackend.updateProduct(id, { stock: clamped });
      },
      deleteProduct: async (id) => {
        await demoBackend.deleteProduct(id);
      },
      importStarterCatalog: async () => {
        await demoBackend.importStarterCatalog();
      },
      createCategory: async (rawName) => {
        const name = normalizeCategoryName(rawName);
        const id = slugifyProduct(name);
        const position = categories.length;
        await demoBackend.createCategory({ id, name, position });
        return { id, name, builtIn: false, position };
      },
      renameCategory: async (id, rawName) => {
        const name = normalizeCategoryName(rawName);
        await demoBackend.renameCategory(id, name);
      },
      deleteCategory: async (id, moveToCategoryId) => {
        await demoBackend.deleteCategory(id, moveToCategoryId);
      },
      uploadProductImage: async (file) => {
        return await demoBackend.uploadProductImage(file);
      },
    };
  }, [
    allProducts,
    productsById,
    categories,
    categoriesById,
    productsLoaded,
    categoriesLoaded,
  ]);

  const lowStockCount = useMemo(
    () => allProducts.filter((p) => p.stock <= 12).length,
    [allProducts]
  );

  const navItems = [
    { to: '/dashboard', label: d.navOverview, icon: LayoutGrid, exact: true },
    {
      to: '/dashboard/products',
      label: d.navProducts,
      icon: Package,
      count: allProducts.length,
      alertCount: lowStockCount,
    },
    {
      to: '/dashboard/categories',
      label: d.navCategories,
      icon: Tags,
      count: categories.length,
    },
    {
      to: '/dashboard/room',
      label: d.navRoom,
      icon: Crosshair,
    },
    {
      to: '/add',
      label: d.navAddStudio,
      icon: Orbit,
    },
  ];

  const currentSectionLabel = useMemo(() => {
    if (pathname === '/dashboard') return d.navOverview;
    if (pathname.startsWith('/dashboard/products')) return d.navProducts;
    if (pathname.startsWith('/dashboard/categories')) return d.navCategories;
    if (pathname.startsWith('/dashboard/room')) return d.navRoom;
    return d.workspace;
  }, [pathname, d]);

  const renderSidebarContent = (onCloseMobile?: () => void) => (
    <div className="flex h-full flex-col">
      {/* Brand header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="inline-flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Logo />
        </Link>
        {onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label={t.closeMenu}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-canvas hover:text-ink lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <span className="text-[11px] font-medium text-ink-faint">{t.studio}</span>
        )}
      </div>

      {/* Primary Workspace Nav */}
      <nav className="mt-5 space-y-1">
        <div className="px-2.5 pb-1.5 text-[11px] font-medium text-ink-faint">
          {t.catalogCuration}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              href={item.to}
              onClick={onCloseMobile}
              className={`group flex h-10 items-center justify-between rounded-xl px-3 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-ink text-card'
                  : 'text-ink-soft hover:bg-canvas hover:text-ink'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </span>
              {item.count !== undefined && (
                <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] tabular">
                  {item.alertCount ? (
                    <span
                      className={
                        isActive ? 'text-warn-soft' : 'font-semibold text-warn'
                      }
                    >
                      {item.alertCount}!
                    </span>
                  ) : null}
                  <span className={isActive ? 'text-card/75' : 'text-ink-faint'}>
                    {item.count}
                  </span>
                </span>
              )}
            </Link>
          );
        })}

        {/* Storefront & Cloud */}
        <div className="px-2.5 pt-6 pb-1.5 text-[11px] font-medium text-ink-faint">
          {t.publicShowroom}
        </div>
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex h-10 items-center justify-between rounded-xl px-3 text-[13px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
        >
          <span className="truncate whitespace-nowrap">{t.showroomHome}</span>
          <CornerArrow className="h-3.5 w-3.5 shrink-0" />
        </Link>
        <Link
          href="/shop"
          onClick={onCloseMobile}
          className="flex h-10 items-center justify-between rounded-xl px-3 text-[13px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
        >
          <span className="truncate whitespace-nowrap">{t.fullCatalog}</span>
          <CornerArrow className="h-3.5 w-3.5 shrink-0" />
        </Link>
        <a
          href="https://kvist-yx4kz08m.sanity.studio/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center justify-between rounded-xl px-3 text-[13px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
        >
          <span className="truncate whitespace-nowrap">{d.externalSanityStudio}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      </nav>

      {/* Bottom Sanity Cloud Connection Panel */}
      <div className="mt-auto pt-6">
        <div className="rounded-2xl border border-line bg-canvas p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[12px] font-semibold text-ink">
              <Cloud className="h-4 w-4 text-accent" />
              <span className="truncate">
                {sanityStatus?.connected ? d.sanityConnected : d.sanityStandby}
              </span>
            </span>
            <button
              type="button"
              onClick={() => syncCatalogFromSanity()}
              disabled={sanitySyncing}
              title={d.syncSanity}
              aria-label={d.syncSanity}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${sanitySyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-ink-soft tabular">
            <span>{sanityStatus?.projectId || 'yx4kz08m'}</span>
            <span aria-hidden="true">·</span>
            <span>{sanityStatus?.dataset || 'production'}</span>
            {sanityStatus?.connected && (
              <>
                <span aria-hidden="true">·</span>
                <span>{sanityStatus.productCount}</span>
              </>
            )}
          </div>
          <div className="mt-3 lg:hidden">
            <LanguageSwitcher compact />
          </div>
        </div>
      </div>
    </div>
  );

  const ctxValue: DashboardContextValue = {
    now,
    catalog,
    sanityStatus,
    sanitySyncing,
    refreshSanityStatus,
    syncCatalogFromSanity,
  };

  const drawerOffset = dir === 'rtl' ? '100%' : '-100%';

  return (
    <DashboardContext.Provider value={ctxValue}>
      <div className="min-h-screen bg-canvas">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
          {/* Mobile Header — Compact <= 15% height */}
          <header className="sticky top-2 z-30 pt-2 lg:hidden">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card/95 px-3.5 py-2.5 shadow-tile backdrop-blur">
              <div className="flex min-w-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label={t.openMenu}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink transition-colors hover:bg-sand"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <Link href="/dashboard" className="inline-flex items-center shrink-0">
                  <Logo />
                </Link>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/dashboard/products?new=1"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-[12px] font-medium text-card whitespace-nowrap shrink-0 hover:bg-accent"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{d.newPieceCta}</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setDrawerOpen(false)}
                  className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] lg:hidden"
                />
                <motion.aside
                  initial={{ x: drawerOffset }}
                  animate={{ x: 0 }}
                  exit={{ x: drawerOffset }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed top-0 start-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col border-e border-line bg-card p-5 shadow-lift lg:hidden"
                >
                  {renderSidebarContent(() => setDrawerOpen(false))}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Workspace Layout */}
          <div className="flex flex-col gap-5 py-4 lg:flex-row lg:items-start lg:py-6">
            {/* Fixed-Width Left Sidebar (256px) */}
            <aside className="hidden w-[256px] shrink-0 lg:block">
              <div className="sticky top-6 flex min-h-[calc(100vh-3rem)] flex-col rounded-[24px] border border-line bg-card p-5">
                {renderSidebarContent()}
              </div>
            </aside>

            {/* Right Content Area */}
            <div className="min-w-0 flex-1 space-y-5">
              {/* Clean 3-Zone Workspace Top Bar */}
              <header className="hidden h-14 items-center justify-between gap-8 rounded-2xl border border-line bg-card px-5 lg:flex">
                <div className="flex min-w-0 items-center gap-2 text-[13px] whitespace-nowrap shrink-0">
                  <Link
                    href="/dashboard"
                    className="font-medium text-ink-soft transition-colors hover:text-ink"
                  >
                    {d.workspace}
                  </Link>
                  <span className="text-ink-faint" aria-hidden="true">
                    /
                  </span>
                  <span className="font-semibold text-ink">{currentSectionLabel}</span>
                </div>

                <nav className="flex items-center gap-6 text-[13px] font-medium text-ink-soft">
                  <Link
                    href="/dashboard"
                    className={`whitespace-nowrap shrink-0 transition-colors hover:text-ink ${
                      pathname === '/dashboard' ? 'text-ink underline underline-offset-4' : ''
                    }`}
                  >
                    {d.navOverview}
                  </Link>
                  <Link
                    href="/dashboard/products"
                    className={`whitespace-nowrap shrink-0 transition-colors hover:text-ink ${
                      pathname.startsWith('/dashboard/products')
                        ? 'text-ink underline underline-offset-4'
                        : ''
                    }`}
                  >
                    {d.navProducts}
                  </Link>
                  <Link
                    href="/dashboard/room"
                    className={`whitespace-nowrap shrink-0 transition-colors hover:text-ink ${
                      pathname.startsWith('/dashboard/room')
                        ? 'text-ink underline underline-offset-4'
                        : ''
                    }`}
                  >
                    {d.navRoom}
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors hover:text-ink"
                  >
                    <span>{d.openShowroomCta}</span>
                    <CornerArrow className="h-3.5 w-3.5" />
                  </Link>
                </nav>

                <div className="flex shrink-0 items-center gap-3">
                  <LanguageSwitcher compact />
                  <Link
                    href="/dashboard/products?new=1"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[12px] font-medium text-card whitespace-nowrap shrink-0 transition-colors hover:bg-accent"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{d.newPieceCta}</span>
                  </Link>
                </div>
              </header>

              <main className="min-w-0 space-y-5">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
