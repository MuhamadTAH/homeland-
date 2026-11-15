import { Order, OrderStatus, Product, RAW_PRODUCTS } from './catalog';

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES =
  'Astrid.Mateo.Noor.Elias.Freya.Kenji.Amara.Lukas.Ines.Theo.Sana.Oskar.Leila.Jonas.Maya.Rafael.Ida.Tariq.Clara.Henrik.Yara.Felix.Priya.Nils.Zoe.Arjun.Selma.Hugo.Aiko.Emil'.split(
    '.'
  );

const LAST_NAMES = [
  'Lund',
  'Okafor',
  'Haddad',
  'Berg',
  'Moreau',
  'Sato',
  'Novak',
  'Rahman',
  'Costa',
  'Fischer',
  'Lindqvist',
  'Mensah',
  'Duarte',
  'Holm',
  'Petrov',
  'Ahmed',
  'Nakamura',
  'Keller',
  'Silva',
  'Dahl',
];

export const CITIES = [
  'Copenhagen',
  'Oslo',
  'Stockholm',
  'Berlin',
  'Amsterdam',
  'London',
  'New York',
  'Toronto',
  'Melbourne',
  'Zürich',
  'Helsinki',
  'Lisbon',
];

const CITY_WEIGHTS = [16, 11, 12, 10, 8, 9, 7, 5, 4, 4, 3, 3];
const PRODUCT_WEIGHT_LIST = [7, 9, 6, 5, 3, 10, 8, 9, 11];
const PRODUCT_WEIGHTS: Record<string, number> = Object.fromEntries(
  RAW_PRODUCTS.map((p, i) => [p.id, PRODUCT_WEIGHT_LIST[i]])
);

function pickWeighted<T>(rng: () => number, items: T[], weights?: number[]): T {
  if (!weights) return items[Math.floor(rng() * items.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function generateSimulatedOrder(
  rng: () => number,
  createdAt: number,
  overrides: Partial<Order> = {},
  pool: Pick<Product, 'id' | 'name' | 'price'>[] = RAW_PRODUCTS
): Order {
  const count = rng() < 0.62 ? 1 : rng() < 0.75 ? 2 : 3;
  const weights = pool.map((p) => PRODUCT_WEIGHTS[p.id] ?? 7);
  const items: { id: string; name: string; price: number; qty: number }[] = [];

  for (let i = 0; i < count; i++) {
    const p = pickWeighted(rng, pool, weights);
    const existing = items.find((item) => item.id === p.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        id: p.id,
        name: p.name,
        price: p.price,
        qty: p.price < 100 && rng() < 0.3 ? 2 : 1,
      });
    }
  }

  const first = pickWeighted(rng, FIRST_NAMES);
  const last = pickWeighted(rng, LAST_NAMES);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    id: `sim_${createdAt.toString(36)}_${Math.floor(rng() * 1e6).toString(36)}`,
    number: `KV-${Math.floor(10000 + rng() * 89999)}`,
    customer: `${first} ${last}`,
    email: `${first}.${last}@example.com`.toLowerCase(),
    city: pickWeighted(rng, CITIES, CITY_WEIGHTS),
    items,
    itemCount: items.reduce((sum, item) => sum + item.qty, 0),
    total,
    status: 'paid',
    createdAt,
    ...overrides,
  };
}

const DAY_MS = 86400000;

function statusByAge(ageMs: number, rng: () => number): OrderStatus {
  if (ageMs > 6 * DAY_MS) return 'delivered';
  if (ageMs > 2 * DAY_MS) return rng() < 0.7 ? 'delivered' : 'shipped';
  if (ageMs > 0.6 * DAY_MS) return rng() < 0.6 ? 'shipped' : 'packing';
  return rng() < 0.5 ? 'packing' : 'paid';
}

export function generateHistoricalOrders(now = Date.now(), days = 180): Order[] {
  const rng = mulberry32(20260409);
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const orders: Order[] = [];

  for (let d = days - 1; d >= 0; d--) {
    const dayStart = startOfToday - d * DAY_MS;
    const dow = new Date(dayStart).getDay();
    const weekendBoost = dow === 0 || dow === 6 ? 1.35 : 1;
    const trend = 1 + ((days - d) / days) * 0.55;
    const count = Math.round((7 + rng() * 6) * trend * weekendBoost);

    for (let j = 0; j < count; j++) {
      const ts =
        dayStart +
        (7 + Math.floor(((rng() + rng() + rng()) / 3) * 17)) * 3600000 +
        Math.floor(rng() * 3600000);
      if (ts <= now) {
        orders.push(
          generateSimulatedOrder(rng, ts, {
            status: statusByAge(now - ts, rng),
          })
        );
      }
    }
  }

  return orders.sort((a, b) => b.createdAt - a.createdAt);
}
