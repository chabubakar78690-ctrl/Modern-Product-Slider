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
} from 'lucide-react';
import AuthModal from './components/AuthModal.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

const SESSION_KEY = 'mps_portal_session_v2';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home | dashboard | admin
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [pendingPlan, setPendingPlan] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [processingPay, setProcessingPay] = useState(false);
  const [copied, setCopied] = useState('');

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight block leading-none">
                Modern Product Slider
              </span>
              <span className="text-[11px] text-slate-400">Official WooCommerce Pro Portal</span>
            </div>
          </button>

          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setView('home')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                view === 'home' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pricing &amp; Features
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition ${
                    view === 'dashboard'
                      ? 'bg-sky-400 text-slate-950'
                      : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> My License
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setView('admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition ${
                      view === 'admin'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-amber-400/15 text-amber-300 border border-amber-400/30 hover:bg-amber-400/25'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" /> Admin Manager
                  </button>
                )}

                <button
                  onClick={() => {
                    saveSession(null);
                    setView('home');
                  }}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900"
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
                  className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-300 hover:text-white"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setPendingPlan(null);
                    setAuthMode('signup');
                    setAuthOpen(true);
                  }}
                  className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 rounded-lg transition"
                >
                  Get Started
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {/* HOME / STOREFRONT */}
        {view === 'home' && (
          <div className="space-y-20">
            {/* Hero */}
            <section className="text-center max-w-3xl mx-auto pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-sky-400/10 text-sky-400 border border-sky-400/25 mb-5">
                <Sparkles className="w-3.5 h-3.5" /> Interactive 3D Clothing Rack for WooCommerce
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-5">
                Turn Your WooCommerce Catalog Into a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
                  3D Showroom Rack
                </span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8">
                Side-to-front hover rotation, swinging paper price tags, and a 360&deg; front/back quick-view modal with instant AJAX Add to Cart. Upgrade to Pro for unlimited sliders and unlimited products.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#pricing"
                  className="px-6 py-3.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-sm inline-flex items-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  Buy Pro License <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => {
                    setPendingPlan(null);
                    setAuthMode('signup');
                    setAuthOpen(true);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-sm inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4 text-sky-400" /> Create Free Account
                </button>
              </div>
            </section>

            {/* Pricing Tiers */}
            <section id="pricing" className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-white">Simple, Transparent Pro Pricing</h2>
                <p className="text-slate-400 text-sm mt-2">
                  Sign in with Google or Gmail verification code and unlock your API key in 30 seconds.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Single Site $3/mo */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Single Site
                    </span>
                    <div className="flex items-baseline gap-1 mt-2 mb-3">
                      <span className="text-5xl font-extrabold text-white">$3</span>
                      <span className="text-slate-400 text-sm">/month</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">
                      Ideal for a single WooCommerce storefront.
                    </p>
                    <ul className="space-y-3 text-sm text-slate-200 mb-8">
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Activate on <strong>1 WordPress Domain</strong></span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        <span><strong>Unlimited</strong> Product Sliders</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        <span><strong>Unlimited</strong> Products Per Rack</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Transfer domain anytime from dashboard</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleBuyPlan('single')}
                    className="w-full py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
                  >
                    Buy Single Site ($3/mo)
                  </button>
                </div>

                {/* Unlimited Sites $10/mo */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-sky-400 rounded-2xl p-8 flex flex-col justify-between relative shadow-2xl shadow-sky-500/10">
                  <span className="absolute -top-3.5 right-6 bg-sky-400 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      Unlimited Sites
                    </span>
                    <div className="flex items-baseline gap-1 mt-2 mb-3">
                      <span className="text-5xl font-extrabold text-white">$10</span>
                      <span className="text-slate-400 text-sm">/month</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">
                      Built for agencies, studios &amp; multi-store brands.
                    </p>
                    <ul className="space-y-3 text-sm text-slate-200 mb-8">
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Activate on <strong>Unlimited WordPress Sites</strong></span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        <span><strong>Unlimited</strong> Product Sliders</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        <span><strong>Unlimited</strong> Products Per Rack</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Priority Updates &amp; Developer Support</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleBuyPlan('unlimited')}
                    className="w-full py-3.5 px-5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-sm transition"
                  >
                    Buy Unlimited Sites ($10/mo)
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* CUSTOMER LICENSE DASHBOARD */}
        {view === 'dashboard' && user && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome, {user.name}
                </h1>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                  user.planId !== 'free'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> {user.planName}
              </span>
            </div>

            {user.planId === 'free' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                <h2 className="text-xl font-bold text-white">You are currently on the Free Plan</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Upgrade to unlock unlimited sliders, unlimited products per rack, and your personal Pro API License Key.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleBuyPlan('single')}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                  >
                    Upgrade to Single Site ($3/mo)
                  </button>
                  <button
                    onClick={() => handleBuyPlan('unlimited')}
                    className="px-5 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-sm"
                  >
                    Upgrade to Unlimited ($10/mo)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Key className="w-5 h-5 text-sky-400" /> Your Pro API License Key
                  </div>
                  <button
                    onClick={handleRotateKey}
                    className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate Key
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-sky-300 font-mono break-all">
                    {user.apiKey}
                  </code>
                  <button
                    onClick={() => handleCopy(user.apiKey)}
                    className="px-4 py-3.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm inline-flex items-center gap-1.5 shrink-0"
                  >
                    {copied === user.apiKey ? (
                      <>
                        <Check className="w-4 h-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Active WordPress Domains</span>
                    {user.activeSites?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.activeSites.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-200"
                          >
                            <Globe className="w-3 h-3 text-sky-400" /> {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300 font-medium">
                        Ready to activate in WordPress &rarr; Modern Slider &rarr; Pro Version
                      </span>
                    )}
                  </div>
                  <div className="sm:text-right">
                    <span className="text-slate-400 block mb-1">Need a different tier?</span>
                    <button
                      onClick={() =>
                        handleBuyPlan(user.planId === 'single' ? 'unlimited' : 'single')
                      }
                      className="text-sky-400 font-bold hover:underline"
                    >
                      Switch to {user.planId === 'single' ? 'Unlimited ($10/mo)' : 'Single Site ($3/mo)'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUPER ADMIN DASHBOARD */}
        {view === 'admin' && isAdmin && <AdminDashboard />}
      </main>

      {/* AUTH MODAL (Google OAuth + Gmail 6-Digit OTP) */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        selectedPlan={pendingPlan}
        onSuccess={handleAuthCompleted}
      />

      {/* CHECKOUT MODAL */}
      {checkoutPlan && user && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCompleteCheckout}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-7 space-y-5 shadow-2xl"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Instant Pro Activation
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {checkoutPlan === 'single' ? 'Single Site Plan — $3/mo' : 'Unlimited Sites Plan — $10/mo'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                License will be issued immediately to <strong>{user.email}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Card Details</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242   12/29   888"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutPlan(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingPay}
                className="flex-1 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-extrabold"
              >
                {processingPay
                  ? 'Issuing Key...'
                  : `Pay $${checkoutPlan === 'single' ? 3 : 10} & Get API Key`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
