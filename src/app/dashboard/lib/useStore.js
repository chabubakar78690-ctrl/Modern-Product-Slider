'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadStore, saveStore, SEED } from './store';

export function useDashboard() {
  const [data, setData] = useState(SEED);
  const [ready, setReady] = useState(false);

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

  const role = typeof window !== 'undefined' ? (window.localStorage.getItem('mps-role') || 'admin') : 'admin';
  return { data, ready, update, role };
}

export function useRole() {
  const [role, setRole] = useState('admin');
  useEffect(() => {
    setRole(window.localStorage.getItem('mps-role') || 'admin');
    const onChange = () => setRole(window.localStorage.getItem('mps-role') || 'admin');
    window.addEventListener('storage', onChange);
    const iv = setInterval(onChange, 500);
    return () => { window.removeEventListener('storage', onChange); clearInterval(iv); };
  }, []);
  return role;
}

export function money(n) {
  return `$${Number(n).toFixed(2)}`;
}
