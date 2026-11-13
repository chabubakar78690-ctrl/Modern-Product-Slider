import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Globe2,
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
  Zap,
  Lock,
  Server,
  Landmark,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';
import BrandLogo from './components/BrandLogo.jsx';
import Sidebar from './components/Sidebar.jsx';
import AuthModal from './components/AuthModal.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import LandingPage from './components/LandingPage.jsx';

const SESSION_KEY = 'mps_portal_session_v2';
const THEME_KEY = 'mps_theme_preference';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash === '#dashboard' || hash === '#admin') return 'dashboard';
      }
    } catch {
      // ignore
    }
    return 'landing';
  });
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
        document.body.className = 'bg-[#060E1D] text-slate-100 antialiased';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.className = 'bg-[#F3F6FA] text-slate-900 antialiased';
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
    setCurrentView('dashboard');
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

  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          user={user}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onSelectPlan={(planId) => {
            handleBuyPlan(planId);
            setCurrentView('dashboard');
          }}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAuthOpen(true);
          }}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          initialMode={authMode}
          selectedPlan={selectedPlan}
          onSuccess={handleAuthCompleted}
          isDark={isDark}
        />

        {/* Full Professional Checkout Modal with Mastercard, Bank Transfer, Google ID & PK Wallets */}
        <CheckoutModal
          isOpen={Boolean(checkoutPlan)}
          onClose={() => setCheckoutPlan(null)}
          planId={checkoutPlan}
          user={user}
          onSuccess={(updatedUser) => {
            saveSession(updatedUser);
            setActiveTab('licenses');
            setCurrentView('dashboard');
          }}
          isDark={isDark}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#060E1D] text-slate-100' : 'bg-[#F3F6FA] text-slate-900'
      }`}
    >
      {/* Grouped Collapsible Sidebar (Always dark blue background as requested) */}
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
        onGoToLanding={() => setCurrentView('landing')}
      />

      {/* Main Dashboard Layout Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Header Bar */}
        <header
          className={`h-16 border-b px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors ${
            isDark ? 'border-[#122449] bg-[#071126]/90' : 'border-slate-200/90 bg-white/90 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base font-black tracking-tight capitalize flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1E488F]"></span>
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
                ? 'Super Admin Operations & APIs'
                : activeTab === 'logs'
                ? 'Security & Audit Logs'
                : activeTab === 'docs'
                ? 'WordPress Setup Guide'
                : activeTab === 'analytics'
                ? 'Usage Analytics & Performance'
                : 'Account Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switcher to Landing Page */}
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isDark
                  ? 'border-slate-700/60 bg-[#0A162F] text-slate-300 hover:text-white hover:bg-[#0E2044]'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-black hover:bg-slate-100 shadow-sm'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Landing Page</span>
            </button>
            {user ? (
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`px-3 py-1 rounded-full font-bold border ${
                    user.planId !== 'free'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {user.planName}
                </span>
                {isAdmin && (
                  <span className="px-2.5 py-1 rounded-full font-black text-[10px] uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white font-extrabold text-xs shadow-md border border-[#2555A8] transition active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Tab Content Panels */}
        <main className="flex-1 p-6 sm:p-9 max-w-6xl w-full mx-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-7">
              {/* Welcome Banner Box (Executive Dark Navy from Logo) */}
              <div
                className={`p-7 sm:p-8 rounded-3xl relative overflow-hidden transition shadow-xl ${
                  isDark
                    ? 'bg-gradient-to-r from-[#0C1E3D] via-[#0E244C] to-[#143269] border border-[#1E488F] text-white'
                    : 'bg-gradient-to-r from-[#0C1E3D] to-[#163875] text-white shadow-lg shadow-[#0C1E3D]/15'
                }`}
              >
                <div className="max-w-2xl relative z-10">
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-300 block mb-1">
                    WooCommerce Pro License Cloud
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Welcome to Modern Product Slider
                  </h1>
                  <p className="text-xs sm:text-sm mt-2 leading-relaxed text-slate-200">
                    Manage your active WordPress domains, rotate your Pro API license key, and track live WooCommerce store activations in real time.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() => setActiveTab('licenses')}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#0C1E3D] text-xs font-black shadow-md transition flex items-center gap-2 active:scale-95"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> View License Key
                    </button>
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="px-4 py-2.5 rounded-xl bg-[#091730]/80 hover:bg-[#071126] border border-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" /> Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Mixed Colored Metric Cards Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Metric Box 1 */}
                <div className={`p-5 rounded-2xl border transition ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">Active Plan</span>
                    <div className="w-7 h-7 rounded-lg bg-[#0C1E3D] text-white flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4 text-sky-400" />
                    </div>
                  </div>
                  <div className="text-xl font-black text-sky-400">{user?.planName || 'Free Edition'}</div>
                  <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {user?.planId === 'unlimited' ? 'Unlimited Sites Activated' : user?.planId === 'single' ? '1 WordPress Site Allowed' : 'Limited features'}
                  </span>
                </div>

                {/* Metric Box 2 */}
                <div className={`p-5 rounded-2xl border transition ${isDark ? 'bg-[#0A1835] border-[#18356E]' : 'bg-[#EDF4FF] border-[#BFD7FE] shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Connected Stores</span>
                    <div className="w-7 h-7 rounded-lg bg-[#0C1E3D] text-sky-400 flex items-center justify-center font-bold">
                      <Globe2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-[#0C1E3D]'}`}>
                    {(user?.activeSites || []).length} {user?.maxSites === -1 ? '/ Unlimited' : user?.maxSites ? `/ ${user.maxSites}` : 'Domains'}
                  </div>
                  <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Active WooCommerce racks
                  </span>
                </div>

                {/* Metric Box 3 */}
                <div className={`p-5 rounded-2xl border transition ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-[#F0FDF4] border-[#BBF7D0] shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-emerald-800'}`}>License Health</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl font-black text-emerald-500 flex items-center gap-1.5">
                    Active &amp; Valid
                  </div>
                  <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-400' : 'text-emerald-700'}`}>
                    Cloud API synchronized
                  </span>
                </div>
              </div>

              {/* WordPress Integration Quick Guide Box */}
              <div className={`p-6 sm:p-7 rounded-3xl border space-y-4 ${isDark ? 'bg-[#071126] border-[#14284F] text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <BadgeCheck className="w-4 h-4 text-sky-400" /> 3-Step WordPress Store Activation:
                </h3>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-[#F4F7FD] border-slate-200'}`}>
                    <span className="w-5 h-5 rounded-full bg-[#0C1E3D] text-white font-bold inline-flex items-center justify-center text-[11px] mb-2 border border-[#1E488F]">1</span>
                    <p className="font-semibold">Copy your Pro API Key</p>
                    <p className="text-slate-400 text-[11px] mt-1">Navigate to the License tab and copy your personal license key.</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-[#F4F7FD] border-slate-200'}`}>
                    <span className="w-5 h-5 rounded-full bg-[#0C1E3D] text-white font-bold inline-flex items-center justify-center text-[11px] mb-2 border border-[#1E488F]">2</span>
                    <p className="font-semibold">Open WordPress Admin</p>
                    <p className="text-slate-400 text-[11px] mt-1">Go to Modern Slider &rarr; Pro Version inside your WP Admin.</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-[#F4F7FD] border-slate-200'}`}>
                    <span className="w-5 h-5 rounded-full bg-[#0C1E3D] text-white font-bold inline-flex items-center justify-center text-[11px] mb-2 border border-[#1E488F]">3</span>
                    <p className="font-semibold">Click Activate License</p>
                    <p className="text-slate-400 text-[11px] mt-1">Paste your key and activate instant 3D product showcase features.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USAGE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Usage Analytics &amp; Performance
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Real-time telemetry of your WooCommerce store 3D product sliders and API activations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Slider Views (This Month)</span>
                  <div className="text-2xl font-black text-sky-400">12,840</div>
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +24% from last week
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">API Key Verifications</span>
                  <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>100%</div>
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                    Zero verification failures
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Active Domains</span>
                  <div className="text-2xl font-black text-emerald-400">
                    {(user?.activeSites || []).length} / {user?.maxSites === -1 ? '∞' : user?.maxSites || 1}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                    Connected live stores
                  </span>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`text-sm font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Connected Store Performance Status
                </h3>
                {(user?.activeSites || []).length > 0 ? (
                  <div className="space-y-2">
                    {user.activeSites.map((d) => (
                      <div key={d} className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-sky-400" />
                          <span className="font-mono font-bold">{d}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Active &bull; 3D Slider Loaded
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 italic">
                    No active stores attached yet. Go to Connected Stores tab to attach your WordPress store.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRO LICENSE KEY */}
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
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" /> Live Encrypted License Key
                    </span>
                    <button
                      onClick={handleRotateKey}
                      className="text-xs inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-sky-400 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate Key
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className={`flex-1 border rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono break-all ${isDark ? 'bg-[#050D1A] border-[#14284F] text-sky-300' : 'bg-slate-50 border-slate-200 text-sky-800'}`}>
                      {user.apiKey}
                    </code>
                    <button
                      onClick={() => handleCopy(user.apiKey)}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white font-bold text-xs inline-flex items-center gap-1.5 shrink-0 shadow-md border border-[#2555A8] transition"
                    >
                      {copied === user.apiKey ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy Key
                        </>
                      )}
                    </button>
                  </div>

                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${isDark ? 'bg-[#050D1A] border-[#102244] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Security Notice:</strong> Keep your API key confidential. If you believe your key has been compromised, click "Regenerate Key" to issue a new one immediately.
                  </div>
                </div>
              ) : (
                <div className={`p-10 rounded-3xl border text-center space-y-4 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <KeyRound className="w-10 h-10 text-sky-400 mx-auto" />
                  <h3 className="text-lg font-bold">No Active Pro License Key Found</h3>
                  <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Upgrade to Single Site ($3/mo) or Unlimited Sites ($10/mo) to generate your Pro API key.
                  </p>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white font-extrabold text-xs shadow-md border border-[#2555A8]"
                  >
                    View Upgrade Plans
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONNECTED DOMAINS */}
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
                  isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex-1 min-w-[240px]">
                  <input
                    type="text"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    placeholder="e.g. myboutique.com or store.mystyle.pk"
                    className={`w-full px-4 py-2 rounded-xl border text-xs font-mono transition focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${
                      isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white text-xs font-bold flex items-center gap-1.5 shadow-md border border-[#2555A8]"
                >
                  <Plus className="w-3.5 h-3.5" /> Attach Domain
                </button>
              </form>

              {/* Domain List */}
              <div
                className={`rounded-3xl border overflow-hidden ${
                  isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className={`p-4 border-b font-bold text-xs flex justify-between ${isDark ? 'border-[#14284F] text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                  <span>Domain</span>
                  <span>Action</span>
                </div>
                <div className={`divide-y text-xs ${isDark ? 'divide-[#102244]' : 'divide-slate-100'}`}>
                  {(user?.activeSites || []).length > 0 ? (
                    user.activeSites.map((d) => (
                      <div key={d} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 font-mono">
                          <Globe2 className="w-4 h-4 text-sky-400" />
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{d}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                            Active
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveDomain(d)}
                          className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold"
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

          {/* TAB 5: PLANS & PRICING */}
          {activeTab === 'plans' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Choose Your Pro License Plan
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Supports Mastercard / Visa, Direct Bank Transfer (IBAN/Raast), Google ID 1-Click, and Pakistani Wallets (JazzCash/EasyPaisa/SadaPay).
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Single Site $3/mo */}
                <div className={`p-8 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Single Store</span>
                    <div className="flex items-baseline gap-1 mt-2 mb-1">
                      <span className="text-4xl font-black text-sky-400">$3</span>
                      <span className="text-xs text-slate-400">/month</span>
                    </div>
                    <span className="text-xs font-bold text-sky-400 block mb-4">~₨ 850 PKR / month</span>
                    <ul className="space-y-2.5 text-xs mb-8">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 1 WordPress Domain</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited 3D Sliders</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Products Per Rack</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 1-Click Domain Transfer</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleBuyPlan('single')}
                    className="w-full py-3.5 rounded-2xl bg-[#0C1E3D] hover:bg-[#142F60] text-white font-extrabold text-xs border border-[#1E488F] transition"
                  >
                    Select Single Site ($3/mo)
                  </button>
                </div>

                {/* Unlimited Sites $10/mo */}
                <div className={`p-8 rounded-3xl border-2 border-[#1E488F] relative flex flex-col justify-between ${isDark ? 'bg-[#0C1E3D]/80 shadow-2xl shadow-[#0C1E3D]/50' : 'bg-white shadow-xl shadow-[#0C1E3D]/10'}`}>
                  <span className="absolute -top-3 right-6 bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] border border-[#2555A8] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                    Best Value
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-sky-400">Unlimited Sites</span>
                    <div className="flex items-baseline gap-1 mt-2 mb-1">
                      <span className="text-4xl font-black text-white">$10</span>
                      <span className="text-xs text-slate-400">/month</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 block mb-4">~₨ 2,800 PKR / month</span>
                    <ul className="space-y-2.5 text-xs mb-8">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited WordPress Sites</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited 3D Sliders</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Products Per Rack</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority Developer Support</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleBuyPlan('unlimited')}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white font-black text-xs shadow-lg border border-[#2555A8] transition"
                  >
                    Select Unlimited Sites ($10/mo)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TRANSACTIONS */}
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

              <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b font-bold ${isDark ? 'border-[#14284F] bg-[#050D1A] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                      <th className="p-4">Invoice</th>
                      <th className="p-4">Tier</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payment Platform</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#102244]' : 'divide-slate-100'}`}>
                    <tr className={isDark ? 'hover:bg-[#0A162F]' : 'hover:bg-slate-50'}>
                      <td className="p-4 font-mono font-bold text-sky-400">INV-2026-01</td>
                      <td className="p-4">{user?.planName || 'Unlimited Sites ($10/mo)'}</td>
                      <td className="p-4 font-black">${user?.price || 10}.00 <span className="text-[10px] text-emerald-400">(~₨ {((user?.price || 10) * 280).toLocaleString()} PKR)</span></td>
                      <td className="p-4 text-slate-300">Mastercard / Google ID Payment</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400">Paid</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SUPER ADMIN OPERATIONS & APIS */}
          {activeTab === 'admin' && isAdmin && <AdminDashboard isDark={isDark} />}

          {/* TAB 8: AUDIT LOGS */}
          {activeTab === 'logs' && isAdmin && (
            <div className="space-y-6 max-w-4xl">
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Security &amp; API Verification Logs
              </h2>
              <div className={`p-6 rounded-3xl border space-y-3 font-mono text-xs ${isDark ? 'bg-[#071126] border-[#14284F] text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                <div className="flex items-center justify-between border-b border-slate-700/40 pb-2">
                  <span className="font-bold text-emerald-400">✓ License Verified</span>
                  <span className="text-slate-400">modern-product-slider.vercel.app</span>
                  <span className="text-[11px] text-slate-500">Just now</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-700/40 pb-2">
                  <span className="font-bold text-sky-400">ℹ Super Admin Signed In</span>
                  <span className="text-slate-400">admin@modernproductslider.com</span>
                  <span className="text-[11px] text-slate-500">3 mins ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">✓ Domain Connected</span>
                  <span className="text-slate-400">sarahstreetwear.com</span>
                  <span className="text-[11px] text-slate-500">1 hour ago</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: WORDPRESS GUIDE */}
          {activeTab === 'docs' && (
            <div className="space-y-6 max-w-3xl">
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                WordPress Plugin Installation Guide
              </h2>
              <div className={`p-8 rounded-3xl border space-y-5 text-xs leading-relaxed ${isDark ? 'bg-[#071126] border-[#14284F] text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                <h3 className="text-sm font-bold text-sky-400">Step 1: Install Plugin</h3>
                <p>Upload <code>modern-product-slider.zip</code> to your WordPress store under <strong>Plugins &rarr; Add New &rarr; Upload Plugin</strong>.</p>

                <h3 className="text-sm font-bold text-sky-400">Step 2: Activate License</h3>
                <p>Navigate to <strong>Modern Slider &rarr; Pro Version</strong> in your WordPress dashboard, enter your License Key, and click <strong>Activate</strong>.</p>

                <h3 className="text-sm font-bold text-sky-400">Step 3: Embed 3D Racks</h3>
                <p>Use shortcode <code>[modern_product_slider category="all"]</code> in any Elementor, Gutenberg, or page builder section.</p>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Account &amp; Security Settings
              </h2>
              <div className={`p-8 rounded-3xl border space-y-4 text-xs ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || 'Not signed in'}
                    className={`w-full px-4 py-2.5 rounded-xl border font-mono opacity-80 ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-100 border-slate-300 text-slate-800'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Account Role</label>
                  <input
                    type="text"
                    disabled
                    value={user?.role || 'Customer'}
                    className={`w-full px-4 py-2.5 rounded-xl border font-mono opacity-80 capitalize ${isDark ? 'bg-[#050D1A] border-[#102244] text-white' : 'bg-slate-100 border-slate-300 text-slate-800'}`}
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSettingsSaved(true);
                      setTimeout(() => setSettingsSaved(false), 2000);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white font-bold border border-[#2555A8]"
                  >
                    {settingsSaved ? 'Saved!' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Clean Professional Footer */}
        <footer
          className={`border-t py-6 px-8 transition-colors ${
            isDark ? 'border-[#122449] bg-[#071126]/80 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
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

      {/* Full Professional Checkout Modal with Mastercard, Bank Transfer, Google ID & PK Wallets */}
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
