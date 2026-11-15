'use client';

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import {
  EYEBROW_CLASS,
  formatPrice,
  Product,
  TINT_BG,
} from '@/lib/catalog';
import { localizeCategoryName, localizeProduct } from '@/lib/i18n';
import { useCategories } from '@/lib/demoBackend';
import { useShowroom } from './providers';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center gap-2 font-display text-[22px] font-bold tracking-[-0.04em] ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-full bg-ink text-canvas"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M12 21V9M12 13l-4.5-4.5M12 11l4-4M8 21h8" />
        </svg>
      </span>
      KVIST
    </span>
  );
}

export function RollingDigit({
  value,
  className = '',
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <span className={`relative inline-flex overflow-hidden tabular ${className}`}>
      <AnimatePresence mode="popLayout" initial={false} custom={value}>
        <motion.span
          key={value}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function AnimatedNumber({
  value,
  from = 0,
  format = (n: number) => Math.round(n).toLocaleString('en-US'),
  duration = 1.3,
  delay = 0,
  className = '',
}: {
  value: number;
  from?: number;
  format?: (n: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 'some' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ref.current.textContent = format(value);
      return;
    }

    ref.current.textContent = format(from);

    let controls: { stop: () => void } | null = null;
    const timer = setTimeout(() => {
      controls = animate(from, value, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => {
          if (ref.current) {
            ref.current.textContent = format(v);
          }
        },
      });
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      if (controls) controls.stop();
    };
  }, [value, inView, duration, format, from, delay]);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {format(from)}
    </span>
  );
}

