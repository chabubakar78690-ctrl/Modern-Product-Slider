'use client';

import { useCallback, useEffect, useState } from 'react';
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

export function useDashboard() {
  const [data, setData] = useState(SEED);
  const [ready, setReady] = useState(false);
  const session = useSession();

  useEffect(() => {
    setData(loadStore());
    setReady(true);
    const onStore = () => setData(loadStore());
    window.addEventListener('mps-store', onStore);
    return () => window.removeEventListener('mps-store', onStore);
  }, []);

  const update = useCallback((fn) => {
    const next = fn(loadStore());
    saveStore(next);
    setData(next);
  }, []);

  const role = session.user?.role || 'customer';
  return { data, ready, update, role, session };
}

export function useRole() {
  const session = useSession();
  return session.user?.role || 'customer';
}

export function money(n) {
  return `$${Number(n).toFixed(2)}`;
}
