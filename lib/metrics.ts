import { BUILTIN_CATEGORIES, Order, Product } from './catalog';

const DAY_MS = 86400000;
const startOfDay = (ts: number) => new Date(ts).setHours(0, 0, 0, 0);

export function filterOrdersInRange(
  orders: Order[],
  days: number,
  now: number,
  offsetWindows = 0
): Order[] {
  const end = startOfDay(now) + DAY_MS - offsetWindows * days * DAY_MS;
  const start = end - days * DAY_MS;
  return orders.filter((o) => o.createdAt >= start && o.createdAt < end && o.createdAt <= now);
}

export interface DailyPoint {
  date: number;
  revenue: number;
  orders: number;
  customers: number;
}

export function buildDailySeries(orders: Order[], days: number, now: number): DailyPoint[] {
  const start = startOfDay(now) - (days - 1) * DAY_MS;
  const buckets = Array.from({ length: days }, (_, idx) => ({
    date: start + idx * DAY_MS,
    revenue: 0,
    orders: 0,
    customers: new Set<string>(),
  }));

  for (const order of orders) {
    const idx = Math.floor((order.createdAt - start) / DAY_MS);
    if (idx >= 0 && idx < days) {
      buckets[idx].revenue += order.total;
      buckets[idx].orders += 1;
      buckets[idx].customers.add(order.email);
    }
  }

  return buckets.map((b) => ({
    date: b.date,
    revenue: b.revenue,
    orders: b.orders,
    customers: b.customers.size,
  }));
}

function summarize(orders: Order[]) {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const customers = new Set(orders.map((o) => o.email)).size;
  return {
    revenue,
    orders: orders.length,
    aov: orders.length ? revenue / orders.length : 0,
    customers,
  };
}

const pctDelta = (curr: number, prev: number) =>
  prev ? ((curr - prev) / prev) * 100 : curr ? 100 : 0;

export function computeKpis(orders: Order[], days: number, now: number) {
  const curr = summarize(filterOrdersInRange(orders, days, now, 0));
  const prev = summarize(filterOrdersInRange(orders, days, now, 1));
  return {
    revenue: { value: curr.revenue, delta: pctDelta(curr.revenue, prev.revenue) },
    orders: { value: curr.orders, delta: pctDelta(curr.orders, prev.orders) },
    aov: { value: curr.aov, delta: pctDelta(curr.aov, prev.aov) },
    customers: { value: curr.customers, delta: pctDelta(curr.customers, prev.customers) },
  };
}

export interface TopProductItem {
  product: Product;
  units: number;
  revenue: number;
}

export function computeTopProducts(
  orders: Order[],
  byId: Record<string, Product>,
  limit = 5
): TopProductItem[] {
  const units: Record<string, number> = {};
  const revenue: Record<string, number> = {};

  for (const o of orders) {
    for (const item of o.items) {
      units[item.id] = (units[item.id] || 0) + item.qty;
      revenue[item.id] = (revenue[item.id] || 0) + item.qty * item.price;
    }
  }

  return Object.keys(revenue)
    .filter((id) => byId[id])
    .map((id) => ({
      product: byId[id],
      units: units[id],
      revenue: revenue[id],
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export interface CategoryShareItem {
  id: string;
  name: string;
  value: number;
  share: number;
}

export function computeCategoryShare(
  orders: Order[],
  byId: Record<string, Product>
): CategoryShareItem[] {
  const totals: Record<string, number> = Object.fromEntries([
    ...BUILTIN_CATEGORIES.map((c) => [c.id, 0]),
    ['other', 0],
  ]);

  for (const o of orders) {
    for (const item of o.items) {
      const cat = byId[item.id]?.category;
      if (cat) {
        const key = cat in totals ? cat : 'other';
        totals[key] += item.qty * item.price;
      }
    }
  }

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  const list = totals.other
    ? [...BUILTIN_CATEGORIES.map((c) => ({ id: c.id, name: c.name })), { id: 'other', name: 'Other' }]
    : BUILTIN_CATEGORIES.map((c) => ({ id: c.id, name: c.name }));

  return list.map((c) => ({
    ...c,
    value: totals[c.id] || 0,
    share: (totals[c.id] || 0) / grandTotal,
  }));
}

export interface TodayStats {
  orders: number;
  revenue: number;
  hours: number[];
}

export function computeTodayStats(orders: Order[], now: number): TodayStats {
  const todayOrders = filterOrdersInRange(orders, 1, now);
  const revenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const hours = Array.from({ length: 24 }, () => 0);
  for (const o of todayOrders) {
    hours[new Date(o.createdAt).getHours()] += 1;
  }
  return {
    orders: todayOrders.length,
    revenue,
    hours,
  };
}

export interface StockStatusItem {
  product: Product;
  onHand: number;
  ratio: number;
  low: boolean;
}

export function computeWeeklyStock(
  orders: Order[],
  now: number,
  products: Product[]
): StockStatusItem[] {
  const cutoff = now - 7 * DAY_MS;
  const sold: Record<string, number> = {};

  for (const o of orders) {
    if (o.createdAt >= cutoff && o.createdAt <= now) {
      for (const item of o.items) {
        sold[item.id] = (sold[item.id] || 0) + item.qty;
      }
    }
  }

  return products
    .map((p) => {
      const onHand = Math.max(0, p.stock - (sold[p.id] || 0));
      const ratio = p.stock ? onHand / p.stock : 0;
      return {
        product: p,
        onHand,
        ratio,
        low: ratio < 0.25,
      };
    })
    .sort((a, b) => a.ratio - b.ratio);
}
