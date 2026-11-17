'use client';

import { useState } from 'react';
import { useDashboard } from '../../lib/useStore';
import Loader, { BtnSpinner } from '../../lib/Loader';

export default function UsersPage() {
  const { data, update, serverLoading } = useDashboard();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState('');
  const rows = data.users.filter((u) => (u.name + u.email + u.plan).toLowerCase().includes(q.toLowerCase()));

  const toggle = async (email, current) => {
    const next = current === 'Active' ? 'Expired' : 'Active';
    setBusy(email);
    try {
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, status: next }) });
      if (!res.ok) throw new Error('server save failed');
    } catch {
      // Demo mode (no server): keep the change locally only.
    } finally { setBusy(''); }
    update((d) => ({ ...d, users: d.users.map((u) => u.email === email ? { ...u, status: next } : u) }));
  };

  if (serverLoading) return <Loader text="Loading customers…" />;

  return (
    <div className="dash-card">
      <div className="card-head"><h3>Customers</h3><span className="badge blue">{data.users.length} users</span></div>
      <div className="dash-field" style={{ maxWidth: 360 }}><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or plan…" /></div>
      <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>Customer</th><th>Plan</th><th>Licenses</th><th>Joined</th><th>Status</th><th></th></tr></thead><tbody>
        {rows.map((u) => (
          <tr key={u.email}>
            <td><b>{u.name}</b><br /><span style={{ color: '#5b6b82', fontSize: 13 }}>{u.email}</span></td>
            <td>{u.plan}</td><td>{u.licenses}</td><td>{u.joined}</td>
            <td><span className={`badge ${u.status === 'Active' ? 'green' : 'red'}`}>{u.status}</span></td>
            <td><button className="dash-btn ghost sm" disabled={busy === u.email} onClick={() => toggle(u.email, u.status)}>{busy === u.email ? <><BtnSpinner />Saving…</> : (u.status === 'Active' ? 'Suspend' : 'Reactivate')}</button></td>
          </tr>
        ))}
      </tbody></table></div>
      {rows.length === 0 && <p className="dash-empty">No customers match that search.</p>}
    </div>
  );
}
