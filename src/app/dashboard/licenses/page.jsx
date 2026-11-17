'use client';

import { useState } from 'react';
import { useDashboard, useRole, money } from '../lib/useStore';

function newKey() {
  const part = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  return `MPS-${part()}-${part()}-${part()}`;
}

export default function LicensesPage() {
  const { data, update } = useDashboard();
  const role = useRole();
  const isAdmin = role === 'admin';
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState('single');
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState('');

  const myLicenses = isAdmin ? data.licenses : data.licenses.filter((l) => l.domain === 'saras-fashion.com');
  const myPlan = data.plans.find((p) => p.id === plan) || data.plans[1];

  const connectDomain = async (e) => {
    e.preventDefault();
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!clean || !clean.includes('.')) { setMsg('Please enter a valid domain, e.g. mystore.com'); return; }
    const existing = data.licenses.find((l) => l.domain === clean);
    if (existing) { setMsg(`This domain already has a license (${existing.key}). Activate that key in WordPress instead.`); return; }
    // Try the real backend first; fall back to the local demo store.
    try {
      const res = await fetch('/api/licenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: clean, planId: plan }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.license) {
        const lic = { ...d.license, lastCheck: d.license.last_check || '—', created: d.license.created_at };
        setMsg(`License created for ${clean} (saved on the server). Copy the key below and paste it in WordPress → Modern Product Slider → License.`);
        setDomain('');
        update((s) => ({ ...s, licenses: [lic, ...s.licenses] }));
        return;
      }
      if (res.status === 401) { setMsg('Please sign in first (use the Log in button on the website), then create the license.'); return; }
    } catch {}
    const key = newKey();
    update((d) => ({ ...d, licenses: [{ id: 'LIC-' + Math.floor(1000 + Math.random() * 9000), key, plan: myPlan.name, domain: clean, status: 'Active', sites: 1, version: '2.1.0', created: new Date().toISOString().slice(0, 10), lastCheck: '—' }, ...d.licenses] }));
    setMsg(`License created for ${clean}. Copy the key below and paste it in WordPress → Modern Product Slider → License.`);
    setDomain('');
  };

  const setStatus = (id, status) => update((d) => ({ ...d, licenses: d.licenses.map((l) => l.id === id ? { ...l, status } : l) }));
  const copy = async (key) => { try { await navigator.clipboard.writeText(key); } catch {} setCopied(key); setTimeout(() => setCopied(''), 2000); };

  return (
    <>
      {msg && <p className="dash-note blue">{msg}</p>}
      {!isAdmin && (
        <div className="dash-grid two">
          <div className="dash-card">
            <h3>Connect a domain</h3>
            <p style={{ marginBottom: 16 }}>Add your WordPress store domain to generate a license key. The key only works on that domain, and only while your plan is active.</p>
            <form onSubmit={connectDomain}>
              <div className="dash-field"><label htmlFor="domain">Store domain</label><input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="mystore.com" /></div>
              <div className="dash-field"><label htmlFor="plan">Plan</label><select id="plan" value={plan} onChange={(e) => setPlan(e.target.value)}>{data.plans.filter((p) => p.price > 0).map((p) => <option key={p.id} value={p.id}>{p.name} — {money(p.price)}/month · {p.sites}</option>)}</select></div>
              <button className="dash-btn blue" type="submit">Generate license key</button>
            </form>
          </div>
          <div className="dash-card">
            <h3>How to activate in WordPress</h3>
            <p>1. In WordPress go to <b>Modern Product Slider → License</b>.<br />2. Paste your license key and click <b>Activate</b>.<br />3. The plugin checks the key against this dashboard. An active license unlocks Pro features and updates; an expired or deactivated key falls back to Free.</p>
            <p style={{ marginTop: 12 }}>Only the version your license covers can update. When we release a new Pro version, every store with an active license sees the update in WordPress → Dashboard → Updates.</p>
          </div>
        </div>
      )}

      <div className="dash-card">
        <div className="card-head"><h3>{isAdmin ? 'All licenses' : 'Your licenses'}</h3><span className="badge blue">{myLicenses.length} total</span></div>
        <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>License key</th><th>Plan</th><th>Domain</th><th>Version</th><th>Status</th><th>Last check</th><th></th></tr></thead><tbody>
          {myLicenses.map((l) => (
            <tr key={l.id}>
              <td className="mono">{l.key}</td><td>{l.plan}</td><td>{l.domain}</td><td>v{l.version}</td>
              <td><span className={`badge ${l.status === 'Active' ? 'green' : 'red'}`}>{l.status}</span></td><td>{l.lastCheck}</td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <button className="dash-btn ghost sm" onClick={() => copy(l.key)}>{copied === l.key ? 'Copied ✓' : 'Copy key'}</button>{' '}
                {l.status === 'Active'
                  ? <button className="dash-btn danger sm" onClick={() => setStatus(l.id, 'Expired')}>Deactivate</button>
                  : <button className="dash-btn blue sm" onClick={() => setStatus(l.id, 'Active')}>Activate</button>}
              </td>
            </tr>
          ))}
        </tbody></table></div>
        {myLicenses.length === 0 && <p className="dash-empty">No licenses yet — connect a domain above to create your first one.</p>}
      </div>
    </>
  );
}
