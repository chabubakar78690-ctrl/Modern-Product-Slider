import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Check,
  ShieldCheck,
  Lock,
  Loader2,
  Smartphone,
  ArrowRight,
  Landmark,
  BadgeCheck,
  Copy,
  Globe2,
  AlertCircle,
} from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  planId,
  user,
  onSuccess,
  isDark = true,
}) {
  const [method, setMethod] = useState('safepay'); // 'safepay' | 'bank_transfer'
  const [currency, setCurrency] = useState('PKR'); // 'PKR' | 'USD'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bankTxnRef, setBankTxnRef] = useState('');
  const [copiedField, setCopiedField] = useState('');

  if (!isOpen || !user || !planId) return null;

  const priceUsd = planId === 'single' ? 3 : 10;
  const pricePkr = planId === 'single' ? 850 : 2800;
  const planName = planId === 'single' ? 'Single Site License' : 'Unlimited Sites License';

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSafepayCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const redirectOrigin = window.location.origin;
      const res = await fetch('/api/v1/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          planId,
          currency,
          redirectOrigin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || 'Failed to create Safepay payment session. Please try again.');
        setLoading(false);
        return;
      }

      // Secure client redirect to Safepay Hosted Checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError('Connection error initiating checkout with Safepay.');
      setLoading(false);
    }
  };

  const handleManualBankCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          planId,
          paymentMethod: `Bank Transfer (Raast Ref: ${bankTxnRef || 'Direct Transfer'})`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Manual activation failed.');
      }
    } catch {
      setError('Error submitting manual transfer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050D1A]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`max-w-xl w-full rounded-3xl border shadow-2xl overflow-hidden transition-all my-8 ${
          isDark
            ? 'bg-[#0B152B] border-[#162B54] text-slate-100'
            : 'bg-[#F8FAFD] border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-[#162B54] bg-[#071126]' : 'border-slate-200 bg-white'}`}>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Secure Checkout
            </span>
            <h3 className="text-xl font-black mt-0.5">
              {planName} — {currency === 'USD' ? `$${priceUsd}/mo` : `₨ ${pricePkr.toLocaleString()} PKR/mo`}
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Instant Pro API License Activation &bull; 256-Bit SSL Encrypted
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className={`p-2 rounded-xl border transition ${
              isDark
                ? 'bg-[#0C1E3D] border-[#162B54] text-slate-400 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Target Account Pill */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
              isDark ? 'bg-[#071126] border-[#14284F] text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <span className="truncate">
              Issuing license to: <strong className="text-sky-400 font-bold">{user.email}</strong>
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
              <Check className="w-3 h-3" /> Ready
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className={`block text-xs font-bold mb-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Select Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Method 1: Safepay Online Payment Gateway */}
              <button
                type="button"
                onClick={() => setMethod('safepay')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  method === 'safepay'
                    ? 'border-[#1E488F] bg-[#0C1E3D] text-white shadow-lg ring-2 ring-[#1E488F]/40'
                    : isDark
                    ? 'border-[#14284F] bg-[#071126] text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs flex items-center gap-1.5 text-white">
                      <CreditCard className="w-4 h-4 text-sky-400" /> Safepay Payment Gateway
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Instant
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Visa &bull; Mastercard &bull; Debit Cards &bull; JazzCash &bull; EasyPaisa &bull; Raast
                  </p>
                </div>
              </button>

              {/* Method 2: Direct Bank Transfer (IBAN / Raast) */}
              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  method === 'bank_transfer'
                    ? 'border-[#1E488F] bg-[#0C1E3D] text-white shadow-lg ring-2 ring-[#1E488F]/40'
                    : isDark
                    ? 'border-[#14284F] bg-[#071126] text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-emerald-400" /> Bank Transfer (Raast)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 bg-slate-800">
                      Manual
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Direct IBAN &amp; Raast account transfer
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* SAFEPAY GATEWAY PANEL */}
          {method === 'safepay' && (
            <form onSubmit={handleSafepayCheckout} className="space-y-4">
              {/* Currency Selector Pill */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div>
                  <span className="text-xs font-bold block">Billing Currency</span>
                  <span className="text-[10px] text-slate-400">Supported for local &amp; international cards</span>
                </div>
                <div className="flex rounded-xl p-1 bg-[#050D1A] border border-[#14284F]">
                  <button
                    type="button"
                    onClick={() => setCurrency('PKR')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      currency === 'PKR' ? 'bg-[#1E488F] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    PKR (₨)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      currency === 'USD' ? 'bg-[#1E488F] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              {/* Gateway Feature Badges Box */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-sky-400">
                    <BadgeCheck className="w-4 h-4" /> Safepay Hosted Checkout
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    PCI-DSS Level 1 &bull; 3D Secure
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> International Visa &amp; Mastercard
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Pakistani Debit &amp; Credit Cards
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> JazzCash &amp; EasyPaisa Wallets
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Instant License Key Activation
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-700/30 pt-2">
                  When you click Pay Now, you will be redirected to Safepay's secure hosted payment portal to complete 3D Secure verification. Your card information is processed directly by Safepay and never touches our servers.
                </p>
              </div>

              {/* Total & Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0C1E3D] via-[#1E488F] to-[#2555A8] hover:from-[#102750] hover:to-[#2F68CD] text-white font-black text-sm shadow-xl shadow-[#0C1E3D]/40 border border-[#2555A8] transition active:scale-98 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Initializing Safepay Checkout...
                    </>
                  ) : (
                    <>
                      Pay {currency === 'USD' ? `$${priceUsd} USD` : `₨ ${pricePkr.toLocaleString()} PKR`} with Safepay <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* MANUAL BANK TRANSFER PANEL */}
          {method === 'bank_transfer' && (
            <form onSubmit={handleManualBankCheckout} className="space-y-4">
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-emerald-400" /> Meezan Bank Direct / Raast
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ₨ {pricePkr.toLocaleString()} PKR
                  </span>
                </div>

                <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1.5 ${isDark ? 'bg-[#050D1A] border-[#102244]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Title:</span>
                    <span className="font-bold text-white">Modern Product Slider Pro</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bank Name:</span>
                    <span className="font-bold text-white">Meezan Bank Ltd</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">IBAN:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sky-400">PK88MEZN00012345678901</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('PK88MEZN00012345678901', 'iban')}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedField === 'iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Transfer Transaction ID / Raast Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={bankTxnRef}
                    onChange={(e) => setBankTxnRef(e.target.value)}
                    placeholder="e.g. TXN9876543210 or Raast Ref"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${
                      isDark ? 'bg-[#050D1A] border-[#162D58] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white font-black text-xs shadow-md border border-[#2555A8] transition active:scale-98 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Manual Bank Payment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
