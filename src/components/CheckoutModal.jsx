import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Check,
  ShieldCheck,
  Lock,
  Loader2,
  Sparkles,
  Smartphone,
  Building2,
  ArrowRight,
} from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  planId,
  user,
  onSuccess,
  isDark = true,
}) {
  const [method, setMethod] = useState('google'); // 'google' | 'card' | 'pakistan_wallet'
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvc, setCardCvc] = useState('888');
  const [walletPhone, setWalletPhone] = useState('0300 1234567');
  const [walletType, setWalletType] = useState('jazzcash'); // 'jazzcash' | 'easypaisa' | 'sadapay'

  if (!isOpen || !user || !planId) return null;

  const priceUsd = planId === 'single' ? 3 : 10;
  const pricePkr = planId === 'single' ? 850 : 2800;
  const planName = planId === 'single' ? 'Single Site Plan' : 'Unlimited Sites Plan';

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let paymentLabel = 'Google ID Payment';
      if (method === 'card') {
        paymentLabel = `Card (SadaPay/Visa) •••• ${cardNumber.slice(-4) || '4242'}`;
      } else if (method === 'pakistan_wallet') {
        paymentLabel = `${walletType === 'jazzcash' ? 'JazzCash' : walletType === 'easypaisa' ? 'EasyPaisa' : 'SadaPay'} (${walletPhone})`;
      }

      const res = await fetch('/api/v1/auth/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          planId,
          paymentMethod: paymentLabel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.user);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`max-w-xl w-full rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-500">
              Pro License Checkout
            </span>
            <h3 className="text-xl font-black mt-0.5">
              {planName} — ${priceUsd}/mo
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              (~₨ {pricePkr.toLocaleString()} PKR/month)
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-2 rounded-xl border transition ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Account Confirmation */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
              isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span>
              License key will be issued to: <strong className="text-sky-500">{user.email}</strong>
            </span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className={`block text-xs font-bold mb-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Option 1: Google ID */}
              <button
                type="button"
                onClick={() => setMethod('google')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  method === 'google'
                    ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/20'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                    />
                  </svg>
                  <span className="font-bold text-xs">Google ID</span>
                </div>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  1-Click Direct
                </span>
              </button>

              {/* Option 2: Card / SadaPay / NayaPay */}
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  method === 'card'
                    ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/20'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <CreditCard className="w-4 h-4 text-sky-500" />
                  <span className="font-bold text-xs">Card / SadaPay</span>
                </div>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Visa / Mastercard
                </span>
              </button>

              {/* Option 3: JazzCash / EasyPaisa (Pakistan Direct) */}
              <button
                type="button"
                onClick={() => setMethod('pakistan_wallet')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  method === 'pakistan_wallet'
                    ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/20'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs">JazzCash / EasyPaisa</span>
                </div>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Pakistan Wallets
                </span>
              </button>
            </div>
          </div>

          {/* Conditional Method Form */}
          {method === 'google' && (
            <div
              className={`p-5 rounded-2xl border text-xs space-y-2 ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <Check className="w-4 h-4 text-emerald-500" /> Instant Google Account Activation
              </div>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Your Pro API key will be generated and tied directly to your verified Google Identity (<strong>{user.email}</strong>). Click the checkout button below to proceed.
              </p>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-3">
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Card Number (Supports Pakistani SadaPay, NayaPay &amp; International Cards)
                </label>
                <div className="relative">
                  <CreditCard className={`w-4 h-4 absolute left-3.5 top-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-mono transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Expires (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    required
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'pakistan_wallet' && (
            <div className="space-y-3">
              <div className="flex gap-2 text-xs">
                {['jazzcash', 'easypaisa', 'sadapay'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWalletType(w)}
                    className={`flex-1 py-2 px-3 rounded-xl border font-bold capitalize transition ${
                      walletType === w
                        ? 'bg-sky-500 text-white border-sky-400'
                        : isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-400'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Mobile Number / Wallet Account
                </label>
                <input
                  type="text"
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  placeholder="0300 1234567"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div
                className={`p-3 rounded-xl border text-[11px] ${
                  isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Instant activation: You will receive an SMS prompt to approve the ₨ {pricePkr.toLocaleString()} transaction.
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className={`pt-3 border-t text-xs space-y-1.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Subtotal</span>
              <span className="font-bold">${priceUsd}.00</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Pakistani Rupee Approx.</span>
              <span className="font-bold text-sky-500">₨ {pricePkr.toLocaleString()} PKR</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-2 border-t">
              <span>Total Due</span>
              <span>${priceUsd}.00 / month</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3.5 rounded-2xl border text-xs font-bold transition ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-black shadow-lg shadow-sky-500/25 transition active:scale-98 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Confirm &amp; Issue Key <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
