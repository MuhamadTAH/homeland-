'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  Eraser,
  Eye,
  Loader2,
  Paintbrush,
  RotateCcw,
  Scissors,
  Undo2,
  X,
} from 'lucide-react';
import { useShowroom } from './providers';
import { demoBackend } from '@/lib/demoBackend';

interface BackgroundRemoverModalProps {
  open: boolean;
  source: File | string | null;
  filenameHint?: string;
  canOfferKeepScene?: boolean;
  onClose: () => void;
  onApply: (result: { cutoutUrl: string; originalSceneUrl?: string }) => void;
}

type ToolMode = 'erase' | 'restore';
type PreviewBg = 'checker' | 'sand' | 'ink';

function trimTransparentCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;
  const { width, height } = sourceCanvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return sourceCanvas;

  const pad = Math.round(Math.max(width, height) * 0.03);
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, maxX - minX + 1 + pad * 2);
  const cropH = Math.min(height - cropY, maxY - minY + 1 + pad * 2);

  const out = document.createElement('canvas');
  out.width = cropW;
  out.height = cropH;
  const outCtx = out.getContext('2d');
  if (!outCtx) return sourceCanvas;
  outCtx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return out;
}

async function fileOrUrlToNormalizedBlob(source: File | string): Promise<{
  blob: Blob;
  width: number;
  height: number;
  originalDataUrl: string;
}> {
  let rawBlob: Blob;
  if (typeof source === 'string') {
    const res = await fetch(source);
    if (!res.ok) throw new Error('Could not load source image for background removal');
    rawBlob = await res.blob();
  } else {
    rawBlob = source;
  }

  const bitmap = await createImageBitmap(rawBlob);
  const maxDim = 1080;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);

  const originalDataUrl = canvas.toDataURL('image/webp', 0.85);
  const normalizedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
      'image/png'
    );
  });

  return { blob: normalizedBlob, width, height, originalDataUrl };
}

export function BackgroundRemoverModal(props: BackgroundRemoverModalProps) {
  if (!props.open || !props.source) return null;
  const key =
    typeof props.source === 'string'
      ? props.source.slice(0, 80)
      : `${props.source.name}-${props.source.size}-${props.source.lastModified}`;
  return <BackgroundRemoverContent key={key} {...props} source={props.source} />;
}

