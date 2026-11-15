'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  AlertCircle,
  X,
  ArrowUpRight,
  MapPin,
  Mail,
  Truck,
  CheckCircle2,
  Package,
} from 'lucide-react';
import {
  Category,
  Product,
  Order,
  OrderStatus,
  STATUS_LABELS,
  STATUS_TONES,
  NEXT_STATUS,
  TINT_BG,
  validateCategoryName,
  findDuplicateCategory,
  formatPrice,
  formatDecimalPrice,
  timeAgo,
  formatDate,
  initials,
} from '@/lib/catalog';

export interface ToastNotice {
  id: number;
  message: string;
  tone: 'ok' | 'error';
}

export function useDashToast() {
  const [notice, setNotice] = useState<ToastNotice | null>(null);

  const show = useCallback((message: string, tone: 'ok' | 'error' = 'ok') => {
    setNotice({ id: Date.now() + Math.random(), message, tone });
  }, []);

  const dismiss = useCallback(() => setNotice(null), []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(t);
  }, [notice]);

  return { notice, show, dismiss };
}

export function DashToast({
  notice,
  onDismiss,
}: {
  notice: ToastNotice | null;
  onDismiss: () => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-[360px] max-w-[calc(100vw-2rem)] -translate-x-1/2">
      <AnimatePresence mode="wait">
        {notice && (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-line bg-ink px-4 py-3 text-card shadow-lift"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                notice.tone === 'error' ? 'bg-danger text-card' : 'bg-ok text-card'
              }`}
            >
              {notice.tone === 'error' ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
              {notice.message}
            </span>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-card/60 hover:bg-card/10 hover:text-card"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
  secondaryAction,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  secondaryAction?: { label: string; onClick: () => void };
  children?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !busy && onCancel()}
            className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px]"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-[420px] rounded-2xl border border-line bg-card p-6 shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="display text-[19px] font-semibold tracking-[-0.02em] text-ink">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  aria-label="Close dialog"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-canvas hover:text-ink disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {description && (
                <p className="mt-2 text-[13px] leading-[1.55] text-ink-soft">{description}</p>
              )}
              {children && <div className="mt-4">{children}</div>}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="h-10 rounded-full border border-line px-4 text-[12px] font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
                >
                  Cancel
                </button>
                {secondaryAction && (
                  <button
                    type="button"
                    onClick={secondaryAction.onClick}
                    disabled={busy}
                    className="h-10 rounded-full bg-canvas px-4 text-[12px] font-medium text-ink transition-colors hover:bg-sand disabled:opacity-50"
                  >
                    {secondaryAction.label}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={busy}
                  className={`h-10 rounded-full px-4 text-[12px] font-medium text-card transition-colors disabled:opacity-50 ${
                    tone === 'danger' ? 'bg-danger hover:bg-danger/90' : 'bg-ink hover:bg-accent'
                  }`}
                >
                  {busy ? 'Working…' : confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function NewCategoryInlineForm({
  categories,
  onCreate,
  onCreated,
  onCancel,
  submitLabel = 'Add',
  placeholder = 'e.g. Storage, Mirrors, Rugs',
  autoFocus = true,
}: {
  categories: Category[];
  onCreate: (name: string) => Promise<Category>;
  onCreated?: (cat: Category) => void;
  onCancel?: () => void;
  submitLabel?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const vErr = validateCategoryName(name);
    if (vErr) {
      setErr(vErr);
      return;
    }
    const dup = findDuplicateCategory(categories, name);
    if (dup) {
      setErr(`"${dup.name}" already exists.`);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const created = await onCreate(name);
      setName('');
      onCreated?.(created);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Could not create category.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          autoFocus={autoFocus}
          onChange={(e) => {
            setName(e.target.value);
            if (err) setErr(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            } else if (e.key === 'Escape' && onCancel) {
              e.preventDefault();
              onCancel();
            }
          }}
          placeholder={placeholder}
          disabled={busy}
          className={`h-10 flex-1 rounded-xl border bg-canvas px-3.5 text-[13px] text-ink placeholder:text-ink-faint focus:bg-card focus:outline-none ${
            err ? 'border-danger focus:border-danger' : 'border-line focus:border-ink'
          }`}
        />
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={busy}
          className="h-10 shrink-0 rounded-xl bg-ink px-4 text-[12px] font-medium text-card transition-colors hover:bg-accent disabled:opacity-50"
        >
          {busy ? 'Adding…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-10 shrink-0 rounded-xl border border-line px-3 text-[12px] font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>
      {err && <p className="text-[11px] font-medium text-danger">{err}</p>}
    </div>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const label = STATUS_LABELS[status] || STATUS_LABELS.paid;
  const tone = STATUS_TONES[status] || STATUS_TONES.paid;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function LiveOrdersFeed({
  orders,
  freshIds,
  live,
  now,
  limit = 6,
  productsById = {},
}: {
  orders: Order[];
  freshIds: Set<string>;
  live: boolean;
  now: number;
  limit?: number;
  productsById?: Record<string, Product>;
}) {
  const recent = orders.slice(0, limit);

  return (
    <div className="tile flex flex-col justify-between p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {live && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  live ? 'bg-ok' : 'bg-ink-faint'
                }`}
              />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
              Live order stream
            </span>
          </div>
          <h3 className="display mt-1 text-[20px] font-semibold tracking-[-0.02em] text-ink">
            Recent checkout activity
          </h3>
        </div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1 rounded-full bg-canvas px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-sand"
        >
          All orders
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5 divide-y divide-line">
        <AnimatePresence initial={false}>
          {recent.map((order) => {
            const isFresh = freshIds.has(order.id);
            const firstItem = order.items[0];
            const firstProd = firstItem ? productsById[firstItem.id] : undefined;
            const imgSrc = firstProd?.image;

            return (
              <motion.div
                key={order.id}
                layout="position"
                initial={isFresh ? { opacity: 0, y: -14, backgroundColor: '#F3E5D8' } : false}
                animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(243,229,216,0)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ${
                      firstProd ? TINT_BG[firstProd.tint] : 'bg-canvas'
                    }`}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={firstItem?.name || firstProd?.name || 'Order item'}
                        className="h-full w-full object-contain p-1"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-ink">
                        {initials(order.customer)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-ink">
                        {order.customer}
                      </span>
                      <span className="font-mono text-[11px] text-ink-faint">{order.number}</span>
                    </div>
                    <div className="truncate text-[12px] text-ink-soft">
                      {order.itemCount} {order.itemCount === 1 ? 'piece' : 'pieces'} · {order.city}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="hidden sm:block">
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[13px] font-semibold text-ink tabular">
                      {formatPrice(order.total)}
                    </div>
                    <div className="font-mono text-[11px] text-ink-faint">
                      {timeAgo(order.createdAt, now)}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

const TIMELINE_STEPS: { id: OrderStatus; label: string; desc: string }[] = [
  { id: 'paid', label: 'Order paid', desc: 'Payment authorized and verified' },
  { id: 'packing', label: 'In workshop packing', desc: 'Items inspected and crated in Malmö' },
  { id: 'shipped', label: 'Handed to carrier', desc: 'Dispatched with climate-neutral courier' },
  { id: 'delivered', label: 'Delivered', desc: 'Signed for at destination address' },
];

export function OrderDetailDrawer({
  order,
  productsById,
  now,
  onClose,
  onUpdateStatus,
}: {
  order: Order | null;
  productsById: Record<string, Product>;
  now: number;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}) {
  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [order, onClose]);

  const currentStepIdx = order
    ? TIMELINE_STEPS.findIndex((s) => s.id === order.status)
    : 0;
  const nextStatus = order ? NEXT_STATUS[order.status] : undefined;

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-card shadow-lift"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[15px] font-semibold text-ink">
                    {order.number}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-0.5 text-[12px] text-ink-soft">
                  Placed {formatDate(order.createdAt)} · {timeAgo(order.createdAt, now)}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-ink-soft transition-colors hover:bg-sand hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Customer card */}
              <div className="rounded-2xl bg-canvas p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                  Customer
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-[13px] font-semibold text-ink">
                    {initials(order.customer)}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-ink">{order.customer}</div>
                    <div className="flex items-center gap-1.5 truncate text-[12px] text-ink-soft">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{order.email}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[12px] text-ink-soft">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  <span>
                    Shipping to {order.address ? `${order.address}, ` : ''}
                    {order.city}
                  </span>
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    Items ({order.itemCount})
                  </span>
                  <span className="font-mono text-[11px] text-ink-faint">Price</span>
                </div>
                <div className="mt-2.5 divide-y divide-line rounded-2xl border border-line px-4">
                  {order.items.map((item, idx) => {
                    const p = productsById[item.id];
                    const name = item.name || p?.name || item.id;
                    const img = p?.image;
                    return (
                      <div key={idx} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`h-11 w-11 shrink-0 overflow-hidden rounded-xl ${
                              p ? TINT_BG[p.tint] : 'bg-canvas'
                            }`}
                          >
                            {img ? (
                              <img
                                src={img}
                                alt={name}
                                className="h-full w-full object-contain p-1"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-ink-faint">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-medium text-ink">{name}</div>
                            <div className="text-[11px] text-ink-soft">
                              {item.finish ? `${item.finish} · ` : ''}Qty {item.qty} ×{' '}
                              {formatPrice(item.price)}
                            </div>
                          </div>
                        </div>
                        <div className="font-mono text-[13px] font-semibold text-ink tabular">
                          {formatPrice(item.price * item.qty)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="mt-3 space-y-1.5 rounded-2xl bg-canvas p-4 text-[12px]">
                  <div className="flex justify-between border-t border-line pt-2 text-[13px] font-semibold text-ink">
                    <span>Total paid</span>
                    <span className="font-mono tabular">{formatDecimalPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Fulfillment timeline */}
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                  Fulfillment status
                </div>
                <div className="mt-3 space-y-3">
                  {TIMELINE_STEPS.map((step, i) => {
                    const done = i <= currentStepIdx;
                    const active = i === currentStepIdx;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => onUpdateStatus(order.id, step.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                          active
                            ? 'border-ink bg-canvas'
                            : done
                            ? 'border-line bg-card hover:bg-canvas'
                            : 'border-line/60 bg-card/50 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                            done
                              ? 'bg-ink text-card'
                              : 'border border-line bg-canvas text-ink-faint'
                          }`}
                        >
                          {done ? <Check className="h-3 w-3" /> : i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-ink">{step.label}</span>
                            {active && (
                              <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] text-card">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-ink-soft">{step.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between border-t border-line bg-card px-6 py-4">
              {nextStatus ? (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(order.id, nextStatus)}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-card transition-colors hover:bg-accent"
                >
                  <Truck className="h-4 w-4" />
                  Advance to {STATUS_LABELS[nextStatus]}
                </button>
              ) : (
                <div className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ok-soft py-2.5 text-[12px] font-medium text-ok">
                  <CheckCircle2 className="h-4 w-4" />
                  Order fulfilled & delivered
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
