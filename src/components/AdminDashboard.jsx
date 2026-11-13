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
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ChevronDown,
} from 'lucide-react';

export default function AdminDashboard({ isDark = true }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('users'); // users | transactions | logs
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
      <div className={`py-24 text-center text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-sky-500" />
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
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 inline-flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Portal
          </span>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Licenses &amp; Revenue Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-500" /> Refresh
          </button>
          <button
            onClick={exportCsv}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-sky-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* Real-time KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div
          className={`p-5 rounded-2xl border transition ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ${metrics.mrr}
            <span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">
            {metrics.proSubscribers} active paid tiers
          </span>
        </div>

        {/* Total Customers */}
        <div
          className={`p-5 rounded-2xl border transition ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {metrics.totalUsers}
          </div>
          <span className={`text-[11px] font-medium mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Google &amp; Gmail verified
          </span>
        </div>

        {/* Pro Ratio */}
        <div
          className={`p-5 rounded-2xl border transition ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Pro Subscribers</span>
            <Key className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {metrics.proSubscribers}
          </div>
          <span className="text-[11px] text-sky-500 font-semibold mt-1 block">
            {metrics.totalUsers > 0 ? Math.round((metrics.proSubscribers / metrics.totalUsers) * 100) : 0}% conversion rate
          </span>
        </div>

        {/* Active Domains */}
        <div
          className={`p-5 rounded-2xl border transition ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Connected Stores</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {metrics.totalActiveDomains}
          </div>
          <span className={`text-[11px] font-medium mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Live WooCommerce sites
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={`flex items-center gap-2 border-b pb-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'users'
              ? 'bg-sky-500 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> All Licenses ({users.length})
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'transactions'
              ? 'bg-sky-500 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Transactions ({data?.transactions?.length || 0})
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'logs'
              ? 'bg-sky-500 text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Security &amp; API Logs
        </button>
      </div>

      {/* TAB: USERS & LICENSES */}
      {tab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email, name, API key..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {['all', 'single', 'unlimited', 'free'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition border ${
                    planFilter === p
                      ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-black'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Plan &amp; Price</th>
                    <th className="py-3 px-4">API License Key</th>
                    <th className="py-3 px-4">Active Sites</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {users.map((u) => (
                    <tr key={u.email} className={`transition ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}>
                      <td className="py-3.5 px-4">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.name || 'Anonymous'}</div>
                        <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>{u.email}</div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{u.provider}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold block">{u.planName}</span>
                        <span className="text-slate-400">${u.price}/month</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {u.apiKey ? (
                          <span className={`px-2 py-1 rounded-md text-[11px] ${isDark ? 'bg-slate-950 text-sky-400 border border-slate-800' : 'bg-slate-100 text-sky-700'}`}>
                            {u.apiKey.slice(0, 15)}...
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No key (Free)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {(u.activeSites || []).length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {u.activeSites.map((d) => (
                              <div key={d} className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                  {d}
                                </span>
                                <button
                                  onClick={() => runAdminAction({ action: 'remove_site', email: u.email, domain: d })}
                                  title="Release Domain"
                                  className="text-rose-500 hover:underline text-[10px]"
                                >
                                  Release
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">0 attached</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            u.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                          }`}
                        >
                          {u.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Plan Switcher */}
                          <select
                            value={u.planId}
                            onChange={(e) => runAdminAction({ action: 'change_plan', email: u.email, planId: e.target.value })}
                            className={`py-1 px-2 rounded-lg text-[11px] font-bold border ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                          >
                            <option value="free">Free ($0)</option>
                            <option value="single">Single ($3/mo)</option>
                            <option value="unlimited">Unlimited ($10/mo)</option>
                          </select>

                          {/* Suspend Toggle */}
                          <button
                            onClick={() => runAdminAction({ action: 'toggle_status', email: u.email })}
                            title={u.status === 'active' ? 'Suspend License' : 'Activate License'}
                            className={`p-1.5 rounded-lg border ${
                              u.status === 'active'
                                ? 'text-amber-500 hover:bg-amber-500/10 border-amber-500/30'
                                : 'text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/30'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete account for ${u.email}?`)) {
                                runAdminAction({ action: 'delete_user', email: u.email });
                              }
                            }}
                            title="Delete User"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-rose-500/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TRANSACTIONS */}
      {tab === 'transactions' && (
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b font-bold ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <th className="py-3 px-4">TXN ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {(data?.transactions || []).map((t) => (
                <tr key={t.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}>
                  <td className="py-3 px-4 font-mono font-bold text-sky-500">{t.id}</td>
                  <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.email}</td>
                  <td className="py-3 px-4">{t.plan}</td>
                  <td className="py-3 px-4 font-black">${t.amount}.00</td>
                  <td className="py-3 px-4 text-slate-400">{t.method}</td>
                  <td className="py-3 px-4 text-slate-400">{t.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {tab === 'logs' && (
        <div
          className={`rounded-2xl border p-4 space-y-2 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {(data?.logs || []).map((l) => (
            <div
              key={l.id}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    l.ok ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'
                  }`}
                />
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{l.event}</span>
                <span className="text-slate-400 truncate max-w-md">{l.detail}</span>
              </div>
              <span className="text-[11px] text-slate-500 shrink-0">{l.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