function BackgroundRemoverContent({
  source,
  filenameHint = 'product-cutout',
  canOfferKeepScene = false,
  onClose,
  onApply,
}: Omit<BackgroundRemoverModalProps, 'open' | 'source'> & { source: File | string }) {
  const { locale } = useShowroom();

  const [processing, setProcessing] = useState(true);
  const [applying, setApplying] = useState(false);
  const [progressLabel, setProgressLabel] = useState(
    locale === 'ckb'
      ? 'ئامادەکردنی زیرەکی دەستکرد لە ناو وێبگەڕدا ($0)...'
      : 'Starting free in-browser AI cutout ($0)...'
  );
  const [progressPct, setProgressPct] = useState(8);
  const [error, setError] = useState<string | null>(null);

  const [tool, setTool] = useState<ToolMode>('erase');
  const [brushSize, setBrushSize] = useState(26);
  const [previewBg, setPreviewBg] = useState<PreviewBg>('sand');
  const [showOriginal, setShowOriginal] = useState(false);
  const [trimEdges, setTrimEdges] = useState(true);
  const [keepOriginalAsScene, setKeepOriginalAsScene] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [originalDataUrl, setOriginalDataUrl] = useState<string>('');

  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const aiResultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const originalDataUrlRef = useRef<string>('');

  const pushUndoSnapshot = useCallback(() => {
    const canvas = displayCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > 18) {
      undoStackRef.current.shift();
    }
    setUndoCount(undoStackRef.current.length);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runRemoval() {
      try {
        setProcessing(true);
        setError(null);
        setProgressPct(10);

        const { blob, width, height, originalDataUrl: origUrl } =
          await fileOrUrlToNormalizedBlob(source);
        if (cancelled) return;
        originalDataUrlRef.current = origUrl;
        setOriginalDataUrl(origUrl);

        // Draw original image onto hidden reference canvas for Restore Brush
        const origImg = await createImageBitmap(blob);
        if (cancelled) return;
        const origCanvas = document.createElement('canvas');
        origCanvas.width = width;
        origCanvas.height = height;
        origCanvas.getContext('2d')?.drawImage(origImg, 0, 0, width, height);
        originalCanvasRef.current = origCanvas;

        setProgressLabel(
          locale === 'ckb'
            ? 'لابردنی باکگراوند لە ناو وێبگەڕدا (تەواو خۆڕایی)...'
            : locale === 'ar'
            ? 'جاري إزالة الخلفية مجاناً داخل المتصفح...'
            : 'Separating sofa from background in your browser ($0)...'
        );

        const { removeBackground } = await import('@imgly/background-removal');
        if (cancelled) return;

        const resultBlob = await removeBackground(blob, {
          model: 'isnet_fp16',
          output: { format: 'image/png', quality: 0.92 },
          progress: (key: string, current: number, total: number) => {
            if (cancelled) return;
            const ratio = total > 0 ? Math.min(1, current / total) : 0;
            if (key.includes('fetch')) {
              setProgressPct(Math.max(12, Math.round(12 + ratio * 48)));
              setProgressLabel(
                locale === 'ckb'
                  ? `داگرتنی مۆدێلی AI (تەنها یەکجار، خۆڕایی)... ${Math.round(ratio * 100)}%`
                  : `Loading browser AI model (first run only, $0)... ${Math.round(ratio * 100)}%`
              );
            } else {
              setProgressPct(Math.max(60, Math.round(60 + ratio * 38)));
              setProgressLabel(
                locale === 'ckb'
                  ? `بڕینی وردی قەراغەکانی بەرهەم... ${Math.round(ratio * 100)}%`
                  : `Refining furniture edges... ${Math.round(ratio * 100)}%`
              );
            }
          },
        });

        if (cancelled) return;

        const cutoutBitmap = await createImageBitmap(resultBlob);
        if (cancelled) return;

        // Store initial AI cutout for Reset button
        const aiCanvas = document.createElement('canvas');
        aiCanvas.width = width;
        aiCanvas.height = height;
        aiCanvas.getContext('2d')?.drawImage(cutoutBitmap, 0, 0, width, height);
        aiResultCanvasRef.current = aiCanvas;

        // Paint onto interactive editing canvas
        const disp = displayCanvasRef.current;
        if (disp) {
          disp.width = width;
          disp.height = height;
          const dCtx = disp.getContext('2d');
          dCtx?.clearRect(0, 0, width, height);
          dCtx?.drawImage(cutoutBitmap, 0, 0, width, height);
        }

        setProgressPct(100);
        setProcessing(false);
      } catch (err: any) {
        if (cancelled) return;
        console.error('Background removal error:', err);
        setError(
          err?.message ||
            'Could not run browser AI background removal on this image. You can still use a transparent PNG or paste an image URL.'
        );
        setProcessing(false);
      }
    }

    runRemoval();
    return () => {
      cancelled = true;
    };
  }, [source, locale]);

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const applyBrushAt = (
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const canvas = displayCanvasRef.current;
    const orig = originalCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const scaleFactor = Math.max(1, canvas.width / 520);
    const radius = (brushSize * scaleFactor) / 2;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / Math.max(2, radius * 0.35)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = from.x + dx * t;
      const cy = from.y + dy * t;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      if (tool === 'erase') {
        ctx.clearRect(cx - radius - 1, cy - radius - 1, radius * 2 + 2, radius * 2 + 2);
      } else if (orig) {
        ctx.drawImage(orig, 0, 0);
      }

      ctx.restore();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (processing || showOriginal) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pushUndoSnapshot();
    drawingRef.current = true;
    const pt = getCanvasPoint(e.clientX, e.clientY);
    lastPointRef.current = pt;
    applyBrushAt(pt, pt);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || processing || showOriginal) return;
    const pt = getCanvasPoint(e.clientX, e.clientY);
    const prev = lastPointRef.current ?? pt;
    applyBrushAt(prev, pt);
    lastPointRef.current = pt;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleUndo = () => {
    const canvas = displayCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const prev = undoStackRef.current.pop();
    if (!canvas || !ctx || !prev) return;
    ctx.putImageData(prev, 0, 0);
    setUndoCount(undoStackRef.current.length);
  };

  const handleResetCutout = () => {
    const disp = displayCanvasRef.current;
    const ai = aiResultCanvasRef.current;
    const ctx = disp?.getContext('2d');
    if (!disp || !ai || !ctx) return;
    pushUndoSnapshot();
    ctx.clearRect(0, 0, disp.width, disp.height);
    ctx.drawImage(ai, 0, 0);
  };

  const handleApplyCutout = async () => {
    const disp = displayCanvasRef.current;
    if (!disp) return;
    setApplying(true);
    try {
      const finalCanvas = trimEdges ? trimTransparentCanvas(disp) : disp;
      const cutoutDataUrl = finalCanvas.toDataURL('image/webp', 0.88);
      const cleanName = filenameHint.replace(/[^a-zA-Z0-9_-]/g, '-') || 'product';
      const uploadedCutoutUrl = await demoBackend.uploadDataUrlToSanity(
        cutoutDataUrl,
        `${cleanName}-cutout.webp`
      );

      let uploadedSceneUrl: string | undefined;
      if (keepOriginalAsScene && originalDataUrlRef.current) {
        uploadedSceneUrl = await demoBackend.uploadDataUrlToSanity(
          originalDataUrlRef.current,
          `${cleanName}-room-scene.webp`
        );
      }

      onApply({
        cutoutUrl: uploadedCutoutUrl,
        originalSceneUrl: uploadedSceneUrl,
      });
      onClose();
    } catch {
      setError('Failed to export transparent cutout.');
    } finally {
      setApplying(false);
    }
  };

  const previewBackdropClass =
    previewBg === 'sand'
      ? 'bg-sand'
      : previewBg === 'ink'
      ? 'bg-ink'
      : 'bg-[linear-gradient(45deg,#e5e0d7_25%,transparent_25%),linear-gradient(-45deg,#e5e0d7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e0d7_75%),linear-gradient(-45deg,transparent_75%,#e5e0d7_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] bg-card';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-line bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              <Scissors className="size-3" />
              {locale === 'ckb'
                ? 'لابردنی باکگراوند لە ناو وێبگەڕدا · خۆڕایی ($0)'
                : locale === 'ar'
                ? 'إزالة الخلفية داخل المتصفح · مجاني ($0)'
                : 'On-Device AI Background Remover · $0 Cost'}
            </span>
            <h3 className="truncate font-display text-base font-semibold text-ink">
              {locale === 'ckb'
                ? 'هێشتنەوەی تەنها مۆبیلیات + فڵچەی دەستکاری'
                : locale === 'ar'
                ? 'الاحتفاظ بالأثاث فقط + فرشاة التعديل'
                : 'Cut Out Furniture & Touch Up Floor / Legs'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-canvas text-ink-soft hover:bg-sand hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[12.5px] text-danger">
              {error}
            </div>
          )}

          {processing ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-canvas px-6 py-16 text-center">
              <Loader2 className="size-8 animate-spin text-ink" />
              <p className="mt-4 text-[13.5px] font-semibold text-ink">
                {progressLabel}
              </p>
              <div className="mt-3 h-2 w-64 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-ink transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 max-w-md text-[11.5px] text-ink-soft">
                Runs 100% inside your browser using WebAssembly — zero API cost, zero external charges.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-12">
              {/* Left Canvas Stage */}
              <div className="lg:col-span-8">
                <div
                  className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-line ${previewBackdropClass}`}
                >
                  <canvas
                    ref={displayCanvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className={`max-h-full max-w-full touch-none object-contain ${
                      showOriginal ? 'hidden' : 'cursor-crosshair'
                    }`}
                  />
                  {showOriginal && originalDataUrl && (
                    <img
                      src={originalDataUrl}
                      alt="Original photo"
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>

                <p className="mt-2 text-[11.5px] text-ink-soft">
                  {locale === 'ckb'
                    ? 'ئەگەر بەشێکی زەوی لە نێوان قاچەکان مابوو، بە «سڕینەوە» لایببە؛ ئەگەر قاچێک سڕابووەوە بە «گەڕاندنەوە» چاکی بکە.'
                    : 'Tip: If any floor stayed between sofa legs, paint it out with Erase Floor. If a thin leg was clipped, paint it back with Restore Leg.'}
                </p>
              </div>

              {/* Right Touch-up Controls */}
              <div className="space-y-4 lg:col-span-4">
                <div className="rounded-2xl border border-line bg-canvas p-4 space-y-3">
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-soft">
                    1 · Touch-Up Brush
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOriginal(false);
                        setTool('erase');
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors ${
                        tool === 'erase' && !showOriginal
                          ? 'bg-ink text-canvas'
                          : 'bg-card text-ink ring-1 ring-line hover:bg-sand'
                      }`}
                    >
                      <Eraser className="size-3.5" />
                      <span>Erase Floor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOriginal(false);
                        setTool('restore');
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors ${
                        tool === 'restore' && !showOriginal
                          ? 'bg-ink text-canvas'
                          : 'bg-card text-ink ring-1 ring-line hover:bg-sand'
                      }`}
                    >
                      <Paintbrush className="size-3.5" />
                      <span>Restore Edge</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="text-ink-soft">Brush Size</span>
                      <span className="font-mono text-ink">{brushSize} px</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={72}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="mt-1 w-full accent-ink"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={undoCount === 0}
                      onClick={handleUndo}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-ink ring-1 ring-line hover:bg-sand disabled:opacity-40"
                    >
                      <Undo2 className="size-3.5" />
                      <span>Undo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCutout}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-ink ring-1 ring-line hover:bg-sand"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Reset AI</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-canvas p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-soft">
                      2 · Edge Check Backdrop
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowOriginal((v) => !v)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        showOriginal
                          ? 'bg-ink text-canvas'
                          : 'bg-card text-ink-soft ring-1 ring-line'
                      }`}
                    >
                      <Eye className="size-3" />
                      <span>{showOriginal ? 'Cutout' : 'Original'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        ['checker', 'Transparent'],
                        ['sand', 'Sand Card'],
                        ['ink', 'Dark Edge'],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPreviewBg(id)}
                        className={`rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                          previewBg === id
                            ? 'bg-ink text-canvas'
                            : 'bg-card text-ink-soft ring-1 ring-line hover:text-ink'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 pt-1 text-[12px] text-ink">
                    <input
                      type="checkbox"
                      checked={trimEdges}
                      onChange={(e) => setTrimEdges(e.target.checked)}
                      className="size-4 rounded accent-ink"
                    />
                    <span>Auto-crop empty margin around sofa</span>
                  </label>

                  {canOfferKeepScene && (
                    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink">
                      <input
                        type="checkbox"
                        checked={keepOriginalAsScene}
                        onChange={(e) => setKeepOriginalAsScene(e.target.checked)}
                        className="size-4 rounded accent-ink"
                      />
                      <span>Also keep original photo as Room Scene</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-line bg-canvas px-5 py-3">
          <span className="font-mono text-[11px] text-ink-soft">
            Output: Transparent WebP · Uploaded to Sanity CDN ($0) if configured
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-1.5 text-[12px] font-medium text-ink-soft hover:bg-sand hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={processing || applying || Boolean(error)}
              onClick={handleApplyCutout}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-[12.5px] font-semibold text-canvas hover:bg-accent disabled:opacity-40"
            >
              {applying ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              <span>
                {applying
                  ? 'Saving cutout...'
                  : locale === 'ckb'
                  ? 'بەکارهێنانی وێنەی بێ باکگراوند'
                  : 'Apply Cutout Image'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
