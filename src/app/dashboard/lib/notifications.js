// Real notifications, built from the dashboard's own data — never from a
// demo seed. Customers only ever see their own licenses, payments and
// updates; the admin sees new customers, payments and licenses.
// Read/dismissed state lives in localStorage, per signed-in email.
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function relTime(iso) {
  if (!iso || iso === '—') return '';
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  if (isNaN(d)) return iso;
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return iso.slice(0, 10);
}

function timeVal(iso) {
  if (!iso || iso === '—') return 0;
  const t = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso).getTime();
  return isNaN(t) ? 0 : t;
}

export function buildNotifications(data, role, email) {
  const isAdmin = role === 'admin';
  const items = [];
  const myPayments = isAdmin
    ? data.payments
    : data.payments.filter((p) => p.user === email || p.user === data.customer.email);

  (data.licenses || []).forEach((l) => {
    items.push({
      id: `lic-${l.id}`,
      text: `License ${l.key} — ${l.status}${l.domain ? ` on ${l.domain}` : ' (no site connected yet)'}.`,
      time: l.created,
      href: '/dashboard/licenses',
    });
  });
  myPayments.forEach((p) => {
    items.push({
      id: `pay-${p.id}`,
      text: `Payment ${p.id} — ${p.plan} · ${money(p.amount)} · ${p.status}.`,
      time: p.date,
      href: '/dashboard/billing',
    });
  });
  const current = (data.versions || []).find((v) => v.current) || data.versions?.[0];
  if (current) {
    items.push({
      id: `ver-${current.version}`,
      text: `Plugin v${current.version} is available — update it from WordPress → Dashboard → Updates.`,
      time: current.date,
      href: '/dashboard/downloads',
    });
  }
  if (isAdmin) {
    [...(data.users || [])]
      .sort((a, b) => timeVal(b.joined) - timeVal(a.joined))
      .slice(0, 5)
      .forEach((u) => {
        items.push({
          id: `user-${u.email}`,
          text: `New customer — ${u.name} (${u.email}) joined.`,
          time: u.joined,
          href: '/dashboard/admin/users',
        });
      });
  }
  return items
    .sort((a, b) => timeVal(b.time) - timeVal(a.time))
    .slice(0, 12)
    .map((n) => ({ ...n, when: relTime(n.time) }));
}

function loadState(email) {
  if (typeof window === 'undefined' || !email) return { read: [], dismissed: [] };
  try {
    return JSON.parse(window.localStorage.getItem(`mps-notif-${email}`) || '{"read":[],"dismissed":[]}');
  } catch { return { read: [], dismissed: [] }; }
}

export function useNotifications(data, role, email) {
  const [state, setState] = useState({ read: [], dismissed: [] });
  useEffect(() => { setState(loadState(email)); }, [email]);

  const save = useCallback((next) => {
    setState(next);
    if (email) {
      try { window.localStorage.setItem(`mps-notif-${email}`, JSON.stringify(next)); } catch {}
    }
  }, [email]);

  const all = useMemo(() => buildNotifications(data, role, email), [data, role, email]);
  const items = all
    .filter((n) => !state.dismissed.includes(n.id))
    .map((n) => ({ ...n, unread: !state.read.includes(n.id) }));
  const unread = items.filter((n) => n.unread).length;

  const markRead = useCallback((id) => {
    setState((prev) => {
      const next = { ...prev, read: [...new Set([...prev.read, id])] };
      if (email) { try { window.localStorage.setItem(`mps-notif-${email}`, JSON.stringify(next)); } catch {} }
      return next;
    });
  }, [email]);
  const markAllRead = useCallback(() => {
    save({ ...state, read: [...new Set([...state.read, ...all.map((n) => n.id)])] });
  }, [save, state, all]);
  const dismiss = useCallback((id) => {
    setState((prev) => {
      const next = { ...prev, dismissed: [...new Set([...prev.dismissed, id])] };
      if (email) { try { window.localStorage.setItem(`mps-notif-${email}`, JSON.stringify(next)); } catch {} }
      return next;
    });
  }, [email]);

  return { items, unread, markRead, markAllRead, dismiss };
}
