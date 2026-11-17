'use client';

import { useEffect, useState } from 'react';
import { useDashboard, useRole } from '../lib/useStore';
import { resetStore } from '../lib/store';
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

  useEffect(() => {
    if (session.user) { setName(session.user.name); setEmail(session.user.email); }
  }, [session.user]);

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
    }
    update((d) => isAdmin ? { ...d, profile: { ...d.profile, name, email } } : { ...d, customer: { ...d.customer, name, email } });
    setSaved('Profile saved.');
    setBusy(false);
  };

  if (serverLoading) return <Loader text="Loading profile…" />;

  return (
    <div className="dash-grid two">
      <div className="dash-card">
        <h3>Your profile</h3>
        <p style={{ marginBottom: 16 }}>{isAdmin ? 'Admin account — this profile owns the store, pricing and PayFast settings.' : 'Customer account — this is the account your licenses and payments belong to.'}</p>
        {saved && <p className="dash-note green">{saved}</p>}
        <form onSubmit={save}>
          <div className="dash-field"><label htmlFor="name">Full name</label><input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="dash-field"><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {!isAdmin && <div className="dash-field"><label>Plan</label><input value={data.customer.planName + ' — renews ' + data.customer.renews} readOnly /></div>}
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
        <p style={{ marginTop: 16 }}>Signed in as {session.user ? session.user.email : me.email}. {isAdmin ? 'Change the admin name, email or password in Admin → Settings → Admin account.' : 'Your licenses and payments belong to this account.'}</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="dash-btn ghost" href="/">← Back to website</a>
          {session.demo && <button className="dash-btn danger" onClick={() => { resetStore(); window.location.reload(); }}>Reset demo data</button>}
        </div>
      </div>
    </div>
  );
}
