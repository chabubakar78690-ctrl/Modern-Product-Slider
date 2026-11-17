// Database layer for the Modern Product Slider backend.
// Adapter order:
//  1. Supabase (Postgres) when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
//     — the real production store. Uses plain fetch to PostgREST, no extra deps.
//  2. JSON file (data/db.json) for local `next dev`.
//  3. In-memory seed data on Vercel when no database is configured (demo mode).
//     Serverless memory does not persist between invocations — demo only.
import { SEED } from '../../dashboard/lib/store';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function seedTables() {
  return {
    users: [
      { id: 'u-admin', name: SEED.profile.name, email: SEED.profile.email, password_hash: '', role: 'admin', provider: 'email', created_at: '2026-11-10' },
      ...SEED.users.map((u, i) => ({ id: 'u-' + (i + 1), name: u.name, email: u.email, password_hash: '', role: 'customer', provider: 'email', created_at: u.joined })),
    ],
    licenses: SEED.licenses.map((l) => ({ id: l.id, key: l.key, user_email: l.domain.includes('saras') ? 'sara@fashionstore.com' : '', plan: l.plan, domain: l.domain, status: l.status, version: l.version, created_at: l.created, last_check: l.lastCheck })),
    payments: SEED.payments.map((p) => ({ id: p.id, user_email: '', plan: p.plan, amount: p.amount, method: p.method, status: p.status, created_at: p.date })),
    versions: SEED.versions.map((v) => ({ version: v.version, date: v.date, file: v.file, size: v.size, current: v.current, notes: v.notes })),
    settings: [
      { key: 'oauth', value: SEED.settings.oauth },
      { key: 'payfast', value: SEED.settings.payfast },
      { key: 'plans', value: SEED.plans },
    ],
  };
}

// ---------- Supabase adapter (PostgREST) ----------
async function sbFetch(path, method = 'GET', body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase ${method} ${path} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const supabaseAdapter = {
  mode: 'supabase',
  async all(table) { return sbFetch(table + '?select=*'); },
  async find(table, field, value) {
    const rows = await sbFetch(`${table}?select=*&${encodeURIComponent(field)}=eq.${encodeURIComponent(value)}`);
    return rows[0] || null;
  },
  async insert(table, row) {
    const rows = await sbFetch(table, 'POST', row);
    return Array.isArray(rows) ? rows[0] : rows;
  },
  async update(table, field, value, patch) {
    const rows = await sbFetch(`${table}?${encodeURIComponent(field)}=eq.${encodeURIComponent(value)}`, 'PATCH', patch);
    return Array.isArray(rows) ? rows[0] : rows;
  },
  async remove(table, field, value) {
    await sbFetch(`${table}?${encodeURIComponent(field)}=eq.${encodeURIComponent(value)}`, 'DELETE');
    return true;
  },
  async setting(key) {
    const row = await this.find('settings', 'key', key);
    return row ? row.value : null;
  },
  async saveSetting(key, value) {
    const existing = await this.find('settings', 'key', key);
    if (existing) return this.update('settings', 'key', key, { value });
    return this.insert('settings', { key, value });
  },
};

// ---------- File / memory adapter ----------
import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'db.json');
let memory = null;

function loadFileTables() {
  // Local dev only. Never throws: on Vercel the filesystem is read-only
  // outside /tmp, so any file error falls back to in-memory seed data.
  try {
    if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {}
  const tables = seedTables();
  try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(tables, null, 2)); } catch {}
  return tables;
}

// Vercel sets these at build time, but not reliably at function runtime,
// so also check the Lambda markers — and never trust the file adapter
// when a write fails.
const IS_SERVERLESS = !!(
  process.env.VERCEL || process.env.VERCEL_ENV ||
  process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
);

function localTables() {
  if (IS_SERVERLESS) {
    if (!memory) memory = seedTables();
    return memory;
  }
  try { return loadFileTables(); } catch { if (!memory) memory = seedTables(); return memory; }
}

function saveLocalTables(tables) {
  if (IS_SERVERLESS) { memory = tables; return; }
  try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(tables, null, 2)); } catch { memory = tables; }
}

const localAdapter = {
  mode: IS_SERVERLESS ? 'memory (demo)' : 'file',
  async all(table) { return clone(localTables()[table] || []); },
  async find(table, field, value) { return clone((localTables()[table] || []).find((r) => String(r[field]) === String(value)) || null); },
  async insert(table, row) {
    const tables = localTables();
    tables[table] = tables[table] || [];
    tables[table].push(clone(row));
    saveLocalTables(tables);
    return clone(row);
  },
  async update(table, field, value, patch) {
    const tables = localTables();
    const row = (tables[table] || []).find((r) => String(r[field]) === String(value));
    if (!row) return null;
    Object.assign(row, clone(patch));
    saveLocalTables(tables);
    return clone(row);
  },
  async remove(table, field, value) {
    const tables = localTables();
    tables[table] = (tables[table] || []).filter((r) => String(r[field]) !== String(value));
    saveLocalTables(tables);
    return true;
  },
  async setting(key) {
    const row = (localTables().settings || []).find((r) => r.key === key);
    return row ? clone(row.value) : null;
  },
  async saveSetting(key, value) {
    const tables = localTables();
    const row = (tables.settings || []).find((r) => r.key === key);
    if (row) row.value = clone(value);
    else (tables.settings = tables.settings || []).push({ key, value: clone(value) });
    saveLocalTables(tables);
    return value;
  },
};

export function getDb() {
  if (SUPABASE_URL && SUPABASE_KEY) return supabaseAdapter;
  return localAdapter;
}

export function isDemoMode() {
  return !(SUPABASE_URL && SUPABASE_KEY);
}

export async function getSettings() {
  const db = getDb();
  const [oauth, payfast, plans] = await Promise.all([
    db.setting('oauth'),
    db.setting('payfast'),
    db.setting('plans'),
  ]);
  return {
    oauth: oauth || SEED.settings.oauth,
    payfast: payfast || SEED.settings.payfast,
    plans: plans || SEED.plans,
  };
}
