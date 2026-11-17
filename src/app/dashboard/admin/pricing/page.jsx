'use client';

import { useState } from 'react';
import { useDashboard, money } from '../../lib/useStore';

export default function PricingPage() {
  const { data, update } = useDashboard();
  const [plans, setPlans] = useState(data.plans);
  const [saved, setSaved] = useState('');

  const set = (id, field, value) => setPlans((ps) => ps.map((p) => p.id === id ? { ...p, [field]: field === 'price' ? Number(value) || 0 : value } : p));
  const save = () => { update((d) => ({ ...d, plans })); setSaved('Pricing saved. The Billing page and checkout now use these prices. (The landing page prices are updated in the next step.)'); };

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
      <button className="dash-btn blue" onClick={save}>Save pricing</button>
    </>
  );
}
