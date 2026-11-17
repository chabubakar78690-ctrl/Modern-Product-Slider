// Auth helpers: scrypt password hashing + HMAC-signed session cookies.
// No extra dependencies — Node's built-in crypto only.
import crypto from 'crypto';
import { NextResponse } from 'next/server';

const SECRET = process.env.SESSION_SECRET || 'dev-only-secret-change-me-in-production';
const COOKIE = 'mps_session';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function checkPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export function createSession(user) {
  const payload = b64url({ uid: user.id, email: user.email, role: user.role || 'customer', name: user.name, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 });
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function readSession(req) {
  const raw = req.cookies?.get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expect = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

export function sessionCookie(value) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function json(data, status = 200, headers = {}) {
  return NextResponse.json(data, { status, headers });
}

export function requireUser(req) {
  const s = readSession(req);
  if (!s) return { error: json({ error: 'Not signed in' }, 401) };
  return { session: s };
}

export function requireAdmin(req) {
  const s = readSession(req);
  if (!s) return { error: json({ error: 'Not signed in' }, 401) };
  if (s.role !== 'admin') return { error: json({ error: 'Admin only' }, 403) };
  return { session: s };
}
