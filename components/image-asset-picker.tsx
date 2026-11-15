'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Cloud,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Loader2,
  RefreshCw,
  Search,
  Upload,
  X,
} from 'lucide-react';
import { useShowroom } from './providers';
import { demoBackend } from '@/lib/demoBackend';

export interface SanityAssetRecord {
  _id: string;
  url: string;
  originalFilename?: string;
  size?: number;
  width?: number;
  height?: number;
}

interface ImageAssetPickerModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  multiple?: boolean;
  currentUrl?: string;
  onSelectSingle?: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageAssetPickerModal(props: ImageAssetPickerModalProps) {
  if (!props.open) return null;
  return (
    <ImageAssetPickerContent
      key={`${props.currentUrl || ''}-${props.multiple ? 'm' : 's'}`}
      {...props}
    />
  );
}

function ImageAssetPickerContent({
  onClose,
  title,
  multiple = false,
  currentUrl = '',
  onSelectSingle,
  onSelectMultiple,
}: ImageAssetPickerModalProps) {
  const { locale } = useShowroom();
  const [tab, setTab] = useState<'sanity' | 'upload' | 'url'>('sanity');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [assets, setAssets] = useState<SanityAssetRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sanity/assets');
      const data = await res.json();
      setConfigured(Boolean(data.configured));
      setHasToken(Boolean(data.hasToken));
      setProjectId(data.projectId || '');
      setAssets(Array.isArray(data.assets) ? data.assets : []);
      if (!res.ok && data.error) {
        setError(data.error);
      }
    } catch {
      setError('Could not load Sanity Media Library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/sanity/assets')
      .then(async (res) => ({ ok: res.ok, data: await res.json() }))
      .then(({ ok, data }) => {
        if (cancelled) return;
        setConfigured(Boolean(data.configured));
        setHasToken(Boolean(data.hasToken));
        setProjectId(data.projectId || '');
        setAssets(Array.isArray(data.assets) ? data.assets : []);
        if (!ok && data.error) {
          setError(data.error);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load Sanity Media Library.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        (a.originalFilename || '').toLowerCase().includes(q) ||
        a.url.toLowerCase().includes(q)
    );
  }, [assets, search]);

  const toggleUrl = (url: string) => {
    if (!multiple) {
      onSelectSingle?.(url);
      onClose();
      return;
    }
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const sorted = Array.from(files).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      const uploadedUrls: string[] = [];
      for (const file of sorted) {
        const resultUrl = multiple
          ? await demoBackend.upload360Frame(file)
          : await demoBackend.uploadProductImage(file);
        uploadedUrls.push(resultUrl);
      }

      if (multiple) {
        onSelectMultiple?.(uploadedUrls);
        onClose();
      } else if (uploadedUrls[0]) {
        onSelectSingle?.(uploadedUrls[0]);
        onClose();
      }
    } catch {
      setError(
        locale === 'ckb'
          ? 'کێشە لە بارکردنی وێنەدا هەبوو'
          : 'Failed to process or upload image asset.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyExternalUrl = () => {
    const cleaned = urlInput.trim();
    if (!cleaned) return;
    if (multiple) {
      const list = cleaned
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length > 0) {
        onSelectMultiple?.(list);
        onClose();
      }
    } else {
      onSelectSingle?.(cleaned);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-line bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
              {locale === 'ckb'
                ? 'بەستنەوەی وێنە · Sanity Assets CDN ($0)'
                : locale === 'ar'
                ? 'ربط الأصول الصورية · Sanity CDN مجاني'
                : 'Connect Image Asset · $0 Sanity CDN & External URLs'}
            </span>
            <h3 className="truncate font-display text-base font-semibold text-ink">
              {title ||
                (locale === 'ckb'
                  ? 'هەڵبژاردنی یان بەستنەوەی وێنە'
                  : locale === 'ar'
                  ? 'اختيار أو ربط صورة'
                  : 'Select or Connect Image Asset')}
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

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-canvas px-5 py-2.5">
          <button
            type="button"
            onClick={() => setTab('sanity')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              tab === 'sanity'
                ? 'bg-ink text-canvas'
                : 'bg-card text-ink-soft ring-1 ring-line hover:text-ink'
            }`}
          >
            <Cloud className="size-3.5" />
            <span>
              {locale === 'ckb'
                ? 'کتێبخانەی Sanity'
                : locale === 'ar'
                ? 'مكتبة Sanity'
                : 'Sanity Media Library'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              tab === 'upload'
                ? 'bg-ink text-canvas'
                : 'bg-card text-ink-soft ring-1 ring-line hover:text-ink'
            }`}
          >
            <Upload className="size-3.5" />
            <span>
              {locale === 'ckb'
                ? 'بارکردن بۆ Sanity CDN'
                : locale === 'ar'
                ? 'رفع إلى Sanity CDN'
                : 'Upload to Sanity CDN'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('url')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              tab === 'url'
                ? 'bg-ink text-canvas'
                : 'bg-card text-ink-soft ring-1 ring-line hover:text-ink'
            }`}
          >
            <Link2 className="size-3.5" />
            <span>
              {locale === 'ckb'
                ? 'بەستەری وێنەی دەرەکی'
                : locale === 'ar'
                ? 'رابط صورة خارجي'
                : 'Paste Image URL'}
            </span>
          </button>

          <span
            dir="ltr"
            className={`ms-auto rounded-full px-2.5 py-0.5 font-mono text-[10px] ${
              configured
                ? hasToken
                  ? 'bg-ok/15 text-ok'
                  : 'bg-sand text-ink'
                : 'bg-canvas text-ink-soft ring-1 ring-line'
            }`}
          >
            {configured
              ? hasToken
                ? `Sanity ${projectId} · Read+Upload`
                : `Sanity ${projectId} · Read-only`
              : 'Sanity env not set'}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-[12px] text-danger">
              {error}
            </div>
          )}

          {tab === 'sanity' && (
            <div className="space-y-4">
              {!configured ? (
                <div className="rounded-2xl border border-line bg-canvas p-5 text-[13px] leading-relaxed text-ink-soft">
                  <p className="font-semibold text-ink">
                    {locale === 'ckb'
                      ? 'Sanity هێشتا نەبەستراوەتەوە (خۆڕاییە — $0)'
                      : 'Connect your free Sanity account ($0 tier) to browse & host image assets:'}
                  </p>
                  <ol className="mt-2 list-decimal space-y-1 ps-5 text-[12.5px]">
                    <li>
                      Create a free project at{' '}
                      <span className="font-mono text-ink">sanity.io</span> (10 GB CDN
                      storage &amp; bandwidth included free).
                    </li>
                    <li>
                      Set <span className="font-mono text-ink">NEXT_PUBLIC_SANITY_PROJECT_ID</span>,{' '}
                      <span className="font-mono text-ink">NEXT_PUBLIC_SANITY_DATASET=production</span>, and{' '}
                      <span className="font-mono text-ink">SANITY_API_TOKEN</span> in Vercel / `.env`.
                    </li>
                    <li>
                      Meanwhile, you can still use the{' '}
                      <strong className="text-ink">Paste Image URL</strong> tab (e.g.
                      Cloudinary Free, ImgBB, or GitHub image URLs) for $0 image hosting.
                    </li>
                  </ol>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={
                          locale === 'ckb'
                            ? 'گەڕان لە ناوی وێنەکان...'
                            : 'Filter Sanity assets by filename...'
                        }
                        className="h-9 w-full rounded-xl border border-line bg-canvas pe-3 ps-8 text-[12.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={loadAssets}
                      disabled={loading}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 text-[12px] font-medium text-ink hover:bg-sand"
                    >
                      <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-[13px] text-ink-soft">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Loading Sanity image assets...</span>
                    </div>
                  ) : filteredAssets.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-line bg-canvas p-8 text-center">
                      <ImageIcon className="mx-auto size-7 text-ink-soft" />
                      <p className="mt-2 text-[13px] font-medium text-ink">
                        No image assets found in Sanity yet
                      </p>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        Upload photos in the next tab or in Sanity Studio Media, then click Refresh.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {filteredAssets.map((asset) => {
                        const isPicked = selectedUrls.includes(asset.url);
                        return (
                          <button
                            key={asset._id}
                            type="button"
                            onClick={() => toggleUrl(asset.url)}
                            className={`group relative flex flex-col overflow-hidden rounded-2xl border text-start transition-all ${
                              isPicked
                                ? 'border-ink ring-2 ring-ink/25'
                                : 'border-line bg-canvas hover:border-ink/40'
                            }`}
                          >
                            <div className="relative aspect-square w-full overflow-hidden bg-stone">
                              <img
                                src={`${asset.url}?w=420&auto=format`}
                                alt={asset.originalFilename || 'Sanity asset'}
                                referrerPolicy="no-referrer"
                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              {isPicked && (
                                <span className="absolute end-2 top-2 flex size-6 items-center justify-center rounded-full bg-ink text-canvas shadow">
                                  <Check className="size-3.5" />
                                </span>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="truncate text-[11.5px] font-medium text-ink">
                                {asset.originalFilename || 'Image'}
                              </p>
                              <p className="font-mono text-[10px] text-ink-soft">
                                {asset.width && asset.height
                                  ? `${asset.width}×${asset.height}`
                                  : ''}
                                {asset.size ? ` · ${formatBytes(asset.size)}` : ''}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-canvas px-6 py-10 text-center transition-colors hover:border-ink/50 hover:bg-sand/40"
              >
                {uploading ? (
                  <Loader2 className="size-8 animate-spin text-ink" />
                ) : (
                  <Upload className="size-8 text-ink-soft" />
                )}
                <p className="mt-3 text-[13.5px] font-semibold text-ink">
                  {uploading
                    ? 'Optimizing & uploading to Sanity CDN...'
                    : multiple
                    ? 'Select 1 or more photos to upload to Sanity CDN'
                    : 'Click to choose a photo to upload to Sanity CDN'}
                </p>
                <p className="mt-1 max-w-md text-[12px] text-ink-soft">
                  {hasToken
                    ? 'Files are compressed automatically to WebP and stored on your free Sanity CDN (cdn.sanity.io).'
                    : 'Sanity write token is not configured yet — uploaded images will optimize locally as compact WebP.'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple={multiple}
                  onChange={handleUploadFiles}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {multiple
                    ? 'Paste Image Asset URLs (one per line or comma-separated)'
                    : 'Image Asset URL (Sanity CDN, Cloudinary, ImgBB, GitHub, etc.)'}
                </label>
                {multiple ? (
                  <textarea
                    rows={4}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={`https://cdn.sanity.io/images/.../angle-1.webp\nhttps://cdn.sanity.io/images/.../angle-2.webp`}
                    className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-3 font-mono text-[12px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                  />
                ) : (
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://cdn.sanity.io/images/... or https://res.cloudinary.com/..."
                    className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3.5 font-mono text-[12px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                  />
                )}
              </div>

              {!multiple && urlInput.trim() && (
                <div className="overflow-hidden rounded-2xl border border-line bg-stone">
                  <div className="aspect-[16/9] max-h-56 w-full">
                    <img
                      src={urlInput.trim()}
                      alt="External asset preview"
                      referrerPolicy="no-referrer"
                      className="size-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-line bg-canvas p-3.5 text-[12px] text-ink-soft">
                <p className="font-medium text-ink">$0 Free Image Hosting Tip</p>
                <p className="mt-1">
                  Keep this landing page completely free on <strong className="text-ink">Vercel Hobby ($0)</strong> +{' '}
                  <strong className="text-ink">Sanity Free ($0 · 10 GB CDN)</strong> or paste URLs from{' '}
                  <span className="font-mono text-ink">Cloudinary Free</span> /{' '}
                  <span className="font-mono text-ink">GitHub public/images</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-line bg-canvas px-5 py-3">
          <div className="text-[11.5px] text-ink-soft">
            {tab === 'sanity' && multiple && (
              <span>
                Selected:{' '}
                <strong className="font-mono text-ink">{selectedUrls.length}</strong>{' '}
                images
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-1.5 text-[12px] font-medium text-ink-soft hover:bg-sand hover:text-ink"
            >
              Cancel
            </button>
            {tab === 'sanity' && multiple && (
              <button
                type="button"
                disabled={selectedUrls.length === 0}
                onClick={() => {
                  onSelectMultiple?.(selectedUrls);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-canvas hover:bg-accent disabled:opacity-40"
              >
                <Check className="size-3.5" />
                <span>Connect {selectedUrls.length} Assets</span>
              </button>
            )}
            {tab === 'url' && (
              <button
                type="button"
                disabled={!urlInput.trim()}
                onClick={handleApplyExternalUrl}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-canvas hover:bg-accent disabled:opacity-40"
              >
                <ExternalLink className="size-3.5" />
                <span>Connect URL</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
