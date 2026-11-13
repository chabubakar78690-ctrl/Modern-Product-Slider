import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  Key,
  Globe,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  RotateCcw,
  BarChart3,
  Activity,
  Download,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('users'); // users | reports | logs
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/overview');
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const runAdminAction = async (payload) => {
    const res = await fetch('/api/v1/admin/overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setData(json);
  };

  const exportCsv = () => {
    if (!data?.users) return;
    const headers = ['ID', 'Name', 'Email', 'Provider', 'Plan', 'Monthly Price', 'API Key', 'Active Sites', 'Status'];
    const rows = data.users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.provider,
      u.planName,
      u.price,
      u.apiKey || 'None',
      (u.activeSites || []).join(' | '),
      u.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modern-product-slider-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading && !data) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading Admin Control Center...
      </div>
    );
  }

  const metrics = data?.metrics || { totalUsers: 0, proSubscribers: 0, mrr: 0, totalActiveDomains: 0 };
  const users = (data?.users || []).filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.apiKey || '').toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'all' || u.planId === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Super Admin Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Users, Licenses &amp; Revenue Reports
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOverview}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Users CSV
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">${metrics.mrr}</div>
          <span className="text-xs text-emerald-400 mt-1 block">Active Pro subscriptions</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics.totalUsers}</div>
          <span className="text-xs text-slate-400 mt-1 block">Google &amp; Gmail OTP accounts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Paid Pro Licenses</span>
            <Key className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics.proSubscribers}</div>
          <span className="text-xs text-slate-400 mt-1 block">$3 Single &amp; $10 Unlimited</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Connected WP Sites</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics.totalActiveDomains}</div>
          <span className="text-xs text-slate-400 mt-1 block">Live WordPress domains</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'users', label: 'Users & License Manager', icon: Users },
          { id: 'reports', label: 'Revenue & Sales Reports', icon: BarChart3 },
          { id: 'logs', label: 'Live API & Security Logs', icon: Activity },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition ${
                tab === item.id
                  ? 'bg-sky-400 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {item.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: USERS & LICENSE MANAGER */}
      {tab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user name, Gmail, or API key..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>
            <div className="flex items-center gap-2">
              {['all', 'unlimited', 'single', 'free'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                    planFilter === p
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Plan &amp; Billing</th>
                  <th className="py-3.5 px-4">API License Key</th>
                  <th className="py-3.5 px-4">Active WP Domains</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {users.map((u) => (
                  <tr key={u.email} className="hover:bg-slate-800/30">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {u.name}
                        {u.role === 'admin' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400">{u.email}</div>
                      <span className="text-[10px] text-slate-500 uppercase">
                        via {u.provider}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={u.planId}
                        onChange={(e) =>
                          runAdminAction({ action: 'change_plan', email: u.email, planId: e.target.value })
                        }
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                      >
                        <option value="free">Free ($0/mo)</option>
                        <option value="single">Single Site ($3/mo)</option>
                        <option value="unlimited">Unlimited Sites ($10/mo)</option>
                      </select>
                    </td>

                    <td className="py-4 px-4">
                      {u.apiKey ? (
                        <code className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-sky-300 font-mono">
                          {u.apiKey}
                        </code>
                      ) : (
                        <span className="text-slate-500">No Pro key</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {u.activeSites && u.activeSites.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {u.activeSites.map((domain) => (
                            <span
                              key={domain}
                              className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300"
                            >
                              {domain}
                              <button
                                onClick={() =>
                                  runAdminAction({ action: 'remove_site', email: u.email, domain })
                                }
                                title="Release domain"
                                className="text-slate-500 hover:text-rose-400 ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">0 sites bound</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <ShieldAlert className="w-3 h-3" />
                        )}
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => runAdminAction({ action: 'reset_sites', email: u.email })}
                          title="Reset All Bound Domains"
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-400 text-slate-300"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => runAdminAction({ action: 'toggle_status', email: u.email })}
                          title={u.status === 'active' ? 'Suspend License' : 'Activate License'}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400 text-[11px] font-semibold text-slate-200"
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => runAdminAction({ action: 'delete_user', email: u.email })}
                            title="Delete User"
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500 text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REVENUE & SALES REPORTS */}
      {tab === 'reports' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Recent Subscription Invoices</h3>
              <span className="text-xs text-emerald-400 font-bold">Total MRR: ${metrics.mrr}/mo</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(data?.transactions || []).map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3.5 px-4 font-mono text-sky-300">{tx.id}</td>
                    <td className="py-3.5 px-4 text-white">{tx.email}</td>
                    <td className="py-3.5 px-4 text-slate-300">{tx.plan}</td>
                    <td className="py-3.5 px-4 text-slate-400">{tx.method}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">${tx.amount}.00</td>
                    <td className="py-3.5 px-4 text-slate-400">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-white text-sm">Plan Distribution Breakdown</h3>
            {['unlimited', 'single', 'free'].map((planKey) => {
              const count = (data?.users || []).filter((u) => u.planId === planKey).length;
              const pct = metrics.totalUsers ? Math.round((count / metrics.totalUsers) * 100) : 0;
              const label =
                planKey === 'unlimited'
                  ? 'Unlimited Sites ($10/mo)'
                  : planKey === 'single'
                  ? 'Single Site ($3/mo)'
                  : 'Free Edition ($0/mo)';
              return (
                <div key={planKey} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{label}</span>
                    <span className="text-white font-bold">
                      {count} users ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE API & SECURITY LOGS */}
      {tab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-white text-sm mb-3">
            Real-Time WordPress API &amp; Authentication Audit Stream
          </h3>
          {(data?.logs || []).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    log.ok ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <strong className="text-white">{log.event}</strong>
                <span className="text-slate-400 font-mono">{log.detail}</span>
              </div>
              <span className="text-slate-500">{log.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
