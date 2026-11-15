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
  ArrowUpLeft,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
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
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside DashboardShell');
  return ctx;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dir, t } = useShowroom();
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
  const drawerOpen = drawerOpenPath === pathname;

  const setDrawerOpen = useCallback(
    (open: boolean) => {
      setDrawerOpenPath(open ? pathname : null);
    },
    [pathname]
  );

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

  const draftCount = useMemo(
    () => allProducts.filter((p) => p.status === 'draft').length,
    [allProducts]
  );

  const navItems = [
    { to: '/dashboard', label: t.studioOverview, icon: LayoutGrid, exact: true },
    {
      to: '/dashboard/products',
      label: t.piecesNav,
      icon: Package,
      badge: allProducts.length,
      subBadge: draftCount > 0 ? `${draftCount} draft` : undefined,
    },
    {
      to: '/dashboard/categories',
      label: t.collectionsNav,
      icon: Tags,
      badge: categories.length,
    },
  ];

  const renderSidebarContent = (onCloseMobile?: () => void) => (
    <>
      <div className="flex items-center justify-between px-3 py-2.5">
        <Link href="/dashboard" onClick={onCloseMobile} className="inline-flex items-center">
          <Logo />
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-canvas px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            {t.studio}
          </span>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label={t.closeMenu}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-canvas hover:text-ink lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 px-2">
        <LanguageSwitcher compact />
      </div>

      <nav className="mt-5 space-y-1">
        <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
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
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-ink text-card'
                  : 'text-ink-soft hover:bg-canvas hover:text-ink'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.badge !== undefined && (
                <span className="flex items-center gap-1">
                  {item.subBadge && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular ${
                        isActive ? 'bg-card/15 text-card/80' : 'bg-warn-soft text-warn'
                      }`}
                    >
                      {item.subBadge}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] tabular ${
                      isActive ? 'bg-card/15 text-card' : 'bg-canvas text-ink-soft'
                    }`}
                  >
                    {item.badge}
                  </span>
                </span>
              )}
            </Link>
          );
        })}

        <div className="px-3 pt-5 pb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          {t.publicShowroom}
        </div>
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
        >
          <span>{t.showroomHome}</span>
          <CornerArrow className="h-4 w-4" />
        </Link>
        <Link
          href="/shop"
          onClick={onCloseMobile}
          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
        >
          <span>{t.fullCatalog}</span>
          <CornerArrow className="h-4 w-4" />
        </Link>
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-canvas p-4">
          <div className="flex items-center gap-2 text-[12px] font-medium text-ink">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>{t.showroomCatalogMode}</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-[1.5] text-ink-soft">
            {t.showroomCatalogModeDesc}
          </p>
        </div>
      </div>
    </>
  );

  const ctxValue: DashboardContextValue = {
    now,
    catalog,
  };

  const drawerOffset = dir === 'rtl' ? '100%' : '-100%';

  return (
    <DashboardContext.Provider value={ctxValue}>
      <div className="min-h-screen bg-canvas">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="sticky top-2 z-30 pt-2 lg:hidden">
            <div className="tile flex items-center justify-between px-3.5 py-2.5 shadow-tile">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label={t.openMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-ink transition-colors hover:bg-sand"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <Link href="/dashboard" className="inline-flex items-center">
                  <Logo />
                </Link>
                <span className="rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  {t.studio}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher compact />
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-card"
                >
                  {t.showroom}
                  <CornerArrow className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setDrawerOpen(false)}
                  className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] lg:hidden"
                />
                <motion.aside
                  initial={{ x: drawerOffset }}
                  animate={{ x: 0 }}
                  exit={{ x: drawerOffset }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed top-0 start-0 z-50 flex h-full w-[280px] max-w-[84vw] flex-col bg-card p-4 shadow-lift lg:hidden"
                >
                  {renderSidebarContent(() => setDrawerOpen(false))}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-3 py-3 lg:grid-cols-12 lg:py-5">
            <aside className="hidden lg:col-span-3 lg:block xl:col-span-2">
              <div className="tile sticky top-5 flex min-h-[calc(100vh-2.5rem)] flex-col p-4">
                {renderSidebarContent()}
              </div>
            </aside>
            <main className="min-w-0 space-y-3 lg:col-span-9 xl:col-span-10">
              {children}
            </main>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
