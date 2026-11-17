'use client';

import { useState } from 'react';
import { useDashboard, useRole } from '../lib/useStore';
import { resetStore } from '../lib/store';

export default function ProfilePage() {
  const { data, update } = useDashboard();
  const role = useRole();
  const isAdmin = role === 'admin';
  const me = isAdmin ? data.profile : data.customer;
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [saved, setSaved] = useState('');

  const save = (e) => {
    e.preventDefault();
    update((d) => isAdmin ? { ...d, profile: { ...d.profile, name, email } } : { ...d, customer: { ...d.customer, name, email } });
    setSaved('Profile saved.');
  };

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
          <button className="dash-btn blue" type="submit">Save profile</button>
        </form>
      </div>
      <div className="dash-card">
        <h3>Account</h3>
        <div className="dash-kv">
          <div><b>Role</b>{isAdmin ? 'Admin (store owner)' : 'Customer'}</div>
          <div><b>Joined</b>2026-11-10</div>
          <div><b>Sign-in methods</b>Google, Email</div>
          <div><b>Two-factor</b><span className="badge amber">Not enabled</span></div>
        </div>
        <p style={{ marginTop: 16 }}>Signed in with Google in this demo. Real Google / Facebook / Apple sign-in is wired up in Admin → Settings → Social login, once the OAuth keys are saved.</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="dash-btn ghost" href="/">← Back to website</a>
          <button className="dash-btn danger" onClick={() => { resetStore(); window.location.reload(); }}>Reset demo data</button>
        </div>
      </div>
    </div>
  );
}
