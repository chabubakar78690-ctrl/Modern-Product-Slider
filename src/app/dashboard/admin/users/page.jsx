'use client';

import { useState } from 'react';
import { useDashboard } from '../../lib/useStore';
import { usePagination, Pagination } from '../../lib/Pagination';
import Loader, { BtnSpinner } from '../../lib/Loader';

export default function UsersPage() {
  const { data, update, serverLoading, session, refreshServer } = useDashboard();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const rows = data.users.filter((u) => (u.name + u.email + u.plan).toLowerCase().includes(q.toLowerCase()));
  const { pageItems, page, setPage, pages } = usePagination(rows, 8);

  const toggle = async (email, current) => {
    const next = current === 'Active' ? 'Expired' : 'Active';
    setBusy(email);
    try {
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, status: next }) });
      if (!res.ok) throw new Error('server save failed');
      update((d) => ({ ...d, users: d.users.map((u) => u.email === email ? { ...u, status: next } : u) }));
    } catch {
      // Demo mode only: keep the change locally.
      if (session.demo) update((d) => ({ ...d, users: d.users.map((u) => u.email === email ? { ...u, status: next } : u) }));
    } finally { setBusy(''); }
  };

  // Admin changes any customer's plan (Free / Single Site / Unlimited).
  // The server updates their license; a paid plan creates one if needed.
  const changePlan = async (email, planName) => {
    setBusy(email + ':plan');
    setMsg('');
    try {
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, plan: planName }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'server save failed');
      await refreshServer();
      setMsg(`Plan for ${email} changed to ${planName}.`);
    } catch (e) {
      if (session.demo) {
        update((d) => ({ ...d, users: d.users.map((u) => u.email === email ? { ...u, plan: planName } : u) }));
        setMsg(`Plan for ${email} changed to ${planName} (demo mode — local only).`);
      } else setMsg('Could not change the plan: ' + e.message);
    } finally { setBusy(''); }
  };

  if (serverLoading) return <Loader text="Loading customers…" />;

  return (
    <div className="dash-card">
      <div className="card-head"><h3>Customers</h3><span className="badge blue">{data.users.length} users</span></div>
      {msg && <p className="dash-note green">{msg}</p>}
      <div className="dash-field" style={{ maxWidth: 360 }}><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or plan…" /></div>
      <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>Customer</th><th>Plan</th><th>Licenses</th><th>Joined</th><th>Status</th><th></th></tr></thead><tbody>
        {pageItems.map((u) => (
          <tr key={u.email}>
            <td><b>{u.name}</b><br /><span style={{ color: '#5b6b82', fontSize: 13 }}>{u.email}</span></td>
            <td>
              <select value={u.plan} disabled={busy === u.email + ':plan'} onChange={(e) => changePlan(u.email, e.target.value)} style={{ padding: '7px 9px', borderRadius: 9, border: '1.5px solid #dbe7f3', fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
                {data.plans.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </td>
            <td>{u.licenses}</td><td>{u.joined}</td>
            <td><span className={`badge ${u.status === 'Active' ? 'green' : 'red'}`}>{u.status}</span></td>
            <td><button className="dash-btn ghost sm" disabled={busy === u.email} onClick={() => toggle(u.email, u.status)}>{busy === u.email ? <><BtnSpinner />Saving…</> : (u.status === 'Active' ? 'Suspend' : 'Reactivate')}</button></td>
          </tr>
        ))}
      </tbody></table></div>
      {rows.length === 0 && <p className="dash-empty">No customers match that search.</p>}
      <Pagination page={page} pages={pages} onPage={setPage} />
    </div>
  );
}
