import React, { useState, useEffect } from 'react';
import {
  Layers,
  Check,
  Key,
  Copy,
  Download,
  ShieldCheck,
  Sparkles,
  LogOut,
  Terminal,
  Globe,
  RefreshCw,
} from 'lucide-react';

const STORAGE_KEY = 'mps_saas_user_v1';

function generateApiKey(planId) {
  const prefix = planId === 'single' ? 'mps_live_s1_' : 'mps_live_un_';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return prefix + token;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('pricing'); // pricing | auth | dashboard
  const [authMode, setAuthMode] = useState('signup');
  const [selectedPlan, setSelectedPlan] = useState('unlimited');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [testSiteUrl, setTestSiteUrl] = useState('https://my-wp-store.local');
  const [testApiKey, setTestApiKey] = useState('mps_test_single_3usd');
  const [apiTestResult, setApiTestResult] = useState(null);
  const [testingApi, setTestingApi] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setTestApiKey(parsed.apiKey);
        setView('dashboard');
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      setTestApiKey(nextUser.apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    if (user) {
      const updated = {
        ...user,
        planId,
        planName: planId === 'single' ? 'Single Site ($3/mo)' : 'Unlimited Sites ($10/mo)',
        price: planId === 'single' ? 3 : 10,
        apiKey: generateApiKey(planId),
      };
      persistUser(updated);
      setView('dashboard');
    } else {
      setAuthMode('signup');
      setView('auth');
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim() || 'founder@modernproductslider.com';
    const newUser = {
      email: cleanEmail,
      planId: selectedPlan,
      planName: selectedPlan === 'single' ? 'Single Site ($3/mo)' : 'Unlimited Sites ($10/mo)',
      price: selectedPlan === 'single' ? 3 : 10,
      apiKey: generateApiKey(selectedPlan),
      createdAt: new Date().toLocaleDateString(),
    };
    persistUser(newUser);
    setView('dashboard');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleTestVerifyEndpoint = async (e) => {
    e.preventDefault();
    setTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await fetch('/api/v1/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: testApiKey, site_url: testSiteUrl }),
      });
      const data = await res.json();
      setApiTestResult({ status: res.status, data });
    } catch (err) {
      setApiTestResult({ status: 500, data: { valid: false, message: err.message } });
    } finally {
      setTestingApi(false);
    }
  };

  const handleTestDeactivateEndpoint = async () => {
    setTestingApi(true);
    try {
      const res = await fetch('/api/v1/license/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: testApiKey, site_url: testSiteUrl }),
      });
      const data = await res.json();
      setApiTestResult({ status: res.status, data });
    } finally {
      setTestingApi(false);
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setView('pricing')}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight block leading-none">
                Modern Product Slider
              </span>
              <span className="text-[11px] text-slate-400">Pro Licensing &amp; API Cloud</span>
            </div>
          </button>

          <nav className="flex items-center gap-3">
            <button
              onClick={() => setView('pricing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                view === 'pricing' ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Plans
            </button>
            {user ? (
              <>
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                    view === 'dashboard'
                      ? 'bg-sky-400 text-slate-950'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  License Dashboard
                </button>
                <button
                  onClick={() => {
                    persistUser(null);
                    setView('pricing');
                  }}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setView('auth');
                }}
                className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg transition"
              >
                Sign In / Get Pro
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {/* VIEW 1: PRICING & HERO */}
        {view === 'pricing' && (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-400/10 text-sky-400 border border-sky-400/25 mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Official WooCommerce Pro Add-On
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Unlimited 3D Product Racks for WooCommerce
              </h1>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                Upgrade from the Free edition (3 sliders &amp; 5 products) to unlimited sliders, unlimited products per rack, and instant cloud API activation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              {/* $3/mo Single Site */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Single Site
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-5xl font-extrabold text-white">$3</span>
                    <span className="text-slate-400 font-medium">/month</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">
                    Perfect for an individual WooCommerce store owner.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-200 mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Active on <strong>1 WordPress Domain</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span><strong>Unlimited</strong> Product Carousels</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span><strong>Unlimited</strong> Products Per Slider</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Pro Add-On ZIP + Instant API Key</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSelectPlan('single')}
                  className="w-full py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
                >
                  Choose Single Site ($3/mo)
                </button>
              </div>

              {/* $10/mo Unlimited Sites */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-sky-400 rounded-2xl p-8 flex flex-col justify-between relative shadow-2xl shadow-sky-500/10">
                <span className="absolute -top-3.5 right-6 bg-sky-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                  Best Value
                </span>
                <div>
                  <div className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-2">
                    Unlimited Sites
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-5xl font-extrabold text-white">$10</span>
                    <span className="text-slate-400 font-medium">/month</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">
                    Built for agencies, freelancers, and multi-store brands.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-200 mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Active on <strong>Unlimited WordPress Sites</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span><strong>Unlimited</strong> Product Carousels</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span><strong>Unlimited</strong> Products Per Slider</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Pro Add-On ZIP + Priority Updates</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSelectPlan('unlimited')}
                  className="w-full py-3.5 px-5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold transition"
                >
                  Choose Unlimited Sites ($10/mo)
                </button>
              </div>
            </div>

            {/* Instant Pre-Seeded Test Keys Box */}
            <div className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mb-2">
                <Terminal className="w-4 h-4" /> Instant Test API Keys (Ready Immediately After Vercel Deploy)
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Use either pre-seeded key below inside your WordPress plugin (<strong>Modern Slider &rarr; Pro Version</strong>) or sign up above to generate a fresh key:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Single Site ($3/mo) Test Key', key: 'mps_test_single_3usd' },
                  { label: 'Unlimited Sites ($10/mo) Test Key', key: 'mps_test_unlimited_10usd' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                  >
                    <div>
                      <span className="text-[11px] text-slate-400 block">{item.label}</span>
                      <code className="text-xs text-sky-300 font-mono">{item.key}</code>
                    </div>
                    <button
                      onClick={() => handleCopy(item.key)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                      title="Copy Key"
                    >
                      {copiedKey === item.key ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SIGN UP / LOGIN */}
        {view === 'auth' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              {authMode === 'signup' ? 'Create Your Pro Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Selected Plan:{' '}
              <strong className="text-sky-400">
                {selectedPlan === 'single' ? 'Single Site ($3/mo)' : 'Unlimited Sites ($10/mo)'}
              </strong>
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@store.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('single')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                    selectedPlan === 'single'
                      ? 'border-sky-400 bg-sky-400/10 text-sky-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  Single Site &bull; $3/mo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('unlimited')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                    selectedPlan === 'unlimited'
                      ? 'border-sky-400 bg-sky-400/10 text-sky-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  Unlimited &bull; $10/mo
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold transition mt-2"
              >
                {authMode === 'signup'
                  ? `Complete Checkout & Generate API Key ($${selectedPlan === 'single' ? 3 : 10}/mo)`
                  : 'Sign In to Dashboard'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400">
              {authMode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-sky-400 font-semibold hover:underline"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Need a new license?{' '}
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="text-sky-400 font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: CUSTOMER DASHBOARD & API TESTER */}
        {view === 'dashboard' && user && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Pro License Dashboard</h1>
                <p className="text-slate-400 text-sm">Signed in as {user.email}</p>
              </div>
              <span className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-bold">
                <ShieldCheck className="w-4 h-4" /> Active Subscription: {user.planName}
              </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* API Key Card */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Key className="w-5 h-5 text-sky-400" /> Your Pro API License Key
                  </div>
                  <button
                    onClick={() =>
                      persistUser({ ...user, apiKey: generateApiKey(user.planId) })
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Rotate Key
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
                    {copiedKey === user.apiKey ? (
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

                {/* WordPress wp-config.php / filter snippet to point plugin to this Vercel URL */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Connect WordPress Pro Plugin to This Vercel Deployment
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `add_filter( 'mpc_pro_api_endpoint', function() { return '${currentOrigin}/api/v1/license/verify'; } );`
                        )
                      }
                      className="text-xs text-sky-400 hover:underline"
                    >
                      Copy PHP Snippet
                    </button>
                  </div>
                  <pre className="text-xs text-slate-400 font-mono overflow-x-auto">
{`add_filter( 'mpc_pro_api_endpoint', function() {
    return '${currentOrigin}/api/v1/license/verify';
} );`}
                  </pre>
                </div>
              </div>

              {/* Plan & Download Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Plan
                  </span>
                  <div className="text-2xl font-extrabold text-white mt-1">{user.planName}</div>
                  <p className="text-xs text-slate-400 mt-1">
                    {user.planId === 'single'
                      ? '1 WordPress site activation allowed.'
                      : 'Unlimited WordPress site activations allowed.'}
                  </p>

                  <div className="mt-5 pt-5 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sliders Limit:</span>
                      <strong>Unlimited</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Products Per Rack:</span>
                      <strong>Unlimited</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setView('pricing')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-sky-400" /> Switch Plan ($3 / $10)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Serverless API Tester */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-white font-bold mb-1">
                <Globe className="w-5 h-5 text-sky-400" /> Live Vercel API Endpoint Simulator
              </div>
              <p className="text-slate-400 text-sm mb-5">
                Test <code className="text-sky-300">POST /api/v1/license/verify</code> and{' '}
                <code className="text-sky-300">/deactivate</code> directly against your Vercel serverless function.
              </p>

              <form onSubmit={handleTestVerifyEndpoint} className="grid sm:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  value={testApiKey}
                  onChange={(e) => setTestApiKey(e.target.value)}
                  placeholder="API Key (mps_live_...)"
                  className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono"
                />
                <input
                  type="text"
                  value={testSiteUrl}
                  onChange={(e) => setTestSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={testingApi}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm"
                  >
                    {testingApi ? 'Testing...' : 'Test Verify'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestDeactivateEndpoint}
                    disabled={testingApi}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
                  >
                    Deactivate
                  </button>
                </div>
              </form>

              {apiTestResult && (
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-emerald-300 font-mono overflow-x-auto">
                  {JSON.stringify(apiTestResult, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
