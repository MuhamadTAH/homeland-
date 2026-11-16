'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpLeft,
  ArrowUpRight,
  Cloud,
  Crosshair,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  Minus,
  Orbit,
  Palette,
  Plus,
  RefreshCw,
  Scissors,
  Tags,
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard-shell';
import { useShowroom } from '@/components/providers';
import { AnimatedNumber } from '@/components/ui-primitives';
import { DashToast, useDashToast } from '@/components/dashboard-ui';
import {
  formatInt,
  formatPrice,
  TINT_BG,
} from '@/lib/catalog';
import {
  localizeCategoryName,
  localizeFinishName,
  localizeProduct,
} from '@/lib/i18n';
import { getDashCopy } from '@/lib/dashboard-i18n';

const CATEGORY_COLORS: Record<string, string> = {
  seating: '#C86D51',
  lighting: '#C59A4B',
  tables: '#6E8566',
  textiles: '#5D7A91',
  ceramics: '#9A7D65',
};
const EXTRA_COLORS = ['#7A8B99', '#B9967B', '#6E8566', '#9D6D5E', '#8F8377'];

function getCategoryColor(catId: string, index = 0): string {
  return CATEGORY_COLORS[catId] || EXTRA_COLORS[index % EXTRA_COLORS.length];
}

