'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Tags,
  Edit3,
  Trash2,
  Check,
  X,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard-shell';
import {
  useDashToast,
  DashToast,
  ConfirmDialog,
  NewCategoryInlineForm,
} from '@/components/dashboard-ui';
import {
  Category,
  validateCategoryName,
  findDuplicateCategory,
} from '@/lib/catalog';

export default function DashboardCategoriesPage() {
  const { catalog } = useDashboard();
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

  const countsByCategory = useMemo(() => {
    const map = new Map<string, { total: number; live: number; draft: number }>();
    for (const c of catalog.categories) {
      map.set(c.id, { total: 0, live: 0, draft: 0 });
    }
    for (const p of catalog.allProducts) {
      const entry = map.get(p.category) || { total: 0, live: 0, draft: 0 };
      entry.total += 1;
      if (p.status === 'draft') entry.draft += 1;
      else entry.live += 1;
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
      showToast(`Renamed category to "${editName.trim()}"`);
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
      const count = countsByCategory.get(deleteTarget.id)?.total || 0;
      await catalog.deleteCategory(
        deleteTarget.id,
        count > 0 ? reassignTo : null
      );
      showToast(`Deleted "${deleteTarget.name}"`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete category', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const targetCount = deleteTarget
    ? countsByCategory.get(deleteTarget.id)?.total || 0
    : 0;
  const otherCategories = useMemo(
    () =>
      deleteTarget
        ? catalog.categories.filter((c) => c.id !== deleteTarget.id)
        : [],
    [catalog.categories, deleteTarget]
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="tile flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            Taxonomy · Storefront navigation
          </div>
          <h1 className="display mt-1 text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.03em] text-ink">
            Categories
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-[12px] text-ink-soft">
          <span className="rounded-full bg-canvas px-3.5 py-1.5 tabular">
            <span className="font-semibold text-ink">{catalog.categories.length}</span> active
            collections
          </span>
        </div>
      </div>

      {/* Add Category Card */}
      <div className="tile p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 className="display text-[18px] font-semibold tracking-[-0.02em] text-ink">
              Add a collection
            </h2>
            <p className="mt-1 text-[12px] leading-[1.5] text-ink-soft">
              New categories appear immediately in the Shop filter bar and product editor.
            </p>
          </div>
          <div className="lg:col-span-7">
            <NewCategoryInlineForm
              categories={catalog.categories}
              onCreate={catalog.createCategory}
              onCreated={(created) => {
                showToast(`Added "${created.name}" collection`);
              }}
              submitLabel="Add category"
              autoFocus={false}
            />
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="tile p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                <th className="pb-3 pl-2">Collection</th>
                <th className="pb-3">Slug</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Pieces</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-[13px]">
              {catalog.categories.map((cat) => {
                const counts = countsByCategory.get(cat.id) || {
                  total: 0,
                  live: 0,
                  draft: 0,
                };
                const isEditing = editingId === cat.id;

                return (
                  <tr
                    key={cat.id}
                    className="group transition-colors hover:bg-canvas/70"
                  >
                    <td className="py-4 pl-2">
                      {isEditing ? (
                        <div className="max-w-xs space-y-1">
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
                              className="h-9 flex-1 rounded-xl border border-ink bg-card px-3 text-[13px] text-ink focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleCommitRename(cat)}
                              disabled={savingRename}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-card hover:bg-accent"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelRename}
                              disabled={savingRename}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-canvas text-ink-soft hover:text-ink"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          {editError && (
                            <p className="text-[11px] text-danger">{editError}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-canvas text-ink">
                            <Tags className="h-4 w-4" />
                          </span>
                          <span className="font-medium text-ink">{cat.name}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 font-mono text-[12px] text-ink-soft">
                      /{cat.id}
                    </td>

                    <td className="py-4">
                      {cat.builtIn ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-0.5 text-[11px] font-medium text-ink-soft">
                          <Lock className="h-3 w-3" />
                          Core
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-medium text-ink">
                          Custom
                        </span>
                      )}
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-2 font-mono text-[12px] tabular">
                        <span className="font-semibold text-ink">
                          {counts.live} live
                        </span>
                        {counts.draft > 0 && (
                          <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[10px] text-warn">
                            +{counts.draft} draft
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/shop?c=${cat.id}`}
                          title="View in storefront shop"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                        {!cat.builtIn && (
                          <>
                            <button
                              type="button"
                              onClick={() => startRename(cat)}
                              title="Rename category"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(cat)}
                              title="Delete category"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
