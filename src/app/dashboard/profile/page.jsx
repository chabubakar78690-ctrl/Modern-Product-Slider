'use client';

import { useEffect, useState } from 'react';
import { useDashboard, useRole } from '../lib/useStore';
import { resetStore } from '../lib/store';
import AdminSettings from '../lib/AdminSettings';
import { registerPasskey, listPasskeys, deletePasskey } from '../lib/webauthn';
import Loader, { BtnSpinner } from '../lib/Loader';

export default function ProfilePage() {
  const { data, update, session, serverLoading } = useDashboard();
  const role = useRole();
  const isAdmin = role === 'admin';
  const me = session.user ? { name: session.user.name, email: session.user.email } : (isAdmin ? data.profile : data.customer);
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const [passkeys, setPasskeys] = useState([]);
  const [pkMsg, setPkMsg] = useState('');
  const [pkBusy, setPkBusy] = useState(false);
  const [pkSetup, setPkSetup] = useState(false);

  useEffect(() => {
    if (session.user) { setName(session.user.name); setEmail(session.user.email); }
  }, [session.user]);

  // Passkeys for this account (WebAuthn) — listed from the server.
  const loadPasskeys = async () => {
    if (!session.user) return;
    try {
      const d = await listPasskeys();
      setPasskeys(d.passkeys || []);
      setPkSetup(!!d.setupNeeded);
    } catch { setPasskeys([]); }
  };
  useEffect(() => { loadPasskeys(); }, [session.user]);

  const addPasskey = async () => {
    setPkBusy(true);
    setPkMsg('');
    try {
      await registerPasskey(`${me.name} — ${navigator.platform || 'this device'}`);
      setPkMsg('Passkey added. Next time, use “Continue with passkey” on the login popup — no password needed.');
      await loadPasskeys();
    } catch (e) {
      setPkMsg(e?.name === 'NotAllowedError' ? 'Passkey setup was cancelled.' : (e.message || 'Could not add the passkey.'));
    } finally { setPkBusy(false); }
  };
  const removePasskey = async (id) => {
    setPkBusy(true);
    try { await deletePasskey(id); setPkMsg('Passkey removed.'); await loadPasskeys(); }
    catch (e) { setPkMsg(e.message || 'Could not remove the passkey.'); }
    finally { setPkBusy(false); }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    if (isAdmin) {
      try {
        const res = await fetch('/api/admin/account', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) });
        if (!res.ok) throw new Error('server save failed');
      } catch {
        if (!session.demo) { setSaved('Could not reach the server — profile was not saved.'); setBusy(false); return; }
      }
    } else {
      // Customers save on the server too — name/email change is real, and
      // the session is refreshed so the new name shows everywhere.
      try {
        const res = await fetch('/api/auth/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.error || 'server save failed');
        setSaved('Profile saved.');
        setBusy(false);
        window.location.reload();
        return;
      } catch (err) {
        if (!session.demo) { setSaved('Could not reach the server — profile was not saved (' + err.message + ').'); setBusy(false); return; }
      }
    }
    update((d) => isAdmin ? { ...d, profile: { ...d.profile, name, email } } : { ...d, customer: { ...d.customer, name, email } });
    setSaved('Profile saved.');
    setBusy(false);
  };

  if (serverLoading) return <Loader text="Loading profile…" />;

  return (
    <>
    <div className="dash-grid two">
      <div className="dash-card">
        <h3>Your profile</h3>
        <p style={{ marginBottom: 16 }}>{isAdmin ? 'Admin account — this profile owns the store, pricing and PayFast settings.' : 'Customer account — this is the account your licenses and payments belong to.'}</p>
        {saved && <p className="dash-note green">{saved}</p>}
        <form onSubmit={save}>
          <div className="dash-field"><label htmlFor="name">Full name</label><input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="dash-field"><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {!isAdmin && (
            <div className="dash-field">
              <label>Plan</label>
              <div className="dash-plan-readonly"><span>{data.customer.planName} — renews {data.customer.renews}</span><a href="/dashboard/billing">Upgrade</a></div>
              <p className="hint">Your plan changes only through Billing — it cannot be edited here.</p>
            </div>
          )}
          <button className="dash-btn blue" type="submit" disabled={busy}>{busy ? <><BtnSpinner />Saving…</> : 'Save profile'}</button>
        </form>
      </div>
      <div className="dash-card">
        <h3>Account</h3>
        <div className="dash-kv">
          <div><b>Role</b>{isAdmin ? 'Admin (store owner)' : 'Customer'}</div>
          <div><b>Email</b>{me.email}</div>
          <div><b>Two-factor</b><span className="badge amber">Not enabled</span></div>
        </div>
        <p style={{ marginTop: 16 }}>Signed in as {session.user ? session.user.email : me.email}. {isAdmin ? 'Change the admin name, email or password in Admin settings below.' : 'Your licenses and payments belong to this account.'}</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="dash-btn ghost" href="/">← Back to website</a>
          {session.demo && <button className="dash-btn danger" onClick={() => { resetStore(); window.location.reload(); }}>Reset demo data</button>}
        </div>
      </div>
    </div>

    {session.user && (
      <div className="dash-card" style={{ marginTop: 20 }}>
        <div className="card-head"><h3>Passkeys</h3><span className="badge blue">Passwordless sign-in</span></div>
        <p style={{ marginBottom: 16 }}>A passkey signs you in with your device&apos;s fingerprint, face or PIN — no password to type. Add one here, then use <b>Continue with passkey</b> on the login popup.</p>
        {pkSetup && <p className="dash-note amber">Passkeys need one database table first: run <code>supabase/migration-add-passkeys.sql</code> in the Supabase SQL Editor, then reload this page.</p>}
        {pkMsg && <p className="dash-note green">{pkMsg}</p>}
        {passkeys.length === 0 && !pkSetup && <p className="dash-empty">No passkeys on this account yet.</p>}
        {passkeys.map((pk) => (
          <div key={pk.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ flex: 1 }}><b>{pk.name}</b><br /><span style={{ color: '#5b6b82', fontSize: 13 }}>Added {pk.created_at}</span></span>
            <button className="dash-btn ghost sm" disabled={pkBusy} onClick={() => removePasskey(pk.id)}>Remove</button>
          </div>
        ))}
        <div style={{ marginTop: 14 }}>
          <button className="dash-btn blue" onClick={addPasskey} disabled={pkBusy || pkSetup}>{pkBusy ? <><BtnSpinner />Adding…</> : 'Add a passkey on this device'}</button>
        </div>
      </div>
    )}

    {isAdmin && (
      <div style={{ marginTop: 4 }}>
        <div className="card-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 17, color: '#081a3d' }}>Admin settings</h3>
          <span className="badge blue">Admin only</span>
        </div>
        <AdminSettings />
      </div>
    )}
    </>
  );
}