export default function DashboardOverviewPage() {
  const { catalog, sanityStatus, sanitySyncing, syncCatalogFromSanity } = useDashboard();
  const { locale, dir, t } = useShowroom();
  const d = getDashCopy(locale);
  const { notice, show: showToast, dismiss } = useDashToast();
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;

  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const liveCount = catalog.products.length;
  const totalCount = catalog.allProducts.length;
  const draftCount = totalCount - liveCount;
  const lowOrOutProducts = useMemo(
    () => catalog.allProducts.filter((p) => p.stock <= 12),
    [catalog.allProducts]
  );
  const totalFloorUnits = useMemo(
    () => catalog.allProducts.reduce((sum, p) => sum + p.stock, 0),
    [catalog.allProducts]
  );
  const count360Ready = useMemo(
    () => catalog.allProducts.filter((p) => Array.isArray(p.frames360) && p.frames360.length > 0).length,
    [catalog.allProducts]
  );

  const countsByCat = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of catalog.allProducts) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return map;
  }, [catalog.allProducts]);

  const categoryBreakdown = useMemo(() => {
    const safeTotal = Math.max(1, totalCount);
    return catalog.categories.map((c, idx) => {
      const count = countsByCat[c.id] || 0;
      return {
        id: c.id,
        name: localizeCategoryName(c.id, catalog.categoriesById, locale),
        count,
        pct: Math.round((count / safeTotal) * 100),
        color: getCategoryColor(c.id, idx),
      };
    });
  }, [catalog.categories, catalog.categoriesById, countsByCat, totalCount, locale]);

  const allFinishSwatches = useMemo(() => {
    const map = new Map<string, { name: string; color: string; count: number }>();
    for (const p of catalog.allProducts) {
      for (const f of p.finishes) {
        const key = `${f.name.toLowerCase()}-${f.color.toLowerCase()}`;
        const existing = map.get(key);
        if (existing) existing.count += 1;
        else {
          map.set(key, {
            name: localizeFinishName(f.name, locale),
            color: f.color,
            count: 1,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [catalog.allProducts, locale]);

  // Prioritize low/sold-out items first so owners see urgent stock right away, then catalog items
  const curatedRows = useMemo(() => {
    const sorted = [...catalog.allProducts].sort((a, b) => {
      const aUrgent = a.stock <= 12 ? 0 : 1;
      const bUrgent = b.stock <= 12 ? 0 : 1;
      if (aUrgent !== bUrgent) return aUrgent - bUrgent;
      return (a.position ?? 0) - (b.position ?? 0);
    });
    return sorted.slice(0, 8);
  }, [catalog.allProducts]);

  const handleAdjustStock = async (id: string, nextStock: number) => {
    setBusyId(id);
    try {
      await catalog.updateStock(id, nextStock);
    } catch {
      showToast('Could not update stock', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'draft', name: string) => {
    const next = currentStatus === 'active' ? 'draft' : 'active';
    setBusyId(id);
    try {
      await catalog.setProductStatus(id, next);
      showToast(
        next === 'active'
          ? `${name} · ${d.liveLabel}`
          : `${name} · ${d.draftLabel}`
      );
    } catch {
      showToast('Could not update visibility', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleQuickSync = async () => {
    const res = await syncCatalogFromSanity();
    showToast(
      res.source === 'sanity'
        ? `${d.sanityConnected} (${res.count})`
        : d.sanityStandby
    );
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Primary Action Strip */}
      <section className="flex flex-wrap items-end justify-between gap-4 rounded-[24px] border border-line bg-card p-6">
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-ink-soft">
            {d.workspace} · {sanityStatus?.projectId || 'yx4kz08m'} / {sanityStatus?.dataset || 'production'}
          </div>
          <h1 className="display mt-1 text-balance text-[clamp(24px,2.8vw,34px)] font-semibold tracking-[-0.03em] text-ink">
            {t.catalogCuration}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-[1.55] text-ink-soft">
            {d.overviewSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleQuickSync}
            disabled={sanitySyncing}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-canvas px-4 text-[12px] font-medium text-ink whitespace-nowrap shrink-0 transition-colors hover:border-ink hover:bg-sand disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-accent ${sanitySyncing ? 'animate-spin' : ''}`} />
            <span>{sanitySyncing ? d.syncingSanity : d.syncSanity}</span>
          </button>

          <Link
            href="/add"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-canvas px-4 text-[12px] font-medium text-ink whitespace-nowrap shrink-0 transition-colors hover:border-ink hover:bg-sand"
          >
            <Scissors className="h-3.5 w-3.5 text-accent" />
            <span>{d.navAddStudio}</span>
          </Link>

          <Link
            href="/dashboard/products?new=1"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium text-card whitespace-nowrap shrink-0 transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            <span>{d.newPieceCta}</span>
          </Link>
        </div>
      </section>

      {/* 4 Single-Elevation KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/products?tab=live"
          className="group flex flex-col justify-between rounded-[22px] border border-line bg-card p-5 transition-colors hover:border-ink/40"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-ink-soft">{d.kpiLiveLabel}</span>
            <Eye className="h-4 w-4 text-ink-faint transition-colors group-hover:text-ink" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="display text-[32px] font-semibold leading-none text-ink tabular">
              <AnimatedNumber value={liveCount} format={formatInt} />
            </span>
            <span className="font-mono text-[12px] text-ink-faint tabular">/ {totalCount}</span>
          </div>
          <div className="mt-3 text-[12px] text-ink-soft">
            {draftCount > 0 ? `${draftCount} ${d.kpiDraftsSub}` : d.kpiAllLiveSub}
          </div>
        </Link>

        <Link
          href="/dashboard/products?tab=low"
          className="group flex flex-col justify-between rounded-[22px] border border-line bg-card p-5 transition-colors hover:border-ink/40"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-ink-soft">{d.kpiAttentionLabel}</span>
            <AlertTriangle
              className={`h-4 w-4 ${
                lowOrOutProducts.length > 0 ? 'text-warn' : 'text-ink-faint'
              }`}
            />
          </div>
          <div className="mt-4">
            <span
              className={`display text-[32px] font-semibold leading-none tabular ${
                lowOrOutProducts.length > 0 ? 'text-warn' : 'text-ink'
              }`}
            >
              <AnimatedNumber value={lowOrOutProducts.length} format={formatInt} />
            </span>
          </div>
          <div className="mt-3 text-[12px] text-ink-soft">
            {lowOrOutProducts.length > 0 ? d.kpiAttentionSub : d.kpiAttentionOkSub}
          </div>
        </Link>

        <Link
          href="/dashboard/categories"
          className="group flex flex-col justify-between rounded-[22px] border border-line bg-card p-5 transition-colors hover:border-ink/40"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-ink-soft">{d.kpiFinishesLabel}</span>
            <Palette className="h-4 w-4 text-ink-faint transition-colors group-hover:text-ink" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="display text-[32px] font-semibold leading-none text-ink tabular">
              <AnimatedNumber value={allFinishSwatches.length} format={formatInt} />
            </span>
          </div>
          <div className="mt-3 text-[12px] text-ink-soft">
            {catalog.categories.length} {t.collectionsNav} · {d.kpiFinishesSub}
          </div>
        </Link>

        <Link
          href="/add"
          className="group flex flex-col justify-between rounded-[22px] border border-line bg-card p-5 transition-colors hover:border-ink/40"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-ink-soft">{d.kpiFloorLabel}</span>
            <Layers className="h-4 w-4 text-ink-faint transition-colors group-hover:text-ink" />
          </div>
          <div className="mt-4">
            <span className="display text-[32px] font-semibold leading-none text-ink tabular">
              <AnimatedNumber value={totalFloorUnits} format={formatInt} />
            </span>
          </div>
          <div className="mt-3 text-[12px] text-ink-soft tabular">
            {count360Ready} {d.kpi360Ready}
          </div>
        </Link>
      </section>

      {/* Main 12-Col Inventory & Studio Workflow Split */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* Left 8 Cols: Interactive Inventory Control Table */}
        <div className="rounded-[24px] border border-line bg-card p-6 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="display text-[20px] font-semibold tracking-[-0.02em] text-ink">
                {d.inventoryAttentionTitle}
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-soft">{d.inventoryAttentionSub}</p>
            </div>
            <Link
              href="/dashboard/products"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-canvas px-3.5 text-[12px] font-medium text-ink whitespace-nowrap shrink-0 transition-colors hover:border-ink hover:bg-sand"
            >
              <span>{d.viewAllProducts}</span>
              <CornerArrow className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-2 divide-y divide-line">
            {curatedRows.map((rawProduct) => {
              const product = localizeProduct(rawProduct, locale);
              const isLive = product.status === 'active';
              const isOut = product.stock <= 0;
              const isLow = product.stock > 0 && product.stock <= 12;
              const isBusy = busyId === product.id;

              return (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                >
                  {/* Thumbnail + Title + Category text */}
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/products?edit=${product.id}`}
                          className="truncate text-[13.5px] font-semibold text-ink hover:text-accent"
                        >
                          {product.name}
                        </Link>
                        {isOut ? (
                          <span className="text-[11px] font-semibold text-danger whitespace-nowrap">
                            · {d.soldOutLabel}
                          </span>
                        ) : isLow ? (
                          <span className="text-[11px] font-medium text-warn whitespace-nowrap">
                            · {d.lowStockLabel}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-soft">
                        <span>{localizeCategoryName(product.category, catalog.categoriesById, locale)}</span>
                        <span aria-hidden="true">·</span>
                        <span dir="ltr" className="font-mono font-medium text-ink tabular">
                          {formatPrice(product.price)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{product.finishes.length} {t.finishesCountLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Quick Actions: Stock Stepper + Live/Draft + Edit */}
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Stock stepper */}
                    <div
                      dir="ltr"
                      className="inline-flex h-9 items-center rounded-xl border border-line bg-canvas px-1"
                    >
                      <button
                        type="button"
                        disabled={isBusy || product.stock <= 0}
                        onClick={() => handleAdjustStock(product.id, product.stock - 1)}
                        aria-label="Decrease stock"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-card hover:text-ink disabled:opacity-35"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span
                        className={`w-10 text-center font-mono text-[12px] font-semibold tabular ${
                          isOut ? 'text-danger' : isLow ? 'text-warn' : 'text-ink'
                        }`}
                      >
                        {product.stock}
                      </span>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleAdjustStock(product.id, product.stock + 1)}
                        aria-label="Increase stock"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-card hover:text-ink disabled:opacity-35"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Live / Draft toggle */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleStatus(product.id, product.status, product.name)}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[11.5px] font-medium whitespace-nowrap transition-colors ${
                        isLive
                          ? 'border-ok/30 bg-ok-soft text-ok hover:bg-ok/20'
                          : 'border-line bg-canvas text-ink-soft hover:border-ink hover:text-ink'
                      }`}
                    >
                      {isLive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      <span>{isLive ? d.liveLabel : d.draftLabel}</span>
                    </button>

                    <Link
                      href={`/dashboard/products?edit=${product.id}`}
                      title={d.editingLabel}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-canvas text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Category Proportional Bars + Direct Studio Workflows */}
        <div className="space-y-5 lg:col-span-4">
          {/* Category Mix Panel (Clean CSS Bars, zero custom SVG) */}
          <div className="rounded-[24px] border border-line bg-card p-6">
            <div className="flex items-center justify-between gap-2 border-b border-line pb-3.5">
              <h2 className="display text-[18px] font-semibold tracking-[-0.02em] text-ink">
                {d.collectionMixTitle}
              </h2>
              <Link
                href="/dashboard/categories"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-soft hover:text-ink"
              >
                <Tags className="h-3.5 w-3.5" />
                <span>{d.navCategories}</span>
              </Link>
            </div>

            {/* Segmented overview bar */}
            <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-canvas">
              {categoryBreakdown.map((seg) => (
                <div
                  key={seg.id}
                  style={{
                    width: `${Math.max(seg.count > 0 ? 4 : 0, seg.pct)}%`,
                    backgroundColor: seg.color,
                    opacity: hoveredCat && hoveredCat !== seg.id ? 0.35 : 1,
                  }}
                  className="h-full transition-opacity duration-150"
                />
              ))}
            </div>

            <div className="mt-4 space-y-2.5">
              {categoryBreakdown.map((seg) => (
                <Link
                  key={seg.id}
                  href={`/dashboard/products?cat=${seg.id}`}
                  onMouseEnter={() => setHoveredCat(seg.id)}
                  onMouseLeave={() => setHoveredCat(null)}
                  className="block rounded-xl px-2.5 py-2 transition-colors hover:bg-canvas"
                >
                  <div className="flex items-center justify-between gap-2 text-[12.5px]">
                    <span className="flex min-w-0 items-center gap-2 font-medium text-ink">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="truncate">{seg.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 font-mono text-[11.5px] tabular">
                      <span className="text-ink-soft">{seg.count}</span>
                      <span className="w-9 text-end text-ink-faint">{seg.pct}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Direct Studio Workflows */}
          <div className="rounded-[24px] border border-line bg-card p-6">
            <h2 className="display text-[18px] font-semibold tracking-[-0.02em] text-ink">
              {d.quickToolsTitle}
            </h2>
            <div className="mt-4 divide-y divide-line">
              <Link
                href="/add"
                className="group flex items-start justify-between gap-3 py-3 first:pt-0"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-accent">
                    <Orbit className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-ink group-hover:text-accent">
                      {d.toolAddTitle}
                    </div>
                    <p className="mt-0.5 text-[12px] leading-[1.45] text-ink-soft">
                      {d.toolAddDesc}
                    </p>
                  </div>
                </div>
                <CornerArrow className="mt-1 h-4 w-4 shrink-0 text-ink-faint group-hover:text-ink" />
              </Link>

              <Link
                href="/dashboard/room"
                className="group flex items-start justify-between gap-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink">
                    <Crosshair className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-ink group-hover:text-accent">
                      {d.toolRoomTitle}
                    </div>
                    <p className="mt-0.5 text-[12px] leading-[1.45] text-ink-soft">
                      {d.toolRoomDesc}
                    </p>
                  </div>
                </div>
                <CornerArrow className="mt-1 h-4 w-4 shrink-0 text-ink-faint group-hover:text-ink" />
              </Link>

              <a
                href="https://kvist-yx4kz08m.sanity.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-3 pt-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink">
                    <Cloud className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-ink group-hover:text-accent">
                      {d.toolSanityTitle}
                    </div>
                    <p className="mt-0.5 text-[12px] leading-[1.45] text-ink-soft">
                      {d.toolSanityDesc}
                    </p>
                  </div>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-ink-faint group-hover:text-ink" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Active Material Palette Strip (Clean typographic grid, zero pill clutter) */}
      <section className="rounded-[24px] border border-line bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3.5">
          <h2 className="display text-[18px] font-semibold tracking-[-0.02em] text-ink">
            {d.swatchesTitle}
          </h2>
          <span className="font-mono text-[12px] text-ink-soft tabular">
            {allFinishSwatches.length} · {t.badgeSwatches}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {allFinishSwatches.map((swatch) => (
            <div
              key={`${swatch.name}-${swatch.color}`}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-canvas px-3 py-2"
            >
              <span
                className="h-5 w-5 shrink-0 rounded-full ring-1 ring-ink/20"
                style={{ backgroundColor: swatch.color }}
              />
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium text-ink">{swatch.name}</div>
                <div dir="ltr" className="font-mono text-[10.5px] text-ink-faint tabular">
                  {swatch.color} · ×{swatch.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DashToast notice={notice} onDismiss={dismiss} />
    </div>
  );
}
