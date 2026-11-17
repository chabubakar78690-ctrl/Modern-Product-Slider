'use client';

import { useEffect, useState } from 'react';
import { useDashboard, money } from '../../lib/useStore';
import Loader, { BtnSpinner } from '../../lib/Loader';

export default function PricingPage() {
  const { data, update, serverLoading } = useDashboard();
  const [plans, setPlans] = useState(data.plans);
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pricing').then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.plans?.length) setPlans(d.plans); }).catch(() => {});
  }, []);

  const set = (id, field, value) => setPlans((ps) => ps.map((p) => p.id === id ? { ...p, [field]: field === 'price' ? Number(value) || 0 : value } : p));
  const save = async () => {
    setBusy(true);
    let ok = false;
    try {
      const res = await fetch('/api/admin/pricing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plans }) });
      ok = res.ok;
    } catch {}
    update((d) => ({ ...d, plans }));
    setSaved(ok ? 'Pricing saved on the server. The Billing page, checkout and the landing page now use these prices.' : 'Saved locally only — the server could not be reached. Check the connection and save again.');
    setBusy(false);
  };

  if (serverLoading) return <Loader text="Loading pricing…" />;

  return (
    <>
      {saved && <p className="dash-note green">{saved}</p>}
      <div className="dash-grid three">
        {plans.map((p) => (
          <div className="dash-card" key={p.id}>
            <h3>{p.name}</h3>
            <div className="dash-field"><label>Price / month (USD)</label><input type="number" min="0" step="1" value={p.price} onChange={(e) => set(p.id, 'price', e.target.value)} /></div>
            <div className="dash-field"><label>Sites</label><input value={p.sites} onChange={(e) => set(p.id, 'sites', e.target.value)} /></div>
            <div className="dash-field"><label>Description</label><textarea rows={2} value={p.desc} onChange={(e) => set(p.id, 'desc', e.target.value)} /></div>
            <p style={{ fontSize: 13 }}>Features: {p.features.join(' · ')}</p>
            <p style={{ marginTop: 10, fontSize: 13, color: '#5b6b82' }}>Checkout total: <b>{money(p.price)}</b> / month via PayFast</p>
          </div>
        ))}
      </div>
      <button className="dash-btn blue" onClick={save} disabled={busy}>{busy ? <><BtnSpinner />Saving…</> : 'Save pricing'}</button>
    </>
  );
}
