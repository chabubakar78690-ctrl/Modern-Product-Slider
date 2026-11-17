'use client';

import Link from 'next/link';
import { DollarSign, Users, KeyRound, TrendingUp } from 'lucide-react';
import { useDashboard, money } from './lib/useStore';

export default function DashboardHome() {
  const { data, role } = useDashboard();
  const isAdmin = role === 'admin';
  const activeLicenses = data.licenses.filter((l) => l.status === 'Active');
  const revenue = data.payments.filter((p) => p.status === 'Completed').reduce((s, p) => s + p.amount, 0);
  const mrr = data.users.filter((u) => u.status === 'Active' && u.plan !== 'Free').reduce((s, u) => s + (u.plan === 'Unlimited Sites' ? 10 : 3), 0);

  return (
    <>
      {isAdmin ? (
        <div className="dash-grid">
          <div className="dash-card stat"><div className="stat-ico"><DollarSign size={22} /></div><div className="s-label">Monthly revenue</div><div className="s-num">{money(revenue)}</div><div className="s-sub">↑ 3 completed PayFast payments</div></div>
          <div className="dash-card stat"><div className="stat-ico"><Users size={22} /></div><div className="s-label">Active customers</div><div className="s-num">{data.users.filter((u) => u.status === 'Active').length}</div><div className="s-sub">of {data.users.length} total users</div></div>
          <div className="dash-card stat"><div className="stat-ico"><KeyRound size={22} /></div><div className="s-label">Active licenses</div><div className="s-num">{activeLicenses.length}</div><div className="s-sub">{data.licenses.length} issued in total</div></div>
          <div className="dash-card stat"><div className="stat-ico"><TrendingUp size={22} /></div><div className="s-label">Est. MRR</div><div className="s-num">{money(mrr)}/mo</div><div className="s-sub warn">Based on active paid plans</div></div>
        </div>
      ) : (
        <div className="dash-grid">
          <div className="dash-card stat"><div className="s-label">Your plan</div><div className="s-num" style={{ fontSize: 22 }}>{data.customer.planName}</div><div className="s-sub">Renews {data.customer.renews}</div></div>
          <div className="dash-card stat"><div className="s-label">License status</div><div className="s-num" style={{ fontSize: 22 }}>{data.customer.status}</div><div className="s-sub">1 active license</div></div>
          <div className="dash-card stat"><div className="s-label">Connected domain</div><div className="s-num" style={{ fontSize: 18 }}>saras-fashion.com</div><div className="s-sub">Plugin v2.1.0 installed</div></div>
          <div className="dash-card stat"><div className="s-label">Next payment</div><div className="s-num">{money(3)}/mo</div><div className="s-sub">Via PayFast · {data.customer.renews}</div></div>
        </div>
      )}

      <div className="dash-grid two">
        <div className="dash-card">
          <div className="card-head"><h3>{isAdmin ? 'Recent payments' : 'Your license'}</h3><Link href={isAdmin ? '/dashboard/billing' : '/dashboard/licenses'}>{isAdmin ? 'All payments →' : 'Manage →'}</Link></div>
          {isAdmin ? (
            <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>Payment</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>
              {data.payments.slice(0, 4).map((p) => (
                <tr key={p.id}><td className="mono">{p.id}</td><td>{p.user}</td><td>{money(p.amount)}</td><td><span className={`badge ${p.status === 'Completed' ? 'green' : 'red'}`}>{p.status}</span></td></tr>
              ))}
            </tbody></table></div>
          ) : (
            <>
              <p>Your Pro license is active on <b>saras-fashion.com</b>. Only stores with an active license receive plugin updates from WordPress.</p>
              <div className="dash-license-key" style={{ marginTop: 14 }}><span>MPS-9F3K-28XD-71QZ</span><span className="badge green">Active</span></div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}><Link className="dash-btn blue sm" href="/dashboard/licenses">Manage license</Link><Link className="dash-btn ghost sm" href="/dashboard/downloads">Download Pro ZIP</Link></div>
            </>
          )}
        </div>
        <div className="dash-card">
          <div className="card-head"><h3>Latest plugin version</h3><Link href="/dashboard/downloads">Downloads →</Link></div>
          {data.versions.filter((v) => v.current).map((v) => (
            <div key={v.version}>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#081a3d', margin: '0 0 4px' }}>v{v.version} <span className="badge blue">Current</span></p>
              <p>{v.notes}</p>
              <p style={{ marginTop: 10 }}>Released {v.date} · {v.size} · {v.file}</p>
              <div style={{ marginTop: 16 }}><Link className="dash-btn navy sm" href="/dashboard/downloads">{isAdmin ? 'Manage versions' : 'Download v' + v.version}</Link></div>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <div className="card-head"><h3>{isAdmin ? 'All licenses' : 'How licensing works'}</h3><Link href="/dashboard/licenses">View licenses →</Link></div>
        {isAdmin ? (
          <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>License</th><th>Plan</th><th>Domain</th><th>Status</th><th>Last check</th></tr></thead><tbody>
            {data.licenses.map((l) => (
              <tr key={l.id}><td className="mono">{l.key}</td><td>{l.plan}</td><td>{l.domain}</td><td><span className={`badge ${l.status === 'Active' ? 'green' : 'red'}`}>{l.status}</span></td><td>{l.lastCheck}</td></tr>
            ))}
          </tbody></table></div>
        ) : (
          <p>Connect your WordPress domain, copy the license key into the plugin settings, and activate it. Your store then gets Pro features and updates for as long as your plan is active. If a plan expires or is cancelled, the license stops working and the plugin no longer updates — it falls back to the Free version.</p>
        )}
      </div>
    </>
  );
}