export function RevealText({
  text,
  as = 'span',
  className,
  delay = 0,
  stagger = 0.04,
  inView = false,
}: {
  text: string;
  as?: 'span' | 'h1' | 'h2' | 'p';
  className?: string;
  delay?: number;
  stagger?: number;
  inView?: boolean;
}) {
  const { dir } = useShowroom();
  const isRtl = dir === 'rtl';
  const Tag = as;
  const words = text.split(' ');
  const viewProps = inView
    ? { whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } }
    : { animate: 'show' };

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden="true"
        initial="hide"
        {...viewProps}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
      >
        {words.map((word, idx) => (
          <span
            key={idx}
            className="inline-block overflow-hidden pt-[0.18em] -mt-[0.18em] pb-[0.24em] -mb-[0.24em] align-baseline"
          >
            <motion.span
              className="inline-block will-change-transform"
              variants={{
                hide: { y: isRtl ? '75%' : '105%', rotate: isRtl ? 0 : 2, opacity: isRtl ? 0 : 1 },
                show: { y: '0%', rotate: 0, opacity: 1 },
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
              {idx < words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

export function RevealBox({
  as = 'div',
  delay = 0,
  y = 22,
  className,
  children,
}: {
  as?: 'div' | 'p' | 'section';
  delay?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  );
}

function wrapRange(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

export function Marquee({
  items,
  baseSpeed = 1.8,
  className = '',
}: {
  items: readonly string[] | string[];
  baseSpeed?: number;
  className?: string;
}) {
  const { dir } = useShowroom();
  const isRtl = dir === 'rtl';
  const reducedMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [-1200, 0, 1200], [-2.5, 0, 2.5], {
    clamp: false,
  });
  const directionFactor = useRef(1);
  const x = useTransform(baseX, (v) => `${wrapRange(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;
    const vf = velocityFactor.get();
    if (vf < 0) directionFactor.current = -1;
    else if (vf > 0) directionFactor.current = 1;
    baseX.set(
      baseX.get() - directionFactor.current * (baseSpeed + Math.abs(vf) * baseSpeed) * (delta / 1000)
    );
  });

  const row = (
    <div className="flex shrink-0 items-center py-2">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          <span
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`px-5 font-display font-medium text-[#676258] transition-colors hover:text-ink sm:px-7 ${
              isRtl
                ? 'text-[14px] sm:text-[15.5px] leading-[1.45]'
                : 'text-[14.5px] sm:text-[16px] tracking-[-0.01em]'
            }`}
          >
            {item}
          </span>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[#a89f91]/70" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      dir="ltr"
      className={`overflow-hidden bg-transparent [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${className}`}
      aria-label={items.join(', ')}
    >
      <motion.div aria-hidden="true" className="flex w-max whitespace-nowrap" style={{ x }}>
        {row}
        {row}
        {row}
      </motion.div>
    </div>
  );
}

export function Magnetic({
  children,
  strength = 0.22,
  className = 'inline-block',
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reducedMotion || e.pointerType !== 'mouse' || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * strength);
        y.set((e.clientY - rect.top - rect.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

export function useParallax(ref: React.RefObject<HTMLElement | null>, amount = 16) {
  const reducedMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || !window.matchMedia('(hover: hover)').matches) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * amount);
      rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * amount);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [ref, amount, reducedMotion, rawX, rawY]);

  return { x, y };
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
    () => false
  );
}

export function SectionHeader({
  eyebrowText,
  title,
  link,
  tight = false,
  children,
}: {
  eyebrowText?: string;
  title: string;
  link?: { to: string; label: string };
  tight?: boolean;
  children?: React.ReactNode;
}) {
  const { dir } = useShowroom();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div
      className={`mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 sm:mb-8 ${
        tight ? 'pt-1 sm:pt-4' : 'pt-14 sm:pt-28'
      }`}
    >
      <div>
        {Boolean(eyebrowText) && (
          <RevealBox as="p" className={EYEBROW_CLASS}>
            {eyebrowText}
          </RevealBox>
        )}
        <h2
          className={`display text-[clamp(2.15rem,5vw,4.5rem)] rtl:text-[clamp(1.7rem,3.3vw,3rem)] ${
            eyebrowText ? 'mt-2.5 sm:mt-3' : 'mt-0'
          }`}
        >
          <RevealText key={title} text={title} inView />
        </h2>
      </div>
      {children}
      {link && (
        <Link
          href={link.to}
          className="group inline-flex items-center gap-1.5 text-[15px] rtl:text-[14px] font-medium"
        >
          {link.label}
          <span className="grid size-9 place-items-center rounded-full bg-card shadow-tile transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            <DirArrow className="size-4" />
          </span>
        </Link>
      )}
    </div>
  );
}

export function ProductCard({
  product: rawProduct,
  priority = false,
  preferScene = false,
  className = '',
}: {
  product: Product;
  priority?: boolean;
  preferScene?: boolean;
  className?: string;
}) {
  const { byId } = useCategories();
  const { locale, dir, t } = useShowroom();
  const product = localizeProduct(rawProduct, locale);
  const [hovered, setHovered] = useState(false);
  const [activeFinishIdx, setActiveFinishIdx] = useState(0);

  const hasScene = Boolean(product.scene);
  const showScene = hasScene && (preferScene ? !hovered : hovered);
  const activeFinish = product.finishes[activeFinishIdx] ?? product.finishes[0];
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;
  const allColorsSoldOut =
    product.finishes.length > 0 &&
    product.finishes.every((f) => Boolean(f.soldOut) || f.stock === 0);
  const isProductSoldOut = product.stock <= 0 || allColorsSoldOut;
  const isActiveFinishSoldOut =
    Boolean(activeFinish?.soldOut) || activeFinish?.stock === 0 || product.stock <= 0;

  return (
    <motion.article
      className={`group relative ${className}`}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/product/${product.id}`}
        className="block rounded-[var(--radius-tile)] focus-visible:outline-offset-4"
      >
        <div
          className={`relative aspect-[4/5] overflow-hidden rounded-[var(--radius-tile)] ${
            TINT_BG[product.tint] ?? 'bg-stone'
          }`}
        >
          {/* Ambient tint aura driven by selected finish */}
          {activeFinish && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-25 transition-colors duration-500"
              style={{
                background: `radial-gradient(circle at 50% 55%, ${activeFinish.color} 0%, transparent 70%)`,
              }}
            />
          )}

          {isProductSoldOut ? (
            <span className="absolute start-4 top-4 z-10 rounded-full bg-ink/90 px-3 py-1 text-[12px] rtl:text-[11.5px] font-medium text-canvas backdrop-blur">
              {t.soldOutLabel}
            </span>
          ) : (
            product.badge && (
              <span className="absolute start-4 top-4 z-10 rounded-full bg-card/90 px-3 py-1 text-[12px] rtl:text-[11.5px] font-medium backdrop-blur">
                {product.badge}
              </span>
            )
          )}

          {hasScene && (
            <span className="absolute end-4 top-4 z-10 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[10px] rtl:text-[11px] uppercase tracking-[0.12em] text-canvas backdrop-blur transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              {showScene ? t.inRoom : t.studioViewBadge}
            </span>
          )}

          {/* Studio Cutout Layer */}
          <motion.span
            aria-hidden="true"
            className="absolute bottom-[13%] left-1/2 h-6 w-[58%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-md"
            variants={{
              rest: { scaleX: 1, opacity: showScene ? 0 : 0.55 },
              hover: { scaleX: 0.78, opacity: showScene ? 0 : 0.32 },
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
          <motion.div
            className={`absolute inset-[11%] bottom-[15%] transition-opacity duration-500 ${
              showScene ? 'opacity-0' : 'opacity-100'
            }`}
            variants={{
              rest: { y: 0, rotate: 0 },
              hover: { y: -10, rotate: -1.5 },
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            <img
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
              className="size-full object-contain"
            />
          </motion.div>

          {/* Hover-to-Scene Layer */}
          {product.scene && (
            <img
              src={product.scene}
              alt={`${product.name}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 size-full object-cover transition-all duration-500 ${
                showScene ? 'scale-100 opacity-100' : 'scale-105 opacity-0 pointer-events-none'
              }`}
            />
          )}

          {/* View piece pill on hover */}
          <div className="pointer-events-none absolute bottom-3.5 end-3.5 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3.5 py-2 text-[12px] font-medium text-ink shadow-lift backdrop-blur transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
              {t.explorePiece}
              <CornerArrow className="size-3.5" />
            </span>
          </div>
        </div>

        <div className="px-1 pt-3 sm:px-1.5 sm:pt-3.5">
          {/* Category & Dimensions */}
          <div className="flex items-center justify-between gap-2 text-[12px] text-ink-soft sm:text-[12.5px] rtl:text-[12px]">
            <span className="truncate">
              {localizeCategoryName(product.category, byId, locale)}
              {product.dimensions && (
                <span className="hidden text-ink-faint sm:inline">
                  {' '}· {product.dimensions.split('·')[0].trim()}
                </span>
              )}
            </span>
          </div>

          {/* Product Name & Cleanly Aligned Price */}
          <div className="mt-1 flex items-baseline justify-between gap-2.5">
            <h3 className="min-w-0 flex-1 truncate font-display text-[15px] rtl:text-[14.5px] font-semibold text-ink sm:text-[17px] rtl:sm:text-[16px]">
              {product.name}
            </h3>
            <span
              dir="ltr"
              className="shrink-0 font-display text-[16px] font-semibold tabular text-ink sm:text-[18px]"
            >
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Finishes & Key Material Detail */}
          <div className="mt-1 flex items-center gap-2 text-[12px] text-ink-soft sm:text-[12.5px] rtl:text-[11.5px]">
            <span className="truncate">
              {product.finishes.length} {t.finishesCountLabel}
              {product.details[0] ? (
                <span className="text-ink-faint"> · {product.details[0]}</span>
              ) : null}
            </span>
          </div>
        </div>
      </Link>

      {/* Interactive Finish Swatch Dots */}
      {product.finishes.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 px-1 sm:px-1.5">
          {product.finishes.map((fin, idx) => {
            const isSelected = idx === activeFinishIdx;
            const finSoldOut =
              Boolean(fin.soldOut) || fin.stock === 0 || product.stock <= 0;
            return (
              <button
                key={`${fin.name}-${idx}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveFinishIdx(idx);
                }}
                onMouseEnter={() => setActiveFinishIdx(idx)}
                title={finSoldOut ? `${fin.name} (${t.soldOutLabel})` : fin.name}
                aria-label={finSoldOut ? `${fin.name} (${t.soldOutLabel})` : fin.name}
                className={`relative grid size-5 place-items-center rounded-full transition-transform ${
                  isSelected
                    ? 'ring-1 ring-ink scale-110'
                    : finSoldOut
                    ? 'opacity-45 hover:opacity-80'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                <span
                  className="size-3.5 rounded-full ring-1 ring-ink/15"
                  style={{ backgroundColor: fin.color }}
                />
                {finSoldOut && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute h-[1.5px] w-4 rotate-45 rounded-full bg-ink"
                  />
                )}
              </button>
            );
          })}
          {activeFinish && (
            <span
              className={`ms-1 truncate text-[11px] rtl:text-[11.5px] ${
                isActiveFinishSoldOut ? 'font-medium text-danger' : 'text-ink-faint'
              }`}
            >
              {activeFinish.name}
              {isActiveFinishSoldOut ? ` · ${t.soldOutLabel}` : ''}
            </span>
          )}
        </div>
      )}
    </motion.article>
  );
}
