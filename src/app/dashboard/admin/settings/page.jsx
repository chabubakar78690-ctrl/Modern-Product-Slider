'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '../../lib/useStore';
import { PAYFAST } from '../../lib/store';
import { BtnSpinner } from '../../lib/Loader';

const PROVIDERS = [
  { id: 'google', name: 'Google', hint: 'Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web application).' },
  { id: 'facebook', name: 'Facebook', hint: 'Meta Developers → My Apps → Facebook Login → App ID and App Secret.' },
  { id: 'apple', name: 'Apple', hint: 'Apple Developer → Certificates, Identifiers & Profiles → Services ID + Key for Sign in with Apple.' },
];

export default function SettingsPage() {
  const { data, update, session } = useDashboard();
  const [tab, setTab] = useState('social');
  const [saved, setSaved] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [oauth, setOauth] = useState(data.settings.oauth);
  const [payfast, setPayfast] = useState(data.settings.payfast);
  const [adminName, setAdminName] = useState(data.profile.name);
  const [adminEmail, setAdminEmail] = useState(data.profile.email);
  const [adminPass, setAdminPass] = useState('');
  const [busy, setBusy] = useState('');

  // Load the keys from the server (they live in the database, not the browser).
  useEffect(() => {
    fetch('/api/admin/settings').then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      if (d.oauth) setOauth(d.oauth);
      if (d.payfast) setPayfast(d.payfast);
    }).catch(() => {});
  }, []);

  const putSettings = async (body) => {
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      return res.ok;
    } catch { return false; }
  };

  const saveSocial = async () => {
    setBusy('social');
    const ok = await putSettings({ oauth });
    update((d) => ({ ...d, settings: { ...d.settings, oauth } }));
    setSaved(ok ? 'Social login keys saved on the server. The login popup now uses them for Google / Facebook / Apple sign-in.' : 'Saved locally only — the server could not be reached. Check the connection and save again.');
    setBusy('');
  };
  const savePayfast = async () => {
    setBusy('payfast');
    const ok = await putSettings({ payfast });
    update((d) => ({ ...d, settings: { ...d.settings, payfast } }));
    setSaved(ok ? 'PayFast settings saved on the server. ' + (payfast.sandbox ? 'Sandbox mode is ON — test payments use the sandbox credentials.' : 'Live mode is ON — real payments will be charged. Double-check the merchant ID and passphrase.') : 'Saved locally only — the server could not be reached. Check the connection and save again.');
    setBusy('');
  };
  const saveAdmin = async () => {
    if (adminPass && adminPass.length < 8) { setSaved('New password must be at least 8 characters.'); return; }
    setBusy('account');
    try {
      const res = await fetch('/api/admin/account', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: adminName, email: adminEmail, password: adminPass || undefined }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'save failed');
      update((dta) => ({ ...dta, profile: { ...dta.profile, name: adminName, email: adminEmail } }));
      setSaved('Admin account updated on the server. This is the one fixed admin account for the dashboard.');
      setAdminPass('');
    } catch (e) {
      update((d) => ({ ...d, profile: { ...d.profile, name: adminName, email: adminEmail } }));
      setSaved('Saved locally only — the server could not be reached (' + e.message + ').');
    } finally { setBusy(''); }
  };
  const fillSandbox = () => setPayfast((p) => ({ ...p, sandbox: true, merchantId: PAYFAST.sandboxMerchantId, merchantKey: PAYFAST.sandboxMerchantKey, passphrase: '' }));

  const mask = (v) => showSecrets ? v : (v ? '••••••••' + v.slice(-4) : '');

  return (
    <>
      {saved && <p className="dash-note green">{saved}</p>}
      <div className="dash-tabs">
        <button className={tab === 'social' ? 'on' : ''} onClick={() => setTab('social')}>Social login (OAuth)</button>
        <button className={tab === 'payfast' ? 'on' : ''} onClick={() => setTab('payfast')}>PayFast payments</button>
        <button className={tab === 'account' ? 'on' : ''} onClick={() => setTab('account')}>Admin account</button>
      </div>

      {tab === 'social' && (
        <div className="dash-card">
          <h3>Login with Google, Facebook &amp; Apple</h3>
          <p style={{ marginBottom: 16 }}>These keys power the &ldquo;Continue with Google / Facebook / Apple&rdquo; buttons in the login popup. Enter the keys from each provider&apos;s developer console. Client secrets are stored on the server (database) and never in the browser.</p>
          {PROVIDERS.map((prov) => (
            <div key={prov.id} style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 16 }}>
              <div className="toggle-row">
                <div><b>Continue with {prov.name}</b><span>{prov.hint}</span></div>
                <label className="toggle"><input type="checkbox" checked={oauth[prov.id].enabled} onChange={(e) => setOauth((o) => ({ ...o, [prov.id]: { ...o[prov.id], enabled: e.target.checked } }))} /><i /></label>
              </div>
              <div className="dash-row" style={{ marginTop: 12 }}>
                <div className="dash-field"><label>Client ID / App ID</label><input value={oauth[prov.id].clientId} onChange={(e) => setOauth((o) => ({ ...o, [prov.id]: { ...o[prov.id], clientId: e.target.value } }))} placeholder={`${prov.name} client ID`} /></div>
                <div className="dash-field"><label>Client Secret</label><input type={showSecrets ? 'text' : 'password'} value={oauth[prov.id].clientSecret} onChange={(e) => setOauth((o) => ({ ...o, [prov.id]: { ...o[prov.id], clientSecret: e.target.value } }))} placeholder="Secret — stored server-side in production" /></div>
              </div>
              <p className="dash-field"><span className="hint">Redirect URI: <code>{oauth[prov.id].redirect}</code></span></p>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="dash-btn blue" onClick={saveSocial} disabled={busy === 'social'}>{busy === 'social' ? <><BtnSpinner />Saving…</> : 'Save social login keys'}</button>
            <button className="dash-btn ghost" onClick={() => setShowSecrets(!showSecrets)}>{showSecrets ? 'Hide secrets' : 'Show secrets'}</button>
          </div>
        </div>
      )}

      {tab === 'payfast' && (
        <div className="dash-card">
          <h3>PayFast gateway</h3>
          <p style={{ marginBottom: 16 }}>PayFast checkout posts a signed form to <code>{payfast.sandbox ? PAYFAST.sandboxUrl : PAYFAST.liveUrl}</code>. The MD5 signature is built server-side from the order fields plus your passphrase. PayFast confirms every payment with an ITN to your notify URL — the ITN is verified with 4 checks (signature, source IP, server confirmation VALID, merchant ID + amount match) before any license is activated. Docs: <a href={PAYFAST.docs} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>developers.payfast.co.za</a></p>
          <div className="toggle-row">
            <div><b>Sandbox (test mode)</b><span>ON: test payments use sandbox.payfast.co.za and the test merchant credentials. OFF: live payments are charged.</span></div>
            <label className="toggle"><input type="checkbox" checked={payfast.sandbox} onChange={(e) => setPayfast((p) => ({ ...p, sandbox: e.target.checked }))} /><i /></label>
          </div>
          <div className="dash-row" style={{ marginTop: 14 }}>
            <div className="dash-field"><label>Merchant ID</label><input value={payfast.merchantId} onChange={(e) => setPayfast((p) => ({ ...p, merchantId: e.target.value }))} /></div>
            <div className="dash-field"><label>Merchant Key</label><input type={showSecrets ? 'text' : 'password'} value={payfast.merchantKey} onChange={(e) => setPayfast((p) => ({ ...p, merchantKey: e.target.value }))} /></div>
          </div>
          <div className="dash-field"><label>Passphrase (must match PayFast → Settings → Security)</label><input type={showSecrets ? 'text' : 'password'} value={payfast.passphrase} onChange={(e) => setPayfast((p) => ({ ...p, passphrase: e.target.value }))} placeholder="Optional but strongly recommended" /><p className="hint">Leave blank in sandbox — the test account has no passphrase by default. A mismatch makes every ITN fail signature validation.</p></div>
          <div className="dash-field"><label>Return URL (after payment)</label><input value={payfast.returnUrl} onChange={(e) => setPayfast((p) => ({ ...p, returnUrl: e.target.value }))} /></div>
          <div className="dash-row">
            <div className="dash-field"><label>Cancel URL</label><input value={payfast.cancelUrl} onChange={(e) => setPayfast((p) => ({ ...p, cancelUrl: e.target.value }))} /></div>
            <div className="dash-field"><label>Notify URL (ITN webhook)</label><input value={payfast.notifyUrl} onChange={(e) => setPayfast((p) => ({ ...p, notifyUrl: e.target.value }))} /></div>
          </div>
          <p className="dash-note amber">Live PayFast merchant accounts are for South African businesses — a live account needs South African business and bank details. Use sandbox mode to test the full checkout flow from anywhere.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="dash-btn blue" onClick={savePayfast} disabled={busy === 'payfast'}>{busy === 'payfast' ? <><BtnSpinner />Saving…</> : 'Save PayFast settings'}</button>
            <button className="dash-btn ghost" onClick={fillSandbox}>Fill sandbox test credentials</button>
            <button className="dash-btn ghost" onClick={() => setShowSecrets(!showSecrets)}>{showSecrets ? 'Hide secrets' : 'Show secrets'}</button>
          </div>
          <p style={{ marginTop: 14, fontSize: 13, color: '#5b6b82' }}>Sandbox test credentials: Merchant ID <span className="mono">{PAYFAST.sandboxMerchantId}</span> · Merchant Key <span className="mono">{mask(PAYFAST.sandboxMerchantKey)}</span></p>
        </div>
      )}
      {tab === 'account' && (
        <div className="dash-card">
          <h3>Admin account</h3>
          <p style={{ marginBottom: 16 }}>There is one fixed admin account for this dashboard. Change the name, email or password here — it updates on the server and in your session. (Password changes are hashed server-side.)</p>
          <div className="dash-row">
            <div className="dash-field"><label htmlFor="aname">Admin name</label><input id="aname" value={adminName} onChange={(e) => setAdminName(e.target.value)} /></div>
            <div className="dash-field"><label htmlFor="aemail">Admin email</label><input id="aemail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} /></div>
          </div>
          <div className="dash-field"><label htmlFor="apass">New password</label><input id="apass" type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="Leave blank to keep the current password" /><p className="hint">Use at least 8 characters with a mix of letters and numbers.</p></div>
          <button className="dash-btn blue" onClick={saveAdmin} disabled={busy === 'account'}>{busy === 'account' ? <><BtnSpinner />Saving…</> : 'Save admin account'}</button>
        </div>
      )}
    </>
  );
}
