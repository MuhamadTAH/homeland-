'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { Eye, Search, SlidersHorizontal, X } from 'lucide-react';
import { EYEBROW_CLASS, Product, TAB_PILL } from '@/lib/catalog';
import {
  CATEGORY_TRANSLATIONS,
  localizeCategoryName,
  localizeProduct,
} from '@/lib/i18n';
import { useCategories, useStoreProducts } from '@/lib/demoBackend';
import { useShowroom } from '@/components/providers';
import { ProductCard, RevealText, RollingDigit } from '@/components/ui-primitives';
import { StoreShell } from '@/components/store-shell';

const SORT_FNS: Record<string, (a: Product, b: Product) => number> = {
  featured: () => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, loaded } = useStoreProducts();
  const { categories, byId } = useCategories();
  const { locale, t } = useShowroom();

  const [materialFilter, setMaterialFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [preferScene, setPreferScene] = useState(false);

  const rawCat = searchParams.get('c') ?? '';
  const activeCategory = byId[rawCat] ? rawCat : 'all';

  const visibleCategories = useMemo(
    () =>
      categories.filter((c) => c.builtIn || products.some((p) => p.category === c.id)),
    [categories, products]
  );

  const rawSort = searchParams.get('sort') ?? '';
  const activeSort = SORT_FNS[rawSort] ? rawSort : 'featured';
  const query = searchParams.get('q') ?? '';

  const sortOptions = useMemo(
    () => [
      { key: 'featured', label: t.sortFeatured },
      { key: 'price-asc', label: t.sortPriceAsc },
      { key: 'price-desc', label: t.sortPriceDesc },
      { key: 'name', label: t.sortName },
    ],
    [t]
  );

  const materialFilters = useMemo(
    () => [
      { id: 'all', label: t.matAll, keywords: [] as string[] },
      { id: 'oak', label: t.matOak, keywords: ['oak', 'timber', 'wood', 'ash'] },
      { id: 'textile', label: t.matTextile, keywords: ['wool', 'bouclé', 'linen', 'feather'] },
      {
        id: 'ceramic',
        label: t.matCeramic,
        keywords: ['stoneware', 'terracotta', 'clay', 'glaze', 'paper'],
      },
    ],
    [t]
  );

  const priceFilters = useMemo(
    () => [
      { id: 'all', label: t.priceAll, test: () => true },
      { id: 'under-150', label: t.priceUnder150, test: (p: number) => p < 150 },
      { id: '150-500', label: t.price150To500, test: (p: number) => p >= 150 && p <= 500 },
      { id: 'over-500', label: t.priceOver500, test: (p: number) => p > 500 },
    ],
    [t]
  );

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!val || val === 'all' || val === 'featured') {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    const qs = next.toString();
    router.replace(`/shop${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matEntry =
      materialFilters.find((m) => m.id === materialFilter) ?? materialFilters[0];
    const priceEntry =
      priceFilters.find((pr) => pr.id === priceFilter) ?? priceFilters[0];

    return products
      .filter((p) => activeCategory === 'all' || p.category === activeCategory)
      .filter((p) => {
        if (matEntry.keywords.length === 0) return true;
        const text = `${p.name} ${p.blurb} ${p.details.join(' ')} ${p.finishes
          .map((f) => f.name)
          .join(' ')}`.toLowerCase();
        return matEntry.keywords.some((kw) => text.includes(kw));
      })
      .filter((p) => priceEntry.test(p.price))
      .filter((rawP) => {
        if (!q) return true;
        const locP = localizeProduct(rawP, locale);
        const haystack = `${rawP.name} ${locP.name} ${rawP.blurb} ${locP.blurb} ${
          byId[rawP.category]?.name ?? ''
        } ${localizeCategoryName(rawP.category, byId, locale)} ${rawP.finishes
          .map((f) => f.name)
          .join(' ')} ${locP.finishes.map((f) => f.name).join(' ')}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort(SORT_FNS[activeSort]);
  }, [
    products,
    byId,
    activeCategory,
    activeSort,
    query,
    materialFilter,
    priceFilter,
    materialFilters,
    priceFilters,
    locale,
  ]);

  const headingTitle =
    activeCategory === 'all'
      ? t.fullCatalog
      : localizeCategoryName(activeCategory, byId, locale);

  const hasActiveSubFilters =
    materialFilter !== 'all' || priceFilter !== 'all' || Boolean(query);

  return (
    <section className="px-3 pb-12 pt-24 sm:px-5 sm:pb-24 sm:pt-32">
      <div className="mx-auto">
        <div className="tile flex flex-col gap-5 p-5 sm:gap-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={EYEBROW_CLASS}>
              <RollingDigit value={filteredProducts.length} />{' '}
              {filteredProducts.length === 1 ? t.archPieceSingular : t.archPiecePlural}
            </p>
            <h1
              key={headingTitle}
              className="display mt-3 text-[clamp(2.75rem,6.5vw,6rem)] rtl:text-[clamp(2rem,4vw,3.5rem)]"
            >
              <RevealText text={headingTitle} />
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <span className="sr-only">{t.search}</span>
              <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={query}
                onChange={(e) => updateParam('q', e.target.value)}
                placeholder={t.searchShopPlaceholder}
                className="h-11 w-full rounded-full bg-canvas ps-10 pe-10 text-[14px] outline-none ring-1 ring-line transition-shadow focus:ring-2 focus:ring-ink sm:w-64 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  onClick={() => updateParam('q', '')}
                  className="absolute end-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-line"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={() => setPreferScene((v) => !v)}
              aria-pressed={preferScene}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-medium ring-1 transition-colors ${
                preferScene
                  ? 'bg-ink text-canvas ring-ink'
                  : 'bg-canvas text-ink-soft ring-line hover:text-ink'
              }`}
            >
              <Eye className="size-4" />
              <span>{preferScene ? t.inRoomView : t.studioView}</span>
            </button>

            <label className="relative">
              <span className="sr-only">Sort</span>
              <select
                value={activeSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="h-11 w-full appearance-none rounded-full bg-canvas ps-4 pe-10 text-[14px] outline-none ring-1 ring-line focus:ring-2 focus:ring-ink"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-ink-soft"
              >
                ▾
              </span>
            </label>
          </div>
        </div>

        {/* Category Pills + Secondary Material & Price Filters */}
        <div className="mt-4 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <LayoutGroup id="shop-filter">
            <div
              role="tablist"
              aria-label="Categories"
              className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]"
            >
              {[{ id: 'all', name: CATEGORY_TRANSLATIONS.all[locale] }, ...visibleCategories].map(
                (cat) => (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={activeCategory === cat.id}
                    onClick={() => updateParam('c', cat.id)}
                    className={`${TAB_PILL} shrink-0 ${
                      activeCategory === cat.id
                        ? 'text-canvas'
                        : 'bg-card text-ink-soft hover:text-ink'
                    }`}
                  >
                    {activeCategory === cat.id && (
                      <motion.span
                        layoutId="shop-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-ink"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    {cat.id === 'all'
                      ? cat.name
                      : localizeCategoryName(cat.id, byId, locale)}
                  </button>
                )
              )}
            </div>
          </LayoutGroup>

          {/* Material & Budget Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-soft">
              <SlidersHorizontal className="size-3.5" />
              {t.materialLabel}
            </span>
            <div className="flex flex-wrap gap-1">
              {materialFilters.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMaterialFilter(m.id)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    materialFilter === m.id
                      ? 'bg-ink text-canvas'
                      : 'bg-card text-ink-soft hover:text-ink'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              aria-label="Filter by price range"
              className="h-8 rounded-full bg-card px-3 text-[12px] font-medium text-ink-soft ring-1 ring-line hover:text-ink focus:outline-none"
            >
              {priceFilters.map((pf) => (
                <option key={pf.id} value={pf.id}>
                  {pf.label}
                </option>
              ))}
            </select>

            {hasActiveSubFilters && (
              <button
                type="button"
                onClick={() => {
                  setMaterialFilter('all');
                  setPriceFilter('all');
                  updateParam('q', '');
                }}
                className="rounded-full bg-sand px-3 py-1 text-[11px] font-medium text-ink hover:bg-line"
              >
                {t.resetFilters}
              </button>
            )}
          </div>
        </div>

        <motion.div
          layout
          className="mt-5 grid grid-cols-2 gap-x-3 gap-y-7 sm:mt-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.03 + idx * 0.04,
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
                transition={{ layout: { type: 'spring', stiffness: 260, damping: 30 } }}
              >
                <ProductCard
                  product={product}
                  priority={idx < 4}
                  preferScene={preferScene}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {filteredProducts.length === 0 && loaded && (
            <motion.div
              className="tile mt-4 p-12 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-display text-3xl font-semibold">
                {t.noPiecesMatch}
              </p>
              <p className="mt-2 text-ink-soft">
                {t.noPiecesSub}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMaterialFilter('all');
                  setPriceFilter('all');
                  updateParam('q', '');
                  updateParam('c', 'all');
                }}
                className="mt-5 inline-flex h-10 items-center rounded-full bg-ink px-5 text-[13px] font-medium text-canvas"
              >
                {t.showAllPieces}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default function ShopPage() {
  return (
    <StoreShell>
      <Suspense fallback={<div className="min-h-[80vh]" />}>
        <ShopContent />
      </Suspense>
    </StoreShell>
  );
}
