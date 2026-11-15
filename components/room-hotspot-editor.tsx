'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Check,
  Cloud,
  Code2,
  Crosshair,
  Eye,
  Image as ImageIcon,
  MousePointerClick,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  DEFAULT_ROOM_SCENE,
  formatPrice,
  imgPath,
  RoomHotspot,
  RoomScene,
  STARTER_PRODUCTS,
} from '@/lib/catalog';
import { demoBackend, useAllProducts, useRoomScene } from '@/lib/demoBackend';
import { localizeProduct } from '@/lib/i18n';
import { roomSceneToSanityDoc } from '@/lib/sanity';
import { useShowroom } from './providers';
import { ImageAssetPickerModal } from './image-asset-picker';

const ROOM_PRESETS = [
  { label: 'Architectural Room', path: imgPath('interior.jpg') },
  { label: 'Living Space', path: imgPath('feature-room.jpg') },
  { label: 'Lounge Corner', path: imgPath('best-chair.jpg') },
  { label: 'Lamp Reading Nook', path: imgPath('best-lamp.jpg') },
  { label: 'Wool Throw Sofa', path: imgPath('best-throw.jpg') },
  { label: 'Joinery Detail', path: imgPath('feature-detail.jpg') },
];

function RoomHotspotEditorInner({
  initialScene,
  onSaved,
}: {
  initialScene: RoomScene;
  onSaved?: () => void;
}) {
  const { locale, dir, t } = useShowroom();
  const { products: allProducts, byId } = useAllProducts();
  const isRtl = dir === 'rtl';
  const CornerArrow = isRtl ? ArrowUpLeft : ArrowUpRight;

  const [image, setImage] = useState(initialScene.image || DEFAULT_ROOM_SCENE.image);
  const [eyebrow, setEyebrow] = useState(initialScene.eyebrow || '');
  const [title, setTitle] = useState(initialScene.title || '');
  const [hotspots, setHotspots] = useState<RoomHotspot[]>(
    initialScene.hotspots?.length ? initialScene.hotspots : DEFAULT_ROOM_SCENE.hotspots
  );

  const [selectedKey, setSelectedKey] = useState<string>(
    initialScene.hotspots?.[0]?.key ?? ''
  );
  const [nextProductId, setNextProductId] = useState<string>(
    allProducts[0]?.id || 'bolle-lounge-chair'
  );
  const [canvasMode, setCanvasMode] = useState<'place' | 'preview'>('place');
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [showSanityJson, setShowSanityJson] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);

  const nextPinIdRef = useRef(initialScene.hotspots?.length + 1 || 4);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const didDragMoveRef = useRef(false);

  const showStatus = (text: string, tone: 'ok' | 'err' = 'ok') => {
    setNotice({ text, tone });
    setTimeout(() => {
      setNotice((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const resolvedHotspots = useMemo(() => {
    return hotspots.map((spot) => {
      const rawProd =
        byId[spot.productId] ??
        allProducts[0] ??
        STARTER_PRODUCTS.find((p) => p.id === spot.productId) ??
        STARTER_PRODUCTS[0];
      const locProd = localizeProduct(rawProd, locale);
      return {
        ...spot,
        rawProd,
        locProd,
      };
    });
  }, [hotspots, byId, allProducts, locale]);

  const activeSpot =
    resolvedHotspots.find((s) => s.key === selectedKey) ?? resolvedHotspots[0] ?? null;

  const computeCoordsFromPointer = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      return { x: 50, y: 50 };
    }
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.round(Math.max(3, Math.min(97, rawX)) * 10) / 10,
      y: Math.round(Math.max(4, Math.min(96, rawY)) * 10) / 10,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (canvasMode !== 'place') return;
    if (didDragMoveRef.current) {
      didDragMoveRef.current = false;
      return;
    }
    // Ignore clicks on an existing pin button
    if ((e.target as HTMLElement).closest('[data-hotspot-pin="true"]')) {
      return;
    }

    const { x, y } = computeCoordsFromPointer(e.clientX, e.clientY);
    const key = `spot-${nextPinIdRef.current++}`;
    const fallbackProd = nextProductId || allProducts[0]?.id || 'bolle-lounge-chair';

    setHotspots((prev) => [...prev, { key, productId: fallbackProd, x, y }]);
    setSelectedKey(key);
  };

  const handlePinPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    key: string
  ) => {
    setSelectedKey(key);
    if (canvasMode !== 'place') return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingKey(key);
    didDragMoveRef.current = false;
  };

  const handlePinPointerMove = (
    e: React.PointerEvent<HTMLButtonElement>,
    key: string
  ) => {
    if (draggingKey !== key || canvasMode !== 'place') return;
    didDragMoveRef.current = true;
    const { x, y } = computeCoordsFromPointer(e.clientX, e.clientY);
    setHotspots((prev) =>
      prev.map((s) => (s.key === key ? { ...s, x, y } : s))
    );
  };

  const handlePinPointerUp = (
    e: React.PointerEvent<HTMLButtonElement>,
    key: string
  ) => {
    if (draggingKey !== key) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDraggingKey(null);
  };

  const handleUploadRoomPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await demoBackend.uploadRoomSceneImage(file);
      setImage(dataUrl);
      showStatus(
        locale === 'ckb'
          ? 'وێنەی ژوورەکە بارکرا! ئێستا کرتە لە هەر شوێنێکی وێنەکە بکە بۆ دانانی خاڵ.'
          : locale === 'ar'
          ? 'تم رفع صورة الغرفة! انقر الآن على أي مكان في الصورة لإضافة نقطة.'
          : 'Room photo uploaded! Click anywhere on the photo to drop product dots.'
      );
    } catch {
      showStatus('Could not process room image file', 'err');
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await demoBackend.saveRoomScene({
        image,
        eyebrow: eyebrow.trim(),
        title: title.trim(),
        hotspots,
      });
      showStatus(
        locale === 'ckb'
          ? 'دیمەنی ژوور و خاڵەکان پاشەکەوت کران و لە پەڕەی سەرەکی دەرکەوتن!'
          : locale === 'ar'
          ? 'تم حفظ مشهد الغرفة والنقاط ونشرها في الصفحة الرئيسية!'
          : 'Room scene & interactive hotspots published to the landing page!'
      );
      onSaved?.();
    } catch (err) {
      const code = (err as { code?: string; message?: string })?.code;
      showStatus(
        code === 'storage/quota-exceeded'
          ? locale === 'ckb'
            ? 'قەبارەی بیرگەی وێبگەڕ پڕبوو — وێنەیەکی بچووکتر هەڵبژێرە یان Sanity ببەستەرەوە.'
            : 'Browser preview storage is full — pick a smaller room image or connect Sanity.'
          : 'Could not save room scene',
        'err'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    await demoBackend.resetRoomScene();
    setImage(DEFAULT_ROOM_SCENE.image);
    setEyebrow('');
    setTitle('');
    setHotspots(DEFAULT_ROOM_SCENE.hotspots);
    setSelectedKey(DEFAULT_ROOM_SCENE.hotspots[0]?.key ?? '');
    showStatus(
      locale === 'ckb'
        ? 'گەڕێندرایەوە بۆ دیمەنی بنەڕەتی'
        : 'Reset to default architectural room scene'
    );
  };

  const sanityJson = useMemo(
    () =>
      JSON.stringify(
        roomSceneToSanityDoc({
          image,
          eyebrow,
          title,
          hotspots,
        }),
        null,
        2
      ),
    [image, eyebrow, title, hotspots]
  );

  return (
    <div className="space-y-6">
      {notice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[13px] font-medium ${
            notice.tone === 'err'
              ? 'bg-danger/10 text-danger ring-1 ring-danger/30'
              : 'bg-ok/15 text-ink ring-1 ring-ok/30'
          }`}
        >
          <span className="flex items-center gap-2">
            <Check className="size-4 shrink-0 text-ok" />
            {notice.text}
          </span>
          <Link
            href="/#room-vignette"
            className="shrink-0 rounded-full bg-ink px-3 py-1 text-[11.5px] font-medium text-canvas hover:bg-accent"
          >
            {locale === 'ckb' ? 'بینین لە پەڕەی سەرەکی ←' : 'View on Home →'}
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left: Interactive Click-to-Place Canvas */}
        <div className="tile space-y-4 p-5 sm:p-6 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                {locale === 'ckb'
                  ? 'دروستکەری وێنەی ژوور بە خاڵی زیندوو'
                  : locale === 'ar'
                  ? 'محرر نقاط المنتجات على صورة الغرفة'
                  : 'Interactive Room Hotspot Canvas'}
              </p>
              <h2 className="display mt-1 text-xl font-semibold text-ink">
                {canvasMode === 'place'
                  ? locale === 'ckb'
                    ? 'کرتە لە هەر شوێنێکی وێنەکە بکە بۆ دانانی خاڵ (یان خاڵەکان ڕابکێشە)'
                    : locale === 'ar'
                    ? 'انقر في أي مكان على الصورة لإضافة نقطة (أو اسحبها لتعديل الموقع)'
                    : 'Click Anywhere on the Photo to Drop a Dot · Drag Pins to Adjust'
                  : locale === 'ckb'
                  ? 'مۆدی تاقیکردنەوە: ماوس بخەرە سەر خاڵەکان بۆ بینینی بەرهەم و نرخ'
                  : locale === 'ar'
                  ? 'معاينة حية: مرّر المؤشر على النقاط لعرض المنتج والسعر'
                  : 'Live Hover Test: Hover Over Dots to Preview Card'}
              </h2>
            </div>

            {/* Edit vs Live Hover Test Mode */}
            <div className="inline-flex rounded-full bg-canvas p-1 ring-1 ring-line">
              <button
                type="button"
                onClick={() => setCanvasMode('place')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  canvasMode === 'place'
                    ? 'bg-ink text-canvas shadow-xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <Crosshair className="size-3.5" />
                <span>
                  {locale === 'ckb' ? 'دانان و جووڵاندنی خاڵ' : 'Place & Drag Dots'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCanvasMode('preview')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  canvasMode === 'preview'
                    ? 'bg-ink text-canvas shadow-xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <Eye className="size-3.5" />
                <span>{locale === 'ckb' ? 'تاقیکردنەوەی ڕاستەقینە' : 'Live Preview'}</span>
              </button>
            </div>
          </div>

          {/* Room Photo Selection, Sanity Asset & Upload Bar */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-canvas transition-colors hover:bg-accent"
              >
                <Upload className="size-3.5" />
                <span>
                  {locale === 'ckb'
                    ? 'بارکردنی وێنەی ژووری نوێ'
                    : locale === 'ar'
                    ? 'رفع صورة غرفة جديدة'
                    : 'Upload Room Photo'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAssetPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3.5 py-2 text-[12px] font-medium text-ink transition-colors hover:bg-ink hover:text-canvas"
              >
                <Cloud className="size-3.5" />
                <span>
                  {locale === 'ckb'
                    ? 'بەستنەوەی وێنەی Sanity'
                    : locale === 'ar'
                    ? 'ربط أصل من Sanity'
                    : 'Connect Sanity Asset'}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadRoomPhoto}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-1.5">
                {ROOM_PRESETS.map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() => setImage(preset.path)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-all ${
                      image === preset.path
                        ? 'bg-sand text-ink ring-ink'
                        : 'bg-canvas text-ink-soft ring-line hover:text-ink'
                    }`}
                  >
                    <ImageIcon className="size-3" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://cdn.sanity.io/images/... or /images/interior.jpg"
              dir="ltr"
              className="h-9 w-full rounded-xl border border-line bg-canvas px-3 font-mono text-[11.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
            />
          </div>

          {/* Interactive Aspect-Locked Photo Canvas */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={`relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-stone select-none ${
              canvasMode === 'place' ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            <img
              src={image}
              alt="Shoppable room vignette"
              referrerPolicy="no-referrer"
              draggable={false}
              className="size-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/10" />

            {/* Top HUD Instruction */}
            <div className="pointer-events-none absolute start-3 top-3 flex items-center gap-2 rounded-full bg-ink/80 px-3 py-1.5 text-[11px] font-medium text-canvas backdrop-blur">
              <MousePointerClick className="size-3.5 text-accent" />
              <span>
                {canvasMode === 'place'
                  ? locale === 'ckb'
                    ? 'کرتە بکە بۆ خاڵی نوێ · خاڵەکان ڕابکێشە بۆ گۆڕینی شوێن'
                    : 'Click empty area to add pin · Drag any pin to reposition'
                  : locale === 'ckb'
                  ? 'ماوس بخەرە سەر هەر خاڵێک'
                  : 'Hover or click any dot to test'}
              </span>
            </div>

            {/* Hotspot Dots */}
            {resolvedHotspots.map((spot, idx) => {
              const isSelected = activeSpot?.key === spot.key;
              return (
                <button
                  key={spot.key}
                  type="button"
                  data-hotspot-pin="true"
                  onPointerDown={(e) => handlePinPointerDown(e, spot.key)}
                  onPointerMove={(e) => handlePinPointerMove(e, spot.key)}
                  onPointerUp={(e) => handlePinPointerUp(e, spot.key)}
                  onMouseEnter={() => {
                    if (canvasMode === 'preview') setSelectedKey(spot.key);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedKey(spot.key);
                  }}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  aria-label={spot.locProd.name}
                  className={`group absolute -translate-x-1/2 -translate-y-1/2 ${
                    canvasMode === 'place' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                  }`}
                >
                  <span
                    className={`relative grid size-9 place-items-center rounded-full text-[11px] font-bold transition-transform duration-200 ${
                      isSelected
                        ? 'scale-115 bg-ink text-canvas ring-4 ring-card/85 shadow-lift'
                        : 'bg-card/95 text-ink shadow-lift hover:scale-110'
                    }`}
                  >
                    {canvasMode === 'place' ? (
                      <span dir="ltr">{idx + 1}</span>
                    ) : (
                      <span className="size-2.5 rounded-full bg-current" />
                    )}
                  </span>

                  {/* Hover Label Tag in Place Mode */}
                  {canvasMode === 'place' && (
                    <span
                      dir="ltr"
                      className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/85 px-2 py-0.5 font-mono text-[10px] text-canvas opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                    >
                      {spot.x}% · {spot.y}%
                    </span>
                  )}
                </button>
              );
            })}

            {/* Live Preview Caption & Floating Product Card */}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-col justify-between gap-3 sm:inset-x-6 sm:bottom-6 sm:flex-row sm:items-end">
              <div className="max-w-xs text-canvas">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-canvas/80">
                  {eyebrow.trim() || t.vignetteEyebrow}
                </p>
                <p className="mt-0.5 font-display text-lg font-semibold tracking-tight sm:text-2xl">
                  {title.trim() || t.vignetteTitle}
                </p>
              </div>

              {activeSpot && (
                <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-2xl bg-card/95 p-3 shadow-lift backdrop-blur-md sm:w-80">
                  <img
                    src={activeSpot.locProd.image}
                    alt={activeSpot.locProd.name}
                    referrerPolicy="no-referrer"
                    className="size-12 shrink-0 rounded-xl bg-stone object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">
                      {activeSpot.locProd.name}
                    </p>
                    <p className="truncate text-[11px] text-ink-soft">
                      {activeSpot.locProd.finishes[0]?.name} ·{' '}
                      {activeSpot.locProd.dimensions.split('·')[0].trim()}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        dir="ltr"
                        className="font-display text-[13.5px] font-semibold text-ink tabular"
                      >
                        {formatPrice(activeSpot.locProd.price)}
                      </span>
                      {activeSpot.rawProd.stock <= 0 && (
                        <span className="rounded-full bg-danger/15 px-1.5 py-0.5 text-[9.5px] font-semibold text-danger">
                          {t.soldOutLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/product/${activeSpot.locProd.id}`}
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-canvas"
                  >
                    <CornerArrow className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Image URL Input + Optional Custom Titles */}
          <div className="grid gap-3 pt-1 sm:grid-cols-3">
            <div>
              <label className="block text-[11.5px] font-medium text-ink-soft">
                {locale === 'ckb' ? 'بەستەری وێنەی ژوور (URL)' : 'Room Image Path / URL'}
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                dir="ltr"
                className="mt-1 h-9 w-full rounded-xl border border-line bg-canvas px-3 font-mono text-[11.5px] text-ink focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-medium text-ink-soft">
                {locale === 'ckb' ? 'ناونیشانی بچووک (ئارەزوومەندانە)' : 'Eyebrow Text (Optional)'}
              </label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder={t.vignetteEyebrow}
                className="mt-1 h-9 w-full rounded-xl border border-line bg-canvas px-3 text-[12.5px] text-ink focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-medium text-ink-soft">
                {locale === 'ckb' ? 'سەردێڕی وێنە (ئارەزوومەندانە)' : 'Headline Override (Optional)'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.vignetteTitle}
                className="mt-1 h-9 w-full rounded-xl border border-line bg-canvas px-3 text-[12.5px] text-ink focus:border-ink focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Hotspots List & Product Assignment Panel */}
        <div className="tile space-y-5 p-5 sm:p-6 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-line pb-3.5">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">
                {locale === 'ckb'
                  ? `خاڵە دانراوەکان (${hotspots.length})`
                  : locale === 'ar'
                  ? `النقاط المضافة (${hotspots.length})`
                  : `Product Dots (${hotspots.length})`}
              </h3>
              <p className="text-[11.5px] text-ink-soft">
                {locale === 'ckb'
                  ? 'هەر خاڵێک ببەستەوە بە بەرهەمێکەوە'
                  : 'Link each dot to any product in your catalog'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const key = `spot-${nextPinIdRef.current++}`;
                setHotspots((prev) => [
                  ...prev,
                  {
                    key,
                    productId: nextProductId || allProducts[0]?.id || 'bolle-lounge-chair',
                    x: 50,
                    y: 50,
                  },
                ]);
                setSelectedKey(key);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-sand px-3 py-1.5 text-[11.5px] font-medium text-ink hover:bg-ink hover:text-canvas"
            >
              <Plus className="size-3.5" />
              <span>{locale === 'ckb' ? 'خاڵی نوێ' : 'Add Dot'}</span>
            </button>
          </div>

          {/* Default Product for Next Click */}
          <div className="rounded-2xl bg-canvas p-3 ring-1 ring-line">
            <label className="block text-[11px] font-medium text-ink-soft">
              {locale === 'ckb'
                ? 'کاتێک کرتە دەکەیتە سەر وێنەکە، ئەم بەرهەمە دابنێت:'
                : 'Default product for next photo click:'}
            </label>
            <select
              value={nextProductId}
              onChange={(e) => setNextProductId(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-xl border border-line bg-card px-2.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
            >
              {allProducts.map((p) => {
                const loc = localizeProduct(p, locale);
                return (
                  <option key={p.id} value={p.id}>
                    {loc.name} — {formatPrice(p.price)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* List of Placed Hotspots */}
          <div className="max-h-[420px] space-y-2.5 overflow-y-auto pe-1">
            {resolvedHotspots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-6 text-center text-[12.5px] text-ink-soft">
                {locale === 'ckb'
                  ? 'هیچ خاڵێک دانەنراوە. کرتە لە سەر وێنەکە بکە!'
                  : 'No dots placed yet. Click anywhere on the room photo!'}
              </div>
            ) : (
              resolvedHotspots.map((spot, idx) => {
                const isSelected = activeSpot?.key === spot.key;
                return (
                  <div
                    key={spot.key}
                    onClick={() => setSelectedKey(spot.key)}
                    className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                      isSelected
                        ? 'border-ink bg-sand/50 ring-2 ring-ink/15'
                        : 'border-line bg-canvas/70 hover:border-ink/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          dir="ltr"
                          className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${
                            isSelected ? 'bg-ink text-canvas' : 'bg-card text-ink ring-1 ring-line'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span dir="ltr" className="font-mono text-[11px] text-ink-soft">
                          X: {spot.x}% · Y: {spot.y}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHotspots((prev) => prev.filter((item) => item.key !== spot.key));
                        }}
                        title="Remove dot"
                        className="grid size-7 place-items-center rounded-full text-ink-soft hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* Linked Product Selector */}
                    <select
                      value={spot.productId}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        setHotspots((prev) =>
                          prev.map((item) =>
                            item.key === spot.key ? { ...item, productId: nextId } : item
                          )
                        );
                      }}
                      className="mt-2 h-9 w-full rounded-xl border border-line bg-card px-2.5 text-[12.5px] font-medium text-ink focus:border-ink focus:outline-none"
                    >
                      {allProducts.map((p) => {
                        const loc = localizeProduct(p, locale);
                        return (
                          <option key={p.id} value={p.id}>
                            {loc.name} — {formatPrice(p.price)}
                            {p.stock <= 0 ? ` (${t.soldOutLabel})` : ''}
                          </option>
                        );
                      })}
                    </select>

                    {/* Fine X / Y sliders when selected */}
                    {isSelected && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2.5 grid grid-cols-2 gap-2 border-t border-line/60 pt-2"
                      >
                        <label className="text-[10.5px] text-ink-soft">
                          <span dir="ltr" className="font-mono">
                            X: {spot.x}%
                          </span>
                          <input
                            type="range"
                            min={3}
                            max={97}
                            step={0.5}
                            value={spot.x}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setHotspots((prev) =>
                                prev.map((item) =>
                                  item.key === spot.key ? { ...item, x: val } : item
                                )
                              );
                            }}
                            className="mt-1 w-full accent-ink"
                          />
                        </label>
                        <label className="text-[10.5px] text-ink-soft">
                          <span dir="ltr" className="font-mono">
                            Y: {spot.y}%
                          </span>
                          <input
                            type="range"
                            min={4}
                            max={96}
                            step={0.5}
                            value={spot.y}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setHotspots((prev) =>
                                prev.map((item) =>
                                  item.key === spot.key ? { ...item, y: val } : item
                                )
                              );
                            }}
                            className="mt-1 w-full accent-ink"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Save / Reset / Sanity Inspect Actions */}
          <div className="space-y-2.5 border-t border-line pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-semibold text-canvas shadow-tile transition-colors hover:bg-accent disabled:opacity-60"
            >
              <Save className="size-4" />
              <span>
                {saving
                  ? locale === 'ckb'
                    ? 'پاشەکەوت دەکرێت...'
                    : 'Publishing...'
                  : locale === 'ckb'
                  ? 'پاشەکەوتکردن و بڵاوکردنەوە لە پەڕەی سەرەکی'
                  : locale === 'ar'
                  ? 'حفظ ونشر على الصفحة الرئيسية'
                  : 'Save & Publish to Landing Page'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-canvas px-3 text-[12px] font-medium text-ink-soft ring-1 ring-line hover:text-ink"
              >
                <RotateCcw className="size-3.5" />
                <span>{locale === 'ckb' ? 'بنەڕەتی' : 'Reset Default'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSanityJson((v) => !v)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-canvas px-3 text-[12px] font-medium text-ink-soft ring-1 ring-line hover:text-ink"
              >
                <Code2 className="size-3.5" />
                <span>Sanity JSON</span>
              </button>
            </div>

            {showSanityJson && (
              <pre
                dir="ltr"
                className="max-h-56 overflow-auto rounded-2xl bg-ink p-3.5 font-mono text-[10.5px] leading-relaxed text-canvas"
              >
                {sanityJson}
              </pre>
            )}
          </div>
        </div>
      </div>

      <ImageAssetPickerModal
        open={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        title={
          locale === 'ckb'
            ? 'هەڵبژاردنی وێنەی ژوور لە Sanity یان بەستەری دەرەکی'
            : 'Connect Room Scene Image Asset'
        }
        currentUrl={image}
        onSelectSingle={(url) => {
          setImage(url);
          showStatus(
            locale === 'ckb'
              ? 'وێنەی ژوور بە سەرکەوتوویی بەسترایەوە!'
              : 'Room image asset connected! Click anywhere on the photo to drop product dots.'
          );
        }}
      />
    </div>
  );
}

export function RoomHotspotEditor() {
  const roomScene = useRoomScene();
  return (
    <RoomHotspotEditorInner
      key={roomScene.updatedAt ?? 'default-room-scene'}
      initialScene={roomScene}
    />
  );
}
