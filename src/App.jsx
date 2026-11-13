import React, { useState, useEffect } from 'react';
import {
  Key,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Globe,
  Plus,
  CreditCard,
  Layers,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Settings,
  Trash2,
  DollarSign,
  Users,
  BarChart3,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import BrandLogo from './components/BrandLogo.jsx';
import Sidebar from './components/Sidebar.jsx';
import AuthModal from './components/AuthModal.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';

const SESSION_KEY = 'mps_portal_session_v2';
const THEME_KEY = 'mps_theme_preference';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | analytics | licenses | domains | plans | transactions | admin | logs | docs | settings
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [copied, setCopied] = useState('');
  const [newDomainInput, setNewDomainInput] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Dual Theme Engine
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.className = 'bg-[#0B132B] text-slate-100 antialiased';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.className = 'bg-[#F8FAFC] text-slate-900 antialiased';
      }
    } catch {
      // ignore
    }
  }, [isDark]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveSession = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSelectTab = (tabId) => {
    if (tabId === 'login') {
      setAuthMode('login');
      setAuthOpen(true);
      return;
    }
    setActiveTab(tabId);
  };

  const handleBuyPlan = (planId) => {
    if (!user) {
      setSelectedPlan(planId);
      setAuthMode('signup');
      setAuthOpen(true);
    } else {
      setCheckoutPlan(planId);
    }
  };

  const handleAuthCompleted = (authedUser) => {
    saveSession(authedUser);
    setAuthOpen(false);
    if (selectedPlan) {
      setCheckoutPlan(selectedPlan);
      setSelectedPlan(null);
    } else if (authedUser.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('licenses');
    }
  };

  const handleRotateKey = async () => {
    if (!user) return;
    const res = await fetch('/api/v1/auth/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, rotateOnly: true }),
    });
    const data = await res.json();
    if (data.success) saveSession(data.user);
  };

  const handleAddDomain = (e) => {
    e.preventDefault();
    if (!newDomainInput.trim() || !user) return;
    const cleanDomain = newDomainInput.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    const current = user.activeSites || [];
    if (!current.includes(cleanDomain)) {
      const updated = { ...user, activeSites: [...current, cleanDomain] };
      saveSession(updated);
      setNewDomainInput('');
    }
  };

  const handleRemoveDomain = async (domain) => {
    if (!user) return;
    const updatedSites = (user.activeSites || []).filter((d) => d !== domain);
    const updated = { ...user, activeSites: updatedSites };
    saveSession(updated);
    try {
      await fetch('/api/v1/license/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: user.apiKey, site_url: domain }),
      });
    } catch {
      // ignore
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#0B132B] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Grouped Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        user={user}
        onSignOut={() => {
          saveSession(null);
          setActiveTab('overview');
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Dashboard Layout Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Header Bar */}
        <header
          className={`h-18 border-b px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors ${
            isDark ? 'border-slate-800/80 bg-[#0B132B]/90' : 'border-slate-200/90 bg-white/90 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base font-black tracking-tight capitalize">
              {activeTab === 'overview'
                ? 'Dashboard Overview'
                : activeTab === 'licenses'
                ? 'Pro License Key'
                : activeTab === 'domains'
                ? 'Connected Stores'
                : activeTab === 'plans'
                ? 'Pricing & Upgrades'
                : activeTab === 'transactions'
                ? 'Invoices & Receipts'
                : activeTab === 'admin'
                ? 'Super Admin Operations'
                : activeTab === 'logs'
                ? 'Audit Logs'
                : activeTab === 'docs'
                ? 'WordPress Setup Guide'
                : activeTab === 'analytics'
                ? 'Usage Analytics'
                : 'Account Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`px-3 py-1 rounded-full font-bold border ${
                    user.planId !== 'free'
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {user.planName}
                </span>
                {isAdmin && (
                  <span className="px-2.5 py-1 rounded-full font-black text-[10px] uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    Super Admin
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthOpen(true);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 transition active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Tab Content Panels */}
        <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div
                className={`p-8 rounded-3xl border relative overflow-hidden transition ${
                  isDark
                    ? 'bg-gradient-to-r from-[#111A36] to-[#0D152D] border-slate-800'
                    : 'bg-gradient-to-r from-sky-50 to-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="max-w-2xl">
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-500 block mb-1">
                    WooCommerce Pro License Cloud
                  </span>
                  <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Welcome to Modern Product Slider
                  </h1>
                  <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Manage your active WordPress domains, rotate your Pro API license key, and track live WooCommerce store activations in real time.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() => setActiveTab('licenses')}
                      className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold shadow-md shadow-sky-500/20 transition flex items-center gap-2"
                    >
                      <Key className="w-3.5 h-3.5" /> View License Key
                    </button>
                    <button
                      onClick={() => setActiveTab('plans')}
                      className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Active Plan</span>
                  <div className="text-xl font-black text-sky-500">{user?.planName || 'Free Edition'}</div>
                  <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {user?.planId === 'unlimited' ? 'Unlimited Sites Activated' : user?.planId === 'single' ? '1 WordPress Site Allowed' : 'Limited features'}
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Connected Stores</span>
                  <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {(user?.activeSites || []).length} {user?.maxSites === -1 ? '/ Unlimited' : user?.maxSites ? `/ ${user.maxSites}` : 'Domains'}
                  </div>
                  <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Active WooCommerce racks
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">License Health</span>
                  <div className="text-xl font-black text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" /> Active &amp; Valid
                  </div>
                  <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Cloud API synchronized
                  </span>
                </div>
              </div>

              {/* WordPress Integration Quick Guide */}
              <div className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  3-Step WordPress Store Activation:
                </h3>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold inline-flex items-center justify-center text-[11px] mb-2">1</span>
                    <p className="font-semibold">Copy your Pro API Key</p>
                    <p className="text-slate-400 text-[11px] mt-1">Navigate to the License tab and copy your personal license key.</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold inline-flex items-center justify-center text-[11px] mb-2">2</span>
                    <p className="font-semibold">Open WordPress Admin</p>
                    <p className="text-slate-400 text-[11px] mt-1">Go to Modern Slider &rarr; Pro Version inside your WP Admin.</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold inline-flex items-center justify-center text-[11px] mb-2">3</span>
                    <p className="font-semibold">Click Activate License</p>
                    <p className="text-slate-400 text-[11px] mt-1">Paste your key and activate instant 3D product showcase features.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LICENSES */}
          {activeTab === 'licenses' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Pro API License Key
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Use this key in your WordPress WooCommerce plugin to unlock unlimited 3D clothing racks and all Pro features.
                </p>
              </div>

              {user?.apiKey ? (
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-500">
                      Live API Key
                    </span>
                    <button
                      onClick={handleRotateKey}
                      className="text-xs inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-sky-500 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate Key
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className={`flex-1 border rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-mono break-all ${isDark ? 'bg-slate-950 border-slate-800 text-sky-400' : 'bg-slate-50 border-slate-200 text-sky-700'}`}>
                      {user.apiKey}
                    </code>
                    <button
                      onClick={() => handleCopy(user.apiKey)}
                      className="px-5 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shrink-0 shadow-md transition"
                    >
                      {copied === user.apiKey ? (
                        <>
                          <Check className="w-4 h-4" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Security Notice:</strong> Keep your API key confidential. If you believe your key has been compromised, click "Regenerate Key" to issue a new one immediately.
                  </div>
                </div>
              ) : (
                <div className={`p-10 rounded-3xl border text-center space-y-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <Key className="w-10 h-10 text-sky-500 mx-auto" />
                  <h3 className="text-lg font-bold">No Active Pro License Key Found</h3>
                  <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Upgrade to Single Site ($3/mo) or Unlimited Sites ($10/mo) to generate your Pro API key.
                  </p>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-6 py-3 rounded-xl bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-500/20"
                  >
                    View Upgrade Plans
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: DOMAINS */}
          {activeTab === 'domains' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Connected WordPress Stores
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Manage the WordPress domains authorized to use your Pro License.
                </p>
              </div>

              {/* Add Domain Form */}
              <form
                onSubmit={handleAddDomain}
                className={`p-6 rounded-3xl border flex flex-wrap items-center gap-3 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex-1 min-w-[240px]">
                  <input
                    type="text"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    placeholder="e.g. myboutique.com or store.mystyle.pk"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Attach Domain
                </button>
              </form>

              {/* Domain List */}
              <div
                className={`rounded-3xl border overflow-hidden ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className={`p-4 border-b font-bold text-xs flex justify-between ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                  <span>Domain</span>
                  <span>Action</span>
                </div>
                <div className={`divide-y text-xs ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {(user?.activeSites || []).length > 0 ? (
                    user.activeSites.map((d) => (
                      <div key={d} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 font-mono">
                          <Globe className="w-4 h-4 text-sky-500" />
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{d}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500">
                            Active
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveDomain(d)}
                          className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Release Domain
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs italic">
                      No domains attached yet. Enter your domain above or activate directly in WordPress.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLANS & PRICING */}
          {activeTab === 'plans' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Choose Your Pro License Plan
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Supports Google ID Payment, Pakistani Wallets (JazzCash/EasyPaisa/SadaPay), and International Cards.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Single Site $3/mo */}
                <div className={`p-8 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Single Store</span>
                    <div className="flex items-baseline gap-1 mt-2 mb-1">
                      <span className="text-4xl font-black text-sky-500">$3</span>
                      <span className="text-xs text-slate-400">/month</span>
                    </div>
                    <span className="text-xs font-bold text-sky-500 block mb-4">~₨ 850 PKR / month</span>
                    <ul className="space-y-2.5 text-xs mb-8">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> 1 WordPress Domain</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> Unlimited 3D Sliders</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> Unlimited Products Per Rack</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> 1-Click Domain Transfer</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleBuyPlan('single')}
                    className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition"
                  >
                    Select Single Site ($3/mo)
                  </button>
                </div>

                {/* Unlimited Sites $10/mo */}
                <div className={`p-8 rounded-3xl border-2 border-sky-500 relative flex flex-col justify-between ${isDark ? 'bg-slate-900/90 shadow-2xl shadow-sky-500/10' : 'bg-white shadow-xl shadow-sky-500/10'}`}>
                  <span className="absolute -top-3 right-6 bg-sky-500 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                    Best Value
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-sky-500">Unlimited Sites</span>
                    <div className="flex items-baseline gap-1 mt-2 mb-1">
                      <span className="text-4xl font-black text-sky-500">$10</span>
                      <span className="text-xs text-slate-400">/month</span>
                    </div>
                    <span className="text-xs font-bold text-sky-500 block mb-4">~₨ 2,800 PKR / month</span>
                    <ul className="space-y-2.5 text-xs mb-8">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> Unlimited WordPress Sites</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> Unlimited 3D Sliders</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> Unlimited Products Per Rack</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> Priority Developer Support</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleBuyPlan('unlimited')}
                    className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs shadow-lg shadow-sky-500/25 transition"
                  >
                    Select Unlimited Sites ($10/mo)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Billing History &amp; Receipts
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Official receipts and transaction logs for your subscription.
                </p>
              </div>

              <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b font-bold ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                      <th className="p-4">Invoice</th>
                      <th className="p-4">Tier</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    <tr className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      <td className="p-4 font-mono font-bold text-sky-500">INV-2026-01</td>
                      <td className="p-4">{user?.planName || 'Unlimited Sites ($10/mo)'}</td>
                      <td className="p-4 font-black">${user?.price || 10}.00</td>
                      <td className="p-4 text-slate-400">Google ID Payment</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-500">Paid</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ADMIN OPERATIONS */}
          {activeTab === 'admin' && isAdmin && <AdminDashboard isDark={isDark} />}

          {/* TAB: AUDIT LOGS */}
          {activeTab === 'logs' && isAdmin && (
            <div className="space-y-6 max-w-4xl">
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Security &amp; API Verification Logs
              </h2>
              <div className={`p-6 rounded-3xl border space-y-3 font-mono text-xs ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-emerald-500">✓ License Verified</span>
                  <span className="text-slate-400">modern-product-slider.vercel.app</span>
                  <span className="text-[11px] text-slate-500">Just now</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sky-500">ℹ Admin Signed In</span>
                  <span className="text-slate-400">admin@modernproductslider.com</span>
                  <span className="text-[11px] text-slate-500">3 mins ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-500">✓ Domain Connected</span>
                  <span className="text-slate-400">sarahstreetwear.com</span>
                  <span className="text-[11px] text-slate-500">1 hour ago</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WORDPRESS GUIDE */}
          {activeTab === 'docs' && (
            <div className="space-y-6 max-w-3xl">
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                WordPress Plugin Installation Guide
              </h2>
              <div className={`p-8 rounded-3xl border space-y-5 text-xs leading-relaxed ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                <h3 className="text-sm font-bold text-sky-500">Step 1: Install Plugin</h3>
                <p>Upload <code>modern-product-slider.zip</code> to your WordPress store under <strong>Plugins &rarr; Add New &rarr; Upload Plugin</strong>.</p>

                <h3 className="text-sm font-bold text-sky-500">Step 2: Activate License</h3>
                <p>Navigate to <strong>Modern Slider &rarr; Pro Version</strong> in your WordPress dashboard, enter your License Key, and click <strong>Activate</strong>.</p>

                <h3 className="text-sm font-bold text-sky-500">Step 3: Embed 3D Racks</h3>
                <p>Use shortcode <code>[modern_product_slider category="all"]</code> in any Elementor, Gutenberg, or page builder section.</p>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Account &amp; Security Settings
              </h2>
              <div className={`p-8 rounded-3xl border space-y-4 text-xs ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || 'Not signed in'}
                    className={`w-full px-4 py-2.5 rounded-xl border font-mono opacity-80 ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Account Role</label>
                  <input
                    type="text"
                    disabled
                    value={user?.role || 'Guest'}
                    className={`w-full px-4 py-2.5 rounded-xl border font-mono opacity-80 capitalize ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'}`}
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSettingsSaved(true);
                      setTimeout(() => setSettingsSaved(false), 2000);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold"
                  >
                    {settingsSaved ? 'Saved!' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Clean Professional Footer (Removed Cloud API 99.99% and SSL spam) */}
        <footer
          className={`border-t py-6 px-8 transition-colors ${
            isDark ? 'border-slate-800/80 bg-[#0B132B]/80 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold">&copy; 2026 Modern Product Slider. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-5 text-slate-400">
              <button onClick={() => setActiveTab('docs')} className="hover:underline">Documentation</button>
              <button onClick={() => setActiveTab('plans')} className="hover:underline">Pricing</button>
              <button onClick={() => setActiveTab('settings')} className="hover:underline">Privacy Policy</button>
              <button onClick={() => setActiveTab('settings')} className="hover:underline">Terms of Service</button>
              <button onClick={() => setActiveTab('overview')} className="hover:underline">Support</button>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        selectedPlan={selectedPlan}
        onSuccess={handleAuthCompleted}
        isDark={isDark}
      />

      {/* Full Professional Checkout Modal with Google ID & Pakistan Wallets */}
      <CheckoutModal
        isOpen={Boolean(checkoutPlan)}
        onClose={() => setCheckoutPlan(null)}
        planId={checkoutPlan}
        user={user}
        onSuccess={(updatedUser) => {
          saveSession(updatedUser);
          setActiveTab('licenses');
        }}
        isDark={isDark}
      />
    </div>
  );
}
