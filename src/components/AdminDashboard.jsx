import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  KeyRound,
  Globe2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  BarChart3,
  Activity,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Plus,
  CreditCard,
  Smartphone,
  Building2,
  Landmark,
  BadgeCheck,
  Copy,
  Check,
  Server,
  Layers,
  Calendar,
  Lock,
  ExternalLink,
  BookOpen,
  Mail,
  Key,
} from 'lucide-react';

export default function AdminDashboard({ isDark = true }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('analytics'); // analytics | accounts | apis | credentials | transactions | logs | new_user
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState('');

  // Add API Form Modal State
  const [isAddApiOpen, setIsAddApiOpen] = useState(false);
  const [apiName, setApiName] = useState('');
  const [apiService, setApiService] = useState('Google Identity / OAuth');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiEnv, setApiEnv] = useState('production');

  // Manual License Form State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPlan, setNewPlan] = useState('unlimited');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Mastercard / Visa 3D Secure');

  // Admin Credentials Update State
  const [adminEmail, setAdminEmail] = useState('admin@modernproductslider.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [credStatus, setCredStatus] = useState('');
  const [credError, setCredError] = useState('');
  const [credLoading, setCredLoading] = useState(false);

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

  const fetchAdminCredentials = async () => {
    try {
      const res = await fetch('/api/v1/admin/credentials');
      const json = await res.json();
      if (json.adminEmail) {
        setAdminEmail(json.adminEmail);
        setNewAdminEmail(json.adminEmail);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchAdminCredentials();
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

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleCreateManualUser = async (e) => {
    e.preventDefault();
    if (!newEmail) return;
    await runAdminAction({
      action: 'create_or_upgrade',
      email: newEmail,
      name: newName,
      planId: newPlan,
      paymentMethod: newPaymentMethod,
    });
    setNewEmail('');
    setNewName('');
    setTab('accounts');
  };

  const handleAddApiSubmit = async (e) => {
    e.preventDefault();
    if (!apiName || !apiKeyValue) return;
    await runAdminAction({
      action: 'add_api',
      apiName,
      apiService,
      apiKey: apiKeyValue,
      environment: apiEnv,
    });
    setApiName('');
    setApiKeyValue('');
    setIsAddApiOpen(false);
  };

  const handleDeleteApi = async (apiId) => {
    if (window.confirm('Are you sure you want to revoke this API integration?')) {
      await runAdminAction({ action: 'delete_api', apiId });
    }
  };

  // Request Confirmation Code for Admin Email Change
  const handleRequestAdminCode = async () => {
    setCredLoading(true);
    setCredError('');
    setCredStatus('');
    try {
      const res = await fetch('/api/v1/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_code',
          newEmail: newAdminEmail || adminEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCredError(json.error || 'Failed to send confirmation code.');
        return;
      }
      setCodeSent(true);
      setOtpToken(json.otpToken || '');
      setPreviewCode(json.previewCode || '');
      setCredStatus(`Confirmation code sent to ${newAdminEmail || adminEmail}. Enter the code below to save.`);
    } catch {
      setCredError('Network error requesting confirmation code.');
    } finally {
      setCredLoading(false);
    }
  };

  // Submit Admin Email & Password Change
  const handleUpdateAdminCredentials = async (e) => {
    e.preventDefault();
    setCredLoading(true);
    setCredError('');
    setCredStatus('');
    try {
      const res = await fetch('/api/v1/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_credentials',
          currentPassword,
          newEmail: newAdminEmail,
          newPassword,
          confirmCode,
          otpToken,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCredError(json.error || 'Failed to update admin credentials.');
        return;
      }
      setAdminEmail(json.adminEmail);
      setCredStatus('✓ Super Admin Email & Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmCode('');
      setCodeSent(false);
      setPreviewCode('');
      fetchOverview();
    } catch {
      setCredError('Network error updating credentials.');
    } finally {
      setCredLoading(false);
    }
  };

  const exportCsv = () => {
    if (!data?.users) return;
    const headers = ['Account ID', 'Name', 'Email', 'Auth Provider', 'Plan', 'Price USD', 'API License Key', 'Connected Domains Count', 'Connected Domains List', 'Created Timestamp', 'Status'];
    const rows = data.users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.provider,
      u.planName,
      u.price,
      u.apiKey || 'None',
      (u.activeSites || []).length,
      (u.activeSites || []).join(' ; '),
      u.createdAt || 'N/A',
      u.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modern-product-slider-account-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading && !data) {
    return (
      <div className={`py-24 text-center text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-sky-400" />
        Loading Super Admin Operations &amp; Reports...
      </div>
    );
  }

  const metrics = data?.metrics || { totalUsers: 0, proSubscribers: 0, mrr: 0, totalActiveDomains: 0 };
  const mrrPkr = (metrics.mrr || 0) * 280;
  const analytics = data?.analyticsReports || {
    dailyRequests: [],
    geographicDistribution: [],
    domainConnectionsTotal: metrics.totalActiveDomains,
    avgResponseLatencyMs: 42,
    apiUptime: '99.99%',
  };

  const users = (data?.users || []).filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.apiKey || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.activeSites || []).some((d) => d.toLowerCase().includes(search.toLowerCase()));
    const matchesPlan = planFilter === 'all' || u.planId === planFilter;
    return matchesSearch && matchesPlan;
  });

  const transactions = (data?.transactions || []).filter((t) => {
    if (methodFilter === 'all') return true;
    return (t.method || '').toLowerCase().includes(methodFilter.toLowerCase());
  });

  const externalApis = data?.externalApis || [];

  return (
    <div className="space-y-7">
      {/* Super Admin Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 inline-flex items-center gap-1.5 mb-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Portal &bull; Enterprise Management
          </span>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Operations, APIs &amp; Reports
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Live monitoring of account activations, WooCommerce domains, Google Auth keys, and multi-gateway billing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddApiOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white text-xs font-bold flex items-center gap-1.5 shadow-md border border-[#2555A8] hover:from-[#102750] hover:to-[#2458AD] transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add API
          </button>
          <button
            onClick={() => setTab('new_user')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
          >
            <KeyRound className="w-3.5 h-3.5" /> Issue License
          </button>
          <button
            onClick={fetchOverview}
            title="Refresh Data"
            className={`p-2 rounded-xl border text-xs transition ${
              isDark
                ? 'bg-[#071126] border-[#14284F] text-slate-300 hover:bg-[#0C1E3D]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          </button>
          <button
            onClick={exportCsv}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              isDark
                ? 'bg-[#071126] border-[#14284F] text-slate-200 hover:bg-[#0C1E3D]'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-sky-400" /> Export Reports
          </button>
        </div>
      </div>

      {/* KPI Stats Section with distinct mixed colors */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Monthly Recurring Revenue */}
        <div className={`p-4 rounded-2xl border transition ${isDark ? 'bg-[#0C1E3D] border-[#1E4078]' : 'bg-gradient-to-br from-[#0C1E3D] to-[#142F60] text-white shadow-md'}`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span>Monthly Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${metrics.mrr}<span className="text-xs text-slate-300 font-normal">/mo</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            ~₨ {mrrPkr.toLocaleString()} PKR / month
          </span>
        </div>

        {/* Card 2: Total Accounts */}
        <div className={`p-4 rounded-2xl border transition ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Total Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {metrics.totalUsers}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Super Admin &amp; Pro Accounts
          </span>
        </div>

        {/* Card 3: Pro Subscribers */}
        <div className={`p-4 rounded-2xl border transition ${isDark ? 'bg-[#0A1835] border-[#16336B]' : 'bg-[#EDF4FF] border-[#BFD7FE] shadow-sm'}`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Pro Subscribers</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#0C1E3D]'}`}>
            {metrics.proSubscribers}
          </div>
          <span className="text-[11px] text-sky-500 font-semibold mt-1 block">
            {metrics.totalUsers > 0 ? Math.round((metrics.proSubscribers / metrics.totalUsers) * 100) : 0}% paying ratio
          </span>
        </div>

        {/* Card 4: Connected Domains */}
        <div className={`p-4 rounded-2xl border transition ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-[#F0FDF4] border-[#BBF7D0] shadow-sm'}`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className={isDark ? 'text-slate-400' : 'text-emerald-800'}>Connected Stores</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-emerald-950'}`}>
            {metrics.totalActiveDomains}
          </div>
          <span className={`text-[11px] font-semibold mt-1 block ${isDark ? 'text-slate-400' : 'text-emerald-700'}`}>
            Active WooCommerce Domains
          </span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className={`flex flex-wrap items-center gap-2 border-b pb-2 ${isDark ? 'border-[#14284F]' : 'border-slate-200'}`}>
        <button
          onClick={() => setTab('analytics')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'analytics'
              ? 'bg-[#0C1E3D] text-white shadow-md border border-[#1E488F]'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-sky-400" /> Analytics &amp; Performance
        </button>
        <button
          onClick={() => setTab('accounts')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'accounts'
              ? 'bg-[#0C1E3D] text-white shadow-md border border-[#1E488F]'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-sky-400" /> Account Reports &amp; Domains ({users.length})
        </button>
        <button
          onClick={() => setTab('apis')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'apis'
              ? 'bg-[#0C1E3D] text-white shadow-md border border-[#1E488F]'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-amber-400" /> API Keys &amp; Google/Cloudflare ({externalApis.length})
        </button>
        <button
          onClick={() => setTab('credentials')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'credentials'
              ? 'bg-[#0C1E3D] text-white shadow-md border border-[#1E488F]'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" /> Admin Email &amp; Password
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'transactions'
              ? 'bg-[#0C1E3D] text-white shadow-md border border-[#1E488F]'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Platform Payments ({transactions.length})
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            tab === 'logs'
              ? 'bg-[#0C1E3D] text-white shadow-md border border-[#1E488F]'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-black'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-purple-400" /> Security Logs
        </button>
      </div>

      {/* TAB 1: ANALYTICS DASHBOARD */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          {/* Chart Section */}
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Daily License Verification Requests (Last 7 Days)
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Live requests from WooCommerce WordPress plugins verifying 3D slider keys.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Verified
                </span>
                <span className="flex items-center gap-1.5 font-bold text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Blocked
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="grid grid-cols-7 gap-3 sm:gap-4 items-end h-44 pt-6 border-b border-slate-700/40 pb-4">
              {analytics.dailyRequests.map((d) => {
                const heightPct = Math.round((d.requests / 11000) * 100);
                return (
                  <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition text-sky-400">
                      {d.requests.toLocaleString()}
                    </div>
                    <div className="w-full max-w-[38px] rounded-xl overflow-hidden bg-slate-800/80 flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                      <div className="bg-gradient-to-t from-[#0C1E3D] to-[#1E488F] w-full h-full rounded-t-lg group-hover:to-sky-400 transition"></div>
                    </div>
                    <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{d.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 text-xs">
              <div className="text-center">
                <span className="text-slate-400 block mb-0.5">Average API Latency</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">~{analytics.avgResponseLatencyMs} ms</span>
              </div>
              <div className="text-center">
                <span className="text-slate-400 block mb-0.5">Cloud System Uptime</span>
                <span className="font-mono font-bold text-sky-400 text-sm">{analytics.apiUptime}</span>
              </div>
              <div className="text-center">
                <span className="text-slate-400 block mb-0.5">Total Verification Pings</span>
                <span className="font-mono font-bold text-white text-sm">51,510 / wk</span>
              </div>
            </div>
          </div>

          {/* Geographic Breakdown Box */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className={`text-sm font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Geographic Traffic Breakdown
              </h3>
              <div className="space-y-3">
                {analytics.geographicDistribution.map((g) => (
                  <div key={g.country} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{g.country}</span>
                      <span className="text-sky-400 font-mono">{g.percentage}</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] h-full rounded-full" style={{ width: g.percentage }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-[#0A162F] border-[#183160]' : 'bg-[#EDF3FC] border-[#BFD7FE] shadow-sm'}`}>
              <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0C1E3D]'}`}>
                Domain Verification Health
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                All licensed WooCommerce stores are actively monitored with automatic fraud detection. Each domain ping validates cryptographic license HMAC signatures.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200'}`}>
                  <span className="text-slate-400 text-[11px] block">Live Connected Domains</span>
                  <span className="text-xl font-black text-emerald-400">{metrics.totalActiveDomains}</span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200'}`}>
                  <span className="text-slate-400 text-[11px] block">Security Violations</span>
                  <span className="text-xl font-black text-slate-300">0 Reported</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT CREATED REPORTS & CONNECTED DOMAINS */}
      {tab === 'accounts' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by account email, name, domain, or license key..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs transition focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${
                  isDark
                    ? 'bg-[#071126] border-[#14284F] text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {['all', 'single', 'unlimited', 'free'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize transition border text-xs ${
                    planFilter === p
                      ? 'bg-[#0C1E3D] text-white border-[#1E488F] shadow-sm'
                      : isDark
                      ? 'bg-[#071126] border-[#14284F] text-slate-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-black'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts & Domains Table */}
          <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold ${isDark ? 'border-[#14284F] bg-[#050D1A] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                    <th className="py-3 px-4">Account &amp; Created Date</th>
                    <th className="py-3 px-4">Plan &amp; Provider</th>
                    <th className="py-3 px-4">Pro License Key</th>
                    <th className="py-3 px-4">Connected Stores (Each Account)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#102244]' : 'divide-slate-100'}`}>
                  {users.map((u) => (
                    <tr key={u.email} className={`transition ${isDark ? 'hover:bg-[#0A162F]' : 'hover:bg-slate-50'}`}>
                      {/* Account & Created Date */}
                      <td className="py-3.5 px-4">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.name || 'Store Owner'}</div>
                        <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>{u.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                        </div>
                      </td>

                      {/* Plan & Provider */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold block">{u.planName}</span>
                        <span className="text-[11px] text-sky-400 font-medium block">{u.provider}</span>
                        <span className="text-[10px] text-slate-400">${u.price}/mo (~₨ {(u.price * 280).toLocaleString()} PKR)</span>
                      </td>

                      {/* Pro License Key */}
                      <td className="py-3.5 px-4 font-mono">
                        {u.apiKey ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-1 rounded-md text-[11px] font-mono ${isDark ? 'bg-[#050D1A] text-sky-300 border border-[#14284F]' : 'bg-slate-100 text-sky-800'}`}>
                              {u.apiKey.slice(0, 16)}...
                            </span>
                            <button
                              onClick={() => handleCopy(u.apiKey, u.email)}
                              title="Copy License Key"
                              className="text-slate-400 hover:text-white transition"
                            >
                              {copiedKey === u.email ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No key (Free)</span>
                        )}
                      </td>

                      {/* Connected Domains for this account */}
                      <td className="py-3.5 px-4">
                        {(u.activeSites || []).length > 0 ? (
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block mb-1">
                              {(u.activeSites || []).length} {u.maxSites === -1 ? '/ Unlimited' : `/ ${u.maxSites}`} Active:
                            </span>
                            {u.activeSites.map((d) => (
                              <div key={d} className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? 'bg-[#050D1A] border-[#14284F] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                                  {d}
                                </span>
                                <button
                                  onClick={() => runAdminAction({ action: 'remove_site', email: u.email, domain: d })}
                                  title="Disconnect this domain from account"
                                  className="text-rose-400 hover:underline text-[10px]"
                                >
                                  Disconnect
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">0 connected domains</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            u.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {u.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {u.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={u.planId}
                            onChange={(e) => runAdminAction({ action: 'change_plan', email: u.email, planId: e.target.value })}
                            className={`py-1 px-2 rounded-lg text-[11px] font-bold border ${isDark ? 'bg-[#050D1A] border-[#14284F] text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                          >
                            <option value="free">Free</option>
                            <option value="single">Single ($3/mo)</option>
                            <option value="unlimited">Unlimited ($10/mo)</option>
                          </select>

                          <button
                            onClick={() => runAdminAction({ action: 'toggle_status', email: u.email })}
                            title={u.status === 'active' ? 'Suspend License' : 'Activate License'}
                            className={`p-1.5 rounded-lg border ${
                              u.status === 'active'
                                ? 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                                : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete account and all licenses for ${u.email}?`)) {
                                runAdminAction({ action: 'delete_user', email: u.email });
                              }
                            }}
                            title="Delete Account"
                            className="p-1.5 rounded-lg text-rose-400 border border-rose-500/30 hover:bg-rose-500/10"
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

      {/* TAB 3: API KEYS & GOOGLE AUTH & CLOUDFLARE SETUP GUIDES */}
      {tab === 'apis' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Cloud APIs &amp; Third-Party Integrations
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Manage Google Identity OAuth 2.0, Cloudflare API, Stripe Mastercard, and WooCommerce webhooks.
              </p>
            </div>
            <button
              onClick={() => setIsAddApiOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white text-xs font-bold flex items-center gap-1.5 shadow-md border border-[#2555A8]"
            >
              <Plus className="w-3.5 h-3.5" /> Add New API
            </button>
          </div>

          {/* Active APIs Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {externalApis.map((api) => (
              <div
                key={api.id}
                className={`p-5 rounded-3xl border transition space-y-3 ${
                  isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0C1E3D] border border-[#1E488F] text-sky-400 flex items-center justify-center">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{api.name}</h4>
                      <span className="text-[10px] text-slate-400">{api.service}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    {api.status}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border font-mono text-[11px] flex items-center justify-between ${isDark ? 'bg-[#050D1A] border-[#102244] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                  <span className="truncate">{api.keyMasked}</span>
                  <button
                    onClick={() => handleCopy(api.keyMasked, api.id)}
                    className="text-slate-400 hover:text-white shrink-0 ml-2"
                  >
                    {copiedKey === api.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {api.environment}
                  </span>
                  <button
                    onClick={() => handleDeleteApi(api.id)}
                    className="text-rose-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3 h-3" /> Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* STEP-BY-STEP GUIDES ACCORDION SECTION */}
          <div className="grid md:grid-cols-2 gap-5 pt-4">
            {/* Guide 1: Google Cloud Console OAuth Setup */}
            <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                </svg>
                <h4 className="font-bold text-sm">Google Cloud Console Setup Guide</h4>
              </div>

              <div className="text-xs space-y-2.5 text-slate-300">
                <p>1. Open <strong>Google Cloud Console</strong> at <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">console.cloud.google.com</a>.</p>
                <p>2. Create a project and go to <strong>APIs &amp; Services &rarr; OAuth Consent Screen</strong>.</p>
                <p>3. Choose <strong>External</strong> and enter your App Name: <em>Modern Product Slider</em>.</p>
                <p>4. Go to <strong>Credentials &rarr; Create Credentials &rarr; OAuth Client ID</strong>:</p>
                <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1.5 ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-slate-50 border-slate-200'}`}>
                  <div><strong>Application Type:</strong> Web Application</div>
                  <div className="flex items-center justify-between">
                    <span className="truncate"><strong>Authorized Origin:</strong> https://modern-product-slider.vercel.app</span>
                    <button type="button" onClick={() => handleCopy('https://modern-product-slider.vercel.app', 'origin')} className="text-sky-400 hover:underline shrink-0 ml-2">
                      {copiedKey === 'origin' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="truncate"><strong>Redirect URI:</strong> https://modern-product-slider.vercel.app/api/v1/auth/google</span>
                    <button type="button" onClick={() => handleCopy('https://modern-product-slider.vercel.app/api/v1/auth/google', 'redirect')} className="text-sky-400 hover:underline shrink-0 ml-2">
                      {copiedKey === 'redirect' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <p>5. Copy your <strong>Client ID</strong> and <strong>Client Secret</strong>. Paste them in the <strong>Add API</strong> button above or into your Vercel Environment Variables.</p>
              </div>
            </div>

            {/* Guide 2: Cloudflare API & Turnstile Setup */}
            <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm">Cloudflare Turnstile &amp; API Guide</h4>
              </div>

              <div className="text-xs space-y-2.5 text-slate-300">
                <p>1. Sign in to <strong>Cloudflare Dashboard</strong> at <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">dash.cloudflare.com</a>.</p>
                <p>2. Navigate to <strong>Turnstile</strong> in the sidebar &rarr; <strong>Add Site</strong>.</p>
                <p>3. Domain Name: <code>modern-product-slider.vercel.app</code>.</p>
                <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1.5 ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-slate-50 border-slate-200'}`}>
                  <div><strong>Widget Mode:</strong> Managed (Zero friction invisible challenge)</div>
                  <div><strong>Site Key:</strong> Public widget key for bot prevention</div>
                  <div><strong>Secret Key:</strong> Server verification secret</div>
                </div>
                <p>4. For DNS/Edge caching API, go to <strong>My Profile &rarr; API Tokens &rarr; Create Token</strong>.</p>
                <p>5. Click <strong>Add New API</strong> above, select <em>Cloudflare API</em>, and paste your Secret Token.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPER ADMIN EMAIL & PASSWORD MANAGEMENT (CONFIRM EMAIL WITH CODE) */}
      {tab === 'credentials' && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Super Admin Email &amp; Password Security
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Change your permanent Super Admin login email and password. Email changes require a 6-digit verification code to confirm ownership.
            </p>
          </div>

          {credStatus && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {credStatus}
            </div>
          )}

          {credError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {credError}
            </div>
          )}

          <form
            onSubmit={handleUpdateAdminCredentials}
            className={`p-7 rounded-3xl border space-y-5 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            {/* Current Email Display */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Current Super Admin Email</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  value={adminEmail}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono opacity-80 ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-100 border-slate-300 text-slate-800'}`}
                />
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase shrink-0">
                  Fixed Admin
                </span>
              </div>
            </div>

            {/* Change Email */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">New Super Admin Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@modernproductslider.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
                <button
                  type="button"
                  onClick={handleRequestAdminCode}
                  disabled={credLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white text-xs font-bold shrink-0 border border-[#2555A8] transition"
                >
                  {credLoading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Click "Send Code" to send a 6-digit confirmation code to this email.
              </span>
            </div>

            {/* Confirmation Code Input */}
            {codeSent && (
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">6-Digit Email Confirmation Code</label>
                <input
                  type="text"
                  required
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
            )}

            {/* Change Password */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">Current Admin Password (Required)</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Default: Admin@MPS2026!</span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">New Password (Min 6 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={credLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white font-black text-xs shadow-md border border-[#2555A8] transition active:scale-98"
            >
              {credLoading ? 'Saving Changes...' : 'Confirm Code & Update Admin Credentials'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: PLATFORM PAYMENTS & TRANSACTIONS */}
      {tab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Platform Gateway:</span>
            {['all', 'mastercard', 'bank', 'google', 'jazzcash', 'easypaisa', 'sadapay'].map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1 rounded-xl border text-xs font-bold capitalize transition ${
                  methodFilter === m
                    ? 'bg-[#0C1E3D] text-white border-[#1E488F]'
                    : isDark
                    ? 'bg-[#071126] border-[#14284F] text-slate-400'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b font-bold ${isDark ? 'border-[#14284F] bg-[#050D1A] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  <th className="py-3 px-4">TXN ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Tier Plan</th>
                  <th className="py-3 px-4">Amount USD &amp; PKR</th>
                  <th className="py-3 px-4">Payment Platform</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#102244]' : 'divide-slate-100'}`}>
                {transactions.map((t) => (
                  <tr key={t.id} className={isDark ? 'hover:bg-[#0A162F]' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{t.id}</td>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.email}</td>
                    <td className="py-3 px-4">{t.plan}</td>
                    <td className="py-3 px-4 font-black">
                      ${t.amount}.00 <span className="text-[11px] font-normal text-emerald-400">(~₨ {(t.amount * 280).toLocaleString()} PKR)</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-300">{t.method}</td>
                    <td className="py-3 px-4 text-slate-400">{t.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & AUDIT LOGS */}
      {tab === 'logs' && (
        <div className={`rounded-3xl border p-4 space-y-2 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
          {(data?.logs || []).map((l) => (
            <div
              key={l.id}
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                isDark ? 'bg-[#050D1A] border-[#102244] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${l.ok ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-400'}`} />
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{l.event}</span>
                <span className="text-slate-400 truncate max-w-md">{l.detail}</span>
              </div>
              <span className="text-[11px] text-slate-500 shrink-0">{l.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: MANUAL LICENSE ISSUE FORM */}
      {tab === 'new_user' && (
        <form
          onSubmit={handleCreateManualUser}
          className={`max-w-xl p-7 rounded-3xl border space-y-4 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}
        >
          <div>
            <h3 className="text-lg font-black">Issue Pro License Key Manually</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Creates customer record, generates encrypted Pro API key, and adds to account reports.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Customer Email</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="client@store.com"
              className={`w-full px-3.5 py-2 rounded-xl border text-xs ${
                isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Store Owner Name (Optional)</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Store Owner"
              className={`w-full px-3.5 py-2 rounded-xl border text-xs ${
                isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">License Tier</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="single">Single Site ($3/mo)</option>
                <option value="unlimited">Unlimited Sites ($10/mo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Payment Platform</label>
              <select
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="Mastercard / Visa 3D Secure">Mastercard / Visa</option>
                <option value="Direct Bank Transfer (Raast/IBAN)">Bank Transfer (Raast / IBAN)</option>
                <option value="Google ID Payment">Google ID / Pay</option>
                <option value="SadaPay / Card">SadaPay Card</option>
                <option value="JazzCash Direct">JazzCash Wallet</option>
                <option value="EasyPaisa Direct">EasyPaisa Wallet</option>
                <option value="Founder Complimentary">Founder Complimentary</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white font-black text-xs shadow-md border border-[#2555A8] transition active:scale-98"
          >
            Generate &amp; Issue Pro Key
          </button>
        </form>
      )}

      {/* MODAL: ADD API INTEGRATION */}
      {isAddApiOpen && (
        <div className="fixed inset-0 z-50 bg-[#050D1A]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl border shadow-2xl p-6 space-y-4 ${isDark ? 'bg-[#071126] border-[#14284F] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-400" /> Add Cloud API Integration
              </h3>
              <button onClick={() => setIsAddApiOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddApiSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-slate-300">API Title / Label</label>
                <input
                  type="text"
                  required
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                  placeholder="e.g. Google OAuth Client ID or Cloudflare Turnstile"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1 text-slate-300">Service Category</label>
                <select
                  value={apiService}
                  onChange={(e) => setApiService(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="Google Identity / OAuth">Google Identity / OAuth 2.0</option>
                  <option value="Cloudflare API / Turnstile">Cloudflare API / Turnstile Bot Defense</option>
                  <option value="Payment Gateway (Mastercard/Stripe)">Payment Gateway (Mastercard/Stripe)</option>
                  <option value="Pakistani Bank Raast / 1Link">Pakistani Bank Raast / 1Link</option>
                  <option value="WooCommerce Cloud Webhook">WooCommerce Cloud Webhook</option>
                  <option value="Custom Licensing Key">Custom Licensing Key</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1 text-slate-300">API Key / Secret Token</label>
                <input
                  type="text"
                  required
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  placeholder="Paste API key or secret token"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddApiOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white text-xs font-bold border border-[#2555A8]"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
