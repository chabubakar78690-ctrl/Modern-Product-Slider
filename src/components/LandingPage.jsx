import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  ArrowRight,
  Zap,
  Globe2,
  KeyRound,
  LayoutDashboard,
  Layers,
  CreditCard,
  Smartphone,
  Landmark,
  BadgeCheck,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Code2,
  Star,
  Users,
  Sun,
  Moon,
} from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';

export default function LandingPage({
  user,
  onGoToDashboard,
  onSelectPlan,
  onOpenAuth,
  isDark,
  onToggleTheme,
}) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How does the WooCommerce Pro License activation work?',
      a: 'After selecting your plan, an encrypted Pro API key is automatically generated. Simply upload the modern-product-slider.zip plugin to your WordPress dashboard, navigate to Modern Slider → Pro Version, paste your key, and click Activate.',
    },
    {
      q: 'Which payment methods and currencies are supported?',
      a: 'We support international and Pakistani payment platforms: Mastercard & Visa (via 3D Secure), Direct Bank Transfer (Meezan Bank Raast & IBAN), Google ID / Google Pay 1-Click, and Pakistani Mobile Wallets (JazzCash, EasyPaisa, SadaPay).',
    },
    {
      q: 'Can I transfer my license to another WordPress domain?',
      a: 'Yes! Both Single Site and Unlimited plans include 1-click domain release from your dashboard portal, allowing you to seamlessly reassign keys to staging or production stores.',
    },
    {
      q: 'Does it work with Elementor, Divi, and Gutenberg?',
      a: 'Yes. Modern Product Slider provides both standard WordPress shortcodes [modern_product_slider] and dedicated blocks compatible with Elementor, Gutenberg, WooCommerce blocks, and popular page builders.',
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${isDark ? 'bg-[#060E1D] text-slate-100' : 'bg-[#F3F6FA] text-slate-900'}`}>
      {/* 1. TOP NAVBAR */}
      <nav
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
          isDark ? 'bg-[#071126]/90 border-[#122449]' : 'bg-white/90 border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo only */}
          <div className="flex items-center gap-3">
            <BrandLogo isCollapsed={false} isDark={isDark} className="h-9" />
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-400">
            <a href="#features" className={`hover:text-sky-400 transition ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Features</a>
            <a href="#how-it-works" className={`hover:text-sky-400 transition ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>How It Works</a>
            <a href="#pricing" className={`hover:text-sky-400 transition ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Pricing &amp; Plans</a>
            <a href="#faq" className={`hover:text-sky-400 transition ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>FAQ</a>
          </div>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2 rounded-xl border transition ${
                isDark
                  ? 'bg-[#0A162F] border-slate-700/60 text-amber-400 hover:bg-[#0E2044]'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <button
                onClick={onGoToDashboard}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white text-xs font-black shadow-md border border-[#2555A8] hover:from-[#102750] hover:to-[#2458AD] transition flex items-center gap-2"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={onGoToDashboard}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white text-xs font-black shadow-md border border-[#2555A8] hover:from-[#102750] hover:to-[#2458AD] transition flex items-center gap-2 active:scale-95"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                  Launch Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#0C1E3D] border border-[#1E488F] text-sky-300 shadow-sm">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            Official WooCommerce Pro Licensing Platform
          </div>

          <h1 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Elevate Your WooCommerce Store With Modern 3D Product Sliders
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-2xl mx-auto`}>
            Transform static e-commerce catalog grids into interactive showcases. Rotate, zoom, and highlight apparel, shoes, and luxury items with smooth performance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onGoToDashboard}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white text-xs sm:text-sm font-black shadow-xl shadow-[#0C1E3D]/40 border border-[#2555A8] flex items-center gap-2.5 transition active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" /> Open Cloud Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#pricing"
              className={`px-6 py-3.5 rounded-2xl border text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                isDark
                  ? 'bg-[#071126] border-[#14284F] text-slate-200 hover:bg-[#0C1E3D]'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <CreditCard className="w-4 h-4 text-sky-400" /> View Pro Plans from $3/mo
            </a>
          </div>

          {/* Quick trust metrics */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-emerald-400" /> WooCommerce 8.x &amp; 9.x Ready
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-emerald-400" /> Elementor &amp; Gutenberg Blocks
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-emerald-400" /> 1-Click Domain Transfer
            </div>
          </div>
        </div>

        {/* 3. MODERN PRODUCT SLIDER UI PREVIEW (CLEAN UI CARD, NO AI CAROUSEL) */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative transition ${
              isDark
                ? 'bg-gradient-to-b from-[#0B1736] to-[#071126] border-[#162D5D]'
                : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
            {/* Window bar */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-700/40 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className={`text-[11px] font-mono ml-3 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  WordPress Admin &bull; Modern Slider Pro Activated
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> License Active
              </span>
            </div>

            {/* Mockup Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Product Mock 1 */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-[#F8FAFD] border-slate-200 shadow-sm'}`}>
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-[#0C1E3D] to-[#1E488F] flex items-center justify-center text-white mb-3 shadow-inner">
                  <ShoppingBag className="w-10 h-10 text-sky-300" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Oversized Hoodie</span>
                  <span className="font-black text-xs text-sky-400">$64.00</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-2">
                  <Star className="w-3 h-3 fill-amber-400" /> 4.9 &bull; 3D Rotation Ready
                </div>
                <div className="w-full py-1.5 rounded-lg bg-[#0C1E3D] text-white text-[11px] font-bold text-center border border-[#1E488F]">
                  Add to Cart
                </div>
              </div>

              {/* Product Mock 2 */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-[#F8FAFD] border-slate-200 shadow-sm'}`}>
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-[#102750] to-[#2555A8] flex items-center justify-center text-white mb-3 shadow-inner">
                  <Layers className="w-10 h-10 text-sky-200" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Leather Street Vest</span>
                  <span className="font-black text-xs text-sky-400">$89.00</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-2">
                  <Star className="w-3 h-3 fill-amber-400" /> 5.0 &bull; Interactive Rack
                </div>
                <div className="w-full py-1.5 rounded-lg bg-[#0C1E3D] text-white text-[11px] font-bold text-center border border-[#1E488F]">
                  Add to Cart
                </div>
              </div>

              {/* Product Mock 3 */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-[#F8FAFD] border-slate-200 shadow-sm'}`}>
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-[#0C1E3D] to-[#163875] flex items-center justify-center text-white mb-3 shadow-inner">
                  <Sparkles className="w-10 h-10 text-sky-300" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Cyber High-Tops</span>
                  <span className="font-black text-xs text-sky-400">$120.00</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-2">
                  <Star className="w-3 h-3 fill-amber-400" /> 4.8 &bull; 360° Inspection
                </div>
                <div className="w-full py-1.5 rounded-lg bg-[#0C1E3D] text-white text-[11px] font-bold text-center border border-[#1E488F]">
                  Add to Cart
                </div>
              </div>
            </div>

            {/* Bottom Bar in preview */}
            <div className={`mt-5 p-3 rounded-2xl border flex items-center justify-between text-xs ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-slate-400">Shortcode:</span>
                <span className="font-bold text-sky-300">[modern_product_slider category="featured"]</span>
              </div>
              <button
                onClick={onGoToDashboard}
                className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
              >
                Configure in Portal <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID (MIXED BOX SCHEME) */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">
            Enterprise Architecture
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Engineered for Modern WordPress Brands
          </h2>
          <p className={`text-xs sm:text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Everything you need to showcase, manage, and scale WooCommerce product sliders with zero technical headache.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className={`p-6 rounded-3xl border transition ${isDark ? 'bg-[#0C1E3D] border-[#1E4078]' : 'bg-[#EDF4FF] border-[#BFD7FE] shadow-sm'}`}>
            <div className="w-10 h-10 rounded-2xl bg-[#071126] border border-[#1E488F] text-sky-400 flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-black mb-2 ${isDark ? 'text-white' : 'text-[#0C1E3D]'}`}>
              Interactive 3D Clothing Racks
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Physics-powered perspective rotation, smooth touch swiping on mobile devices, and instant WooCommerce cart integration.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={`p-6 rounded-3xl border transition ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Cryptographic License Key Cloud
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tamper-proof HMAC SHA-256 license verification. Monitor active store domains and rotate API keys anytime with one click.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={`p-6 rounded-3xl border transition ${isDark ? 'bg-[#0A1835] border-[#18356E]' : 'bg-[#F0FDF4] border-[#BBF7D0] shadow-sm'}`}>
            <div className="w-10 h-10 rounded-2xl bg-[#071126] border border-[#1E488F] text-sky-400 flex items-center justify-center mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-black mb-2 ${isDark ? 'text-white' : 'text-emerald-950'}`}>
              1-Click Domain Transfers
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-emerald-800'}`}>
              Effortlessly detach domains when testing on local staging environments and re-attach to production stores instantly.
            </p>
          </div>

          {/* Feature 4 */}
          <div className={`p-6 rounded-3xl border transition ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Mastercard &amp; Global Gateways
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Support for Mastercard &amp; Visa 3D Secure, Google Pay, and international cards with zero payment friction.
            </p>
          </div>

          {/* Feature 5 */}
          <div className={`p-6 rounded-3xl border transition ${isDark ? 'bg-[#0C1E3D] border-[#1E4078]' : 'bg-[#FAF5FF] border-[#E9D5FF] shadow-sm'}`}>
            <div className="w-10 h-10 rounded-2xl bg-[#071126] border border-[#1E488F] text-purple-400 flex items-center justify-center mb-4">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-black mb-2 ${isDark ? 'text-white' : 'text-purple-950'}`}>
              Pakistan Raast &amp; Mobile Wallets
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-purple-800'}`}>
              Tailored for Pakistani creators and stores: direct IBAN Raast bank checkout, JazzCash, EasyPaisa, and SadaPay.
            </p>
          </div>

          {/* Feature 6 */}
          <div className={`p-6 rounded-3xl border transition ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Zero Bloat &bull; Lightning Fast
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Clean lightweight script footprint that preserves your Google PageSpeed and Core Web Vitals score on WooCommerce.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className={`py-16 px-6 border-y ${isDark ? 'bg-[#071126]/40 border-[#122449]' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">
              Quick Setup
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Live on Your Store in 3 Steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-[#F4F7FD] border-slate-200'}`}>
              <span className="w-7 h-7 rounded-xl bg-[#0C1E3D] text-white font-black inline-flex items-center justify-center text-xs mb-3 border border-[#1E488F]">
                1
              </span>
              <h3 className="font-bold text-sm mb-1">Get Your Pro Key</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Select Single or Unlimited plan. Instant API key issued to your email and portal dashboard.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-[#F4F7FD] border-slate-200'}`}>
              <span className="w-7 h-7 rounded-xl bg-[#0C1E3D] text-white font-black inline-flex items-center justify-center text-xs mb-3 border border-[#1E488F]">
                2
              </span>
              <h3 className="font-bold text-sm mb-1">Upload to WordPress</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Upload the plugin zip file to your WordPress admin under Plugins → Add New, and paste your license key.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-[#F4F7FD] border-slate-200'}`}>
              <span className="w-7 h-7 rounded-xl bg-[#0C1E3D] text-white font-black inline-flex items-center justify-center text-xs mb-3 border border-[#1E488F]">
                3
              </span>
              <h3 className="font-bold text-sm mb-1">Showcase 3D Products</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Drop the shortcode into any page builder or template. Watch your conversion rate skyrocket!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">
            Simple Pricing
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Choose Your Pro License Plan
          </h2>
          <p className={`text-xs sm:text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Supports Mastercard / Visa, Direct Bank Transfer (IBAN/Raast), Google ID, and Pakistani Wallets (JazzCash/EasyPaisa/SadaPay).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-7">
          {/* Single Site $3/mo */}
          <div className={`p-8 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Single Store License</span>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-4xl font-black text-sky-400">$3</span>
                <span className="text-xs text-slate-400">/month</span>
              </div>
              <span className="text-xs font-bold text-sky-400 block mb-5">~₨ 850 PKR / month</span>
              <ul className="space-y-3 text-xs mb-8">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400" /> 1 WordPress Store Domain</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400" /> Unlimited 3D Product Sliders</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Products Per Showcase</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400" /> 1-Click Domain Transfer</li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('single')}
              className="w-full py-3.5 rounded-2xl bg-[#0C1E3D] hover:bg-[#142F60] text-white font-extrabold text-xs border border-[#1E488F] transition"
            >
              Get Single Site ($3/mo)
            </button>
          </div>

          {/* Unlimited Sites $10/mo */}
          <div className={`p-8 rounded-3xl border-2 border-[#1E488F] relative flex flex-col justify-between ${isDark ? 'bg-[#0C1E3D]/80 shadow-2xl shadow-[#0C1E3D]/50' : 'bg-white shadow-xl shadow-[#0C1E3D]/10'}`}>
            <span className="absolute -top-3 right-6 bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] border border-[#2555A8] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
              Best Value
            </span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-sky-400">Unlimited Stores License</span>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-4xl font-black text-white">$10</span>
                <span className="text-xs text-slate-400">/month</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 block mb-5">~₨ 2,800 PKR / month</span>
              <ul className="space-y-3 text-xs mb-8">
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400" /> Unlimited WordPress Store Domains</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400" /> Unlimited 3D Sliders &amp; Racks</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400" /> Agency Client Multi-Store Management</li>
                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400" /> Priority Developer Support</li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('unlimited')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white font-black text-xs shadow-lg border border-[#2555A8] transition"
            >
              Get Unlimited Sites ($10/mo)
            </button>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section id="faq" className={`py-16 px-6 border-t ${isDark ? 'bg-[#071126]/30 border-[#122449]' : 'bg-white border-slate-200'}`}>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-8">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">
              Got Questions?
            </span>
            <h2 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Frequently Asked Questions
            </h2>
          </div>

          {faqs.map((f, i) => (
            <div
              key={f.q}
              className={`rounded-2xl border overflow-hidden transition ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-slate-50 border-slate-200'}`}
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full p-4 text-left font-bold text-xs flex items-center justify-between"
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180 text-sky-400' : 'text-slate-400'}`} />
              </button>
              {openFaq === i && (
                <div className={`px-4 pb-4 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. CLEAN PROFESSIONAL FOOTER */}
      <footer className={`border-t py-8 px-6 transition-colors ${isDark ? 'border-[#122449] bg-[#050D1A] text-slate-400' : 'border-slate-200 bg-white text-slate-600'}`}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <BrandLogo isCollapsed={false} isDark={isDark} className="h-6" />
            <span className="font-semibold">&copy; 2026 Modern Product Slider. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <button onClick={onGoToDashboard} className="hover:underline text-sky-400 font-bold">Portal Dashboard</button>
            <a href="#features" className="hover:underline">Features</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#faq" className="hover:underline">FAQ</a>
            <button onClick={onGoToDashboard} className="hover:underline">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
