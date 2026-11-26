'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'motion/react';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Globe,
  LayoutDashboard,
  MapPin,
  Menu,
  Phone,
  Search,
  X,
} from 'lucide-react';
import {
  formatPrice,
  TINT_BG,
} from '@/lib/catalog';
import {
  CATEGORY_TRANSLATIONS,
  LOCALES,
  localizeCategoryName,
  localizeFinishName,
  localizeProduct,
} from '@/lib/i18n';
import { useCategories, useStoreProducts } from '@/lib/demoBackend';
import { useShowroom } from './providers';
import { MapsQuotaBanner, ShowroomGoogleMap } from './showroom-map';
import { Logo } from './ui-primitives';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useShowroom();

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex items-center rounded-full bg-canvas/90 p-1 ring-1 ring-line ${
        compact ? 'gap-0.5' : 'gap-1'
      }`}
    >
      <Globe className="ms-1.5 hidden size-3.5 text-ink-soft sm:inline" />
      {LOCALES.map((item) => {
        const active = locale === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLocale(item.code)}
            aria-pressed={active}
            title={item.label}
            className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
              active
                ? 'bg-ink text-canvas shadow-xs'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {compact ? item.shortLabel : item.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

export function StoreHeader() {
  const { locale, t, setSearchOpen, openShowroom } = useShowroom();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const navLinks = useMemo(
    () => [
      { to: '/shop', label: t.navCatalog },
      { to: '/shop?c=seating', label: CATEGORY_TRANSLATIONS.seating[locale] },
      { to: '/shop?c=lighting', label: CATEGORY_TRANSLATIONS.lighting[locale] },
      { to: '/shop?c=tables', label: CATEGORY_TRANSLATIONS.tables[locale] },
      { to: '/shop?c=textiles', label: CATEGORY_TRANSLATIONS.textiles[locale] },
      { to: '/shop?c=ceramics', label: CATEGORY_TRANSLATIONS.ceramics[locale] },
    ],
    [locale, t.navCatalog]
  );

  const queryStr = searchParams.toString();
  const currentUrl = `${pathname}${queryStr ? `?${queryStr}` : ''}`;
  const [menuOpenUrl, setMenuOpenUrl] = useState<string | null>(null);
  const menuOpen = menuOpenUrl === currentUrl;
  const setMenuOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    const resolved = typeof next === 'function' ? next(menuOpen) : next;
    setMenuOpenUrl(resolved ? currentUrl : null);
  };
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 12));

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpenUrl(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="scrim"
            aria-hidden="true"
            className="fixed inset-0 z-30 bg-ink/25 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <header className="fixed inset-x-0 top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
        <motion.nav
          aria-label="Main"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className={`mx-auto flex h-16 items-center justify-between rounded-full ps-5 pe-2 transition-[background-color,box-shadow] duration-300 ${
            scrolled || menuOpen
              ? 'bg-card/95 shadow-tile ring-1 ring-line/80 backdrop-blur-xl'
              : 'bg-card/75 ring-1 ring-transparent backdrop-blur-md'
          }`}
        >
          <Link href="/" aria-label="KVIST home" className="flex h-11 items-center">
            <Logo />
          </Link>

          <LayoutGroup id="nav">
            <ul
              className="hidden items-center gap-0.5 lg:flex"
              onMouseLeave={() => setHovered(null)}
            >
              {navLinks.map((item) => {
                const isActive = currentUrl === item.to;
                return (
                  <li key={item.to} onMouseEnter={() => setHovered(item.to)}>
                    <Link
                      href={item.to}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative isolate block whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] rtl:text-[13.5px] font-medium transition-colors ${
                        isActive ? 'text-canvas' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-ink"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {hovered === item.to && !isActive && (
                        <motion.span
                          layoutId="nav-hover"
                          className="absolute inset-0 -z-10 rounded-full bg-ink/[0.06]"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>

          <div className="flex items-center gap-1.5">
            {/* Language Switcher: کوردی / عربي / EN */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Global Spotlight Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t.search}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-canvas/90 px-3.5 text-[13px] font-medium text-ink-soft ring-1 ring-line transition-colors hover:bg-card hover:text-ink"
            >
              <Search className="size-4 text-ink" />
              <span className="hidden xl:inline">{t.search}</span>
              <kbd
                dir="ltr"
                className="hidden rounded-md bg-card px-1.5 py-0.5 font-mono text-[10px] text-ink-faint ring-1 ring-line xl:inline"
              >
                ⌘K
              </kbd>
            </button>

            <Link
              href="/dashboard"
              className="hidden h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink 2xl:inline-flex"
            >
              <LayoutDashboard className="size-4" />
              {t.studio}
            </Link>

            <button
              type="button"
              onClick={() => openShowroom(null)}
              className="flex h-12 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-canvas transition-colors hover:bg-[#33312c] sm:px-5 sm:text-[14px] rtl:text-[13.5px]"
            >
              <MapPin className="size-4 text-accent" />
              <span>{t.showroom}</span>
            </button>

            <button
              type="button"
              className="grid size-11 place-items-center rounded-full lg:hidden"
              aria-label={menuOpen ? t.closeMenu : t.openMenu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mx-auto mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-[28px] bg-card p-3 shadow-lift ring-1 ring-line lg:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-2 flex items-center justify-between border-b border-line px-3 pb-3 sm:hidden">
                <span className="text-[12px] font-medium text-ink-soft">زمان / اللغة / Language</span>
                <LanguageSwitcher compact />
              </div>

              <motion.ul
                initial="hide"
                animate="show"
                transition={{ staggerChildren: 0.03 }}
              >
                {[
                  ...navLinks,
                  { to: '/dashboard', label: t.catalogStudio },
                ].map((item) => (
                  <motion.li
                    key={item.to}
                    variants={{
                      hide: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href={item.to}
                      className="flex min-h-12 items-center rounded-2xl px-4 font-display text-[1.4rem] rtl:text-[1.2rem] font-semibold tracking-tight hover:bg-ink/[0.05]"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export function StoreFooter() {
  const { locale, dir, t, openShowroom } = useShowroom();
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;

  const sulaymaniyahPlace = {
    id: 'loc2' as const,
    city: t.loc2City,
    address: t.loc2Address,
    hours: t.loc2Hours,
    phone: t.loc2Phone,
    searchQuery: 'Salim Street, Sulaymaniyah, Kurdistan Region, Iraq',
  };

  const sulaymaniyahMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    sulaymaniyahPlace.searchQuery
  )}`;

  const footerColumns = [
    {
      title: t.footerColCollections,
      links: [
        [t.footerAllPieces, '/shop'],
        [CATEGORY_TRANSLATIONS.seating[locale], '/shop?c=seating'],
        [CATEGORY_TRANSLATIONS.lighting[locale], '/shop?c=lighting'],
        [CATEGORY_TRANSLATIONS.tables[locale], '/shop?c=tables'],
        [CATEGORY_TRANSLATIONS.textiles[locale], '/shop?c=textiles'],
        [CATEGORY_TRANSLATIONS.ceramics[locale], '/shop?c=ceramics'],
      ],
    },
    {
      title: t.footerColStudio,
      links: [
        [t.catalogStudio, '/dashboard'],
        [t.footerManagePieces, '/dashboard/products'],
        [t.footerManageCollections, '/dashboard/categories'],
      ],
    },
  ];

  return (
    <footer className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-5 pt-9 text-canvas sm:rounded-[32px] sm:px-12 sm:pt-14">
        <div className="grid gap-9 md:grid-cols-[1.4fr_2fr] md:gap-12">
          <div>
            <p className="max-w-sm font-display text-[1.6rem] sm:text-3xl rtl:text-[1.35rem] rtl:sm:text-[1.65rem] font-semibold leading-[1.15] rtl:leading-[1.38] tracking-tight">
              {t.footerHeadline}
            </p>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-canvas/70 sm:mt-4 sm:text-[15px] rtl:text-[13.5px] rtl:leading-[1.75]">
              {t.footerSub}
            </p>
            <button
              type="button"
              onClick={() => openShowroom(null)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-canvas/10 px-4 py-2.5 text-[13px] font-medium text-canvas ring-1 ring-canvas/20 transition-colors hover:bg-canvas hover:text-ink"
            >
              <MapPin className="size-4 text-accent" />
              {t.footerShowroomBtn}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-canvas/60">
                  {col.title}
                </p>
                <ul className="mt-2">
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="group inline-flex min-h-9 items-center gap-1 text-[15px] text-canvas/85 transition-colors hover:text-canvas"
                      >
                        {label}
                        <CornerArrow className="size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sulaymaniyah Showroom + Interactive Google Map at Bottom */}
        <div className="mt-10 space-y-4 border-t border-canvas/15 pt-8 pb-6 sm:mt-12">
          <div className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-canvas/60">
              {t.showroomGalleries}
            </p>
            <a
              href={sulaymaniyahMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between gap-3 rounded-2xl bg-canvas p-4 text-start text-ink shadow-tile transition-all hover:bg-sand sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-accent" />
                  <span className="font-display text-[16px] font-semibold">
                    {sulaymaniyahPlace.city}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-ink-soft">
                  {sulaymaniyahPlace.address}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-ink-faint">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 shrink-0" /> {sulaymaniyahPlace.hours}
                </span>
                <span dir="ltr" className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5 shrink-0" /> {sulaymaniyahPlace.phone}
                </span>
              </div>
            </a>
          </div>

          <div className="text-ink">
            <ShowroomGoogleMap
              locationId={sulaymaniyahPlace.id}
              searchQuery={sulaymaniyahPlace.searchQuery}
              cityLabel={sulaymaniyahPlace.city}
              addressLabel={sulaymaniyahPlace.address}
              openMapsLabel={t.openInGoogleMaps}
              locale={locale}
              dir={dir}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-canvas/15 py-4 text-[12px] text-canvas/60 sm:py-5 sm:text-[13px]">
          <span>
            © {new Date().getFullYear()} {t.footerCopyright}
          </span>
          <span>{t.footerEdition}</span>
        </div>
      </div>
    </footer>
  );
}

export function SpotlightSearchModal() {
  const { locale, dir, t, searchOpen, setSearchOpen } = useShowroom();
  const { products } = useStoreProducts();
  const { categories, byId } = useCategories();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;

  useEffect(() => {
    if (!searchOpen) return;
    const tm = setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(tm);
      window.removeEventListener('keydown', onKey);
    };
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => selectedCat === 'all' || p.category === selectedCat)
      .filter((rawP) => {
        if (!q) return true;
        const locP = localizeProduct(rawP, locale);
        const finishNames = `${rawP.finishes.map((f) => f.name).join(' ')} ${locP.finishes
          .map((f) => f.name)
          .join(' ')}`;
        const detailText = `${rawP.details.join(' ')} ${locP.details.join(' ')}`;
        const catNames = `${byId[rawP.category]?.name ?? ''} ${localizeCategoryName(
          rawP.category,
          byId,
          locale
        )}`;
        const haystack =
          `${rawP.name} ${locP.name} ${rawP.blurb} ${locP.blurb} ${catNames} ${finishNames} ${detailText} ${rawP.dimensions} ${locP.dimensions}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 7);
  }, [products, query, selectedCat, byId, locale]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-16 sm:px-5 sm:pt-24"
          role="dialog"
          aria-modal="true"
          aria-label={t.search}
        >
          <motion.div
            className="fixed inset-0 bg-ink/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] bg-card shadow-lift ring-1 ring-line"
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <Search className="size-5 shrink-0 text-ink-soft" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 bg-transparent text-[16px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="rounded-full bg-canvas p-1.5 text-ink-soft hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg bg-canvas px-2.5 py-1 font-mono text-[11px] text-ink-soft hover:text-ink"
              >
                ESC
              </button>
            </div>

            {/* Quick Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-line bg-canvas/50 px-5 py-2.5 [scrollbar-width:none]">
              {[{ id: 'all', name: t.allCollections }, ...categories].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCat(c.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                    selectedCat === c.id
                      ? 'bg-ink text-canvas'
                      : 'bg-card text-ink-soft ring-1 ring-line hover:text-ink'
                  }`}
                >
                  {c.id === 'all' ? c.name : localizeCategoryName(c.id, byId, locale)}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {results.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-display text-xl font-semibold text-ink">
                    {t.noMatchingPieces}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-soft">
                    {t.trySearchingFor}
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {results.map((rawP) => {
                    const p = localizeProduct(rawP, locale);
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            router.push(`/product/${p.id}`);
                          }}
                          className="group flex w-full items-center gap-4 rounded-2xl p-2.5 text-start transition-colors hover:bg-canvas"
                        >
                          <div
                            className={`grid size-14 shrink-0 place-items-center rounded-xl p-1.5 ${
                              TINT_BG[p.tint] ?? 'bg-stone'
                            }`}
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="size-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-ink">
                                {p.name}
                              </span>
                              <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] text-ink-soft group-hover:bg-card">
                                {localizeCategoryName(p.category, byId, locale)}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[12px] text-ink-soft">
                              {p.dimensions}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                              {p.finishes.map((f) => (
                                <span
                                  key={f.name}
                                  title={f.name}
                                  className="size-2.5 rounded-full ring-1 ring-ink/20"
                                  style={{ backgroundColor: f.color }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-end">
                            <span
                              dir="ltr"
                              className="font-display text-[16px] font-semibold text-ink tabular"
                            >
                              {formatPrice(p.price)}
                            </span>
                            <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-ink-soft group-hover:text-ink">
                              {t.inspect} <CornerArrow className="size-3" />
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ShowroomModal() {
  const { locale, dir, t, showroomOpen, closeShowroom, inquireProduct, inquireFinish } =
    useShowroom();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!showroomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeShowroom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showroomOpen, closeShowroom]);

  const localizedProduct = inquireProduct ? localizeProduct(inquireProduct, locale) : null;
  const localizedFinish = inquireFinish ? localizeFinishName(inquireFinish, locale) : null;

  const referenceCode = inquireProduct
    ? `KV-${inquireProduct.id.slice(0, 5).toUpperCase()}-${(inquireFinish || 'STD')
        .slice(0, 3)
        .toUpperCase()}`
    : 'KV-SHOWROOM';

  const handleCopyRef = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${localizedProduct ? localizedProduct.name : 'KVIST Showroom'} (${referenceCode})${
          localizedFinish ? ` · ${t.finishLabel}: ${localizedFinish}` : ''
        }`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sulaymaniyahLocation = {
    id: 'loc2' as const,
    city: t.loc2City,
    address: t.loc2Address,
    hours: t.loc2Hours,
    phone: t.loc2Phone,
    searchQuery: 'Salim Street, Sulaymaniyah, Kurdistan Region, Iraq',
  };

  const sulaymaniyahMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    sulaymaniyahLocation.searchQuery
  )}`;

  const slideOffset = dir === 'rtl' ? '-108%' : '108%';

  return (
    <AnimatePresence>
      {showroomOpen && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label={t.showroomViewing}
        >
          <motion.div
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeShowroom}
          />
          <motion.aside
            className="absolute inset-y-2 end-2 flex w-[min(480px,calc(100vw-16px))] flex-col overflow-hidden rounded-[28px] bg-card shadow-lift"
            initial={{ x: slideOffset }}
            animate={{ x: 0 }}
            exit={{ x: slideOffset }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  {t.experienceInPerson}
                </p>
                <h2 className="mt-0.5 font-display text-2xl font-semibold tracking-tight">
                  {localizedProduct ? t.showroomViewing : t.ourShowrooms}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeShowroom}
                className="grid size-10 place-items-center rounded-full bg-canvas transition-transform hover:rotate-90"
                aria-label={t.closeMenu}
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {/* Selected Piece Reference Card */}
              {localizedProduct && (
                <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                      {t.selectedPieceRef}
                    </span>
                    <span
                      dir="ltr"
                      className="rounded-md bg-card px-2 py-0.5 font-mono text-[11px] font-medium text-ink ring-1 ring-line"
                    >
                      {referenceCode}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3.5">
                    <div
                      className={`grid size-16 shrink-0 place-items-center rounded-xl p-1.5 ${
                        TINT_BG[localizedProduct.tint] ?? 'bg-stone'
                      }`}
                    >
                      <img
                        src={localizedProduct.image}
                        alt={localizedProduct.name}
                        className="size-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">
                        {localizedProduct.name}
                      </p>
                      {localizedFinish && (
                        <p className="text-[12px] text-ink-soft">
                          {t.finishLabel}: <strong className="text-ink">{localizedFinish}</strong>
                        </p>
                      )}
                      <p className="mt-0.5 text-[12px] text-ink-faint">
                        {localizedProduct.dimensions}
                      </p>
                    </div>
                    <div dir="ltr" className="font-display text-lg font-semibold tabular">
                      {formatPrice(localizedProduct.price)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-card py-2 text-[12px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-sand"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-ok" /> {t.copiedRefCode}
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" /> {t.copySpecAndRef}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Sulaymaniyah Showroom Card */}
              <div className="space-y-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                  {t.showroomGalleries}
                </p>
                <a
                  href={sulaymaniyahMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col justify-between rounded-2xl bg-ink p-4 text-start text-canvas shadow-tile transition-colors hover:bg-[#33312c]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[16px] font-semibold">
                        {sulaymaniyahLocation.city}
                      </span>
                      <MapPin className="size-4 text-accent" />
                    </div>
                    <p className="mt-1 text-[12.5px] text-canvas/80">
                      {sulaymaniyahLocation.address}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-canvas/15 pt-2.5 text-[11.5px] text-canvas/70">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3 shrink-0" /> <span>{sulaymaniyahLocation.hours}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3 shrink-0" />{' '}
                      <span dir="ltr">{sulaymaniyahLocation.phone}</span>
                    </span>
                  </div>
                </a>
              </div>

              {/* Interactive Google Map at the bottom for the Sulaymaniyah showroom */}
              <ShowroomGoogleMap
                locationId={sulaymaniyahLocation.id}
                searchQuery={sulaymaniyahLocation.searchQuery}
                cityLabel={sulaymaniyahLocation.city}
                addressLabel={sulaymaniyahLocation.address}
                openMapsLabel={t.openInGoogleMaps}
                locale={locale}
                dir={dir}
              />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function StoreShell({ children }: { children: React.ReactNode }) {
  const { t } = useShowroom();

  return (
    <>
      <MapsQuotaBanner />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
      >
        {t.skipToContent}
      </a>
      <React.Suspense fallback={<div className="h-20" />}>
        <StoreHeader />
      </React.Suspense>
      <main id="main" className="overflow-x-clip">
        {children}
      </main>
      <div>
        <StoreFooter />
      </div>
      <SpotlightSearchModal />
      <ShowroomModal />
    </>
  );
}
