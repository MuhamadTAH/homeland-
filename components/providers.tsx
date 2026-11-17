'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { MotionConfig } from 'motion/react';
import { Product } from '@/lib/catalog';
import { demoBackend } from '@/lib/demoBackend';
import { Locale, LOCALES, UI_STRINGS } from '@/lib/i18n';

const LOCALE_STORAGE_KEY = 'kvist-locale';

export interface ShowroomContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  dir: 'ltr' | 'rtl';
  t: (typeof UI_STRINGS)[Locale];
  searchOpen: boolean;
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showroomOpen: boolean;
  inquireProduct: Product | null;
  inquireFinish: string | null;
  openShowroom: (product?: Product | null, finish?: string | null) => void;
  closeShowroom: () => void;
}

const ShowroomContext = createContext<ShowroomContextValue | null>(null);

export function ShowroomProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === 'ckb' || saved === 'ar' || saved === 'en') {
        return saved;
      }
    }
    return 'ckb';
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [showroomOpen, setShowroomOpen] = useState(false);
  const [inquireProduct, setInquireProduct] = useState<Product | null>(null);
  const [inquireFinish, setInquireFinish] = useState<string | null>(null);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }
  }, []);

  const dir: 'ltr' | 'rtl' = useMemo(
    () => LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr',
    [locale]
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
    }
  }, [locale, dir]);

  // Global Cmd+K / Ctrl+K shortcut for Spotlight Search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Automatically sync products and room scene from Sanity CMS when configured (on load + tab refocus)
  useEffect(() => {
    let lastSyncAt = 0;
    const runSync = () => {
      const now = Date.now();
      if (now - lastSyncAt < 8000) return;
      lastSyncAt = now;
      demoBackend.syncFromSanity().catch(() => {});
      demoBackend.syncRoomSceneFromSanity().catch(() => {});
    };
    runSync();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') runSync();
    };
    window.addEventListener('focus', runSync);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', runSync);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const openShowroom = useCallback(
    (product: Product | null = null, finish: string | null = null) => {
      setInquireProduct(product);
      setInquireFinish(finish ?? product?.finishes[0]?.name ?? null);
      setShowroomOpen(true);
    },
    []
  );

  const closeShowroom = useCallback(() => {
    setShowroomOpen(false);
  }, []);

  const t = UI_STRINGS[locale];

  const value = useMemo<ShowroomContextValue>(
    () => ({
      locale,
      setLocale,
      dir,
      t,
      searchOpen,
      setSearchOpen,
      showroomOpen,
      inquireProduct,
      inquireFinish,
      openShowroom,
      closeShowroom,
    }),
    [
      locale,
      setLocale,
      dir,
      t,
      searchOpen,
      showroomOpen,
      inquireProduct,
      inquireFinish,
      openShowroom,
      closeShowroom,
    ]
  );

  return (
    <ShowroomContext.Provider value={value}>{children}</ShowroomContext.Provider>
  );
}

export function useShowroom(): ShowroomContextValue {
  const ctx = useContext(ShowroomContext);
  if (!ctx) throw new Error('useShowroom must be used inside <ShowroomProvider>');
  return ctx;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ShowroomProvider>{children}</ShowroomProvider>
    </MotionConfig>
  );
}
