'use client';

import Link from 'next/link';
import { DollarSign, Users, KeyRound, TrendingUp } from 'lucide-react';
import { useDashboard, money } from './lib/useStore';
import Loader from './lib/Loader';

export default function DashboardHome() {
  const { data, role, serverLoading } = useDashboard();
  const isAdmin = role === 'admin';
  const activeLicenses = data.licenses.filter((l) => l.status === 'Active');
  const revenue = data.payments.filter((p) => p.status === 'Completed').reduce((s, p) => s + p.amount, 0);
  const mrr = data.users.filter((u) => u.status === 'Active' && u.plan !== 'Free').reduce((s, u) => s + (u.plan === 'Unlimited Sites' ? 10 : 3), 0);
  const myLicense = activeLicenses[0];
  const hasActive = !!myLicense;
  const myPlan = data.plans.find((p) => p.name === (myLicense?.plan || data.customer.planName)) || data.plans.find((p) => p.id === 'single');
  const freeV = data.freeVersion || { version: '1.0.0', file: 'modern-product-slider-free.zip', size: '—', date: '', notes: 'Free version: WooCommerce product sliders via shortcode and Gutenberg block.' };

  if (serverLoading) return <Loader text="Loading your dashboard…" />;

  return (
    <>
      {/* New customers see pricing first: pick Free or a Pro plan, pay, and
          the rest of the dashboard (licenses, Pro downloads) unlocks. */}
      {!isAdmin && !hasActive && (
        <div className="dash-card" style={{ marginBottom: 20 }}>
          <div className="card-head"><h3>Choose your plan to get started</h3></div>
          <p style={{ marginBottom: 16 }}>Start free, or upgrade to Pro — once PayFast confirms your payment, your license is created automatically and the Licenses and Downloads pages unlock.</p>
          <div className="dash-grid three" style={{ marginBottom: 0 }}>
            {data.plans.map((p) => (
              <div key={p.id} className="dash-card" style={{ border: p.id === 'unlimited' ? '2px solid #0ea5e9' : '1px solid #e2e8f0' }}>
                <h3>{p.name}{p.id === 'unlimited' ? ' ★' : ''}</h3>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#081a3d' }}>{money(p.price)}<small style={{ fontSize: 13, fontWeight: 400 }}>{p.price === 0 ? '/forever' : '/month'}</small></p>
                <p>{p.desc}</p>
                <p style={{ marginTop: 8, fontSize: 13 }}>{p.sites} · {p.features[0]}</p>
                <div style={{ marginTop: 14 }}>
                  {p.price === 0
                    ? <a className="dash-btn ghost sm" href="/api/free-download">Download Free plugin</a>
                    : <Link className="dash-btn blue sm" href="/dashboard/billing">Get {p.name} — {money(p.price)}/mo</Link>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <div className="dash-card stat"><div className="s-label">License status</div><div className="s-num" style={{ fontSize: 22 }}>{data.customer.status}</div><div className="s-sub">{activeLicenses.length} active license{activeLicenses.length === 1 ? '' : 's'}</div></div>
          <div className="dash-card stat"><div className="s-label">Connected domain</div><div className="s-num" style={{ fontSize: 18 }}>{myLicense ? myLicense.domain : 'No domain connected'}</div><div className="s-sub">{myLicense ? `Plugin v${myLicense.version} installed` : 'Connect your site on the Licenses page'}</div></div>
          <div className="dash-card stat"><div className="s-label">Next payment</div><div className="s-num">{money(myPlan?.price || 0)}/mo</div><div className="s-sub">{hasActive ? `Via PayFast · ${data.customer.renews}` : 'Free plan — upgrade to unlock Pro'}</div></div>
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
              {myLicense ? (
                <>
                  <p>Your Pro license is active on <b>{myLicense.domain || 'no site connected yet'}</b>. Only stores with an active license receive plugin updates from WordPress.</p>
                  <div className="dash-license-key" style={{ marginTop: 14 }}><span>{myLicense.key}</span><span className="badge green">Active</span></div>
                </>
              ) : (
                <p>You have no active license yet. Start with the Free plugin, or pick a Pro plan above — your license is created automatically once PayFast confirms the payment.</p>
              )}
              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {myLicense
                  ? <><Link className="dash-btn blue sm" href="/dashboard/licenses">Manage license</Link><Link className="dash-btn ghost sm" href="/dashboard/downloads">Download Pro ZIP</Link></>
                  : <><a className="dash-btn blue sm" href="/api/free-download">Download Free plugin</a><Link className="dash-btn ghost sm" href="/dashboard/billing">See Pro pricing</Link></>}
              </div>
            </>
          )}
        </div>
        <div className="dash-card">
          <div className="card-head"><h3>{isAdmin ? 'Latest plugin version' : hasActive ? 'Latest plugin version' : 'Free plugin'}</h3><Link href="/dashboard/downloads">Downloads →</Link></div>
          {hasActive || isAdmin ? (
            data.versions.filter((v) => v.current).map((v) => (
              <div key={v.version}>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#081a3d', margin: '0 0 4px' }}>v{v.version} <span className="badge blue">Current</span></p>
                <p>{v.notes}</p>
                <p style={{ marginTop: 10 }}>Released {v.date} · {v.size} · {v.file}</p>
                <div style={{ marginTop: 16 }}><Link className="dash-btn navy sm" href="/dashboard/downloads">{isAdmin ? 'Manage versions' : 'Download v' + v.version}</Link></div>
              </div>
            ))
          ) : (
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#081a3d', margin: '0 0 4px' }}>Free v{freeV.version} <span className="badge blue">Current</span></p>
              <p>{freeV.notes}</p>
              <p style={{ marginTop: 10 }}>Released {freeV.date} · {freeV.size} · {freeV.file}</p>
              <div style={{ marginTop: 16 }}><a className="dash-btn navy sm" href="/api/free-download">Download Free v{freeV.version}</a></div>
            </div>
          )}
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
