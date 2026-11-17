// Passkey (WebAuthn) helpers — the challenge is kept in a short-lived
// HMAC-signed httpOnly cookie (5 minutes), so it works across serverless
// instances without any extra storage. Credentials live in the `passkeys`
// table (Supabase in production, data/db.json locally).
import crypto from 'crypto';
import { requireSecret } from './auth';

const COOKIE = 'mps_pk_challenge';

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export function signChallenge(payload) {
  const secret = requireSecret();
  const p = b64url({ ...payload, exp: Date.now() + 5 * 60 * 1000 });
  const sig = crypto.createHmac('sha256', secret).update(p).digest('base64url');
  return `${COOKIE}=${p}.${sig}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
}

export function readChallenge(req) {
  const raw = req.cookies?.get(COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (!raw || !secret) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expect = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

export function clearChallengeCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// rpID / origin come from the request so the same code works locally
// (localhost) and on Vercel (modern-product-slider.vercel.app).
export function rpFromReq(req) {
  const host = (req.headers.get('x-forwarded-host') || new URL(req.url).host).split(':')[0];
  const proto = req.headers.get('x-forwarded-proto') || (host === 'localhost' ? 'http' : 'https');
  return { rpID: host, origin: `${proto}://${host}` };
}
