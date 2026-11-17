// Auth API — email/password + Google / Facebook OAuth.
// POST /api/auth/signup   {name, email, password}  -> creates account, sets session
// POST /api/auth/login    {email, password}        -> sets session
// POST /api/auth/logout                          -> clears session
// GET  /api/auth/me                              -> current session user
// GET  /api/auth/google | /api/auth/facebook     -> start OAuth
// GET  /api/auth/google/callback | /api/auth/facebook/callback -> finish OAuth
// OAuth needs the keys from Profile > Admin settings > Social login (or env vars
// GOOGLE_CLIENT_ID/SECRET, FACEBOOK_APP_ID/SECRET). Without them the
// provider routes return 503 with a clear message.
import { NextResponse } from 'next/server';
import { getDb, getSettings, isDemoMode } from '../../lib/db';
import { hashPassword, checkPassword, createSession, readSession, requireUser, sessionCookie, clearSessionCookie, json } from '../../lib/auth';

export const dynamic = 'force-dynamic';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://modern-product-slider.vercel.app';

// Brute-force guard: max 10 login/signup attempts per IP per 10 minutes.
// (Per-instance memory — on serverless it resets when an instance recycles,
// but it still stops casual password guessing.)
const attempts = new Map();
function rateLimited(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 10) return true;
  list.push(now);
  attempts.set(ip, list);
  return false;
}

async function findOrCreateOAuthUser(db, { email, name, provider }) {
  let user = await db.find('users', 'email', email.toLowerCase());
  if (user) return user;
  // Signups always create a customer. There is exactly one admin account —
  // the one already set — and it is never created through signup.
  user = await db.insert('users', {
    id: 'u-' + Date.now().toString(36),
    name, email: email.toLowerCase(), password_hash: '',
    role: 'customer',
    provider, created_at: new Date().toISOString().slice(0, 10),
  });
  return user;
}

function oauthConfig(settings, provider) {
  const cfg = settings.oauth?.[provider] || {};
  const envId = provider === 'google' ? process.env.GOOGLE_CLIENT_ID : process.env.FACEBOOK_APP_ID;
  const envSecret = provider === 'google' ? process.env.GOOGLE_CLIENT_SECRET : process.env.FACEBOOK_APP_SECRET;
  return {
    clientId: cfg.clientId || envId || '',
    clientSecret: cfg.clientSecret || envSecret || '',
    redirect: cfg.redirect || `${SITE}/api/auth/${provider}/callback`,
    enabled: cfg.enabled,
  };
}

