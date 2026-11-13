import React, { useState, useEffect } from 'react';
import {
  Layers,
  Check,
  Key,
  Copy,
  ShieldCheck,
  Sparkles,
  LogOut,
  CreditCard,
  LayoutDashboard,
  Shield,
  RefreshCw,
  ArrowRight,
  Globe,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sliders,
  ShoppingBag,
  ExternalLink,
  Zap,
  Code2,
} from 'lucide-react';
import BrandLogo from './components/BrandLogo.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import ProductSliderDemo from './components/ProductSliderDemo.jsx';
import AuthModal from './components/AuthModal.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

const SESSION_KEY = 'mps_portal_session_v2';
const THEME_KEY = 'mps_theme_preference';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home | dashboard | admin
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [pendingPlan, setPendingPlan] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [processingPay, setProcessingPay] = useState(false);
  const [copied, setCopied] = useState('');

  // Dual Theme State (default to sleek dark, with full clean white mode support)
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

  const handleBuyPlan = (planId) => {
    if (!user) {
      setPendingPlan(planId);
      setAuthMode('signup');
      setAuthOpen(true);
    } else {
      setCheckoutPlan(planId);
    }
  };

  const handleAuthCompleted = (authedUser) => {
    saveSession(authedUser);
    setAuthOpen(false);
    if (pendingPlan) {
      setCheckoutPlan(pendingPlan);
      setPendingPlan(null);
    } else if (authedUser.role === 'admin') {
      setView('admin');
    } else {
      setView('dashboard');
    }
  };

  const handleCompleteCheckout = async (e) => {
    e.preventDefault();
    if (!user || !checkoutPlan) return;
    setProcessingPay(true);
    try {
      const res = await fetch('/api/v1/auth/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          planId: checkoutPlan,
          paymentMethod: 'Card •••• 4242',
        }),
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data.user);
        setCheckoutPlan(null);
        setView('dashboard');
      }
    } finally {
      setProcessingPay(false);
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

  const isAdmin = user?.role === 'admin';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#0B132B] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Navigation Bar */}
      <header
        className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isDark
            ? 'border-slate-800/80 bg-[#0B132B]/90'
            : 'border-slate-200/90 bg-white/90 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-3 text-left focus:outline-none py-2"
          >
            <BrandLogo isDark={isDark} className="h-9 sm:h-10" />
          </button>

          {/* Navigation Links & Action Controls */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setView('home')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                view === 'home'
                  ? isDark
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-900 shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Showroom &amp; Pricing
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
                    view === 'dashboard'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : isDark
                      ? 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800'
                      : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> My License
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setView('admin')}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 transition border ${
                      view === 'admin'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : isDark
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" /> Admin Hub
                  </button>
                )}

                <button
                  onClick={() => {
                    saveSession(null);
                    setView('home');
                  }}
                  title="Sign out"
                  className={`p-2 rounded-xl transition ${
                    isDark
                      ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
                      : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setPendingPlan(null);
                    setAuthMode('login');
                    setAuthOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                    isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setPendingPlan(null);
                    setAuthMode('signup');
                    setAuthOpen(true);
                  }}
                  className="bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-sky-500/20 transition active:scale-95"
                >
                  Get Started
                </button>
              </>
            )}

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* VIEW: HOME / STOREFRONT */}
        {view === 'home' && (
          <div className="space-y-20">
            {/* Hero Section */}
            <section className="text-center max-w-4xl mx-auto pt-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 bg-sky-500/10 text-sky-500 border border-sky-500/25">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen WooCommerce 3D Storefront Experience
              </div>

              <h1
                className={`text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] mb-6 ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Turn Your WooCommerce Catalog Into an{' '}
                <span className="text-sky-500">Interactive 3D Showroom</span>
              </h1>

              <p
                className={`text-base sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto font-normal ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Smooth perspective rotation on hover, hanging price tags that swing with physics, and a 360° front/back quick-view modal with instant AJAX Add to Cart.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
                <a
                  href="#pricing"
                  className="px-7 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-xl shadow-sky-500/25 transition active:scale-95"
                >
                  Get Pro License <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => {
                    setPendingPlan(null);
                    setAuthMode('signup');
                    setAuthOpen(true);
                  }}
                  className={`px-7 py-4 rounded-2xl border font-bold text-sm inline-flex items-center gap-2 transition active:scale-95 ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <Play className="w-4 h-4 text-sky-500" /> Start Free Edition
                </button>
              </div>

              {/* LIVE INTERACTIVE 3D PRODUCT SLIDER SHOWCASE */}
              <div className="mt-4">
                <ProductSliderDemo isDark={isDark} />
              </div>
            </section>

            {/* Core Architectural Features */}
            <section className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-xs font-black uppercase tracking-wider text-sky-500">
                  Engineered for High-Conversion Stores
                </span>
                <h2 className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  Why Top WooCommerce Brands Choose Modern Slider
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div
                  className={`p-7 rounded-3xl border transition ${
                    isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-5 border border-sky-500/20">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    3D Perspective Garment Rack
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Products hang realistically in 3D space with customizable rack angles (20°–55°). Items smoothly face forward when customer cursor hovers.
                  </p>
                </div>

                <div
                  className={`p-7 rounded-3xl border transition ${
                    isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-5 border border-sky-500/20">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Instant AJAX Quick-View &amp; Cart
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Shoppers inspect front and back product angles, select sizes and color variants, and checkout with zero page reload friction.
                  </p>
                </div>

                <div
                  className={`p-7 rounded-3xl border transition ${
                    isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-5 border border-sky-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Cloud License API &amp; Domain Control
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Instant activation in WordPress. Move licenses between staging and live domains with 1-click domain release right from your dashboard.
                  </p>
                </div>
              </div>
            </section>

            {/* Pricing Comparison Section */}
            <section id="pricing" className="max-w-5xl mx-auto pt-6">
              <div className="text-center mb-12">
                <span className="text-xs font-black uppercase tracking-wider text-sky-500">
                  Transparent &amp; Flexible Plans
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  Choose Your Pro License
                </h2>
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Sign in with Google or Gmail code and activate in your WordPress store in 30 seconds.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Single Site $3/mo */}
                <div
                  className={`rounded-3xl p-8 sm:p-10 flex flex-col justify-between border transition ${
                    isDark
                      ? 'bg-slate-900/80 border-slate-800 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-900 shadow-lg'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Single Store
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        Solo Storefront
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-2 mb-3">
                      <span className="text-5xl font-black text-sky-500">$3</span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        /month
                      </span>
                    </div>

                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Perfect for a single independent WooCommerce brand.
                    </p>

                    <ul className="space-y-3.5 text-sm mb-8">
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span>Activate on <strong>1 WordPress Domain</strong></span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span><strong>Unlimited</strong> 3D Product Sliders</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span><strong>Unlimited</strong> Products Per Rack</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span>1-Click Domain Transfer in Dashboard</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span>Automatic Plugin Updates</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuyPlan('single')}
                    className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm transition active:scale-98 ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                    }`}
                  >
                    Get Single Site ($3/mo)
                  </button>
                </div>

                {/* Unlimited Sites $10/mo (Featured) */}
                <div
                  className={`rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative border-2 border-sky-500 transition shadow-2xl ${
                    isDark
                      ? 'bg-gradient-to-b from-[#111B35] to-slate-900 text-slate-100 shadow-sky-500/10'
                      : 'bg-white text-slate-900 shadow-sky-500/15'
                  }`}
                >
                  <span className="absolute -top-3.5 right-6 bg-sky-500 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-sky-500">
                        Unlimited Agency
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-500 border border-sky-500/30">
                        Agencies &amp; Freelancers
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-2 mb-3">
                      <span className="text-5xl font-black text-sky-500">$10</span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        /month
                      </span>
                    </div>

                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Built for design studios, agencies, and multi-store creators.
                    </p>

                    <ul className="space-y-3.5 text-sm mb-8">
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span>Activate on <strong>Unlimited WordPress Sites</strong></span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span><strong>Unlimited</strong> 3D Product Sliders</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span><strong>Unlimited</strong> Products Per Rack</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span>Priority Developer &amp; Ticket Support</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-sky-500 shrink-0" />
                        <span>Early Access to New 3D Showroom Layouts</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuyPlan('unlimited')}
                    className="w-full py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-sm shadow-xl shadow-sky-500/30 transition active:scale-98"
                  >
                    Get Unlimited Sites ($10/mo)
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: CUSTOMER LICENSE DASHBOARD */}
        {view === 'dashboard' && user && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-500">
                  Customer License Dashboard
                </span>
                <h1 className={`text-2xl sm:text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Welcome back, {user.name}
                </h1>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user.email}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border ${
                  user.planId !== 'free'
                    ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                    : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> {user.planName}
              </span>
            </div>

            {user.planId === 'free' ? (
              <div
                className={`rounded-3xl p-8 sm:p-10 text-center space-y-4 border ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  You are currently using the Free Edition
                </h2>
                <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Upgrade to unlock unlimited 3D clothing racks, unlimited products, and your personal Pro API key.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleBuyPlan('single')}
                    className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    Upgrade Single Site ($3/mo)
                  </button>
                  <button
                    onClick={() => handleBuyPlan('unlimited')}
                    className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition"
                  >
                    Upgrade Unlimited Sites ($10/mo)
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-3xl p-6 sm:p-8 space-y-6 border ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Key className="w-5 h-5 text-sky-500" /> Your Pro API License Key
                  </div>
                  <button
                    onClick={handleRotateKey}
                    className={`text-xs inline-flex items-center gap-1 font-semibold hover:underline ${
                      isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate Key
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <code
                    className={`flex-1 border rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-mono break-all ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-sky-400'
                        : 'bg-slate-50 border-slate-200 text-sky-700'
                    }`}
                  >
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

                {/* WordPress Setup Steps */}
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-bold block mb-1">How to activate in your WordPress store:</span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Log into your WordPress Dashboard &rarr; <strong>Modern Slider</strong> &rarr; <strong>Pro Version</strong>.</li>
                    <li>Paste your License Key from above into the activation field.</li>
                    <li>Click <strong>Activate License</strong> to unlock all 3D features instantly.</li>
                  </ol>
                </div>

                {/* Domain Management */}
                <div className={`grid sm:grid-cols-2 gap-4 pt-4 border-t text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div>
                    <span className="text-slate-400 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                      Connected WordPress Domains
                    </span>
                    {(user.activeSites || []).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.activeSites.map((d) => (
                          <span
                            key={d}
                            className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-xl text-xs font-mono font-medium ${
                              isDark
                                ? 'bg-slate-950 border-slate-800 text-slate-200'
                                : 'bg-slate-100 border-slate-200 text-slate-800'
                            }`}
                          >
                            <Globe className="w-3.5 h-3.5 text-sky-500" /> {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">
                        No domains connected yet. Paste your key in WordPress to activate.
                      </span>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <span className="text-slate-400 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                      Need more sites?
                    </span>
                    <button
                      onClick={() =>
                        handleBuyPlan(user.planId === 'single' ? 'unlimited' : 'single')
                      }
                      className="text-sky-500 font-bold hover:underline"
                    >
                      Switch to {user.planId === 'single' ? 'Unlimited Sites ($10/mo)' : 'Single Site ($3/mo)'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: SUPER ADMIN DASHBOARD */}
        {view === 'admin' && isAdmin && <AdminDashboard isDark={isDark} />}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-10 mt-20 transition-colors ${
          isDark ? 'border-slate-800/80 bg-[#0B132B]/80 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <BrandLogo isDark={isDark} className="h-7" showSubtitle={false} />
            <span className="text-slate-400">© 2026 Modern Product Slider. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <span className="inline-flex items-center gap-1.5 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Cloud API 99.99% Uptime
            </span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Lock className="w-3.5 h-3.5" /> 256-bit SSL Encrypted
            </span>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Google OAuth & Gmail OTP) */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        selectedPlan={pendingPlan}
        onSuccess={handleAuthCompleted}
        isDark={isDark}
      />

      {/* Checkout Modal */}
      {checkoutPlan && user && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCompleteCheckout}
            className={`rounded-3xl max-w-md w-full p-8 space-y-6 border shadow-2xl transition ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-sky-500">
                Instant Pro Activation
              </span>
              <h3 className="text-2xl font-black mt-1">
                {checkoutPlan === 'single' ? 'Single Site Plan — $3/mo' : 'Unlimited Sites Plan — $10/mo'}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                License key will be issued immediately to <strong>{user.email}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Card Details
                </label>
                <div className="relative">
                  <CreditCard className={`w-4 h-4 absolute left-3.5 top-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242   12/29   888"
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-mono transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutPlan(null)}
                className={`flex-1 py-3.5 rounded-xl border text-xs font-bold transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingPay}
                className="flex-1 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold shadow-lg shadow-sky-500/25 transition active:scale-98"
              >
                {processingPay
                  ? 'Issuing Key...'
                  : `Pay $${checkoutPlan === 'single' ? 3 : 10} & Unlock`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
