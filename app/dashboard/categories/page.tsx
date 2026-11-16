'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Tags,
  Edit3,
  Trash2,
  Check,
  X,
  ArrowUpLeft,
  ArrowUpRight,
  Lock,
  Package,
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard-shell';
import { useShowroom } from '@/components/providers';
import {
  useDashToast,
  DashToast,
  ConfirmDialog,
  NewCategoryInlineForm,
} from '@/components/dashboard-ui';
import {
  Category,
  TINT_BG,
  validateCategoryName,
  findDuplicateCategory,
} from '@/lib/catalog';
import { localizeCategoryName } from '@/lib/i18n';
import { getDashCopy } from '@/lib/dashboard-i18n';

export default function DashboardCategoriesPage() {
  const { catalog } = useDashboard();
  const { locale, dir, t } = useShowroom();
  const d = getDashCopy(locale);
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;
  const { notice, show: showToast, dismiss } = useDashToast();

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [savingRename, setSavingRename] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignTo, setReassignTo] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  const statsByCategory = useMemo(() => {
    const map = new Map<
      string,
      { total: number; live: number; draft: number; previews: string[] }
    >();
    for (const c of catalog.categories) {
      map.set(c.id, { total: 0, live: 0, draft: 0, previews: [] });
    }
    for (const p of catalog.allProducts) {
      const entry = map.get(p.category) || {
        total: 0,
        live: 0,
        draft: 0,
        previews: [],
      };
      entry.total += 1;
      if (p.status === 'draft') entry.draft += 1;
      else entry.live += 1;
      if (p.image && entry.previews.length < 3) {
        entry.previews.push(p.image);
      }
      map.set(p.category, entry);
    }
    return map;
  }, [catalog.categories, catalog.allProducts]);

  const startRename = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditError(null);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditName('');
    setEditError(null);
  };

  const handleCommitRename = async (cat: Category) => {
    const vErr = validateCategoryName(editName);
    if (vErr) {
      setEditError(vErr);
      return;
    }
    const dup = findDuplicateCategory(catalog.categories, editName, cat.id);
    if (dup) {
      setEditError(`"${dup.name}" already exists.`);
      return;
    }
    setSavingRename(true);
    try {
      await catalog.renameCategory(cat.id, editName);
      showToast(`"${editName.trim()}"`);
      cancelRename();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not rename category');
    } finally {
      setSavingRename(false);
    }
  };

  const openDeleteModal = (cat: Category) => {
    const others = catalog.categories.filter((c) => c.id !== cat.id);
    setDeleteTarget(cat);
    setReassignTo(others[0]?.id || '');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const count = statsByCategory.get(deleteTarget.id)?.total || 0;
      await catalog.deleteCategory(
        deleteTarget.id,
        count > 0 ? reassignTo : null
      );
      showToast(`Removed "${deleteTarget.name}"`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete category', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const targetCount = deleteTarget
    ? statsByCategory.get(deleteTarget.id)?.total || 0
    : 0;
  const otherCategories = useMemo(
    () =>
      deleteTarget
        ? catalog.categories.filter((c) => c.id !== deleteTarget.id)
        : [],
    [catalog.categories, deleteTarget]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-line bg-card p-6">
        <div>
          <div className="text-[12px] font-medium text-ink-soft">
            {d.workspace} · {d.navCategories}
          </div>
          <h1 className="display mt-1 text-balance text-[clamp(22px,2.8vw,32px)] font-semibold tracking-[-0.03em] text-ink">
            {d.categoriesTitle}
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">{d.categoriesSubtitle}</p>
        </div>

        <div className="font-mono text-[13px] text-ink-soft tabular">
          <span className="font-semibold text-ink">{catalog.categories.length}</span>{' '}
          {t.collectionsNav}
        </div>
      </div>

      {/* Add Category Bar */}
      <div className="rounded-[24px] border border-line bg-card p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 className="display text-[18px] font-semibold tracking-[-0.02em] text-ink">
              {d.addCollectionTitle}
            </h2>
            <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-soft">
              {d.addCollectionDesc}
            </p>
          </div>
          <div className="lg:col-span-7">
            <NewCategoryInlineForm
              categories={catalog.categories}
              onCreate={catalog.createCategory}
              onCreated={(created) => {
                showToast(`Added "${created.name}"`);
              }}
              submitLabel={d.addCollectionBtn}
              autoFocus={false}
            />
          </div>
        </div>
      </div>

      {/* Visual Collection Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {catalog.categories.map((cat) => {
          const stats = statsByCategory.get(cat.id) || {
            total: 0,
            live: 0,
            draft: 0,
            previews: [],
          };
          const isEditing = editingId === cat.id;
          const displayName = localizeCategoryName(cat.id, catalog.categoriesById, locale);

          return (
            <div
              key={cat.id}
              className="flex flex-col justify-between rounded-[24px] border border-line bg-card p-5 transition-colors hover:border-ink/35"
            >
              <div>
                {/* Top row: Preview thumbnails + Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {stats.previews.length > 0 ? (
                      <div className="flex -space-x-2 rtl:space-x-reverse">
                        {stats.previews.map((src, idx) => (
                          <div
                            key={`${cat.id}-p-${idx}`}
                            className={`h-11 w-11 overflow-hidden rounded-xl border border-card p-1 ${
                              cat.tint ? TINT_BG[cat.tint] : 'bg-canvas'
                            }`}
                          >
                            <img
                              src={src}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-canvas text-ink-soft">
                        <Tags className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!cat.builtIn && !isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={() => startRename(cat)}
                          title="Rename category"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(cat)}
                          title="Delete category"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Name or Rename Input */}
                <div className="mt-4">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editName}
                          autoFocus
                          onChange={(e) => {
                            setEditName(e.target.value);
                            if (editError) setEditError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCommitRename(cat);
                            } else if (e.key === 'Escape') {
                              cancelRename();
                            }
                          }}
                          disabled={savingRename}
                          className="h-10 flex-1 rounded-xl border border-ink bg-canvas px-3 text-[13px] text-ink focus:bg-card focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommitRename(cat)}
                          disabled={savingRename}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-card hover:bg-accent"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          disabled={savingRename}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas text-ink-soft hover:text-ink"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {editError && <p className="text-[11px] text-danger">{editError}</p>}
                    </div>
                  ) : (
                    <>
                      <h3 className="display text-[19px] font-semibold text-ink">
                        {displayName}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-soft">
                        <span dir="ltr" className="font-mono">
                          /{cat.id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          {cat.builtIn && <Lock className="h-3 w-3" />}
                          {cat.builtIn ? d.builtInCore : d.customCollection}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer Counts & Filter Links */}
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-3.5">
                <div className="font-mono text-[12px] text-ink tabular">
                  <span className="font-semibold">{stats.live}</span> {d.liveLabel}
                  {stats.draft > 0 && (
                    <span className="text-ink-faint"> · +{stats.draft} {d.draftLabel}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/products?cat=${cat.id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-canvas px-3 text-[11.5px] font-medium text-ink whitespace-nowrap transition-colors hover:border-ink hover:bg-sand"
                  >
                    <Package className="h-3 w-3" />
                    <span>{d.filterInProducts}</span>
                  </Link>
                  <Link
                    href={`/shop?c=${cat.id}`}
                    title={d.viewInShop}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-canvas text-ink-soft transition-colors hover:border-ink hover:text-ink"
                  >
                    <CornerArrow className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Category Modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget ? `Delete "${deleteTarget.name}"?` : 'Delete category?'}
        description={
          targetCount > 0
            ? `This category currently holds ${targetCount} ${
                targetCount === 1 ? 'piece' : 'pieces'
              }. Choose where to move them before deleting.`
            : 'This custom category has no assigned products and will be removed immediately.'
        }
        confirmLabel="Delete category"
        tone="danger"
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        {targetCount > 0 && (
          <div>
            <label className="block text-[12px] font-medium text-ink">
              Reassign {targetCount} {targetCount === 1 ? 'product' : 'products'} to:
            </label>
            <select
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3 text-[13px] text-ink focus:border-ink focus:bg-card focus:outline-none"
            >
              {otherCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </ConfirmDialog>

      <DashToast notice={notice} onDismiss={dismiss} />
    </div>
  );
}