export async function POST(req, { params }) {
  const action = params.action?.[0];
  const db = getDb();

  try {
  if (action === 'signup' || action === 'login') {
    if (rateLimited(req)) return json({ error: 'Too many attempts. Please wait 10 minutes and try again.' }, 429);
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email.includes('@') || password.length < 6) {
      return json({ error: 'Enter a valid email and a password of at least 6 characters.' }, 400);
    }
    if (action === 'signup') {
      const name = String(body.name || email.split('@')[0]).trim();
      let user = await db.find('users', 'email', email);
      if (user && user.password_hash) return json({ error: 'An account with this email already exists. Log in instead.' }, 409);
      if (user) {
        // Claim a seeded/demo account by setting its password.
        user = await db.update('users', 'email', email, { password_hash: hashPassword(password), name });
      } else {
        user = await db.insert('users', {
          id: 'u-' + Date.now().toString(36), name, email, password_hash: hashPassword(password),
          role: 'customer', provider: 'email',
          created_at: new Date().toISOString().slice(0, 10),
        });
      }
      const res = json({ ok: true, demo: isDemoMode(), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      res.headers.set('Set-Cookie', sessionCookie(createSession(user)));
      return res;
    }
    const user = await db.find('users', 'email', email);
    if (!user || !user.password_hash || !checkPassword(password, user.password_hash)) {
      return json({ error: 'Wrong email or password. If this is a demo account, sign up with the same email first to set a password.' }, 401);
    }
    const res = json({ ok: true, demo: isDemoMode(), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    res.headers.set('Set-Cookie', sessionCookie(createSession(user)));
    return res;
  }

  if (action === 'logout') {
    const res = json({ ok: true });
    res.headers.set('Set-Cookie', clearSessionCookie());
    return res;
  }

  // PUT /api/auth/profile {name, email} — a signed-in user updates their
  // own name/email. The session cookie is refreshed so the new name shows
  // everywhere immediately.
  if (action === 'profile') {
    const { session, error } = requireUser(req);
    if (error) return error;
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    if (!name || !email.includes('@')) return json({ error: 'Enter a valid name and email.' }, 400);
    const user = await db.find('users', 'email', session.email);
    if (!user) return json({ error: 'Account not found.' }, 404);
    if (email !== session.email) {
      const taken = await db.find('users', 'email', email);
      if (taken) return json({ error: 'Another account already uses this email.' }, 409);
    }
    const updated = await db.update('users', 'email', session.email, { name, email });
    const res = json({ ok: true, user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } });
    res.headers.set('Set-Cookie', sessionCookie(createSession(updated)));
    return res;
  }

  return json({ error: 'Unknown auth action' }, 404);
  } catch (e) {
    console.error('Auth error:', e);
    return json({ error: e.message || 'Auth failed' }, 500);
  }
}

export async function GET(req, { params }) {
  const action = params.action?.[0];
  const sub = params.action?.[1];
  const db = getDb();

  if (action === 'me') {
    const s = readSession(req);
    if (!s) return json({ user: null, demo: isDemoMode() }, 401);
    return json({ user: { id: s.uid, name: s.name, email: s.email, role: s.role }, demo: isDemoMode() });
  }

  if ((action === 'google' || action === 'facebook') && !sub) {
    const settings = await getSettings();
    const cfg = oauthConfig(settings, action);
    if (!cfg.clientId) {
      return json({ error: `${action} sign-in is not configured yet. Add the Client ID and Secret in Profile > Admin settings > Social login (or set the env vars).` }, 503);
    }
    const url = action === 'google'
      ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(cfg.clientId)}&redirect_uri=${encodeURIComponent(cfg.redirect)}&response_type=code&scope=${encodeURIComponent('openid email profile')}`
      : `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(cfg.clientId)}&redirect_uri=${encodeURIComponent(cfg.redirect)}&scope=email,public_profile`;
    return NextResponse.redirect(url);
  }

  if ((action === 'google' || action === 'facebook') && sub === 'callback') {
    const settings = await getSettings();
    const cfg = oauthConfig(settings, action);
    const code = new URL(req.url).searchParams.get('code');
    if (!code) return NextResponse.redirect(`${SITE}/?auth=error`);
    try {
      let profile;
      if (action === 'google') {
        const tok = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: cfg.clientId, client_secret: cfg.clientSecret, redirect_uri: cfg.redirect, grant_type: 'authorization_code' }) })).json();
        if (!tok.access_token) throw new Error('Google token exchange failed');
        profile = await (await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tok.access_token}` } })).json();
      } else {
        const tok = await (await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${cfg.clientId}&redirect_uri=${encodeURIComponent(cfg.redirect)}&client_secret=${cfg.clientSecret}&code=${code}`)).json();
        if (!tok.access_token) throw new Error('Facebook token exchange failed');
        profile = await (await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tok.access_token}`)).json();
      }
      if (!profile.email) throw new Error('No email returned by provider');
      const user = await findOrCreateOAuthUser(db, { email: profile.email, name: profile.name, provider: action });
      // Sign-in opens in a new tab: land on /auth/done, which closes this
      // tab and sends the original tab to the dashboard.
      const res = NextResponse.redirect(`${SITE}/auth/done`);
      res.headers.set('Set-Cookie', sessionCookie(createSession(user)));
      return res;
    } catch (e) {
      return NextResponse.redirect(`${SITE}/auth/done?error=${encodeURIComponent(e.message)}`);
    }
  }

  return json({ error: 'Unknown auth action' }, 404);
}
