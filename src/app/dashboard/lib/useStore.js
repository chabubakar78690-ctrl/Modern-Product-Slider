'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { loadStore, saveStore, SEED } from './store';

// The signed-in session, fetched once from the server and cached.
// Role comes from the server, never from localStorage — the old code forced
// every visitor to 'admin', which made the whole dashboard (including the
// admin pages) visible to anyone, signed in or not.
let sessionCache = null;

export function useSession() {
  const [s, setS] = useState(sessionCache || { user: null, demo: false, loading: true });
  useEffect(() => {
    if (sessionCache) { setS(sessionCache); return; }
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { sessionCache = { user: d.user || null, demo: !!d.demo, loading: false }; setS(sessionCache); })
      .catch(() => { sessionCache = { user: null, demo: false, loading: false }; setS(sessionCache); });
  }, []);
  return s;
}

// Map server rows to the shape the dashboard pages render.
function mapLicense(l) {
  return { id: l.id, key: l.key, user_email: l.user_email, plan: l.plan, domain: l.domain, status: l.status, sites: 1, version: l.version, created: l.created_at, lastCheck: l.last_check || '—' };
}
function mapPayment(p) {
  return { id: String(p.id), date: p.created_at, user: p.user_email, plan: p.plan, amount: Number(p.amount || 0), method: p.method, status: p.status };
}
function planIdFor(name) {
  if (name === 'Unlimited Sites') return 'unlimited';
  if (name === 'Single Site') return 'single';
  return 'free';
}

export function useDashboard() {
  const [data, setData] = useState(SEED);
  const [ready, setReady] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const session = useSession();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Local demo store (used when there is no signed-in user, i.e. demo mode).
  useEffect(() => {
    setData(loadStore());
    setReady(true);
    const onStore = () => setData(loadStore());
    window.addEventListener('mps-store', onStore);
    return () => window.removeEventListener('mps-store', onStore);
  }, []);

  // Real data: when signed in, replace the demo seed with the server's
  // data. Any fetch that fails leaves the demo data in place.
  const refreshServer = useCallback(async () => {
    const s = sessionRef.current;
    if (!s.user) return;
    setServerLoading(true);
    try {
      const [licRes, pluginRes, freeRes, payRes] = await Promise.all([
        fetch('/api/licenses').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/plugin').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/free-plugin').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/payments').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      let next = null;
      const licenses = (licRes?.licenses || []).map(mapLicense);
      const payments = (payRes?.payments || []).map(mapPayment);
      const versions = pluginRes ? [{ version: pluginRes.latest_version, date: pluginRes.date, file: pluginRes.file, size: pluginRes.size, current: true, notes: pluginRes.notes }] : null;
      const freeVersion = freeRes ? { version: freeRes.latest_version, file: freeRes.file, size: freeRes.size, date: freeRes.date, notes: freeRes.notes } : null;
      if (s.user.role === 'admin') {
        const [usersRes, ovRes, setRes] = await Promise.all([
          fetch('/api/admin/users').then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch('/api/admin/overview').then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch('/api/admin/settings').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);
        const users = (usersRes?.users || []).map((u) => {
          const mine = licenses.filter((l) => l.user_email === u.email);
          const plan = mine.length ? mine[mine.length - 1].plan : 'Free';
          return { name: u.name, email: u.email, plan, status: u.status || 'Active', joined: u.created_at, licenses: mine.length };
        });
        // Signed in = server is the truth. Empty lists are real (a new
        // account has no licenses/users) — never fall back to demo seed.
        next = (prev) => ({
          ...prev,
          licenses,
          users,
          payments,
          versions: ovRes?.versions?.length ? ovRes.versions : (versions || prev.versions),
          freeVersion: freeVersion || prev.freeVersion,
          settings: setRes ? { oauth: setRes.oauth || prev.settings.oauth, payfast: setRes.payfast || prev.settings.payfast } : prev.settings,
          profile: { ...prev.profile, name: s.user.name, email: s.user.email },
        });
      } else {
        const active = licenses.find((l) => l.status === 'Active');
        next = (prev) => ({
          ...prev,
          licenses,
          payments,
          versions: versions || prev.versions,
          freeVersion: freeVersion || prev.freeVersion,
          customer: {
            ...prev.customer,
            name: s.user.name, email: s.user.email,
            plan: active ? planIdFor(active.plan) : 'free',
            planName: active ? active.plan : 'Free',
            status: active ? 'Active' : 'Free',
            renews: active ? prev.customer.renews : '—',
          },
        });
      }
      if (next) setData((prev) => next(prev));
    } finally {
      setServerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session.loading && session.user) refreshServer();
  }, [session.loading, session.user, refreshServer]);

  // Local edits (demo mode, or optimistic updates after a server call).
  // In real mode the server is the source of truth; local writes only
  // happen when nobody is signed in.
  const update = useCallback((fn) => {
    setData((prev) => {
      const next = fn(prev);
      if (!sessionRef.current.user) saveStore(next);
      return next;
    });
  }, []);

  const role = session.user?.role || 'customer';
  return { data, ready, update, role, session, serverLoading, refreshServer };
}

export function useRole() {
  const session = useSession();
  return session.user?.role || 'customer';
}

export function money(n) {
  return `$${Number(n).toFixed(2)}`;
}
