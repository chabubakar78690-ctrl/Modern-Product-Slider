import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Check,
  ShieldCheck,
  Lock,
  Loader2,
  Smartphone,
  Building2,
  ArrowRight,
  Landmark,
  BadgeCheck,
  Copy,
} from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  planId,
  user,
  onSuccess,
  isDark = true,
}) {
  const [method, setMethod] = useState('mastercard'); // 'mastercard' | 'bank_transfer' | 'google' | 'pakistan_wallet'
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('5242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardHolder, setCardHolder] = useState('Muhammad Abubakar');
  const [walletPhone, setWalletPhone] = useState('0300 1234567');
  const [walletType, setWalletType] = useState('jazzcash'); // 'jazzcash' | 'easypaisa' | 'sadapay'
  const [bankTxnRef, setBankTxnRef] = useState('');
  const [copiedField, setCopiedField] = useState('');

  if (!isOpen || !user || !planId) return null;

  const priceUsd = planId === 'single' ? 3 : 10;
  const pricePkr = planId === 'single' ? 850 : 2800;
  const planName = planId === 'single' ? 'Single Site Plan' : 'Unlimited Sites Plan';

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let paymentLabel = 'Mastercard / Visa 3D Secure';
      if (method === 'google') {
        paymentLabel = 'Google ID / Google Pay Direct';
      } else if (method === 'bank_transfer') {
        paymentLabel = `Bank Transfer (Raast/IBAN: ${bankTxnRef || 'Ref Verified'})`;
      } else if (method === 'pakistan_wallet') {
        paymentLabel = `${walletType === 'jazzcash' ? 'JazzCash' : walletType === 'easypaisa' ? 'EasyPaisa' : 'SadaPay'} (${walletPhone})`;
      } else if (method === 'mastercard') {
        paymentLabel = `Mastercard (SadaPay/Debit) •••• ${cardNumber.slice(-4) || '4242'}`;
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
    <div className="fixed inset-0 z-50 bg-[#050D1A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
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
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Professional Checkout
            </span>
            <h3 className="text-xl font-black mt-0.5">
              {planName} — ${priceUsd}/mo
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              (~₨ {pricePkr.toLocaleString()} PKR / month) &bull; Cancel anytime
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-2 rounded-xl border transition ${
              isDark
                ? 'bg-[#0C1E3D] border-[#162B54] text-slate-400 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="p-6 sm:p-7 space-y-5">
          {/* Account Target Pill */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
              isDark ? 'bg-[#071126] border-[#14284F] text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <span>
              Issuing license to: <strong className="text-sky-400 font-bold">{user.email}</strong>
            </span>
            <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Check className="w-3 h-3" /> Ready
            </span>
          </div>

          {/* Payment Method Selector Grid */}
          <div>
            <label className={`block text-xs font-bold mb-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Select Payment Platform
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Method 1: Mastercard / Visa */}
              <button
                type="button"
                onClick={() => setMethod('mastercard')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  method === 'mastercard'
                    ? 'border-[#1E488F] bg-[#0C1E3D] text-white shadow-md ring-2 ring-[#1E488F]/40'
                    : isDark
                    ? 'border-[#14284F] bg-[#071126] text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-[11px]">Mastercard</span>
                </div>
                <span className="text-[10px] opacity-75">Debit / Credit</span>
              </button>

              {/* Method 2: Direct Bank Transfer (IBAN / Raast) */}
              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  method === 'bank_transfer'
                    ? 'border-[#1E488F] bg-[#0C1E3D] text-white shadow-md ring-2 ring-[#1E488F]/40'
                    : isDark
                    ? 'border-[#14284F] bg-[#071126] text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-[11px]">Bank / Raast</span>
                </div>
                <span className="text-[10px] opacity-75">IBAN Direct</span>
              </button>

              {/* Method 3: Google ID Payment */}
              <button
                type="button"
                onClick={() => setMethod('google')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  method === 'google'
                    ? 'border-[#1E488F] bg-[#0C1E3D] text-white shadow-md ring-2 ring-[#1E488F]/40'
                    : isDark
                    ? 'border-[#14284F] bg-[#071126] text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                  </svg>
                  <span className="font-bold text-[11px]">Google ID</span>
                </div>
                <span className="text-[10px] opacity-75">1-Click Direct</span>
              </button>

              {/* Method 4: JazzCash / EasyPaisa / SadaPay */}
              <button
                type="button"
                onClick={() => setMethod('pakistan_wallet')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  method === 'pakistan_wallet'
                    ? 'border-[#1E488F] bg-[#0C1E3D] text-white shadow-md ring-2 ring-[#1E488F]/40'
                    : isDark
                    ? 'border-[#14284F] bg-[#071126] text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-[11px]">PK Wallets</span>
                </div>
                <span className="text-[10px] opacity-75">JazzCash/EasyPaisa</span>
              </button>
            </div>
          </div>

          {/* Dynamic Content Panel by Payment Method */}

          {/* 1. Mastercard Form */}
          {method === 'mastercard' && (
            <div className={`p-4 rounded-2xl border space-y-3.5 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <BadgeCheck className="w-4 h-4 text-sky-400" /> Mastercard &amp; Visa 3D Secure
                </span>
                <span className="text-[10px] text-slate-400">SadaPay &bull; NayaPay &bull; Bank Cards</span>
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                  placeholder="Cardholder Name"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${
                    isDark ? 'bg-[#050D1A] border-[#162D58] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Card Number (16 Digits)
                </label>
                <div className="relative">
                  <CreditCard className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    placeholder="5242 •••• •••• 4242"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${
                      isDark ? 'bg-[#050D1A] border-[#162D58] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Expiry Date (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                    placeholder="12/29"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${
                      isDark ? 'bg-[#050D1A] border-[#162D58] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Security CVC / CVV
                  </label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    required
                    placeholder="888"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${
                      isDark ? 'bg-[#050D1A] border-[#162D58] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Direct Bank Transfer (IBAN / Raast) */}
          {method === 'bank_transfer' && (
            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Landmark className="w-4 h-4" /> Official Bank Account Details (Pakistan)
                </span>
                <span className="text-[10px] text-slate-400">Raast Instant 24/7</span>
              </div>

              {/* Bank Details Card */}
              <div className={`p-3 rounded-xl border space-y-2 text-xs ${isDark ? 'bg-[#050D1A] border-[#14264E]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-bold text-white">Meezan Bank Ltd / Raast</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Title:</span>
                  <span className="font-bold text-white">Modern Product Slider Pro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Raast ID (Phone):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">03007869012</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('03007869012', 'raast')}
                      className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                    >
                      <Copy className="w-3 h-3" /> {copiedField === 'raast' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">IBAN:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-sky-300">PK92MEZN0001020304050607</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('PK92MEZN0001020304050607', 'iban')}
                      className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                    >
                      <Copy className="w-3 h-3" /> {copiedField === 'iban' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Transaction ID / Sender Name (Optional for instant matching)
                </label>
                <input
                  type="text"
                  value={bankTxnRef}
                  onChange={(e) => setBankTxnRef(e.target.value)}
                  placeholder="e.g. Raast Ref #8921829 or Muhammad Abubakar"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${
                    isDark ? 'bg-[#050D1A] border-[#162D58] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}

          {/* 3. Google ID Payment */}
          {method === 'google' && (
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2 font-bold text-sm text-sky-400">
                <Check className="w-4 h-4 text-emerald-400" /> Instant Google Account Activation
              </div>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Your Pro API key will be generated and tied directly to your verified Google Identity (<strong>{user.email}</strong>). Click the checkout button below to proceed.
              </p>
            </div>
          )}

          {/* 4. Pakistani Mobile Wallets */}
          {method === 'pakistan_wallet' && (
            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex gap-2 text-xs">
                {['jazzcash', 'easypaisa', 'sadapay'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWalletType(w)}
                    className={`flex-1 py-1.5 px-3 rounded-xl border font-bold capitalize transition ${
                      walletType === w
                        ? 'bg-[#0C1E3D] text-white border-[#1E488F] shadow-sm'
                        : isDark
                        ? 'bg-[#050D1A] border-[#14264E] text-slate-400'
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
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E488F] ${
                    isDark ? 'bg-[#050D1A] border-[#162D58] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className={`p-2.5 rounded-xl border text-[11px] ${isDark ? 'bg-[#050D1A] border-[#14264E] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                Instant activation: You will receive an SMS prompt to approve the ₨ {pricePkr.toLocaleString()} PKR transaction.
              </div>
            </div>
          )}

          {/* Pricing Summary Breakdown */}
          <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Subscription Plan</span>
              <span className="font-bold">{planName}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Pakistani Rupee Equivalent</span>
              <span className="font-bold text-emerald-400">₨ {pricePkr.toLocaleString()} PKR</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-700/50">
              <span>Total Due Today</span>
              <span className="text-white">${priceUsd}.00 USD</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl border text-xs font-bold transition ${
                isDark
                  ? 'bg-[#071126] hover:bg-[#0C1E3D] text-slate-300 border-[#162B54]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#163B80] hover:from-[#102750] hover:to-[#1E4D9C] text-white text-xs font-black shadow-lg shadow-[#0C1E3D]/50 border border-[#204A8F] transition active:scale-98 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Confirm &amp; Issue Pro Key <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
