'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Eye,
  Layers,
  Palette,
  Plus,
  Sparkles,
  Tags,
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard-shell';
import { useShowroom } from '@/components/providers';
import { AnimatedNumber } from '@/components/ui-primitives';
import {
  formatPrice,
  formatInt,
  TINT_BG,
  Category,
} from '@/lib/catalog';
import {
  localizeCategoryName,
  localizeFinishName,
  localizeProduct,
} from '@/lib/i18n';

const CATEGORY_COLORS: Record<string, string> = {
  seating: '#C86D51',
  lighting: '#E2C9A8',
  tables: '#8FA387',
  textiles: '#A8B9C6',
  ceramics: '#D9C8B4',
};
const EXTRA_COLORS = ['#7A8B99', '#B9967B', '#9AAE92', '#C9A89B', '#8F8377'];

function getCategoryColor(catId: string, index = 0): string {
  return CATEGORY_COLORS[catId] || EXTRA_COLORS[index % EXTRA_COLORS.length];
}

function CollectionDonutTile({
  categories,
  categoriesById,
  countsByCat,
  totalPieces,
}: {
  categories: Category[];
  categoriesById: Record<string, Category>;
  countsByCat: Record<string, number>;
  totalPieces: number;
}) {
  const { locale, t } = useShowroom();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const r = 60;
  const C = 2 * Math.PI * r;
  const safeTotal = Math.max(1, totalPieces);

  const items = categories.map((c, idx) => {
    const count = countsByCat[c.id] || 0;
    const share = count / safeTotal;
    return {
      id: c.id,
      name: localizeCategoryName(c.id, categoriesById, locale),
      count,
      share,
      color: getCategoryColor(c.id, idx),
    };
  });

  const segments = items.map((item, idx) => {
    const len = item.share * C;
    const offset = items.slice(0, idx).reduce((acc, prev) => acc + prev.share * C, 0);
    return { ...item, len, offset };
  });

  const activeSeg = activeCat ? segments.find((s) => s.id === activeCat) : null;

  return (
    <div className="tile flex flex-col justify-between p-6 lg:col-span-5">
      <div>
        <div className="eyebrow-label">
          {t.collectionsEyebrow}
        </div>
        <h3 className="display mt-1 text-[20px] rtl:text-[18px] font-semibold tracking-[-0.02em] text-ink">
          {t.exploreByCraft}
        </h3>
      </div>

      <div className="my-5 flex items-center justify-center">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke="#F3EFEA"
              strokeWidth="18"
            />
            {segments.map((seg) => (
              <circle
                key={seg.id}
                cx="80"
                cy="80"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={activeCat === seg.id ? 21 : 18}
                strokeDasharray={`${Math.max(0, seg.len - 2)} ${C}`}
                strokeDashoffset={-seg.offset}
                onMouseEnter={() => setActiveCat(seg.id)}
                onMouseLeave={() => setActiveCat(null)}
                className="cursor-pointer transition-all duration-200"
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-medium text-ink-soft">
              {activeSeg ? activeSeg.name : t.navCatalog}
            </span>
            <span className="display text-[22px] font-semibold tracking-[-0.02em] text-ink tabular">
              {activeSeg ? activeSeg.count : totalPieces}
            </span>
            <span className="font-mono text-[10px] text-ink-faint">
              {activeSeg ? `${Math.round(activeSeg.share * 100)}%` : t.piecePlural}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {segments.map((seg) => (
          <div
            key={seg.id}
            onMouseEnter={() => setActiveCat(seg.id)}
            onMouseLeave={() => setActiveCat(null)}
            className="flex cursor-default items-center justify-between rounded-lg px-2 py-1 text-[12px] transition-colors hover:bg-canvas"
          >
            <span className="flex items-center gap-2 font-medium text-ink">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              {seg.name}
            </span>
            <span className="flex items-center gap-2 font-mono tabular">
              <span className="text-ink-soft">
                {seg.count} {t.piecePlural}
              </span>
              <span className="w-9 text-end text-ink-faint">
                {Math.round(seg.share * 100)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { catalog } = useDashboard();
  const { locale, dir, t } = useShowroom();
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;

  const liveCount = catalog.products.length;
  const draftCount = catalog.allProducts.length - liveCount;
  const totalFinishes = useMemo(
    () => catalog.allProducts.reduce((sum, p) => sum + p.finishes.length, 0),
    [catalog.allProducts]
  );
  const totalFloorUnits = useMemo(
    () => catalog.allProducts.reduce((sum, p) => sum + p.stock, 0),
    [catalog.allProducts]
  );

  const countsByCat = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of catalog.allProducts) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return map;
  }, [catalog.allProducts]);

  const allFinishSwatches = useMemo(() => {
    const map = new Map<string, { name: string; color: string; count: number }>();
    for (const p of catalog.allProducts) {
      for (const f of p.finishes) {
        const key = f.name.toLowerCase();
        const existing = map.get(key);
        if (existing) existing.count += 1;
        else
          map.set(key, {
            name: localizeFinishName(f.name, locale),
            color: f.color,
            count: 1,
          });
      }
    }
    return Array.from(map.values());
  }, [catalog.allProducts, locale]);

  const kpiCards = [
    {
      label: t.featuredPieces,
      value: liveCount,
      sub: draftCount > 0 ? `${draftCount} draft` : t.fullCatalog,
      icon: Eye,
    },
    {
      label: t.collectionsNav,
      value: catalog.categories.length,
      sub: t.exploreByCraft,
      icon: Tags,
    },
    {
      label: t.materialFinish,
      value: totalFinishes,
      sub: `${allFinishSwatches.length}`,
      icon: Palette,
    },
    {
      label: t.showroomsEyebrow,
      value: totalFloorUnits,
      sub: t.footerShowroomBtn,
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Studio Banner */}
      <div className="tile flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="eyebrow-label">
            <span>{t.showroomCatalogMode}</span>
          </div>
          <h1 className="display mt-1 text-[clamp(22px,2.8vw,32px)] rtl:text-[clamp(19px,2.3vw,26px)] font-semibold tracking-[-0.03em] text-ink">
            {t.catalogCuration}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/categories"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-canvas px-4 text-[12px] font-medium text-ink transition-colors hover:border-ink hover:bg-sand"
          >
            <Tags className="h-3.5 w-3.5" />
            {t.footerManageCollections}
          </Link>
          <Link
            href="/dashboard/products"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium text-card transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            {t.footerManagePieces}
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="tile flex flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-ink-soft">{card.label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-canvas text-ink">
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-4">
                <div className="display text-[32px] rtl:text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink tabular">
                  <AnimatedNumber value={card.value} format={formatInt} />
                </div>
                <div className="mt-2 text-[11px] text-ink-soft">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Catalog Pieces Gallery + Collection Breakdown */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="tile p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              {Boolean(t.showroomFloorEyebrow) && (
                <div className="eyebrow-label">
                  {t.showroomFloorEyebrow}
                </div>
              )}
              <h3 className="display mt-1 text-[20px] rtl:text-[18px] font-semibold tracking-[-0.02em] text-ink">
                {t.featuredPieces}
              </h3>
            </div>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-1 rounded-full bg-canvas px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-sand"
            >
              {t.footerManagePieces}
              <CornerArrow className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 divide-y divide-line">
            {catalog.allProducts.slice(0, 7).map((rawProduct) => {
              const product = localizeProduct(rawProduct, locale);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
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
                        <span className="truncate text-[13px] font-medium text-ink">
                          {product.name}
                        </span>
                        {product.badge && (
                          <span className="rounded-full bg-sand px-2 py-0.5 font-mono text-[10px] text-ink">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-ink-soft">
                        {product.dimensions}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden items-center gap-1 sm:flex">
                      {product.finishes.map((f) => (
                        <span
                          key={f.name}
                          title={f.name}
                          className="size-3 rounded-full ring-1 ring-ink/15"
                          style={{ backgroundColor: f.color }}
                        />
                      ))}
                    </div>
                    <span
                      dir="ltr"
                      className="font-mono text-[13px] font-semibold text-ink tabular"
                    >
                      {formatPrice(product.price)}
                    </span>
                    <Link
                      href={`/product/${product.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas text-ink-soft transition-colors hover:bg-sand hover:text-ink"
                      title={t.inspect}
                    >
                      <CornerArrow className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <CollectionDonutTile
          categories={catalog.categories}
          categoriesById={catalog.categoriesById}
          countsByCat={countsByCat}
          totalPieces={catalog.allProducts.length}
        />
      </div>

      {/* Material Swatch Library Overview */}
      <div className="tile p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="eyebrow-label">
              {t.materialityEyebrow}
            </div>
            <h3 className="display mt-1 text-[20px] rtl:text-[18px] font-semibold tracking-[-0.02em] text-ink">
              {t.materialFinish} ({allFinishSwatches.length})
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-[11px] font-medium text-ink-soft">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            {t.badgeSwatches}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {allFinishSwatches.map((swatch) => (
            <div
              key={swatch.name}
              className="inline-flex items-center gap-2 rounded-full bg-canvas px-3.5 py-2 text-[12px]"
            >
              <span
                className="size-4 rounded-full ring-1 ring-ink/20"
                style={{ backgroundColor: swatch.color }}
              />
              <span className="font-medium text-ink">{swatch.name}</span>
              <span dir="ltr" className="font-mono text-[10px] text-ink-faint">
                {swatch.color}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
