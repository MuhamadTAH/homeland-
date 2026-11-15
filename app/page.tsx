'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionValue,
  useScroll,
  useTransform,
} from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Layers,
  Leaf,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BUILTIN_CATEGORIES,
  EYEBROW_CLASS,
  formatPrice,
  imgPath,
  INPUT_CLASS,
  Product,
  STARTER_PRODUCTS,
  TAB_PILL,
  TINT_BG,
} from '@/lib/catalog';
import { CATEGORY_TRANSLATIONS, localizeCategoryName, localizeProduct } from '@/lib/i18n';
import { demoBackend, useCategories, useRoomScene, useStoreProducts } from '@/lib/demoBackend';
import { useShowroom } from '@/components/providers';
import {
  AnimatedNumber,
  Magnetic,
  Marquee,
  ProductCard,
  RevealBox,
  RevealText,
  SectionHeader,
  useMediaQuery,
  useParallax,
} from '@/components/ui-primitives';
import { StoreShell } from '@/components/store-shell';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const heroTileTransition = (idx: number) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.85, delay: 0.1 + idx * 0.08, ease: EASE_OUT_EXPO },
});

function RotatingSeal() {
  return (
    <motion.div
      dir="ltr"
      className="relative grid size-[76px] shrink-0 place-items-center rounded-full bg-card/70 backdrop-blur sm:size-[84px]"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.7, type: 'spring', stiffness: 160, damping: 14 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      >
        <defs>
          <path
            id="badge-circle"
            d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
          />
        </defs>
        <text className="fill-ink font-mono text-[10px] uppercase">
          <textPath href="#badge-circle" textLength="224" lengthAdjust="spacing">
            Wool bouclé · Solid oak ·
          </textPath>
        </text>
      </motion.svg>
      <Leaf className="size-5" aria-hidden="true" />
    </motion.div>
  );
}

