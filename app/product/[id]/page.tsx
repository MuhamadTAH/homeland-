'use client';

import React, { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
} from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Compass,
  Leaf,
  MapPin,
  RotateCcw,
  Ruler,
  ShieldCheck,
} from 'lucide-react';
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  EYEBROW_CLASS,
  formatPrice,
  imgPath,
  Product,
  TINT_BG,
} from '@/lib/catalog';
import {
  localizeCategoryName,
  localizeProduct,
} from '@/lib/i18n';
import { useCategories, useStoreProducts } from '@/lib/demoBackend';
import { useShowroom } from '@/components/providers';
import {
  ProductCard,
  RevealBox,
  RevealText,
  useParallax,
} from '@/components/ui-primitives';
import { StoreShell } from '@/components/store-shell';
import { Product360Viewer } from '@/components/product-360-viewer';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: EASE_OUT_EXPO },
});

function DimensionsDiagram({ product }: { product: Product }) {
  const { t } = useShowroom();
  const mainDim = product.dimensions.split('·')[0].trim();
  const secondaryDim = product.dimensions.split('·')[1]?.trim();

  return (
    <div className="flex size-full flex-col items-center justify-center p-6 sm:p-12">
      <div className="relative flex w-full max-w-md flex-col items-center rounded-3xl bg-card/90 p-6 shadow-tile ring-1 ring-line backdrop-blur-md sm:p-8">
        <div className="flex w-full items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          <span>{t.archElevation}</span>
          <span>{t.scaleLabel}</span>
        </div>

        <div className="relative my-6 flex aspect-square w-56 items-center justify-center sm:w-64">
          {/* Technical Grid */}
          <svg
            viewBox="0 0 240 240"
            className="pointer-events-none absolute inset-0 size-full text-ink/20"
          >
            <defs>
              <pattern id="tech-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                />
              </pattern>
            </defs>
            <rect width="240" height="240" fill="url(#tech-grid)" rx="16" />
            {/* Horizontal Width Callout */}
            <line
              x1="28"
              y1="216"
              x2="212"
              y2="216"
              stroke="#191816"
              strokeWidth="1.4"
            />
            <line x1="28" y1="210" x2="28" y2="222" stroke="#191816" strokeWidth="1.4" />
            <line x1="212" y1="210" x2="212" y2="222" stroke="#191816" strokeWidth="1.4" />
            {/* Vertical Height Callout */}
            <line
              x1="216"
              y1="32"
              x2="216"
              y2="196"
              stroke="#191816"
              strokeWidth="1.4"
            />
            <line x1="210" y1="32" x2="222" y2="32" stroke="#191816" strokeWidth="1.4" />
            <line x1="210" y1="196" x2="222" y2="196" stroke="#191816" strokeWidth="1.4" />
          </svg>

          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="relative z-10 size-40 object-contain opacity-90 contrast-125 grayscale-[30%]"
          />
        </div>

        <div className="w-full space-y-1.5 rounded-2xl bg-canvas p-3.5 text-center">
          <p className="font-mono text-[13px] font-semibold text-ink">{mainDim}</p>
          {secondaryDim && (
            <p className="font-mono text-[11px] text-ink-soft">{secondaryDim}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductReviewsSection({ product }: { product: Product }) {
  const { locale, t } = useShowroom();

  const notes =
    locale === 'ckb'
      ? [
          {
            author: 'کاروان نەجمەدین',
            role: 'ئەندازیاری تەلارسازی · سلێمانی',
            finish: product.finishes[0]?.name ?? '',
            date: '٢ هەفتە لەمەوبەر',
            body: `پێش ئەوەی بۆ پڕۆژەی ماڵێک دیاری بکەین، لە پێشانگای سلێمانی لە نزیکەوە تاقیمان کردەوە. قەبارە و هاوسەنگییەکەی زۆر ئارامە و دارتاشییەکەی بێهاوتایە.`,
          },
          {
            author: 'سازان عومەر',
            role: 'خاوەن ماڵ · سلێمانی',
            finish: product.finishes[1]?.name ?? product.finishes[0]?.name ?? '',
            date: 'مانگێک لەمەوبەر',
            body: `بینینی نموونەی قوماش و دارەکە لەبەر ڕووناکی ڕۆژدا بڕیاردانی زۆر ئاسان کرد. گۆشەی ژوورەکەمانی زۆر جوان و هێمن کردووە.`,
          },
          {
            author: 'ئارام جەلال',
            role: 'ستۆدیۆی ناوخۆیی · سلێمانی',
            finish: product.finishes[0]?.name ?? '',
            date: '٢ مانگ لەمەوبەر',
            body: `هەستی دەستلێدانی ڕووکارەکەی لە ڕاستیدا زۆر لە وێنەکانیش جوانترە. بە کوالێتییەک دروستکراوە کە بۆ چەندین ساڵ دەمێنێتەوە.`,
          },
        ]
      : locale === 'ar'
      ? [
          {
            author: 'كاروان نجم الدين',
            role: 'مهندس معماري · السليمانية',
            finish: product.finishes[0]?.name ?? '',
            date: 'قبل أسبوعين',
            body: `قمنا بمعاينة القطعة في صالة عرض السليمانية قبل اعتمادها لمشروع سكني. أبعادها متوازنة وهادئة للغاية، وتفاصيل النجارة متقنة بلا أي عيب.`,
          },
          {
            author: 'سازان عمر',
            role: 'منزل خاص · السليمانية',
            finish: product.finishes[1]?.name ?? product.finishes[0]?.name ?? '',
            date: 'قبل شهر',
            body: `رؤية عينات الخشب والقماش تحت ضوء النهار جعلت القرار سهلاً للغاية. أضفت حضوراً دافئاً وهادئاً في زاوية غرفة المعيشة.`,
          },
          {
            author: 'آرام جلال',
            role: 'استوديو تصميم داخلي · السليمانية',
            finish: product.finishes[0]?.name ?? '',
            date: 'قبل شهرين',
            body: `ملمس السطح على الطبيعة أجمل بكثير من الصور. قطعة مصنوعة بجودة عالية تدوم لسنوات طويلة.`,
          },
        ]
      : [
          {
            author: 'Soren Lindqvist',
            role: 'Architect · Sulaymaniyah',
            finish: product.finishes[0]?.name ?? 'Standard finish',
            date: '2 weeks ago',
            body: `We inspected the ${product.name} at the Sulaymaniyah showroom before specifying it for a residential project. The proportions are calm and grounded, and the joinery is faultless.`,
          },
          {
            author: 'Clara Moreau',
            role: 'Homeowner · Sulaymaniyah',
            finish: product.finishes[1]?.name ?? product.finishes[0]?.name ?? 'Natural',
            date: '1 month ago',
            body: `Seeing the material swatch in natural daylight made the decision effortless. It anchors our corner of the room without shouting for attention.`,
          },
          {
            author: 'Henrik Dahl',
            role: 'Interior Studio · Sulaymaniyah',
            finish: product.finishes[0]?.name ?? 'Standard finish',
            date: '2 months ago',
            body: `The tactile quality of the surface is even better in person than in photos. Built like heirloom pieces made to last decades.`,
          },
        ];

  return (
    <section
      id="client-reviews"
      className="scroll-mt-24 px-3 pt-14 sm:px-5 sm:pt-20"
    >
      <div className="tile mx-auto p-6 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Showroom Craft & Inspection Column */}
          <div className="flex flex-col justify-between border-b border-line pb-6 lg:col-span-4 lg:border-b-0 lg:border-e lg:pb-0 lg:pe-8">
            <div>
              <p className={EYEBROW_CLASS}>{t.reviewsEyebrow}</p>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl rtl:text-xl rtl:sm:text-2xl font-semibold tracking-tight">
                {t.qualityStandardsTitle}
              </h3>

              <div className="mt-5 space-y-2.5 text-[13px]">
                {t.qualityMetrics.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-canvas px-4 py-3"
                  >
                    <span className="text-ink-soft">{label}</span>
                    <span className="font-mono text-[11px] rtl:text-[11.5px] font-semibold text-ink">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-canvas p-4 text-[12px] text-ink-soft">
              <strong className="text-ink">{t.verifiedFeedbackStrong}</strong>{' '}
              {t.verifiedFeedbackText}
            </div>
          </div>

          {/* Individual Client & Architect Notes */}
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
            {notes.map((n) => (
              <div
                key={n.author}
                className="flex flex-col justify-between rounded-2xl bg-canvas p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 font-mono text-[10.5px] text-ink-soft">
                      <span className="size-1.5 rounded-full bg-accent" />
                      {n.finish}
                    </span>
                    <span className="font-mono text-[11px] text-ink-faint">{n.date}</span>
                  </div>
                  <p className="mt-3.5 text-[14px] leading-relaxed text-ink rtl:leading-[1.75]">
                    “{n.body}”
                  </p>
                </div>
                <div className="mt-5 border-t border-line pt-3">
                  <p className="text-[13px] font-semibold text-ink">{n.author}</p>
                  <p className="text-[11px] text-ink-soft">
                    {n.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductDetailView({ product: rawProduct }: { product: Product }) {
  const { byId: categoriesById } = useCategories();
  const { locale, dir, t, openShowroom } = useShowroom();
  const { products } = useStoreProducts();

  const product = localizeProduct(rawProduct, locale);
  const catName = localizeCategoryName(product.category, categoriesById, locale);
  const CrumbChevron = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const [selectedFinishIdx, setSelectedFinishIdx] = useState(0);
  const [stageMode, setStageMode] = useState<
    'product' | '360' | 'detail' | 'scene' | 'dimensions'
  >('product');
  const [copiedSpec, setCopiedSpec] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const { x, y } = useParallax(stageRef, 24);

  const activeFinishObj =
    product.finishes[selectedFinishIdx] ?? product.finishes[0];
  const selectedFinish = activeFinishObj?.name ?? '';
  const allColorsSoldOut =
    product.finishes.length > 0 &&
    product.finishes.every((f) => Boolean(f.soldOut) || f.stock === 0);
  const isGlobalSoldOut = product.stock <= 0 || allColorsSoldOut;
  const isColorSoldOut =
    Boolean(activeFinishObj?.soldOut) || activeFinishObj?.stock === 0;
  const isSelectedUnavailable = isGlobalSoldOut || isColorSoldOut;
  const availableFinishCount = isSelectedUnavailable
    ? 0
    : typeof activeFinishObj?.stock === 'number'
    ? activeFinishObj.stock
    : product.stock;

  const related = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.tint === product.tint)
    )
    .slice(0, 4);

  const ctaBtnRef = useRef<HTMLButtonElement | null>(null);
  const ctaInView = useInView(ctaBtnRef, { margin: '0px 0px -40px 0px' });
  const showStickyCta = !ctaInView;

  useEffect(() => {
    document.body.toggleAttribute('data-cta', showStickyCta);
    return () => document.body.removeAttribute('data-cta');
  }, [showStickyCta]);

  const referenceCode = `KV-${product.id.slice(0, 5).toUpperCase()}`;

  const handleCopySpec = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${product.name} (${referenceCode}) · ${t.finishLabel}: ${selectedFinish} · ${product.dimensions} · ${formatPrice(
          product.price
        )}`
      );
      setCopiedSpec(true);
      setTimeout(() => setCopiedSpec(false), 2000);
    }
  };

  const stageTabs = [
    ['product', t.stageStudio],
    ['360', t.stage360],
    ['detail', t.stageCloseup],
    ...(product.scene ? ([['scene', t.stageInRoom]] as const) : []),
    ['dimensions', t.stageDimensions],
  ] as const;

  return (
    <>
      <section className="px-3 pt-24 sm:px-5 sm:pt-28">
        <nav
          aria-label="Breadcrumb"
          className="mb-2 flex min-w-0 items-center gap-1 px-1 text-[13px] text-ink-soft"
        >
          <Link href="/shop" className="py-2.5 hover:text-ink">
            {t.navCatalog}
          </Link>
          <CrumbChevron className="size-3.5 shrink-0" />
          <Link href={`/shop?c=${product.category}`} className="py-2.5 hover:text-ink">
            {catName}
          </Link>
          <CrumbChevron className="size-3.5 shrink-0" />
          <span className="truncate text-ink" aria-current="page">
            {product.name}
          </span>
        </nav>

        <div className="mx-auto grid gap-3 sm:gap-4 lg:grid-cols-12">
          {/* Interactive Visual Stage */}
          <div
            ref={stageRef}
            className={`relative aspect-square overflow-hidden rounded-[var(--radius-tile)] lg:col-span-7 lg:aspect-auto lg:min-h-[740px] ${
              TINT_BG[product.tint] ?? 'bg-stone'
            }`}
          >
            {/* Dynamic Finish Colour Aura */}
            {activeFinishObj && stageMode !== 'scene' && stageMode !== '360' && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40 transition-colors duration-700"
                style={{
                  background: `radial-gradient(circle at 50% 52%, ${activeFinishObj.color} 0%, transparent 68%)`,
                }}
              />
            )}

            {/* Top Stage Pill */}
            {stageMode !== '360' && (
              <div className="absolute start-5 top-5 z-10 flex items-center gap-2">
                <span
                  dir="ltr"
                  className="rounded-full bg-card/85 px-3 py-1 font-mono text-[11px] text-ink backdrop-blur"
                >
                  Ref · {referenceCode}
                </span>
                {activeFinishObj && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1 text-[12px] font-medium text-ink backdrop-blur">
                    <span
                      className="size-3 rounded-full ring-1 ring-ink/20"
                      style={{ backgroundColor: activeFinishObj.color }}
                    />
                    {activeFinishObj.name}
                  </span>
                )}
              </div>
            )}

            <AnimatePresence mode="popLayout" initial={false}>
              {stageMode === 'product' && (
                <motion.div
                  key="product"
                  className="absolute inset-[12%]"
                  exit={{ opacity: 0, scale: 0.96 }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                >
                  <motion.div className="size-full" style={{ x, y }}>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-[30%] -bottom-[1%] h-[6%] rounded-[50%] bg-[#1e1e14]/25 blur-2xl"
                    />
                    <img
                      src={product.image}
                      alt={product.name}
                      width={1000}
                      height={1000}
                      fetchPriority="high"
                      referrerPolicy="no-referrer"
                      className="relative size-full object-contain"
                    />
                  </motion.div>
                </motion.div>
              )}

              {stageMode === '360' && (
                <motion.div
                  key="360"
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Product360Viewer
                    product={product}
                    activeFinishColor={activeFinishObj?.color ?? '#d8cfbe'}
                    activeFinishName={activeFinishObj?.name}
                    tintBg={TINT_BG[product.tint]}
                  />
                </motion.div>
              )}

              {stageMode === 'detail' && (
                <motion.div
                  key="detail"
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.45 }}
                >
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="size-full scale-[1.55] object-contain"
                    style={{ x, y }}
                  />
                </motion.div>
              )}

              {stageMode === 'scene' && product.scene && (
                <motion.img
                  key="scene"
                  src={product.scene}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 size-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                />
              )}

              {stageMode === 'dimensions' && (
                <motion.div
                  key="dimensions"
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                >
                  <DimensionsDiagram product={product} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4-Mode Stage Switcher */}
            <LayoutGroup id="stage-view">
              <div className="absolute bottom-4 left-1/2 z-10 flex max-w-[calc(100%-2rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-full bg-card/90 p-1 shadow-tile backdrop-blur-md [scrollbar-width:none]">
                {stageTabs.map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setStageMode(mode)}
                    aria-pressed={stageMode === mode}
                    className={`relative isolate h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[12px] font-medium transition-colors sm:h-10 sm:px-4 sm:text-[13px] ${
                      stageMode === mode ? 'text-canvas' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {stageMode === mode && (
                      <motion.span
                        layoutId="stage-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-ink"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </div>

          {/* Architectural Specification Panel */}
          <div className="tile flex flex-col p-5 sm:p-10 lg:col-span-5">
            <motion.div
              className="flex items-center justify-between"
              {...fadeUp(0.1)}
            >
              <p className={EYEBROW_CLASS}>{catName}</p>
              {product.badge && (
                <span className="rounded-full bg-canvas px-3 py-1 text-[12px] font-medium">
                  {product.badge}
                </span>
              )}
            </motion.div>

            <h1 className="display mt-4 text-[clamp(2.2rem,4vw,3.75rem)] rtl:text-[clamp(1.75rem,3vw,2.65rem)] rtl:leading-[1.25]">
              <RevealText key={product.name} text={product.name} delay={0.15} />
            </h1>

            <motion.div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3" {...fadeUp(0.25)}>
              <span dir="ltr" className="font-display text-3xl font-semibold tabular">
                {formatPrice(product.price)}
              </span>
              <button
                type="button"
                onClick={() => setStageMode('360')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] rtl:text-[12px] font-medium transition-colors ${
                  stageMode === '360'
                    ? 'bg-ink text-canvas shadow-tile'
                    : 'bg-sand text-ink hover:bg-ink hover:text-canvas'
                }`}
                title={t.stage360}
              >
                <RotateCcw className="size-3.5" />
                <span>{t.stage360}</span>
              </button>
              <a
                href="#client-reviews"
                className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-[12.5px] rtl:text-[12px] text-ink-soft transition-colors hover:bg-sand hover:text-ink"
              >
                <span className="font-medium text-ink">
                  {product.finishes.length} {t.finishesCountLabel}
                </span>
                <span>·</span>
                <span>{t.clientNotesCount}</span>
              </a>
            </motion.div>

            <motion.p
              className="mt-5 text-[15px] leading-relaxed text-ink-soft sm:text-[16px] rtl:text-[14.5px] rtl:leading-[1.75]"
              {...fadeUp(0.32)}
            >
              {product.blurb}
            </motion.p>

            {/* Finish Swatch Selector Cards */}
            <motion.fieldset className="mt-6" {...fadeUp(0.38)}>
              <legend className="flex flex-wrap items-center gap-1.5 text-[13px] font-medium">
                <span>{t.materialFinish}</span>
                <span className="font-normal text-ink-soft">· {selectedFinish}</span>
                {isSelectedUnavailable && (
                  <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">
                    {isGlobalSoldOut ? t.soldOutLabel : t.soldOutInColorLabel}
                  </span>
                )}
              </legend>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.finishes.map((f, idx) => {
                  const active = idx === selectedFinishIdx;
                  const finSoldOut =
                    Boolean(f.soldOut) || f.stock === 0 || product.stock <= 0;
                  return (
                    <button
                      key={`${f.name}-${idx}`}
                      type="button"
                      onClick={() => setSelectedFinishIdx(idx)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-all ${
                        active
                          ? 'bg-ink text-canvas shadow-tile'
                          : finSoldOut
                          ? 'bg-canvas/70 text-ink-faint ring-1 ring-line/70 hover:text-ink-soft'
                          : 'bg-canvas text-ink-soft ring-1 ring-line hover:text-ink'
                      }`}
                    >
                      <span className="relative grid size-4 place-items-center">
                        <span
                          className={`size-4 rounded-full ring-1 ring-current/20 ${
                            finSoldOut ? 'opacity-50' : ''
                          }`}
                          style={{ backgroundColor: f.color }}
                        />
                        {finSoldOut && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute h-[1.5px] w-4 rotate-45 rounded-full bg-current"
                          />
                        )}
                      </span>
                      <span className={finSoldOut ? 'line-through' : ''}>{f.name}</span>
                      {finSoldOut && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            active
                              ? 'bg-danger/80 text-white'
                              : 'bg-danger/10 text-danger'
                          }`}
                        >
                          {t.soldOutLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.fieldset>

            {/* Showroom Availability & Primary Actions */}
            <motion.div className="mt-7 space-y-2.5" {...fadeUp(0.45)}>
              <div
                className={`flex items-center justify-between rounded-2xl px-4 py-2.5 text-[12px] ${
                  isSelectedUnavailable ? 'bg-danger/10' : 'bg-canvas'
                }`}
              >
                <span
                  className={`inline-flex items-center gap-2 font-medium ${
                    isSelectedUnavailable ? 'text-danger' : 'text-ink'
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      isSelectedUnavailable ? 'bg-danger' : 'bg-ok'
                    }`}
                  />
                  {isGlobalSoldOut
                    ? t.soldOutLabel
                    : isColorSoldOut
                    ? `${t.soldOutInColorLabel} (${selectedFinish})`
                    : t.onDisplayShowrooms}
                </span>
                <span
                  dir="ltr"
                  className={`font-mono ${
                    isSelectedUnavailable ? 'font-semibold text-danger' : 'text-ink-faint'
                  }`}
                >
                  {availableFinishCount}{' '}
                  {typeof activeFinishObj?.stock === 'number' && !isSelectedUnavailable
                    ? t.colorStockLabel
                    : t.inStudioCount}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  ref={ctaBtnRef}
                  type="button"
                  onClick={() => openShowroom(rawProduct, selectedFinish)}
                  className={`${BTN_PRIMARY} h-13 flex-1 px-5 text-[15px]`}
                >
                  <MapPin className="size-4 text-accent" />
                  {t.seeInShowroomBtn}
                </button>
                <button
                  type="button"
                  onClick={handleCopySpec}
                  className={`${BTN_SECONDARY} h-13 px-4 text-[14px]`}
                >
                  {copiedSpec ? (
                    <>
                      <Check className="size-4 text-ok" /> {t.specCopied}
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" /> {t.copySpec}
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Always-Visible Architectural Specifications */}
            <motion.div
              className="mt-7 space-y-4 border-t border-line pt-6"
              {...fadeUp(0.52)}
            >
              {/* Dimensions Box */}
              <div className="rounded-2xl bg-canvas p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                    <Ruler className="size-3.5 text-ink" /> {t.dimensionsTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStageMode('dimensions')}
                    className="text-[11px] font-medium text-accent hover:underline"
                  >
                    {t.viewSchematic}
                  </button>
                </div>
                <p className="mt-1.5 font-mono text-[13px] font-medium text-ink">
                  {product.dimensions}
                </p>
                {(product.material ||
                  product.weight ||
                  product.warranty ||
                  product.leadTime ||
                  (product.customSpecs && product.customSpecs.length > 0)) && (
                  <dl className="mt-3 grid grid-cols-1 gap-2 border-t border-line pt-3 text-[12.5px] sm:grid-cols-2">
                    {product.material && (
                      <div>
                        <dt className="text-[11px] text-ink-soft">
                          {locale === 'ckb' ? 'کەرەستەی سەرەکی' : locale === 'ar' ? 'الخامة الأساسية' : 'Primary Material'}
                        </dt>
                        <dd className="font-medium text-ink">{product.material}</dd>
                      </div>
                    )}
                    {product.weight && (
                      <div>
                        <dt className="text-[11px] text-ink-soft">
                          {locale === 'ckb' ? 'کێش' : locale === 'ar' ? 'الوزن' : 'Weight'}
                        </dt>
                        <dd className="font-mono font-medium text-ink">{product.weight}</dd>
                      </div>
                    )}
                    {product.warranty && (
                      <div>
                        <dt className="text-[11px] text-ink-soft">
                          {locale === 'ckb' ? 'گەرەنتی' : locale === 'ar' ? 'الضمان' : 'Warranty'}
                        </dt>
                        <dd className="font-medium text-ink">{product.warranty}</dd>
                      </div>
                    )}
                    {product.leadTime && (
                      <div>
                        <dt className="text-[11px] text-ink-soft">
                          {locale === 'ckb' ? 'گەیاندن و ئامادەبوون' : locale === 'ar' ? 'التوفر والتوصيل' : 'Availability & Delivery'}
                        </dt>
                        <dd className="font-medium text-ink">{product.leadTime}</dd>
                      </div>
                    )}
                    {product.customSpecs?.map((spec, idx) => (
                      <div key={`${spec.label}-${idx}`}>
                        <dt className="text-[11px] text-ink-soft">{spec.label}</dt>
                        <dd className="font-medium text-ink">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {/* Construction & Materials */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                  {t.constructionTitle}
                </p>
                <ul className="mt-2.5 grid grid-cols-1 gap-1.5 text-[14px] text-ink-soft sm:grid-cols-2">
                  {product.details.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Care & Longevity */}
              <div className="border-t border-line pt-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                  {t.careTitle}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                  {product.care}
                </p>
              </div>

              {/* Craft Badges */}
              <ul className="flex flex-wrap gap-2 pt-1 text-[12px] text-ink-soft">
                {(
                  [
                    [Leaf, t.badgeFsc],
                    [ShieldCheck, t.badgeWarranty],
                    [Compass, t.badgeSwatches],
                  ] as const
                ).map(([Icon, text]) => (
                  <li
                    key={text}
                    className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5"
                  >
                    <Icon className="size-3.5 text-ink" /> {text}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Showroom Bar */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center gap-3 rounded-[22px] bg-card/92 p-2 shadow-lift ring-1 ring-line backdrop-blur-xl">
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                  TINT_BG[product.tint] ?? 'bg-stone'
                }`}
              >
                <img
                  src={product.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="size-9 object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">
                  {product.name}
                </span>
                <span className="block text-[12px] text-ink-soft tabular">
                  <span dir="ltr">{formatPrice(product.price)}</span> · {selectedFinish}
                </span>
              </span>
              <button
                type="button"
                onClick={() => openShowroom(rawProduct, selectedFinish)}
                className={`${BTN_PRIMARY} h-11 shrink-0 px-4 text-[13px]`}
              >
                {t.showroom}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dedicated Client & Architect Reviews Section */}
      <ProductReviewsSection product={product} />

      {/* Related Pieces */}
      {related.length > 0 && (
        <section className="px-3 pb-12 pt-14 sm:px-5 sm:pb-24 sm:pt-20">
          <div className="mx-auto">
            <h2 className="display mb-5 text-[clamp(2rem,4vw,3.5rem)] rtl:text-[clamp(1.6rem,2.8vw,2.45rem)] sm:mb-8">
              <RevealText key={t.pairsWellTitle} text={t.pairsWellTitle} inView />
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-4">
              {related.map((rel, idx) => (
                <RevealBox key={rel.id} delay={idx * 0.06}>
                  <ProductCard product={rel} />
                </RevealBox>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function NotFoundView() {
  const { t } = useShowroom();

  return (
    <section className="grid min-h-[86vh] place-items-center px-6 pt-24">
      <div className="text-center">
        <motion.img
          src={imgPath('stool.webp')}
          alt=""
          referrerPolicy="no-referrer"
          className="mx-auto h-48 w-auto"
          initial={{ rotate: 0, y: -40, opacity: 0 }}
          animate={{
            rotate: [0, 0, -18, -12],
            y: [-40, 0, 0, 6],
            opacity: 1,
          }}
          transition={{ duration: 1.4, times: [0, 0.4, 0.75, 1], ease: 'easeOut' }}
        />
        <h1 className="display mt-6 text-5xl sm:text-6xl">{t.pieceMovedTitle}</h1>
        <p className="mt-3 text-ink-soft">
          {t.pieceMovedSub}
        </p>
        <Link href="/shop" className={`${BTN_PRIMARY} mt-8`}>
          {t.browseCatalog}
        </Link>
      </div>
    </section>
  );
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { byId, loaded } = useStoreProducts();
  const product = byId[id];

  return (
    <StoreShell>
      {product ? (
        <ProductDetailView key={product.id} product={product} />
      ) : loaded ? (
        <NotFoundView />
      ) : (
        <div className="min-h-[80vh]" aria-busy="true" />
      )}
    </StoreShell>
  );
}
