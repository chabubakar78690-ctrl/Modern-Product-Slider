'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard, useRole, money } from '../lib/useStore';
import { usePagination, Pagination } from '../lib/Pagination';
import Loader, { BtnSpinner } from '../lib/Loader';

function newKey() {
  const part = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  return `MPS-${part()}-${part()}-${part()}`;
}

export default function LicensesPage() {
  const { data, update, session, serverLoading, refreshServer } = useDashboard();
  const role = useRole();
  const isAdmin = role === 'admin';
  const [domain, setDomain] = useState('');
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState('');
  const [busy, setBusy] = useState(false);

  // Signed-in users see exactly what the server returns (admin: all,
  // customer: only their own). Demo mode shows the demo customer's licenses.
  const myLicenses = session.user ? data.licenses : data.licenses.filter((l) => l.domain === 'saras-fashion.com');
  const hasActive = myLicenses.some((l) => l.status === 'Active');
  const activeLicense = myLicenses.find((l) => l.status === 'Active');
  const unconnected = myLicenses.find((l) => l.status === 'Active' && !l.domain);
  const connected = (l) => l.lastCheck && l.lastCheck !== '—';
  const { pageItems, page, setPage, pages } = usePagination(myLicenses, 8);

  // Connect a WordPress site to the paid license: attach the domain, then
  // the customer installs the plugin in WordPress and activates the key
  // there — the plugin calls back here, which marks the site Connected.
  const connectSite = async (e) => {
    e.preventDefault();
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!clean || !clean.includes('.')) { setMsg('Please enter a valid domain, e.g. mystore.com'); return; }
    const existing = myLicenses.find((l) => l.domain === clean);
    if (existing) { setMsg(`This domain is already connected (${existing.key}). Activate that key in WordPress instead.`); return; }
    setBusy(true);
    try {
      // A paid license from checkout has no domain yet — attach this one.
      if (unconnected) {
        const res = await fetch('/api/licenses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: unconnected.key, domain: clean }) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setMsg(d.error || 'Could not connect this domain.'); return; }
        setMsg(`Site connected: ${clean} is now linked to license ${unconnected.key}. Next: install the plugin in WordPress and activate this key there.`);
        setDomain('');
        await refreshServer();
        return;
      }
      const res = await fetch('/api/licenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: clean, planId: 'single' }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.license) {
        setMsg(`License created for ${clean} (saved on the server). Copy the key below and paste it in WordPress → Modern Product Slider → License.`);
        setDomain('');
        await refreshServer();
        return;
      }
      if (res.status === 401) { setMsg('Please sign in first (use the Log in button on the website), then connect your site.'); return; }
      setMsg(d.error || 'Could not connect this site. Please try again.');
      return;
    } catch {
      if (!session.demo) { setMsg('Could not reach the server. Please try again.'); return; }
      // Demo mode only (nobody signed in): create the key locally.
      const key = newKey();
      update((d) => ({ ...d, licenses: [{ id: 'LIC-' + Math.floor(1000 + Math.random() * 9000), key, plan: 'Single Site', domain: clean, status: 'Active', sites: 1, version: '2.1.0', created: new Date().toISOString().slice(0, 10), lastCheck: '—' }, ...d.licenses] }));
      setMsg(`License created for ${clean}. Copy the key below and paste it in WordPress → Modern Product Slider → License.`);
      setDomain('');
    } finally { setBusy(false); }
  };

  // Download the Pro ZIP and open the WordPress plugin-upload screen, so
  // the customer installs it in their own WordPress in one go. Both open
  // in a new tab — the dashboard stays open behind them.
  const installInWordPress = (lic) => {
    if (!lic.domain) { setMsg('Connect a domain first, then install the plugin on that site.'); return; }
    window.open(`/api/download?key=${encodeURIComponent(lic.key)}&domain=${encodeURIComponent(lic.domain)}`, '_blank');
    window.open(`https://${lic.domain}/wp-admin/plugin-install.php?tab=upload`, '_blank');
  };
  // Install the FREE plugin first: if the plugin is not in WordPress yet
  // (not even the free one), the License page does not exist and WordPress
  // shows "Sorry, you are not allowed to access this page." — so the free
  // plugin goes in first, then the Pro ZIP.
  const installFreeInWordPress = (lic) => {
    if (!lic.domain) { setMsg('Connect a domain first, then install the plugin on that site.'); return; }
    window.open('/api/free-download', '_blank');
    window.open(`https://${lic.domain}/wp-admin/plugin-install.php?tab=upload`, '_blank');
  };
  const openWordPress = (lic) => {
    if (!lic.domain) return;
    // Only open the plugin's License page when the site is actually
    // connected (the plugin is installed and has checked in). Otherwise
    // WordPress shows "not allowed to access this page" — open the WP
    // dashboard instead and install the plugin first.
    const url = connected(lic)
      ? `https://${lic.domain}/wp-admin/admin.php?page=modern-product-slider`
      : `https://${lic.domain}/wp-admin/`;
    window.open(url, '_blank');
  };

  const setStatus = async (lic, status) => {
    const action = status === 'Active' ? 'activate' : 'deactivate';
    try {
      const res = await fetch(`/api/license/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: lic.key, domain: lic.domain }) });
      if (res.ok) { await refreshServer(); return; }
    } catch {}
    if (!session.demo) return;
    update((d) => ({ ...d, licenses: d.licenses.map((l) => l.id === lic.id ? { ...l, status } : l) }));
  };
  const copy = async (key) => { try { await navigator.clipboard.writeText(key); } catch {} setCopied(key); setTimeout(() => setCopied(''), 2000); };

  if (serverLoading) return <Loader text="Loading licenses…" />;

  return (
    <>
      {msg && <p className="dash-note blue">{msg}</p>}
      {!isAdmin && !hasActive && (
        <div className="dash-grid two">
          <div className="dash-card">
            <h3>Start with the Free plugin</h3>
            <p style={{ marginBottom: 16 }}>No license needed. Download the free plugin, then in WordPress go to Plugins → Add New → Upload and install the ZIP. It works right away with the shortcode and the Gutenberg block.</p>
            <a className="dash-btn blue" href="/api/free-download">Download Free plugin</a>
          </div>
          <div className="dash-card">
            <h3>Go Pro to connect a site</h3>
            <p style={{ marginBottom: 16 }}>A Pro license connects your WordPress site to this dashboard: Pro features, updates from WordPress, and priority support. Pay once, and your license is created automatically.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {data.plans.filter((p) => p.price > 0).map((p) => (
                <Link key={p.id} className="dash-btn navy sm" href="/dashboard/billing">{p.name} — {money(p.price)}/mo</Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isAdmin && hasActive && (
        <div className="dash-grid two">
          <div className="dash-card">
            <h3>Connect your WordPress site</h3>
            <p style={{ marginBottom: 16 }}>Enter your store domain to link it to your Pro license ({activeLicense.plan}). Then install the plugin in WordPress and activate the key there — the site shows as Connected here.</p>
            <form onSubmit={connectSite}>
              <div className="dash-field"><label htmlFor="domain">Store domain</label><input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="mystore.com" /></div>
              <button className="dash-btn blue" type="submit" disabled={busy}>{busy ? <><BtnSpinner />Connecting…</> : 'Connect site'}</button>
            </form>
            {activeLicense?.domain && (
              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="dash-btn navy sm" onClick={() => installFreeInWordPress(activeLicense)}>1. Install FREE plugin in WordPress</button>
                <button className="dash-btn blue sm" onClick={() => installInWordPress(activeLicense)}>2. Install Pro plugin in WordPress</button>
                <button className="dash-btn ghost sm" onClick={() => openWordPress(activeLicense)}>Open WordPress</button>
              </div>
            )}
          </div>
          <div className="dash-card">
            <h3>How activation works</h3>
            <p><b>Step 1 — Free plugin first.</b> Click <b>Install FREE plugin in WordPress</b> — the free ZIP downloads and your WordPress plugin-upload screen opens in a new tab. Upload it and click <b>Activate</b>. (Without the plugin installed, WordPress has no License page and shows “not allowed to access this page”.)<br /><b>Step 2 — Pro plugin.</b> Click <b>Install Pro plugin in WordPress</b> — the Pro ZIP downloads (needs your active license) and the upload screen opens again. Upload it and activate it.<br /><b>Step 3 — Activate the key.</b> In WordPress go to <b>Product Slider → License</b>, paste your license key and click <b>Connect site &amp; activate Pro</b>. The plugin checks the key here, and this page shows the site as Connected.<br /><b>Step 4 — Updates.</b> When a new Pro version is published here, WordPress shows the update under Dashboard → Updates.</p>
          </div>
        </div>
      )}

      <div className="dash-card">
        <div className="card-head"><h3>{isAdmin ? 'All licenses' : 'Your licenses'}</h3><span className="badge blue">{myLicenses.length} total</span></div>
        <div className="dash-table-wrap"><table className="dash-table nowrap"><thead><tr><th>License key</th><th>Plan</th><th>Domain</th><th>Version</th><th>Status</th><th>Connection</th><th>Last check</th><th></th></tr></thead><tbody>
          {pageItems.map((l) => (
            <tr key={l.id}>
              <td className="mono">{l.key}</td><td>{l.plan}</td><td>{l.domain || '—'}</td><td>v{l.version}</td>
              <td><span className={`badge ${l.status === 'Active' ? 'green' : 'red'}`}>{l.status}</span></td>
              <td>{connected(l) ? <span className="badge green">Connected</span> : <span className="badge amber">Not connected yet</span>}</td>
              <td>{l.lastCheck}</td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <button className="dash-btn ghost sm" onClick={() => copy(l.key)}>{copied === l.key ? 'Copied ✓' : 'Copy key'}</button>{' '}
                {l.status === 'Active'
                  ? <button className="dash-btn danger sm" onClick={() => setStatus(l, 'Expired')}>Deactivate</button>
                  : <button className="dash-btn blue sm" onClick={() => setStatus(l, 'Active')}>Activate</button>}
              </td>
            </tr>
          ))}
        </tbody></table></div>
        {myLicenses.length === 0 && <p className="dash-empty">No licenses yet — pick a Pro plan on the Billing page, or start with the Free plugin above.</p>}
        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>
    </>
  );
}