function HeroLeadTile() {
  const { dir, t, openShowroom } = useShowroom();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      {...heroTileTransition(0)}
      className="tile relative flex flex-col justify-between overflow-hidden p-5 sm:col-span-2 sm:p-10 lg:col-span-7 lg:row-span-4"
    >
      <div className="my-auto flex flex-col justify-center py-4 sm:py-6">
        <h1 className="display max-w-[13ch] text-[2.55rem] sm:text-[clamp(2.95rem,6vw,7.6rem)] rtl:max-w-[16ch] rtl:text-[2.1rem] rtl:leading-[1.24] rtl:sm:text-[clamp(2.25rem,4.1vw,4.25rem)]">
          <RevealText key={t.heroTitle} text={t.heroTitle} delay={0.2} stagger={0.05} />
        </h1>
      </div>

      <motion.div
        className="mt-5 flex flex-col gap-4 sm:mt-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.8, ease: EASE_OUT_EXPO }}
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <p className="max-w-[44ch] text-[15px] leading-[1.55] text-ink-soft sm:text-[16px] rtl:max-w-[46ch] rtl:text-[14.5px] rtl:leading-[1.7] rtl:sm:text-[15px]">
            {t.heroBody}
          </p>
          <div className="grid shrink-0 grid-cols-[1.35fr_1fr] gap-2.5 sm:flex sm:gap-3">
            <Magnetic className="block sm:inline-block">
              <Link
                href="#collection-grid"
                className={`${BTN_PRIMARY} group w-full px-4 sm:w-auto sm:px-6 rtl:text-[14px]`}
              >
                {t.exploreCatalog}
                <DirArrow className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </Magnetic>
            <button
              type="button"
              onClick={() => openShowroom(null)}
              className={`${BTN_SECONDARY} px-4 sm:px-6 rtl:text-[14px]`}
            >
              <MapPin className="size-4 text-accent" />
              <span>{t.visitShowroom}</span>
            </button>
          </div>
        </div>

        {/* Value, Quality & Pricing Reassurance */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line/60 pt-3 text-[12px] sm:text-[12.5px] rtl:text-[12px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <Check className="size-3.5 text-ok" />
            <span>{t.valuePropDirectPrice}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <ShieldCheck className="size-3.5 text-ok" />
            <span>{t.valuePropWarranty}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <MapPin className="size-3.5 text-accent" />
            <span>{t.valuePropFreeDelivery}</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

const DEFAULT_HERO_PRODUCT = STARTER_PRODUCTS[0];

function HeroBestsellerTile({
  products,
  activeProductId,
  onSelectProduct,
}: {
  products: Product[];
  activeProductId: string;
  onSelectProduct: (id: string) => void;
}) {
  const { locale, dir } = useShowroom();
  const activeIndex = Math.max(
    0,
    products.findIndex((p) => p.id === activeProductId)
  );
  const liveProduct = products[activeIndex] ?? DEFAULT_HERO_PRODUCT;
  const product = localizeProduct(liveProduct, locale);
  const tileRef = useRef<HTMLDivElement | null>(null);
  const { x, y } = useParallax(tileRef, 22);
  const [selectedFinishIdx, setSelectedFinishIdx] = useState(0);
  const currentFinish = product.finishes[selectedFinishIdx] ?? product.finishes[0];

  const stepProduct = (delta: number) => {
    if (products.length === 0) return;
    const nextIdx = (activeIndex + delta + products.length) % products.length;
    setSelectedFinishIdx(0);
    onSelectProduct(products[nextIdx].id);
  };

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <motion.div
      {...heroTileTransition(1)}
      ref={tileRef}
      className={`relative min-h-[440px] overflow-hidden rounded-[var(--radius-tile)] transition-colors duration-500 sm:col-span-2 sm:min-h-[560px] lg:col-span-5 lg:row-span-6 lg:min-h-0 ${
        TINT_BG[product.tint] ?? 'bg-sage'
      }`}
    >
      {/* Dynamic finish aura */}
      {currentFinish && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35 transition-colors duration-500"
          style={{
            background: `radial-gradient(circle at 50% 52%, ${currentFinish.color} 0%, transparent 68%)`,
          }}
        />
      )}

      <div className="relative z-10 flex items-start justify-between gap-3 p-6 sm:p-8">
        <Link
          href={`/product/${product.id}`}
          className="group min-w-0"
        >
          <p className="truncate font-display text-2xl rtl:text-[1.35rem] font-semibold tracking-tight transition-opacity group-hover:opacity-75">
            {product.name}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            {product.dimensions.split('·')[0]}
          </p>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-card/80 p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => stepProduct(-1)}
              aria-label="Previous piece"
              className="grid size-8 place-items-center rounded-full text-ink transition-colors hover:bg-ink hover:text-canvas"
            >
              <PrevIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => stepProduct(1)}
              aria-label="Next piece"
              className="grid size-8 place-items-center rounded-full text-ink transition-colors hover:bg-ink hover:text-canvas"
            >
              <NextIcon className="size-4" />
            </button>
          </div>
          <div className="hidden sm:block">
            <RotatingSeal />
          </div>
        </div>
      </div>

      <motion.div className="absolute inset-x-[8%] bottom-[16%] top-[18%]" style={{ x, y }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={product.id}
            className="size-full"
            initial={{ y: 26, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.38, ease: EASE_OUT_EXPO }}
          >
            <Link
              href={`/product/${product.id}`}
              aria-label={product.name}
              className="group relative block size-full cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-[24%] bottom-[2%] h-[7%] rounded-[50%] bg-[#28321e]/30 blur-2xl"
              />
              <img
                src={product.image}
                alt={product.name}
                width={923}
                height={923}
                fetchPriority="high"
                referrerPolicy="no-referrer"
                className="relative size-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex justify-center sm:inset-x-6 sm:bottom-6">
        <div className="pointer-events-auto inline-flex items-center justify-center gap-3.5 rounded-full bg-card/85 px-5 py-2.5 backdrop-blur-md">
          <span dir="ltr" className="font-display text-xl font-semibold tabular">
            {formatPrice(product.price)}
          </span>
          <span aria-hidden="true" className="h-4 w-px bg-ink/15" />
          <div className="flex items-center gap-1.5">
            {product.finishes.map((fin, idx) => (
              <button
                key={fin.name}
                type="button"
                onClick={() => setSelectedFinishIdx(idx)}
                title={fin.name}
                className={`grid size-5 place-items-center rounded-full ${
                  idx === selectedFinishIdx ? 'ring-1 ring-ink' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <span
                  className="size-3.5 rounded-full ring-1 ring-ink/15"
                  style={{ backgroundColor: fin.color }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroCollectionStripTile({
  products,
  activeProductId,
  onSelectProduct,
}: {
  products: Product[];
  activeProductId: string;
  onSelectProduct: (id: string) => void;
}) {
  const { byId: categoriesById } = useCategories();
  const { locale, dir, t } = useShowroom();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      {...heroTileTransition(2)}
      className="tile flex flex-col justify-between gap-3.5 overflow-hidden p-5 sm:col-span-2 sm:p-6 lg:col-span-7 lg:row-span-2"
    >
      <div className="-mx-1 flex items-stretch gap-2.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((rawP) => {
          const locP = localizeProduct(rawP, locale);
          const isSelected = rawP.id === activeProductId;
          const catLabel = localizeCategoryName(rawP.category, categoriesById, locale);
          return (
            <button
              key={rawP.id}
              type="button"
              onClick={() => onSelectProduct(rawP.id)}
              onMouseEnter={() => onSelectProduct(rawP.id)}
              title={locP.name}
              aria-label={locP.name}
              aria-pressed={isSelected}
              className={`group/thumb relative flex shrink-0 items-center gap-3 rounded-2xl p-2 pe-4 text-start transition-all duration-200 ${
                isSelected
                  ? 'bg-ink text-canvas shadow-tile ring-1 ring-ink'
                  : 'bg-canvas/90 text-ink ring-1 ring-line hover:bg-sand/80'
              }`}
            >
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-xl p-1.5 sm:size-16 ${
                  TINT_BG[rawP.tint] ?? 'bg-stone'
                }`}
              >
                <img
                  src={rawP.image}
                  alt={locP.name}
                  width={64}
                  height={64}
                  referrerPolicy="no-referrer"
                  className="size-full object-contain transition-transform duration-200 group-hover/thumb:scale-108"
                />
              </span>
              <span className="max-w-[128px] min-w-0">
                <span
                  className={`block truncate text-[10.5px] rtl:text-[11px] ${
                    isSelected ? 'text-canvas/70' : 'text-ink-soft'
                  }`}
                >
                  {catLabel}
                </span>
                <span className="mt-0.5 block truncate text-[13px] rtl:text-[12.5px] font-medium leading-tight">
                  {locP.name}
                </span>
                <span
                  dir="ltr"
                  className={`mt-1 block font-mono text-[11px] font-semibold tabular ${
                    isSelected ? 'text-canvas/90' : 'text-ink'
                  }`}
                >
                  {formatPrice(rawP.price)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-start rtl:justify-end">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-1.5 rounded-full bg-canvas px-4 py-1.5 text-[12.5px] rtl:text-[12.5px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-canvas hover:ring-ink"
        >
          <span>{t.seeMore}</span>
          <DirArrow className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}

function HeroBentoSection() {
  const { products } = useStoreProducts();
  const [activeProductId, setActiveProductId] = useState<string>(DEFAULT_HERO_PRODUCT.id);

  return (
    <section className="px-3 pt-[5.5rem] sm:px-5 sm:pt-24">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:h-[calc(100svh-7rem)] lg:min-h-[660px] lg:grid-cols-12 lg:grid-rows-6">
        <HeroLeadTile />
        <HeroBestsellerTile
          products={products}
          activeProductId={activeProductId}
          onSelectProduct={setActiveProductId}
        />
        <HeroCollectionStripTile
          products={products}
          activeProductId={activeProductId}
          onSelectProduct={setActiveProductId}
        />
      </div>
    </section>
  );
}

function BrowseCategoriesSection() {
  const { products } = useStoreProducts();
  const { locale, dir, t } = useShowroom();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const counts = useMemo(
    () =>
      Object.fromEntries(
        BUILTIN_CATEGORIES.map((c) => [c.id, products.filter((p) => p.category === c.id).length])
      ),
    [products]
  );

  return (
    <section className="px-3 sm:px-5">
      <div className="mx-auto">
        <SectionHeader
          eyebrowText={t.collectionsEyebrow}
          title={t.exploreByCraft}
          link={{ to: '/shop', label: t.fullCatalog }}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {BUILTIN_CATEGORIES.map((cat, idx) => {
            const catTitle = CATEGORY_TRANSLATIONS[cat.id]?.[locale] ?? cat.name;
            const cCount = counts[cat.id] ?? 0;
            return (
              <RevealBox
                key={cat.id}
                delay={idx * 0.06}
                className={idx === 0 ? 'col-span-2 lg:col-span-2 lg:row-span-2' : ''}
              >
                <Link
                  href={`/shop?c=${cat.id}`}
                  className={`group relative flex h-full overflow-hidden rounded-[var(--radius-tile)] p-4 sm:p-6 ${
                    TINT_BG[cat.tint]
                  } ${
                    idx === 0
                      ? 'min-h-[300px] p-6 lg:min-h-[520px]'
                      : 'min-h-[200px] sm:min-h-[220px] lg:min-h-0'
                  }`}
                >
                  <div className="relative z-10 flex w-full items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className={`font-display font-semibold tracking-tight ${
                          idx === 0
                            ? 'text-4xl sm:text-5xl rtl:text-3xl rtl:sm:text-4xl'
                            : 'text-xl sm:text-2xl rtl:text-lg rtl:sm:text-xl'
                        }`}
                      >
                        {catTitle}
                      </p>
                      <p className="mt-1 text-[14px] rtl:text-[13px] text-ink-soft">
                        {cCount} {cCount === 1 ? t.pieceSingular : t.piecePlural}
                      </p>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card/80 transition-[transform,background-color] duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-45 rtl:group-hover:rotate-45 group-hover:bg-ink group-hover:text-canvas sm:size-11">
                      <DirArrow className="size-4" />
                    </span>
                  </div>
                  <img
                    src={cat.image}
                    alt=""
                    loading="lazy"
                    width={600}
                    height={600}
                    referrerPolicy="no-referrer"
                    className={`absolute object-contain transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-3 group-hover:-rotate-2 ${
                      idx === 0
                        ? 'bottom-[4%] end-[6%] h-[76%]'
                        : 'bottom-[6%] end-[6%] h-[60%]'
                    }`}
                  />
                </Link>
              </RevealBox>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FavouritesSection() {
  const [activeTab, setActiveTab] = useState('all');
  const [manageMode, setManageMode] = useState(false);
  const { products } = useStoreProducts();
  const { categories, byId: categoriesById } = useCategories();
  const { locale, t } = useShowroom();

  const tabIds = useMemo(
    () => ['all', ...categories.map((c) => c.id)],
    [categories]
  );

  const visible =
    activeTab === 'all' ? products : products.filter((p) => p.category === activeTab);

  return (
    <section id="collection-grid" className="scroll-mt-20 px-3 sm:px-5">
      <div className="mx-auto">
        <SectionHeader tight title={t.featuredPieces}>
          <div className="flex flex-wrap items-center gap-2">
            <LayoutGroup id="fav">
              <div className="-mx-3 w-[calc(100%+1.5rem)] overflow-x-auto px-3 py-1 [scrollbar-width:none] sm:mx-0 sm:w-auto sm:px-0">
                <div
                  role="tablist"
                  aria-label={t.featuredPieces}
                  className="flex w-max gap-1 rounded-full bg-card p-1 shadow-tile"
                >
                  {tabIds.map((tabId) => (
                    <button
                      key={tabId}
                      role="tab"
                      aria-selected={activeTab === tabId}
                      onClick={() => setActiveTab(tabId)}
                      className={`${TAB_PILL} h-9 rtl:text-[13px] ${
                        activeTab === tabId ? 'text-canvas' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      {activeTab === tabId && (
                        <motion.span
                          layoutId="fav-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-ink"
                          transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        />
                      )}
                      {tabId === 'all'
                        ? CATEGORY_TRANSLATIONS.all?.[locale] ?? 'All'
                        : localizeCategoryName(tabId, categoriesById, locale)}
                    </button>
                  ))}
                </div>
              </div>
            </LayoutGroup>

            {/* Direct Add Product & Delete Mode Buttons */}
            <div className="flex items-center gap-1.5">
              <Link
                href="/add"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-canvas shadow-tile transition-colors hover:bg-accent"
              >
                <Plus className="size-3.5" />
                <span>
                  {locale === 'ckb'
                    ? 'زیادکردنی بەرهەم'
                    : locale === 'ar'
                    ? 'إضافة منتج'
                    : 'Add Product'}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setManageMode((v) => !v)}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium transition-colors ${
                  manageMode
                    ? 'bg-danger text-white shadow-tile'
                    : 'bg-card text-ink-soft shadow-tile hover:text-ink'
                }`}
              >
                <Trash2 className="size-3.5" />
                <span>
                  {manageMode
                    ? locale === 'ckb'
                      ? 'تەواو'
                      : 'Done'
                    : locale === 'ckb'
                    ? 'سڕینەوەی بەرهەم'
                    : locale === 'ar'
                    ? 'حذف منتج'
                    : 'Delete Mode'}
                </span>
              </button>
            </div>
          </div>
        </SectionHeader>

        <motion.div
          layout
          className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                className="relative"
                initial={{ opacity: 0, y: 24 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: idx * 0.04, duration: 0.55, ease: EASE_OUT_EXPO },
                }}
                exit={{ opacity: 0, y: 16, transition: { duration: 0.2 } }}
                transition={{ layout: { type: 'spring', stiffness: 260, damping: 30 } }}
              >
                <RevealBox delay={(idx % 4) * 0.05}>
                  <ProductCard product={product} />
                </RevealBox>

                {manageMode && (
                  <button
                    type="button"
                    onClick={() => demoBackend.deleteProduct(product.id)}
                    className="absolute end-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-danger px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-lift transition-transform hover:scale-105"
                  >
                    <Trash2 className="size-3.5" />
                    <span>{locale === 'ckb' ? 'سڕینەوە' : 'Delete'}</span>
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Direct Add New Product Tile at the end of Our Products */}
          <Link
            href="/add"
            className="group flex min-h-[260px] flex-col items-center justify-center rounded-[var(--radius-tile)] border-2 border-dashed border-line bg-card/45 p-6 text-center transition-all hover:border-ink hover:bg-card"
          >
            <span className="grid size-12 place-items-center rounded-full bg-sand text-ink transition-transform group-hover:scale-110 group-hover:bg-ink group-hover:text-canvas">
              <Plus className="size-5" />
            </span>
            <p className="mt-3 font-display text-base font-semibold text-ink">
              {locale === 'ckb'
                ? '+ زیادکردنی بەرهەمی نوێ'
                : locale === 'ar'
                ? '+ إضافة منتج جديد'
                : '+ Add New Product'}
            </p>
            <p className="mt-1 max-w-[200px] text-[12px] text-ink-soft">
              {locale === 'ckb'
                ? 'زیادکردنی بەرهەم، تایبەتمەندییەکان، ڕەنگەکان و مۆدێلی ٣٦٠°'
                : 'Add product, specifications, finishes & 360° view'}
            </p>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function ManifestoWord({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: React.ReactNode;
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <motion.span aria-hidden="true" style={{ opacity }} className="inline">
      {children}{' '}
    </motion.span>
  );
}

function OurWaySection() {
  const ref = useRef<HTMLElement | null>(null);
  const manifestoRef = useRef<HTMLDivElement | null>(null);
  const { byId } = useStoreProducts();
  const roomScene = useRoomScene();
  const { locale, dir, t } = useShowroom();
  const [activeHotspot, setActiveHotspot] = useState<string>('spot-2');
  const { scrollYProgress: textProgress } = useScroll({
    target: manifestoRef,
    offset: ['start 92%', 'start 45%'],
  });

  const words = t.manifestoText.split(' ');
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;

  const hotspots = useMemo(() => {
    return roomScene.hotspots.map((spot) => {
      const baseProd =
        byId[spot.productId] ??
        STARTER_PRODUCTS.find((p) => p.id === spot.productId) ??
        STARTER_PRODUCTS[0];
      const locProd = localizeProduct(baseProd, locale);
      return {
        ...spot,
        id: baseProd.id,
        soldOut: baseProd.stock <= 0,
        name: locProd.name,
        detail: `${locProd.finishes[0]?.name ?? ''} · ${locProd.dimensions.split('·')[0].trim()}`,
        price: locProd.price,
        image: locProd.image,
      };
    });
  }, [roomScene.hotspots, byId, locale]);

  const selectedPin =
    hotspots.find((h) => h.key === activeHotspot) ?? hotspots[0] ?? null;

  return (
    <section ref={ref} className="pt-20 sm:pt-32">
      {/* Open-Canvas Editorial Manifesto */}
      <div ref={manifestoRef} className="mx-auto max-w-6xl px-5 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className={EYEBROW_CLASS}>{t.philosophyEyebrow}</p>
            <p
              className="mt-5 font-display text-[clamp(2rem,4.2vw,4rem)] leading-[1.06] tracking-[-0.035em] font-semibold rtl:text-[clamp(1.45rem,2.6vw,2.45rem)] rtl:leading-[1.52]"
              aria-label={t.manifestoText}
            >
              {words.map((word, idx) => (
                <ManifestoWord
                  key={`${locale}-${idx}`}
                  progress={textProgress}
                  range={[idx / words.length, (idx + 1) / words.length]}
                >
                  {word}
                </ManifestoWord>
              ))}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 border-t border-line pt-6 lg:col-span-4 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
            {(
              [
                [12, t.statWorkshops],
                [100, t.statOak],
                [10, t.statWarranty],
              ] as const
            ).map(([val, label], idx) => (
              <div key={label}>
                <p className="font-display text-3xl sm:text-4xl rtl:text-2xl rtl:sm:text-3xl font-semibold tracking-tight">
                  <AnimatedNumber value={val} from={0} duration={1.2} delay={idx * 0.1} />
                </p>
                <p className="mt-1 text-[12px] text-ink-soft sm:text-[13px] rtl:text-[12px]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Width Architectural Room Showcase with Interactive Hotspots */}
      <div id="room-vignette" className="mt-12 px-3 sm:mt-16 sm:px-5">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] sm:aspect-[16/10] sm:max-h-[680px] sm:rounded-[36px]">
          <img
            src={roomScene.image || imgPath('interior.jpg')}
            alt=""
            loading="lazy"
            width={1536}
            height={1024}
            referrerPolicy="no-referrer"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/10" />

          {/* Interactive Hotspots */}
          {hotspots.map((spot) => {
            const isActive = selectedPin?.key === spot.key;
            return (
              <button
                key={spot.key}
                type="button"
                onClick={() => setActiveHotspot(spot.key)}
                onMouseEnter={() => setActiveHotspot(spot.key)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                aria-label={spot.name}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span
                  className={`relative grid size-9 place-items-center rounded-full transition-transform duration-300 ${
                    isActive
                      ? 'scale-115 bg-ink text-canvas ring-4 ring-card/80'
                      : 'bg-card/90 text-ink shadow-lift hover:scale-110'
                  }`}
                >
                  <span className="size-2.5 rounded-full bg-current" />
                </span>
              </button>
            );
          })}

          {/* Caption & Active Piece Card */}
          <div className="absolute inset-x-4 bottom-4 flex flex-col justify-between gap-4 sm:inset-x-8 sm:bottom-8 sm:flex-row sm:items-end">
            <div className="max-w-sm text-canvas">
              <p className="font-mono text-[11px] rtl:text-[12px] uppercase tracking-[0.16em] text-canvas/75">
                {roomScene.eyebrow?.trim() || t.vignetteEyebrow}
              </p>
              <p className="mt-1 font-display text-2xl sm:text-3xl rtl:text-xl rtl:sm:text-2xl font-semibold tracking-tight">
                {roomScene.title?.trim() || t.vignetteTitle}
              </p>
            </div>

            {selectedPin && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPin.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center justify-between gap-3.5 rounded-2xl bg-card/92 p-3.5 shadow-lift backdrop-blur-md sm:w-84"
                >
                  <img
                    src={selectedPin.image}
                    alt={selectedPin.name}
                    width={56}
                    height={56}
                    referrerPolicy="no-referrer"
                    className="size-14 shrink-0 rounded-xl bg-stone object-contain p-1.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-ink">
                      {selectedPin.name}
                    </p>
                    <p className="truncate text-[12px] text-ink-soft">{selectedPin.detail}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        dir="ltr"
                        className="font-display text-[14px] font-semibold text-ink tabular"
                      >
                        {formatPrice(selectedPin.price)}
                      </span>
                      {selectedPin.soldOut && (
                        <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-semibold text-danger">
                          {t.soldOutLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/product/${selectedPin.id}`}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-canvas transition-transform hover:scale-105"
                    aria-label={selectedPin.name}
                  >
                    <CornerArrow className="size-4" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const PILLAR_META = [
  { icon: Leaf, value: 100, tint: 'bg-sage' },
  { icon: Layers, value: 780, tint: 'bg-butter' },
  { icon: ShieldCheck, value: 10, tint: 'bg-sky' },
  { icon: Compass, value: 18, tint: 'bg-blush' },
] as const;

function CraftPromiseSection() {
  const { t } = useShowroom();

  return (
    <section className="px-3 sm:px-5">
      <div className="mx-auto">
        <SectionHeader eyebrowText={t.materialityEyebrow} title={t.materialityTitle} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PILLAR_META.map((meta, idx) => {
            const Icon = meta.icon;
            const copy = t.pillars[idx];
            return (
              <RevealBox key={idx} delay={idx * 0.06}>
                <div
                  className={`flex h-full flex-col justify-between gap-5 rounded-[var(--radius-tile)] p-5 sm:min-h-[260px] sm:p-6 ${meta.tint}`}
                >
                  <span className="grid size-10 place-items-center rounded-2xl bg-card sm:size-12">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p
                      dir="ltr"
                      className="font-display text-4xl sm:text-5xl rtl:text-end font-semibold tracking-tight"
                    >
                      <AnimatedNumber value={meta.value} />
                      <span className="text-lg sm:text-2xl rtl:text-base rtl:sm:text-xl">
                        {copy.suffix}
                      </span>
                    </p>
                    <p className="mt-2 font-medium sm:mt-3 rtl:text-[15px]">{copy.title}</p>
                    <p className="mt-1 text-[13px] leading-snug text-ink-soft sm:text-[14px] rtl:text-[13px] rtl:leading-relaxed">
                      {copy.text}
                    </p>
                  </div>
                </div>
              </RevealBox>
            );
          })}
        </div>
      </div>
    </section>
  );
}


function NewsletterSection() {
  const { t } = useShowroom();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  return (
    <section className="px-3 py-14 sm:px-5 sm:py-28">
      <RevealBox className="relative grid overflow-hidden rounded-[28px] sm:rounded-[32px] lg:grid-cols-2">
        <div className="relative z-10 bg-ink p-6 text-canvas sm:p-14">
          <p className="font-mono text-[11px] rtl:text-[12px] uppercase tracking-[0.16em] text-canvas/60">
            {t.journalEyebrow}
          </p>
          <h2 className="display mt-3 text-[clamp(2.15rem,4.6vw,4.25rem)] rtl:text-[clamp(1.65rem,3vw,2.7rem)] sm:mt-4">
            {t.journalTitle}
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-canvas/70 sm:mt-4 sm:text-base rtl:text-[14.5px] rtl:leading-[1.75]">
            {t.journalBody}
          </p>

          <AnimatePresence mode="wait" initial={false}>
            {status === 'done' ? (
              <motion.p
                key="done"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-canvas/10 py-2 ps-2 pe-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <span className="grid size-9 place-items-center rounded-full bg-ok">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {t.journalDone}
              </motion.p>
            ) : (
              <motion.form
                key="form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!/^\S+@\S+\.\S+$/.test(email)) {
                    setStatus('error');
                    return;
                  }
                  setStatus('sending');
                  try {
                    await demoBackend.subscribe(email);
                    setStatus('done');
                  } catch {
                    setStatus('error');
                  }
                }}
                className="mt-8 flex max-w-md flex-col gap-2 min-[400px]:flex-row"
                exit={{ opacity: 0, y: -8 }}
                noValidate
              >
                <label htmlFor="nl-email" className="sr-only">
                  Email
                </label>
                <motion.input
                  id="nl-email"
                  dir="ltr"
                  type="email"
                  autoComplete="email"
                  placeholder={t.journalPlaceholder}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  aria-invalid={status === 'error'}
                  className={`${INPUT_CLASS} bg-canvas/10 text-canvas ring-canvas/20 placeholder:text-canvas/45 focus:bg-canvas/15 focus:ring-canvas`}
                  animate={status === 'error' ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="h-12 shrink-0 rounded-2xl bg-canvas px-5 text-[15px] rtl:text-[14px] font-medium text-ink transition-transform active:scale-95"
                >
                  {status === 'sending' ? t.journalJoining : t.journalSubscribe}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {status === 'error' && (
            <p className="mt-2 text-[13px] text-[#f0a597]">{t.journalError}</p>
          )}
        </div>

        <div className="relative min-h-[220px] sm:min-h-[300px]">
          <img
            src={imgPath('cta.jpg')}
            alt=""
            loading="lazy"
            width={1536}
            height={1024}
            referrerPolicy="no-referrer"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </RevealBox>
    </section>
  );
}

function HomeContent() {
  const { t } = useShowroom();

  return (
    <>
      <HeroBentoSection />
      <Marquee className="py-2.5 sm:py-3.5" items={t.marqueeItems} />
      <FavouritesSection />
      <BrowseCategoriesSection />
      <OurWaySection />
      <CraftPromiseSection />
      <NewsletterSection />
    </>
  );
}

export default function HomePage() {
  return (
    <StoreShell>
      <HomeContent />
    </StoreShell>
  );
}
